// currently set up to work in a require.js environment
// ToDo: make this generic & add CSS
define("plugins/rhnav", ["jquery", "polyfills/object.create", "utils/pluginbridge"], function() {

    /**
     * Racehorse RhNav jQuery Plugin
     * @version 0.2
     * @author Martin Przybyla
     *
     * USAGE: $("#NavId").rhnav();
     *
     * TODOS:
     * - Tie in with logged in status and secondary nav
     * - Use something else other than a CSS triangle for more nav
     * - Add a max width to checkWidth function?
     */

    /**
     * Main Plugin Object
     * @type {Object}
     */
    var RhNav = {

        /**
         * jQuery plugin name which can later be used to call the plugin
         * Example: $('body').rhnav();
         * @type {String}
         */
        name: 'rhnav',

        // plugin version
        version: 0.2,

        /**
         * Default plugin options
         * @type {Object}
         */
        options: {
            // text for dropdown link
            moreMenuText: "More",

            // outer container ul element for entire dropdown
            moreOuterMenuId: "RhNavMoreOuter",

            // outer li element (i.e. "More" link)
            moreLinkId: "RhNavMoreLink",

            // li element that contains nested ul
            moreMenuLinkId: "RhNavMoreMenuLink",

            // inner nested ul
            moreMenuId: "RhNavMoreMenu",

            // create a dropdown?
            dropdown: true,

            // timeout before dropdown closes on mouseleave event
            dropdownTimeout: 200,

            // selector(s) that activate hover state for dropdown
            dropdownHoverSelectors: "#RhNavMoreLink, #RhNavMoreMenuLink",

            // time before events fire on window resize
            resizeTimeout: 0,

            // buffer between far right nav element & left side of menu
            buffer: 200,

            // create a right side off canvas nav?
            navRight: true,

            // the following should match CSS

            // backup width of dropdown (if this.maxElemWidth fails)
            moreMenuWidth: 130,

            // side padding to elements in dropdown menu
            sidePadding: 24,

            // breakpoint at which off-canvas nav is activated
            mobileBreakpoint: 610
        },

        /**
         * Init constructor method
         * @constructor
         * @param  {Object} options Passed in options which are mixed with default options
         * @param  {Object} elem    HTML node
         * @return {Object}         Return object
         */
        init: function(options, elem) {
            var _self = this;

            // checking if window.getComputedStyle is supported, if not, we are <= IE8
            // which means it's better to not run the nav code (there is probably a better way to do this)
            if (!window.getComputedStyle) {
                return this;
            }

            // mix in the passed-in options with the default options
            this.options = $.extend({}, this.options, options);

            // save reference to the element and the jQuery object
            this.elem = elem;
            this.$elem = $(elem);

            // hide navRightOpen button if not necessary
            if (this.options.navRight !== true) {
                $("body").addClass("rh-nav-right-false");
            }

            // setup up button toggle and don't go further if dropdown is not necessary
            this.toggleClasses();
            if (this.options.dropdown !== true) {
                return this;
            }

            this.fullNav = this.getList().full;

            // measure width of nav elements when not in mobile view
            this.initialWidths = false;
            if (this.viewport().width > this.options.mobileBreakpoint) {
                this.getInitialWidths();
            }

            // create dropdown and check width to reconfigure nav if necessary
            this.createDropdownMenu();
            this.checkWidth();

            this.setupResize();

            // return this for chaining / prototype
            return this;
        },

        /**
         * Gets initial widths for nav elements in order to perform subsequent calculations
         * @return {undefined}
         */
        getInitialWidths: function() {
            var elemWidths = [];

            if (!this.initialWidths && this.viewport().width > this.options.mobileBreakpoint) {
                for (var i = 0; i < this.fullNav.length; i++) {
                    $(this.fullNav[i]).data("rh-nav-width", this.fullNav[i].offsetWidth);
                    elemWidths[i] = this.fullNav[i].offsetWidth;
                }

                this.maxElemWidth = this.findMax(elemWidths);
                this.initialWidths = true;
            }
        },

        /**
         * Find the largest number in an array
         * @return {Number} largest width in nav
         */
        findMax: function(array) {
            return Math.max.apply(Math, array);
        },

        /**
         * Sets up resize functionality
         * @return {undefined}
         */
        setupResize: function() {
            var _self = this,
                timeOut = false;

            $(window).on("resize.rhnav", function() {

                if (timeOut !== false) {
                    clearTimeout(timeOut);
                }

                timeOut = setTimeout(timeOutFunc, _self.options.resizeTimeout);

                function timeOutFunc() {
                    if (!_self.initialWidths) {
                        _self.getInitialWidths();
                    }
                    if (!_self.outerMenuWidthAdjusted) {
                        _self.setDropdownWidth();
                    }
                    _self.checkWidth();
                }

            });
        },

        /**
         * Creates an additional hidden dropdown menu
         * @return {undefined}
         */
        createDropdownMenu: function() {
            var items,
                moreMenu = document.createElement("ul"),
                outerMenu = document.createElement("ul"),
                menuLink = document.createElement("li"),
                moreLinkId = this.options.moreLinkId,
                moreMenuLi;

            /**
             * Allows only first level nav elements for more links
             * @type {array}
             */

            items = $(this.elem).find(".nav-title a").get();
            moreMenu.id = this.options.moreMenuId;
            menuLink.id = this.options.moreMenuLinkId;
            outerMenu.id = this.options.moreOuterMenuId;
            menuLink.className += " left";

            for (var i = 0; i < items.length; i++) {
                moreMenuLi = document.createElement("li");
                moreMenuLi.appendChild(items[i].cloneNode(true));
                moreMenu.appendChild(moreMenuLi);
                moreMenu.children[i].style.display = "none";
            }

            menuLink.appendChild(moreMenu);
            outerMenu.innerHTML = "<li id=\"" + moreLinkId + "\"><a><span>" + this.options.moreMenuText + "<div class=\"triangle\"></div></span></a></li>";
            outerMenu.appendChild(menuLink);
            this.elem.appendChild(outerMenu);

            this.setDropdownWidth();
            this.handleDropdownEvents();
        },

        /**
         * Set dropdown width according to the widest element in nav
         * @return {undefined}
         */
        setDropdownWidth: function() {
            var outerMenu = document.getElementById(this.options.moreOuterMenuId);

            if (this.maxElemWidth) {
                outerMenu.style.width = (this.maxElemWidth + this.options.sidePadding) + "px";
                this.outerMenuWidthAdjusted = true;
            } else {
                outerMenu.style.width = (this.options.moreMenuWidth + this.options.sidePadding) + "px";
            }
        },

        /**
         * Handle dropdown hover events
         * @return {undefined}
         */
        handleDropdownEvents: function() {
            var _self = this;
            $(this.options.dropdownHoverSelectors)
                .hover(
                    function() {
                        $("#" + _self.options.moreOuterMenuId).addClass("hover");
                    },
                    function() {
                        var timeOut = false;

                        if (timeOut !== false) {
                            clearTimeout(timeOut);
                        }

                        timeOut = setTimeout(timeOutFunc, _self.options.dropdownTimeout);

                        function timeOutFunc() {
                            var isHovered = ($('#' + _self.options.moreLinkId).is(":hover") || $('#' + _self.options.moreMenuLinkId).is(":hover"));
                            if (!isHovered) {
                                $("#" + _self.options.moreOuterMenuId).removeClass("hover");
                            }
                        }
                    }
                )
                .click(function() {
                    $("#" + _self.options.moreOuterMenuId).toggleClass("hover");
                });
        },

        /**
         * Toggle clasess necessary for mobile side panels
         * @return {undefined}
         */
        toggleClasses: function() {
            var body = $("body"),
                _self = this;

            // add rh-nav class to BODY
            $(body).addClass("rh-nav");

            $("#NavOpenLeft").on("click", function() {
                $(body).toggleClass("rh-nav-left");
            });

            $("#NavOpenRight").on("click", function() {
                $(body).toggleClass("rh-nav-right");
            });
        },

        /**
         * Get viewport dimensions
         * @return {Object} width: window width
         */
        viewport: function() {
            var win = window,
                widthType = "inner";

            // if innerWidth is not available use clientWidth
            if (!("innerWidth" in window)) {
                widthType = "client";
                win = document.documentElement || document.body;
            }

            return {
                width: win[widthType + "Width"]
            };
        },

        /**
         * Checks width and adds or removes elements from nav as necessary
         * @return {undefined}
         */
        checkWidth: function() {
            var view = this.viewport(),
                list = this.getList(),
                nav = list.full,
                availableWidth = view.width,
                mainNavWidth = 0,
                lastElemWidth = nav[nav.length - 1].offsetWidth,
                lastHiddenWidth = list.lastHiddenWidth,
                buffer = this.options.buffer,
                moreMenuWidth = this.maxElemWidth || this.options.moreMenuWidth;

            // if past mobile breakpoint activate side panels and return
            if (availableWidth < this.options.mobileBreakpoint) {
                this.activateSidePanels();
                return;
            }

            // get width of all nav elements except the last element and hidden elements
            for (var i = 0; i < list.shown.length - 1; i++) {

                mainNavWidth += list.shown[i].offsetWidth;

            }

            // use either the last nav elem (alerts) or the more menu for full width
            if (list.hiddenLength === 0) {
                this.fullNavWidth = mainNavWidth + lastElemWidth;
            } else {
                this.fullNavWidth = mainNavWidth + moreMenuWidth;
            }

            // determine whether to show or hide more elements
            if (this.fullNavWidth > availableWidth - buffer) {
                this.removeElems();
            } else if (this.fullNavWidth + lastHiddenWidth < availableWidth - buffer) {
                this.addElems();
            }

            $(this.getList().shown).each(function() {
                $(this).removeClass("left");
            });
            $(this.getList().lastShowing).addClass("left");

            this.manageDropdown(this.getList().hiddenLength);
            this.manageFlyouts();
        },

        /**
         * Close flyouts if we are above the mobile breakpoint
         * @return {undefined}
         */
        manageFlyouts: function() {
            if (this.viewport().width > this.options.mobileBreakpoint) {
                $("body").removeClass("rh-nav-left rh-nav-right");
            }
        },

        /**
         * Manage state of dropdown menu according to width of viewport
         * @param  {Number} numElemsHidden Number of elements currently hidden
         * @return {undefined}
         */
        manageDropdown: function(numElemsHidden) {
            var originalMenuItems = document.getElementById(this.options.moreMenuId).children,
                originalToArray = [],
                menuItems = [],
                outerMenu = document.getElementById(this.options.moreOuterMenuId),
                alertsLink = document.getElementById(this.options.NavLinkAlerts);

            for (var i = 0; i < originalMenuItems.length; i++) {
                originalToArray.push(originalMenuItems[i]);
            }

            menuItems = originalToArray.reverse();

            // if main nav has no hidden elements don't show "more" menu
            if (numElemsHidden < 1) {
                $(outerMenu).siblings("ul").removeClass("rh-nav-more-active");

                outerMenu.style.display = "none";
                this.fullNav[this.fullNav.length - 1].style.display = "inline-block";

                // otherwise show additional dropdown menu
            } else {
                $(outerMenu).siblings("ul").addClass("rh-nav-more-active");


                outerMenu.style.display = "block";
                this.fullNav[this.fullNav.length - 1].style.display = "none";

                for (var j = 0; j < menuItems.length; j++) {
                    if (j <= numElemsHidden) {
                        menuItems[j].style.display = "block";
                    } else {
                        menuItems[j].style.display = "none";
                    }
                }
            }
        },

        /**
         * Gets list of nav elements including hidden and shown elements
         * @return {Object} Object containing full nav array, hidden nav array,
         * shown nav array, last hidden element, last showing element, and width
         * of last hidden element
         */
        getList: function() {
            var full = this.elem.children[0].children,
                hidden = [],
                shown = [],
                lastHidden,
                lastHiddenWidth;

            for (var i = 0; i < full.length; i++) {
                if ($(full[i]).hasClass("rh-nav-hidden")) {
                    hidden.push(full[i]);
                } else {
                    shown.push(full[i]);
                }
            }

            lastHidden = hidden[0];
            lastHiddenWidth = $(lastHidden).data("rh-nav-width");

            return {
                full: full,
                hidden: hidden,
                hiddenLength: hidden.length,
                shown: shown,
                lastHidden: lastHidden,
                lastShowing: shown[shown.length - 2],
                lastHiddenWidth: lastHiddenWidth
            };
        },

        /**
         * Removes elements and recursively calls this.checkWidth() to
         * remove more elements if necessary
         * @return {undefined}
         */
        removeElems: function() {
            var elem = this.getList().lastShowing;

            if (!elem) {
                return;
            } else {
                $(elem).addClass("rh-nav-hidden");
                this.checkWidth();
            }
        },

        /**
         * Adds elements and recursively calls this.checkWidth() to
         * add more elements if necessary
         * @return {undefined}
         */
        addElems: function() {
            var elem = this.getList().lastHidden;

            if (!elem) {
                return;
            } else {
                $(elem).removeClass("rh-nav-hidden");
                this.checkWidth();
            }
        },

        /**
         * Shows all links when in mobile (side panel) mode
         * @return {undefined}
         */
        activateSidePanels: function() {
            $(this.getList().full).removeClass("rh-nav-hidden");
            $(this.getList().full).removeAttr("style");
            document.getElementById(this.options.moreOuterMenuId).style.display = "none";
        }

    };

    ////////////////////////////
    // END OF COMPONENT LOGIC //
    ////////////////////////////

    // register NewPlugin object as a jQuery plugin
    $.plugin(RhNav.name, RhNav);

    return RhNav;

});
