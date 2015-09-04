/**
 * Just a test on how to extend the QLib object
 * This gets, sets & checks if cookies exists. In no less than 65 lines.
 * Created by Christian on 2015-06-24.
 */

// QLib Cookie extension
(function() {
    if(!window.$)
        throw "QLib not available. Initialize QLib before its plugins.";
    else if(navigator.cookieEnabled != true)
        throw "QLib cookie extension not available. This browser has cookies disabled.";

    function parse(value) {
        var low = value.toLowerCase();
        if(Q.isNumber(value))
            value = parseFloat(value);
        else if(low == "true")
            value = true;
        else if(low == "false")
            value = false;
        return value;
    }

    // Load all cookies
    var cookies = {};
    if(document.cookie.length > 1) {
        var string = document.cookie.replace(/\s/g, "").split(";");
        for(var i = 0; i < string.length; i++) {
            var pair = decodeURIComponent(string[i]).split("=");
            cookies[pair[0]] = (function(val) {
                // Check if str is a number (float or int)
                if(Q.isNumber(val))
                    return parseFloat(val);

                // Check if str is a boolean
                if(val.toLowerCase() == "true")
                    return true;
                else if(val.toLowerCase() == "false")
                    return false;

                // Return the original string
                return val;
            })(pair[1]);
        }
    }

    $.cookie = function(name, value, expires) {
        // Get cookie
        if(typeof name == "string") {
            if(value == undefined && Q.hasCookie(name))
                return cookie[name];
            else if(value != undefined)
                name = {name: value};
        }

        if(typeof name === "string" && value == undefined && Q.hasCookie(name))
            return cookies[name];
        else if (typeof name === "string" && value != undefined)
            name = {name: value};

        // Set cookie
        for(var prop in name) {
            if(name[prop] !== undefined)
                cookies[prop] = name[prop];
        }

        // Save cookies
        var cookieString = "";
        for(var key in cookies) {
            if(cookies[key] != undefined)
                cookieString += encodeURIComponent(key) + "=" + encodeURIComponent(cookies[key]) + ";";
        }
        document.cookie = cookieString;
    };
    $.hasCookie = function(name) {
        if(typeof name != "string")
            throw "Parameter Invalid in 'hasCookie'. Parameter 'name' needs to be a string.";

        var names = name.split(" ");
        for(var i = 0; i < names.length; i++) {
            if(!cookies[names[i]])
                return false;
        }
        return true;
    };
    $.removeCookie = function(name) {
        var cookie;
        if(cookie = cookies[name])
            cookies[name].expires = "Thu, 01-Jan-1970 00:00:00 GMT";
    };

    /*w3schools cookie example
    function setCookie(c_name,value,exdays) {
        var exdate=new Date();
        exdate.setDate(exdate.getDate() + exdays);
        var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
        document.cookie=c_name + "=" + c_value;
    }


    // this deletes the cookie when called
    function Delete_Cookie(c_name) {
        if ( getCookie( c_name ) ) setCookie(c_name, "", "Thu, 01-Jan-1970 00:00:01 GMT");
        alert(getCookie( c_name ));
    }


    function getCookie(c_name) {
        var i,x,y,ARRcookies=document.cookie.split(";");
        for (i=0;i<ARRcookies.length;i++)
        {
            x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
            y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
            x=x.replace(/^\s+|\s+$/g,"");
            if (x==c_name)
            {
                return unescape(y);
            }
        }
    }*/
})();

// Animate CSS extension. CSS file by Daniel Eden. Link: https://daneden.github.io/animate.css/
(function() {
    if(!window.$)
        throw "QLib not available. Initialize QLib before its plugins.";

    // Add animate.css stylesheet
    var head = Q("head");
    head.append("<link rel='stylesheet' href='/ext/animate.css'>");

    // Handles animations
    var anim = function(animName) {
        this.each(function() {
            var elem = $(this);

            if(elem.hasAttr("data-anim"))
                elem.removeClass(elem.attr("data-anim"));

            elem.addClass("animated " + animName);
            elem.attr("data-anim", animName);
        });
    };

    // Add prototype extensions
    $.extend({
        fadeIn: function() {
            anim.call(this, "fadeIn");
        },
        fadeOut: function() {
            anim.call(this, "fadeOut");
        },
        animate: function(animName) {
            if(typeof animName == "string")
                anim.call(this, animName);
        }
    });
})();

// Bootstrap JS file in QLib
(function() {
    // Dropdown
    Q(".dropdown").on("click", "button, li", function() {
        var elem = Q(this);
        var parent = elem.parent();

        // Event for toggle dropdown
        if(elem.hasClass("dropdown-toggle")) {
            var result = parent.hasClass("open");

            if(result)
                parent.removeClass("open");
            else
                parent.addClass("open");
            elem.attr("aria-expanded", !result);
        }
        // Event for dropdown item list
        else {
            // Remove actives and set the current one to active
            elem.siblings("li.active").removeClass("active");
            elem.addClass("active");
            // Close Dropdown
            elem.parents(".dropdown").find("button").trigger("click");
        }
    });

    // Modal
    var backdrop = Q("div").addClass("modal-backdrop fade in");
    Q("[data-toggle='modal']").on("click", function() {
        var me = Q(this), target = me.data("target");

        Q(target).addClass("in").css("display", "block");
        document.body.appendChild();


    });
})();
