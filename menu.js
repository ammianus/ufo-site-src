//defines functions for working with menu
var Menu = (function () {
    function Menu(config) {
        this.config = config;
        this.direction = config.direction || 'horizontal';
        this.activeBarClass = 'active-bar-' + this.direction;
        this.$menu = config.$menu;
        this.turnedOn = this.$menu.getAttribute('data-on') !== 'false';
        this.$menuContainer = this.$menu.querySelector('ul');
        this.menuItems = this.$menuContainer.querySelectorAll("li:not([class='" + this.activeBarClass + "'])");
        this.$links = this.$menuContainer.querySelectorAll('a');
        this.$activeBar = document.getElementsByClassName(this.activeBarClass)[0];
        this.$activeBar.setAttribute('tabindex', '-1');
        this.activeBarClearTimeout = false;
        console.log("Menu loaded");
        /**
         * If anywhere outside the navigation menu is clicked,
         * we want to remove all transitions/animations. This is
         * important because when using tab and enter to select a
         * menu item, and then we click outside of the menu, and then
         * tab or click back into the menu, the $activeBar will slide over from
         * its last position (it shouldn't do that; it should 'reset' and then
         * animate up into view, but not slide from its last position).
         *
         * Also, document.activeElement will always be the body or whatever element
         * has a tabindex set on it, so we want to check if the current active element
         * (the one we click on) is a menu item, and if it IS NOT a menu item, then
         * we'll stop animations.
         */
        window.addEventListener('mouseup', function () {
            if (document.activeElement.parentNode !== this.$menu) {
                return this.stopAnimations();
            }
        }.bind(this));
        this.$menu.addEventListener('mouseleave', this.stopAnimations.bind(this));
        /**
         * When transitioning from keyboard interaction to
         * mouse interaction, we have to blur any focus so that
         * the move transitions will work correctly.
         */
        this.$menu.addEventListener('mouseenter', this.blurMenuItems.bind(this));
        console.log('Menu items event listeners');
        for (var mi = 0; mi < this.menuItems.length; mi++) {
            var $li = this.menuItems.item(mi);
            //each(this.$menuItems, function($li, i) {
            if (this.turnedOn || $li.hasAttribute('data-icon')) {
                $li.setAttribute('tabindex', '0');
            }
            // be able to provide x and y movement for the $activeBar
            $li.addEventListener('mouseenter', this.slide.bind(this, mi, $li));
            $li.addEventListener('keyup', function (e) {
                if (this.turnedOn) {
                    // change page on enter key
                    if (this.enter(e)) {
                        return this.changePage(mi, $li);
                    }
                    // slide the active bar on tab or shift+tab
                    if (this.tab(e)) {
                        return this.slide(mi, $li);
                    }
                }
            }.bind(this));
        }
        console.log("Menu initialized");
    }
    //end constructor
    /*
    * checks if the tab key was pressed
    */
    Menu.prototype.tab = function (e) {
        var key = e.keyCode || e.which;
        return key === 9 || key === '9';
    };
    /*
    * checks if the enter key was pressed
    */
    Menu.prototype.enter = function (e) {
        var key = e.keyCode || e.which;
        return key === 13 || key === '13';
    };
    /*
    * Blur each menu item
    */
    Menu.prototype.blurMenuItems = function () {
        console.log("enter blurMenuItems " + this.menuItems);
        for (var mi = 0; mi < this.menuItems.length; mi++) {
            this.menuItems.item(mi).blur();
        }
    };
    //end blurMenuItems
    /*
   * Filters out $activeBar from the list
   */
    Menu.prototype.notActiveBar = function (li) {
        console.log("enter notActiveBar");
        return !li.classList.contains('active-bar-horizontal') && !li.classList.contains('active-bar-vertical');
    };
    //end notActiveBar
    /**
     *  Hides the $activeBar so that it doesn't slide down on mouseleave
     */
    Menu.prototype.stopAnimations = function () {
        console.log("enter stopAnimations");
        if (this.$activeBar.classList.contains('move')) {
            this.$activeBar.classList.remove('move');
        }
        /**
         * The if-statement is critical, or else when hovering
         * over the navigation menu (but not an item), activeBarClearTimeout
         * is never defined
         */
        if (this.activeBarClearTimeout !== false) {
            this.activeBarClearTimeout = false;
        }
    };
    //end stopAnimations
    /**
 *  Changes the X or Y position of the $activeBar
 */
    Menu.prototype.slide = function (i, $el) {
        console.log('enter slide: i=' + i + ', $el=' + $el.tagName);
        /**
         * if-statement is for IE10 so that when hovering
         * over an element [data-active-bar="false"], and then
         * going back to one without that attribute, the bar
         * behaves correctly
         */
        if ($el.getAttribute('data-active-bar') !== 'false' && this.turnedOn) {
            // in all browsers, provides X movement
            this.$menu.className = this.direction + ' directional-nav pos-' + i;
            /**
             * The if-statement is critical, or else when moving quickly
             * from one item to another, the class 'move' may stay on
             * even when hovering off of $topNav
             */
            if (this.$activeBar.classList.contains('move') === false) {
                this.activeBarClearTimeout = timeout(function () {
                    this.$activeBar.classList.add('move');
                }.bind(this), 200);
            }
        }
    };
    /**
     *  Selects a link clicked (provides state through CSS class)
     *  Fades in a new title
     */
    Menu.prototype.changePage = function (i, $el) {
        console.log('enter changePage: i=' + i + ', $el=' + $el.tagName);
        var $parentLi = $el.tagName === 'LI' ? $el : $el.parentNode;
        var doesNotLinkToPage = parentLiElement.getAttribute('data-page') !== 'false';
        var parentLiElement = $parentLi;
        if (doesNotLinkToPage && this.turnedOn) {
            // set some of the aria attributes for accessibility purposes
            this.$menu.querySelector('[aria-selected="true"]').setAttribute('aria-selected', 'false');
            parentLiElement.setAttribute('aria-selected', 'true');
            // remove any existing .active classes
            this.$menu.querySelector('[class="active"')[0].classList.remove('active');
            // make the parent li be .active
            parentLiElement.classList.add('active');
        }
    };
    return Menu;
}());
//end menu
var timeout;
(function () {
    // based on http://codereview.stackexchange.com/questions/47889/alternative-to-setinterval-and-settimeout
    timeout = function (callback, delay) {
        var dateNow = Date.now, requestAnimation = window.requestAnimationFrame, start = dateNow(), stop, timeoutFn = function () {
            return dateNow() - start < delay ? stop || requestAnimation(timeoutFn) : callback();
        };
        requestAnimation(timeoutFn);
        return {
            clear: function () {
                stop = 1;
            }
        };
    };
}());
//init after DOM loads
function init() {
    console.log("init");
    //let menuConf = {$menu: document.getElementById('top-nav'), direction: 'horizontal' }
    return new Menu({ $menu: document.getElementById('top-nav'), direction: 'horizontal' });
}
//starting point
(function () {
    document.addEventListener('DOMContentLoaded', init);
}());
