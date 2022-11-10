// Setup items
App.setup_items = function () {
  App.get_window_order()
  App.start_item_observers()
}

// Select an item
App.select_item = function (mode, item) {
  if (App[`selected_${mode}_item`] === item) {
    return
  }

  if (!item.created) {
    App.create_item_element(mode, item)
  }

  for (let el of App.els(`.${mode}_item`)) {
    el.classList.remove("selected")
  }

  App[`selected_${mode}_item`] = item
  App[`selected_${mode}_item`].element.classList.add("selected")
  App[`selected_${mode}_item`].element.scrollIntoView({block: "nearest"})

  App.update_footer(mode)
}

// Select item above
App.select_item_above = function (mode) {
  let item = App.get_prev_visible_item(mode)

  if (item) {
    App.select_item(mode, item)
  }
}

// Select item below
App.select_item_below = function (mode) {
  let item = App.get_next_visible_item(mode)

  if (item) {
    App.select_item(mode, item)
  }
}

// Get next item that is visible
App.get_next_visible_item = function (mode) {
  let waypoint = false
  
  if (!App.selected_valid(mode)) {
    waypoint = true
  }
  
  let items = App[`${mode}_items`]
  let o_item = App[`selected_${mode}_item`]

  for (let i=0; i<items.length; i++) {
    let item = items[i]

    if (waypoint) {
      if (App.item_is_visible(item)) {
        return item
      }
    }

    if (item === o_item) {
      waypoint = true
    }
  }
}

// Get prev item that is visible
App.get_prev_visible_item = function (mode) {
  let waypoint = false

  if (!App.selected_valid(mode)) {
    waypoint = true
  }

  let items = App[`${mode}_items`]
  let o_item = App[`selected_${mode}_item`]

  for (let i=items.length-1; i>=0; i--) {
    let item = items[i]

    if (waypoint) {
      if (App.item_is_visible(item)) {
        return item
      }
    }

    if (item === o_item) {
      waypoint = true
    }
  }
}

// Check if an item is visible
App.item_is_visible = function (item) {
  return !item.element.classList.contains("hidden")
}

// Updates a footer
App.update_footer = function (mode) {
  if (App.selected_valid(mode)) {
    App.set_footer(mode, App[`selected_${mode}_item`].footer)
  } else {
    App.empty_footer(mode)
  }
}

// Empty the footer
App.empty_footer = function (mode) {
  App.set_footer(mode, "No Results")
}

// Set footer
App.set_footer = function (mode, text) {
  App.el(`#${mode}_footer`).textContent = text
}

// Check if selected is valid
App.selected_valid = function (mode) {
  return App[`selected_${mode}_item`] && 
  App[`selected_${mode}_item`].created &&
  App.item_is_visible(App[`selected_${mode}_item`])
}

// Select first item
App.select_first_item = function (mode) {
  for (let item of App[`${mode}_items`]) {
    if (App.item_is_visible(item)) {
      App.select_item(mode, item)
      return
    }
  }
}

// Remove an item from the list
App.remove_item = function (mode, item) {
  let next_item = App.get_next_visible_item(mode, item) || App.get_prev_visible_item(mode, item)
  let items = App[`${mode}_items`]
  item.element.remove()
  let id = item.id.toString()
  
  for (let [i, it] of items.entries()) {
    if (it.id.toString() === id) {
      items.splice(i, 1)
      break
    }
  }
  
  if (next_item) {
    App.select_item(mode, next_item)
  } else {
    App.select_first_item(mode)
  }
}

App.focus_filter = function (mode) {
  App.el(`#${mode}_filter`).focus()
}

// Filter items
App.do_item_filter = function (mode) {  
  if (!App[`${mode}_items`]) {
    return
  }  

  let value = App.el(`#${mode}_filter`).value.trim()

  let filter_mode
  let filter_mode_select = App.el(`#${mode}_filter_mode`)

  if (filter_mode_select) {
    filter_mode = filter_mode_select.value
  } else {
    filter_mode = "all"
  }

  let words = value.split(" ").filter(x => x !== "")
  let filter_words = words.map(x => x.toLowerCase())

  function check (title, path) {
    return filter_words.every(x => title.includes(x) || path.includes(x))
  }

  function matched (item) {
    let match = false
    let title = item.title_lower
    let path = item.path_lower

    if (check(title, path)) {
      if (filter_mode === "all") {
        match = true
      } else if (filter_mode === "normal") {
        match = !item.audible && !item.pinned
      } else if (filter_mode === "playing") {
        match = item.audible
      } else if (filter_mode === "pins") {
        match = item.pinned
      } else if (filter_mode === "muted") {
        match = item.muted
      }
    }
        
    return match
  }

  for (let it of App[`${mode}_items`]) {
    if (!it.element) {
      continue
    }

    if (matched(it)) {
      App.show_item(it)
    } else {
      App.hide_item(it)
    }
  }
  
  App[`selected_${mode}_item`] = undefined
  App.select_first_item(mode)
  App.update_footer(mode)
}

// Show item
App.show_item = function (it) {
  it.element.classList.remove("hidden")
}

// Hide item
App.hide_item = function (it) {
  it.element.classList.add("hidden")
}

// Show item menu
App.show_item_menu = async function (mode, item, x, y) {
  let items = []

  if (mode === "tabs") {
    if (item.pinned) {
      items.push({
        text: "Unpin",
        action: function () {
          App.unpin_tab(item)
        }
      })
    } else {
      items.push({
        text: "Pin",
        action: function () {
          App.pin_tab(item)
        }
      })
    }
  
    if (item.muted) {
      items.push({
        text: "Unmute",
        action: function () {
          App.unmute_tab(item)
        }
      })
    } else {
      items.push({
        text: "Mute",
        action: function () {
          App.mute_tab(item)
        }
      })
    }
  }

  if (mode !== "stars") {
    items.push({
      text: "Star",
      action: function () {
        App.add_or_edit_star(item)
      }
    })
  }    

  items.push({
    text: "Copy URL",
    action: function () {
      App.copy_to_clipboard(item.url)
    }
  })

  items.push({
    text: "Copy Title",
    action: function () {
      App.copy_to_clipboard(item.title)
    }
  })

  if (mode === "tabs") {
    items.push({
      text: "Close",
      action: function () {
        App.confirm_close_tab(item)
      }
    })
  } else if (mode === "stars") {
    items.push({
      text: "Edit Star",
      action: function () {
        App.show_star_editor(item)
      }
    })

    items.push({
      text: "Un-Star",
      action: function () {
        App.confirm_unstar_item(item)
      }
    })
  }

  if (App[`selected_${mode}_item`] !== item) {
    App.select_item(mode, item)
  }

  NeedContext.show(x, y, items)
}

// Process items
App.process_items = function (mode, items) {
  let container = App.el(`#${mode}_container`)
  container.innerHTML = ""
  App[`${mode}_items`] = []
  App[`${mode}_idx`] = 0
  let exclude = []
  App[`${mode}_items_original`] = items

  for (let item of items) {
    let obj = App.process_item(mode, item, exclude)

    if (!obj) {
      continue
    }

    if (mode !== "tabs") {
      exclude.push(obj.url)
    }

    App[`${mode}_items`].push(obj)
    container.append(obj.element)
  }
}

// Process an item
App.process_item = function (mode, item, exclude = []) {
  if (!item || !item.url) {
    return false
  }

  try {
    url_obj = new URL(item.url)
  } catch (err) {
    return false
  }

  let url = App.format_url(item.url)

  if (exclude.includes(url)) {
    return false
  }

  let path = App.remove_protocol(url)
  let title = item.title || path

  let obj = {
    id: item.id || App[`${mode}_idx`],
    title: title,
    title_lower: title.toLowerCase(),
    url: url,
    path: path,
    path_lower: path.toLowerCase(),
    favicon: item.favIconUrl,
    empty: false,
    created: false,
    mode: mode
  }
  
  if (mode === "tabs") {
    obj.index = item.index,
    obj.active = item.active
    obj.pinned = item.pinned
    obj.audible = item.audible
    obj.muted = item.mutedInfo.muted
  } else if (mode === "closed") {
    obj.window_id = item.windowId
    obj.session_id = item.sessionId
  }

  App.create_empty_item_element(mode, obj)
  App[`${mode}_idx`] += 1
  return obj
}

// Create empty item
App.create_empty_item_element = function (mode, item) {
  item.element = App.create("div", `item ${mode}_item item_empty`)
  item.element.dataset.id = item.id
  App[`${mode}_item_observer`].observe(item.element)
}

// Create an item element
App.create_item_element = function (mode, item) {
  item.element.classList.remove("item_empty")
  
  let icon = App.get_img_icon(item.favicon, item.url, item.pinned)
  item.element.append(icon)

  let text = App.create("div", "item_text")
  item.element.append(text)
  App.set_item_text(mode, item)  

  item.created = true
  console.info(`Item created in ${mode}`)
}

// Get image favicon
App.get_img_icon = function (favicon, url, pinned = false) {
  let icon = App.create("img", "item_icon")
  icon.loading = "lazy"
  icon.width = 25
  icon.height = 25

  App.ev(icon, "error", function () {
    let icon_2 = App.get_jdenticon(url)
    icon.replaceWith(icon_2)

    if (pinned) {
      App.pin_item_icon(icon_2)
    }
  })

  icon.src = favicon

  if (pinned) {
    App.pin_item_icon(icon)
  }
  
  return icon
}

// Get jdenticon icon
App.get_jdenticon = function (url) {
  let hostname = App.get_hostname(url) || "hostname"
  let icon = App.create("canvas", "item_icon")
  icon.width = 25
  icon.height = 25
  jdenticon.update(icon, hostname)
  return icon
}

// Pin item icon
App.pin_item_icon = function (icon) {
  icon.classList.add("pinned")
}

// Set item text content
App.set_item_text = function (mode, item) {
  let content = ""

  if (mode === "tabs") {
    let status = []
  
    if (item.audible) {
      status.push("Playing")
    }
  
    if (item.muted) {
      status.push("Muted")
    }
  
    if (status.length > 0) {
      content = status.map(x => `(${x})`).join(" ")
      content += "  "
    }
  }

  let purl

  if (item.url.startsWith("http://")) {
    purl = `(http) ${item.path}`
  } else {
    purl = item.path
  }

  if (App.settings.text_mode === "title") {
    content += item.title || purl
    item.footer = decodeURI(purl) || item.title
  } else if (App.settings.text_mode === "url") {
    content += decodeURI(purl) || item.title
    item.footer = item.title || purl
  }

  content = content.substring(0, 200).trim()
  let text = App.el(".item_text", item.element)
  text.textContent = content
}

// Get an item by id
App.get_item_by_id = function (mode, id) {
  id = id.toString()

  for (let item of App[`${mode}_items`]) {
    if (item.id.toString() === id) {
      return item
    }
  }
}

// Get an item by url
App.get_item_by_url = function (mode, url) {
  for (let item of App[`${mode}_items`]) {
    if (App.urls_equal(item.url, url)) {
      return item
    }
  }
}

// Used for lazy-loading components
App.start_item_observers = function () {
  for (let mode of App.window_order) {
    let options = {
      root: App.el(`#${mode}_container`),
      rootMargin: "0px",
      threshold: 0.1,
    }

    App.intersection_observer(mode, options)
  }
}

// Start intersection observer
App.intersection_observer = function (mode, options) {
  App[`${mode}_item_observer`] = new IntersectionObserver(function (entries) {
    for (let entry of entries) {
      if (!entry.isIntersecting) {
        continue
      }
      
      if (!entry.target.classList.contains("item")) {
        return
      }

      let item = App.get_item_by_id(mode, entry.target.dataset.id)

      if (!item) {
        continue
      }

      if (!item.created && App.item_is_visible(item)) {
        App.create_item_element(mode, item)
      }
    }
  }, options)
}

// Show a window by mode
App.show_item_window = async function (mode, cycle = false) {
  let last_mode = App.window_mode

  if (!App.window_order.includes(last_mode)) {
    last_mode = "tabs"
  }
  
  App.el(`#${mode}_container`).innerHTML = ""
  App.windows[mode].show()
  App.el(`#${mode}_select`).value = mode
  App.empty_footer(mode)

  if (cycle) {
    let v = App.el(`#${last_mode}_filter`).value.trim()
    App.el(`#${mode}_filter`).value = v
  } else {
    App.el(`#${mode}_filter`).value = ""
  }

  let filter_mode = App.el(`#${mode}_filter_mode`)

  if (filter_mode) {
    filter_mode.selectedIndex = 0
  }

  if (mode === "history") {
    App.focus_filter(mode)
    App.search_history()
    return
  }
  
  let items = await App[`get_${mode}`]()
  
  if (mode !== App.window_mode) {
    return
  }
  
  App.process_items(mode, items)
  
  if (App.el(`#${mode}_filter`).value) {
    App.do_item_filter(mode)
  } else {
    App.select_first_item(mode)
  }
  
  App.focus_filter(mode)  
}

// Setup an item window
App.setup_item_window = function (mode) {
  let args = {}
  args.id = mode
  args.close_button = false
  args.align_top = "left"

  args.setup = function () {
    let filter_function

    if (mode === "history") {
      filter_function = function () {
        App.search_history()
      }
    } else {
      filter_function = function () {
        App.do_item_filter(mode)
      }
    }

    let item_filter = App.create_debouncer(function () {
      filter_function()
    }, App.filter_delay)
    
    App.ev(App.el(`#${mode}_filter`), "input", function () {
      item_filter()
    })  

    let filter_mode = App.el(`#${mode}_filter_mode`)

    if (filter_mode) {
      App.ev(filter_mode, "change", function () {
        App.do_item_filter(mode)
      })
  
      App.wrap_select(filter_mode, function () {
        App.do_item_filter(mode)
      })    
    }

    App.ev(App.el(`#${mode}_info_button`), "click", function () {
      App[`show_${mode}_info`]()
    })

    let top = App.el(`#${mode}_top_container`)
    let select = App.make_items_select(mode)
    top.prepend(select)

    let g = App.create("div", "menu_icon action unselectable")
    g.textContent = "G"
    
    App.ev(g, "click", function () {
      App.show_window("settings")
    })

    top.prepend(g)    
  }

  App.create_window(args) 
}

// Cycle between item windows
App.cycle_item_windows = function (reverse = false) {
  let modes = App.window_order
  let index = modes.indexOf(App.window_mode)
  let new_mode

  if (index === -1) {
    return
  }

  if (reverse) {
    if (index === 0) {
      new_mode = modes.slice(-1)[0]
    } else {
      new_mode = modes[index - 1]
    }
  } else {
    if (index === modes.length - 1) {
      new_mode = modes[0]
    } else {
      new_mode = modes[index + 1]
    }
  }

  App.show_item_window(new_mode, true)
}

// Get item name by mode
App.item_name = function (mode) {
  if (mode === "tabs") {
    return "Tabs"
  } else if (mode === "stars") {
    return "Stars"
  } else if (mode === "closed") {
    return "Closed"
  } else if (mode === "history") {
    return "History"
  }
}

// Update window order
App.update_window_order = function () {
  let boxes = App.els(".window_order_item", App.el("#window_order"))
  let modes = boxes.map(x => x.dataset.mode)

  for (let [i, mode] of modes.entries()) {
    App.settings[`${mode}_index`] = i
  }

  App.stor_save_settings()
  App.get_window_order()
  App.remake_items_selects()
}

// Window order up
App.window_order_up = function (el) {
  let prev = el.previousElementSibling

  if (prev) {
    el.parentNode.insertBefore(el, prev)
    App.update_window_order()
  }
}

// Window order down
App.window_order_down = function (el) {
  let next = el.nextElementSibling

  if (next) {
    el.parentNode.insertBefore(next, el)
    App.update_window_order()
  }
}

// Make items select
App.make_items_select = function (mode) {
  let select = App.create("select", "select item_select", `${mode}_select`)

  for (let m of App.window_order) {
    let option = App.create("option")
    
    if (m === mode) {
      option.selected = true
    }

    option.value = m
    option.textContent = App.item_name(m)
    select.append(option)
  }

  App.ev(select, "change", function () {
    App.show_item_window(select.value)
  })
  
  App.wrap_select(select, function () {
    App.show_item_window(select.value, true)
  })

  return select
}

// Remake item selects
App.remake_items_selects = function () {
  for (let mode of App.window_order) {
    let select = App.el(`#${mode}_select`)
    
    if (select) {
      select.replaceWith(App.make_items_select(mode))
    }
  }
}

// Show first item window
App.show_first_item_window = function () {
  App.show_item_window(App.window_order[0])
}

// Focus an open tab or launch a new one
App.focus_or_open_item = async function (item, close = true) {
  if (close) {
    let tabs = await App.get_tabs()
  
    for (let tab of tabs) {
      if (App.urls_equal(tab.url, item.url)) {
        App.focus_tab(tab)
        return
      }
    }
  }
  
  chrome.tabs.create({url: item.url, active: close})

  if (close) {
    window.close()
  } else {
    item.element.classList.add("clicked")
  }
}

// Get window order
App.get_window_order = function () {
  let modes = ["tabs", "stars", "closed", "history"]
  let items = []

  for (let mode of modes) {
    items.push({mode: mode, index: App.settings[`${mode}_index`]})
  }

  items.sort((a, b) => (a.index > b.index) ? 1 : -1)
  App.window_order = items.map(x => x.mode)
}