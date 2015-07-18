/*! abcjs v2.1 Copyright © 2009-2015 Paul Rosen and Gregory Dyke (http://abcjs.net) */// ┌────────────────────────────────────────────────────────────────────┐ \\
// │ Raphaël 2.1.2 - JavaScript Vector Library                          │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright © 2008-2012 Dmitry Baranovskiy (http://raphaeljs.com)    │ \\
// │ Copyright © 2008-2012 Sencha Labs (http://sencha.com)              │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Licensed under the MIT (http://raphaeljs.com/license.html) license.│ \\
// └────────────────────────────────────────────────────────────────────┘ \\
// Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
// http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// ┌────────────────────────────────────────────────────────────┐ \\
// │ Eve 0.4.2 - JavaScript Events Library                      │ \\
// ├────────────────────────────────────────────────────────────┤ \\
// │ Author Dmitry Baranovskiy (http://dmitry.baranovskiy.com/) │ \\
// └────────────────────────────────────────────────────────────┘ \\

(function (glob) {
    var version = "0.4.2",
        has = "hasOwnProperty",
        separator = /[\.\/]/,
        wildcard = "*",
        fun = function () {},
        numsort = function (a, b) {
            return a - b;
        },
        current_event,
        stop,
        events = {n: {}},
    /*\
     * eve
     [ method ]

     * Fires event with given `name`, given scope and other parameters.

     > Arguments

     - name (string) name of the *event*, dot (`.`) or slash (`/`) separated
     - scope (object) context for the event handlers
     - varargs (...) the rest of arguments will be sent to event handlers

     = (object) array of returned values from the listeners
    \*/
        eve = function (name, scope) {
			name = String(name);
            var e = events,
                oldstop = stop,
                args = Array.prototype.slice.call(arguments, 2),
                listeners = eve.listeners(name),
                z = 0,
                f = false,
                l,
                indexed = [],
                queue = {},
                out = [],
                ce = current_event,
                errors = [];
            current_event = name;
            stop = 0;
            for (var i = 0, ii = listeners.length; i < ii; i++) if ("zIndex" in listeners[i]) {
                indexed.push(listeners[i].zIndex);
                if (listeners[i].zIndex < 0) {
                    queue[listeners[i].zIndex] = listeners[i];
                }
            }
            indexed.sort(numsort);
            while (indexed[z] < 0) {
                l = queue[indexed[z++]];
                out.push(l.apply(scope, args));
                if (stop) {
                    stop = oldstop;
                    return out;
                }
            }
            for (i = 0; i < ii; i++) {
                l = listeners[i];
                if ("zIndex" in l) {
                    if (l.zIndex == indexed[z]) {
                        out.push(l.apply(scope, args));
                        if (stop) {
                            break;
                        }
                        do {
                            z++;
                            l = queue[indexed[z]];
                            l && out.push(l.apply(scope, args));
                            if (stop) {
                                break;
                            }
                        } while (l)
                    } else {
                        queue[l.zIndex] = l;
                    }
                } else {
                    out.push(l.apply(scope, args));
                    if (stop) {
                        break;
                    }
                }
            }
            stop = oldstop;
            current_event = ce;
            return out.length ? out : null;
        };
		// Undocumented. Debug only.
		eve._events = events;
    /*\
     * eve.listeners
     [ method ]

     * Internal method which gives you array of all event handlers that will be triggered by the given `name`.

     > Arguments

     - name (string) name of the event, dot (`.`) or slash (`/`) separated

     = (array) array of event handlers
    \*/
    eve.listeners = function (name) {
        var names = name.split(separator),
            e = events,
            item,
            items,
            k,
            i,
            ii,
            j,
            jj,
            nes,
            es = [e],
            out = [];
        for (i = 0, ii = names.length; i < ii; i++) {
            nes = [];
            for (j = 0, jj = es.length; j < jj; j++) {
                e = es[j].n;
                items = [e[names[i]], e[wildcard]];
                k = 2;
                while (k--) {
                    item = items[k];
                    if (item) {
                        nes.push(item);
                        out = out.concat(item.f || []);
                    }
                }
            }
            es = nes;
        }
        return out;
    };
    
    /*\
     * eve.on
     [ method ]
     **
     * Binds given event handler with a given name. You can use wildcards “`*`” for the names:
     | eve.on("*.under.*", f);
     | eve("mouse.under.floor"); // triggers f
     * Use @eve to trigger the listener.
     **
     > Arguments
     **
     - name (string) name of the event, dot (`.`) or slash (`/`) separated, with optional wildcards
     - f (function) event handler function
     **
     = (function) returned function accepts a single numeric parameter that represents z-index of the handler. It is an optional feature and only used when you need to ensure that some subset of handlers will be invoked in a given order, despite of the order of assignment. 
     > Example:
     | eve.on("mouse", eatIt)(2);
     | eve.on("mouse", scream);
     | eve.on("mouse", catchIt)(1);
     * This will ensure that `catchIt()` function will be called before `eatIt()`.
	 *
     * If you want to put your handler before non-indexed handlers, specify a negative value.
     * Note: I assume most of the time you don’t need to worry about z-index, but it’s nice to have this feature “just in case”.
    \*/
    eve.on = function (name, f) {
		name = String(name);
		if (typeof f != "function") {
			return function () {};
		}
        var names = name.split(separator),
            e = events;
        for (var i = 0, ii = names.length; i < ii; i++) {
            e = e.n;
            e = e.hasOwnProperty(names[i]) && e[names[i]] || (e[names[i]] = {n: {}});
        }
        e.f = e.f || [];
        for (i = 0, ii = e.f.length; i < ii; i++) if (e.f[i] == f) {
            return fun;
        }
        e.f.push(f);
        return function (zIndex) {
            if (+zIndex == +zIndex) {
                f.zIndex = +zIndex;
            }
        };
    };
    /*\
     * eve.f
     [ method ]
     **
     * Returns function that will fire given event with optional arguments.
	 * Arguments that will be passed to the result function will be also
	 * concated to the list of final arguments.
 	 | el.onclick = eve.f("click", 1, 2);
 	 | eve.on("click", function (a, b, c) {
 	 |     console.log(a, b, c); // 1, 2, [event object]
 	 | });
     > Arguments
	 - event (string) event name
	 - varargs (…) and any other arguments
	 = (function) possible event handler function
    \*/
	eve.f = function (event) {
		var attrs = [].slice.call(arguments, 1);
		return function () {
			eve.apply(null, [event, null].concat(attrs).concat([].slice.call(arguments, 0)));
		};
	};
    /*\
     * eve.stop
     [ method ]
     **
     * Is used inside an event handler to stop the event, preventing any subsequent listeners from firing.
    \*/
    eve.stop = function () {
        stop = 1;
    };
    /*\
     * eve.nt
     [ method ]
     **
     * Could be used inside event handler to figure out actual name of the event.
     **
     > Arguments
     **
     - subname (string) #optional subname of the event
     **
     = (string) name of the event, if `subname` is not specified
     * or
     = (boolean) `true`, if current event’s name contains `subname`
    \*/
    eve.nt = function (subname) {
        if (subname) {
            return new RegExp("(?:\\.|\\/|^)" + subname + "(?:\\.|\\/|$)").test(current_event);
        }
        return current_event;
    };
    /*\
     * eve.nts
     [ method ]
     **
     * Could be used inside event handler to figure out actual name of the event.
     **
     **
     = (array) names of the event
    \*/
    eve.nts = function () {
        return current_event.split(separator);
    };
    /*\
     * eve.off
     [ method ]
     **
     * Removes given function from the list of event listeners assigned to given name.
	 * If no arguments specified all the events will be cleared.
     **
     > Arguments
     **
     - name (string) name of the event, dot (`.`) or slash (`/`) separated, with optional wildcards
     - f (function) event handler function
    \*/
    /*\
     * eve.unbind
     [ method ]
     **
     * See @eve.off
    \*/
    eve.off = eve.unbind = function (name, f) {
		if (!name) {
		    eve._events = events = {n: {}};
			return;
		}
        var names = name.split(separator),
            e,
            key,
            splice,
            i, ii, j, jj,
            cur = [events];
        for (i = 0, ii = names.length; i < ii; i++) {
            for (j = 0; j < cur.length; j += splice.length - 2) {
                splice = [j, 1];
                e = cur[j].n;
                if (names[i] != wildcard) {
                    if (e[names[i]]) {
                        splice.push(e[names[i]]);
                    }
                } else {
                    for (key in e) if (e[has](key)) {
                        splice.push(e[key]);
                    }
                }
                cur.splice.apply(cur, splice);
            }
        }
        for (i = 0, ii = cur.length; i < ii; i++) {
            e = cur[i];
            while (e.n) {
                if (f) {
                    if (e.f) {
                        for (j = 0, jj = e.f.length; j < jj; j++) if (e.f[j] == f) {
                            e.f.splice(j, 1);
                            break;
                        }
                        !e.f.length && delete e.f;
                    }
                    for (key in e.n) if (e.n[has](key) && e.n[key].f) {
                        var funcs = e.n[key].f;
                        for (j = 0, jj = funcs.length; j < jj; j++) if (funcs[j] == f) {
                            funcs.splice(j, 1);
                            break;
                        }
                        !funcs.length && delete e.n[key].f;
                    }
                } else {
                    delete e.f;
                    for (key in e.n) if (e.n[has](key) && e.n[key].f) {
                        delete e.n[key].f;
                    }
                }
                e = e.n;
            }
        }
    };
    /*\
     * eve.once
     [ method ]
     **
     * Binds given event handler with a given name to only run once then unbind itself.
     | eve.once("login", f);
     | eve("login"); // triggers f
     | eve("login"); // no listeners
     * Use @eve to trigger the listener.
     **
     > Arguments
     **
     - name (string) name of the event, dot (`.`) or slash (`/`) separated, with optional wildcards
     - f (function) event handler function
     **
     = (function) same return function as @eve.on
    \*/
    eve.once = function (name, f) {
        var f2 = function () {
            eve.unbind(name, f2);
            return f.apply(this, arguments);
        };
        return eve.on(name, f2);
    };
    /*\
     * eve.version
     [ property (string) ]
     **
     * Current version of the library.
    \*/
    eve.version = version;
    eve.toString = function () {
        return "You are running Eve " + version;
    };
    (typeof module != "undefined" && module.exports) ? (module.exports = eve) : (typeof define != "undefined" ? (define("eve", [], function() { return eve; })) : (glob.eve = eve));
})(this);
// ┌─────────────────────────────────────────────────────────────────────┐ \\
// │ "Raphaël 2.1.2" - JavaScript Vector Library                         │ \\
// ├─────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright (c) 2008-2011 Dmitry Baranovskiy (http://raphaeljs.com)   │ \\
// │ Copyright (c) 2008-2011 Sencha Labs (http://sencha.com)             │ \\
// │ Licensed under the MIT (http://raphaeljs.com/license.html) license. │ \\
// └─────────────────────────────────────────────────────────────────────┘ \\

(function (glob, factory) {
    // AMD support
    if (typeof define === "function" && define.amd) {
        // Define as an anonymous module
        define(["eve"], function( eve ) {
            return factory(glob, eve);
        });
    } else {
        // Browser globals (glob is window)
        // Raphael adds itself to window
        factory(glob, glob.eve);
    }
}(this, function (window, eve) {
    /*\
     * Raphael
     [ method ]
     **
     * Creates a canvas object on which to draw.
     * You must do this first, as all future calls to drawing methods
     * from this instance will be bound to this canvas.
     > Parameters
     **
     - container (HTMLElement|string) DOM element or its ID which is going to be a parent for drawing surface
     - width (number)
     - height (number)
     - callback (function) #optional callback function which is going to be executed in the context of newly created paper
     * or
     - x (number)
     - y (number)
     - width (number)
     - height (number)
     - callback (function) #optional callback function which is going to be executed in the context of newly created paper
     * or
     - all (array) (first 3 or 4 elements in the array are equal to [containerID, width, height] or [x, y, width, height]. The rest are element descriptions in format {type: type, <attributes>}). See @Paper.add.
     - callback (function) #optional callback function which is going to be executed in the context of newly created paper
     * or
     - onReadyCallback (function) function that is going to be called on DOM ready event. You can also subscribe to this event via Eve’s “DOMLoad” event. In this case method returns `undefined`.
     = (object) @Paper
     > Usage
     | // Each of the following examples create a canvas
     | // that is 320px wide by 200px high.
     | // Canvas is created at the viewport’s 10,50 coordinate.
     | var paper = Raphael(10, 50, 320, 200);
     | // Canvas is created at the top left corner of the #notepad element
     | // (or its top right corner in dir="rtl" elements)
     | var paper = Raphael(document.getElementById("notepad"), 320, 200);
     | // Same as above
     | var paper = Raphael("notepad", 320, 200);
     | // Image dump
     | var set = Raphael(["notepad", 320, 200, {
     |     type: "rect",
     |     x: 10,
     |     y: 10,
     |     width: 25,
     |     height: 25,
     |     stroke: "#f00"
     | }, {
     |     type: "text",
     |     x: 30,
     |     y: 40,
     |     text: "Dump"
     | }]);
    \*/
    function R(first) {
        if (R.is(first, "function")) {
            return loaded ? first() : eve.on("raphael.DOMload", first);
        } else if (R.is(first, array)) {
            return R._engine.create[apply](R, first.splice(0, 3 + R.is(first[0], nu))).add(first);
        } else {
            var args = Array.prototype.slice.call(arguments, 0);
            if (R.is(args[args.length - 1], "function")) {
                var f = args.pop();
                return loaded ? f.call(R._engine.create[apply](R, args)) : eve.on("raphael.DOMload", function () {
                    f.call(R._engine.create[apply](R, args));
                });
            } else {
                return R._engine.create[apply](R, arguments);
            }
        }
    }
    R.version = "2.1.2";
    R.eve = eve;
    var loaded,
        separator = /[, ]+/,
        elements = {circle: 1, rect: 1, path: 1, ellipse: 1, text: 1, image: 1},
        formatrg = /\{(\d+)\}/g,
        proto = "prototype",
        has = "hasOwnProperty",
        g = {
            doc: document,
            win: window
        },
        oldRaphael = {
            was: Object.prototype[has].call(g.win, "Raphael"),
            is: g.win.Raphael
        },
        Paper = function () {
            /*\
             * Paper.ca
             [ property (object) ]
             **
             * Shortcut for @Paper.customAttributes
            \*/
            /*\
             * Paper.customAttributes
             [ property (object) ]
             **
             * If you have a set of attributes that you would like to represent
             * as a function of some number you can do it easily with custom attributes:
             > Usage
             | paper.customAttributes.hue = function (num) {
             |     num = num % 1;
             |     return {fill: "hsb(" + num + ", 0.75, 1)"};
             | };
             | // Custom attribute “hue” will change fill
             | // to be given hue with fixed saturation and brightness.
             | // Now you can use it like this:
             | var c = paper.circle(10, 10, 10).attr({hue: .45});
             | // or even like this:
             | c.animate({hue: 1}, 1e3);
             | 
             | // You could also create custom attribute
             | // with multiple parameters:
             | paper.customAttributes.hsb = function (h, s, b) {
             |     return {fill: "hsb(" + [h, s, b].join(",") + ")"};
             | };
             | c.attr({hsb: "0.5 .8 1"});
             | c.animate({hsb: [1, 0, 0.5]}, 1e3);
            \*/
            this.ca = this.customAttributes = {};
        },
        paperproto,
        appendChild = "appendChild",
        apply = "apply",
        concat = "concat",
        supportsTouch = ('ontouchstart' in g.win) || g.win.DocumentTouch && g.doc instanceof DocumentTouch, //taken from Modernizr touch test
        E = "",
        S = " ",
        Str = String,
        split = "split",
        events = "click dblclick mousedown mousemove mouseout mouseover mouseup touchstart touchmove touchend touchcancel"[split](S),
        touchMap = {
            mousedown: "touchstart",
            mousemove: "touchmove",
            mouseup: "touchend"
        },
        lowerCase = Str.prototype.toLowerCase,
        math = Math,
        mmax = math.max,
        mmin = math.min,
        abs = math.abs,
        pow = math.pow,
        PI = math.PI,
        nu = "number",
        string = "string",
        array = "array",
        toString = "toString",
        fillString = "fill",
        objectToString = Object.prototype.toString,
        paper = {},
        push = "push",
        ISURL = R._ISURL = /^url\(['"]?([^\)]+?)['"]?\)$/i,
        colourRegExp = /^\s*((#[a-f\d]{6})|(#[a-f\d]{3})|rgba?\(\s*([\d\.]+%?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+%?(?:\s*,\s*[\d\.]+%?)?)\s*\)|hsba?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\)|hsla?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\))\s*$/i,
        isnan = {"NaN": 1, "Infinity": 1, "-Infinity": 1},
        bezierrg = /^(?:cubic-)?bezier\(([^,]+),([^,]+),([^,]+),([^\)]+)\)/,
        round = math.round,
        setAttribute = "setAttribute",
        toFloat = parseFloat,
        toInt = parseInt,
        upperCase = Str.prototype.toUpperCase,
        availableAttrs = R._availableAttrs = {
            "arrow-end": "none",
            "arrow-start": "none",
            blur: 0,
            "clip-rect": "0 0 1e9 1e9",
            cursor: "default",
            cx: 0,
            cy: 0,
            fill: "#fff",
            "fill-opacity": 1,
            font: '10px "Arial"',
            "font-family": '"Arial"',
            "font-size": "10",
            "font-style": "normal",
            "font-weight": 400,
            gradient: 0,
            height: 0,
            href: "http://raphaeljs.com/",
            "letter-spacing": 0,
            opacity: 1,
            path: "M0,0",
            r: 0,
            rx: 0,
            ry: 0,
            src: "",
            stroke: "#000",
            "stroke-dasharray": "",
            "stroke-linecap": "butt",
            "stroke-linejoin": "butt",
            "stroke-miterlimit": 0,
            "stroke-opacity": 1,
            "stroke-width": 1,
            target: "_blank",
            "text-anchor": "middle",
            title: "Raphael",
            transform: "",
            width: 0,
            x: 0,
            y: 0
        },
        availableAnimAttrs = R._availableAnimAttrs = {
            blur: nu,
            "clip-rect": "csv",
            cx: nu,
            cy: nu,
            fill: "colour",
            "fill-opacity": nu,
            "font-size": nu,
            height: nu,
            opacity: nu,
            path: "path",
            r: nu,
            rx: nu,
            ry: nu,
            stroke: "colour",
            "stroke-opacity": nu,
            "stroke-width": nu,
            transform: "transform",
            width: nu,
            x: nu,
            y: nu
        },
        whitespace = /[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]/g,
        commaSpaces = /[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*/,
        hsrg = {hs: 1, rg: 1},
        p2s = /,?([achlmqrstvxz]),?/gi,
        pathCommand = /([achlmrqstvz])[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*)+)/ig,
        tCommand = /([rstm])[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*)+)/ig,
        pathValues = /(-?\d*\.?\d*(?:e[\-+]?\d+)?)[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*/ig,
        radial_gradient = R._radial_gradient = /^r(?:\(([^,]+?)[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*([^\)]+?)\))?/,
        eldata = {},
        sortByKey = function (a, b) {
            return a.key - b.key;
        },
        sortByNumber = function (a, b) {
            return toFloat(a) - toFloat(b);
        },
        fun = function () {},
        pipe = function (x) {
            return x;
        },
        rectPath = R._rectPath = function (x, y, w, h, r) {
            if (r) {
                return [["M", x + r, y], ["l", w - r * 2, 0], ["a", r, r, 0, 0, 1, r, r], ["l", 0, h - r * 2], ["a", r, r, 0, 0, 1, -r, r], ["l", r * 2 - w, 0], ["a", r, r, 0, 0, 1, -r, -r], ["l", 0, r * 2 - h], ["a", r, r, 0, 0, 1, r, -r], ["z"]];
            }
            return [["M", x, y], ["l", w, 0], ["l", 0, h], ["l", -w, 0], ["z"]];
        },
        ellipsePath = function (x, y, rx, ry) {
            if (ry == null) {
                ry = rx;
            }
            return [["M", x, y], ["m", 0, -ry], ["a", rx, ry, 0, 1, 1, 0, 2 * ry], ["a", rx, ry, 0, 1, 1, 0, -2 * ry], ["z"]];
        },
        getPath = R._getPath = {
            path: function (el) {
                return el.attr("path");
            },
            circle: function (el) {
                var a = el.attrs;
                return ellipsePath(a.cx, a.cy, a.r);
            },
            ellipse: function (el) {
                var a = el.attrs;
                return ellipsePath(a.cx, a.cy, a.rx, a.ry);
            },
            rect: function (el) {
                var a = el.attrs;
                return rectPath(a.x, a.y, a.width, a.height, a.r);
            },
            image: function (el) {
                var a = el.attrs;
                return rectPath(a.x, a.y, a.width, a.height);
            },
            text: function (el) {
                var bbox = el._getBBox();
                return rectPath(bbox.x, bbox.y, bbox.width, bbox.height);
            },
            set : function(el) {
                var bbox = el._getBBox();
                return rectPath(bbox.x, bbox.y, bbox.width, bbox.height);
            }
        },
        /*\
         * Raphael.mapPath
         [ method ]
         **
         * Transform the path string with given matrix.
         > Parameters
         - path (string) path string
         - matrix (object) see @Matrix
         = (string) transformed path string
        \*/
        mapPath = R.mapPath = function (path, matrix) {
            if (!matrix) {
                return path;
            }
            var x, y, i, j, ii, jj, pathi;
            path = path2curve(path);
            for (i = 0, ii = path.length; i < ii; i++) {
                pathi = path[i];
                for (j = 1, jj = pathi.length; j < jj; j += 2) {
                    x = matrix.x(pathi[j], pathi[j + 1]);
                    y = matrix.y(pathi[j], pathi[j + 1]);
                    pathi[j] = x;
                    pathi[j + 1] = y;
                }
            }
            return path;
        };

    R._g = g;
    /*\
     * Raphael.type
     [ property (string) ]
     **
     * Can be “SVG”, “VML” or empty, depending on browser support.
    \*/
    R.type = (g.win.SVGAngle || g.doc.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1") ? "SVG" : "VML");
    if (R.type == "VML") {
        var d = g.doc.createElement("div"),
            b;
        d.innerHTML = '<v:shape adj="1"/>';
        b = d.firstChild;
        b.style.behavior = "url(#default#VML)";
        if (!(b && typeof b.adj == "object")) {
            return (R.type = E);
        }
        d = null;
    }
    /*\
     * Raphael.svg
     [ property (boolean) ]
     **
     * `true` if browser supports SVG.
    \*/
    /*\
     * Raphael.vml
     [ property (boolean) ]
     **
     * `true` if browser supports VML.
    \*/
    R.svg = !(R.vml = R.type == "VML");
    R._Paper = Paper;
    /*\
     * Raphael.fn
     [ property (object) ]
     **
     * You can add your own method to the canvas. For example if you want to draw a pie chart,
     * you can create your own pie chart function and ship it as a Raphaël plugin. To do this
     * you need to extend the `Raphael.fn` object. You should modify the `fn` object before a
     * Raphaël instance is created, otherwise it will take no effect. Please note that the
     * ability for namespaced plugins was removed in Raphael 2.0. It is up to the plugin to
     * ensure any namespacing ensures proper context.
     > Usage
     | Raphael.fn.arrow = function (x1, y1, x2, y2, size) {
     |     return this.path( ... );
     | };
     | // or create namespace
     | Raphael.fn.mystuff = {
     |     arrow: function () {…},
     |     star: function () {…},
     |     // etc…
     | };
     | var paper = Raphael(10, 10, 630, 480);
     | // then use it
     | paper.arrow(10, 10, 30, 30, 5).attr({fill: "#f00"});
     | paper.mystuff.arrow();
     | paper.mystuff.star();
    \*/
    R.fn = paperproto = Paper.prototype = R.prototype;
    R._id = 0;
    R._oid = 0;
    /*\
     * Raphael.is
     [ method ]
     **
     * Handfull replacement for `typeof` operator.
     > Parameters
     - o (…) any object or primitive
     - type (string) name of the type, i.e. “string”, “function”, “number”, etc.
     = (boolean) is given value is of given type
    \*/
    R.is = function (o, type) {
        type = lowerCase.call(type);
        if (type == "finite") {
            return !isnan[has](+o);
        }
        if (type == "array") {
            return o instanceof Array;
        }
        return  (type == "null" && o === null) ||
                (type == typeof o && o !== null) ||
                (type == "object" && o === Object(o)) ||
                (type == "array" && Array.isArray && Array.isArray(o)) ||
                objectToString.call(o).slice(8, -1).toLowerCase() == type;
    };

    function clone(obj) {
        if (typeof obj == "function" || Object(obj) !== obj) {
            return obj;
        }
        var res = new obj.constructor;
        for (var key in obj) if (obj[has](key)) {
            res[key] = clone(obj[key]);
        }
        return res;
    }

    /*\
     * Raphael.angle
     [ method ]
     **
     * Returns angle between two or three points
     > Parameters
     - x1 (number) x coord of first point
     - y1 (number) y coord of first point
     - x2 (number) x coord of second point
     - y2 (number) y coord of second point
     - x3 (number) #optional x coord of third point
     - y3 (number) #optional y coord of third point
     = (number) angle in degrees.
    \*/
    R.angle = function (x1, y1, x2, y2, x3, y3) {
        if (x3 == null) {
            var x = x1 - x2,
                y = y1 - y2;
            if (!x && !y) {
                return 0;
            }
            return (180 + math.atan2(-y, -x) * 180 / PI + 360) % 360;
        } else {
            return R.angle(x1, y1, x3, y3) - R.angle(x2, y2, x3, y3);
        }
    };
    /*\
     * Raphael.rad
     [ method ]
     **
     * Transform angle to radians
     > Parameters
     - deg (number) angle in degrees
     = (number) angle in radians.
    \*/
    R.rad = function (deg) {
        return deg % 360 * PI / 180;
    };
    /*\
     * Raphael.deg
     [ method ]
     **
     * Transform angle to degrees
     > Parameters
     - deg (number) angle in radians
     = (number) angle in degrees.
    \*/
    R.deg = function (rad) {
        return rad * 180 / PI % 360;
    };
    /*\
     * Raphael.snapTo
     [ method ]
     **
     * Snaps given value to given grid.
     > Parameters
     - values (array|number) given array of values or step of the grid
     - value (number) value to adjust
     - tolerance (number) #optional tolerance for snapping. Default is `10`.
     = (number) adjusted value.
    \*/
    R.snapTo = function (values, value, tolerance) {
        tolerance = R.is(tolerance, "finite") ? tolerance : 10;
        if (R.is(values, array)) {
            var i = values.length;
            while (i--) if (abs(values[i] - value) <= tolerance) {
                return values[i];
            }
        } else {
            values = +values;
            var rem = value % values;
            if (rem < tolerance) {
                return value - rem;
            }
            if (rem > values - tolerance) {
                return value - rem + values;
            }
        }
        return value;
    };

    /*\
     * Raphael.createUUID
     [ method ]
     **
     * Returns RFC4122, version 4 ID
    \*/
    var createUUID = R.createUUID = (function (uuidRegEx, uuidReplacer) {
        return function () {
            return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(uuidRegEx, uuidReplacer).toUpperCase();
        };
    })(/[xy]/g, function (c) {
        var r = math.random() * 16 | 0,
            v = c == "x" ? r : (r & 3 | 8);
        return v.toString(16);
    });

    /*\
     * Raphael.setWindow
     [ method ]
     **
     * Used when you need to draw in `&lt;iframe>`. Switched window to the iframe one.
     > Parameters
     - newwin (window) new window object
    \*/
    R.setWindow = function (newwin) {
        eve("raphael.setWindow", R, g.win, newwin);
        g.win = newwin;
        g.doc = g.win.document;
        if (R._engine.initWin) {
            R._engine.initWin(g.win);
        }
    };
    var toHex = function (color) {
        if (R.vml) {
            // http://dean.edwards.name/weblog/2009/10/convert-any-colour-value-to-hex-in-msie/
            var trim = /^\s+|\s+$/g;
            var bod;
            try {
                var docum = new ActiveXObject("htmlfile");
                docum.write("<body>");
                docum.close();
                bod = docum.body;
            } catch(e) {
                bod = createPopup().document.body;
            }
            var range = bod.createTextRange();
            toHex = cacher(function (color) {
                try {
                    bod.style.color = Str(color).replace(trim, E);
                    var value = range.queryCommandValue("ForeColor");
                    value = ((value & 255) << 16) | (value & 65280) | ((value & 16711680) >>> 16);
                    return "#" + ("000000" + value.toString(16)).slice(-6);
                } catch(e) {
                    return "none";
                }
            });
        } else {
            var i = g.doc.createElement("i");
            i.title = "Rapha\xebl Colour Picker";
            i.style.display = "none";
            g.doc.body.appendChild(i);
            toHex = cacher(function (color) {
                i.style.color = color;
                return g.doc.defaultView.getComputedStyle(i, E).getPropertyValue("color");
            });
        }
        return toHex(color);
    },
    hsbtoString = function () {
        return "hsb(" + [this.h, this.s, this.b] + ")";
    },
    hsltoString = function () {
        return "hsl(" + [this.h, this.s, this.l] + ")";
    },
    rgbtoString = function () {
        return this.hex;
    },
    prepareRGB = function (r, g, b) {
        if (g == null && R.is(r, "object") && "r" in r && "g" in r && "b" in r) {
            b = r.b;
            g = r.g;
            r = r.r;
        }
        if (g == null && R.is(r, string)) {
            var clr = R.getRGB(r);
            r = clr.r;
            g = clr.g;
            b = clr.b;
        }
        if (r > 1 || g > 1 || b > 1) {
            r /= 255;
            g /= 255;
            b /= 255;
        }

        return [r, g, b];
    },
    packageRGB = function (r, g, b, o) {
        r *= 255;
        g *= 255;
        b *= 255;
        var rgb = {
            r: r,
            g: g,
            b: b,
            hex: R.rgb(r, g, b),
            toString: rgbtoString
        };
        R.is(o, "finite") && (rgb.opacity = o);
        return rgb;
    };

    /*\
     * Raphael.color
     [ method ]
     **
     * Parses the color string and returns object with all values for the given color.
     > Parameters
     - clr (string) color string in one of the supported formats (see @Raphael.getRGB)
     = (object) Combined RGB & HSB object in format:
     o {
     o     r (number) red,
     o     g (number) green,
     o     b (number) blue,
     o     hex (string) color in HTML/CSS format: #••••••,
     o     error (boolean) `true` if string can’t be parsed,
     o     h (number) hue,
     o     s (number) saturation,
     o     v (number) value (brightness),
     o     l (number) lightness
     o }
    \*/
    R.color = function (clr) {
        var rgb;
        if (R.is(clr, "object") && "h" in clr && "s" in clr && "b" in clr) {
            rgb = R.hsb2rgb(clr);
            clr.r = rgb.r;
            clr.g = rgb.g;
            clr.b = rgb.b;
            clr.hex = rgb.hex;
        } else if (R.is(clr, "object") && "h" in clr && "s" in clr && "l" in clr) {
            rgb = R.hsl2rgb(clr);
            clr.r = rgb.r;
            clr.g = rgb.g;
            clr.b = rgb.b;
            clr.hex = rgb.hex;
        } else {
            if (R.is(clr, "string")) {
                clr = R.getRGB(clr);
            }
            if (R.is(clr, "object") && "r" in clr && "g" in clr && "b" in clr) {
                rgb = R.rgb2hsl(clr);
                clr.h = rgb.h;
                clr.s = rgb.s;
                clr.l = rgb.l;
                rgb = R.rgb2hsb(clr);
                clr.v = rgb.b;
            } else {
                clr = {hex: "none"};
                clr.r = clr.g = clr.b = clr.h = clr.s = clr.v = clr.l = -1;
            }
        }
        clr.toString = rgbtoString;
        return clr;
    };
    /*\
     * Raphael.hsb2rgb
     [ method ]
     **
     * Converts HSB values to RGB object.
     > Parameters
     - h (number) hue
     - s (number) saturation
     - v (number) value or brightness
     = (object) RGB object in format:
     o {
     o     r (number) red,
     o     g (number) green,
     o     b (number) blue,
     o     hex (string) color in HTML/CSS format: #••••••
     o }
    \*/
    R.hsb2rgb = function (h, s, v, o) {
        if (this.is(h, "object") && "h" in h && "s" in h && "b" in h) {
            v = h.b;
            s = h.s;
            h = h.h;
            o = h.o;
        }
        h *= 360;
        var R, G, B, X, C;
        h = (h % 360) / 60;
        C = v * s;
        X = C * (1 - abs(h % 2 - 1));
        R = G = B = v - C;

        h = ~~h;
        R += [C, X, 0, 0, X, C][h];
        G += [X, C, C, X, 0, 0][h];
        B += [0, 0, X, C, C, X][h];
        return packageRGB(R, G, B, o);
    };
    /*\
     * Raphael.hsl2rgb
     [ method ]
     **
     * Converts HSL values to RGB object.
     > Parameters
     - h (number) hue
     - s (number) saturation
     - l (number) luminosity
     = (object) RGB object in format:
     o {
     o     r (number) red,
     o     g (number) green,
     o     b (number) blue,
     o     hex (string) color in HTML/CSS format: #••••••
     o }
    \*/
    R.hsl2rgb = function (h, s, l, o) {
        if (this.is(h, "object") && "h" in h && "s" in h && "l" in h) {
            l = h.l;
            s = h.s;
            h = h.h;
        }
        if (h > 1 || s > 1 || l > 1) {
            h /= 360;
            s /= 100;
            l /= 100;
        }
        h *= 360;
        var R, G, B, X, C;
        h = (h % 360) / 60;
        C = 2 * s * (l < .5 ? l : 1 - l);
        X = C * (1 - abs(h % 2 - 1));
        R = G = B = l - C / 2;

        h = ~~h;
        R += [C, X, 0, 0, X, C][h];
        G += [X, C, C, X, 0, 0][h];
        B += [0, 0, X, C, C, X][h];
        return packageRGB(R, G, B, o);
    };
    /*\
     * Raphael.rgb2hsb
     [ method ]
     **
     * Converts RGB values to HSB object.
     > Parameters
     - r (number) red
     - g (number) green
     - b (number) blue
     = (object) HSB object in format:
     o {
     o     h (number) hue
     o     s (number) saturation
     o     b (number) brightness
     o }
    \*/
    R.rgb2hsb = function (r, g, b) {
        b = prepareRGB(r, g, b);
        r = b[0];
        g = b[1];
        b = b[2];

        var H, S, V, C;
        V = mmax(r, g, b);
        C = V - mmin(r, g, b);
        H = (C == 0 ? null :
             V == r ? (g - b) / C :
             V == g ? (b - r) / C + 2 :
                      (r - g) / C + 4
            );
        H = ((H + 360) % 6) * 60 / 360;
        S = C == 0 ? 0 : C / V;
        return {h: H, s: S, b: V, toString: hsbtoString};
    };
    /*\
     * Raphael.rgb2hsl
     [ method ]
     **
     * Converts RGB values to HSL object.
     > Parameters
     - r (number) red
     - g (number) green
     - b (number) blue
     = (object) HSL object in format:
     o {
     o     h (number) hue
     o     s (number) saturation
     o     l (number) luminosity
     o }
    \*/
    R.rgb2hsl = function (r, g, b) {
        b = prepareRGB(r, g, b);
        r = b[0];
        g = b[1];
        b = b[2];

        var H, S, L, M, m, C;
        M = mmax(r, g, b);
        m = mmin(r, g, b);
        C = M - m;
        H = (C == 0 ? null :
             M == r ? (g - b) / C :
             M == g ? (b - r) / C + 2 :
                      (r - g) / C + 4);
        H = ((H + 360) % 6) * 60 / 360;
        L = (M + m) / 2;
        S = (C == 0 ? 0 :
             L < .5 ? C / (2 * L) :
                      C / (2 - 2 * L));
        return {h: H, s: S, l: L, toString: hsltoString};
    };
    R._path2string = function () {
        return this.join(",").replace(p2s, "$1");
    };
    function repush(array, item) {
        for (var i = 0, ii = array.length; i < ii; i++) if (array[i] === item) {
            return array.push(array.splice(i, 1)[0]);
        }
    }
    function cacher(f, scope, postprocessor) {
        function newf() {
            var arg = Array.prototype.slice.call(arguments, 0),
                args = arg.join("\u2400"),
                cache = newf.cache = newf.cache || {},
                count = newf.count = newf.count || [];
            if (cache[has](args)) {
                repush(count, args);
                return postprocessor ? postprocessor(cache[args]) : cache[args];
            }
            count.length >= 1e3 && delete cache[count.shift()];
            count.push(args);
            cache[args] = f[apply](scope, arg);
            return postprocessor ? postprocessor(cache[args]) : cache[args];
        }
        return newf;
    }

    var preload = R._preload = function (src, f) {
        var img = g.doc.createElement("img");
        img.style.cssText = "position:absolute;left:-9999em;top:-9999em";
        img.onload = function () {
            f.call(this);
            this.onload = null;
            g.doc.body.removeChild(this);
        };
        img.onerror = function () {
            g.doc.body.removeChild(this);
        };
        g.doc.body.appendChild(img);
        img.src = src;
    };

    function clrToString() {
        return this.hex;
    }

    /*\
     * Raphael.getRGB
     [ method ]
     **
     * Parses colour string as RGB object
     > Parameters
     - colour (string) colour string in one of formats:
     # <ul>
     #     <li>Colour name (“<code>red</code>”, “<code>green</code>”, “<code>cornflowerblue</code>”, etc)</li>
     #     <li>#••• — shortened HTML colour: (“<code>#000</code>”, “<code>#fc0</code>”, etc)</li>
     #     <li>#•••••• — full length HTML colour: (“<code>#000000</code>”, “<code>#bd2300</code>”)</li>
     #     <li>rgb(•••, •••, •••) — red, green and blue channels’ values: (“<code>rgb(200,&nbsp;100,&nbsp;0)</code>”)</li>
     #     <li>rgb(•••%, •••%, •••%) — same as above, but in %: (“<code>rgb(100%,&nbsp;175%,&nbsp;0%)</code>”)</li>
     #     <li>hsb(•••, •••, •••) — hue, saturation and brightness values: (“<code>hsb(0.5,&nbsp;0.25,&nbsp;1)</code>”)</li>
     #     <li>hsb(•••%, •••%, •••%) — same as above, but in %</li>
     #     <li>hsl(•••, •••, •••) — same as hsb</li>
     #     <li>hsl(•••%, •••%, •••%) — same as hsb</li>
     # </ul>
     = (object) RGB object in format:
     o {
     o     r (number) red,
     o     g (number) green,
     o     b (number) blue
     o     hex (string) color in HTML/CSS format: #••••••,
     o     error (boolean) true if string can’t be parsed
     o }
    \*/
    R.getRGB = cacher(function (colour) {
        if (!colour || !!((colour = Str(colour)).indexOf("-") + 1)) {
            return {r: -1, g: -1, b: -1, hex: "none", error: 1, toString: clrToString};
        }
        if (colour == "none") {
            return {r: -1, g: -1, b: -1, hex: "none", toString: clrToString};
        }
        !(hsrg[has](colour.toLowerCase().substring(0, 2)) || colour.charAt() == "#") && (colour = toHex(colour));
        var res,
            red,
            green,
            blue,
            opacity,
            t,
            values,
            rgb = colour.match(colourRegExp);
        if (rgb) {
            if (rgb[2]) {
                blue = toInt(rgb[2].substring(5), 16);
                green = toInt(rgb[2].substring(3, 5), 16);
                red = toInt(rgb[2].substring(1, 3), 16);
            }
            if (rgb[3]) {
                blue = toInt((t = rgb[3].charAt(3)) + t, 16);
                green = toInt((t = rgb[3].charAt(2)) + t, 16);
                red = toInt((t = rgb[3].charAt(1)) + t, 16);
            }
            if (rgb[4]) {
                values = rgb[4][split](commaSpaces);
                red = toFloat(values[0]);
                values[0].slice(-1) == "%" && (red *= 2.55);
                green = toFloat(values[1]);
                values[1].slice(-1) == "%" && (green *= 2.55);
                blue = toFloat(values[2]);
                values[2].slice(-1) == "%" && (blue *= 2.55);
                rgb[1].toLowerCase().slice(0, 4) == "rgba" && (opacity = toFloat(values[3]));
                values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
            }
            if (rgb[5]) {
                values = rgb[5][split](commaSpaces);
                red = toFloat(values[0]);
                values[0].slice(-1) == "%" && (red *= 2.55);
                green = toFloat(values[1]);
                values[1].slice(-1) == "%" && (green *= 2.55);
                blue = toFloat(values[2]);
                values[2].slice(-1) == "%" && (blue *= 2.55);
                (values[0].slice(-3) == "deg" || values[0].slice(-1) == "\xb0") && (red /= 360);
                rgb[1].toLowerCase().slice(0, 4) == "hsba" && (opacity = toFloat(values[3]));
                values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
                return R.hsb2rgb(red, green, blue, opacity);
            }
            if (rgb[6]) {
                values = rgb[6][split](commaSpaces);
                red = toFloat(values[0]);
                values[0].slice(-1) == "%" && (red *= 2.55);
                green = toFloat(values[1]);
                values[1].slice(-1) == "%" && (green *= 2.55);
                blue = toFloat(values[2]);
                values[2].slice(-1) == "%" && (blue *= 2.55);
                (values[0].slice(-3) == "deg" || values[0].slice(-1) == "\xb0") && (red /= 360);
                rgb[1].toLowerCase().slice(0, 4) == "hsla" && (opacity = toFloat(values[3]));
                values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
                return R.hsl2rgb(red, green, blue, opacity);
            }
            rgb = {r: red, g: green, b: blue, toString: clrToString};
            rgb.hex = "#" + (16777216 | blue | (green << 8) | (red << 16)).toString(16).slice(1);
            R.is(opacity, "finite") && (rgb.opacity = opacity);
            return rgb;
        }
        return {r: -1, g: -1, b: -1, hex: "none", error: 1, toString: clrToString};
    }, R);
    /*\
     * Raphael.hsb
     [ method ]
     **
     * Converts HSB values to hex representation of the colour.
     > Parameters
     - h (number) hue
     - s (number) saturation
     - b (number) value or brightness
     = (string) hex representation of the colour.
    \*/
    R.hsb = cacher(function (h, s, b) {
        return R.hsb2rgb(h, s, b).hex;
    });
    /*\
     * Raphael.hsl
     [ method ]
     **
     * Converts HSL values to hex representation of the colour.
     > Parameters
     - h (number) hue
     - s (number) saturation
     - l (number) luminosity
     = (string) hex representation of the colour.
    \*/
    R.hsl = cacher(function (h, s, l) {
        return R.hsl2rgb(h, s, l).hex;
    });
    /*\
     * Raphael.rgb
     [ method ]
     **
     * Converts RGB values to hex representation of the colour.
     > Parameters
     - r (number) red
     - g (number) green
     - b (number) blue
     = (string) hex representation of the colour.
    \*/
    R.rgb = cacher(function (r, g, b) {
        return "#" + (16777216 | b | (g << 8) | (r << 16)).toString(16).slice(1);
    });
    /*\
     * Raphael.getColor
     [ method ]
     **
     * On each call returns next colour in the spectrum. To reset it back to red call @Raphael.getColor.reset
     > Parameters
     - value (number) #optional brightness, default is `0.75`
     = (string) hex representation of the colour.
    \*/
    R.getColor = function (value) {
        var start = this.getColor.start = this.getColor.start || {h: 0, s: 1, b: value || .75},
            rgb = this.hsb2rgb(start.h, start.s, start.b);
        start.h += .075;
        if (start.h > 1) {
            start.h = 0;
            start.s -= .2;
            start.s <= 0 && (this.getColor.start = {h: 0, s: 1, b: start.b});
        }
        return rgb.hex;
    };
    /*\
     * Raphael.getColor.reset
     [ method ]
     **
     * Resets spectrum position for @Raphael.getColor back to red.
    \*/
    R.getColor.reset = function () {
        delete this.start;
    };

    // http://schepers.cc/getting-to-the-point
    function catmullRom2bezier(crp, z) {
        var d = [];
        for (var i = 0, iLen = crp.length; iLen - 2 * !z > i; i += 2) {
            var p = [
                        {x: +crp[i - 2], y: +crp[i - 1]},
                        {x: +crp[i],     y: +crp[i + 1]},
                        {x: +crp[i + 2], y: +crp[i + 3]},
                        {x: +crp[i + 4], y: +crp[i + 5]}
                    ];
            if (z) {
                if (!i) {
                    p[0] = {x: +crp[iLen - 2], y: +crp[iLen - 1]};
                } else if (iLen - 4 == i) {
                    p[3] = {x: +crp[0], y: +crp[1]};
                } else if (iLen - 2 == i) {
                    p[2] = {x: +crp[0], y: +crp[1]};
                    p[3] = {x: +crp[2], y: +crp[3]};
                }
            } else {
                if (iLen - 4 == i) {
                    p[3] = p[2];
                } else if (!i) {
                    p[0] = {x: +crp[i], y: +crp[i + 1]};
                }
            }
            d.push(["C",
                  (-p[0].x + 6 * p[1].x + p[2].x) / 6,
                  (-p[0].y + 6 * p[1].y + p[2].y) / 6,
                  (p[1].x + 6 * p[2].x - p[3].x) / 6,
                  (p[1].y + 6*p[2].y - p[3].y) / 6,
                  p[2].x,
                  p[2].y
            ]);
        }

        return d;
    }
    /*\
     * Raphael.parsePathString
     [ method ]
     **
     * Utility method
     **
     * Parses given path string into an array of arrays of path segments.
     > Parameters
     - pathString (string|array) path string or array of segments (in the last case it will be returned straight away)
     = (array) array of segments.
    \*/
    R.parsePathString = function (pathString) {
        if (!pathString) {
            return null;
        }
        var pth = paths(pathString);
        if (pth.arr) {
            return pathClone(pth.arr);
        }

        var paramCounts = {a: 7, c: 6, h: 1, l: 2, m: 2, r: 4, q: 4, s: 4, t: 2, v: 1, z: 0},
            data = [];
        if (R.is(pathString, array) && R.is(pathString[0], array)) { // rough assumption
            data = pathClone(pathString);
        }
        if (!data.length) {
            Str(pathString).replace(pathCommand, function (a, b, c) {
                var params = [],
                    name = b.toLowerCase();
                c.replace(pathValues, function (a, b) {
                    b && params.push(+b);
                });
                if (name == "m" && params.length > 2) {
                    data.push([b][concat](params.splice(0, 2)));
                    name = "l";
                    b = b == "m" ? "l" : "L";
                }
                if (name == "r") {
                    data.push([b][concat](params));
                } else while (params.length >= paramCounts[name]) {
                    data.push([b][concat](params.splice(0, paramCounts[name])));
                    if (!paramCounts[name]) {
                        break;
                    }
                }
            });
        }
        data.toString = R._path2string;
        pth.arr = pathClone(data);
        return data;
    };
    /*\
     * Raphael.parseTransformString
     [ method ]
     **
     * Utility method
     **
     * Parses given path string into an array of transformations.
     > Parameters
     - TString (string|array) transform string or array of transformations (in the last case it will be returned straight away)
     = (array) array of transformations.
    \*/
    R.parseTransformString = cacher(function (TString) {
        if (!TString) {
            return null;
        }
        var paramCounts = {r: 3, s: 4, t: 2, m: 6},
            data = [];
        if (R.is(TString, array) && R.is(TString[0], array)) { // rough assumption
            data = pathClone(TString);
        }
        if (!data.length) {
            Str(TString).replace(tCommand, function (a, b, c) {
                var params = [],
                    name = lowerCase.call(b);
                c.replace(pathValues, function (a, b) {
                    b && params.push(+b);
                });
                data.push([b][concat](params));
            });
        }
        data.toString = R._path2string;
        return data;
    });
    // PATHS
    var paths = function (ps) {
        var p = paths.ps = paths.ps || {};
        if (p[ps]) {
            p[ps].sleep = 1;
        } else {
            p[ps] = {
                sleep: 1
            };
        }
        setTimeout(function () {
            for (var key in p) if (p[has](key) && key != ps) {
                p[key].sleep--;
                !p[key].sleep && delete p[key];
            }
        });
        return p[ps];
    };
    /*\
     * Raphael.findDotsAtSegment
     [ method ]
     **
     * Utility method
     **
     * Find dot coordinates on the given cubic bezier curve at the given t.
     > Parameters
     - p1x (number) x of the first point of the curve
     - p1y (number) y of the first point of the curve
     - c1x (number) x of the first anchor of the curve
     - c1y (number) y of the first anchor of the curve
     - c2x (number) x of the second anchor of the curve
     - c2y (number) y of the second anchor of the curve
     - p2x (number) x of the second point of the curve
     - p2y (number) y of the second point of the curve
     - t (number) position on the curve (0..1)
     = (object) point information in format:
     o {
     o     x: (number) x coordinate of the point
     o     y: (number) y coordinate of the point
     o     m: {
     o         x: (number) x coordinate of the left anchor
     o         y: (number) y coordinate of the left anchor
     o     }
     o     n: {
     o         x: (number) x coordinate of the right anchor
     o         y: (number) y coordinate of the right anchor
     o     }
     o     start: {
     o         x: (number) x coordinate of the start of the curve
     o         y: (number) y coordinate of the start of the curve
     o     }
     o     end: {
     o         x: (number) x coordinate of the end of the curve
     o         y: (number) y coordinate of the end of the curve
     o     }
     o     alpha: (number) angle of the curve derivative at the point
     o }
    \*/
    R.findDotsAtSegment = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
        var t1 = 1 - t,
            t13 = pow(t1, 3),
            t12 = pow(t1, 2),
            t2 = t * t,
            t3 = t2 * t,
            x = t13 * p1x + t12 * 3 * t * c1x + t1 * 3 * t * t * c2x + t3 * p2x,
            y = t13 * p1y + t12 * 3 * t * c1y + t1 * 3 * t * t * c2y + t3 * p2y,
            mx = p1x + 2 * t * (c1x - p1x) + t2 * (c2x - 2 * c1x + p1x),
            my = p1y + 2 * t * (c1y - p1y) + t2 * (c2y - 2 * c1y + p1y),
            nx = c1x + 2 * t * (c2x - c1x) + t2 * (p2x - 2 * c2x + c1x),
            ny = c1y + 2 * t * (c2y - c1y) + t2 * (p2y - 2 * c2y + c1y),
            ax = t1 * p1x + t * c1x,
            ay = t1 * p1y + t * c1y,
            cx = t1 * c2x + t * p2x,
            cy = t1 * c2y + t * p2y,
            alpha = (90 - math.atan2(mx - nx, my - ny) * 180 / PI);
        (mx > nx || my < ny) && (alpha += 180);
        return {
            x: x,
            y: y,
            m: {x: mx, y: my},
            n: {x: nx, y: ny},
            start: {x: ax, y: ay},
            end: {x: cx, y: cy},
            alpha: alpha
        };
    };
    /*\
     * Raphael.bezierBBox
     [ method ]
     **
     * Utility method
     **
     * Return bounding box of a given cubic bezier curve
     > Parameters
     - p1x (number) x of the first point of the curve
     - p1y (number) y of the first point of the curve
     - c1x (number) x of the first anchor of the curve
     - c1y (number) y of the first anchor of the curve
     - c2x (number) x of the second anchor of the curve
     - c2y (number) y of the second anchor of the curve
     - p2x (number) x of the second point of the curve
     - p2y (number) y of the second point of the curve
     * or
     - bez (array) array of six points for bezier curve
     = (object) point information in format:
     o {
     o     min: {
     o         x: (number) x coordinate of the left point
     o         y: (number) y coordinate of the top point
     o     }
     o     max: {
     o         x: (number) x coordinate of the right point
     o         y: (number) y coordinate of the bottom point
     o     }
     o }
    \*/
    R.bezierBBox = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y) {
        if (!R.is(p1x, "array")) {
            p1x = [p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y];
        }
        var bbox = curveDim.apply(null, p1x);
        return {
            x: bbox.min.x,
            y: bbox.min.y,
            x2: bbox.max.x,
            y2: bbox.max.y,
            width: bbox.max.x - bbox.min.x,
            height: bbox.max.y - bbox.min.y
        };
    };
    /*\
     * Raphael.isPointInsideBBox
     [ method ]
     **
     * Utility method
     **
     * Returns `true` if given point is inside bounding boxes.
     > Parameters
     - bbox (string) bounding box
     - x (string) x coordinate of the point
     - y (string) y coordinate of the point
     = (boolean) `true` if point inside
    \*/
    R.isPointInsideBBox = function (bbox, x, y) {
        return x >= bbox.x && x <= bbox.x2 && y >= bbox.y && y <= bbox.y2;
    };
    /*\
     * Raphael.isBBoxIntersect
     [ method ]
     **
     * Utility method
     **
     * Returns `true` if two bounding boxes intersect
     > Parameters
     - bbox1 (string) first bounding box
     - bbox2 (string) second bounding box
     = (boolean) `true` if they intersect
    \*/
    R.isBBoxIntersect = function (bbox1, bbox2) {
        var i = R.isPointInsideBBox;
        return i(bbox2, bbox1.x, bbox1.y)
            || i(bbox2, bbox1.x2, bbox1.y)
            || i(bbox2, bbox1.x, bbox1.y2)
            || i(bbox2, bbox1.x2, bbox1.y2)
            || i(bbox1, bbox2.x, bbox2.y)
            || i(bbox1, bbox2.x2, bbox2.y)
            || i(bbox1, bbox2.x, bbox2.y2)
            || i(bbox1, bbox2.x2, bbox2.y2)
            || (bbox1.x < bbox2.x2 && bbox1.x > bbox2.x || bbox2.x < bbox1.x2 && bbox2.x > bbox1.x)
            && (bbox1.y < bbox2.y2 && bbox1.y > bbox2.y || bbox2.y < bbox1.y2 && bbox2.y > bbox1.y);
    };
    function base3(t, p1, p2, p3, p4) {
        var t1 = -3 * p1 + 9 * p2 - 9 * p3 + 3 * p4,
            t2 = t * t1 + 6 * p1 - 12 * p2 + 6 * p3;
        return t * t2 - 3 * p1 + 3 * p2;
    }
    function bezlen(x1, y1, x2, y2, x3, y3, x4, y4, z) {
        if (z == null) {
            z = 1;
        }
        z = z > 1 ? 1 : z < 0 ? 0 : z;
        var z2 = z / 2,
            n = 12,
            Tvalues = [-0.1252,0.1252,-0.3678,0.3678,-0.5873,0.5873,-0.7699,0.7699,-0.9041,0.9041,-0.9816,0.9816],
            Cvalues = [0.2491,0.2491,0.2335,0.2335,0.2032,0.2032,0.1601,0.1601,0.1069,0.1069,0.0472,0.0472],
            sum = 0;
        for (var i = 0; i < n; i++) {
            var ct = z2 * Tvalues[i] + z2,
                xbase = base3(ct, x1, x2, x3, x4),
                ybase = base3(ct, y1, y2, y3, y4),
                comb = xbase * xbase + ybase * ybase;
            sum += Cvalues[i] * math.sqrt(comb);
        }
        return z2 * sum;
    }
    function getTatLen(x1, y1, x2, y2, x3, y3, x4, y4, ll) {
        if (ll < 0 || bezlen(x1, y1, x2, y2, x3, y3, x4, y4) < ll) {
            return;
        }
        var t = 1,
            step = t / 2,
            t2 = t - step,
            l,
            e = .01;
        l = bezlen(x1, y1, x2, y2, x3, y3, x4, y4, t2);
        while (abs(l - ll) > e) {
            step /= 2;
            t2 += (l < ll ? 1 : -1) * step;
            l = bezlen(x1, y1, x2, y2, x3, y3, x4, y4, t2);
        }
        return t2;
    }
    function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {
        if (
            mmax(x1, x2) < mmin(x3, x4) ||
            mmin(x1, x2) > mmax(x3, x4) ||
            mmax(y1, y2) < mmin(y3, y4) ||
            mmin(y1, y2) > mmax(y3, y4)
        ) {
            return;
        }
        var nx = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4),
            ny = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4),
            denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

        if (!denominator) {
            return;
        }
        var px = nx / denominator,
            py = ny / denominator,
            px2 = +px.toFixed(2),
            py2 = +py.toFixed(2);
        if (
            px2 < +mmin(x1, x2).toFixed(2) ||
            px2 > +mmax(x1, x2).toFixed(2) ||
            px2 < +mmin(x3, x4).toFixed(2) ||
            px2 > +mmax(x3, x4).toFixed(2) ||
            py2 < +mmin(y1, y2).toFixed(2) ||
            py2 > +mmax(y1, y2).toFixed(2) ||
            py2 < +mmin(y3, y4).toFixed(2) ||
            py2 > +mmax(y3, y4).toFixed(2)
        ) {
            return;
        }
        return {x: px, y: py};
    }
    function inter(bez1, bez2) {
        return interHelper(bez1, bez2);
    }
    function interCount(bez1, bez2) {
        return interHelper(bez1, bez2, 1);
    }
    function interHelper(bez1, bez2, justCount) {
        var bbox1 = R.bezierBBox(bez1),
            bbox2 = R.bezierBBox(bez2);
        if (!R.isBBoxIntersect(bbox1, bbox2)) {
            return justCount ? 0 : [];
        }
        var l1 = bezlen.apply(0, bez1),
            l2 = bezlen.apply(0, bez2),
            n1 = mmax(~~(l1 / 5), 1),
            n2 = mmax(~~(l2 / 5), 1),
            dots1 = [],
            dots2 = [],
            xy = {},
            res = justCount ? 0 : [];
        for (var i = 0; i < n1 + 1; i++) {
            var p = R.findDotsAtSegment.apply(R, bez1.concat(i / n1));
            dots1.push({x: p.x, y: p.y, t: i / n1});
        }
        for (i = 0; i < n2 + 1; i++) {
            p = R.findDotsAtSegment.apply(R, bez2.concat(i / n2));
            dots2.push({x: p.x, y: p.y, t: i / n2});
        }
        for (i = 0; i < n1; i++) {
            for (var j = 0; j < n2; j++) {
                var di = dots1[i],
                    di1 = dots1[i + 1],
                    dj = dots2[j],
                    dj1 = dots2[j + 1],
                    ci = abs(di1.x - di.x) < .001 ? "y" : "x",
                    cj = abs(dj1.x - dj.x) < .001 ? "y" : "x",
                    is = intersect(di.x, di.y, di1.x, di1.y, dj.x, dj.y, dj1.x, dj1.y);
                if (is) {
                    if (xy[is.x.toFixed(4)] == is.y.toFixed(4)) {
                        continue;
                    }
                    xy[is.x.toFixed(4)] = is.y.toFixed(4);
                    var t1 = di.t + abs((is[ci] - di[ci]) / (di1[ci] - di[ci])) * (di1.t - di.t),
                        t2 = dj.t + abs((is[cj] - dj[cj]) / (dj1[cj] - dj[cj])) * (dj1.t - dj.t);
                    if (t1 >= 0 && t1 <= 1.001 && t2 >= 0 && t2 <= 1.001) {
                        if (justCount) {
                            res++;
                        } else {
                            res.push({
                                x: is.x,
                                y: is.y,
                                t1: mmin(t1, 1),
                                t2: mmin(t2, 1)
                            });
                        }
                    }
                }
            }
        }
        return res;
    }
    /*\
     * Raphael.pathIntersection
     [ method ]
     **
     * Utility method
     **
     * Finds intersections of two paths
     > Parameters
     - path1 (string) path string
     - path2 (string) path string
     = (array) dots of intersection
     o [
     o     {
     o         x: (number) x coordinate of the point
     o         y: (number) y coordinate of the point
     o         t1: (number) t value for segment of path1
     o         t2: (number) t value for segment of path2
     o         segment1: (number) order number for segment of path1
     o         segment2: (number) order number for segment of path2
     o         bez1: (array) eight coordinates representing beziér curve for the segment of path1
     o         bez2: (array) eight coordinates representing beziér curve for the segment of path2
     o     }
     o ]
    \*/
    R.pathIntersection = function (path1, path2) {
        return interPathHelper(path1, path2);
    };
    R.pathIntersectionNumber = function (path1, path2) {
        return interPathHelper(path1, path2, 1);
    };
    function interPathHelper(path1, path2, justCount) {
        path1 = R._path2curve(path1);
        path2 = R._path2curve(path2);
        var x1, y1, x2, y2, x1m, y1m, x2m, y2m, bez1, bez2,
            res = justCount ? 0 : [];
        for (var i = 0, ii = path1.length; i < ii; i++) {
            var pi = path1[i];
            if (pi[0] == "M") {
                x1 = x1m = pi[1];
                y1 = y1m = pi[2];
            } else {
                if (pi[0] == "C") {
                    bez1 = [x1, y1].concat(pi.slice(1));
                    x1 = bez1[6];
                    y1 = bez1[7];
                } else {
                    bez1 = [x1, y1, x1, y1, x1m, y1m, x1m, y1m];
                    x1 = x1m;
                    y1 = y1m;
                }
                for (var j = 0, jj = path2.length; j < jj; j++) {
                    var pj = path2[j];
                    if (pj[0] == "M") {
                        x2 = x2m = pj[1];
                        y2 = y2m = pj[2];
                    } else {
                        if (pj[0] == "C") {
                            bez2 = [x2, y2].concat(pj.slice(1));
                            x2 = bez2[6];
                            y2 = bez2[7];
                        } else {
                            bez2 = [x2, y2, x2, y2, x2m, y2m, x2m, y2m];
                            x2 = x2m;
                            y2 = y2m;
                        }
                        var intr = interHelper(bez1, bez2, justCount);
                        if (justCount) {
                            res += intr;
                        } else {
                            for (var k = 0, kk = intr.length; k < kk; k++) {
                                intr[k].segment1 = i;
                                intr[k].segment2 = j;
                                intr[k].bez1 = bez1;
                                intr[k].bez2 = bez2;
                            }
                            res = res.concat(intr);
                        }
                    }
                }
            }
        }
        return res;
    }
    /*\
     * Raphael.isPointInsidePath
     [ method ]
     **
     * Utility method
     **
     * Returns `true` if given point is inside a given closed path.
     > Parameters
     - path (string) path string
     - x (number) x of the point
     - y (number) y of the point
     = (boolean) true, if point is inside the path
    \*/
    R.isPointInsidePath = function (path, x, y) {
        var bbox = R.pathBBox(path);
        return R.isPointInsideBBox(bbox, x, y) &&
               interPathHelper(path, [["M", x, y], ["H", bbox.x2 + 10]], 1) % 2 == 1;
    };
    R._removedFactory = function (methodname) {
        return function () {
            eve("raphael.log", null, "Rapha\xebl: you are calling to method \u201c" + methodname + "\u201d of removed object", methodname);
        };
    };
    /*\
     * Raphael.pathBBox
     [ method ]
     **
     * Utility method
     **
     * Return bounding box of a given path
     > Parameters
     - path (string) path string
     = (object) bounding box
     o {
     o     x: (number) x coordinate of the left top point of the box
     o     y: (number) y coordinate of the left top point of the box
     o     x2: (number) x coordinate of the right bottom point of the box
     o     y2: (number) y coordinate of the right bottom point of the box
     o     width: (number) width of the box
     o     height: (number) height of the box
     o     cx: (number) x coordinate of the center of the box
     o     cy: (number) y coordinate of the center of the box
     o }
    \*/
    var pathDimensions = R.pathBBox = function (path) {
        var pth = paths(path);
        if (pth.bbox) {
            return clone(pth.bbox);
        }
        if (!path) {
            return {x: 0, y: 0, width: 0, height: 0, x2: 0, y2: 0};
        }
        path = path2curve(path);
        var x = 0,
            y = 0,
            X = [],
            Y = [],
            p;
        for (var i = 0, ii = path.length; i < ii; i++) {
            p = path[i];
            if (p[0] == "M") {
                x = p[1];
                y = p[2];
                X.push(x);
                Y.push(y);
            } else {
                var dim = curveDim(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
                X = X[concat](dim.min.x, dim.max.x);
                Y = Y[concat](dim.min.y, dim.max.y);
                x = p[5];
                y = p[6];
            }
        }
        var xmin = mmin[apply](0, X),
            ymin = mmin[apply](0, Y),
            xmax = mmax[apply](0, X),
            ymax = mmax[apply](0, Y),
            width = xmax - xmin,
            height = ymax - ymin,
                bb = {
                x: xmin,
                y: ymin,
                x2: xmax,
                y2: ymax,
                width: width,
                height: height,
                cx: xmin + width / 2,
                cy: ymin + height / 2
            };
        pth.bbox = clone(bb);
        return bb;
    },
        pathClone = function (pathArray) {
            var res = clone(pathArray);
            res.toString = R._path2string;
            return res;
        },
        pathToRelative = R._pathToRelative = function (pathArray) {
            var pth = paths(pathArray);
            if (pth.rel) {
                return pathClone(pth.rel);
            }
            if (!R.is(pathArray, array) || !R.is(pathArray && pathArray[0], array)) { // rough assumption
                pathArray = R.parsePathString(pathArray);
            }
            var res = [],
                x = 0,
                y = 0,
                mx = 0,
                my = 0,
                start = 0;
            if (pathArray[0][0] == "M") {
                x = pathArray[0][1];
                y = pathArray[0][2];
                mx = x;
                my = y;
                start++;
                res.push(["M", x, y]);
            }
            for (var i = start, ii = pathArray.length; i < ii; i++) {
                var r = res[i] = [],
                    pa = pathArray[i];
                if (pa[0] != lowerCase.call(pa[0])) {
                    r[0] = lowerCase.call(pa[0]);
                    switch (r[0]) {
                        case "a":
                            r[1] = pa[1];
                            r[2] = pa[2];
                            r[3] = pa[3];
                            r[4] = pa[4];
                            r[5] = pa[5];
                            r[6] = +(pa[6] - x).toFixed(3);
                            r[7] = +(pa[7] - y).toFixed(3);
                            break;
                        case "v":
                            r[1] = +(pa[1] - y).toFixed(3);
                            break;
                        case "m":
                            mx = pa[1];
                            my = pa[2];
                        default:
                            for (var j = 1, jj = pa.length; j < jj; j++) {
                                r[j] = +(pa[j] - ((j % 2) ? x : y)).toFixed(3);
                            }
                    }
                } else {
                    r = res[i] = [];
                    if (pa[0] == "m") {
                        mx = pa[1] + x;
                        my = pa[2] + y;
                    }
                    for (var k = 0, kk = pa.length; k < kk; k++) {
                        res[i][k] = pa[k];
                    }
                }
                var len = res[i].length;
                switch (res[i][0]) {
                    case "z":
                        x = mx;
                        y = my;
                        break;
                    case "h":
                        x += +res[i][len - 1];
                        break;
                    case "v":
                        y += +res[i][len - 1];
                        break;
                    default:
                        x += +res[i][len - 2];
                        y += +res[i][len - 1];
                }
            }
            res.toString = R._path2string;
            pth.rel = pathClone(res);
            return res;
        },
        pathToAbsolute = R._pathToAbsolute = function (pathArray) {
            var pth = paths(pathArray);
            if (pth.abs) {
                return pathClone(pth.abs);
            }
            if (!R.is(pathArray, array) || !R.is(pathArray && pathArray[0], array)) { // rough assumption
                pathArray = R.parsePathString(pathArray);
            }
            if (!pathArray || !pathArray.length) {
                return [["M", 0, 0]];
            }
            var res = [],
                x = 0,
                y = 0,
                mx = 0,
                my = 0,
                start = 0;
            if (pathArray[0][0] == "M") {
                x = +pathArray[0][1];
                y = +pathArray[0][2];
                mx = x;
                my = y;
                start++;
                res[0] = ["M", x, y];
            }
            var crz = pathArray.length == 3 && pathArray[0][0] == "M" && pathArray[1][0].toUpperCase() == "R" && pathArray[2][0].toUpperCase() == "Z";
            for (var r, pa, i = start, ii = pathArray.length; i < ii; i++) {
                res.push(r = []);
                pa = pathArray[i];
                if (pa[0] != upperCase.call(pa[0])) {
                    r[0] = upperCase.call(pa[0]);
                    switch (r[0]) {
                        case "A":
                            r[1] = pa[1];
                            r[2] = pa[2];
                            r[3] = pa[3];
                            r[4] = pa[4];
                            r[5] = pa[5];
                            r[6] = +(pa[6] + x);
                            r[7] = +(pa[7] + y);
                            break;
                        case "V":
                            r[1] = +pa[1] + y;
                            break;
                        case "H":
                            r[1] = +pa[1] + x;
                            break;
                        case "R":
                            var dots = [x, y][concat](pa.slice(1));
                            for (var j = 2, jj = dots.length; j < jj; j++) {
                                dots[j] = +dots[j] + x;
                                dots[++j] = +dots[j] + y;
                            }
                            res.pop();
                            res = res[concat](catmullRom2bezier(dots, crz));
                            break;
                        case "M":
                            mx = +pa[1] + x;
                            my = +pa[2] + y;
                        default:
                            for (j = 1, jj = pa.length; j < jj; j++) {
                                r[j] = +pa[j] + ((j % 2) ? x : y);
                            }
                    }
                } else if (pa[0] == "R") {
                    dots = [x, y][concat](pa.slice(1));
                    res.pop();
                    res = res[concat](catmullRom2bezier(dots, crz));
                    r = ["R"][concat](pa.slice(-2));
                } else {
                    for (var k = 0, kk = pa.length; k < kk; k++) {
                        r[k] = pa[k];
                    }
                }
                switch (r[0]) {
                    case "Z":
                        x = mx;
                        y = my;
                        break;
                    case "H":
                        x = r[1];
                        break;
                    case "V":
                        y = r[1];
                        break;
                    case "M":
                        mx = r[r.length - 2];
                        my = r[r.length - 1];
                    default:
                        x = r[r.length - 2];
                        y = r[r.length - 1];
                }
            }
            res.toString = R._path2string;
            pth.abs = pathClone(res);
            return res;
        },
        l2c = function (x1, y1, x2, y2) {
            return [x1, y1, x2, y2, x2, y2];
        },
        q2c = function (x1, y1, ax, ay, x2, y2) {
            var _13 = 1 / 3,
                _23 = 2 / 3;
            return [
                    _13 * x1 + _23 * ax,
                    _13 * y1 + _23 * ay,
                    _13 * x2 + _23 * ax,
                    _13 * y2 + _23 * ay,
                    x2,
                    y2
                ];
        },
        a2c = function (x1, y1, rx, ry, angle, large_arc_flag, sweep_flag, x2, y2, recursive) {
            // for more information of where this math came from visit:
            // http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
            var _120 = PI * 120 / 180,
                rad = PI / 180 * (+angle || 0),
                res = [],
                xy,
                rotate = cacher(function (x, y, rad) {
                    var X = x * math.cos(rad) - y * math.sin(rad),
                        Y = x * math.sin(rad) + y * math.cos(rad);
                    return {x: X, y: Y};
                });
            if (!recursive) {
                xy = rotate(x1, y1, -rad);
                x1 = xy.x;
                y1 = xy.y;
                xy = rotate(x2, y2, -rad);
                x2 = xy.x;
                y2 = xy.y;
                var cos = math.cos(PI / 180 * angle),
                    sin = math.sin(PI / 180 * angle),
                    x = (x1 - x2) / 2,
                    y = (y1 - y2) / 2;
                var h = (x * x) / (rx * rx) + (y * y) / (ry * ry);
                if (h > 1) {
                    h = math.sqrt(h);
                    rx = h * rx;
                    ry = h * ry;
                }
                var rx2 = rx * rx,
                    ry2 = ry * ry,
                    k = (large_arc_flag == sweep_flag ? -1 : 1) *
                        math.sqrt(abs((rx2 * ry2 - rx2 * y * y - ry2 * x * x) / (rx2 * y * y + ry2 * x * x))),
                    cx = k * rx * y / ry + (x1 + x2) / 2,
                    cy = k * -ry * x / rx + (y1 + y2) / 2,
                    f1 = math.asin(((y1 - cy) / ry).toFixed(9)),
                    f2 = math.asin(((y2 - cy) / ry).toFixed(9));

                f1 = x1 < cx ? PI - f1 : f1;
                f2 = x2 < cx ? PI - f2 : f2;
                f1 < 0 && (f1 = PI * 2 + f1);
                f2 < 0 && (f2 = PI * 2 + f2);
                if (sweep_flag && f1 > f2) {
                    f1 = f1 - PI * 2;
                }
                if (!sweep_flag && f2 > f1) {
                    f2 = f2 - PI * 2;
                }
            } else {
                f1 = recursive[0];
                f2 = recursive[1];
                cx = recursive[2];
                cy = recursive[3];
            }
            var df = f2 - f1;
            if (abs(df) > _120) {
                var f2old = f2,
                    x2old = x2,
                    y2old = y2;
                f2 = f1 + _120 * (sweep_flag && f2 > f1 ? 1 : -1);
                x2 = cx + rx * math.cos(f2);
                y2 = cy + ry * math.sin(f2);
                res = a2c(x2, y2, rx, ry, angle, 0, sweep_flag, x2old, y2old, [f2, f2old, cx, cy]);
            }
            df = f2 - f1;
            var c1 = math.cos(f1),
                s1 = math.sin(f1),
                c2 = math.cos(f2),
                s2 = math.sin(f2),
                t = math.tan(df / 4),
                hx = 4 / 3 * rx * t,
                hy = 4 / 3 * ry * t,
                m1 = [x1, y1],
                m2 = [x1 + hx * s1, y1 - hy * c1],
                m3 = [x2 + hx * s2, y2 - hy * c2],
                m4 = [x2, y2];
            m2[0] = 2 * m1[0] - m2[0];
            m2[1] = 2 * m1[1] - m2[1];
            if (recursive) {
                return [m2, m3, m4][concat](res);
            } else {
                res = [m2, m3, m4][concat](res).join()[split](",");
                var newres = [];
                for (var i = 0, ii = res.length; i < ii; i++) {
                    newres[i] = i % 2 ? rotate(res[i - 1], res[i], rad).y : rotate(res[i], res[i + 1], rad).x;
                }
                return newres;
            }
        },
        findDotAtSegment = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
            var t1 = 1 - t;
            return {
                x: pow(t1, 3) * p1x + pow(t1, 2) * 3 * t * c1x + t1 * 3 * t * t * c2x + pow(t, 3) * p2x,
                y: pow(t1, 3) * p1y + pow(t1, 2) * 3 * t * c1y + t1 * 3 * t * t * c2y + pow(t, 3) * p2y
            };
        },
        curveDim = cacher(function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y) {
            var a = (c2x - 2 * c1x + p1x) - (p2x - 2 * c2x + c1x),
                b = 2 * (c1x - p1x) - 2 * (c2x - c1x),
                c = p1x - c1x,
                t1 = (-b + math.sqrt(b * b - 4 * a * c)) / 2 / a,
                t2 = (-b - math.sqrt(b * b - 4 * a * c)) / 2 / a,
                y = [p1y, p2y],
                x = [p1x, p2x],
                dot;
            abs(t1) > "1e12" && (t1 = .5);
            abs(t2) > "1e12" && (t2 = .5);
            if (t1 > 0 && t1 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t1);
                x.push(dot.x);
                y.push(dot.y);
            }
            if (t2 > 0 && t2 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t2);
                x.push(dot.x);
                y.push(dot.y);
            }
            a = (c2y - 2 * c1y + p1y) - (p2y - 2 * c2y + c1y);
            b = 2 * (c1y - p1y) - 2 * (c2y - c1y);
            c = p1y - c1y;
            t1 = (-b + math.sqrt(b * b - 4 * a * c)) / 2 / a;
            t2 = (-b - math.sqrt(b * b - 4 * a * c)) / 2 / a;
            abs(t1) > "1e12" && (t1 = .5);
            abs(t2) > "1e12" && (t2 = .5);
            if (t1 > 0 && t1 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t1);
                x.push(dot.x);
                y.push(dot.y);
            }
            if (t2 > 0 && t2 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t2);
                x.push(dot.x);
                y.push(dot.y);
            }
            return {
                min: {x: mmin[apply](0, x), y: mmin[apply](0, y)},
                max: {x: mmax[apply](0, x), y: mmax[apply](0, y)}
            };
        }),
        path2curve = R._path2curve = cacher(function (path, path2) {
            var pth = !path2 && paths(path);
            if (!path2 && pth.curve) {
                return pathClone(pth.curve);
            }
            var p = pathToAbsolute(path),
                p2 = path2 && pathToAbsolute(path2),
                attrs = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
                attrs2 = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
                processPath = function (path, d, pcom) {
                    var nx, ny;
                    if (!path) {
                        return ["C", d.x, d.y, d.x, d.y, d.x, d.y];
                    }
                    !(path[0] in {T:1, Q:1}) && (d.qx = d.qy = null);
                    switch (path[0]) {
                        case "M":
                            d.X = path[1];
                            d.Y = path[2];
                            break;
                        case "A":
                            path = ["C"][concat](a2c[apply](0, [d.x, d.y][concat](path.slice(1))));
                            break;
                        case "S":
                            if (pcom == "C" || pcom == "S") { // In "S" case we have to take into account, if the previous command is C/S.
                                nx = d.x * 2 - d.bx;          // And reflect the previous
                                ny = d.y * 2 - d.by;          // command's control point relative to the current point.
                            }
                            else {                            // or some else or nothing
                                nx = d.x;
                                ny = d.y;
                            }
                            path = ["C", nx, ny][concat](path.slice(1));
                            break;
                        case "T":
                            if (pcom == "Q" || pcom == "T") { // In "T" case we have to take into account, if the previous command is Q/T.
                                d.qx = d.x * 2 - d.qx;        // And make a reflection similar
                                d.qy = d.y * 2 - d.qy;        // to case "S".
                            }
                            else {                            // or something else or nothing
                                d.qx = d.x;
                                d.qy = d.y;
                            }
                            path = ["C"][concat](q2c(d.x, d.y, d.qx, d.qy, path[1], path[2]));
                            break;
                        case "Q":
                            d.qx = path[1];
                            d.qy = path[2];
                            path = ["C"][concat](q2c(d.x, d.y, path[1], path[2], path[3], path[4]));
                            break;
                        case "L":
                            path = ["C"][concat](l2c(d.x, d.y, path[1], path[2]));
                            break;
                        case "H":
                            path = ["C"][concat](l2c(d.x, d.y, path[1], d.y));
                            break;
                        case "V":
                            path = ["C"][concat](l2c(d.x, d.y, d.x, path[1]));
                            break;
                        case "Z":
                            path = ["C"][concat](l2c(d.x, d.y, d.X, d.Y));
                            break;
                    }
                    return path;
                },
                fixArc = function (pp, i) {
                    if (pp[i].length > 7) {
                        pp[i].shift();
                        var pi = pp[i];
                        while (pi.length) {
                            pp.splice(i++, 0, ["C"][concat](pi.splice(0, 6)));
                        }
                        pp.splice(i, 1);
                        ii = mmax(p.length, p2 && p2.length || 0);
                    }
                },
                fixM = function (path1, path2, a1, a2, i) {
                    if (path1 && path2 && path1[i][0] == "M" && path2[i][0] != "M") {
                        path2.splice(i, 0, ["M", a2.x, a2.y]);
                        a1.bx = 0;
                        a1.by = 0;
                        a1.x = path1[i][1];
                        a1.y = path1[i][2];
                        ii = mmax(p.length, p2 && p2.length || 0);
                    }
                };
            for (var i = 0, ii = mmax(p.length, p2 && p2.length || 0); i < ii; i++) {
                p[i] = processPath(p[i], attrs);
                fixArc(p, i);
                p2 && (p2[i] = processPath(p2[i], attrs2));
                p2 && fixArc(p2, i);
                fixM(p, p2, attrs, attrs2, i);
                fixM(p2, p, attrs2, attrs, i);
                var seg = p[i],
                    seg2 = p2 && p2[i],
                    seglen = seg.length,
                    seg2len = p2 && seg2.length;
                attrs.x = seg[seglen - 2];
                attrs.y = seg[seglen - 1];
                attrs.bx = toFloat(seg[seglen - 4]) || attrs.x;
                attrs.by = toFloat(seg[seglen - 3]) || attrs.y;
                attrs2.bx = p2 && (toFloat(seg2[seg2len - 4]) || attrs2.x);
                attrs2.by = p2 && (toFloat(seg2[seg2len - 3]) || attrs2.y);
                attrs2.x = p2 && seg2[seg2len - 2];
                attrs2.y = p2 && seg2[seg2len - 1];
            }
            if (!p2) {
                pth.curve = pathClone(p);
            }
            return p2 ? [p, p2] : p;
        }, null, pathClone),
        parseDots = R._parseDots = cacher(function (gradient) {
            var dots = [];
            for (var i = 0, ii = gradient.length; i < ii; i++) {
                var dot = {},
                    par = gradient[i].match(/^([^:]*):?([\d\.]*)/);
                dot.color = R.getRGB(par[1]);
                if (dot.color.error) {
                    return null;
                }
                dot.color = dot.color.hex;
                par[2] && (dot.offset = par[2] + "%");
                dots.push(dot);
            }
            for (i = 1, ii = dots.length - 1; i < ii; i++) {
                if (!dots[i].offset) {
                    var start = toFloat(dots[i - 1].offset || 0),
                        end = 0;
                    for (var j = i + 1; j < ii; j++) {
                        if (dots[j].offset) {
                            end = dots[j].offset;
                            break;
                        }
                    }
                    if (!end) {
                        end = 100;
                        j = ii;
                    }
                    end = toFloat(end);
                    var d = (end - start) / (j - i + 1);
                    for (; i < j; i++) {
                        start += d;
                        dots[i].offset = start + "%";
                    }
                }
            }
            return dots;
        }),
        tear = R._tear = function (el, paper) {
            el == paper.top && (paper.top = el.prev);
            el == paper.bottom && (paper.bottom = el.next);
            el.next && (el.next.prev = el.prev);
            el.prev && (el.prev.next = el.next);
        },
        tofront = R._tofront = function (el, paper) {
            if (paper.top === el) {
                return;
            }
            tear(el, paper);
            el.next = null;
            el.prev = paper.top;
            paper.top.next = el;
            paper.top = el;
        },
        toback = R._toback = function (el, paper) {
            if (paper.bottom === el) {
                return;
            }
            tear(el, paper);
            el.next = paper.bottom;
            el.prev = null;
            paper.bottom.prev = el;
            paper.bottom = el;
        },
        insertafter = R._insertafter = function (el, el2, paper) {
            tear(el, paper);
            el2 == paper.top && (paper.top = el);
            el2.next && (el2.next.prev = el);
            el.next = el2.next;
            el.prev = el2;
            el2.next = el;
        },
        insertbefore = R._insertbefore = function (el, el2, paper) {
            tear(el, paper);
            el2 == paper.bottom && (paper.bottom = el);
            el2.prev && (el2.prev.next = el);
            el.prev = el2.prev;
            el2.prev = el;
            el.next = el2;
        },
        /*\
         * Raphael.toMatrix
         [ method ]
         **
         * Utility method
         **
         * Returns matrix of transformations applied to a given path
         > Parameters
         - path (string) path string
         - transform (string|array) transformation string
         = (object) @Matrix
        \*/
        toMatrix = R.toMatrix = function (path, transform) {
            var bb = pathDimensions(path),
                el = {
                    _: {
                        transform: E
                    },
                    getBBox: function () {
                        return bb;
                    }
                };
            extractTransform(el, transform);
            return el.matrix;
        },
        /*\
         * Raphael.transformPath
         [ method ]
         **
         * Utility method
         **
         * Returns path transformed by a given transformation
         > Parameters
         - path (string) path string
         - transform (string|array) transformation string
         = (string) path
        \*/
        transformPath = R.transformPath = function (path, transform) {
            return mapPath(path, toMatrix(path, transform));
        },
        extractTransform = R._extractTransform = function (el, tstr) {
            if (tstr == null) {
                return el._.transform;
            }
            tstr = Str(tstr).replace(/\.{3}|\u2026/g, el._.transform || E);
            var tdata = R.parseTransformString(tstr),
                deg = 0,
                dx = 0,
                dy = 0,
                sx = 1,
                sy = 1,
                _ = el._,
                m = new Matrix;
            _.transform = tdata || [];
            if (tdata) {
                for (var i = 0, ii = tdata.length; i < ii; i++) {
                    var t = tdata[i],
                        tlen = t.length,
                        command = Str(t[0]).toLowerCase(),
                        absolute = t[0] != command,
                        inver = absolute ? m.invert() : 0,
                        x1,
                        y1,
                        x2,
                        y2,
                        bb;
                    if (command == "t" && tlen == 3) {
                        if (absolute) {
                            x1 = inver.x(0, 0);
                            y1 = inver.y(0, 0);
                            x2 = inver.x(t[1], t[2]);
                            y2 = inver.y(t[1], t[2]);
                            m.translate(x2 - x1, y2 - y1);
                        } else {
                            m.translate(t[1], t[2]);
                        }
                    } else if (command == "r") {
                        if (tlen == 2) {
                            bb = bb || el.getBBox(1);
                            m.rotate(t[1], bb.x + bb.width / 2, bb.y + bb.height / 2);
                            deg += t[1];
                        } else if (tlen == 4) {
                            if (absolute) {
                                x2 = inver.x(t[2], t[3]);
                                y2 = inver.y(t[2], t[3]);
                                m.rotate(t[1], x2, y2);
                            } else {
                                m.rotate(t[1], t[2], t[3]);
                            }
                            deg += t[1];
                        }
                    } else if (command == "s") {
                        if (tlen == 2 || tlen == 3) {
                            bb = bb || el.getBBox(1);
                            m.scale(t[1], t[tlen - 1], bb.x + bb.width / 2, bb.y + bb.height / 2);
                            sx *= t[1];
                            sy *= t[tlen - 1];
                        } else if (tlen == 5) {
                            if (absolute) {
                                x2 = inver.x(t[3], t[4]);
                                y2 = inver.y(t[3], t[4]);
                                m.scale(t[1], t[2], x2, y2);
                            } else {
                                m.scale(t[1], t[2], t[3], t[4]);
                            }
                            sx *= t[1];
                            sy *= t[2];
                        }
                    } else if (command == "m" && tlen == 7) {
                        m.add(t[1], t[2], t[3], t[4], t[5], t[6]);
                    }
                    _.dirtyT = 1;
                    el.matrix = m;
                }
            }

            /*\
             * Element.matrix
             [ property (object) ]
             **
             * Keeps @Matrix object, which represents element transformation
            \*/
            el.matrix = m;

            _.sx = sx;
            _.sy = sy;
            _.deg = deg;
            _.dx = dx = m.e;
            _.dy = dy = m.f;

            if (sx == 1 && sy == 1 && !deg && _.bbox) {
                _.bbox.x += +dx;
                _.bbox.y += +dy;
            } else {
                _.dirtyT = 1;
            }
        },
        getEmpty = function (item) {
            var l = item[0];
            switch (l.toLowerCase()) {
                case "t": return [l, 0, 0];
                case "m": return [l, 1, 0, 0, 1, 0, 0];
                case "r": if (item.length == 4) {
                    return [l, 0, item[2], item[3]];
                } else {
                    return [l, 0];
                }
                case "s": if (item.length == 5) {
                    return [l, 1, 1, item[3], item[4]];
                } else if (item.length == 3) {
                    return [l, 1, 1];
                } else {
                    return [l, 1];
                }
            }
        },
        equaliseTransform = R._equaliseTransform = function (t1, t2) {
            t2 = Str(t2).replace(/\.{3}|\u2026/g, t1);
            t1 = R.parseTransformString(t1) || [];
            t2 = R.parseTransformString(t2) || [];
            var maxlength = mmax(t1.length, t2.length),
                from = [],
                to = [],
                i = 0, j, jj,
                tt1, tt2;
            for (; i < maxlength; i++) {
                tt1 = t1[i] || getEmpty(t2[i]);
                tt2 = t2[i] || getEmpty(tt1);
                if ((tt1[0] != tt2[0]) ||
                    (tt1[0].toLowerCase() == "r" && (tt1[2] != tt2[2] || tt1[3] != tt2[3])) ||
                    (tt1[0].toLowerCase() == "s" && (tt1[3] != tt2[3] || tt1[4] != tt2[4]))
                    ) {
                    return;
                }
                from[i] = [];
                to[i] = [];
                for (j = 0, jj = mmax(tt1.length, tt2.length); j < jj; j++) {
                    j in tt1 && (from[i][j] = tt1[j]);
                    j in tt2 && (to[i][j] = tt2[j]);
                }
            }
            return {
                from: from,
                to: to
            };
        };
    R._getContainer = function (x, y, w, h) {
        var container;
        container = h == null && !R.is(x, "object") ? g.doc.getElementById(x) : x;
        if (container == null) {
            return;
        }
        if (container.tagName) {
            if (y == null) {
                return {
                    container: container,
                    width: container.style.pixelWidth || container.offsetWidth,
                    height: container.style.pixelHeight || container.offsetHeight
                };
            } else {
                return {
                    container: container,
                    width: y,
                    height: w
                };
            }
        }
        return {
            container: 1,
            x: x,
            y: y,
            width: w,
            height: h
        };
    };
    /*\
     * Raphael.pathToRelative
     [ method ]
     **
     * Utility method
     **
     * Converts path to relative form
     > Parameters
     - pathString (string|array) path string or array of segments
     = (array) array of segments.
    \*/
    R.pathToRelative = pathToRelative;
    R._engine = {};
    /*\
     * Raphael.path2curve
     [ method ]
     **
     * Utility method
     **
     * Converts path to a new path where all segments are cubic bezier curves.
     > Parameters
     - pathString (string|array) path string or array of segments
     = (array) array of segments.
    \*/
    R.path2curve = path2curve;
    /*\
     * Raphael.matrix
     [ method ]
     **
     * Utility method
     **
     * Returns matrix based on given parameters.
     > Parameters
     - a (number)
     - b (number)
     - c (number)
     - d (number)
     - e (number)
     - f (number)
     = (object) @Matrix
    \*/
    R.matrix = function (a, b, c, d, e, f) {
        return new Matrix(a, b, c, d, e, f);
    };
    function Matrix(a, b, c, d, e, f) {
        if (a != null) {
            this.a = +a;
            this.b = +b;
            this.c = +c;
            this.d = +d;
            this.e = +e;
            this.f = +f;
        } else {
            this.a = 1;
            this.b = 0;
            this.c = 0;
            this.d = 1;
            this.e = 0;
            this.f = 0;
        }
    }
    (function (matrixproto) {
        /*\
         * Matrix.add
         [ method ]
         **
         * Adds given matrix to existing one.
         > Parameters
         - a (number)
         - b (number)
         - c (number)
         - d (number)
         - e (number)
         - f (number)
         or
         - matrix (object) @Matrix
        \*/
        matrixproto.add = function (a, b, c, d, e, f) {
            var out = [[], [], []],
                m = [[this.a, this.c, this.e], [this.b, this.d, this.f], [0, 0, 1]],
                matrix = [[a, c, e], [b, d, f], [0, 0, 1]],
                x, y, z, res;

            if (a && a instanceof Matrix) {
                matrix = [[a.a, a.c, a.e], [a.b, a.d, a.f], [0, 0, 1]];
            }

            for (x = 0; x < 3; x++) {
                for (y = 0; y < 3; y++) {
                    res = 0;
                    for (z = 0; z < 3; z++) {
                        res += m[x][z] * matrix[z][y];
                    }
                    out[x][y] = res;
                }
            }
            this.a = out[0][0];
            this.b = out[1][0];
            this.c = out[0][1];
            this.d = out[1][1];
            this.e = out[0][2];
            this.f = out[1][2];
        };
        /*\
         * Matrix.invert
         [ method ]
         **
         * Returns inverted version of the matrix
         = (object) @Matrix
        \*/
        matrixproto.invert = function () {
            var me = this,
                x = me.a * me.d - me.b * me.c;
            return new Matrix(me.d / x, -me.b / x, -me.c / x, me.a / x, (me.c * me.f - me.d * me.e) / x, (me.b * me.e - me.a * me.f) / x);
        };
        /*\
         * Matrix.clone
         [ method ]
         **
         * Returns copy of the matrix
         = (object) @Matrix
        \*/
        matrixproto.clone = function () {
            return new Matrix(this.a, this.b, this.c, this.d, this.e, this.f);
        };
        /*\
         * Matrix.translate
         [ method ]
         **
         * Translate the matrix
         > Parameters
         - x (number)
         - y (number)
        \*/
        matrixproto.translate = function (x, y) {
            this.add(1, 0, 0, 1, x, y);
        };
        /*\
         * Matrix.scale
         [ method ]
         **
         * Scales the matrix
         > Parameters
         - x (number)
         - y (number) #optional
         - cx (number) #optional
         - cy (number) #optional
        \*/
        matrixproto.scale = function (x, y, cx, cy) {
            y == null && (y = x);
            (cx || cy) && this.add(1, 0, 0, 1, cx, cy);
            this.add(x, 0, 0, y, 0, 0);
            (cx || cy) && this.add(1, 0, 0, 1, -cx, -cy);
        };
        /*\
         * Matrix.rotate
         [ method ]
         **
         * Rotates the matrix
         > Parameters
         - a (number)
         - x (number)
         - y (number)
        \*/
        matrixproto.rotate = function (a, x, y) {
            a = R.rad(a);
            x = x || 0;
            y = y || 0;
            var cos = +math.cos(a).toFixed(9),
                sin = +math.sin(a).toFixed(9);
            this.add(cos, sin, -sin, cos, x, y);
            this.add(1, 0, 0, 1, -x, -y);
        };
        /*\
         * Matrix.x
         [ method ]
         **
         * Return x coordinate for given point after transformation described by the matrix. See also @Matrix.y
         > Parameters
         - x (number)
         - y (number)
         = (number) x
        \*/
        matrixproto.x = function (x, y) {
            return x * this.a + y * this.c + this.e;
        };
        /*\
         * Matrix.y
         [ method ]
         **
         * Return y coordinate for given point after transformation described by the matrix. See also @Matrix.x
         > Parameters
         - x (number)
         - y (number)
         = (number) y
        \*/
        matrixproto.y = function (x, y) {
            return x * this.b + y * this.d + this.f;
        };
        matrixproto.get = function (i) {
            return +this[Str.fromCharCode(97 + i)].toFixed(4);
        };
        matrixproto.toString = function () {
            return R.svg ?
                "matrix(" + [this.get(0), this.get(1), this.get(2), this.get(3), this.get(4), this.get(5)].join() + ")" :
                [this.get(0), this.get(2), this.get(1), this.get(3), 0, 0].join();
        };
        matrixproto.toFilter = function () {
            return "progid:DXImageTransform.Microsoft.Matrix(M11=" + this.get(0) +
                ", M12=" + this.get(2) + ", M21=" + this.get(1) + ", M22=" + this.get(3) +
                ", Dx=" + this.get(4) + ", Dy=" + this.get(5) + ", sizingmethod='auto expand')";
        };
        matrixproto.offset = function () {
            return [this.e.toFixed(4), this.f.toFixed(4)];
        };
        function norm(a) {
            return a[0] * a[0] + a[1] * a[1];
        }
        function normalize(a) {
            var mag = math.sqrt(norm(a));
            a[0] && (a[0] /= mag);
            a[1] && (a[1] /= mag);
        }
        /*\
         * Matrix.split
         [ method ]
         **
         * Splits matrix into primitive transformations
         = (object) in format:
         o dx (number) translation by x
         o dy (number) translation by y
         o scalex (number) scale by x
         o scaley (number) scale by y
         o shear (number) shear
         o rotate (number) rotation in deg
         o isSimple (boolean) could it be represented via simple transformations
        \*/
        matrixproto.split = function () {
            var out = {};
            // translation
            out.dx = this.e;
            out.dy = this.f;

            // scale and shear
            var row = [[this.a, this.c], [this.b, this.d]];
            out.scalex = math.sqrt(norm(row[0]));
            normalize(row[0]);

            out.shear = row[0][0] * row[1][0] + row[0][1] * row[1][1];
            row[1] = [row[1][0] - row[0][0] * out.shear, row[1][1] - row[0][1] * out.shear];

            out.scaley = math.sqrt(norm(row[1]));
            normalize(row[1]);
            out.shear /= out.scaley;

            // rotation
            var sin = -row[0][1],
                cos = row[1][1];
            if (cos < 0) {
                out.rotate = R.deg(math.acos(cos));
                if (sin < 0) {
                    out.rotate = 360 - out.rotate;
                }
            } else {
                out.rotate = R.deg(math.asin(sin));
            }

            out.isSimple = !+out.shear.toFixed(9) && (out.scalex.toFixed(9) == out.scaley.toFixed(9) || !out.rotate);
            out.isSuperSimple = !+out.shear.toFixed(9) && out.scalex.toFixed(9) == out.scaley.toFixed(9) && !out.rotate;
            out.noRotation = !+out.shear.toFixed(9) && !out.rotate;
            return out;
        };
        /*\
         * Matrix.toTransformString
         [ method ]
         **
         * Return transform string that represents given matrix
         = (string) transform string
        \*/
        matrixproto.toTransformString = function (shorter) {
            var s = shorter || this[split]();
            if (s.isSimple) {
                s.scalex = +s.scalex.toFixed(4);
                s.scaley = +s.scaley.toFixed(4);
                s.rotate = +s.rotate.toFixed(4);
                return  (s.dx || s.dy ? "t" + [s.dx, s.dy] : E) +
                        (s.scalex != 1 || s.scaley != 1 ? "s" + [s.scalex, s.scaley, 0, 0] : E) +
                        (s.rotate ? "r" + [s.rotate, 0, 0] : E);
            } else {
                return "m" + [this.get(0), this.get(1), this.get(2), this.get(3), this.get(4), this.get(5)];
            }
        };
    })(Matrix.prototype);

    // WebKit rendering bug workaround method
    var version = navigator.userAgent.match(/Version\/(.*?)\s/) || navigator.userAgent.match(/Chrome\/(\d+)/);
    if ((navigator.vendor == "Apple Computer, Inc.") && (version && version[1] < 4 || navigator.platform.slice(0, 2) == "iP") ||
        (navigator.vendor == "Google Inc." && version && version[1] < 8)) {
        /*\
         * Paper.safari
         [ method ]
         **
         * There is an inconvenient rendering bug in Safari (WebKit):
         * sometimes the rendering should be forced.
         * This method should help with dealing with this bug.
        \*/
        paperproto.safari = function () {
            var rect = this.rect(-99, -99, this.width + 99, this.height + 99).attr({stroke: "none"});
            setTimeout(function () {rect.remove();});
        };
    } else {
        paperproto.safari = fun;
    }

    var preventDefault = function () {
        this.returnValue = false;
    },
    preventTouch = function () {
        return this.originalEvent.preventDefault();
    },
    stopPropagation = function () {
        this.cancelBubble = true;
    },
    stopTouch = function () {
        return this.originalEvent.stopPropagation();
    },
    getEventPosition = function (e) {
        var scrollY = g.doc.documentElement.scrollTop || g.doc.body.scrollTop,
            scrollX = g.doc.documentElement.scrollLeft || g.doc.body.scrollLeft;

        return {
            x: e.clientX + scrollX,
            y: e.clientY + scrollY
        };
    },
    addEvent = (function () {
        if (g.doc.addEventListener) {
            return function (obj, type, fn, element) {
                var f = function (e) {
                    var pos = getEventPosition(e);
                    return fn.call(element, e, pos.x, pos.y);
                };
                obj.addEventListener(type, f, false);

                if (supportsTouch && touchMap[type]) {
                    var _f = function (e) {
                        var pos = getEventPosition(e),
                            olde = e;

                        for (var i = 0, ii = e.targetTouches && e.targetTouches.length; i < ii; i++) {
                            if (e.targetTouches[i].target == obj) {
                                e = e.targetTouches[i];
                                e.originalEvent = olde;
                                e.preventDefault = preventTouch;
                                e.stopPropagation = stopTouch;
                                break;
                            }
                        }

                        return fn.call(element, e, pos.x, pos.y);
                    };
                    obj.addEventListener(touchMap[type], _f, false);
                }

                return function () {
                    obj.removeEventListener(type, f, false);

                    if (supportsTouch && touchMap[type])
                        obj.removeEventListener(touchMap[type], f, false);

                    return true;
                };
            };
        } else if (g.doc.attachEvent) {
            return function (obj, type, fn, element) {
                var f = function (e) {
                    e = e || g.win.event;
                    var scrollY = g.doc.documentElement.scrollTop || g.doc.body.scrollTop,
                        scrollX = g.doc.documentElement.scrollLeft || g.doc.body.scrollLeft,
                        x = e.clientX + scrollX,
                        y = e.clientY + scrollY;
                    e.preventDefault = e.preventDefault || preventDefault;
                    e.stopPropagation = e.stopPropagation || stopPropagation;
                    return fn.call(element, e, x, y);
                };
                obj.attachEvent("on" + type, f);
                var detacher = function () {
                    obj.detachEvent("on" + type, f);
                    return true;
                };
                return detacher;
            };
        }
    })(),
    drag = [],
    dragMove = function (e) {
        var x = e.clientX,
            y = e.clientY,
            scrollY = g.doc.documentElement.scrollTop || g.doc.body.scrollTop,
            scrollX = g.doc.documentElement.scrollLeft || g.doc.body.scrollLeft,
            dragi,
            j = drag.length;
        while (j--) {
            dragi = drag[j];
            if (supportsTouch && e.touches) {
                var i = e.touches.length,
                    touch;
                while (i--) {
                    touch = e.touches[i];
                    if (touch.identifier == dragi.el._drag.id) {
                        x = touch.clientX;
                        y = touch.clientY;
                        (e.originalEvent ? e.originalEvent : e).preventDefault();
                        break;
                    }
                }
            } else {
                e.preventDefault();
            }
            var node = dragi.el.node,
                o,
                next = node.nextSibling,
                parent = node.parentNode,
                display = node.style.display;
            g.win.opera && parent.removeChild(node);
            node.style.display = "none";
            o = dragi.el.paper.getElementByPoint(x, y);
            node.style.display = display;
            g.win.opera && (next ? parent.insertBefore(node, next) : parent.appendChild(node));
            o && eve("raphael.drag.over." + dragi.el.id, dragi.el, o);
            x += scrollX;
            y += scrollY;
            eve("raphael.drag.move." + dragi.el.id, dragi.move_scope || dragi.el, x - dragi.el._drag.x, y - dragi.el._drag.y, x, y, e);
        }
    },
    dragUp = function (e) {
        R.unmousemove(dragMove).unmouseup(dragUp);
        var i = drag.length,
            dragi;
        while (i--) {
            dragi = drag[i];
            dragi.el._drag = {};
            eve("raphael.drag.end." + dragi.el.id, dragi.end_scope || dragi.start_scope || dragi.move_scope || dragi.el, e);
        }
        drag = [];
    },
    /*\
     * Raphael.el
     [ property (object) ]
     **
     * You can add your own method to elements. This is usefull when you want to hack default functionality or
     * want to wrap some common transformation or attributes in one method. In difference to canvas methods,
     * you can redefine element method at any time. Expending element methods wouldn’t affect set.
     > Usage
     | Raphael.el.red = function () {
     |     this.attr({fill: "#f00"});
     | };
     | // then use it
     | paper.circle(100, 100, 20).red();
    \*/
    elproto = R.el = {};
    /*\
     * Element.click
     [ method ]
     **
     * Adds event handler for click for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.unclick
     [ method ]
     **
     * Removes event handler for click for the element.
     > Parameters
     - handler (function) #optional handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.dblclick
     [ method ]
     **
     * Adds event handler for double click for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.undblclick
     [ method ]
     **
     * Removes event handler for double click for the element.
     > Parameters
     - handler (function) #optional handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.mousedown
     [ method ]
     **
     * Adds event handler for mousedown for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.unmousedown
     [ method ]
     **
     * Removes event handler for mousedown for the element.
     > Parameters
     - handler (function) #optional handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.mousemove
     [ method ]
     **
     * Adds event handler for mousemove for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.unmousemove
     [ method ]
     **
     * Removes event handler for mousemove for the element.
     > Parameters
     - handler (function) #optional handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.mouseout
     [ method ]
     **
     * Adds event handler for mouseout for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.unmouseout
     [ method ]
     **
     * Removes event handler for mouseout for the element.
     > Parameters
     - handler (function) #optional handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.mouseover
     [ method ]
     **
     * Adds event handler for mouseover for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.unmouseover
     [ method ]
     **
     * Removes event handler for mouseover for the element.
     > Parameters
     - handler (function) #optional handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.mouseup
     [ method ]
     **
     * Adds event handler for mouseup for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.unmouseup
     [ method ]
     **
     * Removes event handler for mouseup for the element.
     > Parameters
     - handler (function) #optional handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.touchstart
     [ method ]
     **
     * Adds event handler for touchstart for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.untouchstart
     [ method ]
     **
     * Removes event handler for touchstart for the element.
     > Parameters
     - handler (function) #optional handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.touchmove
     [ method ]
     **
     * Adds event handler for touchmove for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.untouchmove
     [ method ]
     **
     * Removes event handler for touchmove for the element.
     > Parameters
     - handler (function) #optional handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.touchend
     [ method ]
     **
     * Adds event handler for touchend for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.untouchend
     [ method ]
     **
     * Removes event handler for touchend for the element.
     > Parameters
     - handler (function) #optional handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.touchcancel
     [ method ]
     **
     * Adds event handler for touchcancel for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.untouchcancel
     [ method ]
     **
     * Removes event handler for touchcancel for the element.
     > Parameters
     - handler (function) #optional handler for the event
     = (object) @Element
    \*/
    for (var i = events.length; i--;) {
        (function (eventName) {
            R[eventName] = elproto[eventName] = function (fn, scope) {
                if (R.is(fn, "function")) {
                    this.events = this.events || [];
                    this.events.push({name: eventName, f: fn, unbind: addEvent(this.shape || this.node || g.doc, eventName, fn, scope || this)});
                }
                return this;
            };
            R["un" + eventName] = elproto["un" + eventName] = function (fn) {
                var events = this.events || [],
                    l = events.length;
                while (l--){
                    if (events[l].name == eventName && (R.is(fn, "undefined") || events[l].f == fn)) {
                        events[l].unbind();
                        events.splice(l, 1);
                        !events.length && delete this.events;
                    }
                }
                return this;
            };
        })(events[i]);
    }

    /*\
     * Element.data
     [ method ]
     **
     * Adds or retrieves given value asociated with given key.
     ** 
     * See also @Element.removeData
     > Parameters
     - key (string) key to store data
     - value (any) #optional value to store
     = (object) @Element
     * or, if value is not specified:
     = (any) value
     * or, if key and value are not specified:
     = (object) Key/value pairs for all the data associated with the element.
     > Usage
     | for (var i = 0, i < 5, i++) {
     |     paper.circle(10 + 15 * i, 10, 10)
     |          .attr({fill: "#000"})
     |          .data("i", i)
     |          .click(function () {
     |             alert(this.data("i"));
     |          });
     | }
    \*/
    elproto.data = function (key, value) {
        var data = eldata[this.id] = eldata[this.id] || {};
        if (arguments.length == 0) {
            return data;
        }
        if (arguments.length == 1) {
            if (R.is(key, "object")) {
                for (var i in key) if (key[has](i)) {
                    this.data(i, key[i]);
                }
                return this;
            }
            eve("raphael.data.get." + this.id, this, data[key], key);
            return data[key];
        }
        data[key] = value;
        eve("raphael.data.set." + this.id, this, value, key);
        return this;
    };
    /*\
     * Element.removeData
     [ method ]
     **
     * Removes value associated with an element by given key.
     * If key is not provided, removes all the data of the element.
     > Parameters
     - key (string) #optional key
     = (object) @Element
    \*/
    elproto.removeData = function (key) {
        if (key == null) {
            eldata[this.id] = {};
        } else {
            eldata[this.id] && delete eldata[this.id][key];
        }
        return this;
    };
     /*\
     * Element.getData
     [ method ]
     **
     * Retrieves the element data
     = (object) data
    \*/
    elproto.getData = function () {
        return clone(eldata[this.id] || {});
    };
    /*\
     * Element.hover
     [ method ]
     **
     * Adds event handlers for hover for the element.
     > Parameters
     - f_in (function) handler for hover in
     - f_out (function) handler for hover out
     - icontext (object) #optional context for hover in handler
     - ocontext (object) #optional context for hover out handler
     = (object) @Element
    \*/
    elproto.hover = function (f_in, f_out, scope_in, scope_out) {
        return this.mouseover(f_in, scope_in).mouseout(f_out, scope_out || scope_in);
    };
    /*\
     * Element.unhover
     [ method ]
     **
     * Removes event handlers for hover for the element.
     > Parameters
     - f_in (function) handler for hover in
     - f_out (function) handler for hover out
     = (object) @Element
    \*/
    elproto.unhover = function (f_in, f_out) {
        return this.unmouseover(f_in).unmouseout(f_out);
    };
    var draggable = [];
    /*\
     * Element.drag
     [ method ]
     **
     * Adds event handlers for drag of the element.
     > Parameters
     - onmove (function) handler for moving
     - onstart (function) handler for drag start
     - onend (function) handler for drag end
     - mcontext (object) #optional context for moving handler
     - scontext (object) #optional context for drag start handler
     - econtext (object) #optional context for drag end handler
     * Additionaly following `drag` events will be triggered: `drag.start.<id>` on start, 
     * `drag.end.<id>` on end and `drag.move.<id>` on every move. When element will be dragged over another element 
     * `drag.over.<id>` will be fired as well.
     *
     * Start event and start handler will be called in specified context or in context of the element with following parameters:
     o x (number) x position of the mouse
     o y (number) y position of the mouse
     o event (object) DOM event object
     * Move event and move handler will be called in specified context or in context of the element with following parameters:
     o dx (number) shift by x from the start point
     o dy (number) shift by y from the start point
     o x (number) x position of the mouse
     o y (number) y position of the mouse
     o event (object) DOM event object
     * End event and end handler will be called in specified context or in context of the element with following parameters:
     o event (object) DOM event object
     = (object) @Element
    \*/
    elproto.drag = function (onmove, onstart, onend, move_scope, start_scope, end_scope) {
        function start(e) {
            (e.originalEvent || e).preventDefault();
            var x = e.clientX,
                y = e.clientY,
                scrollY = g.doc.documentElement.scrollTop || g.doc.body.scrollTop,
                scrollX = g.doc.documentElement.scrollLeft || g.doc.body.scrollLeft;
            this._drag.id = e.identifier;
            if (supportsTouch && e.touches) {
                var i = e.touches.length, touch;
                while (i--) {
                    touch = e.touches[i];
                    this._drag.id = touch.identifier;
                    if (touch.identifier == this._drag.id) {
                        x = touch.clientX;
                        y = touch.clientY;
                        break;
                    }
                }
            }
            this._drag.x = x + scrollX;
            this._drag.y = y + scrollY;
            !drag.length && R.mousemove(dragMove).mouseup(dragUp);
            drag.push({el: this, move_scope: move_scope, start_scope: start_scope, end_scope: end_scope});
            onstart && eve.on("raphael.drag.start." + this.id, onstart);
            onmove && eve.on("raphael.drag.move." + this.id, onmove);
            onend && eve.on("raphael.drag.end." + this.id, onend);
            eve("raphael.drag.start." + this.id, start_scope || move_scope || this, e.clientX + scrollX, e.clientY + scrollY, e);
        }
        this._drag = {};
        draggable.push({el: this, start: start});
        this.mousedown(start);
        return this;
    };
    /*\
     * Element.onDragOver
     [ method ]
     **
     * Shortcut for assigning event handler for `drag.over.<id>` event, where id is id of the element (see @Element.id).
     > Parameters
     - f (function) handler for event, first argument would be the element you are dragging over
    \*/
    elproto.onDragOver = function (f) {
        f ? eve.on("raphael.drag.over." + this.id, f) : eve.unbind("raphael.drag.over." + this.id);
    };
    /*\
     * Element.undrag
     [ method ]
     **
     * Removes all drag event handlers from given element.
    \*/
    elproto.undrag = function () {
        var i = draggable.length;
        while (i--) if (draggable[i].el == this) {
            this.unmousedown(draggable[i].start);
            draggable.splice(i, 1);
            eve.unbind("raphael.drag.*." + this.id);
        }
        !draggable.length && R.unmousemove(dragMove).unmouseup(dragUp);
        drag = [];
    };
    /*\
     * Paper.circle
     [ method ]
     **
     * Draws a circle.
     **
     > Parameters
     **
     - x (number) x coordinate of the centre
     - y (number) y coordinate of the centre
     - r (number) radius
     = (object) Raphaël element object with type “circle”
     **
     > Usage
     | var c = paper.circle(50, 50, 40);
    \*/
    paperproto.circle = function (x, y, r) {
        var out = R._engine.circle(this, x || 0, y || 0, r || 0);
        this.__set__ && this.__set__.push(out);
        return out;
    };
    /*\
     * Paper.rect
     [ method ]
     *
     * Draws a rectangle.
     **
     > Parameters
     **
     - x (number) x coordinate of the top left corner
     - y (number) y coordinate of the top left corner
     - width (number) width
     - height (number) height
     - r (number) #optional radius for rounded corners, default is 0
     = (object) Raphaël element object with type “rect”
     **
     > Usage
     | // regular rectangle
     | var c = paper.rect(10, 10, 50, 50);
     | // rectangle with rounded corners
     | var c = paper.rect(40, 40, 50, 50, 10);
    \*/
    paperproto.rect = function (x, y, w, h, r) {
        var out = R._engine.rect(this, x || 0, y || 0, w || 0, h || 0, r || 0);
        this.__set__ && this.__set__.push(out);
        return out;
    };
    /*\
     * Paper.ellipse
     [ method ]
     **
     * Draws an ellipse.
     **
     > Parameters
     **
     - x (number) x coordinate of the centre
     - y (number) y coordinate of the centre
     - rx (number) horizontal radius
     - ry (number) vertical radius
     = (object) Raphaël element object with type “ellipse”
     **
     > Usage
     | var c = paper.ellipse(50, 50, 40, 20);
    \*/
    paperproto.ellipse = function (x, y, rx, ry) {
        var out = R._engine.ellipse(this, x || 0, y || 0, rx || 0, ry || 0);
        this.__set__ && this.__set__.push(out);
        return out;
    };
    /*\
     * Paper.path
     [ method ]
     **
     * Creates a path element by given path data string.
     > Parameters
     - pathString (string) #optional path string in SVG format.
     * Path string consists of one-letter commands, followed by comma seprarated arguments in numercal form. Example:
     | "M10,20L30,40"
     * Here we can see two commands: “M”, with arguments `(10, 20)` and “L” with arguments `(30, 40)`. Upper case letter mean command is absolute, lower case—relative.
     *
     # <p>Here is short list of commands available, for more details see <a href="http://www.w3.org/TR/SVG/paths.html#PathData" title="Details of a path's data attribute's format are described in the SVG specification.">SVG path string format</a>.</p>
     # <table><thead><tr><th>Command</th><th>Name</th><th>Parameters</th></tr></thead><tbody>
     # <tr><td>M</td><td>moveto</td><td>(x y)+</td></tr>
     # <tr><td>Z</td><td>closepath</td><td>(none)</td></tr>
     # <tr><td>L</td><td>lineto</td><td>(x y)+</td></tr>
     # <tr><td>H</td><td>horizontal lineto</td><td>x+</td></tr>
     # <tr><td>V</td><td>vertical lineto</td><td>y+</td></tr>
     # <tr><td>C</td><td>curveto</td><td>(x1 y1 x2 y2 x y)+</td></tr>
     # <tr><td>S</td><td>smooth curveto</td><td>(x2 y2 x y)+</td></tr>
     # <tr><td>Q</td><td>quadratic Bézier curveto</td><td>(x1 y1 x y)+</td></tr>
     # <tr><td>T</td><td>smooth quadratic Bézier curveto</td><td>(x y)+</td></tr>
     # <tr><td>A</td><td>elliptical arc</td><td>(rx ry x-axis-rotation large-arc-flag sweep-flag x y)+</td></tr>
     # <tr><td>R</td><td><a href="http://en.wikipedia.org/wiki/Catmull–Rom_spline#Catmull.E2.80.93Rom_spline">Catmull-Rom curveto</a>*</td><td>x1 y1 (x y)+</td></tr></tbody></table>
     * * “Catmull-Rom curveto” is a not standard SVG command and added in 2.0 to make life easier.
     * Note: there is a special case when path consist of just three commands: “M10,10R…z”. In this case path will smoothly connects to its beginning.
     > Usage
     | var c = paper.path("M10 10L90 90");
     | // draw a diagonal line:
     | // move to 10,10, line to 90,90
     * For example of path strings, check out these icons: http://raphaeljs.com/icons/
    \*/
    paperproto.path = function (pathString) {
        pathString && !R.is(pathString, string) && !R.is(pathString[0], array) && (pathString += E);
        var out = R._engine.path(R.format[apply](R, arguments), this);
        this.__set__ && this.__set__.push(out);
        return out;
    };
    /*\
     * Paper.image
     [ method ]
     **
     * Embeds an image into the surface.
     **
     > Parameters
     **
     - src (string) URI of the source image
     - x (number) x coordinate position
     - y (number) y coordinate position
     - width (number) width of the image
     - height (number) height of the image
     = (object) Raphaël element object with type “image”
     **
     > Usage
     | var c = paper.image("apple.png", 10, 10, 80, 80);
    \*/
    paperproto.image = function (src, x, y, w, h) {
        var out = R._engine.image(this, src || "about:blank", x || 0, y || 0, w || 0, h || 0);
        this.__set__ && this.__set__.push(out);
        return out;
    };
    /*\
     * Paper.text
     [ method ]
     **
     * Draws a text string. If you need line breaks, put “\n” in the string.
     **
     > Parameters
     **
     - x (number) x coordinate position
     - y (number) y coordinate position
     - text (string) The text string to draw
     = (object) Raphaël element object with type “text”
     **
     > Usage
     | var t = paper.text(50, 50, "Raphaël\nkicks\nbutt!");
    \*/
    paperproto.text = function (x, y, text) {
        var out = R._engine.text(this, x || 0, y || 0, Str(text));
        this.__set__ && this.__set__.push(out);
        return out;
    };
    /*\
     * Paper.set
     [ method ]
     **
     * Creates array-like object to keep and operate several elements at once.
     * Warning: it doesn’t create any elements for itself in the page, it just groups existing elements.
     * Sets act as pseudo elements — all methods available to an element can be used on a set.
     = (object) array-like object that represents set of elements
     **
     > Usage
     | var st = paper.set();
     | st.push(
     |     paper.circle(10, 10, 5),
     |     paper.circle(30, 10, 5)
     | );
     | st.attr({fill: "red"}); // changes the fill of both circles
    \*/
    paperproto.set = function (itemsArray) {
        !R.is(itemsArray, "array") && (itemsArray = Array.prototype.splice.call(arguments, 0, arguments.length));
        var out = new Set(itemsArray);
        this.__set__ && this.__set__.push(out);
        out["paper"] = this;
        out["type"] = "set";
        return out;
    };
    /*\
     * Paper.setStart
     [ method ]
     **
     * Creates @Paper.set. All elements that will be created after calling this method and before calling
     * @Paper.setFinish will be added to the set.
     **
     > Usage
     | paper.setStart();
     | paper.circle(10, 10, 5),
     | paper.circle(30, 10, 5)
     | var st = paper.setFinish();
     | st.attr({fill: "red"}); // changes the fill of both circles
    \*/
    paperproto.setStart = function (set) {
        this.__set__ = set || this.set();
    };
    /*\
     * Paper.setFinish
     [ method ]
     **
     * See @Paper.setStart. This method finishes catching and returns resulting set.
     **
     = (object) set
    \*/
    paperproto.setFinish = function (set) {
        var out = this.__set__;
        delete this.__set__;
        return out;
    };
    /*\
     * Paper.setSize
     [ method ]
     **
     * If you need to change dimensions of the canvas call this method
     **
     > Parameters
     **
     - width (number) new width of the canvas
     - height (number) new height of the canvas
    \*/
    paperproto.setSize = function (width, height) {
        return R._engine.setSize.call(this, width, height);
    };
    /*\
     * Paper.setViewBox
     [ method ]
     **
     * Sets the view box of the paper. Practically it gives you ability to zoom and pan whole paper surface by 
     * specifying new boundaries.
     **
     > Parameters
     **
     - x (number) new x position, default is `0`
     - y (number) new y position, default is `0`
     - w (number) new width of the canvas
     - h (number) new height of the canvas
     - fit (boolean) `true` if you want graphics to fit into new boundary box
    \*/
    paperproto.setViewBox = function (x, y, w, h, fit) {
        return R._engine.setViewBox.call(this, x, y, w, h, fit);
    };
    /*\
     * Paper.top
     [ property ]
     **
     * Points to the topmost element on the paper
    \*/
    /*\
     * Paper.bottom
     [ property ]
     **
     * Points to the bottom element on the paper
    \*/
    paperproto.top = paperproto.bottom = null;
    /*\
     * Paper.raphael
     [ property ]
     **
     * Points to the @Raphael object/function
    \*/
    paperproto.raphael = R;
    var getOffset = function (elem) {
        var box = elem.getBoundingClientRect(),
            doc = elem.ownerDocument,
            body = doc.body,
            docElem = doc.documentElement,
            clientTop = docElem.clientTop || body.clientTop || 0, clientLeft = docElem.clientLeft || body.clientLeft || 0,
            top  = box.top  + (g.win.pageYOffset || docElem.scrollTop || body.scrollTop ) - clientTop,
            left = box.left + (g.win.pageXOffset || docElem.scrollLeft || body.scrollLeft) - clientLeft;
        return {
            y: top,
            x: left
        };
    };
    /*\
     * Paper.getElementByPoint
     [ method ]
     **
     * Returns you topmost element under given point.
     **
     = (object) Raphaël element object
     > Parameters
     **
     - x (number) x coordinate from the top left corner of the window
     - y (number) y coordinate from the top left corner of the window
     > Usage
     | paper.getElementByPoint(mouseX, mouseY).attr({stroke: "#f00"});
    \*/
    paperproto.getElementByPoint = function (x, y) {
        var paper = this,
            svg = paper.canvas,
            target = g.doc.elementFromPoint(x, y);
        if (g.win.opera && target.tagName == "svg") {
            var so = getOffset(svg),
                sr = svg.createSVGRect();
            sr.x = x - so.x;
            sr.y = y - so.y;
            sr.width = sr.height = 1;
            var hits = svg.getIntersectionList(sr, null);
            if (hits.length) {
                target = hits[hits.length - 1];
            }
        }
        if (!target) {
            return null;
        }
        while (target.parentNode && target != svg.parentNode && !target.raphael) {
            target = target.parentNode;
        }
        target == paper.canvas.parentNode && (target = svg);
        target = target && target.raphael ? paper.getById(target.raphaelid) : null;
        return target;
    };

    /*\
     * Paper.getElementsByBBox
     [ method ]
     **
     * Returns set of elements that have an intersecting bounding box
     **
     > Parameters
     **
     - bbox (object) bbox to check with
     = (object) @Set
     \*/
    paperproto.getElementsByBBox = function (bbox) {
        var set = this.set();
        this.forEach(function (el) {
            if (R.isBBoxIntersect(el.getBBox(), bbox)) {
                set.push(el);
            }
        });
        return set;
    };

    /*\
     * Paper.getById
     [ method ]
     **
     * Returns you element by its internal ID.
     **
     > Parameters
     **
     - id (number) id
     = (object) Raphaël element object
    \*/
    paperproto.getById = function (id) {
        var bot = this.bottom;
        while (bot) {
            if (bot.id == id) {
                return bot;
            }
            bot = bot.next;
        }
        return null;
    };
    /*\
     * Paper.forEach
     [ method ]
     **
     * Executes given function for each element on the paper
     *
     * If callback function returns `false` it will stop loop running.
     **
     > Parameters
     **
     - callback (function) function to run
     - thisArg (object) context object for the callback
     = (object) Paper object
     > Usage
     | paper.forEach(function (el) {
     |     el.attr({ stroke: "blue" });
     | });
    \*/
    paperproto.forEach = function (callback, thisArg) {
        var bot = this.bottom;
        while (bot) {
            if (callback.call(thisArg, bot) === false) {
                return this;
            }
            bot = bot.next;
        }
        return this;
    };
    /*\
     * Paper.getElementsByPoint
     [ method ]
     **
     * Returns set of elements that have common point inside
     **
     > Parameters
     **
     - x (number) x coordinate of the point
     - y (number) y coordinate of the point
     = (object) @Set
    \*/
    paperproto.getElementsByPoint = function (x, y) {
        var set = this.set();
        this.forEach(function (el) {
            if (el.isPointInside(x, y)) {
                set.push(el);
            }
        });
        return set;
    };
    function x_y() {
        return this.x + S + this.y;
    }
    function x_y_w_h() {
        return this.x + S + this.y + S + this.width + " \xd7 " + this.height;
    }
    /*\
     * Element.isPointInside
     [ method ]
     **
     * Determine if given point is inside this element’s shape
     **
     > Parameters
     **
     - x (number) x coordinate of the point
     - y (number) y coordinate of the point
     = (boolean) `true` if point inside the shape
    \*/
    elproto.isPointInside = function (x, y) {
        var rp = this.realPath = getPath[this.type](this);
        if (this.attr('transform') && this.attr('transform').length) {
            rp = R.transformPath(rp, this.attr('transform'));
        }
        return R.isPointInsidePath(rp, x, y);
    };
    /*\
     * Element.getBBox
     [ method ]
     **
     * Return bounding box for a given element
     **
     > Parameters
     **
     - isWithoutTransform (boolean) flag, `true` if you want to have bounding box before transformations. Default is `false`.
     = (object) Bounding box object:
     o {
     o     x: (number) top left corner x
     o     y: (number) top left corner y
     o     x2: (number) bottom right corner x
     o     y2: (number) bottom right corner y
     o     width: (number) width
     o     height: (number) height
     o }
    \*/
    elproto.getBBox = function (isWithoutTransform) {
        if (this.removed) {
            return {};
        }
        var _ = this._;
        if (isWithoutTransform) {
            if (_.dirty || !_.bboxwt) {
                this.realPath = getPath[this.type](this);
                _.bboxwt = pathDimensions(this.realPath);
                _.bboxwt.toString = x_y_w_h;
                _.dirty = 0;
            }
            return _.bboxwt;
        }
        if (_.dirty || _.dirtyT || !_.bbox) {
            if (_.dirty || !this.realPath) {
                _.bboxwt = 0;
                this.realPath = getPath[this.type](this);
            }
            _.bbox = pathDimensions(mapPath(this.realPath, this.matrix));
            _.bbox.toString = x_y_w_h;
            _.dirty = _.dirtyT = 0;
        }
        return _.bbox;
    };
    /*\
     * Element.clone
     [ method ]
     **
     = (object) clone of a given element
     **
    \*/
    elproto.clone = function () {
        if (this.removed) {
            return null;
        }
        var out = this.paper[this.type]().attr(this.attr());
        this.__set__ && this.__set__.push(out);
        return out;
    };
    /*\
     * Element.glow
     [ method ]
     **
     * Return set of elements that create glow-like effect around given element. See @Paper.set.
     *
     * Note: Glow is not connected to the element. If you change element attributes it won’t adjust itself.
     **
     > Parameters
     **
     - glow (object) #optional parameters object with all properties optional:
     o {
     o     width (number) size of the glow, default is `10`
     o     fill (boolean) will it be filled, default is `false`
     o     opacity (number) opacity, default is `0.5`
     o     offsetx (number) horizontal offset, default is `0`
     o     offsety (number) vertical offset, default is `0`
     o     color (string) glow colour, default is `black`
     o }
     = (object) @Paper.set of elements that represents glow
    \*/
    elproto.glow = function (glow) {
        if (this.type == "text") {
            return null;
        }
        glow = glow || {};
        var s = {
            width: (glow.width || 10) + (+this.attr("stroke-width") || 1),
            fill: glow.fill || false,
            opacity: glow.opacity || .5,
            offsetx: glow.offsetx || 0,
            offsety: glow.offsety || 0,
            color: glow.color || "#000"
        },
            c = s.width / 2,
            r = this.paper,
            out = r.set(),
            path = this.realPath || getPath[this.type](this);
        path = this.matrix ? mapPath(path, this.matrix) : path;
        for (var i = 1; i < c + 1; i++) {
            out.push(r.path(path).attr({
                stroke: s.color,
                fill: s.fill ? s.color : "none",
                "stroke-linejoin": "round",
                "stroke-linecap": "round",
                "stroke-width": +(s.width / c * i).toFixed(3),
                opacity: +(s.opacity / c).toFixed(3)
            }));
        }
        return out.insertBefore(this).translate(s.offsetx, s.offsety);
    };
    var curveslengths = {},
    getPointAtSegmentLength = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, length) {
        if (length == null) {
            return bezlen(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y);
        } else {
            return R.findDotsAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, getTatLen(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, length));
        }
    },
    getLengthFactory = function (istotal, subpath) {
        return function (path, length, onlystart) {
            path = path2curve(path);
            var x, y, p, l, sp = "", subpaths = {}, point,
                len = 0;
            for (var i = 0, ii = path.length; i < ii; i++) {
                p = path[i];
                if (p[0] == "M") {
                    x = +p[1];
                    y = +p[2];
                } else {
                    l = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
                    if (len + l > length) {
                        if (subpath && !subpaths.start) {
                            point = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6], length - len);
                            sp += ["C" + point.start.x, point.start.y, point.m.x, point.m.y, point.x, point.y];
                            if (onlystart) {return sp;}
                            subpaths.start = sp;
                            sp = ["M" + point.x, point.y + "C" + point.n.x, point.n.y, point.end.x, point.end.y, p[5], p[6]].join();
                            len += l;
                            x = +p[5];
                            y = +p[6];
                            continue;
                        }
                        if (!istotal && !subpath) {
                            point = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6], length - len);
                            return {x: point.x, y: point.y, alpha: point.alpha};
                        }
                    }
                    len += l;
                    x = +p[5];
                    y = +p[6];
                }
                sp += p.shift() + p;
            }
            subpaths.end = sp;
            point = istotal ? len : subpath ? subpaths : R.findDotsAtSegment(x, y, p[0], p[1], p[2], p[3], p[4], p[5], 1);
            point.alpha && (point = {x: point.x, y: point.y, alpha: point.alpha});
            return point;
        };
    };
    var getTotalLength = getLengthFactory(1),
        getPointAtLength = getLengthFactory(),
        getSubpathsAtLength = getLengthFactory(0, 1);
    /*\
     * Raphael.getTotalLength
     [ method ]
     **
     * Returns length of the given path in pixels.
     **
     > Parameters
     **
     - path (string) SVG path string.
     **
     = (number) length.
    \*/
    R.getTotalLength = getTotalLength;
    /*\
     * Raphael.getPointAtLength
     [ method ]
     **
     * Return coordinates of the point located at the given length on the given path.
     **
     > Parameters
     **
     - path (string) SVG path string
     - length (number)
     **
     = (object) representation of the point:
     o {
     o     x: (number) x coordinate
     o     y: (number) y coordinate
     o     alpha: (number) angle of derivative
     o }
    \*/
    R.getPointAtLength = getPointAtLength;
    /*\
     * Raphael.getSubpath
     [ method ]
     **
     * Return subpath of a given path from given length to given length.
     **
     > Parameters
     **
     - path (string) SVG path string
     - from (number) position of the start of the segment
     - to (number) position of the end of the segment
     **
     = (string) pathstring for the segment
    \*/
    R.getSubpath = function (path, from, to) {
        if (this.getTotalLength(path) - to < 1e-6) {
            return getSubpathsAtLength(path, from).end;
        }
        var a = getSubpathsAtLength(path, to, 1);
        return from ? getSubpathsAtLength(a, from).end : a;
    };
    /*\
     * Element.getTotalLength
     [ method ]
     **
     * Returns length of the path in pixels. Only works for element of “path” type.
     = (number) length.
    \*/
    elproto.getTotalLength = function () {
        var path = this.getPath();
        if (!path) {
            return;
        }

        if (this.node.getTotalLength) {
            return this.node.getTotalLength();
        }

        return getTotalLength(path);
    };
    /*\
     * Element.getPointAtLength
     [ method ]
     **
     * Return coordinates of the point located at the given length on the given path. Only works for element of “path” type.
     **
     > Parameters
     **
     - length (number)
     **
     = (object) representation of the point:
     o {
     o     x: (number) x coordinate
     o     y: (number) y coordinate
     o     alpha: (number) angle of derivative
     o }
    \*/
    elproto.getPointAtLength = function (length) {
        var path = this.getPath();
        if (!path) {
            return;
        }

        return getPointAtLength(path, length);
    };
    /*\
     * Element.getPath
     [ method ]
     **
     * Returns path of the element. Only works for elements of “path” type and simple elements like circle.
     = (object) path
     **
    \*/
    elproto.getPath = function () {
        var path,
            getPath = R._getPath[this.type];
        
        if (this.type == "text" || this.type == "set") {
            return;
        }

        if (getPath) {
            path = getPath(this);
        }

        return path;
    };
    /*\
     * Element.getSubpath
     [ method ]
     **
     * Return subpath of a given element from given length to given length. Only works for element of “path” type.
     **
     > Parameters
     **
     - from (number) position of the start of the segment
     - to (number) position of the end of the segment
     **
     = (string) pathstring for the segment
    \*/
    elproto.getSubpath = function (from, to) {
        var path = this.getPath();
        if (!path) {
            return;
        }

        return R.getSubpath(path, from, to);
    };
    /*\
     * Raphael.easing_formulas
     [ property ]
     **
     * Object that contains easing formulas for animation. You could extend it with your own. By default it has following list of easing:
     # <ul>
     #     <li>“linear”</li>
     #     <li>“&lt;” or “easeIn” or “ease-in”</li>
     #     <li>“>” or “easeOut” or “ease-out”</li>
     #     <li>“&lt;>” or “easeInOut” or “ease-in-out”</li>
     #     <li>“backIn” or “back-in”</li>
     #     <li>“backOut” or “back-out”</li>
     #     <li>“elastic”</li>
     #     <li>“bounce”</li>
     # </ul>
     # <p>See also <a href="http://raphaeljs.com/easing.html">Easing demo</a>.</p>
    \*/
    var ef = R.easing_formulas = {
        linear: function (n) {
            return n;
        },
        "<": function (n) {
            return pow(n, 1.7);
        },
        ">": function (n) {
            return pow(n, .48);
        },
        "<>": function (n) {
            var q = .48 - n / 1.04,
                Q = math.sqrt(.1734 + q * q),
                x = Q - q,
                X = pow(abs(x), 1 / 3) * (x < 0 ? -1 : 1),
                y = -Q - q,
                Y = pow(abs(y), 1 / 3) * (y < 0 ? -1 : 1),
                t = X + Y + .5;
            return (1 - t) * 3 * t * t + t * t * t;
        },
        backIn: function (n) {
            var s = 1.70158;
            return n * n * ((s + 1) * n - s);
        },
        backOut: function (n) {
            n = n - 1;
            var s = 1.70158;
            return n * n * ((s + 1) * n + s) + 1;
        },
        elastic: function (n) {
            if (n == !!n) {
                return n;
            }
            return pow(2, -10 * n) * math.sin((n - .075) * (2 * PI) / .3) + 1;
        },
        bounce: function (n) {
            var s = 7.5625,
                p = 2.75,
                l;
            if (n < (1 / p)) {
                l = s * n * n;
            } else {
                if (n < (2 / p)) {
                    n -= (1.5 / p);
                    l = s * n * n + .75;
                } else {
                    if (n < (2.5 / p)) {
                        n -= (2.25 / p);
                        l = s * n * n + .9375;
                    } else {
                        n -= (2.625 / p);
                        l = s * n * n + .984375;
                    }
                }
            }
            return l;
        }
    };
    ef.easeIn = ef["ease-in"] = ef["<"];
    ef.easeOut = ef["ease-out"] = ef[">"];
    ef.easeInOut = ef["ease-in-out"] = ef["<>"];
    ef["back-in"] = ef.backIn;
    ef["back-out"] = ef.backOut;

    var animationElements = [],
        requestAnimFrame = window.requestAnimationFrame       ||
                           window.webkitRequestAnimationFrame ||
                           window.mozRequestAnimationFrame    ||
                           window.oRequestAnimationFrame      ||
                           window.msRequestAnimationFrame     ||
                           function (callback) {
                               setTimeout(callback, 16);
                           },
        animation = function () {
            var Now = +new Date,
                l = 0;
            for (; l < animationElements.length; l++) {
                var e = animationElements[l];
                if (e.el.removed || e.paused) {
                    continue;
                }
                var time = Now - e.start,
                    ms = e.ms,
                    easing = e.easing,
                    from = e.from,
                    diff = e.diff,
                    to = e.to,
                    t = e.t,
                    that = e.el,
                    set = {},
                    now,
                    init = {},
                    key;
                if (e.initstatus) {
                    time = (e.initstatus * e.anim.top - e.prev) / (e.percent - e.prev) * ms;
                    e.status = e.initstatus;
                    delete e.initstatus;
                    e.stop && animationElements.splice(l--, 1);
                } else {
                    e.status = (e.prev + (e.percent - e.prev) * (time / ms)) / e.anim.top;
                }
                if (time < 0) {
                    continue;
                }
                if (time < ms) {
                    var pos = easing(time / ms);
                    for (var attr in from) if (from[has](attr)) {
                        switch (availableAnimAttrs[attr]) {
                            case nu:
                                now = +from[attr] + pos * ms * diff[attr];
                                break;
                            case "colour":
                                now = "rgb(" + [
                                    upto255(round(from[attr].r + pos * ms * diff[attr].r)),
                                    upto255(round(from[attr].g + pos * ms * diff[attr].g)),
                                    upto255(round(from[attr].b + pos * ms * diff[attr].b))
                                ].join(",") + ")";
                                break;
                            case "path":
                                now = [];
                                for (var i = 0, ii = from[attr].length; i < ii; i++) {
                                    now[i] = [from[attr][i][0]];
                                    for (var j = 1, jj = from[attr][i].length; j < jj; j++) {
                                        now[i][j] = +from[attr][i][j] + pos * ms * diff[attr][i][j];
                                    }
                                    now[i] = now[i].join(S);
                                }
                                now = now.join(S);
                                break;
                            case "transform":
                                if (diff[attr].real) {
                                    now = [];
                                    for (i = 0, ii = from[attr].length; i < ii; i++) {
                                        now[i] = [from[attr][i][0]];
                                        for (j = 1, jj = from[attr][i].length; j < jj; j++) {
                                            now[i][j] = from[attr][i][j] + pos * ms * diff[attr][i][j];
                                        }
                                    }
                                } else {
                                    var get = function (i) {
                                        return +from[attr][i] + pos * ms * diff[attr][i];
                                    };
                                    // now = [["r", get(2), 0, 0], ["t", get(3), get(4)], ["s", get(0), get(1), 0, 0]];
                                    now = [["m", get(0), get(1), get(2), get(3), get(4), get(5)]];
                                }
                                break;
                            case "csv":
                                if (attr == "clip-rect") {
                                    now = [];
                                    i = 4;
                                    while (i--) {
                                        now[i] = +from[attr][i] + pos * ms * diff[attr][i];
                                    }
                                }
                                break;
                            default:
                                var from2 = [][concat](from[attr]);
                                now = [];
                                i = that.paper.customAttributes[attr].length;
                                while (i--) {
                                    now[i] = +from2[i] + pos * ms * diff[attr][i];
                                }
                                break;
                        }
                        set[attr] = now;
                    }
                    that.attr(set);
                    (function (id, that, anim) {
                        setTimeout(function () {
                            eve("raphael.anim.frame." + id, that, anim);
                        });
                    })(that.id, that, e.anim);
                } else {
                    (function(f, el, a) {
                        setTimeout(function() {
                            eve("raphael.anim.frame." + el.id, el, a);
                            eve("raphael.anim.finish." + el.id, el, a);
                            R.is(f, "function") && f.call(el);
                        });
                    })(e.callback, that, e.anim);
                    that.attr(to);
                    animationElements.splice(l--, 1);
                    if (e.repeat > 1 && !e.next) {
                        for (key in to) if (to[has](key)) {
                            init[key] = e.totalOrigin[key];
                        }
                        e.el.attr(init);
                        runAnimation(e.anim, e.el, e.anim.percents[0], null, e.totalOrigin, e.repeat - 1);
                    }
                    if (e.next && !e.stop) {
                        runAnimation(e.anim, e.el, e.next, null, e.totalOrigin, e.repeat);
                    }
                }
            }
            R.svg && that && that.paper && that.paper.safari();
            animationElements.length && requestAnimFrame(animation);
        },
        upto255 = function (color) {
            return color > 255 ? 255 : color < 0 ? 0 : color;
        };
    /*\
     * Element.animateWith
     [ method ]
     **
     * Acts similar to @Element.animate, but ensure that given animation runs in sync with another given element.
     **
     > Parameters
     **
     - el (object) element to sync with
     - anim (object) animation to sync with
     - params (object) #optional final attributes for the element, see also @Element.attr
     - ms (number) #optional number of milliseconds for animation to run
     - easing (string) #optional easing type. Accept on of @Raphael.easing_formulas or CSS format: `cubic&#x2010;bezier(XX,&#160;XX,&#160;XX,&#160;XX)`
     - callback (function) #optional callback function. Will be called at the end of animation.
     * or
     - element (object) element to sync with
     - anim (object) animation to sync with
     - animation (object) #optional animation object, see @Raphael.animation
     **
     = (object) original element
    \*/
    elproto.animateWith = function (el, anim, params, ms, easing, callback) {
        var element = this;
        if (element.removed) {
            callback && callback.call(element);
            return element;
        }
        var a = params instanceof Animation ? params : R.animation(params, ms, easing, callback),
            x, y;
        runAnimation(a, element, a.percents[0], null, element.attr());
        for (var i = 0, ii = animationElements.length; i < ii; i++) {
            if (animationElements[i].anim == anim && animationElements[i].el == el) {
                animationElements[ii - 1].start = animationElements[i].start;
                break;
            }
        }
        return element;
        // 
        // 
        // var a = params ? R.animation(params, ms, easing, callback) : anim,
        //     status = element.status(anim);
        // return this.animate(a).status(a, status * anim.ms / a.ms);
    };
    function CubicBezierAtTime(t, p1x, p1y, p2x, p2y, duration) {
        var cx = 3 * p1x,
            bx = 3 * (p2x - p1x) - cx,
            ax = 1 - cx - bx,
            cy = 3 * p1y,
            by = 3 * (p2y - p1y) - cy,
            ay = 1 - cy - by;
        function sampleCurveX(t) {
            return ((ax * t + bx) * t + cx) * t;
        }
        function solve(x, epsilon) {
            var t = solveCurveX(x, epsilon);
            return ((ay * t + by) * t + cy) * t;
        }
        function solveCurveX(x, epsilon) {
            var t0, t1, t2, x2, d2, i;
            for(t2 = x, i = 0; i < 8; i++) {
                x2 = sampleCurveX(t2) - x;
                if (abs(x2) < epsilon) {
                    return t2;
                }
                d2 = (3 * ax * t2 + 2 * bx) * t2 + cx;
                if (abs(d2) < 1e-6) {
                    break;
                }
                t2 = t2 - x2 / d2;
            }
            t0 = 0;
            t1 = 1;
            t2 = x;
            if (t2 < t0) {
                return t0;
            }
            if (t2 > t1) {
                return t1;
            }
            while (t0 < t1) {
                x2 = sampleCurveX(t2);
                if (abs(x2 - x) < epsilon) {
                    return t2;
                }
                if (x > x2) {
                    t0 = t2;
                } else {
                    t1 = t2;
                }
                t2 = (t1 - t0) / 2 + t0;
            }
            return t2;
        }
        return solve(t, 1 / (200 * duration));
    }
    elproto.onAnimation = function (f) {
        f ? eve.on("raphael.anim.frame." + this.id, f) : eve.unbind("raphael.anim.frame." + this.id);
        return this;
    };
    function Animation(anim, ms) {
        var percents = [],
            newAnim = {};
        this.ms = ms;
        this.times = 1;
        if (anim) {
            for (var attr in anim) if (anim[has](attr)) {
                newAnim[toFloat(attr)] = anim[attr];
                percents.push(toFloat(attr));
            }
            percents.sort(sortByNumber);
        }
        this.anim = newAnim;
        this.top = percents[percents.length - 1];
        this.percents = percents;
    }
    /*\
     * Animation.delay
     [ method ]
     **
     * Creates a copy of existing animation object with given delay.
     **
     > Parameters
     **
     - delay (number) number of ms to pass between animation start and actual animation
     **
     = (object) new altered Animation object
     | var anim = Raphael.animation({cx: 10, cy: 20}, 2e3);
     | circle1.animate(anim); // run the given animation immediately
     | circle2.animate(anim.delay(500)); // run the given animation after 500 ms
    \*/
    Animation.prototype.delay = function (delay) {
        var a = new Animation(this.anim, this.ms);
        a.times = this.times;
        a.del = +delay || 0;
        return a;
    };
    /*\
     * Animation.repeat
     [ method ]
     **
     * Creates a copy of existing animation object with given repetition.
     **
     > Parameters
     **
     - repeat (number) number iterations of animation. For infinite animation pass `Infinity`
     **
     = (object) new altered Animation object
    \*/
    Animation.prototype.repeat = function (times) {
        var a = new Animation(this.anim, this.ms);
        a.del = this.del;
        a.times = math.floor(mmax(times, 0)) || 1;
        return a;
    };
    function runAnimation(anim, element, percent, status, totalOrigin, times) {
        percent = toFloat(percent);
        var params,
            isInAnim,
            isInAnimSet,
            percents = [],
            next,
            prev,
            timestamp,
            ms = anim.ms,
            from = {},
            to = {},
            diff = {};
        if (status) {
            for (i = 0, ii = animationElements.length; i < ii; i++) {
                var e = animationElements[i];
                if (e.el.id == element.id && e.anim == anim) {
                    if (e.percent != percent) {
                        animationElements.splice(i, 1);
                        isInAnimSet = 1;
                    } else {
                        isInAnim = e;
                    }
                    element.attr(e.totalOrigin);
                    break;
                }
            }
        } else {
            status = +to; // NaN
        }
        for (var i = 0, ii = anim.percents.length; i < ii; i++) {
            if (anim.percents[i] == percent || anim.percents[i] > status * anim.top) {
                percent = anim.percents[i];
                prev = anim.percents[i - 1] || 0;
                ms = ms / anim.top * (percent - prev);
                next = anim.percents[i + 1];
                params = anim.anim[percent];
                break;
            } else if (status) {
                element.attr(anim.anim[anim.percents[i]]);
            }
        }
        if (!params) {
            return;
        }
        if (!isInAnim) {
            for (var attr in params) if (params[has](attr)) {
                if (availableAnimAttrs[has](attr) || element.paper.customAttributes[has](attr)) {
                    from[attr] = element.attr(attr);
                    (from[attr] == null) && (from[attr] = availableAttrs[attr]);
                    to[attr] = params[attr];
                    switch (availableAnimAttrs[attr]) {
                        case nu:
                            diff[attr] = (to[attr] - from[attr]) / ms;
                            break;
                        case "colour":
                            from[attr] = R.getRGB(from[attr]);
                            var toColour = R.getRGB(to[attr]);
                            diff[attr] = {
                                r: (toColour.r - from[attr].r) / ms,
                                g: (toColour.g - from[attr].g) / ms,
                                b: (toColour.b - from[attr].b) / ms
                            };
                            break;
                        case "path":
                            var pathes = path2curve(from[attr], to[attr]),
                                toPath = pathes[1];
                            from[attr] = pathes[0];
                            diff[attr] = [];
                            for (i = 0, ii = from[attr].length; i < ii; i++) {
                                diff[attr][i] = [0];
                                for (var j = 1, jj = from[attr][i].length; j < jj; j++) {
                                    diff[attr][i][j] = (toPath[i][j] - from[attr][i][j]) / ms;
                                }
                            }
                            break;
                        case "transform":
                            var _ = element._,
                                eq = equaliseTransform(_[attr], to[attr]);
                            if (eq) {
                                from[attr] = eq.from;
                                to[attr] = eq.to;
                                diff[attr] = [];
                                diff[attr].real = true;
                                for (i = 0, ii = from[attr].length; i < ii; i++) {
                                    diff[attr][i] = [from[attr][i][0]];
                                    for (j = 1, jj = from[attr][i].length; j < jj; j++) {
                                        diff[attr][i][j] = (to[attr][i][j] - from[attr][i][j]) / ms;
                                    }
                                }
                            } else {
                                var m = (element.matrix || new Matrix),
                                    to2 = {
                                        _: {transform: _.transform},
                                        getBBox: function () {
                                            return element.getBBox(1);
                                        }
                                    };
                                from[attr] = [
                                    m.a,
                                    m.b,
                                    m.c,
                                    m.d,
                                    m.e,
                                    m.f
                                ];
                                extractTransform(to2, to[attr]);
                                to[attr] = to2._.transform;
                                diff[attr] = [
                                    (to2.matrix.a - m.a) / ms,
                                    (to2.matrix.b - m.b) / ms,
                                    (to2.matrix.c - m.c) / ms,
                                    (to2.matrix.d - m.d) / ms,
                                    (to2.matrix.e - m.e) / ms,
                                    (to2.matrix.f - m.f) / ms
                                ];
                                // from[attr] = [_.sx, _.sy, _.deg, _.dx, _.dy];
                                // var to2 = {_:{}, getBBox: function () { return element.getBBox(); }};
                                // extractTransform(to2, to[attr]);
                                // diff[attr] = [
                                //     (to2._.sx - _.sx) / ms,
                                //     (to2._.sy - _.sy) / ms,
                                //     (to2._.deg - _.deg) / ms,
                                //     (to2._.dx - _.dx) / ms,
                                //     (to2._.dy - _.dy) / ms
                                // ];
                            }
                            break;
                        case "csv":
                            var values = Str(params[attr])[split](separator),
                                from2 = Str(from[attr])[split](separator);
                            if (attr == "clip-rect") {
                                from[attr] = from2;
                                diff[attr] = [];
                                i = from2.length;
                                while (i--) {
                                    diff[attr][i] = (values[i] - from[attr][i]) / ms;
                                }
                            }
                            to[attr] = values;
                            break;
                        default:
                            values = [][concat](params[attr]);
                            from2 = [][concat](from[attr]);
                            diff[attr] = [];
                            i = element.paper.customAttributes[attr].length;
                            while (i--) {
                                diff[attr][i] = ((values[i] || 0) - (from2[i] || 0)) / ms;
                            }
                            break;
                    }
                }
            }
            var easing = params.easing,
                easyeasy = R.easing_formulas[easing];
            if (!easyeasy) {
                easyeasy = Str(easing).match(bezierrg);
                if (easyeasy && easyeasy.length == 5) {
                    var curve = easyeasy;
                    easyeasy = function (t) {
                        return CubicBezierAtTime(t, +curve[1], +curve[2], +curve[3], +curve[4], ms);
                    };
                } else {
                    easyeasy = pipe;
                }
            }
            timestamp = params.start || anim.start || +new Date;
            e = {
                anim: anim,
                percent: percent,
                timestamp: timestamp,
                start: timestamp + (anim.del || 0),
                status: 0,
                initstatus: status || 0,
                stop: false,
                ms: ms,
                easing: easyeasy,
                from: from,
                diff: diff,
                to: to,
                el: element,
                callback: params.callback,
                prev: prev,
                next: next,
                repeat: times || anim.times,
                origin: element.attr(),
                totalOrigin: totalOrigin
            };
            animationElements.push(e);
            if (status && !isInAnim && !isInAnimSet) {
                e.stop = true;
                e.start = new Date - ms * status;
                if (animationElements.length == 1) {
                    return animation();
                }
            }
            if (isInAnimSet) {
                e.start = new Date - e.ms * status;
            }
            animationElements.length == 1 && requestAnimFrame(animation);
        } else {
            isInAnim.initstatus = status;
            isInAnim.start = new Date - isInAnim.ms * status;
        }
        eve("raphael.anim.start." + element.id, element, anim);
    }
    /*\
     * Raphael.animation
     [ method ]
     **
     * Creates an animation object that can be passed to the @Element.animate or @Element.animateWith methods.
     * See also @Animation.delay and @Animation.repeat methods.
     **
     > Parameters
     **
     - params (object) final attributes for the element, see also @Element.attr
     - ms (number) number of milliseconds for animation to run
     - easing (string) #optional easing type. Accept one of @Raphael.easing_formulas or CSS format: `cubic&#x2010;bezier(XX,&#160;XX,&#160;XX,&#160;XX)`
     - callback (function) #optional callback function. Will be called at the end of animation.
     **
     = (object) @Animation
    \*/
    R.animation = function (params, ms, easing, callback) {
        if (params instanceof Animation) {
            return params;
        }
        if (R.is(easing, "function") || !easing) {
            callback = callback || easing || null;
            easing = null;
        }
        params = Object(params);
        ms = +ms || 0;
        var p = {},
            json,
            attr;
        for (attr in params) if (params[has](attr) && toFloat(attr) != attr && toFloat(attr) + "%" != attr) {
            json = true;
            p[attr] = params[attr];
        }
        if (!json) {
            return new Animation(params, ms);
        } else {
            easing && (p.easing = easing);
            callback && (p.callback = callback);
            return new Animation({100: p}, ms);
        }
    };
    /*\
     * Element.animate
     [ method ]
     **
     * Creates and starts animation for given element.
     **
     > Parameters
     **
     - params (object) final attributes for the element, see also @Element.attr
     - ms (number) number of milliseconds for animation to run
     - easing (string) #optional easing type. Accept one of @Raphael.easing_formulas or CSS format: `cubic&#x2010;bezier(XX,&#160;XX,&#160;XX,&#160;XX)`
     - callback (function) #optional callback function. Will be called at the end of animation.
     * or
     - animation (object) animation object, see @Raphael.animation
     **
     = (object) original element
    \*/
    elproto.animate = function (params, ms, easing, callback) {
        var element = this;
        if (element.removed) {
            callback && callback.call(element);
            return element;
        }
        var anim = params instanceof Animation ? params : R.animation(params, ms, easing, callback);
        runAnimation(anim, element, anim.percents[0], null, element.attr());
        return element;
    };
    /*\
     * Element.setTime
     [ method ]
     **
     * Sets the status of animation of the element in milliseconds. Similar to @Element.status method.
     **
     > Parameters
     **
     - anim (object) animation object
     - value (number) number of milliseconds from the beginning of the animation
     **
     = (object) original element if `value` is specified
     * Note, that during animation following events are triggered:
     *
     * On each animation frame event `anim.frame.<id>`, on start `anim.start.<id>` and on end `anim.finish.<id>`.
    \*/
    elproto.setTime = function (anim, value) {
        if (anim && value != null) {
            this.status(anim, mmin(value, anim.ms) / anim.ms);
        }
        return this;
    };
    /*\
     * Element.status
     [ method ]
     **
     * Gets or sets the status of animation of the element.
     **
     > Parameters
     **
     - anim (object) #optional animation object
     - value (number) #optional 0 – 1. If specified, method works like a setter and sets the status of a given animation to the value. This will cause animation to jump to the given position.
     **
     = (number) status
     * or
     = (array) status if `anim` is not specified. Array of objects in format:
     o {
     o     anim: (object) animation object
     o     status: (number) status
     o }
     * or
     = (object) original element if `value` is specified
    \*/
    elproto.status = function (anim, value) {
        var out = [],
            i = 0,
            len,
            e;
        if (value != null) {
            runAnimation(anim, this, -1, mmin(value, 1));
            return this;
        } else {
            len = animationElements.length;
            for (; i < len; i++) {
                e = animationElements[i];
                if (e.el.id == this.id && (!anim || e.anim == anim)) {
                    if (anim) {
                        return e.status;
                    }
                    out.push({
                        anim: e.anim,
                        status: e.status
                    });
                }
            }
            if (anim) {
                return 0;
            }
            return out;
        }
    };
    /*\
     * Element.pause
     [ method ]
     **
     * Stops animation of the element with ability to resume it later on.
     **
     > Parameters
     **
     - anim (object) #optional animation object
     **
     = (object) original element
    \*/
    elproto.pause = function (anim) {
        for (var i = 0; i < animationElements.length; i++) if (animationElements[i].el.id == this.id && (!anim || animationElements[i].anim == anim)) {
            if (eve("raphael.anim.pause." + this.id, this, animationElements[i].anim) !== false) {
                animationElements[i].paused = true;
            }
        }
        return this;
    };
    /*\
     * Element.resume
     [ method ]
     **
     * Resumes animation if it was paused with @Element.pause method.
     **
     > Parameters
     **
     - anim (object) #optional animation object
     **
     = (object) original element
    \*/
    elproto.resume = function (anim) {
        for (var i = 0; i < animationElements.length; i++) if (animationElements[i].el.id == this.id && (!anim || animationElements[i].anim == anim)) {
            var e = animationElements[i];
            if (eve("raphael.anim.resume." + this.id, this, e.anim) !== false) {
                delete e.paused;
                this.status(e.anim, e.status);
            }
        }
        return this;
    };
    /*\
     * Element.stop
     [ method ]
     **
     * Stops animation of the element.
     **
     > Parameters
     **
     - anim (object) #optional animation object
     **
     = (object) original element
    \*/
    elproto.stop = function (anim) {
        for (var i = 0; i < animationElements.length; i++) if (animationElements[i].el.id == this.id && (!anim || animationElements[i].anim == anim)) {
            if (eve("raphael.anim.stop." + this.id, this, animationElements[i].anim) !== false) {
                animationElements.splice(i--, 1);
            }
        }
        return this;
    };
    function stopAnimation(paper) {
        for (var i = 0; i < animationElements.length; i++) if (animationElements[i].el.paper == paper) {
            animationElements.splice(i--, 1);
        }
    }
    eve.on("raphael.remove", stopAnimation);
    eve.on("raphael.clear", stopAnimation);
    elproto.toString = function () {
        return "Rapha\xebl\u2019s object";
    };

    // Set
    var Set = function (items) {
        this.items = [];
        this.length = 0;
        this.type = "set";
        if (items) {
            for (var i = 0, ii = items.length; i < ii; i++) {
                if (items[i] && (items[i].constructor == elproto.constructor || items[i].constructor == Set)) {
                    this[this.items.length] = this.items[this.items.length] = items[i];
                    this.length++;
                }
            }
        }
    },
    setproto = Set.prototype;
    /*\
     * Set.push
     [ method ]
     **
     * Adds each argument to the current set.
     = (object) original element
    \*/
    setproto.push = function () {
        var item,
            len;
        for (var i = 0, ii = arguments.length; i < ii; i++) {
            item = arguments[i];
            if (item && (item.constructor == elproto.constructor || item.constructor == Set)) {
                len = this.items.length;
                this[len] = this.items[len] = item;
                this.length++;
            }
        }
        return this;
    };
    /*\
     * Set.pop
     [ method ]
     **
     * Removes last element and returns it.
     = (object) element
    \*/
    setproto.pop = function () {
        this.length && delete this[this.length--];
        return this.items.pop();
    };
    /*\
     * Set.forEach
     [ method ]
     **
     * Executes given function for each element in the set.
     *
     * If function returns `false` it will stop loop running.
     **
     > Parameters
     **
     - callback (function) function to run
     - thisArg (object) context object for the callback
     = (object) Set object
    \*/
    setproto.forEach = function (callback, thisArg) {
        for (var i = 0, ii = this.items.length; i < ii; i++) {
            if (callback.call(thisArg, this.items[i], i) === false) {
                return this;
            }
        }
        return this;
    };
    for (var method in elproto) if (elproto[has](method)) {
        setproto[method] = (function (methodname) {
            return function () {
                var arg = arguments;
                return this.forEach(function (el) {
                    el[methodname][apply](el, arg);
                });
            };
        })(method);
    }
    setproto.attr = function (name, value) {
        if (name && R.is(name, array) && R.is(name[0], "object")) {
            for (var j = 0, jj = name.length; j < jj; j++) {
                this.items[j].attr(name[j]);
            }
        } else {
            for (var i = 0, ii = this.items.length; i < ii; i++) {
                this.items[i].attr(name, value);
            }
        }
        return this;
    };
    /*\
     * Set.clear
     [ method ]
     **
     * Removeds all elements from the set
    \*/
    setproto.clear = function () {
        while (this.length) {
            this.pop();
        }
    };
    /*\
     * Set.splice
     [ method ]
     **
     * Removes given element from the set
     **
     > Parameters
     **
     - index (number) position of the deletion
     - count (number) number of element to remove
     - insertion… (object) #optional elements to insert
     = (object) set elements that were deleted
    \*/
    setproto.splice = function (index, count, insertion) {
        index = index < 0 ? mmax(this.length + index, 0) : index;
        count = mmax(0, mmin(this.length - index, count));
        var tail = [],
            todel = [],
            args = [],
            i;
        for (i = 2; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        for (i = 0; i < count; i++) {
            todel.push(this[index + i]);
        }
        for (; i < this.length - index; i++) {
            tail.push(this[index + i]);
        }
        var arglen = args.length;
        for (i = 0; i < arglen + tail.length; i++) {
            this.items[index + i] = this[index + i] = i < arglen ? args[i] : tail[i - arglen];
        }
        i = this.items.length = this.length -= count - arglen;
        while (this[i]) {
            delete this[i++];
        }
        return new Set(todel);
    };
    /*\
     * Set.exclude
     [ method ]
     **
     * Removes given element from the set
     **
     > Parameters
     **
     - element (object) element to remove
     = (boolean) `true` if object was found & removed from the set
    \*/
    setproto.exclude = function (el) {
        for (var i = 0, ii = this.length; i < ii; i++) if (this[i] == el) {
            this.splice(i, 1);
            return true;
        }
    };
    setproto.animate = function (params, ms, easing, callback) {
        (R.is(easing, "function") || !easing) && (callback = easing || null);
        var len = this.items.length,
            i = len,
            item,
            set = this,
            collector;
        if (!len) {
            return this;
        }
        callback && (collector = function () {
            !--len && callback.call(set);
        });
        easing = R.is(easing, string) ? easing : collector;
        var anim = R.animation(params, ms, easing, collector);
        item = this.items[--i].animate(anim);
        while (i--) {
            this.items[i] && !this.items[i].removed && this.items[i].animateWith(item, anim, anim);
            (this.items[i] && !this.items[i].removed) || len--;
        }
        return this;
    };
    setproto.insertAfter = function (el) {
        var i = this.items.length;
        while (i--) {
            this.items[i].insertAfter(el);
        }
        return this;
    };
    setproto.getBBox = function () {
        var x = [],
            y = [],
            x2 = [],
            y2 = [];
        for (var i = this.items.length; i--;) if (!this.items[i].removed) {
            var box = this.items[i].getBBox();
            x.push(box.x);
            y.push(box.y);
            x2.push(box.x + box.width);
            y2.push(box.y + box.height);
        }
        x = mmin[apply](0, x);
        y = mmin[apply](0, y);
        x2 = mmax[apply](0, x2);
        y2 = mmax[apply](0, y2);
        return {
            x: x,
            y: y,
            x2: x2,
            y2: y2,
            width: x2 - x,
            height: y2 - y
        };
    };
    setproto.clone = function (s) {
        s = this.paper.set();
        for (var i = 0, ii = this.items.length; i < ii; i++) {
            s.push(this.items[i].clone());
        }
        return s;
    };
    setproto.toString = function () {
        return "Rapha\xebl\u2018s set";
    };

    setproto.glow = function(glowConfig) {
        var ret = this.paper.set();
        this.forEach(function(shape, index){
            var g = shape.glow(glowConfig);
            if(g != null){
                g.forEach(function(shape2, index2){
                    ret.push(shape2);
                });
            }
        });
        return ret;
    };


    /*\
     * Set.isPointInside
     [ method ]
     **
     * Determine if given point is inside this set’s elements
     **
     > Parameters
     **
     - x (number) x coordinate of the point
     - y (number) y coordinate of the point
     = (boolean) `true` if point is inside any of the set's elements
     \*/
    setproto.isPointInside = function (x, y) {
        var isPointInside = false;
        this.forEach(function (el) {
            if (el.isPointInside(x, y)) {
                console.log('runned');
                isPointInside = true;
                return false; // stop loop
            }
        });
        return isPointInside;
    };

    /*\
     * Raphael.registerFont
     [ method ]
     **
     * Adds given font to the registered set of fonts for Raphaël. Should be used as an internal call from within Cufón’s font file.
     * Returns original parameter, so it could be used with chaining.
     # <a href="http://wiki.github.com/sorccu/cufon/about">More about Cufón and how to convert your font form TTF, OTF, etc to JavaScript file.</a>
     **
     > Parameters
     **
     - font (object) the font to register
     = (object) the font you passed in
     > Usage
     | Cufon.registerFont(Raphael.registerFont({…}));
    \*/
    R.registerFont = function (font) {
        if (!font.face) {
            return font;
        }
        this.fonts = this.fonts || {};
        var fontcopy = {
                w: font.w,
                face: {},
                glyphs: {}
            },
            family = font.face["font-family"];
        for (var prop in font.face) if (font.face[has](prop)) {
            fontcopy.face[prop] = font.face[prop];
        }
        if (this.fonts[family]) {
            this.fonts[family].push(fontcopy);
        } else {
            this.fonts[family] = [fontcopy];
        }
        if (!font.svg) {
            fontcopy.face["units-per-em"] = toInt(font.face["units-per-em"], 10);
            for (var glyph in font.glyphs) if (font.glyphs[has](glyph)) {
                var path = font.glyphs[glyph];
                fontcopy.glyphs[glyph] = {
                    w: path.w,
                    k: {},
                    d: path.d && "M" + path.d.replace(/[mlcxtrv]/g, function (command) {
                            return {l: "L", c: "C", x: "z", t: "m", r: "l", v: "c"}[command] || "M";
                        }) + "z"
                };
                if (path.k) {
                    for (var k in path.k) if (path[has](k)) {
                        fontcopy.glyphs[glyph].k[k] = path.k[k];
                    }
                }
            }
        }
        return font;
    };
    /*\
     * Paper.getFont
     [ method ]
     **
     * Finds font object in the registered fonts by given parameters. You could specify only one word from the font name, like “Myriad” for “Myriad Pro”.
     **
     > Parameters
     **
     - family (string) font family name or any word from it
     - weight (string) #optional font weight
     - style (string) #optional font style
     - stretch (string) #optional font stretch
     = (object) the font object
     > Usage
     | paper.print(100, 100, "Test string", paper.getFont("Times", 800), 30);
    \*/
    paperproto.getFont = function (family, weight, style, stretch) {
        stretch = stretch || "normal";
        style = style || "normal";
        weight = +weight || {normal: 400, bold: 700, lighter: 300, bolder: 800}[weight] || 400;
        if (!R.fonts) {
            return;
        }
        var font = R.fonts[family];
        if (!font) {
            var name = new RegExp("(^|\\s)" + family.replace(/[^\w\d\s+!~.:_-]/g, E) + "(\\s|$)", "i");
            for (var fontName in R.fonts) if (R.fonts[has](fontName)) {
                if (name.test(fontName)) {
                    font = R.fonts[fontName];
                    break;
                }
            }
        }
        var thefont;
        if (font) {
            for (var i = 0, ii = font.length; i < ii; i++) {
                thefont = font[i];
                if (thefont.face["font-weight"] == weight && (thefont.face["font-style"] == style || !thefont.face["font-style"]) && thefont.face["font-stretch"] == stretch) {
                    break;
                }
            }
        }
        return thefont;
    };
    /*\
     * Paper.print
     [ method ]
     **
     * Creates path that represent given text written using given font at given position with given size.
     * Result of the method is path element that contains whole text as a separate path.
     **
     > Parameters
     **
     - x (number) x position of the text
     - y (number) y position of the text
     - string (string) text to print
     - font (object) font object, see @Paper.getFont
     - size (number) #optional size of the font, default is `16`
     - origin (string) #optional could be `"baseline"` or `"middle"`, default is `"middle"`
     - letter_spacing (number) #optional number in range `-1..1`, default is `0`
     - line_spacing (number) #optional number in range `1..3`, default is `1`
     = (object) resulting path element, which consist of all letters
     > Usage
     | var txt = r.print(10, 50, "print", r.getFont("Museo"), 30).attr({fill: "#fff"});
    \*/
    paperproto.print = function (x, y, string, font, size, origin, letter_spacing, line_spacing) {
        origin = origin || "middle"; // baseline|middle
        letter_spacing = mmax(mmin(letter_spacing || 0, 1), -1);
        line_spacing = mmax(mmin(line_spacing || 1, 3), 1);
        var letters = Str(string)[split](E),
            shift = 0,
            notfirst = 0,
            path = E,
            scale;
        R.is(font, "string") && (font = this.getFont(font));
        if (font) {
            scale = (size || 16) / font.face["units-per-em"];
            var bb = font.face.bbox[split](separator),
                top = +bb[0],
                lineHeight = bb[3] - bb[1],
                shifty = 0,
                height = +bb[1] + (origin == "baseline" ? lineHeight + (+font.face.descent) : lineHeight / 2);
            for (var i = 0, ii = letters.length; i < ii; i++) {
                if (letters[i] == "\n") {
                    shift = 0;
                    curr = 0;
                    notfirst = 0;
                    shifty += lineHeight * line_spacing;
                } else {
                    var prev = notfirst && font.glyphs[letters[i - 1]] || {},
                        curr = font.glyphs[letters[i]];
                    shift += notfirst ? (prev.w || font.w) + (prev.k && prev.k[letters[i]] || 0) + (font.w * letter_spacing) : 0;
                    notfirst = 1;
                }
                if (curr && curr.d) {
                    path += R.transformPath(curr.d, ["t", shift * scale, shifty * scale, "s", scale, scale, top, height, "t", (x - top) / scale, (y - height) / scale]);
                }
            }
        }
        return this.path(path).attr({
            fill: "#000",
            stroke: "none"
        });
    };

    /*\
     * Paper.add
     [ method ]
     **
     * Imports elements in JSON array in format `{type: type, <attributes>}`
     **
     > Parameters
     **
     - json (array)
     = (object) resulting set of imported elements
     > Usage
     | paper.add([
     |     {
     |         type: "circle",
     |         cx: 10,
     |         cy: 10,
     |         r: 5
     |     },
     |     {
     |         type: "rect",
     |         x: 10,
     |         y: 10,
     |         width: 10,
     |         height: 10,
     |         fill: "#fc0"
     |     }
     | ]);
    \*/
    paperproto.add = function (json) {
        if (R.is(json, "array")) {
            var res = this.set(),
                i = 0,
                ii = json.length,
                j;
            for (; i < ii; i++) {
                j = json[i] || {};
                elements[has](j.type) && res.push(this[j.type]().attr(j));
            }
        }
        return res;
    };

    /*\
     * Raphael.format
     [ method ]
     **
     * Simple format function. Replaces construction of type “`{<number>}`” to the corresponding argument.
     **
     > Parameters
     **
     - token (string) string to format
     - … (string) rest of arguments will be treated as parameters for replacement
     = (string) formated string
     > Usage
     | var x = 10,
     |     y = 20,
     |     width = 40,
     |     height = 50;
     | // this will draw a rectangular shape equivalent to "M10,20h40v50h-40z"
     | paper.path(Raphael.format("M{0},{1}h{2}v{3}h{4}z", x, y, width, height, -width));
    \*/
    R.format = function (token, params) {
        var args = R.is(params, array) ? [0][concat](params) : arguments;
        token && R.is(token, string) && args.length - 1 && (token = token.replace(formatrg, function (str, i) {
            return args[++i] == null ? E : args[i];
        }));
        return token || E;
    };
    /*\
     * Raphael.fullfill
     [ method ]
     **
     * A little bit more advanced format function than @Raphael.format. Replaces construction of type “`{<name>}`” to the corresponding argument.
     **
     > Parameters
     **
     - token (string) string to format
     - json (object) object which properties will be used as a replacement
     = (string) formated string
     > Usage
     | // this will draw a rectangular shape equivalent to "M10,20h40v50h-40z"
     | paper.path(Raphael.fullfill("M{x},{y}h{dim.width}v{dim.height}h{dim['negative width']}z", {
     |     x: 10,
     |     y: 20,
     |     dim: {
     |         width: 40,
     |         height: 50,
     |         "negative width": -40
     |     }
     | }));
    \*/
    R.fullfill = (function () {
        var tokenRegex = /\{([^\}]+)\}/g,
            objNotationRegex = /(?:(?:^|\.)(.+?)(?=\[|\.|$|\()|\[('|")(.+?)\2\])(\(\))?/g, // matches .xxxxx or ["xxxxx"] to run over object properties
            replacer = function (all, key, obj) {
                var res = obj;
                key.replace(objNotationRegex, function (all, name, quote, quotedName, isFunc) {
                    name = name || quotedName;
                    if (res) {
                        if (name in res) {
                            res = res[name];
                        }
                        typeof res == "function" && isFunc && (res = res());
                    }
                });
                res = (res == null || res == obj ? all : res) + "";
                return res;
            };
        return function (str, obj) {
            return String(str).replace(tokenRegex, function (all, key) {
                return replacer(all, key, obj);
            });
        };
    })();
    /*\
     * Raphael.ninja
     [ method ]
     **
     * If you want to leave no trace of Raphaël (Well, Raphaël creates only one global variable `Raphael`, but anyway.) You can use `ninja` method.
     * Beware, that in this case plugins could stop working, because they are depending on global variable existance.
     **
     = (object) Raphael object
     > Usage
     | (function (local_raphael) {
     |     var paper = local_raphael(10, 10, 320, 200);
     |     …
     | })(Raphael.ninja());
    \*/
    R.ninja = function () {
        oldRaphael.was ? (g.win.Raphael = oldRaphael.is) : delete Raphael;
        return R;
    };
    /*\
     * Raphael.st
     [ property (object) ]
     **
     * You can add your own method to elements and sets. It is wise to add a set method for each element method
     * you added, so you will be able to call the same method on sets too.
     **
     * See also @Raphael.el.
     > Usage
     | Raphael.el.red = function () {
     |     this.attr({fill: "#f00"});
     | };
     | Raphael.st.red = function () {
     |     this.forEach(function (el) {
     |         el.red();
     |     });
     | };
     | // then use it
     | paper.set(paper.circle(100, 100, 20), paper.circle(110, 100, 20)).red();
    \*/
    R.st = setproto;
    // Firefox <3.6 fix: http://webreflection.blogspot.com/2009/11/195-chars-to-help-lazy-loading.html
    (function (doc, loaded, f) {
        if (doc.readyState == null && doc.addEventListener){
            doc.addEventListener(loaded, f = function () {
                doc.removeEventListener(loaded, f, false);
                doc.readyState = "complete";
            }, false);
            doc.readyState = "loading";
        }
        function isLoaded() {
            (/in/).test(doc.readyState) ? setTimeout(isLoaded, 9) : R.eve("raphael.DOMload");
        }
        isLoaded();
    })(document, "DOMContentLoaded");

    eve.on("raphael.DOMload", function () {
        loaded = true;
    });

// ┌─────────────────────────────────────────────────────────────────────┐ \\
// │ Raphaël - JavaScript Vector Library                                 │ \\
// ├─────────────────────────────────────────────────────────────────────┤ \\
// │ SVG Module                                                          │ \\
// ├─────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright (c) 2008-2011 Dmitry Baranovskiy (http://raphaeljs.com)   │ \\
// │ Copyright (c) 2008-2011 Sencha Labs (http://sencha.com)             │ \\
// │ Licensed under the MIT (http://raphaeljs.com/license.html) license. │ \\
// └─────────────────────────────────────────────────────────────────────┘ \\

(function(){
    if (!R.svg) {
        return;
    }
    var has = "hasOwnProperty",
        Str = String,
        toFloat = parseFloat,
        toInt = parseInt,
        math = Math,
        mmax = math.max,
        abs = math.abs,
        pow = math.pow,
        separator = /[, ]+/,
        eve = R.eve,
        E = "",
        S = " ";
    var xlink = "http://www.w3.org/1999/xlink",
        markers = {
            block: "M5,0 0,2.5 5,5z",
            classic: "M5,0 0,2.5 5,5 3.5,3 3.5,2z",
            diamond: "M2.5,0 5,2.5 2.5,5 0,2.5z",
            open: "M6,1 1,3.5 6,6",
            oval: "M2.5,0A2.5,2.5,0,0,1,2.5,5 2.5,2.5,0,0,1,2.5,0z"
        },
        markerCounter = {};
    R.toString = function () {
        return  "Your browser supports SVG.\nYou are running Rapha\xebl " + this.version;
    };
    var $ = function (el, attr) {
        if (attr) {
            if (typeof el == "string") {
                el = $(el);
            }
            for (var key in attr) if (attr[has](key)) {
                if (key.substring(0, 6) == "xlink:") {
                    el.setAttributeNS(xlink, key.substring(6), Str(attr[key]));
                } else {
                    el.setAttribute(key, Str(attr[key]));
                }
            }
        } else {
            el = R._g.doc.createElementNS("http://www.w3.org/2000/svg", el);
            el.style && (el.style.webkitTapHighlightColor = "rgba(0,0,0,0)");
        }
        return el;
    },
    addGradientFill = function (element, gradient) {
        var type = "linear",
            id = element.id + gradient,
            fx = .5, fy = .5,
            o = element.node,
            SVG = element.paper,
            s = o.style,
            el = R._g.doc.getElementById(id);
        if (!el) {
            gradient = Str(gradient).replace(R._radial_gradient, function (all, _fx, _fy) {
                type = "radial";
                if (_fx && _fy) {
                    fx = toFloat(_fx);
                    fy = toFloat(_fy);
                    var dir = ((fy > .5) * 2 - 1);
                    pow(fx - .5, 2) + pow(fy - .5, 2) > .25 &&
                        (fy = math.sqrt(.25 - pow(fx - .5, 2)) * dir + .5) &&
                        fy != .5 &&
                        (fy = fy.toFixed(5) - 1e-5 * dir);
                }
                return E;
            });
            gradient = gradient.split(/\s*\-\s*/);
            if (type == "linear") {
                var angle = gradient.shift();
                angle = -toFloat(angle);
                if (isNaN(angle)) {
                    return null;
                }
                var vector = [0, 0, math.cos(R.rad(angle)), math.sin(R.rad(angle))],
                    max = 1 / (mmax(abs(vector[2]), abs(vector[3])) || 1);
                vector[2] *= max;
                vector[3] *= max;
                if (vector[2] < 0) {
                    vector[0] = -vector[2];
                    vector[2] = 0;
                }
                if (vector[3] < 0) {
                    vector[1] = -vector[3];
                    vector[3] = 0;
                }
            }
            var dots = R._parseDots(gradient);
            if (!dots) {
                return null;
            }
            id = id.replace(/[\(\)\s,\xb0#]/g, "_");
            
            if (element.gradient && id != element.gradient.id) {
                SVG.defs.removeChild(element.gradient);
                delete element.gradient;
            }

            if (!element.gradient) {
                el = $(type + "Gradient", {id: id});
                element.gradient = el;
                $(el, type == "radial" ? {
                    fx: fx,
                    fy: fy
                } : {
                    x1: vector[0],
                    y1: vector[1],
                    x2: vector[2],
                    y2: vector[3],
                    gradientTransform: element.matrix.invert()
                });
                SVG.defs.appendChild(el);
                for (var i = 0, ii = dots.length; i < ii; i++) {
                    el.appendChild($("stop", {
                        offset: dots[i].offset ? dots[i].offset : i ? "100%" : "0%",
                        "stop-color": dots[i].color || "#fff"
                    }));
                }
            }
        }
        $(o, {
            fill: "url(#" + id + ")",
            opacity: 1,
            "fill-opacity": 1
        });
        s.fill = E;
        s.opacity = 1;
        s.fillOpacity = 1;
        return 1;
    },
    updatePosition = function (o) {
        var bbox = o.getBBox(1);
        $(o.pattern, {patternTransform: o.matrix.invert() + " translate(" + bbox.x + "," + bbox.y + ")"});
    },
    addArrow = function (o, value, isEnd) {
        if (o.type == "path") {
            var values = Str(value).toLowerCase().split("-"),
                p = o.paper,
                se = isEnd ? "end" : "start",
                node = o.node,
                attrs = o.attrs,
                stroke = attrs["stroke-width"],
                i = values.length,
                type = "classic",
                from,
                to,
                dx,
                refX,
                attr,
                w = 3,
                h = 3,
                t = 5;
            while (i--) {
                switch (values[i]) {
                    case "block":
                    case "classic":
                    case "oval":
                    case "diamond":
                    case "open":
                    case "none":
                        type = values[i];
                        break;
                    case "wide": h = 5; break;
                    case "narrow": h = 2; break;
                    case "long": w = 5; break;
                    case "short": w = 2; break;
                }
            }
            if (type == "open") {
                w += 2;
                h += 2;
                t += 2;
                dx = 1;
                refX = isEnd ? 4 : 1;
                attr = {
                    fill: "none",
                    stroke: attrs.stroke
                };
            } else {
                refX = dx = w / 2;
                attr = {
                    fill: attrs.stroke,
                    stroke: "none"
                };
            }
            if (o._.arrows) {
                if (isEnd) {
                    o._.arrows.endPath && markerCounter[o._.arrows.endPath]--;
                    o._.arrows.endMarker && markerCounter[o._.arrows.endMarker]--;
                } else {
                    o._.arrows.startPath && markerCounter[o._.arrows.startPath]--;
                    o._.arrows.startMarker && markerCounter[o._.arrows.startMarker]--;
                }
            } else {
                o._.arrows = {};
            }
            if (type != "none") {
                var pathId = "raphael-marker-" + type,
                    markerId = "raphael-marker-" + se + type + w + h;
                if (!R._g.doc.getElementById(pathId)) {
                    p.defs.appendChild($($("path"), {
                        "stroke-linecap": "round",
                        d: markers[type],
                        id: pathId
                    }));
                    markerCounter[pathId] = 1;
                } else {
                    markerCounter[pathId]++;
                }
                var marker = R._g.doc.getElementById(markerId),
                    use;
                if (!marker) {
                    marker = $($("marker"), {
                        id: markerId,
                        markerHeight: h,
                        markerWidth: w,
                        orient: "auto",
                        refX: refX,
                        refY: h / 2
                    });
                    use = $($("use"), {
                        "xlink:href": "#" + pathId,
                        transform: (isEnd ? "rotate(180 " + w / 2 + " " + h / 2 + ") " : E) + "scale(" + w / t + "," + h / t + ")",
                        "stroke-width": (1 / ((w / t + h / t) / 2)).toFixed(4)
                    });
                    marker.appendChild(use);
                    p.defs.appendChild(marker);
                    markerCounter[markerId] = 1;
                } else {
                    markerCounter[markerId]++;
                    use = marker.getElementsByTagName("use")[0];
                }
                $(use, attr);
                var delta = dx * (type != "diamond" && type != "oval");
                if (isEnd) {
                    from = o._.arrows.startdx * stroke || 0;
                    to = R.getTotalLength(attrs.path) - delta * stroke;
                } else {
                    from = delta * stroke;
                    to = R.getTotalLength(attrs.path) - (o._.arrows.enddx * stroke || 0);
                }
                attr = {};
                attr["marker-" + se] = "url(#" + markerId + ")";
                if (to || from) {
                    attr.d = R.getSubpath(attrs.path, from, to);
                }
                $(node, attr);
                o._.arrows[se + "Path"] = pathId;
                o._.arrows[se + "Marker"] = markerId;
                o._.arrows[se + "dx"] = delta;
                o._.arrows[se + "Type"] = type;
                o._.arrows[se + "String"] = value;
            } else {
                if (isEnd) {
                    from = o._.arrows.startdx * stroke || 0;
                    to = R.getTotalLength(attrs.path) - from;
                } else {
                    from = 0;
                    to = R.getTotalLength(attrs.path) - (o._.arrows.enddx * stroke || 0);
                }
                o._.arrows[se + "Path"] && $(node, {d: R.getSubpath(attrs.path, from, to)});
                delete o._.arrows[se + "Path"];
                delete o._.arrows[se + "Marker"];
                delete o._.arrows[se + "dx"];
                delete o._.arrows[se + "Type"];
                delete o._.arrows[se + "String"];
            }
            for (attr in markerCounter) if (markerCounter[has](attr) && !markerCounter[attr]) {
                var item = R._g.doc.getElementById(attr);
                item && item.parentNode.removeChild(item);
            }
        }
    },
    dasharray = {
        "": [0],
        "none": [0],
        "-": [3, 1],
        ".": [1, 1],
        "-.": [3, 1, 1, 1],
        "-..": [3, 1, 1, 1, 1, 1],
        ". ": [1, 3],
        "- ": [4, 3],
        "--": [8, 3],
        "- .": [4, 3, 1, 3],
        "--.": [8, 3, 1, 3],
        "--..": [8, 3, 1, 3, 1, 3]
    },
    addDashes = function (o, value, params) {
        value = dasharray[Str(value).toLowerCase()];
        if (value) {
            var width = o.attrs["stroke-width"] || "1",
                butt = {round: width, square: width, butt: 0}[o.attrs["stroke-linecap"] || params["stroke-linecap"]] || 0,
                dashes = [],
                i = value.length;
            while (i--) {
                dashes[i] = value[i] * width + ((i % 2) ? 1 : -1) * butt;
            }
            $(o.node, {"stroke-dasharray": dashes.join(",")});
        }
    },
    setFillAndStroke = function (o, params) {
        var node = o.node,
            attrs = o.attrs,
            vis = node.style.visibility;
        node.style.visibility = "hidden";
        for (var att in params) {
            if (params[has](att)) {
                if (!R._availableAttrs[has](att)) {
                    continue;
                }
                var value = params[att];
                attrs[att] = value;
                switch (att) {
                    case "blur":
                        o.blur(value);
                        break;
                    case "href":
                    case "title":
                        var hl = $("title");
                        var val = R._g.doc.createTextNode(value);
                        hl.appendChild(val);
                        node.appendChild(hl);
                        break;
                    case "target":
                        var pn = node.parentNode;
                        if (pn.tagName.toLowerCase() != "a") {
                            var hl = $("a");
                            pn.insertBefore(hl, node);
                            hl.appendChild(node);
                            pn = hl;
                        }
                        if (att == "target") {
                            pn.setAttributeNS(xlink, "show", value == "blank" ? "new" : value);
                        } else {
                            pn.setAttributeNS(xlink, att, value);
                        }
                        break;
                    case "cursor":
                        node.style.cursor = value;
                        break;
                    case "transform":
                        o.transform(value);
                        break;
                    case "arrow-start":
                        addArrow(o, value);
                        break;
                    case "arrow-end":
                        addArrow(o, value, 1);
                        break;
                    case "clip-rect":
                        var rect = Str(value).split(separator);
                        if (rect.length == 4) {
                            o.clip && o.clip.parentNode.parentNode.removeChild(o.clip.parentNode);
                            var el = $("clipPath"),
                                rc = $("rect");
                            el.id = R.createUUID();
                            $(rc, {
                                x: rect[0],
                                y: rect[1],
                                width: rect[2],
                                height: rect[3]
                            });
                            el.appendChild(rc);
                            o.paper.defs.appendChild(el);
                            $(node, {"clip-path": "url(#" + el.id + ")"});
                            o.clip = rc;
                        }
                        if (!value) {
                            var path = node.getAttribute("clip-path");
                            if (path) {
                                var clip = R._g.doc.getElementById(path.replace(/(^url\(#|\)$)/g, E));
                                clip && clip.parentNode.removeChild(clip);
                                $(node, {"clip-path": E});
                                delete o.clip;
                            }
                        }
                    break;
                    case "path":
                        if (o.type == "path") {
                            $(node, {d: value ? attrs.path = R._pathToAbsolute(value) : "M0,0"});
                            o._.dirty = 1;
                            if (o._.arrows) {
                                "startString" in o._.arrows && addArrow(o, o._.arrows.startString);
                                "endString" in o._.arrows && addArrow(o, o._.arrows.endString, 1);
                            }
                        }
                        break;
                    case "width":
                        node.setAttribute(att, value);
                        o._.dirty = 1;
                        if (attrs.fx) {
                            att = "x";
                            value = attrs.x;
                        } else {
                            break;
                        }
                    case "x":
                        if (attrs.fx) {
                            value = -attrs.x - (attrs.width || 0);
                        }
                    case "rx":
                        if (att == "rx" && o.type == "rect") {
                            break;
                        }
                    case "cx":
                        node.setAttribute(att, value);
                        o.pattern && updatePosition(o);
                        o._.dirty = 1;
                        break;
                    case "height":
                        node.setAttribute(att, value);
                        o._.dirty = 1;
                        if (attrs.fy) {
                            att = "y";
                            value = attrs.y;
                        } else {
                            break;
                        }
                    case "y":
                        if (attrs.fy) {
                            value = -attrs.y - (attrs.height || 0);
                        }
                    case "ry":
                        if (att == "ry" && o.type == "rect") {
                            break;
                        }
                    case "cy":
                        node.setAttribute(att, value);
                        o.pattern && updatePosition(o);
                        o._.dirty = 1;
                        break;
                    case "r":
                        if (o.type == "rect") {
                            $(node, {rx: value, ry: value});
                        } else {
                            node.setAttribute(att, value);
                        }
                        o._.dirty = 1;
                        break;
                    case "src":
                        if (o.type == "image") {
                            node.setAttributeNS(xlink, "href", value);
                        }
                        break;
                    case "stroke-width":
                        if (o._.sx != 1 || o._.sy != 1) {
                            value /= mmax(abs(o._.sx), abs(o._.sy)) || 1;
                        }
                        if (o.paper._vbSize) {
                            value *= o.paper._vbSize;
                        }
                        node.setAttribute(att, value);
                        if (attrs["stroke-dasharray"]) {
                            addDashes(o, attrs["stroke-dasharray"], params);
                        }
                        if (o._.arrows) {
                            "startString" in o._.arrows && addArrow(o, o._.arrows.startString);
                            "endString" in o._.arrows && addArrow(o, o._.arrows.endString, 1);
                        }
                        break;
                    case "stroke-dasharray":
                        addDashes(o, value, params);
                        break;
                    case "fill":
                        var isURL = Str(value).match(R._ISURL);
                        if (isURL) {
                            el = $("pattern");
                            var ig = $("image");
                            el.id = R.createUUID();
                            $(el, {x: 0, y: 0, patternUnits: "userSpaceOnUse", height: 1, width: 1});
                            $(ig, {x: 0, y: 0, "xlink:href": isURL[1]});
                            el.appendChild(ig);

                            (function (el) {
                                R._preload(isURL[1], function () {
                                    var w = this.offsetWidth,
                                        h = this.offsetHeight;
                                    $(el, {width: w, height: h});
                                    $(ig, {width: w, height: h});
                                    o.paper.safari();
                                });
                            })(el);
                            o.paper.defs.appendChild(el);
                            $(node, {fill: "url(#" + el.id + ")"});
                            o.pattern = el;
                            o.pattern && updatePosition(o);
                            break;
                        }
                        var clr = R.getRGB(value);
                        if (!clr.error) {
                            delete params.gradient;
                            delete attrs.gradient;
                            !R.is(attrs.opacity, "undefined") &&
                                R.is(params.opacity, "undefined") &&
                                $(node, {opacity: attrs.opacity});
                            !R.is(attrs["fill-opacity"], "undefined") &&
                                R.is(params["fill-opacity"], "undefined") &&
                                $(node, {"fill-opacity": attrs["fill-opacity"]});
                        } else if ((o.type == "circle" || o.type == "ellipse" || Str(value).charAt() != "r") && addGradientFill(o, value)) {
                            if ("opacity" in attrs || "fill-opacity" in attrs) {
                                var gradient = R._g.doc.getElementById(node.getAttribute("fill").replace(/^url\(#|\)$/g, E));
                                if (gradient) {
                                    var stops = gradient.getElementsByTagName("stop");
                                    $(stops[stops.length - 1], {"stop-opacity": ("opacity" in attrs ? attrs.opacity : 1) * ("fill-opacity" in attrs ? attrs["fill-opacity"] : 1)});
                                }
                            }
                            attrs.gradient = value;
                            attrs.fill = "none";
                            break;
                        }
                        clr[has]("opacity") && $(node, {"fill-opacity": clr.opacity > 1 ? clr.opacity / 100 : clr.opacity});
                    case "stroke":
                        clr = R.getRGB(value);
                        node.setAttribute(att, clr.hex);
                        att == "stroke" && clr[has]("opacity") && $(node, {"stroke-opacity": clr.opacity > 1 ? clr.opacity / 100 : clr.opacity});
                        if (att == "stroke" && o._.arrows) {
                            "startString" in o._.arrows && addArrow(o, o._.arrows.startString);
                            "endString" in o._.arrows && addArrow(o, o._.arrows.endString, 1);
                        }
                        break;
                    case "gradient":
                        (o.type == "circle" || o.type == "ellipse" || Str(value).charAt() != "r") && addGradientFill(o, value);
                        break;
                    case "opacity":
                        if (attrs.gradient && !attrs[has]("stroke-opacity")) {
                            $(node, {"stroke-opacity": value > 1 ? value / 100 : value});
                        }
                        // fall
                    case "fill-opacity":
                        if (attrs.gradient) {
                            gradient = R._g.doc.getElementById(node.getAttribute("fill").replace(/^url\(#|\)$/g, E));
                            if (gradient) {
                                stops = gradient.getElementsByTagName("stop");
                                $(stops[stops.length - 1], {"stop-opacity": value});
                            }
                            break;
                        }
                    default:
                        att == "font-size" && (value = toInt(value, 10) + "px");
                        var cssrule = att.replace(/(\-.)/g, function (w) {
                            return w.substring(1).toUpperCase();
                        });
                        node.style[cssrule] = value;
                        o._.dirty = 1;
                        node.setAttribute(att, value);
                        break;
                }
            }
        }

        tuneText(o, params);
        node.style.visibility = vis;
    },
    leading = 1.2,
    tuneText = function (el, params) {
        if (el.type != "text" || !(params[has]("text") || params[has]("font") || params[has]("font-size") || params[has]("x") || params[has]("y"))) {
            return;
        }
        var a = el.attrs,
            node = el.node,
            fontSize = node.firstChild ? toInt(R._g.doc.defaultView.getComputedStyle(node.firstChild, E).getPropertyValue("font-size"), 10) : 10;

        if (params[has]("text")) {
            a.text = params.text;
            while (node.firstChild) {
                node.removeChild(node.firstChild);
            }
            var texts = Str(params.text).split("\n"),
                tspans = [],
                tspan;
            for (var i = 0, ii = texts.length; i < ii; i++) {
                tspan = $("tspan");
                i && $(tspan, {dy: fontSize * leading, x: a.x});
                tspan.appendChild(R._g.doc.createTextNode(texts[i]));
                node.appendChild(tspan);
                tspans[i] = tspan;
            }
        } else {
            tspans = node.getElementsByTagName("tspan");
            for (i = 0, ii = tspans.length; i < ii; i++) if (i) {
                $(tspans[i], {dy: fontSize * leading, x: a.x});
            } else {
                $(tspans[0], {dy: 0});
            }
        }
        $(node, {x: a.x, y: a.y});
        el._.dirty = 1;
        var bb = el._getBBox(),
            dif = a.y - (bb.y + bb.height / 2);
        dif && R.is(dif, "finite") && $(tspans[0], {dy: dif});
    },
    Element = function (node, svg) {
        var X = 0,
            Y = 0;
        /*\
         * Element.node
         [ property (object) ]
         **
         * Gives you a reference to the DOM object, so you can assign event handlers or just mess around.
         **
         * Note: Don’t mess with it.
         > Usage
         | // draw a circle at coordinate 10,10 with radius of 10
         | var c = paper.circle(10, 10, 10);
         | c.node.onclick = function () {
         |     c.attr("fill", "red");
         | };
        \*/
        this[0] = this.node = node;
        /*\
         * Element.raphael
         [ property (object) ]
         **
         * Internal reference to @Raphael object. In case it is not available.
         > Usage
         | Raphael.el.red = function () {
         |     var hsb = this.paper.raphael.rgb2hsb(this.attr("fill"));
         |     hsb.h = 1;
         |     this.attr({fill: this.paper.raphael.hsb2rgb(hsb).hex});
         | }
        \*/
        node.raphael = true;
        /*\
         * Element.id
         [ property (number) ]
         **
         * Unique id of the element. Especially usesful when you want to listen to events of the element, 
         * because all events are fired in format `<module>.<action>.<id>`. Also useful for @Paper.getById method.
        \*/
        this.id = R._oid++;
        node.raphaelid = this.id;
        this.matrix = R.matrix();
        this.realPath = null;
        /*\
         * Element.paper
         [ property (object) ]
         **
         * Internal reference to “paper” where object drawn. Mainly for use in plugins and element extensions.
         > Usage
         | Raphael.el.cross = function () {
         |     this.attr({fill: "red"});
         |     this.paper.path("M10,10L50,50M50,10L10,50")
         |         .attr({stroke: "red"});
         | }
        \*/
        this.paper = svg;
        this.attrs = this.attrs || {};
        this._ = {
            transform: [],
            sx: 1,
            sy: 1,
            deg: 0,
            dx: 0,
            dy: 0,
            dirty: 1
        };
        !svg.bottom && (svg.bottom = this);
        /*\
         * Element.prev
         [ property (object) ]
         **
         * Reference to the previous element in the hierarchy.
        \*/
        this.prev = svg.top;
        svg.top && (svg.top.next = this);
        svg.top = this;
        /*\
         * Element.next
         [ property (object) ]
         **
         * Reference to the next element in the hierarchy.
        \*/
        this.next = null;
    },
    elproto = R.el;

    Element.prototype = elproto;
    elproto.constructor = Element;

    R._engine.path = function (pathString, SVG) {
        var el = $("path");
        SVG.canvas && SVG.canvas.appendChild(el);
        var p = new Element(el, SVG);
        p.type = "path";
        setFillAndStroke(p, {
            fill: "none",
            stroke: "#000",
            path: pathString
        });
        return p;
    };
    /*\
     * Element.rotate
     [ method ]
     **
     * Deprecated! Use @Element.transform instead.
     * Adds rotation by given angle around given point to the list of
     * transformations of the element.
     > Parameters
     - deg (number) angle in degrees
     - cx (number) #optional x coordinate of the centre of rotation
     - cy (number) #optional y coordinate of the centre of rotation
     * If cx & cy aren’t specified centre of the shape is used as a point of rotation.
     = (object) @Element
    \*/
    elproto.rotate = function (deg, cx, cy) {
        if (this.removed) {
            return this;
        }
        deg = Str(deg).split(separator);
        if (deg.length - 1) {
            cx = toFloat(deg[1]);
            cy = toFloat(deg[2]);
        }
        deg = toFloat(deg[0]);
        (cy == null) && (cx = cy);
        if (cx == null || cy == null) {
            var bbox = this.getBBox(1);
            cx = bbox.x + bbox.width / 2;
            cy = bbox.y + bbox.height / 2;
        }
        this.transform(this._.transform.concat([["r", deg, cx, cy]]));
        return this;
    };
    /*\
     * Element.scale
     [ method ]
     **
     * Deprecated! Use @Element.transform instead.
     * Adds scale by given amount relative to given point to the list of
     * transformations of the element.
     > Parameters
     - sx (number) horisontal scale amount
     - sy (number) vertical scale amount
     - cx (number) #optional x coordinate of the centre of scale
     - cy (number) #optional y coordinate of the centre of scale
     * If cx & cy aren’t specified centre of the shape is used instead.
     = (object) @Element
    \*/
    elproto.scale = function (sx, sy, cx, cy) {
        if (this.removed) {
            return this;
        }
        sx = Str(sx).split(separator);
        if (sx.length - 1) {
            sy = toFloat(sx[1]);
            cx = toFloat(sx[2]);
            cy = toFloat(sx[3]);
        }
        sx = toFloat(sx[0]);
        (sy == null) && (sy = sx);
        (cy == null) && (cx = cy);
        if (cx == null || cy == null) {
            var bbox = this.getBBox(1);
        }
        cx = cx == null ? bbox.x + bbox.width / 2 : cx;
        cy = cy == null ? bbox.y + bbox.height / 2 : cy;
        this.transform(this._.transform.concat([["s", sx, sy, cx, cy]]));
        return this;
    };
    /*\
     * Element.translate
     [ method ]
     **
     * Deprecated! Use @Element.transform instead.
     * Adds translation by given amount to the list of transformations of the element.
     > Parameters
     - dx (number) horisontal shift
     - dy (number) vertical shift
     = (object) @Element
    \*/
    elproto.translate = function (dx, dy) {
        if (this.removed) {
            return this;
        }
        dx = Str(dx).split(separator);
        if (dx.length - 1) {
            dy = toFloat(dx[1]);
        }
        dx = toFloat(dx[0]) || 0;
        dy = +dy || 0;
        this.transform(this._.transform.concat([["t", dx, dy]]));
        return this;
    };
    /*\
     * Element.transform
     [ method ]
     **
     * Adds transformation to the element which is separate to other attributes,
     * i.e. translation doesn’t change `x` or `y` of the rectange. The format
     * of transformation string is similar to the path string syntax:
     | "t100,100r30,100,100s2,2,100,100r45s1.5"
     * Each letter is a command. There are four commands: `t` is for translate, `r` is for rotate, `s` is for
     * scale and `m` is for matrix.
     *
     * There are also alternative “absolute” translation, rotation and scale: `T`, `R` and `S`. They will not take previous transformation into account. For example, `...T100,0` will always move element 100 px horisontally, while `...t100,0` could move it vertically if there is `r90` before. Just compare results of `r90t100,0` and `r90T100,0`.
     *
     * So, the example line above could be read like “translate by 100, 100; rotate 30° around 100, 100; scale twice around 100, 100;
     * rotate 45° around centre; scale 1.5 times relative to centre”. As you can see rotate and scale commands have origin
     * coordinates as optional parameters, the default is the centre point of the element.
     * Matrix accepts six parameters.
     > Usage
     | var el = paper.rect(10, 20, 300, 200);
     | // translate 100, 100, rotate 45°, translate -100, 0
     | el.transform("t100,100r45t-100,0");
     | // if you want you can append or prepend transformations
     | el.transform("...t50,50");
     | el.transform("s2...");
     | // or even wrap
     | el.transform("t50,50...t-50-50");
     | // to reset transformation call method with empty string
     | el.transform("");
     | // to get current value call it without parameters
     | console.log(el.transform());
     > Parameters
     - tstr (string) #optional transformation string
     * If tstr isn’t specified
     = (string) current transformation string
     * else
     = (object) @Element
    \*/
    elproto.transform = function (tstr) {
        var _ = this._;
        if (tstr == null) {
            return _.transform;
        }
        R._extractTransform(this, tstr);

        this.clip && $(this.clip, {transform: this.matrix.invert()});
        this.pattern && updatePosition(this);
        this.node && $(this.node, {transform: this.matrix});
    
        if (_.sx != 1 || _.sy != 1) {
            var sw = this.attrs[has]("stroke-width") ? this.attrs["stroke-width"] : 1;
            this.attr({"stroke-width": sw});
        }

        return this;
    };
    /*\
     * Element.hide
     [ method ]
     **
     * Makes element invisible. See @Element.show.
     = (object) @Element
    \*/
    elproto.hide = function () {
        !this.removed && this.paper.safari(this.node.style.display = "none");
        return this;
    };
    /*\
     * Element.show
     [ method ]
     **
     * Makes element visible. See @Element.hide.
     = (object) @Element
    \*/
    elproto.show = function () {
        !this.removed && this.paper.safari(this.node.style.display = "");
        return this;
    };
    /*\
     * Element.remove
     [ method ]
     **
     * Removes element from the paper.
    \*/
    elproto.remove = function () {
        if (this.removed || !this.node.parentNode) {
            return;
        }
        var paper = this.paper;
        paper.__set__ && paper.__set__.exclude(this);
        eve.unbind("raphael.*.*." + this.id);
        if (this.gradient) {
            paper.defs.removeChild(this.gradient);
        }
        R._tear(this, paper);
        if (this.node.parentNode.tagName.toLowerCase() == "a") {
            this.node.parentNode.parentNode.removeChild(this.node.parentNode);
        } else {
            this.node.parentNode.removeChild(this.node);
        }
        for (var i in this) {
            this[i] = typeof this[i] == "function" ? R._removedFactory(i) : null;
        }
        this.removed = true;
    };
    elproto._getBBox = function () {
        if (this.node.style.display == "none") {
            this.show();
            var hide = true;
        }
        var bbox = {};
        try {
            bbox = this.node.getBBox();
        } catch(e) {
            // Firefox 3.0.x plays badly here
        } finally {
            bbox = bbox || {};
        }
        hide && this.hide();
        return bbox;
    };
    /*\
     * Element.attr
     [ method ]
     **
     * Sets the attributes of the element.
     > Parameters
     - attrName (string) attribute’s name
     - value (string) value
     * or
     - params (object) object of name/value pairs
     * or
     - attrName (string) attribute’s name
     * or
     - attrNames (array) in this case method returns array of current values for given attribute names
     = (object) @Element if attrsName & value or params are passed in.
     = (...) value of the attribute if only attrsName is passed in.
     = (array) array of values of the attribute if attrsNames is passed in.
     = (object) object of attributes if nothing is passed in.
     > Possible parameters
     # <p>Please refer to the <a href="http://www.w3.org/TR/SVG/" title="The W3C Recommendation for the SVG language describes these properties in detail.">SVG specification</a> for an explanation of these parameters.</p>
     o arrow-end (string) arrowhead on the end of the path. The format for string is `<type>[-<width>[-<length>]]`. Possible types: `classic`, `block`, `open`, `oval`, `diamond`, `none`, width: `wide`, `narrow`, `medium`, length: `long`, `short`, `midium`.
     o clip-rect (string) comma or space separated values: x, y, width and height
     o cursor (string) CSS type of the cursor
     o cx (number) the x-axis coordinate of the center of the circle, or ellipse
     o cy (number) the y-axis coordinate of the center of the circle, or ellipse
     o fill (string) colour, gradient or image
     o fill-opacity (number)
     o font (string)
     o font-family (string)
     o font-size (number) font size in pixels
     o font-weight (string)
     o height (number)
     o href (string) URL, if specified element behaves as hyperlink
     o opacity (number)
     o path (string) SVG path string format
     o r (number) radius of the circle, ellipse or rounded corner on the rect
     o rx (number) horisontal radius of the ellipse
     o ry (number) vertical radius of the ellipse
     o src (string) image URL, only works for @Element.image element
     o stroke (string) stroke colour
     o stroke-dasharray (string) [“”, “`-`”, “`.`”, “`-.`”, “`-..`”, “`. `”, “`- `”, “`--`”, “`- .`”, “`--.`”, “`--..`”]
     o stroke-linecap (string) [“`butt`”, “`square`”, “`round`”]
     o stroke-linejoin (string) [“`bevel`”, “`round`”, “`miter`”]
     o stroke-miterlimit (number)
     o stroke-opacity (number)
     o stroke-width (number) stroke width in pixels, default is '1'
     o target (string) used with href
     o text (string) contents of the text element. Use `\n` for multiline text
     o text-anchor (string) [“`start`”, “`middle`”, “`end`”], default is “`middle`”
     o title (string) will create tooltip with a given text
     o transform (string) see @Element.transform
     o width (number)
     o x (number)
     o y (number)
     > Gradients
     * Linear gradient format: “`‹angle›-‹colour›[-‹colour›[:‹offset›]]*-‹colour›`”, example: “`90-#fff-#000`” – 90°
     * gradient from white to black or “`0-#fff-#f00:20-#000`” – 0° gradient from white via red (at 20%) to black.
     *
     * radial gradient: “`r[(‹fx›, ‹fy›)]‹colour›[-‹colour›[:‹offset›]]*-‹colour›`”, example: “`r#fff-#000`” –
     * gradient from white to black or “`r(0.25, 0.75)#fff-#000`” – gradient from white to black with focus point
     * at 0.25, 0.75. Focus point coordinates are in 0..1 range. Radial gradients can only be applied to circles and ellipses.
     > Path String
     # <p>Please refer to <a href="http://www.w3.org/TR/SVG/paths.html#PathData" title="Details of a path’s data attribute’s format are described in the SVG specification.">SVG documentation regarding path string</a>. Raphaël fully supports it.</p>
     > Colour Parsing
     # <ul>
     #     <li>Colour name (“<code>red</code>”, “<code>green</code>”, “<code>cornflowerblue</code>”, etc)</li>
     #     <li>#••• — shortened HTML colour: (“<code>#000</code>”, “<code>#fc0</code>”, etc)</li>
     #     <li>#•••••• — full length HTML colour: (“<code>#000000</code>”, “<code>#bd2300</code>”)</li>
     #     <li>rgb(•••, •••, •••) — red, green and blue channels’ values: (“<code>rgb(200,&nbsp;100,&nbsp;0)</code>”)</li>
     #     <li>rgb(•••%, •••%, •••%) — same as above, but in %: (“<code>rgb(100%,&nbsp;175%,&nbsp;0%)</code>”)</li>
     #     <li>rgba(•••, •••, •••, •••) — red, green and blue channels’ values: (“<code>rgba(200,&nbsp;100,&nbsp;0, .5)</code>”)</li>
     #     <li>rgba(•••%, •••%, •••%, •••%) — same as above, but in %: (“<code>rgba(100%,&nbsp;175%,&nbsp;0%, 50%)</code>”)</li>
     #     <li>hsb(•••, •••, •••) — hue, saturation and brightness values: (“<code>hsb(0.5,&nbsp;0.25,&nbsp;1)</code>”)</li>
     #     <li>hsb(•••%, •••%, •••%) — same as above, but in %</li>
     #     <li>hsba(•••, •••, •••, •••) — same as above, but with opacity</li>
     #     <li>hsl(•••, •••, •••) — almost the same as hsb, see <a href="http://en.wikipedia.org/wiki/HSL_and_HSV" title="HSL and HSV - Wikipedia, the free encyclopedia">Wikipedia page</a></li>
     #     <li>hsl(•••%, •••%, •••%) — same as above, but in %</li>
     #     <li>hsla(•••, •••, •••, •••) — same as above, but with opacity</li>
     #     <li>Optionally for hsb and hsl you could specify hue as a degree: “<code>hsl(240deg,&nbsp;1,&nbsp;.5)</code>” or, if you want to go fancy, “<code>hsl(240°,&nbsp;1,&nbsp;.5)</code>”</li>
     # </ul>
    \*/
    elproto.attr = function (name, value) {
        if (this.removed) {
            return this;
        }
        if (name == null) {
            var res = {};
            for (var a in this.attrs) if (this.attrs[has](a)) {
                res[a] = this.attrs[a];
            }
            res.gradient && res.fill == "none" && (res.fill = res.gradient) && delete res.gradient;
            res.transform = this._.transform;
            return res;
        }
        if (value == null && R.is(name, "string")) {
            if (name == "fill" && this.attrs.fill == "none" && this.attrs.gradient) {
                return this.attrs.gradient;
            }
            if (name == "transform") {
                return this._.transform;
            }
            var names = name.split(separator),
                out = {};
            for (var i = 0, ii = names.length; i < ii; i++) {
                name = names[i];
                if (name in this.attrs) {
                    out[name] = this.attrs[name];
                } else if (R.is(this.paper.customAttributes[name], "function")) {
                    out[name] = this.paper.customAttributes[name].def;
                } else {
                    out[name] = R._availableAttrs[name];
                }
            }
            return ii - 1 ? out : out[names[0]];
        }
        if (value == null && R.is(name, "array")) {
            out = {};
            for (i = 0, ii = name.length; i < ii; i++) {
                out[name[i]] = this.attr(name[i]);
            }
            return out;
        }
        if (value != null) {
            var params = {};
            params[name] = value;
        } else if (name != null && R.is(name, "object")) {
            params = name;
        }
        for (var key in params) {
            eve("raphael.attr." + key + "." + this.id, this, params[key]);
        }
        for (key in this.paper.customAttributes) if (this.paper.customAttributes[has](key) && params[has](key) && R.is(this.paper.customAttributes[key], "function")) {
            var par = this.paper.customAttributes[key].apply(this, [].concat(params[key]));
            this.attrs[key] = params[key];
            for (var subkey in par) if (par[has](subkey)) {
                params[subkey] = par[subkey];
            }
        }
        setFillAndStroke(this, params);
        return this;
    };
    /*\
     * Element.toFront
     [ method ]
     **
     * Moves the element so it is the closest to the viewer’s eyes, on top of other elements.
     = (object) @Element
    \*/
    elproto.toFront = function () {
        if (this.removed) {
            return this;
        }
        if (this.node.parentNode.tagName.toLowerCase() == "a") {
            this.node.parentNode.parentNode.appendChild(this.node.parentNode);
        } else {
            this.node.parentNode.appendChild(this.node);
        }
        var svg = this.paper;
        svg.top != this && R._tofront(this, svg);
        return this;
    };
    /*\
     * Element.toBack
     [ method ]
     **
     * Moves the element so it is the furthest from the viewer’s eyes, behind other elements.
     = (object) @Element
    \*/
    elproto.toBack = function () {
        if (this.removed) {
            return this;
        }
        var parent = this.node.parentNode;
        if (parent.tagName.toLowerCase() == "a") {
            parent.parentNode.insertBefore(this.node.parentNode, this.node.parentNode.parentNode.firstChild); 
        } else if (parent.firstChild != this.node) {
            parent.insertBefore(this.node, this.node.parentNode.firstChild);
        }
        R._toback(this, this.paper);
        var svg = this.paper;
        return this;
    };
    /*\
     * Element.insertAfter
     [ method ]
     **
     * Inserts current object after the given one.
     = (object) @Element
    \*/
    elproto.insertAfter = function (element) {
        if (this.removed) {
            return this;
        }
        var node = element.node || element[element.length - 1].node;
        if (node.nextSibling) {
            node.parentNode.insertBefore(this.node, node.nextSibling);
        } else {
            node.parentNode.appendChild(this.node);
        }
        R._insertafter(this, element, this.paper);
        return this;
    };
    /*\
     * Element.insertBefore
     [ method ]
     **
     * Inserts current object before the given one.
     = (object) @Element
    \*/
    elproto.insertBefore = function (element) {
        if (this.removed) {
            return this;
        }
        var node = element.node || element[0].node;
        node.parentNode.insertBefore(this.node, node);
        R._insertbefore(this, element, this.paper);
        return this;
    };
    elproto.blur = function (size) {
        // Experimental. No Safari support. Use it on your own risk.
        var t = this;
        if (+size !== 0) {
            var fltr = $("filter"),
                blur = $("feGaussianBlur");
            t.attrs.blur = size;
            fltr.id = R.createUUID();
            $(blur, {stdDeviation: +size || 1.5});
            fltr.appendChild(blur);
            t.paper.defs.appendChild(fltr);
            t._blur = fltr;
            $(t.node, {filter: "url(#" + fltr.id + ")"});
        } else {
            if (t._blur) {
                t._blur.parentNode.removeChild(t._blur);
                delete t._blur;
                delete t.attrs.blur;
            }
            t.node.removeAttribute("filter");
        }
        return t;
    };
    R._engine.circle = function (svg, x, y, r) {
        var el = $("circle");
        svg.canvas && svg.canvas.appendChild(el);
        var res = new Element(el, svg);
        res.attrs = {cx: x, cy: y, r: r, fill: "none", stroke: "#000"};
        res.type = "circle";
        $(el, res.attrs);
        return res;
    };
    R._engine.rect = function (svg, x, y, w, h, r) {
        var el = $("rect");
        svg.canvas && svg.canvas.appendChild(el);
        var res = new Element(el, svg);
        res.attrs = {x: x, y: y, width: w, height: h, r: r || 0, rx: r || 0, ry: r || 0, fill: "none", stroke: "#000"};
        res.type = "rect";
        $(el, res.attrs);
        return res;
    };
    R._engine.ellipse = function (svg, x, y, rx, ry) {
        var el = $("ellipse");
        svg.canvas && svg.canvas.appendChild(el);
        var res = new Element(el, svg);
        res.attrs = {cx: x, cy: y, rx: rx, ry: ry, fill: "none", stroke: "#000"};
        res.type = "ellipse";
        $(el, res.attrs);
        return res;
    };
    R._engine.image = function (svg, src, x, y, w, h) {
        var el = $("image");
        $(el, {x: x, y: y, width: w, height: h, preserveAspectRatio: "none"});
        el.setAttributeNS(xlink, "href", src);
        svg.canvas && svg.canvas.appendChild(el);
        var res = new Element(el, svg);
        res.attrs = {x: x, y: y, width: w, height: h, src: src};
        res.type = "image";
        return res;
    };
    R._engine.text = function (svg, x, y, text) {
        var el = $("text");
        svg.canvas && svg.canvas.appendChild(el);
        var res = new Element(el, svg);
        res.attrs = {
            x: x,
            y: y,
            "text-anchor": "middle",
            text: text,
            font: R._availableAttrs.font,
            stroke: "none",
            fill: "#000"
        };
        res.type = "text";
        setFillAndStroke(res, res.attrs);
        return res;
    };
    R._engine.setSize = function (width, height) {
        this.width = width || this.width;
        this.height = height || this.height;
        this.canvas.setAttribute("width", this.width);
        this.canvas.setAttribute("height", this.height);
        if (this._viewBox) {
            this.setViewBox.apply(this, this._viewBox);
        }
        return this;
    };
    R._engine.create = function () {
        var con = R._getContainer.apply(0, arguments),
            container = con && con.container,
            x = con.x,
            y = con.y,
            width = con.width,
            height = con.height;
        if (!container) {
            throw new Error("SVG container not found.");
        }
        var cnvs = $("svg"),
            css = "overflow:hidden;",
            isFloating;
        x = x || 0;
        y = y || 0;
        width = width || 512;
        height = height || 342;
        $(cnvs, {
            height: height,
            version: 1.1,
            width: width,
            xmlns: "http://www.w3.org/2000/svg"
        });
        if (container == 1) {
            cnvs.style.cssText = css + "position:absolute;left:" + x + "px;top:" + y + "px";
            R._g.doc.body.appendChild(cnvs);
            isFloating = 1;
        } else {
            cnvs.style.cssText = css + "position:relative";
            if (container.firstChild) {
                container.insertBefore(cnvs, container.firstChild);
            } else {
                container.appendChild(cnvs);
            }
        }
        container = new R._Paper;
        container.width = width;
        container.height = height;
        container.canvas = cnvs;
        container.clear();
        container._left = container._top = 0;
        isFloating && (container.renderfix = function () {});
        container.renderfix();
        return container;
    };
    R._engine.setViewBox = function (x, y, w, h, fit) {
        eve("raphael.setViewBox", this, this._viewBox, [x, y, w, h, fit]);
        var size = mmax(w / this.width, h / this.height),
            top = this.top,
            aspectRatio = fit ? "meet" : "xMinYMin",
            vb,
            sw;
        if (x == null) {
            if (this._vbSize) {
                size = 1;
            }
            delete this._vbSize;
            vb = "0 0 " + this.width + S + this.height;
        } else {
            this._vbSize = size;
            vb = x + S + y + S + w + S + h;
        }
        $(this.canvas, {
            viewBox: vb,
            preserveAspectRatio: aspectRatio
        });
        while (size && top) {
            sw = "stroke-width" in top.attrs ? top.attrs["stroke-width"] : 1;
            top.attr({"stroke-width": sw});
            top._.dirty = 1;
            top._.dirtyT = 1;
            top = top.prev;
        }
        this._viewBox = [x, y, w, h, !!fit];
        return this;
    };
    /*\
     * Paper.renderfix
     [ method ]
     **
     * Fixes the issue of Firefox and IE9 regarding subpixel rendering. If paper is dependant
     * on other elements after reflow it could shift half pixel which cause for lines to lost their crispness.
     * This method fixes the issue.
     **
       Special thanks to Mariusz Nowak (http://www.medikoo.com/) for this method.
    \*/
    R.prototype.renderfix = function () {
        var cnvs = this.canvas,
            s = cnvs.style,
            pos;
        try {
            pos = cnvs.getScreenCTM() || cnvs.createSVGMatrix();
        } catch (e) {
            pos = cnvs.createSVGMatrix();
        }
        var left = -pos.e % 1,
            top = -pos.f % 1;
        if (left || top) {
            if (left) {
                this._left = (this._left + left) % 1;
                s.left = this._left + "px";
            }
            if (top) {
                this._top = (this._top + top) % 1;
                s.top = this._top + "px";
            }
        }
    };
    /*\
     * Paper.clear
     [ method ]
     **
     * Clears the paper, i.e. removes all the elements.
    \*/
    R.prototype.clear = function () {
        R.eve("raphael.clear", this);
        var c = this.canvas;
        while (c.firstChild) {
            c.removeChild(c.firstChild);
        }
        this.bottom = this.top = null;
        (this.desc = $("desc")).appendChild(R._g.doc.createTextNode("Created with Rapha\xebl " + R.version));
        c.appendChild(this.desc);
        c.appendChild(this.defs = $("defs"));
    };
    /*\
     * Paper.remove
     [ method ]
     **
     * Removes the paper from the DOM.
    \*/
    R.prototype.remove = function () {
        eve("raphael.remove", this);
        this.canvas.parentNode && this.canvas.parentNode.removeChild(this.canvas);
        for (var i in this) {
            this[i] = typeof this[i] == "function" ? R._removedFactory(i) : null;
        }
    };
    var setproto = R.st;
    for (var method in elproto) if (elproto[has](method) && !setproto[has](method)) {
        setproto[method] = (function (methodname) {
            return function () {
                var arg = arguments;
                return this.forEach(function (el) {
                    el[methodname].apply(el, arg);
                });
            };
        })(method);
    }
})();

// ┌─────────────────────────────────────────────────────────────────────┐ \\
// │ Raphaël - JavaScript Vector Library                                 │ \\
// ├─────────────────────────────────────────────────────────────────────┤ \\
// │ VML Module                                                          │ \\
// ├─────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright (c) 2008-2011 Dmitry Baranovskiy (http://raphaeljs.com)   │ \\
// │ Copyright (c) 2008-2011 Sencha Labs (http://sencha.com)             │ \\
// │ Licensed under the MIT (http://raphaeljs.com/license.html) license. │ \\
// └─────────────────────────────────────────────────────────────────────┘ \\

(function(){
    if (!R.vml) {
        return;
    }
    var has = "hasOwnProperty",
        Str = String,
        toFloat = parseFloat,
        math = Math,
        round = math.round,
        mmax = math.max,
        mmin = math.min,
        abs = math.abs,
        fillString = "fill",
        separator = /[, ]+/,
        eve = R.eve,
        ms = " progid:DXImageTransform.Microsoft",
        S = " ",
        E = "",
        map = {M: "m", L: "l", C: "c", Z: "x", m: "t", l: "r", c: "v", z: "x"},
        bites = /([clmz]),?([^clmz]*)/gi,
        blurregexp = / progid:\S+Blur\([^\)]+\)/g,
        val = /-?[^,\s-]+/g,
        cssDot = "position:absolute;left:0;top:0;width:1px;height:1px",
        zoom = 21600,
        pathTypes = {path: 1, rect: 1, image: 1},
        ovalTypes = {circle: 1, ellipse: 1},
        path2vml = function (path) {
            var total =  /[ahqstv]/ig,
                command = R._pathToAbsolute;
            Str(path).match(total) && (command = R._path2curve);
            total = /[clmz]/g;
            if (command == R._pathToAbsolute && !Str(path).match(total)) {
                var res = Str(path).replace(bites, function (all, command, args) {
                    var vals = [],
                        isMove = command.toLowerCase() == "m",
                        res = map[command];
                    args.replace(val, function (value) {
                        if (isMove && vals.length == 2) {
                            res += vals + map[command == "m" ? "l" : "L"];
                            vals = [];
                        }
                        vals.push(round(value * zoom));
                    });
                    return res + vals;
                });
                return res;
            }
            var pa = command(path), p, r;
            res = [];
            for (var i = 0, ii = pa.length; i < ii; i++) {
                p = pa[i];
                r = pa[i][0].toLowerCase();
                r == "z" && (r = "x");
                for (var j = 1, jj = p.length; j < jj; j++) {
                    r += round(p[j] * zoom) + (j != jj - 1 ? "," : E);
                }
                res.push(r);
            }
            return res.join(S);
        },
        compensation = function (deg, dx, dy) {
            var m = R.matrix();
            m.rotate(-deg, .5, .5);
            return {
                dx: m.x(dx, dy),
                dy: m.y(dx, dy)
            };
        },
        setCoords = function (p, sx, sy, dx, dy, deg) {
            var _ = p._,
                m = p.matrix,
                fillpos = _.fillpos,
                o = p.node,
                s = o.style,
                y = 1,
                flip = "",
                dxdy,
                kx = zoom / sx,
                ky = zoom / sy;
            s.visibility = "hidden";
            if (!sx || !sy) {
                return;
            }
            o.coordsize = abs(kx) + S + abs(ky);
            s.rotation = deg * (sx * sy < 0 ? -1 : 1);
            if (deg) {
                var c = compensation(deg, dx, dy);
                dx = c.dx;
                dy = c.dy;
            }
            sx < 0 && (flip += "x");
            sy < 0 && (flip += " y") && (y = -1);
            s.flip = flip;
            o.coordorigin = (dx * -kx) + S + (dy * -ky);
            if (fillpos || _.fillsize) {
                var fill = o.getElementsByTagName(fillString);
                fill = fill && fill[0];
                o.removeChild(fill);
                if (fillpos) {
                    c = compensation(deg, m.x(fillpos[0], fillpos[1]), m.y(fillpos[0], fillpos[1]));
                    fill.position = c.dx * y + S + c.dy * y;
                }
                if (_.fillsize) {
                    fill.size = _.fillsize[0] * abs(sx) + S + _.fillsize[1] * abs(sy);
                }
                o.appendChild(fill);
            }
            s.visibility = "visible";
        };
    R.toString = function () {
        return  "Your browser doesn\u2019t support SVG. Falling down to VML.\nYou are running Rapha\xebl " + this.version;
    };
    var addArrow = function (o, value, isEnd) {
        var values = Str(value).toLowerCase().split("-"),
            se = isEnd ? "end" : "start",
            i = values.length,
            type = "classic",
            w = "medium",
            h = "medium";
        while (i--) {
            switch (values[i]) {
                case "block":
                case "classic":
                case "oval":
                case "diamond":
                case "open":
                case "none":
                    type = values[i];
                    break;
                case "wide":
                case "narrow": h = values[i]; break;
                case "long":
                case "short": w = values[i]; break;
            }
        }
        var stroke = o.node.getElementsByTagName("stroke")[0];
        stroke[se + "arrow"] = type;
        stroke[se + "arrowlength"] = w;
        stroke[se + "arrowwidth"] = h;
    },
    setFillAndStroke = function (o, params) {
        // o.paper.canvas.style.display = "none";
        o.attrs = o.attrs || {};
        var node = o.node,
            a = o.attrs,
            s = node.style,
            xy,
            newpath = pathTypes[o.type] && (params.x != a.x || params.y != a.y || params.width != a.width || params.height != a.height || params.cx != a.cx || params.cy != a.cy || params.rx != a.rx || params.ry != a.ry || params.r != a.r),
            isOval = ovalTypes[o.type] && (a.cx != params.cx || a.cy != params.cy || a.r != params.r || a.rx != params.rx || a.ry != params.ry),
            res = o;


        for (var par in params) if (params[has](par)) {
            a[par] = params[par];
        }
        if (newpath) {
            a.path = R._getPath[o.type](o);
            o._.dirty = 1;
        }
        params.href && (node.href = params.href);
        params.title && (node.title = params.title);
        params.target && (node.target = params.target);
        params.cursor && (s.cursor = params.cursor);
        "blur" in params && o.blur(params.blur);
        if (params.path && o.type == "path" || newpath) {
            node.path = path2vml(~Str(a.path).toLowerCase().indexOf("r") ? R._pathToAbsolute(a.path) : a.path);
            if (o.type == "image") {
                o._.fillpos = [a.x, a.y];
                o._.fillsize = [a.width, a.height];
                setCoords(o, 1, 1, 0, 0, 0);
            }
        }
        "transform" in params && o.transform(params.transform);
        if (isOval) {
            var cx = +a.cx,
                cy = +a.cy,
                rx = +a.rx || +a.r || 0,
                ry = +a.ry || +a.r || 0;
            node.path = R.format("ar{0},{1},{2},{3},{4},{1},{4},{1}x", round((cx - rx) * zoom), round((cy - ry) * zoom), round((cx + rx) * zoom), round((cy + ry) * zoom), round(cx * zoom));
            o._.dirty = 1;
        }
        if ("clip-rect" in params) {
            var rect = Str(params["clip-rect"]).split(separator);
            if (rect.length == 4) {
                rect[2] = +rect[2] + (+rect[0]);
                rect[3] = +rect[3] + (+rect[1]);
                var div = node.clipRect || R._g.doc.createElement("div"),
                    dstyle = div.style;
                dstyle.clip = R.format("rect({1}px {2}px {3}px {0}px)", rect);
                if (!node.clipRect) {
                    dstyle.position = "absolute";
                    dstyle.top = 0;
                    dstyle.left = 0;
                    dstyle.width = o.paper.width + "px";
                    dstyle.height = o.paper.height + "px";
                    node.parentNode.insertBefore(div, node);
                    div.appendChild(node);
                    node.clipRect = div;
                }
            }
            if (!params["clip-rect"]) {
                node.clipRect && (node.clipRect.style.clip = "auto");
            }
        }
        if (o.textpath) {
            var textpathStyle = o.textpath.style;
            params.font && (textpathStyle.font = params.font);
            params["font-family"] && (textpathStyle.fontFamily = '"' + params["font-family"].split(",")[0].replace(/^['"]+|['"]+$/g, E) + '"');
            params["font-size"] && (textpathStyle.fontSize = params["font-size"]);
            params["font-weight"] && (textpathStyle.fontWeight = params["font-weight"]);
            params["font-style"] && (textpathStyle.fontStyle = params["font-style"]);
        }
        if ("arrow-start" in params) {
            addArrow(res, params["arrow-start"]);
        }
        if ("arrow-end" in params) {
            addArrow(res, params["arrow-end"], 1);
        }
        if (params.opacity != null || 
            params["stroke-width"] != null ||
            params.fill != null ||
            params.src != null ||
            params.stroke != null ||
            params["stroke-width"] != null ||
            params["stroke-opacity"] != null ||
            params["fill-opacity"] != null ||
            params["stroke-dasharray"] != null ||
            params["stroke-miterlimit"] != null ||
            params["stroke-linejoin"] != null ||
            params["stroke-linecap"] != null) {
            var fill = node.getElementsByTagName(fillString),
                newfill = false;
            fill = fill && fill[0];
            !fill && (newfill = fill = createNode(fillString));
            if (o.type == "image" && params.src) {
                fill.src = params.src;
            }
            params.fill && (fill.on = true);
            if (fill.on == null || params.fill == "none" || params.fill === null) {
                fill.on = false;
            }
            if (fill.on && params.fill) {
                var isURL = Str(params.fill).match(R._ISURL);
                if (isURL) {
                    fill.parentNode == node && node.removeChild(fill);
                    fill.rotate = true;
                    fill.src = isURL[1];
                    fill.type = "tile";
                    var bbox = o.getBBox(1);
                    fill.position = bbox.x + S + bbox.y;
                    o._.fillpos = [bbox.x, bbox.y];

                    R._preload(isURL[1], function () {
                        o._.fillsize = [this.offsetWidth, this.offsetHeight];
                    });
                } else {
                    fill.color = R.getRGB(params.fill).hex;
                    fill.src = E;
                    fill.type = "solid";
                    if (R.getRGB(params.fill).error && (res.type in {circle: 1, ellipse: 1} || Str(params.fill).charAt() != "r") && addGradientFill(res, params.fill, fill)) {
                        a.fill = "none";
                        a.gradient = params.fill;
                        fill.rotate = false;
                    }
                }
            }
            if ("fill-opacity" in params || "opacity" in params) {
                var opacity = ((+a["fill-opacity"] + 1 || 2) - 1) * ((+a.opacity + 1 || 2) - 1) * ((+R.getRGB(params.fill).o + 1 || 2) - 1);
                opacity = mmin(mmax(opacity, 0), 1);
                fill.opacity = opacity;
                if (fill.src) {
                    fill.color = "none";
                }
            }
            node.appendChild(fill);
            var stroke = (node.getElementsByTagName("stroke") && node.getElementsByTagName("stroke")[0]),
            newstroke = false;
            !stroke && (newstroke = stroke = createNode("stroke"));
            if ((params.stroke && params.stroke != "none") ||
                params["stroke-width"] ||
                params["stroke-opacity"] != null ||
                params["stroke-dasharray"] ||
                params["stroke-miterlimit"] ||
                params["stroke-linejoin"] ||
                params["stroke-linecap"]) {
                stroke.on = true;
            }
            (params.stroke == "none" || params.stroke === null || stroke.on == null || params.stroke == 0 || params["stroke-width"] == 0) && (stroke.on = false);
            var strokeColor = R.getRGB(params.stroke);
            stroke.on && params.stroke && (stroke.color = strokeColor.hex);
            opacity = ((+a["stroke-opacity"] + 1 || 2) - 1) * ((+a.opacity + 1 || 2) - 1) * ((+strokeColor.o + 1 || 2) - 1);
            var width = (toFloat(params["stroke-width"]) || 1) * .75;
            opacity = mmin(mmax(opacity, 0), 1);
            params["stroke-width"] == null && (width = a["stroke-width"]);
            params["stroke-width"] && (stroke.weight = width);
            width && width < 1 && (opacity *= width) && (stroke.weight = 1);
            stroke.opacity = opacity;
        
            params["stroke-linejoin"] && (stroke.joinstyle = params["stroke-linejoin"] || "miter");
            stroke.miterlimit = params["stroke-miterlimit"] || 8;
            params["stroke-linecap"] && (stroke.endcap = params["stroke-linecap"] == "butt" ? "flat" : params["stroke-linecap"] == "square" ? "square" : "round");
            if (params["stroke-dasharray"]) {
                var dasharray = {
                    "-": "shortdash",
                    ".": "shortdot",
                    "-.": "shortdashdot",
                    "-..": "shortdashdotdot",
                    ". ": "dot",
                    "- ": "dash",
                    "--": "longdash",
                    "- .": "dashdot",
                    "--.": "longdashdot",
                    "--..": "longdashdotdot"
                };
                stroke.dashstyle = dasharray[has](params["stroke-dasharray"]) ? dasharray[params["stroke-dasharray"]] : E;
            }
            newstroke && node.appendChild(stroke);
        }
        if (res.type == "text") {
            res.paper.canvas.style.display = E;
            var span = res.paper.span,
                m = 100,
                fontSize = a.font && a.font.match(/\d+(?:\.\d*)?(?=px)/);
            s = span.style;
            a.font && (s.font = a.font);
            a["font-family"] && (s.fontFamily = a["font-family"]);
            a["font-weight"] && (s.fontWeight = a["font-weight"]);
            a["font-style"] && (s.fontStyle = a["font-style"]);
            fontSize = toFloat(a["font-size"] || fontSize && fontSize[0]) || 10;
            s.fontSize = fontSize * m + "px";
            res.textpath.string && (span.innerHTML = Str(res.textpath.string).replace(/</g, "&#60;").replace(/&/g, "&#38;").replace(/\n/g, "<br>"));
            var brect = span.getBoundingClientRect();
            res.W = a.w = (brect.right - brect.left) / m;
            res.H = a.h = (brect.bottom - brect.top) / m;
            // res.paper.canvas.style.display = "none";
            res.X = a.x;
            res.Y = a.y + res.H / 2;

            ("x" in params || "y" in params) && (res.path.v = R.format("m{0},{1}l{2},{1}", round(a.x * zoom), round(a.y * zoom), round(a.x * zoom) + 1));
            var dirtyattrs = ["x", "y", "text", "font", "font-family", "font-weight", "font-style", "font-size"];
            for (var d = 0, dd = dirtyattrs.length; d < dd; d++) if (dirtyattrs[d] in params) {
                res._.dirty = 1;
                break;
            }
        
            // text-anchor emulation
            switch (a["text-anchor"]) {
                case "start":
                    res.textpath.style["v-text-align"] = "left";
                    res.bbx = res.W / 2;
                break;
                case "end":
                    res.textpath.style["v-text-align"] = "right";
                    res.bbx = -res.W / 2;
                break;
                default:
                    res.textpath.style["v-text-align"] = "center";
                    res.bbx = 0;
                break;
            }
            res.textpath.style["v-text-kern"] = true;
        }
        // res.paper.canvas.style.display = E;
    },
    addGradientFill = function (o, gradient, fill) {
        o.attrs = o.attrs || {};
        var attrs = o.attrs,
            pow = Math.pow,
            opacity,
            oindex,
            type = "linear",
            fxfy = ".5 .5";
        o.attrs.gradient = gradient;
        gradient = Str(gradient).replace(R._radial_gradient, function (all, fx, fy) {
            type = "radial";
            if (fx && fy) {
                fx = toFloat(fx);
                fy = toFloat(fy);
                pow(fx - .5, 2) + pow(fy - .5, 2) > .25 && (fy = math.sqrt(.25 - pow(fx - .5, 2)) * ((fy > .5) * 2 - 1) + .5);
                fxfy = fx + S + fy;
            }
            return E;
        });
        gradient = gradient.split(/\s*\-\s*/);
        if (type == "linear") {
            var angle = gradient.shift();
            angle = -toFloat(angle);
            if (isNaN(angle)) {
                return null;
            }
        }
        var dots = R._parseDots(gradient);
        if (!dots) {
            return null;
        }
        o = o.shape || o.node;
        if (dots.length) {
            o.removeChild(fill);
            fill.on = true;
            fill.method = "none";
            fill.color = dots[0].color;
            fill.color2 = dots[dots.length - 1].color;
            var clrs = [];
            for (var i = 0, ii = dots.length; i < ii; i++) {
                dots[i].offset && clrs.push(dots[i].offset + S + dots[i].color);
            }
            fill.colors = clrs.length ? clrs.join() : "0% " + fill.color;
            if (type == "radial") {
                fill.type = "gradientTitle";
                fill.focus = "100%";
                fill.focussize = "0 0";
                fill.focusposition = fxfy;
                fill.angle = 0;
            } else {
                // fill.rotate= true;
                fill.type = "gradient";
                fill.angle = (270 - angle) % 360;
            }
            o.appendChild(fill);
        }
        return 1;
    },
    Element = function (node, vml) {
        this[0] = this.node = node;
        node.raphael = true;
        this.id = R._oid++;
        node.raphaelid = this.id;
        this.X = 0;
        this.Y = 0;
        this.attrs = {};
        this.paper = vml;
        this.matrix = R.matrix();
        this._ = {
            transform: [],
            sx: 1,
            sy: 1,
            dx: 0,
            dy: 0,
            deg: 0,
            dirty: 1,
            dirtyT: 1
        };
        !vml.bottom && (vml.bottom = this);
        this.prev = vml.top;
        vml.top && (vml.top.next = this);
        vml.top = this;
        this.next = null;
    };
    var elproto = R.el;

    Element.prototype = elproto;
    elproto.constructor = Element;
    elproto.transform = function (tstr) {
        if (tstr == null) {
            return this._.transform;
        }
        var vbs = this.paper._viewBoxShift,
            vbt = vbs ? "s" + [vbs.scale, vbs.scale] + "-1-1t" + [vbs.dx, vbs.dy] : E,
            oldt;
        if (vbs) {
            oldt = tstr = Str(tstr).replace(/\.{3}|\u2026/g, this._.transform || E);
        }
        R._extractTransform(this, vbt + tstr);
        var matrix = this.matrix.clone(),
            skew = this.skew,
            o = this.node,
            split,
            isGrad = ~Str(this.attrs.fill).indexOf("-"),
            isPatt = !Str(this.attrs.fill).indexOf("url(");
        matrix.translate(1, 1);
        if (isPatt || isGrad || this.type == "image") {
            skew.matrix = "1 0 0 1";
            skew.offset = "0 0";
            split = matrix.split();
            if ((isGrad && split.noRotation) || !split.isSimple) {
                o.style.filter = matrix.toFilter();
                var bb = this.getBBox(),
                    bbt = this.getBBox(1),
                    dx = bb.x - bbt.x,
                    dy = bb.y - bbt.y;
                o.coordorigin = (dx * -zoom) + S + (dy * -zoom);
                setCoords(this, 1, 1, dx, dy, 0);
            } else {
                o.style.filter = E;
                setCoords(this, split.scalex, split.scaley, split.dx, split.dy, split.rotate);
            }
        } else {
            o.style.filter = E;
            skew.matrix = Str(matrix);
            skew.offset = matrix.offset();
        }
        oldt && (this._.transform = oldt);
        return this;
    };
    elproto.rotate = function (deg, cx, cy) {
        if (this.removed) {
            return this;
        }
        if (deg == null) {
            return;
        }
        deg = Str(deg).split(separator);
        if (deg.length - 1) {
            cx = toFloat(deg[1]);
            cy = toFloat(deg[2]);
        }
        deg = toFloat(deg[0]);
        (cy == null) && (cx = cy);
        if (cx == null || cy == null) {
            var bbox = this.getBBox(1);
            cx = bbox.x + bbox.width / 2;
            cy = bbox.y + bbox.height / 2;
        }
        this._.dirtyT = 1;
        this.transform(this._.transform.concat([["r", deg, cx, cy]]));
        return this;
    };
    elproto.translate = function (dx, dy) {
        if (this.removed) {
            return this;
        }
        dx = Str(dx).split(separator);
        if (dx.length - 1) {
            dy = toFloat(dx[1]);
        }
        dx = toFloat(dx[0]) || 0;
        dy = +dy || 0;
        if (this._.bbox) {
            this._.bbox.x += dx;
            this._.bbox.y += dy;
        }
        this.transform(this._.transform.concat([["t", dx, dy]]));
        return this;
    };
    elproto.scale = function (sx, sy, cx, cy) {
        if (this.removed) {
            return this;
        }
        sx = Str(sx).split(separator);
        if (sx.length - 1) {
            sy = toFloat(sx[1]);
            cx = toFloat(sx[2]);
            cy = toFloat(sx[3]);
            isNaN(cx) && (cx = null);
            isNaN(cy) && (cy = null);
        }
        sx = toFloat(sx[0]);
        (sy == null) && (sy = sx);
        (cy == null) && (cx = cy);
        if (cx == null || cy == null) {
            var bbox = this.getBBox(1);
        }
        cx = cx == null ? bbox.x + bbox.width / 2 : cx;
        cy = cy == null ? bbox.y + bbox.height / 2 : cy;
    
        this.transform(this._.transform.concat([["s", sx, sy, cx, cy]]));
        this._.dirtyT = 1;
        return this;
    };
    elproto.hide = function () {
        !this.removed && (this.node.style.display = "none");
        return this;
    };
    elproto.show = function () {
        !this.removed && (this.node.style.display = E);
        return this;
    };
    elproto._getBBox = function () {
        if (this.removed) {
            return {};
        }
        return {
            x: this.X + (this.bbx || 0) - this.W / 2,
            y: this.Y - this.H,
            width: this.W,
            height: this.H
        };
    };
    elproto.remove = function () {
        if (this.removed || !this.node.parentNode) {
            return;
        }
        this.paper.__set__ && this.paper.__set__.exclude(this);
        R.eve.unbind("raphael.*.*." + this.id);
        R._tear(this, this.paper);
        this.node.parentNode.removeChild(this.node);
        this.shape && this.shape.parentNode.removeChild(this.shape);
        for (var i in this) {
            this[i] = typeof this[i] == "function" ? R._removedFactory(i) : null;
        }
        this.removed = true;
    };
    elproto.attr = function (name, value) {
        if (this.removed) {
            return this;
        }
        if (name == null) {
            var res = {};
            for (var a in this.attrs) if (this.attrs[has](a)) {
                res[a] = this.attrs[a];
            }
            res.gradient && res.fill == "none" && (res.fill = res.gradient) && delete res.gradient;
            res.transform = this._.transform;
            return res;
        }
        if (value == null && R.is(name, "string")) {
            if (name == fillString && this.attrs.fill == "none" && this.attrs.gradient) {
                return this.attrs.gradient;
            }
            var names = name.split(separator),
                out = {};
            for (var i = 0, ii = names.length; i < ii; i++) {
                name = names[i];
                if (name in this.attrs) {
                    out[name] = this.attrs[name];
                } else if (R.is(this.paper.customAttributes[name], "function")) {
                    out[name] = this.paper.customAttributes[name].def;
                } else {
                    out[name] = R._availableAttrs[name];
                }
            }
            return ii - 1 ? out : out[names[0]];
        }
        if (this.attrs && value == null && R.is(name, "array")) {
            out = {};
            for (i = 0, ii = name.length; i < ii; i++) {
                out[name[i]] = this.attr(name[i]);
            }
            return out;
        }
        var params;
        if (value != null) {
            params = {};
            params[name] = value;
        }
        value == null && R.is(name, "object") && (params = name);
        for (var key in params) {
            eve("raphael.attr." + key + "." + this.id, this, params[key]);
        }
        if (params) {
            for (key in this.paper.customAttributes) if (this.paper.customAttributes[has](key) && params[has](key) && R.is(this.paper.customAttributes[key], "function")) {
                var par = this.paper.customAttributes[key].apply(this, [].concat(params[key]));
                this.attrs[key] = params[key];
                for (var subkey in par) if (par[has](subkey)) {
                    params[subkey] = par[subkey];
                }
            }
            // this.paper.canvas.style.display = "none";
            if (params.text && this.type == "text") {
                this.textpath.string = params.text;
            }
            setFillAndStroke(this, params);
            // this.paper.canvas.style.display = E;
        }
        return this;
    };
    elproto.toFront = function () {
        !this.removed && this.node.parentNode.appendChild(this.node);
        this.paper && this.paper.top != this && R._tofront(this, this.paper);
        return this;
    };
    elproto.toBack = function () {
        if (this.removed) {
            return this;
        }
        if (this.node.parentNode.firstChild != this.node) {
            this.node.parentNode.insertBefore(this.node, this.node.parentNode.firstChild);
            R._toback(this, this.paper);
        }
        return this;
    };
    elproto.insertAfter = function (element) {
        if (this.removed) {
            return this;
        }
        if (element.constructor == R.st.constructor) {
            element = element[element.length - 1];
        }
        if (element.node.nextSibling) {
            element.node.parentNode.insertBefore(this.node, element.node.nextSibling);
        } else {
            element.node.parentNode.appendChild(this.node);
        }
        R._insertafter(this, element, this.paper);
        return this;
    };
    elproto.insertBefore = function (element) {
        if (this.removed) {
            return this;
        }
        if (element.constructor == R.st.constructor) {
            element = element[0];
        }
        element.node.parentNode.insertBefore(this.node, element.node);
        R._insertbefore(this, element, this.paper);
        return this;
    };
    elproto.blur = function (size) {
        var s = this.node.runtimeStyle,
            f = s.filter;
        f = f.replace(blurregexp, E);
        if (+size !== 0) {
            this.attrs.blur = size;
            s.filter = f + S + ms + ".Blur(pixelradius=" + (+size || 1.5) + ")";
            s.margin = R.format("-{0}px 0 0 -{0}px", round(+size || 1.5));
        } else {
            s.filter = f;
            s.margin = 0;
            delete this.attrs.blur;
        }
        return this;
    };

    R._engine.path = function (pathString, vml) {
        var el = createNode("shape");
        el.style.cssText = cssDot;
        el.coordsize = zoom + S + zoom;
        el.coordorigin = vml.coordorigin;
        var p = new Element(el, vml),
            attr = {fill: "none", stroke: "#000"};
        pathString && (attr.path = pathString);
        p.type = "path";
        p.path = [];
        p.Path = E;
        setFillAndStroke(p, attr);
        vml.canvas.appendChild(el);
        var skew = createNode("skew");
        skew.on = true;
        el.appendChild(skew);
        p.skew = skew;
        p.transform(E);
        return p;
    };
    R._engine.rect = function (vml, x, y, w, h, r) {
        var path = R._rectPath(x, y, w, h, r),
            res = vml.path(path),
            a = res.attrs;
        res.X = a.x = x;
        res.Y = a.y = y;
        res.W = a.width = w;
        res.H = a.height = h;
        a.r = r;
        a.path = path;
        res.type = "rect";
        return res;
    };
    R._engine.ellipse = function (vml, x, y, rx, ry) {
        var res = vml.path(),
            a = res.attrs;
        res.X = x - rx;
        res.Y = y - ry;
        res.W = rx * 2;
        res.H = ry * 2;
        res.type = "ellipse";
        setFillAndStroke(res, {
            cx: x,
            cy: y,
            rx: rx,
            ry: ry
        });
        return res;
    };
    R._engine.circle = function (vml, x, y, r) {
        var res = vml.path(),
            a = res.attrs;
        res.X = x - r;
        res.Y = y - r;
        res.W = res.H = r * 2;
        res.type = "circle";
        setFillAndStroke(res, {
            cx: x,
            cy: y,
            r: r
        });
        return res;
    };
    R._engine.image = function (vml, src, x, y, w, h) {
        var path = R._rectPath(x, y, w, h),
            res = vml.path(path).attr({stroke: "none"}),
            a = res.attrs,
            node = res.node,
            fill = node.getElementsByTagName(fillString)[0];
        a.src = src;
        res.X = a.x = x;
        res.Y = a.y = y;
        res.W = a.width = w;
        res.H = a.height = h;
        a.path = path;
        res.type = "image";
        fill.parentNode == node && node.removeChild(fill);
        fill.rotate = true;
        fill.src = src;
        fill.type = "tile";
        res._.fillpos = [x, y];
        res._.fillsize = [w, h];
        node.appendChild(fill);
        setCoords(res, 1, 1, 0, 0, 0);
        return res;
    };
    R._engine.text = function (vml, x, y, text) {
        var el = createNode("shape"),
            path = createNode("path"),
            o = createNode("textpath");
        x = x || 0;
        y = y || 0;
        text = text || "";
        path.v = R.format("m{0},{1}l{2},{1}", round(x * zoom), round(y * zoom), round(x * zoom) + 1);
        path.textpathok = true;
        o.string = Str(text);
        o.on = true;
        el.style.cssText = cssDot;
        el.coordsize = zoom + S + zoom;
        el.coordorigin = "0 0";
        var p = new Element(el, vml),
            attr = {
                fill: "#000",
                stroke: "none",
                font: R._availableAttrs.font,
                text: text
            };
        p.shape = el;
        p.path = path;
        p.textpath = o;
        p.type = "text";
        p.attrs.text = Str(text);
        p.attrs.x = x;
        p.attrs.y = y;
        p.attrs.w = 1;
        p.attrs.h = 1;
        setFillAndStroke(p, attr);
        el.appendChild(o);
        el.appendChild(path);
        vml.canvas.appendChild(el);
        var skew = createNode("skew");
        skew.on = true;
        el.appendChild(skew);
        p.skew = skew;
        p.transform(E);
        return p;
    };
    R._engine.setSize = function (width, height) {
        var cs = this.canvas.style;
        this.width = width;
        this.height = height;
        width == +width && (width += "px");
        height == +height && (height += "px");
        cs.width = width;
        cs.height = height;
        cs.clip = "rect(0 " + width + " " + height + " 0)";
        if (this._viewBox) {
            R._engine.setViewBox.apply(this, this._viewBox);
        }
        return this;
    };
    R._engine.setViewBox = function (x, y, w, h, fit) {
        R.eve("raphael.setViewBox", this, this._viewBox, [x, y, w, h, fit]);
        var width = this.width,
            height = this.height,
            size = 1 / mmax(w / width, h / height),
            H, W;
        if (fit) {
            H = height / h;
            W = width / w;
            if (w * H < width) {
                x -= (width - w * H) / 2 / H;
            }
            if (h * W < height) {
                y -= (height - h * W) / 2 / W;
            }
        }
        this._viewBox = [x, y, w, h, !!fit];
        this._viewBoxShift = {
            dx: -x,
            dy: -y,
            scale: size
        };
        this.forEach(function (el) {
            el.transform("...");
        });
        return this;
    };
    var createNode;
    R._engine.initWin = function (win) {
            var doc = win.document;
            doc.createStyleSheet().addRule(".rvml", "behavior:url(#default#VML)");
            try {
                !doc.namespaces.rvml && doc.namespaces.add("rvml", "urn:schemas-microsoft-com:vml");
                createNode = function (tagName) {
                    return doc.createElement('<rvml:' + tagName + ' class="rvml">');
                };
            } catch (e) {
                createNode = function (tagName) {
                    return doc.createElement('<' + tagName + ' xmlns="urn:schemas-microsoft.com:vml" class="rvml">');
                };
            }
        };
    R._engine.initWin(R._g.win);
    R._engine.create = function () {
        var con = R._getContainer.apply(0, arguments),
            container = con.container,
            height = con.height,
            s,
            width = con.width,
            x = con.x,
            y = con.y;
        if (!container) {
            throw new Error("VML container not found.");
        }
        var res = new R._Paper,
            c = res.canvas = R._g.doc.createElement("div"),
            cs = c.style;
        x = x || 0;
        y = y || 0;
        width = width || 512;
        height = height || 342;
        res.width = width;
        res.height = height;
        width == +width && (width += "px");
        height == +height && (height += "px");
        res.coordsize = zoom * 1e3 + S + zoom * 1e3;
        res.coordorigin = "0 0";
        res.span = R._g.doc.createElement("span");
        res.span.style.cssText = "position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;";
        c.appendChild(res.span);
        cs.cssText = R.format("top:0;left:0;width:{0};height:{1};display:inline-block;position:relative;clip:rect(0 {0} {1} 0);overflow:hidden", width, height);
        if (container == 1) {
            R._g.doc.body.appendChild(c);
            cs.left = x + "px";
            cs.top = y + "px";
            cs.position = "absolute";
        } else {
            if (container.firstChild) {
                container.insertBefore(c, container.firstChild);
            } else {
                container.appendChild(c);
            }
        }
        res.renderfix = function () {};
        return res;
    };
    R.prototype.clear = function () {
        R.eve("raphael.clear", this);
        this.canvas.innerHTML = E;
        this.span = R._g.doc.createElement("span");
        this.span.style.cssText = "position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;display:inline;";
        this.canvas.appendChild(this.span);
        this.bottom = this.top = null;
    };
    R.prototype.remove = function () {
        R.eve("raphael.remove", this);
        this.canvas.parentNode.removeChild(this.canvas);
        for (var i in this) {
            this[i] = typeof this[i] == "function" ? R._removedFactory(i) : null;
        }
        return true;
    };

    var setproto = R.st;
    for (var method in elproto) if (elproto[has](method) && !setproto[has](method)) {
        setproto[method] = (function (methodname) {
            return function () {
                var arg = arguments;
                return this.forEach(function (el) {
                    el[methodname].apply(el, arg);
                });
            };
        })(method);
    }
})();

    // EXPOSE
    // SVG and VML are appended just before the EXPOSE line
    // Even with AMD, Raphael should be defined globally
    oldRaphael.was ? (g.win.Raphael = R) : (Raphael = R);

    return R;
}));
//    abc_animation.js: handles animating the music in real time.
//    Copyright (C) 2014 Paul Rosen (paul at paulrosen dot net)
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.

/*global ABCJS, console */

if (!window.ABCJS)
	window.ABCJS = {};

(function() {
	"use strict";

	function hasClass(element, cls) {
		var elClass = element.getAttribute("class");
		var rclass = /[\t\r\n\f]/g;
		var className = " " + cls + " ";
		return (element.nodeType === 1 && (" " + elClass + " ").replace(rclass, " ").indexOf(className) >= 0);
	}

	function getAllElementsByClasses(startingEl, class1, class2) {
		var els = startingEl.getElementsByClassName(class1);
		var ret = [];
		for (var i = 0; i < els.length; i++) {
			if (hasClass(els[i], class2))
				ret.push(els[i]);
		}
		return ret;
	}

	function getBeatsPerMinute(tune, options) {
		// We either want to run the timer once per measure or once per beat. If we run it once per beat we need a multiplier for the measures.
		// So, first we figure out the beats per minute and the beats per measure, then depending on the type of animation, we can
		// calculate the desired interval (ret.tick) and the number of ticks before we want to run the measure
		var bpm;
		if (options.bpm)
			bpm = options.bpm;
		else {
			if (tune && tune.metaText && tune.metaText.tempo && tune.metaText.tempo.bpm)
				bpm = tune.metaText.tempo.bpm;
			else
				bpm = 120; // Just set it to something. The user should have set this.
		}
		return bpm;
	}

	// This is a way to manipulate the written music on a timer. Their are two ways to manipulate the music: turn off each measure as it goes by,
	// and put a vertical cursor before the next note to play. The timer works at the speed of the original tempo of the music unless it is overwritten
	// in the options parameter.
	//
	// parameters:
	// paper: the output div that the music is in.
	// tune: the tune object returned by renderAbc.
	// options: a hash containing the following:
	//    hideFinishedMeasures: true or false [ false is the default ]
	//    showCursor: true or false [ false is the default ]
	//    bpm: number of beats per minute [ the default is whatever is in the Q: field ]
	var stopNextTime = false;
	var cursor;
	ABCJS.startAnimation = function(paper, tune, options) {
		if (paper.getElementsByClassName === undefined) {
			console.error("ABCJS.startAnimation: The first parameter must be a regular DOM element. (Did you pass a jQuery object or an ID?)");
			return;
		}
		if (tune.getBeatLength === undefined) {
			console.error("ABCJS.startAnimation: The second parameter must be a single tune. (Did you pass the entire array of tunes?)");
			return;
		}
		if (options.showCursor) {
			cursor = $('<div class="cursor" style="position: absolute;"></div>');
			$(paper).append(cursor);
			$(paper).css({ position: "relative" });
		}

		stopNextTime = false;
		var beatsPerMinute = getBeatsPerMinute(tune, options);
		var beatsPerMillisecond = beatsPerMinute / 60000;
		var beatLength = tune.getBeatLength(); // This is the same units as the duration is stored in.

		var startTime;

		function processMeasureHider(lineNum, measureNum) {
			var els = getAllElementsByClasses(paper, "l"+lineNum, "m"+measureNum);

			if (els.length > 0) {
				for (var i = 0; i < els.length; i++) {
					var el = els[i];
					if (!hasClass(el, "bar"))
						el.style.display = "none";
				}
			}
		}

		function makeSortedArray(hash) {
			var arr = [];
			for (var k in hash) {
				if (hash.hasOwnProperty(k))
					arr.push(hash[k]);
			}
			arr = arr.sort(function(a,b) {
				var diff = a.time - b.time;
				// if the events have the same time, make sure a bar comes before a note
				if (diff !== 0) {
					return diff;
				}
				else {
					return a.type === "bar" ? -1 : 1;
				}
			});
			return arr;
		}

		var timingEvents = [];
		function setupEvents(engraver) {
			var eventHash = {};
			// The time is the number of measures from the beginning of the piece.
			var time = 0;
			var isTiedState = false;
			for (var line=0;line<engraver.staffgroups.length; line++) {
				var group = engraver.staffgroups[line];
				var voices = group.voices;
				var firstStaff = group.staffs[0];
				var middleC = firstStaff.absoluteY;
				var top = middleC - firstStaff.top*ABCJS.write.spacing.STEP;
				var lastStaff = group.staffs[group.staffs.length-1];
				middleC = lastStaff.absoluteY;
				var bottom = middleC - lastStaff.bottom*ABCJS.write.spacing.STEP;
				var height = bottom - top;
				var maxVoiceTime = 0;
				// Put in the notes for all voices, then sort them, then remove duplicates
				for (var v = 0; v < voices.length; v++) {
					var voiceTime = time;
					var elements = voices[v].children;
					for (var elem=0; elem<elements.length; elem++) {
						var element = elements[elem];
						if (element.duration > 0) {
							// There are 3 possibilities here: the note could stand on its own, the note could be tied to the next,
							// the note could be tied to the previous, and the note could be tied on both sides.
							var isTiedToNext = element.startTie;
							if (isTiedState) {
								if (!isTiedToNext)
									isTiedState = false;
								// If the note is tied on both sides it can just be ignored.
							} else {
								// the last note wasn't tied.
								if (!eventHash["event"+voiceTime])
									eventHash["event"+voiceTime] = { type: "event", time: voiceTime, top: top, height: height, left: element.x, width: element.w };
								else {
									// If there is more than one voice then two notes can fall at the same time. Usually they would be lined up in the same place, but if it is a whole rest, then it is placed funny. In any case, the left most element wins.
									eventHash["event"+voiceTime].left = Math.min(eventHash["event"+voiceTime].left, element.x);
								}
								if (isTiedToNext)
									isTiedState = true;
							}
							voiceTime += element.duration;
						}
						if (element.type === 'bar') {
							if (timingEvents.length === 0 || timingEvents[timingEvents.length-1] !== 'bar') {
								if (element.elemset && element.elemset.length > 0 && element.elemset[0].attrs) {
									var klass = element.elemset[0].attrs['class'];
									var arr = klass.split(' ');
									var lineNum;
									var measureNum;
									for (var i = 0; i < arr.length; i++) {
										var match = /m(\d+)/.exec(arr[i]);
										if (match)
											measureNum = match[1];
										match = /l(\d+)/.exec(arr[i]);
										if (match)
											lineNum = match[1];
									}
									eventHash["bar"+voiceTime] = { type: "bar", time: voiceTime, lineNum: lineNum, measureNum: measureNum };
								}
							}
						}
					}
					maxVoiceTime = Math.max(maxVoiceTime, voiceTime);
				}
				time = maxVoiceTime;
			}
			// now we have all the events, but if there are multiple voices then there may be events out of order or duplicated, so normalize it.
			timingEvents = makeSortedArray(eventHash);
		}
		setupEvents(tune.engraver);

		function processShowCursor() {
			var currentNote = timingEvents.shift();
			if (!currentNote) {
				stopNextTime = true;
				return 0;
			}
			if (currentNote.type === "bar") {
				if (options.hideFinishedMeasures)
					processMeasureHider(currentNote.lineNum, currentNote.measureNum);
				if (timingEvents.length > 0)
					return timingEvents[0].time / beatLength;
				return 0;
			}
			if (options.showCursor)
				cursor.css({ left: currentNote.left + "px", top: currentNote.top + "px", width: currentNote.width + "px", height: currentNote.height + "px" });
			if (timingEvents.length > 0)
				return timingEvents[0].time / beatLength;
			stopNextTime = true;
			return 0;
		}

		function processNext() {
			if (stopNextTime) {
				ABCJS.stopAnimation();
				return;
			}
			var nextTimeInBeats = processShowCursor();
			var nextTimeInMilliseconds = nextTimeInBeats / beatsPerMillisecond;
			var currentTime = new Date();
			currentTime = currentTime.getTime();
			var interval = startTime + nextTimeInMilliseconds - currentTime;
			if (interval <= 0)
				processNext();
			else
				setTimeout(processNext, interval);
		}
		startTime = new Date();
		startTime = startTime.getTime();
		processNext();
	};

	ABCJS.stopAnimation = function() {
		stopNextTime = true;
		if (cursor) {
			cursor.remove();
			cursor = null;
		}
	};
})();
//    abc_tunebook.js: splits a string representing ABC Music Notation into individual tunes.
//    Copyright (C) 2010 Paul Rosen (paul at paulrosen dot net)
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.

/*global document, Raphael */
/*global window, ABCJS, console */

if (!window.ABCJS)
	window.ABCJS = {};

(function() {
	ABCJS.numberOfTunes = function(abc) {
		var tunes = abc.split("\nX:");
		var num = tunes.length;
		if (num === 0) num = 1;
		return num;
	};

	ABCJS.TuneBook = function(book) {
		var This = this;
		var directives = "";
		book = window.ABCJS.parse.strip(book);
		var tunes = book.split("\nX:");
		for (var i = 1; i < tunes.length; i++)	// Put back the X: that we lost when splitting the tunes.
			tunes[i] = "X:" + tunes[i];
		// Keep track of the character position each tune starts with.
		var pos = 0;
		This.tunes = [];
		window.ABCJS.parse.each(tunes, function(tune) {
			This.tunes.push({ abc: tune, startPos: pos});
			pos += tune.length;
		});
		if (This.tunes.length > 1 && !window.ABCJS.parse.startsWith(This.tunes[0].abc, 'X:')) {	// If there is only one tune, the X: might be missing, otherwise assume the top of the file is "intertune"
			// There could be file-wide directives in this, if so, we need to insert it into each tune. We can probably get away with
			// just looking for file-wide directives here (before the first tune) and inserting them at the bottom of each tune, since
			// the tune is parsed all at once. The directives will be seen before the engraver begins processing.
			var dir = This.tunes.shift();
			var arrDir = dir.abc.split('\n');
			window.ABCJS.parse.each(arrDir, function(line) {
				if (window.ABCJS.parse.startsWith(line, '%%'))
					directives += line + '\n';
			});
		}
		This.header = directives;

		// Now, the tune ends at a blank line, so truncate it if needed. There may be "intertune" stuff.
		window.ABCJS.parse.each(This.tunes, function(tune) {
			var end = tune.abc.indexOf('\n\n');
			if (end > 0)
				tune.abc = tune.abc.substring(0, end);
			tune.pure = tune.abc;
			tune.abc = directives + tune.abc;

			// for the user's convenience, parse and store the title separately. The title is between the first T: and the next \n
			var title = tune.pure.split("T:");
			if (title.length > 1) {
				title = title[1].split("\n");
				tune.title = title[0].replace(/^\s+|\s+$/g, '');
			} else
				tune.title = "";

			// for the user's convenience, parse and store the id separately. The id is between the first X: and the next \n
			var id = tune.pure.substring(2, tune.pure.indexOf("\n"));
			tune.id = id.replace(/^\s+|\s+$/g, '');
		});
	};

	ABCJS.TuneBook.prototype.getTuneById = function(id) {
		for (var i = 0; i < this.tunes.length; i++) {
			if (this.tunes[i].id === id)
				return this.tunes[i];
		}
		return null;
	};

	ABCJS.TuneBook.prototype.getTuneByTitle = function(title) {
		for (var i = 0; i < this.tunes.length; i++) {
			if (this.tunes[i].title === title)
				return this.tunes[i];
		}
		return null;
	};

	function renderEngine(callback, output, abc, parserParams, renderParams) {
		var ret = [];
		var isArray = function(testObject) {
			return testObject && !(testObject.propertyIsEnumerable('length')) && typeof testObject === 'object' && typeof testObject.length === 'number';
		};

		// check and normalize input parameters
		if (output === undefined || abc === undefined)
			return;
		if (!isArray(output))
			output = [ output ];
		if (parserParams === undefined)
			parserParams = {};
		if (renderParams === undefined)
			renderParams = {};
		var currentTune = renderParams.startingTune ? renderParams.startingTune : 0;

		// parse the abc string
		var book = new ABCJS.TuneBook(abc);
		var abcParser = new window.ABCJS.parse.Parse();

		// output each tune, if it exists. Otherwise clear the div.
		for (var i = 0; i < output.length; i++) {
			var div = output[i];
			if (typeof(div) === "string")
				div = document.getElementById(div);
			if (div) {
				div.innerHTML = "";
				if (currentTune < book.tunes.length) {
					abcParser.parse(book.tunes[currentTune].abc, parserParams);
					var tune = abcParser.getTune();
					ret.push(tune);
					callback(div, tune);
				}
			}
			currentTune++;
		}
		return ret;
	}

	// A quick way to render a tune from javascript when interactivity is not required.
	// This is used when a javascript routine has some abc text that it wants to render
	// in a div or collection of divs. One tune or many can be rendered.
	//
	// parameters:
	//		output: an array of divs that the individual tunes are rendered to.
	//			If the number of tunes exceeds the number of divs in the array, then
	//			only the first tunes are rendered. If the number of divs exceeds the number
	//			of tunes, then the unused divs are cleared. The divs can be passed as either
	//			elements or strings of ids. If ids are passed, then the div MUST exist already.
	//			(if a single element is passed, then it is an implied array of length one.)
	//			(if a null is passed for an element, or the element doesn't exist, then that tune is skipped.)
	//		abc: text representing a tune or an entire tune book in ABC notation.
	//		renderParams: hash of:
	//			startingTune: an index, starting at zero, representing which tune to start rendering at.
	//				(If this element is not present, then rendering starts at zero.)
	//			width: 800 by default. The width in pixels of the output paper
	ABCJS.renderAbc = function(output, abc, parserParams, engraverParams, renderParams) {
		function callback(div, tune) {
			var width = renderParams ? renderParams.width ? renderParams.width : 800 : 800;
			/* jshint -W064 */ var paper = Raphael(div, width, 400); /* jshint +W064 */
			if (engraverParams === undefined)
				engraverParams = {};
			var engraver_controller = new ABCJS.write.EngraverController(paper, engraverParams);
			engraver_controller.engraveABC(tune);
			tune.engraver = engraver_controller;
		}

		return renderEngine(callback, output, abc, parserParams, renderParams);
	};

	// A quick way to render a tune from javascript when interactivity is not required.
	// This is used when a javascript routine has some abc text that it wants to render
	// in a div or collection of divs. One tune or many can be rendered.
	//
	// parameters:
	//		output: an array of divs that the individual tunes are rendered to.
	//			If the number of tunes exceeds the number of divs in the array, then
	//			only the first tunes are rendered. If the number of divs exceeds the number
	//			of tunes, then the unused divs are cleared. The divs can be passed as either
	//			elements or strings of ids. If ids are passed, then the div MUST exist already.
	//			(if a single element is passed, then it is an implied array of length one.)
	//			(if a null is passed for an element, or the element doesn't exist, then that tune is skipped.)
	//		abc: text representing a tune or an entire tune book in ABC notation.
	//		renderParams: hash of:
	//			startingTune: an index, starting at zero, representing which tune to start rendering at.
	//				(If this element is not present, then rendering starts at zero.)
	ABCJS.renderMidi = function(output, abc, parserParams, midiParams, renderParams) {
		function callback(div, tune) {
			if (midiParams === undefined)
				midiParams = {};
			var midiwriter = new ABCJS.midi.MidiWriter(div, midiParams);
			midiwriter.writeABC(tune);
		}

		return renderEngine(callback, output, abc, parserParams, renderParams);
	};
})();
//    abc_tune.js: a computer usable internal structure representing one tune.
//    Copyright (C) 2010 Paul Rosen (paul at paulrosen dot net)
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.

/*global window */

if (!window.ABCJS)
	window.ABCJS = {};

if (!window.ABCJS.data)
	window.ABCJS.data = {};

/**
 * This is the data for a single ABC tune. It is created and populated by the window.ABCJS.parse.Parse class.
 * Also known as the ABCJS Abstract Syntax Tree
 * @alternateClassName ABCJS.Tune
 */
window.ABCJS.data.Tune = function() {
	// The structure consists of a hash with the following two items:
	// metaText: a hash of {key, value}, where key is one of: title, author, rhythm, source, transcription, unalignedWords, etc...
	// tempo: { noteLength: number (e.g. .125), bpm: number }
	// lines: an array of elements, or one of the following:
	//
	// STAFF: array of elements
	// SUBTITLE: string
	//
	// TODO: actually, the start and end char should modify each part of the note type
	// The elements all have a type field and a start and end char
	// field. The rest of the fields depend on the type and are listed below:
	// REST: duration=1,2,4,8; chord: string
	// NOTE: accidental=none,dbl_flat,flat,natural,sharp,dbl_sharp
	//		pitch: "C" is 0. The numbers refer to the pitch letter.
	//		duration: .5 (sixteenth), .75 (dotted sixteenth), 1 (eighth), 1.5 (dotted eighth)
	//			2 (quarter), 3 (dotted quarter), 4 (half), 6 (dotted half) 8 (whole)
	//		chord: { name:chord, position: one of 'default', 'above', 'below' }
	//		end_beam = true or undefined if this is the last note in a beam.
	//		lyric: array of { syllable: xxx, divider: one of " -_" }
	//		startTie = true|undefined
	//		endTie = true|undefined
	//		startTriplet = num <- that is the number to print
	//		endTriplet = true|undefined (the last note of the triplet)
	// TODO: actually, decoration should be an array.
	//		decoration: upbow, downbow, accent
	// BAR: type=bar_thin, bar_thin_thick, bar_thin_thin, bar_thick_thin, bar_right_repeat, bar_left_repeat, bar_double_repeat
	//	number: 1 or 2: if it is the start of a first or second ending
	// CLEF: type=treble,bass
	// KEY-SIG:
	//		accidentals[]: { acc:sharp|dblsharp|natural|flat|dblflat,  note:a|b|c|d|e|f|g }
	// METER: type: common_time,cut_time,specified
	//		if specified, { num: 99, den: 99 }

	this.getBeatLength = function() {
		for (var i = 0; i < this.lines.length; i++) {
			if (this.lines[i].staff) {
				for (var j = 0; j < this.lines[i].staff.length; j++) {
					if (this.lines[i].staff[j].meter) {
						var meter = this.lines[i].staff[j].meter;
						if (meter.type === "specified") {
							if (meter.value.length > 0) {
								var num = parseInt(meter.value[0].num, 10);
								var den = parseInt(meter.value[0].den, 10);
								if (num === 6 && den === 8) return 3/8;
								if (num === 9 && den === 8) return 3/8;
								if (num === 12 && den === 8) return 3/8;
								return 1/den;
							}
							else
								return null;
						} else if (meter.type === 'cut_time') {
							return 1/2;
						} else {
							return 1/4; // TODO-PER: this works for common time, but not for the ancient meters.
						}
					}
				}
			}
		}
		return null;
	};

	this.reset = function () {
		this.version = "1.0.1";
		this.media = "screen";
		this.metaText = {};
		this.formatting = {};
		this.lines = [];
		this.staffNum = 0;
		this.voiceNum = 0;
		this.lineNum = 0;
	};

	this.cleanUp = function(defWidth, defLength, barsperstaff, staffnonote, currSlur) {
		this.closeLine();	// Close the last line.

		// Remove any blank lines
		var anyDeleted = false;
		var i, s, v;
		for (i = 0; i < this.lines.length; i++) {
			if (this.lines[i].staff !== undefined) {
				var hasAny = false;
				for (s = 0; s < this.lines[i].staff.length; s++) {
					if (this.lines[i].staff[s] === undefined) {
						anyDeleted = true;
						this.lines[i].staff[s] = null;
						//this.lines[i].staff[s] = { voices: []};	// TODO-PER: There was a part missing in the abc music. How should we recover?
					} else {
						for (v = 0; v < this.lines[i].staff[s].voices.length; v++) {
							if (this.lines[i].staff[s].voices[v] === undefined)
								this.lines[i].staff[s].voices[v] = [];	// TODO-PER: There was a part missing in the abc music. How should we recover?
							else
								if (this.containsNotes(this.lines[i].staff[s].voices[v])) hasAny = true;
						}
					}
				}
				if (!hasAny) {
					this.lines[i] = null;
					anyDeleted = true;
				}
			}
		}
		if (anyDeleted) {
			this.lines = window.ABCJS.parse.compact(this.lines);
			window.ABCJS.parse.each(this.lines, function(line) {
				if (line.staff)
					line.staff = window.ABCJS.parse.compact(line.staff);
			});
		}

		// if we exceeded the number of bars allowed on a line, then force a new line
		if (barsperstaff) {
			for (i = 0; i < this.lines.length; i++) {
				if (this.lines[i].staff !== undefined) {
					for (s = 0; s < this.lines[i].staff.length; s++) {
						for (v = 0; v < this.lines[i].staff[s].voices.length; v++) {
							var barNumThisLine = 0;
							for (var n = 0; n < this.lines[i].staff[s].voices[v].length; n++) {
								if (this.lines[i].staff[s].voices[v][n].el_type === 'bar') {
									barNumThisLine++;
									if (barNumThisLine >= barsperstaff) {
										// push everything else to the next line, if there is anything else,
										// and there is a next line. If there isn't a next line, create one.
										if (n < this.lines[i].staff[s].voices[v].length - 1) {
											if (i === this.lines.length - 1) {
												var cp = JSON.parse(JSON.stringify(this.lines[i]));
												this.lines.push(window.ABCJS.parse.clone(cp));
												for (var ss = 0; ss < this.lines[i+1].staff.length; ss++) {
													for (var vv = 0; vv < this.lines[i+1].staff[ss].voices.length; vv++)
														this.lines[i+1].staff[ss].voices[vv] = [];
												}
											}
											var startElement = n + 1;
											var section = this.lines[i].staff[s].voices[v].slice(startElement);
											this.lines[i].staff[s].voices[v] = this.lines[i].staff[s].voices[v].slice(0, startElement);
											this.lines[i+1].staff[s].voices[v] = section.concat(this.lines[i+1].staff[s].voices[v]);
										}
									}
								}
							}

						}
					}
				}
			}
		}

		// If we were passed staffnonote, then we want to get rid of all staffs that contain only rests.
		if (barsperstaff) {
			anyDeleted = false;
			for (i = 0; i < this.lines.length; i++) {
				if (this.lines[i].staff !== undefined) {
					for (s = 0; s < this.lines[i].staff.length; s++) {
						var keepThis = false;
						for (v = 0; v < this.lines[i].staff[s].voices.length; v++) {
							if (this.containsNotesStrict(this.lines[i].staff[s].voices[v])) {
								keepThis = true;
							}
						}
						if (!keepThis) {
							anyDeleted = true;
							this.lines[i].staff[s] = null;
						}
					}
				}
			}
			if (anyDeleted) {
				window.ABCJS.parse.each(this.lines, function(line) {
					if (line.staff)
						line.staff = window.ABCJS.parse.compact(line.staff);
				});
			}
		}

		// Remove the temporary working variables
		for (i = 0; i < this.lines.length; i++) {
			if (this.lines[i].staff) {
				for (s = 0; s < this.lines[i].staff.length; s++)
						delete this.lines[i].staff[s].workingClef;
			}
		}

		function cleanUpSlursInLine(line) {
			var x;
//			var lyr = null;	// TODO-PER: debugging.

			var addEndSlur = function(obj, num, chordPos) {
				if (currSlur[chordPos] === undefined) {
					// There isn't an exact match for note position, but we'll take any other open slur.
					for (x = 0; x < currSlur.length; x++) {
						if (currSlur[x] !== undefined) {
							chordPos = x;
							break;
						}
					}
					if (currSlur[chordPos] === undefined) {
						var offNum = chordPos*100+1;
						window.ABCJS.parse.each(obj.endSlur, function(x) { if (offNum === x) --offNum; });
						currSlur[chordPos] = [offNum];
					}
				}
				var slurNum;
				for (var i = 0; i < num; i++) {
					slurNum = currSlur[chordPos].pop();
					obj.endSlur.push(slurNum);
//					lyr.syllable += '<' + slurNum;	// TODO-PER: debugging
				}
				if (currSlur[chordPos].length === 0)
					delete currSlur[chordPos];
				return slurNum;
			};

			var addStartSlur = function(obj, num, chordPos, usedNums) {
				obj.startSlur = [];
				if (currSlur[chordPos] === undefined) {
					currSlur[chordPos] = [];
				}
				var nextNum = chordPos*100+1;
				for (var i = 0; i < num; i++) {
					if (usedNums) {
						window.ABCJS.parse.each(usedNums, function(x) { if (nextNum === x) ++nextNum; });
						window.ABCJS.parse.each(usedNums, function(x) { if (nextNum === x) ++nextNum; });
						window.ABCJS.parse.each(usedNums, function(x) { if (nextNum === x) ++nextNum; });
					}
					window.ABCJS.parse.each(currSlur[chordPos], function(x) { if (nextNum === x) ++nextNum; });
					window.ABCJS.parse.each(currSlur[chordPos], function(x) { if (nextNum === x) ++nextNum; });

					currSlur[chordPos].push(nextNum);
					obj.startSlur.push({ label: nextNum });
//					lyr.syllable += ' ' + nextNum + '>';	// TODO-PER:debugging
					nextNum++;
				}
			};

			for (var i = 0; i < line.length; i++) {
				var el = line[i];
//				if (el.lyric === undefined)	// TODO-PER: debugging
//					el.lyric = [{ divider: '-' }];	// TODO-PER: debugging
//				lyr = el.lyric[0];	// TODO-PER: debugging
//				lyr.syllable = '';	// TODO-PER: debugging
				if (el.el_type === 'note') {
					if (el.gracenotes) {
						for (var g = 0; g < el.gracenotes.length; g++) {
							if (el.gracenotes[g].endSlur) {
								var gg = el.gracenotes[g].endSlur;
								el.gracenotes[g].endSlur = [];
								for (var ggg = 0; ggg < gg; ggg++)
									addEndSlur(el.gracenotes[g], 1, 20);
							}
							if (el.gracenotes[g].startSlur) {
								x = el.gracenotes[g].startSlur;
								addStartSlur(el.gracenotes[g], x, 20);
							}
						}
					}
					if (el.endSlur) {
						x = el.endSlur;
						el.endSlur = [];
						addEndSlur(el, x, 0);
					}
					if (el.startSlur) {
						x = el.startSlur;
						addStartSlur(el, x, 0);
					}
					if (el.pitches) {
						var usedNums = [];
						for (var p = 0; p < el.pitches.length; p++) {
							if (el.pitches[p].endSlur) {
								var k = el.pitches[p].endSlur;
								el.pitches[p].endSlur = [];
								for (var j = 0; j < k; j++) {
									var slurNum = addEndSlur(el.pitches[p], 1, p+1);
									usedNums.push(slurNum);
								}
							}
						}
						for (p = 0; p < el.pitches.length; p++) {
							if (el.pitches[p].startSlur) {
								x = el.pitches[p].startSlur;
								addStartSlur(el.pitches[p], x, p+1, usedNums);
							}
						}
						// Correct for the weird gracenote case where ({g}a) should match.
						// The end slur was already assigned to the note, and needs to be moved to the first note of the graces.
						if (el.gracenotes && el.pitches[0].endSlur && el.pitches[0].endSlur[0] === 100 && el.pitches[0].startSlur) {
							if (el.gracenotes[0].endSlur)
								el.gracenotes[0].endSlur.push(el.pitches[0].startSlur[0].label);
							else
								el.gracenotes[0].endSlur = [el.pitches[0].startSlur[0].label];
							if (el.pitches[0].endSlur.length === 1)
								delete el.pitches[0].endSlur;
							else if (el.pitches[0].endSlur[0] === 100)
								el.pitches[0].endSlur.shift();
							else if (el.pitches[0].endSlur[el.pitches[0].endSlur.length-1] === 100)
								el.pitches[0].endSlur.pop();
							if (currSlur[1].length === 1)
								delete currSlur[1];
							else
								currSlur[1].pop();
						}
					}
				}
			}
		}

		// TODO-PER: This could be done faster as we go instead of as the last step.
		function fixClefPlacement(el) {
			window.ABCJS.parse.parseKeyVoice.fixClef(el);
			//if (el.el_type === 'clef') {
//				var min = -2;
//				var max = 5;
//				switch(el.type) {
//					case 'treble+8':
//					case 'treble-8':
//						break;
//					case 'bass':
//					case 'bass+8':
//					case 'bass-8':
//						el.verticalPos = 20 + el.verticalPos; min += 6; max += 6;
//						break;
//					case 'tenor':
//					case 'tenor+8':
//					case 'tenor-8':
//						el.verticalPos = - el.verticalPos; min = -40; max = 40;
////						el.verticalPos+=2; min += 6; max += 6;
//						break;
//					case 'alto':
//					case 'alto+8':
//					case 'alto-8':
//						el.verticalPos = - el.verticalPos; min = -40; max = 40;
////						el.verticalPos-=2; min += 4; max += 4;
//						break;
//				}
//				if (el.verticalPos < min) {
//					while (el.verticalPos < min)
//						el.verticalPos += 7;
//				} else if (el.verticalPos > max) {
//					while (el.verticalPos > max)
//						el.verticalPos -= 7;
//				}
			//}
		}

		for (this.lineNum = 0; this.lineNum < this.lines.length; this.lineNum++) {
			if (this.lines[this.lineNum].staff) for (this.staffNum = 0; this.staffNum < this.lines[this.lineNum].staff.length; this.staffNum++) {
				if (this.lines[this.lineNum].staff[this.staffNum].clef)
					fixClefPlacement(this.lines[this.lineNum].staff[this.staffNum].clef);
				for (this.voiceNum = 0; this.voiceNum < this.lines[this.lineNum].staff[this.staffNum].voices.length; this.voiceNum++) {
//					var el = this.getLastNote();
//					if (el) el.end_beam = true;
					cleanUpSlursInLine(this.lines[this.lineNum].staff[this.staffNum].voices[this.voiceNum]);
					for (var j = 0; j < this.lines[this.lineNum].staff[this.staffNum].voices[this.voiceNum].length; j++)
						if (this.lines[this.lineNum].staff[this.staffNum].voices[this.voiceNum][j].el_type === 'clef')
							fixClefPlacement(this.lines[this.lineNum].staff[this.staffNum].voices[this.voiceNum][j]);
				}
			}
		}

		if (!this.formatting.pagewidth)
			this.formatting.pagewidth = defWidth;
		if (!this.formatting.pageheight)
			this.formatting.pageheight = defLength;

		// Remove temporary variables that the outside doesn't need to know about
		delete this.staffNum;
		delete this.voiceNum;
		delete this.lineNum;
		delete this.potentialStartBeam;
		delete this.potentialEndBeam;
		delete this.vskipPending;

		return currSlur;
	};

	this.reset();

	this.getLastNote = function() {
		if (this.lines[this.lineNum] && this.lines[this.lineNum].staff && this.lines[this.lineNum].staff[this.staffNum] &&
			this.lines[this.lineNum].staff[this.staffNum].voices[this.voiceNum]) {
			for (var i = this.lines[this.lineNum].staff[this.staffNum].voices[this.voiceNum].length-1; i >= 0; i--) {
				var el = this.lines[this.lineNum].staff[this.staffNum].voices[this.voiceNum][i];
				if (el.el_type === 'note') {
					return el;
				}
			}
		}
		return null;
	};

	this.addTieToLastNote = function() {
		// TODO-PER: if this is a chord, which note?
		var el = this.getLastNote();
		if (el && el.pitches && el.pitches.length > 0) {
			el.pitches[0].startTie = {};
			return true;
		}
		return false;
	};

	this.getDuration = function(el) {
		if (el.duration) return el.duration;
		//if (el.pitches && el.pitches.length > 0) return el.pitches[0].duration;
		return 0;
	};

	this.closeLine = function() {
		if (this.potentialStartBeam && this.potentialEndBeam) {
			this.potentialStartBeam.startBeam = true;
			this.potentialEndBeam.endBeam = true;
		}
		delete this.potentialStartBeam;
		delete this.potentialEndBeam;
	};

	this.appendElement = function(type, startChar, endChar, hashParams)
	{
		var This = this;
		var pushNote = function(hp) {
			if (hp.pitches !== undefined) {
				var mid = This.lines[This.lineNum].staff[This.staffNum].workingClef.verticalPos;
				window.ABCJS.parse.each(hp.pitches, function(p) { p.verticalPos = p.pitch - mid; });
			}
			if (hp.gracenotes !== undefined) {
				var mid2 = This.lines[This.lineNum].staff[This.staffNum].workingClef.verticalPos;
				window.ABCJS.parse.each(hp.gracenotes, function(p) { p.verticalPos = p.pitch - mid2; });
			}
			This.lines[This.lineNum].staff[This.staffNum].voices[This.voiceNum].push(hp);
		};
		hashParams.el_type = type;
		if (startChar !== null)
			hashParams.startChar = startChar;
		if (endChar !== null)
			hashParams.endChar = endChar;
		var endBeamHere = function() {
			This.potentialStartBeam.startBeam = true;
			hashParams.endBeam = true;
			delete This.potentialStartBeam;
			delete This.potentialEndBeam;
		};
		var endBeamLast = function() {
			if (This.potentialStartBeam !== undefined && This.potentialEndBeam !== undefined) {	// Do we have a set of notes to beam?
				This.potentialStartBeam.startBeam = true;
				This.potentialEndBeam.endBeam = true;
			}
			delete This.potentialStartBeam;
			delete This.potentialEndBeam;
		};
		if (type === 'note') { // && (hashParams.rest !== undefined || hashParams.end_beam === undefined)) {
			// Now, add the startBeam and endBeam where it is needed.
			// end_beam is already set on the places where there is a forced end_beam. We'll remove that here after using that info.
			// this.potentialStartBeam either points to null or the start beam.
			// this.potentialEndBeam either points to null or the start beam.
			// If we have a beam break (note is longer than a quarter, or an end_beam is on this element), then set the beam if we have one.
			// reset the variables for the next notes.
			var dur = This.getDuration(hashParams);
			if (dur >= 0.25) {	// The beam ends on the note before this.
				endBeamLast();
			} else if (hashParams.force_end_beam_last && This.potentialStartBeam !== undefined) {
				endBeamLast();
			} else if (hashParams.end_beam && This.potentialStartBeam !== undefined) {	// the beam is forced to end on this note, probably because of a space in the ABC
				if (hashParams.rest === undefined)
					endBeamHere();
				else
					endBeamLast();
			} else if (hashParams.rest === undefined) {	// this a short note and we aren't about to end the beam
				if (This.potentialStartBeam === undefined) {	// We aren't collecting notes for a beam, so start here.
					if (!hashParams.end_beam) {
						This.potentialStartBeam = hashParams;
						delete This.potentialEndBeam;
					}
				} else {
					This.potentialEndBeam = hashParams;	// Continue the beaming, look for the end next note.
				}
			}

			//  end_beam goes on rests and notes which precede rests _except_ when a rest (or set of adjacent rests) has normal notes on both sides (no spaces)
//			if (hashParams.rest !== undefined)
//			{
//				hashParams.end_beam = true;
//				var el2 = this.getLastNote();
//				if (el2) el2.end_beam = true;
//				// TODO-PER: implement exception mentioned in the comment.
//			}
		} else {	// It's not a note, so there definitely isn't beaming after it.
			endBeamLast();
		}
		delete hashParams.end_beam;	// We don't want this temporary variable hanging around.
		delete hashParams.force_end_beam_last;	// We don't want this temporary variable hanging around.
		pushNote(hashParams);
	};

	this.appendStartingElement = function(type, startChar, endChar, hashParams2)
	{
		// If we're in the middle of beaming, then end the beam.
		this.closeLine();

		// We only ever want implied naturals the first time.
		var impliedNaturals;
		if (type === 'key') {
			impliedNaturals = hashParams2.impliedNaturals;
			delete hashParams2.impliedNaturals;
		}

		// Clone the object because it will be sticking around for the next line and we don't want the extra fields in it.
		var hashParams = window.ABCJS.parse.clone(hashParams2);

		// If this is a clef type, then we replace the working clef on the line. This is kept separate from
		// the clef in case there is an inline clef field. We need to know what the current position for
		// the note is.
		if (type === 'clef')
			this.lines[this.lineNum].staff[this.staffNum].workingClef = hashParams;

		// If this is the first item in this staff, then we might have to initialize the staff, first.
		if (this.lines[this.lineNum].staff.length <= this.staffNum) {
			this.lines[this.lineNum].staff[this.staffNum] = {};
			this.lines[this.lineNum].staff[this.staffNum].clef = window.ABCJS.parse.clone(this.lines[this.lineNum].staff[0].clef);
			this.lines[this.lineNum].staff[this.staffNum].key = window.ABCJS.parse.clone(this.lines[this.lineNum].staff[0].key);
			this.lines[this.lineNum].staff[this.staffNum].meter = window.ABCJS.parse.clone(this.lines[this.lineNum].staff[0].meter);
			this.lines[this.lineNum].staff[this.staffNum].workingClef = window.ABCJS.parse.clone(this.lines[this.lineNum].staff[0].workingClef);
			this.lines[this.lineNum].staff[this.staffNum].voices = [[]];
		}

		// These elements should not be added twice, so if the element exists on this line without a note or bar before it, just replace the staff version.
		var voice = this.lines[this.lineNum].staff[this.staffNum].voices[this.voiceNum];
		for (var i = 0; i < voice.length; i++) {
			if (voice[i].el_type === 'note' || voice[i].el_type === 'bar') {
				hashParams.el_type = type;
				hashParams.startChar = startChar;
				hashParams.endChar = endChar;
				if (impliedNaturals)
					hashParams.accidentals = impliedNaturals.concat(hashParams.accidentals);
				voice.push(hashParams);
				return;
			}
			if (voice[i].el_type === type) {
				hashParams.el_type = type;
				hashParams.startChar = startChar;
				hashParams.endChar = endChar;
				if (impliedNaturals)
					hashParams.accidentals = impliedNaturals.concat(hashParams.accidentals);
				voice[i] = hashParams;
				return;
			}
		}
		// We didn't see either that type or a note, so replace the element to the staff.
		this.lines[this.lineNum].staff[this.staffNum][type] = hashParams2;
	};

	this.getNumLines = function() {
		return this.lines.length;
	};

	this.pushLine = function(hash) {
		if (this.vskipPending) {
			hash.vskip = this.vskipPending;
			delete this.vskipPending;
		}
		this.lines.push(hash);
	};

	this.addSubtitle = function(str) {
		this.pushLine({subtitle: str});
	};

	this.addSpacing = function(num) {
		this.vskipPending = num;
	};

	this.addNewPage = function(num) {
		this.pushLine({newpage: num});
	};

	this.addSeparator = function(spaceAbove, spaceBelow, lineLength) {
		this.pushLine({separator: {spaceAbove: spaceAbove, spaceBelow: spaceBelow, lineLength: lineLength}});
	};

	this.addText = function(str) {
		this.pushLine({text: str});
	};

	this.addCentered = function(str) {
		this.pushLine({text: [{text: str, center: true }]});
	};

	this.containsNotes = function(voice) {
		for (var i = 0; i < voice.length; i++) {
			if (voice[i].el_type === 'note' || voice[i].el_type === 'bar')
				return true;
		}
		return false;
	};

	this.containsNotesStrict = function(voice) {
		for (var i = 0; i < voice.length; i++) {
			if (voice[i].el_type === 'note' && voice[i].rest === undefined)
				return true;
		}
		return false;
	};

//	anyVoiceContainsNotes: function(line) {
//		for (var i = 0; i < line.staff.voices.length; i++) {
//			if (this.containsNotes(line.staff.voices[i]))
//				return true;
//		}
//		return false;
//	},

	this.startNewLine = function(params) {
		// If the pointed to line doesn't exist, just create that. If the line does exist, but doesn't have any music on it, just use it.
		// If it does exist and has music, then increment the line number. If the new element doesn't exist, create it.
		var This = this;
		this.closeLine();	// Close the previous line.
		var createVoice = function(params) {
			This.lines[This.lineNum].staff[This.staffNum].voices[This.voiceNum] = [];
			if (This.isFirstLine(This.lineNum)) {
				if (params.name) {if (!This.lines[This.lineNum].staff[This.staffNum].title) This.lines[This.lineNum].staff[This.staffNum].title = [];This.lines[This.lineNum].staff[This.staffNum].title[This.voiceNum] = params.name;}
			} else {
				if (params.subname) {if (!This.lines[This.lineNum].staff[This.staffNum].title) This.lines[This.lineNum].staff[This.staffNum].title = [];This.lines[This.lineNum].staff[This.staffNum].title[This.voiceNum] = params.subname;}
			}
			if (params.style)
				This.appendElement('style', null, null, {head: params.style});
			if (params.stem)
				This.appendElement('stem', null, null, {direction: params.stem});
			else if (This.voiceNum > 0) {
				if (This.lines[This.lineNum].staff[This.staffNum].voices[0]!== undefined) {
					var found = false;
					for (var i = 0; i < This.lines[This.lineNum].staff[This.staffNum].voices[0].length; i++) {
						if (This.lines[This.lineNum].staff[This.staffNum].voices[0].el_type === 'stem')
							found = true;
					}
					if (!found) {
						var stem = { el_type: 'stem', direction: 'up' };
						This.lines[This.lineNum].staff[This.staffNum].voices[0].splice(0,0,stem);
					}
				}
				This.appendElement('stem', null, null, {direction: 'down'});
			}
			if (params.scale)
				This.appendElement('scale', null, null, { size: params.scale} );
		};
		var createStaff = function(params) {
			This.lines[This.lineNum].staff[This.staffNum] = {voices: [ ], clef: params.clef, key: params.key, workingClef: params.clef };
			if (params.vocalfont) This.lines[This.lineNum].staff[This.staffNum].vocalfont = params.vocalfont;
			if (params.bracket) This.lines[This.lineNum].staff[This.staffNum].bracket = params.bracket;
			if (params.brace) This.lines[This.lineNum].staff[This.staffNum].brace = params.brace;
			if (params.connectBarLines) This.lines[This.lineNum].staff[This.staffNum].connectBarLines = params.connectBarLines;
			createVoice(params);
			// Some stuff just happens for the first voice
			if (params.part)
				This.appendElement('part', params.startChar, params.endChar, {title: params.part});
			if (params.meter !== undefined) This.lines[This.lineNum].staff[This.staffNum].meter = params.meter;
		};
		var createLine = function(params) {
			This.lines[This.lineNum] = {staff: []};
			createStaff(params);
		};
		if (this.lines[this.lineNum] === undefined) createLine(params);
		else if (this.lines[this.lineNum].staff === undefined) {
			this.lineNum++;
			this.startNewLine(params);
		} else if (this.lines[this.lineNum].staff[this.staffNum] === undefined) createStaff(params);
		else if (this.lines[this.lineNum].staff[this.staffNum].voices[this.voiceNum] === undefined) createVoice(params);
		else if (!this.containsNotes(this.lines[this.lineNum].staff[this.staffNum].voices[this.voiceNum])) return;
		else {
			this.lineNum++;
			this.startNewLine(params);
		}
	};

	this.hasBeginMusic = function() {
		return this.lines.length > 0;
	};

	this.isFirstLine = function(index) {
		for (var i = index-1; i >= 0; i--) {
			if (this.lines[i].staff !== undefined) return false;
		}
		return true;
	};

	this.getCurrentVoice = function() {
		if (this.lines[this.lineNum] !== undefined && this.lines[this.lineNum].staff[this.staffNum] !== undefined && this.lines[this.lineNum].staff[this.staffNum].voices[this.voiceNum] !== undefined)
			return this.lines[this.lineNum].staff[this.staffNum].voices[this.voiceNum];
		else return null;
	};

	this.setCurrentVoice = function(staffNum, voiceNum) {
		this.staffNum = staffNum;
		this.voiceNum = voiceNum;
		for (var i = 0; i < this.lines.length; i++) {
			if (this.lines[i].staff) {
				if (this.lines[i].staff[staffNum] === undefined || this.lines[i].staff[staffNum].voices[voiceNum] === undefined ||
					!this.containsNotes(this.lines[i].staff[staffNum].voices[voiceNum] )) {
					this.lineNum =  i;
					return;
				}
			}
		}
		this.lineNum =  i;
	};

	this.addMetaText = function(key, value) {
		if (this.metaText[key] === undefined)
			this.metaText[key] = value;
		else
			this.metaText[key] += "\n" + value;
	};

	this.addMetaTextArray = function(key, value) {
		if (this.metaText[key] === undefined)
			this.metaText[key] = [value];
		else
			this.metaText[key].push(value);
	};
	this.addMetaTextObj = function(key, value) {
		this.metaText[key] = value;
	};
};
/*global window, document, setTimeout */

if (!window.ABCJS)
	window.ABCJS = {};

if (!window.ABCJS.midi)
	window.ABCJS.midi = {};

(function() {
function setAttributes(elm, attrs){
  for(var attr in attrs)
    if (attrs.hasOwnProperty(attr))
      elm.setAttribute(attr, attrs[attr]);
  return elm;
}

//TODO-PER: put this back in when the MIDIPlugin works again.
//window.oldunload = window.onbeforeunload;
//window.onbeforeunload = function() {
//    if (window.oldunload)
//        window.oldunload();
//  if (typeof(MIDIPlugin) !== "undefined" && MIDIPlugin) { // PER: take care of crash in IE 8
//    MIDIPlugin.closePlugin();
//  }
//};


function MidiProxy(javamidi,qtmidi) {
  this.javamidi = javamidi;
  this.qtmidi = qtmidi;
}

MidiProxy.prototype.setTempo = function (qpm) {
  this.javamidi.setTempo(qpm);
  this.qtmidi.setTempo(qpm);
};

MidiProxy.prototype.startTrack = function () {
  this.javamidi.startTrack();
  this.qtmidi.startTrack();
};

MidiProxy.prototype.endTrack = function () {
  this.javamidi.endTrack();
  this.qtmidi.endTrack();
};

MidiProxy.prototype.setInstrument = function (number) {
  this.javamidi.setInstrument(number);
  this.qtmidi.setInstrument(number);
};

MidiProxy.prototype.startNote = function (pitch, loudness, abcelem) {
  this.javamidi.startNote(pitch, loudness, abcelem);
  this.qtmidi.startNote(pitch, loudness, abcelem);
};

MidiProxy.prototype.endNote = function (pitch, length) {
  this.javamidi.endNote(pitch, length);
  this.qtmidi.endNote(pitch, length);
};

MidiProxy.prototype.addRest = function (length) {
  this.javamidi.addRest(length);
  this.qtmidi.addRest(length);
};

MidiProxy.prototype.embed = function(parent) {
  this.javamidi.embed(parent);
  this.qtmidi.embed(parent,true);
};

function JavaMidi(midiwriter) {
  this.playlist = []; // contains {time:t,funct:f} pairs
  this.trackcount = 0;
  this.timecount = 0;
  this.tempo = 60;
  this.midiapi = MIDIPlugin;
  this.midiwriter = midiwriter;
	this.noteOnAndChannel = "%90";
}

JavaMidi.prototype.setTempo = function (qpm) {
  this.tempo = qpm;
};

JavaMidi.prototype.startTrack = function () {
  this.silencelength = 0;
  this.trackcount++;
  this.timecount=0;
  this.playlistpos=0;
  this.first=true;
  if (this.instrument) {
    this.setInstrument(this.instrument);
  }
	if (this.channel) {
	  this.setChannel(this.channel);
	}
};

JavaMidi.prototype.endTrack = function () {
  // need to do anything?
};

JavaMidi.prototype.setInstrument = function (number) {
  this.instrument=number;
  this.midiapi.setInstrument(number);
  //TODO push this into the playlist?
};

JavaMidi.prototype.setChannel = function (number) {
  this.channel=number;
  this.midiapi.setChannel(number);
};

JavaMidi.prototype.updatePos = function() {
  while(this.playlist[this.playlistpos] &&
	this.playlist[this.playlistpos].time<this.timecount) {
    this.playlistpos++;
  }
};

JavaMidi.prototype.startNote = function (pitch, loudness, abcelem) {
  this.timecount+=this.silencelength;
  this.silencelength = 0;
  if (this.first) {
    //nothing special if first?
  }
  this.updatePos();
  var self=this;
  this.playlist.splice(this.playlistpos,0, {
    time:this.timecount,
	funct:function() {
	self.midiapi.playNote(pitch);
	self.midiwriter.notifySelect(abcelem);
      }
    });
};

JavaMidi.prototype.endNote = function (pitch, length) {
  this.timecount+=length;
  this.updatePos();
  var self=this;
  this.playlist.splice(this.playlistpos, 0, {
    time:this.timecount,
	funct:	function() {
	self.midiapi.stopNote(pitch);
      }
    });
};

JavaMidi.prototype.addRest = function (length) {
  this.silencelength += length;
};

JavaMidi.prototype.embed = function(parent) {


  this.playlink = setAttributes(document.createElement('a'), {
    style: "border:1px solid black; margin:3px;"
    });
  this.playlink.innerHTML = "play";
  var self = this;
  this.playlink.onmousedown = function() {
    if (self.playing) {
      this.innerHTML = "play";
      self.pausePlay();
    } else {
      this.innerHTML = "pause";
      self.startPlay();
    }
  };
  parent.appendChild(this.playlink);

  var stoplink = setAttributes(document.createElement('a'), {
    style: "border:1px solid black; margin:3px;"
    });
  stoplink.innerHTML = "stop";
  //var self = this;
  stoplink.onmousedown = function() {
    self.stopPlay();
  };
  parent.appendChild(stoplink);
  this.i=0;
  this.currenttime=0;
  this.playing = false;
};

JavaMidi.prototype.stopPlay = function() {
  this.i=0;
  this.currenttime=0;
  this.pausePlay();
  this.playlink.innerHTML = "play";
};

JavaMidi.prototype.startPlay = function() {
  this.playing = true;
  var self = this;
  // repeat every 16th note TODO see the min in the piece
  this.ticksperinterval = 480/4;
  this.doPlay();
  this.playinterval = window.setInterval(function() {self.doPlay(); },
					 (60000/(this.tempo*4)));
};

JavaMidi.prototype.pausePlay = function() {
  this.playing = false;
  window.clearInterval(this.playinterval);
  this.midiapi.stopAllNotes();
};

JavaMidi.prototype.doPlay = function() {
  while(this.playlist[this.i] &&
	this.playlist[this.i].time <= this.currenttime) {
    this.playlist[this.i].funct();
    this.i++;
  }
  if (this.playlist[this.i]) {
    this.currenttime+=this.ticksperinterval;
  } else {
    this.stopPlay();
  }
};

function Midi() {
  this.trackstrings="";
  this.trackcount = 0;
	this.noteOnAndChannel = "%90";
}

Midi.prototype.setTempo = function (qpm) {
  if (this.trackcount===0) {
    this.startTrack();
    this.track+="%00%FF%51%03"+toHex(Math.round(60000000/qpm),6);
    this.endTrack();
  }
};

Midi.prototype.startTrack = function () {
  this.track = "";
  this.silencelength = 0;
  this.trackcount++;
  this.first=true;
  if (this.instrument) {
    this.setInstrument(this.instrument);
  }
};

Midi.prototype.endTrack = function () {
  var tracklength = toHex(this.track.length/3+4,8);
  this.track = "MTrk"+tracklength+ // track header
  this.track +
  '%00%FF%2F%00'; // track end
  this.trackstrings += this.track;
};

Midi.prototype.setInstrument = function (number) {
	if (this.track)
	  this.track = "%00%C0"+toHex(number,2)+this.track;
	else
		this.track = "%00%C0"+toHex(number,2);
  this.instrument=number;
};

Midi.prototype.setChannel = function (number) {
	this.channel=number - 1;
	this.noteOnAndChannel = "%9" + this.channel.toString(16);
};

Midi.prototype.startNote = function (pitch, loudness) {
  this.track+=toDurationHex(this.silencelength); // only need to shift by amount of silence (if there is any)
  this.silencelength = 0;
  if (this.first) {
    this.first = false;
    this.track+=this.noteOnAndChannel;
  }
  this.track += "%"+pitch.toString(16)+"%"+loudness; //note
};

Midi.prototype.endNote = function (pitch, length) {
  this.track += toDurationHex(length); //duration
  this.track += "%"+pitch.toString(16)+"%00";//end note
};

Midi.prototype.addRest = function (length) {
  this.silencelength += length;
};

Midi.prototype.embed = function(parent, noplayer) {

  var data="data:audio/midi," +
  "MThd%00%00%00%06%00%01"+toHex(this.trackcount,4)+"%01%e0"+ // header
  this.trackstrings;

//   var embedContainer = document.createElement("div");
//   embedContainer.className = "embedContainer";
//   document.body.appendChild(embedContainer);
//   embedContainer.innerHTML = '<object id="embed1" classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" codebase="http://www.apple.com/qtactivex/qtplugin.cab"><param name="src" value="' + data + '"></param><param name="Autoplay" value="false"></param><embed name="embed1" src="' + data + '" autostart="false" enablejavascript="true" /></object>';
//   embed = document["embed1"];


  var link = setAttributes(document.createElement('a'), {
    href: data
    });
  link.innerHTML = "download midi";
  parent.insertBefore(link,parent.firstChild);

  if (noplayer) return;

  var embed = setAttributes(document.createElement('embed'), {
    src : data,
	type : 'video/quicktime',
	controller : 'true',
	autoplay : 'false',
	loop : 'false',
	enablejavascript: 'true',
	style:'display:block; height: 20px;'
	});
  parent.insertBefore(embed,parent.firstChild);
};

// s is assumed to be of even length
function encodeHex(s) {
  var ret = "";
  for (var i=0; i<s.length; i+=2) {
    ret += "%";
    ret += s.substr(i,2);
  }
  return ret;
}

function toHex(n, padding) {
  var s = n.toString(16).toUpperCase();
  while (s.length<padding) {
    s="0"+s;
  }
  return encodeHex(s);
}

function toDurationHex(n) {
  var res = 0;
  var a = [];

  // cut up into 7 bit chunks;
  while (n!==0) {
    a.push(n & 0x7F);
    n = n>>7;
  }

  // join the 7 bit chunks together, all but last chunk get leading 1
  for (var i=a.length-1;i>=0;i--) {
    res = res << 8;
    var bits = a[i];
    if (i!==0) {
      bits = bits | 0x80;
    }
    res = res | bits;
  }

  var padding = res.toString(16).length;
  padding += padding%2;

  return toHex(res, padding);
}

ABCJS.midi.MidiWriter = function(parent, options) {
  options = options || {};
  this.parent = parent;
  this.scale = [0,2,4,5,7,9,11];
  this.restart = {line:0, staff:0, voice:0, pos:0};
  this.visited = {};
  this.multiplier =1;
  this.next = null;
  this.qpm = options.qpm || 180;
  this.program = options.program || 2;
	this.noteOnAndChannel = "%90";
  this.javamidi = options.type ==="java" || false;
  this.listeners = [];
  this.transpose = 0;	// PER
  if (this.javamidi) {
    MIDIPlugin = document.MIDIPlugin;
    setTimeout(function() { // run on next event loop (once MIDIPlugin is loaded)
	try { // activate MIDIPlugin
	  MIDIPlugin.openPlugin();

	} catch(e) { // plugin not supported (download externals)
	  var a = document.createElement("a");
	  a.href = "http://java.sun.com/products/java-media/sound/soundbanks.html";
	  a.target = "_blank";
	  a.appendChild(document.createTextNode("Download Soundbank"));
	  parent.appendChild(a);
	}
      }, 0);
  }

};

ABCJS.midi.MidiWriter.prototype.addListener = function(listener) {
  this.listeners.push(listener);
};

ABCJS.midi.MidiWriter.prototype.notifySelect = function (abcelem) {
  for (var i=0; i<this.listeners.length;i++) {
    this.listeners[i].notifySelect(abcelem.abselem);
  }
};

ABCJS.midi.MidiWriter.prototype.getMark = function() {
  return {line:this.line, staff:this.staff,
	  voice:this.voice, pos:this.pos};
};

ABCJS.midi.MidiWriter.prototype.getMarkString = function(mark) {
  mark = mark || this;
  return "line"+mark.line+"staff"+mark.staff+
	  "voice"+mark.voice+"pos"+mark.pos;
};

ABCJS.midi.MidiWriter.prototype.goToMark = function(mark) {
  this.line=mark.line;
  this.staff=mark.staff;
  this.voice=mark.voice;
  this.pos=mark.pos;
};

ABCJS.midi.MidiWriter.prototype.markVisited = function() {
  this.lastmark = this.getMarkString();
  this.visited[this.lastmark] = true;
};

ABCJS.midi.MidiWriter.prototype.isVisited = function() {
  if (this.visited[this.getMarkString()]) return true;
  return false;
};

ABCJS.midi.MidiWriter.prototype.setJumpMark = function(mark) {
  this.visited[this.lastmark] = mark;
};

ABCJS.midi.MidiWriter.prototype.getJumpMark = function() {
  return this.visited[this.getMarkString()];
};

ABCJS.midi.MidiWriter.prototype.getLine = function() {
  return this.abctune.lines[this.line];
};

ABCJS.midi.MidiWriter.prototype.getStaff = function() {
  try {
  return this.getLine().staff[this.staff];
  } catch (e) {

  }
};

ABCJS.midi.MidiWriter.prototype.getVoice = function() {
  return this.getStaff().voices[this.voice];
};

ABCJS.midi.MidiWriter.prototype.getElem = function() {
  return this.getVoice()[this.pos];
};

ABCJS.midi.MidiWriter.prototype.writeABC = function(abctune) {
  try {
    this.midi = (this.javamidi) ? new MidiProxy(new JavaMidi(this), new Midi()) : new Midi();
    this.baraccidentals = [];
    this.abctune = abctune;
    this.baseduration = 480*4; // nice and divisible, equals 1 whole note

	  // PER: add global transposition.
	  if (abctune.formatting.midi && abctune.formatting.midi.transpose)
		  this.transpose = abctune.formatting.midi.transpose;

	  // PER: changed format of the global midi commands from the parser. Using the new definition here.
    if (abctune.formatting.midi && abctune.formatting.midi.program && abctune.formatting.midi.program.program) {
      this.midi.setInstrument(abctune.formatting.midi.program.program);
    } else {
      this.midi.setInstrument(this.program);
    }
    if (abctune.formatting.midi && abctune.formatting.midi.channel) {
      this.midi.setChannel(abctune.formatting.midi.channel);
    }

    if (abctune.metaText.tempo) {
      var duration = 1/4;
      if (abctune.metaText.tempo.duration) {
	duration = abctune.metaText.tempo.duration[0];
      }
      var bpm = 60;
      if (abctune.metaText.tempo.bpm) {
	bpm = abctune.metaText.tempo.bpm;
      }
      this.qpm = bpm*duration*4;
    }
    this.midi.setTempo(this.qpm);

    // visit each voice completely in turn
    // "problematic" because it means visiting only one staff+voice for each line each time
    this.staffcount=1; // we'll know the actual number once we enter the code
    for(this.staff=0;this.staff<this.staffcount;this.staff++) {
      this.voicecount=1;
      for(this.voice=0;this.voice<this.voicecount;this.voice++) {
	this.midi.startTrack();
	this.restart = {line:0, staff:this.staff, voice:this.voice, pos:0};
	this.next= null;
	for(this.line=0; this.line<abctune.lines.length; this.line++) {
	  var abcline = abctune.lines[this.line];
	  if (this.getLine().staff) {
	    this.writeABCLine();
	  }
	}
	this.midi.endTrack();
      }
    }

    this.midi.embed(this.parent);
  } catch (e) {
    this.parent.innerHTML="Couldn't write midi: "+e;
  }
};

ABCJS.midi.MidiWriter.prototype.writeABCLine = function() {
  this.staffcount = this.getLine().staff.length;
  this.voicecount = this.getStaff().voices.length;
  this.setKeySignature(this.getStaff().key);
  this.writeABCVoiceLine();
};

ABCJS.midi.MidiWriter.prototype.writeABCVoiceLine = function () {
  this.pos=0;
  while (this.pos<this.getVoice().length) {
    this.writeABCElement(this.getElem());
    if (this.next) {
      this.goToMark(this.next);
      this.next = null;
      if (!this.getLine().staff) return;
    } else {
      this.pos++;
    }
  }
};

ABCJS.midi.MidiWriter.prototype.writeABCElement = function(elem) {
  var foo;
  switch (elem.el_type) {
  case "note":
    this.writeNote(elem);
    break;

  case "key":
    this.setKeySignature(elem);
    break;
  case "bar":
    this.handleBar(elem);
	  break;
  case "meter":
  case "clef":
    break;
  default:

  }

};


ABCJS.midi.MidiWriter.prototype.writeNote = function(elem) {

  if (elem.startTriplet) {
	  if (elem.startTriplet === 2)
		  this.multiplier = 3/2;
	  else
	    this.multiplier=(elem.startTriplet-1)/elem.startTriplet;
  }

  var mididuration = elem.duration*this.baseduration*this.multiplier;
  if (elem.pitches) {
    var midipitches = [];
    for (var i=0; i<elem.pitches.length; i++) {
      var note = elem.pitches[i];
      var pitch= note.pitch;
      if (note.accidental) {
	switch(note.accidental) { // change that pitch (not other octaves) for the rest of the bar
	case "sharp":
	  this.baraccidentals[pitch]=1; break;
	case "flat":
	  this.baraccidentals[pitch]=-1; break;
	case "natural":
	  this.baraccidentals[pitch]=0; break;
		case "dblsharp":
			this.baraccidentals[pitch]=2; break;
		case "dblflat":
			this.baraccidentals[pitch]=-2; break;
	}
      }

      midipitches[i] = 60 + 12*this.extractOctave(pitch)+this.scale[this.extractNote(pitch)];

      if (this.baraccidentals[pitch]!==undefined) {
	midipitches[i] += this.baraccidentals[pitch];
      } else { // use normal accidentals
	midipitches[i] += this.accidentals[this.extractNote(pitch)];
      }
    midipitches[i] += this.transpose;	// PER

      this.midi.startNote(midipitches[i], 64, elem);

      if (note.startTie) {
	this.tieduration=mididuration;
      }
    }

    for (i=0; i<elem.pitches.length; i++) {
      var note = elem.pitches[i];
      var pitch= note.pitch+this.transpose;	// PER
      if (note.startTie) continue; // don't terminate it
      if (note.endTie) {
	this.midi.endNote(midipitches[i],mididuration+this.tieduration);
      } else {
	this.midi.endNote(midipitches[i],mididuration);
      }
      mididuration = 0; // put these to zero as we've moved forward in the midi
      this.tieduration=0;
    }
  } else if (elem.rest && elem.rest.type !== 'spacer') {
    this.midi.addRest(mididuration);
  }

  if (elem.endTriplet) {
    this.multiplier=1;
  }

};

ABCJS.midi.MidiWriter.prototype.handleBar = function (elem) {
  this.baraccidentals = [];


  var repeat = (elem.type==="bar_right_repeat" || elem.type==="bar_dbl_repeat");
  var skip = (elem.startEnding)?true:false;
  var setvisited = (repeat || skip);
  var setrestart = (elem.type==="bar_left_repeat" || elem.type==="bar_dbl_repeat" || elem.type==="bar_thick_thin" || elem.type==="bar_thin_thick" || elem.type==="bar_thin_thin" || elem.type==="bar_right_repeat");

  var next = null;

  if (this.isVisited()) {
    next = this.getJumpMark();
  } else {

    if (skip || repeat) {
      if (this.visited[this.lastmark] === true) {
	this.setJumpMark(this.getMark());
      }
    }

    if (setvisited) {
      this.markVisited();
    }

    if (repeat) {
      next = this.restart;
      this.setJumpMark(this.getMark());
    }
  }

  if (setrestart) {
    this.restart = this.getMark();
  }

  if (next && this.getMarkString(next)!==this.getMarkString()) {
    this.next = next;
  }

};

ABCJS.midi.MidiWriter.prototype.setKeySignature = function(elem) {
  this.accidentals = [0,0,0,0,0,0,0];
  if (this.abctune.formatting.bagpipes) {
    elem.accidentals=[{acc: 'natural', note: 'g'}, {acc: 'sharp', note: 'f'}, {acc: 'sharp', note: 'c'}];
  }
  if (!elem.accidentals) return;
	window.ABCJS.parse.each(elem.accidentals, function(acc) {
		var d = (acc.acc === "sharp") ? 1 : (acc.acc === "natural") ?0 : -1;

		var lowercase = acc.note.toLowerCase();
		var note = this.extractNote(lowercase.charCodeAt(0)-'c'.charCodeAt(0));
		this.accidentals[note]+=d;
	  }, this);

};

ABCJS.midi.MidiWriter.prototype.extractNote = function(pitch) {
  pitch = pitch%7;
  if (pitch<0) pitch+=7;
  return pitch;
};

ABCJS.midi.MidiWriter.prototype.extractOctave = function(pitch) {
  return Math.floor(pitch/7);
};
})();
//    abc_parse.js: parses a string representing ABC Music Notation into a usable internal structure.
//    Copyright (C) 2010 Paul Rosen (paul at paulrosen dot net)
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.

/*global window */

if (!window.ABCJS)
	window.ABCJS = {};

if (!window.ABCJS.parse)
	window.ABCJS.parse = {};

window.ABCJS.parse.clone = function(source) {
	var destination = {};
	for (var property in source)
		if (source.hasOwnProperty(property))
			destination[property] = source[property];
	return destination;
};

window.ABCJS.parse.gsub = function(source, pattern, replacement) {
	return source.split(pattern).join(replacement);
};

window.ABCJS.parse.strip = function(str) {
	return str.replace(/^\s+/, '').replace(/\s+$/, '');
};

window.ABCJS.parse.startsWith = function(str, pattern) {
	return str.indexOf(pattern) === 0;
};

window.ABCJS.parse.endsWith = function(str, pattern) {
	var d = str.length - pattern.length;
	return d >= 0 && str.lastIndexOf(pattern) === d;
};

window.ABCJS.parse.each = function(arr, iterator, context) {
	for (var i = 0, length = arr.length; i < length; i++)
	  iterator.apply(context, [arr[i],i]);
};

window.ABCJS.parse.last = function(arr) {
	if (arr.length === 0)
		return null;
	return arr[arr.length-1];
};

window.ABCJS.parse.compact = function(arr) {
	var output = [];
	for (var i = 0; i < arr.length; i++) {
		if (arr[i])
			output.push(arr[i]);
	}
	return output;
};

window.ABCJS.parse.detect = function(arr, iterator) {
	for (var i = 0; i < arr.length; i++) {
		if (iterator(arr[i]))
			return true;
	}
	return false;
};
//    abc_parse.js: parses a string representing ABC Music Notation into a usable internal structure.
//    Copyright (C) 2010 Paul Rosen (paul at paulrosen dot net)
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.

/*global window */

if (!window.ABCJS)
	window.ABCJS = {};

if (!window.ABCJS.parse)
	window.ABCJS.parse = {};

window.ABCJS.parse.Parse = function() {
	"use strict";
	var tune = new window.ABCJS.data.Tune();
	var tokenizer = new window.ABCJS.parse.tokenizer();

	this.getTune = function() {
		return tune;
	};

	function addPositioning(el, type, value) {
		if (!el.positioning) el.positioning = {};
		el.positioning[type] = value;
	}

	function addFont(el, type, value) {
		if (!el.fonts) el.fonts = {};
		el.fonts[type] = value;
	}

	var multilineVars = {
		reset: function() {
			for (var property in this) {
				if (this.hasOwnProperty(property) && typeof this[property] !== "function") {
					delete this[property];
				}
			}
			this.iChar = 0;
			this.key = {accidentals: [], root: 'none', acc: '', mode: '' };
			this.meter = {type: 'specified', value: [{num: '4', den: '4'}]};	// if no meter is specified, there is an implied one.
			this.origMeter = {type: 'specified', value: [{num: '4', den: '4'}]};	// this is for new voices that are created after we set the meter.
			this.hasMainTitle = false;
			this.default_length = 0.125;
			this.clef = { type: 'treble', verticalPos: 0 };
			this.next_note_duration = 0;
			this.start_new_line = true;
			this.is_in_header = true;
			this.is_in_history = false;
			this.partForNextLine = "";
			this.havent_set_length = true;
			this.voices = {};
			this.staves = [];
			this.macros = {};
			this.currBarNumber = 1;
			this.inTextBlock = false;
			this.inPsBlock = false;
			this.ignoredDecorations = [];
			this.textBlock = "";
			this.score_is_present = false;	// Can't have original V: lines when there is the score directive
			this.inEnding = false;
			this.inTie = false;
			this.inTieChord = {};
			this.vocalPosition = "auto";
			this.dynamicPosition = "auto";
			this.chordPosition = "auto";
			this.ornamentPosition = "auto";
			this.volumePosition = "auto";
			this.openSlurs = [];
		},
		differentFont: function(type, defaultFonts) {
			if (this[type].decoration !== defaultFonts[type].decoration) return true;
			if (this[type].face !== defaultFonts[type].face) return true;
			if (this[type].size !== defaultFonts[type].size) return true;
			if (this[type].style !== defaultFonts[type].style) return true;
			if (this[type].weight !== defaultFonts[type].weight) return true;
			return false;
		},
		addFormattingOptions: function(el, defaultFonts, elType) {
			if (elType === 'note') {
				if (this.vocalPosition !== 'auto') addPositioning(el, 'vocalPosition', this.vocalPosition);
				if (this.dynamicPosition !== 'auto') addPositioning(el, 'dynamicPosition', this.dynamicPosition);
				if (this.chordPosition !== 'auto') addPositioning(el, 'chordPosition', this.chordPosition);
				if (this.ornamentPosition !== 'auto') addPositioning(el, 'ornamentPosition', this.ornamentPosition);
				if (this.volumePosition !== 'auto') addPositioning(el, 'volumePosition', this.volumePosition);
				if (this.differentFont("annotationfont", defaultFonts)) addFont(el, 'annotationfont', this.annotationfont);
				if (this.differentFont("gchordfont", defaultFonts)) addFont(el, 'gchordfont', this.gchordfont);
				if (this.differentFont("vocalfont", defaultFonts)) addFont(el, 'vocalfont', this.vocalfont);
			} else if (elType === 'bar') {
				if (this.dynamicPosition !== 'auto') addPositioning(el, 'dynamicPosition', this.dynamicPosition);
				if (this.chordPosition !== 'auto') addPositioning(el, 'chordPosition', this.chordPosition);
				if (this.ornamentPosition !== 'auto') addPositioning(el, 'ornamentPosition', this.ornamentPosition);
				if (this.volumePosition !== 'auto') addPositioning(el, 'volumePosition', this.volumePosition);
				if (this.differentFont("measurefont", defaultFonts)) addFont(el, 'measurefont', this.measurefont);
				if (this.differentFont("repeatfont", defaultFonts)) addFont(el, 'repeatfont', this.repeatfont);
			}
		}
	};

	var addWarning = function(str) {
		if (!multilineVars.warnings)
			multilineVars.warnings = [];
		multilineVars.warnings.push(str);
	};

	var encode = function(str) {
		var ret = window.ABCJS.parse.gsub(str, '\x12', ' ');
		ret = window.ABCJS.parse.gsub(ret, '&', '&amp;');
		ret = window.ABCJS.parse.gsub(ret, '<', '&lt;');
		return window.ABCJS.parse.gsub(ret, '>', '&gt;');
	};

	var warn = function(str, line, col_num) {
		if (!line) line = " ";
		var bad_char = line.charAt(col_num);
		if (bad_char === ' ')
			bad_char = "SPACE";
		var clean_line = encode(line.substring(0, col_num)) +
			'<span style="text-decoration:underline;font-size:1.3em;font-weight:bold;">' + bad_char + '</span>' +
			encode(line.substring(col_num+1));
		addWarning("Music Line:" + tune.getNumLines() + ":" + (col_num+1) + ': ' + str + ":  " + clean_line);
	};
	var header = new window.ABCJS.parse.ParseHeader(tokenizer, warn, multilineVars, tune);

	this.getWarnings = function() {
		return multilineVars.warnings;
	};

	var letter_to_chord = function(line, i)
	{
		if (line.charAt(i) === '"')
		{
			var chord = tokenizer.getBrackettedSubstring(line, i, 5);
			if (!chord[2])
				warn("Missing the closing quote while parsing the chord symbol", line , i);
			// If it starts with ^, then the chord appears above.
			// If it starts with _ then the chord appears below.
			// (note that the 2.0 draft standard defines them as not chords, but annotations and also defines @.)
			if (chord[0] > 0 && chord[1].length > 0 && chord[1].charAt(0) === '^') {
				chord[1] = chord[1].substring(1);
				chord[2] = 'above';
			} else if (chord[0] > 0 && chord[1].length > 0 && chord[1].charAt(0) === '_') {
				chord[1] = chord[1].substring(1);
				chord[2] = 'below';
			} else if (chord[0] > 0 && chord[1].length > 0 && chord[1].charAt(0) === '<') {
				chord[1] = chord[1].substring(1);
				chord[2] = 'left';
			} else if (chord[0] > 0 && chord[1].length > 0 && chord[1].charAt(0) === '>') {
				chord[1] = chord[1].substring(1);
				chord[2] = 'right';
			} else if (chord[0] > 0 && chord[1].length > 0 && chord[1].charAt(0) === '@') {
				// @-15,5.7
				chord[1] = chord[1].substring(1);
				var x = tokenizer.getFloat(chord[1]);
				if (x.digits === 0)
					warn("Missing first position in absolutely positioned annotation.", line , i);
				chord[1] = chord[1].substring(x.digits);
				if (chord[1][0] !== ',')
					warn("Missing comma absolutely positioned annotation.", line , i);
				chord[1] = chord[1].substring(1);
				var y = tokenizer.getFloat(chord[1]);
				if (y.digits === 0)
					warn("Missing second position in absolutely positioned annotation.", line , i);
				chord[1] = chord[1].substring(y.digits);
				var ws = tokenizer.skipWhiteSpace(chord[1]);
				chord[1] = chord[1].substring(ws);
				chord[2] = null;
				chord[3] = { x: x.value, y: y.value };
			} else {
				chord[1] = chord[1].replace(/([ABCDEFG])b/g, "$1♭");
				chord[1] = chord[1].replace(/([ABCDEFG])#/g, "$1♯");
				chord[2] = 'default';
			}
			return chord;
		}
		return [0, ""];
	};

	var legalAccents = [ "trill", "lowermordent", "uppermordent", "mordent", "pralltriller", "accent",
		"fermata", "invertedfermata", "tenuto", "0", "1", "2", "3", "4", "5", "+", "wedge",
		"open", "thumb", "snap", "turn", "roll", "breath", "shortphrase", "mediumphrase", "longphrase",
		"segno", "coda", "D.S.", "D.C.", "fine",
		"slide", "^", "marcato",
		"upbow", "downbow", "/", "//", "///", "////", "trem1", "trem2", "trem3", "trem4",
		"turnx", "invertedturn", "invertedturnx", "trill(", "trill)", "arpeggio", "xstem", "mark", "umarcato",
		"style=normal", "style=harmonic", "style=rhythm", "style=x"
	];
	var volumeDecorations = [ "p", "pp", "f", "ff", "mf", "mp", "ppp", "pppp",  "fff", "ffff", "sfz" ];
	var dynamicDecorations = ["crescendo(", "crescendo)", "diminuendo(", "diminuendo)"];

	var accentPseudonyms = [ ["<", "accent"], [">", "accent"], ["tr", "trill"],
		["plus", "+"], [ "emphasis", "accent"],
		[ "^", "umarcato" ], [ "marcato", "umarcato" ] ];
	var accentDynamicPseudonyms = [ ["<(", "crescendo("], ["<)", "crescendo)"],
		[">(", "diminuendo("], [">)", "diminuendo)"] ];
	var letter_to_accent = function(line, i)
	{
		var macro = multilineVars.macros[line.charAt(i)];

		if (macro !== undefined) {
			if (macro.charAt(0) === '!' || macro.charAt(0) === '+')
				macro = macro.substring(1);
			if (macro.charAt(macro.length-1) === '!' || macro.charAt(macro.length-1) === '+')
				macro = macro.substring(0, macro.length-1);
			if (window.ABCJS.parse.detect(legalAccents, function(acc) {
					return (macro === acc);
				}))
				return [ 1, macro ];
			else if (window.ABCJS.parse.detect(volumeDecorations, function(acc) {
					return (macro === acc);
				})) {
				if (multilineVars.volumePosition === 'hidden')
					macro = "";
				return [1, macro];
			} else if (window.ABCJS.parse.detect(dynamicDecorations, function(acc) {
					if (multilineVars.dynamicPosition === 'hidden')
						macro = "";
					return (macro === acc);
				})) {
				return [1, macro];
			} else {
				if (!window.ABCJS.parse.detect(multilineVars.ignoredDecorations, function(dec) {
					return (macro === dec);
				}))
					warn("Unknown macro: " + macro, line, i);
				return [1, '' ];
			}
		}
		switch (line.charAt(i))
		{
			case '.':return [1, 'staccato'];
			case 'u':return [1, 'upbow'];
			case 'v':return [1, 'downbow'];
			case '~':return [1, 'irishroll'];
			case '!':
			case '+':
				var ret = tokenizer.getBrackettedSubstring(line, i, 5);
				// Be sure that the accent is recognizable.
			if (ret[1].length > 0 && (ret[1].charAt(0) === '^' || ret[1].charAt(0) ==='_'))
					ret[1] = ret[1].substring(1);	// TODO-PER: The test files have indicators forcing the ornament to the top or bottom, but that isn't in the standard. We'll just ignore them.
				if (window.ABCJS.parse.detect(legalAccents, function(acc) {
					return (ret[1] === acc);
				}))
					return ret;
				if (window.ABCJS.parse.detect(volumeDecorations, function(acc) {
						return (ret[1] === acc);
					})) {
					if (multilineVars.volumePosition === 'hidden' )
						ret[1] = '';
						return ret;
				}
				if (window.ABCJS.parse.detect(dynamicDecorations, function(acc) {
						return (ret[1] === acc);
					})) {
					if (multilineVars.dynamicPosition === 'hidden' )
						ret[1] = '';
						return ret;
				}

				if (window.ABCJS.parse.detect(accentPseudonyms, function(acc) {
					if (ret[1] === acc[0]) {
						ret[1] = acc[1];
						return true;
					} else
						return false;
				}))
					return ret;

				if (window.ABCJS.parse.detect(accentDynamicPseudonyms, function(acc) {
					if (ret[1] === acc[0]) {
						ret[1] = acc[1];
						return true;
					} else
						return false;
				})) {
					if (multilineVars.dynamicPosition === 'hidden' )
						ret[1] = '';
						return ret;
				}
				// We didn't find the accent in the list, so consume the space, but don't return an accent.
				// Although it is possible that ! was used as a line break, so accept that.
			if (line.charAt(i) === '!' && (ret[0] === 1 || line.charAt(i+ret[0]-1) !== '!'))
					return [1, null ];
				warn("Unknown decoration: " + ret[1], line, i);
				ret[1] = "";
				return ret;
			case 'H':return [1, 'fermata'];
			case 'J':return [1, 'slide'];
			case 'L':return [1, 'accent'];
			case 'M':return [1, 'mordent'];
			case 'O':return[1, 'coda'];
			case 'P':return[1, 'pralltriller'];
			case 'R':return [1, 'roll'];
			case 'S':return [1, 'segno'];
			case 'T':return [1, 'trill'];
		}
		return [0, 0];
	};

	var letter_to_spacer = function(line, i)
	{
		var start = i;
		while (tokenizer.isWhiteSpace(line.charAt(i)))
			i++;
		return [ i-start ];
	};

	// returns the class of the bar line
	// the number of the repeat
	// and the number of characters used up
	// if 0 is returned, then the next element was not a bar line
	var letter_to_bar = function(line, curr_pos)
	{
		var ret = tokenizer.getBarLine(line, curr_pos);
		if (ret.len === 0)
			return [0,""];
		if (ret.warn) {
			warn(ret.warn, line, curr_pos);
			return [ret.len,""];
		}

		// Now see if this is a repeated ending
		// A repeated ending is all of the characters 1,2,3,4,5,6,7,8,9,0,-, and comma
		// It can also optionally start with '[', which is ignored.
		// Also, it can have white space before the '['.
		for (var ws = 0; ws < line.length; ws++)
			if (line.charAt(curr_pos + ret.len + ws) !== ' ')
				break;
		var orig_bar_len = ret.len;
		if (line.charAt(curr_pos+ret.len+ws) === '[') {
			ret.len += ws + 1;
		}

		// It can also be a quoted string. It is unclear whether that construct requires '[', but it seems like it would. otherwise it would be confused with a regular chord.
		if (line.charAt(curr_pos+ret.len) === '"' && line.charAt(curr_pos+ret.len-1) === '[') {
			var ending = tokenizer.getBrackettedSubstring(line, curr_pos+ret.len, 5);
			return [ret.len+ending[0], ret.token, ending[1]];
		}
		var retRep = tokenizer.getTokenOf(line.substring(curr_pos+ret.len), "1234567890-,");
		if (retRep.len === 0 || retRep.token[0] === '-')
			return [orig_bar_len, ret.token];

		return [ret.len+retRep.len, ret.token, retRep.token];
	};

	var letter_to_open_slurs_and_triplets =  function(line, i) {
		// consume spaces, and look for all the open parens. If there is a number after the open paren,
		// that is a triplet. Otherwise that is a slur. Collect all the slurs and the first triplet.
		var ret = {};
		var start = i;
		while (line.charAt(i) === '(' || tokenizer.isWhiteSpace(line.charAt(i))) {
			if (line.charAt(i) === '(') {
				if (i+1 < line.length && (line.charAt(i+1) >= '2' && line.charAt(i+1) <= '9')) {
					if (ret.triplet !== undefined)
						warn("Can't nest triplets", line, i);
					else {
						ret.triplet = line.charAt(i+1) - '0';
						if (i+2 < line.length && line.charAt(i+2) === ':') {
							// We are expecting "(p:q:r" or "(p:q" or "(p::r" we are only interested in the first number (p) and the number of notes (r)
							// if r is missing, then it is equal to p.
							if (i+3 < line.length && line.charAt(i+3) === ':') {
								if (i+4 < line.length && (line.charAt(i+4) >= '1' && line.charAt(i+4) <= '9')) {
									ret.num_notes = line.charAt(i+4) - '0';
									i += 3;
								} else
									warn("expected number after the two colons after the triplet to mark the duration", line, i);
							} else if (i+3 < line.length && (line.charAt(i+3) >= '1' && line.charAt(i+3) <= '9')) {
								// ignore this middle number
								if (i+4 < line.length && line.charAt(i+4) === ':') {
									if (i+5 < line.length && (line.charAt(i+5) >= '1' && line.charAt(i+5) <= '9')) {
										ret.num_notes = line.charAt(i+5) - '0';
										i += 4;
									}
								} else {
									ret.num_notes = ret.triplet;
									i += 3;
								}
							} else
								warn("expected number after the triplet to mark the duration", line, i);
						}
					}
					i++;
				}
				else {
					if (ret.startSlur === undefined)
						ret.startSlur = 1;
					else
						ret.startSlur++;
				}
			}
			i++;
		}
		ret.consumed = i-start;
		return ret;
	};

	var addWords = function(line, words) {
		if (!line) { warn("Can't add words before the first line of music", line, 0); return; }
		words = window.ABCJS.parse.strip(words);
		if (words.charAt(words.length-1) !== '-')
			words = words + ' ';	// Just makes it easier to parse below, since every word has a divider after it.
		var word_list = [];
		// first make a list of words from the string we are passed. A word is divided on either a space or dash.
		var last_divider = 0;
		var replace = false;
		var addWord = function(i) {
			var word = window.ABCJS.parse.strip(words.substring(last_divider, i));
			last_divider = i+1;
			if (word.length > 0) {
				if (replace)
					word = window.ABCJS.parse.gsub(word,'~', ' ');
				var div = words.charAt(i);
				if (div !== '_' && div !== '-')
					div = ' ';
				word_list.push({syllable: tokenizer.translateString(word), divider: div});
				replace = false;
				return true;
			}
			return false;
		};
		for (var i = 0; i < words.length; i++) {
			switch (words.charAt(i)) {
				case ' ':
				case '\x12':
					addWord(i);
					break;
				case '-':
					if (!addWord(i) && word_list.length > 0) {
						window.ABCJS.parse.last(word_list).divider = '-';
						word_list.push({skip: true, to: 'next'});
					}
					break;
				case '_':
					addWord(i);
					word_list.push({skip: true, to: 'slur'});
					break;
				case '*':
					addWord(i);
					word_list.push({skip: true, to: 'next'});
					break;
				case '|':
					addWord(i);
					word_list.push({skip: true, to: 'bar'});
					break;
				case '~':
					replace = true;
					break;
			}
		}

		var inSlur = false;
		window.ABCJS.parse.each(line, function(el) {
			if (word_list.length !== 0) {
				if (word_list[0].skip) {
					switch (word_list[0].to) {
						case 'next': if (el.el_type === 'note' && el.pitches !== null && !inSlur) word_list.shift(); break;
						case 'slur': if (el.el_type === 'note' && el.pitches !== null) word_list.shift(); break;
						case 'bar': if (el.el_type === 'bar') word_list.shift(); break;
					}
				} else {
					if (el.el_type === 'note' && el.rest === undefined && !inSlur) {
						var lyric = word_list.shift();
						if (el.lyric === undefined)
							el.lyric = [ lyric ];
						else
							el.lyric.push(lyric);
					}
				}
			}
		});
	};

	var addSymbols = function(line, words) {
		// TODO-PER: Currently copied from w: line. This needs to be read as symbols instead.
		if (!line) { warn("Can't add symbols before the first line of music", line, 0); return; }
		words = window.ABCJS.parse.strip(words);
		if (words.charAt(words.length-1) !== '-')
			words = words + ' ';	// Just makes it easier to parse below, since every word has a divider after it.
		var word_list = [];
		// first make a list of words from the string we are passed. A word is divided on either a space or dash.
		var last_divider = 0;
		var replace = false;
		var addWord = function(i) {
			var word = window.ABCJS.parse.strip(words.substring(last_divider, i));
			last_divider = i+1;
			if (word.length > 0) {
				if (replace)
					word = window.ABCJS.parse.gsub(word, '~', ' ');
				var div = words.charAt(i);
				if (div !== '_' && div !== '-')
					div = ' ';
				word_list.push({syllable: tokenizer.translateString(word), divider: div});
				replace = false;
				return true;
			}
			return false;
		};
		for (var i = 0; i < words.length; i++) {
			switch (words.charAt(i)) {
				case ' ':
				case '\x12':
					addWord(i);
					break;
				case '-':
					if (!addWord(i) && word_list.length > 0) {
						window.ABCJS.parse.last(word_list).divider = '-';
						word_list.push({skip: true, to: 'next'});
					}
					break;
				case '_':
					addWord(i);
					word_list.push({skip: true, to: 'slur'});
					break;
				case '*':
					addWord(i);
					word_list.push({skip: true, to: 'next'});
					break;
				case '|':
					addWord(i);
					word_list.push({skip: true, to: 'bar'});
					break;
				case '~':
					replace = true;
					break;
			}
		}

		var inSlur = false;
		window.ABCJS.parse.each(line, function(el) {
			if (word_list.length !== 0) {
				if (word_list[0].skip) {
					switch (word_list[0].to) {
						case 'next': if (el.el_type === 'note' && el.pitches !== null && !inSlur) word_list.shift(); break;
						case 'slur': if (el.el_type === 'note' && el.pitches !== null) word_list.shift(); break;
						case 'bar': if (el.el_type === 'bar') word_list.shift(); break;
					}
				} else {
					if (el.el_type === 'note' && el.rest === undefined && !inSlur) {
						var lyric = word_list.shift();
						if (el.lyric === undefined)
							el.lyric = [ lyric ];
						else
							el.lyric.push(lyric);
					}
				}
			}
		});
	};

	var getBrokenRhythm = function(line, index) {
		switch (line.charAt(index)) {
			case '>':
			if (index < line.length - 1 && line.charAt(index+1) === '>')	// double >>
					return [2, 1.75, 0.25];
				else
					return [1, 1.5, 0.5];
				break;
			case '<':
			if (index < line.length - 1 && line.charAt(index+1) === '<')	// double <<
					return [2, 0.25, 1.75];
				else
					return [1, 0.5, 1.5];
				break;
		}
		return null;
	};

	// TODO-PER: make this a method in el.
	var addEndBeam = function(el) {
		if (el.duration !== undefined && el.duration < 0.25)
			el.end_beam = true;
		return el;
	};

	var pitches = {A: 5, B: 6, C: 0, D: 1, E: 2, F: 3, G: 4, a: 12, b: 13, c: 7, d: 8, e: 9, f: 10, g: 11};
	var rests = {x: 'invisible', y: 'spacer', z: 'rest', Z: 'multimeasure' };
	var getCoreNote = function(line, index, el, canHaveBrokenRhythm) {
		//var el = { startChar: index };
		var isComplete = function(state) {
			return (state === 'octave' || state === 'duration' || state === 'Zduration' || state === 'broken_rhythm' || state === 'end_slur');
		};
		var state = 'startSlur';
		var durationSetByPreviousNote = false;
		while (1) {
			switch(line.charAt(index)) {
				case '(':
					if (state === 'startSlur') {
						if (el.startSlur === undefined) el.startSlur = 1; else el.startSlur++;
					} else if (isComplete(state)) {el.endChar = index;return el;}
					else return null;
					break;
				case ')':
					if (isComplete(state)) {
						if (el.endSlur === undefined) el.endSlur = 1; else el.endSlur++;
					} else return null;
					break;
				case '^':
					if (state === 'startSlur') {el.accidental = 'sharp';state = 'sharp2';}
					else if (state === 'sharp2') {el.accidental = 'dblsharp';state = 'pitch';}
					else if (isComplete(state)) {el.endChar = index;return el;}
					else return null;
					break;
				case '_':
					if (state === 'startSlur') {el.accidental = 'flat';state = 'flat2';}
					else if (state === 'flat2') {el.accidental = 'dblflat';state = 'pitch';}
					else if (isComplete(state)) {el.endChar = index;return el;}
					else return null;
					break;
				case '=':
					if (state === 'startSlur') {el.accidental = 'natural';state = 'pitch';}
					else if (isComplete(state)) {el.endChar = index;return el;}
					else return null;
					break;
				case 'A':
				case 'B':
				case 'C':
				case 'D':
				case 'E':
				case 'F':
				case 'G':
				case 'a':
				case 'b':
				case 'c':
				case 'd':
				case 'e':
				case 'f':
				case 'g':
					if (state === 'startSlur' || state === 'sharp2' || state === 'flat2' || state === 'pitch') {
						el.pitch = pitches[line.charAt(index)];
						state = 'octave';
						// At this point we have a valid note. The rest is optional. Set the duration in case we don't get one below
						if (canHaveBrokenRhythm && multilineVars.next_note_duration !== 0) {
							el.duration = multilineVars.default_length * multilineVars.next_note_duration;
							multilineVars.next_note_duration = 0;
							durationSetByPreviousNote = true;
						} else
							el.duration = multilineVars.default_length;
					} else if (isComplete(state)) {el.endChar = index;return el;}
					else return null;
					break;
				case ',':
					if (state === 'octave') {el.pitch -= 7;}
					else if (isComplete(state)) {el.endChar = index;return el;}
					else return null;
					break;
				case '\'':
					if (state === 'octave') {el.pitch += 7;}
					else if (isComplete(state)) {el.endChar = index;return el;}
					else return null;
					break;
				case 'x':
				case 'y':
				case 'z':
				case 'Z':
					if (state === 'startSlur') {
						el.rest = { type: rests[line.charAt(index)] };
						// There shouldn't be some of the properties that notes have. If some sneak in due to bad syntax in the abc file,
						// just nix them here.
						delete el.accidental;
						delete el.startSlur;
						delete el.startTie;
						delete el.endSlur;
						delete el.endTie;
						delete el.end_beam;
						delete el.grace_notes;
						// At this point we have a valid note. The rest is optional. Set the duration in case we don't get one below
						if (el.rest.type === 'multimeasure') {
							el.duration = 1;
							state = 'Zduration';
						} else {
							if (canHaveBrokenRhythm && multilineVars.next_note_duration !== 0) {
								el.duration = multilineVars.default_length * multilineVars.next_note_duration;
								multilineVars.next_note_duration = 0;
								durationSetByPreviousNote = true;
							} else
								el.duration = multilineVars.default_length;
							state = 'duration';
						}
					} else if (isComplete(state)) {el.endChar = index;return el;}
					else return null;
					break;
				case '1':
				case '2':
				case '3':
				case '4':
				case '5':
				case '6':
				case '7':
				case '8':
				case '9':
				case '0':
				case '/':
					if (state === 'octave' || state === 'duration') {
						var fraction = tokenizer.getFraction(line, index);
						//if (!durationSetByPreviousNote)
							el.duration = el.duration * fraction.value;
						// TODO-PER: We can test the returned duration here and give a warning if it isn't the one expected.
						el.endChar = fraction.index;
						while (fraction.index < line.length && (tokenizer.isWhiteSpace(line.charAt(fraction.index)) || line.charAt(fraction.index) === '-')) {
							if (line.charAt(fraction.index) === '-')
								el.startTie = {};
							else
								el = addEndBeam(el);
							fraction.index++;
						}
						index = fraction.index-1;
						state = 'broken_rhythm';
					} else if (state === 'sharp2') {
						el.accidental = 'quartersharp';state = 'pitch';
					} else if (state === 'flat2') {
						el.accidental = 'quarterflat';state = 'pitch';
					} else if (state === 'Zduration') {
						var num = tokenizer.getNumber(line, index);
						el.duration = num.num;
						el.endChar = num.index;
						return el;
					} else return null;
					break;
				case '-':
					if (state === 'startSlur') {
						// This is the first character, so it must have been meant for the previous note. Correct that here.
						tune.addTieToLastNote();
						el.endTie = true;
					} else if (state === 'octave' || state === 'duration' || state === 'end_slur') {
						el.startTie = {};
						if (!durationSetByPreviousNote && canHaveBrokenRhythm)
							state = 'broken_rhythm';
						else {
							// Peek ahead to the next character. If it is a space, then we have an end beam.
							if (tokenizer.isWhiteSpace(line.charAt(index + 1)))
								addEndBeam(el);
							el.endChar = index+1;
							return el;
						}
					} else if (state === 'broken_rhythm') {el.endChar = index;return el;}
					else return null;
					break;
				case ' ':
				case '\t':
					if (isComplete(state)) {
						el.end_beam = true;
						// look ahead to see if there is a tie
						do {
							if (line.charAt(index) === '-')
								el.startTie = {};
							index++;
						} while (index < line.length && (tokenizer.isWhiteSpace(line.charAt(index)) || line.charAt(index) === '-'));
						el.endChar = index;
						if (!durationSetByPreviousNote && canHaveBrokenRhythm && (line.charAt(index) === '<' || line.charAt(index) === '>')) {	// TODO-PER: Don't need the test for < and >, but that makes the endChar work out for the regression test.
							index--;
							state = 'broken_rhythm';
						} else
							return el;
					}
					else return null;
					break;
				case '>':
				case '<':
					if (isComplete(state)) {
						if (canHaveBrokenRhythm) {
							var br2 = getBrokenRhythm(line, index);
							index += br2[0] - 1;	// index gets incremented below, so we'll let that happen
							multilineVars.next_note_duration = br2[2];
							el.duration = br2[1]*el.duration;
							state = 'end_slur';
						} else {
							el.endChar = index;
							return el;
						}
					} else
						return null;
					break;
				default:
					if (isComplete(state)) {
						el.endChar = index;
						return el;
					}
					return null;
			}
			index++;
			if (index === line.length) {
				if (isComplete(state)) {el.endChar = index;return el;}
				else return null;
			}
		}
		return null;
	};

	function startNewLine() {
		var params = { startChar: -1, endChar: -1};
		if (multilineVars.partForNextLine.length)
			params.part = multilineVars.partForNextLine;
		params.clef = multilineVars.currentVoice && multilineVars.staves[multilineVars.currentVoice.staffNum].clef !== undefined ? window.ABCJS.parse.clone(multilineVars.staves[multilineVars.currentVoice.staffNum].clef) : window.ABCJS.parse.clone(multilineVars.clef) ;
		params.key = window.ABCJS.parse.parseKeyVoice.deepCopyKey(multilineVars.key);
		window.ABCJS.parse.parseKeyVoice.addPosToKey(params.clef, params.key);
		if (multilineVars.meter !== null) {
			if (multilineVars.currentVoice) {
				window.ABCJS.parse.each(multilineVars.staves, function(st) {
					st.meter = multilineVars.meter;
				});
				params.meter = multilineVars.staves[multilineVars.currentVoice.staffNum].meter;
				multilineVars.staves[multilineVars.currentVoice.staffNum].meter = null;
			} else
				params.meter = multilineVars.meter;
			multilineVars.meter = null;
		} else if (multilineVars.currentVoice && multilineVars.staves[multilineVars.currentVoice.staffNum].meter) {
			// Make sure that each voice gets the meter marking.
			params.meter = multilineVars.staves[multilineVars.currentVoice.staffNum].meter;
			multilineVars.staves[multilineVars.currentVoice.staffNum].meter = null;
		}
		if (multilineVars.currentVoice && multilineVars.currentVoice.name)
			params.name = multilineVars.currentVoice.name;
		if (multilineVars.vocalfont)
			params.vocalfont = multilineVars.vocalfont;
		if (multilineVars.style)
			params.style = multilineVars.style;
		if (multilineVars.currentVoice) {
			var staff = multilineVars.staves[multilineVars.currentVoice.staffNum];
			if (staff.brace) params.brace = staff.brace;
			if (staff.bracket) params.bracket = staff.bracket;
			if (staff.connectBarLines) params.connectBarLines = staff.connectBarLines;
			if (staff.name) params.name = staff.name[multilineVars.currentVoice.index];
			if (staff.subname) params.subname = staff.subname[multilineVars.currentVoice.index];
			if (multilineVars.currentVoice.stem)
				params.stem = multilineVars.currentVoice.stem;
			if (multilineVars.currentVoice.scale)
				params.scale = multilineVars.currentVoice.scale;
			if (multilineVars.currentVoice.style)
				params.style = multilineVars.currentVoice.style;
		}
		tune.startNewLine(params);

		multilineVars.partForNextLine = "";
		if (multilineVars.currentVoice === undefined || (multilineVars.currentVoice.staffNum === multilineVars.staves.length-1 && multilineVars.staves[multilineVars.currentVoice.staffNum].numVoices-1 === multilineVars.currentVoice.index)) {
			//multilineVars.meter = null;
			if (multilineVars.barNumbers === 0)
				multilineVars.barNumOnNextNote = multilineVars.currBarNumber;
		}
	}

	var letter_to_grace =  function(line, i) {
		// Grace notes are an array of: startslur, note, endslur, space; where note is accidental, pitch, duration
		if (line.charAt(i) === '{') {
			// fetch the gracenotes string and consume that into the array
			var gra = tokenizer.getBrackettedSubstring(line, i, 1, '}');
			if (!gra[2])
				warn("Missing the closing '}' while parsing grace note", line, i);
			// If there is a slur after the grace construction, then move it to the last note inside the grace construction
			if (line[i+gra[0]] === ')') {
				gra[0]++;
				gra[1] += ')';
			}

			var gracenotes = [];
			var ii = 0;
			var inTie = false;
			while (ii < gra[1].length) {
				var acciaccatura = false;
				if (gra[1].charAt(ii) === '/') {
					acciaccatura = true;
					ii++;
				}
				var note = getCoreNote(gra[1], ii, {}, false);
				if (note !== null) {
					// The grace note durations should not be affected by the default length: they should be based on 1/16, so if that isn't the default, then multiply here.
					note.duration = note.duration / (multilineVars.default_length * 8);
					if (acciaccatura)
						note.acciaccatura = true;
					gracenotes.push(note);

					if (inTie) {
						note.endTie = true;
						inTie = false;
					}
					if (note.startTie)
						inTie = true;

					ii  = note.endChar;
					delete note.endChar;
				}
				else {
					// We shouldn't get anything but notes or a space here, so report an error
					if (gra[1].charAt(ii) === ' ') {
						if (gracenotes.length > 0)
							gracenotes[gracenotes.length-1].end_beam = true;
					} else
						warn("Unknown character '" + gra[1].charAt(ii) + "' while parsing grace note", line, i);
					ii++;
				}
			}
			if (gracenotes.length)
				return [gra[0], gracenotes];
		}
		return [ 0 ];
	};

	function durationOfMeasure(multilineVars) {
		// TODO-PER: This could be more complicated if one of the unusual measures is used.
		var meter = multilineVars.origMeter;
		if (!meter || meter.type !== 'specified')
			return 1;
		if (!meter.value || meter.value.length === 0)
			return 1;
		return parseInt(meter.value[0].num, 10) / parseInt(meter.value[0].den, 10);
	}

	//
	// Parse line of music
	//
	// This is a stream of <(bar-marking|header|note-group)...> in any order, with optional spaces between each element
	// core-note is <open-slur, accidental, pitch:required, octave, duration, close-slur&|tie> with no spaces within that
	// chord is <open-bracket:required, core-note:required... close-bracket:required duration> with no spaces within that
	// grace-notes is <open-brace:required, (open-slur|core-note:required|close-slur)..., close-brace:required> spaces are allowed
	// note-group is <grace-notes, chord symbols&|decorations..., grace-notes, slur&|triplet, chord|core-note, end-slur|tie> spaces are allowed between items
	// bar-marking is <ampersand> or <chord symbols&|decorations..., bar:required> spaces allowed
	// header is <open-bracket:required, K|M|L|V:required, colon:required, field:required, close-bracket:required> spaces can occur between the colon, in the field, and before the close bracket
	// header can also be the only thing on a line. This is true even if it is a continuation line. In this case the brackets are not required.
	// a space is a back-tick, a space, or a tab. If it is a back-tick, then there is no end-beam.

	// Line preprocessing: anything after a % is ignored (the double %% should have been taken care of before this)
	// Then, all leading and trailing spaces are ignored.
	// If there was a line continuation, the \n was replaced by a \r and the \ was replaced by a space. This allows the construct
	// of having a header mid-line conceptually, but actually be at the start of the line. This is equivolent to putting the header in [ ].

	// TODO-PER: How to handle ! for line break?
	// TODO-PER: dots before bar, dots before slur
	// TODO-PER: U: redefinable symbols.

	// Ambiguous symbols:
	// "[" can be the start of a chord, the start of a header element or part of a bar line.
	// --- if it is immediately followed by "|", it is a bar line
	// --- if it is immediately followed by K: L: M: V: it is a header (note: there are other headers mentioned in the standard, but I'm not sure how they would be used.)
	// --- otherwise it is the beginning of a chord
	// "(" can be the start of a slur or a triplet
	// --- if it is followed by a number from 2-9, then it is a triplet
	// --- otherwise it is a slur
	// "]"
	// --- if there is a chord open, then this is the close
	// --- if it is after a [|, then it is an invisible bar line
	// --- otherwise, it is par of a bar
	// "." can be a bar modifier or a slur modifier, or a decoration
	// --- if it comes immediately before a bar, it is a bar modifier
	// --- if it comes immediately before a slur, it is a slur modifier
	// --- otherwise it is a decoration for the next note.
	// number:
	// --- if it is after a bar, with no space, it is an ending marker
	// --- if it is after a ( with no space, it is a triplet count
	// --- if it is after a pitch or octave or slash, then it is a duration

	// Unambiguous symbols (except inside quoted strings):
	// vertical-bar, colon: part of a bar
	// ABCDEFGabcdefg: pitch
	// xyzZ: rest
	// comma, prime: octave
	// close-paren: end-slur
	// hyphen: tie
	// tilde, v, u, bang, plus, THLMPSO: decoration
	// carat, underscore, equal: accidental
	// ampersand: time reset
	// open-curly, close-curly: grace notes
	// double-quote: chord symbol
	// less-than, greater-than, slash: duration
	// back-tick, space, tab: space
	var nonDecorations = "ABCDEFGabcdefgxyzZ[]|^_{";	// use this to prescreen so we don't have to look for a decoration at every note.

	var parseRegularMusicLine = function(line) {
		header.resolveTempo();
		//multilineVars.havent_set_length = false;	// To late to set this now.
		multilineVars.is_in_header = false;	// We should have gotten a key header by now, but just in case, this is definitely out of the header.
		var i = 0;
		var startOfLine = multilineVars.iChar;
		// see if there is nothing but a comment on this line. If so, just ignore it. A full line comment is optional white space followed by %
		while (tokenizer.isWhiteSpace(line.charAt(i)) && i < line.length)
			i++;
		if (i === line.length || line.charAt(i) === '%')
			return;

		// Start with the standard staff, clef and key symbols on each line
		var delayStartNewLine = multilineVars.start_new_line;
		if (multilineVars.continueall === undefined)
			multilineVars.start_new_line = true;
		else
			multilineVars.start_new_line = false;
		var tripletNotesLeft = 0;

		// See if the line starts with a header field
		var retHeader = header.letter_to_body_header(line, i);
		if (retHeader[0] > 0) {
			i += retHeader[0];
			// TODO-PER: Handle inline headers
		}
		var el = { };

		while (i < line.length)
		{
			var startI = i;
			if (line.charAt(i) === '%')
				break;

			var retInlineHeader = header.letter_to_inline_header(line, i);
			if (retInlineHeader[0] > 0) {
					i += retInlineHeader[0];
					// TODO-PER: Handle inline headers
					//multilineVars.start_new_line = false;
			} else {
				// Wait until here to actually start the line because we know we're past the inline statements.
				if (delayStartNewLine) {
					startNewLine();
					delayStartNewLine = false;
				}

				// We need to decide if the following characters are a bar-marking or a note-group.
				// Unfortunately, that is ambiguous. Both can contain chord symbols and decorations.
				// If there is a grace note either before or after the chord symbols and decorations, then it is definitely a note-group.
				// If there is a bar marker, it is definitely a bar-marking.
				// If there is either a core-note or chord, it is definitely a note-group.
				// So, loop while we find grace-notes, chords-symbols, or decorations. [It is an error to have more than one grace-note group in a row; the others can be multiple]
				// Then, if there is a grace-note, we know where to go.
				// Else see if we have a chord, core-note, slur, triplet, or bar.

				var ret;
				while (1) {
					ret = tokenizer.eatWhiteSpace(line, i);
					if (ret > 0) {
						i += ret;
					}
					if (i > 0 && line.charAt(i-1) === '\x12') {
						// there is one case where a line continuation isn't the same as being on the same line, and that is if the next character after it is a header.
						ret = header.letter_to_body_header(line, i);
						if (ret[0] > 0) {
							// TODO: insert header here
							i = ret[0];
							multilineVars.start_new_line = false;
						}
					}
					// gather all the grace notes, chord symbols and decorations
					ret = letter_to_spacer(line, i);
					if (ret[0] > 0) {
						i += ret[0];
					}

					ret = letter_to_chord(line, i);
					if (ret[0] > 0) {
						// There could be more than one chord here if they have different positions.
						// If two chords have the same position, then connect them with newline.
						if (!el.chord)
							el.chord = [];
						var chordName = tokenizer.translateString(ret[1]);
						chordName = chordName.replace(/;/g, "\n");
						var addedChord = false;
						for (var ci = 0; ci < el.chord.length; ci++) {
							if (el.chord[ci].position === ret[2]) {
								addedChord = true;
								el.chord[ci].name += "\n" + chordName;
							}
						}
						if (addedChord === false) {
							if (ret[2] === null && ret[3])
								el.chord.push({name: chordName, rel_position: ret[3]});
							else
								el.chord.push({name: chordName, position: ret[2]});
						}

						i += ret[0];
						var ii = tokenizer.skipWhiteSpace(line.substring(i));
						if (ii > 0)
							el.force_end_beam_last = true;
						i += ii;
					} else {
						if (nonDecorations.indexOf(line.charAt(i)) === -1)
							ret = letter_to_accent(line, i);
						else ret = [ 0 ];
						if (ret[0] > 0) {
							if (ret[1] === null) {
								if (i + 1 < line.length)
									startNewLine();	// There was a ! in the middle of the line. Start a new line if there is anything after it.
							} else if (ret[1].length > 0) {
								if (ret[1].indexOf("style=") === 0) {
									el.style = ret[1].substr(6);
								} else {
									if (el.decoration === undefined)
										el.decoration = [];
									el.decoration.push(ret[1]);
								}
							}
							i += ret[0];
						} else {
							ret = letter_to_grace(line, i);
							// TODO-PER: Be sure there aren't already grace notes defined. That is an error.
							if (ret[0] > 0) {
								el.gracenotes = ret[1];
								i += ret[0];
							} else
								break;
						}
					}
				}

				ret = letter_to_bar(line, i);
				if (ret[0] > 0) {
					// This is definitely a bar
					if (el.gracenotes !== undefined) {
						// Attach the grace note to an invisible note
						el.rest = { type: 'spacer' };
						el.duration = 0.125; // TODO-PER: I don't think the duration of this matters much, but figure out if it does.
						multilineVars.addFormattingOptions(el, tune.formatting, 'note');
						tune.appendElement('note', startOfLine+i, startOfLine+i+ret[0], el);
						multilineVars.measureNotEmpty = true;
						el = {};
					}
					var bar = {type: ret[1]};
					if (bar.type.length === 0)
						warn("Unknown bar type", line, i);
					else {
						if (multilineVars.inEnding && bar.type !== 'bar_thin') {
							bar.endEnding = true;
							multilineVars.inEnding = false;
						}
						if (ret[2]) {
							bar.startEnding = ret[2];
							if (multilineVars.inEnding)
								bar.endEnding = true;
							multilineVars.inEnding = true;
						}
						if (el.decoration !== undefined)
							bar.decoration = el.decoration;
						if (el.chord !== undefined)
							bar.chord = el.chord;
						if (bar.startEnding && multilineVars.barFirstEndingNum === undefined)
							multilineVars.barFirstEndingNum = multilineVars.currBarNumber;
						else if (bar.startEnding && bar.endEnding && multilineVars.barFirstEndingNum)
							multilineVars.currBarNumber = multilineVars.barFirstEndingNum;
						else if (bar.endEnding)
							multilineVars.barFirstEndingNum = undefined;
						if (bar.type !== 'bar_invisible' && multilineVars.measureNotEmpty) {
							multilineVars.currBarNumber++;
							if (multilineVars.barNumbers && multilineVars.currBarNumber % multilineVars.barNumbers === 0)
								multilineVars.barNumOnNextNote = multilineVars.currBarNumber;
						}
						multilineVars.addFormattingOptions(el, tune.formatting, 'bar');
						tune.appendElement('bar', startOfLine+i, startOfLine+i+ret[0], bar);
						multilineVars.measureNotEmpty = false;
						el = {};
					}
					i += ret[0];
				} else if (line[i] === '&') {	// backtrack to beginning of measure
					warn("Overlay not yet supported", line, i);
					i++;

				} else {
					// This is definitely a note group
					//
					// Look for as many open slurs and triplets as there are. (Note: only the first triplet is valid.)
					ret = letter_to_open_slurs_and_triplets(line, i);
					if (ret.consumed > 0) {
						if (ret.startSlur !== undefined)
							el.startSlur = ret.startSlur;
						if (ret.triplet !== undefined) {
							if (tripletNotesLeft > 0)
								warn("Can't nest triplets", line, i);
							else {
								el.startTriplet = ret.triplet;
								tripletNotesLeft = ret.num_notes === undefined ? ret.triplet : ret.num_notes;
							}
						}
						i += ret.consumed;
					}

					// handle chords.
					if (line.charAt(i) === '[') {
						var chordStartChar = i;
						i++;
						var chordDuration = null;

						var done = false;
						while (!done) {
							var chordNote = getCoreNote(line, i, {}, false);
							if (chordNote !== null) {
								if (chordNote.end_beam) {
									el.end_beam = true;
									delete chordNote.end_beam;
								}
								if (el.pitches === undefined) {
									el.duration = chordNote.duration;
									el.pitches = [ chordNote ];
								} else	// Just ignore the note lengths of all but the first note. The standard isn't clear here, but this seems less confusing.
									el.pitches.push(chordNote);
								delete chordNote.duration;

								if (multilineVars.inTieChord[el.pitches.length]) {
									chordNote.endTie = true;
									multilineVars.inTieChord[el.pitches.length] = undefined;
								}
								if (chordNote.startTie)
									multilineVars.inTieChord[el.pitches.length] = true;

								i  = chordNote.endChar;
								delete chordNote.endChar;
							} else if (line.charAt(i) === ' ') {
								// Spaces are not allowed in chords, but we can recover from it by ignoring it.
								warn("Spaces are not allowed in chords", line, i);
								i++;
							} else {
								if (i < line.length && line.charAt(i) === ']') {
									// consume the close bracket
									i++;

									if (multilineVars.next_note_duration !== 0) {
										el.duration = el.duration * multilineVars.next_note_duration;
										multilineVars.next_note_duration = 0;
									}

									if (multilineVars.inTie) {
										window.ABCJS.parse.each(el.pitches, function(pitch) { pitch.endTie = true; });
										multilineVars.inTie = false;
									}

									if (tripletNotesLeft > 0) {
										tripletNotesLeft--;
										if (tripletNotesLeft === 0) {
											el.endTriplet = true;
										}
									}

									var postChordDone = false;
									while (i < line.length && !postChordDone) {
										switch (line.charAt(i)) {
											case ' ':
											case '\t':
												addEndBeam(el);
												break;
											case ')':
												if (el.endSlur === undefined) el.endSlur = 1; else el.endSlur++;
												break;
											case '-':
												window.ABCJS.parse.each(el.pitches, function(pitch) { pitch.startTie = {}; });
												multilineVars.inTie = true;
												break;
											case '>':
											case '<':
												var br2 = getBrokenRhythm(line, i);
												i += br2[0] - 1;	// index gets incremented below, so we'll let that happen
												multilineVars.next_note_duration = br2[2];
												if (chordDuration)
													chordDuration = chordDuration * br2[1];
												else
													chordDuration = br2[1];
												break;
											case '1':
											case '2':
											case '3':
											case '4':
											case '5':
											case '6':
											case '7':
											case '8':
											case '9':
											case '/':
												var fraction = tokenizer.getFraction(line, i);
												chordDuration = fraction.value;
												i = fraction.index;
												if (line.charAt(i) === '-' || line.charAt(i) === ')' || line.charAt(i) === ' ' || line.charAt(i) === '<' || line.charAt(i) === '>')
													i--; // Subtracting one because one is automatically added below
												else
													postChordDone = true;
												break;
											default:
												postChordDone = true;
												break;
										}
										if (!postChordDone) {
											i++;
										}
									}
								} else
									warn("Expected ']' to end the chords", line, i);

								if (el.pitches !== undefined) {
									if (chordDuration !== null) {
										el.duration = el.duration * chordDuration;
									}
									if (multilineVars.barNumOnNextNote) {
										el.barNumber = multilineVars.barNumOnNextNote;
										multilineVars.barNumOnNextNote = null;
									}
									multilineVars.addFormattingOptions(el, tune.formatting, 'note');
									tune.appendElement('note', startOfLine+chordStartChar, startOfLine+i, el);
									multilineVars.measureNotEmpty = true;
									el = {};
								}
								done = true;
							}
						}

					} else {
						// Single pitch
						var el2 = {};
						var core = getCoreNote(line, i, el2, true);
						if (el2.endTie !== undefined) multilineVars.inTie = true;
						if (core !== null) {
							if (core.pitch !== undefined) {
								el.pitches = [ { } ];
								// TODO-PER: straighten this out so there is not so much copying: getCoreNote shouldn't change e'
								if (core.accidental !== undefined) el.pitches[0].accidental = core.accidental;
								el.pitches[0].pitch = core.pitch;
								if (core.endSlur !== undefined) el.pitches[0].endSlur = core.endSlur;
								if (core.endTie !== undefined) el.pitches[0].endTie = core.endTie;
								if (core.startSlur !== undefined) el.pitches[0].startSlur = core.startSlur;
								if (el.startSlur !== undefined) el.pitches[0].startSlur = el.startSlur;
								if (core.startTie !== undefined) el.pitches[0].startTie = core.startTie;
								if (el.startTie !== undefined) el.pitches[0].startTie = el.startTie;
							} else {
								el.rest = core.rest;
								if (core.endSlur !== undefined) el.endSlur = core.endSlur;
								if (core.endTie !== undefined) el.rest.endTie = core.endTie;
								if (core.startSlur !== undefined) el.startSlur = core.startSlur;
								if (core.startTie !== undefined) el.rest.startTie = core.startTie;
								if (el.startTie !== undefined) el.rest.startTie = el.startTie;
							}

							if (core.chord !== undefined) el.chord = core.chord;
							if (core.duration !== undefined) el.duration = core.duration;
							if (core.decoration !== undefined) el.decoration = core.decoration;
							if (core.graceNotes !== undefined) el.graceNotes = core.graceNotes;
							delete el.startSlur;
							if (multilineVars.inTie) {
								if (el.pitches !== undefined)
									el.pitches[0].endTie = true;
								else
									el.rest.endTie = true;
								multilineVars.inTie = false;
							}
							if (core.startTie || el.startTie)
								multilineVars.inTie = true;
							i  = core.endChar;

							if (tripletNotesLeft > 0) {
								tripletNotesLeft--;
								if (tripletNotesLeft === 0) {
									el.endTriplet = true;
								}
							}

							if (core.end_beam)
								addEndBeam(el);

							// If there is a whole rest, then it should be the duration of the measure, not it's own duration. We need to special case it.
							if (el.rest && el.rest.type === 'rest' && el.duration === 1) {
								el.rest.type = 'whole';

								el.duration = durationOfMeasure(multilineVars);
							}

							if (multilineVars.barNumOnNextNote) {
								el.barNumber = multilineVars.barNumOnNextNote;
								multilineVars.barNumOnNextNote = null;
							}
							multilineVars.addFormattingOptions(el, tune.formatting, 'note');
							tune.appendElement('note', startOfLine+startI, startOfLine+i, el);
							multilineVars.measureNotEmpty = true;
							el = {};
						}
					}

					if (i === startI) {	// don't know what this is, so ignore it.
						if (line.charAt(i) !== ' ' && line.charAt(i) !== '`')
							warn("Unknown character ignored", line, i);
						i++;
					}
				}
			}
		}
	};

	var parseLine = function(line) {
		var ret = header.parseHeader(line);
		if (ret.regular)
			parseRegularMusicLine(ret.str);
		if (ret.newline && multilineVars.continueall === undefined)
			startNewLine();
		if (ret.words)
			addWords(tune.getCurrentVoice(), line.substring(2));
		if (ret.symbols)
			addSymbols(tune.getCurrentVoice(), line.substring(2));
		if (ret.recurse)
			parseLine(ret.str);
	};

	this.parse = function(strTune, switches) {
		// the switches are optional and cause a difference in the way the tune is parsed.
		// switches.header_only : stop parsing when the header is finished
		// switches.stop_on_warning : stop at the first warning encountered.
		// switches.print: format for the page instead of the browser.
		// switches.format: a hash of the desired formatting commands.
		if (!switches) switches = {};
		tune.reset();
		if (switches.print)
			tune.media = 'print';
		multilineVars.reset();
		header.reset(tokenizer, warn, multilineVars, tune);

		// Take care of whatever line endings come our way
		strTune = window.ABCJS.parse.gsub(strTune, '\r\n', '\n');
		strTune = window.ABCJS.parse.gsub(strTune, '\r', '\n');
		strTune += '\n';	// Tacked on temporarily to make the last line continuation work
		strTune = strTune.replace(/\n\\.*\n/g, "\n");	// get rid of latex commands.
		var continuationReplacement = function(all, backslash, comment){
			var spaces = "                                                                                                                                                                                                     ";
			var padding = comment ? spaces.substring(0, comment.length) : "";
			return backslash + " \x12" + padding;
		};
		strTune = strTune.replace(/\\([ \t]*)(%.*)*\n/g, continuationReplacement);	// take care of line continuations right away, but keep the same number of characters
		var lines = strTune.split('\n');
		if (window.ABCJS.parse.last(lines).length === 0)	// remove the blank line we added above.
			lines.pop();
		try {
			if (switches.format) {
				window.ABCJS.parse.parseDirective.globalFormatting(switches.format);
			}
			window.ABCJS.parse.each(lines,  function(line) {
				if (switches.header_only && multilineVars.is_in_header === false)
					throw "normal_abort";
				if (switches.stop_on_warning && multilineVars.warnings)
					throw "normal_abort";
				if (multilineVars.is_in_history) {
					if (line.charAt(1) === ':') {
						multilineVars.is_in_history = false;
						parseLine(line);
					} else
						tune.addMetaText("history", tokenizer.translateString(tokenizer.stripComment(line)));
				} else if (multilineVars.inTextBlock) {
					if (window.ABCJS.parse.startsWith(line, "%%endtext")) {
						//tune.addMetaText("textBlock", multilineVars.textBlock);
						tune.addText(multilineVars.textBlock);
						multilineVars.inTextBlock = false;
					}
					else {
						if (window.ABCJS.parse.startsWith(line, "%%"))
							multilineVars.textBlock += ' ' + line.substring(2);
						else
							multilineVars.textBlock += ' ' + line;
					}
				} else if (multilineVars.inPsBlock) {
					if (window.ABCJS.parse.startsWith(line, "%%endps")) {
						// Just ignore postscript
						multilineVars.inPsBlock = false;
					}
					else
						multilineVars.textBlock += ' ' + line;
				} else
					parseLine(line);
				multilineVars.iChar += line.length + 1;
			});
			var ph = 11*72;
			var pl = 8.5*72;
			switch (multilineVars.papersize) {
				//case "letter": ph = 11*72; pl = 8.5*72; break;
				case "legal": ph = 14*72; pl = 8.5*72; break;
				case "A4": ph = 11.7*72; pl = 8.3*72; break;
			}
			if (multilineVars.landscape) {
				var x = ph;
				ph = pl;
				pl = x;
			}
			multilineVars.openSlurs = tune.cleanUp(pl, ph, multilineVars.barsperstaff, multilineVars.staffnonote, multilineVars.openSlurs);
		} catch (err) {
			if (err !== "normal_abort")
				throw err;
		}
	};
};
/*global window */

if (!window.ABCJS)
	window.ABCJS = {};

if (!window.ABCJS.parse)
	window.ABCJS.parse = {};

window.ABCJS.parse.parseDirective = {};

(function() {
	"use strict";
	var tokenizer;
	var warn;
	var multilineVars;
	var tune;
	window.ABCJS.parse.parseDirective.initialize = function(tokenizer_, warn_, multilineVars_, tune_) {
		tokenizer = tokenizer_;
		warn = warn_;
		multilineVars = multilineVars_;
		tune = tune_;
		initializeFonts();
	};

	function initializeFonts() {
		multilineVars.annotationfont  = { face: "Helvetica", size: 12, weight: "normal", style: "normal", decoration: "none" };
		multilineVars.gchordfont  = { face: "Helvetica", size: 12, weight: "normal", style: "normal", decoration: "none" };
		multilineVars.historyfont  = { face: "\"Times New Roman\"", size: 16, weight: "normal", style: "normal", decoration: "none" };
		multilineVars.infofont  = { face: "\"Times New Roman\"", size: 14, weight: "normal", style: "italic", decoration: "none" };
		multilineVars.measurefont  = { face: "\"Times New Roman\"", size: 14, weight: "normal", style: "italic", decoration: "none" };
		multilineVars.partsfont  = { face: "\"Times New Roman\"", size: 15, weight: "normal", style: "normal", decoration: "none" };
		multilineVars.repeatfont  = { face: "\"Times New Roman\"", size: 13, weight: "normal", style: "normal", decoration: "none" };
		multilineVars.textfont  = { face: "\"Times New Roman\"", size: 16, weight: "normal", style: "normal", decoration: "none" };
		multilineVars.vocalfont  = { face: "\"Times New Roman\"", size: 13, weight: "bold", style: "normal", decoration: "none" };
		multilineVars.wordsfont  = { face: "\"Times New Roman\"", size: 16, weight: "normal", style: "normal", decoration: "none" };

		// These fonts are global for the entire tune.
		tune.formatting.composerfont  = { face: "\"Times New Roman\"", size: 14, weight: "normal", style: "italic", decoration: "none" };
		tune.formatting.subtitlefont  = { face: "\"Times New Roman\"", size: 16, weight: "normal", style: "normal", decoration: "none" };
		tune.formatting.tempofont  = { face: "\"Times New Roman\"", size: 15, weight: "bold", style: "normal", decoration: "none" };
		tune.formatting.titlefont  = { face: "\"Times New Roman\"", size: 20, weight: "normal", style: "normal", decoration: "none" };
		tune.formatting.footerfont  = { face: "\"Times New Roman\"", size: 12, weight: "normal", style: "normal", decoration: "none" };
		tune.formatting.headerfont  = { face: "\"Times New Roman\"", size: 12, weight: "normal", style: "normal", decoration: "none" };
		tune.formatting.voicefont  = { face: "\"Times New Roman\"", size: 13, weight: "bold", style: "normal", decoration: "none" };

		// these are the default fonts for these element types. In the printer, these fonts might change as the tune progresses.
		tune.formatting.annotationfont  = multilineVars.annotationfont;
		tune.formatting.gchordfont  = multilineVars.gchordfont;
		tune.formatting.historyfont  = multilineVars.historyfont;
		tune.formatting.infofont  = multilineVars.infofont;
		tune.formatting.measurefont  = multilineVars.measurefont;
		tune.formatting.partsfont  = multilineVars.partsfont;
		tune.formatting.repeatfont  = multilineVars.repeatfont;
		tune.formatting.textfont  = multilineVars.textfont;
		tune.formatting.vocalfont  = multilineVars.vocalfont;
		tune.formatting.wordsfont  = multilineVars.wordsfont;
	}

	var fontTypeCanHaveBox = { gchordfont: true, measurefont: true, partsfont: true };

	var fontTranslation = function(fontFace) {
		// This translates Postscript fonts for a web alternative.
		// Note that the postscript fonts contain italic and bold info in them, so what is returned is a hash.

		switch (fontFace) {
			case "Arial-Italic":
				return { face: "Arial", weight: "normal", style: "italic", decoration: "none" };
			case "Arial-Bold":
				return { face: "Arial", weight: "bold", style: "normal", decoration: "none" };
			case "Bookman-Demi":
				return { face: "Bookman,serif", weight: "bold", style: "normal", decoration: "none" };
			case "Bookman-DemiItalic":
				return { face: "Bookman,serif", weight: "bold", style: "italic", decoration: "none" };
			case "Bookman-Light":
				return { face: "Bookman,serif", weight: "normal", style: "normal", decoration: "none" };
			case "Bookman-LightItalic":
				return { face: "Bookman,serif", weight: "normal", style: "italic", decoration: "none" };
			case "Courier":
				return { face: "\"Courier New\"", weight: "normal", style: "normal", decoration: "none" };
			case "Courier-Oblique":
				return { face: "\"Courier New\"", weight: "normal", style: "italic", decoration: "none" };
			case "Courier-Bold":
				return { face: "\"Courier New\"", weight: "bold", style: "normal", decoration: "none" };
			case "Courier-BoldOblique":
				return { face: "\"Courier New\"", weight: "bold", style: "italic", decoration: "none" };
			case "AvantGarde-Book":
				return { face: "AvantGarde,Arial", weight: "normal", style: "normal", decoration: "none" };
			case "AvantGarde-BookOblique":
				return { face: "AvantGarde,Arial", weight: "normal", style: "italic", decoration: "none" };
			case "AvantGarde-Demi":
			case "Avant-Garde-Demi":
				return { face: "AvantGarde,Arial", weight: "bold", style: "normal", decoration: "none" };
			case "AvantGarde-DemiOblique":
				return { face: "AvantGarde,Arial", weight: "bold", style: "italic", decoration: "none" };
			case "Helvetica-Oblique":
				return { face: "Helvetica", weight: "normal", style: "italic", decoration: "none" };
			case "Helvetica-Bold":
				return { face: "Helvetica", weight: "bold", style: "normal", decoration: "none" };
			case "Helvetica-BoldOblique":
				return { face: "Helvetica", weight: "bold", style: "italic", decoration: "none" };
			case "Helvetica-Narrow":
				return { face: "\"Helvetica Narrow\",Helvetica", weight: "normal", style: "normal", decoration: "none" };
			case "Helvetica-Narrow-Oblique":
				return { face: "\"Helvetica Narrow\",Helvetica", weight: "normal", style: "italic", decoration: "none" };
			case "Helvetica-Narrow-Bold":
				return { face: "\"Helvetica Narrow\",Helvetica", weight: "bold", style: "normal", decoration: "none" };
			case "Helvetica-Narrow-BoldOblique":
				return { face: "\"Helvetica Narrow\",Helvetica", weight: "bold", style: "italic", decoration: "none" };
			case "Palatino-Roman":
				return { face: "Palatino", weight: "normal", style: "normal", decoration: "none" };
			case "Palatino-Italic":
				return { face: "Palatino", weight: "normal", style: "italic", decoration: "none" };
			case "Palatino-Bold":
				return { face: "Palatino", weight: "bold", style: "normal", decoration: "none" };
			case "Palatino-BoldItalic":
				return { face: "Palatino", weight: "bold", style: "italic", decoration: "none" };
			case "NewCenturySchlbk-Roman":
				return { face: "\"New Century\",serif", weight: "normal", style: "normal", decoration: "none" };
			case "NewCenturySchlbk-Italic":
				return { face: "\"New Century\",serif", weight: "normal", style: "italic", decoration: "none" };
			case "NewCenturySchlbk-Bold":
				return { face: "\"New Century\",serif", weight: "bold", style: "normal", decoration: "none" };
			case "NewCenturySchlbk-BoldItalic":
				return { face: "\"New Century\",serif", weight: "bold", style: "italic", decoration: "none" };
			case "Times":
			case "Times-Roman":
			case "Times-Narrow":
			case "Times-Courier":
			case "Times-New-Roman":
				return { face: "\"Times New Roman\"", weight: "normal", style: "normal", decoration: "none" };
			case "Times-Italic":
			case "Times-Italics":
				return { face: "\"Times New Roman\"", weight: "normal", style: "italic", decoration: "none" };
			case "Times-Bold":
				return { face: "\"Times New Roman\"", weight: "bold", style: "normal", decoration: "none" };
			case "Times-BoldItalic":
				return { face: "\"Times New Roman\"", weight: "bold", style: "italic", decoration: "none" };
			case "ZapfChancery-MediumItalic":
				return { face: "\"Zapf Chancery\",cursive,serif", weight: "normal", style: "normal", decoration: "none" };
			default:
				return null;
		}
	};

	var getFontParameter = function(tokens, currentSetting, str, position, cmd) {
		// Every font parameter has the following format:
		// <face> <utf8> <size> <modifiers> <box>
		// Where:
		// face: either a standard web font name, or a postscript font, enumerated in fontTranslation. This could also be an * or be missing if the face shouldn't change.
		// utf8: This is optional, and specifies utf8. That's all that is supported so the field is just silently ignored.
		// size: The size, in pixels. This may be omitted if the size is not changing.
		// modifiers: zero or more of "bold", "italic", "underline"
		// box: Only applies to the measure numbers, gchords, and the parts. If present, then a box is drawn around the characters.
		// If face is present, then all the modifiers are cleared. If face is absent, then the modifiers are illegal.
		// The face can be a single word, a set of words separated by hyphens, or a quoted string.
		//
		// So, in practicality, there are three types of font definitions: a number only, an asterisk and a number only, or the full definition (with an optional size).
		function processNumberOnly() {
			var size = parseInt(tokens[0].token);
			tokens.shift();
			if (!currentSetting) {
				warn("Can't set just the size of the font since there is no default value.", str, position);
				return { face: "\"Times New Roman\"", weight: "normal", style: "normal", decoration: "none", size: size};
			}
			if (tokens.length === 0) {
				return { face: currentSetting.face, weight: currentSetting.weight, style: currentSetting.style, decoration: currentSetting.decoration, size: size};
			}
			if (tokens.length === 1 && tokens[0].token === "box" && fontTypeCanHaveBox[cmd])
				return { face: currentSetting.face, weight: currentSetting.weight, style: currentSetting.style, decoration: currentSetting.decoration, size: size, box: true};
			warn("Extra parameters in font definition.", str, position);
			return { face: currentSetting.face, weight: currentSetting.weight, style: currentSetting.style, decoration: currentSetting.decoration, size: size};
		}

		// format 1: asterisk and number only
		if (tokens[0].token === '*') {
			tokens.shift();
			if (tokens[0].type === 'number')
				return processNumberOnly();
			else {
				warn("Expected font size number after *.", str, position);
			}
		}

		// format 2: number only
		if (tokens[0].type === 'number') {
			return processNumberOnly();
		}

		// format 3: whole definition
		var face = [];
		var size;
		var weight = "normal";
		var style = "normal";
		var decoration = "none";
		var box = false;
		var state = 'face';
		var hyphenLast = false;
		while (tokens.length) {
			var currToken = tokens.shift();
			var word = currToken.token.toLowerCase();
			switch (state) {
				case 'face':
					if (hyphenLast || (word !== 'utf' && currToken.type !== 'number' && word !== "bold" && word !== "italic" && word !== "underline" && word !== "box")) {
						if (face.length > 0 && currToken.token === '-') {
							hyphenLast = true;
							face[face.length-1] = face[face.length-1] + currToken.token;
						}
						else {
							if (hyphenLast) {
								hyphenLast = false;
								face[face.length-1] = face[face.length-1] + currToken.token;
							} else
								face.push(currToken.token);
						}
					} else {
						if (currToken.type === 'number') {
							if (size) {
								warn("Font size specified twice in font definition.", str, position);
							} else {
								size = currToken.token;
							}
							state = 'modifier';
						} else if (word === "bold")
							weight = "bold";
						else if (word === "italic")
							style = "italic";
						else if (word === "underline")
							decoration = "underline";
						else if (word === "box") {
							if (fontTypeCanHaveBox[cmd])
								box = true;
							else
								warn("This font style doesn't support \"box\"", str, position);
							state = "finished";
						} else if (word === "utf") {
							currToken = tokens.shift(); // this gets rid of the "8" after "utf"
							state = "size";
						} else
							warn("Unknown parameter " + currToken.token + " in font definition.", str, position);
					}
					break;
				case "size":
					if (currToken.type === 'number') {
						if (size) {
							warn("Font size specified twice in font definition.", str, position);
						} else {
							size = currToken.token;
						}
					} else {
						warn("Expected font size in font definition.", str, position);
					}
					state = 'modifier';
					break;
				case "modifier":
					if (word === "bold")
						weight = "bold";
					else if (word === "italic")
						style = "italic";
					else if (word === "underline")
						decoration = "underline";
					else if (word === "box") {
						if (fontTypeCanHaveBox[cmd])
							box = true;
						else
							warn("This font style doesn't support \"box\"", str, position);
						state = "finished";
					} else
						warn("Unknown parameter " + currToken.token + " in font definition.", str, position);
					break;
				case "finished":
					warn("Extra characters found after \"box\" in font definition.", str, position);
					break;
			}
		}

		if (size === undefined) {
			if (!currentSetting) {
				warn("Must specify the size of the font since there is no default value.", str, position);
				size = 12;
			} else
				size = currentSetting.size;
		} else
			size = parseFloat(size);

		face = face.join(' ');
		var psFont = fontTranslation(face);
		var font = {};
		if (psFont) {
			font.face = psFont.face;
			font.weight = psFont.weight;
			font.style = psFont.style;
			font.decoration = psFont.decoration;
			font.size = size;
			if (box)
				font.box = true;
			return font;
		}
		font.face = face;
		font.weight = weight;
		font.style = style;
		font.decoration = decoration;
		font.size = size;
		if (box)
			font.box = true;
		return font;
	};

	var getChangingFont = function(cmd, tokens, str) {
		if (tokens.length === 0)
			return "Directive \"" + cmd + "\" requires a font as a parameter.";
		multilineVars[cmd] = getFontParameter(tokens, multilineVars[cmd], str, 0, cmd);
		if (multilineVars.is_in_header) // If the font appears in the header, then it becomes the default font.
			tune.formatting[cmd] = multilineVars[cmd];
		return null;
	};
	var getGlobalFont = function(cmd, tokens, str) {
		if (tokens.length === 0)
			return "Directive \"" + cmd + "\" requires a font as a parameter.";
		tune.formatting[cmd] = getFontParameter(tokens, tune.formatting[cmd], str, 0, cmd);
		return null;
	};

	var setScale = function(cmd, tokens) {
		var scratch = "";
		window.ABCJS.parse.each(tokens, function(tok) {
			scratch += tok.token;
		});
		var num = parseFloat(scratch);
		if (isNaN(num) || num === 0)
			return "Directive \"" + cmd + "\" requires a number as a parameter.";
		tune.formatting.scale = num;

	};

	var getRequiredMeasurement = function(cmd, tokens) {
		var points = tokenizer.getMeasurement(tokens);
		if (points.used === 0 || tokens.length !== 0)
			return { error: "Directive \"" + cmd + "\" requires a measurement as a parameter."};
		return points.value;
	};
	var oneParameterMeasurement = function(cmd, tokens) {
		var points = tokenizer.getMeasurement(tokens);
		if (points.used === 0 || tokens.length !== 0)
			return "Directive \"" + cmd + "\" requires a measurement as a parameter.";
		tune.formatting[cmd] = points.value;
		return null;
	};

	var addMultilineVar = function(key, cmd, tokens, min, max) {
		if (tokens.length !== 1 || tokens[0].type !== 'number')
			return "Directive \"" + cmd + "\" requires a number as a parameter.";
		var i = tokens[0].intt;
		if (min !== undefined && i < min)
			return "Directive \"" + cmd + "\" requires a number greater than or equal to " + min + " as a parameter.";
		if (max !== undefined && i > max)
			return "Directive \"" + cmd + "\" requires a number less than or equal to " + max + " as a parameter.";
		multilineVars[key] = i;
		return null;
	};

	var addMultilineVarBool = function(key, cmd, tokens) {
		var str = addMultilineVar(key, cmd, tokens, 0, 1);
		if (str !== null) return str;
		multilineVars[key] = (multilineVars[key] === 1);
		return null;
	};

	var addMultilineVarOneParamChoice = function(key, cmd, tokens, choices) {
		if (tokens.length !== 1)
			return "Directive \"" + cmd + "\" requires one of [ " + choices.join(", ") + " ] as a parameter.";
		var choice = tokens[0].token;
		var found = false;
		for (var i = 0; !found && i < choices.length; i++) {
			if (choices[i] === choice)
				found = true;
		}
		if (!found)
			return "Directive \"" + cmd + "\" requires one of [ " + choices.join(", ") + " ] as a parameter.";
		multilineVars[key] = choice;
		return null;
	};

	window.ABCJS.parse.parseDirective.parseFontChangeLine = function(textstr) {
		var textParts = textstr.split('$');
		if (textParts.length > 1 && multilineVars.setfont) {
			var textarr = [ { text: textParts[0] }];
			for (var i = 1; i < textParts.length; i++) {
				if (textParts[i].charAt(0) === '0')
					textarr.push({ text: textParts[i].substring(1) });
				else if (textParts[i].charAt(0) === '1' && multilineVars.setfont[1])
					textarr.push({font: multilineVars.setfont[1], text: textParts[i].substring(1) });
				else if (textParts[i].charAt(0) === '2' && multilineVars.setfont[2])
					textarr.push({font: multilineVars.setfont[2], text: textParts[i].substring(1) });
				else if (textParts[i].charAt(0) === '3' && multilineVars.setfont[3])
					textarr.push({font: multilineVars.setfont[3], text: textParts[i].substring(1) });
				else if (textParts[i].charAt(0) === '4' && multilineVars.setfont[4])
					textarr.push({font: multilineVars.setfont[4], text: textParts[i].substring(1) });
				else
					textarr[textarr.length-1].text += '$' + textParts[i];
			}
			if (textarr.length > 1)
				return textarr;
		}
		return textstr;
	};

	var positionChoices = [ 'auto', 'above', 'below', 'hidden' ];
	window.ABCJS.parse.parseDirective.addDirective = function(str) {
		var tokens = tokenizer.tokenize(str, 0, str.length);	// 3 or more % in a row, or just spaces after %% is just a comment
		if (tokens.length === 0 || tokens[0].type !== 'alpha') return null;
		var restOfString = str.substring(str.indexOf(tokens[0].token)+tokens[0].token.length);
		restOfString = tokenizer.stripComment(restOfString);
		var cmd = tokens.shift().token.toLowerCase();
		var scratch = "";
		switch (cmd)
		{
			// The following directives were added to abc_parser_lint, but haven't been implemented here.
			// Most of them are direct translations from the directives that will be parsed in. See abcm2ps's format.txt for info on each of these.
			//					alignbars: { type: "number", optional: true },
			//					aligncomposer: { type: "string", Enum: [ 'left', 'center','right' ], optional: true },
			//					bstemdown: { type: "boolean", optional: true },
			//					continueall: { type: "boolean", optional: true },
			//					dynalign: { type: "boolean", optional: true },
			//					exprabove: { type: "boolean", optional: true },
			//					exprbelow: { type: "boolean", optional: true },
			//					flatbeams: { type: "boolean", optional: true },
			//					gchordbox: { type: "boolean", optional: true },
			//					graceslurs: { type: "boolean", optional: true },
			//					gracespacebefore: { type: "number", optional: true },
			//					gracespaceinside: { type: "number", optional: true },
			//					gracespaceafter: { type: "number", optional: true },
			//					infospace: { type: "number", optional: true },
			//					lineskipfac: { type: "number", optional: true },
			//					maxshrink: { type: "number", optional: true },
			//					maxstaffsep: { type: "number", optional: true },
			//					maxsysstaffsep: { type: "number", optional: true },
			//					notespacingfactor: { type: "number", optional: true },
			//					parskipfac: { type: "number", optional: true },
			//					slurheight: { type: "number", optional: true },
			//					splittune: { type: "boolean", optional: true },
			//					squarebreve: { type: "boolean", optional: true },
			//					stemheight: { type: "number", optional: true },
			//					straightflags: { type: "boolean", optional: true },
			//					stretchstaff: { type: "boolean", optional: true },
			//					titleformat: { type: "string", optional: true },
			case "bagpipes":tune.formatting.bagpipes = true;break;
			case "landscape":multilineVars.landscape = true;break;
			case "papersize":multilineVars.papersize = restOfString;break;
			case "slurgraces":tune.formatting.slurgraces = true;break;
			case "stretchlast":tune.formatting.stretchlast = true;break;
			case "titlecaps":multilineVars.titlecaps = true;break;
			case "titleleft":tune.formatting.titleleft = true;break;
			case "measurebox":tune.formatting.measurebox = true;break;

			case "vocal": return addMultilineVarOneParamChoice("vocalPosition", cmd, tokens, positionChoices);
			case "dynamic": return addMultilineVarOneParamChoice("dynamicPosition", cmd, tokens, positionChoices);
			case "gchord": return addMultilineVarOneParamChoice("chordPosition", cmd, tokens, positionChoices);
			case "ornament": return addMultilineVarOneParamChoice("ornamentPosition", cmd, tokens, positionChoices);
			case "volume": return addMultilineVarOneParamChoice("volumePosition", cmd, tokens, positionChoices);

			case "botmargin":
			case "botspace":
			case "composerspace":
			case "indent":
			case "leftmargin":
			case "linesep":
			case "musicspace":
			case "partsspace":
			case "pageheight":
			case "pagewidth":
			case "rightmargin":
			case "staffsep":
			case "staffwidth":
			case "subtitlespace":
			case "sysstaffsep":
			case "systemsep":
			case "textspace":
			case "titlespace":
			case "topmargin":
			case "topspace":
			case "vocalspace":
			case "wordsspace":
				return oneParameterMeasurement(cmd, tokens);
			case "vskip":
				var vskip = getRequiredMeasurement(cmd, tokens);
				if (vskip.error)
					return vskip.error;
				tune.addSpacing(vskip);
				return null;
			case "scale":
				setScale(cmd, tokens);
				break;
			case "sep":
				if (tokens.length === 0)
					tune.addSeparator();
				else {
					var points = tokenizer.getMeasurement(tokens);
					if (points.used === 0)
						return "Directive \"" + cmd + "\" requires 3 numbers: space above, space below, length of line";
					var spaceAbove = points.value;

					points = tokenizer.getMeasurement(tokens);
					if (points.used === 0)
						return "Directive \"" + cmd + "\" requires 3 numbers: space above, space below, length of line";
					var spaceBelow = points.value;

					points = tokenizer.getMeasurement(tokens);
					if (points.used === 0 || tokens.length !== 0)
						return "Directive \"" + cmd + "\" requires 3 numbers: space above, space below, length of line";
					var lenLine = points.value;
					tune.addSeparator(spaceAbove, spaceBelow, lenLine);
				}
				break;
			case "barsperstaff":
				scratch = addMultilineVar('barsperstaff', cmd, tokens);
				if (scratch !== null) return scratch;
				break;
			case "staffnonote":
				scratch = addMultilineVarBool('staffnonote', cmd, tokens);
				if (scratch !== null) return scratch;
				break;
			case "printtempo":
				scratch = addMultilineVarBool('printTempo', cmd, tokens);
				if (scratch !== null) return scratch;
				break;
			case "partsbox":
				scratch = addMultilineVarBool('partsBox', cmd, tokens);
				if (scratch !== null) return scratch;
				break;
			case "measurenb":
			case "barnumbers":
				scratch = addMultilineVar('barNumbers', cmd, tokens);
				if (scratch !== null) return scratch;
				break;
			case "begintext":
				multilineVars.inTextBlock = true;
				break;
			case "continueall":
				multilineVars.continueall = true;
				break;
			case "beginps":
				multilineVars.inPsBlock = true;
				warn("Postscript ignored", str, 0);
				break;
			case "deco":
				if (restOfString.length > 0)
					multilineVars.ignoredDecorations.push(restOfString.substring(0, restOfString.indexOf(' ')));
				warn("Decoration redefinition ignored", str, 0);
				break;
			case "text":
				var textstr = tokenizer.translateString(restOfString);
				tune.addText(window.ABCJS.parse.parseDirective.parseFontChangeLine(textstr));
				break;
			case "center":
				var centerstr = tokenizer.translateString(restOfString);
				tune.addCentered(window.ABCJS.parse.parseDirective.parseFontChangeLine(centerstr));
				break;
			case "font":
				// don't need to do anything for this; it is a useless directive
				break;
			case "setfont":
				var sfTokens = tokenizer.tokenize(restOfString, 0, restOfString.length);
//				var sfDone = false;
				if (sfTokens.length >= 4) {
					if (sfTokens[0].token === '-' && sfTokens[1].type === 'number') {
						var sfNum = parseInt(sfTokens[1].token);
						if (sfNum >= 1 && sfNum <= 4) {
							if (!multilineVars.setfont)
								multilineVars.setfont = [];
							sfTokens.shift();
							sfTokens.shift();
							multilineVars.setfont[sfNum] = getFontParameter(sfTokens, multilineVars.setfont[sfNum], str, 0, 'setfont');
//							var sfSize = sfTokens.pop();
//							if (sfSize.type === 'number') {
//								sfSize = parseInt(sfSize.token);
//								var sfFontName = '';
//								for (var sfi = 2; sfi < sfTokens.length; sfi++)
//									sfFontName += sfTokens[sfi].token;
//								multilineVars.setfont[sfNum] = { face: sfFontName, size: sfSize };
//								sfDone = true;
//							}
						}
					}
				}
//				if (!sfDone)
//					return "Bad parameters: " + cmd;
				break;
			case "gchordfont":
			case "partsfont":
			case "vocalfont":
			case "textfont":
			case "annotationfont":
			case "historyfont":
			case "infofont":
			case "measurefont":
			case "repeatfont":
			case "wordsfont":
				return getChangingFont(cmd, tokens, str);
			case "composerfont":
			case "subtitlefont":
			case "tempofont":
			case "titlefont":
			case "voicefont":
			case "footerfont":
			case "headerfont":
				return getGlobalFont(cmd, tokens, str);
			case "barlabelfont":
			case "barnumberfont":
			case "barnumfont":
				return getChangingFont("measurefont", tokens, str);
			case "staves":
			case "score":
				multilineVars.score_is_present = true;
				var addVoice = function(id, newStaff, bracket, brace, continueBar) {
					if (newStaff || multilineVars.staves.length === 0) {
						multilineVars.staves.push({index: multilineVars.staves.length, numVoices: 0});
					}
					var staff = window.ABCJS.parse.last(multilineVars.staves);
					if (bracket !== undefined) staff.bracket = bracket;
					if (brace !== undefined) staff.brace = brace;
					if (continueBar) staff.connectBarLines = 'end';
					if (multilineVars.voices[id] === undefined) {
						multilineVars.voices[id] = {staffNum: staff.index, index: staff.numVoices};
						staff.numVoices++;
					}
				};

				var openParen = false;
				var openBracket = false;
				var openBrace = false;
				var justOpenParen = false;
				var justOpenBracket = false;
				var justOpenBrace = false;
				var continueBar = false;
				var lastVoice;
				var addContinueBar = function() {
					continueBar = true;
					if (lastVoice) {
						var ty = 'start';
						if (lastVoice.staffNum > 0) {
							if (multilineVars.staves[lastVoice.staffNum-1].connectBarLines === 'start' ||
								multilineVars.staves[lastVoice.staffNum-1].connectBarLines === 'continue')
								ty = 'continue';
						}
						multilineVars.staves[lastVoice.staffNum].connectBarLines = ty;
					}
				};
				while (tokens.length) {
					var t = tokens.shift();
					switch (t.token) {
						case '(':
							if (openParen) warn("Can't nest parenthesis in %%score", str, t.start);
							else {openParen = true;justOpenParen = true;}
							break;
						case ')':
							if (!openParen || justOpenParen) warn("Unexpected close parenthesis in %%score", str, t.start);
							else openParen = false;
							break;
						case '[':
							if (openBracket) warn("Can't nest brackets in %%score", str, t.start);
							else {openBracket = true;justOpenBracket = true;}
							break;
						case ']':
							if (!openBracket || justOpenBracket) warn("Unexpected close bracket in %%score", str, t.start);
							else {openBracket = false;multilineVars.staves[lastVoice.staffNum].bracket = 'end';}
							break;
						case '{':
							if (openBrace ) warn("Can't nest braces in %%score", str, t.start);
							else {openBrace = true;justOpenBrace = true;}
							break;
						case '}':
							if (!openBrace || justOpenBrace) warn("Unexpected close brace in %%score", str, t.start);
							else {openBrace = false;multilineVars.staves[lastVoice.staffNum].brace = 'end';}
							break;
						case '|':
							addContinueBar();
							break;
						default:
							var vc = "";
							while (t.type === 'alpha' || t.type === 'number') {
								vc += t.token;
								if (t.continueId)
									t = tokens.shift();
								else
									break;
							}
							var newStaff = !openParen || justOpenParen;
							var bracket = justOpenBracket ? 'start' : openBracket ? 'continue' : undefined;
							var brace = justOpenBrace ? 'start' : openBrace ? 'continue' : undefined;
							addVoice(vc, newStaff, bracket, brace, continueBar);
							justOpenParen = false;
							justOpenBracket = false;
							justOpenBrace = false;
							continueBar = false;
							lastVoice = multilineVars.voices[vc];
							if (cmd === 'staves')
								addContinueBar();
							break;
					}
				}
				break;

			case "newpage":
				var pgNum = tokenizer.getInt(restOfString);
				tune.addNewPage(pgNum.digits === 0 ? -1 : pgNum.value);
				break;

			case "abc":
				var arr = restOfString.split(' ');
				switch (arr[0]) {
					case "-copyright":
					case "-creator":
					case "-edited-by":
					case "-version":
					case "-charset":
						var subCmd = arr.shift();
						tune.addMetaText(cmd+subCmd, arr.join(' '));
						break;
					default:
						return "Unknown directive: " + cmd+arr[0];
				}
				break;
			case "header":
			case "footer":
				var footerStr = tokenizer.getMeat(restOfString, 0, restOfString.length);
				footerStr = restOfString.substring(footerStr.start, footerStr.end);
				if (footerStr.charAt(0) === '"' && footerStr.charAt(footerStr.length-1) === '"' )
					footerStr = footerStr.substring(1, footerStr.length-1);
				var footerArr = footerStr.split('\t');
				var footer = {};
				if (footerArr.length === 1)
					footer = { left: "", center: footerArr[0], right: "" };
				else if (footerArr.length === 2)
					footer = { left: footerArr[0], center: footerArr[1], right: "" };
				else
					footer = { left: footerArr[0], center: footerArr[1], right: footerArr[2] };
				if (footerArr.length > 3)
					warn("Too many tabs in " + cmd + ": " + footerArr.length + " found.", restOfString, 0);

				tune.addMetaTextObj(cmd, footer);
				break;

			case "midi":
				var midi = tokenizer.tokenize(restOfString, 0, restOfString.length);
				if (midi.length > 0 && midi[0].token === '=')
					midi.shift();
				if (midi.length === 0)
					warn("Expected midi command", restOfString, 0);
				else {
	//				var midiCmd = restOfString.split(' ')[0];
	//				var midiParam = restOfString.substring(midiCmd.length+1);
					var getNextMidiParam =  function(midiToks) {
						if (midiToks.length > 0) {
							var t = midiToks.shift();
							var p = t.token;
							if (t.type === "number")
								p = t.intt;
							return p;
						}
						else
							return null;
					};
					// TODO-PER: make sure the command is legal
					if (tune.formatting[cmd] === undefined)
						tune.formatting[cmd] = {};
					var midi_cmd = midi.shift().token;
					var midi_param = true;
					if (midi_cmd === 'program') {
						var p1 = getNextMidiParam(midi);
						if (p1) {
							var p2 = getNextMidiParam(midi);
							// NOTE: The program number has an off by one error in ABC, so we add one here.
							if (p2)
								midi_param = { channel: p1, program: p2};
							else
								midi_param = { program: p1};
						}
					} else {
						// TODO-PER: handle the params for all MIDI commands
						var p = getNextMidiParam(midi);
						if (p !== null)
							midi_param = p;
					}
					tune.formatting[cmd][midi_cmd] = midi_param;
					// TODO-PER: save all the parameters, not just the first.
				}
	//%%MIDI barlines: deactivates %%nobarlines.
	//%%MIDI bassprog n
	//%%MIDI bassvol n
	//%%MIDI beat ⟨int1⟩ ⟨int2⟩ ⟨int3⟩ ⟨int4⟩: controls the volumes of the notes in a measure. The first note in a bar has volume ⟨int1⟩; other ‘strong’ notes have volume ⟨int2⟩ and all the rest have volume ⟨int3⟩. These values must be in the range 0–127. The parameter ⟨int4⟩ determines which notes are ‘strong’. If the time signature is x/y, then each note is given a position number k = 0, 1, 2. . . x-1 within each bar. If k is a multiple of ⟨int4⟩, then the note is ‘strong’.
	//%%MIDI beataccents: reverts to normally emphasised notes. See also %%MIDI nobeat-
	//%%MIDI beatmod ⟨int⟩: increments the velocities as defined by %%MIDI beat
	//%%MIDI beatstring ⟨string⟩: similar to %%MIDI beat, but indicated with an fmp string.
	//%%MIDI c ⟨int⟩: specifies the MIDI pitch which corresponds to	. The default is 60.
	//%%MIDI channel ⟨int⟩: selects the melody channel ⟨int⟩ (1–16).
	//%%MIDI chordattack ⟨int⟩: delays the start of chord notes by ⟨int⟩ MIDI units.
	//%%MIDI chordname ⟨string int1 int2 int3 int4 int5 int6⟩: defines new chords or re-defines existing ones as was seen in Section 12.8.
	//%%MIDI chordprog 20 % Church organ
	//%%MIDI chordvol ⟨int⟩: sets the volume (velocity) of the chord notes to ⟨int⟩ (0–127).
	//%%MIDI control ⟨bass/chord⟩ ⟨int1 int2⟩: generates a MIDI control event. If %%control is followed by ⟨bass⟩ or ⟨chord⟩, the event apply to the bass or chord channel, otherwise it will be applied to the melody channel. ⟨int1⟩ is the MIDI control number (0–127) and ⟨int2⟩ the value (0–127).
	//%%MIDI deltaloudness⟨int⟩: bydefault,!crescendo!and!dimuendo!modifythebe- at variables ⟨vol1⟩ ⟨vol2⟩ ⟨vol3⟩ 15 volume units. This command allows the user to change this default.
	//%%MIDI drone ⟨int1 int2 int3 int4 int5⟩: specifies a two-note drone accompaniment. ⟨int1⟩ is the drone MIDI instrument, ⟨int2⟩ the MIDI pitch 1, ⟨int3⟩ the MIDI pitch 2, ⟨int4⟩ the MIDI volume 1, ⟨int5⟩ the MIDI volume 2. Default values are 70 45 33 80 80.
	//%%MIDI droneoff: turns the drone accompaniment off.
	//%%MIDI droneon: turns the drone accompaniment on.
	//%%MIDI drum string [drum programs] [drum velocities]
	//%%MIDI drumbars ⟨int⟩: specifies the number of bars over which a drum pattern string is spread. Default is 1.
	//%%MIDI drummap ⟨str⟩ ⟨int⟩: associates the note ⟨str⟩ (in ABC notation) to the a percussion instrument, as listed in Section H.2.
	//%%MIDI drumoff turns drum accompaniment off.
	//%%MIDI drumon turns drum accompaniment on.
	//%%MIDI fermatafixed: expands a !fermata! by one unit length; that is, GC3 becomes
	//%%MIDI fermataproportional: doubles the length of a note preceded by !fermata!;
	//%%MIDI gchord string
	//%%MIDI gchord str
	//%%MIDI gchordon
	//%%MIDI gchordoff
	//%%MIDI grace ⟨float⟩: sets the fraction of the next note that grace notes will take up. ⟨float⟩ must be a fraction such as 1/6.
	//%%MIDI gracedivider ⟨int⟩: sets the grace note length as 1/⟨int⟩th of the following note.
	//%%MIDI makechordchannels⟨int⟩: thisisaverycomplexcommandusedinchordscon-
	//%%MIDI nobarlines
	//%%MIDI nobeataccents: forces the ⟨int2⟩ volume (see %%MIDI beat) for each note in a bar, regardless of their position.
	//%%MIDI noportamento: turns off the portamento controller on the current channel.
	//%%MIDI pitchbend [bass/chord] <high byte> <low byte>
	//%%MIDI program 2 75
	//%%MIDI portamento ⟨int⟩: turns on the portamento controller on the current channel and set it to ⟨int⟩. Experts only.
	//%%MIDI randomchordattack: delays the start of chord notes by a random number of MIDI units.
	//%%MIDI ratio n m
	//%%MIDI rtranspose ⟨int1⟩: transposes relatively to a prior %%transpose command by ⟨int1⟩ semitones; the total transposition will be ⟨int1 + int2⟩ semitones.
	//%%MIDI temperament ⟨int1⟩ ⟨int2⟩: TO BE WRITTEN
	//%%MIDI temperamentlinear ⟨float1 float2⟩: changes the temperament of the scale. ⟨fl- oat1⟩ specifies the size of an octave in cents of a semitone, or 1/1200 of an octave. ⟨float2⟩ specifies in the size of a fifth (normally 700 cents).
	//%%MIDI temperamentnormal: restores normal temperament.
	//%%MIDI transpose n
	//%%MIDI voice [<ID>] [instrument=<integer> [bank=<integer>]] [mute]
				break;

			case "playtempo":
			case "auquality":
			case "continuous":
			case "nobarcheck":
				// TODO-PER: Actually handle the parameters of these
				tune.formatting[cmd] = restOfString;
				break;
			default:
				return "Unknown directive: " + cmd;
		}
		return null;
	};
	window.ABCJS.parse.parseDirective.globalFormatting = function(formatHash) {
		for (var cmd in formatHash) {
			if (formatHash.hasOwnProperty(cmd)) {
				var value = ''+formatHash[cmd];
				var tokens = tokenizer.tokenize(value, 0, value.length);
				var scratch;
				switch (cmd) {
					case "titlefont":
					case "gchordfont":
						getChangingFont(cmd, tokens, value);
						break;
					case "scale":
						setScale(cmd, tokens);
						break;
					case "partsbox":
						scratch = addMultilineVarBool('partsBox', cmd, tokens);
						if (scratch !== null) warn(scratch);
						break;
					default:
						warn("Formatting directive unrecognized: ", cmd, 0);
				}
			}
		}
	};
})();
//    abc_parse_header.js: parses a the header fields from a string representing ABC Music Notation into a usable internal structure.
//    Copyright (C) 2010 Paul Rosen (paul at paulrosen dot net)
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.

/*global window */

if (!window.ABCJS)
	window.ABCJS = {};

if (!window.ABCJS.parse)
	window.ABCJS.parse = {};

window.ABCJS.parse.ParseHeader = function(tokenizer, warn, multilineVars, tune) {
	this.reset = function(tokenizer, warn, multilineVars, tune) {
		window.ABCJS.parse.parseKeyVoice.initialize(tokenizer, warn, multilineVars, tune);
		window.ABCJS.parse.parseDirective.initialize(tokenizer, warn, multilineVars, tune);
	};
	this.reset(tokenizer, warn, multilineVars, tune);

	this.setTitle = function(title) {
		if (multilineVars.hasMainTitle)
			tune.addSubtitle(tokenizer.translateString(tokenizer.stripComment(title)));	// display secondary title
		else
		{
			tune.addMetaText("title", tokenizer.translateString(tokenizer.theReverser(tokenizer.stripComment(title))));
			multilineVars.hasMainTitle = true;
		}
	};

	this.setMeter = function(line) {
		line = tokenizer.stripComment(line);
		if (line === 'C') {
			if (multilineVars.havent_set_length === true)
				multilineVars.default_length = 0.125;
			return {type: 'common_time'};
		} else if (line === 'C|') {
			if (multilineVars.havent_set_length === true)
				multilineVars.default_length = 0.125;
			return {type: 'cut_time'};
		} else if (line === 'o') {
			if (multilineVars.havent_set_length === true)
				multilineVars.default_length = 0.125;
			return {type: 'tempus_perfectum'};
		} else if (line === 'c') {
			if (multilineVars.havent_set_length === true)
				multilineVars.default_length = 0.125;
			return {type: 'tempus_imperfectum'};
		} else if (line === 'o.') {
			if (multilineVars.havent_set_length === true)
				multilineVars.default_length = 0.125;
			return {type: 'tempus_perfectum_prolatio'};
		} else if (line === 'c.') {
			if (multilineVars.havent_set_length === true)
				multilineVars.default_length = 0.125;
			return {type: 'tempus_imperfectum_prolatio'};
		} else if (line.length === 0 || line.toLowerCase() === 'none') {
			if (multilineVars.havent_set_length === true)
				multilineVars.default_length = 0.125;
			return null;
		}
		else
		{
			var tokens = tokenizer.tokenize(line, 0, line.length);
			// the form is [open_paren] decimal [ plus|dot decimal ]... [close_paren] slash decimal [plus same_as_before]
			try {
				var parseNum = function() {
					// handles this much: [open_paren] decimal [ plus|dot decimal ]... [close_paren]
					var ret = {value: 0, num: ""};

					var tok = tokens.shift();
					if (tok.token === '(')
						tok = tokens.shift();
					while (1) {
						if (tok.type !== 'number') throw "Expected top number of meter";
						ret.value += parseInt(tok.token);
						ret.num += tok.token;
						if (tokens.length === 0 || tokens[0].token === '/') return ret;
						tok = tokens.shift();
						if (tok.token === ')') {
							if (tokens.length === 0 || tokens[0].token === '/') return ret;
							throw "Unexpected paren in meter";
						}
						if (tok.token !== '.' && tok.token !== '+') throw "Expected top number of meter";
						ret.num += tok.token;
						if (tokens.length === 0) throw "Expected top number of meter";
						tok = tokens.shift();
					}
					return ret;	// just to suppress warning
				};

				var parseFraction = function() {
					// handles this much: parseNum slash decimal
					var ret = parseNum();
					if (tokens.length === 0) return ret;
					var tok = tokens.shift();
					if (tok.token !== '/') throw "Expected slash in meter";
					tok = tokens.shift();
					if (tok.type !== 'number') throw "Expected bottom number of meter";
					ret.den = tok.token;
					ret.value = ret.value / parseInt(ret.den);
					return ret;
				};

				if (tokens.length === 0) throw "Expected meter definition in M: line";
				var meter = {type: 'specified', value: [ ]};
				var totalLength = 0;
				while (1) {
					var ret = parseFraction();
					totalLength += ret.value;
					var mv = { num: ret.num };
					if (ret.den !== undefined)
						mv.den = ret.den;
					meter.value.push(mv);
					if (tokens.length === 0) break;
					//var tok = tokens.shift();
					//if (tok.token !== '+') throw "Extra characters in M: line";
				}

				if (multilineVars.havent_set_length === true) {
					multilineVars.default_length = totalLength < 0.75 ? 0.0625 : 0.125;
				}
				return meter;
			} catch (e) {
				warn(e, line, 0);
			}
		}
		return null;
	};

	this.calcTempo = function(relTempo) {
		var dur = 1/4;
		if (multilineVars.meter && multilineVars.meter.type === 'specified') {
			dur = 1 / parseInt(multilineVars.meter.value[0].den);
		} else if (multilineVars.origMeter && multilineVars.origMeter.type === 'specified') {
			dur = 1 / parseInt(multilineVars.origMeter.value[0].den);
		}
		//var dur = multilineVars.default_length ? multilineVars.default_length : 1;
		for (var i = 0; i < relTempo.duration; i++)
			relTempo.duration[i] = dur * relTempo.duration[i];
		return relTempo;
	};

	this.resolveTempo = function() {
		if (multilineVars.tempo) {	// If there's a tempo waiting to be resolved
			this.calcTempo(multilineVars.tempo);
			tune.metaText.tempo = multilineVars.tempo;
			delete multilineVars.tempo;
		}
	};

	this.addUserDefinition = function(line, start, end) {
		var equals = line.indexOf('=', start);
		if (equals === -1) {
			warn("Need an = in a macro definition", line, start);
			return;
		}

		var before = window.ABCJS.parse.strip(line.substring(start, equals));
		var after = window.ABCJS.parse.strip(line.substring(equals+1));

		if (before.length !== 1) {
			warn("Macro definitions can only be one character", line, start);
			return;
		}
		var legalChars = "HIJKLMNOPQRSTUVWXYhijklmnopqrstuvw~";
		if (legalChars.indexOf(before) === -1) {
			warn("Macro definitions must be H-Y, h-w, or tilde", line, start);
			return;
		}
		if (after.length === 0) {
			warn("Missing macro definition", line, start);
			return;
		}
		if (multilineVars.macros === undefined)
			multilineVars.macros = {};
		multilineVars.macros[before] = after;
	};

	this.setDefaultLength = function(line, start, end) {
		var len = window.ABCJS.parse.gsub(line.substring(start, end), " ", "");
		var len_arr = len.split('/');
		if (len_arr.length === 2) {
			var n = parseInt(len_arr[0]);
			var d = parseInt(len_arr[1]);
			if (d > 0) {
				multilineVars.default_length = n / d;	// a whole note is 1
				multilineVars.havent_set_length = false;
			}
		}
	};

	this.setTempo = function(line, start, end) {
		//Q - tempo; can be used to specify the notes per minute, e.g. If
		//the meter denominator is a 4 note then Q:120 or Q:C=120
		//is 120 quarter notes per minute. Similarly  Q:C3=40 would be 40
		//dotted half notes per minute. An absolute tempo may also be
		//set, e.g. Q:1/8=120 is 120 eighth notes per minute,
		//irrespective of the meter's denominator.
		//
		// This is either a number, "C=number", "Cnumber=number", or fraction [fraction...]=number
		// It depends on the M: field, which may either not be present, or may appear after this.
		// If M: is not present, an eighth note is used.
		// That means that this field can't be calculated until the end, if it is the first three types, since we don't know if we'll see an M: field.
		// So, if it is the fourth type, set it here, otherwise, save the info in the multilineVars.
		// The temporary variables we keep are the duration and the bpm. In the first two forms, the duration is 1.
		// In addition, a quoted string may both precede and follow. If a quoted string is present, then the duration part is optional.
		try {
			var tokens = tokenizer.tokenize(line, start, end);

			if (tokens.length === 0) throw "Missing parameter in Q: field";

			var tempo = {};
			var delaySet = true;
			var token = tokens.shift();
			if (token.type === 'quote') {
				tempo.preString = token.token;
				token = tokens.shift();
				if (tokens.length === 0) {	// It's ok to just get a string for the tempo
					return {type: 'immediate', tempo: tempo};
				}
			}
			if (token.type === 'alpha' && token.token === 'C')	 { // either type 2 or type 3
				if (tokens.length === 0) throw "Missing tempo after C in Q: field";
				token = tokens.shift();
				if (token.type === 'punct' && token.token === '=') {
					// This is a type 2 format. The duration is an implied 1
					if (tokens.length === 0) throw "Missing tempo after = in Q: field";
					token = tokens.shift();
					if (token.type !== 'number') throw "Expected number after = in Q: field";
					tempo.duration = [1];
					tempo.bpm = parseInt(token.token);
				} else if (token.type === 'number') {
					// This is a type 3 format.
					tempo.duration = [parseInt(token.token)];
					if (tokens.length === 0) throw "Missing = after duration in Q: field";
					token = tokens.shift();
					if (token.type !== 'punct' || token.token !== '=') throw "Expected = after duration in Q: field";
					if (tokens.length === 0) throw "Missing tempo after = in Q: field";
					token = tokens.shift();
					if (token.type !== 'number') throw "Expected number after = in Q: field";
					tempo.bpm = parseInt(token.token);
				} else throw "Expected number or equal after C in Q: field";

			} else if (token.type === 'number') {	// either type 1 or type 4
				var num = parseInt(token.token);
				if (tokens.length === 0 || tokens[0].type === 'quote') {
					// This is type 1
					tempo.duration = [1];
					tempo.bpm = num;
				} else {	// This is type 4
					delaySet = false;
					token = tokens.shift();
					if (token.type !== 'punct' && token.token !== '/') throw "Expected fraction in Q: field";
					token = tokens.shift();
					if (token.type !== 'number') throw "Expected fraction in Q: field";
					var den = parseInt(token.token);
					tempo.duration = [num/den];
					// We got the first fraction, keep getting more as long as we find them.
					while (tokens.length > 0  && tokens[0].token !== '=' && tokens[0].type !== 'quote') {
						token = tokens.shift();
						if (token.type !== 'number') throw "Expected fraction in Q: field";
						num = parseInt(token.token);
						token = tokens.shift();
						if (token.type !== 'punct' && token.token !== '/') throw "Expected fraction in Q: field";
						token = tokens.shift();
						if (token.type !== 'number') throw "Expected fraction in Q: field";
						den = parseInt(token.token);
						tempo.duration.push(num/den);
					}
					token = tokens.shift();
					if (token.type !== 'punct' && token.token !== '=') throw "Expected = in Q: field";
					token = tokens.shift();
					if (token.type !== 'number') throw "Expected tempo in Q: field";
					tempo.bpm = parseInt(token.token);
				}
			} else throw "Unknown value in Q: field";
			if (tokens.length !== 0) {
				token = tokens.shift();
				if (token.type === 'quote') {
					tempo.postString = token.token;
					token = tokens.shift();
				}
				if (tokens.length !== 0) throw "Unexpected string at end of Q: field";
			}
			if (multilineVars.printTempo === false)
				tempo.suppress = true;
			return {type: delaySet?'delaySet':'immediate', tempo: tempo};
		} catch (msg) {
			warn(msg, line, start);
			return {type: 'none'};
		}
	};

	this.letter_to_inline_header = function(line, i)
	{
		var ws = tokenizer.eatWhiteSpace(line, i);
		i +=ws;
		if (line.length >= i+5 && line.charAt(i) === '[' && line.charAt(i+2) === ':') {
			var e = line.indexOf(']', i);
			switch(line.substring(i, i+3))
			{
				case "[I:":
					var err = window.ABCJS.parse.parseDirective.addDirective(line.substring(i+3, e));
					if (err) warn(err, line, i);
					return [ e-i+1+ws ];
				case "[M:":
					var meter = this.setMeter(line.substring(i+3, e));
					if (tune.hasBeginMusic() && meter)
						tune.appendStartingElement('meter', -1, -1, meter);
					else
						multilineVars.meter = meter;
					return [ e-i+1+ws ];
				case "[K:":
					var result = window.ABCJS.parse.parseKeyVoice.parseKey(line.substring(i+3, e));
					if (result.foundClef && tune.hasBeginMusic())
						tune.appendStartingElement('clef', -1, -1, multilineVars.clef);
					if (result.foundKey && tune.hasBeginMusic())
						tune.appendStartingElement('key', -1, -1, window.ABCJS.parse.parseKeyVoice.fixKey(multilineVars.clef, multilineVars.key));
					return [ e-i+1+ws ];
				case "[P:":
					tune.appendElement('part', -1, -1, {title: line.substring(i+3, e)});
					return [ e-i+1+ws ];
				case "[L:":
					this.setDefaultLength(line, i+3, e);
					return [ e-i+1+ws ];
				case "[Q:":
					if (e > 0) {
						var tempo = this.setTempo(line, i+3, e);
						if (tempo.type === 'delaySet') tune.appendElement('tempo', -1, -1, this.calcTempo(tempo.tempo));
						else if (tempo.type === 'immediate') tune.appendElement('tempo', -1, -1, tempo.tempo);
						return [ e-i+1+ws, line.charAt(i+1), line.substring(i+3, e)];
					}
					break;
				case "[V:":
					if (e > 0) {
						window.ABCJS.parse.parseKeyVoice.parseVoice(line, i+3, e);
						//startNewLine();
						return [ e-i+1+ws, line.charAt(i+1), line.substring(i+3, e)];
					}
					break;

				default:
					// TODO: complain about unhandled header
			}
		}
		return [ 0 ];
	};

	this.letter_to_body_header = function(line, i)
	{
		if (line.length >= i+3) {
			switch(line.substring(i, i+2))
			{
				case "I:":
					var err = window.ABCJS.parse.parseDirective.addDirective(line.substring(i+2));
					if (err) warn(err, line, i);
					return [ line.length ];
				case "M:":
					var meter = this.setMeter(line.substring(i+2));
					if (tune.hasBeginMusic() && meter)
						tune.appendStartingElement('meter', -1, -1, meter);
					return [ line.length ];
				case "K:":
					var result = window.ABCJS.parse.parseKeyVoice.parseKey(line.substring(i+2));
					if (result.foundClef && tune.hasBeginMusic())
						tune.appendStartingElement('clef', -1, -1, multilineVars.clef);
					if (result.foundKey && tune.hasBeginMusic())
						tune.appendStartingElement('key', -1, -1, window.ABCJS.parse.parseKeyVoice.fixKey(multilineVars.clef, multilineVars.key));
					return [ line.length ];
				case "P:":
					if (tune.hasBeginMusic())
						tune.appendElement('part', -1, -1, {title: line.substring(i+2)});
					return [ line.length ];
				case "L:":
					this.setDefaultLength(line, i+2, line.length);
					return [ line.length ];
				case "Q:":
					var e = line.indexOf('\x12', i+2);
					if (e === -1) e = line.length;
					var tempo = this.setTempo(line, i+2, e);
					if (tempo.type === 'delaySet') tune.appendElement('tempo', -1, -1, this.calcTempo(tempo.tempo));
					else if (tempo.type === 'immediate') tune.appendElement('tempo', -1, -1, tempo.tempo);
				return [ e, line.charAt(i), window.ABCJS.parse.strip(line.substring(i+2))];
				case "V:":
					window.ABCJS.parse.parseKeyVoice.parseVoice(line, 2, line.length);
//						startNewLine();
					return [ line.length, line.charAt(i), window.ABCJS.parse(line.substring(i+2))];
				default:
					// TODO: complain about unhandled header
			}
		}
		return [ 0 ];
	};

	var metaTextHeaders = {
		A: 'author',
		B: 'book',
		C: 'composer',
		D: 'discography',
		F: 'url',
		G: 'group',
		I: 'instruction',
		N: 'notes',
		O: 'origin',
		R: 'rhythm',
		S: 'source',
		W: 'unalignedWords',
		Z: 'transcription'
	};

	this.parseHeader = function(line) {
		if (window.ABCJS.parse.startsWith(line, '%%')) {
			var err = window.ABCJS.parse.parseDirective.addDirective(line.substring(2));
			if (err) warn(err, line, 2);
			return {};
		}
		var i = line.indexOf('%');
		if (i >= 0)
			line = line.substring(0, i);
		line = line.replace(/\s+$/, '');

		if (line.length === 0)
			return {};

		if (line.length >= 2) {
			if (line.charAt(1) === ':') {
				var nextLine = "";
				if (line.indexOf('\x12') >= 0 && line.charAt(0) !== 'w') {	// w: is the only header field that can have a continuation.
					nextLine = line.substring(line.indexOf('\x12')+1);
					line = line.substring(0, line.indexOf('\x12'));	//This handles a continuation mark on a header field
				}
				var field = metaTextHeaders[line.charAt(0)];
				if (field !== undefined) {
					if (field === 'unalignedWords')
						tune.addMetaTextArray(field, window.ABCJS.parse.parseDirective.parseFontChangeLine(tokenizer.translateString(tokenizer.stripComment(line.substring(2)))));
					else
						tune.addMetaText(field, tokenizer.translateString(tokenizer.stripComment(line.substring(2))));
					return {};
				} else {
					switch(line.charAt(0))
					{
						case  'H':
							tune.addMetaText("history", tokenizer.translateString(tokenizer.stripComment(line.substring(2))));
							multilineVars.is_in_history = true;
							break;
						case  'K':
							// since the key is the last thing that can happen in the header, we can resolve the tempo now
							this.resolveTempo();
							var result = window.ABCJS.parse.parseKeyVoice.parseKey(line.substring(2));
							if (!multilineVars.is_in_header && tune.hasBeginMusic()) {
								if (result.foundClef)
									tune.appendStartingElement('clef', -1, -1, multilineVars.clef);
								if (result.foundKey)
									tune.appendStartingElement('key', -1, -1, window.ABCJS.parse.parseKeyVoice.fixKey(multilineVars.clef, multilineVars.key));
							}
							multilineVars.is_in_header = false;	// The first key signifies the end of the header.
							break;
						case  'L':
							this.setDefaultLength(line, 2, line.length);
							break;
						case  'M':
							multilineVars.origMeter = multilineVars.meter = this.setMeter(line.substring(2));
							break;
						case  'P':
							// TODO-PER: There is more to do with parts, but the writer doesn't care.
							if (multilineVars.is_in_header)
								tune.addMetaText("partOrder", tokenizer.translateString(tokenizer.stripComment(line.substring(2))));
							else
								multilineVars.partForNextLine = tokenizer.translateString(tokenizer.stripComment(line.substring(2)));
							break;
						case  'Q':
							var tempo = this.setTempo(line, 2, line.length);
							if (tempo.type === 'delaySet') multilineVars.tempo = tempo.tempo;
							else if (tempo.type === 'immediate') tune.metaText.tempo = tempo.tempo;
							break;
						case  'T':
							this.setTitle(line.substring(2));
							break;
						case 'U':
							this.addUserDefinition(line, 2, line.length);
							break;
						case  'V':
							window.ABCJS.parse.parseKeyVoice.parseVoice(line, 2, line.length);
							if (!multilineVars.is_in_header)
								return {newline: true};
							break;
						case  's':
							return {symbols: true};
						case  'w':
							return {words: true};
						case 'X':
							break;
						case 'E':
						case 'm':
							warn("Ignored header", line, 0);
							break;
						default:
							// It wasn't a recognized header value, so parse it as music.
							if (nextLine.length)
								nextLine = "\x12" + nextLine;
							//parseRegularMusicLine(line+nextLine);
							//nextLine = "";
							return {regular: true, str: line+nextLine};
					}
				}
				if (nextLine.length > 0)
					return {recurse: true, str: nextLine};
				return {};
			}
		}

		// If we got this far, we have a regular line of mulsic
		return {regular: true, str: line};
	};
};
/*global window */

if (!window.ABCJS)
	window.ABCJS = {};

if (!window.ABCJS.parse)
	window.ABCJS.parse = {};

window.ABCJS.parse.parseKeyVoice = {};

(function() {
	var tokenizer;
	var warn;
	var multilineVars;
	var tune;
	window.ABCJS.parse.parseKeyVoice.initialize = function(tokenizer_, warn_, multilineVars_, tune_) {
		tokenizer = tokenizer_;
		warn = warn_;
		multilineVars = multilineVars_;
		tune = tune_;
	};

	window.ABCJS.parse.parseKeyVoice.standardKey = function(keyName) {
		var key1sharp = {acc: 'sharp', note: 'f'};
		var key2sharp = {acc: 'sharp', note: 'c'};
		var key3sharp = {acc: 'sharp', note: 'g'};
		var key4sharp = {acc: 'sharp', note: 'd'};
		var key5sharp = {acc: 'sharp', note: 'A'};
		var key6sharp = {acc: 'sharp', note: 'e'};
		var key7sharp = {acc: 'sharp', note: 'B'};
		var key1flat = {acc: 'flat', note: 'B'};
		var key2flat = {acc: 'flat', note: 'e'};
		var key3flat = {acc: 'flat', note: 'A'};
		var key4flat = {acc: 'flat', note: 'd'};
		var key5flat = {acc: 'flat', note: 'G'};
		var key6flat = {acc: 'flat', note: 'c'};
		var key7flat = {acc: 'flat', note: 'F'};

		var keys = {
			'C#': [ key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp, key7sharp ],
			'A#m': [ key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp, key7sharp ],
			'G#Mix': [ key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp, key7sharp ],
			'D#Dor': [ key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp, key7sharp ],
			'E#Phr': [ key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp, key7sharp ],
			'F#Lyd': [ key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp, key7sharp ],
			'B#Loc': [ key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp, key7sharp ],

			'F#': [ key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp ],
			'D#m': [ key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp ],
			'C#Mix': [ key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp ],
			'G#Dor': [ key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp ],
			'A#Phr': [ key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp ],
			'BLyd': [ key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp ],
			'E#Loc': [ key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp ],

			'B': [ key1sharp, key2sharp, key3sharp, key4sharp, key5sharp ],
			'G#m': [ key1sharp, key2sharp, key3sharp, key4sharp, key5sharp ],
			'F#Mix': [ key1sharp, key2sharp, key3sharp, key4sharp, key5sharp ],
			'C#Dor': [ key1sharp, key2sharp, key3sharp, key4sharp, key5sharp ],
			'D#Phr': [ key1sharp, key2sharp, key3sharp, key4sharp, key5sharp ],
			'ELyd': [ key1sharp, key2sharp, key3sharp, key4sharp, key5sharp ],
			'A#Loc': [ key1sharp, key2sharp, key3sharp, key4sharp, key5sharp ],

			'E': [ key1sharp, key2sharp, key3sharp, key4sharp ],
			'C#m': [ key1sharp, key2sharp, key3sharp, key4sharp ],
			'BMix': [ key1sharp, key2sharp, key3sharp, key4sharp ],
			'F#Dor': [ key1sharp, key2sharp, key3sharp, key4sharp ],
			'G#Phr': [ key1sharp, key2sharp, key3sharp, key4sharp ],
			'ALyd': [ key1sharp, key2sharp, key3sharp, key4sharp ],
			'D#Loc': [ key1sharp, key2sharp, key3sharp, key4sharp ],

			'A': [ key1sharp, key2sharp, key3sharp ],
			'F#m': [ key1sharp, key2sharp, key3sharp ],
			'EMix': [ key1sharp, key2sharp, key3sharp ],
			'BDor': [ key1sharp, key2sharp, key3sharp ],
			'C#Phr': [ key1sharp, key2sharp, key3sharp ],
			'DLyd': [ key1sharp, key2sharp, key3sharp ],
			'G#Loc': [ key1sharp, key2sharp, key3sharp ],

			'D': [ key1sharp, key2sharp ],
			'Bm': [ key1sharp, key2sharp ],
			'AMix': [ key1sharp, key2sharp ],
			'EDor': [ key1sharp, key2sharp ],
			'F#Phr': [ key1sharp, key2sharp ],
			'GLyd': [ key1sharp, key2sharp ],
			'C#Loc': [ key1sharp, key2sharp ],

			'G': [ key1sharp ],
			'Em': [ key1sharp ],
			'DMix': [ key1sharp ],
			'ADor': [ key1sharp ],
			'BPhr': [ key1sharp ],
			'CLyd': [ key1sharp ],
			'F#Loc': [ key1sharp ],

			'C': [],
			'Am': [],
			'GMix': [],
			'DDor': [],
			'EPhr': [],
			'FLyd': [],
			'BLoc': [],

			'F': [ key1flat ],
			'Dm': [ key1flat ],
			'CMix': [ key1flat ],
			'GDor': [ key1flat ],
			'APhr': [ key1flat ],
			'BbLyd': [ key1flat ],
			'ELoc': [ key1flat ],

			'Bb': [ key1flat, key2flat ],
			'Gm': [ key1flat, key2flat ],
			'FMix': [ key1flat, key2flat ],
			'CDor': [ key1flat, key2flat ],
			'DPhr': [ key1flat, key2flat ],
			'EbLyd': [ key1flat, key2flat ],
			'ALoc': [ key1flat, key2flat ],

			'Eb': [ key1flat, key2flat, key3flat ],
			'Cm': [ key1flat, key2flat, key3flat ],
			'BbMix': [ key1flat, key2flat, key3flat ],
			'FDor': [ key1flat, key2flat, key3flat ],
			'GPhr': [ key1flat, key2flat, key3flat ],
			'AbLyd': [ key1flat, key2flat, key3flat ],
			'DLoc': [ key1flat, key2flat, key3flat ],

			'Ab': [ key1flat, key2flat, key3flat, key4flat ],
			'Fm': [ key1flat, key2flat, key3flat, key4flat ],
			'EbMix': [ key1flat, key2flat, key3flat, key4flat ],
			'BbDor': [ key1flat, key2flat, key3flat, key4flat ],
			'CPhr': [ key1flat, key2flat, key3flat, key4flat ],
			'DbLyd': [ key1flat, key2flat, key3flat, key4flat ],
			'GLoc': [ key1flat, key2flat, key3flat, key4flat ],

			'Db': [ key1flat, key2flat, key3flat, key4flat, key5flat ],
			'Bbm': [ key1flat, key2flat, key3flat, key4flat, key5flat ],
			'AbMix': [ key1flat, key2flat, key3flat, key4flat, key5flat ],
			'EbDor': [ key1flat, key2flat, key3flat, key4flat, key5flat ],
			'FPhr': [ key1flat, key2flat, key3flat, key4flat, key5flat ],
			'GbLyd': [ key1flat, key2flat, key3flat, key4flat, key5flat ],
			'CLoc': [ key1flat, key2flat, key3flat, key4flat, key5flat ],

			'Gb': [ key1flat, key2flat, key3flat, key4flat, key5flat, key6flat ],
			'Ebm': [ key1flat, key2flat, key3flat, key4flat, key5flat, key6flat ],
			'DbMix': [ key1flat, key2flat, key3flat, key4flat, key5flat, key6flat ],
			'AbDor': [ key1flat, key2flat, key3flat, key4flat, key5flat, key6flat ],
			'BbPhr': [ key1flat, key2flat, key3flat, key4flat, key5flat, key6flat ],
			'CbLyd': [ key1flat, key2flat, key3flat, key4flat, key5flat, key6flat ],
			'FLoc': [ key1flat, key2flat, key3flat, key4flat, key5flat, key6flat ],

			'Cb': [ key1flat, key2flat, key3flat, key4flat, key5flat, key6flat, key7flat ],
			'Abm': [ key1flat, key2flat, key3flat, key4flat, key5flat, key6flat, key7flat ],
			'GbMix': [ key1flat, key2flat, key3flat, key4flat, key5flat, key6flat, key7flat ],
			'DbDor': [ key1flat, key2flat, key3flat, key4flat, key5flat, key6flat, key7flat ],
			'EbPhr': [ key1flat, key2flat, key3flat, key4flat, key5flat, key6flat, key7flat ],
			'FbLyd': [ key1flat, key2flat, key3flat, key4flat, key5flat, key6flat, key7flat ],
			'BbLoc': [ key1flat, key2flat, key3flat, key4flat, key5flat, key6flat, key7flat ],

			// The following are not in the 2.0 spec, but seem normal enough.
			// TODO-PER: These SOUND the same as what's written, but they aren't right
			'A#': [ key1flat, key2flat ],
			'B#': [],
			'D#': [ key1flat, key2flat, key3flat ],
			'E#': [ key1flat ],
			'G#': [ key1flat, key2flat, key3flat, key4flat ],
			'Gbm': [ key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp, key7sharp ]
		};

		return keys[keyName];
	};

	var clefLines = {
		'treble': { clef: 'treble', pitch: 4, mid: 0 },
		'treble+8': { clef: 'treble+8', pitch: 4, mid: 0 },
		'treble-8': { clef: 'treble-8', pitch: 4, mid: 0 },
		'treble1': { clef: 'treble', pitch: 2, mid: 2 },
		'treble2': { clef: 'treble', pitch: 4, mid: 0 },
		'treble3': { clef: 'treble', pitch: 6, mid: -2 },
		'treble4': { clef: 'treble', pitch: 8, mid: -4 },
		'treble5': { clef: 'treble', pitch: 10, mid: -6 },
		'perc': { clef: 'perc', pitch: 6, mid: 0 },
		'none': { clef: 'none', mid: 0 },
		'bass': { clef: 'bass', pitch: 8, mid: -12 },
		'bass+8': { clef: 'bass+8', pitch: 8, mid: -12 },
		'bass-8': { clef: 'bass-8', pitch: 8, mid: -12 },
		'bass+16': { clef: 'bass', pitch: 8, mid: -12 },
		'bass-16': { clef: 'bass', pitch: 8, mid: -12 },
		'bass1': { clef: 'bass', pitch: 2, mid: -6 },
		'bass2': { clef: 'bass', pitch: 4, mid: -8 },
		'bass3': { clef: 'bass', pitch: 6, mid: -10 },
		'bass4': { clef: 'bass', pitch: 8, mid: -12 },
		'bass5': { clef: 'bass', pitch: 10, mid: -14 },
		'tenor': { clef: 'alto', pitch: 8, mid: -8 },
		'tenor1': { clef: 'alto', pitch: 2, mid: -2 },
		'tenor2': { clef: 'alto', pitch: 4, mid: -4 },
		'tenor3': { clef: 'alto', pitch: 6, mid: -6 },
		'tenor4': { clef: 'alto', pitch: 8, mid: -8 },
		'tenor5': { clef: 'alto', pitch: 10, mid: -10 },
		'alto': { clef: 'alto', pitch: 6, mid: -6 },
		'alto1': { clef: 'alto', pitch: 2, mid: -2 },
		'alto2': { clef: 'alto', pitch: 4, mid: -4 },
		'alto3': { clef: 'alto', pitch: 6, mid: -6 },
		'alto4': { clef: 'alto', pitch: 8, mid: -8 },
		'alto5': { clef: 'alto', pitch: 10, mid: -10 },
		'alto+8': { clef: 'alto+8', pitch: 6, mid: -6 },
		'alto-8': { clef: 'alto-8', pitch: 6, mid: -6 }
	};

	var calcMiddle = function(clef, oct) {
		var value = clefLines[clef];
		var mid = value ? value.mid : 0;
		return mid+oct;
	};

	window.ABCJS.parse.parseKeyVoice.fixClef = function(clef) {
		var value = clefLines[clef.type];
		if (value) {
			clef.clefPos = value.pitch;
			clef.type = value.clef;
		}
	};

	window.ABCJS.parse.parseKeyVoice.deepCopyKey = function(key) {
		var ret = { accidentals: [], root: key.root, acc: key.acc, mode: key.mode };
		window.ABCJS.parse.each(key.accidentals, function(k) {
		ret.accidentals.push(window.ABCJS.parse.clone(k));
		});
		return ret;
	};

	var pitches = {A: 5, B: 6, C: 0, D: 1, E: 2, F: 3, G: 4, a: 12, b: 13, c: 7, d: 8, e: 9, f: 10, g: 11};

	window.ABCJS.parse.parseKeyVoice.addPosToKey = function(clef, key) {
		// Shift the key signature from the treble positions to whatever position is needed for the clef.
		// This may put the key signature unnaturally high or low, so if it does, then shift it.
		var mid = clef.verticalPos;
		window.ABCJS.parse.each(key.accidentals, function(acc) {
			var pitch = pitches[acc.note];
			pitch = pitch - mid;
			acc.verticalPos = pitch;
		});
		if (key.impliedNaturals)
			window.ABCJS.parse.each(key.impliedNaturals, function(acc) {
				var pitch = pitches[acc.note];
				pitch = pitch - mid;
				acc.verticalPos = pitch;
			});

		if (mid < -10) {
			window.ABCJS.parse.each(key.accidentals, function(acc) {
				acc.verticalPos -= 7;
				if (acc.verticalPos >= 11 || (acc.verticalPos === 10 && acc.acc === 'flat'))
					acc.verticalPos -= 7;
				if (acc.note === 'A' && acc.acc === 'sharp' )
					acc.verticalPos -=7;
				if ((acc.note === 'G' || acc.note === 'F') && acc.acc === 'flat' )
					acc.verticalPos -=7;
			});
			if (key.impliedNaturals)
				window.ABCJS.parse.each(key.impliedNaturals, function(acc) {
					acc.verticalPos -= 7;
					if (acc.verticalPos >= 11 || (acc.verticalPos === 10 && acc.acc === 'flat'))
						acc.verticalPos -= 7;
					if (acc.note === 'A' && acc.acc === 'sharp' )
						acc.verticalPos -=7;
					if ((acc.note === 'G' || acc.note === 'F') && acc.acc === 'flat' )
						acc.verticalPos -=7;
				});
		} else if (mid < -4) {
			window.ABCJS.parse.each(key.accidentals, function(acc) {
				acc.verticalPos -= 7;
				if (mid === -8 && (acc.note === 'f' || acc.note === 'g') && acc.acc === 'sharp' )
					acc.verticalPos -=7;
			});
			if (key.impliedNaturals)
				window.ABCJS.parse.each(key.impliedNaturals, function(acc) {
					acc.verticalPos -= 7;
					if (mid === -8 && (acc.note === 'f' || acc.note === 'g') && acc.acc === 'sharp' )
						acc.verticalPos -=7;
				});
		} else if (mid >= 7) {
			window.ABCJS.parse.each(key.accidentals, function(acc) {
				acc.verticalPos += 7;
			});
			if (key.impliedNaturals)
				window.ABCJS.parse.each(key.impliedNaturals, function(acc) {
					acc.verticalPos += 7;
				});
		}
	};

	window.ABCJS.parse.parseKeyVoice.fixKey = function(clef, key) {
		var fixedKey = window.ABCJS.parse.clone(key);
		window.ABCJS.parse.parseKeyVoice.addPosToKey(clef, fixedKey);
		return fixedKey;
	};

	var parseMiddle = function(str) {
	  var mid = pitches[str.charAt(0)];
		for (var i = 1; i < str.length; i++) {
			if (str.charAt(i) === ',') mid -= 7;
			else if (str.charAt(i) === ',') mid += 7;
			else break;
		}
		return { mid: mid - 6, str: str.substring(i) };	// We get the note in the middle of the staff. We want the note that appears as the first ledger line below the staff.
	};

	var normalizeAccidentals = function(accs) {
		for (var i = 0; i < accs.length; i++) {
			if (accs[i].note === 'b')
				accs[i].note = 'B';
			else if (accs[i].note === 'a')
				accs[i].note = 'A';
			else if (accs[i].note === 'F')
				accs[i].note = 'f';
			else if (accs[i].note === 'E')
				accs[i].note = 'e';
			else if (accs[i].note === 'D')
				accs[i].note = 'd';
			else if (accs[i].note === 'C')
				accs[i].note = 'c';
			else if (accs[i].note === 'G' && accs[i].acc === 'sharp')
				accs[i].note = 'g';
			else if (accs[i].note === 'g' && accs[i].acc === 'flat')
				accs[i].note = 'G';
		}
	};

	window.ABCJS.parse.parseKeyVoice.parseKey = function(str)	// (and clef)
	{
		// returns:
		//		{ foundClef: true, foundKey: true }
		// Side effects:
		//		calls warn() when there is a syntax error
		//		sets these members of multilineVars:
		//			clef
		//			key
		//			style
		//
		// The format is:
		// K: [⟨key⟩] [⟨modifiers⟩*]
		// modifiers are any of the following in any order:
		//  [⟨clef⟩] [middle=⟨pitch⟩] [transpose=[-]⟨number⟩] [stafflines=⟨number⟩] [staffscale=⟨number⟩][style=⟨style⟩]
		// key is none|HP|Hp|⟨specified_key⟩
		// clef is [clef=] [⟨clef type⟩] [⟨line number⟩] [+8|-8]
		// specified_key is ⟨pitch⟩[#|b][mode(first three chars are significant)][accidentals*]
		if (str.length === 0) {
			// an empty K: field is the same as K:none
			str = 'none';
		}
		var tokens = tokenizer.tokenize(str, 0, str.length);
		var ret = {};

		// first the key
		switch (tokens[0].token) {
			case 'HP':
				window.ABCJS.parse.parseDirective.addDirective("bagpipes");
				multilineVars.key = { root: "HP", accidentals: [], acc: "", mode: "" };
				ret.foundKey = true;
				tokens.shift();
				break;
			case 'Hp':
				window.ABCJS.parse.parseDirective.addDirective("bagpipes");
				multilineVars.key = { root: "Hp", accidentals: [{acc: 'natural', note: 'g'}, {acc: 'sharp', note: 'f'}, {acc: 'sharp', note: 'c'}], acc: "", mode: "" };
				ret.foundKey = true;
				tokens.shift();
				break;
			case 'none':
				// we got the none key - that's the same as C to us
				multilineVars.key = { root: "none", accidentals: [], acc: "", mode: "" };
				ret.foundKey = true;
				tokens.shift();
				break;
			default:
				var retPitch = tokenizer.getKeyPitch(tokens[0].token);
				if (retPitch.len > 0) {
					ret.foundKey = true;
					var acc = "";
					var mode = "";
					// The accidental and mode might be attached to the pitch, so we might want to just remove the first character.
					if (tokens[0].token.length > 1)
						tokens[0].token = tokens[0].token.substring(1);
					else
						tokens.shift();
					var key = retPitch.token;
					// We got a pitch to start with, so we might also have an accidental and a mode
					if (tokens.length > 0) {
						var retAcc = tokenizer.getSharpFlat(tokens[0].token);
						if (retAcc.len > 0) {
							if (tokens[0].token.length > 1)
								tokens[0].token = tokens[0].token.substring(1);
							else
								tokens.shift();
							key += retAcc.token;
							acc = retAcc.token;
						}
						if (tokens.length > 0) {
							var retMode = tokenizer.getMode(tokens[0].token);
							if (retMode.len > 0) {
								tokens.shift();
								key += retMode.token;
								mode = retMode.token;
							}
						}
					}
					// We need to do a deep copy because we are going to modify it
					var oldKey = window.ABCJS.parse.parseKeyVoice.deepCopyKey(multilineVars.key);
					multilineVars.key = window.ABCJS.parse.parseKeyVoice.deepCopyKey({accidentals: window.ABCJS.parse.parseKeyVoice.standardKey(key)});
					multilineVars.key.root = retPitch.token;
					multilineVars.key.acc = acc;
					multilineVars.key.mode = mode;
					if (oldKey) {
						// Add natural in all places that the old key had an accidental.
						var kk;
						for (var k = 0; k < multilineVars.key.accidentals.length; k++) {
							for (kk = 0; kk < oldKey.accidentals.length; kk++) {
								if (oldKey.accidentals[kk].note && multilineVars.key.accidentals[k].note.toLowerCase() === oldKey.accidentals[kk].note.toLowerCase())
									oldKey.accidentals[kk].note = null;
							}
						}
						for (kk = 0; kk < oldKey.accidentals.length; kk++) {
							if (oldKey.accidentals[kk].note) {
								if (!multilineVars.key.impliedNaturals)
									multilineVars.key.impliedNaturals = [];
								multilineVars.key.impliedNaturals.push({ acc: 'natural', note: oldKey.accidentals[kk].note });
							}
						}
					}
				}
				break;
		}

		// There are two special cases of deprecated syntax. Ignore them if they occur
		if (tokens.length === 0) return ret;
		if (tokens[0].token === 'exp') tokens.shift();
		if (tokens.length === 0) return ret;
		if (tokens[0].token === 'oct') tokens.shift();

		// now see if there are extra accidentals
		if (tokens.length === 0) return ret;
		var accs = tokenizer.getKeyAccidentals2(tokens);
		if (accs.warn)
			warn(accs.warn, str, 0);
		// If we have extra accidentals, first replace ones that are of the same pitch before adding them to the end.
		if (accs.accs) {
			if (!ret.foundKey) {		// if there are only extra accidentals, make sure this is set.
				ret.foundKey = true;
				multilineVars.key = { root: "none", acc: "", mode: "", accidentals: [] };
			}
			normalizeAccidentals(accs.accs);
			for (var i = 0; i < accs.accs.length; i++) {
				var found = false;
				for (var j = 0; j < multilineVars.key.accidentals.length && !found; j++) {
					if (multilineVars.key.accidentals[j].note === accs.accs[i].note) {
						found = true;
						multilineVars.key.accidentals[j].acc = accs.accs[i].acc;
					}
				}
				if (!found) {
					multilineVars.key.accidentals.push(accs.accs[i]);
					if (multilineVars.key.impliedNaturals) {
						for (var kkk = 0; kkk < multilineVars.key.impliedNaturals.length; kkk++) {
							if (multilineVars.key.impliedNaturals[kkk].note === accs.accs[i].note)
								multilineVars.key.impliedNaturals.splice(kkk, 1);
						}
					}
				}
			}
		}

		// Now see if any optional parameters are present. They have the form "key=value", except that "clef=" is optional
		var token;
		while (tokens.length > 0) {
			switch (tokens[0].token) {
				case "m":
				case "middle":
					tokens.shift();
					if (tokens.length === 0) { warn("Expected = after middle", str, 0); return ret; }
					token = tokens.shift();
					if (token.token !== "=") { warn("Expected = after middle", str, token.start); break; }
					if (tokens.length === 0) { warn("Expected parameter after middle=", str, 0); return ret; }
					var pitch = tokenizer.getPitchFromTokens(tokens);
					if (pitch.warn)
						warn(pitch.warn, str, 0);
					if (pitch.position)
						multilineVars.clef.verticalPos = pitch.position - 6;	// we get the position from the middle line, but want to offset it to the first ledger line.
					break;
				case "transpose":
					tokens.shift();
					if (tokens.length === 0) { warn("Expected = after transpose", str, 0); return ret; }
					token = tokens.shift();
					if (token.token !== "=") { warn("Expected = after transpose", str, token.start); break; }
					if (tokens.length === 0) { warn("Expected parameter after transpose=", str, 0); return ret; }
					if (tokens[0].type !== 'number') { warn("Expected number after transpose", str, tokens[0].start); break; }
					multilineVars.clef.transpose = tokens[0].intt;
					tokens.shift();
					break;
				case "stafflines":
					tokens.shift();
					if (tokens.length === 0) { warn("Expected = after stafflines", str, 0); return ret; }
					token = tokens.shift();
					if (token.token !== "=") { warn("Expected = after stafflines", str, token.start); break; }
					if (tokens.length === 0) { warn("Expected parameter after stafflines=", str, 0); return ret; }
					if (tokens[0].type !== 'number') { warn("Expected number after stafflines", str, tokens[0].start); break; }
					multilineVars.clef.stafflines = tokens[0].intt;
					tokens.shift();
					break;
				case "staffscale":
					tokens.shift();
					if (tokens.length === 0) { warn("Expected = after staffscale", str, 0); return ret; }
					token = tokens.shift();
					if (token.token !== "=") { warn("Expected = after staffscale", str, token.start); break; }
					if (tokens.length === 0) { warn("Expected parameter after staffscale=", str, 0); return ret; }
					if (tokens[0].type !== 'number') { warn("Expected number after staffscale", str, tokens[0].start); break; }
					multilineVars.clef.staffscale = tokens[0].floatt;
					tokens.shift();
					break;
				case "style":
					tokens.shift();
					if (tokens.length === 0) { warn("Expected = after style", str, 0); return ret; }
					token = tokens.shift();
					if (token.token !== "=") { warn("Expected = after style", str, token.start); break; }
					if (tokens.length === 0) { warn("Expected parameter after style=", str, 0); return ret; }
					switch (tokens[0].token) {
						case "normal":
						case "harmonic":
						case "rhythm":
						case "x":
							multilineVars.style = tokens[0].token;
							tokens.shift();
							break;
						default:
							warn("error parsing style element: " + tokens[0].token, str, tokens[0].start);
							break;
					}
					break;
				case "clef":
					tokens.shift();
					if (tokens.length === 0) { warn("Expected = after clef", str, 0); return ret; }
					token = tokens.shift();
					if (token.token !== "=") { warn("Expected = after clef", str, token.start); break; }
					if (tokens.length === 0) { warn("Expected parameter after clef=", str, 0); return ret; }
					//break; yes, we want to fall through. That allows "clef=" to be optional.
				case "treble":
				case "bass":
				case "alto":
				case "tenor":
				case "perc":
					// clef is [clef=] [⟨clef type⟩] [⟨line number⟩] [+8|-8]
					var clef = tokens.shift();
					switch (clef.token) {
						case 'treble':
						case 'tenor':
						case 'alto':
						case 'bass':
						case 'perc':
						case 'none':
							break;
						case 'C': clef.token = 'alto'; break;
						case 'F': clef.token = 'bass'; break;
						case 'G': clef.token = 'treble'; break;
						case 'c': clef.token = 'alto'; break;
						case 'f': clef.token = 'bass'; break;
						case 'g': clef.token = 'treble'; break;
						default:
							warn("Expected clef name. Found " + clef.token, str, clef.start);
							break;
					}
					if (tokens.length > 0 && tokens[0].type === 'number') {
						clef.token += tokens[0].token;
						tokens.shift();
					}
					if (tokens.length > 1 && (tokens[0].token === '-' || tokens[0].token === '+') && tokens[1].token === '8') {
						clef.token += tokens[0].token + tokens[1].token;
						tokens.shift();
						tokens.shift();
					}
					multilineVars.clef = {type: clef.token, verticalPos: calcMiddle(clef.token, 0)};
					ret.foundClef = true;
					break;
				default:
					warn("Unknown parameter: " + tokens[0].token, str, tokens[0].start);
					tokens.shift();
			}
		}
		return ret;
	};

	var setCurrentVoice = function(id) {
		multilineVars.currentVoice = multilineVars.voices[id];
		tune.setCurrentVoice(multilineVars.currentVoice.staffNum, multilineVars.currentVoice.index);
	};

	window.ABCJS.parse.parseKeyVoice.parseVoice = function(line, i, e) {
		//First truncate the string to the first non-space character after V: through either the
		//end of the line or a % character. Then remove trailing spaces, too.
		var ret = tokenizer.getMeat(line, i, e);
		var start = ret.start;
		var end = ret.end;
		//The first thing on the line is the ID. It can be any non-space string and terminates at the
		//first space.
		var id = tokenizer.getToken(line, start, end);
		if (id.length === 0) {
			warn("Expected a voice id", line, start);
			return;
		}
		var isNew = false;
		if (multilineVars.voices[id] === undefined) {
			multilineVars.voices[id] = {};
			isNew = true;
			if (multilineVars.score_is_present)
				warn("Can't have an unknown V: id when the %score directive is present", line, start);
		}
		start += id.length;
		start += tokenizer.eatWhiteSpace(line, start);

		var staffInfo = {startStaff: isNew};
		var addNextTokenToStaffInfo = function(name) {
			var attr = tokenizer.getVoiceToken(line, start, end);
			if (attr.warn !== undefined)
				warn("Expected value for " + name + " in voice: " + attr.warn, line, start);
			else if (attr.token.length === 0 && line.charAt(start) !== '"')
				warn("Expected value for " + name + " in voice", line, start);
			else
				staffInfo[name] = attr.token;
			start += attr.len;
		};
		var addNextTokenToVoiceInfo = function(id, name, type) {
			var attr = tokenizer.getVoiceToken(line, start, end);
			if (attr.warn !== undefined)
				warn("Expected value for " + name + " in voice: " + attr.warn, line, start);
			else if (attr.token.length === 0 && line.charAt(start) !== '"')
				warn("Expected value for " + name + " in voice", line, start);
			else {
				if (type === 'number')
					attr.token = parseFloat(attr.token);
				multilineVars.voices[id][name] = attr.token;
			}
			start += attr.len;
		};

		//Then the following items can occur in any order:
		while (start < end) {
			var token = tokenizer.getVoiceToken(line, start, end);
			start += token.len;

			if (token.warn) {
				warn("Error parsing voice: " + token.warn, line, start);
			} else {
				var attr = null;
				switch (token.token) {
					case 'clef':
					case 'cl':
						addNextTokenToStaffInfo('clef');
						// TODO-PER: check for a legal clef; do octavizing
						var oct = 0;
	//							for (var ii = 0; ii < staffInfo.clef.length; ii++) {
	//								if (staffInfo.clef[ii] === ',') oct -= 7;
	//								else if (staffInfo.clef[ii] === "'") oct += 7;
	//							}
						if (staffInfo.clef !== undefined) {
						  staffInfo.clef = staffInfo.clef.replace(/[',]/g, ""); //'//comment for emacs formatting of regexp
							if (staffInfo.clef.indexOf('+16') !== -1) {
								oct += 14;
								staffInfo.clef = staffInfo.clef.replace('+16', '');
							}
							staffInfo.verticalPos = calcMiddle(staffInfo.clef, oct);
						}
						break;
					case 'treble':
					case 'bass':
					case 'tenor':
					case 'alto':
					case 'none':
					case 'treble\'':
					case 'bass\'':
					case 'tenor\'':
					case 'alto\'':
					case 'none\'':
					case 'treble\'\'':
					case 'bass\'\'':
					case 'tenor\'\'':
					case 'alto\'\'':
					case 'none\'\'':
					case 'treble,':
					case 'bass,':
					case 'tenor,':
					case 'alto,':
					case 'none,':
					case 'treble,,':
					case 'bass,,':
					case 'tenor,,':
					case 'alto,,':
					case 'none,,':
						// TODO-PER: handle the octave indicators on the clef by changing the middle property
						var oct2 = 0;
	//							for (var iii = 0; iii < token.token.length; iii++) {
	//								if (token.token[iii] === ',') oct2 -= 7;
	//								else if (token.token[iii] === "'") oct2 += 7;
	//							}
											  staffInfo.clef = token.token.replace(/[',]/g, ""); //'//comment for emacs formatting of regexp
						staffInfo.verticalPos = calcMiddle(staffInfo.clef, oct2);
						break;
					case 'staves':
					case 'stave':
					case 'stv':
						addNextTokenToStaffInfo('staves');
						break;
					case 'brace':
					case 'brc':
						addNextTokenToStaffInfo('brace');
						break;
					case 'bracket':
					case 'brk':
						addNextTokenToStaffInfo('bracket');
						break;
					case 'name':
					case 'nm':
						addNextTokenToStaffInfo('name');
						break;
					case 'subname':
					case 'sname':
					case 'snm':
						addNextTokenToStaffInfo('subname');
						break;
					case 'merge':
						staffInfo.startStaff = false;
						break;
					case 'stems':
						attr = tokenizer.getVoiceToken(line, start, end);
						if (attr.warn !== undefined)
							warn("Expected value for stems in voice: " + attr.warn, line, start);
						else if (attr.token === 'up' || attr.token === 'down')
							multilineVars.voices[id].stem = attr.token;
						else
							warn("Expected up or down for voice stem", line, start);
						start += attr.len;
						break;
					case 'up':
					case 'down':
						multilineVars.voices[id].stem = token.token;
						break;
					case 'middle':
					case 'm':
						addNextTokenToStaffInfo('verticalPos');
						staffInfo.verticalPos = parseMiddle(staffInfo.verticalPos).mid;
						break;
					case 'gchords':
					case 'gch':
						multilineVars.voices[id].suppressChords = true;
						break;
					case 'space':
					case 'spc':
						addNextTokenToStaffInfo('spacing');
						break;
					case 'scale':
						addNextTokenToVoiceInfo(id, 'scale', 'number');
						break;
					case 'transpose':
						addNextTokenToVoiceInfo(id, 'transpose', 'number');
						break;
				}
			}
			start += tokenizer.eatWhiteSpace(line, start);
		}

		// now we've filled up staffInfo, figure out what to do with this voice
		// TODO-PER: It is unclear from the standard and the examples what to do with brace, bracket, and staves, so they are ignored for now.
		if (staffInfo.startStaff || multilineVars.staves.length === 0) {
			multilineVars.staves.push({index: multilineVars.staves.length, meter: multilineVars.origMeter});
			if (!multilineVars.score_is_present)
				multilineVars.staves[multilineVars.staves.length-1].numVoices = 0;
		}
		if (multilineVars.voices[id].staffNum === undefined) {
			// store where to write this for quick access later.
			multilineVars.voices[id].staffNum = multilineVars.staves.length-1;
			var vi = 0;
			for(var v in multilineVars.voices) {
				if(multilineVars.voices.hasOwnProperty(v)) {
					if (multilineVars.voices[v].staffNum === multilineVars.voices[id].staffNum)
						vi++;
				}
			}
			multilineVars.voices[id].index = vi-1;
		}
		var s = multilineVars.staves[multilineVars.voices[id].staffNum];
		if (!multilineVars.score_is_present)
			s.numVoices++;
		if (staffInfo.clef) s.clef = {type: staffInfo.clef, verticalPos: staffInfo.verticalPos};
		if (staffInfo.spacing) s.spacing_below_offset = staffInfo.spacing;
		if (staffInfo.verticalPos) s.verticalPos = staffInfo.verticalPos;

		if (staffInfo.name) {if (s.name) s.name.push(staffInfo.name); else s.name = [ staffInfo.name ];}
		if (staffInfo.subname) {if (s.subname) s.subname.push(staffInfo.subname); else s.subname = [ staffInfo.subname ];}

		setCurrentVoice(id);
	};

})();

//    abc_tokenizer.js: tokenizes an ABC Music Notation string to support abc_parse.
//    Copyright (C) 2010 Paul Rosen (paul at paulrosen dot net)
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.

/*global window */

if (!window.ABCJS)
	window.ABCJS = {};

if (!window.ABCJS.parse)
	window.ABCJS.parse = {};

// this is a series of functions that get a particular element out of the passed stream.
// the return is the number of characters consumed, so 0 means that the element wasn't found.
// also returned is the element found. This may be a different length because spaces may be consumed that aren't part of the string.
// The return structure for most calls is { len: num_chars_consumed, token: str }
window.ABCJS.parse.tokenizer = function() {
	this.skipWhiteSpace = function(str) {
		for (var i = 0; i < str.length; i++) {
		  if (!this.isWhiteSpace(str.charAt(i)))
				return i;
		}
		return str.length;	// It must have been all white space
	};
	var finished = function(str, i) {
		return i >= str.length;
	};
	this.eatWhiteSpace = function(line, index) {
		for (var i = index; i < line.length; i++) {
		  if (!this.isWhiteSpace(line.charAt(i)))
				return i-index;
		}
		return i-index;
	};

	// This just gets the basic pitch letter, ignoring leading spaces, and normalizing it to a capital
	this.getKeyPitch = function(str) {
		var i = this.skipWhiteSpace(str);
		if (finished(str, i))
			return {len: 0};
		switch (str.charAt(i)) {
			case 'A':return {len: i+1, token: 'A'};
			case 'B':return {len: i+1, token: 'B'};
			case 'C':return {len: i+1, token: 'C'};
			case 'D':return {len: i+1, token: 'D'};
			case 'E':return {len: i+1, token: 'E'};
			case 'F':return {len: i+1, token: 'F'};
			case 'G':return {len: i+1, token: 'G'};
//			case 'a':return {len: i+1, token: 'A'};
//			case 'b':return {len: i+1, token: 'B'};
//			case 'c':return {len: i+1, token: 'C'};
//			case 'd':return {len: i+1, token: 'D'};
//			case 'e':return {len: i+1, token: 'E'};
//			case 'f':return {len: i+1, token: 'F'};
//			case 'g':return {len: i+1, token: 'G'};
		}
		return {len: 0};
	};

	// This just gets the basic accidental, ignoring leading spaces, and only the ones that appear in a key
	this.getSharpFlat = function(str) {
		if (str === 'bass')
			return {len: 0};
		switch (str.charAt(0)) {
			case '#':return {len: 1, token: '#'};
			case 'b':return {len: 1, token: 'b'};
		}
		return {len: 0};
	};

	this.getMode = function(str) {
		var skipAlpha = function(str, start) {
			// This returns the index of the next non-alphabetic char, or the entire length of the string if not found.
		  while (start < str.length && ((str.charAt(start) >= 'a' && str.charAt(start) <= 'z') || (str.charAt(start) >= 'A' && str.charAt(start) <= 'Z')))
				start++;
			return start;
		};

		var i = this.skipWhiteSpace(str);
		if (finished(str, i))
			return {len: 0};
		var firstThree = str.substring(i,i+3).toLowerCase();
		if (firstThree.length > 1 && firstThree.charAt(1) === ' ' || firstThree.charAt(1) === '^' || firstThree.charAt(1) === '_' || firstThree.charAt(1) === '=') firstThree = firstThree.charAt(0);	// This will handle the case of 'm'
		switch (firstThree) {
			case 'mix':return {len: skipAlpha(str, i), token: 'Mix'};
			case 'dor':return {len: skipAlpha(str, i), token: 'Dor'};
			case 'phr':return {len: skipAlpha(str, i), token: 'Phr'};
			case 'lyd':return {len: skipAlpha(str, i), token: 'Lyd'};
			case 'loc':return {len: skipAlpha(str, i), token: 'Loc'};
			case 'aeo':return {len: skipAlpha(str, i), token: 'm'};
			case 'maj':return {len: skipAlpha(str, i), token: ''};
			case 'ion':return {len: skipAlpha(str, i), token: ''};
			case 'min':return {len: skipAlpha(str, i), token: 'm'};
			case 'm':return {len: skipAlpha(str, i), token: 'm'};
		}
		return {len: 0};
	};

	this.getClef = function(str, bExplicitOnly) {
		var strOrig = str;
		var i = this.skipWhiteSpace(str);
		if (finished(str, i))
			return {len: 0};
		// The word 'clef' is optional, but if it appears, a clef MUST appear
		var needsClef = false;
		var strClef = str.substring(i);
		if (window.ABCJS.parse.startsWith(strClef, 'clef=')) {
			needsClef = true;
			strClef = strClef.substring(5);
			i += 5;
		}
		if (strClef.length === 0 && needsClef)
			return {len: i+5, warn: "No clef specified: " + strOrig};

		var j = this.skipWhiteSpace(strClef);
		if (finished(strClef, j))
			return {len: 0};
		if (j > 0) {
			i += j;
			strClef = strClef.substring(j);
		}
		var name = null;
		if (window.ABCJS.parse.startsWith(strClef, 'treble'))
			name = 'treble';
		else if (window.ABCJS.parse.startsWith(strClef, 'bass3'))
			name = 'bass3';
		else if (window.ABCJS.parse.startsWith(strClef, 'bass'))
			name = 'bass';
		else if (window.ABCJS.parse.startsWith(strClef, 'tenor'))
			name = 'tenor';
		else if (window.ABCJS.parse.startsWith(strClef, 'alto2'))
			name = 'alto2';
		else if (window.ABCJS.parse.startsWith(strClef, 'alto1'))
			name = 'alto1';
		else if (window.ABCJS.parse.startsWith(strClef, 'alto'))
			name = 'alto';
		else if (!bExplicitOnly && (needsClef && window.ABCJS.parse.startsWith(strClef, 'none')))
			name = 'none';
		else if (window.ABCJS.parse.startsWith(strClef, 'perc'))
			name = 'perc';
		else if (!bExplicitOnly && (needsClef && window.ABCJS.parse.startsWith(strClef, 'C')))
			name = 'tenor';
		else if (!bExplicitOnly && (needsClef && window.ABCJS.parse.startsWith(strClef, 'F')))
			name = 'bass';
		else if (!bExplicitOnly && (needsClef && window.ABCJS.parse.startsWith(strClef, 'G')))
			name = 'treble';
		else
			return {len: i+5, warn: "Unknown clef specified: " + strOrig};

		strClef = strClef.substring(name.length);
		j = this.isMatch(strClef, '+8');
		if (j > 0)
			name += "+8";
		else {
			j = this.isMatch(strClef, '-8');
			if (j > 0)
				name += "-8";
		}
		return {len: i+name.length, token: name, explicit: needsClef};
	};

	// This returns one of the legal bar lines
	// This is called alot and there is no obvious tokenable items, so this is broken apart.
	this.getBarLine = function(line, i) {
		switch (line.charAt(i)) {
			case ']':
				++i;
				switch (line.charAt(i)) {
					case '|': return {len: 2, token: "bar_thick_thin"};
					case '[':
						++i;
						if ((line.charAt(i) >= '1' && line.charAt(i) <= '9') || line.charAt(i) === '"')
							return {len: 2, token: "bar_invisible"};
						return {len: 1, warn: "Unknown bar symbol"};
					default:
						return {len: 1, token: "bar_invisible"};
				}
				break;
			case ':':
				++i;
				switch (line.charAt(i)) {
					case ':': return {len: 2, token: "bar_dbl_repeat"};
					case '|':	// :|
						++i;
						switch (line.charAt(i)) {
							case ']':	// :|]
								++i;
								switch (line.charAt(i)) {
									case '|':	// :|]|
										++i;
										if (line.charAt(i) === ':')  return {len: 5, token: "bar_dbl_repeat"};
										return {len: 3, token: "bar_right_repeat"};
									default:
										return {len: 3, token: "bar_right_repeat"};
								}
								break;
							case '|':	// :||
								++i;
								if (line.charAt(i) === ':')  return {len: 4, token: "bar_dbl_repeat"};
								return {len: 3, token: "bar_right_repeat"};
							default:
								return {len: 2, token: "bar_right_repeat"};
						}
						break;
					default:
						return {len: 1, warn: "Unknown bar symbol"};
				}
				break;
			case '[':	// [
				++i;
				if (line.charAt(i) === '|') {	// [|
					++i;
					switch (line.charAt(i)) {
						case ':': return {len: 3, token: "bar_left_repeat"};
						case ']': return {len: 3, token: "bar_invisible"};
						default: return {len: 2, token: "bar_thick_thin"};
					}
				} else {
					if ((line.charAt(i) >= '1' && line.charAt(i) <= '9') || line.charAt(i) === '"')
						return {len: 1, token: "bar_invisible"};
					return {len: 0};
				}
				break;
			case '|':	// |
				++i;
				switch (line.charAt(i)) {
					case ']': return {len: 2, token: "bar_thin_thick"};
					case '|': // ||
						++i;
						if (line.charAt(i) === ':') return {len: 3, token: "bar_left_repeat"};
						return {len: 2, token: "bar_thin_thin"};
					case ':':	// |:
						var colons = 0;
						while (line.charAt(i+colons) === ':') colons++;
						return { len: 1+colons, token: "bar_left_repeat"};
					default: return {len: 1, token: "bar_thin"};
				}
				break;
		}
		return {len: 0};
	};

	// this returns all the characters in the string that match one of the characters in the legalChars string
	this.getTokenOf = function(str, legalChars) {
		for (var i = 0; i < str.length; i++) {
			if (legalChars.indexOf(str.charAt(i)) < 0)
				return {len: i, token: str.substring(0, i)};
		}
		return {len: i, token: str};
	};

	this.getToken = function(str, start, end) {
		// This returns the next set of chars that doesn't contain spaces
		var i = start;
		while (i < end && !this.isWhiteSpace(str.charAt(i)))
			i++;
		return str.substring(start, i);
	};

	// This just sees if the next token is the word passed in, with possible leading spaces
	this.isMatch = function(str, match) {
		var i = this.skipWhiteSpace(str);
		if (finished(str, i))
			return 0;
		if (window.ABCJS.parse.startsWith(str.substring(i), match))
			return i+match.length;
		return 0;
	};

	this.getPitchFromTokens = function(tokens) {
		var ret = { };
		var pitches = {A: 5, B: 6, C: 0, D: 1, E: 2, F: 3, G: 4, a: 12, b: 13, c: 7, d: 8, e: 9, f: 10, g: 11};
		ret.position = pitches[tokens[0].token];
		if (ret.position === undefined)
			return { warn: "Pitch expected. Found: " + tokens[0].token };
		tokens.shift();
		while (tokens.length) {
			switch (tokens[0].token) {
				case ',': ret.position -= 7; tokens.shift(); break;
				case '\'': ret.position += 7; tokens.shift(); break;
				default: return ret;
			}
		}
		return ret;
	};

	this.getKeyAccidentals2 = function(tokens) {
		var accs;
		// find and strip off all accidentals in the token list
		while (tokens.length > 0) {
			var acc;
			if (tokens[0].token === '^') {
				acc = 'sharp';
				tokens.shift();
				if (tokens.length === 0) return {accs: accs, warn: 'Expected note name after ' + acc};
				switch (tokens[0].token) {
					case '^': acc = 'dblsharp'; tokens.shift(); break;
					case '/': acc = 'quartersharp'; tokens.shift(); break;
				}
			} else if (tokens[0].token === '=') {
				acc = 'natural';
				tokens.shift();
			} else if (tokens[0].token === '_') {
				acc = 'flat';
				tokens.shift();
				if (tokens.length === 0) return {accs: accs, warn: 'Expected note name after ' + acc};
				switch (tokens[0].token) {
					case '_': acc = 'dblflat'; tokens.shift(); break;
					case '/': acc = 'quarterflat'; tokens.shift(); break;
				}
			} else {
				// Not an accidental, we'll assume that a later parse will recognize it.
				return { accs: accs };
			}
			if (tokens.length === 0) return {accs: accs, warn: 'Expected note name after ' + acc};
			switch (tokens[0].token.charAt(0))
			{
				case 'a':
				case 'b':
				case 'c':
				case 'd':
				case 'e':
				case 'f':
				case 'g':
				case 'A':
				case 'B':
				case 'C':
				case 'D':
				case 'E':
				case 'F':
				case 'G':
					if (accs === undefined)
						accs = [];
					accs.push({ acc: acc, note: tokens[0].token.charAt(0) });
					if (tokens[0].token.length === 1)
						tokens.shift();
					else
						tokens[0].token = tokens[0].token.substring(1);
					break;
				default:
					return {accs: accs, warn: 'Expected note name after ' + acc + ' Found: ' + tokens[0].token };
			}
		}
		return { accs: accs };
	};

	// This gets an accidental marking for the key signature. It has the accidental then the pitch letter.
	this.getKeyAccidental = function(str) {
		var accTranslation = {
			'^': 'sharp',
			'^^': 'dblsharp',
			'=': 'natural',
			'_': 'flat',
			'__': 'dblflat',
			'_/': 'quarterflat',
			'^/': 'quartersharp'
		};
		var i = this.skipWhiteSpace(str);
		if (finished(str, i))
			return {len: 0};
		var acc = null;
		switch (str.charAt(i))
		{
			case '^':
			case '_':
			case '=':
				acc = str.charAt(i);
				break;
			default:return {len: 0};
		}
		i++;
		if (finished(str, i))
			return {len: 1, warn: 'Expected note name after accidental'};
		switch (str.charAt(i))
		{
			case 'a':
			case 'b':
			case 'c':
			case 'd':
			case 'e':
			case 'f':
			case 'g':
			case 'A':
			case 'B':
			case 'C':
			case 'D':
			case 'E':
			case 'F':
			case 'G':
				return {len: i+1, token: {acc: accTranslation[acc], note: str.charAt(i)}};
			case '^':
			case '_':
			case '/':
				acc += str.charAt(i);
				i++;
				if (finished(str, i))
					return {len: 2, warn: 'Expected note name after accidental'};
				switch (str.charAt(i))
				{
					case 'a':
					case 'b':
					case 'c':
					case 'd':
					case 'e':
					case 'f':
					case 'g':
					case 'A':
					case 'B':
					case 'C':
					case 'D':
					case 'E':
					case 'F':
					case 'G':
						return {len: i+1, token: {acc: accTranslation[acc], note: str.charAt(i)}};
					default:
						return {len: 2, warn: 'Expected note name after accidental'};
				}
				break;
			default:
				return {len: 1, warn: 'Expected note name after accidental'};
		}
	};

	this.isWhiteSpace = function(ch) {
		return ch === ' ' || ch === '\t' || ch === '\x12';
	};

	this.getMeat = function(line, start, end) {
		// This removes any comments starting with '%' and trims the ends of the string so that there are no leading or trailing spaces.
		// it returns just the start and end characters that contain the meat.
		var comment = line.indexOf('%', start);
		if (comment >= 0 && comment < end)
			end = comment;
		while (start < end && (line.charAt(start) === ' ' || line.charAt(start) === '\t' || line.charAt(start) === '\x12'))
			start++;
		while (start < end && (line.charAt(end-1) === ' ' || line.charAt(end-1) === '\t' || line.charAt(end-1) === '\x12'))
			end--;
		return {start: start, end: end};
	};

	var isLetter = function(ch) {
		return (ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z');
	};

	var isNumber = function(ch) {
		return (ch >= '0' && ch <= '9');
	};

	this.tokenize = function(line, start, end) {
		// this returns all the tokens inside the passed string. A token is a punctuation mark, a string of digits, a string of letters.
		//  Quoted strings are one token.
		//  If there is a minus sign next to a number, then it is included in the number.
		// If there is a period immediately after a number, with a number immediately following, then a float is returned.
		// The type of token is returned: quote, alpha, number, punct
		var ret = this.getMeat(line, start, end);
		start = ret.start;
		end = ret.end;
		var tokens = [];
		var i;
		while (start < end) {
			if (line.charAt(start) === '"') {
				i = start+1;
				while (i < end && line.charAt(i) !== '"') i++;
				tokens.push({ type: 'quote', token: line.substring(start+1, i), start: start+1, end: i});
				i++;
			} else if (isLetter(line.charAt(start))) {
				i = start+1;
				while (i < end && isLetter(line.charAt(i))) i++;
				tokens.push({ type: 'alpha', token: line.substring(start, i), continueId: isNumber(line.charAt(i)), start: start, end: i});
				start = i + 1;
			} else if (line.charAt(start) === '.' && isNumber(line.charAt(i+1))) {
				i = start+1;
				var int2 = null;
				var float2 = null;
				while (i < end && isNumber(line.charAt(i))) i++;

				float2 = parseFloat(line.substring(start, i));
				tokens.push({ type: 'number', token: line.substring(start, i), intt: int2, floatt: float2, continueId: isLetter(line.charAt(i)), start: start, end: i});
				start = i + 1;
			} else if (isNumber(line.charAt(start)) || (line.charAt(start) === '-' && isNumber(line.charAt(i+1)))) {
				i = start+1;
				var intt = null;
				var floatt = null;
				while (i < end && isNumber(line.charAt(i))) i++;
				if (line.charAt(i) === '.' && isNumber(line.charAt(i+1))) {
					i++;
					while (i < end && isNumber(line.charAt(i))) i++;
				} else
					intt = parseInt(line.substring(start, i));

				floatt = parseFloat(line.substring(start, i));
				tokens.push({ type: 'number', token: line.substring(start, i), intt: intt, floatt: floatt, continueId: isLetter(line.charAt(i)), start: start, end: i});
				start = i + 1;
			} else if (line.charAt(start) === ' ' || line.charAt(start) === '\t') {
				i = start+1;
			} else {
				tokens.push({ type: 'punct', token: line.charAt(start), start: start, end: start+1});
				i = start+1;
			}
			start = i;
		}
		return tokens;
	};

	this.getVoiceToken = function(line, start, end) {
		// This finds the next token. A token is delimited by a space or an equal sign. If it starts with a quote, then the portion between the quotes is returned.
		var i = start;
		while (i < end && this.isWhiteSpace(line.charAt(i)) || line.charAt(i) === '=')
			i++;

		if (line.charAt(i) === '"') {
			var close = line.indexOf('"', i+1);
			if (close === -1 || close >= end)
				return {len: 1, err: "Missing close quote"};
			return {len: close-start+1, token: this.translateString(line.substring(i+1, close))};
		} else {
			var ii = i;
			while (ii < end && !this.isWhiteSpace(line.charAt(ii)) && line.charAt(ii) !== '=')
				ii++;
			return {len: ii-start+1, token: line.substring(i, ii)};
		}
	};

	var charMap = {
		"`a": 'à', "'a": "á", "^a": "â", "~a": "ã", "\"a": "ä", "oa": "å", "=a": "ā", "ua": "ă", ";a": "ą",
		"`e": 'è', "'e": "é", "^e": "ê", "\"e": "ë", "=e": "ē", "ue": "ĕ", ";e": "ę", ".e": "ė",
		"`i": 'ì', "'i": "í", "^i": "î", "\"i": "ï", "=i": "ī", "ui": "ĭ", ";i": "į",
		"`o": 'ò', "'o": "ó", "^o": "ô", "~o": "õ", "\"o": "ö", "=o": "ō", "uo": "ŏ", "/o": "ø",
		"`u": 'ù', "'u": "ú", "^u": "û", "~u": "ũ", "\"u": "ü", "ou": "ů", "=u": "ū", "uu": "ŭ", ";u": "ų",
		"`A": 'À', "'A": "Á", "^A": "Â", "~A": "Ã", "\"A": "Ä", "oA": "Å", "=A": "Ā", "uA": "Ă", ";A": "Ą",
		"`E": 'È', "'E": "É", "^E": "Ê", "\"E": "Ë", "=E": "Ē", "uE": "Ĕ", ";E": "Ę", ".E": "Ė",
		"`I": 'Ì', "'I": "Í", "^I": "Î", "~I": "Ĩ", "\"I": "Ï", "=I": "Ī", "uI": "Ĭ", ";I": "Į", ".I": "İ",
		"`O": 'Ò', "'O": "Ó", "^O": "Ô", "~O": "Õ", "\"O": "Ö", "=O": "Ō", "uO": "Ŏ", "/O": "Ø",
		"`U": 'Ù', "'U": "Ú", "^U": "Û", "~U": "Ũ", "\"U": "Ü", "oU": "Ů", "=U": "Ū", "uU": "Ŭ", ";U": "Ų",
		"ae": "æ", "AE": "Æ", "oe": "œ", "OE": "Œ", "ss": "ß",
		"'c": "ć", "^c": "ĉ", "uc": "č", "cc": "ç", ".c": "ċ", "cC": "Ç", "'C": "Ć", "^C": "Ĉ", "uC": "Č", ".C": "Ċ",
		"~n": "ñ",
		"=s": "š", "vs": "š",
		"vz": 'ž'

// More chars: Ñ Ĳ ĳ Ď ď Đ đ Ĝ ĝ Ğ ğ Ġ ġ Ģ ģ Ĥ ĥ Ħ ħ Ĵ ĵ Ķ ķ ĸ Ĺ ĺ Ļ ļ Ľ ľ Ŀ ŀ Ł ł Ń ń Ņ ņ Ň ň ŉ Ŋ ŋ   Ŕ ŕ Ŗ ŗ Ř ř Ś ś Ŝ ŝ Ş ş Š Ţ ţ Ť ť Ŧ ŧ Ŵ ŵ Ŷ ŷ Ÿ ÿ Ÿ Ź ź Ż ż Ž 
	};
	var charMap1 = {
		"#": "♯",
		"b": "♭",
		"=": "♮"
	};
	var charMap2 = {
		"201": "♯",
		"202": "♭",
		"203": "♮",
		"241": "¡",
		"242": "¢", "252": "a", "262": "2", "272": "o", "302": "Â", "312": "Ê", "322": "Ò", "332": "Ú", "342": "â", "352": "ê", "362": "ò", "372": "ú",
		"243": "£", "253": "«", "263": "3", "273": "»", "303": "Ã", "313": "Ë", "323": "Ó", "333": "Û", "343": "ã", "353": "ë", "363": "ó", "373": "û",
		"244": "¤", "254": "¬", "264": "  ́", "274": "1⁄4", "304": "Ä", "314": "Ì", "324": "Ô", "334": "Ü", "344": "ä", "354": "ì", "364": "ô", "374": "ü",
		"245": "¥", "255": "-", "265": "μ", "275": "1⁄2", "305": "Å", "315": "Í", "325": "Õ", "335": "Ý",  "345": "å", "355": "í", "365": "õ", "375": "ý",
		"246": "¦", "256": "®", "266": "¶", "276": "3⁄4", "306": "Æ", "316": "Î", "326": "Ö", "336": "Þ", "346": "æ", "356": "î", "366": "ö", "376": "þ",
		"247": "§", "257": " ̄", "267": "·", "277": "¿", "307": "Ç", "317": "Ï", "327": "×", "337": "ß", "347": "ç", "357": "ï", "367": "÷", "377": "ÿ",
		"250": " ̈", "260": "°", "270": " ̧", "300": "À", "310": "È", "320": "Ð", "330": "Ø", "340": "à", "350": "è", "360": "ð", "370": "ø",
		"251": "©", "261": "±", "271": "1", "301": "Á", "311": "É", "321": "Ñ", "331": "Ù", "341": "á", "351": "é", "361": "ñ", "371": "ù" };
	this.translateString = function(str) {
		var arr = str.split('\\');
		if (arr.length === 1) return str;
		var out = null;
		window.ABCJS.parse.each(arr, function(s) {
			if (out === null)
				out = s;
			else {
				var c = charMap[s.substring(0, 2)];
				if (c !== undefined)
					out += c + s.substring(2);
				else {
					c = charMap2[s.substring(0, 3)];
					if (c !== undefined)
						out += c + s.substring(3);
					else {
						c = charMap1[s.substring(0, 1)];
						if (c !== undefined)
							out += c + s.substring(1);
						else
							out += "\\" + s;
					}
				}
			}
		});
		return out;
	};
	this.getNumber = function(line, index) {
		var num = 0;
		while (index < line.length) {
			switch (line.charAt(index)) {
				case '0':num = num*10;index++;break;
				case '1':num = num*10+1;index++;break;
				case '2':num = num*10+2;index++;break;
				case '3':num = num*10+3;index++;break;
				case '4':num = num*10+4;index++;break;
				case '5':num = num*10+5;index++;break;
				case '6':num = num*10+6;index++;break;
				case '7':num = num*10+7;index++;break;
				case '8':num = num*10+8;index++;break;
				case '9':num = num*10+9;index++;break;
				default:
					return {num: num, index: index};
			}
		}
		return {num: num, index: index};
	};

	this.getFraction = function(line, index) {
		var num = 1;
		var den = 1;
		if (line.charAt(index) !== '/') {
			var ret = this.getNumber(line, index);
			num = ret.num;
			index = ret.index;
		}
		if (line.charAt(index) === '/') {
			index++;
			if (line.charAt(index) === '/') {
				var div = 0.5;
				while (line.charAt(index++) === '/')
					div = div /2;
				return {value: num * div, index: index-1};
			} else {
				var iSave = index;
				var ret2 = this.getNumber(line, index);
				if (ret2.num === 0 && iSave === index)	// If we didn't use any characters, it is an implied 2
					ret2.num = 2;
				if (ret2.num !== 0)
					den = ret2.num;
				index = ret2.index;
			}
		}

		return {value: num/den, index: index};
	};

	this.theReverser = function(str) {
		if (window.ABCJS.parse.endsWith(str, ", The"))
			return "The " + str.substring(0, str.length-5);
		if (window.ABCJS.parse.endsWith(str, ", A"))
			return "A " + str.substring(0, str.length-3);
		return str;
	};

	this.stripComment = function(str) {
		var i = str.indexOf('%');
		if (i >= 0)
			return window.ABCJS.parse.strip(str.substring(0, i));
		return window.ABCJS.parse.strip(str);
	};

	this.getInt = function(str) {
		// This parses the beginning of the string for a number and returns { value: num, digits: num }
		// If digits is 0, then the string didn't point to a number.
		var x = parseInt(str);
		if (isNaN(x))
			return {digits: 0};
		var s = "" + x;
		var i = str.indexOf(s);	// This is to account for leading spaces
		return {value: x, digits: i+s.length};
	};

	this.getFloat = function(str) {
		// This parses the beginning of the string for a number and returns { value: num, digits: num }
		// If digits is 0, then the string didn't point to a number.
		var x = parseFloat(str);
		if (isNaN(x))
			return {digits: 0};
		var s = "" + x;
		var i = str.indexOf(s);	// This is to account for leading spaces
		return {value: x, digits: i+s.length};
	};

	this.getMeasurement = function(tokens) {
		if (tokens.length === 0) return { used: 0 };
		var used = 1;
		var num = '';
		if (tokens[0].token === '-') {
			tokens.shift();
			num = '-';
			used++;
		}
		else if (tokens[0].type !== 'number') return { used: 0 };
		num += tokens.shift().token;
		if (tokens.length === 0) return { used: 1, value: parseInt(num) };
		var x = tokens.shift();
		if (x.token === '.') {
			used++;
			if (tokens.length === 0) return { used: used, value: parseInt(num) };
			if (tokens[0].type === 'number') {
				x = tokens.shift();
				num = num + '.' + x.token;
				used++;
				if (tokens.length === 0) return { used: used, value: parseFloat(num) };
			}
			x = tokens.shift();
		}
		switch (x.token) {
			case 'pt': return { used: used+1, value: parseFloat(num) };
			case 'cm': return { used: used+1, value: parseFloat(num)/2.54*72 };
			case 'in': return { used: used+1, value: parseFloat(num)*72 };
			default: tokens.unshift(x); return { used: used, value: parseFloat(num) };
		}
		return { used: 0 };
	};
	var substInChord = function(str)
	{
		while ( str.indexOf("\\n") !== -1)
		{
			str = str.replace("\\n", "\n");
		}
		return str;
	};
	this.getBrackettedSubstring = function(line, i, maxErrorChars, _matchChar)
	{
		// This extracts the sub string by looking at the first character and searching for that
		// character later in the line (or search for the optional _matchChar).
		// For instance, if the first character is a quote it will look for
		// the end quote. If the end of the line is reached, then only up to the default number
		// of characters are returned, so that a missing end quote won't eat up the entire line.
		// It returns the substring and the number of characters consumed.
		// The number of characters consumed is normally two more than the size of the substring,
		// but in the error case it might not be.
		var matchChar = _matchChar || line.charAt(i);
		var pos = i+1;
		while ((pos < line.length) && (line.charAt(pos) !== matchChar))
			++pos;
		if (line.charAt(pos) === matchChar)
			return [pos-i+1,substInChord(line.substring(i+1, pos)), true];
		else	// we hit the end of line, so we'll just pick an arbitrary num of chars so the line doesn't disappear.
		{
			pos = i+maxErrorChars;
			if (pos > line.length-1)
				pos = line.length-1;
			return [pos-i+1, substInChord(line.substring(i+1, pos)), false];
		}
	};
};
//    abc_absolute_element.js: Definition of the AbsoluteElement class.
//    Copyright (C) 2010,2014 Gregory Dyke (gregdyke at gmail dot com) and Paul Rosen
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.

/*globals ABCJS */

if (!window.ABCJS)
	window.ABCJS = {};

if (!window.ABCJS.write)
	window.ABCJS.write = {};

// duration - actual musical duration - different from notehead duration in triplets. refer to abcelem to get the notehead duration
// minspacing - spacing which must be taken on top of the width defined by the duration
// type is a meta-type for the element. It is not necessary for drawing, but it is useful to make semantic sense of the element. For instance, it can be used in the element's class name.
ABCJS.write.AbsoluteElement = function(abcelem, duration, minspacing, type) {
	//console.log("Absolute:",abcelem, type);
	this.abcelem = abcelem;
	this.duration = duration;
	this.minspacing = minspacing || 0;
	this.x = 0;
	this.children = [];
	this.heads = [];
	this.extra = [];
	this.extraw = 0;
	//this.decs = [];
	this.w = 0;
	this.right = [];
	this.invisible = false;
	this.bottom = undefined;
	this.top = undefined;
	this.type = type;
	// these are the heights of all of the vertical elements that can't be placed until the end of the line.
	// the vertical order of elements that are above is: tempo, part, volume/dynamic, ending/chord, lyric
	// the vertical order of elements that are below is: lyric, chord, volume/dynamic
	this.specialY = {
		tempoHeightAbove: 0,
		partHeightAbove: 0,
		volumeHeightAbove: 0,
		dynamicHeightAbove: 0,
		endingHeightAbove: 0,
		chordHeightAbove: 0,
		lyricHeightAbove: 0,

		lyricHeightBelow: 0,
		chordHeightBelow: 0,
		volumeHeightBelow: 0,
		dynamicHeightBelow: 0
	};
};

// For each of the relative elements that can't be placed in advance (because their vertical placement depends on everything
// else on the line), this iterates through them and sets their pitch. By the time this is called, specialYResolved contains a
// hash with the vertical placement (in pitch units) for each type.
// TODO-PER: I think this needs to be separated by "above" and "below". How do we know that for dynamics at the point where they are being defined, though? We need a pass through all the relative elements to set "above" and "below".
ABCJS.write.AbsoluteElement.prototype.setUpperAndLowerElements = function(specialYResolved) {
	// specialYResolved contains the actual pitch for each of the classes of elements.
	for (var i = 0; i < this.children.length; i++) {
		var child = this.children[i];
		for (var key in this.specialY) { // for each class of element that needs to be placed vertically
			if (this.specialY.hasOwnProperty(key)) {
				if (child[key]) { // If this relative element has defined a height for this class of element
					child.pitch = specialYResolved[key];
				}
			}
		}
	}
};

ABCJS.write.AbsoluteElement.prototype.getMinWidth = function () { // absolute space taken to the right of the note
	return this.w;
};

ABCJS.write.AbsoluteElement.prototype.getExtraWidth = function () { // space needed to the left of the note
	return -this.extraw;
};

ABCJS.write.AbsoluteElement.prototype.addExtra = function (extra) {
	if (extra.dx<this.extraw) this.extraw = extra.dx;
	this.extra[this.extra.length] = extra;
	this.addChild(extra);
};

ABCJS.write.AbsoluteElement.prototype.addHead = function (head) {
	if (head.dx<this.extraw) this.extraw = head.dx;
	this.heads[this.heads.length] = head;
	this.addRight(head);
};

ABCJS.write.AbsoluteElement.prototype.addRight = function (right) {
	if (right.dx+right.w>this.w) this.w = right.dx+right.w;
	this.right[this.right.length] = right;
	this.addChild(right);
};

ABCJS.write.AbsoluteElement.prototype.addCentered = function (elem) {
	var half = elem.w/2;
	if (-half<this.extraw) this.extraw = -half;
	this.extra[this.extra.length] = elem;
	if (elem.dx+half>this.w) this.w = elem.dx+half;
	this.right[this.right.length] = elem;
	this.addChild(elem);
};

ABCJS.write.AbsoluteElement.prototype.setLimit = function(member, child) {
	if (!child[member]) return;
	if (!this.specialY[member])
		this.specialY[member] = child[member];
	else
		this.specialY[member] = Math.max(this.specialY[member], child[member]);
};

ABCJS.write.AbsoluteElement.prototype.addChild = function (child) {
	//console.log("Relative:",child);
	child.parent = this;
	this.children[this.children.length] = child;
	this.pushTop(child.top);
	this.pushBottom(child.bottom);
	this.setLimit('tempoHeightAbove', child);
	this.setLimit('partHeightAbove', child);
	this.setLimit('volumeHeightAbove', child);
	this.setLimit('dynamicHeightAbove', child);
	this.setLimit('endingHeightAbove', child);
	this.setLimit('chordHeightAbove', child);
	this.setLimit('lyricHeightAbove', child);
	this.setLimit('lyricHeightBelow', child);
	this.setLimit('chordHeightBelow', child);
	this.setLimit('volumeHeightBelow', child);
	this.setLimit('dynamicHeightBelow', child);
};

ABCJS.write.AbsoluteElement.prototype.pushTop = function (top) {
	if (top !== undefined) {
		if (this.top === undefined)
			this.top = top;
		else
			this.top = Math.max(top, this.top);
	}
};

ABCJS.write.AbsoluteElement.prototype.pushBottom = function (bottom) {
	if (bottom !== undefined) {
		if (this.bottom === undefined)
			this.bottom = bottom;
		else
			this.bottom = Math.min(bottom, this.bottom);
	}
};

ABCJS.write.AbsoluteElement.prototype.setX = function (x) {
	this.x = x;
	for (var i=0; i<this.children.length; i++)
		this.children[i].setX(x);
};

ABCJS.write.AbsoluteElement.prototype.draw = function (renderer, bartop) {
	this.elemset = renderer.paper.set();
	if (this.invisible) return;
	renderer.beginGroup();
	for (var i=0; i<this.children.length; i++) {
		if (ABCJS.write.debugPlacement) {
			if (this.children[i].klass === 'ornament')
				renderer.printShadedBox(this.x, renderer.calcY(this.children[i].top), this.w, renderer.calcY(this.children[i].bottom)-renderer.calcY(this.children[i].top), "rgba(0,0,200,0.3)");
		}
		this.elemset.push(this.children[i].draw(renderer,bartop));
	}
	this.elemset.push(renderer.endGroup(this.type));
	if (this.klass)
		this.setClass("mark", "", "#00ff00");
	var color = ABCJS.write.debugPlacement ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0)"; // Create transparent box that encompasses the element, and not so transparent to debug it.
	var target = renderer.printShadedBox(this.x, renderer.calcY(this.top), this.w, renderer.calcY(this.bottom)-renderer.calcY(this.top), color);
	var self = this;
	var controller = renderer.controller;
//	this.elemset.mouseup(function () {
	target.mouseup(function () {
		controller.notifySelect(self);
	});
	this.abcelem.abselem = this;

	var spacing = ABCJS.write.spacing.STEP;

	var start = function () {
			// storing original relative coordinates
			this.dy = 0;
		},
		move = function (dx, dy) {
			// move will be called with dx and dy
			dy = Math.round(dy/spacing)*spacing;
			this.translate(0, -this.dy);
			this.dy = dy;
			this.translate(0,this.dy);
		},
		up = function () {
			if (self.abcelem.pitches) {
				var delta = -Math.round(this.dy / spacing);
				self.abcelem.pitches[0].pitch += delta;
				self.abcelem.pitches[0].verticalPos += delta;
				controller.notifyChange();
			}
		};
	if (this.abcelem.el_type==="note" && controller.editable)
		this.elemset.drag(move, start, up);
};

ABCJS.write.AbsoluteElement.prototype.isIE=/*@cc_on!@*/false;//IE detector

ABCJS.write.AbsoluteElement.prototype.setClass = function (addClass, removeClass, color) {
	if (color !== null)
		this.elemset.attr({fill:color});
	if (!this.isIE) {
		for (var i = 0; i < this.elemset.length; i++) {
			if (this.elemset[i][0].setAttribute) {
				var kls = this.elemset[i][0].getAttribute("class");
				if (!kls) kls = "";
				kls = kls.replace(removeClass, "");
				kls = kls.replace(addClass, "");
				if (addClass.length > 0) {
					if (kls.length > 0 && kls.charAt(kls.length-1) !== ' ') kls += " ";
					kls += addClass;
				}
				this.elemset[i][0].setAttribute("class", kls);
			}
		}
	}
};

ABCJS.write.AbsoluteElement.prototype.highlight = function (klass, color) {
	if (klass === undefined)
		klass = "note_selected";
	if (color === undefined)
		color = "#ff0000";
	this.setClass(klass, "", color);
};

ABCJS.write.AbsoluteElement.prototype.unhighlight = function (klass, color) {
	if (klass === undefined)
		klass = "note_selected";
	if (color === undefined)
		color = "#000000";
	this.setClass("", klass, color);
};

// abc_abstract_engraver.js: Creates a data structure suitable for printing a line of abc
// Copyright (C) 2010 Gregory Dyke (gregdyke at gmail dot com)
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

/*global window, ABCJS */

if (!window.ABCJS)
        window.ABCJS = {};

if (!window.ABCJS.write)
        window.ABCJS.write = {};

(function() {
	"use strict";

ABCJS.write.getDuration = function(elem) {
  var d = 0;
  if (elem.duration) {
    d = elem.duration;
  }
  return d;
};

ABCJS.write.getDurlog = function(duration) {
        // TODO-PER: This is a hack to prevent a Chrome lockup. Duration should have been defined already,
        // but there's definitely a case where it isn't. [Probably something to do with triplets.]
        if (duration === undefined) {
                return 0;
        }
//        console.log("getDurlog: " + duration);
  return Math.floor(Math.log(duration)/Math.log(2));
};

ABCJS.write.AbstractEngraver = function(bagpipes, renderer) {
	this.decoration = new ABCJS.write.Decoration();
	this.renderer = renderer;
  this.isBagpipes = bagpipes;
  this.chartable = {rest:{0:"rests.whole", 1:"rests.half", 2:"rests.quarter", 3:"rests.8th", 4: "rests.16th",5: "rests.32nd", 6: "rests.64th", 7: "rests.128th"},
                 note:{"-1": "noteheads.dbl", 0:"noteheads.whole", 1:"noteheads.half", 2:"noteheads.quarter", 3:"noteheads.quarter", 4:"noteheads.quarter", 5:"noteheads.quarter", 6:"noteheads.quarter", 7:"noteheads.quarter", 'nostem':"noteheads.quarter"},
                 rhythm:{"-1": "noteheads.slash.whole", 0:"noteheads.slash.whole", 1:"noteheads.slash.whole", 2:"noteheads.slash.quarter", 3:"noteheads.slash.quarter", 4:"noteheads.slash.quarter", 5:"noteheads.slash.quarter", 6:"noteheads.slash.quarter", 7:"noteheads.slash.quarter", nostem: "noteheads.slash.nostem"},
                 x:{"-1": "noteheads.indeterminate", 0:"noteheads.indeterminate", 1:"noteheads.indeterminate", 2:"noteheads.indeterminate", 3:"noteheads.indeterminate", 4:"noteheads.indeterminate", 5:"noteheads.indeterminate", 6:"noteheads.indeterminate", 7:"noteheads.indeterminate", nostem: "noteheads.indeterminate"},
                 harmonic:{"-1": "noteheads.harmonic.quarter", 0:"noteheads.harmonic.quarter", 1:"noteheads.harmonic.quarter", 2:"noteheads.harmonic.quarter", 3:"noteheads.harmonic.quarter", 4:"noteheads.harmonic.quarter", 5:"noteheads.harmonic.quarter", 6:"noteheads.harmonic.quarter", 7:"noteheads.harmonic.quarter", nostem: "noteheads.harmonic.quarter"},
                 uflags:{3:"flags.u8th", 4:"flags.u16th", 5:"flags.u32nd", 6:"flags.u64th"},
                 dflags:{3:"flags.d8th", 4:"flags.d16th", 5:"flags.d32nd", 6:"flags.d64th"}};
	this.reset();
};

ABCJS.write.AbstractEngraver.prototype.reset = function() {
	this.slurs = {};
	this.ties = [];
	this.slursbyvoice = {};
	this.tiesbyvoice = {};
	this.endingsbyvoice = {};
	this.s = 0; // current staff number
	this.v = 0; // current voice number on current staff
	this.tripletmultiplier = 1;

	this.abcline = undefined;
	this.accidentalSlot = undefined;
	this.accidentalshiftx = undefined;
	this.dotshiftx = undefined;
	this.hasVocals = false;
	this.minY = undefined;
	this.partstartelem = undefined;
	this.pos = undefined;
	this.roomtaken = undefined;
	this.roomtakenright = undefined;
	this.staffgroup = undefined;
	this.startlimitelem = undefined;
	this.stemdir = undefined;
	this.voice = undefined;
};

ABCJS.write.AbstractEngraver.prototype.setStemHeight = function(heightInPixels) {
	this.stemHeight = heightInPixels / ABCJS.write.spacing.STEP;
};

ABCJS.write.AbstractEngraver.prototype.getCurrentVoiceId = function() {
  return "s"+this.s+"v"+this.v;
};

ABCJS.write.AbstractEngraver.prototype.pushCrossLineElems = function() {
  this.slursbyvoice[this.getCurrentVoiceId()] = this.slurs;
  this.tiesbyvoice[this.getCurrentVoiceId()] = this.ties;
  this.endingsbyvoice[this.getCurrentVoiceId()] = this.partstartelem;
};

ABCJS.write.AbstractEngraver.prototype.popCrossLineElems = function() {
  this.slurs = this.slursbyvoice[this.getCurrentVoiceId()] || {};
  this.ties = this.tiesbyvoice[this.getCurrentVoiceId()] || [];
  this.partstartelem = this.endingsbyvoice[this.getCurrentVoiceId()];
};

ABCJS.write.AbstractEngraver.prototype.getElem = function() {
  if (this.abcline.length <= this.pos)
    return null;
  return this.abcline[this.pos];
};

ABCJS.write.AbstractEngraver.prototype.getNextElem = function() {
        if (this.abcline.length <= this.pos+1)
                return null;
    return this.abcline[this.pos+1];
};

	ABCJS.write.AbstractEngraver.prototype.containsLyrics = function(staves) {
		for (var i = 0; i < staves.length; i++) {
			for (var j = 0; j < staves[i].voices.length; j++) {
				for (var k = 0; k < staves[i].voices[j].length; k++) {
					var el = staves[i].voices[j][k];
					if (el.lyric) {
						// We just want to see if there are vocals below the music to know where to put the dynamics.
						if (!el.positioning || el.positioning.vocalPosition === 'below')
							this.hasVocals = true;
						return;
					}
				}
			}
		}
	};

ABCJS.write.AbstractEngraver.prototype.createABCLine = function(staffs, tempo) {
    this.minY = 2; // PER: This is the lowest that any note reaches. It will be used to set the dynamics row.
	// See if there are any lyrics on this line.
	this.containsLyrics(staffs);
  this.staffgroup = new ABCJS.write.StaffGroupElement();
	this.tempoSet = false;
  for (this.s = 0; this.s < staffs.length; this.s++) {
    this.createABCStaff(staffs[this.s], tempo);
  }

  return this.staffgroup;
};

ABCJS.write.AbstractEngraver.prototype.createABCStaff = function(abcstaff, tempo) {
// If the tempo is passed in, then the first element should get the tempo attached to it.
  for (this.v = 0; this.v < abcstaff.voices.length; this.v++) {
    this.voice = new ABCJS.write.VoiceElement(this.v,abcstaff.voices.length);
    if (this.v===0) {
      this.voice.barfrom = (abcstaff.connectBarLines==="start" || abcstaff.connectBarLines==="continue");
      this.voice.barto = (abcstaff.connectBarLines==="continue" || abcstaff.connectBarLines==="end");
    } else {
      this.voice.duplicate = true; // bar lines and other duplicate info need not be created
    }
    if (abcstaff.title && abcstaff.title[this.v]) this.voice.header=abcstaff.title[this.v];
	  var clef = ABCJS.write.createClef(abcstaff.clef);
	  if (clef)
    this.voice.addChild(clef);
	  var keySig = ABCJS.write.createKeySignature(abcstaff.key);
	  if (keySig) {
		  this.voice.addChild(keySig);
		  this.startlimitelem = keySig; // limit ties here
	  }
    if (abcstaff.meter) {
		var ts = ABCJS.write.createTimeSignature(abcstaff.meter);
		this.voice.addChild(ts);
		this.startlimitelem = ts; // limit ties here
	}
	  if (this.voice.duplicate)
	  	this.voice.children = []; // we shouldn't reprint the above if we're reusing the same staff. We just created them to get the right spacing.
    var staffLines = abcstaff.clef.stafflines || abcstaff.clef.stafflines === 0 ? abcstaff.clef.stafflines : 5;
    this.staffgroup.addVoice(this.voice,this.s,staffLines);
	  this.createABCVoice(abcstaff.voices[this.v],tempo);
	  this.staffgroup.setStaffLimits(this.voice);
  }
};

ABCJS.write.AbstractEngraver.prototype.createABCVoice = function(abcline, tempo) {
  this.popCrossLineElems();
  this.stemdir = (this.isBagpipes)?"down":null;
  this.abcline = abcline;
  if (this.partstartelem) {
    this.partstartelem = new ABCJS.write.EndingElem("", null, null);
    this.voice.addOther(this.partstartelem);
  }
  for (var slur in this.slurs) {
    if (this.slurs.hasOwnProperty(slur)) {
      this.slurs[slur]= new ABCJS.write.TieElem(null, null, this.slurs[slur].above, this.slurs[slur].force, false);
        this.voice.addOther(this.slurs[slur]);
    }
  }
  for (var i=0; i<this.ties.length; i++) {
    this.ties[i]=new ABCJS.write.TieElem(null, null, this.ties[i].above, this.ties[i].force, true);
    this.voice.addOther(this.ties[i]);
  }

  for (this.pos=0; this.pos<this.abcline.length; this.pos++) {
    var abselems = this.createABCElement();
	  if (abselems) {
    for (i=0; i<abselems.length; i++) {
      if (!this.tempoSet && tempo && !tempo.suppress) {
        this.tempoSet = true;
        abselems[i].addChild(new ABCJS.write.TempoElement(tempo));
      }
      this.voice.addChild(abselems[i]);
    }
    }
  }
  this.pushCrossLineElems();
};


// return an array of ABCJS.write.AbsoluteElement
ABCJS.write.AbstractEngraver.prototype.createABCElement = function() {
  var elemset = [];
  var elem = this.getElem();
  switch (elem.el_type) {
  case "note":
    elemset = this.createBeam();
    break;
  case "bar":
    elemset[0] = this.createBarLine(elem);
    if (this.voice.duplicate) elemset[0].invisible = true;
    break;
  case "meter":
    elemset[0] = ABCJS.write.createTimeSignature(elem);
	  this.startlimitelem = elemset[0]; // limit ties here
    if (this.voice.duplicate) elemset[0].invisible = true;
    break;
  case "clef":
    elemset[0] = ABCJS.write.createClef(elem);
	  if (!elemset[0]) return null;
    if (this.voice.duplicate) elemset[0].invisible = true;
    break;
  case "key":
	  var absKey = ABCJS.write.createKeySignature(elem);
	  if (absKey) {
		  elemset[0] = absKey;
		  this.startlimitelem = elemset[0]; // limit ties here
	  }
    if (this.voice.duplicate) elemset[0].invisible = true;
    break;
  case "stem":
    this.stemdir=elem.direction;
    break;
  case "part":
    var abselem = new ABCJS.write.AbsoluteElement(elem,0,0, 'part');
	  var dim = this.renderer.getTextSize(elem.title, 'partsfont', "part");
    abselem.addChild(new ABCJS.write.RelativeElement(elem.title, 0, 0, undefined, {type:"part", height: dim.height/ABCJS.write.spacing.STEP}));
    elemset[0] = abselem;
    break;
  case "tempo":
    var abselem3 = new ABCJS.write.AbsoluteElement(elem,0,0, 'tempo');
    abselem3.addChild(new ABCJS.write.TempoElement(elem));
    elemset[0] = abselem3;
    break;
	  case "style":
		  if (elem.head === "normal")
			  delete this.style;
		  else
			  this.style = elem.head;
		  break;
  default:
    var abselem2 = new ABCJS.write.AbsoluteElement(elem,0,0, 'unsupported');
    abselem2.addChild(new ABCJS.write.RelativeElement("element type "+elem.el_type, 0, 0, undefined, {type:"debug"}));
    elemset[0] = abselem2;
  }

  return elemset;
};

ABCJS.write.AbstractEngraver.prototype.calcBeamDir = function() {
	if (this.stemdir) // If the user or voice is forcing the stem direction, we already know the answer.
		return this.stemdir;
	var beamelem = new ABCJS.write.BeamElem(this.stemHeight, this.stemdir);
	// PER: need two passes: the first one decides if the stems are up or down.
	var oldPos = this.pos;
	var abselem;
	while (this.getElem()) {
		abselem = this.createNote(this.getElem(), true, true);
		beamelem.add(abselem);
		if (this.getElem().endBeam)
			break;
		this.pos++;
	}
	var dir = beamelem.calcDir();
	this.pos = oldPos;
	return dir ? "up" : "down";
};

ABCJS.write.AbstractEngraver.prototype.createBeam = function() {
  var abselemset = [];
  
  if (this.getElem().startBeam && !this.getElem().endBeam) {
	  var dir = this.calcBeamDir();
         var beamelem = new ABCJS.write.BeamElem(this.stemHeight, dir);
         var oldDir = this.stemdir;
         this.stemdir = dir;
    while (this.getElem()) {
      var abselem = this.createNote(this.getElem(),true);
      abselemset.push(abselem);
                beamelem.add(abselem);
      if (this.getElem().endBeam) {
                break;
      }
      this.pos++;
    }
         this.stemdir = oldDir;
    this.voice.addOther(beamelem);
  } else {
    abselemset[0] = this.createNote(this.getElem());
  }
  return abselemset;
};

ABCJS.write.sortPitch = function(elem) {
  var sorted;
  do {
    sorted = true;
    for (var p = 0; p<elem.pitches.length-1; p++) {
      if (elem.pitches[p].pitch>elem.pitches[p+1].pitch) {
        sorted = false;
        var tmp = elem.pitches[p];
        elem.pitches[p] = elem.pitches[p+1];
        elem.pitches[p+1] = tmp;
      }
    }
  } while (!sorted);
};

ABCJS.write.AbstractEngraver.prototype.createNote = function(elem, nostem, dontDraw) { //stem presence: true for drawing stemless notehead
  var notehead = null;
  var grace= null;
  this.roomtaken = 0; // room needed to the left of the note
  this.roomtakenright = 0; // room needed to the right of the note
  var dotshiftx = 0; // room taken by chords with displaced noteheads which cause dots to shift
  var c="";
  var flag = null;
  var additionalLedgers = []; // PER: handle the case of [bc'], where the b doesn't have a ledger line

  var p, i, pp;
  var width, p1, p2, dx;

  var duration = ABCJS.write.getDuration(elem);
	var zeroDuration = false;
  if (duration === 0) { zeroDuration = true; duration = 0.25; nostem = true; }        //PER: zero duration will draw a quarter note head.
  var durlog = Math.floor(Math.log(duration)/Math.log(2)); //TODO use getDurlog
  var dot=0;

  for (var tot = Math.pow(2,durlog), inc=tot/2; tot<duration; dot++,tot+=inc,inc/=2);
  
  
  if (elem.startTriplet) {
         if (elem.startTriplet === 2)
         this.tripletmultiplier = 3/2;
         else
         this.tripletmultiplier=(elem.startTriplet-1)/elem.startTriplet;
  }
  

  var abselem = new ABCJS.write.AbsoluteElement(elem, duration * this.tripletmultiplier, 1, 'note');
  

  if (elem.rest) {
    var restpitch = 7;
    if (this.stemdir==="down") restpitch = 3;
    if (this.stemdir==="up") restpitch = 11;
	  // There is special placement for the percussion staff. If there is one staff line, then move the rest position.
	  var numLines = this.staffgroup.staffs[this.staffgroup.staffs.length-1].lines;
	  if (numLines === 1) {
		  // The half and whole rests are attached to different lines normally, so we need to tweak their position to get them to both be attached to the same one.
		  if (duration < 0.5)
			  restpitch = 7;
		  else if (duration < 1)
			restpitch = 6.8;	// half rest
		  else
		  	restpitch = 4.8; // whole rest
	  }
    switch(elem.rest.type) {
		case "whole":
			c = this.chartable.rest[0];
			elem.averagepitch=restpitch;
			elem.minpitch=restpitch;
			elem.maxpitch=restpitch;
			dot = 0;
			break;
    case "rest":
      c = this.chartable.rest[-durlog];
      elem.averagepitch=restpitch;
      elem.minpitch=restpitch;
      elem.maxpitch=restpitch;
      break;
    case "invisible":
    case "spacer":
      c="";
		elem.averagepitch=restpitch;
		elem.minpitch=restpitch;
		elem.maxpitch=restpitch;
    }
         if (!dontDraw)
    notehead = this.createNoteHead(abselem, c, {verticalPos:restpitch}, null, 0, -this.roomtaken, null, dot, 0, 1);
    if (notehead) abselem.addHead(notehead);
    this.roomtaken+=this.accidentalshiftx;
    this.roomtakenright = Math.max(this.roomtakenright,this.dotshiftx);

  } else {
         ABCJS.write.sortPitch(elem);
    
    // determine averagepitch, minpitch, maxpitch and stem direction
    var sum=0;
    for (p=0, pp=elem.pitches.length; p<pp; p++) {
      sum += elem.pitches[p].verticalPos;
    }
    elem.averagepitch = sum/elem.pitches.length;
    elem.minpitch = elem.pitches[0].verticalPos;
      this.minY = Math.min(elem.minpitch, this.minY);
    elem.maxpitch = elem.pitches[elem.pitches.length-1].verticalPos;
    var dir = (elem.averagepitch>=6) ? "down": "up";
    if (this.stemdir) dir=this.stemdir;

	  var style = elem.style ? elem.style : this.style; // get the style of note head.
	  if (!style || style === "normal") style = "note";
	  var noteSymbol;
	  if (zeroDuration)
		  noteSymbol = this.chartable[style].nostem;
		else
		  noteSymbol = this.chartable[style][-durlog];
	  if (!noteSymbol)
	  	console.log("noteSymbol:", style, durlog, zeroDuration);

    // determine elements of chords which should be shifted
    for (p=(dir==="down")?elem.pitches.length-2:1; (dir==="down")?p>=0:p<elem.pitches.length; p=(dir==="down")?p-1:p+1) {
      var prev = elem.pitches[(dir==="down")?p+1:p-1];
      var curr = elem.pitches[p];
      var delta = (dir==="down")?prev.pitch-curr.pitch:curr.pitch-prev.pitch;
      if (delta<=1 && !prev.printer_shift) {
        curr.printer_shift=(delta)?"different":"same";
        if (curr.verticalPos > 11 || curr.verticalPos < 1) {        // PER: add extra ledger line
          additionalLedgers.push(curr.verticalPos - (curr.verticalPos%2));
        }
        if (dir==="down") {
         this.roomtaken = ABCJS.write.glyphs.getSymbolWidth(noteSymbol)+2;
        } else {
         dotshiftx = ABCJS.write.glyphs.getSymbolWidth(noteSymbol)+2;
        }
      }
    }
    
           // The accidentalSlot will hold a list of all the accidentals on this chord. Each element is a vertical place,
           // and contains a pitch, which is the last pitch that contains an accidental in that slot. The slots are numbered
         // from closest to the note to farther left. We only need to know the last accidental we placed because
         // we know that the pitches are sorted by now.
    this.accidentalSlot = [];

    for (p=0; p<elem.pitches.length; p++) {

      if (!nostem) {
        if ((dir==="down" && p!==0) || (dir==="up" && p!==pp-1)) { // not the stemmed elem of the chord
         flag = null;
        } else {
         flag = this.chartable[(dir==="down")?"dflags":"uflags"][-durlog];
        }
      }
		c = noteSymbol;
                // The highest position for the sake of placing slurs is itself if the slur is internal. It is the highest position possible if the slur is for the whole chord.
                // If the note is the only one in the chord, then any slur it has counts as if it were on the whole chord.
                elem.pitches[p].highestVert = elem.pitches[p].verticalPos;
                var isTopWhenStemIsDown = (this.stemdir==="up" || dir==="up") && p===0;
                var isBottomWhenStemIsUp = (this.stemdir==="down" || dir==="down") && p===pp-1;
      if (!dontDraw && (isTopWhenStemIsDown || isBottomWhenStemIsUp)) { // place to put slurs if not already on pitches

                 if (elem.startSlur || pp === 1) {
                 elem.pitches[p].highestVert = elem.pitches[pp-1].verticalPos;
                 if (this.stemdir==="up" || dir==="up")
                                        elem.pitches[p].highestVert += 6;        // If the stem is up, then compensate for the length of the stem
                 }
                         if (elem.startSlur) {
          if (!elem.pitches[p].startSlur) elem.pitches[p].startSlur = []; //TODO possibly redundant, provided array is not optional
         for (i=0; i<elem.startSlur.length; i++) {
         elem.pitches[p].startSlur.push(elem.startSlur[i]);
         }
        }

        if (!dontDraw && elem.endSlur) {
                        elem.pitches[p].highestVert = elem.pitches[pp-1].verticalPos;
                        if (this.stemdir==="up" || dir==="up")
                                elem.pitches[p].highestVert += 6;        // If the stem is up, then compensate for the length of the stem
          if (!elem.pitches[p].endSlur) elem.pitches[p].endSlur = []; //TODO possibly redundant, provided array is not optional
         for (i=0; i<elem.endSlur.length; i++) {
         elem.pitches[p].endSlur.push(elem.endSlur[i]);
         }
        }
      }

		var hasStem = !nostem && durlog<=-1;
                if (!dontDraw)
      notehead = this.createNoteHead(abselem, c, elem.pitches[p], hasStem ? dir : null, 0, -this.roomtaken, flag, dot, dotshiftx, 1);
      if (notehead) abselem.addHead(notehead);
      this.roomtaken += this.accidentalshiftx;
      this.roomtakenright = Math.max(this.roomtakenright,this.dotshiftx);
    }
      
    // draw stem from the furthest note to a pitch above/below the stemmed note
    if (hasStem) {
      p1 = (dir==="down") ? elem.minpitch-7 : elem.minpitch+1/3;
                // PER added stemdir test to make the line meet the note.
      if (p1>6 && !this.stemdir) p1=6;
      p2 = (dir==="down") ? elem.maxpitch-1/3 : elem.maxpitch+7;
                // PER added stemdir test to make the line meet the note.
      if (p2<6 && !this.stemdir) p2=6;
      dx = (dir==="down" || abselem.heads.length === 0)?0:abselem.heads[0].w;
      width = (dir==="down")?1:-1;
		// TODO-PER-HACK: One type of note head has a different placement of the stem. This should be more generically calculated:
		if (notehead.c === 'noteheads.slash.quarter') {
			if (dir === 'down')
				p2 -= 1;
			else
				p1 += 1;
		}
      abselem.addExtra(new ABCJS.write.RelativeElement(null, dx, 0, p1, {"type": "stem", "pitch2":p2, linewidth: width}));
        this.minY = Math.min(p1, this.minY);
        this.minY = Math.min(p2, this.minY);
    }
    
  }
  
  if (elem.lyric !== undefined) {
    var lyricStr = "";
         window.ABCJS.parse.each(elem.lyric, function(ly) {
         lyricStr += ly.syllable + ly.divider + "\n";
      });
	  var lyricDim = this.renderer.getTextSize(lyricStr, 'vocalfont', "abc-lyric");
	  var position = elem.positioning ? elem.positioning.vocalPosition : 'below';
    abselem.addCentered(new ABCJS.write.RelativeElement(lyricStr, 0, lyricDim.width, undefined, {type:"lyric", position: position, height: lyricDim.height / ABCJS.write.spacing.STEP }));
  }
  
  if (!dontDraw && elem.gracenotes !== undefined) {
    var gracescale = 3/5;
    var graceScaleStem = 3.5/5; // TODO-PER: empirically found constant.
    var gracebeam = null;
    if (elem.gracenotes.length>1) {
      gracebeam = new ABCJS.write.BeamElem(this.stemHeight*graceScaleStem, "grace",this.isBagpipes);
		gracebeam.mainNote = abselem;	// this gives us a reference back to the note this is attached to so that the stems can be attached somewhere.
    }

    var graceoffsets = [];
    for (i=elem.gracenotes.length-1; i>=0; i--) { // figure out where to place each gracenote
      this.roomtaken+=10;
      graceoffsets[i] = this.roomtaken;
      if (elem.gracenotes[i].accidental) {
        this.roomtaken+=7;
      }
    }

    for (i=0; i<elem.gracenotes.length; i++) {
      var gracepitch = elem.gracenotes[i].verticalPos;

      flag = (gracebeam) ? null : this.chartable.uflags[(this.isBagpipes)?5:3];
      grace = this.createNoteHead(abselem, "noteheads.quarter", elem.gracenotes[i], "up", -graceoffsets[i], -graceoffsets[i], flag, 0, 0, gracescale);
      abselem.addExtra(grace);
                // PER: added acciaccatura slash
                if (elem.gracenotes[i].acciaccatura) {
                        var pos = elem.gracenotes[i].verticalPos+7*gracescale;        // the same formula that determines the flag position.
                        var dAcciaccatura = gracebeam ? 5 : 6;        // just an offset to make it line up correctly.
                        abselem.addRight(new ABCJS.write.RelativeElement("flags.ugrace", -graceoffsets[i]+dAcciaccatura, 0, pos, {scalex:gracescale, scaley: gracescale}));
                }
      if (gracebeam) { // give the beam the necessary info
          var graceDuration = elem.gracenotes[i].duration / 2;
          if (this.isBagpipes) graceDuration /= 2;
        var pseudoabselem = {heads:[grace],
                         abcelem:{averagepitch: gracepitch, minpitch: gracepitch, maxpitch: gracepitch, duration: graceDuration }};
        gracebeam.add(pseudoabselem);
      } else { // draw the stem
        p1 = gracepitch+1/3*gracescale;
        p2 = gracepitch+7*gracescale;
        dx = grace.dx + grace.w;
        width = -0.6;
        abselem.addExtra(new ABCJS.write.RelativeElement(null, dx, 0, p1, {"type": "stem", "pitch2":p2, linewidth: width}));
      }
      
      if (i===0 && !this.isBagpipes && !(elem.rest && (elem.rest.type==="spacer"||elem.rest.type==="invisible"))) this.voice.addOther(new ABCJS.write.TieElem(grace, notehead, false, true, false));
    }

    if (gracebeam) {
      this.voice.addOther(gracebeam);
    }
  }

  if (!dontDraw && elem.decoration) {
	  this.decoration.createDecoration(this.voice, elem.decoration, abselem.top, (notehead)?notehead.w:0, abselem, this.roomtaken, dir, abselem.bottom, elem.positioning, this.hasVocals);
  }
  
  if (elem.barNumber) {
    abselem.addChild(new ABCJS.write.RelativeElement(elem.barNumber, -10, 0, 0, {type:"barNumber"}));
  }
  
  // ledger lines
  for (i=elem.maxpitch; i>11; i--) {
    if (i%2===0 && !elem.rest) {
      abselem.addChild(new ABCJS.write.RelativeElement(null, -2, ABCJS.write.glyphs.getSymbolWidth(c)+4, i, {type:"ledger"}));
    }
  }
  
  for (i=elem.minpitch; i<1; i++) {
    if (i%2===0 && !elem.rest) {
      abselem.addChild(new ABCJS.write.RelativeElement(null, -2, ABCJS.write.glyphs.getSymbolWidth(c)+4, i, {type:"ledger"}));
    }
  }

  for (i = 0; i < additionalLedgers.length; i++) { // PER: draw additional ledgers
    var ofs = ABCJS.write.glyphs.getSymbolWidth(c);
    if (dir === 'down') ofs = -ofs;
    abselem.addChild(new ABCJS.write.RelativeElement(null, ofs-2, ABCJS.write.glyphs.getSymbolWidth(c)+4, additionalLedgers[i], {type:"ledger"}));
  }
	var chordMargin = 8; // If there are chords next to each other, this is how close they can get.
  if (elem.chord !== undefined) {
    for (i = 0; i < elem.chord.length; i++) {
      var x = 0;
      var y;
		var dim = this.renderer.getTextSize(elem.chord[i].name, 'annotationfont', "annotation");
		var chordWidth = dim.width;
		var chordHeight = dim.height / ABCJS.write.spacing.STEP;
      switch (elem.chord[i].position) {
      case "left":
        this.roomtaken+=chordWidth+7;
        x = -this.roomtaken;        // TODO-PER: This is just a guess from trial and error
        y = elem.averagepitch;
        abselem.addExtra(new ABCJS.write.RelativeElement(elem.chord[i].name, x, chordWidth+4, y, {type:"text", height: chordHeight}));
        break;
      case "right":
        this.roomtakenright+=4;
        x = this.roomtakenright;// TODO-PER: This is just a guess from trial and error
        y = elem.averagepitch;
        abselem.addRight(new ABCJS.write.RelativeElement(elem.chord[i].name, x, chordWidth+4, y, {type:"text", height: chordHeight}));
        break;
      case "below":
		  // setting the y-coordinate to undefined for now: it will be overwritten later on, after we figure out what the highest element on the line is.
                         var eachLine = elem.chord[i].name.split("\n");
                         for (var ii = 0; ii < eachLine.length; ii++) {
                                abselem.addRight(new ABCJS.write.RelativeElement(eachLine[ii], x, chordWidth+chordMargin, undefined, {type:"text", position: "below", height: chordHeight}));
                         }
    break;
		case "above":
			// setting the y-coordinate to undefined for now: it will be overwritten later on, after we figure out what the highest element on the line is.
			abselem.addRight(new ABCJS.write.RelativeElement(elem.chord[i].name, 0, chordWidth+chordMargin, undefined, {type: "text", height: chordHeight}));
			break;
      default:
		if (elem.chord[i].rel_position) {
			var relPositionY = elem.chord[i].rel_position.y + 3*ABCJS.write.spacing.STEP; // TODO-PER: this is a fudge factor to make it line up with abcm2ps
			abselem.addChild(new ABCJS.write.RelativeElement(elem.chord[i].name, x + elem.chord[i].rel_position.x, 0, elem.minpitch + relPositionY / ABCJS.write.spacing.STEP, {type: "text", height: chordHeight}));
		} else {
			// setting the y-coordinate to undefined for now: it will be overwritten later on, after we figure out what the highest element on the line is.
			var pos2 = 'above';
			if (elem.positioning && elem.positioning.chordPosition)
				pos2 = elem.positioning.chordPosition;

			dim = this.renderer.getTextSize(elem.chord[i].name, 'gchordfont', "chord");
			chordHeight = dim.height / ABCJS.write.spacing.STEP;
			chordWidth = dim.width; // Since the chord is centered, we only use half the width.
			abselem.addCentered(new ABCJS.write.RelativeElement(elem.chord[i].name, x, chordWidth, undefined, {type: "chord", position: pos2, height: chordHeight }));
		}
      }
    }
  }
    

  if (elem.startTriplet) {
    this.triplet = new ABCJS.write.TripletElem(elem.startTriplet, notehead, null, true); // above is opposite from case of slurs
         if (!dontDraw)
    this.voice.addOther(this.triplet);
  }

  if (elem.endTriplet && this.triplet) {
    this.triplet.setCloseAnchor(notehead);
    this.triplet = null;
    this.tripletmultiplier = 1;
  }

  return abselem;
};




ABCJS.write.AbstractEngraver.prototype.createNoteHead = function(abselem, c, pitchelem, dir, headx, extrax, flag, dot, dotshiftx, scale) {

  // TODO scale the dot as well
  var pitch = pitchelem.verticalPos;
  var notehead;
  var i;
  this.accidentalshiftx = 0;
  this.dotshiftx = 0;
  if (c === undefined)
    abselem.addChild(new ABCJS.write.RelativeElement("pitch is undefined", 0, 0, 0, {type:"debug"}));
  else if (c==="") {
    notehead = new ABCJS.write.RelativeElement(null, 0, 0, pitch);
  } else {
    var shiftheadx = headx;
    if (pitchelem.printer_shift) {
      var adjust = (pitchelem.printer_shift==="same")?1:0;
      shiftheadx = (dir==="down")?-ABCJS.write.glyphs.getSymbolWidth(c)*scale+adjust:ABCJS.write.glyphs.getSymbolWidth(c)*scale-adjust;
    }
	  var opts = {scalex:scale, scaley: scale, thickness: ABCJS.write.glyphs.symbolHeightInPitches(c)*scale };
	  //if (dir)
	  //	opts.stemHeight = ((dir==="down")?-this.stemHeight:this.stemHeight);
    notehead = new ABCJS.write.RelativeElement(c, shiftheadx, ABCJS.write.glyphs.getSymbolWidth(c)*scale, pitch, opts);
    if (flag) {
      var pos = pitch+((dir==="down")?-7:7)*scale;
      if (scale===1 && (dir==="down")?(pos>6):(pos<6)) pos=6;
      var xdelta = (dir==="down")?headx:headx+notehead.w-0.6;
      abselem.addRight(new ABCJS.write.RelativeElement(flag, xdelta, ABCJS.write.glyphs.getSymbolWidth(flag)*scale, pos, {scalex:scale, scaley: scale}));
    }
    this.dotshiftx = notehead.w+dotshiftx-2+5*dot;
    for (;dot>0;dot--) {
      var dotadjusty = (1-Math.abs(pitch)%2); //PER: take abs value of the pitch. And the shift still happens on ledger lines.
      abselem.addRight(new ABCJS.write.RelativeElement("dots.dot", notehead.w+dotshiftx-2+5*dot, ABCJS.write.glyphs.getSymbolWidth("dots.dot"), pitch+dotadjusty));
    }
  }
        if (notehead)
                notehead.highestVert = pitchelem.highestVert;
  
  if (pitchelem.accidental) {
    var symb;
    switch (pitchelem.accidental) {
    case "quartersharp":
      symb = "accidentals.halfsharp";
        break;
    case "dblsharp":
      symb = "accidentals.dblsharp";
      break;
    case "sharp":
      symb = "accidentals.sharp";
      break;
    case "quarterflat":
      symb = "accidentals.halfflat";
      break;
    case "flat":
      symb = "accidentals.flat";
      break;
    case "dblflat":
      symb = "accidentals.dblflat";
      break;
    case "natural":
      symb = "accidentals.nat";
    }
         // if a note is at least a sixth away, it can share a slot with another accidental
         var accSlotFound = false;
         var accPlace = extrax;
         for (var j = 0; j < this.accidentalSlot.length; j++) {
                 if (pitch - this.accidentalSlot[j][0] >= 6) {
                         this.accidentalSlot[j][0] = pitch;
                         accPlace = this.accidentalSlot[j][1];
                         accSlotFound = true;
                         break;
                 }
         }
         if (accSlotFound === false) {
                 accPlace -= (ABCJS.write.glyphs.getSymbolWidth(symb)*scale+2);
                 this.accidentalSlot.push([pitch,accPlace]);
                 this.accidentalshiftx = (ABCJS.write.glyphs.getSymbolWidth(symb)*scale+2);
         }
    abselem.addExtra(new ABCJS.write.RelativeElement(symb, accPlace, ABCJS.write.glyphs.getSymbolWidth(symb), pitch, {scalex:scale, scaley: scale}));
  }
  
  if (pitchelem.endTie) {
    if (this.ties[0]) {
      this.ties[0].setEndAnchor(notehead);
      this.ties = this.ties.slice(1,this.ties.length);
    }
  }
  
  if (pitchelem.startTie) {
    //PER: bug fix: var tie = new ABCJS.write.TieElem(notehead, null, (this.stemdir=="up" || dir=="down") && this.stemdir!="down",(this.stemdir=="down" || this.stemdir=="up"));
    var tie = new ABCJS.write.TieElem(notehead, null, (this.stemdir==="down" || dir==="down") && this.stemdir!=="up",(this.stemdir==="down" || this.stemdir==="up"), true);
    this.ties[this.ties.length]=tie;
    this.voice.addOther(tie);
	  // HACK-PER: For the animation, we need to know if a note is tied to the next one, so here's a flag.
	  // Unfortunately, only some of the notes in the current event might be tied, but this will consider it
	  // tied if any one of them is. That will work for most cases.
	  abselem.startTie = true;
  }

  if (pitchelem.endSlur) {
    for (i=0; i<pitchelem.endSlur.length; i++) {
      var slurid = pitchelem.endSlur[i];
      var slur;
      if (this.slurs[slurid]) {
        slur = this.slurs[slurid];
		  slur.setEndAnchor(notehead);
        delete this.slurs[slurid];
      } else {
        slur = new ABCJS.write.TieElem(null, notehead, dir==="down",(this.stemdir==="up" || dir==="down") && this.stemdir!=="down", false);
        this.voice.addOther(slur);
      }
      if (this.startlimitelem) {
        slur.setStartX(this.startlimitelem);
      }
    }
  }
  
  if (pitchelem.startSlur) {
    for (i=0; i<pitchelem.startSlur.length; i++) {
      var slurid = pitchelem.startSlur[i].label;
      //PER: bug fix: var slur = new ABCJS.write.TieElem(notehead, null, (this.stemdir=="up" || dir=="down") && this.stemdir!="down", this.stemdir);
      var slur = new ABCJS.write.TieElem(notehead, null, (this.stemdir==="down" || dir==="down") && this.stemdir!=="up", false, false);
      this.slurs[slurid]=slur;
      this.voice.addOther(slur);
    }
  }
  
  return notehead;

};

ABCJS.write.AbstractEngraver.prototype.createBarLine = function (elem) {
// bar_thin, bar_thin_thick, bar_thin_thin, bar_thick_thin, bar_right_repeat, bar_left_repeat, bar_double_repeat

  var abselem = new ABCJS.write.AbsoluteElement(elem, 0, 10, 'bar');
  var anchor = null; // place to attach part lines
  var dx = 0;



  var firstdots = (elem.type==="bar_right_repeat" || elem.type==="bar_dbl_repeat");
  var firstthin = (elem.type!=="bar_left_repeat" && elem.type!=="bar_thick_thin" && elem.type!=="bar_invisible");
  var thick = (elem.type==="bar_right_repeat" || elem.type==="bar_dbl_repeat" || elem.type==="bar_left_repeat" ||
         elem.type==="bar_thin_thick" || elem.type==="bar_thick_thin");
  var secondthin = (elem.type==="bar_left_repeat" || elem.type==="bar_thick_thin" || elem.type==="bar_thin_thin" || elem.type==="bar_dbl_repeat");
  var seconddots = (elem.type==="bar_left_repeat" || elem.type==="bar_dbl_repeat");

  // limit positioning of slurs
  if (firstdots || seconddots) {
    for (var slur in this.slurs) {
      if (this.slurs.hasOwnProperty(slur)) {
        this.slurs[slur].setEndX(abselem);
      }
    }
    this.startlimitelem = abselem;
  }

  if (firstdots) {
    abselem.addRight(new ABCJS.write.RelativeElement("dots.dot", dx, 1, 7));
    abselem.addRight(new ABCJS.write.RelativeElement("dots.dot", dx, 1, 5));
    dx+=6; //2 hardcoded, twice;
  }

  if (firstthin) {
    anchor = new ABCJS.write.RelativeElement(null, dx, 1, 2, {"type": "bar", "pitch2":10, linewidth:0.6});
    abselem.addRight(anchor);
  }

  if (elem.type==="bar_invisible") {
    anchor = new ABCJS.write.RelativeElement(null, dx, 1, 2, {"type": "none", "pitch2":10, linewidth:0.6});
    abselem.addRight(anchor);
  }

  if (elem.decoration) {
    this.decoration.createDecoration(this.voice, elem.decoration, 12, (thick)?3:1, abselem, 0, "down", 2, elem.positioning, this.hasVocals);
  }

  if (thick) {
    dx+=4; //3 hardcoded;
    anchor = new ABCJS.write.RelativeElement(null, dx, 4, 2, {"type": "bar", "pitch2":10, linewidth:4});
    abselem.addRight(anchor);
    dx+=5;
  }
  
// if (this.partstartelem && (thick || (firstthin && secondthin))) { // means end of nth part
// this.partstartelem.anchor2=anchor;
// this.partstartelem = null;
// }

  if (this.partstartelem && elem.endEnding) {
    this.partstartelem.anchor2=anchor;
    this.partstartelem = null;
  }

  if (secondthin) {
    dx+=3; //3 hardcoded;
    anchor = new ABCJS.write.RelativeElement(null, dx, 1, 2, {"type": "bar", "pitch2":10, linewidth:0.6});
    abselem.addRight(anchor); // 3 is hardcoded
  }

  if (seconddots) {
    dx+=3; //3 hardcoded;
    abselem.addRight(new ABCJS.write.RelativeElement("dots.dot", dx, 1, 7));
    abselem.addRight(new ABCJS.write.RelativeElement("dots.dot", dx, 1, 5));
  } // 2 is hardcoded

  if (elem.startEnding) {
	  var textWidth = this.renderer.getTextSize(elem.startEnding, "repeatfont", '').width;
	  abselem.minspacing += textWidth + 10; // Give plenty of room for the ending number.
    this.partstartelem = new ABCJS.write.EndingElem(elem.startEnding, anchor, null);
    this.voice.addOther(this.partstartelem);
  }

  return abselem;        

};


})();
//    abc_beam_element.js: Definition of the BeamElem class.
//    Copyright (C) 2010,2014 Gregory Dyke (gregdyke at gmail dot com) and Paul Rosen
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.

/*globals ABCJS */

if (!window.ABCJS)
	window.ABCJS = {};

if (!window.ABCJS.write)
	window.ABCJS.write = {};

// Most elements on the page are related to a particular absolute element -- notes, rests, bars, etc. Beams, however, span multiple elements.
// This means that beams can't be laid out until the absolute elements are placed. There is the further complication that the stems for beamed
// notes can't be laid out until the beams are because we don't know how long they will be until we know the slope of the beam and the horizontal
// spacing of the absolute elements.
//
// So, when a beam is detected, a BeamElem is created, then all notes belonging to that beam are added to it. These notes are not given stems at that time.
// Then, after the horizontal layout is complete, all of the BeamElem are iterated to set the beam position, then all of the notes that are beamed are given
// stems. After that, we are ready for the drawing step.

// There are three phases: the setup phase, when new elements are being discovered, the layout phase, when everything is calculated, and the drawing phase,
// when the object is not changed, but is used to put the elements on the page.

(function() {
	"use strict";

	//
	// Setup phase
	//
	ABCJS.write.BeamElem = function(stemHeight, type, flat) {
		// type is "grace", "up", "down", or undefined. flat is used to force flat beams, as it commonly found in the grace notes of bagpipe music.
		this.isflat = flat;
		this.isgrace = (type && type === "grace");
		this.forceup = this.isgrace || (type && type === "up");
		this.forcedown = (type && type === "down");
		this.elems = []; // all the ABCJS.write.AbsoluteElements that this beam touches. It may include embedded rests.
		this.total = 0;
		this.allrests = true;
		this.stemHeight = stemHeight;
		this.beams = []; // During the layout phase, this will become a list of the beams that need to be drawn.
	};

	ABCJS.write.BeamElem.prototype.add = function(abselem) {
		var pitch = abselem.abcelem.averagepitch;
		if (pitch === undefined) return; // don't include elements like spacers in beams
		this.allrests = this.allrests && abselem.abcelem.rest;
		abselem.beam = this;
		this.elems.push(abselem);
		//var pitch = abselem.abcelem.averagepitch;
		this.total += pitch; // TODO CHORD (get pitches from abselem.heads)
		if (!this.min || abselem.abcelem.minpitch < this.min) {
			this.min = abselem.abcelem.minpitch;
		}
		if (!this.max || abselem.abcelem.maxpitch > this.max) {
			this.max = abselem.abcelem.maxpitch;
		}
	};

	var middleLine = 6;	// hardcoded 6 is B

	ABCJS.write.BeamElem.prototype.calcDir = function() {
		if (this.forceup) return true;
		if (this.forcedown) return false;
		var average = calcAverage(this.total, this.elems.length);
		return average < middleLine;
	};

	//
	// layout phase
	//
	ABCJS.write.BeamElem.prototype.layout = function() {
		if (this.elems.length === 0 || this.allrests) return;

		this.stemsUp = this.calcDir(); // True means the stems are facing up.
		var dy = calcDy(this.stemsUp, this.isgrace); // This is the width of the beam line.

		// create the main beam
		var firstElement = this.elems[0];
		var lastElement = this.elems[this.elems.length - 1];
		var yPos = calcYPos(this.total, this.elems.length, this.stemHeight, this.stemsUp, firstElement.abcelem.averagepitch, lastElement.abcelem.averagepitch, this.isflat, this.min, this.max, this.isgrace);
		var xPos = calcXPos(this.stemsUp, firstElement, lastElement);
		this.beams.push({ startX: xPos[0], endX: xPos[1], startY: yPos[0], endY: yPos[1], dy: dy });

		// create the rest of the beams (in the case of 1/16th notes, etc.
		var beams = createAdditionalBeams(this.elems, this.stemsUp, this.beams[0], this.isgrace, dy);
		for (var i = 0; i < beams.length; i++)
			this.beams.push(beams[i]);

		// Now that the main beam is defined, we know how tall the stems should be, so create them and attach them to the original notes.
		createStems(this.elems, this.stemsUp, this.beams[0], dy, this.mainNote);
	};

	ABCJS.write.BeamElem.prototype.isAbove = function() {
		return this.stemsUp;
	};

	// We can't just use the entire beam for the calculation. The range has to be passed in, because the beam might extend into some unrelated notes. for instance, (3_a'f'e'f'2 when L:16
	ABCJS.write.BeamElem.prototype.heightAtMidpoint = function(startX, endX) {
		if (this.beams.length === 0)
			return 0;
		var beam = this.beams[0];
		var midPoint = startX + (endX - startX) / 2;
		return getBarYAt(beam.startX, beam.startY, beam.endX, beam.endY, midPoint);
	};

	ABCJS.write.BeamElem.prototype.yAtNote = function(element) {
		var beam = this.beams[0];
		return getBarYAt(beam.startX, beam.startY, beam.endX, beam.endY, element.x);
	};

	ABCJS.write.BeamElem.prototype.xAtMidpoint = function(startX, endX) {
		return startX + (endX - startX)/2;
	};

	//
	// Drawing phase
	//
	ABCJS.write.BeamElem.prototype.draw = function(renderer) {
		if (this.beams.length === 0) return;

		renderer.beginGroup();
		for (var i = 0; i < this.beams.length; i++) {
			var beam = this.beams[i];
			drawBeam(renderer, beam.startX, beam.startY, beam.endX, beam.endY, beam.dy);
		}
		renderer.endGroup('beam-elem');
	};

	//
	// private functions
	//
	function calcSlant(leftAveragePitch, rightAveragePitch, numStems, isFlat) {
		if (isFlat)
			return 0;
		var slant = leftAveragePitch - rightAveragePitch;
		var maxSlant = numStems / 2;

		if (slant > maxSlant) slant = maxSlant;
		if (slant < -maxSlant) slant = -maxSlant;
		return slant;
	}

	function calcAverage(total, numElements) {
		if (!numElements)
			return 0;
		return total / numElements;
	}

	function getBarYAt(startx, starty, endx, endy, x) {
		return starty + (endy - starty) / (endx - startx) * (x - startx);
	}

	function calcDy(asc, isGrace) {
		var dy = (asc) ? ABCJS.write.spacing.STEP : -ABCJS.write.spacing.STEP;
		if (isGrace) dy = dy * 0.4;
		return dy;
	}

	function drawBeam(renderer, startX, startY, endX, endY, dy) {
		// the X coordinates are actual coordinates, but the Y coordinates are in pitches.
		startY = renderer.calcY(startY);
		endY = renderer.calcY(endY);
		var pathString = "M" + startX + " " + startY + " L" + endX + " " + endY +
			"L" + endX + " " + (endY + dy) + " L" + startX + " " + (startY + dy) + "z";
		renderer.printPath({
			path: pathString,
			stroke: "none",
			fill: "#000000",
			'class': renderer.addClasses('beam-elem')
		});
	}

	function calcXPos(asc, firstElement, lastElement) {
		var starthead = firstElement.heads[asc ? 0 : firstElement.heads.length - 1];
		var endhead = lastElement.heads[asc ? 0 : lastElement.heads.length - 1];
		var startX = starthead.x;
		if (asc) startX += starthead.w - 0.6;
		var endX = endhead.x;
		if (asc) endX += endhead.w;
		return [ startX, endX ];
	}

	function calcYPos(total, numElements, stemHeight, asc, firstAveragePitch, lastAveragePitch, isFlat, minPitch, maxPitch, isGrace) {
		var average = calcAverage(total, numElements); // This is the average pitch for the all the notes that will be beamed.
		var barpos = stemHeight - 2; // (isGrace)? 5:7;
		var barminpos = stemHeight - 2;
		var pos = Math.round(asc ? Math.max(average + barpos, maxPitch + barminpos) : Math.min(average - barpos, minPitch - barminpos));

		var slant = calcSlant(firstAveragePitch, lastAveragePitch, numElements, isFlat);
		var startY = pos + Math.floor(slant / 2);
		var endY = pos + Math.floor(-slant / 2);

		// If the notes are too high or too low, make the beam go down to the middle
		if (!isGrace) {
			if (asc && pos < 6) {
				startY = 6;
				endY = 6;
			} else if (!asc && pos > 6) {
				startY = 6;
				endY = 6;
			}
		}

		return [ startY, endY];
	}

	function createStems(elems, asc, beam, dy, mainNote) {
		for (var i = 0; i < elems.length; i++) {
			var elem = elems[i];
			if (elem.abcelem.rest)
				continue;
			// TODO-PER: This is odd. If it is a regular beam then elems is an array of AbsoluteElements, if it is a grace beam then it is an array of objects , so we directly attach the element to the parent. We tell it if is a grace note because they are passed in as a generic object instead of an AbsoluteElement.
			var isGrace = elem.addExtra ? false : true;
			var parent = isGrace ? mainNote : elem;
			var furthestHead = elem.heads[(asc) ? 0 : elem.heads.length - 1];
			var ovalDelta = 1 / 5;//(isGrace)?1/3:1/5;
			var pitch = furthestHead.pitch + ((asc) ? ovalDelta : -ovalDelta);
			var dx = asc ? furthestHead.w : 0; // down-pointing stems start on the left side of the note, up-pointing stems start on the right side, so we offset by the note width.
			var x = furthestHead.x + dx; // this is now the actual x location in pixels.
			var bary = getBarYAt(beam.startX, beam.startY, beam.endX, beam.endY, x);
			var lineWidth = (asc) ? -0.6 : 0.6;
			if (!asc)
				bary -= (dy / 2) / ABCJS.write.spacing.STEP;	// TODO-PER: This is just a fudge factor so the down-pointing stems don't overlap.
			if (isGrace)
				dx += elem.heads[0].dx;
			// TODO-PER-HACK: One type of note head has a different placement of the stem. This should be more generically calculated:
			if (furthestHead.c === 'noteheads.slash.quarter') {
				if (asc)
					pitch += 1;
				else
					pitch -= 1;
			}
			var stem = new ABCJS.write.RelativeElement(null, dx, 0, pitch, {
				"type": "stem",
				"pitch2": bary,
				linewidth: lineWidth
			});
			stem.setX(parent.x); // This is after the x coordinates were set, so we have to set it directly.
			parent.addExtra(stem);
		}

	}

	function createAdditionalBeams(elems, asc, beam, isGrace, dy) {
		var beams = [];
		var auxBeams = [];  // auxbeam will be {x, y, durlog, single} auxbeam[0] should match with durlog=-4 (16th) (j=-4-durlog)
		for (var i = 0; i < elems.length; i++) {
			var elem = elems[i];
			if (elem.abcelem.rest)
				continue;
			var furthestHead = elem.heads[(asc) ? 0 : elem.heads.length - 1];
			var x = furthestHead.x + ((asc) ? furthestHead.w : 0);
			var bary = getBarYAt(beam.startX, beam.startY, beam.endX, beam.endY, x);

			var sy = (asc) ? -1.5 : 1.5;
			if (isGrace) sy = sy * 2 / 3; // This makes the second beam on grace notes closer to the first one.
			for (var durlog = ABCJS.write.getDurlog(elem.abcelem.duration); durlog < -3; durlog++) { // get the duration via abcelem because of triplets
				if (auxBeams[-4 - durlog]) {
					auxBeams[-4 - durlog].single = false;
				} else {
					auxBeams[-4 - durlog] = {
						x: x + ((asc) ? -0.6 : 0), y: bary + sy * (-4 - durlog + 1),
						durlog: durlog, single: true
					};
				}
			}

			for (var j = auxBeams.length - 1; j >= 0; j--) {
				if (i === elems.length - 1 || ABCJS.write.getDurlog(elems[i + 1].abcelem.duration) > (-j - 4)) {

					var auxBeamEndX = x;
					var auxBeamEndY = bary + sy * (j + 1);


					if (auxBeams[j].single) {
						auxBeamEndX = (i === 0) ? x + 5 : x - 5;
						auxBeamEndY = getBarYAt(beam.startX, beam.startY, beam.endX, beam.endY, auxBeamEndX) + sy * (j + 1);
					}
					beams.push({ startX: auxBeams[j].x, endX: auxBeamEndX, startY: auxBeams[j].y, endY: auxBeamEndY, dy: dy });
					auxBeams = auxBeams.slice(0, j);
				}
			}
		}
		return beams;
	}
})();
//    abc_create_clef.js
//    Copyright (C) 2010,2015 Gregory Dyke (gregdyke at gmail dot com) and Paul Rosen
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.

/*globals ABCJS */

if (!window.ABCJS)
	window.ABCJS = {};

if (!window.ABCJS.write)
	window.ABCJS.write = {};

(function() {
	"use strict";

	ABCJS.write.createClef = function(elem) {
		var clef;
		var octave = 0;
		var abselem = new ABCJS.write.AbsoluteElement(elem,0,10, 'staff-extra');
		switch (elem.type) {
			case "treble": clef = "clefs.G"; break;
			case "tenor": clef="clefs.C"; break;
			case "alto": clef="clefs.C"; break;
			case "bass": clef="clefs.F"; break;
			case 'treble+8': clef = "clefs.G"; octave = 1; break;
			case 'tenor+8':clef="clefs.C"; octave = 1; break;
			case 'bass+8': clef="clefs.F"; octave = 1; break;
			case 'alto+8': clef="clefs.C"; octave = 1; break;
			case 'treble-8': clef = "clefs.G"; octave = -1; break;
			case 'tenor-8':clef="clefs.C"; octave = -1; break;
			case 'bass-8': clef="clefs.F"; octave = -1; break;
			case 'alto-8': clef="clefs.C"; octave = -1; break;
			case 'none': return null;
			case 'perc': clef="clefs.perc"; break;
			default: abselem.addChild(new ABCJS.write.RelativeElement("clef="+elem.type, 0, 0, undefined, {type:"debug"}));
		}
		// if (elem.verticalPos) {
		// pitch = elem.verticalPos;
		// }
		var dx =5;
		if (clef) {
			abselem.addRight(new ABCJS.write.RelativeElement(clef, dx, ABCJS.write.glyphs.getSymbolWidth(clef), elem.clefPos));

			if (clef === 'clefs.G') {
				abselem.top = 13;
				abselem.bottom = -1;
			} else {
				abselem.top = 10;
				abselem.bottom = 2;
			}
			if (octave !== 0) {
				var scale = 2 / 3;
				var adjustspacing = (ABCJS.write.glyphs.getSymbolWidth(clef) - ABCJS.write.glyphs.getSymbolWidth("8") * scale) / 2;
				abselem.addRight(new ABCJS.write.RelativeElement("8", dx + adjustspacing, ABCJS.write.glyphs.getSymbolWidth("8") * scale, (octave > 0) ? abselem.top + 3 : abselem.bottom - 1, {
					scalex: scale,
					scaley: scale
				}));
				abselem.top += 2;
			}
		}
		return abselem;
	};

})();
//    abc_create_key_signature.js
//    Copyright (C) 2010,2015 Gregory Dyke (gregdyke at gmail dot com) and Paul Rosen
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.

/*globals ABCJS */

if (!window.ABCJS)
	window.ABCJS = {};

if (!window.ABCJS.write)
	window.ABCJS.write = {};

(function() {
	"use strict";

	ABCJS.write.createKeySignature = function(elem) {
		if (!elem.accidentals || elem.accidentals.length === 0)
			return null;
		var abselem = new ABCJS.write.AbsoluteElement(elem, 0, 10, 'staff-extra');
		var dx = 0;
		window.ABCJS.parse.each(elem.accidentals, function(acc) {
			var symbol = (acc.acc === "sharp") ? "accidentals.sharp" : (acc.acc === "natural") ? "accidentals.nat" : "accidentals.flat";
			//var notes = { 'A': 5, 'B': 6, 'C': 0, 'D': 1, 'E': 2, 'F': 3, 'G':4, 'a': 12, 'b': 13, 'c': 7, 'd': 8, 'e': 9, 'f': 10, 'g':11 };
			abselem.addRight(new ABCJS.write.RelativeElement(symbol, dx, ABCJS.write.glyphs.getSymbolWidth(symbol), acc.verticalPos, {thickness: ABCJS.write.glyphs.symbolHeightInPitches(symbol)}));
			dx += ABCJS.write.glyphs.getSymbolWidth(symbol) + 2;
		}, this);
		return abselem;
	};
})();
//    abc_create_time_signature.js
//    Copyright (C) 2010,2015 Gregory Dyke (gregdyke at gmail dot com) and Paul Rosen
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.

/*globals ABCJS */

if (!window.ABCJS)
	window.ABCJS = {};

if (!window.ABCJS.write)
	window.ABCJS.write = {};

(function() {
	"use strict";

	ABCJS.write.createTimeSignature = function(elem) {
		var abselem = new ABCJS.write.AbsoluteElement(elem,0,10, 'staff-extra');
		if (elem.type === "specified") {
			//TODO make the alignment for time signatures centered
			for (var i = 0; i < elem.value.length; i++) {
				if (i !== 0)
					abselem.addRight(new ABCJS.write.RelativeElement('+', i*20-9, ABCJS.write.glyphs.getSymbolWidth("+"), 6, { thickness: ABCJS.write.glyphs.symbolHeightInPitches("+") }));
				if (elem.value[i].den) {
					// TODO-PER: get real widths here, also center the num and den.
					abselem.addRight(new ABCJS.write.RelativeElement(elem.value[i].num, i*20, ABCJS.write.glyphs.getSymbolWidth(elem.value[i].num.charAt(0))*elem.value[i].num.length, 8, { thickness: ABCJS.write.glyphs.symbolHeightInPitches(elem.value[i].num.charAt(0)) }));
					abselem.addRight(new ABCJS.write.RelativeElement(elem.value[i].den, i*20, ABCJS.write.glyphs.getSymbolWidth(elem.value[i].den.charAt(0))*elem.value[i].den.length, 4, { thickness: ABCJS.write.glyphs.symbolHeightInPitches(elem.value[i].den.charAt(0)) }));
				} else {
					abselem.addRight(new ABCJS.write.RelativeElement(elem.value[i].num, i*20, ABCJS.write.glyphs.getSymbolWidth(elem.value[i].num.charAt(0))*elem.value[i].num.length, 6, { thickness: ABCJS.write.glyphs.symbolHeightInPitches(elem.value[i].num.charAt(0)) }));
				}
			}
		} else if (elem.type === "common_time") {
			abselem.addRight(new ABCJS.write.RelativeElement("timesig.common", 0, ABCJS.write.glyphs.getSymbolWidth("timesig.common"), 6, { thickness: ABCJS.write.glyphs.symbolHeightInPitches("timesig.common") }));

		} else if (elem.type === "cut_time") {
			abselem.addRight(new ABCJS.write.RelativeElement("timesig.cut", 0, ABCJS.write.glyphs.getSymbolWidth("timesig.cut"), 6, { thickness: ABCJS.write.glyphs.symbolHeightInPitches("timesig.cut") }));
		}
		return abselem;
	};
})();
//    abc_crescendo_element.js: Definition of the CrescendoElem class.
//    Copyright (C) 2010,2014 Gregory Dyke (gregdyke at gmail dot com) and Paul Rosen
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.

/*globals ABCJS */

if (!window.ABCJS)
	window.ABCJS = {};

if (!window.ABCJS.write)
	window.ABCJS.write = {};

ABCJS.write.CrescendoElem = function(anchor1, anchor2, dir, positioning) {
	this.anchor1 = anchor1; // must have a .x and a .parent property or be null (means starts at the "beginning" of the line - after keysig)
	this.anchor2 = anchor2; // must have a .x property or be null (means ends at the end of the line)
	this.dir = dir; // either "<" or ">"
	if (positioning === 'above')
		this.dynamicHeightAbove = 4;
	else
		this.dynamicHeightBelow = 4;
	this.pitch = undefined; // This will be set later
};

ABCJS.write.CrescendoElem.prototype.setUpperAndLowerElements = function(positionY) {
	if (this.dynamicHeightAbove)
		this.pitch = positionY.dynamicHeightAbove;
	else
		this.pitch = positionY.dynamicHeightBelow;
};

ABCJS.write.CrescendoElem.prototype.draw = function (renderer) {
	if (this.pitch === undefined)
		window.console.error("Crescendo Element y-coordinate not set.");
	var y = renderer.calcY(this.pitch) + 4; // This is the top pixel to use (it is offset a little so that it looks good with the volume marks.)
	var height = 8;
	if (this.dir === "<") {
		this.drawLine(renderer, y+height/2, y);
		this.drawLine(renderer, y+height/2, y+height);
	} else {
		this.drawLine(renderer, y, y+height/2);
		this.drawLine(renderer, y+height, y+height/2);
	}
};

ABCJS.write.CrescendoElem.prototype.drawLine = function (renderer, y1, y2) {
	var pathString = ABCJS.write.sprintf("M %f %f L %f %f",
		this.anchor1.x, y1, this.anchor2.x, y2);
	renderer.printPath({path:pathString, stroke:"#000000", 'class': renderer.addClasses('decoration')});
};
// abc_decoration.js: Creates a data structure suitable for printing a line of abc
// Copyright (C) 2010-2015 Gregory Dyke (gregdyke at gmail dot com) & Paul Rosen
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

/*global window, ABCJS */

if (!window.ABCJS)
	window.ABCJS = {};

if (!window.ABCJS.write)
	window.ABCJS.write = {};

(function() {
	"use strict";

	ABCJS.write.Decoration = function() {
		this.startDiminuendoX = undefined;
		this.startCrescendoX = undefined;
		this.minTop = 12;	// TODO-PER: this is assuming a 5-line staff. Pass that info in.
		this.minBottom = 0;
	};

	var closeDecoration = function(voice, decoration, pitch, width, abselem, roomtaken, dir, minPitch) {
		var yPos;
		for (var i=0;i<decoration.length; i++) {
			if (decoration[i]==="staccato" || decoration[i]==="tenuto" || decoration[i] === "accent") {
				var symbol = "scripts." + decoration[i];
				if (decoration[i] === "accent") symbol = "scripts.sforzato";
				if (yPos === undefined)
					yPos = (dir==="down") ? pitch+2:minPitch-2;
				else
					yPos = (dir==="down") ? yPos+2:yPos-2;
				if (decoration[i] === "accent") {
					// Always place the accent three pitches away, no matter whether that is a line or space.
					if (dir === "up") yPos--;
					else yPos++;
				} else {
					// don't place on a stave line. The stave lines are 2,4,6,8,10
					switch (yPos) {
						case 2:
						case 4:
						case 6:
						case 8:
						case 10:
							if (dir === "up") yPos--;
							else yPos++;
							break;
					}
				}
				if (pitch>9) yPos++; // take up some room of those that are above
				var deltaX = width/2;
				if (ABCJS.write.glyphs.getSymbolAlign(symbol)!=="center") {
					deltaX -= (ABCJS.write.glyphs.getSymbolWidth(symbol)/2);
				}
				abselem.addChild(new ABCJS.write.RelativeElement(symbol, deltaX, ABCJS.write.glyphs.getSymbolWidth(symbol), yPos));
			}
			if (decoration[i]==="slide" && abselem.heads[0]) {
				var yPos2 = abselem.heads[0].pitch;
				yPos2 -= 2; // TODO-PER: not sure what this fudge factor is.
				var blank1 = new ABCJS.write.RelativeElement("", -roomtaken-15, 0, yPos2-1);
				var blank2 = new ABCJS.write.RelativeElement("", -roomtaken-5, 0, yPos2+1);
				abselem.addChild(blank1);
				abselem.addChild(blank2);
				voice.addOther(new ABCJS.write.TieElem(blank1, blank2, false, false, false));
			}
		}
		if (yPos === undefined)
			yPos = pitch;

		return { above: yPos, below: abselem.bottom };
	};

	var volumeDecoration = function(voice, decoration, abselem, positioning) {
		for (var i=0;i<decoration.length; i++) {
			switch(decoration[i]) {
				case "p":
				case "mp":
				case "pp":
				case "ppp":
				case "pppp":
				case "f":
				case "ff":
				case "fff":
				case "ffff":
				case "sfz":
				case "mf":
					var elem = new ABCJS.write.DynamicDecoration(abselem, decoration[i], positioning);
					voice.addOther(elem);
			}
		}
	};

	var compoundDecoration = function(decoration, pitch, width, abselem, dir) {
		function highestPitch() {
			if (abselem.heads.length === 0)
				return 10;	// TODO-PER: I don't know if this can happen, but we'll return the top of the staff if so.
			var pitch = abselem.heads[0].pitch;
			for (var i = 1; i < abselem.heads.length; i++)
				pitch = Math.max(pitch, abselem.heads[i].pitch);
			return pitch;
		}
		function lowestPitch() {
			if (abselem.heads.length === 0)
				return 2;	// TODO-PER: I don't know if this can happen, but we'll return the bottom of the staff if so.
			var pitch = abselem.heads[0].pitch;
			for (var i = 1; i < abselem.heads.length; i++)
				pitch = Math.min(pitch, abselem.heads[i].pitch);
			return pitch;
		}
		function compoundDecoration(symbol, count) {
			var placement = (dir === 'down') ? lowestPitch()+1:highestPitch()+9;
			var deltaX = width/2;
			deltaX += (dir === 'down') ? -5 : 3;
			for (var i = 0; i < count; i++) {
				placement -= 1;
				abselem.addChild(new ABCJS.write.RelativeElement(symbol, deltaX, ABCJS.write.glyphs.getSymbolWidth(symbol), placement));
			}
		}

		for (var i=0;i<decoration.length; i++) {
			switch(decoration[i]) {
				case "/": compoundDecoration("flags.ugrace", 1); break;
				case "//": compoundDecoration("flags.ugrace", 2); break;
				case "///": compoundDecoration("flags.ugrace", 3); break;
				case "////": compoundDecoration("flags.ugrace", 4); break;
			}
		}
	};

	var stackedDecoration = function(decoration, width, abselem, yPos, positioning, minTop, minBottom) {
		function incrementPlacement(placement, height) {
			if (placement === 'above')
				yPos.above += height;
			else
				yPos.below -= height;
		}
		function getPlacement(placement) {
			var y;
			if (placement === 'above') {
				y = yPos.above;
				if (y < minTop)
					y = minTop;
			} else {
				y = yPos.below;
				if (y > minBottom)
					y = minBottom;
			}
			return y;
		}
		function textDecoration(text, placement) {
			var y = getPlacement(placement);
			var textFudge = 2;
			var textHeight = 5;
			// TODO-PER: Get the height of the current font and use that for the thickness.
			abselem.addChild(new ABCJS.write.RelativeElement(text, width/2, 0, y+textFudge, {type:"decoration", klass: 'ornament', thickness: 3}));

			incrementPlacement(placement, textHeight);
		}
		function symbolDecoration(symbol, placement) {
			var deltaX = width/2;
			if (ABCJS.write.glyphs.getSymbolAlign(symbol) !== "center") {
				deltaX -= (ABCJS.write.glyphs.getSymbolWidth(symbol) / 2);
			}
			var height = ABCJS.write.glyphs.symbolHeightInPitches(symbol) + 1; // adding a little padding so nothing touches.
			var y = getPlacement(placement);
			y = (placement === 'above') ? y + height/2 : y - height/2;// Center the element vertically.
			abselem.addChild(new ABCJS.write.RelativeElement(symbol, deltaX, ABCJS.write.glyphs.getSymbolWidth(symbol), y, { klass: 'ornament', thickness: ABCJS.write.glyphs.symbolHeightInPitches(symbol) }));

			incrementPlacement(placement, height);
		}

		var symbolList = {
			"+": "scripts.stopped",
			"open": "scripts.open",
			"snap": "scripts.snap",
			"wedge": "scripts.wedge",
			"thumb": "scripts.thumb",
			"shortphrase": "scripts.shortphrase",
			"mediumphrase": "scripts.mediumphrase",
			"longphrase": "scripts.longphrase",
			"trill": "scripts.trill",
			"roll": "scripts.roll",
			"irishroll": "scripts.roll",
			"marcato": "scripts.umarcato",
			"dmarcato": "scripts.dmarcato",
			"umarcato": "scripts.umarcato",
			"turn": "scripts.turn",
			"uppermordent": "scripts.prall",
			"pralltriller": "scripts.prall",
			"mordent": "scripts.mordent",
			"lowermordent": "scripts.mordent",
			"downbow": "scripts.downbow",
			"upbow": "scripts.upbow",
			"fermata": "scripts.ufermata",
			"invertedfermata": "scripts.dfermata",
			"breath": ",",
			"coda": "scripts.coda",
			"segno": "scripts.segno"
		};

		var hasOne = false;
		for (var i=0;i<decoration.length; i++) {
			switch(decoration[i]) {
				case "0":
				case "1":
				case "2":
				case "3":
				case "4":
				case "5":
				case "D.C.":
				case "D.S.":
					textDecoration(decoration[i], positioning);
					hasOne = true;
					break;
				case "fine":
					textDecoration("FINE", positioning);
					hasOne = true;
					break;
				case "+":
				case "open":
				case "snap":
				case "wedge":
				case "thumb":
				case "shortphrase":
				case "mediumphrase":
				case "longphrase":
				case "trill":
				case "roll":
				case "irishroll":
				case "marcato":
				case "dmarcato":
				case "turn":
				case "uppermordent":
				case "pralltriller":
				case "mordent":
				case "lowermordent":
				case "downbow":
				case "upbow":
				case "fermata":
				case "breath":
				case "umarcato":
				case "coda":
				case "segno":
					symbolDecoration(symbolList[decoration[i]], positioning);
					hasOne = true;
					break;
				case "invertedfermata":
					symbolDecoration(symbolList[decoration[i]], 'below');
					hasOne = true;
					break;
				case "mark":
					abselem.klass = "mark";
					break;
			}
		}
		return hasOne;
	};

	ABCJS.write.Decoration.prototype.dynamicDecoration = function(voice, decoration, abselem, positioning) {
		var diminuendo;
		var crescendo;
		for (var i=0;i<decoration.length; i++) {
			switch(decoration[i]) {
				case "diminuendo(":
					this.startDiminuendoX = abselem;
					diminuendo = undefined;
					break;
				case "diminuendo)":
					diminuendo = { start: this.startDiminuendoX, stop: abselem};
					this.startDiminuendoX = undefined;
					break;
				case "crescendo(":
					this.startCrescendoX = abselem;
					crescendo = undefined;
					break;
				case "crescendo)":
					crescendo = { start: this.startCrescendoX, stop: abselem};
					this.startCrescendoX = undefined;
					break;
			}
		}
		if (diminuendo) {
			voice.addOther(new ABCJS.write.CrescendoElem(diminuendo.start, diminuendo.stop, ">", positioning));
		}
		if (crescendo) {
			voice.addOther(new ABCJS.write.CrescendoElem(crescendo.start, crescendo.stop, "<", positioning));
		}
	};

	ABCJS.write.Decoration.prototype.createDecoration = function(voice, decoration, pitch, width, abselem, roomtaken, dir, minPitch, positioning, hasVocals) {
		if (!positioning)
			positioning = { ornamentPosition: 'above', volumePosition: hasVocals ? 'above' :'below', dynamicPosition: hasVocals ? 'above' : 'below' };
		// These decorations don't affect the placement of other decorations
		volumeDecoration(voice, decoration, abselem, positioning.volumePosition);
		this.dynamicDecoration(voice, decoration, abselem, positioning.dynamicPosition);
		compoundDecoration(decoration, pitch, width, abselem, dir);

		// treat staccato, accent, and tenuto first (may need to shift other markers)
		var yPos = closeDecoration(voice, decoration, pitch, width, abselem, roomtaken, dir, minPitch);
		// yPos is an object containing 'above' and 'below'. That is the placement of the next symbol on either side.

		yPos.above = Math.max(yPos.above, this.minTop);
		var hasOne = stackedDecoration(decoration, width, abselem, yPos, positioning.ornamentPosition, this.minTop, this.minBottom);
		if (hasOne) {
//			abselem.top = Math.max(yPos.above + 3, abselem.top); // TODO-PER: Not sure why we need this fudge factor.
		}
	};

})();

//    abc_dynamic_decoration.js: Definition of the DynamicDecoration class.
//    Copyright (C) 2010,2014 Gregory Dyke (gregdyke at gmail dot com) and Paul Rosen
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.

/*globals ABCJS */

if (!window.ABCJS)
	window.ABCJS = {};

if (!window.ABCJS.write)
	window.ABCJS.write = {};

ABCJS.write.DynamicDecoration = function(anchor, dec, position) {
	this.anchor = anchor;
	this.dec = dec;
	if (position === 'below')
		this.volumeHeightBelow = 5;
	else
		this.volumeHeightAbove = 5;
	this.pitch = undefined; // This will be set later
};

ABCJS.write.DynamicDecoration.prototype.setUpperAndLowerElements = function(positionY) {
	if (this.volumeHeightAbove)
		this.pitch = positionY.volumeHeightAbove;
	else
		this.pitch = positionY.volumeHeightBelow;
};

ABCJS.write.DynamicDecoration.prototype.draw = function(renderer, linestartx, lineendx) {
	if (this.pitch === undefined)
		window.console.error("Dynamic Element y-coordinate not set.");
	var scalex = 1;
	var scaley = 1;
	renderer.printSymbol(this.anchor.x, this.pitch, this.dec, scalex, scaley, renderer.addClasses('decoration'));
};

//    abc_ending_element.js: Definition of the EndingElement class.
//    Copyright (C) 2010,2014 Gregory Dyke (gregdyke at gmail dot com) and Paul Rosen
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.

/*globals ABCJS */

if (!window.ABCJS)
	window.ABCJS = {};

if (!window.ABCJS.write)
	window.ABCJS.write = {};

ABCJS.write.EndingElem = function(text, anchor1, anchor2) {
	this.text = text; // text to be displayed top left
	this.anchor1 = anchor1; // must have a .x property or be null (means starts at the "beginning" of the line - after keysig)
	this.anchor2 = anchor2; // must have a .x property or be null (means ends at the end of the line)
	this.endingHeightAbove = 5;
	this.pitch = undefined; // This will be set later
};

ABCJS.write.EndingElem.prototype.setUpperAndLowerElements = function(positionY) {
	this.pitch = positionY.endingHeightAbove;
};

ABCJS.write.EndingElem.prototype.draw = function (renderer, linestartx, lineendx) {
	if (this.pitch === undefined)
		window.console.error("Ending Element y-coordinate not set.");
	var y = renderer.calcY(this.pitch);
	var height = 20;
	var pathString;
	if (this.anchor1) {
		linestartx = this.anchor1.x+this.anchor1.w;
		pathString = ABCJS.write.sprintf("M %f %f L %f %f",
			linestartx, y, linestartx, y+height);
		renderer.printPath({path:pathString, stroke:"#000000", fill:"#000000", 'class': renderer.addClasses('ending')});
		renderer.renderText(linestartx+5, renderer.calcY(this.pitch-0.5), this.text, 'repeatfont', 'ending',"start");
	}

	if (this.anchor2) {
		lineendx = this.anchor2.x;
		pathString = ABCJS.write.sprintf("M %f %f L %f %f",
			lineendx, y, lineendx, y+height);
		renderer.printPath({path:pathString, stroke:"#000000", fill:"#000000", 'class': renderer.addClasses('ending')});
	}


	pathString = ABCJS.write.sprintf("M %f %f L %f %f",
		linestartx, y, lineendx, y);
	renderer.printPath({path:pathString, stroke:"#000000", fill:"#000000", 'class': renderer.addClasses('ending')});
};

//    abc_engraver_controller.js: Controls the engraving process of an ABCJS abstract syntax tree as produced by ABCJS/parse
//    Copyright (C) 2014 Gregory Dyke (gregdyke at gmail dot com)
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.


/*global window, ABCJS, Math, Raphael */

if (!window.ABCJS)
	window.ABCJS = {};

if (!window.ABCJS.write)
	window.ABCJS.write = {};

ABCJS.write.spacing = function() {};
ABCJS.write.spacing.FONTEM = 360;
ABCJS.write.spacing.FONTSIZE = 30;
ABCJS.write.spacing.STEP = ABCJS.write.spacing.FONTSIZE*93/720;
ABCJS.write.spacing.SPACE = 10;
ABCJS.write.spacing.TOPNOTE = 15;
ABCJS.write.spacing.STAVEHEIGHT = 100;
ABCJS.write.spacing.INDENT = 50;

ABCJS.write.debugPlacement = false; // Set this to true to get lots of lines and boxes on the page to make sense of the placement.

/**
 * @class
 * Controls the engraving process, from ABCJS Abstract Syntax Tree (ABCJS AST) to rendered score sheet
 *
 * Call engraveABC to run the process. This creates a graphelems ABCJS Abstract Engraving Structure (ABCJS AES) that can be accessed through this.staffgroups
 * this data structure is first laid out (giving the graphelems x and y coordinates) and then drawn onto the renderer
 * each ABCJS AES represents a single staffgroup - all elements that are not in a staffgroup are rendered directly by the controller
 *
 * elements in ABCJS AES know their "source data" in the ABCJS AST, and their "target shape" 
 * in the renderer for highlighting purposes
 *
 * @param {Object} paper SVG like object with methods path, text, etc.
 * @param {Object} params all the params -- documented on github //TODO-GD move some of that documentation here
 */
ABCJS.write.EngraverController = function(paper, params) {
  params = params || {};
  this.space = 3*ABCJS.write.spacing.SPACE;
  this.scale = params.scale || undefined;
	if (params.staffwidth) {
		// Note: Normally all measurements to the engraver are in POINTS. However, if a person is formatting for the
		// screen and directly inputting the width, then it is more logical to have the measurement in pixels.
		this.staffwidthScreen = params.staffwidth;
		this.staffwidthPrint = params.staffwidth;
	} else {
		this.staffwidthScreen = 740; // TODO-PER: Not sure where this number comes from, but this is how it's always been.
		this.staffwidthPrint = 680; // The number of pixels in 8.5", after 1cm of margin has been removed.
	}
  this.editable = params.editable || false;
	this.listeners = [];
	if (params.listener)
		this.addSelectListener(params.listener);

	// HACK-PER: Raphael doesn't support setting the class of an element, so this adds that support. This doesn't work on IE8 or less, though.
	this.usingSvg = (window.SVGAngle || document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1") ? true : false); // Same test Raphael uses
	if (this.usingSvg && params.add_classes)
		Raphael._availableAttrs['class'] = "";
	Raphael._availableAttrs['text-decoration'] = "";

  //TODO-GD factor out all calls directly made to renderer.paper and fix all the coupling issues below
  this.renderer=new ABCJS.write.Renderer(paper, params.regression);
	this.renderer.setPaddingOverride(params);
  this.renderer.controller = this; // TODO-GD needed for highlighting

	this.reset();
};

ABCJS.write.EngraverController.prototype.reset = function() {
	this.selected = [];
	this.ingroup = false;
	this.staffgroups = [];
	this.lastStaffGroupIndex = -1;
	if (this.engraver)
		this.engraver.reset();
	this.engraver = null;
	this.renderer.reset();
};

/**
 * run the engraving process
 * @param {ABCJS.Tune|ABCJS.Tune[]} abctunes 
 */
ABCJS.write.EngraverController.prototype.engraveABC = function(abctunes) {
  if (abctunes[0]===undefined) {
    abctunes = [abctunes];
  }
	this.reset();

  for (var i = 0; i < abctunes.length; i++) {
    this.engraveTune(abctunes[i]);
  }
	if (this.renderer.doRegression)
		return this.renderer.regressionLines.join("\n");
};

/**
 * Some of the items on the page are not scaled, so adjust them in the opposite direction of scaling to cancel out the scaling.
 * @param {float} scale
 */
ABCJS.write.EngraverController.prototype.adjustNonScaledItems = function (scale) {
	this.width /= scale;
	this.renderer.adjustNonScaledItems(scale);
};

/**
 * Run the engraving process on a single tune
 * @param {ABCJS.Tune} abctune
 */
ABCJS.write.EngraverController.prototype.engraveTune = function (abctune) {
	this.renderer.lineNumber = null;
	abctune.formatting.tripletfont = {face: "Times", size: 11, weight: "normal", style: "italic", decoration: "none"}; // TODO-PER: This font isn't defined in the standard, so it's hardcoded here for now.

	this.renderer.abctune = abctune; // TODO-PER: this is just to get the font info.
	this.renderer.setVerticalSpace(abctune.formatting);
	this.renderer.measureNumber = null;
	var scale = abctune.formatting.scale ? abctune.formatting.scale : this.scale;
	if (scale === undefined) scale = abctune.media === 'print' ? 0.75 : 1;
	this.renderer.setPrintMode(abctune.media === 'print');
	this.renderer.setPadding(abctune);
	this.engraver = new ABCJS.write.AbstractEngraver(abctune.formatting.bagpipes,this.renderer);
	this.engraver.setStemHeight(this.renderer.spacing.stemHeight);
	this.renderer.engraver = this.engraver; //TODO-PER: do we need this coupling? It's just used for the tempo
	if (abctune.formatting.staffwidth) {
		this.width = abctune.formatting.staffwidth * 1.33; // The width is expressed in pt; convert to px.
	} else {
		this.width = abctune.media === 'print' ? this.staffwidthPrint : this.staffwidthScreen;
	}
	this.adjustNonScaledItems(scale);

	// Generate the raw staff line data
	var i;
	var abcLine;
	var hasPrintedTempo = false;
	for(i=0; i<abctune.lines.length; i++) {
		abcLine = abctune.lines[i];
		if (abcLine.staff) {
			abcLine.staffGroup = this.engraver.createABCLine(abcLine.staff, !hasPrintedTempo ? abctune.metaText.tempo: null);
			hasPrintedTempo = true;
		}
	}

	// Adjust the x-coordinates to their absolute positions
	var maxWidth = this.width;
	for(i=0; i<abctune.lines.length; i++) {
		abcLine = abctune.lines[i];
		if (abcLine.staff) {
			this.setXSpacing(abcLine.staffGroup, abctune.formatting, i === abctune.lines.length - 1);
			if (abcLine.staffGroup.w > maxWidth) maxWidth = abcLine.staffGroup.w;
		}
	}

	// Layout the beams and add the stems to the beamed notes.
	for(i=0; i<abctune.lines.length; i++) {
		abcLine = abctune.lines[i];
		if (abcLine.staffGroup && abcLine.staffGroup.voices) {
			for (var j = 0; j < abcLine.staffGroup.voices.length; j++)
				abcLine.staffGroup.voices[j].layoutBeams();
			abcLine.staffGroup.setUpperAndLowerElements(this.renderer);
		}
	}

	// Set the staff spacing
	// TODO-PER: we should have been able to do this by the time we called setUpperAndLowerElements, but for some reason the "bottom" element seems to be set as a side effect of setting the X spacing.
	for(i=0; i<abctune.lines.length; i++) {
		abcLine = abctune.lines[i];
		if (abcLine.staffGroup) {
			abcLine.staffGroup.height = abcLine.staffGroup.calcHeight();
		}
	}

	// Do all the writing to output
	this.renderer.topMargin(abctune);
	//this.renderer.printHorizontalLine(this.width + this.renderer.padding.left + this.renderer.padding.right);
	this.renderer.engraveTopText(this.width, abctune);
	this.renderer.addMusicPadding();

	this.staffgroups = [];
	this.lastStaffGroupIndex = -1;
	for (var line = 0; line < abctune.lines.length; line++) {
		this.renderer.lineNumber = line;
		abcLine = abctune.lines[line];
		if (abcLine.staff) {
			this.engraveStaffLine(abcLine.staffGroup);
		} else if (abcLine.subtitle && line !== 0) {
			this.renderer.outputSubtitle(this.width, abcLine.subtitle);
		} else if (abcLine.text) {
			this.renderer.outputFreeText(abcLine.text);
		}
	}

	this.renderer.moveY(24); // TODO-PER: Empirically discovered. What variable should this be?
	this.renderer.engraveExtraText(this.width, abctune);
	this.renderer.setPaperSize(maxWidth, scale);
};

function calcHorizontalSpacing(isLastLine, stretchLast, targetWidth, lineWidth, spacing, spacingUnits, minSpace) {
	// TODO-PER: This used to stretch the first line when it is the only line, but I'm not sure why. abcm2ps doesn't do that
	if (isLastLine && lineWidth / targetWidth < 0.66 && !stretchLast) return null; // don't stretch last line too much
	if (Math.abs(targetWidth-lineWidth) < 2) return null; // if we are already near the target width, we're done.
	var relSpace = spacingUnits * spacing;
	var constSpace = lineWidth - relSpace;
	if (spacingUnits > 0) {
		spacing = (targetWidth - constSpace) / spacingUnits;
		if (spacing * minSpace > 50) {
			spacing = 50 / minSpace;
		}
		return spacing;
	}
	return null;
}

/**
 * Do the x-axis positioning for a single line (a group of related staffs)
 * @param {ABCJS.Tune} abctune an ABCJS AST
 * @param {Object} staffGroup an staffGroup
 * @param {Object} formatting an formatting
 * @param {boolean} isLastLine is this the last line to be printed?
 * @private
 */
ABCJS.write.EngraverController.prototype.setXSpacing = function (staffGroup, formatting, isLastLine) {
   var newspace = this.space;
  for (var it = 0; it < 3; it++) { // TODO-PER: shouldn't need this triple pass any more, but it does slightly affect the coordinates.
	  staffGroup.layout(newspace, this.renderer, false);
	  var stretchLast = formatting.stretchlast ? formatting.stretchlast : false;
		newspace = calcHorizontalSpacing(isLastLine, stretchLast, this.width+this.renderer.padding.left, staffGroup.w, newspace, staffGroup.spacingunits, staffGroup.minspace);
		if (newspace === null) break;
  }
	centerWholeRests(staffGroup.voices);
	//this.renderer.printHorizontalLine(this.width);
};

/**
 * Engrave a single line (a group of related staffs)
 * @param {ABCJS.Tune} abctune an ABCJS AST
 * @param {Object} staffGroup an staffGroup
 * @private
 */
ABCJS.write.EngraverController.prototype.engraveStaffLine = function (staffGroup) {
	if (this.lastStaffGroupIndex > -1)
		this.renderer.addStaffPadding(this.staffgroups[this.lastStaffGroupIndex], staffGroup);
	staffGroup.draw(this.renderer);
	var height = staffGroup.height * ABCJS.write.spacing.STEP;
	//this.renderer.printVerticalLine(this.width+this.renderer.padding.left, this.renderer.y, this.renderer.y+height);
  this.staffgroups[this.staffgroups.length] = staffGroup;
	this.lastStaffGroupIndex = this.staffgroups.length-1;
	this.renderer.y += height;
};

/**
 * Called by the Abstract Engraving Structure or any other (e.g. midi playback) to say it was selected (notehead clicked on)
 * @protected
 */
ABCJS.write.EngraverController.prototype.notifySelect = function (abselem) {
  this.clearSelection();
  if (abselem.highlight) {
    this.selected = [abselem];
    abselem.highlight();
  }
  var abcelem = abselem.abcelem || {};
  for (var i=0; i<this.listeners.length;i++) {
	  if (this.listeners[i].highlight)
		  this.listeners[i].highlight(abcelem);
  }
};

/**
 * Called by the Abstract Engraving Structure to say it was modified (e.g. notehead dragged)
 * @protected
 */
ABCJS.write.EngraverController.prototype.notifyChange = function (/*abselem*/) {
  for (var i=0; i<this.listeners.length;i++) {
    if (this.listeners[i].modelChanged)
      this.listeners[i].modelChanged();
  }
};

/**
 *
 * @private
 */
ABCJS.write.EngraverController.prototype.clearSelection = function () {
  for (var i=0;i<this.selected.length;i++) {
    this.selected[i].unhighlight();
  }
  this.selected = [];
};

/**
 * @param {Object} listener
 * @param {Function} listener.modelChanged the model the listener passed to this controller has changed
 * @param {Function} listener.highlight the abcelem of the model the listener passed to this controller should be highlighted
 */
ABCJS.write.EngraverController.prototype.addSelectListener = function (listener) {
  this.listeners[this.listeners.length] = listener;
};

/**
 * Tell the controller to highlight some noteheads of its engraved score
 * @param {number} start the character in the source abc where highlighting should start
 * @param {number} end the character in the source abc where highlighting should end
 */
ABCJS.write.EngraverController.prototype.rangeHighlight = function(start,end)
{
    this.clearSelection();
    for (var line=0;line<this.staffgroups.length; line++) {
	var voices = this.staffgroups[line].voices;
	for (var voice=0;voice<voices.length;voice++) {
	    var elems = voices[voice].children;
	    for (var elem=0; elem<elems.length; elem++) {
		// Since the user can highlight more than an element, or part of an element, a hit is if any of the endpoints
		// is inside the other range.
		var elStart = elems[elem].abcelem.startChar;
		var elEnd = elems[elem].abcelem.endChar;
		if ((end>elStart && start<elEnd) || ((end===start) && end===elEnd)) {
		    //		if (elems[elem].abcelem.startChar>=start && elems[elem].abcelem.endChar<=end) {
		    this.selected[this.selected.length]=elems[elem];
		    elems[elem].highlight();
		}
	    }
	}
    }
};


function centerWholeRests(voices) {
	// whole rests are a special case: if they are by themselves in a measure, then they should be centered.
	// (If they are not by themselves, that is probably a user error, but we'll just center it between the two items to either side of it.)
	for (var i = 0; i < voices.length; i++) {
		var voice = voices[i];
		// Look through all of the elements except for the first and last. If the whole note appears there then there isn't anything to center it between anyway.
		for (var j = 1; j < voice.children.length-1; j++) {
			var absElem = voice.children[j];
			if (absElem.abcelem.rest && absElem.abcelem.rest.type === 'whole') {
				var before = voice.children[j-1];
				var after = voice.children[j+1];
				var midpoint = (after.x - before.x) / 2 + before.x;
				absElem.x = midpoint - absElem.w / 2;
				for (var k = 0; k < absElem.children.length; k++)
					absElem.children[k].x = absElem.x;
			}
		}
	}
}

/*global window, ABCJS */

if (!window.ABCJS)
	window.ABCJS = {};

if (!window.ABCJS.write)
	window.ABCJS.write = {};

/**
 * Glyphs and some methods to adjust for their x and y baseline
 */
ABCJS.write.Glyphs = function() {
	"use strict";
	var glyphs =
	{'0':{d:[['M',4.83,-14.97],['c',0.33,-0.03,1.11,0.00,1.47,0.06],['c',1.68,0.36,2.97,1.59,3.78,3.60],['c',1.20,2.97,0.81,6.96,-0.90,9.27],['c',-0.78,1.08,-1.71,1.71,-2.91,1.95],['c',-0.45,0.09,-1.32,0.09,-1.77,0.00],['c',-0.81,-0.18,-1.47,-0.51,-2.07,-1.02],['c',-2.34,-2.07,-3.15,-6.72,-1.74,-10.20],['c',0.87,-2.16,2.28,-3.42,4.14,-3.66],['z'],['m',1.11,0.87],['c',-0.21,-0.06,-0.69,-0.09,-0.87,-0.06],['c',-0.54,0.12,-0.87,0.42,-1.17,0.99],['c',-0.36,0.66,-0.51,1.56,-0.60,3.00],['c',-0.03,0.75,-0.03,4.59,0.00,5.31],['c',0.09,1.50,0.27,2.40,0.60,3.06],['c',0.24,0.48,0.57,0.78,0.96,0.90],['c',0.27,0.09,0.78,0.09,1.05,0.00],['c',0.39,-0.12,0.72,-0.42,0.96,-0.90],['c',0.33,-0.66,0.51,-1.56,0.60,-3.06],['c',0.03,-0.72,0.03,-4.56,0.00,-5.31],['c',-0.09,-1.47,-0.27,-2.37,-0.60,-3.03],['c',-0.24,-0.48,-0.54,-0.78,-0.93,-0.90],['z']],w:10.78,h:14.959},
		'1':{d:[['M',3.30,-15.06],['c',0.06,-0.06,0.21,-0.03,0.66,0.15],['c',0.81,0.39,1.08,0.39,1.83,0.03],['c',0.21,-0.09,0.39,-0.15,0.42,-0.15],['c',0.12,0.00,0.21,0.09,0.27,0.21],['c',0.06,0.12,0.06,0.33,0.06,5.94],['c',0.00,3.93,0.00,5.85,0.03,6.03],['c',0.06,0.36,0.15,0.69,0.27,0.96],['c',0.36,0.75,0.93,1.17,1.68,1.26],['c',0.30,0.03,0.39,0.09,0.39,0.30],['c',0.00,0.15,-0.03,0.18,-0.09,0.24],['c',-0.06,0.06,-0.09,0.06,-0.48,0.06],['c',-0.42,0.00,-0.69,-0.03,-2.10,-0.24],['c',-0.90,-0.15,-1.77,-0.15,-2.67,0.00],['c',-1.41,0.21,-1.68,0.24,-2.10,0.24],['c',-0.39,0.00,-0.42,0.00,-0.48,-0.06],['c',-0.06,-0.06,-0.06,-0.09,-0.06,-0.24],['c',0.00,-0.21,0.06,-0.27,0.36,-0.30],['c',0.75,-0.09,1.32,-0.51,1.68,-1.26],['c',0.12,-0.27,0.21,-0.60,0.27,-0.96],['c',0.03,-0.18,0.03,-1.59,0.03,-4.29],['c',0.00,-3.87,0.00,-4.05,-0.06,-4.14],['c',-0.09,-0.15,-0.18,-0.24,-0.39,-0.24],['c',-0.12,0.00,-0.15,0.03,-0.21,0.06],['c',-0.03,0.06,-0.45,0.99,-0.96,2.13],['c',-0.48,1.14,-0.90,2.10,-0.93,2.16],['c',-0.06,0.15,-0.21,0.24,-0.33,0.24],['c',-0.24,0.00,-0.42,-0.18,-0.42,-0.39],['c',0.00,-0.06,3.27,-7.62,3.33,-7.74],['z']],w:8.94,h:15.058},
		'2':{d:[['M',4.23,-14.97],['c',0.57,-0.06,1.68,0.00,2.34,0.18],['c',0.69,0.18,1.50,0.54,2.01,0.90],['c',1.35,0.96,1.95,2.25,1.77,3.81],['c',-0.15,1.35,-0.66,2.34,-1.68,3.15],['c',-0.60,0.48,-1.44,0.93,-3.12,1.65],['c',-1.32,0.57,-1.80,0.81,-2.37,1.14],['c',-0.57,0.33,-0.57,0.33,-0.24,0.27],['c',0.39,-0.09,1.26,-0.09,1.68,0.00],['c',0.72,0.15,1.41,0.45,2.10,0.90],['c',0.99,0.63,1.86,0.87,2.55,0.75],['c',0.24,-0.06,0.42,-0.15,0.57,-0.30],['c',0.12,-0.09,0.30,-0.42,0.30,-0.51],['c',0.00,-0.09,0.12,-0.21,0.24,-0.24],['c',0.18,-0.03,0.39,0.12,0.39,0.30],['c',0.00,0.12,-0.15,0.57,-0.30,0.87],['c',-0.54,1.02,-1.56,1.74,-2.79,2.01],['c',-0.42,0.09,-1.23,0.09,-1.62,0.03],['c',-0.81,-0.18,-1.32,-0.45,-2.01,-1.11],['c',-0.45,-0.45,-0.63,-0.57,-0.96,-0.69],['c',-0.84,-0.27,-1.89,0.12,-2.25,0.90],['c',-0.12,0.21,-0.21,0.54,-0.21,0.72],['c',0.00,0.12,-0.12,0.21,-0.27,0.24],['c',-0.15,0.00,-0.27,-0.03,-0.33,-0.15],['c',-0.09,-0.21,0.09,-1.08,0.33,-1.71],['c',0.24,-0.66,0.66,-1.26,1.29,-1.89],['c',0.45,-0.45,0.90,-0.81,1.92,-1.56],['c',1.29,-0.93,1.89,-1.44,2.34,-1.98],['c',0.87,-1.05,1.26,-2.19,1.20,-3.63],['c',-0.06,-1.29,-0.39,-2.31,-0.96,-2.91],['c',-0.36,-0.33,-0.72,-0.51,-1.17,-0.54],['c',-0.84,-0.03,-1.53,0.42,-1.59,1.05],['c',-0.03,0.33,0.12,0.60,0.57,1.14],['c',0.45,0.54,0.54,0.87,0.42,1.41],['c',-0.15,0.63,-0.54,1.11,-1.08,1.38],['c',-0.63,0.33,-1.20,0.33,-1.83,0.00],['c',-0.24,-0.12,-0.33,-0.18,-0.54,-0.39],['c',-0.18,-0.18,-0.27,-0.30,-0.36,-0.51],['c',-0.24,-0.45,-0.27,-0.84,-0.21,-1.38],['c',0.12,-0.75,0.45,-1.41,1.02,-1.98],['c',0.72,-0.72,1.74,-1.17,2.85,-1.32],['z']],w:10.764,h:14.97},
		'3':{d:[['M',3.78,-14.97],['c',0.30,-0.03,1.41,0.00,1.83,0.06],['c',2.22,0.30,3.51,1.32,3.72,2.91],['c',0.03,0.33,0.03,1.26,-0.03,1.65],['c',-0.12,0.84,-0.48,1.47,-1.05,1.77],['c',-0.27,0.15,-0.36,0.24,-0.45,0.39],['c',-0.09,0.21,-0.09,0.36,0.00,0.57],['c',0.09,0.15,0.18,0.24,0.51,0.39],['c',0.75,0.42,1.23,1.14,1.41,2.13],['c',0.06,0.42,0.06,1.35,0.00,1.71],['c',-0.18,0.81,-0.48,1.38,-1.02,1.95],['c',-0.75,0.72,-1.80,1.20,-3.18,1.38],['c',-0.42,0.06,-1.56,0.06,-1.95,0.00],['c',-1.89,-0.33,-3.18,-1.29,-3.51,-2.64],['c',-0.03,-0.12,-0.03,-0.33,-0.03,-0.60],['c',0.00,-0.36,0.00,-0.42,0.06,-0.63],['c',0.12,-0.30,0.27,-0.51,0.51,-0.75],['c',0.24,-0.24,0.45,-0.39,0.75,-0.51],['c',0.21,-0.06,0.27,-0.06,0.60,-0.06],['c',0.33,0.00,0.39,0.00,0.60,0.06],['c',0.30,0.12,0.51,0.27,0.75,0.51],['c',0.36,0.33,0.57,0.75,0.60,1.20],['c',0.00,0.21,0.00,0.27,-0.06,0.42],['c',-0.09,0.18,-0.12,0.24,-0.54,0.54],['c',-0.51,0.36,-0.63,0.54,-0.60,0.87],['c',0.06,0.54,0.54,0.90,1.38,0.99],['c',0.36,0.06,0.72,0.03,0.96,-0.06],['c',0.81,-0.27,1.29,-1.23,1.44,-2.79],['c',0.03,-0.45,0.03,-1.95,-0.03,-2.37],['c',-0.09,-0.75,-0.33,-1.23,-0.75,-1.44],['c',-0.33,-0.18,-0.45,-0.18,-1.98,-0.18],['c',-1.35,0.00,-1.41,0.00,-1.50,-0.06],['c',-0.18,-0.12,-0.24,-0.39,-0.12,-0.60],['c',0.12,-0.15,0.15,-0.15,1.68,-0.15],['c',1.50,0.00,1.62,0.00,1.89,-0.15],['c',0.18,-0.09,0.42,-0.36,0.54,-0.57],['c',0.18,-0.42,0.27,-0.90,0.30,-1.95],['c',0.03,-1.20,-0.06,-1.80,-0.36,-2.37],['c',-0.24,-0.48,-0.63,-0.81,-1.14,-0.96],['c',-0.30,-0.06,-1.08,-0.06,-1.38,0.03],['c',-0.60,0.15,-0.90,0.42,-0.96,0.84],['c',-0.03,0.30,0.06,0.45,0.63,0.84],['c',0.33,0.24,0.42,0.39,0.45,0.63],['c',0.03,0.72,-0.57,1.50,-1.32,1.65],['c',-1.05,0.27,-2.10,-0.57,-2.10,-1.65],['c',0.00,-0.45,0.15,-0.96,0.39,-1.38],['c',0.12,-0.21,0.54,-0.63,0.81,-0.81],['c',0.57,-0.42,1.38,-0.69,2.25,-0.81],['z']],w:9.735,h:14.967},
		'4':{d:[['M',8.64,-14.94],['c',0.27,-0.09,0.42,-0.12,0.54,-0.03],['c',0.09,0.06,0.15,0.21,0.15,0.30],['c',-0.03,0.06,-1.92,2.31,-4.23,5.04],['c',-2.31,2.73,-4.23,4.98,-4.26,5.01],['c',-0.03,0.06,0.12,0.06,2.55,0.06],['l',2.61,0.00],['l',0.00,-2.37],['c',0.00,-2.19,0.03,-2.37,0.06,-2.46],['c',0.03,-0.06,0.21,-0.18,0.57,-0.42],['c',1.08,-0.72,1.38,-1.08,1.86,-2.16],['c',0.12,-0.30,0.24,-0.54,0.27,-0.57],['c',0.12,-0.12,0.39,-0.06,0.45,0.12],['c',0.06,0.09,0.06,0.57,0.06,3.96],['l',0.00,3.90],['l',1.08,0.00],['c',1.05,0.00,1.11,0.00,1.20,0.06],['c',0.24,0.15,0.24,0.54,0.00,0.69],['c',-0.09,0.06,-0.15,0.06,-1.20,0.06],['l',-1.08,0.00],['l',0.00,0.33],['c',0.00,0.57,0.09,1.11,0.30,1.53],['c',0.36,0.75,0.93,1.17,1.68,1.26],['c',0.30,0.03,0.39,0.09,0.39,0.30],['c',0.00,0.15,-0.03,0.18,-0.09,0.24],['c',-0.06,0.06,-0.09,0.06,-0.48,0.06],['c',-0.42,0.00,-0.69,-0.03,-2.10,-0.24],['c',-0.90,-0.15,-1.77,-0.15,-2.67,0.00],['c',-1.41,0.21,-1.68,0.24,-2.10,0.24],['c',-0.39,0.00,-0.42,0.00,-0.48,-0.06],['c',-0.06,-0.06,-0.06,-0.09,-0.06,-0.24],['c',0.00,-0.21,0.06,-0.27,0.36,-0.30],['c',0.75,-0.09,1.32,-0.51,1.68,-1.26],['c',0.21,-0.42,0.30,-0.96,0.30,-1.53],['l',0.00,-0.33],['l',-2.70,0.00],['c',-2.91,0.00,-2.85,0.00,-3.09,-0.15],['c',-0.18,-0.12,-0.30,-0.39,-0.27,-0.54],['c',0.03,-0.06,0.18,-0.24,0.33,-0.45],['c',0.75,-0.90,1.59,-2.07,2.13,-3.03],['c',0.33,-0.54,0.84,-1.62,1.05,-2.16],['c',0.57,-1.41,0.84,-2.64,0.90,-4.05],['c',0.03,-0.63,0.06,-0.72,0.24,-0.81],['l',0.12,-0.06],['l',0.45,0.12],['c',0.66,0.18,1.02,0.24,1.47,0.27],['c',0.60,0.03,1.23,-0.09,2.01,-0.33],['z']],w:11.795,h:14.994},
		'5':{d:[['M',1.02,-14.94],['c',0.12,-0.09,0.03,-0.09,1.08,0.06],['c',2.49,0.36,4.35,0.36,6.96,-0.06],['c',0.57,-0.09,0.66,-0.06,0.81,0.06],['c',0.15,0.18,0.12,0.24,-0.15,0.51],['c',-1.29,1.26,-3.24,2.04,-5.58,2.31],['c',-0.60,0.09,-1.20,0.12,-1.71,0.12],['c',-0.39,0.00,-0.45,0.00,-0.57,0.06],['c',-0.09,0.06,-0.15,0.12,-0.21,0.21],['l',-0.06,0.12],['l',0.00,1.65],['l',0.00,1.65],['l',0.21,-0.21],['c',0.66,-0.57,1.41,-0.96,2.19,-1.14],['c',0.33,-0.06,1.41,-0.06,1.95,0.00],['c',2.61,0.36,4.02,1.74,4.26,4.14],['c',0.03,0.45,0.03,1.08,-0.03,1.44],['c',-0.18,1.02,-0.78,2.01,-1.59,2.70],['c',-0.72,0.57,-1.62,1.02,-2.49,1.20],['c',-1.38,0.27,-3.03,0.06,-4.20,-0.54],['c',-1.08,-0.54,-1.71,-1.32,-1.86,-2.28],['c',-0.09,-0.69,0.09,-1.29,0.57,-1.74],['c',0.24,-0.24,0.45,-0.39,0.75,-0.51],['c',0.21,-0.06,0.27,-0.06,0.60,-0.06],['c',0.33,0.00,0.39,0.00,0.60,0.06],['c',0.30,0.12,0.51,0.27,0.75,0.51],['c',0.36,0.33,0.57,0.75,0.60,1.20],['c',0.00,0.21,0.00,0.27,-0.06,0.42],['c',-0.09,0.18,-0.12,0.24,-0.54,0.54],['c',-0.18,0.12,-0.36,0.30,-0.42,0.33],['c',-0.36,0.42,-0.18,0.99,0.36,1.26],['c',0.51,0.27,1.47,0.36,2.01,0.27],['c',0.93,-0.21,1.47,-1.17,1.65,-2.91],['c',0.06,-0.45,0.06,-1.89,0.00,-2.31],['c',-0.15,-1.20,-0.51,-2.10,-1.05,-2.55],['c',-0.21,-0.18,-0.54,-0.36,-0.81,-0.39],['c',-0.30,-0.06,-0.84,-0.03,-1.26,0.06],['c',-0.93,0.18,-1.65,0.60,-2.16,1.20],['c',-0.15,0.21,-0.27,0.30,-0.39,0.30],['c',-0.15,0.00,-0.30,-0.09,-0.36,-0.18],['c',-0.06,-0.09,-0.06,-0.15,-0.06,-3.66],['c',0.00,-3.39,0.00,-3.57,0.06,-3.66],['c',0.03,-0.06,0.09,-0.15,0.15,-0.18],['z']],w:10.212,h:14.997},
		'6':{d:[['M',4.98,-14.97],['c',0.36,-0.03,1.20,0.00,1.59,0.06],['c',0.90,0.15,1.68,0.51,2.25,1.05],['c',0.57,0.51,0.87,1.23,0.84,1.98],['c',-0.03,0.51,-0.21,0.90,-0.60,1.26],['c',-0.24,0.24,-0.45,0.39,-0.75,0.51],['c',-0.21,0.06,-0.27,0.06,-0.60,0.06],['c',-0.33,0.00,-0.39,0.00,-0.60,-0.06],['c',-0.30,-0.12,-0.51,-0.27,-0.75,-0.51],['c',-0.39,-0.36,-0.57,-0.78,-0.57,-1.26],['c',0.00,-0.27,0.00,-0.30,0.09,-0.42],['c',0.03,-0.09,0.18,-0.21,0.30,-0.30],['c',0.12,-0.09,0.30,-0.21,0.39,-0.27],['c',0.09,-0.06,0.21,-0.18,0.27,-0.24],['c',0.06,-0.12,0.09,-0.15,0.09,-0.33],['c',0.00,-0.18,-0.03,-0.24,-0.09,-0.36],['c',-0.24,-0.39,-0.75,-0.60,-1.38,-0.57],['c',-0.54,0.03,-0.90,0.18,-1.23,0.48],['c',-0.81,0.72,-1.08,2.16,-0.96,5.37],['l',0.00,0.63],['l',0.30,-0.12],['c',0.78,-0.27,1.29,-0.33,2.10,-0.27],['c',1.47,0.12,2.49,0.54,3.27,1.29],['c',0.48,0.51,0.81,1.11,0.96,1.89],['c',0.06,0.27,0.06,0.42,0.06,0.93],['c',0.00,0.54,0.00,0.69,-0.06,0.96],['c',-0.15,0.78,-0.48,1.38,-0.96,1.89],['c',-0.54,0.51,-1.17,0.87,-1.98,1.08],['c',-1.14,0.30,-2.40,0.33,-3.24,0.03],['c',-1.50,-0.48,-2.64,-1.89,-3.27,-4.02],['c',-0.36,-1.23,-0.51,-2.82,-0.42,-4.08],['c',0.30,-3.66,2.28,-6.30,4.95,-6.66],['z'],['m',0.66,7.41],['c',-0.27,-0.09,-0.81,-0.12,-1.08,-0.06],['c',-0.72,0.18,-1.08,0.69,-1.23,1.71],['c',-0.06,0.54,-0.06,3.00,0.00,3.54],['c',0.18,1.26,0.72,1.77,1.80,1.74],['c',0.39,-0.03,0.63,-0.09,0.90,-0.27],['c',0.66,-0.42,0.90,-1.32,0.90,-3.24],['c',0.00,-2.22,-0.36,-3.12,-1.29,-3.42],['z']],w:9.956,h:14.982},
		'7':{d:[['M',0.21,-14.97],['c',0.21,-0.06,0.45,0.00,0.54,0.15],['c',0.06,0.09,0.06,0.15,0.06,0.39],['c',0.00,0.24,0.00,0.33,0.06,0.42],['c',0.06,0.12,0.21,0.24,0.27,0.24],['c',0.03,0.00,0.12,-0.12,0.24,-0.21],['c',0.96,-1.20,2.58,-1.35,3.99,-0.42],['c',0.15,0.12,0.42,0.30,0.54,0.45],['c',0.48,0.39,0.81,0.57,1.29,0.60],['c',0.69,0.03,1.50,-0.30,2.13,-0.87],['c',0.09,-0.09,0.27,-0.30,0.39,-0.45],['c',0.12,-0.15,0.24,-0.27,0.30,-0.30],['c',0.18,-0.06,0.39,0.03,0.51,0.21],['c',0.06,0.18,0.06,0.24,-0.27,0.72],['c',-0.18,0.24,-0.54,0.78,-0.78,1.17],['c',-2.37,3.54,-3.54,6.27,-3.87,9.00],['c',-0.03,0.33,-0.03,0.66,-0.03,1.26],['c',0.00,0.90,0.00,1.08,0.15,1.89],['c',0.06,0.45,0.06,0.48,0.03,0.60],['c',-0.06,0.09,-0.21,0.21,-0.30,0.21],['c',-0.03,0.00,-0.27,-0.06,-0.54,-0.15],['c',-0.84,-0.27,-1.11,-0.30,-1.65,-0.30],['c',-0.57,0.00,-0.84,0.03,-1.56,0.27],['c',-0.60,0.18,-0.69,0.21,-0.81,0.15],['c',-0.12,-0.06,-0.21,-0.18,-0.21,-0.30],['c',0.00,-0.15,0.60,-1.44,1.20,-2.61],['c',1.14,-2.22,2.73,-4.68,5.10,-8.01],['c',0.21,-0.27,0.36,-0.48,0.33,-0.48],['c',0.00,0.00,-0.12,0.06,-0.27,0.12],['c',-0.54,0.30,-0.99,0.39,-1.56,0.39],['c',-0.75,0.03,-1.20,-0.18,-1.83,-0.75],['c',-0.99,-0.90,-1.83,-1.17,-2.31,-0.72],['c',-0.18,0.15,-0.36,0.51,-0.45,0.84],['c',-0.06,0.24,-0.06,0.33,-0.09,1.98],['c',0.00,1.62,-0.03,1.74,-0.06,1.80],['c',-0.15,0.24,-0.54,0.24,-0.69,0.00],['c',-0.06,-0.09,-0.06,-0.15,-0.06,-3.57],['c',0.00,-3.42,0.00,-3.48,0.06,-3.57],['c',0.03,-0.06,0.09,-0.12,0.15,-0.15],['z']],w:10.561,h:15.093},
		'8':{d:[['M',4.98,-14.97],['c',0.33,-0.03,1.02,-0.03,1.32,0.00],['c',1.32,0.12,2.49,0.60,3.21,1.32],['c',0.39,0.39,0.66,0.81,0.78,1.29],['c',0.09,0.36,0.09,1.08,0.00,1.44],['c',-0.21,0.84,-0.66,1.59,-1.59,2.55],['l',-0.30,0.30],['l',0.27,0.18],['c',1.47,0.93,2.31,2.31,2.25,3.75],['c',-0.03,0.75,-0.24,1.35,-0.63,1.95],['c',-0.45,0.66,-1.02,1.14,-1.83,1.53],['c',-1.80,0.87,-4.20,0.87,-6.00,0.03],['c',-1.62,-0.78,-2.52,-2.16,-2.46,-3.66],['c',0.06,-0.99,0.54,-1.77,1.80,-2.97],['c',0.54,-0.51,0.54,-0.54,0.48,-0.57],['c',-0.39,-0.27,-0.96,-0.78,-1.20,-1.14],['c',-0.75,-1.11,-0.87,-2.40,-0.30,-3.60],['c',0.69,-1.35,2.25,-2.25,4.20,-2.40],['z'],['m',1.53,0.69],['c',-0.42,-0.09,-1.11,-0.12,-1.38,-0.06],['c',-0.30,0.06,-0.60,0.18,-0.81,0.30],['c',-0.21,0.12,-0.60,0.51,-0.72,0.72],['c',-0.51,0.87,-0.42,1.89,0.21,2.52],['c',0.21,0.21,0.36,0.30,1.95,1.23],['c',0.96,0.54,1.74,0.99,1.77,1.02],['c',0.09,0.00,0.63,-0.60,0.99,-1.11],['c',0.21,-0.36,0.48,-0.87,0.57,-1.23],['c',0.06,-0.24,0.06,-0.36,0.06,-0.72],['c',0.00,-0.45,-0.03,-0.66,-0.15,-0.99],['c',-0.39,-0.81,-1.29,-1.44,-2.49,-1.68],['z'],['m',-1.44,8.07],['l',-1.89,-1.08],['c',-0.03,0.00,-0.18,0.15,-0.39,0.33],['c',-1.20,1.08,-1.65,1.95,-1.59,3.00],['c',0.09,1.59,1.35,2.85,3.21,3.24],['c',0.33,0.06,0.45,0.06,0.93,0.06],['c',0.63,0.00,0.81,-0.03,1.29,-0.27],['c',0.90,-0.42,1.47,-1.41,1.41,-2.40],['c',-0.06,-0.66,-0.39,-1.29,-0.90,-1.65],['c',-0.12,-0.09,-1.05,-0.63,-2.07,-1.23],['z']],w:10.926,h:14.989},
		'9':{d:[['M',4.23,-14.97],['c',0.42,-0.03,1.29,0.00,1.62,0.06],['c',0.51,0.12,0.93,0.30,1.38,0.57],['c',1.53,1.02,2.52,3.24,2.73,5.94],['c',0.18,2.55,-0.48,4.98,-1.83,6.57],['c',-1.05,1.26,-2.40,1.89,-3.93,1.83],['c',-1.23,-0.06,-2.31,-0.45,-3.03,-1.14],['c',-0.57,-0.51,-0.87,-1.23,-0.84,-1.98],['c',0.03,-0.51,0.21,-0.90,0.60,-1.26],['c',0.24,-0.24,0.45,-0.39,0.75,-0.51],['c',0.21,-0.06,0.27,-0.06,0.60,-0.06],['c',0.33,0.00,0.39,0.00,0.60,0.06],['c',0.30,0.12,0.51,0.27,0.75,0.51],['c',0.39,0.36,0.57,0.78,0.57,1.26],['c',0.00,0.27,0.00,0.30,-0.09,0.42],['c',-0.03,0.09,-0.18,0.21,-0.30,0.30],['c',-0.12,0.09,-0.30,0.21,-0.39,0.27],['c',-0.09,0.06,-0.21,0.18,-0.27,0.24],['c',-0.06,0.12,-0.06,0.15,-0.06,0.33],['c',0.00,0.18,0.00,0.24,0.06,0.36],['c',0.24,0.39,0.75,0.60,1.38,0.57],['c',0.54,-0.03,0.90,-0.18,1.23,-0.48],['c',0.81,-0.72,1.08,-2.16,0.96,-5.37],['l',0.00,-0.63],['l',-0.30,0.12],['c',-0.78,0.27,-1.29,0.33,-2.10,0.27],['c',-1.47,-0.12,-2.49,-0.54,-3.27,-1.29],['c',-0.48,-0.51,-0.81,-1.11,-0.96,-1.89],['c',-0.06,-0.27,-0.06,-0.42,-0.06,-0.96],['c',0.00,-0.51,0.00,-0.66,0.06,-0.93],['c',0.15,-0.78,0.48,-1.38,0.96,-1.89],['c',0.15,-0.12,0.33,-0.27,0.42,-0.36],['c',0.69,-0.51,1.62,-0.81,2.76,-0.93],['z'],['m',1.17,0.66],['c',-0.21,-0.06,-0.57,-0.06,-0.81,-0.03],['c',-0.78,0.12,-1.26,0.69,-1.41,1.74],['c',-0.12,0.63,-0.15,1.95,-0.09,2.79],['c',0.12,1.71,0.63,2.40,1.77,2.46],['c',1.08,0.03,1.62,-0.48,1.80,-1.74],['c',0.06,-0.54,0.06,-3.00,0.00,-3.54],['c',-0.15,-1.05,-0.51,-1.53,-1.26,-1.68],['z']],w:9.959,h:14.986},
		'rests.whole':{d:[['M',0.06,0.03],['l',0.09,-0.06],['l',5.46,0.00],['l',5.49,0.00],['l',0.09,0.06],['l',0.06,0.09],['l',0.00,2.19],['l',0.00,2.19],['l',-0.06,0.09],['l',-0.09,0.06],['l',-5.49,0.00],['l',-5.46,0.00],['l',-0.09,-0.06],['l',-0.06,-0.09],['l',0.00,-2.19],['l',0.00,-2.19],['z']],w:11.25,h:4.68},
		'rests.half':{d:[['M',0.06,-4.62],['l',0.09,-0.06],['l',5.46,0.00],['l',5.49,0.00],['l',0.09,0.06],['l',0.06,0.09],['l',0.00,2.19],['l',0.00,2.19],['l',-0.06,0.09],['l',-0.09,0.06],['l',-5.49,0.00],['l',-5.46,0.00],['l',-0.09,-0.06],['l',-0.06,-0.09],['l',0.00,-2.19],['l',0.00,-2.19],['z']],w:11.25,h:4.68},
		'rests.quarter':{d:[['M',1.89,-11.82],['c',0.12,-0.06,0.24,-0.06,0.36,-0.03],['c',0.09,0.06,4.74,5.58,4.86,5.82],['c',0.21,0.39,0.15,0.78,-0.15,1.26],['c',-0.24,0.33,-0.72,0.81,-1.62,1.56],['c',-0.45,0.36,-0.87,0.75,-0.96,0.84],['c',-0.93,0.99,-1.14,2.49,-0.60,3.63],['c',0.18,0.39,0.27,0.48,1.32,1.68],['c',1.92,2.25,1.83,2.16,1.83,2.34],['c',0.00,0.18,-0.18,0.36,-0.36,0.39],['c',-0.15,0.00,-0.27,-0.06,-0.48,-0.27],['c',-0.75,-0.75,-2.46,-1.29,-3.39,-1.08],['c',-0.45,0.09,-0.69,0.27,-0.90,0.69],['c',-0.12,0.30,-0.21,0.66,-0.24,1.14],['c',-0.03,0.66,0.09,1.35,0.30,2.01],['c',0.15,0.42,0.24,0.66,0.45,0.96],['c',0.18,0.24,0.18,0.33,0.03,0.42],['c',-0.12,0.06,-0.18,0.03,-0.45,-0.30],['c',-1.08,-1.38,-2.07,-3.36,-2.40,-4.83],['c',-0.27,-1.05,-0.15,-1.77,0.27,-2.07],['c',0.21,-0.12,0.42,-0.15,0.87,-0.15],['c',0.87,0.06,2.10,0.39,3.30,0.90],['l',0.39,0.18],['l',-1.65,-1.95],['c',-2.52,-2.97,-2.61,-3.09,-2.70,-3.27],['c',-0.09,-0.24,-0.12,-0.48,-0.03,-0.75],['c',0.15,-0.48,0.57,-0.96,1.83,-2.01],['c',0.45,-0.36,0.84,-0.72,0.93,-0.78],['c',0.69,-0.75,1.02,-1.80,0.90,-2.79],['c',-0.06,-0.33,-0.21,-0.84,-0.39,-1.11],['c',-0.09,-0.15,-0.45,-0.60,-0.81,-1.05],['c',-0.36,-0.42,-0.69,-0.81,-0.72,-0.87],['c',-0.09,-0.18,0.00,-0.42,0.21,-0.51],['z']],w:7.888,h:21.435},
		'rests.8th':{d:[['M',1.68,-6.12],['c',0.66,-0.09,1.23,0.09,1.68,0.51],['c',0.27,0.30,0.39,0.54,0.57,1.26],['c',0.09,0.33,0.18,0.66,0.21,0.72],['c',0.12,0.27,0.33,0.45,0.60,0.48],['c',0.12,0.00,0.18,0.00,0.33,-0.09],['c',0.39,-0.18,1.32,-1.29,1.68,-1.98],['c',0.09,-0.21,0.24,-0.30,0.39,-0.30],['c',0.12,0.00,0.27,0.09,0.33,0.18],['c',0.03,0.06,-0.27,1.11,-1.86,6.42],['c',-1.02,3.48,-1.89,6.39,-1.92,6.42],['c',0.00,0.03,-0.12,0.12,-0.24,0.15],['c',-0.18,0.09,-0.21,0.09,-0.45,0.09],['c',-0.24,0.00,-0.30,0.00,-0.48,-0.06],['c',-0.09,-0.06,-0.21,-0.12,-0.21,-0.15],['c',-0.06,-0.03,0.15,-0.57,1.68,-4.92],['c',0.96,-2.67,1.74,-4.89,1.71,-4.89],['l',-0.51,0.15],['c',-1.08,0.36,-1.74,0.48,-2.55,0.48],['c',-0.66,0.00,-0.84,-0.03,-1.32,-0.27],['c',-1.32,-0.63,-1.77,-2.16,-1.02,-3.30],['c',0.33,-0.45,0.84,-0.81,1.38,-0.90],['z']],w:7.534,h:13.883},
		'rests.16th':{d:[['M',3.33,-6.12],['c',0.66,-0.09,1.23,0.09,1.68,0.51],['c',0.27,0.30,0.39,0.54,0.57,1.26],['c',0.09,0.33,0.18,0.66,0.21,0.72],['c',0.15,0.39,0.57,0.57,0.87,0.42],['c',0.39,-0.18,1.20,-1.23,1.62,-2.07],['c',0.06,-0.15,0.24,-0.24,0.36,-0.24],['c',0.12,0.00,0.27,0.09,0.33,0.18],['c',0.03,0.06,-0.45,1.86,-2.67,10.17],['c',-1.50,5.55,-2.73,10.14,-2.76,10.17],['c',-0.03,0.03,-0.12,0.12,-0.24,0.15],['c',-0.18,0.09,-0.21,0.09,-0.45,0.09],['c',-0.24,0.00,-0.30,0.00,-0.48,-0.06],['c',-0.09,-0.06,-0.21,-0.12,-0.21,-0.15],['c',-0.06,-0.03,0.12,-0.57,1.44,-4.92],['c',0.81,-2.67,1.47,-4.86,1.47,-4.89],['c',-0.03,0.00,-0.27,0.06,-0.54,0.15],['c',-1.08,0.36,-1.77,0.48,-2.58,0.48],['c',-0.66,0.00,-0.84,-0.03,-1.32,-0.27],['c',-1.32,-0.63,-1.77,-2.16,-1.02,-3.30],['c',0.72,-1.05,2.22,-1.23,3.06,-0.42],['c',0.30,0.33,0.42,0.60,0.60,1.38],['c',0.09,0.45,0.21,0.78,0.33,0.90],['c',0.09,0.09,0.27,0.18,0.45,0.21],['c',0.12,0.00,0.18,0.00,0.33,-0.09],['c',0.33,-0.15,1.02,-0.93,1.41,-1.59],['c',0.12,-0.21,0.18,-0.39,0.39,-1.08],['c',0.66,-2.10,1.17,-3.84,1.17,-3.87],['c',0.00,0.00,-0.21,0.06,-0.42,0.15],['c',-0.51,0.15,-1.20,0.33,-1.68,0.42],['c',-0.33,0.06,-0.51,0.06,-0.96,0.06],['c',-0.66,0.00,-0.84,-0.03,-1.32,-0.27],['c',-1.32,-0.63,-1.77,-2.16,-1.02,-3.30],['c',0.33,-0.45,0.84,-0.81,1.38,-0.90],['z']],w:9.724,h:21.383},
		'rests.32nd':{d:[['M',4.23,-13.62],['c',0.66,-0.09,1.23,0.09,1.68,0.51],['c',0.27,0.30,0.39,0.54,0.57,1.26],['c',0.09,0.33,0.18,0.66,0.21,0.72],['c',0.12,0.27,0.33,0.45,0.60,0.48],['c',0.12,0.00,0.18,0.00,0.27,-0.06],['c',0.33,-0.21,0.99,-1.11,1.44,-1.98],['c',0.09,-0.24,0.21,-0.33,0.39,-0.33],['c',0.12,0.00,0.27,0.09,0.33,0.18],['c',0.03,0.06,-0.57,2.67,-3.21,13.89],['c',-1.80,7.62,-3.30,13.89,-3.30,13.92],['c',-0.03,0.06,-0.12,0.12,-0.24,0.18],['c',-0.21,0.09,-0.24,0.09,-0.48,0.09],['c',-0.24,0.00,-0.30,0.00,-0.48,-0.06],['c',-0.09,-0.06,-0.21,-0.12,-0.21,-0.15],['c',-0.06,-0.03,0.09,-0.57,1.23,-4.92],['c',0.69,-2.67,1.26,-4.86,1.29,-4.89],['c',0.00,-0.03,-0.12,-0.03,-0.48,0.12],['c',-1.17,0.39,-2.22,0.57,-3.00,0.54],['c',-0.42,-0.03,-0.75,-0.12,-1.11,-0.30],['c',-1.32,-0.63,-1.77,-2.16,-1.02,-3.30],['c',0.72,-1.05,2.22,-1.23,3.06,-0.42],['c',0.30,0.33,0.42,0.60,0.60,1.38],['c',0.09,0.45,0.21,0.78,0.33,0.90],['c',0.12,0.09,0.30,0.18,0.48,0.21],['c',0.12,0.00,0.18,0.00,0.30,-0.09],['c',0.42,-0.21,1.29,-1.29,1.56,-1.89],['c',0.03,-0.12,1.23,-4.59,1.23,-4.65],['c',0.00,-0.03,-0.18,0.03,-0.39,0.12],['c',-0.63,0.18,-1.20,0.36,-1.74,0.45],['c',-0.39,0.06,-0.54,0.06,-1.02,0.06],['c',-0.66,0.00,-0.84,-0.03,-1.32,-0.27],['c',-1.32,-0.63,-1.77,-2.16,-1.02,-3.30],['c',0.72,-1.05,2.22,-1.23,3.06,-0.42],['c',0.30,0.33,0.42,0.60,0.60,1.38],['c',0.09,0.45,0.21,0.78,0.33,0.90],['c',0.18,0.18,0.51,0.27,0.72,0.15],['c',0.30,-0.12,0.69,-0.57,1.08,-1.17],['c',0.42,-0.60,0.39,-0.51,1.05,-3.03],['c',0.33,-1.26,0.60,-2.31,0.60,-2.34],['c',0.00,0.00,-0.21,0.03,-0.45,0.12],['c',-0.57,0.18,-1.14,0.33,-1.62,0.42],['c',-0.33,0.06,-0.51,0.06,-0.96,0.06],['c',-0.66,0.00,-0.84,-0.03,-1.32,-0.27],['c',-1.32,-0.63,-1.77,-2.16,-1.02,-3.30],['c',0.33,-0.45,0.84,-0.81,1.38,-0.90],['z']],w:11.373,h:28.883},
		'rests.64th':{d:[['M',5.13,-13.62],['c',0.66,-0.09,1.23,0.09,1.68,0.51],['c',0.27,0.30,0.39,0.54,0.57,1.26],['c',0.15,0.63,0.21,0.81,0.33,0.96],['c',0.18,0.21,0.54,0.30,0.75,0.18],['c',0.24,-0.12,0.63,-0.66,1.08,-1.56],['c',0.33,-0.66,0.39,-0.72,0.60,-0.72],['c',0.12,0.00,0.27,0.09,0.33,0.18],['c',0.03,0.06,-0.69,3.66,-3.54,17.64],['c',-1.95,9.66,-3.57,17.61,-3.57,17.64],['c',-0.03,0.06,-0.12,0.12,-0.24,0.18],['c',-0.21,0.09,-0.24,0.09,-0.48,0.09],['c',-0.24,0.00,-0.30,0.00,-0.48,-0.06],['c',-0.09,-0.06,-0.21,-0.12,-0.21,-0.15],['c',-0.06,-0.03,0.06,-0.57,1.05,-4.95],['c',0.60,-2.70,1.08,-4.89,1.08,-4.92],['c',0.00,0.00,-0.24,0.06,-0.51,0.15],['c',-0.66,0.24,-1.20,0.36,-1.77,0.48],['c',-0.42,0.06,-0.57,0.06,-1.05,0.06],['c',-0.69,0.00,-0.87,-0.03,-1.35,-0.27],['c',-1.32,-0.63,-1.77,-2.16,-1.02,-3.30],['c',0.72,-1.05,2.22,-1.23,3.06,-0.42],['c',0.30,0.33,0.42,0.60,0.60,1.38],['c',0.09,0.45,0.21,0.78,0.33,0.90],['c',0.09,0.09,0.27,0.18,0.45,0.21],['c',0.21,0.03,0.39,-0.09,0.72,-0.42],['c',0.45,-0.45,1.02,-1.26,1.17,-1.65],['c',0.03,-0.09,0.27,-1.14,0.54,-2.34],['c',0.27,-1.20,0.48,-2.19,0.51,-2.22],['c',0.00,-0.03,-0.09,-0.03,-0.48,0.12],['c',-1.17,0.39,-2.22,0.57,-3.00,0.54],['c',-0.42,-0.03,-0.75,-0.12,-1.11,-0.30],['c',-1.32,-0.63,-1.77,-2.16,-1.02,-3.30],['c',0.36,-0.54,0.96,-0.87,1.65,-0.93],['c',0.54,-0.03,1.02,0.15,1.41,0.54],['c',0.27,0.30,0.39,0.54,0.57,1.26],['c',0.09,0.33,0.18,0.66,0.21,0.72],['c',0.15,0.39,0.57,0.57,0.90,0.42],['c',0.36,-0.18,1.20,-1.26,1.47,-1.89],['c',0.03,-0.09,0.30,-1.20,0.57,-2.43],['l',0.51,-2.28],['l',-0.54,0.18],['c',-1.11,0.36,-1.80,0.48,-2.61,0.48],['c',-0.66,0.00,-0.84,-0.03,-1.32,-0.27],['c',-1.32,-0.63,-1.77,-2.16,-1.02,-3.30],['c',0.36,-0.54,0.96,-0.87,1.65,-0.93],['c',0.54,-0.03,1.02,0.15,1.41,0.54],['c',0.27,0.30,0.39,0.54,0.57,1.26],['c',0.15,0.63,0.21,0.81,0.33,0.96],['c',0.21,0.21,0.54,0.30,0.75,0.18],['c',0.36,-0.18,0.93,-0.93,1.29,-1.68],['c',0.12,-0.24,0.18,-0.48,0.63,-2.55],['l',0.51,-2.31],['c',0.00,-0.03,-0.18,0.03,-0.39,0.12],['c',-1.14,0.36,-2.10,0.54,-2.82,0.51],['c',-0.42,-0.03,-0.75,-0.12,-1.11,-0.30],['c',-1.32,-0.63,-1.77,-2.16,-1.02,-3.30],['c',0.33,-0.45,0.84,-0.81,1.38,-0.90],['z']],w:12.453,h:36.383},
		'rests.128th':{d:[['M',6.03,-21.12],['c',0.66,-0.09,1.23,0.09,1.68,0.51],['c',0.27,0.30,0.39,0.54,0.57,1.26],['c',0.09,0.33,0.18,0.66,0.21,0.72],['c',0.12,0.27,0.33,0.45,0.60,0.48],['c',0.21,0.00,0.33,-0.06,0.54,-0.36],['c',0.15,-0.21,0.54,-0.93,0.78,-1.47],['c',0.15,-0.33,0.18,-0.39,0.30,-0.48],['c',0.18,-0.09,0.45,0.00,0.51,0.15],['c',0.03,0.09,-7.11,42.75,-7.17,42.84],['c',-0.03,0.03,-0.15,0.09,-0.24,0.15],['c',-0.18,0.06,-0.24,0.06,-0.45,0.06],['c',-0.24,0.00,-0.30,0.00,-0.48,-0.06],['c',-0.09,-0.06,-0.21,-0.12,-0.21,-0.15],['c',-0.06,-0.03,0.03,-0.57,0.84,-4.98],['c',0.51,-2.70,0.93,-4.92,0.90,-4.92],['c',0.00,0.00,-0.15,0.06,-0.36,0.12],['c',-0.78,0.27,-1.62,0.48,-2.31,0.57],['c',-0.15,0.03,-0.54,0.03,-0.81,0.03],['c',-0.66,0.00,-0.84,-0.03,-1.32,-0.27],['c',-1.32,-0.63,-1.77,-2.16,-1.02,-3.30],['c',0.36,-0.54,0.96,-0.87,1.65,-0.93],['c',0.54,-0.03,1.02,0.15,1.41,0.54],['c',0.27,0.30,0.39,0.54,0.57,1.26],['c',0.09,0.33,0.18,0.66,0.21,0.72],['c',0.12,0.27,0.33,0.45,0.63,0.48],['c',0.12,0.00,0.18,0.00,0.30,-0.09],['c',0.42,-0.21,1.14,-1.11,1.50,-1.83],['c',0.12,-0.27,0.12,-0.27,0.54,-2.52],['c',0.24,-1.23,0.42,-2.25,0.39,-2.25],['c',0.00,0.00,-0.24,0.06,-0.51,0.18],['c',-1.26,0.39,-2.25,0.57,-3.06,0.54],['c',-0.42,-0.03,-0.75,-0.12,-1.11,-0.30],['c',-1.32,-0.63,-1.77,-2.16,-1.02,-3.30],['c',0.36,-0.54,0.96,-0.87,1.65,-0.93],['c',0.54,-0.03,1.02,0.15,1.41,0.54],['c',0.27,0.30,0.39,0.54,0.57,1.26],['c',0.15,0.63,0.21,0.81,0.33,0.96],['c',0.18,0.21,0.51,0.30,0.75,0.18],['c',0.36,-0.15,1.05,-0.99,1.41,-1.77],['l',0.15,-0.30],['l',0.42,-2.25],['c',0.21,-1.26,0.42,-2.28,0.39,-2.28],['l',-0.51,0.15],['c',-1.11,0.39,-1.89,0.51,-2.70,0.51],['c',-0.66,0.00,-0.84,-0.03,-1.32,-0.27],['c',-1.32,-0.63,-1.77,-2.16,-1.02,-3.30],['c',0.36,-0.54,0.96,-0.87,1.65,-0.93],['c',0.54,-0.03,1.02,0.15,1.41,0.54],['c',0.27,0.30,0.39,0.54,0.57,1.26],['c',0.15,0.63,0.21,0.81,0.33,0.96],['c',0.18,0.18,0.48,0.27,0.72,0.21],['c',0.33,-0.12,1.14,-1.26,1.41,-1.95],['c',0.00,-0.09,0.21,-1.11,0.45,-2.34],['c',0.21,-1.20,0.39,-2.22,0.39,-2.28],['c',0.03,-0.03,0.00,-0.03,-0.45,0.12],['c',-0.57,0.18,-1.20,0.33,-1.71,0.42],['c',-0.30,0.06,-0.51,0.06,-0.93,0.06],['c',-0.66,0.00,-0.84,-0.03,-1.32,-0.27],['c',-1.32,-0.63,-1.77,-2.16,-1.02,-3.30],['c',0.36,-0.54,0.96,-0.87,1.65,-0.93],['c',0.54,-0.03,1.02,0.15,1.41,0.54],['c',0.27,0.30,0.39,0.54,0.57,1.26],['c',0.09,0.33,0.18,0.66,0.21,0.72],['c',0.12,0.27,0.33,0.45,0.60,0.48],['c',0.18,0.00,0.36,-0.09,0.57,-0.33],['c',0.33,-0.36,0.78,-1.14,0.93,-1.56],['c',0.03,-0.12,0.24,-1.20,0.45,-2.40],['c',0.24,-1.20,0.42,-2.22,0.42,-2.28],['c',0.03,-0.03,0.00,-0.03,-0.39,0.09],['c',-1.05,0.36,-1.80,0.48,-2.58,0.48],['c',-0.63,0.00,-0.84,-0.03,-1.29,-0.27],['c',-1.32,-0.63,-1.77,-2.16,-1.02,-3.30],['c',0.33,-0.45,0.84,-0.81,1.38,-0.90],['z']],w:12.992,h:43.883},
		'accidentals.sharp':{d:[['M',5.73,-11.19],['c',0.21,-0.12,0.54,-0.03,0.66,0.24],['c',0.06,0.12,0.06,0.21,0.06,2.31],['c',0.00,1.23,0.00,2.22,0.03,2.22],['c',0.00,0.00,0.27,-0.12,0.60,-0.24],['c',0.69,-0.27,0.78,-0.30,0.96,-0.15],['c',0.21,0.15,0.21,0.18,0.21,1.38],['c',0.00,1.02,0.00,1.11,-0.06,1.20],['c',-0.03,0.06,-0.09,0.12,-0.12,0.15],['c',-0.06,0.03,-0.42,0.21,-0.84,0.36],['l',-0.75,0.33],['l',-0.03,2.43],['c',0.00,1.32,0.00,2.43,0.03,2.43],['c',0.00,0.00,0.27,-0.12,0.60,-0.24],['c',0.69,-0.27,0.78,-0.30,0.96,-0.15],['c',0.21,0.15,0.21,0.18,0.21,1.38],['c',0.00,1.02,0.00,1.11,-0.06,1.20],['c',-0.03,0.06,-0.09,0.12,-0.12,0.15],['c',-0.06,0.03,-0.42,0.21,-0.84,0.36],['l',-0.75,0.33],['l',-0.03,2.52],['c',0.00,2.28,-0.03,2.55,-0.06,2.64],['c',-0.21,0.36,-0.72,0.36,-0.93,0.00],['c',-0.03,-0.09,-0.06,-0.33,-0.06,-2.43],['l',0.00,-2.31],['l',-1.29,0.51],['l',-1.26,0.51],['l',0.00,2.43],['c',0.00,2.58,0.00,2.52,-0.15,2.67],['c',-0.06,0.09,-0.27,0.18,-0.36,0.18],['c',-0.12,0.00,-0.33,-0.09,-0.39,-0.18],['c',-0.15,-0.15,-0.15,-0.09,-0.15,-2.43],['c',0.00,-1.23,0.00,-2.22,-0.03,-2.22],['c',0.00,0.00,-0.27,0.12,-0.60,0.24],['c',-0.69,0.27,-0.78,0.30,-0.96,0.15],['c',-0.21,-0.15,-0.21,-0.18,-0.21,-1.38],['c',0.00,-1.02,0.00,-1.11,0.06,-1.20],['c',0.03,-0.06,0.09,-0.12,0.12,-0.15],['c',0.06,-0.03,0.42,-0.21,0.84,-0.36],['l',0.78,-0.33],['l',0.00,-2.43],['c',0.00,-1.32,0.00,-2.43,-0.03,-2.43],['c',0.00,0.00,-0.27,0.12,-0.60,0.24],['c',-0.69,0.27,-0.78,0.30,-0.96,0.15],['c',-0.21,-0.15,-0.21,-0.18,-0.21,-1.38],['c',0.00,-1.02,0.00,-1.11,0.06,-1.20],['c',0.03,-0.06,0.09,-0.12,0.12,-0.15],['c',0.06,-0.03,0.42,-0.21,0.84,-0.36],['l',0.78,-0.33],['l',0.00,-2.52],['c',0.00,-2.28,0.03,-2.55,0.06,-2.64],['c',0.21,-0.36,0.72,-0.36,0.93,0.00],['c',0.03,0.09,0.06,0.33,0.06,2.43],['l',0.03,2.31],['l',1.26,-0.51],['l',1.26,-0.51],['l',0.00,-2.43],['c',0.00,-2.28,0.00,-2.43,0.06,-2.55],['c',0.06,-0.12,0.12,-0.18,0.27,-0.24],['z'],['m',-0.33,10.65],['l',0.00,-2.43],['l',-1.29,0.51],['l',-1.26,0.51],['l',0.00,2.46],['l',0.00,2.43],['l',0.09,-0.03],['c',0.06,-0.03,0.63,-0.27,1.29,-0.51],['l',1.17,-0.48],['l',0.00,-2.46],['z']],w:8.25,h:22.462},
		'accidentals.halfsharp':{d:[['M',2.43,-10.05],['c',0.21,-0.12,0.54,-0.03,0.66,0.24],['c',0.06,0.12,0.06,0.21,0.06,2.01],['c',0.00,1.05,0.00,1.89,0.03,1.89],['l',0.72,-0.48],['c',0.69,-0.48,0.69,-0.51,0.87,-0.51],['c',0.15,0.00,0.18,0.03,0.27,0.09],['c',0.21,0.15,0.21,0.18,0.21,1.41],['c',0.00,1.11,-0.03,1.14,-0.09,1.23],['c',-0.03,0.03,-0.48,0.39,-1.02,0.75],['l',-0.99,0.66],['l',0.00,2.37],['c',0.00,1.32,0.00,2.37,0.03,2.37],['l',0.72,-0.48],['c',0.69,-0.48,0.69,-0.51,0.87,-0.51],['c',0.15,0.00,0.18,0.03,0.27,0.09],['c',0.21,0.15,0.21,0.18,0.21,1.41],['c',0.00,1.11,-0.03,1.14,-0.09,1.23],['c',-0.03,0.03,-0.48,0.39,-1.02,0.75],['l',-0.99,0.66],['l',0.00,2.25],['c',0.00,1.95,0.00,2.28,-0.06,2.37],['c',-0.06,0.12,-0.12,0.21,-0.24,0.27],['c',-0.27,0.12,-0.54,0.03,-0.69,-0.24],['c',-0.06,-0.12,-0.06,-0.21,-0.06,-2.01],['c',0.00,-1.05,0.00,-1.89,-0.03,-1.89],['l',-0.72,0.48],['c',-0.69,0.48,-0.69,0.48,-0.87,0.48],['c',-0.15,0.00,-0.18,0.00,-0.27,-0.06],['c',-0.21,-0.15,-0.21,-0.18,-0.21,-1.41],['c',0.00,-1.11,0.03,-1.14,0.09,-1.23],['c',0.03,-0.03,0.48,-0.39,1.02,-0.75],['l',0.99,-0.66],['l',0.00,-2.37],['c',0.00,-1.32,0.00,-2.37,-0.03,-2.37],['l',-0.72,0.48],['c',-0.69,0.48,-0.69,0.48,-0.87,0.48],['c',-0.15,0.00,-0.18,0.00,-0.27,-0.06],['c',-0.21,-0.15,-0.21,-0.18,-0.21,-1.41],['c',0.00,-1.11,0.03,-1.14,0.09,-1.23],['c',0.03,-0.03,0.48,-0.39,1.02,-0.75],['l',0.99,-0.66],['l',0.00,-2.25],['c',0.00,-2.13,0.00,-2.28,0.06,-2.40],['c',0.06,-0.12,0.12,-0.18,0.27,-0.24],['z']],w:5.25,h:20.174},
		'accidentals.nat':{d:[['M',0.21,-11.40],['c',0.24,-0.06,0.78,0.00,0.99,0.15],['c',0.03,0.03,0.03,0.48,0.00,2.61],['c',-0.03,1.44,-0.03,2.61,-0.03,2.61],['c',0.00,0.03,0.75,-0.09,1.68,-0.24],['c',0.96,-0.18,1.71,-0.27,1.74,-0.27],['c',0.15,0.03,0.27,0.15,0.36,0.30],['l',0.06,0.12],['l',0.09,8.67],['c',0.09,6.96,0.12,8.67,0.09,8.67],['c',-0.03,0.03,-0.12,0.06,-0.21,0.09],['c',-0.24,0.09,-0.72,0.09,-0.96,0.00],['c',-0.09,-0.03,-0.18,-0.06,-0.21,-0.09],['c',-0.03,-0.03,-0.03,-0.48,0.00,-2.61],['c',0.03,-1.44,0.03,-2.61,0.03,-2.61],['c',0.00,-0.03,-0.75,0.09,-1.68,0.24],['c',-0.96,0.18,-1.71,0.27,-1.74,0.27],['c',-0.15,-0.03,-0.27,-0.15,-0.36,-0.30],['l',-0.06,-0.15],['l',-0.09,-7.53],['c',-0.06,-4.14,-0.09,-8.04,-0.12,-8.67],['l',0.00,-1.11],['l',0.15,-0.06],['c',0.09,-0.03,0.21,-0.06,0.27,-0.09],['z'],['m',3.75,8.40],['c',0.00,-0.33,0.00,-0.42,-0.03,-0.42],['c',-0.12,0.00,-2.79,0.45,-2.79,0.48],['c',-0.03,0.00,-0.09,6.30,-0.09,6.33],['c',0.03,0.00,2.79,-0.45,2.82,-0.48],['c',0.00,0.00,0.09,-4.53,0.09,-5.91],['z']],w:5.4,h:22.8},
		'accidentals.flat':{d:[['M',-0.36,-14.07],['c',0.33,-0.06,0.87,0.00,1.08,0.15],['c',0.06,0.03,0.06,0.36,-0.03,5.25],['c',-0.06,2.85,-0.09,5.19,-0.09,5.19],['c',0.00,0.03,0.12,-0.03,0.24,-0.12],['c',0.63,-0.42,1.41,-0.66,2.19,-0.72],['c',0.81,-0.03,1.47,0.21,2.04,0.78],['c',0.57,0.54,0.87,1.26,0.93,2.04],['c',0.03,0.57,-0.09,1.08,-0.36,1.62],['c',-0.42,0.81,-1.02,1.38,-2.82,2.61],['c',-1.14,0.78,-1.44,1.02,-1.80,1.44],['c',-0.18,0.18,-0.39,0.39,-0.45,0.42],['c',-0.27,0.18,-0.57,0.15,-0.81,-0.06],['c',-0.06,-0.09,-0.12,-0.18,-0.15,-0.27],['c',-0.03,-0.06,-0.09,-3.27,-0.18,-8.34],['c',-0.09,-4.53,-0.15,-8.58,-0.18,-9.03],['l',0.00,-0.78],['l',0.12,-0.06],['c',0.06,-0.03,0.18,-0.09,0.27,-0.12],['z'],['m',3.18,11.01],['c',-0.21,-0.12,-0.54,-0.15,-0.81,-0.06],['c',-0.54,0.15,-0.99,0.63,-1.17,1.26],['c',-0.06,0.30,-0.12,2.88,-0.06,3.87],['c',0.03,0.42,0.03,0.81,0.06,0.90],['l',0.03,0.12],['l',0.45,-0.39],['c',0.63,-0.54,1.26,-1.17,1.56,-1.59],['c',0.30,-0.42,0.60,-0.99,0.72,-1.41],['c',0.18,-0.69,0.09,-1.47,-0.18,-2.07],['c',-0.15,-0.30,-0.33,-0.51,-0.60,-0.63],['z']],w:6.75,h:18.801},
		'accidentals.halfflat':{d:[['M',4.83,-14.07],['c',0.33,-0.06,0.87,0.00,1.08,0.15],['c',0.06,0.03,0.06,0.60,-0.12,9.06],['c',-0.09,5.55,-0.15,9.06,-0.18,9.12],['c',-0.03,0.09,-0.09,0.18,-0.15,0.27],['c',-0.24,0.21,-0.54,0.24,-0.81,0.06],['c',-0.06,-0.03,-0.27,-0.24,-0.45,-0.42],['c',-0.36,-0.42,-0.66,-0.66,-1.80,-1.44],['c',-1.23,-0.84,-1.83,-1.32,-2.25,-1.77],['c',-0.66,-0.78,-0.96,-1.56,-0.93,-2.46],['c',0.09,-1.41,1.11,-2.58,2.40,-2.79],['c',0.30,-0.06,0.84,-0.03,1.23,0.06],['c',0.54,0.12,1.08,0.33,1.53,0.63],['c',0.12,0.09,0.24,0.15,0.24,0.12],['c',0.00,0.00,-0.12,-8.37,-0.18,-9.75],['l',0.00,-0.66],['l',0.12,-0.06],['c',0.06,-0.03,0.18,-0.09,0.27,-0.12],['z'],['m',-1.65,10.95],['c',-0.60,-0.18,-1.08,0.09,-1.38,0.69],['c',-0.27,0.60,-0.36,1.38,-0.18,2.07],['c',0.12,0.42,0.42,0.99,0.72,1.41],['c',0.30,0.42,0.93,1.05,1.56,1.59],['l',0.48,0.39],['l',0.00,-0.12],['c',0.03,-0.09,0.03,-0.48,0.06,-0.90],['c',0.03,-0.57,0.03,-1.08,0.00,-2.22],['c',-0.03,-1.62,-0.03,-1.62,-0.24,-2.07],['c',-0.21,-0.42,-0.60,-0.75,-1.02,-0.84],['z']],w:6.728,h:18.801},
		'accidentals.dblflat':{d:[['M',-0.36,-14.07],['c',0.33,-0.06,0.87,0.00,1.08,0.15],['c',0.06,0.03,0.06,0.33,-0.03,4.89],['c',-0.06,2.67,-0.09,5.01,-0.09,5.22],['l',0.00,0.36],['l',0.15,-0.15],['c',0.36,-0.30,0.75,-0.51,1.20,-0.63],['c',0.33,-0.09,0.96,-0.09,1.26,-0.03],['c',0.27,0.09,0.63,0.27,0.87,0.45],['l',0.21,0.15],['l',0.00,-0.27],['c',0.00,-0.15,-0.03,-2.43,-0.09,-5.10],['c',-0.09,-4.56,-0.09,-4.86,-0.03,-4.89],['c',0.15,-0.12,0.39,-0.15,0.72,-0.15],['c',0.30,0.00,0.54,0.03,0.69,0.15],['c',0.06,0.03,0.06,0.33,-0.03,4.95],['c',-0.06,2.70,-0.09,5.04,-0.09,5.22],['l',0.03,0.30],['l',0.21,-0.15],['c',0.69,-0.48,1.44,-0.69,2.28,-0.69],['c',0.51,0.00,0.78,0.03,1.20,0.21],['c',1.32,0.63,2.01,2.28,1.53,3.69],['c',-0.21,0.57,-0.51,1.02,-1.05,1.56],['c',-0.42,0.42,-0.81,0.72,-1.92,1.50],['c',-1.26,0.87,-1.50,1.08,-1.86,1.50],['c',-0.39,0.45,-0.54,0.54,-0.81,0.51],['c',-0.18,0.00,-0.21,0.00,-0.33,-0.06],['l',-0.21,-0.21],['l',-0.06,-0.12],['l',-0.03,-0.99],['c',-0.03,-0.54,-0.03,-1.29,-0.06,-1.68],['l',0.00,-0.69],['l',-0.21,0.24],['c',-0.36,0.42,-0.75,0.75,-1.80,1.62],['c',-1.02,0.84,-1.20,0.99,-1.44,1.38],['c',-0.36,0.51,-0.54,0.60,-0.90,0.51],['c',-0.15,-0.03,-0.39,-0.27,-0.42,-0.42],['c',-0.03,-0.06,-0.09,-3.27,-0.18,-8.34],['c',-0.09,-4.53,-0.15,-8.58,-0.18,-9.03],['l',0.00,-0.78],['l',0.12,-0.06],['c',0.06,-0.03,0.18,-0.09,0.27,-0.12],['z'],['m',2.52,10.98],['c',-0.18,-0.09,-0.48,-0.12,-0.66,-0.06],['c',-0.39,0.15,-0.69,0.54,-0.84,1.14],['c',-0.06,0.24,-0.06,0.39,-0.09,1.74],['c',-0.03,1.44,0.00,2.73,0.06,3.18],['l',0.03,0.15],['l',0.27,-0.27],['c',0.93,-0.96,1.50,-1.95,1.74,-3.06],['c',0.06,-0.27,0.06,-0.39,0.06,-0.96],['c',0.00,-0.54,0.00,-0.69,-0.06,-0.93],['c',-0.09,-0.51,-0.27,-0.81,-0.51,-0.93],['z'],['m',5.43,0.00],['c',-0.18,-0.09,-0.51,-0.12,-0.72,-0.06],['c',-0.54,0.12,-0.96,0.63,-1.17,1.26],['c',-0.06,0.30,-0.12,2.88,-0.06,3.90],['c',0.03,0.42,0.03,0.81,0.06,0.90],['l',0.03,0.12],['l',0.36,-0.30],['c',0.42,-0.36,1.02,-0.96,1.29,-1.29],['c',0.36,-0.45,0.66,-0.99,0.81,-1.41],['c',0.42,-1.23,0.15,-2.76,-0.60,-3.12],['z']],w:11.613,h:18.804},
		'accidentals.dblsharp':{d:[['M',-0.18,-3.96],['c',0.06,-0.03,0.12,-0.06,0.15,-0.06],['c',0.09,0.00,2.76,0.27,2.79,0.30],['c',0.12,0.03,0.15,0.12,0.15,0.51],['c',0.06,0.96,0.24,1.59,0.57,2.10],['c',0.06,0.09,0.15,0.21,0.18,0.24],['l',0.09,0.06],['l',0.09,-0.06],['c',0.03,-0.03,0.12,-0.15,0.18,-0.24],['c',0.33,-0.51,0.51,-1.14,0.57,-2.10],['c',0.00,-0.39,0.03,-0.45,0.12,-0.51],['c',0.03,0.00,0.66,-0.09,1.44,-0.15],['c',1.47,-0.15,1.50,-0.15,1.56,-0.03],['c',0.03,0.06,0.00,0.42,-0.09,1.44],['c',-0.09,0.72,-0.15,1.35,-0.15,1.38],['c',0.00,0.03,-0.03,0.09,-0.06,0.12],['c',-0.06,0.06,-0.12,0.09,-0.51,0.09],['c',-1.08,0.06,-1.80,0.30,-2.28,0.75],['l',-0.12,0.09],['l',0.09,0.09],['c',0.12,0.15,0.39,0.33,0.63,0.45],['c',0.42,0.18,0.96,0.27,1.68,0.33],['c',0.39,0.00,0.45,0.03,0.51,0.09],['c',0.03,0.03,0.06,0.09,0.06,0.12],['c',0.00,0.03,0.06,0.66,0.15,1.38],['c',0.09,1.02,0.12,1.38,0.09,1.44],['c',-0.06,0.12,-0.09,0.12,-1.56,-0.03],['c',-0.78,-0.06,-1.41,-0.15,-1.44,-0.15],['c',-0.09,-0.06,-0.12,-0.12,-0.12,-0.54],['c',-0.06,-0.93,-0.24,-1.56,-0.57,-2.07],['c',-0.06,-0.09,-0.15,-0.21,-0.18,-0.24],['l',-0.09,-0.06],['l',-0.09,0.06],['c',-0.03,0.03,-0.12,0.15,-0.18,0.24],['c',-0.33,0.51,-0.51,1.14,-0.57,2.07],['c',0.00,0.42,-0.03,0.48,-0.12,0.54],['c',-0.03,0.00,-0.66,0.09,-1.44,0.15],['c',-1.47,0.15,-1.50,0.15,-1.56,0.03],['c',-0.03,-0.06,0.00,-0.42,0.09,-1.44],['c',0.09,-0.72,0.15,-1.35,0.15,-1.38],['c',0.00,-0.03,0.03,-0.09,0.06,-0.12],['c',0.06,-0.06,0.12,-0.09,0.51,-0.09],['c',0.72,-0.06,1.26,-0.15,1.68,-0.33],['c',0.24,-0.12,0.51,-0.30,0.63,-0.45],['l',0.09,-0.09],['l',-0.12,-0.09],['c',-0.48,-0.45,-1.20,-0.69,-2.28,-0.75],['c',-0.39,0.00,-0.45,-0.03,-0.51,-0.09],['c',-0.03,-0.03,-0.06,-0.09,-0.06,-0.12],['c',0.00,-0.03,-0.06,-0.63,-0.12,-1.38],['c',-0.09,-0.72,-0.15,-1.35,-0.15,-1.38],['z']],w:7.95,h:7.977},
		'dots.dot':{d:[['M',1.32,-1.68],['c',0.09,-0.03,0.27,-0.06,0.39,-0.06],['c',0.96,0.00,1.74,0.78,1.74,1.71],['c',0.00,0.96,-0.78,1.74,-1.71,1.74],['c',-0.96,0.00,-1.74,-0.78,-1.74,-1.71],['c',0.00,-0.78,0.54,-1.50,1.32,-1.68],['z']],w:3.45,h:3.45},
		'noteheads.dbl':{d:[['M',-0.69,-4.02],['c',0.18,-0.09,0.36,-0.09,0.54,0.00],['c',0.18,0.09,0.24,0.15,0.33,0.30],['c',0.06,0.15,0.06,0.18,0.06,1.41],['l',0.00,1.23],['l',0.12,-0.18],['c',0.72,-1.26,2.64,-2.31,4.86,-2.64],['c',0.81,-0.15,1.11,-0.15,2.13,-0.15],['c',0.99,0.00,1.29,0.00,2.10,0.15],['c',0.75,0.12,1.38,0.27,2.04,0.54],['c',1.35,0.51,2.34,1.26,2.82,2.10],['l',0.12,0.18],['l',0.00,-1.23],['c',0.00,-1.20,0.00,-1.26,0.06,-1.38],['c',0.09,-0.18,0.15,-0.24,0.33,-0.33],['c',0.18,-0.09,0.36,-0.09,0.54,0.00],['c',0.18,0.09,0.24,0.15,0.33,0.30],['l',0.06,0.15],['l',0.00,3.54],['l',0.00,3.54],['l',-0.06,0.15],['c',-0.09,0.18,-0.15,0.24,-0.33,0.33],['c',-0.18,0.09,-0.36,0.09,-0.54,0.00],['c',-0.18,-0.09,-0.24,-0.15,-0.33,-0.33],['c',-0.06,-0.12,-0.06,-0.18,-0.06,-1.38],['l',0.00,-1.23],['l',-0.12,0.18],['c',-0.48,0.84,-1.47,1.59,-2.82,2.10],['c',-0.84,0.33,-1.71,0.54,-2.85,0.66],['c',-0.45,0.06,-2.16,0.06,-2.61,0.00],['c',-1.14,-0.12,-2.01,-0.33,-2.85,-0.66],['c',-1.35,-0.51,-2.34,-1.26,-2.82,-2.10],['l',-0.12,-0.18],['l',0.00,1.23],['c',0.00,1.23,0.00,1.26,-0.06,1.38],['c',-0.09,0.18,-0.15,0.24,-0.33,0.33],['c',-0.18,0.09,-0.36,0.09,-0.54,0.00],['c',-0.18,-0.09,-0.24,-0.15,-0.33,-0.33],['l',-0.06,-0.15],['l',0.00,-3.54],['c',0.00,-3.48,0.00,-3.54,0.06,-3.66],['c',0.09,-0.18,0.15,-0.24,0.33,-0.33],['z'],['m',7.71,0.63],['c',-0.36,-0.06,-0.90,-0.06,-1.14,0.00],['c',-0.30,0.03,-0.66,0.24,-0.87,0.42],['c',-0.60,0.54,-0.90,1.62,-0.75,2.82],['c',0.12,0.93,0.51,1.68,1.11,2.31],['c',0.75,0.72,1.83,1.20,2.85,1.26],['c',1.05,0.06,1.83,-0.54,2.10,-1.65],['c',0.21,-0.90,0.12,-1.95,-0.24,-2.82],['c',-0.36,-0.81,-1.08,-1.53,-1.95,-1.95],['c',-0.30,-0.15,-0.78,-0.30,-1.11,-0.39],['z']],w:16.83,h:8.145},
		'noteheads.whole':{d:[['M',6.51,-4.05],['c',0.51,-0.03,2.01,0.00,2.52,0.03],['c',1.41,0.18,2.64,0.51,3.72,1.08],['c',1.20,0.63,1.95,1.41,2.19,2.31],['c',0.09,0.33,0.09,0.90,0.00,1.23],['c',-0.24,0.90,-0.99,1.68,-2.19,2.31],['c',-1.08,0.57,-2.28,0.90,-3.75,1.08],['c',-0.66,0.06,-2.31,0.06,-2.97,0.00],['c',-1.47,-0.18,-2.67,-0.51,-3.75,-1.08],['c',-1.20,-0.63,-1.95,-1.41,-2.19,-2.31],['c',-0.09,-0.33,-0.09,-0.90,0.00,-1.23],['c',0.24,-0.90,0.99,-1.68,2.19,-2.31],['c',1.20,-0.63,2.61,-0.99,4.23,-1.11],['z'],['m',0.57,0.66],['c',-0.87,-0.15,-1.53,0.00,-2.04,0.51],['c',-0.15,0.15,-0.24,0.27,-0.33,0.48],['c',-0.24,0.51,-0.36,1.08,-0.33,1.77],['c',0.03,0.69,0.18,1.26,0.42,1.77],['c',0.60,1.17,1.74,1.98,3.18,2.22],['c',1.11,0.21,1.95,-0.15,2.34,-0.99],['c',0.24,-0.51,0.36,-1.08,0.33,-1.80],['c',-0.06,-1.11,-0.45,-2.04,-1.17,-2.76],['c',-0.63,-0.63,-1.47,-1.05,-2.40,-1.20],['z']],w:14.985,h:8.097},
		'noteheads.half':{d:[['M',7.44,-4.05],['c',0.06,-0.03,0.27,-0.03,0.48,-0.03],['c',1.05,0.00,1.71,0.24,2.10,0.81],['c',0.42,0.60,0.45,1.35,0.18,2.40],['c',-0.42,1.59,-1.14,2.73,-2.16,3.39],['c',-1.41,0.93,-3.18,1.44,-5.40,1.53],['c',-1.17,0.03,-1.89,-0.21,-2.28,-0.81],['c',-0.42,-0.60,-0.45,-1.35,-0.18,-2.40],['c',0.42,-1.59,1.14,-2.73,2.16,-3.39],['c',0.63,-0.42,1.23,-0.72,1.98,-0.96],['c',0.90,-0.30,1.65,-0.42,3.12,-0.54],['z'],['m',1.29,0.87],['c',-0.27,-0.09,-0.63,-0.12,-0.90,-0.03],['c',-0.72,0.24,-1.53,0.69,-3.27,1.80],['c',-2.34,1.50,-3.30,2.25,-3.57,2.79],['c',-0.36,0.72,-0.06,1.50,0.66,1.77],['c',0.24,0.12,0.69,0.09,0.99,0.00],['c',0.84,-0.30,1.92,-0.93,4.14,-2.37],['c',1.62,-1.08,2.37,-1.71,2.61,-2.19],['c',0.36,-0.72,0.06,-1.50,-0.66,-1.77],['z']],w:10.37,h:8.132},
		'noteheads.quarter':{d:[['M',6.09,-4.05],['c',0.36,-0.03,1.20,0.00,1.53,0.06],['c',1.17,0.24,1.89,0.84,2.16,1.83],['c',0.06,0.18,0.06,0.30,0.06,0.66],['c',0.00,0.45,0.00,0.63,-0.15,1.08],['c',-0.66,2.04,-3.06,3.93,-5.52,4.38],['c',-0.54,0.09,-1.44,0.09,-1.83,0.03],['c',-1.23,-0.27,-1.98,-0.87,-2.25,-1.86],['c',-0.06,-0.18,-0.06,-0.30,-0.06,-0.66],['c',0.00,-0.45,0.00,-0.63,0.15,-1.08],['c',0.24,-0.78,0.75,-1.53,1.44,-2.22],['c',1.20,-1.20,2.85,-2.01,4.47,-2.22],['z']],w:9.81,h:8.094},
		'noteheads.slash.nostem':{d:[['M',9.30,-7.77],['c',0.06,-0.06,0.18,-0.06,1.71,-0.06],['l',1.65,0.00],['l',0.09,0.09],['c',0.06,0.06,0.06,0.09,0.06,0.15],['c',-0.03,0.12,-9.21,15.24,-9.30,15.33],['c',-0.06,0.06,-0.18,0.06,-1.71,0.06],['l',-1.65,0.00],['l',-0.09,-0.09],['c',-0.06,-0.06,-0.06,-0.09,-0.06,-0.15],['c',0.03,-0.12,9.21,-15.24,9.30,-15.33],['z']],w:12.81,h:15.63},
		'noteheads.indeterminate':{d:[['M',0.78,-4.05],['c',0.12,-0.03,0.24,-0.03,0.36,0.03],['c',0.03,0.03,0.93,0.72,1.95,1.56],['l',1.86,1.50],['l',1.86,-1.50],['c',1.02,-0.84,1.92,-1.53,1.95,-1.56],['c',0.21,-0.12,0.33,-0.09,0.75,0.24],['c',0.30,0.27,0.36,0.36,0.36,0.54],['c',0.00,0.03,-0.03,0.12,-0.06,0.18],['c',-0.03,0.06,-0.90,0.75,-1.89,1.56],['l',-1.80,1.47],['c',0.00,0.03,0.81,0.69,1.80,1.50],['c',0.99,0.81,1.86,1.50,1.89,1.56],['c',0.03,0.06,0.06,0.15,0.06,0.18],['c',0.00,0.18,-0.06,0.27,-0.36,0.54],['c',-0.42,0.33,-0.54,0.36,-0.75,0.24],['c',-0.03,-0.03,-0.93,-0.72,-1.95,-1.56],['l',-1.86,-1.50],['l',-1.86,1.50],['c',-1.02,0.84,-1.92,1.53,-1.95,1.56],['c',-0.21,0.12,-0.33,0.09,-0.75,-0.24],['c',-0.30,-0.27,-0.36,-0.36,-0.36,-0.54],['c',0.00,-0.03,0.03,-0.12,0.06,-0.18],['c',0.03,-0.06,0.90,-0.75,1.89,-1.56],['l',1.80,-1.47],['c',0.00,-0.03,-0.81,-0.69,-1.80,-1.50],['c',-0.99,-0.81,-1.86,-1.50,-1.89,-1.56],['c',-0.06,-0.12,-0.09,-0.21,-0.03,-0.36],['c',0.03,-0.09,0.57,-0.57,0.72,-0.63],['z']],w:9.843,h:8.139},
		'scripts.ufermata':{d:[['M',-0.75,-10.77],['c',0.12,0.00,0.45,-0.03,0.69,-0.03],['c',2.91,-0.03,5.55,1.53,7.41,4.35],['c',1.17,1.71,1.95,3.72,2.43,6.03],['c',0.12,0.51,0.12,0.57,0.03,0.69],['c',-0.12,0.21,-0.48,0.27,-0.69,0.12],['c',-0.12,-0.09,-0.18,-0.24,-0.27,-0.69],['c',-0.78,-3.63,-3.42,-6.54,-6.78,-7.38],['c',-0.78,-0.21,-1.20,-0.24,-2.07,-0.24],['c',-0.63,0.00,-0.84,0.00,-1.20,0.06],['c',-1.83,0.27,-3.42,1.08,-4.80,2.37],['c',-1.41,1.35,-2.40,3.21,-2.85,5.19],['c',-0.09,0.45,-0.15,0.60,-0.27,0.69],['c',-0.21,0.15,-0.57,0.09,-0.69,-0.12],['c',-0.09,-0.12,-0.09,-0.18,0.03,-0.69],['c',0.33,-1.62,0.78,-3.00,1.47,-4.38],['c',1.77,-3.54,4.44,-5.67,7.56,-5.97],['z'],['m',0.33,7.47],['c',1.38,-0.30,2.58,0.90,2.31,2.25],['c',-0.15,0.72,-0.78,1.35,-1.47,1.50],['c',-1.38,0.27,-2.58,-0.93,-2.31,-2.31],['c',0.15,-0.69,0.78,-1.29,1.47,-1.44],['z']],w:19.748,h:11.289},
		'scripts.dfermata':{d:[['M',-9.63,-0.42],['c',0.15,-0.09,0.36,-0.06,0.51,0.03],['c',0.12,0.09,0.18,0.24,0.27,0.66],['c',0.78,3.66,3.42,6.57,6.78,7.41],['c',0.78,0.21,1.20,0.24,2.07,0.24],['c',0.63,0.00,0.84,0.00,1.20,-0.06],['c',1.83,-0.27,3.42,-1.08,4.80,-2.37],['c',1.41,-1.35,2.40,-3.21,2.85,-5.22],['c',0.09,-0.42,0.15,-0.57,0.27,-0.66],['c',0.21,-0.15,0.57,-0.09,0.69,0.12],['c',0.09,0.12,0.09,0.18,-0.03,0.69],['c',-0.33,1.62,-0.78,3.00,-1.47,4.38],['c',-1.92,3.84,-4.89,6.00,-8.31,6.00],['c',-3.42,0.00,-6.39,-2.16,-8.31,-6.00],['c',-0.48,-0.96,-0.84,-1.92,-1.14,-2.97],['c',-0.18,-0.69,-0.42,-1.74,-0.42,-1.92],['c',0.00,-0.12,0.09,-0.27,0.24,-0.33],['z'],['m',9.21,0.00],['c',1.20,-0.27,2.34,0.63,2.34,1.86],['c',0.00,0.90,-0.66,1.68,-1.50,1.89],['c',-1.38,0.27,-2.58,-0.93,-2.31,-2.31],['c',0.15,-0.69,0.78,-1.29,1.47,-1.44],['z']],w:19.744,h:11.274},
		'scripts.sforzato':{d:[['M',-6.45,-3.69],['c',0.06,-0.03,0.15,-0.06,0.18,-0.06],['c',0.06,0.00,2.85,0.72,6.24,1.59],['l',6.33,1.65],['c',0.33,0.06,0.45,0.21,0.45,0.51],['c',0.00,0.30,-0.12,0.45,-0.45,0.51],['l',-6.33,1.65],['c',-3.39,0.87,-6.18,1.59,-6.21,1.59],['c',-0.21,0.00,-0.48,-0.24,-0.51,-0.45],['c',0.00,-0.15,0.06,-0.36,0.18,-0.45],['c',0.09,-0.06,0.87,-0.27,3.84,-1.05],['c',2.04,-0.54,3.84,-0.99,4.02,-1.02],['c',0.15,-0.06,1.14,-0.24,2.22,-0.42],['c',1.05,-0.18,1.92,-0.36,1.92,-0.36],['c',0.00,0.00,-0.87,-0.18,-1.92,-0.36],['c',-1.08,-0.18,-2.07,-0.36,-2.22,-0.42],['c',-0.18,-0.03,-1.98,-0.48,-4.02,-1.02],['c',-2.97,-0.78,-3.75,-0.99,-3.84,-1.05],['c',-0.12,-0.09,-0.18,-0.30,-0.18,-0.45],['c',0.03,-0.15,0.15,-0.30,0.30,-0.39],['z']],w:13.5,h:7.5},
		'scripts.staccato':{d:[['M',-0.36,-1.47],['c',0.93,-0.21,1.86,0.51,1.86,1.47],['c',0.00,0.93,-0.87,1.65,-1.80,1.47],['c',-0.54,-0.12,-1.02,-0.57,-1.14,-1.08],['c',-0.21,-0.81,0.27,-1.65,1.08,-1.86],['z']],w:2.989,h:3.004},
		'scripts.tenuto':{d:[['M',-4.20,-0.48],['l',0.12,-0.06],['l',4.08,0.00],['l',4.08,0.00],['l',0.12,0.06],['c',0.39,0.21,0.39,0.75,0.00,0.96],['l',-0.12,0.06],['l',-4.08,0.00],['l',-4.08,0.00],['l',-0.12,-0.06],['c',-0.39,-0.21,-0.39,-0.75,0.00,-0.96],['z']],w:8.985,h:1.08},
		'scripts.umarcato':{d:[['M',-0.15,-8.19],['c',0.15,-0.12,0.36,-0.03,0.45,0.15],['c',0.21,0.42,3.45,7.65,3.45,7.71],['c',0.00,0.12,-0.12,0.27,-0.21,0.30],['c',-0.03,0.03,-0.51,0.03,-1.14,0.03],['c',-1.05,0.00,-1.08,0.00,-1.17,-0.06],['c',-0.09,-0.06,-0.24,-0.36,-1.17,-2.40],['c',-0.57,-1.29,-1.05,-2.34,-1.08,-2.34],['c',0.00,-0.03,-0.51,1.02,-1.08,2.34],['c',-0.93,2.07,-1.08,2.34,-1.14,2.40],['c',-0.06,0.03,-0.15,0.06,-0.18,0.06],['c',-0.15,0.00,-0.33,-0.18,-0.33,-0.33],['c',0.00,-0.06,3.24,-7.32,3.45,-7.71],['c',0.03,-0.06,0.09,-0.15,0.15,-0.15],['z']],w:7.5,h:8.245},
		'scripts.dmarcato':{d:[['M',-3.57,0.03],['c',0.03,0.00,0.57,-0.03,1.17,-0.03],['c',1.05,0.00,1.08,0.00,1.17,0.06],['c',0.09,0.06,0.24,0.36,1.17,2.40],['c',0.57,1.29,1.05,2.34,1.08,2.34],['c',0.00,0.03,0.51,-1.02,1.08,-2.34],['c',0.93,-2.07,1.08,-2.34,1.14,-2.40],['c',0.06,-0.03,0.15,-0.06,0.18,-0.06],['c',0.15,0.00,0.33,0.18,0.33,0.33],['c',0.00,0.09,-3.45,7.74,-3.54,7.83],['c',-0.12,0.12,-0.30,0.12,-0.42,0.00],['c',-0.09,-0.09,-3.54,-7.74,-3.54,-7.83],['c',0.00,-0.09,0.12,-0.27,0.18,-0.30],['z']],w:7.5,h:8.25},
		'scripts.stopped':{d:[['M',-0.27,-4.08],['c',0.18,-0.09,0.36,-0.09,0.54,0.00],['c',0.18,0.09,0.24,0.15,0.33,0.30],['l',0.06,0.15],['l',0.00,1.50],['l',0.00,1.47],['l',1.47,0.00],['l',1.50,0.00],['l',0.15,0.06],['c',0.15,0.09,0.21,0.15,0.30,0.33],['c',0.09,0.18,0.09,0.36,0.00,0.54],['c',-0.09,0.18,-0.15,0.24,-0.33,0.33],['c',-0.12,0.06,-0.18,0.06,-1.62,0.06],['l',-1.47,0.00],['l',0.00,1.47],['l',0.00,1.47],['l',-0.06,0.15],['c',-0.09,0.18,-0.15,0.24,-0.33,0.33],['c',-0.18,0.09,-0.36,0.09,-0.54,0.00],['c',-0.18,-0.09,-0.24,-0.15,-0.33,-0.33],['l',-0.06,-0.15],['l',0.00,-1.47],['l',0.00,-1.47],['l',-1.47,0.00],['c',-1.44,0.00,-1.50,0.00,-1.62,-0.06],['c',-0.18,-0.09,-0.24,-0.15,-0.33,-0.33],['c',-0.09,-0.18,-0.09,-0.36,0.00,-0.54],['c',0.09,-0.18,0.15,-0.24,0.33,-0.33],['l',0.15,-0.06],['l',1.47,0.00],['l',1.47,0.00],['l',0.00,-1.47],['c',0.00,-1.44,0.00,-1.50,0.06,-1.62],['c',0.09,-0.18,0.15,-0.24,0.33,-0.33],['z']],w:8.295,h:8.295},
		'scripts.upbow':{d:[['M',-4.65,-15.54],['c',0.12,-0.09,0.36,-0.06,0.48,0.03],['c',0.03,0.03,0.09,0.09,0.12,0.15],['c',0.03,0.06,0.66,2.13,1.41,4.62],['c',1.35,4.41,1.38,4.56,2.01,6.96],['l',0.63,2.46],['l',0.63,-2.46],['c',0.63,-2.40,0.66,-2.55,2.01,-6.96],['c',0.75,-2.49,1.38,-4.56,1.41,-4.62],['c',0.06,-0.15,0.18,-0.21,0.36,-0.24],['c',0.15,0.00,0.30,0.06,0.39,0.18],['c',0.15,0.21,0.24,-0.18,-2.10,7.56],['c',-1.20,3.96,-2.22,7.32,-2.25,7.41],['c',0.00,0.12,-0.06,0.27,-0.09,0.30],['c',-0.12,0.21,-0.60,0.21,-0.72,0.00],['c',-0.03,-0.03,-0.09,-0.18,-0.09,-0.30],['c',-0.03,-0.09,-1.05,-3.45,-2.25,-7.41],['c',-2.34,-7.74,-2.25,-7.35,-2.10,-7.56],['c',0.03,-0.03,0.09,-0.09,0.15,-0.12],['z']],w:9.73,h:15.608},
		'scripts.downbow':{d:[['M',-5.55,-9.93],['l',0.09,-0.06],['l',5.46,0.00],['l',5.46,0.00],['l',0.09,0.06],['l',0.06,0.09],['l',0.00,4.77],['c',0.00,5.28,0.00,4.89,-0.18,5.01],['c',-0.18,0.12,-0.42,0.06,-0.54,-0.12],['c',-0.06,-0.09,-0.06,-0.18,-0.06,-2.97],['l',0.00,-2.85],['l',-4.83,0.00],['l',-4.83,0.00],['l',0.00,2.85],['c',0.00,2.79,0.00,2.88,-0.06,2.97],['c',-0.15,0.24,-0.51,0.24,-0.66,0.00],['c',-0.06,-0.09,-0.06,-0.21,-0.06,-4.89],['l',0.00,-4.77],['z']],w:11.22,h:9.992},
		'scripts.turn':{d:[['M',-4.77,-3.90],['c',0.36,-0.06,1.05,-0.06,1.44,0.03],['c',0.78,0.15,1.50,0.51,2.34,1.14],['c',0.60,0.45,1.05,0.87,2.22,2.01],['c',1.11,1.08,1.62,1.50,2.22,1.86],['c',0.60,0.36,1.32,0.57,1.92,0.57],['c',0.90,0.00,1.71,-0.57,1.89,-1.35],['c',0.24,-0.93,-0.39,-1.89,-1.35,-2.10],['l',-0.15,-0.06],['l',-0.09,0.15],['c',-0.03,0.09,-0.15,0.24,-0.24,0.33],['c',-0.72,0.72,-2.04,0.54,-2.49,-0.36],['c',-0.48,-0.93,0.03,-1.86,1.17,-2.19],['c',0.30,-0.09,1.02,-0.09,1.35,0.00],['c',0.99,0.27,1.74,0.87,2.25,1.83],['c',0.69,1.41,0.63,3.00,-0.21,4.26],['c',-0.21,0.30,-0.69,0.81,-0.99,1.02],['c',-0.30,0.21,-0.84,0.45,-1.17,0.54],['c',-1.23,0.36,-2.49,0.15,-3.72,-0.60],['c',-0.75,-0.48,-1.41,-1.02,-2.85,-2.46],['c',-1.11,-1.08,-1.62,-1.50,-2.22,-1.86],['c',-0.60,-0.36,-1.32,-0.57,-1.92,-0.57],['c',-0.90,0.00,-1.71,0.57,-1.89,1.35],['c',-0.24,0.93,0.39,1.89,1.35,2.10],['l',0.15,0.06],['l',0.09,-0.15],['c',0.03,-0.09,0.15,-0.24,0.24,-0.33],['c',0.72,-0.72,2.04,-0.54,2.49,0.36],['c',0.48,0.93,-0.03,1.86,-1.17,2.19],['c',-0.30,0.09,-1.02,0.09,-1.35,0.00],['c',-0.99,-0.27,-1.74,-0.87,-2.25,-1.83],['c',-0.69,-1.41,-0.63,-3.00,0.21,-4.26],['c',0.21,-0.30,0.69,-0.81,0.99,-1.02],['c',0.48,-0.33,1.11,-0.57,1.74,-0.66],['z']],w:16.366,h:7.893},
		'scripts.trill':{d:[['M',-0.51,-16.02],['c',0.12,-0.09,0.21,-0.18,0.21,-0.18],['l',-0.81,4.02],['l',-0.81,4.02],['c',0.03,0.00,0.51,-0.27,1.08,-0.60],['c',0.60,-0.30,1.14,-0.63,1.26,-0.66],['c',1.14,-0.54,2.31,-0.60,3.09,-0.18],['c',0.27,0.15,0.54,0.36,0.60,0.51],['l',0.06,0.12],['l',0.21,-0.21],['c',0.90,-0.81,2.22,-0.99,3.12,-0.42],['c',0.60,0.42,0.90,1.14,0.78,2.07],['c',-0.15,1.29,-1.05,2.31,-1.95,2.25],['c',-0.48,-0.03,-0.78,-0.30,-0.96,-0.81],['c',-0.09,-0.27,-0.09,-0.90,-0.03,-1.20],['c',0.21,-0.75,0.81,-1.23,1.59,-1.32],['l',0.24,-0.03],['l',-0.09,-0.12],['c',-0.51,-0.66,-1.62,-0.63,-2.31,0.03],['c',-0.39,0.42,-0.30,0.09,-1.23,4.77],['l',-0.81,4.14],['c',-0.03,0.00,-0.12,-0.03,-0.21,-0.09],['c',-0.33,-0.15,-0.54,-0.18,-0.99,-0.18],['c',-0.42,0.00,-0.66,0.03,-1.05,0.18],['c',-0.12,0.06,-0.21,0.09,-0.21,0.09],['c',0.00,-0.03,0.36,-1.86,0.81,-4.11],['c',0.90,-4.47,0.87,-4.26,0.69,-4.53],['c',-0.21,-0.36,-0.66,-0.51,-1.17,-0.36],['c',-0.15,0.06,-2.22,1.14,-2.58,1.38],['c',-0.12,0.09,-0.12,0.09,-0.21,0.60],['l',-0.09,0.51],['l',0.21,0.24],['c',0.63,0.75,1.02,1.47,1.20,2.19],['c',0.06,0.27,0.06,0.36,0.06,0.81],['c',0.00,0.42,0.00,0.54,-0.06,0.78],['c',-0.15,0.54,-0.33,0.93,-0.63,1.35],['c',-0.18,0.24,-0.57,0.63,-0.81,0.78],['c',-0.24,0.15,-0.63,0.36,-0.84,0.42],['c',-0.27,0.06,-0.66,0.06,-0.87,0.03],['c',-0.81,-0.18,-1.32,-1.05,-1.38,-2.46],['c',-0.03,-0.60,0.03,-0.99,0.33,-2.46],['c',0.21,-1.08,0.24,-1.32,0.21,-1.29],['c',-1.20,0.48,-2.40,0.75,-3.21,0.72],['c',-0.69,-0.06,-1.17,-0.30,-1.41,-0.72],['c',-0.39,-0.75,-0.12,-1.80,0.66,-2.46],['c',0.24,-0.18,0.69,-0.42,1.02,-0.51],['c',0.69,-0.18,1.53,-0.15,2.31,0.09],['c',0.30,0.09,0.75,0.30,0.99,0.45],['c',0.12,0.09,0.15,0.09,0.15,0.03],['c',0.03,-0.03,0.33,-1.59,0.72,-3.45],['c',0.36,-1.86,0.66,-3.42,0.69,-3.45],['c',0.00,-0.03,0.03,-0.03,0.21,0.03],['c',0.21,0.06,0.27,0.06,0.48,0.06],['c',0.42,-0.03,0.78,-0.18,1.26,-0.48],['c',0.15,-0.12,0.36,-0.27,0.48,-0.39],['z'],['m',-5.73,7.68],['c',-0.27,-0.03,-0.96,-0.06,-1.20,-0.03],['c',-0.81,0.12,-1.35,0.57,-1.50,1.20],['c',-0.18,0.66,0.12,1.14,0.75,1.29],['c',0.66,0.12,1.92,-0.12,3.18,-0.66],['l',0.33,-0.15],['l',0.09,-0.39],['c',0.06,-0.21,0.09,-0.42,0.09,-0.45],['c',0.00,-0.03,-0.45,-0.30,-0.75,-0.45],['c',-0.27,-0.15,-0.66,-0.27,-0.99,-0.36],['z'],['m',4.29,3.63],['c',-0.24,-0.39,-0.51,-0.75,-0.51,-0.69],['c',-0.06,0.12,-0.39,1.92,-0.45,2.28],['c',-0.09,0.54,-0.12,1.14,-0.06,1.38],['c',0.06,0.42,0.21,0.60,0.51,0.57],['c',0.39,-0.06,0.75,-0.48,0.93,-1.14],['c',0.09,-0.33,0.09,-1.05,0.00,-1.38],['c',-0.09,-0.39,-0.24,-0.69,-0.42,-1.02],['z']],w:17.963,h:16.49},
		'scripts.segno':{d:[['M',-3.72,-11.22],['c',0.78,-0.09,1.59,0.03,2.31,0.42],['c',1.20,0.60,2.01,1.71,2.31,3.09],['c',0.09,0.42,0.09,1.20,0.03,1.50],['c',-0.15,0.45,-0.39,0.81,-0.66,0.93],['c',-0.33,0.18,-0.84,0.21,-1.23,0.15],['c',-0.81,-0.18,-1.32,-0.93,-1.26,-1.89],['c',0.03,-0.36,0.09,-0.57,0.24,-0.90],['c',0.15,-0.33,0.45,-0.60,0.72,-0.75],['c',0.12,-0.06,0.18,-0.09,0.18,-0.12],['c',0.00,-0.03,-0.03,-0.15,-0.09,-0.24],['c',-0.18,-0.45,-0.54,-0.87,-0.96,-1.08],['c',-1.11,-0.57,-2.34,-0.18,-2.88,0.90],['c',-0.24,0.51,-0.33,1.11,-0.24,1.83],['c',0.27,1.92,1.50,3.54,3.93,5.13],['c',0.48,0.33,1.26,0.78,1.29,0.78],['c',0.03,0.00,1.35,-2.19,2.94,-4.89],['l',2.88,-4.89],['l',0.84,0.00],['l',0.87,0.00],['l',-0.03,0.06],['c',-0.15,0.21,-6.15,10.41,-6.15,10.44],['c',0.00,0.00,0.21,0.15,0.48,0.27],['c',2.61,1.47,4.35,3.03,5.13,4.65],['c',1.14,2.34,0.51,5.07,-1.44,6.39],['c',-0.66,0.42,-1.32,0.63,-2.13,0.69],['c',-2.01,0.09,-3.81,-1.41,-4.26,-3.54],['c',-0.09,-0.42,-0.09,-1.20,-0.03,-1.50],['c',0.15,-0.45,0.39,-0.81,0.66,-0.93],['c',0.33,-0.18,0.84,-0.21,1.23,-0.15],['c',0.81,0.18,1.32,0.93,1.26,1.89],['c',-0.03,0.36,-0.09,0.57,-0.24,0.90],['c',-0.15,0.33,-0.45,0.60,-0.72,0.75],['c',-0.12,0.06,-0.18,0.09,-0.18,0.12],['c',0.00,0.03,0.03,0.15,0.09,0.24],['c',0.18,0.45,0.54,0.87,0.96,1.08],['c',1.11,0.57,2.34,0.18,2.88,-0.90],['c',0.24,-0.51,0.33,-1.11,0.24,-1.83],['c',-0.27,-1.92,-1.50,-3.54,-3.93,-5.13],['c',-0.48,-0.33,-1.26,-0.78,-1.29,-0.78],['c',-0.03,0.00,-1.35,2.19,-2.91,4.89],['l',-2.88,4.89],['l',-0.87,0.00],['l',-0.87,0.00],['l',0.03,-0.06],['c',0.15,-0.21,6.15,-10.41,6.15,-10.44],['c',0.00,0.00,-0.21,-0.15,-0.48,-0.30],['c',-2.61,-1.44,-4.35,-3.00,-5.13,-4.62],['c',-0.90,-1.89,-0.72,-4.02,0.48,-5.52],['c',0.69,-0.84,1.68,-1.41,2.73,-1.53],['z'],['m',8.76,9.09],['c',0.03,-0.03,0.15,-0.03,0.27,-0.03],['c',0.33,0.03,0.57,0.18,0.72,0.48],['c',0.09,0.18,0.09,0.57,0.00,0.75],['c',-0.09,0.18,-0.21,0.30,-0.36,0.39],['c',-0.15,0.06,-0.21,0.06,-0.39,0.06],['c',-0.21,0.00,-0.27,0.00,-0.39,-0.06],['c',-0.30,-0.15,-0.48,-0.45,-0.48,-0.75],['c',0.00,-0.39,0.24,-0.72,0.63,-0.84],['z'],['m',-10.53,2.61],['c',0.03,-0.03,0.15,-0.03,0.27,-0.03],['c',0.33,0.03,0.57,0.18,0.72,0.48],['c',0.09,0.18,0.09,0.57,0.00,0.75],['c',-0.09,0.18,-0.21,0.30,-0.36,0.39],['c',-0.15,0.06,-0.21,0.06,-0.39,0.06],['c',-0.21,0.00,-0.27,0.00,-0.39,-0.06],['c',-0.30,-0.15,-0.48,-0.45,-0.48,-0.75],['c',0.00,-0.39,0.24,-0.72,0.63,-0.84],['z']],w:15,h:22.504},
		'scripts.coda':{d:[['M',-0.21,-10.47],['c',0.18,-0.12,0.42,-0.06,0.54,0.12],['c',0.06,0.09,0.06,0.18,0.06,1.50],['l',0.00,1.38],['l',0.18,0.00],['c',0.39,0.06,0.96,0.24,1.38,0.48],['c',1.68,0.93,2.82,3.24,3.03,6.12],['c',0.03,0.24,0.03,0.45,0.03,0.45],['c',0.00,0.03,0.60,0.03,1.35,0.03],['c',1.50,0.00,1.47,0.00,1.59,0.18],['c',0.09,0.12,0.09,0.30,0.00,0.42],['c',-0.12,0.18,-0.09,0.18,-1.59,0.18],['c',-0.75,0.00,-1.35,0.00,-1.35,0.03],['c',0.00,0.00,0.00,0.21,-0.03,0.42],['c',-0.24,3.15,-1.53,5.58,-3.45,6.36],['c',-0.27,0.12,-0.72,0.24,-0.96,0.27],['l',-0.18,0.00],['l',0.00,1.38],['c',0.00,1.32,0.00,1.41,-0.06,1.50],['c',-0.15,0.24,-0.51,0.24,-0.66,0.00],['c',-0.06,-0.09,-0.06,-0.18,-0.06,-1.50],['l',0.00,-1.38],['l',-0.18,0.00],['c',-0.39,-0.06,-0.96,-0.24,-1.38,-0.48],['c',-1.68,-0.93,-2.82,-3.24,-3.03,-6.15],['c',-0.03,-0.21,-0.03,-0.42,-0.03,-0.42],['c',0.00,-0.03,-0.60,-0.03,-1.35,-0.03],['c',-1.50,0.00,-1.47,0.00,-1.59,-0.18],['c',-0.09,-0.12,-0.09,-0.30,0.00,-0.42],['c',0.12,-0.18,0.09,-0.18,1.59,-0.18],['c',0.75,0.00,1.35,0.00,1.35,-0.03],['c',0.00,0.00,0.00,-0.21,0.03,-0.45],['c',0.24,-3.12,1.53,-5.55,3.45,-6.33],['c',0.27,-0.12,0.72,-0.24,0.96,-0.27],['l',0.18,0.00],['l',0.00,-1.38],['c',0.00,-1.53,0.00,-1.50,0.18,-1.62],['z'],['m',-0.18,6.93],['c',0.00,-2.97,0.00,-3.15,-0.06,-3.15],['c',-0.09,0.00,-0.51,0.15,-0.66,0.21],['c',-0.87,0.51,-1.38,1.62,-1.56,3.51],['c',-0.06,0.54,-0.12,1.59,-0.12,2.16],['l',0.00,0.42],['l',1.20,0.00],['l',1.20,0.00],['l',0.00,-3.15],['z'],['m',1.17,-3.06],['c',-0.09,-0.03,-0.21,-0.06,-0.27,-0.09],['l',-0.12,0.00],['l',0.00,3.15],['l',0.00,3.15],['l',1.20,0.00],['l',1.20,0.00],['l',0.00,-0.81],['c',-0.06,-2.40,-0.33,-3.69,-0.93,-4.59],['c',-0.27,-0.39,-0.66,-0.69,-1.08,-0.81],['z'],['m',-1.17,10.14],['l',0.00,-3.15],['l',-1.20,0.00],['l',-1.20,0.00],['l',0.00,0.81],['c',0.03,0.96,0.06,1.47,0.15,2.13],['c',0.24,2.04,0.96,3.12,2.13,3.36],['l',0.12,0.00],['l',0.00,-3.15],['z'],['m',3.18,-2.34],['l',0.00,-0.81],['l',-1.20,0.00],['l',-1.20,0.00],['l',0.00,3.15],['l',0.00,3.15],['l',0.12,0.00],['c',1.17,-0.24,1.89,-1.32,2.13,-3.36],['c',0.09,-0.66,0.12,-1.17,0.15,-2.13],['z']],w:16.035,h:21.062},
		'scripts.comma':{d:[['M',1.14,-4.62],['c',0.30,-0.12,0.69,-0.03,0.93,0.15],['c',0.12,0.12,0.36,0.45,0.51,0.78],['c',0.90,1.77,0.54,4.05,-1.08,6.75],['c',-0.36,0.63,-0.87,1.38,-0.96,1.44],['c',-0.18,0.12,-0.42,0.06,-0.54,-0.12],['c',-0.09,-0.18,-0.09,-0.30,0.12,-0.60],['c',0.96,-1.44,1.44,-2.97,1.38,-4.35],['c',-0.06,-0.93,-0.30,-1.68,-0.78,-2.46],['c',-0.27,-0.39,-0.33,-0.63,-0.24,-0.96],['c',0.09,-0.27,0.36,-0.54,0.66,-0.63],['z']],w:3.042,h:9.237},
		'scripts.roll':{d:[['M',1.95,-6.00],['c',0.21,-0.09,0.36,-0.09,0.57,0.00],['c',0.39,0.15,0.63,0.39,1.47,1.35],['c',0.66,0.75,0.78,0.87,1.08,1.05],['c',0.75,0.45,1.65,0.42,2.40,-0.06],['c',0.12,-0.09,0.27,-0.27,0.54,-0.60],['c',0.42,-0.54,0.51,-0.63,0.69,-0.63],['c',0.09,0.00,0.30,0.12,0.36,0.21],['c',0.09,0.12,0.12,0.30,0.03,0.42],['c',-0.06,0.12,-3.15,3.90,-3.30,4.08],['c',-0.06,0.06,-0.18,0.12,-0.27,0.18],['c',-0.27,0.12,-0.60,0.06,-0.99,-0.27],['c',-0.27,-0.21,-0.42,-0.39,-1.08,-1.14],['c',-0.63,-0.72,-0.81,-0.90,-1.17,-1.08],['c',-0.36,-0.18,-0.57,-0.21,-0.99,-0.21],['c',-0.39,0.00,-0.63,0.03,-0.93,0.18],['c',-0.36,0.15,-0.51,0.27,-0.90,0.81],['c',-0.24,0.27,-0.45,0.51,-0.48,0.54],['c',-0.12,0.09,-0.27,0.06,-0.39,0.00],['c',-0.24,-0.15,-0.33,-0.39,-0.21,-0.60],['c',0.09,-0.12,3.18,-3.87,3.33,-4.02],['c',0.06,-0.06,0.18,-0.15,0.24,-0.21],['z']],w:10.817,h:6.125},
		'scripts.prall':{d:[['M',-4.38,-3.69],['c',0.06,-0.03,0.18,-0.06,0.24,-0.06],['c',0.30,0.00,0.27,-0.03,1.89,1.95],['l',1.53,1.83],['c',0.03,0.00,0.57,-0.84,1.23,-1.83],['c',1.14,-1.68,1.23,-1.83,1.35,-1.89],['c',0.06,-0.03,0.18,-0.06,0.24,-0.06],['c',0.30,0.00,0.27,-0.03,1.89,1.95],['l',1.53,1.83],['l',0.48,-0.69],['c',0.51,-0.78,0.54,-0.84,0.69,-0.90],['c',0.42,-0.18,0.87,0.15,0.81,0.60],['c',-0.03,0.12,-0.30,0.51,-1.50,2.37],['c',-1.38,2.07,-1.50,2.22,-1.62,2.28],['c',-0.06,0.03,-0.18,0.06,-0.24,0.06],['c',-0.30,0.00,-0.27,0.03,-1.89,-1.95],['l',-1.53,-1.83],['c',-0.03,0.00,-0.57,0.84,-1.23,1.83],['c',-1.14,1.68,-1.23,1.83,-1.35,1.89],['c',-0.06,0.03,-0.18,0.06,-0.24,0.06],['c',-0.30,0.00,-0.27,0.03,-1.89,-1.95],['l',-1.53,-1.83],['l',-0.48,0.69],['c',-0.51,0.78,-0.54,0.84,-0.69,0.90],['c',-0.42,0.18,-0.87,-0.15,-0.81,-0.60],['c',0.03,-0.12,0.30,-0.51,1.50,-2.37],['c',1.38,-2.07,1.50,-2.22,1.62,-2.28],['z']],w:15.011,h:7.5},
		'scripts.mordent':{d:[['M',-0.21,-4.95],['c',0.27,-0.15,0.63,0.00,0.75,0.27],['c',0.06,0.12,0.06,0.24,0.06,1.44],['l',0.00,1.29],['l',0.57,-0.84],['c',0.51,-0.75,0.57,-0.84,0.69,-0.90],['c',0.06,-0.03,0.18,-0.06,0.24,-0.06],['c',0.30,0.00,0.27,-0.03,1.89,1.95],['l',1.53,1.83],['l',0.48,-0.69],['c',0.51,-0.78,0.54,-0.84,0.69,-0.90],['c',0.42,-0.18,0.87,0.15,0.81,0.60],['c',-0.03,0.12,-0.30,0.51,-1.50,2.37],['c',-1.38,2.07,-1.50,2.22,-1.62,2.28],['c',-0.06,0.03,-0.18,0.06,-0.24,0.06],['c',-0.30,0.00,-0.27,0.03,-1.83,-1.89],['c',-0.81,-0.99,-1.50,-1.80,-1.53,-1.86],['c',-0.06,-0.03,-0.06,-0.03,-0.12,0.03],['c',-0.06,0.06,-0.06,0.15,-0.06,2.28],['c',0.00,1.95,0.00,2.25,-0.06,2.34],['c',-0.18,0.45,-0.81,0.48,-1.05,0.03],['c',-0.03,-0.06,-0.06,-0.24,-0.06,-1.41],['l',0.00,-1.35],['l',-0.57,0.84],['c',-0.54,0.78,-0.60,0.87,-0.72,0.93],['c',-0.06,0.03,-0.18,0.06,-0.24,0.06],['c',-0.30,0.00,-0.27,0.03,-1.89,-1.95],['l',-1.53,-1.83],['l',-0.48,0.69],['c',-0.51,0.78,-0.54,0.84,-0.69,0.90],['c',-0.42,0.18,-0.87,-0.15,-0.81,-0.60],['c',0.03,-0.12,0.30,-0.51,1.50,-2.37],['c',1.38,-2.07,1.50,-2.22,1.62,-2.28],['c',0.06,-0.03,0.18,-0.06,0.24,-0.06],['c',0.30,0.00,0.27,-0.03,1.89,1.95],['l',1.53,1.83],['c',0.03,0.00,0.06,-0.06,0.09,-0.09],['c',0.06,-0.12,0.06,-0.15,0.06,-2.28],['c',0.00,-1.92,0.00,-2.22,0.06,-2.31],['c',0.06,-0.15,0.15,-0.24,0.30,-0.30],['z']],w:15.011,h:10.012},
		'flags.u8th':{d:[['M',-0.42,3.75],['l',0.00,-3.75],['l',0.21,0.00],['l',0.21,0.00],['l',0.00,0.18],['c',0.00,0.30,0.06,0.84,0.12,1.23],['c',0.24,1.53,0.90,3.12,2.13,5.16],['l',0.99,1.59],['c',0.87,1.44,1.38,2.34,1.77,3.09],['c',0.81,1.68,1.20,3.06,1.26,4.53],['c',0.03,1.53,-0.21,3.27,-0.75,5.01],['c',-0.21,0.69,-0.51,1.50,-0.60,1.59],['c',-0.09,0.12,-0.27,0.21,-0.42,0.21],['c',-0.15,0.00,-0.42,-0.12,-0.51,-0.21],['c',-0.15,-0.18,-0.18,-0.42,-0.09,-0.66],['c',0.15,-0.33,0.45,-1.20,0.57,-1.62],['c',0.42,-1.38,0.60,-2.58,0.60,-3.90],['c',0.00,-0.66,0.00,-0.81,-0.06,-1.11],['c',-0.39,-2.07,-1.80,-4.26,-4.59,-7.14],['l',-0.42,-0.45],['l',-0.21,0.00],['l',-0.21,0.00],['l',0.00,-3.75],['z']],w:6.692,h:22.59},
		'flags.u16th':{d:[['M',-0.42,7.50],['l',0.00,-7.50],['l',0.21,0.00],['l',0.21,0.00],['l',0.00,0.39],['c',0.06,1.08,0.39,2.19,0.99,3.39],['c',0.45,0.90,0.87,1.59,1.95,3.12],['c',1.29,1.86,1.77,2.64,2.22,3.57],['c',0.45,0.93,0.72,1.80,0.87,2.64],['c',0.06,0.51,0.06,1.50,0.00,1.92],['c',-0.12,0.60,-0.30,1.20,-0.54,1.71],['l',-0.09,0.24],['l',0.18,0.45],['c',0.51,1.20,0.72,2.22,0.69,3.42],['c',-0.06,1.53,-0.39,3.03,-0.99,4.53],['c',-0.30,0.75,-0.36,0.81,-0.57,0.90],['c',-0.15,0.09,-0.33,0.06,-0.48,0.00],['c',-0.18,-0.09,-0.27,-0.18,-0.33,-0.33],['c',-0.09,-0.18,-0.06,-0.30,0.12,-0.75],['c',0.66,-1.41,1.02,-2.88,1.08,-4.32],['c',0.00,-0.60,-0.03,-1.05,-0.18,-1.59],['c',-0.30,-1.20,-0.99,-2.40,-2.25,-3.87],['c',-0.42,-0.48,-1.53,-1.62,-2.19,-2.22],['l',-0.45,-0.42],['l',-0.03,1.11],['l',0.00,1.11],['l',-0.21,0.00],['l',-0.21,0.00],['l',0.00,-7.50],['z'],['m',1.65,0.09],['c',-0.30,-0.30,-0.69,-0.72,-0.90,-0.87],['l',-0.33,-0.33],['l',0.00,0.15],['c',0.00,0.30,0.06,0.81,0.15,1.26],['c',0.27,1.29,0.87,2.61,2.04,4.29],['c',0.15,0.24,0.60,0.87,0.96,1.38],['l',1.08,1.53],['l',0.42,0.63],['c',0.03,0.00,0.12,-0.36,0.21,-0.72],['c',0.06,-0.33,0.06,-1.20,0.00,-1.62],['c',-0.33,-1.71,-1.44,-3.48,-3.63,-5.70],['z']],w:6.693,h:26.337},
		'flags.u32nd':{d:[['M',-0.42,11.25],['l',0.00,-11.25],['l',0.21,0.00],['l',0.21,0.00],['l',0.00,0.36],['c',0.09,1.68,0.69,3.27,2.07,5.46],['l',0.87,1.35],['c',1.02,1.62,1.47,2.37,1.86,3.18],['c',0.48,1.02,0.78,1.92,0.93,2.88],['c',0.06,0.48,0.06,1.50,0.00,1.89],['c',-0.09,0.42,-0.21,0.87,-0.36,1.26],['l',-0.12,0.30],['l',0.15,0.39],['c',0.69,1.56,0.84,2.88,0.54,4.38],['c',-0.09,0.45,-0.27,1.08,-0.45,1.47],['l',-0.12,0.24],['l',0.18,0.36],['c',0.33,0.72,0.57,1.56,0.69,2.34],['c',0.12,1.02,-0.06,2.52,-0.42,3.84],['c',-0.27,0.93,-0.75,2.13,-0.93,2.31],['c',-0.18,0.15,-0.45,0.18,-0.66,0.09],['c',-0.18,-0.09,-0.27,-0.18,-0.33,-0.33],['c',-0.09,-0.18,-0.06,-0.30,0.06,-0.60],['c',0.21,-0.36,0.42,-0.90,0.57,-1.38],['c',0.51,-1.41,0.69,-3.06,0.48,-4.08],['c',-0.15,-0.81,-0.57,-1.68,-1.20,-2.55],['c',-0.72,-0.99,-1.83,-2.13,-3.30,-3.33],['l',-0.48,-0.42],['l',-0.03,1.53],['l',0.00,1.56],['l',-0.21,0.00],['l',-0.21,0.00],['l',0.00,-11.25],['z'],['m',1.26,-3.96],['c',-0.27,-0.30,-0.54,-0.60,-0.66,-0.72],['l',-0.18,-0.21],['l',0.00,0.42],['c',0.06,0.87,0.24,1.74,0.66,2.67],['c',0.36,0.87,0.96,1.86,1.92,3.18],['c',0.21,0.33,0.63,0.87,0.87,1.23],['c',0.27,0.39,0.60,0.84,0.75,1.08],['l',0.27,0.39],['l',0.03,-0.12],['c',0.12,-0.45,0.15,-1.05,0.09,-1.59],['c',-0.27,-1.86,-1.38,-3.78,-3.75,-6.33],['z'],['m',-0.27,6.09],['c',-0.27,-0.21,-0.48,-0.42,-0.51,-0.45],['c',-0.06,-0.03,-0.06,-0.03,-0.06,0.21],['c',0.00,0.90,0.30,2.04,0.81,3.09],['c',0.48,1.02,0.96,1.77,2.37,3.63],['c',0.60,0.78,1.05,1.44,1.29,1.77],['c',0.06,0.12,0.15,0.21,0.15,0.18],['c',0.03,-0.03,0.18,-0.57,0.24,-0.87],['c',0.06,-0.45,0.06,-1.32,-0.03,-1.74],['c',-0.09,-0.48,-0.24,-0.90,-0.51,-1.44],['c',-0.66,-1.35,-1.83,-2.70,-3.75,-4.38],['z']],w:6.697,h:32.145},
		'flags.u64th':{d:[['M',-0.42,15.00],['l',0.00,-15.00],['l',0.21,0.00],['l',0.21,0.00],['l',0.00,0.36],['c',0.06,1.20,0.39,2.37,1.02,3.66],['c',0.39,0.81,0.84,1.56,1.80,3.09],['c',0.81,1.26,1.05,1.68,1.35,2.22],['c',0.87,1.50,1.35,2.79,1.56,4.08],['c',0.06,0.54,0.06,1.56,-0.03,2.04],['c',-0.09,0.48,-0.21,0.99,-0.36,1.35],['l',-0.12,0.27],['l',0.12,0.27],['c',0.09,0.15,0.21,0.45,0.27,0.66],['c',0.69,1.89,0.63,3.66,-0.18,5.46],['l',-0.18,0.39],['l',0.15,0.33],['c',0.30,0.66,0.51,1.44,0.63,2.10],['c',0.06,0.48,0.06,1.35,0.00,1.71],['c',-0.15,0.57,-0.42,1.20,-0.78,1.68],['l',-0.21,0.27],['l',0.18,0.33],['c',0.57,1.05,0.93,2.13,1.02,3.18],['c',0.06,0.72,0.00,1.83,-0.21,2.79],['c',-0.18,1.02,-0.63,2.34,-1.02,3.09],['c',-0.15,0.33,-0.48,0.45,-0.78,0.30],['c',-0.18,-0.09,-0.27,-0.18,-0.33,-0.33],['c',-0.09,-0.18,-0.06,-0.30,0.03,-0.54],['c',0.75,-1.50,1.23,-3.45,1.17,-4.89],['c',-0.06,-1.02,-0.42,-2.01,-1.17,-3.15],['c',-0.48,-0.72,-1.02,-1.35,-1.89,-2.22],['c',-0.57,-0.57,-1.56,-1.50,-1.92,-1.77],['l',-0.12,-0.09],['l',0.00,1.68],['l',0.00,1.68],['l',-0.21,0.00],['l',-0.21,0.00],['l',0.00,-15.00],['z'],['m',0.93,-8.07],['c',-0.27,-0.30,-0.48,-0.54,-0.51,-0.54],['c',0.00,0.00,0.00,0.69,0.03,1.02],['c',0.15,1.47,0.75,2.94,2.04,4.83],['l',1.08,1.53],['c',0.39,0.57,0.84,1.20,0.99,1.44],['c',0.15,0.24,0.30,0.45,0.30,0.45],['c',0.00,0.00,0.03,-0.09,0.06,-0.21],['c',0.36,-1.59,-0.15,-3.33,-1.47,-5.40],['c',-0.63,-0.93,-1.35,-1.83,-2.52,-3.12],['z'],['m',0.06,6.72],['c',-0.24,-0.21,-0.48,-0.42,-0.51,-0.45],['l',-0.06,-0.06],['l',0.00,0.33],['c',0.00,1.20,0.30,2.34,0.93,3.60],['c',0.45,0.90,0.96,1.68,2.25,3.51],['c',0.39,0.54,0.84,1.17,1.02,1.44],['c',0.21,0.33,0.33,0.51,0.33,0.48],['c',0.06,-0.09,0.21,-0.63,0.30,-0.99],['c',0.06,-0.33,0.06,-0.45,0.06,-0.96],['c',0.00,-0.60,-0.03,-0.84,-0.18,-1.35],['c',-0.30,-1.08,-1.02,-2.28,-2.13,-3.57],['c',-0.39,-0.45,-1.44,-1.47,-2.01,-1.98],['z'],['m',0.00,6.72],['c',-0.24,-0.21,-0.48,-0.39,-0.51,-0.42],['l',-0.06,-0.06],['l',0.00,0.33],['c',0.00,1.41,0.45,2.82,1.38,4.35],['c',0.42,0.72,0.72,1.14,1.86,2.73],['c',0.36,0.45,0.75,0.99,0.87,1.20],['c',0.15,0.21,0.30,0.36,0.30,0.36],['c',0.06,0.00,0.30,-0.48,0.39,-0.75],['c',0.09,-0.36,0.12,-0.63,0.12,-1.05],['c',-0.06,-1.05,-0.45,-2.04,-1.20,-3.18],['c',-0.57,-0.87,-1.11,-1.53,-2.07,-2.49],['c',-0.36,-0.33,-0.84,-0.78,-1.08,-1.02],['z']],w:6.682,h:39.694},
		'flags.d8th':{d:[['M',5.67,-21.63],['c',0.24,-0.12,0.54,-0.06,0.69,0.15],['c',0.06,0.06,0.21,0.36,0.39,0.66],['c',0.84,1.77,1.26,3.36,1.32,5.10],['c',0.03,1.29,-0.21,2.37,-0.81,3.63],['c',-0.60,1.23,-1.26,2.13,-3.21,4.38],['c',-1.35,1.53,-1.86,2.19,-2.40,2.97],['c',-0.63,0.93,-1.11,1.92,-1.38,2.79],['c',-0.15,0.54,-0.27,1.35,-0.27,1.80],['l',0.00,0.15],['l',-0.21,0.00],['l',-0.21,0.00],['l',0.00,-3.75],['l',0.00,-3.75],['l',0.21,0.00],['l',0.21,0.00],['l',0.48,-0.30],['c',1.83,-1.11,3.12,-2.10,4.17,-3.12],['c',0.78,-0.81,1.32,-1.53,1.71,-2.31],['c',0.45,-0.93,0.60,-1.74,0.51,-2.88],['c',-0.12,-1.56,-0.63,-3.18,-1.47,-4.68],['c',-0.12,-0.21,-0.15,-0.33,-0.06,-0.51],['c',0.06,-0.15,0.15,-0.24,0.33,-0.33],['z']],w:8.492,h:21.691},
		'flags.ugrace':{d:[['M',6.03,6.93],['c',0.15,-0.09,0.33,-0.06,0.51,0.00],['c',0.15,0.09,0.21,0.15,0.30,0.33],['c',0.09,0.18,0.06,0.39,-0.03,0.54],['c',-0.06,0.15,-10.89,8.88,-11.07,8.97],['c',-0.15,0.09,-0.33,0.06,-0.48,0.00],['c',-0.18,-0.09,-0.24,-0.15,-0.33,-0.33],['c',-0.09,-0.18,-0.06,-0.39,0.03,-0.54],['c',0.06,-0.15,10.89,-8.88,11.07,-8.97],['z']],w:12.019,h:9.954},
		'flags.dgrace':{d:[['M',-6.06,-15.93],['c',0.18,-0.09,0.33,-0.12,0.48,-0.06],['c',0.18,0.09,14.01,8.04,14.10,8.10],['c',0.12,0.12,0.18,0.33,0.18,0.51],['c',-0.03,0.21,-0.15,0.39,-0.36,0.48],['c',-0.18,0.09,-0.33,0.12,-0.48,0.06],['c',-0.18,-0.09,-14.01,-8.04,-14.10,-8.10],['c',-0.12,-0.12,-0.18,-0.33,-0.18,-0.51],['c',0.03,-0.21,0.15,-0.39,0.36,-0.48],['z']],w:15.12,h:9.212},
		'flags.d16th':{d:[['M',6.84,-22.53],['c',0.27,-0.12,0.57,-0.06,0.72,0.15],['c',0.15,0.15,0.33,0.87,0.45,1.56],['c',0.06,0.33,0.06,1.35,0.00,1.65],['c',-0.06,0.33,-0.15,0.78,-0.27,1.11],['c',-0.12,0.33,-0.45,0.96,-0.66,1.32],['l',-0.18,0.27],['l',0.09,0.18],['c',0.48,1.02,0.72,2.25,0.69,3.30],['c',-0.06,1.23,-0.42,2.28,-1.26,3.45],['c',-0.57,0.87,-0.99,1.32,-3.00,3.39],['c',-1.56,1.56,-2.22,2.40,-2.76,3.45],['c',-0.42,0.84,-0.66,1.80,-0.66,2.55],['l',0.00,0.15],['l',-0.21,0.00],['l',-0.21,0.00],['l',0.00,-7.50],['l',0.00,-7.50],['l',0.21,0.00],['l',0.21,0.00],['l',0.00,1.14],['l',0.00,1.11],['l',0.27,-0.15],['c',1.11,-0.57,1.77,-0.99,2.52,-1.47],['c',2.37,-1.56,3.69,-3.15,4.05,-4.83],['c',0.03,-0.18,0.03,-0.39,0.03,-0.78],['c',0.00,-0.60,-0.03,-0.93,-0.24,-1.50],['c',-0.06,-0.18,-0.12,-0.39,-0.15,-0.45],['c',-0.03,-0.24,0.12,-0.48,0.36,-0.60],['z'],['m',-0.63,7.50],['c',-0.06,-0.18,-0.15,-0.36,-0.15,-0.36],['c',-0.03,0.00,-0.03,0.03,-0.06,0.06],['c',-0.06,0.12,-0.96,1.02,-1.95,1.98],['c',-0.63,0.57,-1.26,1.17,-1.44,1.35],['c',-1.53,1.62,-2.28,2.85,-2.55,4.32],['c',-0.03,0.18,-0.03,0.54,-0.06,0.99],['l',0.00,0.69],['l',0.18,-0.09],['c',0.93,-0.54,2.10,-1.29,2.82,-1.83],['c',0.69,-0.51,1.02,-0.81,1.53,-1.29],['c',1.86,-1.89,2.37,-3.66,1.68,-5.82],['z']],w:8.475,h:22.591},
		'flags.d32nd':{d:[['M',6.84,-29.13],['c',0.27,-0.12,0.57,-0.06,0.72,0.15],['c',0.12,0.12,0.27,0.63,0.36,1.11],['c',0.33,1.59,0.06,3.06,-0.81,4.47],['l',-0.18,0.27],['l',0.09,0.15],['c',0.12,0.24,0.33,0.69,0.45,1.05],['c',0.63,1.83,0.45,3.57,-0.57,5.22],['l',-0.18,0.30],['l',0.15,0.27],['c',0.42,0.87,0.60,1.71,0.57,2.61],['c',-0.06,1.29,-0.48,2.46,-1.35,3.78],['c',-0.54,0.81,-0.93,1.29,-2.46,3.00],['c',-0.51,0.54,-1.05,1.17,-1.26,1.41],['c',-1.56,1.86,-2.25,3.36,-2.37,5.01],['l',0.00,0.33],['l',-0.21,0.00],['l',-0.21,0.00],['l',0.00,-11.25],['l',0.00,-11.25],['l',0.21,0.00],['l',0.21,0.00],['l',0.00,1.35],['l',0.03,1.35],['l',0.78,-0.39],['c',1.38,-0.69,2.34,-1.26,3.24,-1.92],['c',1.38,-1.02,2.28,-2.13,2.64,-3.21],['c',0.15,-0.48,0.18,-0.72,0.18,-1.29],['c',0.00,-0.57,-0.06,-0.90,-0.24,-1.47],['c',-0.06,-0.18,-0.12,-0.39,-0.15,-0.45],['c',-0.03,-0.24,0.12,-0.48,0.36,-0.60],['z'],['m',-0.63,7.20],['c',-0.09,-0.18,-0.12,-0.21,-0.12,-0.15],['c',-0.03,0.09,-1.02,1.08,-2.04,2.04],['c',-1.17,1.08,-1.65,1.56,-2.07,2.04],['c',-0.84,0.96,-1.38,1.86,-1.68,2.76],['c',-0.21,0.57,-0.27,0.99,-0.30,1.65],['l',0.00,0.54],['l',0.66,-0.33],['c',3.57,-1.86,5.49,-3.69,5.94,-5.70],['c',0.06,-0.39,0.06,-1.20,-0.03,-1.65],['c',-0.06,-0.39,-0.24,-0.90,-0.36,-1.20],['z'],['m',-0.06,7.20],['c',-0.06,-0.15,-0.12,-0.33,-0.15,-0.45],['l',-0.06,-0.18],['l',-0.18,0.21],['l',-1.83,1.83],['c',-0.87,0.90,-1.77,1.80,-1.95,2.01],['c',-1.08,1.29,-1.62,2.31,-1.89,3.51],['c',-0.06,0.30,-0.06,0.51,-0.09,0.93],['l',0.00,0.57],['l',0.09,-0.06],['c',0.75,-0.45,1.89,-1.26,2.52,-1.74],['c',0.81,-0.66,1.74,-1.53,2.22,-2.16],['c',1.26,-1.53,1.68,-3.06,1.32,-4.47],['z']],w:8.385,h:29.191},
		'flags.d64th':{d:[['M',7.08,-32.88],['c',0.30,-0.12,0.66,-0.03,0.78,0.24],['c',0.18,0.33,0.27,2.10,0.15,2.64],['c',-0.09,0.39,-0.21,0.78,-0.39,1.08],['l',-0.15,0.30],['l',0.09,0.27],['c',0.03,0.12,0.09,0.45,0.12,0.69],['c',0.27,1.44,0.18,2.55,-0.30,3.60],['l',-0.12,0.33],['l',0.06,0.42],['c',0.27,1.35,0.33,2.82,0.21,3.63],['c',-0.12,0.60,-0.30,1.23,-0.57,1.80],['l',-0.15,0.27],['l',0.03,0.42],['c',0.06,1.02,0.06,2.70,0.03,3.06],['c',-0.15,1.47,-0.66,2.76,-1.74,4.41],['c',-0.45,0.69,-0.75,1.11,-1.74,2.37],['c',-1.05,1.38,-1.50,1.98,-1.95,2.73],['c',-0.93,1.50,-1.38,2.82,-1.44,4.20],['l',0.00,0.42],['l',-0.21,0.00],['l',-0.21,0.00],['l',0.00,-15.00],['l',0.00,-15.00],['l',0.21,0.00],['l',0.21,0.00],['l',0.00,1.86],['l',0.00,1.89],['c',0.00,0.00,0.21,-0.03,0.45,-0.09],['c',2.22,-0.39,4.08,-1.11,5.19,-2.01],['c',0.63,-0.54,1.02,-1.14,1.20,-1.80],['c',0.06,-0.30,0.06,-1.14,-0.03,-1.65],['c',-0.03,-0.18,-0.06,-0.39,-0.09,-0.48],['c',-0.03,-0.24,0.12,-0.48,0.36,-0.60],['z'],['m',-0.45,6.15],['c',-0.03,-0.18,-0.06,-0.42,-0.06,-0.54],['l',-0.03,-0.18],['l',-0.33,0.30],['c',-0.42,0.36,-0.87,0.72,-1.68,1.29],['c',-1.98,1.38,-2.25,1.59,-2.85,2.16],['c',-0.75,0.69,-1.23,1.44,-1.47,2.19],['c',-0.15,0.45,-0.18,0.63,-0.21,1.35],['l',0.00,0.66],['l',0.39,-0.18],['c',1.83,-0.90,3.45,-1.95,4.47,-2.91],['c',0.93,-0.90,1.53,-1.83,1.74,-2.82],['c',0.06,-0.33,0.06,-0.87,0.03,-1.32],['z'],['m',-0.27,4.86],['c',-0.03,-0.21,-0.06,-0.36,-0.06,-0.36],['c',0.00,-0.03,-0.12,0.09,-0.24,0.24],['c',-0.39,0.48,-0.99,1.08,-2.16,2.19],['c',-1.47,1.38,-1.92,1.83,-2.46,2.49],['c',-0.66,0.87,-1.08,1.74,-1.29,2.58],['c',-0.09,0.42,-0.15,0.87,-0.15,1.44],['l',0.00,0.54],['l',0.48,-0.33],['c',1.50,-1.02,2.58,-1.89,3.51,-2.82],['c',1.47,-1.47,2.25,-2.85,2.40,-4.26],['c',0.03,-0.39,0.03,-1.17,-0.03,-1.71],['z'],['m',-0.66,7.68],['c',0.03,-0.15,0.03,-0.60,0.03,-0.99],['l',0.00,-0.72],['l',-0.27,0.33],['l',-1.74,1.98],['c',-1.77,1.92,-2.43,2.76,-2.97,3.90],['c',-0.51,1.02,-0.72,1.77,-0.75,2.91],['c',0.00,0.63,0.00,0.63,0.06,0.60],['c',0.03,-0.03,0.30,-0.27,0.63,-0.54],['c',0.66,-0.60,1.86,-1.80,2.31,-2.31],['c',1.65,-1.89,2.52,-3.54,2.70,-5.16],['z']],w:8.485,h:32.932},
		'clefs.C':{d:[['M',0.06,-14.94],['l',0.09,-0.06],['l',1.92,0.00],['l',1.92,0.00],['l',0.09,0.06],['l',0.06,0.09],['l',0.00,14.85],['l',0.00,14.82],['l',-0.06,0.09],['l',-0.09,0.06],['l',-1.92,0.00],['l',-1.92,0.00],['l',-0.09,-0.06],['l',-0.06,-0.09],['l',0.00,-14.82],['l',0.00,-14.85],['z'],['m',5.37,0.00],['c',0.09,-0.06,0.09,-0.06,0.57,-0.06],['c',0.45,0.00,0.45,0.00,0.54,0.06],['l',0.06,0.09],['l',0.00,7.14],['l',0.00,7.11],['l',0.09,-0.06],['c',0.18,-0.18,0.72,-0.84,0.96,-1.20],['c',0.30,-0.45,0.66,-1.17,0.84,-1.65],['c',0.36,-0.90,0.57,-1.83,0.60,-2.79],['c',0.03,-0.48,0.03,-0.54,0.09,-0.63],['c',0.12,-0.18,0.36,-0.21,0.54,-0.12],['c',0.18,0.09,0.21,0.15,0.24,0.66],['c',0.06,0.87,0.21,1.56,0.57,2.22],['c',0.51,1.02,1.26,1.68,2.22,1.92],['c',0.21,0.06,0.33,0.06,0.78,0.06],['c',0.45,0.00,0.57,0.00,0.84,-0.06],['c',0.45,-0.12,0.81,-0.33,1.08,-0.60],['c',0.57,-0.57,0.87,-1.41,0.99,-2.88],['c',0.06,-0.54,0.06,-3.00,0.00,-3.57],['c',-0.21,-2.58,-0.84,-3.87,-2.16,-4.50],['c',-0.48,-0.21,-1.17,-0.36,-1.77,-0.36],['c',-0.69,0.00,-1.29,0.27,-1.50,0.72],['c',-0.06,0.15,-0.06,0.21,-0.06,0.42],['c',0.00,0.24,0.00,0.30,0.06,0.45],['c',0.12,0.24,0.24,0.39,0.63,0.66],['c',0.42,0.30,0.57,0.48,0.69,0.72],['c',0.06,0.15,0.06,0.21,0.06,0.48],['c',0.00,0.39,-0.03,0.63,-0.21,0.96],['c',-0.30,0.60,-0.87,1.08,-1.50,1.26],['c',-0.27,0.06,-0.87,0.06,-1.14,0.00],['c',-0.78,-0.24,-1.44,-0.87,-1.65,-1.68],['c',-0.12,-0.42,-0.09,-1.17,0.09,-1.71],['c',0.51,-1.65,1.98,-2.82,3.81,-3.09],['c',0.84,-0.09,2.46,0.03,3.51,0.27],['c',2.22,0.57,3.69,1.80,4.44,3.75],['c',0.36,0.93,0.57,2.13,0.57,3.36],['c',0.00,1.44,-0.48,2.73,-1.38,3.81],['c',-1.26,1.50,-3.27,2.43,-5.28,2.43],['c',-0.48,0.00,-0.51,0.00,-0.75,-0.09],['c',-0.15,-0.03,-0.48,-0.21,-0.78,-0.36],['c',-0.69,-0.36,-0.87,-0.42,-1.26,-0.42],['c',-0.27,0.00,-0.30,0.00,-0.51,0.09],['c',-0.57,0.30,-0.81,0.90,-0.81,2.10],['c',0.00,1.23,0.24,1.83,0.81,2.13],['c',0.21,0.09,0.24,0.09,0.51,0.09],['c',0.39,0.00,0.57,-0.06,1.26,-0.42],['c',0.30,-0.15,0.63,-0.33,0.78,-0.36],['c',0.24,-0.09,0.27,-0.09,0.75,-0.09],['c',2.01,0.00,4.02,0.93,5.28,2.40],['c',0.90,1.11,1.38,2.40,1.38,3.84],['c',0.00,1.50,-0.30,2.88,-0.84,3.96],['c',-0.78,1.59,-2.19,2.64,-4.17,3.15],['c',-1.05,0.24,-2.67,0.36,-3.51,0.27],['c',-1.83,-0.27,-3.30,-1.44,-3.81,-3.09],['c',-0.18,-0.54,-0.21,-1.29,-0.09,-1.74],['c',0.15,-0.60,0.63,-1.20,1.23,-1.47],['c',0.36,-0.18,0.57,-0.21,0.99,-0.21],['c',0.42,0.00,0.63,0.03,1.02,0.21],['c',0.42,0.21,0.84,0.63,1.05,1.05],['c',0.18,0.36,0.21,0.60,0.21,0.96],['c',0.00,0.30,0.00,0.36,-0.06,0.51],['c',-0.12,0.24,-0.27,0.42,-0.69,0.72],['c',-0.57,0.42,-0.69,0.63,-0.69,1.08],['c',0.00,0.24,0.00,0.30,0.06,0.45],['c',0.12,0.21,0.30,0.39,0.57,0.54],['c',0.42,0.18,0.87,0.21,1.53,0.15],['c',1.08,-0.15,1.80,-0.57,2.34,-1.32],['c',0.54,-0.75,0.84,-1.83,0.99,-3.51],['c',0.06,-0.57,0.06,-3.03,0.00,-3.57],['c',-0.12,-1.47,-0.42,-2.31,-0.99,-2.88],['c',-0.27,-0.27,-0.63,-0.48,-1.08,-0.60],['c',-0.27,-0.06,-0.39,-0.06,-0.84,-0.06],['c',-0.45,0.00,-0.57,0.00,-0.78,0.06],['c',-1.14,0.27,-2.01,1.17,-2.46,2.49],['c',-0.21,0.57,-0.30,0.99,-0.33,1.65],['c',-0.03,0.51,-0.06,0.57,-0.24,0.66],['c',-0.12,0.06,-0.27,0.06,-0.39,0.00],['c',-0.21,-0.09,-0.21,-0.15,-0.24,-0.75],['c',-0.09,-1.92,-0.78,-3.72,-2.01,-5.19],['c',-0.18,-0.21,-0.36,-0.42,-0.39,-0.45],['l',-0.09,-0.06],['l',0.00,7.11],['l',0.00,7.14],['l',-0.06,0.09],['c',-0.09,0.06,-0.09,0.06,-0.54,0.06],['c',-0.48,0.00,-0.48,0.00,-0.57,-0.06],['l',-0.06,-0.09],['l',0.00,-14.82],['l',0.00,-14.85],['z']],w:20.31,h:29.97},
		'clefs.F':{d:[['M',6.30,-7.80],['c',0.36,-0.03,1.65,0.00,2.13,0.03],['c',3.60,0.42,6.03,2.10,6.93,4.86],['c',0.27,0.84,0.36,1.50,0.36,2.58],['c',0.00,0.90,-0.03,1.35,-0.18,2.16],['c',-0.78,3.78,-3.54,7.08,-8.37,9.96],['c',-1.74,1.05,-3.87,2.13,-6.18,3.12],['c',-0.39,0.18,-0.75,0.33,-0.81,0.36],['c',-0.06,0.03,-0.15,0.06,-0.18,0.06],['c',-0.15,0.00,-0.33,-0.18,-0.33,-0.33],['c',0.00,-0.15,0.06,-0.21,0.51,-0.48],['c',3.00,-1.77,5.13,-3.21,6.84,-4.74],['c',0.51,-0.45,1.59,-1.50,1.95,-1.95],['c',1.89,-2.19,2.88,-4.32,3.15,-6.78],['c',0.06,-0.42,0.06,-1.77,0.00,-2.19],['c',-0.24,-2.01,-0.93,-3.63,-2.04,-4.71],['c',-0.63,-0.63,-1.29,-1.02,-2.07,-1.20],['c',-1.62,-0.39,-3.36,0.15,-4.56,1.44],['c',-0.54,0.60,-1.05,1.47,-1.32,2.22],['l',-0.09,0.21],['l',0.24,-0.12],['c',0.39,-0.21,0.63,-0.24,1.11,-0.24],['c',0.30,0.00,0.45,0.00,0.66,0.06],['c',1.92,0.48,2.85,2.55,1.95,4.38],['c',-0.45,0.99,-1.41,1.62,-2.46,1.71],['c',-1.47,0.09,-2.91,-0.87,-3.39,-2.25],['c',-0.18,-0.57,-0.21,-1.32,-0.03,-2.28],['c',0.39,-2.25,1.83,-4.20,3.81,-5.19],['c',0.69,-0.36,1.59,-0.60,2.37,-0.69],['z'],['m',11.58,2.52],['c',0.84,-0.21,1.71,0.30,1.89,1.14],['c',0.30,1.17,-0.72,2.19,-1.89,1.89],['c',-0.99,-0.21,-1.50,-1.32,-1.02,-2.25],['c',0.18,-0.39,0.60,-0.69,1.02,-0.78],['z'],['m',0.00,7.50],['c',0.84,-0.21,1.71,0.30,1.89,1.14],['c',0.21,0.87,-0.30,1.71,-1.14,1.89],['c',-0.87,0.21,-1.71,-0.30,-1.89,-1.14],['c',-0.21,-0.84,0.30,-1.71,1.14,-1.89],['z']],w:20.153,h:23.142},
		'clefs.G':{d:[['M',9.69,-37.41],['c',0.09,-0.09,0.24,-0.06,0.36,0.00],['c',0.12,0.09,0.57,0.60,0.96,1.11],['c',1.77,2.34,3.21,5.85,3.57,8.73],['c',0.21,1.56,0.03,3.27,-0.45,4.86],['c',-0.69,2.31,-1.92,4.47,-4.23,7.44],['c',-0.30,0.39,-0.57,0.72,-0.60,0.75],['c',-0.03,0.06,0.00,0.15,0.18,0.78],['c',0.54,1.68,1.38,4.44,1.68,5.49],['l',0.09,0.42],['l',0.39,0.00],['c',1.47,0.09,2.76,0.51,3.96,1.29],['c',1.83,1.23,3.06,3.21,3.39,5.52],['c',0.09,0.45,0.12,1.29,0.06,1.74],['c',-0.09,1.02,-0.33,1.83,-0.75,2.73],['c',-0.84,1.71,-2.28,3.06,-4.02,3.72],['l',-0.33,0.12],['l',0.03,1.26],['c',0.00,1.74,-0.06,3.63,-0.21,4.62],['c',-0.45,3.06,-2.19,5.49,-4.47,6.21],['c',-0.57,0.18,-0.90,0.21,-1.59,0.21],['c',-0.69,0.00,-1.02,-0.03,-1.65,-0.21],['c',-1.14,-0.27,-2.13,-0.84,-2.94,-1.65],['c',-0.99,-0.99,-1.56,-2.16,-1.71,-3.54],['c',-0.09,-0.81,0.06,-1.53,0.45,-2.13],['c',0.63,-0.99,1.83,-1.56,3.00,-1.53],['c',1.50,0.09,2.64,1.32,2.73,2.94],['c',0.06,1.47,-0.93,2.70,-2.37,2.97],['c',-0.45,0.06,-0.84,0.03,-1.29,-0.09],['l',-0.21,-0.09],['l',0.09,0.12],['c',0.39,0.54,0.78,0.93,1.32,1.26],['c',1.35,0.87,3.06,1.02,4.35,0.36],['c',1.44,-0.72,2.52,-2.28,2.97,-4.35],['c',0.15,-0.66,0.24,-1.50,0.30,-3.03],['c',0.03,-0.84,0.03,-2.94,0.00,-3.00],['c',-0.03,0.00,-0.18,0.00,-0.36,0.03],['c',-0.66,0.12,-0.99,0.12,-1.83,0.12],['c',-1.05,0.00,-1.71,-0.06,-2.61,-0.30],['c',-4.02,-0.99,-7.11,-4.35,-7.80,-8.46],['c',-0.12,-0.66,-0.12,-0.99,-0.12,-1.83],['c',0.00,-0.84,0.00,-1.14,0.15,-1.92],['c',0.36,-2.28,1.41,-4.62,3.30,-7.29],['l',2.79,-3.60],['c',0.54,-0.66,0.96,-1.20,0.96,-1.23],['c',0.00,-0.03,-0.09,-0.33,-0.18,-0.69],['c',-0.96,-3.21,-1.41,-5.28,-1.59,-7.68],['c',-0.12,-1.38,-0.15,-3.09,-0.06,-3.96],['c',0.33,-2.67,1.38,-5.07,3.12,-7.08],['c',0.36,-0.42,0.99,-1.05,1.17,-1.14],['z'],['m',2.01,4.71],['c',-0.15,-0.30,-0.30,-0.54,-0.30,-0.54],['c',-0.03,0.00,-0.18,0.09,-0.30,0.21],['c',-2.40,1.74,-3.87,4.20,-4.26,7.11],['c',-0.06,0.54,-0.06,1.41,-0.03,1.89],['c',0.09,1.29,0.48,3.12,1.08,5.22],['c',0.15,0.42,0.24,0.78,0.24,0.81],['c',0.00,0.03,0.84,-1.11,1.23,-1.68],['c',1.89,-2.73,2.88,-5.07,3.15,-7.53],['c',0.09,-0.57,0.12,-1.74,0.06,-2.37],['c',-0.09,-1.23,-0.27,-1.92,-0.87,-3.12],['z'],['m',-2.94,20.70],['c',-0.21,-0.72,-0.39,-1.32,-0.42,-1.32],['c',0.00,0.00,-1.20,1.47,-1.86,2.37],['c',-2.79,3.63,-4.02,6.30,-4.35,9.30],['c',-0.03,0.21,-0.03,0.69,-0.03,1.08],['c',0.00,0.69,0.00,0.75,0.06,1.11],['c',0.12,0.54,0.27,0.99,0.51,1.47],['c',0.69,1.38,1.83,2.55,3.42,3.42],['c',0.96,0.54,2.07,0.90,3.21,1.08],['c',0.78,0.12,2.04,0.12,2.94,-0.03],['c',0.51,-0.06,0.45,-0.03,0.42,-0.30],['c',-0.24,-3.33,-0.72,-6.33,-1.62,-10.08],['c',-0.09,-0.39,-0.18,-0.75,-0.18,-0.78],['c',-0.03,-0.03,-0.42,0.00,-0.81,0.09],['c',-0.90,0.18,-1.65,0.57,-2.22,1.14],['c',-0.72,0.72,-1.08,1.65,-1.05,2.64],['c',0.06,0.96,0.48,1.83,1.23,2.58],['c',0.36,0.36,0.72,0.63,1.17,0.90],['c',0.33,0.18,0.36,0.21,0.42,0.33],['c',0.18,0.42,-0.18,0.90,-0.60,0.87],['c',-0.18,-0.03,-0.84,-0.36,-1.26,-0.63],['c',-0.78,-0.51,-1.38,-1.11,-1.86,-1.83],['c',-1.77,-2.70,-0.99,-6.42,1.71,-8.19],['c',0.30,-0.21,0.81,-0.48,1.17,-0.63],['c',0.30,-0.09,1.02,-0.30,1.14,-0.30],['c',0.06,0.00,0.09,0.00,0.09,-0.03],['c',0.03,-0.03,-0.51,-1.92,-1.23,-4.26],['z'],['m',3.78,7.41],['c',-0.18,-0.03,-0.36,-0.06,-0.39,-0.06],['c',-0.03,0.00,0.00,0.21,0.18,1.02],['c',0.75,3.18,1.26,6.30,1.50,9.09],['c',0.06,0.72,0.00,0.69,0.51,0.42],['c',0.78,-0.36,1.44,-0.96,1.98,-1.77],['c',1.08,-1.62,1.20,-3.69,0.30,-5.55],['c',-0.81,-1.62,-2.31,-2.79,-4.08,-3.15],['z']],w:19.051,h:57.057},
		'clefs.perc':{d:[['M',5.07,-7.44],['l',0.09,-0.06],['l',1.53,0.00],['l',1.53,0.00],['l',0.09,0.06],['l',0.06,0.09],['l',0.00,7.35],['l',0.00,7.32],['l',-0.06,0.09],['l',-0.09,0.06],['l',-1.53,0.00],['l',-1.53,0.00],['l',-0.09,-0.06],['l',-0.06,-0.09],['l',0.00,-7.32],['l',0.00,-7.35],['z'],['m',6.63,0.00],['l',0.09,-0.06],['l',1.53,0.00],['l',1.53,0.00],['l',0.09,0.06],['l',0.06,0.09],['l',0.00,7.35],['l',0.00,7.32],['l',-0.06,0.09],['l',-0.09,0.06],['l',-1.53,0.00],['l',-1.53,0.00],['l',-0.09,-0.06],['l',-0.06,-0.09],['l',0.00,-7.32],['l',0.00,-7.35],['z']],w:9.99,h:14.97},
		'timesig.common':{d:[['M',6.66,-7.83],['c',0.72,-0.06,1.41,-0.03,1.98,0.09],['c',1.20,0.27,2.34,0.96,3.09,1.92],['c',0.63,0.81,1.08,1.86,1.14,2.73],['c',0.06,1.02,-0.51,1.92,-1.44,2.22],['c',-0.24,0.09,-0.30,0.09,-0.63,0.09],['c',-0.33,0.00,-0.42,0.00,-0.63,-0.06],['c',-0.66,-0.24,-1.14,-0.63,-1.41,-1.20],['c',-0.15,-0.30,-0.21,-0.51,-0.24,-0.90],['c',-0.06,-1.08,0.57,-2.04,1.56,-2.37],['c',0.18,-0.06,0.27,-0.06,0.63,-0.06],['l',0.45,0.00],['c',0.06,0.03,0.09,0.03,0.09,0.00],['c',0.00,0.00,-0.09,-0.12,-0.24,-0.27],['c',-1.02,-1.11,-2.55,-1.68,-4.08,-1.50],['c',-1.29,0.15,-2.04,0.69,-2.40,1.74],['c',-0.36,0.93,-0.42,1.89,-0.42,5.37],['c',0.00,2.97,0.06,3.96,0.24,4.77],['c',0.24,1.08,0.63,1.68,1.41,2.07],['c',0.81,0.39,2.16,0.45,3.18,0.09],['c',1.29,-0.45,2.37,-1.53,3.03,-2.97],['c',0.15,-0.33,0.33,-0.87,0.39,-1.17],['c',0.09,-0.24,0.15,-0.36,0.30,-0.39],['c',0.21,-0.03,0.42,0.15,0.39,0.36],['c',-0.06,0.39,-0.42,1.38,-0.69,1.89],['c',-0.96,1.80,-2.49,2.94,-4.23,3.18],['c',-0.99,0.12,-2.58,-0.06,-3.63,-0.45],['c',-0.96,-0.36,-1.71,-0.84,-2.40,-1.50],['c',-1.11,-1.11,-1.80,-2.61,-2.04,-4.56],['c',-0.06,-0.60,-0.06,-2.01,0.00,-2.61],['c',0.24,-1.95,0.90,-3.45,2.01,-4.56],['c',0.69,-0.66,1.44,-1.11,2.37,-1.47],['c',0.63,-0.24,1.47,-0.42,2.22,-0.48],['z']],w:13.038,h:15.689},
		'timesig.cut':{d:[['M',6.24,-10.44],['c',0.09,-0.06,0.09,-0.06,0.48,-0.06],['c',0.36,0.00,0.36,0.00,0.45,0.06],['l',0.06,0.09],['l',0.00,1.23],['l',0.00,1.26],['l',0.27,0.00],['c',1.26,0.00,2.49,0.45,3.48,1.29],['c',1.05,0.87,1.80,2.28,1.89,3.48],['c',0.06,1.02,-0.51,1.92,-1.44,2.22],['c',-0.24,0.09,-0.30,0.09,-0.63,0.09],['c',-0.33,0.00,-0.42,0.00,-0.63,-0.06],['c',-0.66,-0.24,-1.14,-0.63,-1.41,-1.20],['c',-0.15,-0.30,-0.21,-0.51,-0.24,-0.90],['c',-0.06,-1.08,0.57,-2.04,1.56,-2.37],['c',0.18,-0.06,0.27,-0.06,0.63,-0.06],['l',0.45,0.00],['c',0.06,0.03,0.09,0.03,0.09,0.00],['c',0.00,-0.03,-0.45,-0.51,-0.66,-0.69],['c',-0.87,-0.69,-1.83,-1.05,-2.94,-1.11],['l',-0.42,0.00],['l',0.00,7.17],['l',0.00,7.14],['l',0.42,0.00],['c',0.69,-0.03,1.23,-0.18,1.86,-0.51],['c',1.05,-0.51,1.89,-1.47,2.46,-2.70],['c',0.15,-0.33,0.33,-0.87,0.39,-1.17],['c',0.09,-0.24,0.15,-0.36,0.30,-0.39],['c',0.21,-0.03,0.42,0.15,0.39,0.36],['c',-0.03,0.24,-0.21,0.78,-0.39,1.20],['c',-0.96,2.37,-2.94,3.90,-5.13,3.90],['l',-0.30,0.00],['l',0.00,1.26],['l',0.00,1.23],['l',-0.06,0.09],['c',-0.09,0.06,-0.09,0.06,-0.45,0.06],['c',-0.39,0.00,-0.39,0.00,-0.48,-0.06],['l',-0.06,-0.09],['l',0.00,-1.29],['l',0.00,-1.29],['l',-0.21,-0.03],['c',-1.23,-0.21,-2.31,-0.63,-3.21,-1.29],['c',-0.15,-0.09,-0.45,-0.36,-0.66,-0.57],['c',-1.11,-1.11,-1.80,-2.61,-2.04,-4.56],['c',-0.06,-0.60,-0.06,-2.01,0.00,-2.61],['c',0.24,-1.95,0.93,-3.45,2.04,-4.59],['c',0.42,-0.39,0.78,-0.66,1.26,-0.93],['c',0.75,-0.45,1.65,-0.75,2.61,-0.90],['l',0.21,-0.03],['l',0.00,-1.29],['l',0.00,-1.29],['z'],['m',-0.06,10.44],['c',0.00,-5.58,0.00,-6.99,-0.03,-6.99],['c',-0.15,0.00,-0.63,0.27,-0.87,0.45],['c',-0.45,0.36,-0.75,0.93,-0.93,1.77],['c',-0.18,0.81,-0.24,1.80,-0.24,4.74],['c',0.00,2.97,0.06,3.96,0.24,4.77],['c',0.24,1.08,0.66,1.68,1.41,2.07],['c',0.12,0.06,0.30,0.12,0.33,0.15],['l',0.09,0.00],['l',0.00,-6.96],['z']],w:13.038,h:20.97},
		'f':{d:[['M',9.93,-14.28],['c',1.53,-0.18,2.88,0.45,3.12,1.50],['c',0.12,0.51,0.00,1.32,-0.27,1.86],['c',-0.15,0.30,-0.42,0.57,-0.63,0.69],['c',-0.69,0.36,-1.56,0.03,-1.83,-0.69],['c',-0.09,-0.24,-0.09,-0.69,0.00,-0.87],['c',0.06,-0.12,0.21,-0.24,0.45,-0.42],['c',0.42,-0.24,0.57,-0.45,0.60,-0.72],['c',0.03,-0.33,-0.09,-0.39,-0.63,-0.42],['c',-0.30,0.00,-0.45,0.00,-0.60,0.03],['c',-0.81,0.21,-1.35,0.93,-1.74,2.46],['c',-0.06,0.27,-0.48,2.25,-0.48,2.31],['c',0.00,0.03,0.39,0.03,0.90,0.03],['c',0.72,0.00,0.90,0.00,0.99,0.06],['c',0.42,0.15,0.45,0.72,0.03,0.90],['c',-0.12,0.06,-0.24,0.06,-1.17,0.06],['l',-1.05,0.00],['l',-0.78,2.55],['c',-0.45,1.41,-0.87,2.79,-0.96,3.06],['c',-0.87,2.37,-2.37,4.74,-3.78,5.91],['c',-1.05,0.90,-2.04,1.23,-3.09,1.08],['c',-1.11,-0.18,-1.89,-0.78,-2.04,-1.59],['c',-0.12,-0.66,0.15,-1.71,0.54,-2.19],['c',0.69,-0.75,1.86,-0.54,2.22,0.39],['c',0.06,0.15,0.09,0.27,0.09,0.48],['c',0.00,0.24,-0.03,0.27,-0.12,0.42],['c',-0.03,0.09,-0.15,0.18,-0.27,0.27],['c',-0.09,0.06,-0.27,0.21,-0.36,0.27],['c',-0.24,0.18,-0.36,0.36,-0.39,0.60],['c',-0.03,0.33,0.09,0.39,0.63,0.42],['c',0.42,0.00,0.63,-0.03,0.90,-0.15],['c',0.60,-0.30,0.96,-0.96,1.38,-2.64],['c',0.09,-0.42,0.63,-2.55,1.17,-4.77],['l',1.02,-4.08],['c',0.00,-0.03,-0.36,-0.03,-0.81,-0.03],['c',-0.72,0.00,-0.81,0.00,-0.93,-0.06],['c',-0.42,-0.18,-0.39,-0.75,0.03,-0.90],['c',0.09,-0.06,0.27,-0.06,1.05,-0.06],['l',0.96,0.00],['l',0.00,-0.09],['c',0.06,-0.18,0.30,-0.72,0.51,-1.17],['c',1.20,-2.46,3.30,-4.23,5.34,-4.50],['z']],w:16.155,h:19.445},
		'm':{d:[['M',2.79,-8.91],['c',0.09,0.00,0.30,-0.03,0.45,-0.03],['c',0.24,0.03,0.30,0.03,0.45,0.12],['c',0.36,0.15,0.63,0.54,0.75,1.02],['l',0.03,0.21],['l',0.33,-0.30],['c',0.69,-0.69,1.38,-1.02,2.07,-1.02],['c',0.27,0.00,0.33,0.00,0.48,0.06],['c',0.21,0.09,0.48,0.36,0.63,0.60],['c',0.03,0.09,0.12,0.27,0.18,0.42],['c',0.03,0.15,0.09,0.27,0.12,0.27],['c',0.00,0.00,0.09,-0.09,0.18,-0.21],['c',0.33,-0.39,0.87,-0.81,1.29,-0.99],['c',0.78,-0.33,1.47,-0.21,2.01,0.33],['c',0.30,0.33,0.48,0.69,0.60,1.14],['c',0.09,0.42,0.06,0.54,-0.54,3.06],['c',-0.33,1.29,-0.57,2.40,-0.57,2.43],['c',0.00,0.12,0.09,0.21,0.21,0.21],['c',0.24,0.00,0.75,-0.30,1.20,-0.72],['c',0.45,-0.39,0.60,-0.45,0.78,-0.27],['c',0.18,0.18,0.09,0.36,-0.45,0.87],['c',-1.05,0.96,-1.83,1.47,-2.58,1.71],['c',-0.93,0.33,-1.53,0.21,-1.80,-0.33],['c',-0.06,-0.15,-0.06,-0.21,-0.06,-0.45],['c',0.00,-0.24,0.03,-0.48,0.60,-2.82],['c',0.42,-1.71,0.60,-2.64,0.63,-2.79],['c',0.03,-0.57,-0.30,-0.75,-0.84,-0.48],['c',-0.24,0.12,-0.54,0.39,-0.66,0.63],['c',-0.03,0.09,-0.42,1.38,-0.90,3.00],['c',-0.90,3.15,-0.84,3.00,-1.14,3.15],['l',-0.15,0.09],['l',-0.78,0.00],['c',-0.60,0.00,-0.78,0.00,-0.84,-0.06],['c',-0.09,-0.03,-0.18,-0.18,-0.18,-0.27],['c',0.00,-0.03,0.36,-1.38,0.84,-2.97],['c',0.57,-2.04,0.81,-2.97,0.84,-3.12],['c',0.03,-0.54,-0.30,-0.72,-0.84,-0.45],['c',-0.24,0.12,-0.57,0.42,-0.66,0.63],['c',-0.06,0.09,-0.51,1.44,-1.05,2.97],['c',-0.51,1.56,-0.99,2.85,-0.99,2.91],['c',-0.06,0.12,-0.21,0.24,-0.36,0.30],['c',-0.12,0.06,-0.21,0.06,-0.90,0.06],['c',-0.60,0.00,-0.78,0.00,-0.84,-0.06],['c',-0.09,-0.03,-0.18,-0.18,-0.18,-0.27],['c',0.00,-0.03,0.45,-1.38,0.99,-2.97],['c',1.05,-3.18,1.05,-3.18,0.93,-3.45],['c',-0.12,-0.27,-0.39,-0.30,-0.72,-0.15],['c',-0.54,0.27,-1.14,1.17,-1.56,2.40],['c',-0.06,0.15,-0.15,0.30,-0.18,0.36],['c',-0.21,0.21,-0.57,0.27,-0.72,0.09],['c',-0.09,-0.09,-0.06,-0.21,0.06,-0.63],['c',0.48,-1.26,1.26,-2.46,2.01,-3.21],['c',0.57,-0.54,1.20,-0.87,1.83,-1.02],['z']],w:14.687,h:9.126},
		'p':{d:[['M',1.92,-8.70],['c',0.27,-0.09,0.81,-0.06,1.11,0.03],['c',0.54,0.18,0.93,0.51,1.17,0.99],['c',0.09,0.15,0.15,0.33,0.18,0.36],['l',0.00,0.12],['l',0.30,-0.27],['c',0.66,-0.60,1.35,-1.02,2.13,-1.20],['c',0.21,-0.06,0.33,-0.06,0.78,-0.06],['c',0.45,0.00,0.51,0.00,0.84,0.09],['c',1.29,0.33,2.07,1.32,2.25,2.79],['c',0.09,0.81,-0.09,2.01,-0.45,2.79],['c',-0.54,1.26,-1.86,2.55,-3.18,3.03],['c',-0.45,0.18,-0.81,0.24,-1.29,0.24],['c',-0.69,-0.03,-1.35,-0.18,-1.86,-0.45],['c',-0.30,-0.15,-0.51,-0.18,-0.69,-0.09],['c',-0.09,0.03,-0.18,0.09,-0.18,0.12],['c',-0.09,0.12,-1.05,2.94,-1.05,3.06],['c',0.00,0.24,0.18,0.48,0.51,0.63],['c',0.18,0.06,0.54,0.15,0.75,0.15],['c',0.21,0.00,0.36,0.06,0.42,0.18],['c',0.12,0.18,0.06,0.42,-0.12,0.54],['c',-0.09,0.03,-0.15,0.03,-0.78,0.00],['c',-1.98,-0.15,-3.81,-0.15,-5.79,0.00],['c',-0.63,0.03,-0.69,0.03,-0.78,0.00],['c',-0.24,-0.15,-0.24,-0.57,0.03,-0.66],['c',0.06,-0.03,0.48,-0.09,0.99,-0.12],['c',0.87,-0.06,1.11,-0.09,1.35,-0.21],['c',0.18,-0.06,0.33,-0.18,0.39,-0.30],['c',0.06,-0.12,3.24,-9.42,3.27,-9.60],['c',0.06,-0.33,0.03,-0.57,-0.15,-0.69],['c',-0.09,-0.06,-0.12,-0.06,-0.30,-0.06],['c',-0.69,0.06,-1.53,1.02,-2.28,2.61],['c',-0.09,0.21,-0.21,0.45,-0.27,0.51],['c',-0.09,0.12,-0.33,0.24,-0.48,0.24],['c',-0.18,0.00,-0.36,-0.15,-0.36,-0.30],['c',0.00,-0.24,0.78,-1.83,1.26,-2.55],['c',0.72,-1.11,1.47,-1.74,2.28,-1.92],['z'],['m',5.37,1.47],['c',-0.27,-0.12,-0.75,-0.03,-1.14,0.21],['c',-0.75,0.48,-1.47,1.68,-1.89,3.15],['c',-0.45,1.47,-0.42,2.34,0.00,2.70],['c',0.45,0.39,1.26,0.21,1.83,-0.36],['c',0.51,-0.51,0.99,-1.68,1.38,-3.27],['c',0.30,-1.17,0.33,-1.74,0.15,-2.13],['c',-0.09,-0.15,-0.15,-0.21,-0.33,-0.30],['z']],w:14.689,h:13.127},
		'r':{d:[['M',6.33,-9.12],['c',0.27,-0.03,0.93,0.00,1.20,0.06],['c',0.84,0.21,1.23,0.81,1.02,1.53],['c',-0.24,0.75,-0.90,1.17,-1.56,0.96],['c',-0.33,-0.09,-0.51,-0.30,-0.66,-0.75],['c',-0.03,-0.12,-0.09,-0.24,-0.12,-0.30],['c',-0.09,-0.15,-0.30,-0.24,-0.48,-0.24],['c',-0.57,0.00,-1.38,0.54,-1.65,1.08],['c',-0.06,0.15,-0.33,1.17,-0.90,3.27],['c',-0.57,2.31,-0.81,3.12,-0.87,3.21],['c',-0.03,0.06,-0.12,0.15,-0.18,0.21],['l',-0.12,0.06],['l',-0.81,0.03],['c',-0.69,0.00,-0.81,0.00,-0.90,-0.03],['c',-0.09,-0.06,-0.18,-0.21,-0.18,-0.30],['c',0.00,-0.06,0.39,-1.62,0.90,-3.51],['c',0.84,-3.24,0.87,-3.45,0.87,-3.72],['c',0.00,-0.21,0.00,-0.27,-0.03,-0.36],['c',-0.12,-0.15,-0.21,-0.24,-0.42,-0.24],['c',-0.24,0.00,-0.45,0.15,-0.78,0.42],['c',-0.33,0.36,-0.45,0.54,-0.72,1.14],['c',-0.03,0.12,-0.21,0.24,-0.36,0.27],['c',-0.12,0.00,-0.15,0.00,-0.24,-0.06],['c',-0.18,-0.12,-0.18,-0.21,-0.06,-0.54],['c',0.21,-0.57,0.42,-0.93,0.78,-1.32],['c',0.54,-0.51,1.20,-0.81,1.95,-0.87],['c',0.81,-0.03,1.53,0.30,1.92,0.87],['l',0.12,0.18],['l',0.09,-0.09],['c',0.57,-0.45,1.41,-0.84,2.19,-0.96],['z']],w:9.41,h:9.132},
		's':{d:[['M',4.47,-8.73],['c',0.09,0.00,0.36,-0.03,0.57,-0.03],['c',0.75,0.03,1.29,0.24,1.71,0.63],['c',0.51,0.54,0.66,1.26,0.36,1.83],['c',-0.24,0.42,-0.63,0.57,-1.11,0.42],['c',-0.33,-0.09,-0.60,-0.36,-0.60,-0.57],['c',0.00,-0.03,0.06,-0.21,0.15,-0.39],['c',0.12,-0.21,0.15,-0.33,0.18,-0.48],['c',0.00,-0.24,-0.06,-0.48,-0.15,-0.60],['c',-0.15,-0.21,-0.42,-0.24,-0.75,-0.15],['c',-0.27,0.06,-0.48,0.18,-0.69,0.36],['c',-0.39,0.39,-0.51,0.96,-0.33,1.38],['c',0.09,0.21,0.42,0.51,0.78,0.72],['c',1.11,0.69,1.59,1.11,1.89,1.68],['c',0.21,0.39,0.24,0.78,0.15,1.29],['c',-0.18,1.20,-1.17,2.16,-2.52,2.52],['c',-1.02,0.24,-1.95,0.12,-2.70,-0.42],['c',-0.72,-0.51,-0.99,-1.47,-0.60,-2.19],['c',0.24,-0.48,0.72,-0.63,1.17,-0.42],['c',0.33,0.18,0.54,0.45,0.57,0.81],['c',0.00,0.21,-0.03,0.30,-0.33,0.51],['c',-0.33,0.24,-0.39,0.42,-0.27,0.69],['c',0.06,0.15,0.21,0.27,0.45,0.33],['c',0.30,0.09,0.87,0.09,1.20,0.00],['c',0.75,-0.21,1.23,-0.72,1.29,-1.35],['c',0.03,-0.42,-0.15,-0.81,-0.54,-1.20],['c',-0.24,-0.24,-0.48,-0.42,-1.41,-1.02],['c',-0.69,-0.42,-1.05,-0.93,-1.05,-1.47],['c',0.00,-0.39,0.12,-0.87,0.30,-1.23],['c',0.27,-0.57,0.78,-1.05,1.38,-1.35],['c',0.24,-0.12,0.63,-0.27,0.90,-0.30],['z']],w:6.632,h:8.758},
		'z':{d:[['M',2.64,-7.95],['c',0.36,-0.09,0.81,-0.03,1.71,0.27],['c',0.78,0.21,0.96,0.27,1.74,0.30],['c',0.87,0.06,1.02,0.03,1.38,-0.21],['c',0.21,-0.15,0.33,-0.15,0.48,-0.06],['c',0.15,0.09,0.21,0.30,0.15,0.45],['c',-0.03,0.06,-1.26,1.26,-2.76,2.67],['l',-2.73,2.55],['l',0.54,0.03],['c',0.54,0.03,0.72,0.03,2.01,0.15],['c',0.36,0.03,0.90,0.06,1.20,0.09],['c',0.66,0.00,0.81,-0.03,1.02,-0.24],['c',0.30,-0.30,0.39,-0.72,0.27,-1.23],['c',-0.06,-0.27,-0.06,-0.27,-0.03,-0.39],['c',0.15,-0.30,0.54,-0.27,0.69,0.03],['c',0.15,0.33,0.27,1.02,0.27,1.50],['c',0.00,1.47,-1.11,2.70,-2.52,2.79],['c',-0.57,0.03,-1.02,-0.09,-2.01,-0.51],['c',-1.02,-0.42,-1.23,-0.48,-2.13,-0.54],['c',-0.81,-0.06,-0.96,-0.03,-1.26,0.18],['c',-0.12,0.06,-0.24,0.12,-0.27,0.12],['c',-0.27,0.00,-0.45,-0.30,-0.36,-0.51],['c',0.03,-0.06,1.32,-1.32,2.91,-2.79],['l',2.88,-2.73],['c',-0.03,0.00,-0.21,0.03,-0.42,0.06],['c',-0.21,0.03,-0.78,0.09,-1.23,0.12],['c',-1.11,0.12,-1.23,0.15,-1.95,0.27],['c',-0.72,0.15,-1.17,0.18,-1.29,0.09],['c',-0.27,-0.18,-0.21,-0.75,0.12,-1.26],['c',0.39,-0.60,0.93,-1.02,1.59,-1.20],['z']],w:8.573,h:8.743},
		'+':{d:[['M',3.48,-11.19],['c',0.18,-0.09,0.36,-0.09,0.54,0.00],['c',0.18,0.09,0.24,0.15,0.33,0.30],['l',0.06,0.15],['l',0.00,1.29],['l',0.00,1.29],['l',1.29,0.00],['c',1.23,0.00,1.29,0.00,1.41,0.06],['c',0.06,0.03,0.15,0.09,0.18,0.12],['c',0.12,0.09,0.21,0.33,0.21,0.48],['c',0.00,0.15,-0.09,0.39,-0.21,0.48],['c',-0.03,0.03,-0.12,0.09,-0.18,0.12],['c',-0.12,0.06,-0.18,0.06,-1.41,0.06],['l',-1.29,0.00],['l',0.00,1.29],['c',0.00,1.23,0.00,1.29,-0.06,1.41],['c',-0.09,0.18,-0.15,0.24,-0.30,0.33],['c',-0.21,0.09,-0.39,0.09,-0.57,0.00],['c',-0.18,-0.09,-0.24,-0.15,-0.33,-0.33],['c',-0.06,-0.12,-0.06,-0.18,-0.06,-1.41],['l',0.00,-1.29],['l',-1.29,0.00],['c',-1.23,0.00,-1.29,0.00,-1.41,-0.06],['c',-0.18,-0.09,-0.24,-0.15,-0.33,-0.33],['c',-0.09,-0.18,-0.09,-0.36,0.00,-0.54],['c',0.09,-0.18,0.15,-0.24,0.33,-0.33],['l',0.15,-0.06],['l',1.26,0.00],['l',1.29,0.00],['l',0.00,-1.29],['c',0.00,-1.23,0.00,-1.29,0.06,-1.41],['c',0.09,-0.18,0.15,-0.24,0.33,-0.33],['z']],w:7.507,h:7.515},
		',':{d:[['M',1.32,-3.36],['c',0.57,-0.15,1.17,0.03,1.59,0.45],['c',0.45,0.45,0.60,0.96,0.51,1.89],['c',-0.09,1.23,-0.42,2.46,-0.99,3.93],['c',-0.30,0.72,-0.72,1.62,-0.78,1.68],['c',-0.18,0.21,-0.51,0.18,-0.66,-0.06],['c',-0.03,-0.06,-0.06,-0.15,-0.06,-0.18],['c',0.00,-0.06,0.12,-0.33,0.24,-0.63],['c',0.84,-1.80,1.02,-2.61,0.69,-3.24],['c',-0.12,-0.24,-0.27,-0.36,-0.75,-0.60],['c',-0.36,-0.15,-0.42,-0.21,-0.60,-0.39],['c',-0.69,-0.69,-0.69,-1.71,0.00,-2.40],['c',0.21,-0.21,0.51,-0.39,0.81,-0.45],['z']],w:3.452,h:8.143},
		'-':{d:[['M',0.18,-5.34],['c',0.09,-0.06,0.15,-0.06,2.31,-0.06],['c',2.46,0.00,2.37,0.00,2.46,0.21],['c',0.12,0.21,0.03,0.42,-0.15,0.54],['c',-0.09,0.06,-0.15,0.06,-2.28,0.06],['c',-2.16,0.00,-2.22,0.00,-2.31,-0.06],['c',-0.27,-0.15,-0.27,-0.54,-0.03,-0.69],['z']],w:5.001,h:0.81},
		'.':{d:[['M',1.32,-3.36],['c',1.05,-0.27,2.10,0.57,2.10,1.65],['c',0.00,1.08,-1.05,1.92,-2.10,1.65],['c',-0.90,-0.21,-1.50,-1.14,-1.26,-2.04],['c',0.12,-0.63,0.63,-1.11,1.26,-1.26],['z']],w:3.413,h:3.402},
		'scripts.wedge':{d:[['M',-3.66,-7.44],['c',0.06,-0.09,0.00,-0.09,0.81,0.03],['c',1.86,0.30,3.84,0.30,5.73,0.00],['c',0.78,-0.12,0.72,-0.12,0.78,-0.03],['c',0.15,0.15,0.12,0.24,-0.24,0.60],['c',-0.93,0.93,-1.98,2.76,-2.67,4.62],['c',-0.30,0.78,-0.51,1.71,-0.51,2.13],['c',0.00,0.15,0.00,0.18,-0.06,0.27],['c',-0.12,0.09,-0.24,0.09,-0.36,0.00],['c',-0.06,-0.09,-0.06,-0.12,-0.06,-0.27],['c',0.00,-0.42,-0.21,-1.35,-0.51,-2.13],['c',-0.69,-1.86,-1.74,-3.69,-2.67,-4.62],['c',-0.36,-0.36,-0.39,-0.45,-0.24,-0.60],['z']],w:7.49,h:7.752},
		'scripts.thumb':{d:[['M',-0.54,-3.69],['c',0.15,-0.03,0.36,-0.06,0.51,-0.06],['c',1.44,0.00,2.58,1.11,2.94,2.85],['c',0.09,0.48,0.09,1.32,0.00,1.80],['c',-0.27,1.41,-1.08,2.43,-2.16,2.73],['l',-0.18,0.06],['l',0.00,0.12],['c',0.03,0.06,0.06,0.45,0.09,0.87],['c',0.03,0.57,0.03,0.78,0.00,0.84],['c',-0.09,0.27,-0.39,0.48,-0.66,0.48],['c',-0.27,0.00,-0.57,-0.21,-0.66,-0.48],['c',-0.03,-0.06,-0.03,-0.27,0.00,-0.84],['c',0.03,-0.42,0.06,-0.81,0.09,-0.87],['l',0.00,-0.12],['l',-0.18,-0.06],['c',-1.08,-0.30,-1.89,-1.32,-2.16,-2.73],['c',-0.09,-0.48,-0.09,-1.32,0.00,-1.80],['c',0.15,-0.84,0.51,-1.53,1.02,-2.04],['c',0.39,-0.39,0.84,-0.63,1.35,-0.75],['z'],['m',1.05,0.90],['c',-0.15,-0.09,-0.21,-0.09,-0.45,-0.12],['c',-0.15,0.00,-0.30,0.03,-0.39,0.03],['c',-0.57,0.18,-0.90,0.72,-1.08,1.74],['c',-0.06,0.48,-0.06,1.80,0.00,2.28],['c',0.15,0.90,0.42,1.44,0.90,1.65],['c',0.18,0.09,0.21,0.09,0.51,0.09],['c',0.30,0.00,0.33,0.00,0.51,-0.09],['c',0.48,-0.21,0.75,-0.75,0.90,-1.65],['c',0.03,-0.27,0.03,-0.54,0.03,-1.14],['c',0.00,-0.60,0.00,-0.87,-0.03,-1.14],['c',-0.15,-0.90,-0.45,-1.44,-0.90,-1.65],['z']],w:5.955,h:9.75},
		'scripts.open':{d:[['M',-0.54,-3.69],['c',0.15,-0.03,0.36,-0.06,0.51,-0.06],['c',1.44,0.00,2.58,1.11,2.94,2.85],['c',0.09,0.48,0.09,1.32,0.00,1.80],['c',-0.33,1.74,-1.47,2.85,-2.91,2.85],['c',-1.44,0.00,-2.58,-1.11,-2.91,-2.85],['c',-0.09,-0.48,-0.09,-1.32,0.00,-1.80],['c',0.15,-0.84,0.51,-1.53,1.02,-2.04],['c',0.39,-0.39,0.84,-0.63,1.35,-0.75],['z'],['m',1.11,0.90],['c',-0.21,-0.09,-0.27,-0.09,-0.51,-0.12],['c',-0.30,0.00,-0.42,0.03,-0.66,0.15],['c',-0.24,0.12,-0.51,0.39,-0.66,0.63],['c',-0.54,0.93,-0.63,2.64,-0.21,3.81],['c',0.21,0.54,0.51,0.90,0.93,1.11],['c',0.21,0.09,0.24,0.09,0.54,0.09],['c',0.30,0.00,0.33,0.00,0.54,-0.09],['c',0.42,-0.21,0.72,-0.57,0.93,-1.11],['c',0.36,-0.99,0.36,-2.37,0.00,-3.36],['c',-0.21,-0.54,-0.51,-0.90,-0.90,-1.11],['z']],w:5.955,h:7.5},
		'scripts.longphrase':{d:[['M',1.47,-15.09],['c',0.36,-0.09,0.66,-0.18,0.69,-0.18],['c',0.06,0.00,0.06,0.54,0.06,11.25],['l',0.00,11.25],['l',-0.63,0.15],['c',-0.66,0.18,-1.44,0.39,-1.50,0.39],['c',-0.03,0.00,-0.03,-3.39,-0.03,-11.25],['l',0.00,-11.25],['l',0.36,-0.09],['c',0.21,-0.06,0.66,-0.18,1.05,-0.27],['z']],w:2.16,h:23.04},
		'scripts.mediumphrase':{d:[['M',1.47,-7.59],['c',0.36,-0.09,0.66,-0.18,0.69,-0.18],['c',0.06,0.00,0.06,0.39,0.06,7.50],['l',0.00,7.50],['l',-0.63,0.15],['c',-0.66,0.18,-1.44,0.39,-1.50,0.39],['c',-0.03,0.00,-0.03,-2.28,-0.03,-7.50],['l',0.00,-7.50],['l',0.36,-0.09],['c',0.21,-0.06,0.66,-0.18,1.05,-0.27],['z']],w:2.16,h:15.54},
		'scripts.shortphrase':{d:[['M',1.47,-7.59],['c',0.36,-0.09,0.66,-0.18,0.69,-0.18],['c',0.06,0.00,0.06,0.21,0.06,3.75],['l',0.00,3.75],['l',-0.42,0.09],['c',-0.57,0.18,-1.65,0.45,-1.71,0.45],['c',-0.03,0.00,-0.03,-0.72,-0.03,-3.75],['l',0.00,-3.75],['l',0.36,-0.09],['c',0.21,-0.06,0.66,-0.18,1.05,-0.27],['z']],w:2.16,h:8.04},
		'scripts.snap':{d:[['M',4.50,-3.39],['c',0.36,-0.03,0.96,-0.03,1.35,0.00],['c',1.56,0.15,3.15,0.90,4.20,2.01],['c',0.24,0.27,0.33,0.42,0.33,0.60],['c',0.00,0.27,0.03,0.24,-2.46,2.22],['c',-1.29,1.02,-2.40,1.86,-2.49,1.92],['c',-0.18,0.09,-0.30,0.09,-0.48,0.00],['c',-0.09,-0.06,-1.20,-0.90,-2.49,-1.92],['c',-2.49,-1.98,-2.46,-1.95,-2.46,-2.22],['c',0.00,-0.18,0.09,-0.33,0.33,-0.60],['c',1.05,-1.08,2.64,-1.86,4.17,-2.01],['z'],['m',1.29,1.17],['c',-1.47,-0.15,-2.97,0.30,-4.14,1.20],['l',-0.18,0.15],['l',0.06,0.09],['c',0.15,0.12,3.63,2.85,3.66,2.85],['c',0.03,0.00,3.51,-2.73,3.66,-2.85],['l',0.06,-0.09],['l',-0.18,-0.15],['c',-0.84,-0.66,-1.89,-1.08,-2.94,-1.20],['z']],w:10.38,h:6.84}};

	// Custom characters that weren't generated from the font:
	glyphs['noteheads.slash.whole'] = {d:[['M',5,-5],['l',1,1],['l',-5,5],['l',-1,-1],['z'],['m',4,6],['l',-5,-5],['l',2,-2],['l',5,5],['z'],['m',0,-2],['l',1,1],['l',-5,5],['l',-1,-1],['z'],['m',-4,6],['l',-5,-5],['l',2,-2],['l',5,5],['z']],w:10.81,h:15.63};

	glyphs['noteheads.slash.quarter'] = {d:[['M',9,-6],['l',0,4],['l',-9,9],['l',0,-4],['z']],w:9,h:9};

	glyphs['noteheads.harmonic.quarter'] = {d:[['M',3.63,-4.02],['c',0.09,-0.06,0.18,-0.09,0.24,-0.03],['c',0.03,0.03,0.87,0.93,1.83,2.01],['c',1.50,1.65,1.80,1.98,1.80,2.04],['c',0.00,0.06,-0.30,0.39,-1.80,2.04],['c',-0.96,1.08,-1.80,1.98,-1.83,2.01],['c',-0.06,0.06,-0.15,0.03,-0.24,-0.03],['c',-0.12,-0.09,-3.54,-3.84,-3.60,-3.93],['c',-0.03,-0.03,-0.03,-0.09,-0.03,-0.15],['c',0.03,-0.06,3.45,-3.84,3.63,-3.96],['z']],w:7.5,h:8.165};


  this.printSymbol = function (x,y,symb,paper, klass) {
    if (!glyphs[symb]) return null;
    var pathArray = this.pathClone(glyphs[symb].d);
    pathArray[0][1] +=x;
    pathArray[0][2] +=y;
    return paper.path().attr({path:pathArray, stroke:"none", fill:"#000000", 'class': klass });
   };
  
  this.getPathForSymbol = function (x,y,symb,scalex, scaley) {
    scalex = scalex || 1;
    scaley = scaley || 1;
    if (!glyphs[symb]) return null;
    var pathArray = this.pathClone(glyphs[symb].d);
    if (scalex!==1 || scaley!==1) this.pathScale(pathArray,scalex,scaley);
    pathArray[0][1] +=x;
    pathArray[0][2] +=y;

    return pathArray;
  };
  
  this.getSymbolWidth = function (symbol) {
    if (glyphs[symbol]) return glyphs[symbol].w;
    return 0;
  };
  
  this.getSymbolHeight = function (symbol) {
    if (glyphs[symbol]) return glyphs[symbol].h;
    return 0;
  };

	this.symbolHeightInPitches = function(symbol) {
		return this.getSymbolHeight(symbol) / ABCJS.write.spacing.STEP;
	};

  this.getSymbolAlign = function (symbol) {
    if (symbol.substring(0,7)==="scripts" && 
	symbol!=="scripts.roll") {
      return "center";
    }
    return "left";
  };

  this.pathClone = function (pathArray) {
    var res = [];
    for (var i = 0, ii = pathArray.length; i < ii; i++) {
      res[i] = [];
      for (var j = 0, jj = pathArray[i].length; j < jj; j++) {
	res[i][j] = pathArray[i][j];
      }
    }
    return res;
  };

  this.pathScale = function (pathArray, kx, ky) {
    for (var i = 0, ii = pathArray.length; i < ii; i++) {
      var p = pathArray[i];
      var j, jj;
      for (j = 1, jj = p.length; j < jj; j++) {
	p[j] *= (j % 2) ? kx : ky;
      }
    }
  };
   
  this.getYCorr = function (symbol) {
    switch(symbol) {
    case "0":
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
    case "7":
    case "8":
    case "9":
    case "+": return -2;
    case "timesig.common":
    case "timesig.cut": return 0;
    case "flags.d32nd": return -1;
    case "flags.d64th": return -2;
    case "flags.u32nd": return 1;
    case "flags.u64th": return 3;
    case "rests.whole": return 1;
    case "rests.half": return -1;
    case "rests.8th": return -1;
    case "rests.quarter": return -1;
    case "rests.16th": return -1;
    case "rests.32nd": return -1;
    case "rests.64th": return -1;
		case "f":
		case "m":
		case "p":
		case "s":
		case "z":
			return -4;
		case "scripts.trill":
		case "scripts.upbow":
		case "scripts.downbow":
			return -2;
		case "scripts.ufermata":
		case "scripts.wedge":
		case "scripts.roll":
		case "scripts.shortphrase":
		case "scripts.longphrase":
			return -1;
		case "scripts.dfermata":
			return 1;
    default: return 0;
    }
  };
};
ABCJS.write.glyphs = new ABCJS.write.Glyphs(); // we need the glyphs for layout information
//    abc_relative_element.js: Definition of the RelativeElement class.
//    Copyright (C) 2010,2014 Gregory Dyke (gregdyke at gmail dot com) and Paul Rosen
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.

/*globals ABCJS */

if (!window.ABCJS)
	window.ABCJS = {};

if (!window.ABCJS.write)
	window.ABCJS.write = {};

ABCJS.write.RelativeElement = function(c, dx, w, pitch, opt) {
	opt = opt || {};
	this.x = 0;
	this.c = c;      // character or path or string
	this.dx = dx;    // relative x position
	this.w = w;      // minimum width taken up by this element (can include gratuitous space)
	this.pitch = pitch; // relative y position by pitch
	this.scalex = opt.scalex || 1; // should the character/path be scaled?
	this.scaley = opt.scaley || 1; // should the character/path be scaled?
	this.type = opt.type || "symbol"; // cheap types.
	this.pitch2 = opt.pitch2;
	this.linewidth = opt.linewidth;
	this.klass = opt.klass;
	this.top = pitch;
	if (this.pitch2 !== undefined && this.pitch2 > this.top) this.top = this.pitch2;
	this.bottom = pitch;
	if (this.pitch2 !== undefined && this.pitch2 < this.bottom) this.bottom = this.pitch2;
	if (opt.thickness) {
		this.top += opt.thickness/2;
		this.bottom -= opt.thickness/2;
	}
	if (opt.stemHeight) {
		if (opt.stemHeight > 0)
			this.top += opt.stemHeight;
		else
			this.bottom += opt.stemHeight;
	}
	//if (this.type === "symbol") {
	//	var offset = ABCJS.write.glyphs.getYCorr(this.c);
	//	this.top += offset;
	//	this.bottom += offset;
	//}
	var height = opt.height ? opt.height : 4; // The +1 is to give a little bit of padding.
	this.centerVertically = false;
	switch (this.type) {
		case "debug":
			this.chordHeightAbove = height;
			break;
		case "lyric":
			if (opt.position && opt.position === 'below')
				this.lyricHeightBelow = height;
			else
				this.lyricHeightAbove = height;
			break;
		case "chord":
			if (opt.position && opt.position === 'below')
				this.chordHeightBelow = height;
			else
				this.chordHeightAbove = height;
			break;
		case "text":
			if (this.pitch === undefined) {
				if (opt.position && opt.position === 'below')
					this.chordHeightBelow = height;
				else
					this.chordHeightAbove = height;
			} else
				this.centerVertically = true;
			break;
		case "part": this.partHeightAbove = height; break;
	}
};

ABCJS.write.RelativeElement.prototype.setX = function (x) {
	this.x = x+this.dx;
};

ABCJS.write.RelativeElement.prototype.draw = function (renderer, bartop) {
	if (this.pitch === undefined)
		window.console.error(this.type + " Relative Element y-coordinate not set.");
	var y = renderer.calcY(this.pitch);
	switch(this.type) {
		case "symbol":
			if (this.c===null) return null;
			var klass = "symbol";
			if (this.klass) klass += " " + this.klass;
			this.graphelem = renderer.printSymbol(this.x, this.pitch, this.c, this.scalex, this.scaley, renderer.addClasses(klass)); break;
		case "debug":
			this.graphelem = renderer.renderText(this.x, renderer.calcY(15), ""+this.c, "debugfont", 'debug-msg', 'start'); break;
		case "barNumber":
			this.graphelem = renderer.renderText(this.x, y, ""+this.c, "measurefont", 'bar-number', "start");
			break;
		case "lyric":
			this.graphelem = renderer.renderText(this.x, y, this.c, "vocalfont", 'abc-lyric', "middle");
			break;
		case "chord":
			this.graphelem = renderer.renderText(this.x, y, this.c, 'gchordfont', "chord", "middle");
			break;
		case "decoration":
			this.graphelem = renderer.renderText(this.x, y, this.c, 'annotationfont', "annotation", "middle", true);
			break;
		case "text":
			this.graphelem = renderer.renderText(this.x, y, this.c, 'annotationfont', "annotation", "start", this.centerVertically);
			break;
		case "part":
			this.graphelem = renderer.renderText(this.x, y, this.c, 'partsfont', "part", "start");
			break;
		case "bar":
			this.graphelem = renderer.printStem(this.x, this.linewidth, y, (bartop)?bartop:renderer.calcY(this.pitch2)); break; // bartop can't be 0
		case "stem":
			this.graphelem = renderer.printStem(this.x, this.linewidth, y, renderer.calcY(this.pitch2)); break;
		case "ledger":
			this.graphelem = renderer.printStaveLine(this.x, this.x+this.w, this.pitch); break;
	}
	if (this.scalex!==1 && this.graphelem) {
		this.graphelem.scale(this.scalex, this.scaley, this.x, y);
	}
	return this.graphelem;
};
//    abc_renderer.js: API to render to SVG/Raphael/whatever rendering engine
//    Copyright (C) 2010 Gregory Dyke (gregdyke at gmail dot com)
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.


/*global window, ABCJS, Math, console */

if (!window.ABCJS)
	window.ABCJS = {};

if (!window.ABCJS.write)
	window.ABCJS.write = {};

/**
 * Implements the API for rendering ABCJS Abstract Rendering Structure to a canvas/paper (e.g. SVG, Raphael, etc)
 * @param {Object} paper
 * @param {bool} doRegression
 */
ABCJS.write.Renderer = function(paper, doRegression) {
  this.paper = paper;
  this.controller = null; //TODO-GD only used when drawing the ABCJS ARS to connect the controller with the elements for highlighting

	this.space = 3*ABCJS.write.spacing.SPACE;
  this.padding = {}; // renderer's padding is managed by the controller
  this.doRegression = doRegression;
  if (this.doRegression)
    this.regressionLines = [];
	this.reset();
};

ABCJS.write.Renderer.prototype.reset = function() {

	this.paper.clear();
	this.y = 0;
	this.abctune = null;
	this.lastM = null;
	this.ingroup = false;
	this.path = null;
	this.isPrint = false;
	this.initVerticalSpace();
	if (this.doRegression)
		this.regressionLines = [];
	// HACK-PER: There was a problem in Raphael where every path string that was sent to it was cached.
	// That was causing the browser's memory to steadily grow until the browser went slower and slower until
	// it crashed. The fix to that was a patch to Raphael, so it is only patched on the versions of this library that
	// bundle Raphael with it. Also, if Raphael gets an update, then that patch will be lost. On version 2.1.2 of Raphael,
	// the patch is on line 1542 and 1545 and it is:
	//             p[ps].sleep = 1;
};

/**
 * Set whether we are formatting this for the screen, or as a preview for creating a PDF version.
 * @param {bool} isPrint
 */
ABCJS.write.Renderer.prototype.setPrintMode = function (isPrint) {
	this.isPrint = isPrint;
};

/**
 * Set the size of the canvas.
 * @param {object} maxwidth
 * @param {object} scale
 */
ABCJS.write.Renderer.prototype.setPaperSize = function (maxwidth, scale) {
	var w = (maxwidth+this.padding.right)*scale;
	var h = (this.y+this.padding.bottom)*scale;
	if (this.isPrint)
		h = Math.max(h, 1056); // 11in x 72pt/in x 1.33px/pt
	// TODO-PER: We are letting the page get as long as it needs now, but eventually that should go to a second page.
	if (this.doRegression)
		this.regressionLines.push("PAPER SIZE: ("+w+","+h+")");

	this.paper.setSize(w/scale,h/scale);
	// Correct for IE problem in calculating height
	var isIE=/*@cc_on!@*/false;//IE detector
	if (isIE) {
		this.paper.canvas.parentNode.style.width=w+"px";
		this.paper.canvas.parentNode.style.height=""+h+"px";
	} else
		this.paper.canvas.parentNode.setAttribute("style","width:"+w+"px");
	if (scale !== 1) {
		this.paper.canvas.style.transform = "scale("+scale+","+scale+")";
		this.paper.canvas.style['-ms-transform'] = "scale("+scale+","+scale+")";
		this.paper.canvas.style['-webkit-transform'] = "scale("+scale+","+scale+")";
		this.paper.canvas.style['transform-origin'] = "0 0";
		this.paper.canvas.style['-ms-transform-origin-x'] = "0";
		this.paper.canvas.style['-ms-transform-origin-y'] = "0";
		this.paper.canvas.style['-webkit-transform-origin-x'] = "0";
		this.paper.canvas.style['-webkit-transform-origin-y'] = "0";
	} else {
		this.paper.canvas.style.transform = "";
		this.paper.canvas.style['-ms-transform'] = "";
		this.paper.canvas.style['-webkit-transform'] = "";
	}
	this.paper.canvas.parentNode.style.overflow="hidden";
	this.paper.canvas.parentNode.style.height=""+h+"px";
};

/**
 * Set the padding
 * @param {object} params
 */
ABCJS.write.Renderer.prototype.setPaddingOverride = function(params) {
	this.paddingOverride = { top: params.paddingtop, bottom: params.paddingbottom,
		right: params.paddingright, left: params.paddingleft };
};

/**
 * Set the padding
 * @param {object} params
 */
ABCJS.write.Renderer.prototype.setPadding = function(abctune) {
	// If the padding is set in the tune, then use that.
	// Otherwise, if the padding is set in the override, use that.
	// Otherwise, use the defaults (there are a different set of defaults for screen and print.)
	function setPaddingVariable(self, paddingKey, formattingKey, printDefault, screenDefault) {
		if (abctune.formatting[formattingKey] !== undefined)
			self.padding[paddingKey] = abctune.formatting[formattingKey];
		else if (self.paddingOverride[paddingKey] !== undefined)
			self.padding[paddingKey] = self.paddingOverride[paddingKey];
		else if (abctune.media === 'print')
			self.padding[paddingKey] = printDefault;
		else
			self.padding[paddingKey] = screenDefault;
	}
	// 1cm x 0.393701in/cm x 72pt/in x 1.33px/pt = 38px
	// 1.8cm x 0.393701in/cm x 72pt/in x 1.33px/pt = 68px
	setPaddingVariable(this, 'top', 'topmargin', 38, 15);
	setPaddingVariable(this, 'bottom', 'bottommargin', 38, 15);
	setPaddingVariable(this, 'left', 'leftmargin', 68, 15);
	setPaddingVariable(this, 'right', 'rightmargin', 68, 15);
};

/**
 * Some of the items on the page are not scaled, so adjust them in the opposite direction of scaling to cancel out the scaling.
 * @param {float} scale
 */
ABCJS.write.Renderer.prototype.adjustNonScaledItems = function (scale) {
	this.padding.top /= scale;
	this.padding.bottom /= scale;
	this.padding.left /= scale;
	this.padding.right /= scale;
	this.abctune.formatting.headerfont.size /= scale;
	this.abctune.formatting.footerfont.size /= scale;
};

/**
 * Set the the values for all the configurable vertical space options.
 */
ABCJS.write.Renderer.prototype.initVerticalSpace = function() {
	// conversion: 37.7953 = conversion factor for cm to px.
	// All of the following values are in px.
	this.spacing = {
		composer: 7.56, // Set the vertical space above the composer.
		graceBefore: 8.67, // Define the space before, inside and after the grace notes.
		graceInside: 10.67,
		graceAfter: 16,
		info: 0, // Set the vertical space above the infoline.
		lineSkipFactor: 1.1, // Set the factor for spacing between lines of text. (multiply this by the font size)
		music: 7.56, // Set the vertical space above the first staff.
		paragraphSkipFactor: 0.4, // Set the factor for spacing between text paragraphs. (multiply this by the font size)
		parts: 11.33, // Set the vertical space above a new part.
		slurHeight: 1.0, // Set the slur height factor.
		staffSeparation: 61.33, // Do not put a staff system closer than <unit> from the previous system.
		stemHeight: 26.67+10, // Set the stem height.
		subtitle: 3.78, // Set the vertical space above the subtitle.
		systemStaffSeparation: 48, // Do not place the staves closer than <unit> inside a system. * This values applies to all staves when in the tune header. Otherwise, it applies to the next staff
		text: 18.9, // Set the vertical space above the history.
		title: 7.56, // Set the vertical space above the title.
		top: 30.24, //Set the vertical space above the tunes and on the top of the continuation pages.
		vocal: 30.67, // Set the vertical space above the lyrics under the staves.
		words: 0 // Set the vertical space above the lyrics at the end of the tune.
	};
	/*
	TODO-PER: Handle the x-coordinate spacing items, too.
maxshrink <float>Default: 0.65
Set how much to compress horizontally when music line breaks
are automatic.
<float> must be between 0 (natural spacing)
and 1 (max shrinking).

// This next value is used to compute the natural spacing of
// the notes. The base spacing of the crotchet is always
// 40 pts. When the duration of a note type is twice the
// duration of an other note type, its spacing is multiplied
// by this factor.
// The default value causes the note spacing to be multiplied
// by 2 when its duration is multiplied by 4, i.e. the
// space of the semibreve is 80 pts and the space of the
// semiquaver is 20 pts.
// Setting this value to 1 sets all note spacing to 40 pts.
noteSpacingFactor: 1.414, // Set the note spacing factor to <float> (range 1..2).

scale <float> Default: 0.75 Set the page scale factor. Note that the header and footer are not scaled.

stretchlast <float>Default: 0.8
Stretch the last music line of a tune when it exceeds
the <float> fraction of the page width.
<float> range is 0.0 to 1.0.
	 */
};

ABCJS.write.Renderer.prototype.setVerticalSpace = function(formatting) {
	// conversion from pts to px 4/3
	if (formatting.staffsep !== undefined)
		this.spacing.staffSeparation = formatting.staffsep *4/3;
	if (formatting.composerspace !== undefined)
		this.spacing.composer = formatting.composerspace *4/3;
	if (formatting.partsspace !== undefined)
		this.spacing.parts = formatting.partsspace *4/3;
	if (formatting.textspace !== undefined)
		this.spacing.text = formatting.textspace *4/3;
	if (formatting.musicspace !== undefined)
		this.spacing.music = formatting.musicspace *4/3;
	if (formatting.titlespace !== undefined)
		this.spacing.title = formatting.titlespace *4/3;
	if (formatting.sysstaffsep !== undefined)
		this.spacing.systemStaffSeparation = formatting.sysstaffsep *4/3;
	if (formatting.subtitlespace !== undefined)
		this.spacing.subtitle = formatting.subtitlespace *4/3;
	if (formatting.topspace !== undefined)
		this.spacing.top = formatting.topspace *4/3;
	if (formatting.vocalspace !== undefined)
		this.spacing.vocal = formatting.vocalspace *4/3;
	if (formatting.wordsspace !== undefined)
		this.spacing.words = formatting.wordsspace *4/3;
};

/**
 * Leave space at the top of the paper
 * @param {object} abctune
 */
ABCJS.write.Renderer.prototype.topMargin = function(abctune) {
		this.moveY(this.padding.top);
};

/**
 * Leave space before printing the music
 */
ABCJS.write.Renderer.prototype.addMusicPadding = function() {
		this.moveY(this.spacing.music);
};

/**
 * Leave space before printing a staff system
 */
ABCJS.write.Renderer.prototype.addStaffPadding = function(lastStaffGroup, thisStaffGroup) {
	var lastStaff = lastStaffGroup.staffs[lastStaffGroup.staffs.length-1];
	var lastBottomLine = -(lastStaff.bottom - 2); // The 2 is because the scale goes to 2 below the last line.
	var nextTopLine = thisStaffGroup.staffs[0].top - 10; // Because 10 represents the top line.
	var naturalSeparation = nextTopLine + lastBottomLine; // This is how far apart they'd be without extra spacing
	var separationInPixels = naturalSeparation * ABCJS.write.spacing.STEP;
	if (separationInPixels < this.spacing.staffSeparation)
		this.moveY(this.spacing.staffSeparation-separationInPixels);
};

/**
 * Text that goes above the score
 * @param {number} width
 * @param {object} abctune
 */
ABCJS.write.Renderer.prototype.engraveTopText = function(width, abctune) {
	if (abctune.metaText.header && this.isPrint) {
		// Note: whether there is a header or not doesn't change any other positioning, so this doesn't change the Y-coordinate.
		// This text goes above the margin, so we'll temporarily move up.
		var headerTextHeight = this.getTextSize("XXXX", "headerfont", 'header meta-top').height;
		this.y -=headerTextHeight;
		this.outputTextIf(this.padding.left, abctune.metaText.header.left, 'headerfont', 'header meta-top', 0, null, 'start');
		this.outputTextIf(this.padding.left + width / 2, abctune.metaText.header.center, 'headerfont', 'header meta-top', 0, null, 'middle');
		this.outputTextIf(this.padding.left + width, abctune.metaText.header.right, 'headerfont', 'header meta-top', 0, null, 'end');
		this.y += headerTextHeight;
	}
	if (this.isPrint)
		this.moveY(this.spacing.top);
	this.outputTextIf(this.padding.left + width / 2, abctune.metaText.title, 'titlefont', 'title meta-top', this.spacing.title, 0, 'middle');
	if (abctune.lines[0])
		this.outputTextIf(this.padding.left + width / 2, abctune.lines[0].subtitle, 'subtitlefont', 'text meta-top', this.spacing.subtitle, 0, 'middle');

	if (abctune.metaText.rhythm || abctune.metaText.origin || abctune.metaText.composer) {
		this.moveY(this.spacing.composer);
		var rSpace = this.outputTextIf(this.padding.left, abctune.metaText.rhythm, 'infofont', 'meta-top', 0, null, "start");

		var composerLine = "";
		if (abctune.metaText.composer) composerLine += abctune.metaText.composer;
		if (abctune.metaText.origin) composerLine += ' (' + abctune.metaText.origin + ')';
		if (composerLine.length > 0) {
			var space = this.outputTextIf(this.padding.left + width, composerLine, 'composerfont', 'meta-top', 0, null, "end");
			this.moveY(space[1]);
		} else {
			this.moveY(rSpace[1]);
		}
		// TODO-PER: The following is a hack to make the elements line up with abcm2ps. Don't know where the extra space is coming from.
		this.moveY(-6);
	//} else if (this.isPrint) {
	//	// abcm2ps adds this space whether there is anything to write or not.
	//	this.moveY(this.spacing.composer);
	//	var space2 = this.getTextSize("M", 'composerfont', 'meta-top');
	//	this.moveY(space2.height);
	}

	this.outputTextIf(this.padding.left + width, abctune.metaText.author, 'composerfont', 'meta-top', 0, 0, "end");
	//this.skipSpaceY();

	this.outputTextIf(this.padding.left, abctune.metaText.partOrder, 'partsfont', 'meta-bottom', 0, 0, "start");
};

/**
 * Text that goes below the score
 * @param {number} width
 * @param {object} abctune
 */
ABCJS.write.Renderer.prototype.engraveExtraText = function(width, abctune) {
	this.lineNumber = null;
	this.measureNumber = null;

	var extraText;
	if (abctune.metaText.unalignedWords) {
		extraText = "";
		for (var j = 0; j < abctune.metaText.unalignedWords.length; j++) {
			if (typeof abctune.metaText.unalignedWords[j] === 'string')
				extraText += abctune.metaText.unalignedWords[j] + "\n";
			else {
				for (var k = 0; k < abctune.metaText.unalignedWords[j].length; k++) {
					extraText += " FONT " + abctune.metaText.unalignedWords[j][k].text;
				}
				extraText += "\n";
			}
		}
		this.outputTextIf(this.padding.left + ABCJS.write.spacing.INDENT, extraText, 'wordsfont', 'meta-bottom', this.spacing.words, 2, "start");
	}

	extraText = "";
	if (abctune.metaText.book) extraText += "Book: " + abctune.metaText.book + "\n";
	if (abctune.metaText.source) extraText += "Source: " + abctune.metaText.source + "\n";
	if (abctune.metaText.discography) extraText += "Discography: " + abctune.metaText.discography + "\n";
	if (abctune.metaText.notes) extraText += "Notes: " + abctune.metaText.notes + "\n";
	if (abctune.metaText.transcription) extraText += "Transcription: " + abctune.metaText.transcription + "\n";
	if (abctune.metaText.history) extraText += "History: " + abctune.metaText.history + "\n";
	if (abctune.metaText['abc-copyright']) extraText += "Copyright: " + abctune.metaText['abc-copyright'] + "\n";
	if (abctune.metaText['abc-creator']) extraText += "Creator: " + abctune.metaText['abc-creator'] + "\n";
	if (abctune.metaText['abc-edited-by']) extraText += "Edited By: " + abctune.metaText['abc-edited-by'] + "\n";
	this.outputTextIf(this.padding.left, extraText, 'historyfont', 'meta-bottom', this.spacing.info, 0, "start");

	if (abctune.metaText.footer && this.isPrint) {
		// Note: whether there is a footer or not doesn't change any other positioning, so this doesn't change the Y-coordinate.
		this.outputTextIf(this.padding.left, abctune.metaText.footer.left, 'footerfont', 'header meta-bottom', 0, null, 'start');
		this.outputTextIf(this.padding.left + width / 2, abctune.metaText.footer.center, 'footerfont', 'header meta-bottom', 0, null, 'middle');
		this.outputTextIf(this.padding.left + width, abctune.metaText.footer.right, 'footerfont', 'header meta-bottom', 0, null, 'end');
	}
};

/**
 * Output text defined with %%text.
 * @param {array or string} text
 */
ABCJS.write.Renderer.prototype.outputFreeText = function (text) {
	if (typeof text === 'string')
		this.outputTextIf(this.padding.left, text, 'textfont', 'defined-text', 0, 1, "start");
	else {
		var str = "";
		for (var i = 0; i < text.length; i++) {
			str += " FONT " + text[i].text;
		}
		this.outputTextIf(this.padding.left, str, 'textfont', 'defined-text', 0, 1, "start");
	}
};

/**
 * Output an extra subtitle that is defined later in the tune.
 */
ABCJS.write.Renderer.prototype.outputSubtitle = function (width, subtitle) {
	this.outputTextIf(this.padding.left + width / 2, subtitle, 'subtitlefont', 'text meta-top', this.spacing.subtitle, 0, 'middle');
};

/**
 * Begin a group of glyphs that will always be moved, scaled and highlighted together
 */
ABCJS.write.Renderer.prototype.beginGroup = function () {
  this.path = [];
  this.lastM = [0,0];
  this.ingroup = true;
};

/**
 * Add a path to the current group
 * @param {Array} path
 * @private
 */
ABCJS.write.Renderer.prototype.addPath = function (path) {
  path = path || [];
  if (path.length===0) return;
  path[0][0]="m";
  path[0][1]-=this.lastM[0];
  path[0][2]-=this.lastM[1];
  this.lastM[0]+=path[0][1];
  this.lastM[1]+=path[0][2];
  this.path.push(path[0]);
  for (var i=1,ii=path.length;i<ii;i++) {
    if (path[i][0]==="m") {
      this.lastM[0]+=path[i][1];
      this.lastM[1]+=path[i][2];
    }
    this.path.push(path[i]);
  }
};

/**
 * End a group of glyphs that will always be moved, scaled and highlighted together
 */
ABCJS.write.Renderer.prototype.endGroup = function (klass) {
  this.ingroup = false;
  if (this.path.length===0) return null;
  var ret = this.paper.path().attr({path:this.path, stroke:"none", fill:"#000000", 'class': this.addClasses(klass)});
	this.path = [];
  if (this.doRegression) this.addToRegression(ret);

  return ret;
};

/**
 * gets scaled
 * @param {number} x1 start x
 * @param {number} x2 end x
 * @param {number} pitch pitch the stave line is drawn at
 */
ABCJS.write.Renderer.prototype.printStaveLine = function (x1,x2, pitch, klass) {
	var extraClass = "staff";
	if (klass !== undefined)
		extraClass += " " + klass;
  var isIE=/*@cc_on!@*/false;//IE detector
  var dy = 0.35;
  var fill = "#000000";
  if (isIE) {
    dy = 1;
    fill = "#666666";
  }
  var y = this.calcY(pitch);
  var pathString = ABCJS.write.sprintf("M %f %f L %f %f L %f %f L %f %f z", x1, y-dy, x2, y-dy,
     x2, y+dy, x1, y+dy);
  var ret = this.paper.path().attr({path:pathString, stroke:"none", fill:fill, 'class': this.addClasses(extraClass)}).toBack();
  if (this.doRegression) this.addToRegression(ret);

  return ret;
};

/**
 * gets scaled if not in a group
 * @param {number} x x coordinate of the stem
 * @param {number} dx stem width
 * @param {number} y1 y coordinate of the stem bottom
 * @param {number} y2 y coordinate of the stem top
 */
ABCJS.write.Renderer.prototype.printStem = function (x, dx, y1, y2) {
  if (dx<0) { // correct path "handedness" for intersection with other elements
    var tmp = y2;
    y2 = y1;
    y1 = tmp;
  }
  var isIE=/*@cc_on!@*/false;//IE detector
  var fill = "#000000";
  if (isIE && dx<1) {
    dx = 1;
    fill = "#666666";
  }
  if (~~x === x) x+=0.05; // raphael does weird rounding (for VML)
  var pathArray = [["M",x,y1],["L", x, y2],["L", x+dx, y2],["L",x+dx,y1],["z"]];
  if (!isIE && this.ingroup) {
    this.addPath(pathArray);
  } else {
    var ret = this.paper.path().attr({path:pathArray, stroke:"none", fill:fill, 'class': this.addClasses('stem')}).toBack();
    if (this.doRegression) this.addToRegression(ret);

    return ret;
  }
};

function kernSymbols(lastSymbol, thisSymbol, lastSymbolWidth) {
	// This is just some adjustments to make it look better.
	var width = lastSymbolWidth;
	if (lastSymbol === 'f' && thisSymbol === 'f')
		width = width*2/3;
	if (lastSymbol === 'p' && thisSymbol === 'p')
		width = width*5/6;
	if (lastSymbol === 'f' && thisSymbol === 'z')
		width = width*5/8;
	return width;
}

/**
 * assumes this.y is set appropriately
 * if symbol is a multichar string without a . (as in scripts.staccato) 1 symbol per char is assumed
 * not scaled if not in printgroup
 */
ABCJS.write.Renderer.prototype.printSymbol = function(x, offset, symbol, scalex, scaley, klass) {
	var el;
    var ycorr;
  if (!symbol) return null;
  if (symbol.length>0 && symbol.indexOf(".")<0) {
    var elemset = this.paper.set();
    var dx =0;
    for (var i=0; i<symbol.length; i++) {
        var s = symbol.charAt(i);
        ycorr = ABCJS.write.glyphs.getYCorr(s);
			el = ABCJS.write.glyphs.printSymbol(x+dx, this.calcY(offset+ycorr), s, this.paper, klass);
			if (el) {
				if (this.doRegression) this.addToRegression(el);
				elemset.push(el);
				if (i < symbol.length-1)
					dx+= kernSymbols(s, symbol.charAt(i+1), ABCJS.write.glyphs.getSymbolWidth(s));
			} else {
				this.renderText(x, this.y, "no symbol:" +symbol, "debugfont", 'debug-msg', 'start');
      }
    }
    return elemset;
  } else {
    ycorr = ABCJS.write.glyphs.getYCorr(symbol);
    if (this.ingroup) {
      this.addPath(ABCJS.write.glyphs.getPathForSymbol(x, this.calcY(offset+ycorr), symbol, scalex, scaley));
    } else {
      el = ABCJS.write.glyphs.printSymbol(x, this.calcY(offset+ycorr), symbol, this.paper, klass);
      if (el) {
	if (this.doRegression) this.addToRegression(el);
	return el;
      } else
				this.renderText(x, this.y, "no symbol:" +symbol, "debugfont", 'debug-msg', 'start');
    }
    return null;    
  }
};


ABCJS.write.Renderer.prototype.printPath = function (attrs) {
  var ret = this.paper.path().attr(attrs);
  if (this.doRegression) this.addToRegression(ret);
  return ret;
};

ABCJS.write.Renderer.prototype.drawArc = function(x1, x2, pitch1, pitch2, above) {


  x1 = x1 + 6;
  x2 = x2 + 4;
  pitch1 = pitch1 + ((above)?1.5:-1.5);
  pitch2 = pitch2 + ((above)?1.5:-1.5);
  var y1 = this.calcY(pitch1);
  var y2 = this.calcY(pitch2);

  //unit direction vector
  var dx = x2-x1;
  var dy = y2-y1;
  var norm= Math.sqrt(dx*dx+dy*dy);
  var ux = dx/norm;
  var uy = dy/norm;

  var flatten = norm/3.5;
  var curve = ((above)?-1:1)*Math.min(25, Math.max(4, flatten));

  var controlx1 = x1+flatten*ux-curve*uy;
  var controly1 = y1+flatten*uy+curve*ux;
  var controlx2 = x2-flatten*ux-curve*uy;
  var controly2 = y2-flatten*uy+curve*ux;
  var thickness = 2;
  var pathString = ABCJS.write.sprintf("M %f %f C %f %f %f %f %f %f C %f %f %f %f %f %f z", x1, y1,
     controlx1, controly1, controlx2, controly2, x2, y2,
     controlx2-thickness*uy, controly2+thickness*ux, controlx1-thickness*uy, controly1+thickness*ux, x1, y1);
  var ret = this.paper.path().attr({path:pathString, stroke:"none", fill:"#000000", 'class': this.addClasses('slur')});
  if (this.doRegression) this.addToRegression(ret);

  return ret;
};
/**
 * Calculates the y for a given pitch value (relative to the stave the renderer is currently printing)
 * @param {number} ofs pitch value (bottom C on a G clef = 0, D=1, etc.)
 */
ABCJS.write.Renderer.prototype.calcY = function(ofs) {
  return this.y - ofs*ABCJS.write.spacing.STEP;
};

/**
 * Print @param {number} numLines. If there is 1 line it is the B line. Otherwise the bottom line is the E line.
 */
ABCJS.write.Renderer.prototype.printStave = function (startx, endx, numLines) {
	var klass = "top-line";
	// If there is one line, it is the B line. Otherwise, the bottom line is the E line.
	if (numLines === 1) {
		this.printStaveLine(startx,endx,6, klass);
		return;
	}
	for (var i = numLines-1; i >= 0; i--) {
		this.printStaveLine(startx,endx,(i+1)*2, klass);
		klass = undefined;
	}
};

/**
 *
 * @private
 */
ABCJS.write.Renderer.prototype.addClasses = function (c) {
	var ret = [];
	if (c.length > 0) ret.push(c);
	if (this.lineNumber !== null) ret.push("l"+this.lineNumber);
	if (this.measureNumber !== null) ret.push("m"+this.measureNumber);
	return ret.join(' ');
};

ABCJS.write.Renderer.prototype.getFontAndAttr = function(type, klass) {
	var font = this.abctune.formatting[type];
	// Raphael deliberately changes the font units to pixels for some reason, so we need to change points to pixels here.
	if (font)
		font = { face: font.face, size: font.size*4/3, decoration: font.decoration, style: font.style, weight: font.weight };
	else
		font = { face: "Arial", size: 12*4/3, decoration: "underline", style: "normal", weight: "normal" };

	var attr = {"font-size": font.size, 'font-style': font.style,
		"font-family": font.face, 'font-weight': font.weight, 'text-decoration': font.decoration,
		'class': this.addClasses(klass) };
	attr.font = "";	// There is a spurious font definition that is put on all text elements. This overwrites it.
	return { font: font, attr: attr };
};

ABCJS.write.Renderer.prototype.getTextSize = function(text, type, klass) {
	var hash = this.getFontAndAttr(type, klass);
	var el = this.paper.text(0,0, text).attr(hash.attr);
	var size = el.getBBox();
	el.remove();
	return size;
};

ABCJS.write.Renderer.prototype.renderText = function(x, y, text, type, klass, anchor, centerVertically) {
	var hash = this.getFontAndAttr(type, klass);
	if (anchor)
		hash.attr["text-anchor"] = anchor;
	text = text.replace(/\n\n/g, "\n \n");
	var el = this.paper.text(x, y, text).attr(hash.attr);
	if (!centerVertically) {
		// The text will be placed centered in vertical alignment, so we need to move the box down so that
		// the top of the text is where we've requested.
		var size = el.getBBox();
		el.attr({ "y": y + size.height / 2 });
		if (hash.font.box) {
			this.paper.rect(size.x - 1, size.y - 1, size.width + 2, size.height + 2).attr({"stroke": "#cccccc"});
		}
	}
	if (type === 'debugfont') {
		console.log("Debug msg: " + text);
		el.attr({ stroke: "#ff0000"});
	}
	if (this.doRegression) this.addToRegression(el);
	return el;
};

ABCJS.write.Renderer.prototype.moveY = function (em, numLines) {
	if (numLines === undefined) numLines = 1;
	this.y += em*numLines;
};

ABCJS.write.Renderer.prototype.skipSpaceY = function () {
	this.y += this.space;
};

// Call with 'kind' being the font type to use,
// if marginBottom === null then don't increment the Y after printing, otherwise that is the extra number of em's to leave below the line.
// and alignment being "start", "middle", or "end".
ABCJS.write.Renderer.prototype.outputTextIf = function(x, str, kind, klass, marginTop, marginBottom, alignment) {
	if (str) {
		if (marginTop)
			this.moveY(marginTop);
		var el = this.renderText(x, this.y, str, kind, klass, alignment);
		if (marginBottom !== null) {
			var numLines = str.split("\n").length;
			this.moveY(el.getBBox().height/numLines, (numLines + marginBottom));
		}
		return [el.getBBox().width, el.getBBox().height];
	}
	return [0,0];
};

// For debugging, it is sometimes useful to know where you are vertically.
ABCJS.write.Renderer.prototype.printHorizontalLine = function (width, vertical, comment) {
	var dy = 0.35;
	var fill = "rgba(0,0,255,.4)";
	var y = this.y;
	if (vertical) y = vertical;
	y = Math.round(y);
	this.paper.text(10, y, ""+Math.round(y)).attr({"text-anchor": "start", "font-size":"18px", fill: fill, stroke: fill });
	var x1 = 50;
	var x2 = width;
	var pathString = ABCJS.write.sprintf("M %f %f L %f %f L %f %f L %f %f z", x1, y-dy, x1+x2, y-dy,
		x2, y+dy, x1, y+dy);
	this.paper.path().attr({path:pathString, stroke:"none", fill:fill, 'class': this.addClasses('staff')}).toBack();
	for (var i = 1; i < width/100; i++) {
		pathString = ABCJS.write.sprintf("M %f %f L %f %f L %f %f L %f %f z", i*100-dy, y-5, i*100-dy, y+5,
			i*100+dy, y-5, i*100+dy, y+5);
		this.paper.path().attr({path:pathString, stroke:"none", fill:fill, 'class': this.addClasses('staff')}).toBack();
	}
	if (comment)
		this.paper.text(width+70, y, comment).attr({"text-anchor": "start", "font-size":"18px", fill: fill, stroke: fill });
};

ABCJS.write.Renderer.prototype.printShadedBox = function (x, y, width, height, color, comment) {
	var box = this.paper.rect(x, y, width, height).attr({fill: color, stroke: color });
	if (comment)
		this.paper.text(0, y+7, comment).attr({"text-anchor": "start", "font-size":"14px", fill: "rgba(0,0,255,.4)", stroke: "rgba(0,0,255,.4)" });
	return box;
};

ABCJS.write.Renderer.prototype.printVerticalLine = function (x, y1, y2) {
	var dy = 0.35;
	var fill = "#00aaaa";
	var pathString = ABCJS.write.sprintf("M %f %f L %f %f L %f %f L %f %f z", x - dy, y1, x - dy, y2,
			x + dy, y1, x + dy, y2);
	this.paper.path().attr({path: pathString, stroke: "none", fill: fill, 'class': this.addClasses('staff')}).toBack();
	pathString = ABCJS.write.sprintf("M %f %f L %f %f L %f %f L %f %f z", x - 20, y1, x - 20, y1+3,
		x, y1, x, y1+3);
	this.paper.path().attr({path: pathString, stroke: "none", fill: fill, 'class': this.addClasses('staff')}).toBack();
	pathString = ABCJS.write.sprintf("M %f %f L %f %f L %f %f L %f %f z", x + 20, y2, x + 20, y2+3,
		x, y2, x, y2+3);
	this.paper.path().attr({path: pathString, stroke: "none", fill: fill, 'class': this.addClasses('staff')}).toBack();

};

/**
 * @private
 */
ABCJS.write.Renderer.prototype.addToRegression = function (el) {
	var box = el.getBBox();
	//var str = "("+box.x+","+box.y+")["+box.width+","+box.height+"] "
	var str = el.type + ' ' + box.toString() + ' ';
	var attrs = [];
	for (var key in el.attrs) {
		if (el.attrs.hasOwnProperty(key)) {
			if (key === 'class')
				str = el.attrs[key] + " " + str;
			else
				attrs.push(key+": "+el.attrs[key]);
		}
	}
	attrs.sort();
	str += "{ " +attrs.join(" ") + " }";
	this.regressionLines.push(str);
};
//    abc_staff_group_element.js: Definition of the StaffGroupElement class.
//    Copyright (C) 2010,2014 Gregory Dyke (gregdyke at gmail dot com) and Paul Rosen
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.

/*globals ABCJS, console */

if (!window.ABCJS)
	window.ABCJS = {};

if (!window.ABCJS.write)
	window.ABCJS.write = {};

// StaffGroupElement contains all the elements that go together to make one line of music.
// That might be multiple staves that are tied together, and it might be multiple voices on one staff.
//
// Methods:
// constructor: some basic initialization
// addVoice(): Called once for each voice. May add a new staff if needed.
// finished(): Called only internally by layout()
// layout(): This does all the layout. It sets the following: spacingunits, startx, minspace, w, and the x-coordinate of each element in each voice.
// draw(): Calls the underlying methods on the voice objects to do the drawing. Sets y and height.
//
// Members:
// staffs: an array of all the staves in this group. Each staff contains the following elements:
//    { top, bottom, highest, lowest, y }
// voices: array of VoiceElement objects. This is mostly passed in, but the VoiceElement objects are modified here.
//
// spacingunits: number of relative x-units in the line. Used by the calling function to pass back in as the "spacing" input parameter.
// TODO-PER: This should actually be passed back as a return value.
// minspace: smallest space between two notes. Used by the calling function to pass back in as the "spacing" input parameter.
// TODO-PER: This should actually be passed back as a return value.
// startx: The left edge, taking the margin and the optional voice name. Used by the draw() method.
// w: The width of the line. Used by calling function to pass back in as the "spacing" input parameter, and the draw() method.
// TODO-PER: This should actually be passed back as a return value.  (TODO-PER: in pixels or spacing units?)
// y: The top of the staff group, in pixels. This is set in the draw method.
// TODO-PER: Where is that used? It looks like it might not be needed.
// height: Set in the draw() method to the height actually used. Used by the calling function to know where to start the next staff group.
// TODO-PER: This should actually be set in the layout method and passed back as a return value.

ABCJS.write.StaffGroupElement = function() {
	this.voices = [];
	this.staffs = [];
};

ABCJS.write.StaffGroupElement.prototype.setLimit = function(member, voice) {
	if (!voice.specialY[member]) return;
	if (!voice.staff.specialY[member])
		voice.staff.specialY[member] = voice.specialY[member];
	else
		voice.staff.specialY[member] = Math.max(voice.staff.specialY[member], voice.specialY[member]);
};

ABCJS.write.StaffGroupElement.prototype.addVoice = function (voice, staffnumber, stafflines) {
	var voiceNum = this.voices.length;
	this.voices[voiceNum] = voice;
	if (this.staffs[staffnumber])
		this.staffs[staffnumber].voices.push(voiceNum);
	else {
		// TODO-PER: how does the min/max change when stafflines is not 5?
		this.staffs[this.staffs.length] = {
			top: 10,
			bottom: 2,
			lines: stafflines,
			voices: [voiceNum],
			specialY: {
				tempoHeightAbove: 0,
				partHeightAbove: 0,
				volumeHeightAbove: 0,
				dynamicHeightAbove: 0,
				endingHeightAbove: 0,
				chordHeightAbove: 0,
				lyricHeightAbove: 0,

				lyricHeightBelow: 0,
				chordHeightBelow: 0,
				volumeHeightBelow: 0,
				dynamicHeightBelow: 0
			}
		};
	}
	voice.staff = this.staffs[staffnumber];
};

ABCJS.write.StaffGroupElement.prototype.setStaffLimits = function (voice) {
	voice.staff.top = Math.max(voice.staff.top, voice.top);
	voice.staff.bottom = Math.min(voice.staff.bottom, voice.bottom);
	this.setLimit('tempoHeightAbove', voice);
	this.setLimit('partHeightAbove', voice);
	this.setLimit('volumeHeightAbove', voice);
	this.setLimit('dynamicHeightAbove', voice);
	this.setLimit('endingHeightAbove', voice);
	this.setLimit('chordHeightAbove', voice);
	this.setLimit('lyricHeightAbove', voice);
	this.setLimit('lyricHeightBelow', voice);
	this.setLimit('chordHeightBelow', voice);
	this.setLimit('volumeHeightBelow', voice);
	this.setLimit('dynamicHeightBelow', voice);
};

ABCJS.write.StaffGroupElement.prototype.setUpperAndLowerElements = function(renderer) {
	// Each staff already has the top and bottom set, now we see if there are elements that are always on top and bottom, and resolve their pitch.
	// Also, get the overall height of all the staves in this group.
	var lastStaffBottom;
	for (var i = 0; i < this.staffs.length; i++) {
		var staff = this.staffs[i];
		// the vertical order of elements that are above is: tempo, part, volume/dynamic, ending/chord, lyric
		// the vertical order of elements that are below is: lyric, chord, volume/dynamic
		var positionY = {
			tempoHeightAbove: 0,
			partHeightAbove: 0,
			volumeHeightAbove: 0,
			dynamicHeightAbove: 0,
			endingHeightAbove: 0,
			chordHeightAbove: 0,
			lyricHeightAbove: 0,

			lyricHeightBelow: 0,
			chordHeightBelow: 0,
			volumeHeightBelow: 0,
			dynamicHeightBelow: 0
		};

		if (ABCJS.write.debugPlacement) {
			staff.originalTop = staff.top; // This is just being stored for debugging purposes.
			staff.originalBottom = staff.bottom; // This is just being stored for debugging purposes.
		}

		if (staff.specialY.lyricHeightAbove) { staff.top += staff.specialY.lyricHeightAbove; positionY.lyricHeightAbove = staff.top; }
		if (staff.specialY.chordHeightAbove) { staff.top += staff.specialY.chordHeightAbove; positionY.chordHeightAbove = staff.top; }
		if (staff.specialY.endingHeightAbove) {
			if (staff.specialY.chordHeightAbove)
				staff.top += 2;
			else
				staff.top += staff.specialY.endingHeightAbove;
			positionY.endingHeightAbove = staff.top;
		}
		if (staff.specialY.dynamicHeightAbove && staff.specialY.volumeHeightAbove) {
			staff.top += Math.max(staff.specialY.dynamicHeightAbove, staff.specialY.volumeHeightAbove);
			positionY.dynamicHeightAbove = staff.top;
			positionY.volumeHeightAbove = staff.top;
		} else if (staff.specialY.dynamicHeightAbove) {
			staff.top += staff.specialY.dynamicHeightAbove; positionY.dynamicHeightAbove = staff.top;
		} else if (staff.specialY.volumeHeightAbove) { staff.top += staff.specialY.volumeHeightAbove; positionY.volumeHeightAbove = staff.top; }
		if (staff.specialY.partHeightAbove) { staff.top += staff.specialY.partHeightAbove; positionY.partHeightAbove = staff.top; }
		if (staff.specialY.tempoHeightAbove) { staff.top += staff.specialY.tempoHeightAbove; positionY.tempoHeightAbove = staff.top; }

		if (staff.specialY.lyricHeightBelow) { positionY.lyricHeightBelow = staff.bottom; staff.bottom -= staff.specialY.lyricHeightBelow; }
		if (staff.specialY.chordHeightBelow) { positionY.chordHeightBelow = staff.bottom; staff.bottom -= staff.specialY.chordHeightBelow; }
		if (staff.specialY.volumeHeightBelow && staff.specialY.dynamicHeightBelow) {
			positionY.volumeHeightBelow = staff.bottom;
			positionY.dynamicHeightBelow = staff.bottom;
			staff.bottom -= Math.max(staff.specialY.volumeHeightBelow, staff.specialY.dynamicHeightBelow);
		} else if (staff.specialY.volumeHeightBelow) {
			positionY.volumeHeightBelow = staff.bottom; staff.bottom -= staff.specialY.volumeHeightBelow;
		} else if (staff.specialY.dynamicHeightBelow) {
			positionY.dynamicHeightBelow = staff.bottom; staff.bottom -= staff.specialY.dynamicHeightBelow;
		}

		if (ABCJS.write.debugPlacement)
			staff.positionY = positionY; // This is just being stored for debugging purposes.

		for (var j = 0; j < staff.voices.length; j++) {
			var voice = this.voices[staff.voices[j]];
			voice.setUpperAndLowerElements(positionY);
		}
		// We might need a little space in between staves if the staves haven't been pushed far enough apart by notes or extra vertical stuff.
		// Only try to put in extra space if this isn't the top staff.
		if (lastStaffBottom !== undefined) {
			var thisStaffTop = staff.top - 10;
			var forcedSpacingBetween = lastStaffBottom + thisStaffTop;
			var minSpacingInPitches = renderer.spacing.systemStaffSeparation/ABCJS.write.spacing.STEP;
			var addedSpace = minSpacingInPitches - forcedSpacingBetween;
			if (addedSpace > 0)
				staff.top += addedSpace;
		}
		lastStaffBottom = 2 - staff.bottom; // the staff starts at position 2 and the bottom variable is negative. Therefore to find out how large the bottom is, we reverse the sign of the bottom, and add the 2 in.

		// Now we need a little margin on the top, so we'll just throw that in.
		//staff.top += 4;
		//console.log("Staff Y: ",i,heightInPitches,staff.top,staff.bottom);
	}
	//console.log("Staff Height: ",heightInPitches,this.height);
};

ABCJS.write.StaffGroupElement.prototype.finished = function() {
	for (var i=0;i<this.voices.length;i++) {
		if (!this.voices[i].layoutEnded()) return false;
	}
	return true;
};

ABCJS.write.StaffGroupElement.prototype.layout = function(spacing, renderer, debug) {
	var epsilon = 0.0000001; // Fudging for inexactness of floating point math.
	this.spacingunits = 0; // number of times we will have ended up using the spacing distance (as opposed to fixed width distances)
	this.minspace = 1000; // a big number to start off with - used to find out what the smallest space between two notes is -- GD 2014.1.7
	var x = renderer.padding.left;

	// find out how much space will be taken up by voice headers
	var voiceheaderw = 0;
	for (var i=0;i<this.voices.length;i++) {
		if(this.voices[i].header) {
			var size = renderer.getTextSize(this.voices[i].header, 'voicefont', '');
			voiceheaderw = Math.max(voiceheaderw,size.width);
		}
	}
	x=x+voiceheaderw*1.1; // When there is no voice header, 110% of 0 is 0
	this.startx=x;

	var currentduration = 0;
	if (debug) console.log("init layout");
	for (i=0;i<this.voices.length;i++) {
		this.voices[i].beginLayout(x);
	}

	var spacingunit = 0; // number of spacingunits coming from the previously laid out element to this one
	while (!this.finished()) {
		// find first duration level to be laid out among candidates across voices
		currentduration= null; // candidate smallest duration level
		for (i=0;i<this.voices.length;i++) {
			if (!this.voices[i].layoutEnded() && (!currentduration || this.voices[i].getDurationIndex()<currentduration))
				currentduration=this.voices[i].getDurationIndex();
		}
		if (debug) console.log("currentduration: ",currentduration);


		// isolate voices at current duration level
		var currentvoices = [];
		var othervoices = [];
		for (i=0;i<this.voices.length;i++) {
			var durationIndex = this.voices[i].getDurationIndex();
			// PER: Because of the inexactness of JS floating point math, we just get close.
			if (durationIndex - currentduration > epsilon) {
				othervoices.push(this.voices[i]);
				//console.log("out: voice ",i);
			} else {
				currentvoices.push(this.voices[i]);
				if (debug) console.log("in: voice ",i);
			}
		}

		// among the current duration level find the one which needs starting furthest right
		spacingunit = 0; // number of spacingunits coming from the previously laid out element to this one
		var spacingduration = 0;
		for (i=0;i<currentvoices.length;i++) {
			//console.log("greatest spacing unit", x, currentvoices[i].getNextX(), currentvoices[i].getSpacingUnits(), currentvoices[i].spacingduration);
			if (currentvoices[i].getNextX()>x) {
				x=currentvoices[i].getNextX();
				spacingunit=currentvoices[i].getSpacingUnits();
				spacingduration = currentvoices[i].spacingduration;
			}
		}
		//console.log("new spacingunit", spacingunit, this.spacingunits, "="+(spacingunit+ this.spacingunits));
		this.spacingunits+=spacingunit;
		this.minspace = Math.min(this.minspace,spacingunit);

		for (i=0;i<currentvoices.length;i++) {
			var voicechildx = currentvoices[i].layoutOneItem(x,spacing);
			var dx = voicechildx-x;
			if (dx>0) {
				x = voicechildx; //update x
				for (var j=0;j<i;j++) { // shift over all previously laid out elements
					currentvoices[j].shiftRight(dx);
				}
			}
		}

		// remove the value of already counted spacing units in other voices (e.g. if a voice had planned to use up 5 spacing units but is not in line to be laid out at this duration level - where we've used 2 spacing units - then we must use up 3 spacing units, not 5)
		for (i=0;i<othervoices.length;i++) {
			othervoices[i].spacingduration-=spacingduration;
			othervoices[i].updateNextX(x,spacing); // adjust other voices expectations
		}

		// update indexes of currently laid out elems
		for (i=0;i<currentvoices.length;i++) {
			var voice = currentvoices[i];
			voice.updateIndices();
		}
	} // finished laying out


	// find the greatest remaining x as a base for the width
	for (i=0;i<this.voices.length;i++) {
		if (this.voices[i].getNextX()>x) {
			x=this.voices[i].getNextX();
			spacingunit=this.voices[i].getSpacingUnits();
		}
	}
	//console.log("greatest remaining",spacingunit,x);
	this.spacingunits+=spacingunit;
	this.w = x;

	for (i=0;i<this.voices.length;i++) {
		this.voices[i].w=this.w;
	}
};

ABCJS.write.StaffGroupElement.prototype.calcHeight = function () {
	// the height is calculated here in a parallel way to the drawing below in hopes that both of these functions will be modified together.
	// TODO-PER: also add the space between staves. (That's systemStaffSeparation, which is the minimum distance between the staff LINES.)
	var height = 0;
	for (var i=0;i<this.voices.length;i++) {
		var staff = this.voices[i].staff;
		if (!this.voices[i].duplicate) {
			height += staff.top;
			if (staff.bottom < 0)
				height += -staff.bottom;
		}
	}
	return height;
};

ABCJS.write.StaffGroupElement.prototype.draw = function (renderer) {
	// We enter this method with renderer.y pointing to the topmost coordinate that we're allowed to draw.
	// All of the children that will be drawn have a relative "pitch" set, where zero is the first ledger line below the staff.
	// renderer.y will be offset at the beginning of each staff by the amount required to make the relative pitch work.
	// If there are multiple staves, then renderer.y will be incremented for each new staff.

	var debugPrint;
	var colorIndex;
	if (ABCJS.write.debugPlacement) {
		var colors = [ "rgba(207,27,36,0.4)", "rgba(168,214,80,0.4)", "rgba(110,161,224,0.4)", "rgba(191,119,218,0.4)", "rgba(195,30,151,0.4)",
			"rgba(31,170,177,0.4)", "rgba(220,166,142,0.4)" ];
		debugPrint = function(staff, key) {
			if (staff.positionY[key]) {
				//renderer.printHorizontalLine(50, renderer.calcY(staff.positionY[key]), key.substr(0, 4) + " " + Math.round(staff.positionY[key]));
				var height = staff.specialY[key] * ABCJS.write.spacing.STEP;
				renderer.printShadedBox(renderer.padding.left, renderer.calcY(staff.positionY[key]), renderer.controller.width, height,colors[colorIndex], key.substr(0, 4));
				colorIndex += 1; if (colorIndex > 6) colorIndex = 0;
			}
		};
	}

	var startY = renderer.y; // So that it can be restored after we're done.
	// Set the absolute Y position for each staff here, so the voice drawing below can just use if.
	for (var j = 0; j < this.staffs.length; j++) {
		var staff1 = this.staffs[j];
		//renderer.printHorizontalLine(50, renderer.y, "start");
		renderer.moveY(ABCJS.write.spacing.STEP, staff1.top);
		staff1.absoluteY = renderer.y;
		if (ABCJS.write.debugPlacement) {
			colorIndex = 0;
			renderer.printShadedBox(renderer.padding.left, renderer.calcY(staff1.originalTop), renderer.controller.width, renderer.calcY(staff1.originalBottom)-renderer.calcY(staff1.originalTop),"rgba(0,0,0,0.1)");
			debugPrint(staff1, 'chordHeightAbove');
			debugPrint(staff1, 'chordHeightBelow');
			debugPrint(staff1, 'dynamicHeightAbove');
			debugPrint(staff1, 'dynamicHeightBelow');
			debugPrint(staff1, 'endingHeightAbove');
			debugPrint(staff1, 'lyricHeightAbove');
			debugPrint(staff1, 'lyricHeightBelow');
			debugPrint(staff1, 'partHeightAbove');
			debugPrint(staff1, 'tempoHeightAbove');
			debugPrint(staff1, 'volumeHeightAbove');
			debugPrint(staff1, 'volumeHeightBelow');
		}
		if (staff1.bottom < 0)
			renderer.moveY(ABCJS.write.spacing.STEP, -staff1.bottom);
	}
	var topLine; // these are to connect multiple staves. We need to remember where they are.
	var bottomLine;

	var bartop = 0;
	renderer.measureNumber = null;
	for (var i=0;i<this.voices.length;i++) {
		var staff = this.voices[i].staff;
		renderer.y = staff.absoluteY;
		//renderer.y = staff.y;
		// offset for starting the counting at middle C
		if (!this.voices[i].duplicate) {
//			renderer.moveY(ABCJS.write.spacing.STEP, staff.top);
			if (!topLine) topLine  = renderer.calcY(10);
			bottomLine  = renderer.calcY(2);
			if (staff.lines !== 0)
				renderer.printStave(this.startx, this.w, staff.lines);
		}
		this.voices[i].draw(renderer, bartop);
		if (!this.voices[i].duplicate) {
			bartop = renderer.calcY(2); // This connects the bar lines between two different staves.
//			if (staff.bottom < 0)
//				renderer.moveY(ABCJS.write.spacing.STEP, -staff.bottom);
		}
	}
	renderer.measureNumber = null;

	// connect all the staves together with a vertical line
	if (this.staffs.length>1) {
		renderer.printStem(this.startx, 0.6, topLine, bottomLine);
	}
	renderer.y = startY;
};

//    abc_tempo_element.js: Definition of the TempoElement class.
//    Copyright (C) 2014 Gregory Dyke (gregdyke at gmail dot com) and Paul Rosen
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.

/*globals ABCJS */

if (!window.ABCJS)
	window.ABCJS = {};

if (!window.ABCJS.write)
	window.ABCJS.write = {};

(function() {
	"use strict";
	var totalHeightInPitches = 5;

	ABCJS.write.TempoElement = function(tempo) {
		this.tempo = tempo;
		this.tempoHeightAbove = totalHeightInPitches;
		this.pitch = undefined; // This will be set later
	};

	ABCJS.write.TempoElement.prototype.setUpperAndLowerElements = function(positionY) { // TODO-PER: This might not be called.
		this.pitch = positionY.tempoHeightAbove;
	};

	ABCJS.write.TempoElement.prototype.setX = function (x) {
		this.x = x;
	};

	ABCJS.write.TempoElement.prototype.draw = function(renderer) {
		var x = this.x;
		if (this.pitch === undefined)
			window.console.error("Tempo Element y-coordinate not set.");

		var y = renderer.calcY(this.pitch);
		var text;
		if (this.tempo.preString) {
			text = renderer.renderText(x, y, this.tempo.preString, 'tempofont', 'tempo', "start");
			var preWidth = text.getBBox().width;
			var charWidth = preWidth / this.tempo.preString.length; // Just get some average number to increase the spacing.
			x += preWidth + charWidth;
		}
		if (this.tempo.duration) {
			var temposcale = 0.75;
			var tempopitch = this.pitch - totalHeightInPitches + 1; // The pitch we receive is the top of the allotted area: change that to practically the bottom.
			var duration = this.tempo.duration[0]; // TODO when multiple durations
			var abselem = new ABCJS.write.AbsoluteElement(this.tempo, duration, 1, 'tempo');
			var durlog = Math.floor(Math.log(duration) / Math.log(2));
			var dot = 0;
			for (var tot = Math.pow(2, durlog), inc = tot / 2; tot < duration; dot++, tot += inc, inc /= 2);
			var c = renderer.engraver.chartable.note[-durlog];
			var flag = renderer.engraver.chartable.uflags[-durlog];
			var temponote = renderer.engraver.createNoteHead(abselem, // TODO-PER: This seems late to be creating this element. Shouldn't it happen before draw?
				c,
				{verticalPos: tempopitch},
				"up",
				0,
				0,
				flag,
				dot,
				0,
				temposcale
			);
			abselem.addHead(temponote);
			var stem;
			if (duration < 1) {
				var p1 = tempopitch + 1 / 3 * temposcale;
				var p2 = tempopitch + 7 * temposcale;
				var dx = temponote.dx + temponote.w;
				var width = -0.6;
				stem = new ABCJS.write.RelativeElement(null, dx, 0, p1, {"type": "stem", "pitch2": p2, linewidth: width});
				stem.setX(x);
				abselem.addExtra(stem);
			}
			abselem.x = x;
			temponote.setX(x);
			temponote.draw(renderer, x);
			if (stem)
				stem.draw(renderer, x);
			x += (abselem.w + 5);
			var str = "= " + this.tempo.bpm;
			text = renderer.renderText(x, y, str, 'tempofont', 'tempo', "start");
			var postWidth = text.getBBox().width;
			var charWidth2 = postWidth / str.length; // Just get some average number to increase the spacing.
			x += postWidth + charWidth2;
		}
		if (this.tempo.postString) {
			renderer.renderText(x, y, this.tempo.postString, 'tempofont', 'tempo', "start");
		}
	};
})();
//    abc_tie_element.js: Definition of the TieElement class.
//    Copyright (C) 2010,2014 Gregory Dyke (gregdyke at gmail dot com) and Paul Rosen
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.

/*globals ABCJS */

if (!window.ABCJS)
	window.ABCJS = {};

if (!window.ABCJS.write)
	window.ABCJS.write = {};

ABCJS.write.TieElem = function(anchor1, anchor2, above, forceandshift, isTie) {
	this.anchor1 = anchor1; // must have a .x and a .pitch, and a .parent property or be null (means starts at the "beginning" of the line - after keysig)
	this.anchor2 = anchor2; // must have a .x and a .pitch property or be null (means ends at the end of the line)
	this.above = above; // true if the arc curves above
	this.force = forceandshift; // force the arc curve, regardless of beaming if true
	this.isTie = isTie;
};

ABCJS.write.TieElem.prototype.setEndAnchor = function(anchor2) {
	this.anchor2 = anchor2; // must have a .x and a .pitch property or be null (means ends at the end of the line)
};

// If we encounter a repeat sign, then we don't want to extend either a tie or a slur past it, so these are called to be a limit.
ABCJS.write.TieElem.prototype.setStartX = function(startLimitElem) {
	this.startLimitX = startLimitElem;
};

ABCJS.write.TieElem.prototype.setEndX = function(endLimitElem) {
	this.endLimitX = endLimitElem;
};

ABCJS.write.TieElem.prototype.setUpperAndLowerElements = function(positionY) {
	// Doesn't depend on the highest and lowest, so there's nothing to do here.
};

ABCJS.write.TieElem.prototype.layout = function (lineStartX, lineEndX) {
	function getPitch(anchor, isAbove, isTie) {
		if (isTie) {
			// Always go to the note
			return anchor.pitch;
		}
		if (isAbove && anchor.highestVert !== undefined)
			return anchor.highestVert;
		return anchor.pitch;
	}
	// We now have all of the input variables set, so we can figure out the start and ending x,y coordinates, and finalize the direction of the arc.

	// PER: We might have to override the natural slur direction if the first and last notes are not in the
	// same direction. We always put the slur up in this case. The one case that works out wrong is that we always
	// want the slur to be up when the last note is stem down. We can tell the stem direction if the top is
	// equal to the pitch: if so, there is no stem above it.
	if (!this.force && this.anchor2 && this.anchor2.pitch === this.anchor2.highestVert) // TODO-PER: this is a fragile way to detect that there is no stem going up on this note.
		this.above = true;

	if (this.anchor1)
		this.startX = this.anchor1.x; // The normal case where there is a starting element to attach to.
	else if (this.startLimitX)
		this.startX = this.startLimitX.x+this.startLimitX.w; // if there is no start element, but there is a repeat mark before the start of the line.
	else
		this.startX = lineStartX; // There is no element and no repeat mark: extend to the beginning of the line.

	if (this.anchor2)
		this.endX = this.anchor2.x; // The normal case where there is a starting element to attach to.
	else if (this.endLimitX)
		this.endX = this.endLimitX.x; // if there is no start element, but there is a repeat mark before the start of the line.
	else
		this.endX = lineEndX; // There is no element and no repeat mark: extend to the beginning of the line.

	// For the pitches, if one of the anchors is present, both of the pitches are that anchor. If both are present, then we use both. If neither is present, we use the top of the staff.
	if (this.anchor1 && this.anchor2) {
		this.startY = getPitch(this.anchor1, this.above, this.isTie);
		this.endY = getPitch(this.anchor2, this.above, this.isTie);
	} else if (this.anchor1) {
		this.startY = getPitch(this.anchor1, this.above, this.isTie);
		this.endY = getPitch(this.anchor1, this.above, this.isTie);
	} else if (this.anchor2) {
		this.startY = getPitch(this.anchor2, this.above, this.isTie);
		this.endY = getPitch(this.anchor2, this.above, this.isTie);
	} else {
		// This is the case where the slur covers the entire line.
		// TODO-PER: figure out where the real top and bottom of the line are.
		this.startY = this.above ? 14 : 0;
		this.endY = this.above ? 14 : 0;
	}
};

ABCJS.write.TieElem.prototype.draw = function (renderer, linestartx, lineendx) {
	this.layout(linestartx, lineendx);

	renderer.drawArc(this.startX, this.endX, this.startY, this.endY,  this.above);

};
//    abc_triplet_element.js: Definition of the TripletElem class.
//    Copyright (C) 2010,2014 Gregory Dyke (gregdyke at gmail dot com) and Paul Rosen
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.

/*globals ABCJS */

if (!window.ABCJS)
	window.ABCJS = {};

if (!window.ABCJS.write)
	window.ABCJS.write = {};

(function() {
	"use strict";

	ABCJS.write.TripletElem = function(number, anchor1) {
		this.anchor1 = anchor1; // must have a .x and a .parent property or be null (means starts at the "beginning" of the line - after keysig)
		this.number = number;
	};

	ABCJS.write.TripletElem.prototype.setCloseAnchor = function(anchor2) {
		this.anchor2 = anchor2;
	};

	ABCJS.write.TripletElem.prototype.setUpperAndLowerElements = function(/*positionY*/) {
	};

	ABCJS.write.TripletElem.prototype.draw = function(renderer) {
		// TODO end and beginning of line (PER: P.S. I'm not sure this can happen: I think the parser will always specify both the start and end points.)
		if (this.anchor1 && this.anchor2) {
			var xTextPos;
			var yTextPos;
			var hasBeam = this.anchor1.parent.beam && this.anchor1.parent.beam === this.anchor2.parent.beam;

			if (hasBeam) {
				// If there is a beam then we don't need to draw anything except the text. The beam could either be above or below.
				var beam = this.anchor1.parent.beam;
				var left = beam.isAbove() ? this.anchor1.x + this.anchor1.w : this.anchor1.x;
				xTextPos = beam.xAtMidpoint(left,  this.anchor2.x);
				yTextPos = beam.heightAtMidpoint(left,  this.anchor2.x);
				yTextPos += beam.isAbove() ? 4 : -4; // This creates some space between the beam and the number.
			} else {
				// If there isn't a beam, then we need to draw the bracket and the text. The bracket is always above.
				// The bracket is never lower than the 'a' line, but is 4 pitches above the first and last notes. If there is
				// a tall note in the middle, the bracket is horizontal and above the highest note.
				var startNote = Math.max(this.anchor1.parent.top, 9) + 4;
				var endNote = Math.max(this.anchor2.parent.top, 9) + 4;
				// TODO-PER: Do the case where the middle note is really high.
				xTextPos = this.anchor1.x + (this.anchor2.x + this.anchor2.w - this.anchor1.x) / 2;
				yTextPos = startNote + (endNote - startNote) / 2;
				drawBracket(renderer, this.anchor1.x, startNote, this.anchor2.x + this.anchor2.w, endNote);
			}

			renderer.renderText(xTextPos, renderer.calcY(yTextPos), "" + this.number, 'tripletfont', "triplet", "middle", true);
		}
	};

	function drawLine(renderer, l, t, r, b) {
		var pathString = ABCJS.write.sprintf("M %f %f L %f %f",
			l, t, r, b);
		renderer.printPath({path: pathString, stroke: "#000000", 'class': renderer.addClasses('triplet')});
	}

	function drawBracket(renderer, x1, y1, x2, y2) {
		y1 = renderer.calcY(y1);
		y2 = renderer.calcY(y2);
		var bracketHeight = 5;

		// Draw vertical lines at the beginning and end
		drawLine(renderer, x1, y1, x1, y1 + bracketHeight);
		drawLine(renderer, x2, y2, x2, y2 + bracketHeight);

		// figure out midpoints to draw the broken line.
		var midX = x1 + (x2-x1)/2;
		var midY = y1 + (y2-y1)/2;
		var gapWidth = 8;
		var slope = (y2 - y1) / (x2 - x1);
		var leftEndX = midX - gapWidth;
		var leftEndY = y1 + (leftEndX - x1) * slope;
		drawLine(renderer, x1, y1, leftEndX, leftEndY);
		var rightStartX = midX + gapWidth;
		var rightStartY = y1 + (rightStartX - x1) * slope;
		drawLine(renderer, rightStartX, rightStartY, x2, y2);
	}
})();

//    abc_voice_element.js: Definition of the VoiceElement class.
//    Copyright (C) 2010,2014 Gregory Dyke (gregdyke at gmail dot com) and Paul Rosen
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.

/*globals ABCJS */

if (!window.ABCJS)
	window.ABCJS = {};

if (!window.ABCJS.write)
	window.ABCJS.write = {};

ABCJS.write.VoiceElement = function(voicenumber, voicetotal) {
	this.children = [];
	this.beams = [];
	this.otherchildren = []; // ties, slurs, triplets
	this.w = 0;
	this.duplicate = false;
	this.voicenumber = voicenumber; //number of the voice on a given stave (not staffgroup)
	this.voicetotal = voicetotal;
	this.bottom = 7;
	this.top = 7;
	this.specialY = {
		tempoHeightAbove: 0,
		partHeightAbove: 0,
		volumeHeightAbove: 0,
		dynamicHeightAbove: 0,
		endingHeightAbove: 0,
		chordHeightAbove: 0,
		lyricHeightAbove: 0,

		lyricHeightBelow: 0,
		chordHeightBelow: 0,
		volumeHeightBelow: 0,
		dynamicHeightBelow: 0
	};
};

ABCJS.write.VoiceElement.prototype.addChild = function (child) {
	if (child.type === 'bar') {
		var firstItem = true;
		for (var i = 0; firstItem && i < this.children.length; i++) {
			if (this.children[i].type !== "staff-extra")
				firstItem = false;
		}
		if (!firstItem) {
			this.beams.push("bar");
			this.otherchildren.push("bar");
		}
	}
	this.children[this.children.length] = child;
	this.setRange(child);
};

ABCJS.write.VoiceElement.prototype.setLimit = function(member, child) {
	// Sometimes we get an absolute element in here and sometimes we get some type of relative element.
	// If there is a "specialY" element, then assume it is an absolute element. If that doesn't exist, look for the
	// same members at the top level, because that's where they are in relative elements.
	var specialY = child.specialY;
	if (!specialY) specialY = child;
	if (!specialY[member]) return;
	if (!this.specialY[member])
		this.specialY[member] = specialY[member];
	else
		this.specialY[member] = Math.max(this.specialY[member], specialY[member]);
};

ABCJS.write.VoiceElement.prototype.moveDecorations = function(beam) {
	var padding = 1.5; // This is the vertical padding between elements, in pitches.
	for (var ch = 0; ch < beam.elems.length; ch++) {
		var child = beam.elems[ch];
		if (child.top) {
			// We now know where the ornaments should have been placed, so move them if they would overlap.
			var top = beam.yAtNote(child);
			for (var i = 0; i < child.children.length; i++) {
				var el = child.children[i];
				if (el.klass === 'ornament') {
					if (el.bottom - padding < top) {
						var distance = top - el.bottom + padding; // Find the distance that it needs to move and add a little margin so the element doesn't touch the beam.
						el.bottom += distance;
						el.top += distance;
						el.pitch += distance;
						top = child.top = el.top;
					}
				}
			}
		}
	}
};

ABCJS.write.VoiceElement.prototype.adjustRange = function(child) {
	if (child.bottom !== undefined)
		this.bottom = Math.min(this.bottom, child.bottom);
	if (child.top !== undefined)
		this.top = Math.max(this.top, child.top);
};

ABCJS.write.VoiceElement.prototype.setRange = function(child) {
	this.adjustRange(child);
	this.setLimit('tempoHeightAbove', child);
	this.setLimit('partHeightAbove', child);
	this.setLimit('volumeHeightAbove', child);
	this.setLimit('dynamicHeightAbove', child);
	this.setLimit('endingHeightAbove', child);
	this.setLimit('chordHeightAbove', child);
	this.setLimit('lyricHeightAbove', child);
	this.setLimit('lyricHeightBelow', child);
	this.setLimit('chordHeightBelow', child);
	this.setLimit('volumeHeightBelow', child);
	this.setLimit('dynamicHeightBelow', child);
};

ABCJS.write.VoiceElement.prototype.setUpperAndLowerElements = function(positionY) {
	var i;
	for (i = 0; i < this.children.length; i++) {
		var abselem = this.children[i];
		abselem.setUpperAndLowerElements(positionY);
	}
	for (i = 0; i < this.otherchildren.length; i++) {
		var abselem = this.otherchildren[i];
		if (typeof abselem !== 'string')
			abselem.setUpperAndLowerElements(positionY);
	}
};

ABCJS.write.VoiceElement.prototype.addOther = function (child) {
	if (child instanceof ABCJS.write.BeamElem) {
		this.beams.push(child);
	} else {
		this.otherchildren.push(child);
		this.setRange(child);
	}
};

ABCJS.write.VoiceElement.prototype.updateIndices = function () {
	if (!this.layoutEnded()) {
		this.durationindex += this.children[this.i].duration;
		if (this.children[this.i].duration===0) this.durationindex = Math.round(this.durationindex*64)/64; // everytime we meet a barline, do rounding to nearest 64th
		this.i++;
	}
};

ABCJS.write.VoiceElement.prototype.layoutEnded = function () {
	return (this.i>=this.children.length);
};

ABCJS.write.VoiceElement.prototype.getDurationIndex = function () {
	return this.durationindex - (this.children[this.i] && (this.children[this.i].duration>0)?0:0.0000005); // if the ith element doesn't have a duration (is not a note), its duration index is fractionally before. This enables CLEF KEYSIG TIMESIG PART, etc. to be laid out before we get to the first note of other voices
};

// number of spacing units expected for next positioning
ABCJS.write.VoiceElement.prototype.getSpacingUnits = function () {
	return Math.sqrt(this.spacingduration*8);
	// TODO-PER: On short lines, this would never trigger, so the spacing was wrong. I just changed this line empirically, though, so I don't know if there are other ramifications.
	//return (this.minx<this.nextx) ? Math.sqrt(this.spacingduration*8) : 0; // we haven't used any spacing units if we end up using minx
};

//
ABCJS.write.VoiceElement.prototype.getNextX = function () {
	return Math.max(this.minx, this.nextx);
};

ABCJS.write.VoiceElement.prototype.beginLayout = function (startx) {
	this.i=0;
	this.durationindex=0;
	//this.ii=this.children.length;
	this.startx=startx;
	this.minx=startx; // furthest left to where negatively positioned elements are allowed to go
	this.nextx=startx; // x position where the next element of this voice should be placed assuming no other voices and no fixed width constraints
	this.spacingduration=0; // duration left to be laid out in current iteration (omitting additional spacing due to other aspects, such as bars, dots, sharps and flats)
};

// Try to layout the element at index this.i
// x - position to try to layout the element at
// spacing - base spacing
// can't call this function more than once per iteration
ABCJS.write.VoiceElement.prototype.layoutOneItem = function (x, spacing) {
	var child = this.children[this.i];
	if (!child) return 0;
	var er = x - this.minx; // available extrawidth to the left
	if (er<child.getExtraWidth()) { // shift right by needed amount
		x+=child.getExtraWidth()-er;
	}
	child.setX(x);

	this.spacingduration = child.duration;
	//update minx
	this.minx = x+child.getMinWidth(); // add necessary layout space
	if (this.i!==this.children.length-1) this.minx+=child.minspacing; // add minimumspacing except on last elem

	this.updateNextX(x, spacing);

	// contribute to staff y position
	//this.staff.top = Math.max(child.top,this.staff.top);
	//this.staff.bottom = Math.min(child.bottom,this.staff.bottom);

	return x; // where we end up having placed the child
};

// call when spacingduration has been updated
ABCJS.write.VoiceElement.prototype.updateNextX = function (x, spacing) {
	this.nextx= x + (spacing*Math.sqrt(this.spacingduration*8));
};

ABCJS.write.VoiceElement.prototype.shiftRight = function (dx) {
	var child = this.children[this.i];
	if (!child) return;
	child.setX(child.x+dx);
	this.minx+=dx;
	this.nextx+=dx;
};

ABCJS.write.VoiceElement.prototype.draw = function (renderer, bartop) {
	var width = this.w-1;
	renderer.staffbottom = this.staff.bottom;
	//this.barbottom = renderer.calcY(2);

	renderer.measureNumber = null;
	if (this.header) { // print voice name
		var textpitch = 14 - (this.voicenumber+1)*(12/(this.voicetotal+1));
		renderer.renderText(renderer.padding.left, renderer.calcY(textpitch), this.header, 'voicefont', 'staff-extra voice-name', 'start');
	}

	for (var i=0, ii=this.children.length; i<ii; i++) {
		var child = this.children[i];
		var justInitializedMeasureNumber = false;
		if (child.type !== 'staff-extra' && renderer.measureNumber === null) {
			renderer.measureNumber = 0;
			justInitializedMeasureNumber = true;
		}
		child.draw(renderer, (this.barto || i===ii-1)?bartop:0);
		if (child.type === 'bar' && !justInitializedMeasureNumber)
			renderer.measureNumber++;
	}

	renderer.measureNumber = 0;
	window.ABCJS.parse.each(this.beams, function(beam) {
		if (beam === 'bar')
			renderer.measureNumber++;
		else
			beam.draw(renderer); // beams must be drawn first for proper printing of triplets, slurs and ties.
	});

	renderer.measureNumber = 0;
	var self = this;
	window.ABCJS.parse.each(this.otherchildren, function(child) {
		if (child === 'bar')
			renderer.measureNumber++;
		else
			child.draw(renderer,self.startx+10,width);
	});

};

ABCJS.write.VoiceElement.prototype.layoutBeams = function() {
	for (var i = 0; i < this.beams.length; i++) {
		if (this.beams[i].layout) {
			this.beams[i].layout();
			this.moveDecorations(this.beams[i]);
			// The above will change the top and bottom of the abselem children, so see if we need to expand our range.
			for (var j = 0; j < this.beams[i].elems.length; j++) {
				this.adjustRange(this.beams[i].elems[j]);
			}
		}
	}
	this.staff.top = Math.max(this.staff.top, this.top);
	this.staff.bottom = Math.min(this.staff.bottom, this.bottom);
};
/**
 * sprintf() for JavaScript v.0.4
 *
 * Copyright (c) 2007 Alexandru Marasteanu <http://alexei.417.ro/>
 * Thanks to David Baird (unit test and patch).
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation; either version 2 of the License, or (at your option) any later
 * version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program; if not, write to the Free Software Foundation, Inc., 59 Temple
 * Place, Suite 330, Boston, MA 02111-1307 USA
 */

//function str_repeat(i, m) { for (var o = []; m > 0; o[--m] = i); return(o.join('')); }

if (!window.ABCJS)
	window.ABCJS = {};

if (!window.ABCJS.write)
	window.ABCJS.write = {};

ABCJS.write.sprintf = function() {
  var i = 0, a, f = arguments[i++], o = [], m, p, c, x;
  while (f) {
    if (m = /^[^\x25]+/.exec(f)) o.push(m[0]);
    else if (m = /^\x25{2}/.exec(f)) o.push('%');
    else if (m = /^\x25(?:(\d+)\$)?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(f)) {
      if (((a = arguments[m[1] || i++]) == null) || (a == undefined)) throw("Too few arguments.");
      if (/[^s]/.test(m[7]) && (typeof(a) != 'number'))
        throw("Expecting number but found " + typeof(a));
      switch (m[7]) {
        case 'b': a = a.toString(2); break;
        case 'c': a = String.fromCharCode(a); break;
        case 'd': a = parseInt(a); break;
        case 'e': a = m[6] ? a.toExponential(m[6]) : a.toExponential(); break;
        case 'f': a = m[6] ? parseFloat(a).toFixed(m[6]) : parseFloat(a); break;
        case 'o': a = a.toString(8); break;
        case 's': a = ((a = String(a)) && m[6] ? a.substring(0, m[6]) : a); break;
        case 'u': a = Math.abs(a); break;
        case 'x': a = a.toString(16); break;
        case 'X': a = a.toString(16).toUpperCase(); break;
      }
      a = (/[def]/.test(m[7]) && m[2] && a > 0 ? '+' + a : a);
      c = m[3] ? m[3] == '0' ? '0' : m[3].charAt(1) : ' ';
      x = m[5] - String(a).length;
      p = m[5] ? str_repeat(c, x) : '';
      o.push(m[4] ? a + p : p + a);
    }
    else throw ("Huh ?!");
    f = f.substring(m[0].length);
  }
  return o.join('');
};
// abc_editor.js
// window.ABCJS.Editor is the interface class for the area that contains the ABC text. It is responsible for
// holding the text of the tune and calling the parser and the rendering engines.
//
// EditArea is an example of using a textarea as the control that is shown to the user. As long as
// the same interface is used, window.ABCJS.Editor can use a different type of object.
//
// EditArea:
// - constructor(textareaid)
//		This contains the id of a textarea control that will be used.
// - addSelectionListener(listener)
//		A callback class that contains the entry point fireSelectionChanged()
// - addChangeListener(listener)
//		A callback class that contains the entry point fireChanged()
// - getSelection()
//		returns the object { start: , end: } with the current selection in characters
// - setSelection(start, end)
//		start and end are the character positions that should be selected.
// - getString()
//		returns the ABC text that is currently displayed.
// - setString(str)
//		sets the ABC text that is currently displayed, and resets the initialText variable
// - getElem()
//		returns the textarea element
// - string initialText
//		Contains the starting text. This can be compared against the current text to see if anything changed.
//

/*global document, window, clearTimeout, setTimeout */
/*global Raphael */

if (!window.ABCJS)
	window.ABCJS = {};

if (!window.ABCJS.edit)
	window.ABCJS.edit = {};

window.ABCJS.edit.EditArea = function(textareaid) {
  this.textarea = document.getElementById(textareaid);
  this.initialText = this.textarea.value;
  this.isDragging = false;
}

window.ABCJS.edit.EditArea.prototype.addSelectionListener = function(listener) {
  this.textarea.onmousemove = function(ev) {
	  if (this.isDragging)
	    listener.fireSelectionChanged();
  };
};

window.ABCJS.edit.EditArea.prototype.addChangeListener = function(listener) {
  this.changelistener = listener;
  this.textarea.onkeyup = function() {
    listener.fireChanged();
  };
  this.textarea.onmousedown = function() {
	this.isDragging = true;
    listener.fireSelectionChanged();
  };
  this.textarea.onmouseup = function() {
	this.isDragging = false;
    listener.fireChanged();
  };
  this.textarea.onchange = function() {
    listener.fireChanged();
  };
};

//TODO won't work under IE?
window.ABCJS.edit.EditArea.prototype.getSelection = function() {
  return {start: this.textarea.selectionStart, end: this.textarea.selectionEnd};
};

window.ABCJS.edit.EditArea.prototype.setSelection = function(start, end) {
	if(this.textarea.setSelectionRange)
	   this.textarea.setSelectionRange(start, end);
	else if(this.textarea.createTextRange) {
		// For IE8
	   var e = this.textarea.createTextRange();
	   e.collapse(true);
	   e.moveEnd('character', end);
	   e.moveStart('character', start);
	   e.select();
	}
  this.textarea.focus();
};

window.ABCJS.edit.EditArea.prototype.getString = function() {
  return this.textarea.value;
};

window.ABCJS.edit.EditArea.prototype.setString = function(str) {
  this.textarea.value = str;
  this.initialText = this.getString();
  if (this.changelistener) {
    this.changelistener.fireChanged();
  }
};

window.ABCJS.edit.EditArea.prototype.getElem = function() {
  return this.textarea;
};

//
// window.ABCJS.Editor:
//
// constructor(editarea, params)
//		if editarea is a string, then it is an HTML id of a textarea control.
//		Otherwise, it should be an instantiation of an object that expresses the EditArea interface.
//
//		params is a hash of:
//		canvas_id: or paper_id: HTML id to draw in. If not present, then the drawing happens just below the editor.
//		generate_midi: if present, then midi is generated.
//		midi_id: if present, the HTML id to place the midi control. Otherwise it is placed in the same div as the paper.
//		generate_warnings: if present, then parser warnings are displayed on the page.
//		warnings_id: if present, the HTML id to place the warnings. Otherwise they are placed in the same div as the paper.
//		onchange: if present, the callback function to call whenever there has been a change.
//		gui: if present, the paper can send changes back to the editor (presumably because the user changed something directly.)
//		parser_options: options to send to the parser engine.
//		midi_options: options to send to the midi engine.
//		render_options: options to send to the render engine.
//		indicate_changed: the dirty flag is set if this is true.
//
// - setReadOnly(bool)
//		adds or removes the class abc_textarea_readonly, and adds or removes the attribute readonly=yes
// - setDirtyStyle(bool)
//		adds or removes the class abc_textarea_dirty
// - renderTune(abc, parserparams, div)
//		Immediately renders the tune. (Useful for creating the SVG output behind the scenes, if div is hidden)
//		string abc: the ABC text
//		parserparams: params to send to the parser
//		div: the HTML id to render to.
// - modelChanged()
//		Called when the model has been changed to trigger re-rendering
// - parseABC()
//		Called internally by fireChanged()
//		returns true if there has been a change since last call.
// - updateSelection()
//		Called when the user has changed the selection. This calls the engraver_controller to show the selection.
// - fireSelectionChanged()
//		Called by the textarea object when the user has changed the selection.
// - paramChanged(engraverparams)
//		Called to signal that the engraver params have changed, so re-rendering should occur.
// - fireChanged()
//		Called by the textarea object when the user has changed something.
// - setNotDirty()
//		Called by the client app to reset the dirty flag
// - isDirty()
//		Returns true or false, whether the textarea contains the same text that it started with.
// - highlight(abcelem)
//		Called by the engraver_controller to highlight an area.
// - pause(bool)
//		Stops the automatic rendering when the user is typing.
//

window.ABCJS.Editor = function(editarea, params) {
	if (params.indicate_changed)
		this.indicate_changed = true;
  if (typeof editarea === "string") {
    this.editarea = new window.ABCJS.edit.EditArea(editarea);
  } else {
    this.editarea = editarea;
  }
  this.editarea.addSelectionListener(this);
  this.editarea.addChangeListener(this);

  if (params.canvas_id) {
    this.div = document.getElementById(params.canvas_id);
  } else if (params.paper_id) {
    this.div = document.getElementById(params.paper_id);
  } else {
    this.div = document.createElement("DIV");
    this.editarea.getElem().parentNode.insertBefore(this.div, this.editarea.getElem());
  }
  
  if (params.generate_midi || params.midi_id) {
    if (params.midi_id) {
      this.mididiv = document.getElementById(params.midi_id);
    } else {
      this.mididiv = this.div;
    }
  }
  
  if (params.generate_warnings || params.warnings_id) {
    if (params.warnings_id) {
      this.warningsdiv = document.getElementById(params.warnings_id);
    } else {
      this.warningsdiv = this.div;
    }
  }
  
  this.parserparams = params.parser_options || {};
  this.midiparams = params.midi_options || {};
  this.onchangeCallback = params.onchange;

  this.engraverparams = params.render_options || {};
  
  if (params.gui) {
    this.target = document.getElementById(editarea);
    this.engraverparams.editable = true;
  } 
  this.oldt = "";
  this.bReentry = false;
  this.parseABC();
  this.modelChanged();

  this.addClassName = function(element, className) {
    var hasClassName = function(element, className) {
      var elementClassName = element.className;
      return (elementClassName.length > 0 && (elementClassName === className ||
        new RegExp("(^|\\s)" + className + "(\\s|$)").test(elementClassName)));
    };

    if (!hasClassName(element, className))
      element.className += (element.className ? ' ' : '') + className;
    return element;
  };

  this.removeClassName = function(element, className) {
    element.className = window.ABCJS.parse.strip(element.className.replace(
      new RegExp("(^|\\s+)" + className + "(\\s+|$)"), ' '));
    return element;
  };

  this.setReadOnly = function(readOnly) {
	  var readonlyClass = 'abc_textarea_readonly';
	  var el = this.editarea.getElem();
    if (readOnly) {
      el.setAttribute('readonly', 'yes');
	  this.addClassName(el, readonlyClass);
	} else {
      el.removeAttribute('readonly');
	  this.removeClassName(el, readonlyClass);
    }
  };
};

window.ABCJS.Editor.prototype.renderTune = function(abc, params, div) {
  var tunebook = new ABCJS.TuneBook(abc);
  var abcParser = window.ABCJS.parse.Parse();
  abcParser.parse(tunebook.tunes[0].abc, params); //TODO handle multiple tunes
  var tune = abcParser.getTune();
  var paper = Raphael(div, 800, 400);
  var engraver_controller = new ABCJS.write.EngraverController(paper, this.engraverparams);
  engraver_controller.engraveABC(tune);
};

window.ABCJS.Editor.prototype.modelChanged = function() {
  if (this.tunes === undefined) {
    if (this.mididiv !== undefined && this.mididiv !== this.div)
		this.mididiv.innerHTML = "";
    this.div.innerHTML = "";
	return;
  }

  if (this.bReentry)
    return; // TODO is this likely? maybe, if we rewrite abc immediately w/ abc2abc
  this.bReentry = true;
  this.timerId = null;
  this.div.innerHTML = "";
  var paper = Raphael(this.div, 800, 400);
  this.engraver_controller = new ABCJS.write.EngraverController(paper, this.engraverparams);
  this.engraver_controller.engraveABC(this.tunes);
	this.tunes[0].engraver = this.engraver_controller;	// TODO-PER: We actually want an output object for each tune, not the entire controller. When refactoring, don't save data in the controller.
  if (ABCJS.midi.MidiWriter && this.mididiv) {
    if (this.mididiv !== this.div)
		this.mididiv.innerHTML = "";
    var midiwriter = new ABCJS.midi.MidiWriter(this.mididiv,this.midiparams);
    midiwriter.addListener(this.engraver_controller);
    midiwriter.writeABC(this.tunes[0]); //TODO handle multiple tunes
  }
  if (this.warningsdiv) {
    this.warningsdiv.innerHTML = (this.warnings) ? this.warnings.join("<br />") : "No errors";
  } 
  if (this.target) {
    var textprinter = new window.ABCJS.transform.TextPrinter(this.target, true);
    textprinter.printABC(this.tunes[0]); //TODO handle multiple tunes
  }
  this.engraver_controller.addSelectListener(this);
  this.updateSelection();
  this.bReentry = false;
};

// Call this to reparse in response to the printing parameters changing
window.ABCJS.Editor.prototype.paramChanged = function(engraverparams) {
	this.engraverparams = engraverparams;
	this.oldt = "";
	this.fireChanged();
};

// return true if the model has changed
window.ABCJS.Editor.prototype.parseABC = function() {
  var t = this.editarea.getString();
  if (t===this.oldt) {
    this.updateSelection();
    return false;
  }
  
  this.oldt = t;
  if (t === "") {
	this.tunes = undefined;
	this.warnings = "";
	return true;
  }
  var tunebook = new ABCJS.TuneBook(t);
  
  this.tunes = [];
  this.warnings = [];
  for (var i=0; i<tunebook.tunes.length; i++) {
    var abcParser = new window.ABCJS.parse.Parse();
    abcParser.parse(tunebook.tunes[i].abc, this.parserparams); //TODO handle multiple tunes
    this.tunes[i] = abcParser.getTune();
    var warnings = abcParser.getWarnings() || [];
    for (var j=0; j<warnings.length; j++) {
      this.warnings.push(warnings[j]);
    }
  }
  return true;
};

window.ABCJS.Editor.prototype.updateSelection = function() {
  var selection = this.editarea.getSelection();
  try {
    this.engraver_controller.rangeHighlight(selection.start, selection.end);
  } catch (e) {} // maybe printer isn't defined yet?
};

window.ABCJS.Editor.prototype.fireSelectionChanged = function() {
  this.updateSelection();
};

window.ABCJS.Editor.prototype.setDirtyStyle = function(isDirty) {
	if (this.indicate_changed === undefined)
		return;
  var addClassName = function(element, className) {
    var hasClassName = function(element, className) {
      var elementClassName = element.className;
      return (elementClassName.length > 0 && (elementClassName === className ||
        new RegExp("(^|\\s)" + className + "(\\s|$)").test(elementClassName)));
    };

    if (!hasClassName(element, className))
      element.className += (element.className ? ' ' : '') + className;
    return element;
  };

  var removeClassName = function(element, className) {
    element.className = window.ABCJS.parse.strip(element.className.replace(
      new RegExp("(^|\\s+)" + className + "(\\s+|$)"), ' '));
    return element;
  };
  
	var readonlyClass = 'abc_textarea_dirty';
	var el = this.editarea.getElem();
	if (isDirty) {
		addClassName(el, readonlyClass);
	} else {
		removeClassName(el, readonlyClass);
    }
};

// call when abc text is changed and needs re-parsing
window.ABCJS.Editor.prototype.fireChanged = function() {
  if (this.bIsPaused)
    return;
  if (this.parseABC()) {
    var self = this;
    if (this.timerId)	// If the user is still typing, cancel the update
      clearTimeout(this.timerId);
    this.timerId = setTimeout(function () {
      self.modelChanged();
    }, 300);	// Is this a good comprimise between responsiveness and not redrawing too much?  
	  var isDirty = this.isDirty();
	  if (this.wasDirty !== isDirty) {
		  this.wasDirty = isDirty;
		  this.setDirtyStyle(isDirty);
	  }
	  if (this.onchangeCallback)
		  this.onchangeCallback(this);
	  }
};

window.ABCJS.Editor.prototype.setNotDirty = function() {
	this.editarea.initialText = this.editarea.getString();
	this.wasDirty = false;
	this.setDirtyStyle(false);
};

window.ABCJS.Editor.prototype.isDirty = function() {
	if (this.indicate_changed === undefined)
		return false;
	return this.editarea.initialText !== this.editarea.getString();
};

window.ABCJS.Editor.prototype.highlight = function(abcelem) {
  this.editarea.setSelection(abcelem.startChar, abcelem.endChar);
};

window.ABCJS.Editor.prototype.pause = function(shouldPause) {
	this.bIsPaused = shouldPause;
	if (!shouldPause)
		this.fireChanged();
};

window.ABCJS.Editor.prototype.pauseMidi = function(shouldPause) {
	if (shouldPause && this.mididiv) {
		this.mididivSave = this.mididiv;
		this.addClassName(this.mididiv, 'hidden');
		this.mididiv = null;
	} else if (!shouldPause && this.mididivSave) {
		this.mididiv = this.mididivSave;
		this.removeClassName(this.mididiv, 'hidden');
		this.mididivSave = null;
	}
};
