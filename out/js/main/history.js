"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
// Setup history
App.setup_history = function () {
  App.setup_item_window("history");
};

// Get history months date
App.history_months = function () {
  return Date.now() - 1000 * 60 * 60 * 24 * 30 * App.history_max_months;
};

// Get items from history
App.get_history = /*#__PURE__*/_asyncToGenerator(function* () {
  let results;
  let r = App.settings.history_results;
  if (r === "fast") {
    results = 1000 * 2;
  } else if (r === "normal") {
    results = 1000 * 10;
  } else if (r === "deep") {
    results = 1000 * 20;
  }
  let items = yield browser.history.search({
    text: "",
    maxResults: results,
    startTime: App.history_months()
  });
  return items;
});

// Selected history item action
App.history_action = function () {
  App.focus_or_open_item(App.selected_history_item);
};

// Show history results info
App.show_history_results_info = function () {
  let s = "";
  s += "Fast = 2k results\n";
  s += "Normal = 10k results\n";
  s += "Deep = 20k results";
  alert(s);
};

// Show information about history
App.show_history_info = /*#__PURE__*/_asyncToGenerator(function* () {
  let n = App.history_items.length;
  let s = App.plural(n, "history result", "history results");
  alert(s);
});