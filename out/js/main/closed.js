"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
// Setup closed tabs
App.setup_closed = function () {
  App.setup_item_window("closed");
};

// Get closed tabs
App.get_closed = /*#__PURE__*/_asyncToGenerator(function* () {
  let items = yield browser.sessions.getRecentlyClosed({
    maxResults: 25
  });
  return items.map(x => x.tab);
});

// Selected closed tabs action
App.closed_action = function () {
  App.focus_or_open_item(App.selected_closed_item);
};

// Show information about closed tabs
App.show_closed_info = /*#__PURE__*/_asyncToGenerator(function* () {
  alert("These are recently closed tabs");
});