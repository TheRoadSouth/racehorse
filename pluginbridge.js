/**
 * jQuery Plugin Bridge
 * @version 0.8
 *
 * Converts an object into a jQuery plugin either by instantiating it
 * and calling the object's init method directly or by instantiating it on each
 * element and caching the result with $.data. Also allows for direct method
 * calls with no selector and adding namespace directly to jQuery object.
 *
 * @param  {String} name        Name of the jQuery plugin
 * @param  {Object} object      Object to convert into a jQuery plugin
 * @param  {Boolean} $namespace Whether to allow namespacing directly under the jQuery namespace
 * @return {Object}             jQuery plugin instance
 */
$.plugin = function(name, object, $namespace) {

    $.fn[name] = function(options) {

        // returns real array of options arguments minus function name
        var args = Array.prototype.slice.call(arguments, 1);

        /**
         * If there is no selector, call the init function directly.
         * See AcAlert plugin for a usage example.
         */
        if (!this.selector) {

            /**
             * This allows for the plugin to be used in AcAlert in the format
             * $.pluginname('content', options); or $.pluginname(options);
             */
            if (typeof arguments[0] === "string") {
                object.init(arguments[0], options);
            } else {
                object.init(options, null);
            }

            // else if there is a selector instatiate the plugin on each element
        } else {

            return this.each(function() {

                var instance = $.data(this, name);

                // check if plugin has already been instantiated
                if (instance) {

                    // if the argument passed in is a function call it
                    if (typeof instance[options] === "function") {
                        instance[options].apply(instance, args);
                        // call init on the instance otherwise
                    } else {
                        instance.init.call(instance, options, this);
                    }

                    // the plugin needs to be instantiated before methods can be called directly
                } else {

                    instance = $.data(this, name, Object.create(object).init(options, this));

                }

            });

        }

    };

    // also add to jQuery top level namespace (optional)
    if ($namespace === true) {

        $[name] = $.fn[name];

    }

};