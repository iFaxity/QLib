/* QLib the modern compressed Javascript framework for Web developers
 Copyright CodeCubed 2015. Created by Faxity, maintained by CodeCubed*/
(function() {
    "use strict";
    // Support check
    if (!document.querySelector || !window.addEventListener)
        throw "This browser does not support QLib. Please use latest Chrome or Firefox.";

    //<editor-fold desc="QLib Static Properties">
    /**
     * Initializes a new Q object
     * @param selector  {string|Element|NodeList} CSS selector as string or HTML element(s)
     * @returns {Q} Initialized Q object
     * @constructor
     */
    var Q = function(selector) {
        return new QLib(selector);
    };
    /**
     * Get this QLibs version
     * @type {string}
     */
    Q.version = "0.3.4";
    /**
     * Events by ID used in events functions
     * @type {Array} Array of functions
     */
    Q.events = [];

    //<editor-fold desc="Ajax">
    /**
     * Sends an AJAX request to the requested URL
     * @param obj {string|Object|FormData} Settings object to apply
     */
    Q.ajax = function(obj) {
        var settings = {
            url: "",
            method: "POST",
            async: true,
            user: "",
            password: "",
            timeout: 0,
            data: undefined,
            success: undefined,
            error: undefined
        }, xhr = new XMLHttpRequest(), prop;

        // Override default settings
        for (prop in obj) {
            if (obj[prop] && settings[prop])
                settings[prop] = obj[prop];
        }

        // Parse data
        if (settings.data && typeof settings.data !== "string" && settings.data.constructor !== FormData) {
            var q = "";
            for (prop in settings.data) {
                if (settings.data[prop])
                    q += encodeURIComponent(prop) + "=" + encodeURIComponent(settings.data[prop]) + "&";
            }
            settings.data = q.substring(0, q.length - 1);
        }

        // If GET or PUT append query to url
        if (settings.data && settings.method.toUpperCase() !== "POST")
            settings.url += "?" + settings.data;

        // Set timeout & open request
        xhr.timeout = data.timeout;
        xhr.open(settings["method"].toUpperCase(), settings["url"], settings["async"], settings["user"], settings["password"]);
        // Add event
        xhr.onreadystatechange = function() {
            if (xhr.readyState !== 4) return;

            if (xhr.status === 200 && typeof settings.success === "function")
                settings.success.call(xhr, xhr.responseText);
            else if (typeof settings.error === "function")
                settings.error.call(xhr.status, xhr.statusText);
        };

        // If POST then url encode the data then send
        if (settings.data && settings["method"].toUpperCase() == "POST") {
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.send(settings["data"]);
        }
        // Send GET or PUT request
        else
            xhr.send();
    };
    /**
     * Gets a parsed JSON from an url
     * @param url {string} URL to get json from.
     * @param callback {function} Callback to run when JSON has been loaded and parsed.
     * @param data {string|Object|FormData} Data to send to server.
     */
    Q.getJSON = function(url, callback, data) {
        if (!url && !callback)
            throw "Parameter Invalid in 'getJSON'. Parameters 'url' and 'data' cant be undefined.";
        Q.ajax({
            url: url,
            method: "GET",
            data: data,
            success: function(text) {
                callback(JSON.parse(text));
            },
            error: function(code, text) {
                throw "Error in 'getJSON'. Error: " + code + " " + text;
            }
        });
    };
    /**
     * Loads file from URL
     * @param url {string} URL location to file
     * @param callback {function} Callback to run when file has loaded.
     */
    Q.getFile = function(url, callback) {
        if (!url && !callback)
            throw "Parameter Invalid in 'getFile'. Parameter 'url' and 'callback' cant be undefined.";
        Q.ajax({
            url: url,
            method: "GET",
            success: function(text) {
                callback(text);
            },
            error: function(code, text) {
                throw "Error in 'getFile'. Error: " + code + " " + text;
            }
        });
    };
    //</editor-fold>

    //<editor-fold desc="Validators">
    /**
     * Checks if the specified object is a Number
     * @param n {*} Object to check
     * @returns {boolean} True or False
     */
    Q.isNumber = function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    };
    /**
     * Checks if an object is a DOMNode
     * @param node {*} Object to check
     * @returns {boolean} True or False
     */
    Q.isNode = function(node) {
        return node && node.nodeType ? true : false;
    };
    /**
     * Checks if an object is a plain object
     * @param obj {*} Object to check
     */
    Q.isPlainObj = function(obj) {
        return obj && typeof obj === "object" && obj.constructor == Object;
    };
    //</editor-fold>

    //<editor-fold desc="Misc">
    /**
     * Used to extend the prototype of QLib
     * @param obj {Object} An object with extensions in a key value pair.
     */
    Q.extend = function(obj) {
        for (var key in obj) {
            if (obj[key])
                Q.fn[key] = obj[key];
        }
    };
    /**
     * Event that executes after the page has been loaded and parsed
     * @param callback {function} Callback to call
     */
    Q.load = function(callback) {
        window.addEventListener("load", callback, false);
    };
    /**
     * Event that executes after the page has been loaded
     * @param callback {function} Callback to call
     */
    Q.ready = function(callback) {
        document.addEventListener("DOMContentLoaded", callback, false);
    };
    /**
     * Loops every instance of the object specified
     * @param arr {Object|Array} Array to loop
     * @param callback {function} Callback to call
     */
    Q.each = function(arr, callback) {
        var i;
        if (Q.isNumber(arr.length)) {
            i = 0;
            while (i < arr.length) {
                // Call function with "index" argument
                callback.call(arr[i], i);
                i++;
            }
        }
        else {
            for (i in arr)
                callback.call(arr[i], i);
        }
    };
    /**
     * Formats a string (ex. Q.format("{h} {w}", {h: "Hello", w: "World!"}))
     * @param str {string} Input string containing "{}" in between the index to replace
     * @param obj {Array|Object} Array or Object with properties
     */
    Q.format = function(str, obj) {
        var prop;
        if (typeof str !== "string")
            throw "Param Invalid in 'format': The first parameter must be a string";
        if (obj.constructor === Array) {
            for (prop = 0; prop < obj.length; prop++)
                str = str.replace("{" + prop + "}", obj[prop]);
        }
        else if (Q.isPlainObj) {
            for (prop in obj)
                str = str.replace("{" + prop + "}", obj[prop]);
        }
        return str;
    };
    //</editor-fold>

    /**
     * QLib internal object
     * @param selector {string|Element|NodeList} CSS selector as string or HTML element(s)
     * @returns {QLib}
     */
    var QLib = function(selector) {
        var n;
        // Check if selector is undefined, null or ""
        if (!selector)
            this.length = 0;
        // Check if selector is a string
        else if (typeof selector === "string") {
            // Create element(s) from string
            if (selector.charAt(0) === "<" && selector.charAt(selector.length - 1) === ">") {
                var elem = document.createElement("div");
                elem.innerHTML = selector;
                n = elem.childNodes.length;
                this.length = 0;
                // Loop all nodes and don't include textNodes
                while (n--) {
                    if (elem.childNodes[n].nodeType == 1) {
                        this[this.length] = elem.removeChild(elem.childNodes[n]);
                        this.length++;
                    }
                }
            }
            // Get elements from global query
            else {
                selector = document.querySelectorAll(selector);
                n = this.length = selector.length;
                while (n--)
                    this[n] = selector[n];
            }
        }
        // Check if selector is a node
        else if (selector.nodeType || selector.window) {
            this[0] = selector;
            this.length = 1;
        }
        // Check if selector is an array
        else if (selector.length && Q.isNumber(selector.length)) {
            n = this.length = selector.length;
            while (n--)
                this[n] = selector[n];
        }
        // Selector is unknown
        else
            throw "Unknown parameter";
        // Return a new QLib object
        return this;
    };
    //</editor-fold>

    /*TODOList
     * TODO: Performance on Traversing functions (siblings, parents, children)
     * TODO: Performance on Attribute functions
     * TODO: Performance on Class functions
     * TODO: Performance on Event Functions
     */

    /**
     * QLib Extensions Prototype
     */
    Q.fn = QLib.prototype = {
        //<editor-fold desc="Traversing">
        /**
         * Gets the first Q node
         */
        first: function() {
            return Q(this.length > 1 ? this[0] : undefined);
        },
        /**
         * Gets the last Q node
         */
        last: function() {
            return Q(this.length > 1 ? this[this.length - 1] : undefined);
        },
        /**
         * Gets child elements from the first Q node
         * @param selector {string} CSS Selector
         */
        children: function(selector) {
            var nodes = [], callback;
            // Get children with the selector (if it's defined)
            if (typeof selector !== "string")
                selector = "*";
            // Iterate all Q nodes
            this.each(function() {
                var children = this.childNodes;
                for (var i = 0; i < children.length; i++) {
                    if (children[i].nodeType == 1 && children[i].matches(selector))
                        nodes.push(children[i]);
                }
            });
            // Return all matched nodes
            return Q(nodes.length > 0 ? nodes : undefined);
        },
        /**
         * Gets siblings from all q elements
         * @param selector {string} CSS Selector
         */
        siblings: function(selector) {
            var nodes = [], callback;
            // Get siblings with the selector (if it's defined)
            if (typeof selector === "string")
                callback = function() {
                    if (!this.parentNode)
                        return;
                    for (var sibling = this.parentNode.firstChild; sibling; sibling = sibling.nextSibling) {
                        if (sibling.nodeType === 1 && sibling !== this && sibling.matches(selector))
                            nodes.push(sibling);
                    }
                };
            else
                callback = function() {
                    if (!this.parentNode)
                        return;
                    for (var sibling = this.parentNode.firstChild; sibling; sibling = sibling.nextSibling) {
                        if (sibling.nodeType === 1 && sibling !== this)
                            nodes.push(sibling);
                    }
                };
            // Iterate all Q nodes
            this.each(callback);
            // Return all matched nodes
            return Q(nodes.length > 0 ? nodes : undefined);
        },
        /**
         * Gets the first parent of all Q nodes
         */
        parent: function() {
            var nodes = [];
            this.each(function() {
                if (parent && !nodes.indexOf(this.parentNode) !== -1)
                    nodes.push(this.parentNode);
            });
            // Return all matched nodes
            return Q(nodes.length > 0 ? nodes : undefined);
        },
        /**
         * Gets parents until document of all Q nodes
         * @param selector {string} CSS Selector
         */
        parents: function(selector) {
            var nodes = [];
            if (typeof selector !== "string")
                selector = "*";
            this.each(function() {
                var parent = this.parentNode;
                while (true) {
                    if (!parent || parent == document)
                        break;
                    // If parent already exists then don't add it and continue.
                    else if (parent && parent.matches(selector) && nodes.indexOf(parent) === -1)
                        nodes.push(parent);
                    // Next parent
                    parent = parent.parentNode;
                }
            });
            // Return all matched nodes
            return Q(nodes.length > 0 ? nodes : undefined);
        },
        /**
         * Gets parents until a certain selector
         * @param selector {string} CSS Selector
         */
        parentsUntil: function(selector) {
            var nodes = [], doc = document.documentElement;
            if (selector === undefined)
                selector = "*";
            this.each(function() {
                var parent = this.parentNode;
                while (true) {
                    // If selector matches then end loop. Or if element is the documentElement
                    if (!parent || parent == doc || parent.matches(selector))
                        break;
                    // If parent already exists then don't add it and continue.
                    if (!nodes.indexOf(parent) !== -1)
                        nodes.push(parent);
                    // Next parent
                    parent = parent.parentNode;
                }
            });
            // Return all matched nodes
            return Q(nodes.length > 0 ? nodes : undefined);
        },
        /**
         * Gets all Q nodes from index value
         * @param index {int} Index of node
         * @param count {int} Counter of how many nodes get after index
         * */
        eq: function(index, count) {
            // Throw error if index is not an integer
            if (count && !Q.isNumber(index))
                throw "Parameter invalid in 'eq'. parameter 'index' has to be an integer";
            // If count is not an integer then set it to 1 (default)
            if (count && !Q.isNumber(count))
                count = 1;
            else if (count && count < 0) // If less than 0 get maximum value
                count = this.length - index;

            // Search for all the nodes
            var nodes = [];
            while (index < Math.min(index + count, this.length)) {
                nodes.push(this[index]);
                index++;
            }
            // Return all matched nodes
            return Q(nodes.length > 0 ? nodes : undefined);
        },
        /**
         * Iterates all the Q nodes
         * @param callback {function} Function to execute every iteration
         */
        each: function(callback) {
            var i = 0;
            while (i < this.length) {
                // Call function with "index" argument
                callback.call(this[i], i);
                i++;
            }
        },
        /**
         * Finds the specified node with a CSS selector
         * @param selector {string} CSS Selector
         */
        find: function(selector) {
            if (typeof selector != "string")
                throw "Parameter invalid in 'find'. parameter 'selector' is not a string.";
            var nodes = [];
            // Iterate all Q nodes
            this.each(function() {
                var nodeList = this.querySelectorAll(selector);
                for (var i = 0; i < nodeList.length; i++)
                    nodes.push(nodeList[i]);
            });
            // Return all matched nodes
            return Q(nodes.length > 0 ? nodes : undefined);
        },
        /**
         * Filters all the Q nodes with a selector
         * @param selector {string} CSS Selector
         */
        filter: function(selector) {
            var nodes = [];
            if (typeof selector === "string") {
                for (var i = 0; i < this.length; i++) {
                    if (this[i].matches(selector))
                        nodes.push(this[i]);
                }
            }
            // Return all matched nodes
            return Q(nodes.length > 0 ? nodes : undefined);
        },
        //</editor-fold>

        //<editor-fold desc="Events">
        /**TODO: DEV
         * Adds event to all Q nodes
         * @param eventType {string} Name of event
         * @param selector {string|function} CSS selector or overload callback function
         * @param callback {function} Callback for when event fires
         */
        on: function(eventType, selector, callback, one) {
            var handler;
            if (typeof eventType !== "string")
                throw "Parameter invalid in 'on'. Parameter 'eventType' has to be a string.";

            // If selector is defined
            if (typeof selector === "string" && typeof callback === "function")
                handler = function(e) {
                    var target = e.target;
                    debugger;
                    for (; target && target !== this; target = target.parentNode) {
                        // Loop parent nodes from the target to the delegation elements
                        if (target.matches(selector)) {
                            callback.call(target, e);
                            break;
                        }
                    }
                };
            // Regular event (selector is function callback)
            else if (typeof selector === "function")
                handler = selector;
            // Error
            else
                throw "Parameter invalid in 'on'. Parameter 'selector' has to be defined.";

            // Get all event types and add them all
            var types = eventType.split(" ");
            for (var i = 0; i < types.length; i++) {
                var type = types[i];
                // Add listener to all elements in this object
                this.each(function() {
                    if (this.addEventListener)
                        this.addEventListener(type, handler, false);
                });
            }
            return this;
        },
        /**TODO: Fix this function
         * Adds event to all Q nodes. Only executes once.
         * @param eventType {string} Name of event
         * @param selector {string|function} CSS selector or overload callback function
         * @param callback {function} Callback for when event fires
         */
        one: function(eventType, selector, callback) {
            this.on(eventType, selector, callback, true);
            return this;
        },
        /**
         * Removes an 'on' event
         * @param eventType {string} Name of event
         */
        off: function(eventType) {
            return this;
        },
        /**
         * Trigger event the first Q node
         * @param eventType {string} Event type name
         */
        trigger: function(eventType) {
            if (typeof eventType !== "string")
                throw "Parameter Invalid in 'trigger'. Parameter 'eventType' has to be a string.";
            else if (this.length > 0) {
                var event;
                // Initialize event
                if (typeof window.Event === "function")
                    event = new Event(eventType, {bubbles: true, cancelable: true});
                // Leagacy support
                else if (document.createEvent) {
                    event = document.createEvent("HTMLEvents");
                    event.initEvent(eventType, true, true);
                }
                // Trigger event on the first Q node
                this[0].dispatchEvent(event);
            }
            return this;
        },
        /**
         * Focuses on the first Q node
         */
        focus: function() {
            this[0].focus();
        },
        //</editor-fold>

        //<editor-fold desc="Manipulation">
        //<editor-fold desc="Content manipulation">
        /**
         * Gets/Sets the text of the first elements
         * @returns {string|object} Text of the first element or this Q object
         */
        text: function(text) {
            // Set text
            if (typeof text === "string") {
                this.each(function() {
                    if (this.textContent)
                        this.textContent = text;
                    else
                        this.innerText = text;
                });
                return this;
            }
            // Get text
            return this[0].textContent || this[0].innerText || "";
        },
        /**
         * Gets the html of the first elements or sets the Html on all elements
         * @param html {string} Html to set to the elements
         */
        html: function(html) {
            // Set html
            if (typeof html === "string") {
                this.each(function() {
                    this.innerHTML = html;
                });
                return this;
            }
            // Get html
            return this[0].innerHTML;
        },
        /**
         * Appends html or a Node to Q elements
         * @param html {string|Node} Html or Node to append
         */
        append: function(html) {
            var callback;
            // If parameter is a string
            if (typeof html === "string")
                callback = function() {
                    this.insertAdjacentHTML("beforeEnd", html);
                };
            // If parameter is an Array of nodes
            else if (html.length)
                callback = function() {
                    var n = html.length;
                    while (n--)
                        this.appendChild(html[n].cloneNode(true));
                };
            // If parameter is a Node
            else if (html.nodeType)
                callback = function() {
                    this.appendChild(html.cloneNode(true));
                };
            // If callback was defined then call it
            if (callback)
                this.each(callback);
            else
                throw "Parameter 'html' invalid";
            return this;
        },
        /**
         * Prepends html a Node to Q elements
         * @param html {string|Node} Html or Node to prepend
         */
        prepend: function(html) {
            var callback;
            // If parameter is a string
            if (typeof html === "string")
                callback = function() {
                    this.insertAdjacentHTML("afterBegin", html);
                };
            // If parameter is an Array of nodes
            else if (html.length)
                callback = function() {
                    var n = html.length;
                    while (n--)
                        this.insertBefore(html[n].cloneNode(true), this.firstChild);
                };
            // If parameter is a Node
            else if (html.nodeType)
                callback = function() {
                    this.insertBefore(html.cloneNode(true), this.firstChild);
                };
            // If callback was defined then call it
            if (callback)
                this.each(callback);
            else
                throw "Parameter 'html' invalid";
            return this;
        },
        /**
         * Inserts content before all Q nodes
         * @param html
         * @returns {QLib}
         */
        before: function(html) {
            var callback;
            // If parameter is a string
            if (typeof html === "string")
                callback = function() {
                    if (this.parentNode)
                        this.insertAdjacentHTML("beforeBegin", html);
                };
            // If parameter is an Array of nodes
            else if (html.length)
                callback = function() {
                    if (!this.parentNode)
                        return;
                    var n = html.length;
                    while (n--)
                        this.parentNode.insertBefore(html[n].cloneNode(true), this);
                };
            // If parameter is a Node
            else if (html.nodeType)
                callback = function() {
                    if (this.parentNode)
                        this.parentNode.insertBefore(html.cloneNode(true), this);
                };
            // If callback was defined then call it
            if (callback)
                this.each(callback);
            else
                throw "Parameter 'html' invalid";
            return this;
        },
        /**
         * Inserts content after all Q nodes
         * @param html {QLib|string|HTMLCollection|Node}
         * @returns {QLib}
         */
        after: function(html) {
            var callback;
            // If parameter is a string
            if (typeof html === "string")
                callback = function() {
                    if (this.parentNode)
                        this.insertAdjacentHTML("afterEnd", html);
                };
            // If parameter is an Array of nodes
            else if (html.length)
                callback = function() {
                    if (!this.parentNode)
                        return;
                    var n = html.length;
                    while (n--)
                        this.parentNode.insertBefore(html[n].cloneNode(true), this.nextSibling);
                };
            // If parameter is a Node
            else if (html.nodeType)
                callback = function() {
                    if (this.parentNode)
                        this.parentNode.insertBefore(html.cloneNode(true), this.nextSibling);
                };
            // If callback was defined then call it
            if (callback)
                this.each(callback);
            else
                throw "Parameter 'html' invalid";
            return this;
        },
        /**
         * Clears all Q nodes content
         */
        clear: function() {
            this.each(function() {
                var node = this;
                while (node.firstChild)
                    node.removeChild(node.firstChild);
            });
            return this;
        },
        /**
         * Gets/Sets value of an input element
         * @param value {*} Value to set
         */
        val: function(value) {
            // Get value
            if (!value) {
                var elem = this[0];
                if (elem.nodeName !== "input")
                    return "";
                else if (elem.type === "checkbox" || elem.type === "radio")
                    return elem.checked;
                else
                    return elem.value;
            }
            // Set value
            this.each(function() {
                if (this.nodeName === "input") {
                    if (this.type === "checkbox" || this.type === "radio")
                        this.checked = value;
                    else
                        this.value = value;
                }
            });
            return this;
        },
        /**
         * Removes all Q nodes
         */
        remove: function() {
            this.each(function() {
                if (this.parentNode)
                    this.parentNode.removeChild(this);
            });
        },
        /**
         * Copies this Q objects nodes
         * @param deep {boolean} If childNodes should be copied
         * @returns {Q}
         */
        clone: function(deep) {
            // Overload for deep (default: true)
            if (typeof deep === "boolean")
                deep = true;
            // Clone all nodes
            var list = [];
            this.each(function() {
                list.push(this.cloneNode(deep));
            });
            // New cloned node
            return Q(list);
        },
        //</editor-fold>

        //<editor-fold desc="Style Manipulation">
        /**
         * Shows all Q elements
         */
        show: function() {
            this.each(function() {
                this.style.display = "block";
            });
            return this;
        },
        /**
         * Hides all Q elements
         */
        hide: function() {
            this.each(function() {
                this.style.display = "none";
            });
            return this;
        },
        /**
         * Gets or sets CSS style of the Q Object
         * @param name {*} String or Object
         * @param val {string} Value of css property. Only if name is string
         * @returns {string} Returns value of style property. Only if parameter is a string.
         */
        css: function(name, val) {
            // Check if object or just one entry
            if (!name)
                throw "Parameter invalid in 'css'. Parameter 'name' is undefined.";

            // If getting a value or setting one.
            if (typeof name === "string") {
                // Get a value
                var obj = {};
                if (!val)
                    return getStyle(this[0])[camelCase(name)];
                // Set value
                else {
                    obj[name] = val;
                    name = obj;
                }
            }
            // If obj is an object then set values
            for (var prop in name) {
                prop = camelCase(prop);
                this.each(function() {
                    if (this.style.hasOwnProperty(prop))
                        this.style[prop] = name[prop];
                });
            }
            return this;
        },
        /**
         * Gets/Sets an elements height with padding and border
         * @param value {boolean} Adds margin to the result
         * @returns {number} Height in pixels
         */
        outerHeight: function(value) {
            // Value defaults to false
            if (!value)
                value = false;
            // Get Value
            if (typeof value === "boolean") {
                var off = this[0].offsetHeight;
                if (value === true)
                    off += parseInt(this.css("marginTop")) + parseInt(this.css("marginBottom"));
                return off;
            }
            // Set value
            this.each(function() {
                this.style.height = (value - (this.offsetHeight - this.clientHeight)) + "px";
            });
            return this;
        },
        /**
         * Gets/Sets an elements width with padding and border
         * @param value {boolean} Adds margin to the result
         * @returns {number} Width in pixels
         */
        outerWidth: function(value) {
            // Value defaults to false
            if (!value)
                value = false;
            // Get Value
            if (typeof value === "boolean") {
                var off = this[0].offsetWidth;
                if (value === true)
                    off += parseInt(this.css("marginLeft")) + parseInt(this.css("marginRight"));
                return off;
            }
            // Set value
            this.each(function() {
                this.style.width = (value - (this.offsetWidth - this.clientWidth)) + "px";
            });
            return this;
        },
        /**
         * Gets/sets position of Q elements relative to the document
         */
        offset: function(pos) {
            // Get position
            if (!pos) {
                pos = this[0].getBoundingClientRect();
                return {
                    top: pos.top,
                    left: pos.left
                };
            }
            // Set position
            this.each(function() {
                var qobj = Q(this);
                // Remove margin from position (margin not relevant).
                for (var prop in pos)
                    pos[prop] = (pos[prop] - (parseFloat(qobj.css(prop)))) + "px";
                // Check if position should be changed
                if (qobj.css("position") === "static")
                    pos.position = "absolute";
                if (!pos.top || !pos.left)
                    qobj.css(pos);
            });
            return this;
        },
        /**
         * Gets/sets position of Q elements relative to parent elements
         */
        position: function(pos) {
            // Get position
            if (!pos)
                return {
                    top: this[0].offsetTop,
                    left: this[0].offsetLeft,
                    bottom: this[0].offsetTop + this[0].offsetHeight,
                    right: this[0].offsetLeft + this[0].offsetWidth
                };
            // Set position
            for (var prop in pos) {
                if (pos[prop])
                    delete pos[prop];
                else
                    pos[prop] += "px";
            }
            this.css(pos);
            return this;
        },
        //</editor-fold>

        //<editor-fold desc="Attribute Manipulation">
        /**
         * Gets the first Q elements attribute or sets all Q elements attributes
         * @param attr {string} Attribute name or object
         * @param value {*} Attribute value. Only if attr is a string
         * @returns {Q|string} Attribute value or this Q object
         */
        attr: function(attr, value) {
            // If attr is a string
            if (typeof attr === "string") {
                // If value is defined. Set value
                if (value) {
                    var obj = {};
                    obj[attr] = value;
                    attr = obj;
                }
                // Get attribute
                else
                    return this[0].getAttribute(attr);
            }
            // Set values
            for (var prop in attr) {
                this.each(function() {
                    if (prop in attr)
                        this.setAttribute(prop, attr[prop]);
                });
            }
            return this;
        },
        /**
         * Removes all Q elements attribute with the attribute name
         * @param attr {string} Attribute name
         * @returns {Q} This Q object
         */
        removeAttr: function(attr) {
            if (typeof attr !== "string")
                throw "Parameter 'attr' invalid";
            var attrs = attr.split(" ");
            this.each(function() {
                for (var i = 0; i < attrs.length; i++) {
                    if (this.hasAttribute(attrs[i]))
                        this.removeAttribute(attrs[i]);
                }
            });
            return this;
        },
        /**
         * Checks if the first Q elements has an attribute(s)
         * @param attr {string} Attribute name
         * @returns {boolean} True or False
         */
        hasAttr: function(attr) {
            if (typeof attr !== "string")
                throw "Parameter 'attr' invalid";
            var attrs = attr.split(" ");
            for (var i = 0; i < attrs.length; i++) {
                if (this[0].hasAttribute(attrs[i]))
                    return true;
            }
            return false;
        },
        /**
         * Adds a class by class name or from a key value pair object.
         * @param className {string|Object} Class name or object
         * @returns {Q}
         */
        addClass: function(className) {
            if (typeof className !== "string")
                throw "Parameter invalid in 'addClass'. parameter 'className' is not a string.";
            var classNames = className.split(" ");
            this.each(function() {
                var classes = this.className.split(" ");
                // Check if we should loop
                if (classes.length < 1 || classNames.length < 1)
                    return;
                // Add every entry in Q elements
                for (var i = 0; i < classNames.length; i++) {
                    for (var n = 0; n < classes.length; n++) {
                        if (classNames[i] !== classes[n] && n === (classes.length - 1)) {
                            classes.push(classNames[i]);
                            break;
                        }
                    }
                }
                this.className = classes.join(" ").trim();
            });
            return this;
        },
        /**
         * Removes a class/classes from a set of classes
         * @param className {string} Class/classes to remove
         */
        removeClass: function(className) {
            if (typeof className !== "string")
                throw "Parameter invalid in 'removeClass'. parameter 'className' is not a string.";
            var classNames = className.split(" ");
            this.each(function() {
                var classes = this.className.split(" ");
                // Remove every entry in Q elements
                for (var i = 0; i < classNames.length; i++) {
                    for (var n = 0; n < classes.length; n++) {
                        if (classNames[i] == classes[n])
                            classes.splice(n, 1);
                    }
                }
                this.className = classes.join(" ");
            });
            return this;
        },
        /**
         * Checks if the first Q element has a class or a set of classes
         * @param className {string} Class/classes to search for
         * @returns {boolean} True or False
         */
        hasClass: function(className) {
            if (typeof className !== "string")
                return false;
            var classNames = className.split(" ");
            for (var i = 0; i < classNames.length; i++) {
                var classList = this[0].className.split(" ");
                for (var n = 0; n < classList.length; n++) {
                    if (classNames[i] == classList[n])
                        return true;
                }
            }
            return false;
        },
        /**
         * Get/Set data attributes
         * @param name {string|*} Name of attribute to get/set or object with properties to set.
         * @param value {number|boolean|} Value to set. Only if 'name' is string.
         */
        data: function(name, value) {
            // If name is a string
            if (typeof name === "string") {
                // If value is defined. Set value
                if (value) {
                    var obj = {};
                    obj[name] = value;
                    name = obj;
                }
                else {
                    value = this[0].getAttribute("data-" + name);
                    // Parse value
                    if (Q.isNumber(value))
                        value = parseFloat(value);
                    else if (value == "true")
                        value = true;
                    else if (value == "false")
                        value = false;
                    return value;
                }
            }
            // Set values
            for (var prop in name) {
                this.each(function() {
                    if (prop in name)
                        this.setAttribute("data-" + prop, name[prop]);
                });
            }
            return this;
        },
        /**
         * Removes a data attribute
         * @param name {string} Data to remove
         */
        removeData: function(name) {
            if (typeof name !== "string")
                throw "Parameter 'name' invalid";
            name = "data-" + name;
            this.each(function() {
                if (this.hasAttribute(name))
                    this.removeAttribute(name);
            });
            return this;
        },
        /**
         * Checks if the first Q element has data or a set of data
         * @param name {string} Data to check
         * @returns {boolean} True or False
         */
        hasData: function(name) {
            if (typeof name !== "string")
                throw "Parameter 'name' invalid";
            var names = name.split(" ");
            for (var i = 0; i < names.length; i++) {
                if (this[0].hasAttribute("data-" + names[i]))
                    return true;
            }
            return false;
        }
        //</editor-fold>
        //</editor-fold>
    };

    var lastEvent;

    //<editor-fold desc="Functions">
    // Attach QLib alias "Q" to window
    // If jquery is unavailable add it there too
    if (!window.$)
        window.$ = window.jQuery = Q;
    if (!window.Q)
        window.Q = Q;
    else
        throw "Could not define QLib. Global variables are already defined.";

    // Polyfills by Mozilla
    if (!Element.prototype.matches) {
        Element.prototype.matches = (Element.prototype.matchesSelector || Element.prototype.webkitMatchesSelector ||
        Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || function(selector) {
            var matches = (this.document || this.ownerDocument).querySelectorAll(selector), i = 0;
            while (matches[i] && matches[i] !== this)
                i++;
            return matches[i] ? true : false;
        });
    }
    // Private functions
    function getStyle(elem) {
        if (elem.ownerDocument.defaultView.opener)
            return elem.ownerDocument.defaultView.getComputedStyle(elem, null);
        return window.getComputedStyle(elem, null);
    }
    function camelCase(s) {
        s = s == "float" ? "cssFloat" : s;
        return s.replace(/(\-[a-z])/g, function(c) {
            return c.toUpperCase().replace("-", "");
        });
    }
    //</editor-fold>
})();