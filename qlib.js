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
    Q.ex = QLib.prototype = {
        /**
         * Shows all Q elements
         */
        show: function() {
            this.css({display: ""});
            return this;
        },
        /**
         * Hides all Q elements
         */
        hide: function() {
            this.css({display: "none"});
            return this;
        },
        /**
         * Gets or sets CSS style of the Q Object
         * @param obj {*} Object or string
         * @returns {string} Returns value of style property. Only if parameter is a string.
         */
        css: function(obj) {
            // Check if object or just one entry
            var length = this.length;

            if(typeof obj == "undefined")
                throw "Parameter invalid in 'css'. Parameter 'obj' is undefined.";
            // If obj is a string then only get the value
			if(typeof obj == "string") {
                if(obj.indexOf(" ") == -1)
                    return window.getComputedStyle(this[0], null)[obj];
                else throw "Parameter error in 'css'. Parameter 'obj' contains spaces."
            }

            // If obj is an object then set values
            for(var prop in obj) {
                while(length--) {
                    if(obj.hasOwnProperty(prop) && this[length].style.hasOwnProperty(prop))
                        this[length].style[prop] = obj[prop];
                }
            }
            return this;
        },
        /**
         * Adds event to all elements in the Q object
         * @param eventType
         * @param selector
         * @param callback
         */
		on: function(eventType, selector, callback) {
			var handler;
			if(eventType == "ready")
				eventType = "DOMContentLoaded";
			
			// If selector is defined
			if(typeof eventType == "string" && typeof selector == "string" && typeof callback == "function") {
				handler = function(e) {
					for(var target = e.target; target && target != this; target = target.parentNode) {
						// Loop parent elementss from the target to the delegation elements
						if (target.matches(selector)) {
							callback.call(target, e);
							break;
						}
					}
				};
			}
			// Regular event
			else if(typeof eventType == "string" && typeof selector == "function")
				handler = selector;
			// Error
			else throw "Invalid parameters while calling 'event'";
			
			// Add listener to all elements in this object
			var length = this.length;
			while(length--) {
				if(this[length].addEventListener)
					this[length].addEventListener(eventType, handler);
				else if(this[length].attachEvent)
					this[length].attachEvent("on" + (eventType == "DOMContentLoaded" ? "readystatechange" : eventType), handler);
			}
			
			return this;
		},
		once: function(eventType, selector, callback) {
			var qObj = this;

			qObj.on(eventType, selector, function(e) {
				callback(this, e);
                // Check for aliases
                if(eventType == "ready")
                    eventType = "DOMContentLoaded";

				// Remove event
				if(this.addEventListener)
					this.removeEventListener(eventType, arguments.callee);
				else if(this.attachEvent)
					this.detachEvent("on" + (eventType == "DOMContentLoaded" ? "readystatechange" : eventType), arguments.callee);
			});
			
			return this;
		},
        /**
         * Gets/Sets the text of the first elements
         * @returns {string|object} Text of the first elements or this Q object
         */
        text: function(text) {
            if(typeof text == "string") {
                var length = this.length;

                while(length--) {
                    if(this[length].textContent)
                        this[length].textContent = text;
                    // IE fix
                    else if(this[length].innerText)
                        return this[length].innerText;
                }

                return this;
            }

            if(this[0].textContent)
                return this[0].textContent;
            // IE fix
            else if(this[0].innerText)
                return this[0].innerText;
            else throw "Error getting text in element";
        },
        /**
         * Gets the html of the first elements or sets the Html on all elements
         * @param html {string} Html to set to the elements
         */
        html: function(html) {
            if(typeof html == "string") {
                var length = this.length;
                while(length--)
                    this[length].innerHTML = html;

                return this;
            }

            return this[0].innerHTML;
        },
        /**
         * Gets the first Q elements from this object
         * @returns {Q}
         */
        first: function() {
            return Q(this[0]);
        },
        /**
         * Gets child elements from the first Q elements
         */
        children: function() {
            return Q(this[0].childNodes);
        },
        parent: function() {
            var parents = [];
            this.each(function() {
                if(!parents.includes(this.parentNode))
                    parents.push(this.parentNode);
            });
            return Q(parents);
        },
        /**
         * Appends html or text to Q elements
         * @param html {string} Text or html to append
         * @returns {Q}
         */
        append: function(html) {
            if(typeof html != "string")
                throw "Parameter 'html' invalid";

            var length = this.length;
            while(length--)
                this[length].innerHTML += html;

            return this;
        },
        /**
         * Prepends html or text to Q elements
         * @param html {string} Text or html to prepend
         * @returns {Q}
         */
        prepend: function(html) {
            if(typeof html != "string")
                throw "Parameter 'html' invalid";

            var length = this.length;
            while(length--)
                this[length].innerHTML = html + this[length].innerHTML;

            return this;
        },
        /**
         * Gets/sets position of Q elements relative to the document
         */
		offset: function() {
			
		},
        /**
         * Gets/sets position of Q elements relative to parent elements
         */
		position: function() {
			
		},
        /**
         * Gets the first Q elements attribute or sets all Q elements attributes
         * @param attr {string} Attribute name or object
         * @returns {Q|string} Attribute value or this Q object
         */
        attr: function(attr) {
            // If only getting
            if(typeof attr == "string"  && this.hasAttr(attr)) {
                if(attr.indexOf(" ") == -1)
                    return this[0].getAttribute(attr);
                else throw "Parameter error in 'attr'. Parameter 'attr' contains spaces."
            }
            // Set values
            for(var prop in attr) {
                while(length--) {
                    if(attr.hasOwnProperty(prop))
                        this[length].setAttribute(prop, attr[prop]);
                }
            }
            return this;
        },
        /**
         * Removes all Q elements attribute with the attribute name
         * @param attr {string} Attribute name
         * @returns {Q} This Q object
         */
        removeAttr: function(attr) {
            if(typeof attr != "string")
                throw "Parameter 'attr' invalid";

            var length = this.length;
            while (length--) {
                if(this[length].hasAttribute(attr))
                    this[length].removeAttribute(attr);
            }
            return this;
        },
        /**
         * Checks if the first Q elements has an attribute(s)
         * @param attr {string} Attribute name
         * @returns {boolean} True or False
         */
        hasAttr: function(attr) {
            if(typeof attr != "string")
                throw "Parameter 'attr' invalid";

            if(attr.indexOf(" ") == -1)
                return this[0].hasAttribute(attr);
            // Multiple attributes
            else {
                var attrs = attr.split(" ");
                for(var i = 0; i < attrs.length; i++) {
                    if (this[0].hasAttribute(attrs[i]))
                        return true;
                }
                return false;
            }
        },
        addClass: function(className) {
            if(typeof className != "string")
                throw "Parameter invalid in 'removeClass'. parameter 'className' is not a string.";

            var classNames = className.split(" ");
            var length = this.length;
            while(length--) {
                var classList = this[length].className.split(" ");

                // Check if we should loop
                if(classList.length < 1 || classNames.length < 1)
                    break;

                // Remove every entry in Q elements
                for(var i = 0; i < classNames.length; i++) {
                    for(var n = 0; n < classList.length; n++) {
                        if(classNames[i] == classList[n])
                            break;
                        else if(n == (classList.length - 1))
                            classList.push(classNames[i]);
                    }
                }
                this[length].className = classList.join(" ");
            }
            // Return 'this' Q object
            return this;
        },
        /**
         * Removes a class/classes from a set of classes
         * @param className {string} Class/classes to remove
         */
        removeClass: function(className) {
            if(typeof className != "string")
                throw "Parameter invalid in 'removeClass'. parameter 'className' is not a string.";

            var classNames = className.split(" ");
            var length = this.length;
            while(length--) {
                var classList = this[length].className.split(" ");

                // Remove every entry in Q elements
                for(var i = 0; i < classNames.length; i++) {
                    for(var n = 0; n < classList.length; n++) {
                        if(classNames[i] == classList[n])
                            classList.splice(n, 1);
                    }
                }
                this[length].className = classList.join(" ");
            }
            // Return 'this' Q object
            return this;
        },
        /**
         * Checks if the first Q element has a class or a set of classes
         * @param className {string} Class/classes to search for
         * @returns {boolean} True or False
         */
        hasClass: function(className) {
            if(typeof className == "string") {
                var classNames = className.split(" ");

                for(var i = 0; i < classNames.length; i++) {
                    var classList = this[0].className.split(" ");
                    for(var n = 0; n < classList.length; n++) {
                        if (classNames[i] == classList[n])
                            return true;
                    }
                }
            }
            return false;
        },
        /**
         * Removes this Q objects elements
         */
        remove: function() {
            var length = this.length;
            while(length--)
                this[length].parentNode.removeChild(this[length]);
        },
        /**
         * Iterates all the Q elements
         * @param callback {function} Function to execute every iteration
         */
        each: function(callback) {
            var length = this.length;
            while(length--)
                callback.call(this[this.length - length]);
        },
        find: function(selector) {
            if(typeof selector != "string")
                throw "Parameter invalid in 'find'. parameter 'selector' is not a string.";

            var list = [];
            // Iterate all Q nodes
            this.each(function() {
                var nodeList = Array.prototype.slice.call(this.querySelectorAll(selector));
                list = list.concat(nodeList);
            });
            return Q(list);
        }
    };

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