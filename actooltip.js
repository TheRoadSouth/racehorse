/**
* Archives.com $ Tooltip Plugin
* @version 1.1
* @author Stanislav Korytskyy
*/

/**
* Description:
* This is a tooltip plugin that displays a content.
*/
var tooltip = {
    /**
    * $ plugin name which can later be used to call the plugin. Href of item that appears needs to be included
    * Example: $("#Elem").actooltip({
        href:"#Mytooltip"
    });
    * @type {String}
    */
    name: "actooltip",

    // plugin version
    version: 1.1,

    /**
    * Default plugin options
    * @type {Object}
    */

    options: {
        direction: "topleft", // topleft, topcenter, topright, bottomleft, bottomcenter, bottomright, left, right
        tooltipSelector: "",
        checkCollision: true,
        showEvent: "hover",
        turnOn: true,
        afterShow: null,
        afterHide: null,
        breakpoint: {
            mobile: 403,
            mobileLandscape: 610,
            tablet: 805,
            tabletLandscape: 976
        }
    },

    init: function (options, elem) {
        var _self = this,
            isTouchSupported = 'ontouchstart' in window,
            startEvent = isTouchSupported ? 'touchstart' : 'click resize scroll';

        this.options = $.extend({}, this.options, options);
        this.removeTooltip(this.options.tooltipSelector);
        this.$elem = $(elem);
        this.$tooltip = $(this.options.tooltipSelector);   
        this.possibleDirections = ["left", "topleft", "topcenter", "topright", "right",
                                   "bottomright", "bottomcenter", "bottomleft"];
        this.currentDirection = this.options.direction;
        this.pointerPadding = 16; // diagonal of tooltip pointer

        $(window).on(startEvent + " orientationchange", function () {
            clearTimeout(_self.timeout);
            _self.hide(20);
        });

        this.$tooltip.on(startEvent, function (e) {
            e.stopPropagation();
        });

        // if tooltip not in body - move it
        if (this.$tooltip.parent().get(0) !== document.body) {
            this.$tooltip.appendTo("body");
        }

        if (!this.$tooltip.children().hasClass("tooltipPointer")) {
            $("<div class=tooltipPointer></div>").appendTo(this.$tooltip);    
        } 
        this.$tooltip.addClass(this.options.direction);
        
        if (this.options.showEvent === "click") {

            this.$elem.on(startEvent, function (e) {
                e.stopPropagation();
                if (_self.$tooltip.is(":visible")) {
                    _self.hide();
                } else{
                    _self.show();
                }
            });
        } else {
            this.$elem.hover(function () {
                clearTimeout(_self.timeout);
                _self.show();
            }, function () {
                _self.timeout = _self.timeForHideTooltip();
            });
            this.$tooltip.hover(function () {
                clearTimeout(_self.timeout);
            }, function () {
                _self.timeout = _self.timeForHideTooltip();
            });
            this.$elem.on("click", function (e) {
                e.stopPropagation();
            });
        }
        return this;
    },
    /**
     * Removing tooltip with current selector while present more than one
     * @return {undefined}
     */
    removeTooltip: function (tooltipSelector) {
        if ($(tooltipSelector).length > 1) {
            $($(tooltipSelector).get(0)).remove();
            this.removeTooltip(tooltipSelector);
        }
    },
    /**
     * Execute setTimeout for hide tooltip
     * @return {Object} Return setTimeout object
     */
    timeForHideTooltip: function () {
        var _self = this;

        return  setTimeout(function () {
                    _self.hide();    
                }, 500);
    },
    /**
     * Set position (top, left) for tooltip
     * @param  {String} newDirection New Direction for tooltip
     * @return {undefined}
     */
    setPosition: function (newDirection) {
        var elemPosition = this.$elem.offset(),
            newPosition = {};

            this.$tooltip.removeClass(this.currentDirection);
            this.currentDirection = newDirection || this.options.direction;
            this.$tooltip.addClass(this.currentDirection);

        if (this.currentDirection === "left" || this.currentDirection === "right") {
            newPosition.top = elemPosition.top - this.pointerPadding;
            newPosition.left = this.currentDirection === "left" ?
                elemPosition.left - this.$tooltip.outerWidth() - this.pointerPadding : elemPosition.left + this.$elem.outerWidth() + this.pointerPadding;
        } else {
            newPosition.top = this.currentDirection.indexOf("top") !== -1 ? 
            elemPosition.top - this.$tooltip.outerHeight() - this.pointerPadding : elemPosition.top + this.$elem.outerHeight() + this.pointerPadding;

            switch (this.currentDirection) {
                case "topleft":
                case "bottomleft":
                    newPosition.left = elemPosition.left - this.$tooltip.outerWidth() + this.$elem.outerWidth();
                    break;
                case "topcenter":
                case "bottomcenter":
                    newPosition.left = elemPosition.left - this.$tooltip.outerWidth() / 2 + this.$elem.outerWidth() / 2;
                    break;
                // for topright and bottomright
                default:
                    newPosition.left = elemPosition.left;
            }
        }
        
        if ($(window).outerWidth() <= this.options.breakpoint.mobile) {
            this.$tooltip.css({
                left: "35px",
                top: newPosition.top,
                right: "35px",
                width: "auto"
            });
        } else {
            this.$tooltip.css({
                left: newPosition.left,
                top: newPosition.top,
                width: "300px"
            });    
        }
    },
    /**
     * Check tooltip collision regarding window
     * @return {boolean}
     */
    checkCollision: function (side) {
        var position = {
            left: parseFloat(this.$tooltip.css("left")),
            top: parseFloat(this.$tooltip.css("top"))
        },
        collision = {
            right: (position.left + this.$tooltip.outerWidth() > $(window).width()), // right collision
            left: (position.left < 0), // left collision
            bottom: (position.top + this.$tooltip.outerHeight() > $(window).height() + $(window).scrollTop()), // bottom collision
            top: (position.top - $(window).scrollTop() < 0) // top collision
        };

        return side ? collision[side] : collision.left || collision.right || collision.top || collision.bottom;
    },
    /**
     * Set new position (top, left) for tooltip when it has collision
     * @return {undefined}
     */
    reposition: function () {
        var nextDirection = this.possibleDirections.indexOf(this.currentDirection) + 1;

        if (nextDirection >= this.possibleDirections.length) {
            nextDirection = 0;
        }
        this.setPosition(this.possibleDirections[nextDirection]);
    },
    /**
     * Show tooltip
     * @return {undefined}
     */
    show: function () {
        var _self = this;
        if (!this.$tooltip.is(":visible") && this.options.turnOn) {
            this.setPosition();
            if (this.options.checkCollision) {
                if ($(window).outerWidth() <= this.options.breakpoint.mobile) {
                    if (this.checkCollision("top")) {
                        this.setPosition("bottomcenter");
                    } else {
                        this.setPosition("topcenter");
                    }
                    this.$tooltip.children(".tooltipPointer").hide();
                } else {
                    var counter = 0;
                    this.$tooltip.children(".tooltipPointer").show();
                    this.setPosition("topright");
                    while(counter < this.possibleDirections.length && this.checkCollision()){
                        this.reposition();
                        counter++;
                    }    
                }                
            }

            this.$tooltip.fadeIn(200, function () {
                if(typeof _self.options.afterShow === "function") { 
                    _self.options.afterShow();
                }
            });
        }        
    },
    /**
     * Hide tooltip
     * @return {undefined}
     */
    hide: function (speed) {
        var _self = this;
        if (this.$tooltip.is(":visible")) {
            this.$tooltip.fadeOut(speed || 200, function () {
                if(typeof _self.options.afterHide === "function") { 
                    _self.options.afterHide();
                }
                _self.$tooltip.css({ width: "" });
            });
        }
    },
    /**
     * For change option turnOn true/false
     * @return {undefined}
     */
    turnToggle: function (state) {
        this.options.turnOn = state;
    }
};
// register tooltip object as a $ plugin
$.plugin(tooltip.name, tooltip);