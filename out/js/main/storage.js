"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
// Get settings from sync storage
App.stor_get_settings = /*#__PURE__*/_asyncToGenerator(function* () {
  let obj = yield browser.storage.sync.get(App.stor_settings_name);
  if (Object.keys(obj).length === 0) {
    App.settings = {};
  } else {
    App.settings = obj[App.stor_settings_name];
  }
  let changed = false;
  if (!App.settings.text_mode) {
    App.settings.text_mode = "title";
    changed = true;
  }
  if (!App.settings.history_results) {
    App.settings.history_results = "normal";
    changed = true;
  }
  if (!App.settings.color) {
    App.settings.color = "rgb(37, 41, 51)";
    changed = true;
  }
  if (!App.settings.window_order) {
    App.settings.window_order = ["tabs", "stars", "closed", "history"];
    changed = true;
  }
  if (changed) {
    App.stor_save_settings();
  }
});

// Save settings to sync storage
App.stor_save_settings = /*#__PURE__*/_asyncToGenerator(function* () {
  let o = {};
  o[App.stor_settings_name] = App.settings;
  yield browser.storage.sync.set(o);
});

// Reset settings to default
App.stor_reset_settings = /*#__PURE__*/_asyncToGenerator(function* () {
  if (confirm("Reset settings to defaults?")) {
    App.settings = {};
    yield App.stor_save_settings();
    window.close();
  }
});

// Get stars from sync storage
App.stor_get_stars = /*#__PURE__*/_asyncToGenerator(function* () {
  let obj = yield browser.storage.sync.get(App.stor_stars_name);
  if (Object.keys(obj).length === 0) {
    App.stars = {};
  } else {
    App.stars = obj[App.stor_stars_name];
  }
  let changed = false;
  if (!App.stars.items) {
    App.stars.items = [];
    changed = true;
  }
  if (changed) {
    App.stor_save_stars();
  }
});

// Save stars to sync storage
App.stor_save_stars = /*#__PURE__*/_asyncToGenerator(function* () {
  let o = {};
  o[App.stor_stars_name] = App.stars;
  yield browser.storage.sync.set(o);
});