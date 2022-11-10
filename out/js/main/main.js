"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
App.stor_settings_name = "settings_v1";
App.stor_stars_name = "stars_v1";
App.windows = {};
App.filter_delay = 123;
App.color_delay = 123;
App.history_max_months = 12;
App.max_stars = 1000 * 5;
if (typeof browser === "undefined") {
  var browser = chrome;
}
App.init = /*#__PURE__*/_asyncToGenerator(function* () {
  yield App.stor_get_settings();
  yield App.stor_get_stars();
  App.setup_theme();
  App.setup_tabs();
  App.setup_stars();
  App.setup_closed();
  App.setup_history();
  App.setup_about();
  App.setup_mouse();
  App.setup_keyboard();
  App.setup_items();

  // Show first window
  App.show_first_item_window();
});
App.init();