/**
 * Archives.com jQuery Modal Plugin
 * @version 1.1
 * @author Martin Przybyla
 */

/**
 * Main Modal Object
 * @type {Object}
 */
var AcModal = {

    /**
     * jQuery plugin name which can later be used to call the plugin
     * Example: $("#Elem").acmodal();
     * @type {String}
     */
    name: "acmodal",

    // plugin version
    version: 1.1,

    /**
     * Default options
     * Note: Any easing options besides "linear" or "swing" require jQuery
     * easing plugin or the jQuery UI FX Core and padding/margins should match CSS
     * @type {Object}
     */
    options: {
        autoResize: true,
        resizeTimeout: 0,
        responsive: true,
        scroll: true,
        position: "fixed",
        fadeOut: 200,
        fadeIn: 200,
        href: "",
        content: "",
        width: 670,
        height: null,
        autoContentHeight: true,
        initialHeight: 50,
        initialWidth: 50,
        padding: 8,
        offsetTopBottom: 100,
        marginTop: 0,
        scrollTop: true,
        innerOffset: 50,
        offsetRatio: 0.8,
        minHeight: 50,
        closeButton: true,
        closeButtonTemplate: "<div id=\"AcCloseWrap\"><a id=\"AcClose\"></a></div>",
        closeOnBkgClick: true,
        animate: true,
        useHash: true,
        animateSpeed: 600,
        easingType: "easeInExpo",
        copyContent: false,
        overlayTemplate: "<div id=\"AcOverlay\"></div>",
        modalTemplate: "<div id=\"AcModal\"><div id=\"AcWrap\"><div id=\"AcContent\"/></div></div>",
        customClass: null,
        onOpen: function() {},
        onClose: function() {},
        onBeforeClose: function() {}
    },

    /**
     * Init constructor method
     * @constructor
     * @param  {Object} options Passed in options which are mixed with default options
     * @param  {Object} elem    HTML node calling the modal
     * @return {Object}         Return modal object
     */
    init: function (options, elem) {
        var _self = this;

        // Mix in the passed-in options with the default options
        this.options = $.extend({}, this.options, options);

        // Save reference to the element and the jQuery object
        this.elem = elem;
        this.$elem = $(elem);

        // build modal markup on click
        this.$elem.click(function () {
            if (!$("#AcModal").is(":visible")) {
                _self.show();
                _self.setupResize();

                $("#AcClose").click(function () {
                    _self.close();
                });

                // close by clicking the overlay
                if (_self.options.closeOnBkgClick) {
                    $("#AcOverlay").click(function () {
                        _self.close();
                    });
                }
            }
        });

        //handle hash
        if (_self.options.useHash === true) {
            //remove hash if it's present on page load
            if (window.location.hash === "#r") {
                window.location.hash = "";
            }
            //close lightbox on hashchange
            $(window).on("hashchange", function () {
                if (_self.closeHash === window.location.hash) {
                    _self.close();
                }
            });
        }

        // Return this for chaining / prototyping
        return this;
    },

    /**
     * Retrieves content
     * @param  {String} href Content selector (class or ID)
     * @return {String}      HTML content
     */
    getContent: function (href) {
        var htmlContent;

        if (href && href !== "") {

            if (!this.options.copyContent) {
                htmlContent = $(href);
            } else {
                htmlContent = $(href).html();
            }

            return htmlContent;

        }
    },

    /**
     * Show the modal window
     */
    show: function () {
        var modalContent = "",
            modalWrappedContent;

        // wrap and show hidden content or append content passed as a parameter
        if (this.options.href && this.options.href !== "") {
            $(this.options.href).parent().append(this.options.overlayTemplate);
            modalContent = this.getContent(this.options.href);
            modalWrappedContent = $(modalContent).wrap(this.options.modalTemplate);
        } else {
            $("body").append(this.options.overlayTemplate, this.options.modalTemplate);
            modalContent = this.options.content;
            $("#AcContent").append(modalContent);
        }

        if (this.options.customClass) {
            $("#AcModal").addClass(this.options.customClass);
        }

        if (this.options.position === "absolute") {
            $("#AcModal").css({
                "position": "absolute"
            });
        }

        if (this.options.href) {
            $(this.options.href).css({
                "display": "block"
            });
        }

        if (this.options.autoContentHeight) {
            this.contentHeight = $("#AcContent").height();
        }

        // attach close button
        if (this.options.closeButton) {
            $("#AcModal").prepend(this.options.closeButtonTemplate);
        }

        this.center();
        this.animate();
        
        //add "#r"
        if (this.options.useHash === true) {
            //save last hash
            this.closeHash = window.location.hash;
            window.location.hash = "r";
        }

        // callback
        if (typeof this.options.onOpen === "function") {
            this.options.onOpen(this.$elem);
        }

    },

    /**
     * Initial animation when modal dialog opens
     * @param  {Number} contentHeight Height of content for the purpose automatically animating to that height
     * @return {Undefined}            Animates modal dialog
     */
    animate: function () {
        var $modal = $("#AcModal"),
            $overlay = $("#AcOverlay"),
            scrollPosition = $(window).scrollTop();

        $overlay.hide();
        $modal.hide();
        this.center();

        $overlay.fadeIn(this.options.fadeIn);
        $modal.fadeIn(this.options.fadeIn);

        if (this.options.marginTop > 0 && !this.options.scrollTop) {
            $modal.css({
                "margin-top": this.options.marginTop
            });
        } else if (this.options.position === "absolute") {
            $modal.css({
                "margin-top": scrollPosition + this.options.marginTop
            });
        }

        this.checkHeight();
    },

    /**
     * Center modal window in viewport
     */
    center: function () {
        var top,
            paddingOuter = this.options.padding * 2,
            $modal = $("#AcModal"),
            $modalHeight = $modal.height();

        // get offsets - padding
        top = Math.max($(window).height() - $modalHeight, 0) / 2 - paddingOuter;

        var sideSpace = 20;
        if ($(window).width() < (this.options.width + sideSpace * 2)) {
            $modal.css({
                "top": top,
                "width": "auto",
                "left": sideSpace,
                "right": sideSpace,
                "margin-left": 0
            });
        } else {
            $modal.css({
                "top": top,
                "width": this.options.width,
                "left": "50%",
                "right": "auto",
                "margin-left": -(this.options.width / 2)
            });
        }
    },

    /**
     * Checks the height of the content and resizes if necessary
     */
    checkHeight: function () {
        var winHeight = $(window).height(),
            modalHeight = $("#AcModal").height(),
            contentHeight = $("#AcContent").height();

        if (winHeight < modalHeight && this.options.scroll !== false) {
            this.resize(contentHeight);
        } else if (this.options.scroll !== false) {
            this.resize();
        }
    },

    /**
     * Adjust (animate) modal height to fit viewport on window resize
     */
    resize: function (contentHeight) {
        var winHeight = $(window).height(),
            oRatio = 0.8,
            paddingOuter = this.options.padding * 2,
            newHeight,
            newTopMargin,
            $modal = $("#AcModal"),
            $modalWrap = $("#AcWrap");

        this.center();

        if (!this.options.height && !this.options.autoContentHeight) {
            newHeight = winHeight - this.options.offsetTopBottom;
        } else if (this.options.height) {
            if (winHeight < this.options.height) {
                newHeight = winHeight - this.options.offsetTopBottom;
            } else {
                newHeight = this.options.height - this.options.offsetTopBottom;
            }
        } else if (this.options.autoContentHeight && this.options.animate) {
            if (winHeight < this.contentHeight) {
                newHeight = winHeight * oRatio;
            } else {
                newHeight = this.contentHeight + this.options.innerOffset;
            }
        } else if (this.options.animate === false) {
            if (winHeight < contentHeight + this.options.innerOffset + (this.options.padding * 2)) {
                newHeight = winHeight * oRatio;
            } else {
                $modal.css({
                    "height": "auto"
                });
                $modalWrap.css({
                    "height": "auto"
                });
            }
            $modalWrap.css({
                "overflow-y": "auto"
            });
        }

        newTopMargin = Math.max(winHeight - newHeight, 0) / 2 - paddingOuter;

        $modal.css({
            height: newHeight,
            top: newTopMargin
        });

        $modalWrap.height(newHeight - this.options.innerOffset);
    },

    /**
     * Sets up auto resize functionality (timeout set to zero to mimic current lightview functionality)
     */
    setupResize: function () {
        var _self = this;

        // if the height is not fixed animate the height on window resize
        if (this.options.height === null && this.options.autoResize === true) {

            var timeOut = false;
            $(window).on("resize.acmodal", function () {

                if (timeOut !== false) {
                    clearTimeout(timeOut);
                }

                timeOut = setTimeout(timeOutFunc, _self.options.resizeTimeout);

                function timeOutFunc() {
                    $("#AcModal").clearQueue();
                    _self.resize();
                    _self.center();
                    _self.checkHeight();
                }

            });

            // otherwise just keep the modal centered and the width responsive
        } else {

            $(window).on("resize.acmodal", function () {
                $("#AcModal").clearQueue();
                _self.center();
            });

        }

    },

    /**
     * Closes modal window and calls removeModal()
     */
    close: function (callback) {
        var _self = this;

        this.options.onBeforeClose();

        if (this.options.fadeOut !== false) {
            $("#AcOverlay").fadeOut(_self.options.fadeOut);
            $("#AcModal").fadeOut(_self.options.fadeOut, function () {
                _self.remove(callback);
            });
        } else {
            this.remove(callback);
        }

        //remove "#r"
        if (this.options.useHash === true && window.location.hash === "#r") {
            this.closeHash = "";
            history.go(-1);
        }

    },

    /**
     * Removes modal modal markup and event handlers
     */
    remove: function (callback) {
        $("#AcOverlay").remove();

        if (this.options.href && this.options.href !== "") {
            this.unwrapContent();
            $(this.options.href).css({
                "display": "none"
            });
            $("#AcCloseWrap").remove();
        } else {
            $("#AcModal").remove();
        }

        $(window).off("resize.acmodal");
        // callback
        if (typeof this.options.onClose === "function" || typeof callback === "function") {
            if (typeof callback !== "undefined") {
                callback();
            }
            if (typeof this.options.onClose !== "undefined") {
                this.options.onClose();
            }
        }
    },

    /**
     * Recursive function to remove AcModal wrap HTML from content
     */
    unwrapContent: function () {
        var acmodal = $("#AcModal").length;

        if (!acmodal) {
            return false;
        } else {
            $(this.options.href).unwrap();
            this.unwrapContent();
        }
    }

};

////////////////////////////
// END OF COMPONENT LOGIC //
////////////////////////////

// register AcModal object as a jQuery plugin
$.plugin(AcModal.name, AcModal);