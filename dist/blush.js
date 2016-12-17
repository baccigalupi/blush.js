(function(global) {
    'use strict';
    var Blush = {};
    Blush.polyfills = {};
    Blush.utils = {};

    Blush.polyfills.arrayForEach = function arrayForEach(iterator) {
        var length = this.length;
        var i, element;
        for (i = 0; i < length; i++) {
            element = this[i];
            iterator(element, i, this);
        }
    };

    Array.prototype.forEach = Array.prototype.forEach || Blush.polyfills.arrayForEach;

    Blush.polyfills.objectAssign = function() {
        var target = arguments[0];
        var current, key, argumentIndex;

        for (argumentIndex = 1; argumentIndex < arguments.length; argumentIndex++) {
            current = arguments[argumentIndex];
            for (key in current) {
                if (current.hasOwnProperty(key)) {
                    target[key] = current[key];
                }
            }
        }

        return target;
    };

    Object.assign = Object.assign || Blush.polyfills.objectAssign;

    Blush.createConstructor = function() {
        var klass = function klass() {
            if (!(this instanceof klass)) {
                throw new Error('This is a class, and cannot be called without the new keyword.');
            }
            this._initialize.apply(this, arguments);
        };
        return klass;
    };

    Blush.BaseClass = Blush.createConstructor();

    Blush.BaseClass.prototype._initialize = function() {
        this.initialize.apply(this, arguments);
    };

    Blush.BaseClass.prototype.initialize = function() {};

    Blush.BaseClass.extend = function extend() {
        var parentClass = this;
        var childClass = Blush.createConstructor();
        var extensions = Array.prototype.slice.call(arguments);
        extensions.unshift(parentClass.prototype);
        extensions.unshift(childClass.prototype);
        Object.assign.apply(null, extensions);
        childClass.prototype.constructor = childClass;
        childClass.extend = extend;
        return childClass;
    };

    Blush.utils.typeOf = function typeOf(value) {
        var output = Object.prototype.toString.call(value);
        var matches = output.match(/\[object (.*)\]/);
        return matches && matches[1];
    };

    ['String', 'Array', 'Object', 'Date', 'Regex', 'Number', 'Function', 'Null', 'Undefined', 'Boolean'].forEach(function(type) {
        Blush.utils['is' + type] = function isA(value) {
            return Blush.utils.typeOf(value) === type;
        };
    });

    Blush.utils.isNil = function isNil(value) {
        return Blush.utils.isUndefined(value) || Blush.utils.isNull(value);
    };

    Blush.utils.camelize = function camelize(word) {
        return word.replace(/(_\w)/g, function(g) {
            return g[1].toUpperCase();
        });
    };

    Blush.utils.escapeHTML = function escapeHTML(text) {
        if (!Blush.utils.isString(text)) {
            return text;
        }

        var entityMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;',
            '`': '&#x60;',
            '=': '&#x3D;'
        };

        return String(text).replace(/[&<>"'`=\/]/g, function fromEntityMap(s) {
            return entityMap[s];
        });
    };

    Blush.ViewModel = Blush.BaseClass.extend({
        _initialize: function(opts) {
            opts = opts || {};
            var app = opts.app || {};
            this.data = app.data && app.data();
            this.initialize.apply(this, arguments);
        },

        json: function() {
            return new Blush.ViewModel.ExtractJSON(this).run();
        }
    }, Blush.utils);

    Blush.ViewModel.ExtractJSON = Blush.BaseClass.extend({
        _initialize: function(viewModel) {
            this.json = {};
            this.viewModel = viewModel;
            this.data = viewModel.data;
            this.attributes = viewModel.attributes || [];
            this.unescapedAttributes = viewModel.unescapedAttributes || [];
        },

        run: function() {
            this.addEscapedAttributes();
            //this.addUnescapedAttributes();
            return this.json;
        },

        addEscapedAttributes: function() {
            this.attributes.forEach(function(name) {
                this.json[name] = this.escapedValueFor(name);
            }.bind(this));
        },

        escapedValueFor: function(name) {
            var value = this.valueFor(name);
            return Blush.utils.escapeHTML(value);
        },

        valueFor: function(name) {
            var camelName = Blush.utils.camelize(name);
            var local = this.viewModel[name] || this.viewModel[camelName];
            if (local !== undefined && Blush.utils.isFunction(local)) {
                local = local();
            }
            return local || this.data[name];
        }
    });

    Blush.View = Blush.BaseClass.extend({
        _initialize: function(opts) {
            opts = opts || {};
            this.app = opts.app;
            this.dom = this.findDom(opts) || document.createElement('div');
            this.initialize.apply(this, arguments);
        },

        render: function() {
            var attachmentMethod = this.attachmentMethod();
            var rendered = this.renderTemplate();
            // TODO: switch to more efficient if test 
            // View.attachmentType.APPEND = 0; // etc
            if (attachmentMethod === 'append') {
                this.dom.innerHTML += rendered;
            } else if (attachmentMethod === 'replace') {
                this.dom.innerHTML = rendered;
            } else {
                this.dom.innerHTML = rendered + this.dom.innerHTML;
            }
        },

        findDom: function(opts) {
            return new Blush.View.DomFinder(this.app, opts.parent, this.parentSelector()).dom();
        },

        renderTemplate: function() {
            return Mario.render(this.template(), this.viewModel());
        },

        template: function() {
            return this.getFromApp('template') || this._defaultConfig['template'];
        },

        viewModel: function() {
            return this.getFromApp('viewModel') || this._defaultConfig['viewModel'];
        },

        parentSelector: function() {
            return this.getConfig('parentSelector') || this._defaultConfig['parentSelector'];
        },

        attachmentMethod: function() {
            return this.getConfig('attachmentMethod') || this._defaultConfig['attachmentMethod'];
        },

        resolveConfig: function() {
            if (this._config) {
                return;
            }

            if (this.config && Blush.utils.isFunction(this.config)) {
                this._config = this.config();
            } else if (this.config) {
                this._config = this.config;
            } else {
                this._config = {};
            }
        },

        getFromApp: function(key) {
            if (!this.app) {
                return;
            }
            var name = this.getConfig('name');
            if (!name) {
                return;
            }
            return this.app[key + 's'][name];
        },

        getConfig: function(type) {
            var value;

            this.resolveConfig();

            if (this._config[type] !== undefined) {
                value = this._config[type];
            } else {
                value = this._defaultConfig[type];
            }

            return value;
        },

        _defaultConfig: {
            viewModel: {},
            template: 'Template not found!',
            attachmentMethod: 'append', // prepend, or replace
            parentSelector: undefined
        }
    });

    Blush.View.DomFinder = Blush.BaseClass.extend({
        _initialize: function(app, parentDom, selector) {
            this.app = app;
            this.parentDom = parentDom;
            this.selector = selector;
        },

        parent: function() {
            return this.parentDom || this.app.dom;
        },

        dom: function() {
            var parent = this.parent();
            if (!this.selector) {
                return parent;
            }
            var found = parent.querySelector(this.selector);
            return found || parent;
        }
    });

})(this);