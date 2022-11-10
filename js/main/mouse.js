// Setup mouse for window
App.setup_window_mouse = function (mode) {
  let container = App.el(`#${mode}_container`)

  App.ev(container, "mousemove", function (e) {
    if (e.target.closest(`.${mode}_item`)) {
      App.select_item(mode, App.get_cursor_item(mode, e))
    }
  })  

  App.ev(container, "click", function (e) {
    if (e.target.closest(`.${mode}_item`)) {
      App[`${mode}_action`](App.get_cursor_item(mode, e))
    }
  })

  App.ev(container, "auxclick", function (e) {
    if (e.button === 1) {
      if (e.target.closest(`.${mode}_item`)) {
        App[`${mode}_action_alt`](App.get_cursor_item(mode, e))
      }
    }
  })  

  App.ev(container, "contextmenu", function (e) {
    if (e.target.closest(`.${mode}_item`)) {
      App.show_item_menu(mode, App.get_cursor_item(mode, e), e.clientX, e.clientY)
      e.preventDefault()
    }
  })  
}

// Setup mouse for each window
App.setup_mouse = function () {
  App.setup_window_mouse("tabs")
  App.setup_window_mouse("stars")
  App.setup_window_mouse("closed")
  App.setup_window_mouse("history") 
}

// Get item under cursor
App.get_cursor_item = function (mode, e) {
  let el = e.target.closest(`.${mode}_item`)
  let item = App.get_item_by_id(mode, el.dataset.id)
  return item
}