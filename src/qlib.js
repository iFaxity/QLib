/* QLib the modern compressed Javascript framework for Web developers
 Copyright CodeCubed 2015. Created by Faxity, maintained by CodeCubed*/
(function() {
    "use strict";
    // Support check
    if(!document.querySelector || !window.addEventListener)
        throw "This browser does not support QLib. Please use Chrome or Firefox.";

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
    Q.version = "0.3.1";
    /**
     * Sends an AJAX request to the requested URL
     * @param obj {string|Object|FormData} Settings object to apply
     */
    Q.ajax = function(obj) {
        var settings = {
            url: "",
            method: "POST",
            async: true,
            data: null,
            user: "",
            password: "",
            success: null,
            error: null
        }, sendData = false, request = new XMLHttpRequest();

        // Override default settings
        for(var key in obj) {
            if(obj.hasOwnProperty(key) && settings.hasOwnProperty(key))
                settings[key] = obj[key];
        }

        // Parse data
        if(typeof settings["data"] != "undefined" && settings["data"] != null) {
            if(typeof settings["data"] != "string" && !(settings["data"] instanceof FormData)) {
                var list = [];
                for(var prop in settings["data"]) {
                    if(settings["data"].hasOwnProperty(prop))
                        list.push(encodeURIComponent(prop) + "=" + encodeURIComponent(settings["data"][prop]));
                }
                settings["data"] = list.join("&");
            }
            sendData = true;
        }

        // If GET append query to url
        if(sendData == true && settings["method"].toUpperCase() != "POST")
            settings["url"] += "?" + settings["data"];

        // Open the AJAX request
        request.open(settings["method"].toUpperCase(), settings["url"], settings["async"], settings["user"], settings["password"]);
        request.onreadystatechange = function() {
            if (request.readyState != 4) return;

            if(request.status == 200 && typeof settings["success"] == "function")
                settings["success"](request.responseText);
            else if(typeof settings["error"] == "function")
                settings["error"](request.status, request.statusText);
        };

        // If POST then url encode the data then send
        if(sendData == true && settings["method"].toUpperCase() == "POST") {
            request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            request.send(settings["data"]);
        }
        else
            request.send();
    };
    /**
     * Gets a parsed JSON from an url
     * @param url {string} URL to get json from.
     * @param callback {function} Callback to run when JSON has been loaded and parsed.
     * @param data {string|Object|FormData} Data to send to server.
     */
    Q.getJSON = function(url, callback, data) {
        if(typeof url == "undefined" && typeof callback == "undefined")
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
        if(typeof url == "undefined" && typeof callback == "undefined")
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
    /**
     * Checks if the specified object is a Number
     * @param value {*} Object to check
     * @returns {boolean} True or False
     */
    Q.isNumber = function(value) {
        var x;
        if (isNaN(value))
            return false;
        x = parseFloat(value);
        return (x | 0) === x;
    };
    /**
     * Checks if the specified object is an HTMLNode
     * @param node {*} Object to check
     * @returns {boolean} True or False
     */
    Q.isNode = function(node) {
        return (typeof node != "undefined" && node && node.nodeType) ? true : false;
    };
    /**
     * Used to extend multiple functions to QLib
     * @param obj {Object} An object with extensions in a key value pair.
     */
    Q.extend = function(obj) {
        for(var key in obj) {
            if(obj.hasOwnProperty(key) && typeof obj[key] == "function")
                QLib.prototype[key] = obj[key];
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
     * QLib main object
     * @param selector {string|Element|NodeList} CSS selector as string or HTML element(s)
     * @returns {QLib}
     */
    var QLib = function(selector) {
        // Convert the selector into a Node.
        state:
            // If selector is undefined
            if(typeof selector === "undefined")
                selector = [];
            // If selector is a string
            else if(typeof selector == "string") {
                // Create new element
                if(selector.indexOf("<") == 0) {
                    var end = selector.indexOf(">"), min = end;
                    // Check if attributes are specified
                    if(selector.includes(" ") === true)
                        min = Math.min(end, selector.indexOf(" "));
                    // Create the element
                    var elem = document.createElement(selector.substring(1, min));
                    // Sets attributes
                    if(selector.substring(0, end).includes(" ") === true) {
                        var attrs = selector.substring(min + 1, end).replace(/'/g, "'").split("' ");
                        // Set all attributes
                        for(var i = 0; i < attrs.length; i++) {
                            var attr = attrs[i].split("=");
                            elem.setAttribute(attr[0], attr[1].replace(/'/g, ""));
                        }
                    }
                    // Sets the inner content
                    elem.innerHTML = selector.substring(selector.indexOf(">") + 1, selector.lastIndexOf("</"));
                    selector = [elem];
                }
                else // Selector is a css string selector
                    selector = document.querySelectorAll(selector);
            }
            // If selector is a node or the window
            else if(selector.nodeType || selector.window)
                selector = [selector];
            // If selector is an array of nodes
            else if(selector.length && Q.isNumber(selector.length))
                break state;
            // Unknown selector object
            else
                selector = [];

        // Iterate all selector matches
        this.length = selector.length;
        var length = selector.length;
        while(length--)
            this[length] = selector[length];

        this.events = {};
        // Return QLib object
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
    Q.ex = QLib.prototype = {
        //<editor-fold desc="Traversing">
        /**
         * Gets the first Q nodes from this object
         * @returns {Q}
         */
        first: function() {
            return Q(this[0]);
        },
        /**
         * Gets child elements from the first Q node
         * @param selector {string} CSS Selector
         */
        children: function(selector) {
            var nodes = [], callback;
            // Get children with the selector (if it's defined)
            if(typeof selector !== "string")
                selector = "*";
            // Iterate all Q nodes
            this.each(function() {
                var children = this.childNodes;
                for(var i = 0; i < children.length; i++) {
                    if(children[i].nodeType == 1 && children[i].matches(selector))
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
                callback = function () {
                    for (var sibling = this.parentNode.firstChild; sibling; sibling = sibling.nextSibling) {
                        if (sibling.nodeType == 1 && sibling != this && sibling.matches(selector))
                            nodes.push(sibling);
                    }
                };
            else
                callback = function () {
                    for (var sibling = this.parentNode.firstChild; sibling; sibling = sibling.nextSibling) {
                        if (sibling.nodeType == 1 && sibling != this)
                            nodes.push(sibling);
                    }
                };
            // Iterate all Q nodes
            this.each(callback);
            // Return all matched nodes
            return Q(nodes.length > 0 ? undefined : null);
        },
        /**
         * Gets the first parent of all Q nodes
         */
        parent: function() {
            var nodes = [];
            this.each(function() {
                if(!nodes.indexOf(this.parentNode) !== -1 && typeof this.parentNode !== "undefined")
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
            if(typeof selector !== "string")
                selector = "*";
            this.each(function() {
                var parent = this.parentNode;
                while(true) {
                    if(parent == document)
                        break;
                    // If parent already exists then don't add it and continue.
                    else if(nodes.indexOf(parent) === -1 && typeof parent !== "undefined" && parent.matches(selector))
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
            if(typeof selector === "undefined")
                selector = "*";
            this.each(function() {
                var parent = this.parentNode;
                while(true) {
                    // If selector matches then end loop. Or if element is the documentElement
                    if(parent == doc || parent.matches(selector))
                        break;
                    // If parent already exists then don't add it and continue.
                    if(!nodes.indexOf(parent) !== -1 && typeof parent != "undefined")
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
            if(!Q.isNumber(index))
                throw "Parameter invalid in 'eq'. parameter 'index' has to be an integer";
            // If count is not an integer then set it to 1 (default)
            if(!Q.isNumber(count))
                count = 1;
            else if(count < 0) // If less than 0 get maximum value
                count = this.length - index;

            // Search for all the nodes
            var nodes = [];
            while(index < Math.min(index + count, this.length)) {
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
            while(i < this.length) {
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
            if(typeof selector != "string")
                throw "Parameter invalid in 'find'. parameter 'selector' is not a string.";
            var nodes = [];
            // Iterate all Q nodes
            this.each(function() {
                var nodeList = this.querySelectorAll(selector);
                for(var i = 0; i < nodeList.length; i++)
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
            if(typeof selector === "string") {
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
        on: function(eventType, selector, callback) {
            var handler;
            if(typeof eventType !== "string")
                throw "Parameter invalid in 'on'. Parameter 'eventType' has to be a string.";

            // Get all event types and add them all
            var types = eventType.split(" ");
            for(var i = 0; i < types.length; i++) {
                var type = types[i];
                // If selector is defined
                if (typeof selector == "string" && typeof callback == "function") {
                    handler = function (e) {
                        var target = e.target;
                        for (; target && target != this; target = target.parentNode) {
                            // Loop parent nodes from the target to the delegation elements
                            if (target.matches(selector)) {
                                callback.call(target, e);
                                break;
                            }
                        }
                    };
                }
                // Regular event (selector is function callback)
                else if (typeof selector == "function")
                    handler = selector;
                // Error
                else
                    throw "Parameter invalid in 'on'. Parameter 'selector' has to be defined.";

                // Add listener to all elements in this object
                this.each(function() {
                    if(this.addEventListener)
                        this.addEventListener(type, handler, false);
                });
                // Add event handler
                if(typeof this.events[eventType] === "undefined")
                    this.events[eventType] = [];
                this.events[eventType].push(handler);
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
            return this;
            /*var dynamic;
             // Check for method overloading
             if (typeof selector === "string" && typeof callback === "function")
             dynamic = true;
             else if (typeof selector === "function")
             dynamic = false;
             else
             throw "Parameter invalid in 'off'. Parameter 'selector' has to be defined.";
             // Add event to all events
             var qobj = this, types = eventType.split(" ");
             for(var i = 0; i < types.length; i++) {
             var type = types[i], handler = function(e) {
             // Call event
             callback.call(this, e);
             // Remove event
             if(this.removeEventListener)
             this.removeEventListener(type, handler);
             };
             // Add event
             if(dynamic)
             qobj.on(type, selector, handler);
             else
             qobj.on(type, selector);
             }
             return qobj;*/
        },
        /**
         * Removes an 'on' event
         * @param eventType {string} Name of event
         */
        off: function(eventType) {
            if(typeof eventType !== "string")
                throw "Parameter invalid in 'off'. Parameter 'eventType' has to be a string.";

            // Get all event types and add them all
            var types = eventType.split(" ");
            for(var i = 0; i < types.length; i++) {
                var type = types[i];
                var list = this.events[type];

                if(this.events.hasOwnProperty(type) && list.length && list.length > 0) {
                    var handler = list[list.length - 1];
                    // Remove listener to all elements in this object
                    this.each(function () {
                        if(this.removeEventListener)
                            this.removeEventListener(type, handler, false);
                    });
                    // Remove handler from events array
                    this.events[type].splice(list.length - 1, 1);
                }
            }
            return this;
        },
        /**
         * Trigger event the first Q node
         * @param eventType {string} Event type name
         */
        trigger: function(eventType) {
            if(typeof eventType !== "string")
                throw "Parameter Invalid in 'trigger'. Parameter 'eventType' has to be a string.";
            else if(this.length > 0) {
                var event;
                // Initialize event
                if(typeof window.Event === "function")
                    event = new Event(eventType, {"bubbles": true, "cancelable": true});
                // Leagacy support
                else if(document.createEvent) {
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
            if(typeof text == "string") {
                this.each(function() {
                    if(typeof this.textContent !== "undefined")
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
            if(typeof html == "string") {
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
            if(typeof html != "string") {
                if (html instanceof QLib)
                    html = html[0];
                if (html.nodeType) {
                    var node = html;
                    callback = function(i) {
                        if (i != 0)
                            node = node.cloneNode(true);
                        this.appendChild(node);
                    };
                }
            }
            else
                callback = function() { this.insertAdjacentHTML("beforeEnd", html); };

            if(typeof callback == "function")
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
            if(typeof html != "string") {
                if (html instanceof QLib)
                    html = html[0];
                if (html.nodeType) {
                    var node = html;
                    callback = function(i) {
                        if (i != 0)
                            node = node.cloneNode(true);
                        this.insertBefore(node, this.firstChild);
                    };
                }
            }
            else
                callback = function() { this.insertAdjacentHTML("afterBegin", html); };

            if(typeof callback == "function")
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
            if(typeof html != "string") {
                if (html instanceof QLib)
                    html = html[0];
                if (html.nodeType) {
                    var node = html;
                    callback = function(i) {
                        if (i != 0)
                            node = node.cloneNode(true);
                        this.parentNode.insertBefore(node, this);
                    };
                }
            }
            else
                callback = function() { this.insertAdjacentHTML("beforeBegin", html); };

            if(typeof callback == "function")
                this.each(callback);
            else
                throw "Parameter 'html' invalid";
            return this;
        },
        /**
         * Inserts content after all Q nodes
         * @param html
         * @returns {QLib}
         */
        after: function(html) {
            var callback;
            if(typeof html != "string") {
                if (html instanceof QLib)
                    html = html[0];
                if (html.nodeType) {
                    var node = html;
                    callback = function(i) {
                        if (i != 0)
                            node = node.cloneNode(true);
                        this.parentNode.insertBefore(node, this.nextSibling);
                    };
                }
            }
            else
                callback = function() { this.insertAdjacentHTML("afterEnd", html); };

            if(typeof callback == "function")
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
                while(node.firstChild)
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
            if(typeof value === "undefined") {
                var elem = this[0];
                if(elem.nodeName !== "input")
                    return "";
                else if(elem.type === "checkbox" || elem.type === "radio")
                    return elem.checked;
                else
                    return elem.value;
            }
            // Set value
            this.each(function() {
                if(this.nodeName === "input") {
                    if(this.type === "checkbox" || this.type === "radio")
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
                //var node = this;
                if(this.parentNode)
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
            if(typeof deep !== "boolean")
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
            if(typeof name === "undefined")
                throw "Parameter invalid in 'css'. Parameter 'name' is undefined.";

            // If getting a value or setting one.
            if(typeof name === "string") {
                // Set a value
                if(typeof val !== "undefined") {
                    var obj = {};
                    obj[name] = val;
                    name = obj;
                }
                // Get value
                else
                    return window.getComputedStyle(this[0], null)[name];
            }
            // If obj is an object then set values
            for(var prop in name) {
                this.each(function() {
                    if(this.style.hasOwnProperty(prop))
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
            if(typeof value === "undefined")
                value = false;
            // Get Value
            if(typeof value === "boolean") {
                var off = this[0].offsetHeight;
                if (value === true)
                    off += parseInt(this[0].style.marginTop) + parseInt(this[0].marginBottom);
                return off;
            }
            // Set value
            var height = (value - (this.offsetHeight - this.clientHeight)) + "px";
            this.each(function() {
                this.style.height = height;
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
            if(typeof value === "undefined")
                value = false;
            // Get Value
            if(typeof value === "boolean") {
                var off = this[0].offsetWidth;
                if (value === true)
                    off += parseInt(this[0].style.marginLeft) + parseInt(this[0].style.marginRight);
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
            // Set position
            if(typeof pos !== "undefined") {
                this.each(function() {
                    var qobj = Q(this), margin = {
                        top: parseInt(qobj.css("marginTop")),
                        left: parseInt(qobj.css("marginLeft"))
                    };

                    // Check if parsing succeeds
                    for(var prop in margin) {
                        if(!Q.isNumber(margin[prop]))
                            margin[prop] = 0;
                    }
                    // Remove margin from position (margin not relevant). NOT FOR IE8
                    for(prop in pos) {
                        if(pos.hasOwnProperty(prop) && margin.hasOwnProperty(prop))
                            pos[prop] = (pos[prop] - margin[prop]) + "px";
                    }
                    // Check if position should be changed
                    if(qobj.css("position") === "static")
                        pos["position"] = "absolute";
                    if(pos.hasOwnProperty("top") || pos.hasOwnProperty("left"))
                        qobj.css(pos);
                });
                return this;
            }
            // Get position
            pos = this[0].getBoundingClientRect();
            return {
                top:  pos["top"],
                left: pos["left"]
            };
        },
        /**
         * Gets/sets position of Q elements relative to parent elements
         */
        position: function(pos) {
            // Set position
            if(typeof pos !== "undefined") {
                for(var prop in pos) {
                    if(typeof pos[prop] !== "undefined")
                        delete pos[prop];
                    else
                        pos[prop] += "px";
                }
                this.css(pos);
                return this;
            }
            // Get position
            return {
                top:    this[0].offsetTop,
                left:   this[0].offsetLeft,
                bottom: this[0].offsetTop + this[0].offsetHeight,
                right:  this[0].offsetLeft + this[0].offsetWidth
            };
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
            if(typeof attr === "string") {
                // If value is defined. Set value
                if(typeof value !== "undefined") {
                    var obj = {};
                    obj[attr] = value;
                    attr = obj;
                }
                // Get attribute
                else
                    return this[0].getAttribute(attr);
            }
            // Set values
            for(var prop in attr) {
                this.each(function() {
                    if(attr.hasOwnProperty(prop))
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
            if(typeof attr !== "string")
                throw "Parameter 'attr' invalid";
            var attrs = attr.split(" ");
            this.each(function() {
                for(var i = 0; i < attrs.length; i++) {
                    if(this.hasAttribute(attrs[i]))
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
            if(typeof attr !== "string")
                throw "Parameter 'attr' invalid";
            var attrs = attr.split(" ");
            for(var i = 0; i < attrs.length; i++) {
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
            if(typeof className !== "string")
                throw "Parameter invalid in 'addClass'. parameter 'className' is not a string.";
            var classNames = className.split(" ");
            this.each(function() {
                var classes = this.className.split(" ");
                // Check if we should loop
                if(classes.length < 1 || classNames.length < 1)
                    return;
                // Add every entry in Q elements
                for(var i = 0; i < classNames.length; i++) {
                    for(var n = 0; n < classes.length; n++) {
                        if(classNames[i] !== classes[n] && n === (classes.length - 1)) {
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
            if(typeof className !== "string")
                throw "Parameter invalid in 'removeClass'. parameter 'className' is not a string.";
            var classNames = className.split(" ");
            this.each(function() {
                var classes = this.className.split(" ");
                // Remove every entry in Q elements
                for(var i = 0; i < classNames.length; i++) {
                    for(var n = 0; n < classes.length; n++) {
                        if(classNames[i] == classes[n])
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
            if(typeof className !== "string")
                return false;
            var classNames = className.split(" ");
            for(var i = 0; i < classNames.length; i++) {
                var classList = this[0].className.split(" ");
                for(var n = 0; n < classList.length; n++) {
                    if (classNames[i] == classList[n])
                        return true;
                }
            }
        },
        /**
         * Get/Set data attributes
         * @param name {string|*} Name of attribute to get/set or object with properties to set.
         * @param value {number|boolean|} Value to set. Only if 'name' is string.
         */
        data: function(name, value) {
            // If name is a string
            if(typeof name === "string") {
                // If value is defined. Set value
                if(typeof value !== "undefined") {
                    var obj = {};
                    obj[name] = value;
                    name = obj;
                }
                else {
                    value = this[0].getAttribute("data-" + name);
                    // Parse value
                    if(Q.isNumber(value))
                        value = parseFloat(value);
                    else if(value == "true")
                        value = true;
                    else if(value == "false")
                        value = false;
                    return value;
                }
            }
            // Set values
            for(var prop in name) {
                this.each(function() {
                    if(name.hasOwnProperty(prop))
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
            if(typeof name !== "string")
                throw "Parameter 'name' invalid";
            name = "data-" + name;
            this.each(function() {
                if(this.hasAttribute(name))
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
            if(typeof name !== "string")
                throw "Parameter 'name' invalid";
            var names = name.split(" ");
            for(var i = 0; i < names.length; i++) {
                if (this[0].hasAttribute("data-" + names[i]))
                    return true;
            }
            return false;
        }
        //</editor-fold>
        //</editor-fold>
    };

    //<editor-fold desc="Polyfillls">
    // Attach QLib alias "Q" to window
    if(!window.Q)
        window.Q = Q;

    // Polyfills by Mozilla
    if(!Element.prototype.matches) {
        Element.prototype.matches = (Element.prototype.matchesSelector || Element.prototype.webkitMatchesSelector ||
        Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || function(selector) {
            var matches = (this.document || this.ownerDocument).querySelectorAll(selector), i = 0;
            while (matches[i] && matches[i] !== this)
                i++;
            return matches[i] ? true : false;
        });
    }
    if(!String.prototype.includes) {
        String.prototype.includes = (String.prototype.contains || function() {
            return String.prototype.indexOf.apply(this, arguments) !== -1;
        });
    }
    //</editor-fold>
})();