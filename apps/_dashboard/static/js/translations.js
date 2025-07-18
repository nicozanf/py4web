"use strict";

var UNVERIFIED = "\uFEFF";

/**
 * Translation Manager App 2.0 for vue3
 * 
 * Manages language translations with verification system
 */
var init_app = function() {
    var self = [];
    self.base = window.location.href.split('/')[3];
    self.app = window.location.href.split('/')[5];
    self.data = {};
    self.data.translations = {};
    self.data.selected_translations = {};
    self.data.selected_language = null;
    self.data.num = {};
    self.data.string = {};
    self.methods = {};
    self.methods.select_language = function(name) {
        self.vue.selected_language = name;
        self.vue.selected_translations = self.vue.translations[name];
    };
    
    self.methods.delete_translation = function(name, num) {
        console.log("deleting", name, num);
        delete self.vue.selected_translations[name][num];
        if (Object.keys(self.vue.selected_translations[name]).length == 0)
            delete self.vue.selected_translations[name];
    };
    
    self.methods.add_translation = function(name) {
        self.vue.selected_translations[name] = self.vue.selected_translations[name] || {};
        self.vue.selected_translations[name][self.vue.num[name]] = self.vue.string[name];
        self.vue.num[name] = "";
        self.vue.string[name] = "";
    };
    
    self.methods.is_unverified = function(text) {
        return text.length > 0 && text[0] == UNVERIFIED;
    };
    
    self.methods.save_languages = function() {
        let data = self.vue.translations;
        Q.post('/' + self.base + '/api/translations/' + self.app, data).then(
            function(res) { alert("Saved"); },
            function(res) { alert("Error Saving"); }
        );
    };
    
    self.methods.update_languages = function() {
        Q.get('/' + self.base + '/api/translations/' + self.app + '/search').then(
            function(res) {
                let words = res.json().strings;
                for (var lang in self.vue.translations) {
                    var translations = self.vue.translations[lang];
                    words.map(function(key) {
                        if (!(key in translations)) {
                            translations[key] = { 
                                "0": UNVERIFIED + key, 
                                "1": UNVERIFIED + key, 
                                "2": UNVERIFIED + key 
                            };
                        }
                    });
                }
            }
        );
    };
    
    self.methods.add_language = function() {
        let language = prompt("Language name (example en-US):");
        if (language in self.vue.translations) {
            alert("Language already exists!");
            return;
        }
        if (!language.match(/[a-z]{2}(\-[A-Z]{2})?/)) {
            alert("Invalid language name (example en-US)");
            return;
        }
        let words = [];
        for (var lang in self.vue.translations) {
            for (var key in self.vue.translations[lang]) {
                if (words.indexOf(key) < 0) {
                    words.push(key);
                }
            }
        }
        words.sort();
        self.vue.translations[language] = {};
        words.map(function(key) {
            self.vue.translations[language][key] = { 
                "0": UNVERIFIED + key, 
                "1": UNVERIFIED + key, 
                "2": UNVERIFIED + key 
            };
        });
        self.methods.select_language(language);
    };

    // Vue 3 initialization
    const { createApp } = Vue;
    self.vue = createApp({
        data() {
            return self.data;
        },
        methods: self.methods
    }).mount('#vue');

    // Load initial translations
    Q.get('/' + self.base + '/api/translations/' + self.app).then(
        function(res) { self.vue.translations = res.json(); }
    );
    
    return self;
}

window.app = init_app();