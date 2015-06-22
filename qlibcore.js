/* QLib the modern compressed Javascript framework for Web developers
   Copyright CodeCubed 2015. Created by Faxity, maintained by CodeCubed*/
(function() {
    /**
     * Initializes a new Q object
     * @param selector  {string|element|NodeList} CSS selector as string or HTML element(s)
     * @returns {Q} Initialized Q object
     * @constructor
     */
    var Q = function(selector) {
        return new QLib(selector);
    };

    // Core accessors
    Q.version = "0.1.0";
    Q.ajax = function() {
		//TODO: Ajax
    };
	Q.getJSON = function() {
		
	};
    Q.isInt = function(value) {
        var x;
        if (isNaN(value))
            return false;
        x = parseFloat(value);
        return (x | 0) === x;
    };

    /**
     * QLib main object
     * @param selector {string|element|NodeList} CSS selector as string or HTML element(s)
     * @returns {QLib} QLib object
     */
    var QLib = function(selector) {
        //TODO: AJAX

        state:
            //If selector is a css string selector
            if(typeof selector == "string")
                selector = document.querySelectorAll(selector);
            // If selector is an HTML element
            else if(typeof selector != "undefined" && selector && selector.nodeType) {
                var elements = selector;
                selector = [];
                selector[0] = elements;
            }
            // If selector is an array of HTML elements
            else if(selector.length)
                break state;
            else
                throw "Invalid parameter when initializing Q object. Parameter 'selector' is not a string, node or a valid node array.";

        // Iterate all selector matches
        this.length = selector.length;
        var length = selector.length;
        while(length--)
            this[this.length - length] = selector[length];

		// Return QLib object
        return this;
    };

    // QLib Extensions Prototype
    Q.ex = QLib.prototype;

    // Attach QLib alias "Q" to window
    if(!window.Q)
        window.Q = Q;

    // Polyfills
    if(!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(needle, fromIndex) {
            if(typeof fromIndex == "undefined")
                fromIndex = 0;

            for(; fromIndex < this.length; fromIndex++) {
                if(this[fromIndex] == needle)
                    return fromIndex;
            }
            return -1;
        };
    }
    if(!Array.prototype.includes) {
        Array.prototype.includes = function(needle, fromIndex) {
            if(typeof fromIndex == "undefined")
                fromIndex = 0;

            for(; fromIndex < this.length; fromIndex++) {
                if(this[fromIndex] == needle)
                    return true;
            }
            return false;
        };
    }

    // For IE 8
    if (!window.getComputedStyle) {
        window.getComputedStyle = function(elem, pseudo) {
            this.el = elem;
            this.getPropertyValue = function(prop) {
                var re = /(\-([a-z]){1})/g;
                if (prop == 'float') prop = 'styleFloat';
                if (re.test(prop)) {
                    prop = prop.replace(re, function () {
                        return arguments[2].toUpperCase();
                    });
                }
                return elem.currentStyle[prop] ? elem.currentStyle[prop] : null;
            };
            return this;
        }
    }
})();