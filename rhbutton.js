/**
 * Racehorse RhButton jQuery Plugin
 * @version 0.1
 * @author Martin Przybyla
 */

/**
 * Main Plugin Object
 * @type {Object}
 */
var RhButton = {

    /**
     * jQuery plugin name which can later be used to call the plugin
     * Example: $('#Elem').newplugin();
     * @type {String}
     */
    name: 'rhbutton',

    // plugin version
    version: 0.1,

    /**
     * Default plugin options
     * @type {Object}
     */
    options: {
        buttonKeys: [{
            initial: 'Find Ancestors',
            inProcess: 'Processing...',
            success: 'Saved'
        }, {
            initial: 'Begin Free Trial',
            inProcess: 'Processing...',
            success: ''
        }, {
            initial: 'Create Account',
            inProcess: 'Processing Order...',
            success: ''
        }, {
            initial: 'Login',
            inProcess: 'Loading...',
            success: ''
        }, {
            initial: 'Order Now',
            inProcess: 'Ordering...',
            success: ''
        }, {
            initial: 'Save',
            inProcess: 'Saving...',
            success: 'Saved'
        }, {
            initial: 'Save to family list',
            inProcess: 'Saving...',
            success: 'Saved'
        }, {
            initial: 'Select',
            inProcess: 'Selecting...',
            success: 'Selected'
        }, {
            initial: 'Search',
            inProcess: 'Searching...',
            success: ''
        }, {
            initial: 'Search now',
            inProcess: 'Searching...',
            success: ''
        }, {
            initial: 'Submit',
            inProcess: 'Submitting...',
            success: ''
        }, {
            initial: 'Submit order',
            inProcess: 'Submitting...',
            success: ''
        }, {
            initial: 'Upload',
            inProcess: 'Uploading...',
            success: ''
        }, {
            initial: 'View records',
            inProcess: 'Searching...',
            success: ''
        }, {
            initial: 'View tree',
            inProcess: 'Loading...',
            success: ''
        }, {
            initial: 'Save Settings',
            inProcess: 'Saving...',
            success: ''
        }, {
            initial: 'Provide Feedback',
            inProcess: 'Processing...',
            success: ''
        }, {
            initial: 'Send message',
            inProcess: 'Sending...',
            success: ''
        }],
        delay: 0,
        processingClass: 'ac-button-processing',
        successClass: 'ac-button-success',
        textContainer: '.ac-button-text',
        autoSuccess: false,
        autoReturn: false,
        disable: true,
        submit: false,
        validate: false,
        submitTarget: "",
        ajax: false,
        intercept: function () { return false; }
    },

    /**
     * Init constructor method
     * @constructor
     * @param  {Object} options Passed in options which are mixed with default options
     * @param  {Object} elem    HTML node
     * @return {Object}         Return object
     */
    init: function (options, elem) {
        var _self = this;

        // mix in the passed-in options with the default options
        this.options = $.extend({}, this.options, options);

        // save reference to the element and the jQuery object
        this.elem = elem;
        this.$elem = $(elem);

        this.target = this.options.submitTarget !== "" ? $(this.options.submitTarget) : this.$elem.parents("form");

        //watch for submit action, then disable
        if (this.options.disable === true && this.elem.nodeName === "BUTTON") {
            this.target.submit(function() {
                if ($(this).valid()) {
                    _self.elem.disabled = true;
                }
            });
        }

        //remove disabled attribute on reload if it's cached
        this.$elem.removeAttr('disabled');

        //replace loading text with permanent text if needed
        var onloadText = this.$elem.attr("data-onload-text");
        if (typeof onloadText !== "undefined" && onloadText.length > 0) {
            this.$elem.children(this.options.textContainer).text(onloadText);
        }

        this.$elem.click(function (e) {
            if (_self.options.validate) {
                // check if form is valid
                if (_self.target.valid()) {
                    e.preventDefault();
                    if (!_self.options.intercept.call(_self.elem.form)) {
                        _self.process();
                    }
                }
            // if validation not active
            } else {
                _self.process();
            }
        });

        // return this for chaining / prototype
        return this;
    },

    /**
     * Process button text
     * @return {undefined} Changes button text
     */
    process: function () {
        var textNode = this.$elem.children(this.options.textContainer),
            textObj = this.lookup(textNode.text()),
            _self = this,
            autoReturn = function () {
                setTimeout(function () {
                    textNode.text(_self.originalText);
                    _self.$elem.removeClass(_self.options.successClass + " " + _self.specificSuccessClass).removeAttr("disabled").addClass(_self.options.processingClass);
                }, _self.options.delay);
            };
        // save original button text
        this.originalText = textNode.text();


        if (textObj) {
            textNode.text(textObj.inProcess);
            this.$elem.addClass(this.options.processingClass);

            if (this.options.ajax === true) {
                $(document).ajaxComplete(function () {
                    textNode.text(_self.originalText);
                    _self.$elem.removeClass(_self.options.processingClass).removeAttr("disabled");
                });
            }

            if (textObj.success !== '' && this.options.autoSuccess === true) {
                // add a specific success class
                this.specificSuccessClass = "ac-button-" + textObj.success.toLowerCase();

                setTimeout(function () {
                    textNode.text(textObj.success);
                    _self.$elem.removeClass(_self.options.processingClass);
                    _self.$elem.addClass(_self.options.successClass + " " + _self.specificSuccessClass);
                    if (_self.options.autoReturn === true) {
                        autoReturn();
                    }
                }, this.options.delay);
            } else if (this.options.autoReturn === true) {
                autoReturn();
            }

            if (this.options.disable === true && this.elem.nodeName === "BUTTON") {
                // if form submittal set to true
                if (this.target.length > 0) {
                    if (this.options.submit) {
                        this.target.submit();
                    }
                } else {
                    //disable button if there is no form
                    _self.elem.disabled = true;
                }
            }
        }
    },

    /**
     * Return button text to original state
     * @param  {String} successText Success action text
     * @return {undefined}          Changes button back to original text
     */
    originalState: function (successText) {
        var textNode = this.$elem.children(this.options.textContainer),
            _self = this,
            classes = _self.options.processingClass + " " + _self.specificSuccessClass + " " + _self.options.successClass,
                elem = this.elem || this;

        setTimeout(function () {
            textNode.text(_self.originalText);
            _self.$elem.removeClass(classes);
            if (_self.options.disable === true && elem.nodeName === "BUTTON") {
                _self.elem.disabled = false;
            }
        }, this.options.delay);
    },

    /**
     * Looks up processing text for button key
     * @param  {String} currentText Current button text
     * @param  {Array}  arr         Array to use as haystack
     * @return {String}             Button processing text
     */
    lookup: function (currentText, arr) {
        var buttons = arr || this.options.buttonKeys,
            lookupResult = {};

        for (var i = 0, len = buttons.length; i < len; i++) {
            lookupResult[buttons[i].initial.toLowerCase()] = buttons[i];
        }

        return lookupResult[currentText.toLowerCase()] || {
            initial: 'Default',
            inProcess: 'Processing...',
            success: ''
        };
    }

};

////////////////////////////
// END OF COMPONENT LOGIC //
////////////////////////////

// register NewPlugin object as a jQuery plugin
$.plugin(RhButton.name, RhButton);
