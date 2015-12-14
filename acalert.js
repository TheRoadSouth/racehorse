/**
 * Archives.com jQuery Alert Plugin
 * @version 0.5
 * {@link http://www.archivesux.com/wiki/doku.php?id=fed:ac-alert}
 * @requires pluginbridge.js
 * @author Martin Przybyla
 */

/**
 * Main Alert Object
 * @type {Object}
 */
var AcAlert = {

    /**
     * jQuery plugin name which can later be used to call the plugin
     * Example: $("#Elem").acalert();
     * @type {String}
     */
    name: "acalert",

    // plugin version
    version: 0.5,

    /**
     * Default options
     * @type {Object}
     */
    options: {
        responsive: true,
        href: "",
        width: 500,
        height: null,
        padding: 8,
        top: null,
        bottom: null,
        position: "fixed",
        fade: 0,
        closeButton: true,
        overlayTemplate: "<div id=\"AcOverlay\"></div>",
        closeButtonTemplate: "<div id=\"AcAlertCloseWrap\"><a id=\"AcAlertClose\"></a></div>",
        alertTemplate: "<div id=\"AcAlert\"><div id=\"AcAlertWrap\"><div id=\"AcAlertContent\"/></div></div>",
        onOpen: null,
        onClose: null
    },

    /**
     * Init constructor method. This plugin is called differently than most AcPlugins.
     * @constructor
     * @param  {Object} contentOptions      String content or an HREF
     * @param  {Object} options             Passed in options to be merged with defaults
     * @return {Object}                     Return alert object
     */
    init: function(contentOptions, options) {
        var _self = this;

        // save a copy of the default options
        this.originalOpts = this.options;

        if (typeof contentOptions === "string") {
            this.content = contentOptions;
            this.options = $.extend({}, this.options, options);
        } else if (typeof contentOptions === "object") {
            this.options = $.extend({}, this.options, contentOptions);
            this.content = this.getContent(this.options.href);
        }

        this.show(this.content);
        this.setupResize();

        $("#AcAlertClose").click(function() {
            _self.close();
        });

        // return this for chaining / prototyping
        return this;
    },

    /**
     * Show the alert window
     */
    show: function(content) {
        var alertContent = "";

        $("body").append(this.options.overlayTemplate, this.options.alertTemplate);

        $("#AcAlert").css({
            "visibility": "visible",
            "opacity": 0
        });

        if (this.options.width !== null) {
            $("#AcAlert").css({
                "width": this.options.width
            });
        }

        if (this.options.responsive === true) {
            this.responsiveWidth();
        }

        if (this.options.height !== null) {
            $("#AcAlert").css({
                "height": this.options.height
            });
        }

        // insert alert content
        $("#AcAlertWrap").html(content);
        $("#AcAlert").prepend(this.options.closeButtonTemplate);

        this.position();

        if (this.options.fade === false) {
            $("#AcAlert").css({
                "opacity": 1
            });
        } else {
            $("#AcAlert").animate({
                "opacity": 1
            }, this.options.fade);
        }

        // callback
        if (typeof this.options.onOpen === "function") {
            this.options.onOpen();
        }

    },

    /**
     * Retrieves content
     * @param  {String} href Content selector (class or ID)
     * @return {String}      HTML content
     */
    getContent: function(href) {
        var htmlContent;

        if (href && href !== "") {

            htmlContent = $(href).html();
            return htmlContent;

        }
    },

    /**
     * Position alert window in viewport
     */
    position: function() {
        var top,
            bottom,
            left,
            paddingOuter = this.options.padding * 2,
            $alert = $("#AcAlert"),
            $alertHeight = $alert.height(),
            $alertWidth = $alert.width() + paddingOuter;

        if (this.options.top !== null) {
            top = this.options.top;
        } else if (this.options.bottom !== null) {
            bottom = this.options.bottom;
        } else {
            top = Math.max($(window).height() - $alertHeight, 0) / 2 - paddingOuter;
        }

        left = (Math.max($(window).width() - $alertWidth, 0) - paddingOuter) / 2;

        if (top) {
            $alert.css({
                "top": top
            });
        } else {
            $alert.css({
                "bottom": bottom
            });
        }

        $alert.css({
            "left": left
        });

        $alert.css({
            "position": this.options.position
        });
    },

    /**
     * Keep width responsive on window resize
     */
    responsiveWidth: function() {
        if ($(window).width() < this.options.width && this.options.responsive === true) {
            $("#AcAlert").css({
                "width": "80%"
            });
        } else {
            $("#AcAlert").css({
                "width": this.options.width
            });
        }
    },

    /**
     * Sets up auto resize functionality
     */
    setupResize: function() {
        var _self = this;

        $(window).on("resize.acalert", function() {
            _self.position();
            _self.responsiveWidth();
        });

    },

    /**
     * Removes alert window from DOM
     */
    close: function() {
        $("#AcAlert, #AcOverlay").remove();
        $(window).off("resize.acalert");

        // callback
        if (typeof this.options.onClose === "function") {
            this.options.onClose();
        }

        this.options = $.extend({}, this.options, this.originalOpts);
    }

};

////////////////////////////
// END OF COMPONENT LOGIC //
////////////////////////////

// register AcAlert object as a jQuery plugin
$.plugin(AcAlert.name, AcAlert, true);