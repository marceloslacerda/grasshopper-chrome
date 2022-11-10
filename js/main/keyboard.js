// Setup bindings for window
App.check_window_keyboard = function (e) {
  let mode = App.window_mode
  App.focus_filter(mode)

  if (e.key === "Enter") {
    App[`${mode}_action`](App[`selected_${mode}_item`])
    e.preventDefault()
  } else if (e.key === "ArrowUp") {
    App.select_item_above(mode)
    e.preventDefault()
  } else if (e.key === "ArrowDown") {
    App.select_item_below(mode)
    e.preventDefault()
  }
}

// Setup keybindings
App.setup_keyboard = function () {
  App.ev(document, "keydown", function (e) {
    if (NeedContext.open) {
      return
    }

    if (App.window_mode === "star_editor") {
      if (e.key === "Enter") {
        App.star_editor_save()
        e.preventDefault()
      }

      return
    }

    if (e.key === "Tab") {
      if (!e.ctrlKey) {
        App.cycle_item_windows(e.shiftKey)
        e.preventDefault()
        return
      }
    }

    if (App.window_order.includes(App.window_mode)) {
      App.check_window_keyboard(e)
    }
  })
}