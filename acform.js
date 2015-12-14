/**
 * Archives.com AcForm Plugin
 * @version 0.2
 * @author Martin Przybyla
 */

/**
 * Main Plugin Object
 * @type {Object}
 */
var AcForm = {

    /**
     * jQuery plugin name which can later be used to call the plugin
     * Example: $('#Elem').newplugin();
     * @type {String}
     */
    name: "acform",

    // plugin version
    version: 0.2,

    /**
     * Default plugin options
     * @type {Object}
     */
    options: {
        formErrorTemplate: "<div/>",
        formErrorText: "There were one or more errors in the form. Please double-check the fields marked in red.",
        errorClassForm: "ac-form-invalid",
        errorClassInput: "input-validation-error",
        errorClassContainer: "ac-form-container-error",
        checkBoxClass: "ac-form-checkbox",
        radioClass: "ac-form-radio",
        checkedClass: "ac-form-checked",
        errorContainerId: "",
        intercept: false,
        showErrorBar: true
    },

    /**
     * Init constructor method
     * @constructor
     * @param  {Object} options Passed in options which are mixed with default options
     * @param  {Object} elem    HTML node
     * @return {Object}         Instatiated object
     */
    init: function(options, elem) {
        var _self = this;

        // mix in the passed-in options with the default options
        this.options = $.extend({}, this.options, options);

        // save reference to the element and the jQuery object
        this.elem = elem;
        this.$elem = $(elem);

        this.formErrorTemplate = $(this.options.formErrorTemplate)
            .addClass(this.options.errorClassForm)
            .append(this.options.formErrorText);

        // wrap/override some jQuery validate functions
        this.defaultShowErrorsWrapper();
        this.showLabelWrapper();

        // handle select box focus
        this.focusStateSelect();

        //handle exact box show/hide
        this.exactBoxFocus();

        this.radioGroupValidation();

        if (this.options.intercept) {
            this.intercept();
        }

        // return this for chaining / prototype
        return this;
    },
   

    /**
     * Overrides jQuery.validate defaultShowError method
     * @return {Undefined}
     */
    defaultShowErrorsWrapper: function() {
        var _self = this,
            errorClass = "." + this.options.errorClassForm;

        $.validator.prototype.defaultShowErrors = function() {
            var i, elements;
            for (i = 0; this.errorList[i]; i++) {
                var error = this.errorList[i];
                if (this.settings.highlight) {
                    this.settings.highlight.call(this, error.element, this.settings.errorClass, this.settings.validClass);
                    $(error.element).parents(".ac-form-element").addClass(_self.options.errorClassContainer);
                }
                this.showLabel(error.element, error.message);
                _self.showGeneralFormError();
            }
            if (this.errorList.length) {
                this.toShow = this.toShow.add(this.containers);
            } 
            
            //hide error bar if there are no more invalid elements
            if (this.numberOfInvalids() === 0) {
                _self.$elem.find(errorClass).hide();
            }

            if (this.settings.success) {
                for (i = 0; this.successList[i]; i++) {
                    this.showLabel(this.successList[i]);
                }
            }
            if (this.settings.unhighlight) {
                for (i = 0, elements = this.validElements(); elements[i]; i++) {
                    this.settings.unhighlight.call(this, elements[i], this.settings.errorClass, this.settings.validClass);
                    if ($(elements[i]).parents(".ac-exact-search").size() === 0) {
                        $(elements[i]).parents(".ac-form-element").removeClass(_self.options.errorClassContainer);
                    }
                }
            }
        };  
    },

    /**
     * Overrides jQuery.validate showLabel method
     */
    showLabelWrapper: function() {
        var _self = this;

        $.validator.prototype.showLabel = function(element, message) {
            if (jQuery(element).parent().hasClass(_self.options.radioClass)) {
                return;
            }

            var label = this.errorsFor(element);
            if (label.length) {
                //refresh error/success class
                label.removeClass(this.settings.validClass).addClass(this.settings.errorClass);
                //replace message on existing label
                label.html(message);
            } else {
                //create label
                label = $("<" + this.settings.errorElement + ">")
                    .attr("for", this.idOrName(element))
                    .addClass(this.settings.errorClass)
                    .html(message || "");
                if (this.settings.wrapper) {
                    //make sure the element is visible, even in IE
                    //actually showing the wrapped element is handled elsewhere
                    label = label.hide().show().wrap("<" + this.settings.wrapper + "/>").parent();
                }
                if (!this.labelContainer.append(label).length) {
                    if (this.settings.errorPlacement) {
                        this.settings.errorPlacement(label, $(element));
                    } else {
                        label.insertAfter(element);
                    }
                }
            }
            if (!message && this.settings.success) {
                label.text("");
                if (typeof this.settings.success === "string") {
                    label.addClass(this.settings.success);
                } else {
                    this.settings.success(label, element);
                }
            }
            this.toShow = this.toShow.add(label);
        };
    },
    /**
     * Handles Focus State for select boxes
     * @return {Undefined}
     */
    focusStateSelect: function () {
        var _self = this;
        $(this.$elem).find(".ac-form-select select").on({
            "focus": function () {
                $(this).parents(".ac-select-wrapper").addClass("focused");
            },
            "focusout": function () {
                $(this).parents(".ac-select-wrapper").removeClass("focused");
            }
        });
    },

    /**
     * Handles Focus and not empty State for input fields with exactBoxes
     * @return {Undefined}
     */
    exactBoxFocus: function () {
        //check on load to see if any text boxes have a value and show the exact checkbox
        $(this.$elem).find(".ac-exact-search").siblings("input").each(function () {
            if ($(this).val().length > 0) {
                $(this).parent().addClass("ac-exact-visible");
            }
        });

        //add listener event for hover
        $(this.$elem).find(".ac-exact-search").hover( function () {
            $(this).parent().addClass("ac-exact-visible");
        }, function () {
            if (!$(this).find("input[type='checkbox']").is(":checked") && !$(this).siblings("input").is(":focus")) {
                $(this).parent().removeClass("ac-exact-visible");
            }
        });
        //add event listeners for focus into and out of text fields and handle show/hide of exact checkboxes
        $(this.$elem).find(".ac-exact-search").siblings("input").on({
            "focus": function () {
                if ($(this).siblings(".ac-exact-search").size() > 0) {
                    $(this).parent().addClass("ac-exact-visible");
                    $(this).on("keydown", function (event) {
                        if (event.keyCode === 9 && !event.shiftKey) {
                            if ($(this).val().length === 0) {
                                event.preventDefault();
                                $("input, select, textarea").eq($("input, select, textarea").index($(this)) + 3).focus();
                            }
                        }
                    });
                }
            },
            "focusout": function () {
                var $self = $(this),
                    $exactCheckbox = $self.siblings(".ac-exact-search").find("input[type='checkbox']");
                window.setTimeout(function () {
                    //if 1) the textbox is empty and the exact Checkbox is not focused or 2) if the exactCheckbox is not focused and not checked
                    if (($self.val().length === 0 && !$exactCheckbox.is(":focus")) || (!$exactCheckbox.is(":focus") && !$exactCheckbox.is(":checked"))) {
                        $self.parent().removeClass("ac-exact-visible").find(".ac-exact-search input[type='checkbox']").prop("checked", false);
                    }
                }, 200);
            }
        });
        //show/hide exact checkboxes on focus/focusout
        $(this.$elem).find(".ac-exact-search input").on({
            "focus": function () {
                $(this).parent().parent().addClass("ac-exact-visible");
            },
            "focusout": function () {
                if (!$(this).is(":checked")) {
                    $(this).parent().parent().removeClass("ac-exact-visible");
                } else if ($(this).is(":checked")) {
                    var $self = $(this),
                        $siblingInput = $(this).parent().siblings("input").eq(0);
                    window.setTimeout(function () {
                        if ($siblingInput.val().length === 0 && !$siblingInput.is(":focus")) {
                            $self.prop("checked", false);
                            $self.parent().parent().removeClass("ac-exact-visible");
                        }
                    }, 200);
                }
            }
        });
    },

    /**
     * Handles consolidated error messages for radio groups
     * @return {Undefined}
     */
    radioGroupValidation: function() {
        var _self = this,
            radioGroup = $(".ac-radio-group"),
            error = "." + this.options.errorClassForm;
        inputs = radioGroup.find("." + this.options.radioClass);

        inputs.on("click", function() {
            $(this).siblings().children().removeClass("input-validation-error error ac-form-container-error");
            $(this).siblings(".field-validation-error").hide();
            _self.$elem.find(".ac-form-invalid").hide();
        });
    },

    /**
     * Shows the markup for a general form error at the top of the form. Adds it if it doesn't exist.
     * @return {Undefined}
     */
    showGeneralFormError: function(customError) {
        var _self = this,
            error = "." + this.options.errorClassForm,
            $form = (this.options.errorContainerId.length > 0 ? $("#" + this.options.errorContainerId) : _self.$elem);

        if (this.options.showErrorBar) {
            // show a general form error
            if ($form.find(error).length === 0) {
                $form.prepend(_self.formErrorTemplate);
            } else {
                $form.find(error).show();
            }
            if (typeof customError === "string") {
                $(".ac-form-invalid").text(customError);
            }
        }
    }
};

////////////////////////////
// END OF COMPONENT LOGIC //
////////////////////////////

// register NewPlugin object as a jQuery plugin
$.plugin(AcForm.name, AcForm);