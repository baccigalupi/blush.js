(function(global) {
    'use strict';
    var Mario = {
        render: function(template, view, partials) {
            var scanner = this.compile(template);
            return scanner.render(view, partials);
        },

        compile: function(template) {
            var scanner = this.cache[template];
            if (!scanner) {
                scanner = new Mario.Scanner(template);
                this.cache[template] = scanner;
            }
            scanner.compile();
            return scanner;
        },

        delimiters: ['{{', '}}', '}}}'],
        cache: {}
    };

    Mario.Scanner = function(template) {
        this.template = template;
        this.disassemblies = [new Mario.Disassembly()];

        this.cursor = 0;
        this.delimiterIndex = 0;
        this.compiled = false;
        this.outOfRange = this.template.length + 1;
    };

    Mario.Scanner.prototype.compile = function compile() {
        if (this.compiled) {
            return;
        }

        var length = this.outOfRange - 1;
        while (this.cursor < length) {
            this.processToken();
        }

        this.compiled = true;
    };

    Mario.Scanner.prototype.processToken = function processToken() {
        var tail = this.template.slice(this.cursor);
        var nextTagLocation = tail.indexOf(Mario.delimiters[this.delimiterIndex]);

        this.extractNextToken(tail, nextTagLocation);
        this.addToken();
        this.advanceCursor(nextTagLocation);

        if (nextTagLocation >= 0) {
            this.flipDelimiter(tail);
        }
    };

    Mario.Scanner.prototype.extractNextToken = function extractNextToken(tail, location) {
        if (location === undefined || location === -1) {
            this.nextToken = tail;
        } else {
            this.nextToken = tail.slice(0, location);
        }
    };

    Mario.Scanner.prototype.addToken = function addToken() {
        if (this.delimiterIndex > 0) { // start of tag found, seeking ending
            this.orchestrateDisassemblies();
        } else {
            this.addText();
        }
    };

    Mario.Scanner.prototype.advanceCursor = function advanceCursor(nextTagLocation) {
        if (nextTagLocation >= 0) {
            this.cursor = this.cursor + Mario.delimiters[this.delimiterIndex].length + nextTagLocation;
        } else {
            this.cursor = this.outOfRange;
        }
    };

    Mario.Scanner.prototype.addText = function() {
        this.disassembly().addText(this.nextToken);
    };

    Mario.Scanner.prototype.orchestrateDisassemblies = function orchestrateDisassemblies() {
        var tag = new Mario.Tag(this.nextToken);
        var currentDisassembly = this.disassembly();
        if (tag.type === 2 || tag.type === 3) {
            this.startSection(tag);
        } else if (tag.type === 4 && tag.name === currentDisassembly.key) {
            this.endSection();
        } else {
            currentDisassembly.addTag(tag);
        }
    };

    Mario.Scanner.prototype.startSection = function startSection(tag) {
        var disassembly = new Mario.Disassembly(tag.name);
        disassembly.addTag(tag);
        this.disassemblies.push(disassembly);
    };

    Mario.Scanner.prototype.endSection = function endSection() {
        var disassembly = this.disassemblies.pop();
        var baseTag = disassembly.tags[0];
        disassembly.tags = disassembly.tags.slice(1);
        baseTag.disassembly = disassembly;
        this.disassembly().addTag(baseTag);
    };

    Mario.Scanner.prototype.disassembly = function disassembly() {
        return this.disassemblies[this.disassemblies.length - 1];
    };

    Mario.Scanner.prototype.delimiter = function delimiter() {
        return Mario.delimiters[this.delimiterIndex];
    };

    Mario.Scanner.prototype.flipDelimiter = function flipDelimiter(tail) {
        if (this.delimiterIndex === 2 || this.delimiterIndex === 1) {
            this.delimiterIndex = 0;
        } else {
            this.delimiterIndex = 1;
        }

        if (this.delimiterIndex === 1 && this.nextToken === '' && tail[2] === '{') {
            this.delimiterIndex = 2;
        }
    };

    Mario.Scanner.prototype.render = function render(view, partials) {
        this.compile();
        view = view || {};
        partials = partials || {};
        var content = [];
        var length = this.disassemblies.length;
        var i;
        for (i = 0; i < length; i++) {
            content.push(this.disassemblies[i].render(view, partials));
        }
        return String.prototype.concat.apply('', content);
    };

    Mario.Disassembly = function(key) {
        this.key = key;
        this.texts = [];
        this.tags = [];
    };

    Mario.Disassembly.prototype.addText = function addText(text) {
        if (text.length) {
            this.texts.push(text);
        }
    };

    Mario.Disassembly.prototype.addTag = function addTag(tag) {
        tag.index = this.texts.length;
        this.tags.push(tag);
        this.texts.push('');
    };

    Mario.Disassembly.prototype.render = function renderDisassembly(view, partials) {
        var content = this.texts.slice(0);
        var tagLength = this.tags.length;
        var i;
        for (i = 0; i < tagLength; i++) {
            this.substitute(content, this.tags[i], view, partials);
        }
        return String.prototype.concat.apply('', content);
    };

    Mario.Disassembly.prototype.substitute = function substituteTagContent(content, tag, view, partials) {
        content[tag.index] = tag.render(view, partials);
    };

    Mario.Variable = function(key, view) {
        this.key = key;
        this.view = view;
        this.value = view[key];
        if (key === '.') {
            this.value = view;
        }
    };

    Mario.Variable.prototype.evaluate = function evaluate() {
        if (this.isComplexKey()) {
            this.nestedValue();
        }
        this.stripFalseyValues();
        return this.value;
    };

    Mario.Variable.prototype.isComplexKey = function isComplexKey() {
        if (this.key === '.') {
            return false;
        }
        var keys = this.key.split('.');
        this.complexKey = keys;
        return keys.length - 1 ? true : false;
    };

    Mario.Variable.prototype.nestedValue = function nestedValue() {
        var length = this.complexKey.length;
        var i;
        var temp = this.view;
        for (i = 0; i < length; i++) {
            if (temp) {
                temp = temp[this.complexKey[i]];
            }
        }
        this.value = temp;
    };

    Mario.Variable.prototype.stripFalseyValues = function stripFalseyValues() {
        if (!this.value && this.value !== 0) {
            this.value = '';
        }
    };

    function evaluate(key, view) {
        var value = view[key];
        var isComplex;
        var keys = [];

        if (key === '.') {
            value = view;
            isComplex = false;
        } else {
            keys = key.split('.');
            isComplex = keys.length - 1 ? true : false;
        }

        if (isComplex) {
            var length = keys.length;
            var i;
            var temp = view;
            for (i = 0; i < length; i++) {
                if (temp) {
                    temp = temp[keys[i]];
                }
            }
            value = temp;
        }

        if (!value && value !== 0) {
            value = '';
        }
        return value;
    }

    Mario.Tag = function(name, index) {
        this.index = index;
        this.name = name.replace(/\s/g, '');
        this.separateTypeFromName();
    };

    Mario.Tag.prototype.separateTypeFromName = function separateTypeFromName() {
        this.type = this.determineType();
        if (this.type !== 6) {
            this.name = this.name.slice(1);
        }
    };

    Mario.Tag.prototype.determineType = function determineType() {
        return {
            '>': 1,
            '#': 2,
            '^': 3,
            '/': 4,
            '{': 5
        }[this.name[0]] || 6;
    };

    Mario.Tag.prototype.render = function renderTag(view, partials) {
        var rendered;
        if (this.type === 1) {
            rendered = this.partial(view, partials);
        } else if (this.type === 2) {
            rendered = this.section(view, partials);
        } else if (this.type === 3) {
            rendered = this.antiSection(view, partials);
        } else if (this.type === 5) {
            rendered = this.evaluation(view);
        } else {
            rendered = this.escapedEvaluation(view);
        }
        return rendered;
    };

    Mario.Tag.prototype.evaluation = function evaluation(view) {
        //return new Mario.Variable(this.name, view).evaluate();
        return evaluate(this.name, view);
    };

    Mario.Tag.prototype.escapedEvaluation = function escapedEvaluation(view) {
        //var value = new Mario.Variable(this.name, view).evaluate();
        var value = evaluate(this.name, view);
        return this.escape(value);
    };

    Mario.Tag.prototype.partial = function renderPartial(view, partials) {
        var partial = partials[this.name];
        var rendeded;
        if (partial) {
            rendeded = Mario.render(partial, view, partials);
        }
        return rendeded || '';
    };

    Mario.Tag.prototype.sectionView = function sectionView(fullView, partials) {
        var view = this.evaluation(fullView, partials);
        if (Array.isArray(view) && !view.length) {
            return false;
        }
        return view;
    };

    Mario.Tag.prototype.section = function renderSection(fullView, partials) {
        var view = this.sectionView(fullView, partials);
        if (!view) {
            return '';
        }
        var content;
        if (Array.isArray(view)) {
            content = this.renderArraySection(view, partials);
        } else {
            content = this.disassembly.render(view, partials);
        }
        return content;
    };

    Mario.Tag.prototype.renderArraySection = function renderArraySection(view, partials) {
        var content = [];
        var length = view.length;
        var i;
        for (i = 0; i < length; i++) {
            content.push(this.disassembly.render(view[i], partials));
        }
        return String.prototype.concat.apply('', content);
    };

    Mario.Tag.prototype.antiSection = function renderAntiSection(fullView, partials) {
        var view = this.sectionView(fullView, partials);
        if (view) {
            return '';
        }
        return this.disassembly.render(fullView, partials);
    };

    // Stolen mostly from Mustache.js!
    Mario.Tag.prototype.escape = function escapeHTML(value) {
        if (value.toString) {
            value = value.toString();
        }

        return String(value).replace(Mario.Tag.escapeRegex, Mario.Tag.escape);
    };

    Mario.Tag.escapeRegex = /[&<>"'`=\/]/g;
    Mario.Tag.escapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        '\'': '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    };
    Mario.Tag.escape = function escape(value) {
        return Mario.Tag.escapeMap[value];
    };

    global.Mario = Mario;
})(this);
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
        return word.replace(/([_\-]\w)/g, function(g) {
            return g[1].toUpperCase();
        });
    };

    Blush.utils.capitalize = function capitalize(word) {
        return word.replace(/^[a-z]/, function(c) {
            return c.toUpperCase();
        });
    };

    Blush.utils.classify = function classify(word) {
        return Blush.utils.capitalize(Blush.utils.camelize(word));
    };

    Blush.createConstructor = function() {
        var klass = function klass() {
            if (!(this instanceof klass)) {
                throw new Error('This is a class, and cannot be called without the new keyword.');
            }
            this.__initialize.apply(this, arguments);
        };
        return klass;
    };

    Blush.BaseClass = Blush.createConstructor();

    Blush.BaseClass.prototype.__initialize = function() {
        this._initialize.apply(this, arguments);
        this.initialize.apply(this, arguments);
    };

    Blush.BaseClass.prototype._initialize = function() {};
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

    Blush.Config = Blush.BaseClass.extend({
        _initialize: function(config, klass, app) {
            this.defaultConfig = klass.defaultConfig;
            this.config = config;
            this.app = app;
            this.appClass = app.constructor;
        },

        get: function(key) {
            if (this['_' + key] !== undefined) {
                return this['_' + key];
            }

            var value;
            if (this.config[key] !== undefined) {
                value = this.config[key];
            } else {
                value = this.defaultConfig[key];
            }

            this['_' + key] = value;
            return value;
        },

        getFromApp: function(key) {
            var name = this.get('name');
            if (!this.appClass || !name) {
                return;
            }

            var collection = this.appCollection(key);
            var value = collection[name] || collection[Blush.utils.classify(name)];
            if (value === undefined) {
                value = this.defaultConfig[key];
            }

            return value;
        },

        appCollection: function(key) {
            var collectionName = key + 's';
            collectionName = Blush.utils.capitalize(collectionName);
            return this.appClass[collectionName] || {};
        }
    });

    Blush.ViewModel = Blush.BaseClass.extend({
        _initialize: function(opts) {
            opts = opts || {};
            var app = opts.app || {};
            this.data = app.data && app.data();
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
            this.addAttributes();
            return this.json;
        },

        addAttributes: function() {
            this.attributes.forEach(function(name) {
                this.json[name] = this.valueFor(name);
            }.bind(this));
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
            this._config = new Blush.Config(this.config, Blush.View, this.app);
            this.dom = this.findDom(opts) || document.createElement('div');
        },

        render: function() {
            var renderVia = this.renderVia();
            var rendered = this.renderTemplate();
            // TODO: switch to more efficient if test 
            // View.attachmentType.APPEND = 0; // etc
            if (renderVia === 'append') {
                this.dom.innerHTML += rendered;
            } else if (renderVia === 'replace') {
                this.dom.innerHTML = rendered;
            } else {
                this.dom.innerHTML = rendered + this.dom.innerHTML;
            }
        },

        findDom: function(opts) {
            return new Blush.View.DomFinder(this.app, opts.parent, this.selector()).dom();
        },

        renderTemplate: function() {
            return Mario.render(this.template(), this.viewModel());
        },

        template: function() {
            return this._config.getFromApp('template');
        },

        viewModel: function() {
            return this._config.getFromApp('viewModel');
        },

        selector: function() {
            return this._config.get('selector');
        },

        renderVia: function() {
            return this._config.get('renderVia');
        }
    });

    Blush.View.defaultConfig = {
        viewModel: {},
        template: 'Template not found!',
        renderVia: 'append', // prepend, or replace
        selector: undefined
    };


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


    global.Blush = Blush;
})(this);