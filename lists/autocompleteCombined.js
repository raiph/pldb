;(function (global, factory) {
  typeof exports === "object" && typeof module !== "undefined"
    ? (module.exports = factory())
    : typeof define === "function" && define.amd
    ? define(factory)
    : ((global = typeof globalThis !== "undefined" ? globalThis : global || self), (global.autocomplete = factory()))
})(this, function () {
  "use strict"

  /**
   * Copyright (c) 2016 Denys Krasnoshchok
   *
   * Homepage: https://smartscheduling.com/en/documentation/autocomplete
   * Source: https://github.com/kraaden/autocomplete
   *
   * MIT License
   */
  function autocomplete(settings) {
    // just an alias to minimize JS file size
    var doc = document
    var container = settings.container || doc.createElement("div")
    container.id = container.id || "autocomplete-" + uid()
    var containerStyle = container.style
    var debounceWaitMs = settings.debounceWaitMs || 0
    var preventSubmit = settings.preventSubmit || false
    var disableAutoSelect = settings.disableAutoSelect || false
    var customContainerParent = container.parentElement
    var items = []
    var inputValue = ""
    var minLen = 2
    var showOnFocus = settings.showOnFocus
    var selected
    var fetchCounter = 0
    var debounceTimer
    var destroyed = false
    if (settings.minLength !== undefined) {
      minLen = settings.minLength
    }
    if (!settings.input) {
      throw new Error("input undefined")
    }
    var input = settings.input
    container.className = "autocomplete " + (settings.className || "")
    container.setAttribute("role", "listbox")
    input.setAttribute("role", "combobox")
    input.setAttribute("aria-expanded", "false")
    input.setAttribute("aria-autocomplete", "list")
    input.setAttribute("aria-controls", container.id)
    input.setAttribute("aria-owns", container.id)
    input.setAttribute("aria-activedescendant", "")
    input.setAttribute("aria-haspopup", "listbox")
    // IOS implementation for fixed positioning has many bugs, so we will use absolute positioning
    containerStyle.position = "absolute"
    /**
     * Generate a very complex textual ID that greatly reduces the chance of a collision with another ID or text.
     */
    function uid() {
      return Date.now().toString(36) + Math.random().toString(36).substring(2)
    }
    /**
     * Detach the container from DOM
     */
    function detach() {
      var parent = container.parentNode
      if (parent) {
        parent.removeChild(container)
      }
    }
    /**
     * Clear debouncing timer if assigned
     */
    function clearDebounceTimer() {
      if (debounceTimer) {
        window.clearTimeout(debounceTimer)
      }
    }
    /**
     * Attach the container to DOM
     */
    function attach() {
      if (!container.parentNode) {
        ;(customContainerParent || doc.body).appendChild(container)
      }
    }
    /**
     * Check if container for autocomplete is displayed
     */
    function containerDisplayed() {
      return !!container.parentNode
    }
    /**
     * Clear autocomplete state and hide container
     */
    function clear() {
      // prevent the update call if there are pending AJAX requests
      fetchCounter++
      items = []
      inputValue = ""
      selected = undefined
      input.setAttribute("aria-activedescendant", "")
      input.setAttribute("aria-expanded", "false")
      detach()
    }
    /**
     * Update autocomplete position
     */
    function updatePosition() {
      if (!containerDisplayed()) {
        return
      }
      input.setAttribute("aria-expanded", "true")
      containerStyle.height = "auto"
      containerStyle.width = input.offsetWidth + "px"
      var maxHeight = 0
      var inputRect
      function calc() {
        var docEl = doc.documentElement
        var clientTop = docEl.clientTop || doc.body.clientTop || 0
        var clientLeft = docEl.clientLeft || doc.body.clientLeft || 0
        var scrollTop = window.pageYOffset || docEl.scrollTop
        var scrollLeft = window.pageXOffset || docEl.scrollLeft
        inputRect = input.getBoundingClientRect()
        var top = inputRect.top + input.offsetHeight + scrollTop - clientTop
        var left = inputRect.left + scrollLeft - clientLeft
        containerStyle.top = top + "px"
        containerStyle.left = left + "px"
        maxHeight = window.innerHeight - (inputRect.top + input.offsetHeight)
        if (maxHeight < 0) {
          maxHeight = 0
        }
        containerStyle.top = top + "px"
        containerStyle.bottom = ""
        containerStyle.left = left + "px"
        containerStyle.maxHeight = maxHeight + "px"
      }
      // the calc method must be called twice, otherwise the calculation may be wrong on resize event (chrome browser)
      calc()
      calc()
      if (settings.customize && inputRect) {
        settings.customize(input, inputRect, container, maxHeight)
      }
    }
    /**
     * Redraw the autocomplete div element with suggestions
     */
    function update() {
      container.innerHTML = ""
      input.setAttribute("aria-activedescendant", "")
      // function for rendering autocomplete suggestions
      var render = function (item, _, __) {
        var itemElement = doc.createElement("div")
        itemElement.textContent = item.label || ""
        return itemElement
      }
      if (settings.render) {
        render = settings.render
      }
      // function to render autocomplete groups
      var renderGroup = function (groupName, _) {
        var groupDiv = doc.createElement("div")
        groupDiv.textContent = groupName
        return groupDiv
      }
      if (settings.renderGroup) {
        renderGroup = settings.renderGroup
      }
      var fragment = doc.createDocumentFragment()
      var prevGroup = uid()
      items.forEach(function (item, index) {
        if (item.group && item.group !== prevGroup) {
          prevGroup = item.group
          var groupDiv = renderGroup(item.group, inputValue)
          if (groupDiv) {
            groupDiv.className += " group"
            fragment.appendChild(groupDiv)
          }
        }
        var div = render(item, inputValue, index)
        if (div) {
          div.id = container.id + "_" + index
          div.setAttribute("role", "option")
          div.addEventListener("click", function (ev) {
            settings.onSelect(item, input)
            clear()
            ev.preventDefault()
            ev.stopPropagation()
          })
          if (item === selected) {
            div.className += " selected"
            div.setAttribute("aria-selected", "true")
            input.setAttribute("aria-activedescendant", div.id)
          }
          fragment.appendChild(div)
        }
      })
      container.appendChild(fragment)
      if (items.length < 1) {
        if (settings.emptyMsg) {
          var empty = doc.createElement("div")
          empty.id = container.id + "_" + uid()
          empty.className = "empty"
          empty.textContent = settings.emptyMsg
          container.appendChild(empty)
          input.setAttribute("aria-activedescendant", empty.id)
        } else {
          clear()
          return
        }
      }
      attach()
      updatePosition()
      updateScroll()
    }
    function updateIfDisplayed() {
      if (containerDisplayed()) {
        update()
      }
    }
    function resizeEventHandler() {
      updateIfDisplayed()
    }
    function scrollEventHandler(e) {
      if (e.target !== container) {
        updateIfDisplayed()
      } else {
        e.preventDefault()
      }
    }
    function inputEventHandler() {
      fetch(0 /* Keyboard */)
    }
    /**
     * Automatically move scroll bar if selected item is not visible
     */
    function updateScroll() {
      var elements = container.getElementsByClassName("selected")
      if (elements.length > 0) {
        var element = elements[0]
        // make group visible
        var previous = element.previousElementSibling
        if (previous && previous.className.indexOf("group") !== -1 && !previous.previousElementSibling) {
          element = previous
        }
        if (element.offsetTop < container.scrollTop) {
          container.scrollTop = element.offsetTop
        } else {
          var selectBottom = element.offsetTop + element.offsetHeight
          var containerBottom = container.scrollTop + container.offsetHeight
          if (selectBottom > containerBottom) {
            container.scrollTop += selectBottom - containerBottom
          }
        }
      }
    }
    function selectPreviousSuggestion() {
      var index = items.indexOf(selected)
      selected = index === -1 ? undefined : items[(index + items.length - 1) % items.length]
    }
    function selectNextSuggestion() {
      var index = items.indexOf(selected)
      selected = items.length < 1 ? undefined : index === -1 ? items[0] : items[(index + 1) % items.length]
    }
    function handleArrowAndEscapeKeys(ev, key) {
      var containerIsDisplayed = containerDisplayed()
      if (key === "Escape") {
        clear()
      } else {
        if (!containerIsDisplayed || items.length < 1) {
          return
        }
        key === "ArrowUp" ? selectPreviousSuggestion() : selectNextSuggestion()
        update()
      }
      ev.preventDefault()
      if (containerIsDisplayed) {
        ev.stopPropagation()
      }
    }
    function handleEnterKey(ev) {
      if (selected) {
        settings.onSelect(selected, input)
        clear()
      }
      if (preventSubmit && input.value) {
        // Monkey patched this line. If someone hits enter and the form is blank, do not prevent default=> submit form
        ev.preventDefault()
      }
    }
    function keydownEventHandler(ev) {
      var key = ev.key
      switch (key) {
        case "ArrowUp":
        case "ArrowDown":
        case "Escape":
          handleArrowAndEscapeKeys(ev, key)
          break
        case "Enter":
          handleEnterKey(ev)
          break
      }
    }
    function focusEventHandler() {
      if (showOnFocus) {
        fetch(1 /* Focus */)
      }
    }
    function fetch(trigger) {
      if (input.value.length >= minLen || trigger === 1 /* Focus */) {
        clearDebounceTimer()
        debounceTimer = window.setTimeout(
          function () {
            return startFetch(input.value, trigger, input.selectionStart || 0)
          },
          trigger === 0 /* Keyboard */ || trigger === 2 /* Mouse */ ? debounceWaitMs : 0
        )
      } else {
        clear()
      }
    }
    function startFetch(inputText, trigger, cursorPos) {
      if (destroyed) return
      var savedFetchCounter = ++fetchCounter
      settings.fetch(
        inputText,
        function (elements) {
          if (fetchCounter === savedFetchCounter && elements) {
            items = elements
            inputValue = inputText
            selected = items.length < 1 || disableAutoSelect ? undefined : items[0]
            update()
          }
        },
        trigger,
        cursorPos
      )
    }
    function keyupEventHandler(e) {
      if (settings.keyup) {
        settings.keyup({
          event: e,
          fetch: function () {
            return fetch(0 /* Keyboard */)
          }
        })
        return
      }
      if (!containerDisplayed() && e.key === "ArrowDown") {
        fetch(0 /* Keyboard */)
      }
    }
    function clickEventHandler(e) {
      settings.click &&
        settings.click({
          event: e,
          fetch: function () {
            return fetch(2 /* Mouse */)
          }
        })
    }
    function blurEventHandler() {
      // when an item is selected by mouse click, the blur event will be initiated before the click event and remove DOM elements,
      // so that the click event will never be triggered. In order to avoid this issue, DOM removal should be delayed.
      setTimeout(function () {
        if (doc.activeElement !== input) {
          clear()
        }
      }, 200)
    }
    function manualFetch() {
      startFetch(input.value, 3 /* Manual */, input.selectionStart || 0)
    }
    /**
     * Fixes #26: on long clicks focus will be lost and onSelect method will not be called
     */
    container.addEventListener("mousedown", function (evt) {
      evt.stopPropagation()
      evt.preventDefault()
    })
    /**
     * Fixes #30: autocomplete closes when scrollbar is clicked in IE
     * See: https://stackoverflow.com/a/9210267/13172349
     */
    container.addEventListener("focus", function () {
      return input.focus()
    })
    /**
     * This function will remove DOM elements and clear event handlers
     */
    function destroy() {
      input.removeEventListener("focus", focusEventHandler)
      input.removeEventListener("keyup", keyupEventHandler)
      input.removeEventListener("click", clickEventHandler)
      input.removeEventListener("keydown", keydownEventHandler)
      input.removeEventListener("input", inputEventHandler)
      input.removeEventListener("blur", blurEventHandler)
      window.removeEventListener("resize", resizeEventHandler)
      doc.removeEventListener("scroll", scrollEventHandler, true)
      input.removeAttribute("role")
      input.removeAttribute("aria-expanded")
      input.removeAttribute("aria-autocomplete")
      input.removeAttribute("aria-controls")
      input.removeAttribute("aria-activedescendant")
      input.removeAttribute("aria-owns")
      input.removeAttribute("aria-haspopup")
      clearDebounceTimer()
      clear()
      destroyed = true
    }
    // setup event handlers
    input.addEventListener("keyup", keyupEventHandler)
    input.addEventListener("click", clickEventHandler)
    input.addEventListener("keydown", keydownEventHandler)
    input.addEventListener("input", inputEventHandler)
    input.addEventListener("blur", blurEventHandler)
    input.addEventListener("focus", focusEventHandler)
    window.addEventListener("resize", resizeEventHandler)
    doc.addEventListener("scroll", scrollEventHandler, true)
    return {
      destroy: destroy,
      fetch: manualFetch
    }
  }

  return autocomplete
})
//# sourceMappingURL=autocomplete.js.map

var autocompleteJs = [
  {
    "label": "C",
    "id": "c",
    "url": "/concepts/c.html"
  },
  {
    "label": "JavaScript",
    "id": "javascript",
    "url": "/concepts/javascript.html"
  },
  {
    "label": "Java",
    "id": "java",
    "url": "/concepts/java.html"
  },
  {
    "label": "C++",
    "id": "cpp",
    "url": "/concepts/cpp.html"
  },
  {
    "label": "MATLAB",
    "id": "matlab",
    "url": "/concepts/matlab.html"
  },
  {
    "label": "Python",
    "id": "python",
    "url": "/concepts/python.html"
  },
  {
    "label": "PHP",
    "id": "php",
    "url": "/concepts/php.html"
  },
  {
    "label": "R",
    "id": "r",
    "url": "/concepts/r.html"
  },
  {
    "label": "Ruby",
    "id": "ruby",
    "url": "/concepts/ruby.html"
  },
  {
    "label": "SQL",
    "id": "sql",
    "url": "/concepts/sql.html"
  },
  {
    "label": "Perl",
    "id": "perl",
    "url": "/concepts/perl.html"
  },
  {
    "label": "HTML",
    "id": "html",
    "url": "/concepts/html.html"
  },
  {
    "label": "Go",
    "id": "go",
    "url": "/concepts/go.html"
  },
  {
    "label": "CSS",
    "id": "css",
    "url": "/concepts/css.html"
  },
  {
    "label": "TypeScript",
    "id": "typescript",
    "url": "/concepts/typescript.html"
  },
  {
    "label": "C#",
    "id": "csharp",
    "url": "/concepts/csharp.html"
  },
  {
    "label": "Swift",
    "id": "swift",
    "url": "/concepts/swift.html"
  },
  {
    "label": "Scala",
    "id": "scala",
    "url": "/concepts/scala.html"
  },
  {
    "label": "Prolog",
    "id": "prolog",
    "url": "/concepts/prolog.html"
  },
  {
    "label": "Mathematica",
    "id": "mathematica",
    "url": "/concepts/mathematica.html"
  },
  {
    "label": "XML",
    "id": "xml",
    "url": "/concepts/xml.html"
  },
  {
    "label": "Kotlin",
    "id": "kotlin",
    "url": "/concepts/kotlin.html"
  },
  {
    "label": "SAS",
    "id": "sas",
    "url": "/concepts/sas.html"
  },
  {
    "label": "Rust",
    "id": "rust",
    "url": "/concepts/rust.html"
  },
  {
    "label": "Lua",
    "id": "lua",
    "url": "/concepts/lua.html"
  },
  {
    "label": "JSON",
    "id": "json",
    "url": "/concepts/json.html"
  },
  {
    "label": "PowerShell",
    "id": "powershell",
    "url": "/concepts/powershell.html"
  },
  {
    "label": "Clojure",
    "id": "clojure",
    "url": "/concepts/clojure.html"
  },
  {
    "label": "Solidity",
    "id": "solidity",
    "url": "/concepts/solidity.html"
  },
  {
    "label": "Bash",
    "id": "bash",
    "url": "/concepts/bash.html"
  },
  {
    "label": "Haskell",
    "id": "haskell",
    "url": "/concepts/haskell.html"
  },
  {
    "label": "COBOL",
    "id": "cobol",
    "url": "/concepts/cobol.html"
  },
  {
    "label": "Visual Basic",
    "id": "visual-basic",
    "url": "/concepts/visual-basic.html"
  },
  {
    "label": "Julia",
    "id": "julia",
    "url": "/concepts/julia.html"
  },
  {
    "label": "CUDA",
    "id": "cuda",
    "url": "/concepts/cuda.html"
  },
  {
    "label": "CoffeeScript",
    "id": "coffeescript",
    "url": "/concepts/coffeescript.html"
  },
  {
    "label": "Dart",
    "id": "dart",
    "url": "/concepts/dart.html"
  },
  {
    "label": "Elixir",
    "id": "elixir",
    "url": "/concepts/elixir.html"
  },
  {
    "label": "Objective-C",
    "id": "objective-c",
    "url": "/concepts/objective-c.html"
  },
  {
    "label": "Erlang",
    "id": "erlang",
    "url": "/concepts/erlang.html"
  },
  {
    "label": "Racket",
    "id": "racket",
    "url": "/concepts/racket.html"
  },
  {
    "label": "Ada",
    "id": "ada",
    "url": "/concepts/ada.html"
  },
  {
    "label": "Nim",
    "id": "nim",
    "url": "/concepts/nim.html"
  },
  {
    "label": "Crystal",
    "id": "crystal",
    "url": "/concepts/crystal.html"
  },
  {
    "label": "Reason",
    "id": "reason",
    "url": "/concepts/reason.html"
  },
  {
    "label": "Lisp",
    "id": "lisp",
    "url": "/concepts/lisp.html"
  },
  {
    "label": "Coq",
    "id": "coq",
    "url": "/concepts/coq.html"
  },
  {
    "label": "Chapel",
    "id": "chapel",
    "url": "/concepts/chapel.html"
  },
  {
    "label": "Pascal",
    "id": "pascal",
    "url": "/concepts/pascal.html"
  },
  {
    "label": "Zig",
    "id": "zig",
    "url": "/concepts/zig.html"
  },
  {
    "label": "PureScript",
    "id": "purescript",
    "url": "/concepts/purescript.html"
  },
  {
    "label": "Elm",
    "id": "elm",
    "url": "/concepts/elm.html"
  },
  {
    "label": "D",
    "id": "d",
    "url": "/concepts/d.html"
  },
  {
    "label": "GraphQL",
    "id": "graphql",
    "url": "/concepts/graphql.html"
  },
  {
    "label": "Pug",
    "id": "pug",
    "url": "/concepts/pug.html"
  },
  {
    "label": "ClojureScript",
    "id": "clojurescript",
    "url": "/concepts/clojurescript.html"
  },
  {
    "label": "Haxe",
    "id": "haxe",
    "url": "/concepts/haxe.html"
  },
  {
    "label": "WebAssembly",
    "id": "wasm",
    "url": "/concepts/wasm.html"
  },
  {
    "label": "Idris",
    "id": "idris",
    "url": "/concepts/idris.html"
  },
  {
    "label": "Visual Basic .NET",
    "id": "visual-basic.net",
    "url": "/concepts/visual-basic.net.html"
  },
  {
    "label": "LLVM IR",
    "id": "llvmir",
    "url": "/concepts/llvmir.html"
  },
  {
    "label": "YAML",
    "id": "yaml",
    "url": "/concepts/yaml.html"
  },
  {
    "label": "Smalltalk",
    "id": "smalltalk",
    "url": "/concepts/smalltalk.html"
  },
  {
    "label": "Scheme",
    "id": "scheme",
    "url": "/concepts/scheme.html"
  },
  {
    "label": "Groovy",
    "id": "groovy",
    "url": "/concepts/groovy.html"
  },
  {
    "label": "TOML",
    "id": "toml",
    "url": "/concepts/toml.html"
  },
  {
    "label": "F#",
    "id": "f-sharp",
    "url": "/concepts/f-sharp.html"
  },
  {
    "label": "Markdown",
    "id": "markdown",
    "url": "/concepts/markdown.html"
  },
  {
    "label": "VHDL",
    "id": "vhdl",
    "url": "/concepts/vhdl.html"
  },
  {
    "label": "HAML",
    "id": "haml",
    "url": "/concepts/haml.html"
  },
  {
    "label": "awk",
    "id": "awk",
    "url": "/concepts/awk.html"
  },
  {
    "label": "OCaml",
    "id": "ocaml",
    "url": "/concepts/ocaml.html"
  },
  {
    "label": "Liquid",
    "id": "liquid",
    "url": "/concepts/liquid.html"
  },
  {
    "label": "HCL",
    "id": "hcl",
    "url": "/concepts/hcl.html"
  },
  {
    "label": "Brainfuck",
    "id": "brainfuck",
    "url": "/concepts/brainfuck.html"
  },
  {
    "label": "APL",
    "id": "apl",
    "url": "/concepts/apl.html"
  },
  {
    "label": "Tex",
    "id": "tex",
    "url": "/concepts/tex.html"
  },
  {
    "label": "Forth",
    "id": "forth",
    "url": "/concepts/forth.html"
  },
  {
    "label": "Embedded Crystal",
    "id": "ecr",
    "url": "/concepts/ecr.html"
  },
  {
    "label": "OpenCL",
    "id": "opencl",
    "url": "/concepts/opencl.html"
  },
  {
    "label": "CMake",
    "id": "cmake",
    "url": "/concepts/cmake.html"
  },
  {
    "label": "JSON5",
    "id": "json5",
    "url": "/concepts/json5.html"
  },
  {
    "label": "Assembly language",
    "id": "assembly-language",
    "url": "/concepts/assembly-language.html"
  },
  {
    "label": "Lean",
    "id": "lean",
    "url": "/concepts/lean.html"
  },
  {
    "label": "Protocol Buffers",
    "id": "protobuf",
    "url": "/concepts/protobuf.html"
  },
  {
    "label": "Gradle",
    "id": "gradle",
    "url": "/concepts/gradle.html"
  },
  {
    "label": "Yacc",
    "id": "yacc",
    "url": "/concepts/yacc.html"
  },
  {
    "label": "Stata",
    "id": "stata",
    "url": "/concepts/stata.html"
  },
  {
    "label": "SaltStack",
    "id": "saltstack",
    "url": "/concepts/saltstack.html"
  },
  {
    "label": "SVG",
    "id": "svg",
    "url": "/concepts/svg.html"
  },
  {
    "label": "Slim",
    "id": "slim",
    "url": "/concepts/slim.html"
  },
  {
    "label": "Standard ML",
    "id": "standard-ml",
    "url": "/concepts/standard-ml.html"
  },
  {
    "label": "Ini",
    "id": "ini",
    "url": "/concepts/ini.html"
  },
  {
    "label": "odin",
    "id": "odin",
    "url": "/concepts/odin.html"
  },
  {
    "label": "Squirrel",
    "id": "squirrel",
    "url": "/concepts/squirrel.html"
  },
  {
    "label": "Z shell",
    "id": "z-shell",
    "url": "/concepts/z-shell.html"
  },
  {
    "label": "Sass",
    "id": "sass",
    "url": "/concepts/sass.html"
  },
  {
    "label": "IDL",
    "id": "idl",
    "url": "/concepts/idl.html"
  },
  {
    "label": "RobotFramework",
    "id": "robotframework",
    "url": "/concepts/robotframework.html"
  },
  {
    "label": "Dhall",
    "id": "dhall",
    "url": "/concepts/dhall.html"
  },
  {
    "label": "sed",
    "id": "sed",
    "url": "/concepts/sed.html"
  },
  {
    "label": "Fennel",
    "id": "fennel",
    "url": "/concepts/fennel.html"
  },
  {
    "label": "ABAP",
    "id": "abap",
    "url": "/concepts/abap.html"
  },
  {
    "label": "ActionScript",
    "id": "actionscript",
    "url": "/concepts/actionscript.html"
  },
  {
    "label": "MUMPS",
    "id": "mumps",
    "url": "/concepts/mumps.html"
  },
  {
    "label": "Puppet",
    "id": "puppet",
    "url": "/concepts/puppet.html"
  },
  {
    "label": "AutoHotkey",
    "id": "autohotkey",
    "url": "/concepts/autohotkey.html"
  },
  {
    "label": "starlark",
    "id": "starlark",
    "url": "/concepts/starlark.html"
  },
  {
    "label": "Bazel",
    "id": "bazel",
    "url": "/concepts/bazel.html"
  },
  {
    "label": "RAML",
    "id": "raml",
    "url": "/concepts/raml.html"
  },
  {
    "label": "EJS",
    "id": "ejs",
    "url": "/concepts/ejs.html"
  },
  {
    "label": "ColdFusion",
    "id": "coldfusion",
    "url": "/concepts/coldfusion.html"
  },
  {
    "label": "mustache",
    "id": "mustache",
    "url": "/concepts/mustache.html"
  },
  {
    "label": "Cython",
    "id": "cython",
    "url": "/concepts/cython.html"
  },
  {
    "label": "XQuery",
    "id": "xquery",
    "url": "/concepts/xquery.html"
  },
  {
    "label": "Less",
    "id": "less",
    "url": "/concepts/less.html"
  },
  {
    "label": "Korn shell",
    "id": "korn-shell",
    "url": "/concepts/korn-shell.html"
  },
  {
    "label": "Pig Latin",
    "id": "pig",
    "url": "/concepts/pig.html"
  },
  {
    "label": "Vala",
    "id": "vala",
    "url": "/concepts/vala.html"
  },
  {
    "label": "PL/I",
    "id": "pl-i",
    "url": "/concepts/pl-i.html"
  },
  {
    "label": "Imba",
    "id": "imba",
    "url": "/concepts/imba.html"
  },
  {
    "label": "QML",
    "id": "qml",
    "url": "/concepts/qml.html"
  },
  {
    "label": "Qt",
    "id": "qt",
    "url": "/concepts/qt.html"
  },
  {
    "label": "Agda",
    "id": "agda",
    "url": "/concepts/agda.html"
  },
  {
    "label": "Thrift",
    "id": "thrift",
    "url": "/concepts/thrift.html"
  },
  {
    "label": "x86 Assembly",
    "id": "x86-assembly",
    "url": "/concepts/x86-assembly.html"
  },
  {
    "label": "gleam",
    "id": "gleam",
    "url": "/concepts/gleam.html"
  },
  {
    "label": "DTrace",
    "id": "dtrace",
    "url": "/concepts/dtrace.html"
  },
  {
    "label": "M4",
    "id": "m4",
    "url": "/concepts/m4.html"
  },
  {
    "label": "Lex",
    "id": "lex",
    "url": "/concepts/lex.html"
  },
  {
    "label": "CSON",
    "id": "cson",
    "url": "/concepts/cson.html"
  },
  {
    "label": "Mojo",
    "id": "mojo",
    "url": "/concepts/mojo.html"
  },
  {
    "label": "Rexx",
    "id": "rexx",
    "url": "/concepts/rexx.html"
  },
  {
    "label": "PowerBuilder",
    "id": "powerbuilder",
    "url": "/concepts/powerbuilder.html"
  },
  {
    "label": "reStructuredText",
    "id": "restructuredtext",
    "url": "/concepts/restructuredtext.html"
  },
  {
    "label": "Clean",
    "id": "clean",
    "url": "/concepts/clean.html"
  },
  {
    "label": "HLSL",
    "id": "hlsl",
    "url": "/concepts/hlsl.html"
  },
  {
    "label": "MPS",
    "id": "mps",
    "url": "/concepts/mps.html"
  },
  {
    "label": "Nemerle",
    "id": "nemerle",
    "url": "/concepts/nemerle.html"
  },
  {
    "label": "Expect",
    "id": "expect",
    "url": "/concepts/expect.html"
  },
  {
    "label": "Twig",
    "id": "twig",
    "url": "/concepts/twig.html"
  },
  {
    "label": "JSP",
    "id": "java-server-pages",
    "url": "/concepts/java-server-pages.html"
  },
  {
    "label": "Bourne shell",
    "id": "bourne-shell",
    "url": "/concepts/bourne-shell.html"
  },
  {
    "label": "Svelte",
    "id": "svelte",
    "url": "/concepts/svelte.html"
  },
  {
    "label": "Ring",
    "id": "ring",
    "url": "/concepts/ring.html"
  },
  {
    "label": "Diff",
    "id": "diff",
    "url": "/concepts/diff.html"
  },
  {
    "label": "JCL",
    "id": "jcl",
    "url": "/concepts/jcl.html"
  },
  {
    "label": "xBase",
    "id": "xbase",
    "url": "/concepts/xbase.html"
  },
  {
    "label": "GLSL",
    "id": "glsl",
    "url": "/concepts/glsl.html"
  },
  {
    "label": "SugarSS",
    "id": "sugarss",
    "url": "/concepts/sugarss.html"
  },
  {
    "label": "Meson",
    "id": "meson",
    "url": "/concepts/meson.html"
  },
  {
    "label": "Grammar",
    "id": "grammar",
    "url": "/concepts/grammar.html"
  },
  {
    "label": "Xtend",
    "id": "xtend",
    "url": "/concepts/xtend.html"
  },
  {
    "label": "Metal",
    "id": "metal",
    "url": "/concepts/metal.html"
  },
  {
    "label": "Smarty",
    "id": "smarty",
    "url": "/concepts/smarty.html"
  },
  {
    "label": "LFE",
    "id": "lfe",
    "url": "/concepts/lfe.html"
  },
  {
    "label": "DTD",
    "id": "dtd",
    "url": "/concepts/dtd.html"
  },
  {
    "label": "basic calculator",
    "id": "bc",
    "url": "/concepts/bc.html"
  },
  {
    "label": "SCSS",
    "id": "scss",
    "url": "/concepts/scss.html"
  },
  {
    "label": "Vim script",
    "id": "vim-script",
    "url": "/concepts/vim-script.html"
  },
  {
    "label": "IGOR Pro",
    "id": "igor-pro",
    "url": "/concepts/igor-pro.html"
  },
  {
    "label": "Logtalk",
    "id": "logtalk",
    "url": "/concepts/logtalk.html"
  },
  {
    "label": "GDScript",
    "id": "gdscript",
    "url": "/concepts/gdscript.html"
  },
  {
    "label": "Stylus",
    "id": "stylus",
    "url": "/concepts/stylus.html"
  },
  {
    "label": "Harbour",
    "id": "harbour",
    "url": "/concepts/harbour.html"
  },
  {
    "label": "XAML",
    "id": "xaml",
    "url": "/concepts/xaml.html"
  },
  {
    "label": "Objective C++",
    "id": "objective-cpp",
    "url": "/concepts/objective-cpp.html"
  },
  {
    "label": "Logos",
    "id": "logos",
    "url": "/concepts/logos.html"
  },
  {
    "label": "AsciiDoc",
    "id": "asciidoc",
    "url": "/concepts/asciidoc.html"
  },
  {
    "label": "ERB",
    "id": "erb",
    "url": "/concepts/erb.html"
  },
  {
    "label": "Gherkin",
    "id": "gherkin",
    "url": "/concepts/gherkin.html"
  },
  {
    "label": "XSLT",
    "id": "xslt",
    "url": "/concepts/xslt.html"
  },
  {
    "label": "PL/M",
    "id": "pl-m",
    "url": "/concepts/pl-m.html"
  },
  {
    "label": "Nix",
    "id": "nix",
    "url": "/concepts/nix.html"
  },
  {
    "label": "Dockerfile",
    "id": "dockerfile",
    "url": "/concepts/dockerfile.html"
  },
  {
    "label": "Handlebars",
    "id": "handlebars",
    "url": "/concepts/handlebars.html"
  },
  {
    "label": "Mako",
    "id": "mako",
    "url": "/concepts/mako.html"
  },
  {
    "label": "C shell",
    "id": "c-shell",
    "url": "/concepts/c-shell.html"
  },
  {
    "label": "JSX",
    "id": "jsx",
    "url": "/concepts/jsx.html"
  },
  {
    "label": "CSV",
    "id": "csv",
    "url": "/concepts/csv.html"
  },
  {
    "label": "Blade",
    "id": "blade",
    "url": "/concepts/blade.html"
  },
  {
    "label": "EEX",
    "id": "eex",
    "url": "/concepts/eex.html"
  },
  {
    "label": "Brightscript",
    "id": "roku-brightscript",
    "url": "/concepts/roku-brightscript.html"
  },
  {
    "label": "FOCUS",
    "id": "focus",
    "url": "/concepts/focus.html"
  },
  {
    "label": "MXML",
    "id": "mxml",
    "url": "/concepts/mxml.html"
  },
  {
    "label": "Jupyter Notebook",
    "id": "jupyter-notebook",
    "url": "/concepts/jupyter-notebook.html"
  },
  {
    "label": "Speedie",
    "id": "speedie",
    "url": "/concepts/speedie.html"
  },
  {
    "label": "Cadence SKILL",
    "id": "cadence-skill",
    "url": "/concepts/cadence-skill.html"
  },
  {
    "label": "Raku",
    "id": "raku",
    "url": "/concepts/raku.html"
  },
  {
    "label": "Umka",
    "id": "umka",
    "url": "/concepts/umka.html"
  },
  {
    "label": "Rescript",
    "id": "rescript",
    "url": "/concepts/rescript.html"
  },
  {
    "label": "IPL",
    "id": "intuitionistic",
    "url": "/concepts/intuitionistic.html"
  },
  {
    "label": "Allegro Common Lisp",
    "id": "allegro-common-lisp",
    "url": "/concepts/allegro-common-lisp.html"
  },
  {
    "label": "Tree and Tabular Combined Notation",
    "id": "ttcn",
    "url": "/concepts/ttcn.html"
  },
  {
    "label": "hoon",
    "id": "hoon",
    "url": "/concepts/hoon.html"
  },
  {
    "label": "Velocity Template Language",
    "id": "vtl-lang",
    "url": "/concepts/vtl-lang.html"
  },
  {
    "label": "plantuml",
    "id": "plantuml",
    "url": "/concepts/plantuml.html"
  },
  {
    "label": "Make",
    "id": "make",
    "url": "/concepts/make.html"
  },
  {
    "label": "kernel",
    "id": "kernel",
    "url": "/concepts/kernel.html"
  },
  {
    "label": "FXML",
    "id": "fxml",
    "url": "/concepts/fxml.html"
  },
  {
    "label": "Ion",
    "id": "ion",
    "url": "/concepts/ion.html"
  },
  {
    "label": "XSD",
    "id": "xsd",
    "url": "/concepts/xsd.html"
  },
  {
    "label": "Soy",
    "id": "soy",
    "url": "/concepts/soy.html"
  },
  {
    "label": "ASP.NET",
    "id": "asp.net",
    "url": "/concepts/asp.net.html"
  },
  {
    "label": "Yedalog",
    "id": "yedalog",
    "url": "/concepts/yedalog.html"
  },
  {
    "label": "Fortran 90",
    "id": "fortran-90",
    "url": "/concepts/fortran-90.html"
  },
  {
    "label": "Fortran",
    "id": "fortran",
    "url": "/concepts/fortran.html"
  },
  {
    "label": "XHTML",
    "id": "xhtml",
    "url": "/concepts/xhtml.html"
  },
  {
    "label": "PostgreSQL",
    "id": "postgresql",
    "url": "/concepts/postgresql.html"
  },
  {
    "label": "Reactive Plan Language",
    "id": "rpl-lang",
    "url": "/concepts/rpl-lang.html"
  },
  {
    "label": "MySQL",
    "id": "mysql",
    "url": "/concepts/mysql.html"
  },
  {
    "label": "XML Metadata Interchange",
    "id": "xmi",
    "url": "/concepts/xmi.html"
  },
  {
    "label": "JSL",
    "id": "jsl",
    "url": "/concepts/jsl.html"
  },
  {
    "label": "SubX",
    "id": "subx",
    "url": "/concepts/subx.html"
  },
  {
    "label": "StruQL",
    "id": "struql",
    "url": "/concepts/struql.html"
  },
  {
    "label": "SPSS",
    "id": "spss",
    "url": "/concepts/spss.html"
  },
  {
    "label": "J",
    "id": "j",
    "url": "/concepts/j.html"
  },
  {
    "label": "ANTLR",
    "id": "antlr",
    "url": "/concepts/antlr.html"
  },
  {
    "label": "rbs",
    "id": "rbs",
    "url": "/concepts/rbs.html"
  },
  {
    "label": "QCL",
    "id": "qcl",
    "url": "/concepts/qcl.html"
  },
  {
    "label": "Rust MIR",
    "id": "rust-mir",
    "url": "/concepts/rust-mir.html"
  },
  {
    "label": "Module Management System",
    "id": "module-management-system",
    "url": "/concepts/module-management-system.html"
  },
  {
    "label": "C3",
    "id": "c3",
    "url": "/concepts/c3.html"
  },
  {
    "label": "LaTeX",
    "id": "latex",
    "url": "/concepts/latex.html"
  },
  {
    "label": "Red",
    "id": "red",
    "url": "/concepts/red.html"
  },
  {
    "label": "REBOL",
    "id": "rebol",
    "url": "/concepts/rebol.html"
  },
  {
    "label": "SQLite",
    "id": "sqlite",
    "url": "/concepts/sqlite.html"
  },
  {
    "label": "Tcl",
    "id": "tcl",
    "url": "/concepts/tcl.html"
  },
  {
    "label": "Common Lisp",
    "id": "common-lisp",
    "url": "/concepts/common-lisp.html"
  },
  {
    "label": "F*",
    "id": "fstar",
    "url": "/concepts/fstar.html"
  },
  {
    "label": "Node.js",
    "id": "nodejs",
    "url": "/concepts/nodejs.html"
  },
  {
    "label": "Eiffel",
    "id": "eiffel",
    "url": "/concepts/eiffel.html"
  },
  {
    "label": "Rust HIR",
    "id": "rust-hir",
    "url": "/concepts/rust-hir.html"
  },
  {
    "label": "Ruri",
    "id": "ruri",
    "url": "/concepts/ruri.html"
  },
  {
    "label": "Modula-2",
    "id": "modula-2",
    "url": "/concepts/modula-2.html"
  },
  {
    "label": "SIL",
    "id": "swift-il",
    "url": "/concepts/swift-il.html"
  },
  {
    "label": "Robots.txt",
    "id": "robots.txt",
    "url": "/concepts/robots.txt.html"
  },
  {
    "label": "Git",
    "id": "git",
    "url": "/concepts/git.html"
  },
  {
    "label": "AMPL",
    "id": "ampl",
    "url": "/concepts/ampl.html"
  },
  {
    "label": "Factor",
    "id": "factor",
    "url": "/concepts/factor.html"
  },
  {
    "label": "MediaWiki",
    "id": "mediawiki",
    "url": "/concepts/mediawiki.html"
  },
  {
    "label": "PostScript",
    "id": "postscript",
    "url": "/concepts/postscript.html"
  },
  {
    "label": "Deno",
    "id": "deno",
    "url": "/concepts/deno.html"
  },
  {
    "label": "ASP",
    "id": "asp",
    "url": "/concepts/asp.html"
  },
  {
    "label": "Makefile",
    "id": "makefile",
    "url": "/concepts/makefile.html"
  },
  {
    "label": "DIET",
    "id": "diet",
    "url": "/concepts/diet.html"
  },
  {
    "label": "Spill",
    "id": "spill",
    "url": "/concepts/spill.html"
  },
  {
    "label": "DOT",
    "id": "dot",
    "url": "/concepts/dot.html"
  },
  {
    "label": "ARM",
    "id": "arm",
    "url": "/concepts/arm.html"
  },
  {
    "label": "Delphi",
    "id": "delphi",
    "url": "/concepts/delphi.html"
  },
  {
    "label": "Verilog",
    "id": "verilog",
    "url": "/concepts/verilog.html"
  },
  {
    "label": "holyc",
    "id": "holyc",
    "url": "/concepts/holyc.html"
  },
  {
    "label": "fish",
    "id": "fish",
    "url": "/concepts/fish.html"
  },
  {
    "label": "PowerQuery M",
    "id": "power-query-m",
    "url": "/concepts/power-query-m.html"
  },
  {
    "label": "Oberon",
    "id": "oberon",
    "url": "/concepts/oberon.html"
  },
  {
    "label": "Icon",
    "id": "icon",
    "url": "/concepts/icon.html"
  },
  {
    "label": "Y",
    "id": "y",
    "url": "/concepts/y.html"
  },
  {
    "label": "PLZ",
    "id": "plz",
    "url": "/concepts/plz.html"
  },
  {
    "label": "NetLogo",
    "id": "netlogo",
    "url": "/concepts/netlogo.html"
  },
  {
    "label": "C2",
    "id": "c2",
    "url": "/concepts/c2.html"
  },
  {
    "label": "Hy",
    "id": "hy",
    "url": "/concepts/hy.html"
  },
  {
    "label": "Scratch",
    "id": "scratch",
    "url": "/concepts/scratch.html"
  },
  {
    "label": "sh",
    "id": "sh",
    "url": "/concepts/sh.html"
  },
  {
    "label": "Pony",
    "id": "pony",
    "url": "/concepts/pony.html"
  },
  {
    "label": "progsbase",
    "id": "progsbase",
    "url": "/concepts/progsbase.html"
  },
  {
    "label": "Maple",
    "id": "maple",
    "url": "/concepts/maple.html"
  },
  {
    "label": "SCROLL",
    "id": "scroll-lang",
    "url": "/concepts/scroll-lang.html"
  },
  {
    "label": "BASIC",
    "id": "basic",
    "url": "/concepts/basic.html"
  },
  {
    "label": "Arduino Programming Language",
    "id": "arduino",
    "url": "/concepts/arduino.html"
  },
  {
    "label": "K",
    "id": "k",
    "url": "/concepts/k.html"
  },
  {
    "label": "EDN",
    "id": "edn",
    "url": "/concepts/edn.html"
  },
  {
    "label": "Ceylon",
    "id": "ceylon",
    "url": "/concepts/ceylon.html"
  },
  {
    "label": "SBA",
    "id": "sba",
    "url": "/concepts/sba.html"
  },
  {
    "label": "PL/SQL",
    "id": "pl-sql",
    "url": "/concepts/pl-sql.html"
  },
  {
    "label": "Literate Agda",
    "id": "literate-agda",
    "url": "/concepts/literate-agda.html"
  },
  {
    "label": "ML",
    "id": "ml",
    "url": "/concepts/ml.html"
  },
  {
    "label": "Self",
    "id": "self",
    "url": "/concepts/self.html"
  },
  {
    "label": "Sapphire",
    "id": "sapphire",
    "url": "/concepts/sapphire.html"
  },
  {
    "label": "Opa",
    "id": "opa",
    "url": "/concepts/opa.html"
  },
  {
    "label": "Jule",
    "id": "jule",
    "url": "/concepts/jule.html"
  },
  {
    "label": "GNU Octave",
    "id": "octave",
    "url": "/concepts/octave.html"
  },
  {
    "label": "Ballerina",
    "id": "ballerina",
    "url": "/concepts/ballerina.html"
  },
  {
    "label": "Applescript",
    "id": "applescript",
    "url": "/concepts/applescript.html"
  },
  {
    "label": "MongoDB",
    "id": "mongodb",
    "url": "/concepts/mongodb.html"
  },
  {
    "label": "LabVIEW G",
    "id": "labview",
    "url": "/concepts/labview.html"
  },
  {
    "label": "MoonScript",
    "id": "moonscript",
    "url": "/concepts/moonscript.html"
  },
  {
    "label": "RAISE Specification Language",
    "id": "rsl",
    "url": "/concepts/rsl.html"
  },
  {
    "label": "VBScript",
    "id": "vbscript",
    "url": "/concepts/vbscript.html"
  },
  {
    "label": "Slope",
    "id": "slope",
    "url": "/concepts/slope.html"
  },
  {
    "label": "Q#",
    "id": "q-sharp",
    "url": "/concepts/q-sharp.html"
  },
  {
    "label": "Hack",
    "id": "hack",
    "url": "/concepts/hack.html"
  },
  {
    "label": "AspectJ",
    "id": "aspectj",
    "url": "/concepts/aspectj.html"
  },
  {
    "label": "Logo",
    "id": "logo",
    "url": "/concepts/logo.html"
  },
  {
    "label": "Koka",
    "id": "koka",
    "url": "/concepts/koka.html"
  },
  {
    "label": "AutoIt",
    "id": "autoit",
    "url": "/concepts/autoit.html"
  },
  {
    "label": "Dylan",
    "id": "dylan",
    "url": "/concepts/dylan.html"
  },
  {
    "label": "Boo",
    "id": "boo",
    "url": "/concepts/boo.html"
  },
  {
    "label": "X10",
    "id": "x10",
    "url": "/concepts/x10.html"
  },
  {
    "label": "Aardvark",
    "id": "aardvark",
    "url": "/concepts/aardvark.html"
  },
  {
    "label": "turnstile",
    "id": "turnstile",
    "url": "/concepts/turnstile.html"
  },
  {
    "label": "Arc",
    "id": "arc",
    "url": "/concepts/arc.html"
  },
  {
    "label": "Wren",
    "id": "wren",
    "url": "/concepts/wren.html"
  },
  {
    "label": "eC",
    "id": "ec",
    "url": "/concepts/ec.html"
  },
  {
    "label": "Io",
    "id": "io",
    "url": "/concepts/io.html"
  },
  {
    "label": "Red",
    "id": "red-lang",
    "url": "/concepts/red-lang.html"
  },
  {
    "label": "Emacs Lisp",
    "id": "emacs-lisp",
    "url": "/concepts/emacs-lisp.html"
  },
  {
    "label": "SystemVerilog",
    "id": "systemverilog",
    "url": "/concepts/systemverilog.html"
  },
  {
    "label": "SPARQL",
    "id": "sparql",
    "url": "/concepts/sparql.html"
  },
  {
    "label": "Coconut",
    "id": "coconut",
    "url": "/concepts/coconut.html"
  },
  {
    "label": "Felix",
    "id": "felix",
    "url": "/concepts/felix.html"
  },
  {
    "label": "Xojo",
    "id": "xojo",
    "url": "/concepts/xojo.html"
  },
  {
    "label": "Pike",
    "id": "pike",
    "url": "/concepts/pike.html"
  },
  {
    "label": "Modula-3",
    "id": "modula-3",
    "url": "/concepts/modula-3.html"
  },
  {
    "label": "Wolfram Language",
    "id": "wolfram",
    "url": "/concepts/wolfram.html"
  },
  {
    "label": "Apex",
    "id": "apex",
    "url": "/concepts/apex.html"
  },
  {
    "label": "Timeless Instruction Set (TL ISA)",
    "id": "tl-isa",
    "url": "/concepts/tl-isa.html"
  },
  {
    "label": "Croc",
    "id": "croc",
    "url": "/concepts/croc.html"
  },
  {
    "label": "Golo",
    "id": "golo",
    "url": "/concepts/golo.html"
  },
  {
    "label": "Tick C",
    "id": "tick-c",
    "url": "/concepts/tick-c.html"
  },
  {
    "label": "Processing",
    "id": "processing",
    "url": "/concepts/processing.html"
  },
  {
    "label": "V",
    "id": "v",
    "url": "/concepts/v.html"
  },
  {
    "label": "Ioke",
    "id": "ioke",
    "url": "/concepts/ioke.html"
  },
  {
    "label": "Bel",
    "id": "bel",
    "url": "/concepts/bel.html"
  },
  {
    "label": "PostCSS",
    "id": "postcss",
    "url": "/concepts/postcss.html"
  },
  {
    "label": "Lasso",
    "id": "lasso",
    "url": "/concepts/lasso.html"
  },
  {
    "label": "Oz",
    "id": "oz",
    "url": "/concepts/oz.html"
  },
  {
    "label": "PEG.js",
    "id": "pegjs",
    "url": "/concepts/pegjs.html"
  },
  {
    "label": "JSON-LD",
    "id": "json-ld",
    "url": "/concepts/json-ld.html"
  },
  {
    "label": "Zephir",
    "id": "zephir",
    "url": "/concepts/zephir.html"
  },
  {
    "label": "Frege",
    "id": "frege",
    "url": "/concepts/frege.html"
  },
  {
    "label": "Mercury",
    "id": "mercury",
    "url": "/concepts/mercury.html"
  },
  {
    "label": "KaTeX",
    "id": "katex",
    "url": "/concepts/katex.html"
  },
  {
    "label": "Nginx",
    "id": "nginx-config",
    "url": "/concepts/nginx-config.html"
  },
  {
    "label": "JQuery",
    "id": "jquery",
    "url": "/concepts/jquery.html"
  },
  {
    "label": "GAP",
    "id": "gap",
    "url": "/concepts/gap.html"
  },
  {
    "label": "Simula",
    "id": "simula",
    "url": "/concepts/simula.html"
  },
  {
    "label": "Monkey",
    "id": "monkey",
    "url": "/concepts/monkey.html"
  },
  {
    "label": "FLUX",
    "id": "flux",
    "url": "/concepts/flux.html"
  },
  {
    "label": "Terra",
    "id": "terra",
    "url": "/concepts/terra.html"
  },
  {
    "label": "Scilab",
    "id": "scilab",
    "url": "/concepts/scilab.html"
  },
  {
    "label": "LiveCode",
    "id": "livecode",
    "url": "/concepts/livecode.html"
  },
  {
    "label": "Dafny",
    "id": "dafny",
    "url": "/concepts/dafny.html"
  },
  {
    "label": "FML",
    "id": "fml-lang",
    "url": "/concepts/fml-lang.html"
  },
  {
    "label": "SuperCollider",
    "id": "supercollider",
    "url": "/concepts/supercollider.html"
  },
  {
    "label": "Euphoria",
    "id": "euphoria",
    "url": "/concepts/euphoria.html"
  },
  {
    "label": "Futhark",
    "id": "futhark",
    "url": "/concepts/futhark.html"
  },
  {
    "label": "WordPress",
    "id": "wordpress",
    "url": "/concepts/wordpress.html"
  },
  {
    "label": "Fantom",
    "id": "fantom",
    "url": "/concepts/fantom.html"
  },
  {
    "label": "ATS",
    "id": "ats",
    "url": "/concepts/ats.html"
  },
  {
    "label": "Tree Notation",
    "id": "treenotation",
    "url": "/concepts/treenotation.html"
  },
  {
    "label": "Rockstar",
    "id": "rockstar",
    "url": "/concepts/rockstar.html"
  },
  {
    "label": "Batchfile",
    "id": "batch",
    "url": "/concepts/batch.html"
  },
  {
    "label": "Fibonacci",
    "id": "fibonacci",
    "url": "/concepts/fibonacci.html"
  },
  {
    "label": "Nit",
    "id": "nit",
    "url": "/concepts/nit.html"
  },
  {
    "label": "mlir",
    "id": "mlir",
    "url": "/concepts/mlir.html"
  },
  {
    "label": "Redis",
    "id": "redis",
    "url": "/concepts/redis.html"
  },
  {
    "label": "JS++",
    "id": "jspp",
    "url": "/concepts/jspp.html"
  },
  {
    "label": "XL",
    "id": "xl-lang",
    "url": "/concepts/xl-lang.html"
  },
  {
    "label": "ppm-format",
    "id": "ppm-format",
    "url": "/concepts/ppm-format.html"
  },
  {
    "label": "E",
    "id": "e",
    "url": "/concepts/e.html"
  },
  {
    "label": "ooc",
    "id": "ooc",
    "url": "/concepts/ooc.html"
  },
  {
    "label": "Whiley",
    "id": "whiley",
    "url": "/concepts/whiley.html"
  },
  {
    "label": "HTTP",
    "id": "http",
    "url": "/concepts/http.html"
  },
  {
    "label": "Maxima",
    "id": "maxima",
    "url": "/concepts/maxima.html"
  },
  {
    "label": "Angelscript",
    "id": "angelscript",
    "url": "/concepts/angelscript.html"
  },
  {
    "label": "Datalog",
    "id": "datalog",
    "url": "/concepts/datalog.html"
  },
  {
    "label": "Fancy",
    "id": "fancy",
    "url": "/concepts/fancy.html"
  },
  {
    "label": "Sage",
    "id": "sagemath",
    "url": "/concepts/sagemath.html"
  },
  {
    "label": "NewLisp",
    "id": "newlisp",
    "url": "/concepts/newlisp.html"
  },
  {
    "label": "Shen",
    "id": "shen",
    "url": "/concepts/shen.html"
  },
  {
    "label": "Gosu",
    "id": "gosu",
    "url": "/concepts/gosu.html"
  },
  {
    "label": "carp",
    "id": "carp",
    "url": "/concepts/carp.html"
  },
  {
    "label": "Isabelle",
    "id": "isabelle",
    "url": "/concepts/isabelle.html"
  },
  {
    "label": "SquidConf",
    "id": "squidconf",
    "url": "/concepts/squidconf.html"
  },
  {
    "label": "Ren",
    "id": "ren-notation",
    "url": "/concepts/ren-notation.html"
  },
  {
    "label": "Smali",
    "id": "smali",
    "url": "/concepts/smali.html"
  },
  {
    "label": "Modelica",
    "id": "modelica",
    "url": "/concepts/modelica.html"
  },
  {
    "label": "LiveScript",
    "id": "livescript",
    "url": "/concepts/livescript.html"
  },
  {
    "label": "CLIPS",
    "id": "clips",
    "url": "/concepts/clips.html"
  },
  {
    "label": "ALGOL 60",
    "id": "algol-60",
    "url": "/concepts/algol-60.html"
  },
  {
    "label": "QBasic",
    "id": "qbasic",
    "url": "/concepts/qbasic.html"
  },
  {
    "label": "MiniD",
    "id": "minid",
    "url": "/concepts/minid.html"
  },
  {
    "label": "PureBasic",
    "id": "purebasic",
    "url": "/concepts/purebasic.html"
  },
  {
    "label": "BCPL",
    "id": "bcpl",
    "url": "/concepts/bcpl.html"
  },
  {
    "label": "Boron",
    "id": "boron",
    "url": "/concepts/boron.html"
  },
  {
    "label": "Ligo",
    "id": "ligo",
    "url": "/concepts/ligo.html"
  },
  {
    "label": "Manim",
    "id": "manim",
    "url": "/concepts/manim.html"
  },
  {
    "label": "SoQL",
    "id": "social-networks-query-language",
    "url": "/concepts/social-networks-query-language.html"
  },
  {
    "label": "JAI",
    "id": "jai",
    "url": "/concepts/jai.html"
  },
  {
    "label": "wisp",
    "id": "wisp",
    "url": "/concepts/wisp.html"
  },
  {
    "label": "Cryptol",
    "id": "cryptol",
    "url": "/concepts/cryptol.html"
  },
  {
    "label": "Seed7",
    "id": "seed7",
    "url": "/concepts/seed7.html"
  },
  {
    "label": "API Blueprint",
    "id": "api-blueprint",
    "url": "/concepts/api-blueprint.html"
  },
  {
    "label": "Concise Encoding",
    "id": "concise-encoding",
    "url": "/concepts/concise-encoding.html"
  },
  {
    "label": "Netpbm grayscale image format",
    "id": "pgm-format",
    "url": "/concepts/pgm-format.html"
  },
  {
    "label": "Cap'n Proto",
    "id": "capn-proto",
    "url": "/concepts/capn-proto.html"
  },
  {
    "label": "janet",
    "id": "janet",
    "url": "/concepts/janet.html"
  },
  {
    "label": "SMDL",
    "id": "smdl",
    "url": "/concepts/smdl.html"
  },
  {
    "label": "Scroll",
    "id": "scroll",
    "url": "/concepts/scroll.html"
  },
  {
    "label": "LOLCODE",
    "id": "lolcode",
    "url": "/concepts/lolcode.html"
  },
  {
    "label": "Perl 6",
    "id": "perl-6",
    "url": "/concepts/perl-6.html"
  },
  {
    "label": "Linden Scripting Language",
    "id": "lsl",
    "url": "/concepts/lsl.html"
  },
  {
    "label": "Flow9",
    "id": "flow9",
    "url": "/concepts/flow9.html"
  },
  {
    "label": "SNOBOL",
    "id": "snobol",
    "url": "/concepts/snobol.html"
  },
  {
    "label": "Unicon",
    "id": "unicon",
    "url": "/concepts/unicon.html"
  },
  {
    "label": "Portable Bit Map Format",
    "id": "pbm-format",
    "url": "/concepts/pbm-format.html"
  },
  {
    "label": "POV-Ray SDL",
    "id": "pov-ray-sdl",
    "url": "/concepts/pov-ray-sdl.html"
  },
  {
    "label": "ECL",
    "id": "ecl",
    "url": "/concepts/ecl.html"
  },
  {
    "label": "CIL",
    "id": "cil",
    "url": "/concepts/cil.html"
  },
  {
    "label": "HyperTalk",
    "id": "hypertalk",
    "url": "/concepts/hypertalk.html"
  },
  {
    "label": "Explorer",
    "id": "explorer",
    "url": "/concepts/explorer.html"
  },
  {
    "label": "Dogescript",
    "id": "dogescript",
    "url": "/concepts/dogescript.html"
  },
  {
    "label": "Bicep",
    "id": "bicep",
    "url": "/concepts/bicep.html"
  },
  {
    "label": "PRQL",
    "id": "prql",
    "url": "/concepts/prql.html"
  },
  {
    "label": "Bison",
    "id": "bison",
    "url": "/concepts/bison.html"
  },
  {
    "label": "Transact-SQL",
    "id": "transact-sql",
    "url": "/concepts/transact-sql.html"
  },
  {
    "label": "Nearley",
    "id": "nearley",
    "url": "/concepts/nearley.html"
  },
  {
    "label": "PL/pgSQL",
    "id": "plpgsql",
    "url": "/concepts/plpgsql.html"
  },
  {
    "label": "Observable",
    "id": "observable-lang",
    "url": "/concepts/observable-lang.html"
  },
  {
    "label": "Android",
    "id": "android",
    "url": "/concepts/android.html"
  },
  {
    "label": "Limbo",
    "id": "limbo",
    "url": "/concepts/limbo.html"
  },
  {
    "label": "Turing",
    "id": "turing",
    "url": "/concepts/turing.html"
  },
  {
    "label": "Maude",
    "id": "maude",
    "url": "/concepts/maude.html"
  },
  {
    "label": "BlitzMax",
    "id": "blitzmax",
    "url": "/concepts/blitzmax.html"
  },
  {
    "label": "JSON with Comments",
    "id": "json-with-comments",
    "url": "/concepts/json-with-comments.html"
  },
  {
    "label": "PAMELA",
    "id": "pamela",
    "url": "/concepts/pamela.html"
  },
  {
    "label": "CWL",
    "id": "common-workflow-language",
    "url": "/concepts/common-workflow-language.html"
  },
  {
    "label": "HOPE",
    "id": "hope",
    "url": "/concepts/hope.html"
  },
  {
    "label": "Luna",
    "id": "luna",
    "url": "/concepts/luna.html"
  },
  {
    "label": "Hjson",
    "id": "hjson",
    "url": "/concepts/hjson.html"
  },
  {
    "label": "Q",
    "id": "q",
    "url": "/concepts/q.html"
  },
  {
    "label": "Gnuplot",
    "id": "gnuplot",
    "url": "/concepts/gnuplot.html"
  },
  {
    "label": "Interleaved Notation",
    "id": "interleaved-notation",
    "url": "/concepts/interleaved-notation.html"
  },
  {
    "label": "Classroom Object Oriented Language",
    "id": "cool",
    "url": "/concepts/cool.html"
  },
  {
    "label": "Ruby on Rails",
    "id": "rails",
    "url": "/concepts/rails.html"
  },
  {
    "label": "Manchester syntax",
    "id": "manchester-syntax",
    "url": "/concepts/manchester-syntax.html"
  },
  {
    "label": "RDF",
    "id": "rdf",
    "url": "/concepts/rdf.html"
  },
  {
    "label": "NSIS",
    "id": "nsis",
    "url": "/concepts/nsis.html"
  },
  {
    "label": "OX",
    "id": "ox",
    "url": "/concepts/ox.html"
  },
  {
    "label": "MIPS architecture",
    "id": "mips",
    "url": "/concepts/mips.html"
  },
  {
    "label": "VBA",
    "id": "vba",
    "url": "/concepts/vba.html"
  },
  {
    "label": "NumPy",
    "id": "numpy",
    "url": "/concepts/numpy.html"
  },
  {
    "label": "Click",
    "id": "click",
    "url": "/concepts/click.html"
  },
  {
    "label": "Org",
    "id": "org",
    "url": "/concepts/org.html"
  },
  {
    "label": "popr",
    "id": "popr",
    "url": "/concepts/popr.html"
  },
  {
    "label": "Befunge",
    "id": "befunge",
    "url": "/concepts/befunge.html"
  },
  {
    "label": "ArkScript",
    "id": "arkscript",
    "url": "/concepts/arkscript.html"
  },
  {
    "label": "Inform",
    "id": "inform",
    "url": "/concepts/inform.html"
  },
  {
    "label": "GAML",
    "id": "gaml",
    "url": "/concepts/gaml.html"
  },
  {
    "label": "Csound",
    "id": "csound",
    "url": "/concepts/csound.html"
  },
  {
    "label": "praxis-lang",
    "id": "praxis-lang",
    "url": "/concepts/praxis-lang.html"
  },
  {
    "label": "Cobra",
    "id": "cobra",
    "url": "/concepts/cobra.html"
  },
  {
    "label": "SNOBOL4",
    "id": "snobol4",
    "url": "/concepts/snobol4.html"
  },
  {
    "label": "Finite State Language",
    "id": "fsl",
    "url": "/concepts/fsl.html"
  },
  {
    "label": "WDL",
    "id": "wdl",
    "url": "/concepts/wdl.html"
  },
  {
    "label": "Linux",
    "id": "linux",
    "url": "/concepts/linux.html"
  },
  {
    "label": "Jinja",
    "id": "jinja",
    "url": "/concepts/jinja.html"
  },
  {
    "label": "FLEX",
    "id": "flex",
    "url": "/concepts/flex.html"
  },
  {
    "label": "Objective-J",
    "id": "objective-j",
    "url": "/concepts/objective-j.html"
  },
  {
    "label": "Parser 3",
    "id": "parser",
    "url": "/concepts/parser.html"
  },
  {
    "label": "PicoLisp",
    "id": "picolisp",
    "url": "/concepts/picolisp.html"
  },
  {
    "label": "Falcon",
    "id": "falcon",
    "url": "/concepts/falcon.html"
  },
  {
    "label": "CodeMirror",
    "id": "codemirror",
    "url": "/concepts/codemirror.html"
  },
  {
    "label": "monte",
    "id": "monte",
    "url": "/concepts/monte.html"
  },
  {
    "label": "Nextflow",
    "id": "nextflow",
    "url": "/concepts/nextflow.html"
  },
  {
    "label": "Oberon-2",
    "id": "oberon-2",
    "url": "/concepts/oberon-2.html"
  },
  {
    "label": "Neko",
    "id": "neko",
    "url": "/concepts/neko.html"
  },
  {
    "label": "UNLAMBDA",
    "id": "unlambda",
    "url": "/concepts/unlambda.html"
  },
  {
    "label": "OWL",
    "id": "owl",
    "url": "/concepts/owl.html"
  },
  {
    "label": "Flow",
    "id": "flow",
    "url": "/concepts/flow.html"
  },
  {
    "label": "Eve",
    "id": "eve",
    "url": "/concepts/eve.html"
  },
  {
    "label": "Jsonnet",
    "id": "jsonnet",
    "url": "/concepts/jsonnet.html"
  },
  {
    "label": "TLA",
    "id": "tla",
    "url": "/concepts/tla.html"
  },
  {
    "label": "parasail",
    "id": "parasail",
    "url": "/concepts/parasail.html"
  },
  {
    "label": "jq",
    "id": "jq",
    "url": "/concepts/jq.html"
  },
  {
    "label": "Object Pascal",
    "id": "object-pascal",
    "url": "/concepts/object-pascal.html"
  },
  {
    "label": "Rapira",
    "id": "rapira",
    "url": "/concepts/rapira.html"
  },
  {
    "label": "NCAR Command Language",
    "id": "ncl",
    "url": "/concepts/ncl.html"
  },
  {
    "label": "SourcePawn",
    "id": "sourcepawn",
    "url": "/concepts/sourcepawn.html"
  },
  {
    "label": "beef-lang",
    "id": "beef",
    "url": "/concepts/beef.html"
  },
  {
    "label": "hurl",
    "id": "hurl",
    "url": "/concepts/hurl.html"
  },
  {
    "label": "Sophia",
    "id": "sophia",
    "url": "/concepts/sophia.html"
  },
  {
    "label": "Turtle",
    "id": "turtle",
    "url": "/concepts/turtle.html"
  },
  {
    "label": "groff",
    "id": "groff",
    "url": "/concepts/groff.html"
  },
  {
    "label": "omega",
    "id": "omega",
    "url": "/concepts/omega.html"
  },
  {
    "label": "Vue",
    "id": "vuejs",
    "url": "/concepts/vuejs.html"
  },
  {
    "label": "Caml",
    "id": "caml",
    "url": "/concepts/caml.html"
  },
  {
    "label": "Cell",
    "id": "cell",
    "url": "/concepts/cell.html"
  },
  {
    "label": "Linux Kernel Module",
    "id": "linux-kernel-module",
    "url": "/concepts/linux-kernel-module.html"
  },
  {
    "label": "Curl",
    "id": "curl",
    "url": "/concepts/curl.html"
  },
  {
    "label": "Ragel",
    "id": "ragel",
    "url": "/concepts/ragel.html"
  },
  {
    "label": "Pharo",
    "id": "pharo",
    "url": "/concepts/pharo.html"
  },
  {
    "label": "Halide",
    "id": "halide",
    "url": "/concepts/halide.html"
  },
  {
    "label": "Tea",
    "id": "tea",
    "url": "/concepts/tea.html"
  },
  {
    "label": "Mirah",
    "id": "mirah",
    "url": "/concepts/mirah.html"
  },
  {
    "label": "Alloy",
    "id": "alloy",
    "url": "/concepts/alloy.html"
  },
  {
    "label": "Genie",
    "id": "genie",
    "url": "/concepts/genie.html"
  },
  {
    "label": "Mask",
    "id": "maskjs",
    "url": "/concepts/maskjs.html"
  },
  {
    "label": "Pan",
    "id": "pan",
    "url": "/concepts/pan.html"
  },
  {
    "label": "DM",
    "id": "dm",
    "url": "/concepts/dm.html"
  },
  {
    "label": "webql",
    "id": "webql",
    "url": "/concepts/webql.html"
  },
  {
    "label": "Enso",
    "id": "enso",
    "url": "/concepts/enso.html"
  },
  {
    "label": "MicroPython",
    "id": "micropython",
    "url": "/concepts/micropython.html"
  },
  {
    "label": "kitten",
    "id": "kitten",
    "url": "/concepts/kitten.html"
  },
  {
    "label": "roy",
    "id": "roy",
    "url": "/concepts/roy.html"
  },
  {
    "label": "Scala.js",
    "id": "scala-js",
    "url": "/concepts/scala-js.html"
  },
  {
    "label": "gravity",
    "id": "gravity",
    "url": "/concepts/gravity.html"
  },
  {
    "label": "idyll",
    "id": "idyll",
    "url": "/concepts/idyll.html"
  },
  {
    "label": "Djot",
    "id": "djot",
    "url": "/concepts/djot.html"
  },
  {
    "label": "OpenSCAD",
    "id": "openscad",
    "url": "/concepts/openscad.html"
  },
  {
    "label": "LilyPond",
    "id": "lilypond",
    "url": "/concepts/lilypond.html"
  },
  {
    "label": "Yorick",
    "id": "yorick",
    "url": "/concepts/yorick.html"
  },
  {
    "label": "Frink",
    "id": "frink",
    "url": "/concepts/frink.html"
  },
  {
    "label": "P4",
    "id": "p4",
    "url": "/concepts/p4.html"
  },
  {
    "label": "Zimpl",
    "id": "zimpl",
    "url": "/concepts/zimpl.html"
  },
  {
    "label": "Sather",
    "id": "sather",
    "url": "/concepts/sather.html"
  },
  {
    "label": "Refal",
    "id": "refal",
    "url": "/concepts/refal.html"
  },
  {
    "label": "BETA",
    "id": "beta",
    "url": "/concepts/beta.html"
  },
  {
    "label": "GraphQL Schema Definition Language",
    "id": "graphql-sdl",
    "url": "/concepts/graphql-sdl.html"
  },
  {
    "label": "JADE",
    "id": "jade",
    "url": "/concepts/jade.html"
  },
  {
    "label": "Ch",
    "id": "chuck",
    "url": "/concepts/chuck.html"
  },
  {
    "label": "clay",
    "id": "clay",
    "url": "/concepts/clay.html"
  },
  {
    "label": "Filebench WML",
    "id": "filebench-wml",
    "url": "/concepts/filebench-wml.html"
  },
  {
    "label": "Clipper",
    "id": "clipper",
    "url": "/concepts/clipper.html"
  },
  {
    "label": "Myghty",
    "id": "myghty",
    "url": "/concepts/myghty.html"
  },
  {
    "label": "Emojicode",
    "id": "emojicode",
    "url": "/concepts/emojicode.html"
  },
  {
    "label": "Mu",
    "id": "mu",
    "url": "/concepts/mu.html"
  },
  {
    "label": "MAXScript",
    "id": "maxscript",
    "url": "/concepts/maxscript.html"
  },
  {
    "label": "YARA",
    "id": "yara",
    "url": "/concepts/yara.html"
  },
  {
    "label": "Lily",
    "id": "lily",
    "url": "/concepts/lily.html"
  },
  {
    "label": "Occam",
    "id": "occam",
    "url": "/concepts/occam.html"
  },
  {
    "label": "EBNF",
    "id": "ebnf",
    "url": "/concepts/ebnf.html"
  },
  {
    "label": "AsciiDots",
    "id": "asciidots",
    "url": "/concepts/asciidots.html"
  },
  {
    "label": "Spatial",
    "id": "spatial",
    "url": "/concepts/spatial.html"
  },
  {
    "label": "Pawn",
    "id": "pawn-scripting-language",
    "url": "/concepts/pawn-scripting-language.html"
  },
  {
    "label": "Nial",
    "id": "nial",
    "url": "/concepts/nial.html"
  },
  {
    "label": "Game Maker Language",
    "id": "game-maker-language",
    "url": "/concepts/game-maker-language.html"
  },
  {
    "label": "PARI/GP",
    "id": "pari-gp",
    "url": "/concepts/pari-gp.html"
  },
  {
    "label": "AviSynth",
    "id": "avi-synth",
    "url": "/concepts/avi-synth.html"
  },
  {
    "label": "JFlex",
    "id": "jflex",
    "url": "/concepts/jflex.html"
  },
  {
    "label": "Eclipse Command Language",
    "id": "eclipse-command-language",
    "url": "/concepts/eclipse-command-language.html"
  },
  {
    "label": "npm",
    "id": "npm-pm",
    "url": "/concepts/npm-pm.html"
  },
  {
    "label": "RATFOR",
    "id": "ratfor",
    "url": "/concepts/ratfor.html"
  },
  {
    "label": "Jison",
    "id": "jison",
    "url": "/concepts/jison.html"
  },
  {
    "label": "CouchDB",
    "id": "couchdb",
    "url": "/concepts/couchdb.html"
  },
  {
    "label": "ABC",
    "id": "abc",
    "url": "/concepts/abc.html"
  },
  {
    "label": "ink",
    "id": "ink",
    "url": "/concepts/ink.html"
  },
  {
    "label": "Closure Templates",
    "id": "closure-templates",
    "url": "/concepts/closure-templates.html"
  },
  {
    "label": "Stan",
    "id": "stan",
    "url": "/concepts/stan.html"
  },
  {
    "label": "B",
    "id": "b",
    "url": "/concepts/b.html"
  },
  {
    "label": "SETL",
    "id": "setl",
    "url": "/concepts/setl.html"
  },
  {
    "label": "nimrod",
    "id": "nimrod",
    "url": "/concepts/nimrod.html"
  },
  {
    "label": "Ninja",
    "id": "ninja",
    "url": "/concepts/ninja.html"
  },
  {
    "label": "RPG",
    "id": "ibm-rpg",
    "url": "/concepts/ibm-rpg.html"
  },
  {
    "label": "Monaco Editor",
    "id": "monaco",
    "url": "/concepts/monaco.html"
  },
  {
    "label": "kaitai",
    "id": "kaitai",
    "url": "/concepts/kaitai.html"
  },
  {
    "label": "YASnippet",
    "id": "yasnippet",
    "url": "/concepts/yasnippet.html"
  },
  {
    "label": "Ezhil",
    "id": "ezhil",
    "url": "/concepts/ezhil.html"
  },
  {
    "label": "Volt",
    "id": "volt",
    "url": "/concepts/volt.html"
  },
  {
    "label": "tremor-query",
    "id": "tremor-query",
    "url": "/concepts/tremor-query.html"
  },
  {
    "label": "Qalb",
    "id": "qalb",
    "url": "/concepts/qalb.html"
  },
  {
    "label": "Jasmin",
    "id": "jasmin",
    "url": "/concepts/jasmin.html"
  },
  {
    "label": "AGC",
    "id": "apollo-guidance-computer",
    "url": "/concepts/apollo-guidance-computer.html"
  },
  {
    "label": "Semantic Versioning",
    "id": "semver",
    "url": "/concepts/semver.html"
  },
  {
    "label": "Modified Integration Digital Analog Simulator",
    "id": "midas",
    "url": "/concepts/midas.html"
  },
  {
    "label": "mathics",
    "id": "mathics",
    "url": "/concepts/mathics.html"
  },
  {
    "label": "TensorFlow",
    "id": "tensorflow",
    "url": "/concepts/tensorflow.html"
  },
  {
    "label": "Magit",
    "id": "magit",
    "url": "/concepts/magit.html"
  },
  {
    "label": "Prolog Pack",
    "id": "prolog-pack-pm",
    "url": "/concepts/prolog-pack-pm.html"
  },
  {
    "label": "Razor",
    "id": "razor",
    "url": "/concepts/razor.html"
  },
  {
    "label": "spry",
    "id": "spry",
    "url": "/concepts/spry.html"
  },
  {
    "label": "BlitzBasic",
    "id": "blitzbasic",
    "url": "/concepts/blitzbasic.html"
  },
  {
    "label": "MOO",
    "id": "moo",
    "url": "/concepts/moo.html"
  },
  {
    "label": "Caché Basic",
    "id": "cache-basic",
    "url": "/concepts/cache-basic.html"
  },
  {
    "label": "FORTRAN 77",
    "id": "fortran-77",
    "url": "/concepts/fortran-77.html"
  },
  {
    "label": "RMarkdown",
    "id": "rmarkdown",
    "url": "/concepts/rmarkdown.html"
  },
  {
    "label": "unison",
    "id": "unison",
    "url": "/concepts/unison.html"
  },
  {
    "label": "Ante",
    "id": "ante",
    "url": "/concepts/ante.html"
  },
  {
    "label": "S-algol",
    "id": "s-algol",
    "url": "/concepts/s-algol.html"
  },
  {
    "label": "DAX",
    "id": "dax",
    "url": "/concepts/dax.html"
  },
  {
    "label": "Guile",
    "id": "guile",
    "url": "/concepts/guile.html"
  },
  {
    "label": "Uniform eXchange Format",
    "id": "uxf",
    "url": "/concepts/uxf.html"
  },
  {
    "label": "Troff",
    "id": "troff",
    "url": "/concepts/troff.html"
  },
  {
    "label": "hecl",
    "id": "hecl",
    "url": "/concepts/hecl.html"
  },
  {
    "label": "Cue",
    "id": "cuelang",
    "url": "/concepts/cuelang.html"
  },
  {
    "label": "Oxygene",
    "id": "oxygene",
    "url": "/concepts/oxygene.html"
  },
  {
    "label": "LPC",
    "id": "lpc",
    "url": "/concepts/lpc.html"
  },
  {
    "label": "Curry",
    "id": "curry",
    "url": "/concepts/curry.html"
  },
  {
    "label": "Fortress",
    "id": "fortress",
    "url": "/concepts/fortress.html"
  },
  {
    "label": "Zeta",
    "id": "zeta",
    "url": "/concepts/zeta.html"
  },
  {
    "label": "BeanShell",
    "id": "beanshell",
    "url": "/concepts/beanshell.html"
  },
  {
    "label": "Dc",
    "id": "dc",
    "url": "/concepts/dc.html"
  },
  {
    "label": "CIR",
    "id": "cir",
    "url": "/concepts/cir.html"
  },
  {
    "label": "McLeyvier Command Language",
    "id": "mcleyvier-command-language",
    "url": "/concepts/mcleyvier-command-language.html"
  },
  {
    "label": "Dale",
    "id": "dale",
    "url": "/concepts/dale.html"
  },
  {
    "label": "Literate CoffeeScript",
    "id": "literate-coffeescript",
    "url": "/concepts/literate-coffeescript.html"
  },
  {
    "label": "vdscript",
    "id": "vdscript",
    "url": "/concepts/vdscript.html"
  },
  {
    "label": "PAWN",
    "id": "pawn",
    "url": "/concepts/pawn.html"
  },
  {
    "label": "KRL",
    "id": "krl",
    "url": "/concepts/krl.html"
  },
  {
    "label": "UML",
    "id": "uml",
    "url": "/concepts/uml.html"
  },
  {
    "label": "Pluk",
    "id": "pluk",
    "url": "/concepts/pluk.html"
  },
  {
    "label": "PLEASE",
    "id": "please",
    "url": "/concepts/please.html"
  },
  {
    "label": "Ron",
    "id": "ron",
    "url": "/concepts/ron.html"
  },
  {
    "label": "Marko",
    "id": "marko",
    "url": "/concepts/marko.html"
  },
  {
    "label": "INTERCAL",
    "id": "intercal",
    "url": "/concepts/intercal.html"
  },
  {
    "label": "Orc",
    "id": "orc-lang",
    "url": "/concepts/orc-lang.html"
  },
  {
    "label": "skip",
    "id": "skip",
    "url": "/concepts/skip.html"
  },
  {
    "label": "Nice",
    "id": "nice",
    "url": "/concepts/nice.html"
  },
  {
    "label": "JSON Lines",
    "id": "ld-json",
    "url": "/concepts/ld-json.html"
  },
  {
    "label": "latino",
    "id": "latino",
    "url": "/concepts/latino.html"
  },
  {
    "label": "Spin",
    "id": "spin",
    "url": "/concepts/spin.html"
  },
  {
    "label": "cor",
    "id": "cor",
    "url": "/concepts/cor.html"
  },
  {
    "label": "Cypher Query Language",
    "id": "cypher",
    "url": "/concepts/cypher.html"
  },
  {
    "label": "Logica",
    "id": "logica",
    "url": "/concepts/logica.html"
  },
  {
    "label": "CIL",
    "id": "cilk",
    "url": "/concepts/cilk.html"
  },
  {
    "label": "ALGOL 68",
    "id": "algol-68",
    "url": "/concepts/algol-68.html"
  },
  {
    "label": "Fable",
    "id": "fable-lang",
    "url": "/concepts/fable-lang.html"
  },
  {
    "label": "muPad",
    "id": "mupad",
    "url": "/concepts/mupad.html"
  },
  {
    "label": "Nu",
    "id": "nu",
    "url": "/concepts/nu.html"
  },
  {
    "label": "Opal",
    "id": "opal",
    "url": "/concepts/opal.html"
  },
  {
    "label": "Not Quite C",
    "id": "nqc",
    "url": "/concepts/nqc.html"
  },
  {
    "label": "Pandas",
    "id": "pandas",
    "url": "/concepts/pandas.html"
  },
  {
    "label": "Zuo",
    "id": "zuo",
    "url": "/concepts/zuo.html"
  },
  {
    "label": "High Level Assembly",
    "id": "hla",
    "url": "/concepts/hla.html"
  },
  {
    "label": "Gentoo Ebuild",
    "id": "gentoo-ebuild",
    "url": "/concepts/gentoo-ebuild.html"
  },
  {
    "label": "phylip",
    "id": "phylip",
    "url": "/concepts/phylip.html"
  },
  {
    "label": "NetRexx",
    "id": "netrexx",
    "url": "/concepts/netrexx.html"
  },
  {
    "label": "STOICAL",
    "id": "stoical",
    "url": "/concepts/stoical.html"
  },
  {
    "label": "YANG",
    "id": "yang",
    "url": "/concepts/yang.html"
  },
  {
    "label": "D3.js",
    "id": "d3",
    "url": "/concepts/d3.html"
  },
  {
    "label": "Rascal",
    "id": "rascal",
    "url": "/concepts/rascal.html"
  },
  {
    "label": "Reia",
    "id": "reia",
    "url": "/concepts/reia.html"
  },
  {
    "label": "mgmt",
    "id": "mgmt",
    "url": "/concepts/mgmt.html"
  },
  {
    "label": "dlvm",
    "id": "dlvm",
    "url": "/concepts/dlvm.html"
  },
  {
    "label": "SSL",
    "id": "ssl",
    "url": "/concepts/ssl.html"
  },
  {
    "label": "hazel",
    "id": "hazel",
    "url": "/concepts/hazel.html"
  },
  {
    "label": "OpenEdge ABL",
    "id": "openedge-advanced-business-language",
    "url": "/concepts/openedge-advanced-business-language.html"
  },
  {
    "label": "ssl-lang",
    "id": "ssl-lang",
    "url": "/concepts/ssl-lang.html"
  },
  {
    "label": "Argdown",
    "id": "argdown",
    "url": "/concepts/argdown.html"
  },
  {
    "label": "MiniZinc",
    "id": "minizinc",
    "url": "/concepts/minizinc.html"
  },
  {
    "label": "LotusScript",
    "id": "lotusscript",
    "url": "/concepts/lotusscript.html"
  },
  {
    "label": "Slice",
    "id": "slice",
    "url": "/concepts/slice.html"
  },
  {
    "label": "MQL5",
    "id": "mql",
    "url": "/concepts/mql.html"
  },
  {
    "label": "Earl Grey",
    "id": "earl-grey",
    "url": "/concepts/earl-grey.html"
  },
  {
    "label": "Mouse",
    "id": "mouse",
    "url": "/concepts/mouse.html"
  },
  {
    "label": "Homa",
    "id": "homa",
    "url": "/concepts/homa.html"
  },
  {
    "label": "SQLMP",
    "id": "sqlmp",
    "url": "/concepts/sqlmp.html"
  },
  {
    "label": "BALGOL",
    "id": "balgol",
    "url": "/concepts/balgol.html"
  },
  {
    "label": "Matplotlib",
    "id": "matplotlib",
    "url": "/concepts/matplotlib.html"
  },
  {
    "label": "oil",
    "id": "oil",
    "url": "/concepts/oil.html"
  },
  {
    "label": "SMT",
    "id": "smt",
    "url": "/concepts/smt.html"
  },
  {
    "label": "PromQL",
    "id": "promql",
    "url": "/concepts/promql.html"
  },
  {
    "label": "AutoLISP",
    "id": "autolisp",
    "url": "/concepts/autolisp.html"
  },
  {
    "label": "Patchwork",
    "id": "patchwork",
    "url": "/concepts/patchwork.html"
  },
  {
    "label": "Hodor",
    "id": "hodor",
    "url": "/concepts/hodor.html"
  },
  {
    "label": "Project Mentat",
    "id": "project-mentat",
    "url": "/concepts/project-mentat.html"
  },
  {
    "label": "HiveQL",
    "id": "hiveql",
    "url": "/concepts/hiveql.html"
  },
  {
    "label": "Miranda",
    "id": "miranda",
    "url": "/concepts/miranda.html"
  },
  {
    "label": "Regular Expressions",
    "id": "regex",
    "url": "/concepts/regex.html"
  },
  {
    "label": "Cyber",
    "id": "cyber",
    "url": "/concepts/cyber.html"
  },
  {
    "label": "Script.NET",
    "id": "ssharp",
    "url": "/concepts/ssharp.html"
  },
  {
    "label": "Linker Script",
    "id": "linker-script",
    "url": "/concepts/linker-script.html"
  },
  {
    "label": "Jakt",
    "id": "jakt",
    "url": "/concepts/jakt.html"
  },
  {
    "label": "NetLinx",
    "id": "netlinx",
    "url": "/concepts/netlinx.html"
  },
  {
    "label": "CLU",
    "id": "clu",
    "url": "/concepts/clu.html"
  },
  {
    "label": "bog",
    "id": "bog",
    "url": "/concepts/bog.html"
  },
  {
    "label": "Cycript",
    "id": "cycript",
    "url": "/concepts/cycript.html"
  },
  {
    "label": "MDX",
    "id": "mdx",
    "url": "/concepts/mdx.html"
  },
  {
    "label": "Cirru",
    "id": "cirru",
    "url": "/concepts/cirru.html"
  },
  {
    "label": "Snostorm",
    "id": "snostorm",
    "url": "/concepts/snostorm.html"
  },
  {
    "label": "CSP",
    "id": "csp",
    "url": "/concepts/csp.html"
  },
  {
    "label": "Latte",
    "id": "latte",
    "url": "/concepts/latte.html"
  },
  {
    "label": "Not eXactly C",
    "id": "nxc",
    "url": "/concepts/nxc.html"
  },
  {
    "label": "snakemake",
    "id": "snakemake",
    "url": "/concepts/snakemake.html"
  },
  {
    "label": "pyret",
    "id": "pyret",
    "url": "/concepts/pyret.html"
  },
  {
    "label": "GML",
    "id": "ibm-gml",
    "url": "/concepts/ibm-gml.html"
  },
  {
    "label": "SMOKE",
    "id": "smoke",
    "url": "/concepts/smoke.html"
  },
  {
    "label": "NGS",
    "id": "ngs",
    "url": "/concepts/ngs.html"
  },
  {
    "label": "ActivityPub",
    "id": "activity-pub",
    "url": "/concepts/activity-pub.html"
  },
  {
    "label": "Java Properties",
    "id": "java-properties",
    "url": "/concepts/java-properties.html"
  },
  {
    "label": "json->url",
    "id": "json-url",
    "url": "/concepts/json-url.html"
  },
  {
    "label": "Smalltalk YX",
    "id": "smalltalk-yx",
    "url": "/concepts/smalltalk-yx.html"
  },
  {
    "label": "SMTP",
    "id": "smtp",
    "url": "/concepts/smtp.html"
  },
  {
    "label": "Textile",
    "id": "textile",
    "url": "/concepts/textile.html"
  },
  {
    "label": "dyvil",
    "id": "dyvil",
    "url": "/concepts/dyvil.html"
  },
  {
    "label": "Aldor",
    "id": "aldor",
    "url": "/concepts/aldor.html"
  },
  {
    "label": "Hare",
    "id": "hare",
    "url": "/concepts/hare.html"
  },
  {
    "label": "Cg",
    "id": "cg",
    "url": "/concepts/cg.html"
  },
  {
    "label": "JScript",
    "id": "jscript",
    "url": "/concepts/jscript.html"
  },
  {
    "label": "blockml",
    "id": "blockml",
    "url": "/concepts/blockml.html"
  },
  {
    "label": "CFML",
    "id": "cfml",
    "url": "/concepts/cfml.html"
  },
  {
    "label": "Jython",
    "id": "jython",
    "url": "/concepts/jython.html"
  },
  {
    "label": "Mentat",
    "id": "mentat",
    "url": "/concepts/mentat.html"
  },
  {
    "label": "MIME",
    "id": "mime",
    "url": "/concepts/mime.html"
  },
  {
    "label": "stella",
    "id": "stella",
    "url": "/concepts/stella.html"
  },
  {
    "label": "Elvish",
    "id": "elvish",
    "url": "/concepts/elvish.html"
  },
  {
    "label": "lispyscript",
    "id": "lispyscript",
    "url": "/concepts/lispyscript.html"
  },
  {
    "label": "tcsh",
    "id": "tcsh",
    "url": "/concepts/tcsh.html"
  },
  {
    "label": "nesC",
    "id": "nesc",
    "url": "/concepts/nesc.html"
  },
  {
    "label": "Pure Data",
    "id": "puredata",
    "url": "/concepts/puredata.html"
  },
  {
    "label": "Spice",
    "id": "spice",
    "url": "/concepts/spice.html"
  },
  {
    "label": "Amazon Redshift",
    "id": "redshift",
    "url": "/concepts/redshift.html"
  },
  {
    "label": "Clarion",
    "id": "clarion",
    "url": "/concepts/clarion.html"
  },
  {
    "label": "Velocity",
    "id": "apache-velocity",
    "url": "/concepts/apache-velocity.html"
  },
  {
    "label": "sina",
    "id": "sina",
    "url": "/concepts/sina.html"
  },
  {
    "label": "GraphIt",
    "id": "graph-it",
    "url": "/concepts/graph-it.html"
  },
  {
    "label": "Augmented Backus-Naur Form",
    "id": "abnf",
    "url": "/concepts/abnf.html"
  },
  {
    "label": "LoomScript",
    "id": "loomscript",
    "url": "/concepts/loomscript.html"
  },
  {
    "label": "React Native",
    "id": "react-native",
    "url": "/concepts/react-native.html"
  },
  {
    "label": "highlight.js",
    "id": "highlightjs",
    "url": "/concepts/highlightjs.html"
  },
  {
    "label": "PyTorch",
    "id": "pytorch",
    "url": "/concepts/pytorch.html"
  },
  {
    "label": "REST",
    "id": "rest",
    "url": "/concepts/rest.html"
  },
  {
    "label": "BitBake",
    "id": "bitbake",
    "url": "/concepts/bitbake.html"
  },
  {
    "label": "CBOR data definition language",
    "id": "cddl",
    "url": "/concepts/cddl.html"
  },
  {
    "label": "Pizza",
    "id": "pizza",
    "url": "/concepts/pizza.html"
  },
  {
    "label": "NestedText",
    "id": "nestedtext",
    "url": "/concepts/nestedtext.html"
  },
  {
    "label": "Stencil",
    "id": "stencil",
    "url": "/concepts/stencil.html"
  },
  {
    "label": "SIL",
    "id": "sil",
    "url": "/concepts/sil.html"
  },
  {
    "label": "AWS",
    "id": "aws",
    "url": "/concepts/aws.html"
  },
  {
    "label": "SHOE",
    "id": "shoe",
    "url": "/concepts/shoe.html"
  },
  {
    "label": "Mary",
    "id": "mary",
    "url": "/concepts/mary.html"
  },
  {
    "label": "Asymptote",
    "id": "asymptote",
    "url": "/concepts/asymptote.html"
  },
  {
    "label": "SHIFT",
    "id": "shift",
    "url": "/concepts/shift.html"
  },
  {
    "label": "SHEEP",
    "id": "sheep",
    "url": "/concepts/sheep.html"
  },
  {
    "label": "tornado",
    "id": "tornado",
    "url": "/concepts/tornado.html"
  },
  {
    "label": "COMPONENT PASCAL",
    "id": "component-pascal",
    "url": "/concepts/component-pascal.html"
  },
  {
    "label": "YoptaScript",
    "id": "yoptascript",
    "url": "/concepts/yoptascript.html"
  },
  {
    "label": "SRL",
    "id": "srl",
    "url": "/concepts/srl.html"
  },
  {
    "label": "SHADOW",
    "id": "shadow",
    "url": "/concepts/shadow.html"
  },
  {
    "label": "OASIS",
    "id": "oasis",
    "url": "/concepts/oasis.html"
  },
  {
    "label": "Microsoft Azure",
    "id": "azure",
    "url": "/concepts/azure.html"
  },
  {
    "label": "owen-lang",
    "id": "owen-lang",
    "url": "/concepts/owen-lang.html"
  },
  {
    "label": "SARL",
    "id": "sarl",
    "url": "/concepts/sarl.html"
  },
  {
    "label": "Algol",
    "id": "algol",
    "url": "/concepts/algol.html"
  },
  {
    "label": "DOI",
    "id": "doi",
    "url": "/concepts/doi.html"
  },
  {
    "label": "fay",
    "id": "fay",
    "url": "/concepts/fay.html"
  },
  {
    "label": "Quaint",
    "id": "quaint",
    "url": "/concepts/quaint.html"
  },
  {
    "label": "Formulating On-Line Calculations in Algebraic Language",
    "id": "focal",
    "url": "/concepts/focal.html"
  },
  {
    "label": "PgBouncer",
    "id": "pgbouncer",
    "url": "/concepts/pgbouncer.html"
  },
  {
    "label": "TQL",
    "id": "tql",
    "url": "/concepts/tql.html"
  },
  {
    "label": "manool",
    "id": "manool",
    "url": "/concepts/manool.html"
  },
  {
    "label": "Qore",
    "id": "qore",
    "url": "/concepts/qore.html"
  },
  {
    "label": "Claro",
    "id": "claro",
    "url": "/concepts/claro.html"
  },
  {
    "label": "carth",
    "id": "carth",
    "url": "/concepts/carth.html"
  },
  {
    "label": "silk",
    "id": "silk",
    "url": "/concepts/silk.html"
  },
  {
    "label": "elena",
    "id": "elena",
    "url": "/concepts/elena.html"
  },
  {
    "label": "aretext",
    "id": "aretext",
    "url": "/concepts/aretext.html"
  },
  {
    "label": "gentee",
    "id": "gentee",
    "url": "/concepts/gentee.html"
  },
  {
    "label": "FaCT",
    "id": "fact-lang",
    "url": "/concepts/fact-lang.html"
  },
  {
    "label": "Aheui",
    "id": "aheui",
    "url": "/concepts/aheui.html"
  },
  {
    "label": "kai",
    "id": "kai",
    "url": "/concepts/kai.html"
  },
  {
    "label": "Action!",
    "id": "action",
    "url": "/concepts/action.html"
  },
  {
    "label": "Charity",
    "id": "charity",
    "url": "/concepts/charity.html"
  },
  {
    "label": "rosette-lang",
    "id": "rosette-lang",
    "url": "/concepts/rosette-lang.html"
  },
  {
    "label": "nML",
    "id": "nml",
    "url": "/concepts/nml.html"
  },
  {
    "label": "SOAP",
    "id": "soap",
    "url": "/concepts/soap.html"
  },
  {
    "label": "UrWeb",
    "id": "urweb",
    "url": "/concepts/urweb.html"
  },
  {
    "label": "FoxPRO",
    "id": "foxpro",
    "url": "/concepts/foxpro.html"
  },
  {
    "label": "School",
    "id": "school",
    "url": "/concepts/school.html"
  },
  {
    "label": "Linotte",
    "id": "linotte",
    "url": "/concepts/linotte.html"
  },
  {
    "label": "SCAN",
    "id": "scan",
    "url": "/concepts/scan.html"
  },
  {
    "label": "net-format",
    "id": "net-format",
    "url": "/concepts/net-format.html"
  },
  {
    "label": "J#",
    "id": "jsharp",
    "url": "/concepts/jsharp.html"
  },
  {
    "label": "Gettext Catalog",
    "id": "gettext",
    "url": "/concepts/gettext.html"
  },
  {
    "label": "Slash",
    "id": "slash",
    "url": "/concepts/slash.html"
  },
  {
    "label": "INQUIRE",
    "id": "inquire",
    "url": "/concepts/inquire.html"
  },
  {
    "label": "Netwide Assembler",
    "id": "nasm",
    "url": "/concepts/nasm.html"
  },
  {
    "label": "EmberScript",
    "id": "emberscript",
    "url": "/concepts/emberscript.html"
  },
  {
    "label": "False",
    "id": "false",
    "url": "/concepts/false.html"
  },
  {
    "label": "Squeak",
    "id": "squeak",
    "url": "/concepts/squeak.html"
  },
  {
    "label": "Kal",
    "id": "kal",
    "url": "/concepts/kal.html"
  },
  {
    "label": "Lil",
    "id": "lil-pl",
    "url": "/concepts/lil-pl.html"
  },
  {
    "label": "TAP",
    "id": "tap",
    "url": "/concepts/tap.html"
  },
  {
    "label": "buzz",
    "id": "buzz",
    "url": "/concepts/buzz.html"
  },
  {
    "label": "Pygments",
    "id": "pygments",
    "url": "/concepts/pygments.html"
  },
  {
    "label": "S-Snobol",
    "id": "s-snobol",
    "url": "/concepts/s-snobol.html"
  },
  {
    "label": "walt",
    "id": "walt",
    "url": "/concepts/walt.html"
  },
  {
    "label": "Bro",
    "id": "bro",
    "url": "/concepts/bro.html"
  },
  {
    "label": "Nymph",
    "id": "nymph",
    "url": "/concepts/nymph.html"
  },
  {
    "label": "Uno",
    "id": "uno",
    "url": "/concepts/uno.html"
  },
  {
    "label": "PogoScript",
    "id": "pogoscript",
    "url": "/concepts/pogoscript.html"
  },
  {
    "label": "Rholang",
    "id": "rholang",
    "url": "/concepts/rholang.html"
  },
  {
    "label": "Grace",
    "id": "grace",
    "url": "/concepts/grace.html"
  },
  {
    "label": "Bluespec",
    "id": "bluespec",
    "url": "/concepts/bluespec.html"
  },
  {
    "label": "MIRC scripting language",
    "id": "mirc",
    "url": "/concepts/mirc.html"
  },
  {
    "label": "Jolie",
    "id": "jolie",
    "url": "/concepts/jolie.html"
  },
  {
    "label": "Vyxal",
    "id": "vyxal",
    "url": "/concepts/vyxal.html"
  },
  {
    "label": "JSONiq",
    "id": "jsoniq",
    "url": "/concepts/jsoniq.html"
  },
  {
    "label": "FloScript",
    "id": "floscript",
    "url": "/concepts/floscript.html"
  },
  {
    "label": "Language Server Index Format",
    "id": "lsif-format",
    "url": "/concepts/lsif-format.html"
  },
  {
    "label": "PIC",
    "id": "pic",
    "url": "/concepts/pic.html"
  },
  {
    "label": "ldpl",
    "id": "ldpl",
    "url": "/concepts/ldpl.html"
  },
  {
    "label": "Rosetta SMALLTALK",
    "id": "rosetta-smalltalk",
    "url": "/concepts/rosetta-smalltalk.html"
  },
  {
    "label": "v8",
    "id": "v8",
    "url": "/concepts/v8.html"
  },
  {
    "label": "Plot",
    "id": "plot-lang",
    "url": "/concepts/plot-lang.html"
  },
  {
    "label": "Lingo",
    "id": "lingo",
    "url": "/concepts/lingo.html"
  },
  {
    "label": "Multi-User Forth",
    "id": "muf",
    "url": "/concepts/muf.html"
  },
  {
    "label": "Judoscript",
    "id": "judoscript",
    "url": "/concepts/judoscript.html"
  },
  {
    "label": "Impala",
    "id": "impala",
    "url": "/concepts/impala.html"
  },
  {
    "label": "CartoCSS",
    "id": "cartocss",
    "url": "/concepts/cartocss.html"
  },
  {
    "label": "MariaDB",
    "id": "mariadb",
    "url": "/concepts/mariadb.html"
  },
  {
    "label": "Xbasic",
    "id": "xbasic",
    "url": "/concepts/xbasic.html"
  },
  {
    "label": "Livr",
    "id": "livr",
    "url": "/concepts/livr.html"
  },
  {
    "label": "verifpal",
    "id": "verifpal",
    "url": "/concepts/verifpal.html"
  },
  {
    "label": "S-expressions",
    "id": "s-expressions",
    "url": "/concepts/s-expressions.html"
  },
  {
    "label": "1C Enterprise Script",
    "id": "1c-enterprise",
    "url": "/concepts/1c-enterprise.html"
  },
  {
    "label": "ROFF",
    "id": "roff",
    "url": "/concepts/roff.html"
  },
  {
    "label": "video",
    "id": "video",
    "url": "/concepts/video.html"
  },
  {
    "label": "RPT",
    "id": "report-writer-language",
    "url": "/concepts/report-writer-language.html"
  },
  {
    "label": "OpenRC runscript",
    "id": "openrc-runscript",
    "url": "/concepts/openrc-runscript.html"
  },
  {
    "label": "Picat",
    "id": "picat",
    "url": "/concepts/picat.html"
  },
  {
    "label": "RPL",
    "id": "relational-production-language",
    "url": "/concepts/relational-production-language.html"
  },
  {
    "label": "hop",
    "id": "hop",
    "url": "/concepts/hop.html"
  },
  {
    "label": "Yacas",
    "id": "yacas",
    "url": "/concepts/yacas.html"
  },
  {
    "label": "Relational Data File",
    "id": "relational-data-file",
    "url": "/concepts/relational-data-file.html"
  },
  {
    "label": "Sqlalchemy",
    "id": "sqlalchemy",
    "url": "/concepts/sqlalchemy.html"
  },
  {
    "label": "EGL",
    "id": "egl",
    "url": "/concepts/egl.html"
  },
  {
    "label": "RenderScript",
    "id": "renderscript",
    "url": "/concepts/renderscript.html"
  },
  {
    "label": "BlooP",
    "id": "bloop",
    "url": "/concepts/bloop.html"
  },
  {
    "label": "Xidoc",
    "id": "xidoc",
    "url": "/concepts/xidoc.html"
  },
  {
    "label": "ugBASIC",
    "id": "ugbasic",
    "url": "/concepts/ugbasic.html"
  },
  {
    "label": "Ohayo",
    "id": "ohayo",
    "url": "/concepts/ohayo.html"
  },
  {
    "label": "CLIST",
    "id": "clist",
    "url": "/concepts/clist.html"
  },
  {
    "label": "Mech",
    "id": "mech-lang",
    "url": "/concepts/mech-lang.html"
  },
  {
    "label": "CLISP",
    "id": "clisp",
    "url": "/concepts/clisp.html"
  },
  {
    "label": "pointless",
    "id": "pointless",
    "url": "/concepts/pointless.html"
  },
  {
    "label": "REGULUS",
    "id": "regulus",
    "url": "/concepts/regulus.html"
  },
  {
    "label": "Augeas",
    "id": "augeas",
    "url": "/concepts/augeas.html"
  },
  {
    "label": "egel",
    "id": "egel",
    "url": "/concepts/egel.html"
  },
  {
    "label": "Regina",
    "id": "regina",
    "url": "/concepts/regina.html"
  },
  {
    "label": "Whitespace",
    "id": "whitespace",
    "url": "/concepts/whitespace.html"
  },
  {
    "label": "Differential Datalog",
    "id": "differential-datalog",
    "url": "/concepts/differential-datalog.html"
  },
  {
    "label": "Yes It Is",
    "id": "yii",
    "url": "/concepts/yii.html"
  },
  {
    "label": "S",
    "id": "s",
    "url": "/concepts/s.html"
  },
  {
    "label": "mun-lang",
    "id": "mun-lang",
    "url": "/concepts/mun-lang.html"
  },
  {
    "label": "Simple Binary Encoding",
    "id": "simple-binary-encoding",
    "url": "/concepts/simple-binary-encoding.html"
  },
  {
    "label": "HHVM",
    "id": "hhvm",
    "url": "/concepts/hhvm.html"
  },
  {
    "label": "REALBasic (now Xojo)",
    "id": "realbasic",
    "url": "/concepts/realbasic.html"
  },
  {
    "label": "Guix Workflow Language",
    "id": "gwl",
    "url": "/concepts/gwl.html"
  },
  {
    "label": "Real-Time Mentat",
    "id": "real-time-mentat",
    "url": "/concepts/real-time-mentat.html"
  },
  {
    "label": "CWEB",
    "id": "cweb",
    "url": "/concepts/cweb.html"
  },
  {
    "label": "Real-Time Concurrent C",
    "id": "real-time-concurrent-c",
    "url": "/concepts/real-time-concurrent-c.html"
  },
  {
    "label": "Taichi",
    "id": "taichi",
    "url": "/concepts/taichi.html"
  },
  {
    "label": "rds-format",
    "id": "rds-format",
    "url": "/concepts/rds-format.html"
  },
  {
    "label": "chatterbot",
    "id": "chatterbot",
    "url": "/concepts/chatterbot.html"
  },
  {
    "label": "SciPy",
    "id": "scipy",
    "url": "/concepts/scipy.html"
  },
  {
    "label": "Rapid Development and Maintenance Language",
    "id": "rdml",
    "url": "/concepts/rdml.html"
  },
  {
    "label": "iOS",
    "id": "ios",
    "url": "/concepts/ios.html"
  },
  {
    "label": "Hackett",
    "id": "hackett",
    "url": "/concepts/hackett.html"
  },
  {
    "label": "GDB",
    "id": "gdb",
    "url": "/concepts/gdb.html"
  },
  {
    "label": "onnx",
    "id": "onnx",
    "url": "/concepts/onnx.html"
  },
  {
    "label": "rbscript",
    "id": "rbscript",
    "url": "/concepts/rbscript.html"
  },
  {
    "label": "Note",
    "id": "note",
    "url": "/concepts/note.html"
  },
  {
    "label": "Natural Language Toolkit",
    "id": "nltk",
    "url": "/concepts/nltk.html"
  },
  {
    "label": "DRAKON",
    "id": "drakon",
    "url": "/concepts/drakon.html"
  },
  {
    "label": "hamler",
    "id": "hamler",
    "url": "/concepts/hamler.html"
  },
  {
    "label": "Easybuild",
    "id": "easybuild",
    "url": "/concepts/easybuild.html"
  },
  {
    "label": "RATSNO",
    "id": "ratsno",
    "url": "/concepts/ratsno.html"
  },
  {
    "label": "Pact",
    "id": "pact",
    "url": "/concepts/pact.html"
  },
  {
    "label": "Semantic Patch Language",
    "id": "smpl",
    "url": "/concepts/smpl.html"
  },
  {
    "label": "Bucardo",
    "id": "bucardo",
    "url": "/concepts/bucardo.html"
  },
  {
    "label": "KiCad Legacy Layout",
    "id": "kicad",
    "url": "/concepts/kicad.html"
  },
  {
    "label": "Ren'Py",
    "id": "renpy",
    "url": "/concepts/renpy.html"
  },
  {
    "label": "FreeBASIC",
    "id": "freebasic",
    "url": "/concepts/freebasic.html"
  },
  {
    "label": "Sweet Expressions",
    "id": "sweet-expressions",
    "url": "/concepts/sweet-expressions.html"
  },
  {
    "label": "Type Language",
    "id": "type-language",
    "url": "/concepts/type-language.html"
  },
  {
    "label": "astro",
    "id": "astro",
    "url": "/concepts/astro.html"
  },
  {
    "label": "quexal",
    "id": "quexal",
    "url": "/concepts/quexal.html"
  },
  {
    "label": "SRecode Template",
    "id": "srecode-template",
    "url": "/concepts/srecode-template.html"
  },
  {
    "label": "sizzle",
    "id": "sizzle",
    "url": "/concepts/sizzle.html"
  },
  {
    "label": "Karel",
    "id": "karel",
    "url": "/concepts/karel.html"
  },
  {
    "label": "Gwion",
    "id": "gwion",
    "url": "/concepts/gwion.html"
  },
  {
    "label": "Cone",
    "id": "cone",
    "url": "/concepts/cone.html"
  },
  {
    "label": "MENDEL",
    "id": "mendel",
    "url": "/concepts/mendel.html"
  },
  {
    "label": "Yoix",
    "id": "yoix",
    "url": "/concepts/yoix.html"
  },
  {
    "label": "flagship",
    "id": "flagship",
    "url": "/concepts/flagship.html"
  },
  {
    "label": "Drupal",
    "id": "drupal",
    "url": "/concepts/drupal.html"
  },
  {
    "label": "fizz",
    "id": "fizz",
    "url": "/concepts/fizz.html"
  },
  {
    "label": "Push",
    "id": "push",
    "url": "/concepts/push.html"
  },
  {
    "label": "LookML",
    "id": "lookml",
    "url": "/concepts/lookml.html"
  },
  {
    "label": "S-PLUS",
    "id": "s-plus",
    "url": "/concepts/s-plus.html"
  },
  {
    "label": "mckeeman-form",
    "id": "mckeeman-form",
    "url": "/concepts/mckeeman-form.html"
  },
  {
    "label": "SmallBASIC",
    "id": "smallbasic",
    "url": "/concepts/smallbasic.html"
  },
  {
    "label": "Parenscript",
    "id": "parenscript",
    "url": "/concepts/parenscript.html"
  },
  {
    "label": "PUFFT",
    "id": "pufft",
    "url": "/concepts/pufft.html"
  },
  {
    "label": "Public Key File",
    "id": "public-key-file",
    "url": "/concepts/public-key-file.html"
  },
  {
    "label": "Z",
    "id": "z-expressions",
    "url": "/concepts/z-expressions.html"
  },
  {
    "label": "Structured Query Reporter",
    "id": "sqr",
    "url": "/concepts/sqr.html"
  },
  {
    "label": "Rouge",
    "id": "rouge",
    "url": "/concepts/rouge.html"
  },
  {
    "label": "XS",
    "id": "xs",
    "url": "/concepts/xs.html"
  },
  {
    "label": "F-Script",
    "id": "f-script",
    "url": "/concepts/f-script.html"
  },
  {
    "label": "BNF",
    "id": "bnf",
    "url": "/concepts/bnf.html"
  },
  {
    "label": "Plus",
    "id": "plus",
    "url": "/concepts/plus.html"
  },
  {
    "label": "CPL",
    "id": "cpl",
    "url": "/concepts/cpl.html"
  },
  {
    "label": "Jison Lex",
    "id": "jison-lex",
    "url": "/concepts/jison-lex.html"
  },
  {
    "label": "PSI",
    "id": "psi",
    "url": "/concepts/psi.html"
  },
  {
    "label": "Joy",
    "id": "joy",
    "url": "/concepts/joy.html"
  },
  {
    "label": "Hocon",
    "id": "hocon",
    "url": "/concepts/hocon.html"
  },
  {
    "label": "F",
    "id": "f",
    "url": "/concepts/f.html"
  },
  {
    "label": "Pep8",
    "id": "pep8",
    "url": "/concepts/pep8.html"
  },
  {
    "label": "ca65 Assembly",
    "id": "ca65-assembly",
    "url": "/concepts/ca65-assembly.html"
  },
  {
    "label": "inko",
    "id": "inko",
    "url": "/concepts/inko.html"
  },
  {
    "label": "Papyrus",
    "id": "papyrus",
    "url": "/concepts/papyrus.html"
  },
  {
    "label": "Dynamo",
    "id": "dynamo-visual-language",
    "url": "/concepts/dynamo-visual-language.html"
  },
  {
    "label": "prompter",
    "id": "prompter",
    "url": "/concepts/prompter.html"
  },
  {
    "label": "Lush",
    "id": "lush",
    "url": "/concepts/lush.html"
  },
  {
    "label": "JSON Schema",
    "id": "json-schema",
    "url": "/concepts/json-schema.html"
  },
  {
    "label": "chaiscript",
    "id": "chaiscript",
    "url": "/concepts/chaiscript.html"
  },
  {
    "label": "MADCAP VI",
    "id": "madcap-vi",
    "url": "/concepts/madcap-vi.html"
  },
  {
    "label": "packagist-pm",
    "id": "packagist-pm",
    "url": "/concepts/packagist-pm.html"
  },
  {
    "label": "REDUCE",
    "id": "reduce",
    "url": "/concepts/reduce.html"
  },
  {
    "label": "Epigram",
    "id": "epigram",
    "url": "/concepts/epigram.html"
  },
  {
    "label": "Uniface",
    "id": "uniface",
    "url": "/concepts/uniface.html"
  },
  {
    "label": "NewtonScript",
    "id": "newtonscript",
    "url": "/concepts/newtonscript.html"
  },
  {
    "label": "SIMPL",
    "id": "simpl",
    "url": "/concepts/simpl.html"
  },
  {
    "label": "Ace Editor",
    "id": "ace",
    "url": "/concepts/ace.html"
  },
  {
    "label": "Caché ObjectScript",
    "id": "cache-objectscript",
    "url": "/concepts/cache-objectscript.html"
  },
  {
    "label": "ACL2",
    "id": "acl2",
    "url": "/concepts/acl2.html"
  },
  {
    "label": "GAMS",
    "id": "gams",
    "url": "/concepts/gams.html"
  },
  {
    "label": "Omgrofl",
    "id": "omgrofl",
    "url": "/concepts/omgrofl.html"
  },
  {
    "label": "winxed",
    "id": "winxed",
    "url": "/concepts/winxed.html"
  },
  {
    "label": "fp",
    "id": "fp3",
    "url": "/concepts/fp3.html"
  },
  {
    "label": "semicolon",
    "id": "semicolon",
    "url": "/concepts/semicolon.html"
  },
  {
    "label": "Invisible XML",
    "id": "ixml",
    "url": "/concepts/ixml.html"
  },
  {
    "label": "QOIR",
    "id": "qoir",
    "url": "/concepts/qoir.html"
  },
  {
    "label": "Object Rexx",
    "id": "object-rexx",
    "url": "/concepts/object-rexx.html"
  },
  {
    "label": "ISWIM",
    "id": "iswim",
    "url": "/concepts/iswim.html"
  },
  {
    "label": "AmbientTalk",
    "id": "ambienttalk",
    "url": "/concepts/ambienttalk.html"
  },
  {
    "label": "Heron",
    "id": "heron-lang",
    "url": "/concepts/heron-lang.html"
  },
  {
    "label": "Amiga E",
    "id": "amiga-e",
    "url": "/concepts/amiga-e.html"
  },
  {
    "label": "GNU Data Language",
    "id": "gdl",
    "url": "/concepts/gdl.html"
  },
  {
    "label": "juniper",
    "id": "juniper",
    "url": "/concepts/juniper.html"
  },
  {
    "label": "jsil-compiler",
    "id": "jsil-compiler",
    "url": "/concepts/jsil-compiler.html"
  },
  {
    "label": "HUGO",
    "id": "hugo",
    "url": "/concepts/hugo.html"
  },
  {
    "label": "Lexon",
    "id": "lexon",
    "url": "/concepts/lexon.html"
  },
  {
    "label": "Bun",
    "id": "bun",
    "url": "/concepts/bun.html"
  },
  {
    "label": "Post-X",
    "id": "post-x",
    "url": "/concepts/post-x.html"
  },
  {
    "label": "RQL",
    "id": "rql",
    "url": "/concepts/rql.html"
  },
  {
    "label": "G-Portugol",
    "id": "g-portugol",
    "url": "/concepts/g-portugol.html"
  },
  {
    "label": "Lazy K",
    "id": "lazy-k",
    "url": "/concepts/lazy-k.html"
  },
  {
    "label": "Xtext",
    "id": "xtext",
    "url": "/concepts/xtext.html"
  },
  {
    "label": "PopAsm",
    "id": "popasm",
    "url": "/concepts/popasm.html"
  },
  {
    "label": "Lisp Object-Oriented Programming System",
    "id": "loops",
    "url": "/concepts/loops.html"
  },
  {
    "label": "PO",
    "id": "po",
    "url": "/concepts/po.html"
  },
  {
    "label": "concurnas",
    "id": "concurnas",
    "url": "/concepts/concurnas.html"
  },
  {
    "label": "fetlang",
    "id": "fetlang",
    "url": "/concepts/fetlang.html"
  },
  {
    "label": "tea",
    "id": "tea-pm",
    "url": "/concepts/tea-pm.html"
  },
  {
    "label": "Java Bytecode",
    "id": "java-bytecode",
    "url": "/concepts/java-bytecode.html"
  },
  {
    "label": "ISBN",
    "id": "isbn",
    "url": "/concepts/isbn.html"
  },
  {
    "label": "PLAIN",
    "id": "plain",
    "url": "/concepts/plain.html"
  },
  {
    "label": "quorum",
    "id": "quorum",
    "url": "/concepts/quorum.html"
  },
  {
    "label": "Max",
    "id": "max",
    "url": "/concepts/max.html"
  },
  {
    "label": "PCRE",
    "id": "pcre",
    "url": "/concepts/pcre.html"
  },
  {
    "label": "Egison",
    "id": "egison",
    "url": "/concepts/egison.html"
  },
  {
    "label": "Wyvern",
    "id": "wyvern",
    "url": "/concepts/wyvern.html"
  },
  {
    "label": "Potion",
    "id": "potion",
    "url": "/concepts/potion.html"
  },
  {
    "label": "OCL",
    "id": "ocl",
    "url": "/concepts/ocl.html"
  },
  {
    "label": "pie-lang",
    "id": "pie-lang",
    "url": "/concepts/pie-lang.html"
  },
  {
    "label": "Lila",
    "id": "lila",
    "url": "/concepts/lila.html"
  },
  {
    "label": "Keras",
    "id": "keras",
    "url": "/concepts/keras.html"
  },
  {
    "label": "Scikit-learn",
    "id": "scikit-learn",
    "url": "/concepts/scikit-learn.html"
  },
  {
    "label": "Jekyll",
    "id": "jekyll",
    "url": "/concepts/jekyll.html"
  },
  {
    "label": "BQN",
    "id": "bqn",
    "url": "/concepts/bqn.html"
  },
  {
    "label": "PROMETHEUS",
    "id": "prometheus",
    "url": "/concepts/prometheus.html"
  },
  {
    "label": "gogs-editor",
    "id": "gogs-editor",
    "url": "/concepts/gogs-editor.html"
  },
  {
    "label": "ShaderLab",
    "id": "shaderlab",
    "url": "/concepts/shaderlab.html"
  },
  {
    "label": "HuJSON",
    "id": "hujson",
    "url": "/concepts/hujson.html"
  },
  {
    "label": "Petr",
    "id": "petr",
    "url": "/concepts/petr.html"
  },
  {
    "label": "mochajs",
    "id": "mochajs",
    "url": "/concepts/mochajs.html"
  },
  {
    "label": "Perfectscript",
    "id": "perfectscript",
    "url": "/concepts/perfectscript.html"
  },
  {
    "label": "Recfiles",
    "id": "recfiles",
    "url": "/concepts/recfiles.html"
  },
  {
    "label": "Kit",
    "id": "kit",
    "url": "/concepts/kit.html"
  },
  {
    "label": "Phel",
    "id": "phel",
    "url": "/concepts/phel.html"
  },
  {
    "label": "Rc",
    "id": "rc",
    "url": "/concepts/rc.html"
  },
  {
    "label": "HyPhy",
    "id": "hyphy",
    "url": "/concepts/hyphy.html"
  },
  {
    "label": "SQRL",
    "id": "sqrl",
    "url": "/concepts/sqrl.html"
  },
  {
    "label": "RPL",
    "id": "rpl",
    "url": "/concepts/rpl.html"
  },
  {
    "label": "FreeMarker",
    "id": "freemarker",
    "url": "/concepts/freemarker.html"
  },
  {
    "label": "son",
    "id": "son",
    "url": "/concepts/son.html"
  },
  {
    "label": "jeebox",
    "id": "jeebox",
    "url": "/concepts/jeebox.html"
  },
  {
    "label": "BBC BASIC",
    "id": "bbc-basic",
    "url": "/concepts/bbc-basic.html"
  },
  {
    "label": "ROOT",
    "id": "root-lib",
    "url": "/concepts/root-lib.html"
  },
  {
    "label": "GCC Machine Description",
    "id": "gcc-machine-description",
    "url": "/concepts/gcc-machine-description.html"
  },
  {
    "label": "Grammatical Framework",
    "id": "grammatical-framework",
    "url": "/concepts/grammatical-framework.html"
  },
  {
    "label": "CFEngine",
    "id": "cfengine",
    "url": "/concepts/cfengine.html"
  },
  {
    "label": "Vale",
    "id": "vale-assembly",
    "url": "/concepts/vale-assembly.html"
  },
  {
    "label": "A+",
    "id": "aplus",
    "url": "/concepts/aplus.html"
  },
  {
    "label": "YAWL",
    "id": "yawl",
    "url": "/concepts/yawl.html"
  },
  {
    "label": "dedukti",
    "id": "dedukti",
    "url": "/concepts/dedukti.html"
  },
  {
    "label": "mimium",
    "id": "mimium",
    "url": "/concepts/mimium.html"
  },
  {
    "label": "hacspec",
    "id": "hacspec",
    "url": "/concepts/hacspec.html"
  },
  {
    "label": "Edje Data Collection",
    "id": "edje-data-collection",
    "url": "/concepts/edje-data-collection.html"
  },
  {
    "label": "PROMAL",
    "id": "promal",
    "url": "/concepts/promal.html"
  },
  {
    "label": "Cyclone",
    "id": "cyclone",
    "url": "/concepts/cyclone.html"
  },
  {
    "label": "zephyr-asdl",
    "id": "zephyr-asdl",
    "url": "/concepts/zephyr-asdl.html"
  },
  {
    "label": "FTP",
    "id": "ftp",
    "url": "/concepts/ftp.html"
  },
  {
    "label": "beads-lang",
    "id": "beads-lang",
    "url": "/concepts/beads-lang.html"
  },
  {
    "label": "Adventure Game Studio Script",
    "id": "ags-script",
    "url": "/concepts/ags-script.html"
  },
  {
    "label": "XBase++",
    "id": "xbasepp",
    "url": "/concepts/xbasepp.html"
  },
  {
    "label": "Yul",
    "id": "yul",
    "url": "/concepts/yul.html"
  },
  {
    "label": "Project MAC’s SYmbolic MAnipulator",
    "id": "macsyma",
    "url": "/concepts/macsyma.html"
  },
  {
    "label": "Pascal-XSC",
    "id": "pascal-xsc",
    "url": "/concepts/pascal-xsc.html"
  },
  {
    "label": "OpenVera",
    "id": "openvera",
    "url": "/concepts/openvera.html"
  },
  {
    "label": "ProvideX",
    "id": "providex",
    "url": "/concepts/providex.html"
  },
  {
    "label": "Emerald",
    "id": "emerald",
    "url": "/concepts/emerald.html"
  },
  {
    "label": "Atomese",
    "id": "atomese",
    "url": "/concepts/atomese.html"
  },
  {
    "label": "SimCode",
    "id": "simcode",
    "url": "/concepts/simcode.html"
  },
  {
    "label": "Flatline",
    "id": "flatline",
    "url": "/concepts/flatline.html"
  },
  {
    "label": "xTAO Modeling Language",
    "id": "xtao",
    "url": "/concepts/xtao.html"
  },
  {
    "label": "JSFuck",
    "id": "jsf",
    "url": "/concepts/jsf.html"
  },
  {
    "label": "SISAL",
    "id": "sisal",
    "url": "/concepts/sisal.html"
  },
  {
    "label": "CodeQL",
    "id": "codeql",
    "url": "/concepts/codeql.html"
  },
  {
    "label": "GCC",
    "id": "gcc",
    "url": "/concepts/gcc.html"
  },
  {
    "label": "WML",
    "id": "wml",
    "url": "/concepts/wml.html"
  },
  {
    "label": "ISLISP",
    "id": "islisp",
    "url": "/concepts/islisp.html"
  },
  {
    "label": "QuakeC",
    "id": "quakec",
    "url": "/concepts/quakec.html"
  },
  {
    "label": "xs",
    "id": "xs-lang",
    "url": "/concepts/xs-lang.html"
  },
  {
    "label": "EuLisp",
    "id": "eulisp",
    "url": "/concepts/eulisp.html"
  },
  {
    "label": "PILOT",
    "id": "pilot",
    "url": "/concepts/pilot.html"
  },
  {
    "label": "Draco",
    "id": "draco-programming-language",
    "url": "/concepts/draco-programming-language.html"
  },
  {
    "label": "G-code",
    "id": "g-code",
    "url": "/concepts/g-code.html"
  },
  {
    "label": "Pure",
    "id": "pure",
    "url": "/concepts/pure.html"
  },
  {
    "label": "maraca-lang",
    "id": "maraca-lang",
    "url": "/concepts/maraca-lang.html"
  },
  {
    "label": "rosie",
    "id": "rosie",
    "url": "/concepts/rosie.html"
  },
  {
    "label": "OPL",
    "id": "opl",
    "url": "/concepts/opl.html"
  },
  {
    "label": "Slideshow",
    "id": "slideshow",
    "url": "/concepts/slideshow.html"
  },
  {
    "label": "Strongtalk",
    "id": "strongtalk",
    "url": "/concepts/strongtalk.html"
  },
  {
    "label": "Slony",
    "id": "slony",
    "url": "/concepts/slony.html"
  },
  {
    "label": "ECMAScript",
    "id": "ecmascript",
    "url": "/concepts/ecmascript.html"
  },
  {
    "label": "Nickle",
    "id": "nickle",
    "url": "/concepts/nickle.html"
  },
  {
    "label": "ObjectScript",
    "id": "objectscript",
    "url": "/concepts/objectscript.html"
  },
  {
    "label": "Interactive C Interpreter",
    "id": "ici",
    "url": "/concepts/ici.html"
  },
  {
    "label": "Kamby",
    "id": "kamby",
    "url": "/concepts/kamby.html"
  },
  {
    "label": "ARexx",
    "id": "arexx",
    "url": "/concepts/arexx.html"
  },
  {
    "label": "ALGOL W",
    "id": "algol-w",
    "url": "/concepts/algol-w.html"
  },
  {
    "label": "neeilang",
    "id": "neeilang",
    "url": "/concepts/neeilang.html"
  },
  {
    "label": "GEL Genius",
    "id": "genius-extension-language",
    "url": "/concepts/genius-extension-language.html"
  },
  {
    "label": "orange",
    "id": "orange",
    "url": "/concepts/orange.html"
  },
  {
    "label": "mdl",
    "id": "microarchitecture-description-language",
    "url": "/concepts/microarchitecture-description-language.html"
  },
  {
    "label": "Space",
    "id": "space",
    "url": "/concepts/space.html"
  },
  {
    "label": "Readable",
    "id": "readable",
    "url": "/concepts/readable.html"
  },
  {
    "label": "xduce",
    "id": "xduce",
    "url": "/concepts/xduce.html"
  },
  {
    "label": "Céu",
    "id": "ceu",
    "url": "/concepts/ceu.html"
  },
  {
    "label": "codecept",
    "id": "codecept",
    "url": "/concepts/codecept.html"
  },
  {
    "label": "hilvl",
    "id": "hilvl",
    "url": "/concepts/hilvl.html"
  },
  {
    "label": "datascript",
    "id": "datascript",
    "url": "/concepts/datascript.html"
  },
  {
    "label": "epsilon",
    "id": "epsilon",
    "url": "/concepts/epsilon.html"
  },
  {
    "label": "skulpt",
    "id": "skulpt",
    "url": "/concepts/skulpt.html"
  },
  {
    "label": "PACTOLUS",
    "id": "pactolus",
    "url": "/concepts/pactolus.html"
  },
  {
    "label": "The New Hampshire X Format",
    "id": "nhx",
    "url": "/concepts/nhx.html"
  },
  {
    "label": "Binary notation",
    "id": "binary-notation",
    "url": "/concepts/binary-notation.html"
  },
  {
    "label": "Typst",
    "id": "typst",
    "url": "/concepts/typst.html"
  },
  {
    "label": "Nasal",
    "id": "nasal",
    "url": "/concepts/nasal.html"
  },
  {
    "label": "Promela",
    "id": "promela",
    "url": "/concepts/promela.html"
  },
  {
    "label": "ProbeVue",
    "id": "probevue",
    "url": "/concepts/probevue.html"
  },
  {
    "label": "dslx",
    "id": "dslx",
    "url": "/concepts/dslx.html"
  },
  {
    "label": "ttsneo",
    "id": "ttsneo",
    "url": "/concepts/ttsneo.html"
  },
  {
    "label": "Carpet",
    "id": "carpet",
    "url": "/concepts/carpet.html"
  },
  {
    "label": "RFC",
    "id": "rfc",
    "url": "/concepts/rfc.html"
  },
  {
    "label": "lmdb",
    "id": "lmdb",
    "url": "/concepts/lmdb.html"
  },
  {
    "label": "Apache Maven",
    "id": "maven-pom",
    "url": "/concepts/maven-pom.html"
  },
  {
    "label": "JACL",
    "id": "jacl",
    "url": "/concepts/jacl.html"
  },
  {
    "label": "mavo",
    "id": "mavo",
    "url": "/concepts/mavo.html"
  },
  {
    "label": "invokator",
    "id": "invokator",
    "url": "/concepts/invokator.html"
  },
  {
    "label": "O++",
    "id": "opp",
    "url": "/concepts/opp.html"
  },
  {
    "label": "mint",
    "id": "mint",
    "url": "/concepts/mint.html"
  },
  {
    "label": "C--",
    "id": "c--",
    "url": "/concepts/c--.html"
  },
  {
    "label": "datev",
    "id": "datev",
    "url": "/concepts/datev.html"
  },
  {
    "label": "Please Build",
    "id": "please-build",
    "url": "/concepts/please-build.html"
  },
  {
    "label": "OOPS+",
    "id": "oopsp",
    "url": "/concepts/oopsp.html"
  },
  {
    "label": "Markwhen",
    "id": "markwhen",
    "url": "/concepts/markwhen.html"
  },
  {
    "label": "Virt",
    "id": "virt",
    "url": "/concepts/virt.html"
  },
  {
    "label": "RISC-V",
    "id": "risc-v",
    "url": "/concepts/risc-v.html"
  },
  {
    "label": "opam-pm",
    "id": "opam-pm",
    "url": "/concepts/opam-pm.html"
  },
  {
    "label": "BibTeX",
    "id": "bibtex",
    "url": "/concepts/bibtex.html"
  },
  {
    "label": "Malbolge",
    "id": "malbolge",
    "url": "/concepts/malbolge.html"
  },
  {
    "label": "ASN.1",
    "id": "asn-1",
    "url": "/concepts/asn-1.html"
  },
  {
    "label": "astroml",
    "id": "astroml",
    "url": "/concepts/astroml.html"
  },
  {
    "label": "lobster",
    "id": "lobster",
    "url": "/concepts/lobster.html"
  },
  {
    "label": "Suneido",
    "id": "suneido",
    "url": "/concepts/suneido.html"
  },
  {
    "label": "Uiua",
    "id": "uiua",
    "url": "/concepts/uiua.html"
  },
  {
    "label": "Alpaca",
    "id": "alpaca",
    "url": "/concepts/alpaca.html"
  },
  {
    "label": "dex",
    "id": "dex",
    "url": "/concepts/dex.html"
  },
  {
    "label": "circle-lang",
    "id": "circle-lang",
    "url": "/concepts/circle-lang.html"
  },
  {
    "label": "score",
    "id": "score",
    "url": "/concepts/score.html"
  },
  {
    "label": "dub-pm",
    "id": "dub-pm",
    "url": "/concepts/dub-pm.html"
  },
  {
    "label": "Praat Script",
    "id": "praat-script",
    "url": "/concepts/praat-script.html"
  },
  {
    "label": "sile",
    "id": "sile",
    "url": "/concepts/sile.html"
  },
  {
    "label": "SNOBOL3",
    "id": "snobol3",
    "url": "/concepts/snobol3.html"
  },
  {
    "label": "Snowball",
    "id": "snowball-programming-language",
    "url": "/concepts/snowball-programming-language.html"
  },
  {
    "label": "UnQL",
    "id": "unql-lang",
    "url": "/concepts/unql-lang.html"
  },
  {
    "label": "Liso",
    "id": "liso",
    "url": "/concepts/liso.html"
  },
  {
    "label": "Lisaac",
    "id": "lisaac",
    "url": "/concepts/lisaac.html"
  },
  {
    "label": "Gerbil Scheme",
    "id": "gerbil",
    "url": "/concepts/gerbil.html"
  },
  {
    "label": "Sourcetree",
    "id": "sourcetree",
    "url": "/concepts/sourcetree.html"
  },
  {
    "label": "curv",
    "id": "curv",
    "url": "/concepts/curv.html"
  },
  {
    "label": "Unicode",
    "id": "unicode-lang",
    "url": "/concepts/unicode-lang.html"
  },
  {
    "label": "o2",
    "id": "o2",
    "url": "/concepts/o2.html"
  },
  {
    "label": "soul",
    "id": "soul",
    "url": "/concepts/soul.html"
  },
  {
    "label": "Hyperscript",
    "id": "hyperscript-lang",
    "url": "/concepts/hyperscript-lang.html"
  },
  {
    "label": "hashlink",
    "id": "hashlink",
    "url": "/concepts/hashlink.html"
  },
  {
    "label": "DBase",
    "id": "dbase",
    "url": "/concepts/dbase.html"
  },
  {
    "label": "kitlang",
    "id": "kitlang",
    "url": "/concepts/kitlang.html"
  },
  {
    "label": "mochi",
    "id": "mochi",
    "url": "/concepts/mochi.html"
  },
  {
    "label": "spiral",
    "id": "spiral",
    "url": "/concepts/spiral.html"
  },
  {
    "label": "muon",
    "id": "muon",
    "url": "/concepts/muon.html"
  },
  {
    "label": "neut",
    "id": "neut",
    "url": "/concepts/neut.html"
  },
  {
    "label": "NODAL",
    "id": "nodal",
    "url": "/concepts/nodal.html"
  },
  {
    "label": "smalltalkhub-pm",
    "id": "smalltalkhub-pm",
    "url": "/concepts/smalltalkhub-pm.html"
  },
  {
    "label": "visdown",
    "id": "visdown",
    "url": "/concepts/visdown.html"
  },
  {
    "label": "RELAX NG",
    "id": "relaxng",
    "url": "/concepts/relaxng.html"
  },
  {
    "label": "JSLT",
    "id": "jslt",
    "url": "/concepts/jslt.html"
  },
  {
    "label": "h",
    "id": "h-lang",
    "url": "/concepts/h-lang.html"
  },
  {
    "label": "lain",
    "id": "lain",
    "url": "/concepts/lain.html"
  },
  {
    "label": "Darcs Advanced Revision Control System",
    "id": "darcs-patch",
    "url": "/concepts/darcs-patch.html"
  },
  {
    "label": "singular",
    "id": "singular",
    "url": "/concepts/singular.html"
  },
  {
    "label": "Strips",
    "id": "strips",
    "url": "/concepts/strips.html"
  },
  {
    "label": "Simkin",
    "id": "simkin-programming-language",
    "url": "/concepts/simkin-programming-language.html"
  },
  {
    "label": "Gambas",
    "id": "gambas",
    "url": "/concepts/gambas.html"
  },
  {
    "label": "Redcode",
    "id": "redcode",
    "url": "/concepts/redcode.html"
  },
  {
    "label": "Newton",
    "id": "newton",
    "url": "/concepts/newton.html"
  },
  {
    "label": "STON",
    "id": "ston",
    "url": "/concepts/ston.html"
  },
  {
    "label": "WebIDL",
    "id": "web-idl",
    "url": "/concepts/web-idl.html"
  },
  {
    "label": "Sieve mail filtering language",
    "id": "sieve",
    "url": "/concepts/sieve.html"
  },
  {
    "label": "Links",
    "id": "links-programming-language",
    "url": "/concepts/links-programming-language.html"
  },
  {
    "label": "GAMS",
    "id": "general-algebraic-modeling-system",
    "url": "/concepts/general-algebraic-modeling-system.html"
  },
  {
    "label": "Sheep",
    "id": "sheep-lang",
    "url": "/concepts/sheep-lang.html"
  },
  {
    "label": "RHTML",
    "id": "rhtml",
    "url": "/concepts/rhtml.html"
  },
  {
    "label": "Boogie",
    "id": "boogie",
    "url": "/concepts/boogie.html"
  },
  {
    "label": "ctalk-lang",
    "id": "ctalk-lang",
    "url": "/concepts/ctalk-lang.html"
  },
  {
    "label": "boa",
    "id": "boa",
    "url": "/concepts/boa.html"
  },
  {
    "label": "storyscript",
    "id": "storyscript",
    "url": "/concepts/storyscript.html"
  },
  {
    "label": "Kubernetes",
    "id": "kubernetes",
    "url": "/concepts/kubernetes.html"
  },
  {
    "label": "Podlite",
    "id": "podlite",
    "url": "/concepts/podlite.html"
  },
  {
    "label": "QMake",
    "id": "qmake",
    "url": "/concepts/qmake.html"
  },
  {
    "label": "baysick",
    "id": "baysick",
    "url": "/concepts/baysick.html"
  },
  {
    "label": "datafun",
    "id": "datafun",
    "url": "/concepts/datafun.html"
  },
  {
    "label": "HXML",
    "id": "hxml",
    "url": "/concepts/hxml.html"
  },
  {
    "label": "Maya Embedded Language",
    "id": "maya",
    "url": "/concepts/maya.html"
  },
  {
    "label": "ΜC++",
    "id": "micro-cpp",
    "url": "/concepts/micro-cpp.html"
  },
  {
    "label": "cuneiform",
    "id": "cuneiform",
    "url": "/concepts/cuneiform.html"
  },
  {
    "label": "hexagony",
    "id": "hexagony",
    "url": "/concepts/hexagony.html"
  },
  {
    "label": "NAKL",
    "id": "nakl",
    "url": "/concepts/nakl.html"
  },
  {
    "label": "Apache Hbase",
    "id": "apache-hbase",
    "url": "/concepts/apache-hbase.html"
  },
  {
    "label": "Modula",
    "id": "modula",
    "url": "/concepts/modula.html"
  },
  {
    "label": "BLISS",
    "id": "bliss",
    "url": "/concepts/bliss.html"
  },
  {
    "label": "SIMAN",
    "id": "siman",
    "url": "/concepts/siman.html"
  },
  {
    "label": "Zeek",
    "id": "zeek",
    "url": "/concepts/zeek.html"
  },
  {
    "label": "ApacheConf",
    "id": "apacheconf",
    "url": "/concepts/apacheconf.html"
  },
  {
    "label": "mermaid",
    "id": "mermaid",
    "url": "/concepts/mermaid.html"
  },
  {
    "label": "RLaB",
    "id": "rlab",
    "url": "/concepts/rlab.html"
  },
  {
    "label": "Linoleum (L.in.oleum)",
    "id": "linoleum",
    "url": "/concepts/linoleum.html"
  },
  {
    "label": "TI Program",
    "id": "ti-basic-assembly",
    "url": "/concepts/ti-basic-assembly.html"
  },
  {
    "label": "NS Basic",
    "id": "ns-basic",
    "url": "/concepts/ns-basic.html"
  },
  {
    "label": "emberjs-framework",
    "id": "emberjs-framework",
    "url": "/concepts/emberjs-framework.html"
  },
  {
    "label": "Locomotive BASIC",
    "id": "locomotive-basic",
    "url": "/concepts/locomotive-basic.html"
  },
  {
    "label": "MSL",
    "id": "msl",
    "url": "/concepts/msl.html"
  },
  {
    "label": "Savi",
    "id": "savi",
    "url": "/concepts/savi.html"
  },
  {
    "label": "ISETL",
    "id": "isetl",
    "url": "/concepts/isetl.html"
  },
  {
    "label": "Frost",
    "id": "frost",
    "url": "/concepts/frost.html"
  },
  {
    "label": "FP",
    "id": "fp",
    "url": "/concepts/fp.html"
  },
  {
    "label": "Serious",
    "id": "serious",
    "url": "/concepts/serious.html"
  },
  {
    "label": "Lite-C",
    "id": "lite-c",
    "url": "/concepts/lite-c.html"
  },
  {
    "label": "Simple Actor Language System and Architecture",
    "id": "salsa",
    "url": "/concepts/salsa.html"
  },
  {
    "label": "PeopleCode",
    "id": "peoplecode",
    "url": "/concepts/peoplecode.html"
  },
  {
    "label": "mimix-stream-language",
    "id": "mimix-stream-language",
    "url": "/concepts/mimix-stream-language.html"
  },
  {
    "label": "starpial",
    "id": "starpial",
    "url": "/concepts/starpial.html"
  },
  {
    "label": "JSON-stat",
    "id": "json-stat",
    "url": "/concepts/json-stat.html"
  },
  {
    "label": "orca",
    "id": "orca",
    "url": "/concepts/orca.html"
  },
  {
    "label": "BuddyScript",
    "id": "buddyscript",
    "url": "/concepts/buddyscript.html"
  },
  {
    "label": "Speakeasy",
    "id": "speakeasy",
    "url": "/concepts/speakeasy.html"
  },
  {
    "label": "GFA BASIC",
    "id": "gfa-basic",
    "url": "/concepts/gfa-basic.html"
  },
  {
    "label": "Wart",
    "id": "wart",
    "url": "/concepts/wart.html"
  },
  {
    "label": "Michigan Algorithm Decoder",
    "id": "mad",
    "url": "/concepts/mad.html"
  },
  {
    "label": "KiXtart",
    "id": "kixtart",
    "url": "/concepts/kixtart.html"
  },
  {
    "label": "I-expressions",
    "id": "i-expressions",
    "url": "/concepts/i-expressions.html"
  },
  {
    "label": "pasukon",
    "id": "pasukon",
    "url": "/concepts/pasukon.html"
  },
  {
    "label": "MAGMA",
    "id": "magma",
    "url": "/concepts/magma.html"
  },
  {
    "label": "Dern",
    "id": "dern",
    "url": "/concepts/dern.html"
  },
  {
    "label": "UCG",
    "id": "ucg",
    "url": "/concepts/ucg.html"
  },
  {
    "label": "gura",
    "id": "gura",
    "url": "/concepts/gura.html"
  },
  {
    "label": "Rebeca Modeling Language",
    "id": "rebeca-modeling-language",
    "url": "/concepts/rebeca-modeling-language.html"
  },
  {
    "label": "taf",
    "id": "taf",
    "url": "/concepts/taf.html"
  },
  {
    "label": "Dak",
    "id": "dak",
    "url": "/concepts/dak.html"
  },
  {
    "label": "NeXML format",
    "id": "nexml",
    "url": "/concepts/nexml.html"
  },
  {
    "label": "Newspeak",
    "id": "newspeak",
    "url": "/concepts/newspeak.html"
  },
  {
    "label": "tht",
    "id": "tht",
    "url": "/concepts/tht.html"
  },
  {
    "label": "lever",
    "id": "lever",
    "url": "/concepts/lever.html"
  },
  {
    "label": "FAUST",
    "id": "faust",
    "url": "/concepts/faust.html"
  },
  {
    "label": "wah",
    "id": "wah",
    "url": "/concepts/wah.html"
  },
  {
    "label": "jasmine",
    "id": "jasmine",
    "url": "/concepts/jasmine.html"
  },
  {
    "label": "MOOSE",
    "id": "moose",
    "url": "/concepts/moose.html"
  },
  {
    "label": "JCOF",
    "id": "jcof",
    "url": "/concepts/jcof.html"
  },
  {
    "label": "6gunz",
    "id": "6gunz",
    "url": "/concepts/6gunz.html"
  },
  {
    "label": "Dojo",
    "id": "dojo",
    "url": "/concepts/dojo.html"
  },
  {
    "label": "Iterm2",
    "id": "iterm2",
    "url": "/concepts/iterm2.html"
  },
  {
    "label": "AssemblyScript",
    "id": "assemblyscript",
    "url": "/concepts/assemblyscript.html"
  },
  {
    "label": "Prism",
    "id": "prismjs",
    "url": "/concepts/prismjs.html"
  },
  {
    "label": "capybara",
    "id": "capybara",
    "url": "/concepts/capybara.html"
  },
  {
    "label": "commonmark",
    "id": "commonmark",
    "url": "/concepts/commonmark.html"
  },
  {
    "label": "protium",
    "id": "protium",
    "url": "/concepts/protium.html"
  },
  {
    "label": "docopt",
    "id": "docopt",
    "url": "/concepts/docopt.html"
  },
  {
    "label": "dat-protocol",
    "id": "dat-protocol",
    "url": "/concepts/dat-protocol.html"
  },
  {
    "label": "mmix",
    "id": "mmix",
    "url": "/concepts/mmix.html"
  },
  {
    "label": "Homebrew",
    "id": "homebrew-pm",
    "url": "/concepts/homebrew-pm.html"
  },
  {
    "label": "plink-map-format",
    "id": "plink-map-format",
    "url": "/concepts/plink-map-format.html"
  },
  {
    "label": "plink-bed-format",
    "id": "plink-bed-format",
    "url": "/concepts/plink-bed-format.html"
  },
  {
    "label": "penrose",
    "id": "penrose",
    "url": "/concepts/penrose.html"
  },
  {
    "label": "plasma",
    "id": "plasma",
    "url": "/concepts/plasma.html"
  },
  {
    "label": "STRUDL",
    "id": "strudl",
    "url": "/concepts/strudl.html"
  },
  {
    "label": "Streem",
    "id": "streem",
    "url": "/concepts/streem.html"
  },
  {
    "label": "TCP",
    "id": "tcp",
    "url": "/concepts/tcp.html"
  },
  {
    "label": "URL",
    "id": "url",
    "url": "/concepts/url.html"
  },
  {
    "label": "AXIOM",
    "id": "axiom",
    "url": "/concepts/axiom.html"
  },
  {
    "label": "MDL",
    "id": "methodology-description-language",
    "url": "/concepts/methodology-description-language.html"
  },
  {
    "label": "StreamIt",
    "id": "streamit",
    "url": "/concepts/streamit.html"
  },
  {
    "label": "chisel",
    "id": "chisel",
    "url": "/concepts/chisel.html"
  },
  {
    "label": "Generic Expression Language",
    "id": "gel",
    "url": "/concepts/gel.html"
  },
  {
    "label": "Statement List",
    "id": "stl",
    "url": "/concepts/stl.html"
  },
  {
    "label": "paxScript",
    "id": "paxscript",
    "url": "/concepts/paxscript.html"
  },
  {
    "label": "Statemate",
    "id": "statemate",
    "url": "/concepts/statemate.html"
  },
  {
    "label": "Numba",
    "id": "numba",
    "url": "/concepts/numba.html"
  },
  {
    "label": "checked-c",
    "id": "checked-c",
    "url": "/concepts/checked-c.html"
  },
  {
    "label": "grep",
    "id": "grep",
    "url": "/concepts/grep.html"
  },
  {
    "label": "SR",
    "id": "sr",
    "url": "/concepts/sr.html"
  },
  {
    "label": "SQUARE",
    "id": "square",
    "url": "/concepts/square.html"
  },
  {
    "label": "Vigil",
    "id": "vigil",
    "url": "/concepts/vigil.html"
  },
  {
    "label": "IT",
    "id": "it",
    "url": "/concepts/it.html"
  },
  {
    "label": "chevrotain",
    "id": "chevrotain",
    "url": "/concepts/chevrotain.html"
  },
  {
    "label": "Tiny C Compiler",
    "id": "tinyc-compiler",
    "url": "/concepts/tinyc-compiler.html"
  },
  {
    "label": "SPRINT",
    "id": "sprint",
    "url": "/concepts/sprint.html"
  },
  {
    "label": "SPLAW",
    "id": "splaw",
    "url": "/concepts/splaw.html"
  },
  {
    "label": "dexvis",
    "id": "dexvis",
    "url": "/concepts/dexvis.html"
  },
  {
    "label": "o42a",
    "id": "o42a",
    "url": "/concepts/o42a.html"
  },
  {
    "label": "HL7",
    "id": "hl7",
    "url": "/concepts/hl7.html"
  },
  {
    "label": "SPIL",
    "id": "spil",
    "url": "/concepts/spil.html"
  },
  {
    "label": "comby",
    "id": "comby",
    "url": "/concepts/comby.html"
  },
  {
    "label": "crush",
    "id": "crush",
    "url": "/concepts/crush.html"
  },
  {
    "label": "SGML",
    "id": "sgml",
    "url": "/concepts/sgml.html"
  },
  {
    "label": "bpkg-pm",
    "id": "bpkg-pm",
    "url": "/concepts/bpkg-pm.html"
  },
  {
    "label": "lamdu-editor",
    "id": "lamdu-editor",
    "url": "/concepts/lamdu-editor.html"
  },
  {
    "label": "tidyverse",
    "id": "tidyverse",
    "url": "/concepts/tidyverse.html"
  },
  {
    "label": "specrtl",
    "id": "specrtl",
    "url": "/concepts/specrtl.html"
  },
  {
    "label": "NU-Prolog",
    "id": "nu-prolog",
    "url": "/concepts/nu-prolog.html"
  },
  {
    "label": "SPECOL",
    "id": "specol",
    "url": "/concepts/specol.html"
  },
  {
    "label": "Spec",
    "id": "spec",
    "url": "/concepts/spec.html"
  },
  {
    "label": "MAPS",
    "id": "maps",
    "url": "/concepts/maps.html"
  },
  {
    "label": "sora",
    "id": "sora",
    "url": "/concepts/sora.html"
  },
  {
    "label": "Simulink",
    "id": "simulink",
    "url": "/concepts/simulink.html"
  },
  {
    "label": "Soar Markup Language",
    "id": "soar-ml",
    "url": "/concepts/soar-ml.html"
  },
  {
    "label": "hobbes",
    "id": "hobbes",
    "url": "/concepts/hobbes.html"
  },
  {
    "label": "spider",
    "id": "spider",
    "url": "/concepts/spider.html"
  },
  {
    "label": "Symbolic Optimal Assembly Program",
    "id": "soaplang",
    "url": "/concepts/soaplang.html"
  },
  {
    "label": "myrddin",
    "id": "myrddin",
    "url": "/concepts/myrddin.html"
  },
  {
    "label": "Marine Trading Markup Language",
    "id": "mtml",
    "url": "/concepts/mtml.html"
  },
  {
    "label": "flowchart.fun",
    "id": "flowchart-fun",
    "url": "/concepts/flowchart-fun.html"
  },
  {
    "label": "Revolution",
    "id": "revolution-programming-language",
    "url": "/concepts/revolution-programming-language.html"
  },
  {
    "label": "SMSL",
    "id": "smsl",
    "url": "/concepts/smsl.html"
  },
  {
    "label": "JavaCC",
    "id": "javacc",
    "url": "/concepts/javacc.html"
  },
  {
    "label": "ferret",
    "id": "ferret",
    "url": "/concepts/ferret.html"
  },
  {
    "label": "Gzip",
    "id": "gzip",
    "url": "/concepts/gzip.html"
  },
  {
    "label": "SMART",
    "id": "smart",
    "url": "/concepts/smart.html"
  },
  {
    "label": "Glicol",
    "id": "glicol",
    "url": "/concepts/glicol.html"
  },
  {
    "label": "SmallVDM",
    "id": "smallvdm",
    "url": "/concepts/smallvdm.html"
  },
  {
    "label": "EML",
    "id": "mbox",
    "url": "/concepts/mbox.html"
  },
  {
    "label": "Oxyl",
    "id": "oxyl",
    "url": "/concepts/oxyl.html"
  },
  {
    "label": "koara",
    "id": "koara",
    "url": "/concepts/koara.html"
  },
  {
    "label": "Smalltalk/V",
    "id": "smalltalk-v",
    "url": "/concepts/smalltalk-v.html"
  },
  {
    "label": "PEG",
    "id": "peg",
    "url": "/concepts/peg.html"
  },
  {
    "label": "Friendly Enough Expression Language",
    "id": "feel",
    "url": "/concepts/feel.html"
  },
  {
    "label": "Mathcad",
    "id": "mathcad",
    "url": "/concepts/mathcad.html"
  },
  {
    "label": "noulith",
    "id": "noulith",
    "url": "/concepts/noulith.html"
  },
  {
    "label": "Lorel",
    "id": "lorel",
    "url": "/concepts/lorel.html"
  },
  {
    "label": "merd",
    "id": "merd",
    "url": "/concepts/merd.html"
  },
  {
    "label": "Lorel",
    "id": "lorel-1",
    "url": "/concepts/lorel-1.html"
  },
  {
    "label": "SLOG",
    "id": "slog",
    "url": "/concepts/slog.html"
  },
  {
    "label": "co-dfns",
    "id": "co-dfns",
    "url": "/concepts/co-dfns.html"
  },
  {
    "label": "SLIPS",
    "id": "slips",
    "url": "/concepts/slips.html"
  },
  {
    "label": "LOLA",
    "id": "lola",
    "url": "/concepts/lola.html"
  },
  {
    "label": "SQF",
    "id": "status-quo-function",
    "url": "/concepts/status-quo-function.html"
  },
  {
    "label": "SLANG",
    "id": "slang",
    "url": "/concepts/slang.html"
  },
  {
    "label": "Spline Font Database",
    "id": "spline-font-database",
    "url": "/concepts/spline-font-database.html"
  },
  {
    "label": "GN",
    "id": "generate-ninja",
    "url": "/concepts/generate-ninja.html"
  },
  {
    "label": "Creole",
    "id": "creole",
    "url": "/concepts/creole.html"
  },
  {
    "label": "psyche-c",
    "id": "psyche-c",
    "url": "/concepts/psyche-c.html"
  },
  {
    "label": "GNU Assembler",
    "id": "gas",
    "url": "/concepts/gas.html"
  },
  {
    "label": "Mathpix Markdown",
    "id": "mathpix-markdown",
    "url": "/concepts/mathpix-markdown.html"
  },
  {
    "label": "abs",
    "id": "abs",
    "url": "/concepts/abs.html"
  },
  {
    "label": "quicklisp-pm",
    "id": "quicklisp-pm",
    "url": "/concepts/quicklisp-pm.html"
  },
  {
    "label": "Inno Setup",
    "id": "inno-setup",
    "url": "/concepts/inno-setup.html"
  },
  {
    "label": "ink-lang",
    "id": "ink-lang",
    "url": "/concepts/ink-lang.html"
  },
  {
    "label": "SL",
    "id": "sl",
    "url": "/concepts/sl.html"
  },
  {
    "label": "Austral",
    "id": "austral",
    "url": "/concepts/austral.html"
  },
  {
    "label": "Flowgorithm",
    "id": "flowgorithm",
    "url": "/concepts/flowgorithm.html"
  },
  {
    "label": "SKY",
    "id": "sky",
    "url": "/concepts/sky.html"
  },
  {
    "label": "Urbiscript",
    "id": "urbiscript",
    "url": "/concepts/urbiscript.html"
  },
  {
    "label": "hakaru",
    "id": "hakaru",
    "url": "/concepts/hakaru.html"
  },
  {
    "label": "crmsh",
    "id": "crmsh",
    "url": "/concepts/crmsh.html"
  },
  {
    "label": "SKIL",
    "id": "skil",
    "url": "/concepts/skil.html"
  },
  {
    "label": "EverParse3D",
    "id": "everparse3d",
    "url": "/concepts/everparse3d.html"
  },
  {
    "label": "luau",
    "id": "luau",
    "url": "/concepts/luau.html"
  },
  {
    "label": "minikanren",
    "id": "minikanren",
    "url": "/concepts/minikanren.html"
  },
  {
    "label": "Quake",
    "id": "quake",
    "url": "/concepts/quake.html"
  },
  {
    "label": "Siprol",
    "id": "siprol",
    "url": "/concepts/siprol.html"
  },
  {
    "label": "Low*",
    "id": "lowstar",
    "url": "/concepts/lowstar.html"
  },
  {
    "label": "UPC",
    "id": "unified-parallel-c",
    "url": "/concepts/unified-parallel-c.html"
  },
  {
    "label": "ETC",
    "id": "etc",
    "url": "/concepts/etc.html"
  },
  {
    "label": "XPL0",
    "id": "xpl0",
    "url": "/concepts/xpl0.html"
  },
  {
    "label": "Sim++",
    "id": "simpp",
    "url": "/concepts/simpp.html"
  },
  {
    "label": "JOVIAL",
    "id": "jovial",
    "url": "/concepts/jovial.html"
  },
  {
    "label": "Mond",
    "id": "mond",
    "url": "/concepts/mond.html"
  },
  {
    "label": "GorillaScript",
    "id": "gorillascript",
    "url": "/concepts/gorillascript.html"
  },
  {
    "label": "Pandoc",
    "id": "pandoc-app",
    "url": "/concepts/pandoc-app.html"
  },
  {
    "label": "TECO",
    "id": "teco",
    "url": "/concepts/teco.html"
  },
  {
    "label": "METAFONT",
    "id": "metafont",
    "url": "/concepts/metafont.html"
  },
  {
    "label": "michelson",
    "id": "michelson",
    "url": "/concepts/michelson.html"
  },
  {
    "label": "Functional PHP Preprocessor",
    "id": "fpp",
    "url": "/concepts/fpp.html"
  },
  {
    "label": "Noweb",
    "id": "noweb",
    "url": "/concepts/noweb.html"
  },
  {
    "label": "CSVw",
    "id": "csvw",
    "url": "/concepts/csvw.html"
  },
  {
    "label": "SIMODULA",
    "id": "simodula",
    "url": "/concepts/simodula.html"
  },
  {
    "label": "System Automatycznego Kodowania Operacji",
    "id": "sako",
    "url": "/concepts/sako.html"
  },
  {
    "label": "Glyph",
    "id": "glyph",
    "url": "/concepts/glyph.html"
  },
  {
    "label": "PowerBASIC",
    "id": "powerbasic",
    "url": "/concepts/powerbasic.html"
  },
  {
    "label": "Nadesiko",
    "id": "nadesiko",
    "url": "/concepts/nadesiko.html"
  },
  {
    "label": "Applesoft BASIC",
    "id": "applesoft-basic",
    "url": "/concepts/applesoft-basic.html"
  },
  {
    "label": "Small",
    "id": "small",
    "url": "/concepts/small.html"
  },
  {
    "label": "Gren",
    "id": "gren",
    "url": "/concepts/gren.html"
  },
  {
    "label": "Margin",
    "id": "margin",
    "url": "/concepts/margin.html"
  },
  {
    "label": "FRACTRAN",
    "id": "fractran",
    "url": "/concepts/fractran.html"
  },
  {
    "label": "Alice",
    "id": "alice",
    "url": "/concepts/alice.html"
  },
  {
    "label": "emoticon",
    "id": "emoticon",
    "url": "/concepts/emoticon.html"
  },
  {
    "label": "OpenComal",
    "id": "opencomal",
    "url": "/concepts/opencomal.html"
  },
  {
    "label": "NESL",
    "id": "nesl",
    "url": "/concepts/nesl.html"
  },
  {
    "label": "HAL Format",
    "id": "hal-format",
    "url": "/concepts/hal-format.html"
  },
  {
    "label": "DokuWiki",
    "id": "dokuwiki",
    "url": "/concepts/dokuwiki.html"
  },
  {
    "label": "TAL",
    "id": "tal",
    "url": "/concepts/tal.html"
  },
  {
    "label": "candor",
    "id": "candor",
    "url": "/concepts/candor.html"
  },
  {
    "label": "Ant Build System",
    "id": "ant-build-system",
    "url": "/concepts/ant-build-system.html"
  },
  {
    "label": "cat",
    "id": "cat",
    "url": "/concepts/cat.html"
  },
  {
    "label": "tao3d",
    "id": "tao3d",
    "url": "/concepts/tao3d.html"
  },
  {
    "label": "AIMMS",
    "id": "aimms",
    "url": "/concepts/aimms.html"
  },
  {
    "label": "MACRO-10",
    "id": "macro-10",
    "url": "/concepts/macro-10.html"
  },
  {
    "label": "A++",
    "id": "aplusplus",
    "url": "/concepts/aplusplus.html"
  },
  {
    "label": "OEM",
    "id": "oem",
    "url": "/concepts/oem.html"
  },
  {
    "label": "SIGMA 76",
    "id": "sigma-76",
    "url": "/concepts/sigma-76.html"
  },
  {
    "label": "KRC",
    "id": "krc",
    "url": "/concepts/krc.html"
  },
  {
    "label": "NL",
    "id": "nl",
    "url": "/concepts/nl.html"
  },
  {
    "label": "SIDOPS+",
    "id": "sidopsp",
    "url": "/concepts/sidopsp.html"
  },
  {
    "label": "LIFE",
    "id": "life",
    "url": "/concepts/life.html"
  },
  {
    "label": "LARP",
    "id": "larp",
    "url": "/concepts/larp.html"
  },
  {
    "label": "bioscript",
    "id": "bioscript",
    "url": "/concepts/bioscript.html"
  },
  {
    "label": "FutureBASIC",
    "id": "futurebasic",
    "url": "/concepts/futurebasic.html"
  },
  {
    "label": "Alpine Abuild",
    "id": "alpine-abuild",
    "url": "/concepts/alpine-abuild.html"
  },
  {
    "label": "ToonTalk",
    "id": "toontalk",
    "url": "/concepts/toontalk.html"
  },
  {
    "label": "OPS5",
    "id": "ops5",
    "url": "/concepts/ops5.html"
  },
  {
    "label": "moya",
    "id": "moya",
    "url": "/concepts/moya.html"
  },
  {
    "label": "Arden syntax",
    "id": "arden-syntax",
    "url": "/concepts/arden-syntax.html"
  },
  {
    "label": "FL",
    "id": "fl",
    "url": "/concepts/fl.html"
  },
  {
    "label": "LUCID",
    "id": "lucid",
    "url": "/concepts/lucid.html"
  },
  {
    "label": "Seymour",
    "id": "seymour",
    "url": "/concepts/seymour.html"
  },
  {
    "label": "CLAIRE",
    "id": "claire",
    "url": "/concepts/claire.html"
  },
  {
    "label": "GRASS",
    "id": "grass",
    "url": "/concepts/grass.html"
  },
  {
    "label": "PLANNER",
    "id": "planner",
    "url": "/concepts/planner.html"
  },
  {
    "label": "verve",
    "id": "verve",
    "url": "/concepts/verve.html"
  },
  {
    "label": "nianiolang",
    "id": "nianiolang",
    "url": "/concepts/nianiolang.html"
  },
  {
    "label": "nylo",
    "id": "nylo",
    "url": "/concepts/nylo.html"
  },
  {
    "label": "Fjölnir",
    "id": "fjolnir",
    "url": "/concepts/fjolnir.html"
  },
  {
    "label": "Prograph",
    "id": "prograph",
    "url": "/concepts/prograph.html"
  },
  {
    "label": "AMOS",
    "id": "amos",
    "url": "/concepts/amos.html"
  },
  {
    "label": "Alma",
    "id": "alma-007",
    "url": "/concepts/alma-007.html"
  },
  {
    "label": "P*",
    "id": "p-star",
    "url": "/concepts/p-star.html"
  },
  {
    "label": "Little Implementation Language",
    "id": "lil",
    "url": "/concepts/lil.html"
  },
  {
    "label": "Basic-256",
    "id": "basic-256",
    "url": "/concepts/basic-256.html"
  },
  {
    "label": "Easytrieve",
    "id": "easytrieve",
    "url": "/concepts/easytrieve.html"
  },
  {
    "label": "SESPATH",
    "id": "sespath",
    "url": "/concepts/sespath.html"
  },
  {
    "label": "Macchiato",
    "id": "macchiato",
    "url": "/concepts/macchiato.html"
  },
  {
    "label": "dllup",
    "id": "dllup",
    "url": "/concepts/dllup.html"
  },
  {
    "label": "huginn",
    "id": "huginn",
    "url": "/concepts/huginn.html"
  },
  {
    "label": "Miva",
    "id": "miva",
    "url": "/concepts/miva.html"
  },
  {
    "label": "Yet Another Scripting Language",
    "id": "yasl",
    "url": "/concepts/yasl.html"
  },
  {
    "label": "Ham",
    "id": "ham",
    "url": "/concepts/ham.html"
  },
  {
    "label": "Mudlle",
    "id": "mudlle",
    "url": "/concepts/mudlle.html"
  },
  {
    "label": "Toy",
    "id": "toy-lang",
    "url": "/concepts/toy-lang.html"
  },
  {
    "label": "kumir",
    "id": "kumir",
    "url": "/concepts/kumir.html"
  },
  {
    "label": "Formula language",
    "id": "formula",
    "url": "/concepts/formula.html"
  },
  {
    "label": "Plaid",
    "id": "plaid-programming-language",
    "url": "/concepts/plaid-programming-language.html"
  },
  {
    "label": "Crema",
    "id": "crema",
    "url": "/concepts/crema.html"
  },
  {
    "label": "zenscript",
    "id": "zenscript",
    "url": "/concepts/zenscript.html"
  },
  {
    "label": "USD",
    "id": "usd",
    "url": "/concepts/usd.html"
  },
  {
    "label": "Violent ES",
    "id": "violent-es",
    "url": "/concepts/violent-es.html"
  },
  {
    "label": "RapidBatch",
    "id": "rapidbatch",
    "url": "/concepts/rapidbatch.html"
  },
  {
    "label": "Bistro",
    "id": "bistro-programming-language",
    "url": "/concepts/bistro-programming-language.html"
  },
  {
    "label": "pinto",
    "id": "pinto",
    "url": "/concepts/pinto.html"
  },
  {
    "label": "p4p",
    "id": "p4p",
    "url": "/concepts/p4p.html"
  },
  {
    "label": "stringbean",
    "id": "stringbean",
    "url": "/concepts/stringbean.html"
  },
  {
    "label": "blz",
    "id": "blz",
    "url": "/concepts/blz.html"
  },
  {
    "label": "sill",
    "id": "sill",
    "url": "/concepts/sill.html"
  },
  {
    "label": "Alumina",
    "id": "alumina",
    "url": "/concepts/alumina.html"
  },
  {
    "label": "Aith",
    "id": "aith",
    "url": "/concepts/aith.html"
  },
  {
    "label": "Đ",
    "id": "edh",
    "url": "/concepts/edh.html"
  },
  {
    "label": "jiyu",
    "id": "jiyu",
    "url": "/concepts/jiyu.html"
  },
  {
    "label": "DragonBASIC",
    "id": "dragonbasic",
    "url": "/concepts/dragonbasic.html"
  },
  {
    "label": "Ante",
    "id": "ante-esolang",
    "url": "/concepts/ante-esolang.html"
  },
  {
    "label": "Battlestar",
    "id": "battlestar",
    "url": "/concepts/battlestar.html"
  },
  {
    "label": "CORAL",
    "id": "coral",
    "url": "/concepts/coral.html"
  },
  {
    "label": "Ripple",
    "id": "ripple",
    "url": "/concepts/ripple.html"
  },
  {
    "label": "leaf",
    "id": "leaf",
    "url": "/concepts/leaf.html"
  },
  {
    "label": "plink-ped-format",
    "id": "plink-ped-format",
    "url": "/concepts/plink-ped-format.html"
  },
  {
    "label": "juicy",
    "id": "juicy",
    "url": "/concepts/juicy.html"
  },
  {
    "label": "Acme",
    "id": "acme",
    "url": "/concepts/acme.html"
  },
  {
    "label": "SEARCH",
    "id": "search",
    "url": "/concepts/search.html"
  },
  {
    "label": "elegance",
    "id": "elegance",
    "url": "/concepts/elegance.html"
  },
  {
    "label": "SCREAMER",
    "id": "screamer",
    "url": "/concepts/screamer.html"
  },
  {
    "label": "L6",
    "id": "l6",
    "url": "/concepts/l6.html"
  },
  {
    "label": "Indental",
    "id": "indental",
    "url": "/concepts/indental.html"
  },
  {
    "label": "SCOOP",
    "id": "scoop",
    "url": "/concepts/scoop.html"
  },
  {
    "label": "Vim",
    "id": "vim-editor",
    "url": "/concepts/vim-editor.html"
  },
  {
    "label": "Structured Control Language",
    "id": "scl",
    "url": "/concepts/scl.html"
  },
  {
    "label": "Emacs",
    "id": "emacs-editor",
    "url": "/concepts/emacs-editor.html"
  },
  {
    "label": "MathType",
    "id": "mathtype",
    "url": "/concepts/mathtype.html"
  },
  {
    "label": "Scenic",
    "id": "scenic",
    "url": "/concepts/scenic.html"
  },
  {
    "label": "kivy-lang",
    "id": "kivy-lang",
    "url": "/concepts/kivy-lang.html"
  },
  {
    "label": "PowerPC",
    "id": "powerpc",
    "url": "/concepts/powerpc.html"
  },
  {
    "label": "JOSS",
    "id": "joss",
    "url": "/concepts/joss.html"
  },
  {
    "label": "Statsplorer",
    "id": "statsplorer",
    "url": "/concepts/statsplorer.html"
  },
  {
    "label": "Morse code",
    "id": "morse-code",
    "url": "/concepts/morse-code.html"
  },
  {
    "label": "Sampletalk",
    "id": "sampletalk",
    "url": "/concepts/sampletalk.html"
  },
  {
    "label": "SALEM",
    "id": "salem",
    "url": "/concepts/salem.html"
  },
  {
    "label": "KB",
    "id": "kb",
    "url": "/concepts/kb.html"
  },
  {
    "label": "UDP",
    "id": "udp",
    "url": "/concepts/udp.html"
  },
  {
    "label": "Knowledge Acquisition and Representation Language",
    "id": "karl",
    "url": "/concepts/karl.html"
  },
  {
    "label": "SA",
    "id": "sa",
    "url": "/concepts/sa.html"
  },
  {
    "label": "dgraph",
    "id": "dgraph",
    "url": "/concepts/dgraph.html"
  },
  {
    "label": "RUTH",
    "id": "ruth",
    "url": "/concepts/ruth.html"
  },
  {
    "label": "Scoop",
    "id": "scoop-pm",
    "url": "/concepts/scoop-pm.html"
  },
  {
    "label": "RUSSELL",
    "id": "russell",
    "url": "/concepts/russell.html"
  },
  {
    "label": "Goal",
    "id": "goal",
    "url": "/concepts/goal.html"
  },
  {
    "label": "Mindsdb",
    "id": "minidsdb",
    "url": "/concepts/minidsdb.html"
  },
  {
    "label": "RUNCIBLE",
    "id": "runcible",
    "url": "/concepts/runcible.html"
  },
  {
    "label": "SI",
    "id": "si",
    "url": "/concepts/si.html"
  },
  {
    "label": "jplace",
    "id": "jplace",
    "url": "/concepts/jplace.html"
  },
  {
    "label": "F Prime",
    "id": "f-prime",
    "url": "/concepts/f-prime.html"
  },
  {
    "label": "ROSCOE",
    "id": "roscoe",
    "url": "/concepts/roscoe.html"
  },
  {
    "label": "ROS Message",
    "id": "ros-msg",
    "url": "/concepts/ros-msg.html"
  },
  {
    "label": "PDF",
    "id": "pdf",
    "url": "/concepts/pdf.html"
  },
  {
    "label": "GAME",
    "id": "game",
    "url": "/concepts/game.html"
  },
  {
    "label": "Conan",
    "id": "conan-pm",
    "url": "/concepts/conan-pm.html"
  },
  {
    "label": "Desmos",
    "id": "desmos",
    "url": "/concepts/desmos.html"
  },
  {
    "label": "souffle",
    "id": "souffle",
    "url": "/concepts/souffle.html"
  },
  {
    "label": "htmx",
    "id": "htmx",
    "url": "/concepts/htmx.html"
  },
  {
    "label": "RoboTalk",
    "id": "robotalk",
    "url": "/concepts/robotalk.html"
  },
  {
    "label": "RLISP",
    "id": "rlisp",
    "url": "/concepts/rlisp.html"
  },
  {
    "label": "Spark",
    "id": "spark-pl",
    "url": "/concepts/spark-pl.html"
  },
  {
    "label": "rise",
    "id": "rise",
    "url": "/concepts/rise.html"
  },
  {
    "label": "IcedCoffeeScript",
    "id": "icedcoffeescript",
    "url": "/concepts/icedcoffeescript.html"
  },
  {
    "label": "ddfql",
    "id": "ddfql",
    "url": "/concepts/ddfql.html"
  },
  {
    "label": "Reuse Description Language",
    "id": "reuse-description-language",
    "url": "/concepts/reuse-description-language.html"
  },
  {
    "label": "Fawlty",
    "id": "fawlty",
    "url": "/concepts/fawlty.html"
  },
  {
    "label": "contracts.coffee",
    "id": "contracts.coffee",
    "url": "/concepts/contracts.coffee.html"
  },
  {
    "label": "Relix",
    "id": "relix",
    "url": "/concepts/relix.html"
  },
  {
    "label": "BlackCoffee",
    "id": "blackcoffee",
    "url": "/concepts/blackcoffee.html"
  },
  {
    "label": "bosque",
    "id": "bosque",
    "url": "/concepts/bosque.html"
  },
  {
    "label": "IRC chat logs",
    "id": "irc-log",
    "url": "/concepts/irc-log.html"
  },
  {
    "label": "REL",
    "id": "rel",
    "url": "/concepts/rel.html"
  },
  {
    "label": "REL English",
    "id": "rel-english",
    "url": "/concepts/rel-english.html"
  },
  {
    "label": "m3db",
    "id": "m3db",
    "url": "/concepts/m3db.html"
  },
  {
    "label": "ohm",
    "id": "ohm",
    "url": "/concepts/ohm.html"
  },
  {
    "label": "DIAGRAM",
    "id": "diagram",
    "url": "/concepts/diagram.html"
  },
  {
    "label": "Triton",
    "id": "triton",
    "url": "/concepts/triton.html"
  },
  {
    "label": "Refined C",
    "id": "refined-c",
    "url": "/concepts/refined-c.html"
  },
  {
    "label": "Django",
    "id": "django",
    "url": "/concepts/django.html"
  },
  {
    "label": "BPMN",
    "id": "bpmn",
    "url": "/concepts/bpmn.html"
  },
  {
    "label": "Melody",
    "id": "melody",
    "url": "/concepts/melody.html"
  },
  {
    "label": "Rebus",
    "id": "rebus",
    "url": "/concepts/rebus.html"
  },
  {
    "label": "ScriptEase",
    "id": "scriptease",
    "url": "/concepts/scriptease.html"
  },
  {
    "label": "Real-Time Euclid",
    "id": "real-time-euclid",
    "url": "/concepts/real-time-euclid.html"
  },
  {
    "label": "Sather-K",
    "id": "sather-k",
    "url": "/concepts/sather-k.html"
  },
  {
    "label": "Google Cloud Platform",
    "id": "google-cloud",
    "url": "/concepts/google-cloud.html"
  },
  {
    "label": "manhood",
    "id": "manhood",
    "url": "/concepts/manhood.html"
  },
  {
    "label": "rdata-format",
    "id": "rdata-format",
    "url": "/concepts/rdata-format.html"
  },
  {
    "label": "RC++",
    "id": "rcpp",
    "url": "/concepts/rcpp.html"
  },
  {
    "label": "CSL",
    "id": "csl",
    "url": "/concepts/csl.html"
  },
  {
    "label": "CP",
    "id": "cp",
    "url": "/concepts/cp.html"
  },
  {
    "label": "Open Shading Language",
    "id": "open-shading-language",
    "url": "/concepts/open-shading-language.html"
  },
  {
    "label": "Luna",
    "id": "luna-1",
    "url": "/concepts/luna-1.html"
  },
  {
    "label": "RACK",
    "id": "rack",
    "url": "/concepts/rack.html"
  },
  {
    "label": "IFO",
    "id": "ifo",
    "url": "/concepts/ifo.html"
  },
  {
    "label": "QUILT",
    "id": "quilt",
    "url": "/concepts/quilt.html"
  },
  {
    "label": "Ladder Logic",
    "id": "ladder-logic",
    "url": "/concepts/ladder-logic.html"
  },
  {
    "label": "Quick Macros",
    "id": "quick-macros",
    "url": "/concepts/quick-macros.html"
  },
  {
    "label": "UCL",
    "id": "ucl",
    "url": "/concepts/ucl.html"
  },
  {
    "label": "erg",
    "id": "erg",
    "url": "/concepts/erg.html"
  },
  {
    "label": "RStudio",
    "id": "rstudio-editor",
    "url": "/concepts/rstudio-editor.html"
  },
  {
    "label": "Wasp",
    "id": "wasp-lang",
    "url": "/concepts/wasp-lang.html"
  },
  {
    "label": "Quanta",
    "id": "quanta",
    "url": "/concepts/quanta.html"
  },
  {
    "label": "cperl",
    "id": "cperl",
    "url": "/concepts/cperl.html"
  },
  {
    "label": "haste",
    "id": "haste",
    "url": "/concepts/haste.html"
  },
  {
    "label": "QUADRIL",
    "id": "quadril",
    "url": "/concepts/quadril.html"
  },
  {
    "label": "zz",
    "id": "zz",
    "url": "/concepts/zz.html"
  },
  {
    "label": "IBEX",
    "id": "ibex",
    "url": "/concepts/ibex.html"
  },
  {
    "label": "QAS",
    "id": "qas",
    "url": "/concepts/qas.html"
  },
  {
    "label": "kona",
    "id": "kona",
    "url": "/concepts/kona.html"
  },
  {
    "label": "Lux",
    "id": "lux",
    "url": "/concepts/lux.html"
  },
  {
    "label": "SWI Prolog",
    "id": "swi-prolog",
    "url": "/concepts/swi-prolog.html"
  },
  {
    "label": "python-cl-compiler",
    "id": "python-cl-compiler",
    "url": "/concepts/python-cl-compiler.html"
  },
  {
    "label": "Py",
    "id": "py",
    "url": "/concepts/py.html"
  },
  {
    "label": "MASM",
    "id": "masm",
    "url": "/concepts/masm.html"
  },
  {
    "label": "IA-32",
    "id": "ia-32",
    "url": "/concepts/ia-32.html"
  },
  {
    "label": "Berry",
    "id": "berry",
    "url": "/concepts/berry.html"
  },
  {
    "label": "Godot",
    "id": "godot-game-engine",
    "url": "/concepts/godot-game-engine.html"
  },
  {
    "label": "AsciiMath",
    "id": "asciimath",
    "url": "/concepts/asciimath.html"
  },
  {
    "label": "Asterisk",
    "id": "asterisk",
    "url": "/concepts/asterisk.html"
  },
  {
    "label": "Ć",
    "id": "cito",
    "url": "/concepts/cito.html"
  },
  {
    "label": "Carbon",
    "id": "carbon",
    "url": "/concepts/carbon.html"
  },
  {
    "label": "Proxy",
    "id": "proxy",
    "url": "/concepts/proxy.html"
  },
  {
    "label": "prodel",
    "id": "prodel",
    "url": "/concepts/prodel.html"
  },
  {
    "label": "Clausal Language",
    "id": "clausal-lang",
    "url": "/concepts/clausal-lang.html"
  },
  {
    "label": "NuGet",
    "id": "nuget-pm",
    "url": "/concepts/nuget-pm.html"
  },
  {
    "label": "GW-BASIC",
    "id": "gw-basic",
    "url": "/concepts/gw-basic.html"
  },
  {
    "label": "Procfile",
    "id": "procfile",
    "url": "/concepts/procfile.html"
  },
  {
    "label": "ProVerif",
    "id": "proverif-lang",
    "url": "/concepts/proverif-lang.html"
  },
  {
    "label": "Homespring",
    "id": "homespring",
    "url": "/concepts/homespring.html"
  },
  {
    "label": "Pomsky",
    "id": "pomsky",
    "url": "/concepts/pomsky.html"
  },
  {
    "label": "Apache Spark",
    "id": "spark",
    "url": "/concepts/spark.html"
  },
  {
    "label": "Catala",
    "id": "catala",
    "url": "/concepts/catala.html"
  },
  {
    "label": "Eagle",
    "id": "eagle",
    "url": "/concepts/eagle.html"
  },
  {
    "label": "proto-GNOSIS",
    "id": "proto-gnosis",
    "url": "/concepts/proto-gnosis.html"
  },
  {
    "label": "PROSPER",
    "id": "prosper",
    "url": "/concepts/prosper.html"
  },
  {
    "label": "jayfor",
    "id": "jayfor",
    "url": "/concepts/jayfor.html"
  },
  {
    "label": "Multics",
    "id": "multics",
    "url": "/concepts/multics.html"
  },
  {
    "label": "PROPHET",
    "id": "prophet",
    "url": "/concepts/prophet.html"
  },
  {
    "label": "HMMM",
    "id": "hmmm",
    "url": "/concepts/hmmm.html"
  },
  {
    "label": "Marp",
    "id": "marp",
    "url": "/concepts/marp.html"
  },
  {
    "label": "Seq",
    "id": "seq",
    "url": "/concepts/seq.html"
  },
  {
    "label": "oden",
    "id": "oden",
    "url": "/concepts/oden.html"
  },
  {
    "label": "Vale",
    "id": "vale",
    "url": "/concepts/vale.html"
  },
  {
    "label": "Heron",
    "id": "heron",
    "url": "/concepts/heron.html"
  },
  {
    "label": "plumb",
    "id": "plumb",
    "url": "/concepts/plumb.html"
  },
  {
    "label": "Google Apps Script",
    "id": "google-apps-script",
    "url": "/concepts/google-apps-script.html"
  },
  {
    "label": "partiql",
    "id": "partiql",
    "url": "/concepts/partiql.html"
  },
  {
    "label": "VSXu",
    "id": "vsxu",
    "url": "/concepts/vsxu.html"
  },
  {
    "label": "Coco",
    "id": "coco",
    "url": "/concepts/coco.html"
  },
  {
    "label": "plink-fam-format",
    "id": "plink-fam-format",
    "url": "/concepts/plink-fam-format.html"
  },
  {
    "label": "plink-bim-format",
    "id": "plink-bim-format",
    "url": "/concepts/plink-bim-format.html"
  },
  {
    "label": "C∀",
    "id": "c-for-all",
    "url": "/concepts/c-for-all.html"
  },
  {
    "label": "Metalang99",
    "id": "metalang99",
    "url": "/concepts/metalang99.html"
  },
  {
    "label": "Progol",
    "id": "progol",
    "url": "/concepts/progol.html"
  },
  {
    "label": "Hadoop Distributed File System",
    "id": "hdfs",
    "url": "/concepts/hdfs.html"
  },
  {
    "label": "Sibilant",
    "id": "sibilant",
    "url": "/concepts/sibilant.html"
  },
  {
    "label": "RubyGems",
    "id": "rubygems-pm",
    "url": "/concepts/rubygems-pm.html"
  },
  {
    "label": "ProFIT",
    "id": "profit",
    "url": "/concepts/profit.html"
  },
  {
    "label": "pliant",
    "id": "pliant",
    "url": "/concepts/pliant.html"
  },
  {
    "label": "Bython",
    "id": "bython",
    "url": "/concepts/bython.html"
  },
  {
    "label": "QB64",
    "id": "qb64",
    "url": "/concepts/qb64.html"
  },
  {
    "label": "LinearML",
    "id": "linearml",
    "url": "/concepts/linearml.html"
  },
  {
    "label": "json-graph-format",
    "id": "json-graph-format",
    "url": "/concepts/json-graph-format.html"
  },
  {
    "label": "JSON lambda",
    "id": "json-lambda",
    "url": "/concepts/json-lambda.html"
  },
  {
    "label": "PRIZ",
    "id": "priz",
    "url": "/concepts/priz.html"
  },
  {
    "label": "HAGGIS",
    "id": "haggis",
    "url": "/concepts/haggis.html"
  },
  {
    "label": "Plain English",
    "id": "plain-english",
    "url": "/concepts/plain-english.html"
  },
  {
    "label": "RUNOFF",
    "id": "runoff",
    "url": "/concepts/runoff.html"
  },
  {
    "label": "pisc",
    "id": "pisc",
    "url": "/concepts/pisc.html"
  },
  {
    "label": "StarOffice Basic",
    "id": "staroffice-basic",
    "url": "/concepts/staroffice-basic.html"
  },
  {
    "label": "Haxe Library Manager",
    "id": "haxelibs-pm",
    "url": "/concepts/haxelibs-pm.html"
  },
  {
    "label": "Zonnon",
    "id": "zonnon",
    "url": "/concepts/zonnon.html"
  },
  {
    "label": "Scala Markup Language",
    "id": "scaml",
    "url": "/concepts/scaml.html"
  },
  {
    "label": "Pickle",
    "id": "pickle-format",
    "url": "/concepts/pickle-format.html"
  },
  {
    "label": "Sugar",
    "id": "sugar",
    "url": "/concepts/sugar.html"
  },
  {
    "label": "OpenType Feature File",
    "id": "opentype-feature-file",
    "url": "/concepts/opentype-feature-file.html"
  },
  {
    "label": "XOTcl",
    "id": "xotcl",
    "url": "/concepts/xotcl.html"
  },
  {
    "label": "S3",
    "id": "s3",
    "url": "/concepts/s3.html"
  },
  {
    "label": "z80",
    "id": "z80",
    "url": "/concepts/z80.html"
  },
  {
    "label": "Notation3",
    "id": "notation3",
    "url": "/concepts/notation3.html"
  },
  {
    "label": "POSE",
    "id": "pose",
    "url": "/concepts/pose.html"
  },
  {
    "label": "GUIDE",
    "id": "guide",
    "url": "/concepts/guide.html"
  },
  {
    "label": "Literate Haskell",
    "id": "literate-haskell",
    "url": "/concepts/literate-haskell.html"
  },
  {
    "label": "Binary Lambda Calculus",
    "id": "blc",
    "url": "/concepts/blc.html"
  },
  {
    "label": "XPages",
    "id": "xpages",
    "url": "/concepts/xpages.html"
  },
  {
    "label": "never",
    "id": "never",
    "url": "/concepts/never.html"
  },
  {
    "label": "ko",
    "id": "ko",
    "url": "/concepts/ko.html"
  },
  {
    "label": "Pod",
    "id": "pod",
    "url": "/concepts/pod.html"
  },
  {
    "label": "Pnuts",
    "id": "pnuts",
    "url": "/concepts/pnuts.html"
  },
  {
    "label": "Ren-C",
    "id": "ren-c",
    "url": "/concepts/ren-c.html"
  },
  {
    "label": "Virgil",
    "id": "virgil",
    "url": "/concepts/virgil.html"
  },
  {
    "label": "Bla",
    "id": "bla",
    "url": "/concepts/bla.html"
  },
  {
    "label": "RDoc",
    "id": "rdoc",
    "url": "/concepts/rdoc.html"
  },
  {
    "label": "jinx",
    "id": "jinx",
    "url": "/concepts/jinx.html"
  },
  {
    "label": "Pharen",
    "id": "pharen",
    "url": "/concepts/pharen.html"
  },
  {
    "label": "Pycket",
    "id": "pycket",
    "url": "/concepts/pycket.html"
  },
  {
    "label": "Automatically Programmed Tool",
    "id": "apt",
    "url": "/concepts/apt.html"
  },
  {
    "label": "GRIN",
    "id": "grin",
    "url": "/concepts/grin.html"
  },
  {
    "label": "NELIAC",
    "id": "neliac",
    "url": "/concepts/neliac.html"
  },
  {
    "label": "Onyx",
    "id": "onyx",
    "url": "/concepts/onyx.html"
  },
  {
    "label": "redprl",
    "id": "redprl",
    "url": "/concepts/redprl.html"
  },
  {
    "label": "MVEL",
    "id": "mvel",
    "url": "/concepts/mvel.html"
  },
  {
    "label": "little",
    "id": "little",
    "url": "/concepts/little.html"
  },
  {
    "label": "Operational Control Language",
    "id": "operational-control-language",
    "url": "/concepts/operational-control-language.html"
  },
  {
    "label": "Ch computer programming",
    "id": "ch",
    "url": "/concepts/ch.html"
  },
  {
    "label": "SpiderBasic",
    "id": "spiderbasic",
    "url": "/concepts/spiderbasic.html"
  },
  {
    "label": "SpiderMonkey",
    "id": "spidermonkey",
    "url": "/concepts/spidermonkey.html"
  },
  {
    "label": "desktop",
    "id": "desktop",
    "url": "/concepts/desktop.html"
  },
  {
    "label": "package-control-pm",
    "id": "package-control-pm",
    "url": "/concepts/package-control-pm.html"
  },
  {
    "label": "METAPOST",
    "id": "metapost",
    "url": "/concepts/metapost.html"
  },
  {
    "label": "parquet",
    "id": "parquet",
    "url": "/concepts/parquet.html"
  },
  {
    "label": "Parlog",
    "id": "parlog",
    "url": "/concepts/parlog.html"
  },
  {
    "label": "Langage Sans Espoir",
    "id": "lse",
    "url": "/concepts/lse.html"
  },
  {
    "label": "DataWeave",
    "id": "dataweave",
    "url": "/concepts/dataweave.html"
  },
  {
    "label": "Jesth",
    "id": "jesth",
    "url": "/concepts/jesth.html"
  },
  {
    "label": "ACT-III",
    "id": "act-iii",
    "url": "/concepts/act-iii.html"
  },
  {
    "label": "NWScript",
    "id": "nwscript",
    "url": "/concepts/nwscript.html"
  },
  {
    "label": "TRAC",
    "id": "trac",
    "url": "/concepts/trac.html"
  },
  {
    "label": "RDFa",
    "id": "rdfa",
    "url": "/concepts/rdfa.html"
  },
  {
    "label": "operon",
    "id": "operon",
    "url": "/concepts/operon.html"
  },
  {
    "label": "bag-format",
    "id": "bag-format",
    "url": "/concepts/bag-format.html"
  },
  {
    "label": "OpenSpice",
    "id": "openspice",
    "url": "/concepts/openspice.html"
  },
  {
    "label": "Ook",
    "id": "ook",
    "url": "/concepts/ook.html"
  },
  {
    "label": "Fully Automated Compiling Technique",
    "id": "fact",
    "url": "/concepts/fact.html"
  },
  {
    "label": "PLAN2D",
    "id": "plan2d",
    "url": "/concepts/plan2d.html"
  },
  {
    "label": "iScript",
    "id": "iscript",
    "url": "/concepts/iscript.html"
  },
  {
    "label": "Txt2tags",
    "id": "txt2tags",
    "url": "/concepts/txt2tags.html"
  },
  {
    "label": "PLACA",
    "id": "placa",
    "url": "/concepts/placa.html"
  },
  {
    "label": "Election Markup Language",
    "id": "election-markup-language",
    "url": "/concepts/election-markup-language.html"
  },
  {
    "label": "obsidian",
    "id": "obsidian",
    "url": "/concepts/obsidian.html"
  },
  {
    "label": "PL4",
    "id": "pl4",
    "url": "/concepts/pl4.html"
  },
  {
    "label": "Cesil",
    "id": "cesil",
    "url": "/concepts/cesil.html"
  },
  {
    "label": "Q",
    "id": "q-equational-programming-language",
    "url": "/concepts/q-equational-programming-language.html"
  },
  {
    "label": "RigC",
    "id": "rigc",
    "url": "/concepts/rigc.html"
  },
  {
    "label": "Blitz3D",
    "id": "blitz3d",
    "url": "/concepts/blitz3d.html"
  },
  {
    "label": "Handel-C",
    "id": "handel-c",
    "url": "/concepts/handel-c.html"
  },
  {
    "label": "Om",
    "id": "om",
    "url": "/concepts/om.html"
  },
  {
    "label": "OK",
    "id": "ok",
    "url": "/concepts/ok.html"
  },
  {
    "label": "PL/LL",
    "id": "pl-ll",
    "url": "/concepts/pl-ll.html"
  },
  {
    "label": "ArchieML",
    "id": "archieml",
    "url": "/concepts/archieml.html"
  },
  {
    "label": "Zimbu",
    "id": "zimbu",
    "url": "/concepts/zimbu.html"
  },
  {
    "label": "ru",
    "id": "ru",
    "url": "/concepts/ru.html"
  },
  {
    "label": "DEVIL",
    "id": "devil",
    "url": "/concepts/devil.html"
  },
  {
    "label": "PhyloXML",
    "id": "phyloxml-format",
    "url": "/concepts/phyloxml-format.html"
  },
  {
    "label": "Interlisp",
    "id": "interlisp",
    "url": "/concepts/interlisp.html"
  },
  {
    "label": "txtzyme",
    "id": "txtzyme",
    "url": "/concepts/txtzyme.html"
  },
  {
    "label": "PL/I-FORMAC",
    "id": "pl-i-formac",
    "url": "/concepts/pl-i-formac.html"
  },
  {
    "label": "oopsilon",
    "id": "oopsilon",
    "url": "/concepts/oopsilon.html"
  },
  {
    "label": "Citrine",
    "id": "citrine",
    "url": "/concepts/citrine.html"
  },
  {
    "label": "Gödel (Goedel)",
    "id": "godel",
    "url": "/concepts/godel.html"
  },
  {
    "label": "Executive Systems Problem Oriented Language",
    "id": "espol",
    "url": "/concepts/espol.html"
  },
  {
    "label": "ELFE",
    "id": "elfe",
    "url": "/concepts/elfe.html"
  },
  {
    "label": "zolang",
    "id": "zolang",
    "url": "/concepts/zolang.html"
  },
  {
    "label": "strat",
    "id": "strat",
    "url": "/concepts/strat.html"
  },
  {
    "label": "funl",
    "id": "funl",
    "url": "/concepts/funl.html"
  },
  {
    "label": "JSONScript",
    "id": "json-script",
    "url": "/concepts/json-script.html"
  },
  {
    "label": "Candy",
    "id": "candy",
    "url": "/concepts/candy.html"
  },
  {
    "label": "COMIT",
    "id": "comit",
    "url": "/concepts/comit.html"
  },
  {
    "label": "CMS-2",
    "id": "cms-2",
    "url": "/concepts/cms-2.html"
  },
  {
    "label": "COMAL",
    "id": "comal",
    "url": "/concepts/comal.html"
  },
  {
    "label": "Jisp",
    "id": "jisp",
    "url": "/concepts/jisp.html"
  },
  {
    "label": "JavaFX Script",
    "id": "javafx-script",
    "url": "/concepts/javafx-script.html"
  },
  {
    "label": "SDMS",
    "id": "sdms",
    "url": "/concepts/sdms.html"
  },
  {
    "label": "U",
    "id": "u",
    "url": "/concepts/u.html"
  },
  {
    "label": "texti",
    "id": "texti",
    "url": "/concepts/texti.html"
  },
  {
    "label": "icarus",
    "id": "icarus",
    "url": "/concepts/icarus.html"
  },
  {
    "label": "rainbow",
    "id": "rainbow",
    "url": "/concepts/rainbow.html"
  },
  {
    "label": "Rita",
    "id": "rita",
    "url": "/concepts/rita.html"
  },
  {
    "label": "GOLD",
    "id": "gold",
    "url": "/concepts/gold.html"
  },
  {
    "label": "Coco/R",
    "id": "coco-r",
    "url": "/concepts/coco-r.html"
  },
  {
    "label": "shill",
    "id": "shill",
    "url": "/concepts/shill.html"
  },
  {
    "label": "Avail",
    "id": "avail",
    "url": "/concepts/avail.html"
  },
  {
    "label": "loci",
    "id": "loci",
    "url": "/concepts/loci.html"
  },
  {
    "label": "OpenGL",
    "id": "opengl",
    "url": "/concepts/opengl.html"
  },
  {
    "label": "PIXIN",
    "id": "pixin",
    "url": "/concepts/pixin.html"
  },
  {
    "label": "none",
    "id": "none",
    "url": "/concepts/none.html"
  },
  {
    "label": "flua",
    "id": "flua",
    "url": "/concepts/flua.html"
  },
  {
    "label": "AIML",
    "id": "aiml",
    "url": "/concepts/aiml.html"
  },
  {
    "label": "CSpydr",
    "id": "cspydr",
    "url": "/concepts/cspydr.html"
  },
  {
    "label": "Action Code Script",
    "id": "action-code-script",
    "url": "/concepts/action-code-script.html"
  },
  {
    "label": "Blacklight",
    "id": "blacklight",
    "url": "/concepts/blacklight.html"
  },
  {
    "label": "Adept",
    "id": "adept",
    "url": "/concepts/adept.html"
  },
  {
    "label": "PIT",
    "id": "pit",
    "url": "/concepts/pit.html"
  },
  {
    "label": "Worst",
    "id": "worst",
    "url": "/concepts/worst.html"
  },
  {
    "label": "kima",
    "id": "kima",
    "url": "/concepts/kima.html"
  },
  {
    "label": "jasper",
    "id": "jasper",
    "url": "/concepts/jasper.html"
  },
  {
    "label": "KAML",
    "id": "kaml",
    "url": "/concepts/kaml.html"
  },
  {
    "label": "Pod6",
    "id": "pod6",
    "url": "/concepts/pod6.html"
  },
  {
    "label": "PIN",
    "id": "pin",
    "url": "/concepts/pin.html"
  },
  {
    "label": "Kami",
    "id": "kami",
    "url": "/concepts/kami.html"
  },
  {
    "label": "Storymatic",
    "id": "storymatic",
    "url": "/concepts/storymatic.html"
  },
  {
    "label": "lezer",
    "id": "lezer",
    "url": "/concepts/lezer.html"
  },
  {
    "label": "Giotto",
    "id": "giotto",
    "url": "/concepts/giotto.html"
  },
  {
    "label": "4th Dimension",
    "id": "4th-dimension",
    "url": "/concepts/4th-dimension.html"
  },
  {
    "label": "Fardlang",
    "id": "fardlang",
    "url": "/concepts/fardlang.html"
  },
  {
    "label": "Fuzuli",
    "id": "fuzuli",
    "url": "/concepts/fuzuli.html"
  },
  {
    "label": "PIE",
    "id": "pie",
    "url": "/concepts/pie.html"
  },
  {
    "label": "Conceptual",
    "id": "conceptual",
    "url": "/concepts/conceptual.html"
  },
  {
    "label": "kerf",
    "id": "kerf",
    "url": "/concepts/kerf.html"
  },
  {
    "label": "exkited",
    "id": "exkited",
    "url": "/concepts/exkited.html"
  },
  {
    "label": "HyperCard",
    "id": "hypercard",
    "url": "/concepts/hypercard.html"
  },
  {
    "label": "Breccia",
    "id": "breccia",
    "url": "/concepts/breccia.html"
  },
  {
    "label": "Dashrep",
    "id": "dashrep",
    "url": "/concepts/dashrep.html"
  },
  {
    "label": "Calc4",
    "id": "calc4",
    "url": "/concepts/calc4.html"
  },
  {
    "label": "PICASSO",
    "id": "picasso",
    "url": "/concepts/picasso.html"
  },
  {
    "label": "Genero Business Development Language",
    "id": "genero",
    "url": "/concepts/genero.html"
  },
  {
    "label": "Post production",
    "id": "post-canonical-system",
    "url": "/concepts/post-canonical-system.html"
  },
  {
    "label": "PHOCUS",
    "id": "phocus",
    "url": "/concepts/phocus.html"
  },
  {
    "label": "Mscgen",
    "id": "mscgen",
    "url": "/concepts/mscgen.html"
  },
  {
    "label": "Secure Scuttlebutt",
    "id": "ssb",
    "url": "/concepts/ssb.html"
  },
  {
    "label": "g-expressions",
    "id": "g-expressions",
    "url": "/concepts/g-expressions.html"
  },
  {
    "label": "Pascal-S",
    "id": "pascal-s",
    "url": "/concepts/pascal-s.html"
  },
  {
    "label": "BridgeTalk",
    "id": "bridgetalk",
    "url": "/concepts/bridgetalk.html"
  },
  {
    "label": "PASCAL-I",
    "id": "pascal-i",
    "url": "/concepts/pascal-i.html"
  },
  {
    "label": "Pascal-FC",
    "id": "pascal-fc",
    "url": "/concepts/pascal-fc.html"
  },
  {
    "label": "Loom",
    "id": "loom",
    "url": "/concepts/loom.html"
  },
  {
    "label": "llhd",
    "id": "llhd",
    "url": "/concepts/llhd.html"
  },
  {
    "label": "BOLT",
    "id": "bolt",
    "url": "/concepts/bolt.html"
  },
  {
    "label": "Paragon",
    "id": "paragon",
    "url": "/concepts/paragon.html"
  },
  {
    "label": "Pandora",
    "id": "pandora",
    "url": "/concepts/pandora.html"
  },
  {
    "label": "blue",
    "id": "blue",
    "url": "/concepts/blue.html"
  },
  {
    "label": "PAISley",
    "id": "paisley",
    "url": "/concepts/paisley.html"
  },
  {
    "label": "LES",
    "id": "les",
    "url": "/concepts/les.html"
  },
  {
    "label": "PACT IA",
    "id": "pact-ia",
    "url": "/concepts/pact-ia.html"
  },
  {
    "label": "><>",
    "id": "fishlang",
    "url": "/concepts/fishlang.html"
  },
  {
    "label": "P/CL",
    "id": "p-cl",
    "url": "/concepts/p-cl.html"
  },
  {
    "label": "FAR",
    "id": "far",
    "url": "/concepts/far.html"
  },
  {
    "label": "FORTRAN assembly program",
    "id": "fap",
    "url": "/concepts/fap.html"
  },
  {
    "label": "Object-oriented Structured Query Language",
    "id": "osql",
    "url": "/concepts/osql.html"
  },
  {
    "label": "EZ",
    "id": "ez",
    "url": "/concepts/ez.html"
  },
  {
    "label": "Orient84/K",
    "id": "orient84-k",
    "url": "/concepts/orient84-k.html"
  },
  {
    "label": "kayia",
    "id": "kayia",
    "url": "/concepts/kayia.html"
  },
  {
    "label": "order",
    "id": "order",
    "url": "/concepts/order.html"
  },
  {
    "label": "EXPLOR",
    "id": "explor",
    "url": "/concepts/explor.html"
  },
  {
    "label": "EXPLAN",
    "id": "explan",
    "url": "/concepts/explan.html"
  },
  {
    "label": "Browser Extensible Data Format",
    "id": "bed-format",
    "url": "/concepts/bed-format.html"
  },
  {
    "label": "Jevko",
    "id": "jevko",
    "url": "/concepts/jevko.html"
  },
  {
    "label": "OpenAda",
    "id": "openada",
    "url": "/concepts/openada.html"
  },
  {
    "label": "OOPS",
    "id": "oops",
    "url": "/concepts/oops.html"
  },
  {
    "label": "OOLP",
    "id": "oolp",
    "url": "/concepts/oolp.html"
  },
  {
    "label": "One-man-language",
    "id": "one-man-language",
    "url": "/concepts/one-man-language.html"
  },
  {
    "label": "OMAR",
    "id": "omar",
    "url": "/concepts/omar.html"
  },
  {
    "label": "olog",
    "id": "olog",
    "url": "/concepts/olog.html"
  },
  {
    "label": "OLIVER",
    "id": "oliver",
    "url": "/concepts/oliver.html"
  },
  {
    "label": "tldr",
    "id": "tldr",
    "url": "/concepts/tldr.html"
  },
  {
    "label": "OLDAS",
    "id": "oldas",
    "url": "/concepts/oldas.html"
  },
  {
    "label": "Xoc",
    "id": "xoc-compiler",
    "url": "/concepts/xoc-compiler.html"
  },
  {
    "label": "OFL",
    "id": "ofl",
    "url": "/concepts/ofl.html"
  },
  {
    "label": "Electre",
    "id": "electre",
    "url": "/concepts/electre.html"
  },
  {
    "label": "BABEL",
    "id": "babel",
    "url": "/concepts/babel.html"
  },
  {
    "label": "wescheme",
    "id": "wescheme",
    "url": "/concepts/wescheme.html"
  },
  {
    "label": "axt-format",
    "id": "axt-format",
    "url": "/concepts/axt-format.html"
  },
  {
    "label": "EFL",
    "id": "efl",
    "url": "/concepts/efl.html"
  },
  {
    "label": "EDUCE",
    "id": "educe",
    "url": "/concepts/educe.html"
  },
  {
    "label": "ASCII",
    "id": "ascii",
    "url": "/concepts/ascii.html"
  },
  {
    "label": "O",
    "id": "o",
    "url": "/concepts/o.html"
  },
  {
    "label": "BBx",
    "id": "bbx",
    "url": "/concepts/bbx.html"
  },
  {
    "label": "NUT",
    "id": "nut",
    "url": "/concepts/nut.html"
  },
  {
    "label": "Eden",
    "id": "eden",
    "url": "/concepts/eden.html"
  },
  {
    "label": "cloc",
    "id": "cloc",
    "url": "/concepts/cloc.html"
  },
  {
    "label": "Slim Framework",
    "id": "slim-framework",
    "url": "/concepts/slim-framework.html"
  },
  {
    "label": "GNS",
    "id": "gns",
    "url": "/concepts/gns.html"
  },
  {
    "label": "NUA-Prolog",
    "id": "nua-prolog",
    "url": "/concepts/nua-prolog.html"
  },
  {
    "label": "NSL",
    "id": "nsl",
    "url": "/concepts/nsl.html"
  },
  {
    "label": "npy",
    "id": "npy",
    "url": "/concepts/npy.html"
  },
  {
    "label": "gridstudio-editor",
    "id": "gridstudio-editor",
    "url": "/concepts/gridstudio-editor.html"
  },
  {
    "label": "TI-89 series",
    "id": "ti-89-basic",
    "url": "/concepts/ti-89-basic.html"
  },
  {
    "label": "DUEL",
    "id": "duel",
    "url": "/concepts/duel.html"
  },
  {
    "label": "Typoscript",
    "id": "typoscript",
    "url": "/concepts/typoscript.html"
  },
  {
    "label": "TypeScript Type Declarations",
    "id": "dts",
    "url": "/concepts/dts.html"
  },
  {
    "label": "Freefem",
    "id": "freefem",
    "url": "/concepts/freefem.html"
  },
  {
    "label": "txr",
    "id": "txr",
    "url": "/concepts/txr.html"
  },
  {
    "label": "NIL",
    "id": "nil",
    "url": "/concepts/nil.html"
  },
  {
    "label": "Unity",
    "id": "unity-engine",
    "url": "/concepts/unity-engine.html"
  },
  {
    "label": "FAT",
    "id": "fat",
    "url": "/concepts/fat.html"
  },
  {
    "label": "Bucklescript",
    "id": "bucklescript",
    "url": "/concepts/bucklescript.html"
  },
  {
    "label": "chibicc",
    "id": "chibicc",
    "url": "/concepts/chibicc.html"
  },
  {
    "label": "Netscript",
    "id": "netscript",
    "url": "/concepts/netscript.html"
  },
  {
    "label": "SHACL",
    "id": "shacl",
    "url": "/concepts/shacl.html"
  },
  {
    "label": "NetBasic",
    "id": "netbasic",
    "url": "/concepts/netbasic.html"
  },
  {
    "label": "heap.coffee",
    "id": "heap.coffee",
    "url": "/concepts/heap.coffee.html"
  },
  {
    "label": "RTF",
    "id": "rtf",
    "url": "/concepts/rtf.html"
  },
  {
    "label": "SYMBOL",
    "id": "symbol",
    "url": "/concepts/symbol.html"
  },
  {
    "label": "hasklig",
    "id": "hasklig",
    "url": "/concepts/hasklig.html"
  },
  {
    "label": "Tea",
    "id": "tea-pl",
    "url": "/concepts/tea-pl.html"
  },
  {
    "label": "CSS Doodle",
    "id": "css-doodle",
    "url": "/concepts/css-doodle.html"
  },
  {
    "label": "Table Query Language",
    "id": "taql",
    "url": "/concepts/taql.html"
  },
  {
    "label": "netbeans-editor",
    "id": "netbeans-editor",
    "url": "/concepts/netbeans-editor.html"
  },
  {
    "label": "Nail",
    "id": "nail",
    "url": "/concepts/nail.html"
  },
  {
    "label": "N-Prolog",
    "id": "n-prolog",
    "url": "/concepts/n-prolog.html"
  },
  {
    "label": "DINO",
    "id": "dino",
    "url": "/concepts/dino.html"
  },
  {
    "label": "Reverse Polish notation",
    "id": "reverse-polish-notation",
    "url": "/concepts/reverse-polish-notation.html"
  },
  {
    "label": "MUSYS",
    "id": "musys",
    "url": "/concepts/musys.html"
  },
  {
    "label": "dynamo-pm",
    "id": "dynamo-pm",
    "url": "/concepts/dynamo-pm.html"
  },
  {
    "label": "ColaScript",
    "id": "colascript",
    "url": "/concepts/colascript.html"
  },
  {
    "label": "rant",
    "id": "rant",
    "url": "/concepts/rant.html"
  },
  {
    "label": "statebox",
    "id": "statebox",
    "url": "/concepts/statebox.html"
  },
  {
    "label": "Boston College Statistical Software Components",
    "id": "ssc-pm",
    "url": "/concepts/ssc-pm.html"
  },
  {
    "label": "gluon",
    "id": "gluon",
    "url": "/concepts/gluon.html"
  },
  {
    "label": "MPSX",
    "id": "mpsx",
    "url": "/concepts/mpsx.html"
  },
  {
    "label": "spark-pm",
    "id": "spark-pm",
    "url": "/concepts/spark-pm.html"
  },
  {
    "label": "mockingbird-notation",
    "id": "mockingbird-notation",
    "url": "/concepts/mockingbird-notation.html"
  },
  {
    "label": "Office Open XML",
    "id": "ooxml",
    "url": "/concepts/ooxml.html"
  },
  {
    "label": "Morphe",
    "id": "morphe",
    "url": "/concepts/morphe.html"
  },
  {
    "label": "SOSL",
    "id": "sosl",
    "url": "/concepts/sosl.html"
  },
  {
    "label": "D2",
    "id": "d2",
    "url": "/concepts/d2.html"
  },
  {
    "label": "Nyquist",
    "id": "nyquist",
    "url": "/concepts/nyquist.html"
  },
  {
    "label": "WSDL",
    "id": "wsdl",
    "url": "/concepts/wsdl.html"
  },
  {
    "label": "XPath",
    "id": "xpath",
    "url": "/concepts/xpath.html"
  },
  {
    "label": "Molfile",
    "id": "molfile-format",
    "url": "/concepts/molfile-format.html"
  },
  {
    "label": "SPARC",
    "id": "sparc",
    "url": "/concepts/sparc.html"
  },
  {
    "label": "Smiles",
    "id": "smiles-format",
    "url": "/concepts/smiles-format.html"
  },
  {
    "label": "plot",
    "id": "plot",
    "url": "/concepts/plot.html"
  },
  {
    "label": "leo-editor",
    "id": "leo-editor",
    "url": "/concepts/leo-editor.html"
  },
  {
    "label": "Rpm",
    "id": "rpm-package-manager",
    "url": "/concepts/rpm-package-manager.html"
  },
  {
    "label": "OpenNN",
    "id": "open-nn",
    "url": "/concepts/open-nn.html"
  },
  {
    "label": "Modula-3*",
    "id": "modula-3-star",
    "url": "/concepts/modula-3-star.html"
  },
  {
    "label": "Modula-2+",
    "id": "modula-2p",
    "url": "/concepts/modula-2p.html"
  },
  {
    "label": "DAS",
    "id": "das",
    "url": "/concepts/das.html"
  },
  {
    "label": "slim-pl",
    "id": "slim-pl",
    "url": "/concepts/slim-pl.html"
  },
  {
    "label": "MathJax",
    "id": "mathjax",
    "url": "/concepts/mathjax.html"
  },
  {
    "label": "skew",
    "id": "skew",
    "url": "/concepts/skew.html"
  },
  {
    "label": "clash",
    "id": "clash",
    "url": "/concepts/clash.html"
  },
  {
    "label": "Sitemap",
    "id": "sitemap",
    "url": "/concepts/sitemap.html"
  },
  {
    "label": "GeoJSON",
    "id": "geojson",
    "url": "/concepts/geojson.html"
  },
  {
    "label": "Language for Your Remote Instruction by Computer",
    "id": "lyric",
    "url": "/concepts/lyric.html"
  },
  {
    "label": "Hierarchical Data Format",
    "id": "hdf",
    "url": "/concepts/hdf.html"
  },
  {
    "label": "Farcaster",
    "id": "farcaster",
    "url": "/concepts/farcaster.html"
  },
  {
    "label": "Visual FoxPro",
    "id": "visual-foxpro",
    "url": "/concepts/visual-foxpro.html"
  },
  {
    "label": "shakti",
    "id": "shakti",
    "url": "/concepts/shakti.html"
  },
  {
    "label": "ISO 8601",
    "id": "iso-8601",
    "url": "/concepts/iso-8601.html"
  },
  {
    "label": "sepi",
    "id": "sepi",
    "url": "/concepts/sepi.html"
  },
  {
    "label": "sdf-format",
    "id": "sdf-format",
    "url": "/concepts/sdf-format.html"
  },
  {
    "label": "Scrapscript",
    "id": "scrapscript",
    "url": "/concepts/scrapscript.html"
  },
  {
    "label": "bee",
    "id": "bee",
    "url": "/concepts/bee.html"
  },
  {
    "label": "cT",
    "id": "ct",
    "url": "/concepts/ct.html"
  },
  {
    "label": "xodio",
    "id": "xodio",
    "url": "/concepts/xodio.html"
  },
  {
    "label": "MMX instruction set",
    "id": "mmx",
    "url": "/concepts/mmx.html"
  },
  {
    "label": "Nimskull",
    "id": "nimskull",
    "url": "/concepts/nimskull.html"
  },
  {
    "label": "FlatBuffers",
    "id": "flatbuffers",
    "url": "/concepts/flatbuffers.html"
  },
  {
    "label": "Algae",
    "id": "algae",
    "url": "/concepts/algae.html"
  },
  {
    "label": "VRML",
    "id": "vrml",
    "url": "/concepts/vrml.html"
  },
  {
    "label": "JSON Query Language",
    "id": "jql",
    "url": "/concepts/jql.html"
  },
  {
    "label": "attoparsec",
    "id": "attoparsec",
    "url": "/concepts/attoparsec.html"
  },
  {
    "label": "eff",
    "id": "eff",
    "url": "/concepts/eff.html"
  },
  {
    "label": "noisecraft",
    "id": "noisecraft",
    "url": "/concepts/noisecraft.html"
  },
  {
    "label": "Restricted Python",
    "id": "rpython",
    "url": "/concepts/rpython.html"
  },
  {
    "label": "Varnish Configuration Language",
    "id": "vcl",
    "url": "/concepts/vcl.html"
  },
  {
    "label": "k-framework",
    "id": "k-framework",
    "url": "/concepts/k-framework.html"
  },
  {
    "label": "robotc",
    "id": "robotc",
    "url": "/concepts/robotc.html"
  },
  {
    "label": "pikelet",
    "id": "pikelet",
    "url": "/concepts/pikelet.html"
  },
  {
    "label": "Vvvv",
    "id": "vvvv",
    "url": "/concepts/vvvv.html"
  },
  {
    "label": "GNU nano",
    "id": "nano-editor",
    "url": "/concepts/nano-editor.html"
  },
  {
    "label": "Free Pascal",
    "id": "free-pascal",
    "url": "/concepts/free-pascal.html"
  },
  {
    "label": "XeTeX",
    "id": "xetex",
    "url": "/concepts/xetex.html"
  },
  {
    "label": "multiaddr",
    "id": "multiaddr",
    "url": "/concepts/multiaddr.html"
  },
  {
    "label": "[x]it!",
    "id": "x-it",
    "url": "/concepts/x-it.html"
  },
  {
    "label": "Microsoft Small Basic",
    "id": "microsoft-small-basic",
    "url": "/concepts/microsoft-small-basic.html"
  },
  {
    "label": "Parrot",
    "id": "parrot-vm",
    "url": "/concepts/parrot-vm.html"
  },
  {
    "label": "BPEL",
    "id": "bpel",
    "url": "/concepts/bpel.html"
  },
  {
    "label": "lemon",
    "id": "lemon",
    "url": "/concepts/lemon.html"
  },
  {
    "label": "DNS",
    "id": "dns",
    "url": "/concepts/dns.html"
  },
  {
    "label": "Unified Diff",
    "id": "unified-diff",
    "url": "/concepts/unified-diff.html"
  },
  {
    "label": "MetaH",
    "id": "metah",
    "url": "/concepts/metah.html"
  },
  {
    "label": "XProc",
    "id": "xproc",
    "url": "/concepts/xproc.html"
  },
  {
    "label": "Kodu Game Lab",
    "id": "kodu-game-lab",
    "url": "/concepts/kodu-game-lab.html"
  },
  {
    "label": "META/PLUS",
    "id": "meta-plus",
    "url": "/concepts/meta-plus.html"
  },
  {
    "label": "relax",
    "id": "relax",
    "url": "/concepts/relax.html"
  },
  {
    "label": "orca-pl",
    "id": "orca-pl",
    "url": "/concepts/orca-pl.html"
  },
  {
    "label": "COPE",
    "id": "cope",
    "url": "/concepts/cope.html"
  },
  {
    "label": "cooC",
    "id": "cooc",
    "url": "/concepts/cooc.html"
  },
  {
    "label": "PEARL",
    "id": "pearl",
    "url": "/concepts/pearl.html"
  },
  {
    "label": "FLOW-MATIC",
    "id": "flow-matic",
    "url": "/concepts/flow-matic.html"
  },
  {
    "label": "raptor",
    "id": "raptor",
    "url": "/concepts/raptor.html"
  },
  {
    "label": "SFC",
    "id": "sequential-function-chart",
    "url": "/concepts/sequential-function-chart.html"
  },
  {
    "label": "MELD",
    "id": "meld",
    "url": "/concepts/meld.html"
  },
  {
    "label": "M4Sugar",
    "id": "m4sugar",
    "url": "/concepts/m4sugar.html"
  },
  {
    "label": "SQLPL",
    "id": "sqlpl",
    "url": "/concepts/sqlpl.html"
  },
  {
    "label": "Snap!",
    "id": "snap",
    "url": "/concepts/snap.html"
  },
  {
    "label": "Linda",
    "id": "linda",
    "url": "/concepts/linda.html"
  },
  {
    "label": "Speedcoding",
    "id": "speedcoding",
    "url": "/concepts/speedcoding.html"
  },
  {
    "label": "Gremlin",
    "id": "gremlin",
    "url": "/concepts/gremlin.html"
  },
  {
    "label": "Groovy Server Pages",
    "id": "groovy-server-pages",
    "url": "/concepts/groovy-server-pages.html"
  },
  {
    "label": "TXL",
    "id": "txl",
    "url": "/concepts/txl.html"
  },
  {
    "label": "PIR",
    "id": "parrot-internal-representation",
    "url": "/concepts/parrot-internal-representation.html"
  },
  {
    "label": "juvix",
    "id": "juvix",
    "url": "/concepts/juvix.html"
  },
  {
    "label": "Treelang",
    "id": "treelang",
    "url": "/concepts/treelang.html"
  },
  {
    "label": "Knitr",
    "id": "knitr",
    "url": "/concepts/knitr.html"
  },
  {
    "label": "expresso",
    "id": "expresso",
    "url": "/concepts/expresso.html"
  },
  {
    "label": "SAOL",
    "id": "saol",
    "url": "/concepts/saol.html"
  },
  {
    "label": "PL360",
    "id": "pl360",
    "url": "/concepts/pl360.html"
  },
  {
    "label": "g-fu",
    "id": "g-fu",
    "url": "/concepts/g-fu.html"
  },
  {
    "label": "Armed Bear Common Lisp",
    "id": "abcl-lang",
    "url": "/concepts/abcl-lang.html"
  },
  {
    "label": "sporth",
    "id": "sporth",
    "url": "/concepts/sporth.html"
  },
  {
    "label": "MAVIS",
    "id": "mavis",
    "url": "/concepts/mavis.html"
  },
  {
    "label": "Occam π",
    "id": "occam-pi",
    "url": "/concepts/occam-pi.html"
  },
  {
    "label": "PEAR",
    "id": "pear-pm",
    "url": "/concepts/pear-pm.html"
  },
  {
    "label": "clarity",
    "id": "clarity",
    "url": "/concepts/clarity.html"
  },
  {
    "label": "Esterel",
    "id": "esterel",
    "url": "/concepts/esterel.html"
  },
  {
    "label": "Pyth",
    "id": "pyth",
    "url": "/concepts/pyth.html"
  },
  {
    "label": "categorical-query-language",
    "id": "categorical-query-language",
    "url": "/concepts/categorical-query-language.html"
  },
  {
    "label": "PyPI",
    "id": "pypi-pm",
    "url": "/concepts/pypi-pm.html"
  },
  {
    "label": "CYCL",
    "id": "cycl",
    "url": "/concepts/cycl.html"
  },
  {
    "label": "Dasm",
    "id": "dasm",
    "url": "/concepts/dasm.html"
  },
  {
    "label": "Frank",
    "id": "frank-lang",
    "url": "/concepts/frank-lang.html"
  },
  {
    "label": "ObjDump",
    "id": "objdump",
    "url": "/concepts/objdump.html"
  },
  {
    "label": "Biological Expression Language",
    "id": "bel-lang",
    "url": "/concepts/bel-lang.html"
  },
  {
    "label": "remix",
    "id": "remix",
    "url": "/concepts/remix.html"
  },
  {
    "label": "Meditech Interpretive Information System",
    "id": "miis",
    "url": "/concepts/miis.html"
  },
  {
    "label": "xxl",
    "id": "xxl",
    "url": "/concepts/xxl.html"
  },
  {
    "label": "General Purpose Simulation System",
    "id": "gpss",
    "url": "/concepts/gpss.html"
  },
  {
    "label": "SIMSCRIPT",
    "id": "simscript",
    "url": "/concepts/simscript.html"
  },
  {
    "label": "PL/0",
    "id": "pl-0",
    "url": "/concepts/pl-0.html"
  },
  {
    "label": "ALEF",
    "id": "alef",
    "url": "/concepts/alef.html"
  },
  {
    "label": "Lawvere",
    "id": "lawvere",
    "url": "/concepts/lawvere.html"
  },
  {
    "label": "A#",
    "id": "a-sharp",
    "url": "/concepts/a-sharp.html"
  },
  {
    "label": "MARSYAS",
    "id": "marsyas",
    "url": "/concepts/marsyas.html"
  },
  {
    "label": "Fun",
    "id": "fun",
    "url": "/concepts/fun.html"
  },
  {
    "label": "BARE",
    "id": "bare",
    "url": "/concepts/bare.html"
  },
  {
    "label": "JOSS Extended and Adapted for Nineteen-hundred",
    "id": "jean",
    "url": "/concepts/jean.html"
  },
  {
    "label": "Oracle Java",
    "id": "oracle-java",
    "url": "/concepts/oracle-java.html"
  },
  {
    "label": "Scsh",
    "id": "scsh",
    "url": "/concepts/scsh.html"
  },
  {
    "label": "powershell-gallery-pm",
    "id": "powershell-gallery-pm",
    "url": "/concepts/powershell-gallery-pm.html"
  },
  {
    "label": "SIGNAL",
    "id": "signal",
    "url": "/concepts/signal.html"
  },
  {
    "label": "avro",
    "id": "avro",
    "url": "/concepts/avro.html"
  },
  {
    "label": "LEAP",
    "id": "leap",
    "url": "/concepts/leap.html"
  },
  {
    "label": "Irvine Dataflow",
    "id": "id",
    "url": "/concepts/id.html"
  },
  {
    "label": "MAPQUERY",
    "id": "mapquery",
    "url": "/concepts/mapquery.html"
  },
  {
    "label": "Genshi",
    "id": "genshi",
    "url": "/concepts/genshi.html"
  },
  {
    "label": "EXEC 2",
    "id": "exec-2",
    "url": "/concepts/exec-2.html"
  },
  {
    "label": "True BASIC",
    "id": "true-basic",
    "url": "/concepts/true-basic.html"
  },
  {
    "label": "VHDL-AMS",
    "id": "vhdl-ams",
    "url": "/concepts/vhdl-ams.html"
  },
  {
    "label": "TAO",
    "id": "tree-annotation-operator",
    "url": "/concepts/tree-annotation-operator.html"
  },
  {
    "label": "POPLOG",
    "id": "poplog",
    "url": "/concepts/poplog.html"
  },
  {
    "label": "Rye",
    "id": "rye",
    "url": "/concepts/rye.html"
  },
  {
    "label": "Nexus file",
    "id": "nexus-format",
    "url": "/concepts/nexus-format.html"
  },
  {
    "label": "COMMEN",
    "id": "commen",
    "url": "/concepts/commen.html"
  },
  {
    "label": "poly",
    "id": "poly",
    "url": "/concepts/poly.html"
  },
  {
    "label": "Parrot BASIC",
    "id": "parrot-basic",
    "url": "/concepts/parrot-basic.html"
  },
  {
    "label": "parenthetic",
    "id": "parenthetic",
    "url": "/concepts/parenthetic.html"
  },
  {
    "label": "Pop-11",
    "id": "pop-11",
    "url": "/concepts/pop-11.html"
  },
  {
    "label": "arvelie-format",
    "id": "arvelie-format",
    "url": "/concepts/arvelie-format.html"
  },
  {
    "label": "EXEC",
    "id": "cms-exec",
    "url": "/concepts/cms-exec.html"
  },
  {
    "label": "Toi",
    "id": "toi",
    "url": "/concepts/toi.html"
  },
  {
    "label": "CLOS",
    "id": "clos",
    "url": "/concepts/clos.html"
  },
  {
    "label": "CECIL",
    "id": "cecil",
    "url": "/concepts/cecil.html"
  },
  {
    "label": "Combined Log Format",
    "id": "combined-log-format",
    "url": "/concepts/combined-log-format.html"
  },
  {
    "label": "PML",
    "id": "pml",
    "url": "/concepts/pml.html"
  },
  {
    "label": "Ease",
    "id": "ease",
    "url": "/concepts/ease.html"
  },
  {
    "label": "MUDDL",
    "id": "muddl",
    "url": "/concepts/muddl.html"
  },
  {
    "label": "Lustre",
    "id": "lustre",
    "url": "/concepts/lustre.html"
  },
  {
    "label": "ColdFusion Components",
    "id": "coldfusion-components",
    "url": "/concepts/coldfusion-components.html"
  },
  {
    "label": "Apache Arrow",
    "id": "arrow-format",
    "url": "/concepts/arrow-format.html"
  },
  {
    "label": "noon",
    "id": "noon",
    "url": "/concepts/noon.html"
  },
  {
    "label": "Docker",
    "id": "docker",
    "url": "/concepts/docker.html"
  },
  {
    "label": "CLPR",
    "id": "clpr",
    "url": "/concepts/clpr.html"
  },
  {
    "label": "Euclid",
    "id": "euclid",
    "url": "/concepts/euclid.html"
  },
  {
    "label": "Magic Paper",
    "id": "magic-paper",
    "url": "/concepts/magic-paper.html"
  },
  {
    "label": "Scriptol",
    "id": "scriptol",
    "url": "/concepts/scriptol.html"
  },
  {
    "label": "unseemly",
    "id": "unseemly",
    "url": "/concepts/unseemly.html"
  },
  {
    "label": "LiteScript",
    "id": "litescript",
    "url": "/concepts/litescript.html"
  },
  {
    "label": "MADS",
    "id": "mads",
    "url": "/concepts/mads.html"
  },
  {
    "label": "Ferite",
    "id": "ferite",
    "url": "/concepts/ferite.html"
  },
  {
    "label": "Bizubee",
    "id": "bizubee",
    "url": "/concepts/bizubee.html"
  },
  {
    "label": "squiggle",
    "id": "squiggle",
    "url": "/concepts/squiggle.html"
  },
  {
    "label": "Forml",
    "id": "forml",
    "url": "/concepts/forml.html"
  },
  {
    "label": "Graph Modeling Language",
    "id": "graph-modeling-language",
    "url": "/concepts/graph-modeling-language.html"
  },
  {
    "label": "clike",
    "id": "clike",
    "url": "/concepts/clike.html"
  },
  {
    "label": "MADCAP",
    "id": "madcap",
    "url": "/concepts/madcap.html"
  },
  {
    "label": "shadama",
    "id": "shadama",
    "url": "/concepts/shadama.html"
  },
  {
    "label": "Nuua",
    "id": "nuua",
    "url": "/concepts/nuua.html"
  },
  {
    "label": "Hot Cocoa Lisp",
    "id": "hotcocoalisp",
    "url": "/concepts/hotcocoalisp.html"
  },
  {
    "label": "RascalMPL",
    "id": "rascalmpl",
    "url": "/concepts/rascalmpl.html"
  },
  {
    "label": "Algebraic Logic Functional",
    "id": "alf",
    "url": "/concepts/alf.html"
  },
  {
    "label": "SenseTalk",
    "id": "sensetalk",
    "url": "/concepts/sensetalk.html"
  },
  {
    "label": "Digital Interactive Business Oriented Language",
    "id": "dibol",
    "url": "/concepts/dibol.html"
  },
  {
    "label": "Dolittle",
    "id": "dolittle",
    "url": "/concepts/dolittle.html"
  },
  {
    "label": "PICO",
    "id": "pico",
    "url": "/concepts/pico.html"
  },
  {
    "label": "RoboMind",
    "id": "robomind",
    "url": "/concepts/robomind.html"
  },
  {
    "label": "PTX",
    "id": "ptx",
    "url": "/concepts/ptx.html"
  },
  {
    "label": "Pyrex",
    "id": "pyrex",
    "url": "/concepts/pyrex.html"
  },
  {
    "label": "Scribe",
    "id": "scribe",
    "url": "/concepts/scribe.html"
  },
  {
    "label": "Etoys",
    "id": "etoys",
    "url": "/concepts/etoys.html"
  },
  {
    "label": "YESS",
    "id": "yess",
    "url": "/concepts/yess.html"
  },
  {
    "label": "Riff",
    "id": "riff",
    "url": "/concepts/riff.html"
  },
  {
    "label": "ELAN",
    "id": "elan",
    "url": "/concepts/elan.html"
  },
  {
    "label": "DarkBASIC",
    "id": "darkbasic",
    "url": "/concepts/darkbasic.html"
  },
  {
    "label": "preforth",
    "id": "preforth",
    "url": "/concepts/preforth.html"
  },
  {
    "label": "Scheme 2-D",
    "id": "scheme-2-d",
    "url": "/concepts/scheme-2-d.html"
  },
  {
    "label": "Agilent VEE",
    "id": "keysight-vee",
    "url": "/concepts/keysight-vee.html"
  },
  {
    "label": "sentient",
    "id": "sentient",
    "url": "/concepts/sentient.html"
  },
  {
    "label": "IP Pascal",
    "id": "ip-pascal",
    "url": "/concepts/ip-pascal.html"
  },
  {
    "label": "CHILL",
    "id": "chill",
    "url": "/concepts/chill.html"
  },
  {
    "label": "mythryl",
    "id": "mythryl",
    "url": "/concepts/mythryl.html"
  },
  {
    "label": "IBM Informix-4GL",
    "id": "informix",
    "url": "/concepts/informix.html"
  },
  {
    "label": "Text Adventure Development System",
    "id": "tads",
    "url": "/concepts/tads.html"
  },
  {
    "label": "keli",
    "id": "keli",
    "url": "/concepts/keli.html"
  },
  {
    "label": "Link",
    "id": "link",
    "url": "/concepts/link.html"
  },
  {
    "label": "latte-js",
    "id": "latte-js",
    "url": "/concepts/latte-js.html"
  },
  {
    "label": "emerald-lang",
    "id": "emerald-lang",
    "url": "/concepts/emerald-lang.html"
  },
  {
    "label": "formality",
    "id": "formality",
    "url": "/concepts/formality.html"
  },
  {
    "label": "neutron",
    "id": "neutron",
    "url": "/concepts/neutron.html"
  },
  {
    "label": "Matrix Market Coordinate Format",
    "id": "coordinate-format",
    "url": "/concepts/coordinate-format.html"
  },
  {
    "label": "Little b",
    "id": "little-b",
    "url": "/concepts/little-b.html"
  },
  {
    "label": "NilScript",
    "id": "nilscript",
    "url": "/concepts/nilscript.html"
  },
  {
    "label": "SAC",
    "id": "sac-programming-language",
    "url": "/concepts/sac-programming-language.html"
  },
  {
    "label": "eco-editor",
    "id": "eco-editor",
    "url": "/concepts/eco-editor.html"
  },
  {
    "label": "Kalyn",
    "id": "kalyn",
    "url": "/concepts/kalyn.html"
  },
  {
    "label": "CHICKEN",
    "id": "chicken",
    "url": "/concepts/chicken.html"
  },
  {
    "label": "jonprl",
    "id": "jonprl",
    "url": "/concepts/jonprl.html"
  },
  {
    "label": "Casio BASIC",
    "id": "casio-basic",
    "url": "/concepts/casio-basic.html"
  },
  {
    "label": "JAL compiler",
    "id": "jal-compiler",
    "url": "/concepts/jal-compiler.html"
  },
  {
    "label": "Kefir",
    "id": "kefir",
    "url": "/concepts/kefir.html"
  },
  {
    "label": "Topaz",
    "id": "topaz-lang",
    "url": "/concepts/topaz-lang.html"
  },
  {
    "label": "blur-markup-language",
    "id": "blur-markup-language",
    "url": "/concepts/blur-markup-language.html"
  },
  {
    "label": "adamant",
    "id": "adamant",
    "url": "/concepts/adamant.html"
  },
  {
    "label": "CLiX markup",
    "id": "clix",
    "url": "/concepts/clix.html"
  },
  {
    "label": "GLMS",
    "id": "glms",
    "url": "/concepts/glms.html"
  },
  {
    "label": "CobolScript",
    "id": "cobolscript",
    "url": "/concepts/cobolscript.html"
  },
  {
    "label": "Leda",
    "id": "leda",
    "url": "/concepts/leda.html"
  },
  {
    "label": "lambda-zero",
    "id": "lambda-zero",
    "url": "/concepts/lambda-zero.html"
  },
  {
    "label": "ActiveVFP",
    "id": "activevfp",
    "url": "/concepts/activevfp.html"
  },
  {
    "label": "Common Lisp with Arc Macros and Procedures",
    "id": "clamp",
    "url": "/concepts/clamp.html"
  },
  {
    "label": "Ciao",
    "id": "ciao-programming-language",
    "url": "/concepts/ciao-programming-language.html"
  },
  {
    "label": "GLBasic",
    "id": "glbasic",
    "url": "/concepts/glbasic.html"
  },
  {
    "label": "Ciel",
    "id": "ciel",
    "url": "/concepts/ciel.html"
  },
  {
    "label": "hrqr",
    "id": "hrqr",
    "url": "/concepts/hrqr.html"
  },
  {
    "label": "polymath",
    "id": "polymath",
    "url": "/concepts/polymath.html"
  },
  {
    "label": "JLang",
    "id": "jlang",
    "url": "/concepts/jlang.html"
  },
  {
    "label": "MIT Algebraic Compiler",
    "id": "mac",
    "url": "/concepts/mac.html"
  },
  {
    "label": "Edina",
    "id": "edina",
    "url": "/concepts/edina.html"
  },
  {
    "label": "codeflow",
    "id": "codeflow",
    "url": "/concepts/codeflow.html"
  },
  {
    "label": "PearScript",
    "id": "pearscript",
    "url": "/concepts/pearscript.html"
  },
  {
    "label": "Ad-hoc",
    "id": "ad-hoc",
    "url": "/concepts/ad-hoc.html"
  },
  {
    "label": "BeBasic",
    "id": "bebasic",
    "url": "/concepts/bebasic.html"
  },
  {
    "label": "awl",
    "id": "awl",
    "url": "/concepts/awl.html"
  },
  {
    "label": "Lygon",
    "id": "lygon",
    "url": "/concepts/lygon.html"
  },
  {
    "label": "PkgConfig",
    "id": "pkgconfig",
    "url": "/concepts/pkgconfig.html"
  },
  {
    "label": "hoot-smalltalk",
    "id": "hoot-smalltalk",
    "url": "/concepts/hoot-smalltalk.html"
  },
  {
    "label": "cosh",
    "id": "cosh",
    "url": "/concepts/cosh.html"
  },
  {
    "label": "Incipit",
    "id": "incipit",
    "url": "/concepts/incipit.html"
  },
  {
    "label": "CMIX",
    "id": "cmix",
    "url": "/concepts/cmix.html"
  },
  {
    "label": "Astatine",
    "id": "astatine",
    "url": "/concepts/astatine.html"
  },
  {
    "label": "Cali-Lang",
    "id": "cali-lang",
    "url": "/concepts/cali-lang.html"
  },
  {
    "label": "Lucid representations",
    "id": "lucid-representations",
    "url": "/concepts/lucid-representations.html"
  },
  {
    "label": "PickCode",
    "id": "pickcode",
    "url": "/concepts/pickcode.html"
  },
  {
    "label": "Datomic",
    "id": "datomic",
    "url": "/concepts/datomic.html"
  },
  {
    "label": "LORE",
    "id": "lore",
    "url": "/concepts/lore.html"
  },
  {
    "label": "Omega",
    "id": "pbt-omega",
    "url": "/concepts/pbt-omega.html"
  },
  {
    "label": "LOOPN++",
    "id": "loopnpp",
    "url": "/concepts/loopnpp.html"
  },
  {
    "label": "CLASS",
    "id": "class",
    "url": "/concepts/class.html"
  },
  {
    "label": "LOL",
    "id": "lol",
    "url": "/concepts/lol.html"
  },
  {
    "label": "panther-lang",
    "id": "panther-lang",
    "url": "/concepts/panther-lang.html"
  },
  {
    "label": "PacmanConf",
    "id": "pacmanconf",
    "url": "/concepts/pacmanconf.html"
  },
  {
    "label": "LogoWriter",
    "id": "logowriter",
    "url": "/concepts/logowriter.html"
  },
  {
    "label": "LOGOL",
    "id": "logol",
    "url": "/concepts/logol.html"
  },
  {
    "label": "orca-lang",
    "id": "orca-lang",
    "url": "/concepts/orca-lang.html"
  },
  {
    "label": "LOGLISP",
    "id": "loglisp",
    "url": "/concepts/loglisp.html"
  },
  {
    "label": "LOGIN",
    "id": "login",
    "url": "/concepts/login.html"
  },
  {
    "label": "opengraph",
    "id": "opengraph",
    "url": "/concepts/opengraph.html"
  },
  {
    "label": "LOGAL",
    "id": "logal",
    "url": "/concepts/logal.html"
  },
  {
    "label": "onex",
    "id": "onex",
    "url": "/concepts/onex.html"
  },
  {
    "label": "OMG IDL",
    "id": "omg-idl",
    "url": "/concepts/omg-idl.html"
  },
  {
    "label": "LO",
    "id": "lo",
    "url": "/concepts/lo.html"
  },
  {
    "label": "LNF",
    "id": "lnf",
    "url": "/concepts/lnf.html"
  },
  {
    "label": "Lisptalk",
    "id": "lisptalk",
    "url": "/concepts/lisptalk.html"
  },
  {
    "label": "RSS",
    "id": "rss",
    "url": "/concepts/rss.html"
  },
  {
    "label": "LISP 1.5",
    "id": "lisp-1-5",
    "url": "/concepts/lisp-1-5.html"
  },
  {
    "label": "chain-format",
    "id": "chain-format",
    "url": "/concepts/chain-format.html"
  },
  {
    "label": "xt3d",
    "id": "xt3d",
    "url": "/concepts/xt3d.html"
  },
  {
    "label": "XQL",
    "id": "xql-lang",
    "url": "/concepts/xql-lang.html"
  },
  {
    "label": "CDL++",
    "id": "cdlpp",
    "url": "/concepts/cdlpp.html"
  },
  {
    "label": "Lighttpd configuration file",
    "id": "lighttpd-configuration-file",
    "url": "/concepts/lighttpd-configuration-file.html"
  },
  {
    "label": "New AWK",
    "id": "nawk",
    "url": "/concepts/nawk.html"
  },
  {
    "label": "LG",
    "id": "lg",
    "url": "/concepts/lg.html"
  },
  {
    "label": "xl",
    "id": "xl",
    "url": "/concepts/xl.html"
  },
  {
    "label": "LESK",
    "id": "lesk",
    "url": "/concepts/lesk.html"
  },
  {
    "label": "Lemick",
    "id": "lemick",
    "url": "/concepts/lemick.html"
  },
  {
    "label": "mpl",
    "id": "mpl",
    "url": "/concepts/mpl.html"
  },
  {
    "label": "LDL",
    "id": "ldl",
    "url": "/concepts/ldl.html"
  },
  {
    "label": "morfa",
    "id": "morfa",
    "url": "/concepts/morfa.html"
  },
  {
    "label": "MINI OBJECT-ORIENTED LANGUAGE",
    "id": "mool",
    "url": "/concepts/mool.html"
  },
  {
    "label": "vi",
    "id": "vi-editor",
    "url": "/concepts/vi-editor.html"
  },
  {
    "label": "Wolontis-Bell Interpreter",
    "id": "wolontis-bell-interpreter",
    "url": "/concepts/wolontis-bell-interpreter.html"
  },
  {
    "label": "LASS",
    "id": "lass",
    "url": "/concepts/lass.html"
  },
  {
    "label": "LARIS",
    "id": "laris",
    "url": "/concepts/laris.html"
  },
  {
    "label": "LAP",
    "id": "lap",
    "url": "/concepts/lap.html"
  },
  {
    "label": "Language for Class Description",
    "id": "language-for-class-description",
    "url": "/concepts/language-for-class-description.html"
  },
  {
    "label": "WHIRL",
    "id": "whirl",
    "url": "/concepts/whirl.html"
  },
  {
    "label": "Large-scale Atomic/Molecular Massively Parallel Simulator Format",
    "id": "lammps-format",
    "url": "/concepts/lammps-format.html"
  },
  {
    "label": "miniml",
    "id": "miniml",
    "url": "/concepts/miniml.html"
  },
  {
    "label": "LAMINA",
    "id": "lamina",
    "url": "/concepts/lamina.html"
  },
  {
    "label": "Roc",
    "id": "roc",
    "url": "/concepts/roc.html"
  },
  {
    "label": "melpha-pm",
    "id": "melpha-pm",
    "url": "/concepts/melpha-pm.html"
  },
  {
    "label": "WebAssembly Text Format",
    "id": "wast",
    "url": "/concepts/wast.html"
  },
  {
    "label": "Very Tiny Language",
    "id": "vtl",
    "url": "/concepts/vtl.html"
  },
  {
    "label": "KRIS",
    "id": "kris",
    "url": "/concepts/kris.html"
  },
  {
    "label": "VoxML",
    "id": "voxml",
    "url": "/concepts/voxml.html"
  },
  {
    "label": "Maplesoft Application Center",
    "id": "maplesoft-app-center-pm",
    "url": "/concepts/maplesoft-app-center-pm.html"
  },
  {
    "label": "Klaim",
    "id": "klaim",
    "url": "/concepts/klaim.html"
  },
  {
    "label": "KL1",
    "id": "kl1",
    "url": "/concepts/kl1.html"
  },
  {
    "label": "Keep It Short and Simple",
    "id": "kiss",
    "url": "/concepts/kiss.html"
  },
  {
    "label": "Verse",
    "id": "verse",
    "url": "/concepts/verse.html"
  },
  {
    "label": "Megaparsec",
    "id": "megaparsec",
    "url": "/concepts/megaparsec.html"
  },
  {
    "label": "Velato",
    "id": "velato",
    "url": "/concepts/velato.html"
  },
  {
    "label": "KATE",
    "id": "kate",
    "url": "/concepts/kate.html"
  },
  {
    "label": "libsvm-format",
    "id": "libsvm-format",
    "url": "/concepts/libsvm-format.html"
  },
  {
    "label": "v8torque",
    "id": "v8torque",
    "url": "/concepts/v8torque.html"
  },
  {
    "label": "levy",
    "id": "levy",
    "url": "/concepts/levy.html"
  },
  {
    "label": "V",
    "id": "v-visual-language",
    "url": "/concepts/v-visual-language.html"
  },
  {
    "label": "lav-format",
    "id": "lav-format",
    "url": "/concepts/lav-format.html"
  },
  {
    "label": "BIRD",
    "id": "bird",
    "url": "/concepts/bird.html"
  },
  {
    "label": "JR",
    "id": "jr",
    "url": "/concepts/jr.html"
  },
  {
    "label": "UnQL",
    "id": "unql",
    "url": "/concepts/unql.html"
  },
  {
    "label": "JPL",
    "id": "jpl",
    "url": "/concepts/jpl.html"
  },
  {
    "label": "lambda",
    "id": "lambda",
    "url": "/concepts/lambda.html"
  },
  {
    "label": "JOYCE+",
    "id": "joycep",
    "url": "/concepts/joycep.html"
  },
  {
    "label": "Joyce",
    "id": "joyce",
    "url": "/concepts/joyce.html"
  },
  {
    "label": "JOSIE",
    "id": "josie",
    "url": "/concepts/josie.html"
  },
  {
    "label": "kilo-lisp",
    "id": "kilo-lisp",
    "url": "/concepts/kilo-lisp.html"
  },
  {
    "label": "JavaML",
    "id": "javaml",
    "url": "/concepts/javaml.html"
  },
  {
    "label": "ISAC",
    "id": "isac",
    "url": "/concepts/isac.html"
  },
  {
    "label": "imp-lang",
    "id": "imp-lang",
    "url": "/concepts/imp-lang.html"
  },
  {
    "label": "Mesa",
    "id": "mesa",
    "url": "/concepts/mesa.html"
  },
  {
    "label": "bawk",
    "id": "bawk",
    "url": "/concepts/bawk.html"
  },
  {
    "label": "Hspec",
    "id": "hspec",
    "url": "/concepts/hspec.html"
  },
  {
    "label": "Ion Schema Language",
    "id": "ion-schema",
    "url": "/concepts/ion-schema.html"
  },
  {
    "label": "Hilltop",
    "id": "hilltop-lang",
    "url": "/concepts/hilltop-lang.html"
  },
  {
    "label": "Hex",
    "id": "hex-pm",
    "url": "/concepts/hex-pm.html"
  },
  {
    "label": "INTERACTIVE",
    "id": "interactive",
    "url": "/concepts/interactive.html"
  },
  {
    "label": "INSIGHT",
    "id": "insight",
    "url": "/concepts/insight.html"
  },
  {
    "label": "Header Dictionary Triples",
    "id": "hdt",
    "url": "/concepts/hdt.html"
  },
  {
    "label": "INFOLOG",
    "id": "infolog",
    "url": "/concepts/infolog.html"
  },
  {
    "label": "Roslyn compiler",
    "id": "roslyn-compiler",
    "url": "/concepts/roslyn-compiler.html"
  },
  {
    "label": "INC",
    "id": "inc",
    "url": "/concepts/inc.html"
  },
  {
    "label": "ColorForth",
    "id": "colorforth",
    "url": "/concepts/colorforth.html"
  },
  {
    "label": "Ina Jo",
    "id": "ina-jo",
    "url": "/concepts/ina-jo.html"
  },
  {
    "label": "grunt",
    "id": "grunt",
    "url": "/concepts/grunt.html"
  },
  {
    "label": "Titanium",
    "id": "titanium",
    "url": "/concepts/titanium.html"
  },
  {
    "label": "TLS",
    "id": "tls",
    "url": "/concepts/tls.html"
  },
  {
    "label": "Nushell",
    "id": "nushell",
    "url": "/concepts/nushell.html"
  },
  {
    "label": "imf",
    "id": "imf",
    "url": "/concepts/imf.html"
  },
  {
    "label": "BBj",
    "id": "bbj",
    "url": "/concepts/bbj.html"
  },
  {
    "label": "Tiki Wiki Markup",
    "id": "tikiwiki",
    "url": "/concepts/tikiwiki.html"
  },
  {
    "label": "micro-editor",
    "id": "micro-editor",
    "url": "/concepts/micro-editor.html"
  },
  {
    "label": "IMAGE",
    "id": "image",
    "url": "/concepts/image.html"
  },
  {
    "label": "ILX",
    "id": "ilx",
    "url": "/concepts/ilx.html"
  },
  {
    "label": "GolfScript",
    "id": "golfscript",
    "url": "/concepts/golfscript.html"
  },
  {
    "label": "ILU",
    "id": "ilu",
    "url": "/concepts/ilu.html"
  },
  {
    "label": "Microsoft Excel",
    "id": "excel-app",
    "url": "/concepts/excel-app.html"
  },
  {
    "label": "ICML",
    "id": "icml",
    "url": "/concepts/icml.html"
  },
  {
    "label": "wasmer",
    "id": "wasmer",
    "url": "/concepts/wasmer.html"
  },
  {
    "label": "git-config",
    "id": "git-config",
    "url": "/concepts/git-config.html"
  },
  {
    "label": "Ibuki CL",
    "id": "ibuki-cl",
    "url": "/concepts/ibuki-cl.html"
  },
  {
    "label": "frame",
    "id": "frame",
    "url": "/concepts/frame.html"
  },
  {
    "label": "RetDec",
    "id": "retdec",
    "url": "/concepts/retdec.html"
  },
  {
    "label": "Vimwiki",
    "id": "vimwiki",
    "url": "/concepts/vimwiki.html"
  },
  {
    "label": "foundry",
    "id": "foundry",
    "url": "/concepts/foundry.html"
  },
  {
    "label": "edgedb",
    "id": "edgedb",
    "url": "/concepts/edgedb.html"
  },
  {
    "label": "noms-db",
    "id": "noms-db",
    "url": "/concepts/noms-db.html"
  },
  {
    "label": "X86",
    "id": "x86-isa",
    "url": "/concepts/x86-isa.html"
  },
  {
    "label": "flux-lang",
    "id": "flux-lang",
    "url": "/concepts/flux-lang.html"
  },
  {
    "label": "HyCom",
    "id": "hycom",
    "url": "/concepts/hycom.html"
  },
  {
    "label": "Hybrid",
    "id": "hybrid",
    "url": "/concepts/hybrid.html"
  },
  {
    "label": "Semi-Thue",
    "id": "semi-thue-system",
    "url": "/concepts/semi-thue-system.html"
  },
  {
    "label": "Shared Dataspace Language",
    "id": "sdl",
    "url": "/concepts/sdl.html"
  },
  {
    "label": "ToffeeScript",
    "id": "toffeescript",
    "url": "/concepts/toffeescript.html"
  },
  {
    "label": "Arc Assembly",
    "id": "arc-assembly",
    "url": "/concepts/arc-assembly.html"
  },
  {
    "label": "Caffeine",
    "id": "caffeine",
    "url": "/concepts/caffeine.html"
  },
  {
    "label": "vyper",
    "id": "vyper",
    "url": "/concepts/vyper.html"
  },
  {
    "label": "LuaJIT",
    "id": "luajit",
    "url": "/concepts/luajit.html"
  },
  {
    "label": "Holo",
    "id": "holo",
    "url": "/concepts/holo.html"
  },
  {
    "label": "Entropy",
    "id": "entropy",
    "url": "/concepts/entropy.html"
  },
  {
    "label": "RPG II",
    "id": "rpg-ii",
    "url": "/concepts/rpg-ii.html"
  },
  {
    "label": "enso",
    "id": "enso-lang",
    "url": "/concepts/enso-lang.html"
  },
  {
    "label": "Rosetta-2",
    "id": "rosetta-2",
    "url": "/concepts/rosetta-2.html"
  },
  {
    "label": "Message Queuing Telemetry Transport",
    "id": "mqtt",
    "url": "/concepts/mqtt.html"
  },
  {
    "label": "aQasm",
    "id": "aqasm",
    "url": "/concepts/aqasm.html"
  },
  {
    "label": "Sweet.js",
    "id": "sweetjs",
    "url": "/concepts/sweetjs.html"
  },
  {
    "label": "Hi-Visual",
    "id": "hi-visual",
    "url": "/concepts/hi-visual.html"
  },
  {
    "label": "Emacs Lisp Package Archive",
    "id": "elpa-pm",
    "url": "/concepts/elpa-pm.html"
  },
  {
    "label": "SURGE",
    "id": "surge",
    "url": "/concepts/surge.html"
  },
  {
    "label": "edgeql",
    "id": "edgeql",
    "url": "/concepts/edgeql.html"
  },
  {
    "label": "henk",
    "id": "henk",
    "url": "/concepts/henk.html"
  },
  {
    "label": "HELPER",
    "id": "helper",
    "url": "/concepts/helper.html"
  },
  {
    "label": "DRAGOON",
    "id": "dragoon",
    "url": "/concepts/dragoon.html"
  },
  {
    "label": "D++",
    "id": "dpp",
    "url": "/concepts/dpp.html"
  },
  {
    "label": "svgbob",
    "id": "svgbob",
    "url": "/concepts/svgbob.html"
  },
  {
    "label": "LOGLAN",
    "id": "loglan",
    "url": "/concepts/loglan.html"
  },
  {
    "label": "APL-GPSS",
    "id": "apl-gpss",
    "url": "/concepts/apl-gpss.html"
  },
  {
    "label": "SubL",
    "id": "subl",
    "url": "/concepts/subl.html"
  },
  {
    "label": "The Dog Programming Language",
    "id": "dog",
    "url": "/concepts/dog.html"
  },
  {
    "label": "Cranelift",
    "id": "cranelift-ir",
    "url": "/concepts/cranelift-ir.html"
  },
  {
    "label": "HARVEY",
    "id": "harvey",
    "url": "/concepts/harvey.html"
  },
  {
    "label": "strudel",
    "id": "strudel",
    "url": "/concepts/strudel.html"
  },
  {
    "label": "Extensible Linking Format",
    "id": "elf",
    "url": "/concepts/elf.html"
  },
  {
    "label": "STRESS",
    "id": "stress",
    "url": "/concepts/stress.html"
  },
  {
    "label": "Hancock",
    "id": "hancock",
    "url": "/concepts/hancock.html"
  },
  {
    "label": "Descript",
    "id": "descript",
    "url": "/concepts/descript.html"
  },
  {
    "label": "P",
    "id": "p",
    "url": "/concepts/p.html"
  },
  {
    "label": "STREMA",
    "id": "strema",
    "url": "/concepts/strema.html"
  },
  {
    "label": "STRCMACS",
    "id": "strcmacs",
    "url": "/concepts/strcmacs.html"
  },
  {
    "label": "ANNA",
    "id": "anna",
    "url": "/concepts/anna.html"
  },
  {
    "label": "Optimization Programming Language",
    "id": "optimization-programming-language",
    "url": "/concepts/optimization-programming-language.html"
  },
  {
    "label": "DOODLE",
    "id": "doodle",
    "url": "/concepts/doodle.html"
  },
  {
    "label": "StoneCutter",
    "id": "stonecutter",
    "url": "/concepts/stonecutter.html"
  },
  {
    "label": "Hyperscript",
    "id": "hyperscript",
    "url": "/concepts/hyperscript.html"
  },
  {
    "label": "Basis Codec",
    "id": "basis-universal-format",
    "url": "/concepts/basis-universal-format.html"
  },
  {
    "label": "guru",
    "id": "guru",
    "url": "/concepts/guru.html"
  },
  {
    "label": "TIScript",
    "id": "tiscript",
    "url": "/concepts/tiscript.html"
  },
  {
    "label": "Subversion",
    "id": "subversion",
    "url": "/concepts/subversion.html"
  },
  {
    "label": "Static Typescript",
    "id": "static-typescript",
    "url": "/concepts/static-typescript.html"
  },
  {
    "label": "GROOVE",
    "id": "groove",
    "url": "/concepts/groove.html"
  },
  {
    "label": "AMTRAN",
    "id": "amtran",
    "url": "/concepts/amtran.html"
  },
  {
    "label": "Project Jupyter",
    "id": "jupyter-editor",
    "url": "/concepts/jupyter-editor.html"
  },
  {
    "label": "*Prolog",
    "id": "star-prolog",
    "url": "/concepts/star-prolog.html"
  },
  {
    "label": "souper",
    "id": "souper",
    "url": "/concepts/souper.html"
  },
  {
    "label": "FASTA",
    "id": "fasta-format",
    "url": "/concepts/fasta-format.html"
  },
  {
    "label": "STAPLE",
    "id": "staple",
    "url": "/concepts/staple.html"
  },
  {
    "label": "ctan-pm",
    "id": "ctan-pm",
    "url": "/concepts/ctan-pm.html"
  },
  {
    "label": "Lamdu",
    "id": "lamdu",
    "url": "/concepts/lamdu.html"
  },
  {
    "label": "Standard Lisp",
    "id": "standard-lisp",
    "url": "/concepts/standard-lisp.html"
  },
  {
    "label": "Green",
    "id": "green",
    "url": "/concepts/green.html"
  },
  {
    "label": "Flix",
    "id": "flix",
    "url": "/concepts/flix.html"
  },
  {
    "label": "STAGE2",
    "id": "stage2",
    "url": "/concepts/stage2.html"
  },
  {
    "label": "crates-pm",
    "id": "crates-pm",
    "url": "/concepts/crates-pm.html"
  },
  {
    "label": "BBCode",
    "id": "bbcode",
    "url": "/concepts/bbcode.html"
  },
  {
    "label": "cran-pm",
    "id": "cran-pm",
    "url": "/concepts/cran-pm.html"
  },
  {
    "label": "cpan-pm",
    "id": "cpan-pm",
    "url": "/concepts/cpan-pm.html"
  },
  {
    "label": "SQURL",
    "id": "squrl",
    "url": "/concepts/squrl.html"
  },
  {
    "label": "Grapheasy",
    "id": "grapheasy",
    "url": "/concepts/grapheasy.html"
  },
  {
    "label": "CorelScript",
    "id": "corelscript",
    "url": "/concepts/corelscript.html"
  },
  {
    "label": "femtolisp",
    "id": "femtolisp",
    "url": "/concepts/femtolisp.html"
  },
  {
    "label": "Z notation",
    "id": "z-notation",
    "url": "/concepts/z-notation.html"
  },
  {
    "label": "Todotxt",
    "id": "todotxt",
    "url": "/concepts/todotxt.html"
  },
  {
    "label": "Superjson",
    "id": "superjson",
    "url": "/concepts/superjson.html"
  },
  {
    "label": "GPSS/85",
    "id": "gpss-85",
    "url": "/concepts/gpss-85.html"
  },
  {
    "label": "sqlar-format",
    "id": "sqlar-format",
    "url": "/concepts/sqlar-format.html"
  },
  {
    "label": "Tag Line Commands",
    "id": "tlc",
    "url": "/concepts/tlc.html"
  },
  {
    "label": "Little Smalltalk",
    "id": "little-smalltalk",
    "url": "/concepts/little-smalltalk.html"
  },
  {
    "label": "chrysaLisp",
    "id": "chrysalisp",
    "url": "/concepts/chrysalisp.html"
  },
  {
    "label": "Gerber Image",
    "id": "gerber-image",
    "url": "/concepts/gerber-image.html"
  },
  {
    "label": "Symbolic Programming System",
    "id": "sps",
    "url": "/concepts/sps.html"
  },
  {
    "label": "GPS",
    "id": "gps",
    "url": "/concepts/gps.html"
  },
  {
    "label": "comm",
    "id": "comm",
    "url": "/concepts/comm.html"
  },
  {
    "label": "Google Sheets",
    "id": "google-sheets-app",
    "url": "/concepts/google-sheets-app.html"
  },
  {
    "label": "KML",
    "id": "kml",
    "url": "/concepts/kml.html"
  },
  {
    "label": "miniML_error",
    "id": "miniml-error",
    "url": "/concepts/miniml-error.html"
  },
  {
    "label": "kasaya",
    "id": "kasaya",
    "url": "/concepts/kasaya.html"
  },
  {
    "label": "reflex-framework",
    "id": "reflex-framework",
    "url": "/concepts/reflex-framework.html"
  },
  {
    "label": "spir-v",
    "id": "spir-v",
    "url": "/concepts/spir-v.html"
  },
  {
    "label": "GOSPEL",
    "id": "gospel",
    "url": "/concepts/gospel.html"
  },
  {
    "label": "GOQL",
    "id": "goql",
    "url": "/concepts/goql.html"
  },
  {
    "label": "cocoapods-pm",
    "id": "cocoapods-pm",
    "url": "/concepts/cocoapods-pm.html"
  },
  {
    "label": "Google File System",
    "id": "gfs",
    "url": "/concepts/gfs.html"
  },
  {
    "label": "Golog",
    "id": "golog",
    "url": "/concepts/golog.html"
  },
  {
    "label": "clojars-pm",
    "id": "clojars-pm",
    "url": "/concepts/clojars-pm.html"
  },
  {
    "label": "gnu-rtl",
    "id": "gnu-rtl",
    "url": "/concepts/gnu-rtl.html"
  },
  {
    "label": "SPECL",
    "id": "specl",
    "url": "/concepts/specl.html"
  },
  {
    "label": "Turbo Pascal",
    "id": "turbo-pascal",
    "url": "/concepts/turbo-pascal.html"
  },
  {
    "label": "Open Data Protcol",
    "id": "odata",
    "url": "/concepts/odata.html"
  },
  {
    "label": "fo",
    "id": "fo",
    "url": "/concepts/fo.html"
  },
  {
    "label": "GLOSS",
    "id": "gloss",
    "url": "/concepts/gloss.html"
  },
  {
    "label": "Glish",
    "id": "glish",
    "url": "/concepts/glish.html"
  },
  {
    "label": "Interscript",
    "id": "interscript",
    "url": "/concepts/interscript.html"
  },
  {
    "label": "SORCA",
    "id": "sorca",
    "url": "/concepts/sorca.html"
  },
  {
    "label": "MATHLAB",
    "id": "mathlab",
    "url": "/concepts/mathlab.html"
  },
  {
    "label": "Ghostscript",
    "id": "ghostscript",
    "url": "/concepts/ghostscript.html"
  },
  {
    "label": "djangoql",
    "id": "djangoql",
    "url": "/concepts/djangoql.html"
  },
  {
    "label": "bloom",
    "id": "bloom",
    "url": "/concepts/bloom.html"
  },
  {
    "label": "Caramel",
    "id": "caramel",
    "url": "/concepts/caramel.html"
  },
  {
    "label": "Passerine",
    "id": "passerine",
    "url": "/concepts/passerine.html"
  },
  {
    "label": "SOLMAR",
    "id": "solmar",
    "url": "/concepts/solmar.html"
  },
  {
    "label": "Punched tape",
    "id": "punched-tape",
    "url": "/concepts/punched-tape.html"
  },
  {
    "label": "GERMINAL",
    "id": "germinal",
    "url": "/concepts/germinal.html"
  },
  {
    "label": "chef",
    "id": "chef",
    "url": "/concepts/chef.html"
  },
  {
    "label": "COLLADA",
    "id": "collada",
    "url": "/concepts/collada.html"
  },
  {
    "label": "Gerald",
    "id": "gerald",
    "url": "/concepts/gerald.html"
  },
  {
    "label": "Umple",
    "id": "umple",
    "url": "/concepts/umple.html"
  },
  {
    "label": "Apache Lucene",
    "id": "lucene-query-syntax",
    "url": "/concepts/lucene-query-syntax.html"
  },
  {
    "label": "SNQL: A Social Network Query and Transformation Language",
    "id": "snql",
    "url": "/concepts/snql.html"
  },
  {
    "label": "MACRO",
    "id": "macro",
    "url": "/concepts/macro.html"
  },
  {
    "label": "sixten",
    "id": "sixten",
    "url": "/concepts/sixten.html"
  },
  {
    "label": "SAM file format",
    "id": "sam-format",
    "url": "/concepts/sam-format.html"
  },
  {
    "label": "EXPRESS",
    "id": "express",
    "url": "/concepts/express.html"
  },
  {
    "label": "Ark",
    "id": "ark-lang",
    "url": "/concepts/ark-lang.html"
  },
  {
    "label": "Plankalkul",
    "id": "plankalkul",
    "url": "/concepts/plankalkul.html"
  },
  {
    "label": "Schema.org",
    "id": "schemaorg",
    "url": "/concepts/schemaorg.html"
  },
  {
    "label": "05AB1E",
    "id": "05ab1e",
    "url": "/concepts/05ab1e.html"
  },
  {
    "label": "Bioconductor",
    "id": "bioconductor-pm",
    "url": "/concepts/bioconductor-pm.html"
  },
  {
    "label": "SNOOP",
    "id": "snoop",
    "url": "/concepts/snoop.html"
  },
  {
    "label": "GCC GENERIC",
    "id": "generic",
    "url": "/concepts/generic.html"
  },
  {
    "label": "calc",
    "id": "calc",
    "url": "/concepts/calc.html"
  },
  {
    "label": "SSI",
    "id": "ssi",
    "url": "/concepts/ssi.html"
  },
  {
    "label": "SNOBAT",
    "id": "snobat",
    "url": "/concepts/snobat.html"
  },
  {
    "label": "Snit",
    "id": "snit",
    "url": "/concepts/snit.html"
  },
  {
    "label": "GEM",
    "id": "gem",
    "url": "/concepts/gem.html"
  },
  {
    "label": "LyX",
    "id": "lyx-editor",
    "url": "/concepts/lyx-editor.html"
  },
  {
    "label": "Gofer",
    "id": "gofer",
    "url": "/concepts/gofer.html"
  },
  {
    "label": "ASDF",
    "id": "asdf",
    "url": "/concepts/asdf.html"
  },
  {
    "label": "SMoLCS",
    "id": "smolcs",
    "url": "/concepts/smolcs.html"
  },
  {
    "label": "shml",
    "id": "shml",
    "url": "/concepts/shml.html"
  },
  {
    "label": "myia",
    "id": "myia",
    "url": "/concepts/myia.html"
  },
  {
    "label": "Hush",
    "id": "hush",
    "url": "/concepts/hush.html"
  },
  {
    "label": "WxBasic",
    "id": "wxbasic",
    "url": "/concepts/wxbasic.html"
  },
  {
    "label": "scribble",
    "id": "scribble",
    "url": "/concepts/scribble.html"
  },
  {
    "label": "micro-mitten",
    "id": "micro-mitten",
    "url": "/concepts/micro-mitten.html"
  },
  {
    "label": "Property list",
    "id": "plist",
    "url": "/concepts/plist.html"
  },
  {
    "label": "infusion-framework",
    "id": "infusion-framework",
    "url": "/concepts/infusion-framework.html"
  },
  {
    "label": "fleck",
    "id": "fleck",
    "url": "/concepts/fleck.html"
  },
  {
    "label": "GCLA II",
    "id": "gcla-ii",
    "url": "/concepts/gcla-ii.html"
  },
  {
    "label": "Afnix",
    "id": "afnix",
    "url": "/concepts/afnix.html"
  },
  {
    "label": "Tao",
    "id": "tao-lang",
    "url": "/concepts/tao-lang.html"
  },
  {
    "label": "plam",
    "id": "plam",
    "url": "/concepts/plam.html"
  },
  {
    "label": "BUSH",
    "id": "bush",
    "url": "/concepts/bush.html"
  },
  {
    "label": "XBLite",
    "id": "xblite",
    "url": "/concepts/xblite.html"
  },
  {
    "label": "Jeeves",
    "id": "jeeves",
    "url": "/concepts/jeeves.html"
  },
  {
    "label": "RPM Spec",
    "id": "rpm-spec",
    "url": "/concepts/rpm-spec.html"
  },
  {
    "label": "multibase",
    "id": "multibase",
    "url": "/concepts/multibase.html"
  },
  {
    "label": "Smalltalk-80",
    "id": "smalltalk-80",
    "url": "/concepts/smalltalk-80.html"
  },
  {
    "label": "Smalltalk-76",
    "id": "smalltalk-76",
    "url": "/concepts/smalltalk-76.html"
  },
  {
    "label": "QUIKSCRIPT",
    "id": "quikscript",
    "url": "/concepts/quikscript.html"
  },
  {
    "label": "ulisp",
    "id": "ulisp",
    "url": "/concepts/ulisp.html"
  },
  {
    "label": "SMALL-X",
    "id": "small-x",
    "url": "/concepts/small-x.html"
  },
  {
    "label": "Galileo",
    "id": "galileo",
    "url": "/concepts/galileo.html"
  },
  {
    "label": "SMILES arbitrary target specification",
    "id": "smarts",
    "url": "/concepts/smarts.html"
  },
  {
    "label": "SIMPLE",
    "id": "simple",
    "url": "/concepts/simple.html"
  },
  {
    "label": "Strand",
    "id": "strand-programming-language",
    "url": "/concepts/strand-programming-language.html"
  },
  {
    "label": "XC",
    "id": "xc",
    "url": "/concepts/xc.html"
  },
  {
    "label": "Small Euclid",
    "id": "small-euclid",
    "url": "/concepts/small-euclid.html"
  },
  {
    "label": "Smile data interchange format",
    "id": "smile",
    "url": "/concepts/smile.html"
  },
  {
    "label": "SMALGOL",
    "id": "smalgol",
    "url": "/concepts/smalgol.html"
  },
  {
    "label": "SLPL",
    "id": "slpl",
    "url": "/concepts/slpl.html"
  },
  {
    "label": "Tuple space",
    "id": "tuple-space",
    "url": "/concepts/tuple-space.html"
  },
  {
    "label": "Lucid",
    "id": "lucid-lang",
    "url": "/concepts/lucid-lang.html"
  },
  {
    "label": "Parrot Assembly",
    "id": "parrot-assembly",
    "url": "/concepts/parrot-assembly.html"
  },
  {
    "label": "PVS",
    "id": "pvs",
    "url": "/concepts/pvs.html"
  },
  {
    "label": "C/AL",
    "id": "c-al",
    "url": "/concepts/c-al.html"
  },
  {
    "label": "NXT-G",
    "id": "nxt-g",
    "url": "/concepts/nxt-g.html"
  },
  {
    "label": "Oak",
    "id": "oak",
    "url": "/concepts/oak.html"
  },
  {
    "label": "Conway chained arrow notation",
    "id": "chained-arrow-notation",
    "url": "/concepts/chained-arrow-notation.html"
  },
  {
    "label": "Glyph Bitmap Distribution Format",
    "id": "glyph-bitmap-distribution-format",
    "url": "/concepts/glyph-bitmap-distribution-format.html"
  },
  {
    "label": "Elpi",
    "id": "elpi",
    "url": "/concepts/elpi.html"
  },
  {
    "label": "SLEUTH",
    "id": "sleuth",
    "url": "/concepts/sleuth.html"
  },
  {
    "label": "Fresco",
    "id": "fresco",
    "url": "/concepts/fresco.html"
  },
  {
    "label": "SP/k",
    "id": "sp-k",
    "url": "/concepts/sp-k.html"
  },
  {
    "label": "SPITBOL",
    "id": "spitbol",
    "url": "/concepts/spitbol.html"
  },
  {
    "label": "OptimJ",
    "id": "optimj",
    "url": "/concepts/optimj.html"
  },
  {
    "label": "Sinclair BASIC",
    "id": "sinclair-basic",
    "url": "/concepts/sinclair-basic.html"
  },
  {
    "label": "TMTP",
    "id": "tmtp",
    "url": "/concepts/tmtp.html"
  },
  {
    "label": "UnrealScript",
    "id": "unrealscript",
    "url": "/concepts/unrealscript.html"
  },
  {
    "label": "solid",
    "id": "solid",
    "url": "/concepts/solid.html"
  },
  {
    "label": "ktexteditor-editor",
    "id": "ktexteditor-editor",
    "url": "/concepts/ktexteditor-editor.html"
  },
  {
    "label": "Wing",
    "id": "wing",
    "url": "/concepts/wing.html"
  },
  {
    "label": "Simplicity",
    "id": "simplictiy",
    "url": "/concepts/simplictiy.html"
  },
  {
    "label": "Frenetic",
    "id": "frenetic",
    "url": "/concepts/frenetic.html"
  },
  {
    "label": "Spice Lisp",
    "id": "spice-lisp",
    "url": "/concepts/spice-lisp.html"
  },
  {
    "label": "Information Processing Language",
    "id": "information-processing-language",
    "url": "/concepts/information-processing-language.html"
  },
  {
    "label": "Axiom",
    "id": "axiom-computer-algebra-system",
    "url": "/concepts/axiom-computer-algebra-system.html"
  },
  {
    "label": "lift",
    "id": "lift",
    "url": "/concepts/lift.html"
  },
  {
    "label": "IBM 1620",
    "id": "1620sps",
    "url": "/concepts/1620sps.html"
  },
  {
    "label": "SLAM II",
    "id": "slam-ii",
    "url": "/concepts/slam-ii.html"
  },
  {
    "label": "FRANK",
    "id": "frank",
    "url": "/concepts/frank.html"
  },
  {
    "label": "Z-flat",
    "id": "z-flat",
    "url": "/concepts/z-flat.html"
  },
  {
    "label": "SBASIC",
    "id": "sbasic",
    "url": "/concepts/sbasic.html"
  },
  {
    "label": "PICT",
    "id": "pict",
    "url": "/concepts/pict.html"
  },
  {
    "label": "OQL",
    "id": "object-query-language",
    "url": "/concepts/object-query-language.html"
  },
  {
    "label": "3D Manufacturing Format",
    "id": "3mf",
    "url": "/concepts/3mf.html"
  },
  {
    "label": "Tabloid",
    "id": "tabloid",
    "url": "/concepts/tabloid.html"
  },
  {
    "label": "SL5",
    "id": "sl5",
    "url": "/concepts/sl5.html"
  },
  {
    "label": "NGL",
    "id": "ngl-programming-language",
    "url": "/concepts/ngl-programming-language.html"
  },
  {
    "label": "ROOP",
    "id": "roop",
    "url": "/concepts/roop.html"
  },
  {
    "label": "FIGlet Font",
    "id": "figlet-font",
    "url": "/concepts/figlet-font.html"
  },
  {
    "label": "polyglot-compiler",
    "id": "polyglot-compiler",
    "url": "/concepts/polyglot-compiler.html"
  },
  {
    "label": "Kaffeine",
    "id": "kaffeine",
    "url": "/concepts/kaffeine.html"
  },
  {
    "label": "MUSP",
    "id": "musp",
    "url": "/concepts/musp.html"
  },
  {
    "label": "MacroML",
    "id": "macroml",
    "url": "/concepts/macroml.html"
  },
  {
    "label": "muMath",
    "id": "mumath",
    "url": "/concepts/mumath.html"
  },
  {
    "label": "FORTRANSIT",
    "id": "fortransit",
    "url": "/concepts/fortransit.html"
  },
  {
    "label": "Seph",
    "id": "seph-programming-language",
    "url": "/concepts/seph-programming-language.html"
  },
  {
    "label": "ramen",
    "id": "ramen",
    "url": "/concepts/ramen.html"
  },
  {
    "label": "LispMe",
    "id": "lispme",
    "url": "/concepts/lispme.html"
  },
  {
    "label": "UNITY",
    "id": "unity",
    "url": "/concepts/unity.html"
  },
  {
    "label": "ecsharp",
    "id": "ecsharp",
    "url": "/concepts/ecsharp.html"
  },
  {
    "label": "MARK IV",
    "id": "mark-iv",
    "url": "/concepts/mark-iv.html"
  },
  {
    "label": "GRAAL",
    "id": "graal",
    "url": "/concepts/graal.html"
  },
  {
    "label": "Ecstasy",
    "id": "xtclang",
    "url": "/concepts/xtclang.html"
  },
  {
    "label": "DIGITAL Command Language",
    "id": "digital-command-language",
    "url": "/concepts/digital-command-language.html"
  },
  {
    "label": "Dartmouth BASIC",
    "id": "dartmouth-basic",
    "url": "/concepts/dartmouth-basic.html"
  },
  {
    "label": "Sketchpad III",
    "id": "sketchpad-iii",
    "url": "/concepts/sketchpad-iii.html"
  },
  {
    "label": "DAD",
    "id": "dad",
    "url": "/concepts/dad.html"
  },
  {
    "label": "Charcoal",
    "id": "charcoal",
    "url": "/concepts/charcoal.html"
  },
  {
    "label": "Langage Implementation Systeme",
    "id": "lis",
    "url": "/concepts/lis.html"
  },
  {
    "label": "ultralisp-pm",
    "id": "ultralisp-pm",
    "url": "/concepts/ultralisp-pm.html"
  },
  {
    "label": "IAL",
    "id": "ial",
    "url": "/concepts/ial.html"
  },
  {
    "label": "Le-Lisp",
    "id": "le-lisp",
    "url": "/concepts/le-lisp.html"
  },
  {
    "label": "SLIP",
    "id": "slip",
    "url": "/concepts/slip.html"
  },
  {
    "label": "CoNLL-U",
    "id": "conll-u",
    "url": "/concepts/conll-u.html"
  },
  {
    "label": "Harwell-Boeing file format",
    "id": "harwell-boeing-format",
    "url": "/concepts/harwell-boeing-format.html"
  },
  {
    "label": "SIMULA 67",
    "id": "simula-67",
    "url": "/concepts/simula-67.html"
  },
  {
    "label": "JAWS Scripting Language",
    "id": "jaws-scripting-language",
    "url": "/concepts/jaws-scripting-language.html"
  },
  {
    "label": "GEORGE",
    "id": "george",
    "url": "/concepts/george.html"
  },
  {
    "label": "Cloud Firestore Security Rules",
    "id": "cloud-firestore-security-rules",
    "url": "/concepts/cloud-firestore-security-rules.html"
  },
  {
    "label": "SIMUL",
    "id": "simul",
    "url": "/concepts/simul.html"
  },
  {
    "label": "FORMAC",
    "id": "formac",
    "url": "/concepts/formac.html"
  },
  {
    "label": "Janus",
    "id": "janus-lang",
    "url": "/concepts/janus-lang.html"
  },
  {
    "label": "ThinBasic",
    "id": "thinbasic",
    "url": "/concepts/thinbasic.html"
  },
  {
    "label": "SPIP",
    "id": "spip",
    "url": "/concepts/spip.html"
  },
  {
    "label": "PLEX",
    "id": "plex",
    "url": "/concepts/plex.html"
  },
  {
    "label": "Formatted Table",
    "id": "formatted-table",
    "url": "/concepts/formatted-table.html"
  },
  {
    "label": "DIANA",
    "id": "diana",
    "url": "/concepts/diana.html"
  },
  {
    "label": "File Oriented Interpretive Language",
    "id": "foil",
    "url": "/concepts/foil.html"
  },
  {
    "label": "Tandem Advanced Command Language",
    "id": "tacl",
    "url": "/concepts/tacl.html"
  },
  {
    "label": "Programming Language for Business",
    "id": "plb",
    "url": "/concepts/plb.html"
  },
  {
    "label": "Ecological Metadata Language",
    "id": "ecological-metadata-language",
    "url": "/concepts/ecological-metadata-language.html"
  },
  {
    "label": "MATH-MATIC",
    "id": "math-matic",
    "url": "/concepts/math-matic.html"
  },
  {
    "label": "SIMPAS",
    "id": "simpas",
    "url": "/concepts/simpas.html"
  },
  {
    "label": "FORK",
    "id": "fork",
    "url": "/concepts/fork.html"
  },
  {
    "label": "DAP FORTRAN",
    "id": "dap-fortran",
    "url": "/concepts/dap-fortran.html"
  },
  {
    "label": "Distributed Application Specification Language",
    "id": "dasl",
    "url": "/concepts/dasl.html"
  },
  {
    "label": "Iode",
    "id": "iode",
    "url": "/concepts/iode.html"
  },
  {
    "label": "GeoGebra",
    "id": "geogebra",
    "url": "/concepts/geogebra.html"
  },
  {
    "label": "Ikarus Scheme implementation",
    "id": "ikarus",
    "url": "/concepts/ikarus.html"
  },
  {
    "label": "toki sona",
    "id": "toki-sona",
    "url": "/concepts/toki-sona.html"
  },
  {
    "label": "LIMDEP",
    "id": "limdep",
    "url": "/concepts/limdep.html"
  },
  {
    "label": "SIMNET",
    "id": "simnet",
    "url": "/concepts/simnet.html"
  },
  {
    "label": "Workfl",
    "id": "workfl",
    "url": "/concepts/workfl.html"
  },
  {
    "label": "OpenLisp",
    "id": "openlisp",
    "url": "/concepts/openlisp.html"
  },
  {
    "label": "ITL",
    "id": "itl",
    "url": "/concepts/itl.html"
  },
  {
    "label": "rhine",
    "id": "rhine",
    "url": "/concepts/rhine.html"
  },
  {
    "label": "SIML/I",
    "id": "siml-i",
    "url": "/concepts/siml-i.html"
  },
  {
    "label": "Nosica",
    "id": "nosica",
    "url": "/concepts/nosica.html"
  },
  {
    "label": "SequenceL",
    "id": "sequencel",
    "url": "/concepts/sequencel.html"
  },
  {
    "label": "RamdaScript",
    "id": "ramdascript",
    "url": "/concepts/ramdascript.html"
  },
  {
    "label": "QUEL",
    "id": "quel",
    "url": "/concepts/quel.html"
  },
  {
    "label": "SIMFACTORY",
    "id": "simfactory",
    "url": "/concepts/simfactory.html"
  },
  {
    "label": "SQHTML",
    "id": "sqhtml",
    "url": "/concepts/sqhtml.html"
  },
  {
    "label": "Cane",
    "id": "cane",
    "url": "/concepts/cane.html"
  },
  {
    "label": "zl",
    "id": "zl",
    "url": "/concepts/zl.html"
  },
  {
    "label": "CheetahTemplate",
    "id": "cheetah",
    "url": "/concepts/cheetah.html"
  },
  {
    "label": "TOM",
    "id": "tom",
    "url": "/concepts/tom.html"
  },
  {
    "label": "Information Presentation Facility",
    "id": "ipf",
    "url": "/concepts/ipf.html"
  },
  {
    "label": "MEDUSA",
    "id": "medusa",
    "url": "/concepts/medusa.html"
  },
  {
    "label": "SIMDIS",
    "id": "simdis",
    "url": "/concepts/simdis.html"
  },
  {
    "label": "FutureScript",
    "id": "futurescript",
    "url": "/concepts/futurescript.html"
  },
  {
    "label": "BRUIN",
    "id": "brown-university-interactive-language",
    "url": "/concepts/brown-university-interactive-language.html"
  },
  {
    "label": "System 2",
    "id": "s2",
    "url": "/concepts/s2.html"
  },
  {
    "label": "ten",
    "id": "ten",
    "url": "/concepts/ten.html"
  },
  {
    "label": "CGOL",
    "id": "cgol",
    "url": "/concepts/cgol.html"
  },
  {
    "label": "Gauche Scheme implementation",
    "id": "gauche",
    "url": "/concepts/gauche.html"
  },
  {
    "label": "DEMOS",
    "id": "demos",
    "url": "/concepts/demos.html"
  },
  {
    "label": "Integrated Data Store",
    "id": "ids",
    "url": "/concepts/ids.html"
  },
  {
    "label": "Magik",
    "id": "magik",
    "url": "/concepts/magik.html"
  },
  {
    "label": "Dataflex",
    "id": "dataflex",
    "url": "/concepts/dataflex.html"
  },
  {
    "label": "SIMCAL",
    "id": "simcal",
    "url": "/concepts/simcal.html"
  },
  {
    "label": "rockstar-rkt",
    "id": "rockstar-rkt",
    "url": "/concepts/rockstar-rkt.html"
  },
  {
    "label": "lamderp",
    "id": "lamderp",
    "url": "/concepts/lamderp.html"
  },
  {
    "label": "corescript",
    "id": "corescript",
    "url": "/concepts/corescript.html"
  },
  {
    "label": "tibet",
    "id": "tibet",
    "url": "/concepts/tibet.html"
  },
  {
    "label": "mawk",
    "id": "mawk",
    "url": "/concepts/mawk.html"
  },
  {
    "label": "r3",
    "id": "r3",
    "url": "/concepts/r3.html"
  },
  {
    "label": "PLEXIL",
    "id": "plexil",
    "url": "/concepts/plexil.html"
  },
  {
    "label": "TestML",
    "id": "testml",
    "url": "/concepts/testml.html"
  },
  {
    "label": "Euler",
    "id": "euler",
    "url": "/concepts/euler.html"
  },
  {
    "label": "hamdown",
    "id": "hamdown",
    "url": "/concepts/hamdown.html"
  },
  {
    "label": "Eurisko",
    "id": "eurisko",
    "url": "/concepts/eurisko.html"
  },
  {
    "label": "tablam",
    "id": "tablam",
    "url": "/concepts/tablam.html"
  },
  {
    "label": "Jemplate",
    "id": "jemplate",
    "url": "/concepts/jemplate.html"
  },
  {
    "label": "FlowNet",
    "id": "flownet",
    "url": "/concepts/flownet.html"
  },
  {
    "label": "emesh",
    "id": "emesh",
    "url": "/concepts/emesh.html"
  },
  {
    "label": "Swym",
    "id": "swym",
    "url": "/concepts/swym.html"
  },
  {
    "label": "duro",
    "id": "duro",
    "url": "/concepts/duro.html"
  },
  {
    "label": "KavaScript",
    "id": "kavascript",
    "url": "/concepts/kavascript.html"
  },
  {
    "label": "fjs",
    "id": "fjs",
    "url": "/concepts/fjs.html"
  },
  {
    "label": "Gellish",
    "id": "gellish",
    "url": "/concepts/gellish.html"
  },
  {
    "label": "CONVERT",
    "id": "convert",
    "url": "/concepts/convert.html"
  },
  {
    "label": "Subleq",
    "id": "subleq",
    "url": "/concepts/subleq.html"
  },
  {
    "label": "SIMAN IV",
    "id": "siman-iv",
    "url": "/concepts/siman-iv.html"
  },
  {
    "label": "Slick",
    "id": "slick",
    "url": "/concepts/slick.html"
  },
  {
    "label": "Chika",
    "id": "chika",
    "url": "/concepts/chika.html"
  },
  {
    "label": "gintonic",
    "id": "gintonic",
    "url": "/concepts/gintonic.html"
  },
  {
    "label": "jedlang",
    "id": "jedlang",
    "url": "/concepts/jedlang.html"
  },
  {
    "label": "tangledown",
    "id": "tangledown",
    "url": "/concepts/tangledown.html"
  },
  {
    "label": "Truth",
    "id": "truth",
    "url": "/concepts/truth.html"
  },
  {
    "label": "Insitux",
    "id": "insitux",
    "url": "/concepts/insitux.html"
  },
  {
    "label": "flame-ir",
    "id": "flame-ir",
    "url": "/concepts/flame-ir.html"
  },
  {
    "label": "setlx",
    "id": "setlx",
    "url": "/concepts/setlx.html"
  },
  {
    "label": "KamilaLisp",
    "id": "kamilalisp",
    "url": "/concepts/kamilalisp.html"
  },
  {
    "label": "edgelisp",
    "id": "edgelisp",
    "url": "/concepts/edgelisp.html"
  },
  {
    "label": "Gforth",
    "id": "gforth",
    "url": "/concepts/gforth.html"
  },
  {
    "label": "HAL/S",
    "id": "hal-s",
    "url": "/concepts/hal-s.html"
  },
  {
    "label": "a Lisp Environment",
    "id": "ale",
    "url": "/concepts/ale.html"
  },
  {
    "label": "mlatu",
    "id": "mlatu",
    "url": "/concepts/mlatu.html"
  },
  {
    "label": "kode",
    "id": "kode",
    "url": "/concepts/kode.html"
  },
  {
    "label": "nlpl",
    "id": "nlpl",
    "url": "/concepts/nlpl.html"
  },
  {
    "label": "COMSOL Script",
    "id": "comsol-script",
    "url": "/concepts/comsol-script.html"
  },
  {
    "label": "Touch",
    "id": "touch",
    "url": "/concepts/touch.html"
  },
  {
    "label": "PCrap",
    "id": "pcrap",
    "url": "/concepts/pcrap.html"
  },
  {
    "label": "runiq",
    "id": "runiq",
    "url": "/concepts/runiq.html"
  },
  {
    "label": "Minilang",
    "id": "minilang",
    "url": "/concepts/minilang.html"
  },
  {
    "label": "rel-lang",
    "id": "rel-lang",
    "url": "/concepts/rel-lang.html"
  },
  {
    "label": "CokeScript",
    "id": "cokescript",
    "url": "/concepts/cokescript.html"
  },
  {
    "label": "ALTRAN",
    "id": "altran",
    "url": "/concepts/altran.html"
  },
  {
    "label": "Khepri",
    "id": "khepri",
    "url": "/concepts/khepri.html"
  },
  {
    "label": "MewMew",
    "id": "mewmew",
    "url": "/concepts/mewmew.html"
  },
  {
    "label": "I",
    "id": "i",
    "url": "/concepts/i.html"
  },
  {
    "label": "Binary Alignment Map",
    "id": "bam-format",
    "url": "/concepts/bam-format.html"
  },
  {
    "label": "ralph",
    "id": "ralph",
    "url": "/concepts/ralph.html"
  },
  {
    "label": "reforth",
    "id": "reforth",
    "url": "/concepts/reforth.html"
  },
  {
    "label": "r4",
    "id": "r4",
    "url": "/concepts/r4.html"
  },
  {
    "label": "Brain-Flak",
    "id": "brain-flak",
    "url": "/concepts/brain-flak.html"
  },
  {
    "label": "kei",
    "id": "kei",
    "url": "/concepts/kei.html"
  },
  {
    "label": "mages",
    "id": "mages",
    "url": "/concepts/mages.html"
  },
  {
    "label": "Wonkey",
    "id": "wonkey",
    "url": "/concepts/wonkey.html"
  },
  {
    "label": "hivemind",
    "id": "hivemind",
    "url": "/concepts/hivemind.html"
  },
  {
    "label": "mys",
    "id": "mys",
    "url": "/concepts/mys.html"
  },
  {
    "label": "Encore",
    "id": "encore",
    "url": "/concepts/encore.html"
  },
  {
    "label": "newclay",
    "id": "newclay",
    "url": "/concepts/newclay.html"
  },
  {
    "label": "stacklang",
    "id": "stacklang",
    "url": "/concepts/stacklang.html"
  },
  {
    "label": "rpscript",
    "id": "rpscript",
    "url": "/concepts/rpscript.html"
  },
  {
    "label": "badlanguage",
    "id": "badlanguage",
    "url": "/concepts/badlanguage.html"
  },
  {
    "label": "daonode",
    "id": "daonode",
    "url": "/concepts/daonode.html"
  },
  {
    "label": "phorth",
    "id": "phorth",
    "url": "/concepts/phorth.html"
  },
  {
    "label": "Corman Common Lisp",
    "id": "corman-common-lisp",
    "url": "/concepts/corman-common-lisp.html"
  },
  {
    "label": "BlazeX",
    "id": "blazex",
    "url": "/concepts/blazex.html"
  },
  {
    "label": "Calypso",
    "id": "calypso",
    "url": "/concepts/calypso.html"
  },
  {
    "label": "grid-notation",
    "id": "grid-notation",
    "url": "/concepts/grid-notation.html"
  },
  {
    "label": "mycroft",
    "id": "mycroft",
    "url": "/concepts/mycroft.html"
  },
  {
    "label": "FLIC",
    "id": "flic",
    "url": "/concepts/flic.html"
  },
  {
    "label": "Mewl",
    "id": "mewl",
    "url": "/concepts/mewl.html"
  },
  {
    "label": "Muldis",
    "id": "muldis",
    "url": "/concepts/muldis.html"
  },
  {
    "label": "CodeStudAssembler",
    "id": "csa",
    "url": "/concepts/csa.html"
  },
  {
    "label": "SI Library",
    "id": "si-library",
    "url": "/concepts/si-library.html"
  },
  {
    "label": "AIR",
    "id": "air",
    "url": "/concepts/air.html"
  },
  {
    "label": "JSON Graph Spec",
    "id": "json-graph-spec",
    "url": "/concepts/json-graph-spec.html"
  },
  {
    "label": "Horse64",
    "id": "horse64",
    "url": "/concepts/horse64.html"
  },
  {
    "label": "Blue",
    "id": "blue-programming-language",
    "url": "/concepts/blue-programming-language.html"
  },
  {
    "label": "Lesma",
    "id": "lesma",
    "url": "/concepts/lesma.html"
  },
  {
    "label": "Em",
    "id": "em",
    "url": "/concepts/em.html"
  },
  {
    "label": "DOML",
    "id": "doml",
    "url": "/concepts/doml.html"
  },
  {
    "label": "Jammy",
    "id": "jammy",
    "url": "/concepts/jammy.html"
  },
  {
    "label": "Idio",
    "id": "idio",
    "url": "/concepts/idio.html"
  },
  {
    "label": "Broccoli",
    "id": "broccoli-1",
    "url": "/concepts/broccoli-1.html"
  },
  {
    "label": "DDP",
    "id": "ddp",
    "url": "/concepts/ddp.html"
  },
  {
    "label": "HuwCode",
    "id": "huwcode",
    "url": "/concepts/huwcode.html"
  },
  {
    "label": "Shared Prolog",
    "id": "shared-prolog",
    "url": "/concepts/shared-prolog.html"
  },
  {
    "label": "GamerLanguage",
    "id": "gamerlanguage",
    "url": "/concepts/gamerlanguage.html"
  },
  {
    "label": "Broccoli",
    "id": "broccoli-2",
    "url": "/concepts/broccoli-2.html"
  },
  {
    "label": "acorn-lang",
    "id": "acorn-lang",
    "url": "/concepts/acorn-lang.html"
  },
  {
    "label": "flownote",
    "id": "flownote",
    "url": "/concepts/flownote.html"
  },
  {
    "label": "ShapeUp",
    "id": "shapeup",
    "url": "/concepts/shapeup.html"
  },
  {
    "label": "SEVAL",
    "id": "seval",
    "url": "/concepts/seval.html"
  },
  {
    "label": "SetLog",
    "id": "setlog",
    "url": "/concepts/setlog.html"
  },
  {
    "label": "SESPOOL",
    "id": "sespool",
    "url": "/concepts/sespool.html"
  },
  {
    "label": "Sequential Pascal",
    "id": "sequential-pascal",
    "url": "/concepts/sequential-pascal.html"
  },
  {
    "label": "SEQUEL 2",
    "id": "sequel-2",
    "url": "/concepts/sequel-2.html"
  },
  {
    "label": "Fable",
    "id": "fable",
    "url": "/concepts/fable.html"
  },
  {
    "label": "Seque",
    "id": "seque",
    "url": "/concepts/seque.html"
  },
  {
    "label": "rason",
    "id": "rason",
    "url": "/concepts/rason.html"
  },
  {
    "label": "SEMANOL",
    "id": "semanol",
    "url": "/concepts/semanol.html"
  },
  {
    "label": "SEGRAS",
    "id": "segras",
    "url": "/concepts/segras.html"
  },
  {
    "label": "Extended Pascal",
    "id": "extended-pascal",
    "url": "/concepts/extended-pascal.html"
  },
  {
    "label": "SectorC",
    "id": "sectorc",
    "url": "/concepts/sectorc.html"
  },
  {
    "label": "Cish",
    "id": "cish",
    "url": "/concepts/cish.html"
  },
  {
    "label": "ScriptX",
    "id": "scriptx",
    "url": "/concepts/scriptx.html"
  },
  {
    "label": "EXEL",
    "id": "exel",
    "url": "/concepts/exel.html"
  },
  {
    "label": "Scrimshaw",
    "id": "scrimshaw",
    "url": "/concepts/scrimshaw.html"
  },
  {
    "label": "Scratchpad II",
    "id": "scratchpad-ii",
    "url": "/concepts/scratchpad-ii.html"
  },
  {
    "label": "Eva",
    "id": "eva",
    "url": "/concepts/eva.html"
  },
  {
    "label": "Sclipting",
    "id": "sclipting",
    "url": "/concepts/sclipting.html"
  },
  {
    "label": "SCIL-VP",
    "id": "scil-vp",
    "url": "/concepts/scil-vp.html"
  },
  {
    "label": "SCHEMAL",
    "id": "schemal",
    "url": "/concepts/schemal.html"
  },
  {
    "label": "EQS",
    "id": "eqs",
    "url": "/concepts/eqs.html"
  },
  {
    "label": "SCALPEL",
    "id": "scalpel",
    "url": "/concepts/scalpel.html"
  },
  {
    "label": "SB-ONE",
    "id": "sb-one",
    "url": "/concepts/sb-one.html"
  },
  {
    "label": "EMMA",
    "id": "emma",
    "url": "/concepts/emma.html"
  },
  {
    "label": "Sassy",
    "id": "sassy",
    "url": "/concepts/sassy.html"
  },
  {
    "label": "SARTEX",
    "id": "sartex",
    "url": "/concepts/sartex.html"
  },
  {
    "label": "ELLPACK",
    "id": "ellpack",
    "url": "/concepts/ellpack.html"
  },
  {
    "label": "Elegant",
    "id": "elegant",
    "url": "/concepts/elegant.html"
  },
  {
    "label": "SAC-2",
    "id": "sac-2",
    "url": "/concepts/sac-2.html"
  },
  {
    "label": "SAC-1",
    "id": "sac-1",
    "url": "/concepts/sac-1.html"
  },
  {
    "label": "SAAL",
    "id": "saal",
    "url": "/concepts/saal.html"
  },
  {
    "label": "Edison",
    "id": "edison",
    "url": "/concepts/edison.html"
  },
  {
    "label": "RT-Z",
    "id": "rt-z",
    "url": "/concepts/rt-z.html"
  },
  {
    "label": "RT-CDL",
    "id": "rt-cdl",
    "url": "/concepts/rt-cdl.html"
  },
  {
    "label": "RT-ASLAN",
    "id": "rt-aslan",
    "url": "/concepts/rt-aslan.html"
  },
  {
    "label": "Rosette",
    "id": "rosette",
    "url": "/concepts/rosette.html"
  },
  {
    "label": "Durra",
    "id": "durra",
    "url": "/concepts/durra.html"
  },
  {
    "label": "ROL2",
    "id": "rol2",
    "url": "/concepts/rol2.html"
  },
  {
    "label": "DUAL",
    "id": "dual",
    "url": "/concepts/dual.html"
  },
  {
    "label": "ROL",
    "id": "rol",
    "url": "/concepts/rol.html"
  },
  {
    "label": "RIGAL",
    "id": "rigal",
    "url": "/concepts/rigal.html"
  },
  {
    "label": "Trex",
    "id": "trex",
    "url": "/concepts/trex.html"
  },
  {
    "label": "RHET",
    "id": "rhet",
    "url": "/concepts/rhet.html"
  },
  {
    "label": "Dribble",
    "id": "dribble",
    "url": "/concepts/dribble.html"
  },
  {
    "label": "RF-Maple",
    "id": "rf-maple",
    "url": "/concepts/rf-maple.html"
  },
  {
    "label": "toadskin",
    "id": "toadskin",
    "url": "/concepts/toadskin.html"
  },
  {
    "label": "DOPL",
    "id": "dopl",
    "url": "/concepts/dopl.html"
  },
  {
    "label": "RELFUN",
    "id": "relfun",
    "url": "/concepts/relfun.html"
  },
  {
    "label": "$",
    "id": "dollar-sign",
    "url": "/concepts/dollar-sign.html"
  },
  {
    "label": "Relationlog",
    "id": "relationlog",
    "url": "/concepts/relationlog.html"
  },
  {
    "label": "DNA",
    "id": "dna",
    "url": "/concepts/dna.html"
  },
  {
    "label": "DLP",
    "id": "dlp",
    "url": "/concepts/dlp.html"
  },
  {
    "label": "REGENT",
    "id": "regent",
    "url": "/concepts/regent.html"
  },
  {
    "label": "RefLisp",
    "id": "reflisp",
    "url": "/concepts/reflisp.html"
  },
  {
    "label": "REF-ARF",
    "id": "ref-arf",
    "url": "/concepts/ref-arf.html"
  },
  {
    "label": "DISPEL",
    "id": "dispel",
    "url": "/concepts/dispel.html"
  },
  {
    "label": "DISC",
    "id": "disc",
    "url": "/concepts/disc.html"
  },
  {
    "label": "RECOL",
    "id": "recol",
    "url": "/concepts/recol.html"
  },
  {
    "label": "REC/SM",
    "id": "rec-sm",
    "url": "/concepts/rec-sm.html"
  },
  {
    "label": "Dipe-R",
    "id": "dipe-r",
    "url": "/concepts/dipe-r.html"
  },
  {
    "label": "T3X",
    "id": "t3x",
    "url": "/concepts/t3x.html"
  },
  {
    "label": "DICE",
    "id": "dice",
    "url": "/concepts/dice.html"
  },
  {
    "label": "DIALOG",
    "id": "dialog",
    "url": "/concepts/dialog.html"
  },
  {
    "label": "sub",
    "id": "sub",
    "url": "/concepts/sub.html"
  },
  {
    "label": "rbasic",
    "id": "rbasic",
    "url": "/concepts/rbasic.html"
  },
  {
    "label": "Descartes",
    "id": "descartes",
    "url": "/concepts/descartes.html"
  },
  {
    "label": "DEMETER",
    "id": "demeter",
    "url": "/concepts/demeter.html"
  },
  {
    "label": "Delta Prolog",
    "id": "delta-prolog",
    "url": "/concepts/delta-prolog.html"
  },
  {
    "label": "Delirium",
    "id": "delirium",
    "url": "/concepts/delirium.html"
  },
  {
    "label": "Quty",
    "id": "quty",
    "url": "/concepts/quty.html"
  },
  {
    "label": "DEL",
    "id": "del",
    "url": "/concepts/del.html"
  },
  {
    "label": "Qunity",
    "id": "qunity",
    "url": "/concepts/qunity.html"
  },
  {
    "label": "DECLARE",
    "id": "declare",
    "url": "/concepts/declare.html"
  },
  {
    "label": "DEBL",
    "id": "debl",
    "url": "/concepts/debl.html"
  },
  {
    "label": "SOQL",
    "id": "soql",
    "url": "/concepts/soql.html"
  },
  {
    "label": "solaris-pm",
    "id": "solaris-pm",
    "url": "/concepts/solaris-pm.html"
  },
  {
    "label": "socialite",
    "id": "socialite",
    "url": "/concepts/socialite.html"
  },
  {
    "label": "QLISP",
    "id": "qlisp",
    "url": "/concepts/qlisp.html"
  },
  {
    "label": "Data Communications ALGOL",
    "id": "dcalgol",
    "url": "/concepts/dcalgol.html"
  },
  {
    "label": "Smithy",
    "id": "smithy",
    "url": "/concepts/smithy.html"
  },
  {
    "label": "QA4",
    "id": "qa4",
    "url": "/concepts/qa4.html"
  },
  {
    "label": "Q-GERT",
    "id": "q-gert",
    "url": "/concepts/q-gert.html"
  },
  {
    "label": "DAMN",
    "id": "damn",
    "url": "/concepts/damn.html"
  },
  {
    "label": "PUMPKIN",
    "id": "pumpkin",
    "url": "/concepts/pumpkin.html"
  },
  {
    "label": "shiv",
    "id": "shiv",
    "url": "/concepts/shiv.html"
  },
  {
    "label": "PT",
    "id": "pt",
    "url": "/concepts/pt.html"
  },
  {
    "label": "PSL",
    "id": "psl",
    "url": "/concepts/psl.html"
  },
  {
    "label": "PSG",
    "id": "psg",
    "url": "/concepts/psg.html"
  },
  {
    "label": "pSather",
    "id": "psather",
    "url": "/concepts/psather.html"
  },
  {
    "label": "CUPID",
    "id": "cupid",
    "url": "/concepts/cupid.html"
  },
  {
    "label": "PROW",
    "id": "prow",
    "url": "/concepts/prow.html"
  },
  {
    "label": "CUBE",
    "id": "cube",
    "url": "/concepts/cube.html"
  },
  {
    "label": "x86-64",
    "id": "x86-64-isa",
    "url": "/concepts/x86-64-isa.html"
  },
  {
    "label": "scopes",
    "id": "scopes",
    "url": "/concepts/scopes.html"
  },
  {
    "label": "PROTOS-L",
    "id": "protos-l",
    "url": "/concepts/protos-l.html"
  },
  {
    "label": "CST",
    "id": "cst",
    "url": "/concepts/cst.html"
  },
  {
    "label": "PROPLAN",
    "id": "proplan",
    "url": "/concepts/proplan.html"
  },
  {
    "label": "s-lang",
    "id": "s-lang",
    "url": "/concepts/s-lang.html"
  },
  {
    "label": "runic",
    "id": "runic",
    "url": "/concepts/runic.html"
  },
  {
    "label": "Prolog-Linda",
    "id": "prolog-linda",
    "url": "/concepts/prolog-linda.html"
  },
  {
    "label": "rsharp",
    "id": "rsharp",
    "url": "/concepts/rsharp.html"
  },
  {
    "label": "Prolog/KR",
    "id": "prolog-kr",
    "url": "/concepts/prolog-kr.html"
  },
  {
    "label": "Prolog III",
    "id": "prolog-iii",
    "url": "/concepts/prolog-iii.html"
  },
  {
    "label": "Prolog-ELF",
    "id": "prolog-elf",
    "url": "/concepts/prolog-elf.html"
  },
  {
    "label": "Prolog-D-Linda",
    "id": "prolog-d-linda",
    "url": "/concepts/prolog-d-linda.html"
  },
  {
    "label": "PROGRES",
    "id": "progres",
    "url": "/concepts/progres.html"
  },
  {
    "label": "PROCOL",
    "id": "procol",
    "url": "/concepts/procol.html"
  },
  {
    "label": "Prisma Schema Language",
    "id": "prisma-schema-language",
    "url": "/concepts/prisma-schema-language.html"
  },
  {
    "label": "PRISM",
    "id": "prism",
    "url": "/concepts/prism.html"
  },
  {
    "label": "Principle of sufficient reason",
    "id": "principle-of-sufficient-reason",
    "url": "/concepts/principle-of-sufficient-reason.html"
  },
  {
    "label": "PRESTO",
    "id": "presto",
    "url": "/concepts/presto.html"
  },
  {
    "label": "PRAXIS",
    "id": "praxis",
    "url": "/concepts/praxis.html"
  },
  {
    "label": "Consul",
    "id": "consul",
    "url": "/concepts/consul.html"
  },
  {
    "label": "CONSTRAINTS",
    "id": "constraints",
    "url": "/concepts/constraints.html"
  },
  {
    "label": "PORT-ALG",
    "id": "port-alg",
    "url": "/concepts/port-alg.html"
  },
  {
    "label": "raco-pm",
    "id": "raco-pm",
    "url": "/concepts/raco-pm.html"
  },
  {
    "label": "POPSY",
    "id": "popsy",
    "url": "/concepts/popsy.html"
  },
  {
    "label": "CONSIM",
    "id": "consim",
    "url": "/concepts/consim.html"
  },
  {
    "label": "PolyTOIL",
    "id": "polytoil",
    "url": "/concepts/polytoil.html"
  },
  {
    "label": "Connection Machine LISP",
    "id": "connection-machine-lisp",
    "url": "/concepts/connection-machine-lisp.html"
  },
  {
    "label": "PolyP",
    "id": "polyp",
    "url": "/concepts/polyp.html"
  },
  {
    "label": "qed-lang",
    "id": "qed-lang",
    "url": "/concepts/qed-lang.html"
  },
  {
    "label": "Polylith",
    "id": "polylith",
    "url": "/concepts/polylith.html"
  },
  {
    "label": "CONLAN",
    "id": "conlan",
    "url": "/concepts/conlan.html"
  },
  {
    "label": "POLAC",
    "id": "polac",
    "url": "/concepts/polac.html"
  },
  {
    "label": "POGOL",
    "id": "pogol",
    "url": "/concepts/pogol.html"
  },
  {
    "label": "Concurrent Prolog",
    "id": "concurrent-prolog",
    "url": "/concepts/concurrent-prolog.html"
  },
  {
    "label": "Pocket Smalltalk",
    "id": "pocket-smalltalk",
    "url": "/concepts/pocket-smalltalk.html"
  },
  {
    "label": "Concurrent C++",
    "id": "concurrent-cpp",
    "url": "/concepts/concurrent-cpp.html"
  },
  {
    "label": "pyke",
    "id": "pyke",
    "url": "/concepts/pyke.html"
  },
  {
    "label": "Pursuit PureScript Package Repository",
    "id": "pursuit-pm",
    "url": "/concepts/pursuit-pm.html"
  },
  {
    "label": "Bayer Expressions",
    "id": "bayer-expressions",
    "url": "/concepts/bayer-expressions.html"
  },
  {
    "label": "Playground",
    "id": "playground",
    "url": "/concepts/playground.html"
  },
  {
    "label": "PLANNER-73",
    "id": "planner-73",
    "url": "/concepts/planner-73.html"
  },
  {
    "label": "PLANIT",
    "id": "planit",
    "url": "/concepts/planit.html"
  },
  {
    "label": "COMSKEE",
    "id": "comskee",
    "url": "/concepts/comskee.html"
  },
  {
    "label": "COMPUTEST",
    "id": "computest",
    "url": "/concepts/computest.html"
  },
  {
    "label": "potential",
    "id": "potential",
    "url": "/concepts/potential.html"
  },
  {
    "label": "popcorn-linux",
    "id": "popcorn-linux",
    "url": "/concepts/popcorn-linux.html"
  },
  {
    "label": "Patient-Oriented Prescription Programming Language",
    "id": "pop-pl",
    "url": "/concepts/pop-pl.html"
  },
  {
    "label": "COMFY",
    "id": "comfy",
    "url": "/concepts/comfy.html"
  },
  {
    "label": "hackage-pm",
    "id": "hackage-pm",
    "url": "/concepts/hackage-pm.html"
  },
  {
    "label": "PL/EXUS",
    "id": "pl-exus",
    "url": "/concepts/pl-exus.html"
  },
  {
    "label": "COL",
    "id": "col",
    "url": "/concepts/col.html"
  },
  {
    "label": "Coherent Parallel C",
    "id": "coherent-parallel-c",
    "url": "/concepts/coherent-parallel-c.html"
  },
  {
    "label": "PiLib",
    "id": "pilib",
    "url": "/concepts/pilib.html"
  },
  {
    "label": "GraphQL+-",
    "id": "graphql-plus-minus",
    "url": "/concepts/graphql-plus-minus.html"
  },
  {
    "label": "PICTUREBALM",
    "id": "picturebalm",
    "url": "/concepts/picturebalm.html"
  },
  {
    "label": "PICTOL",
    "id": "pictol",
    "url": "/concepts/pictol.html"
  },
  {
    "label": "Planguage",
    "id": "planguage",
    "url": "/concepts/planguage.html"
  },
  {
    "label": "Pi Calculus",
    "id": "pi-calculus",
    "url": "/concepts/pi-calculus.html"
  },
  {
    "label": "PHYSICTRAN",
    "id": "physictran",
    "url": "/concepts/physictran.html"
  },
  {
    "label": "pGOLOG",
    "id": "pgolog",
    "url": "/concepts/pgolog.html"
  },
  {
    "label": "piccola",
    "id": "piccola",
    "url": "/concepts/piccola.html"
  },
  {
    "label": "atx",
    "id": "atx",
    "url": "/concepts/atx.html"
  },
  {
    "label": "Pfortran",
    "id": "pfortran",
    "url": "/concepts/pfortran.html"
  },
  {
    "label": "PFORT",
    "id": "pfort",
    "url": "/concepts/pfort.html"
  },
  {
    "label": "CLEAR",
    "id": "clear",
    "url": "/concepts/clear.html"
  },
  {
    "label": "ClassiC",
    "id": "classic",
    "url": "/concepts/classic.html"
  },
  {
    "label": "TreeSheets",
    "id": "treesheets",
    "url": "/concepts/treesheets.html"
  },
  {
    "label": "PEP",
    "id": "pep",
    "url": "/concepts/pep.html"
  },
  {
    "label": "PEI",
    "id": "pei",
    "url": "/concepts/pei.html"
  },
  {
    "label": "CLANGER",
    "id": "clanger",
    "url": "/concepts/clanger.html"
  },
  {
    "label": "Pebble",
    "id": "pebble",
    "url": "/concepts/pebble.html"
  },
  {
    "label": "CIRCAL",
    "id": "circal",
    "url": "/concepts/circal.html"
  },
  {
    "label": "PDL",
    "id": "pdl",
    "url": "/concepts/pdl.html"
  },
  {
    "label": "PDL/Ada",
    "id": "pdl-ada",
    "url": "/concepts/pdl-ada.html"
  },
  {
    "label": "Partial Differential Equation Language",
    "id": "pdel",
    "url": "/concepts/pdel.html"
  },
  {
    "label": "Optimized Row Columnar",
    "id": "orc-format",
    "url": "/concepts/orc-format.html"
  },
  {
    "label": "pC++",
    "id": "pcpp",
    "url": "/concepts/pcpp.html"
  },
  {
    "label": "PCOL",
    "id": "pcol",
    "url": "/concepts/pcol.html"
  },
  {
    "label": "PCN",
    "id": "pcn",
    "url": "/concepts/pcn.html"
  },
  {
    "label": "Chimera",
    "id": "chimera",
    "url": "/concepts/chimera.html"
  },
  {
    "label": "Path Pascal",
    "id": "path-pascal",
    "url": "/concepts/path-pascal.html"
  },
  {
    "label": "PASRO",
    "id": "pasro",
    "url": "/concepts/pasro.html"
  },
  {
    "label": "Ordered graph data language",
    "id": "ogdl",
    "url": "/concepts/ogdl.html"
  },
  {
    "label": "PASION",
    "id": "pasion",
    "url": "/concepts/pasion.html"
  },
  {
    "label": "oforth",
    "id": "oforth",
    "url": "/concepts/oforth.html"
  },
  {
    "label": "Pascal-SC",
    "id": "pascal-sc",
    "url": "/concepts/pascal-sc.html"
  },
  {
    "label": "Pascal Plus",
    "id": "pascal-plus",
    "url": "/concepts/pascal-plus.html"
  },
  {
    "label": "NumPad",
    "id": "numpad",
    "url": "/concepts/numpad.html"
  },
  {
    "label": "np",
    "id": "np",
    "url": "/concepts/np.html"
  },
  {
    "label": "ParMod",
    "id": "parmod",
    "url": "/concepts/parmod.html"
  },
  {
    "label": "JMP",
    "id": "jmp",
    "url": "/concepts/jmp.html"
  },
  {
    "label": "ParaLog_e",
    "id": "paralog-e",
    "url": "/concepts/paralog-e.html"
  },
  {
    "label": "nimble-pm",
    "id": "nimble-pm",
    "url": "/concepts/nimble-pm.html"
  },
  {
    "label": "Parallel Pascal",
    "id": "parallel-pascal",
    "url": "/concepts/parallel-pascal.html"
  },
  {
    "label": "Parallel ELLPACK",
    "id": "parallel-ellpack",
    "url": "/concepts/parallel-ellpack.html"
  },
  {
    "label": "neralie-format",
    "id": "neralie-format",
    "url": "/concepts/neralie-format.html"
  },
  {
    "label": "PANON-1B",
    "id": "panon-1b",
    "url": "/concepts/panon-1b.html"
  },
  {
    "label": "CCS",
    "id": "ccs",
    "url": "/concepts/ccs.html"
  },
  {
    "label": "nectar",
    "id": "nectar",
    "url": "/concepts/nectar.html"
  },
  {
    "label": "PANON-1",
    "id": "panon-1",
    "url": "/concepts/panon-1.html"
  },
  {
    "label": "CCal",
    "id": "ccal",
    "url": "/concepts/ccal.html"
  },
  {
    "label": "PANCODE",
    "id": "pancode",
    "url": "/concepts/pancode.html"
  },
  {
    "label": "mypy",
    "id": "mypy",
    "url": "/concepts/mypy.html"
  },
  {
    "label": "Palingol",
    "id": "palingol",
    "url": "/concepts/palingol.html"
  },
  {
    "label": "PaiLisp",
    "id": "pailisp",
    "url": "/concepts/pailisp.html"
  },
  {
    "label": "PADL-1",
    "id": "padl-1",
    "url": "/concepts/padl-1.html"
  },
  {
    "label": "PACOL",
    "id": "pacol",
    "url": "/concepts/pacol.html"
  },
  {
    "label": "P3L",
    "id": "p3l",
    "url": "/concepts/p3l.html"
  },
  {
    "label": "P-TAC",
    "id": "p-tac",
    "url": "/concepts/p-tac.html"
  },
  {
    "label": "CAJOLE",
    "id": "cajole",
    "url": "/concepts/cajole.html"
  },
  {
    "label": "mlite",
    "id": "mlite",
    "url": "/concepts/mlite.html"
  },
  {
    "label": "P-Prolog",
    "id": "p-prolog",
    "url": "/concepts/p-prolog.html"
  },
  {
    "label": "mir",
    "id": "mir",
    "url": "/concepts/mir.html"
  },
  {
    "label": "CafeObj",
    "id": "cafeobj",
    "url": "/concepts/cafeobj.html"
  },
  {
    "label": "OWL DL",
    "id": "owl-dl",
    "url": "/concepts/owl-dl.html"
  },
  {
    "label": "miniprolog",
    "id": "miniprolog",
    "url": "/concepts/miniprolog.html"
  },
  {
    "label": "Otter",
    "id": "otter",
    "url": "/concepts/otter.html"
  },
  {
    "label": "Ottawa Euclid",
    "id": "ottawa-euclid",
    "url": "/concepts/ottawa-euclid.html"
  },
  {
    "label": "minihaskell",
    "id": "minihaskell",
    "url": "/concepts/minihaskell.html"
  },
  {
    "label": "OSL/2",
    "id": "osl-2",
    "url": "/concepts/osl-2.html"
  },
  {
    "label": "OSIRIS",
    "id": "osiris",
    "url": "/concepts/osiris.html"
  },
  {
    "label": "Orlog",
    "id": "orlog",
    "url": "/concepts/orlog.html"
  },
  {
    "label": "C flat",
    "id": "c-flat",
    "url": "/concepts/c-flat.html"
  },
  {
    "label": "Maven Central Repository",
    "id": "maven-pm",
    "url": "/concepts/maven-pm.html"
  },
  {
    "label": "OREGANO",
    "id": "oregano",
    "url": "/concepts/oregano.html"
  },
  {
    "label": "mathematica-packagedata-pm",
    "id": "mathematica-packagedata-pm",
    "url": "/concepts/mathematica-packagedata-pm.html"
  },
  {
    "label": "ed",
    "id": "ed-editor",
    "url": "/concepts/ed-editor.html"
  },
  {
    "label": "OPS",
    "id": "ops",
    "url": "/concepts/ops.html"
  },
  {
    "label": "OPS-3",
    "id": "ops-3",
    "url": "/concepts/ops-3.html"
  },
  {
    "label": "BrouHaHa",
    "id": "brouhaha",
    "url": "/concepts/brouhaha.html"
  },
  {
    "label": "OpenMusic",
    "id": "openmusic",
    "url": "/concepts/openmusic.html"
  },
  {
    "label": "luarocks-pm",
    "id": "luarocks-pm",
    "url": "/concepts/luarocks-pm.html"
  },
  {
    "label": "OOPAL",
    "id": "oopal",
    "url": "/concepts/oopal.html"
  },
  {
    "label": "loglo",
    "id": "loglo",
    "url": "/concepts/loglo.html"
  },
  {
    "label": "lllpg",
    "id": "lllpg",
    "url": "/concepts/lllpg.html"
  },
  {
    "label": "OMNITAB 80",
    "id": "omnitab-80",
    "url": "/concepts/omnitab-80.html"
  },
  {
    "label": "OMNIMARK",
    "id": "omnimark",
    "url": "/concepts/omnimark.html"
  },
  {
    "label": "liquidity",
    "id": "liquidity",
    "url": "/concepts/liquidity.html"
  },
  {
    "label": "links",
    "id": "links",
    "url": "/concepts/links.html"
  },
  {
    "label": "Interpress",
    "id": "interpress",
    "url": "/concepts/interpress.html"
  },
  {
    "label": "Linked Markdown",
    "id": "linked-markdown",
    "url": "/concepts/linked-markdown.html"
  },
  {
    "label": "OLI",
    "id": "oli",
    "url": "/concepts/oli.html"
  },
  {
    "label": "OLGA",
    "id": "olga",
    "url": "/concepts/olga.html"
  },
  {
    "label": "O'Haskell",
    "id": "ohaskell",
    "url": "/concepts/ohaskell.html"
  },
  {
    "label": "BLAZE 2",
    "id": "blaze-2",
    "url": "/concepts/blaze-2.html"
  },
  {
    "label": "Octopus",
    "id": "octopus",
    "url": "/concepts/octopus.html"
  },
  {
    "label": "Occam 2",
    "id": "occam-2",
    "url": "/concepts/occam-2.html"
  },
  {
    "label": "OBSCURE",
    "id": "obscure",
    "url": "/concepts/obscure.html"
  },
  {
    "label": "Birkbeck Assembly",
    "id": "birkbeck-assembly",
    "url": "/concepts/birkbeck-assembly.html"
  },
  {
    "label": "ObjVProlog",
    "id": "objvprolog",
    "url": "/concepts/objvprolog.html"
  },
  {
    "label": "ObjectWorld",
    "id": "objectworld",
    "url": "/concepts/objectworld.html"
  },
  {
    "label": "Objectcharts",
    "id": "objectcharts",
    "url": "/concepts/objectcharts.html"
  },
  {
    "label": "Query by Example",
    "id": "query-by-example",
    "url": "/concepts/query-by-example.html"
  },
  {
    "label": "OBJ2",
    "id": "obj2",
    "url": "/concepts/obj2.html"
  },
  {
    "label": "oasis-operating-system",
    "id": "oasis-operating-system",
    "url": "/concepts/oasis-operating-system.html"
  },
  {
    "label": "BIGWIG",
    "id": "bigwig",
    "url": "/concepts/bigwig.html"
  },
  {
    "label": "Oaklisp",
    "id": "oaklisp",
    "url": "/concepts/oaklisp.html"
  },
  {
    "label": "bigWig format",
    "id": "bigwig-format",
    "url": "/concepts/bigwig-format.html"
  },
  {
    "label": "BIGMAC",
    "id": "bigmac",
    "url": "/concepts/bigmac.html"
  },
  {
    "label": "kogut",
    "id": "kogut",
    "url": "/concepts/kogut.html"
  },
  {
    "label": "Biferno",
    "id": "biferno",
    "url": "/concepts/biferno.html"
  },
  {
    "label": "Numerica",
    "id": "numerica",
    "url": "/concepts/numerica.html"
  },
  {
    "label": "ki",
    "id": "ki",
    "url": "/concepts/ki.html"
  },
  {
    "label": "BETA Project",
    "id": "beta-project",
    "url": "/concepts/beta-project.html"
  },
  {
    "label": "NPL",
    "id": "npl",
    "url": "/concepts/npl.html"
  },
  {
    "label": "Berkeley DB",
    "id": "berkeleydb",
    "url": "/concepts/berkeleydb.html"
  },
  {
    "label": "ALGOL 58",
    "id": "algol-58",
    "url": "/concepts/algol-58.html"
  },
  {
    "label": "NOP-2",
    "id": "nop-2",
    "url": "/concepts/nop-2.html"
  },
  {
    "label": "ex",
    "id": "ex-editor",
    "url": "/concepts/ex-editor.html"
  },
  {
    "label": "Noodle",
    "id": "noodle",
    "url": "/concepts/noodle.html"
  },
  {
    "label": "BEEF",
    "id": "beef-lang",
    "url": "/concepts/beef-lang.html"
  },
  {
    "label": "NOAH",
    "id": "noah",
    "url": "/concepts/noah.html"
  },
  {
    "label": "NIKL",
    "id": "nikl",
    "url": "/concepts/nikl.html"
  },
  {
    "label": "OBJ",
    "id": "obj",
    "url": "/concepts/obj.html"
  },
  {
    "label": "NFQL",
    "id": "nfql",
    "url": "/concepts/nfql.html"
  },
  {
    "label": "NeuronC",
    "id": "neuronc",
    "url": "/concepts/neuronc.html"
  },
  {
    "label": "Network Control Language",
    "id": "network-control-language",
    "url": "/concepts/network-control-language.html"
  },
  {
    "label": "BASEL",
    "id": "basel",
    "url": "/concepts/basel.html"
  },
  {
    "label": "Netform",
    "id": "netform",
    "url": "/concepts/netform.html"
  },
  {
    "label": "BASEBALL",
    "id": "baseball",
    "url": "/concepts/baseball.html"
  },
  {
    "label": "High-Level Virtual Machine",
    "id": "hlvm",
    "url": "/concepts/hlvm.html"
  },
  {
    "label": "FFmpeg",
    "id": "ffmpeg",
    "url": "/concepts/ffmpeg.html"
  },
  {
    "label": "Barrel",
    "id": "barrel",
    "url": "/concepts/barrel.html"
  },
  {
    "label": "hilbert",
    "id": "hilbert",
    "url": "/concepts/hilbert.html"
  },
  {
    "label": "Ness",
    "id": "ness",
    "url": "/concepts/ness.html"
  },
  {
    "label": "baltazar",
    "id": "baltazar",
    "url": "/concepts/baltazar.html"
  },
  {
    "label": "Nelua",
    "id": "nelua",
    "url": "/concepts/nelua.html"
  },
  {
    "label": "NEATER 2",
    "id": "neater",
    "url": "/concepts/neater.html"
  },
  {
    "label": "BaLinda Lisp",
    "id": "balinda-lisp",
    "url": "/concepts/balinda-lisp.html"
  },
  {
    "label": "NDL",
    "id": "ndl",
    "url": "/concepts/ndl.html"
  },
  {
    "label": "NSS",
    "id": "native-structured-storage",
    "url": "/concepts/native-structured-storage.html"
  },
  {
    "label": "Nassi-Shneiderman charts",
    "id": "nassi-shneiderman-charts",
    "url": "/concepts/nassi-shneiderman-charts.html"
  },
  {
    "label": "BACK",
    "id": "back",
    "url": "/concepts/back.html"
  },
  {
    "label": "NARPL",
    "id": "narpl",
    "url": "/concepts/narpl.html"
  },
  {
    "label": "NAPSS",
    "id": "napss",
    "url": "/concepts/napss.html"
  },
  {
    "label": "habit",
    "id": "habit",
    "url": "/concepts/habit.html"
  },
  {
    "label": "B-LINE",
    "id": "b-line",
    "url": "/concepts/b-line.html"
  },
  {
    "label": "AUTOmatic PROgramming of Machine Tools",
    "id": "autopromt",
    "url": "/concepts/autopromt.html"
  },
  {
    "label": "grain",
    "id": "grain",
    "url": "/concepts/grain.html"
  },
  {
    "label": "MVL",
    "id": "mvl",
    "url": "/concepts/mvl.html"
  },
  {
    "label": "Automator",
    "id": "automator",
    "url": "/concepts/automator.html"
  },
  {
    "label": "MuSimp",
    "id": "musimp",
    "url": "/concepts/musimp.html"
  },
  {
    "label": "AUTOLOFT",
    "id": "autoloft",
    "url": "/concepts/autoloft.html"
  },
  {
    "label": "SymPy",
    "id": "sympy",
    "url": "/concepts/sympy.html"
  },
  {
    "label": "MUNIN",
    "id": "munin",
    "url": "/concepts/munin.html"
  },
  {
    "label": "goby",
    "id": "goby",
    "url": "/concepts/goby.html"
  },
  {
    "label": "MUMS",
    "id": "mums",
    "url": "/concepts/mums.html"
  },
  {
    "label": "Multigame",
    "id": "multigame",
    "url": "/concepts/multigame.html"
  },
  {
    "label": "ZPL",
    "id": "zpl",
    "url": "/concepts/zpl.html"
  },
  {
    "label": "Mul-T",
    "id": "mul-t",
    "url": "/concepts/mul-t.html"
  },
  {
    "label": "mal",
    "id": "mal",
    "url": "/concepts/mal.html"
  },
  {
    "label": "muFP",
    "id": "mufp",
    "url": "/concepts/mufp.html"
  },
  {
    "label": "Aurora",
    "id": "aurora",
    "url": "/concepts/aurora.html"
  },
  {
    "label": "GNU Linear Programming Kit",
    "id": "glpk-lib",
    "url": "/concepts/glpk-lib.html"
  },
  {
    "label": "MSG.84",
    "id": "msg-84",
    "url": "/concepts/msg-84.html"
  },
  {
    "label": "Atomos",
    "id": "atomos",
    "url": "/concepts/atomos.html"
  },
  {
    "label": "MS2",
    "id": "ms2",
    "url": "/concepts/ms2.html"
  },
  {
    "label": "MRDB",
    "id": "mrdb",
    "url": "/concepts/mrdb.html"
  },
  {
    "label": "MPGS",
    "id": "mpgs",
    "url": "/concepts/mpgs.html"
  },
  {
    "label": "Moxie",
    "id": "moxie",
    "url": "/concepts/moxie.html"
  },
  {
    "label": "ASPOL",
    "id": "aspol",
    "url": "/concepts/aspol.html"
  },
  {
    "label": "MOUSE4",
    "id": "mouse4",
    "url": "/concepts/mouse4.html"
  },
  {
    "label": "MORPHISM",
    "id": "morphism",
    "url": "/concepts/morphism.html"
  },
  {
    "label": "ASHMEDAI",
    "id": "ashmedai",
    "url": "/concepts/ashmedai.html"
  },
  {
    "label": "Kakoune",
    "id": "kakoune-editor",
    "url": "/concepts/kakoune-editor.html"
  },
  {
    "label": "fox",
    "id": "fox",
    "url": "/concepts/fox.html"
  },
  {
    "label": "Eclipse",
    "id": "eclipse-editor",
    "url": "/concepts/eclipse-editor.html"
  },
  {
    "label": "Molog",
    "id": "molog",
    "url": "/concepts/molog.html"
  },
  {
    "label": "ARTSPEAK",
    "id": "artspeak",
    "url": "/concepts/artspeak.html"
  },
  {
    "label": "forthnet-pm",
    "id": "forthnet-pm",
    "url": "/concepts/forthnet-pm.html"
  },
  {
    "label": "ForgeBox",
    "id": "forgebox-pm",
    "url": "/concepts/forgebox-pm.html"
  },
  {
    "label": "binaryen",
    "id": "binaryen",
    "url": "/concepts/binaryen.html"
  },
  {
    "label": "fmj",
    "id": "fmj",
    "url": "/concepts/fmj.html"
  },
  {
    "label": "Modular Prolog",
    "id": "modular-prolog",
    "url": "/concepts/modular-prolog.html"
  },
  {
    "label": "Modula/R",
    "id": "modula-r",
    "url": "/concepts/modula-r.html"
  },
  {
    "label": "Modula-P",
    "id": "modula-p",
    "url": "/concepts/modula-p.html"
  },
  {
    "label": "Flare",
    "id": "flare",
    "url": "/concepts/flare.html"
  },
  {
    "label": "Argos",
    "id": "argos",
    "url": "/concepts/argos.html"
  },
  {
    "label": "MODSIM III",
    "id": "modsim-iii",
    "url": "/concepts/modsim-iii.html"
  },
  {
    "label": "MODLISP",
    "id": "modlisp",
    "url": "/concepts/modlisp.html"
  },
  {
    "label": "Arctic",
    "id": "arctic",
    "url": "/concepts/arctic.html"
  },
  {
    "label": "SDF",
    "id": "sdf",
    "url": "/concepts/sdf.html"
  },
  {
    "label": "Extempore",
    "id": "extempore",
    "url": "/concepts/extempore.html"
  },
  {
    "label": "MODCAP",
    "id": "modcap",
    "url": "/concepts/modcap.html"
  },
  {
    "label": "Executable JSON",
    "id": "executable-json",
    "url": "/concepts/executable-json.html"
  },
  {
    "label": "MarkovJunior",
    "id": "markovjunior",
    "url": "/concepts/markovjunior.html"
  },
  {
    "label": "MOBL",
    "id": "mobl",
    "url": "/concepts/mobl.html"
  },
  {
    "label": "eta",
    "id": "eta",
    "url": "/concepts/eta.html"
  },
  {
    "label": "mmsearch",
    "id": "mmsearch",
    "url": "/concepts/mmsearch.html"
  },
  {
    "label": "RPG III",
    "id": "rpg-iii",
    "url": "/concepts/rpg-iii.html"
  },
  {
    "label": "MLISP2",
    "id": "mlisp2",
    "url": "/concepts/mlisp2.html"
  },
  {
    "label": "Mizar",
    "id": "mizar",
    "url": "/concepts/mizar.html"
  },
  {
    "label": "MIRFAC",
    "id": "mirfac",
    "url": "/concepts/mirfac.html"
  },
  {
    "label": "Miranim",
    "id": "miranim",
    "url": "/concepts/miranim.html"
  },
  {
    "label": "MIRAGER",
    "id": "mirager",
    "url": "/concepts/mirager.html"
  },
  {
    "label": "empirical",
    "id": "empirical",
    "url": "/concepts/empirical.html"
  },
  {
    "label": "New Technology File System",
    "id": "ntfs",
    "url": "/concepts/ntfs.html"
  },
  {
    "label": "MINOPT",
    "id": "minopt",
    "url": "/concepts/minopt.html"
  },
  {
    "label": "emfatic",
    "id": "emfatic",
    "url": "/concepts/emfatic.html"
  },
  {
    "label": "MINIVITAL",
    "id": "minivital",
    "url": "/concepts/minivital.html"
  },
  {
    "label": "MINION",
    "id": "minion",
    "url": "/concepts/minion.html"
  },
  {
    "label": "Elm Packages",
    "id": "elm-packages-pm",
    "url": "/concepts/elm-packages-pm.html"
  },
  {
    "label": "Mini-ML",
    "id": "mini-ml",
    "url": "/concepts/mini-ml.html"
  },
  {
    "label": "MiKe",
    "id": "mike",
    "url": "/concepts/mike.html"
  },
  {
    "label": "Prolog++",
    "id": "prologpp",
    "url": "/concepts/prologpp.html"
  },
  {
    "label": "verona",
    "id": "verona",
    "url": "/concepts/verona.html"
  },
  {
    "label": "microTAL",
    "id": "microtal",
    "url": "/concepts/microtal.html"
  },
  {
    "label": "APL2",
    "id": "apl2",
    "url": "/concepts/apl2.html"
  },
  {
    "label": "Dimensional Script",
    "id": "dscript",
    "url": "/concepts/dscript.html"
  },
  {
    "label": "xlwings-editor",
    "id": "xlwings-editor",
    "url": "/concepts/xlwings-editor.html"
  },
  {
    "label": "Sublime Text",
    "id": "sublime-editor",
    "url": "/concepts/sublime-editor.html"
  },
  {
    "label": "Microsoft Equation Editor",
    "id": "microsoft-equation-editor",
    "url": "/concepts/microsoft-equation-editor.html"
  },
  {
    "label": "APL/HP",
    "id": "apl-hp",
    "url": "/concepts/apl-hp.html"
  },
  {
    "label": "Programming Language for the University of Maryland",
    "id": "plum",
    "url": "/concepts/plum.html"
  },
  {
    "label": "MICRODARE",
    "id": "microdare",
    "url": "/concepts/microdare.html"
  },
  {
    "label": "APACHE",
    "id": "apache",
    "url": "/concepts/apache.html"
  },
  {
    "label": "dfns",
    "id": "dfns",
    "url": "/concepts/dfns.html"
  },
  {
    "label": "Micro-flowcharts",
    "id": "micro-flowcharts",
    "url": "/concepts/micro-flowcharts.html"
  },
  {
    "label": "Devicetree",
    "id": "devicetree",
    "url": "/concepts/devicetree.html"
  },
  {
    "label": "Wavefront Object",
    "id": "wavefront-object",
    "url": "/concepts/wavefront-object.html"
  },
  {
    "label": "Notepad++",
    "id": "notepad-plus-plus-editor",
    "url": "/concepts/notepad-plus-plus-editor.html"
  },
  {
    "label": "METATEM",
    "id": "metatem",
    "url": "/concepts/metatem.html"
  },
  {
    "label": "METASIM",
    "id": "metasim",
    "url": "/concepts/metasim.html"
  },
  {
    "label": "WebGL",
    "id": "webgl",
    "url": "/concepts/webgl.html"
  },
  {
    "label": "METAPI",
    "id": "metapi",
    "url": "/concepts/metapi.html"
  },
  {
    "label": "COMTRAN",
    "id": "comtran",
    "url": "/concepts/comtran.html"
  },
  {
    "label": "MetaML",
    "id": "metaml",
    "url": "/concepts/metaml.html"
  },
  {
    "label": "dart-pm",
    "id": "dart-pm",
    "url": "/concepts/dart-pm.html"
  },
  {
    "label": "Gopher",
    "id": "gopher-protocol",
    "url": "/concepts/gopher-protocol.html"
  },
  {
    "label": "darklang",
    "id": "darklang",
    "url": "/concepts/darklang.html"
  },
  {
    "label": "Qualcomm Hexagon",
    "id": "hexagon",
    "url": "/concepts/hexagon.html"
  },
  {
    "label": "META/LISP",
    "id": "meta-lisp",
    "url": "/concepts/meta-lisp.html"
  },
  {
    "label": "Meta-Assembler",
    "id": "meta-assembler",
    "url": "/concepts/meta-assembler.html"
  },
  {
    "label": "ctr",
    "id": "ctr",
    "url": "/concepts/ctr.html"
  },
  {
    "label": "Namespace Routing Language",
    "id": "nrl",
    "url": "/concepts/nrl.html"
  },
  {
    "label": "Advanced Message Queuing Protocol",
    "id": "amqp",
    "url": "/concepts/amqp.html"
  },
  {
    "label": "Meroon",
    "id": "meroon",
    "url": "/concepts/meroon.html"
  },
  {
    "label": "Hedy",
    "id": "hedy",
    "url": "/concepts/hedy.html"
  },
  {
    "label": "asterius-compiler",
    "id": "asterius-compiler",
    "url": "/concepts/asterius-compiler.html"
  },
  {
    "label": "FASTQ",
    "id": "fastq-format",
    "url": "/concepts/fastq-format.html"
  },
  {
    "label": "Ext4",
    "id": "ext4",
    "url": "/concepts/ext4.html"
  },
  {
    "label": "Mercury Programming System",
    "id": "mercury-programming-system",
    "url": "/concepts/mercury-programming-system.html"
  },
  {
    "label": "tiledb",
    "id": "tiledb",
    "url": "/concepts/tiledb.html"
  },
  {
    "label": "Xgboost",
    "id": "xgboost-model",
    "url": "/concepts/xgboost-model.html"
  },
  {
    "label": "Megalog",
    "id": "megalog",
    "url": "/concepts/megalog.html"
  },
  {
    "label": "Wolfram Mathematica",
    "id": "mathematica-editor",
    "url": "/concepts/mathematica-editor.html"
  },
  {
    "label": "MEDIC",
    "id": "medic",
    "url": "/concepts/medic.html"
  },
  {
    "label": "DNS Zone",
    "id": "zone",
    "url": "/concepts/zone.html"
  },
  {
    "label": "Macintosh Common Lisp",
    "id": "macintosh-common-lisp",
    "url": "/concepts/macintosh-common-lisp.html"
  },
  {
    "label": "Mercurial",
    "id": "mercurial",
    "url": "/concepts/mercurial.html"
  },
  {
    "label": "MCOBOL",
    "id": "mcobol",
    "url": "/concepts/mcobol.html"
  },
  {
    "label": "converge",
    "id": "converge",
    "url": "/concepts/converge.html"
  },
  {
    "label": "Conan Center",
    "id": "conan-center-pm",
    "url": "/concepts/conan-center-pm.html"
  },
  {
    "label": "Spyder",
    "id": "spyder-editor",
    "url": "/concepts/spyder-editor.html"
  },
  {
    "label": "Microsoft BASIC",
    "id": "microsoft-basic",
    "url": "/concepts/microsoft-basic.html"
  },
  {
    "label": "Typed Lua",
    "id": "tl",
    "url": "/concepts/tl.html"
  },
  {
    "label": "harlan",
    "id": "harlan",
    "url": "/concepts/harlan.html"
  },
  {
    "label": "atomspace",
    "id": "atomspace",
    "url": "/concepts/atomspace.html"
  },
  {
    "label": "MATRIX PASCAL",
    "id": "matrix-pascal",
    "url": "/concepts/matrix-pascal.html"
  },
  {
    "label": "Kyma",
    "id": "kyma",
    "url": "/concepts/kyma.html"
  },
  {
    "label": "cityhash-hash-function",
    "id": "cityhash-hash-function",
    "url": "/concepts/cityhash-hash-function.html"
  },
  {
    "label": "Mathsy",
    "id": "mathsy",
    "url": "/concepts/mathsy.html"
  },
  {
    "label": "ALPAK",
    "id": "alpak",
    "url": "/concepts/alpak.html"
  },
  {
    "label": "MASIM",
    "id": "masim",
    "url": "/concepts/masim.html"
  },
  {
    "label": "Mary/2",
    "id": "mary-2",
    "url": "/concepts/mary-2.html"
  },
  {
    "label": "Cobol.NET",
    "id": "cobol-net",
    "url": "/concepts/cobol-net.html"
  },
  {
    "label": "Pyret",
    "id": "pyret-lang",
    "url": "/concepts/pyret-lang.html"
  },
  {
    "label": "Marlais",
    "id": "marlais",
    "url": "/concepts/marlais.html"
  },
  {
    "label": "cleanlang",
    "id": "cleanlang",
    "url": "/concepts/cleanlang.html"
  },
  {
    "label": "TI MSP430",
    "id": "msp430",
    "url": "/concepts/msp430.html"
  },
  {
    "label": "Confluence",
    "id": "confluence",
    "url": "/concepts/confluence.html"
  },
  {
    "label": "SATySFi",
    "id": "satysfi",
    "url": "/concepts/satysfi.html"
  },
  {
    "label": "Swagger",
    "id": "swagger",
    "url": "/concepts/swagger.html"
  },
  {
    "label": "Iota-and-jot",
    "id": "iota-and-jot",
    "url": "/concepts/iota-and-jot.html"
  },
  {
    "label": "MAP",
    "id": "map",
    "url": "/concepts/map.html"
  },
  {
    "label": "firrtl",
    "id": "firrtl",
    "url": "/concepts/firrtl.html"
  },
  {
    "label": "ManuScript",
    "id": "manuscript",
    "url": "/concepts/manuscript.html"
  },
  {
    "label": "chocolatey-pm",
    "id": "chocolatey-pm",
    "url": "/concepts/chocolatey-pm.html"
  },
  {
    "label": "manticore",
    "id": "manticore",
    "url": "/concepts/manticore.html"
  },
  {
    "label": "XCompose",
    "id": "xcompose",
    "url": "/concepts/xcompose.html"
  },
  {
    "label": "TSV",
    "id": "tsv",
    "url": "/concepts/tsv.html"
  },
  {
    "label": "MALUS",
    "id": "malus",
    "url": "/concepts/malus.html"
  },
  {
    "label": "X Font Directory Index",
    "id": "x-font-directory-index",
    "url": "/concepts/x-font-directory-index.html"
  },
  {
    "label": "Jelly",
    "id": "jelly",
    "url": "/concepts/jelly.html"
  },
  {
    "label": "fe",
    "id": "fe",
    "url": "/concepts/fe.html"
  },
  {
    "label": "magritte",
    "id": "magritte",
    "url": "/concepts/magritte.html"
  },
  {
    "label": "World of Warcraft Addon Data",
    "id": "world-of-warcraft-addon-data",
    "url": "/concepts/world-of-warcraft-addon-data.html"
  },
  {
    "label": "Magma2",
    "id": "magma2",
    "url": "/concepts/magma2.html"
  },
  {
    "label": "chartio-app",
    "id": "chartio-app",
    "url": "/concepts/chartio-app.html"
  },
  {
    "label": "multicodec",
    "id": "multicodec",
    "url": "/concepts/multicodec.html"
  },
  {
    "label": "LINQ",
    "id": "linq",
    "url": "/concepts/linq.html"
  },
  {
    "label": "charly",
    "id": "charly",
    "url": "/concepts/charly.html"
  },
  {
    "label": "Wavefront Material",
    "id": "wavefront-material",
    "url": "/concepts/wavefront-material.html"
  },
  {
    "label": "Microdata HTML",
    "id": "microdata",
    "url": "/concepts/microdata.html"
  },
  {
    "label": "SysML",
    "id": "sysml",
    "url": "/concepts/sysml.html"
  },
  {
    "label": "Asm.js",
    "id": "asmjs",
    "url": "/concepts/asmjs.html"
  },
  {
    "label": "raptorjit",
    "id": "raptorjit",
    "url": "/concepts/raptorjit.html"
  },
  {
    "label": "humanhash-hash-function",
    "id": "humanhash-hash-function",
    "url": "/concepts/humanhash-hash-function.html"
  },
  {
    "label": "MXF",
    "id": "material-exchange-format",
    "url": "/concepts/material-exchange-format.html"
  },
  {
    "label": "TiddlyWiki",
    "id": "tiddlywiki",
    "url": "/concepts/tiddlywiki.html"
  },
  {
    "label": "Jank",
    "id": "jank",
    "url": "/concepts/jank.html"
  },
  {
    "label": "Macro SPITBOL",
    "id": "macro-spitbol",
    "url": "/concepts/macro-spitbol.html"
  },
  {
    "label": "calc_var",
    "id": "calc-var",
    "url": "/concepts/calc-var.html"
  },
  {
    "label": "CHIP-8",
    "id": "chip-8",
    "url": "/concepts/chip-8.html"
  },
  {
    "label": "Ext2",
    "id": "ext2",
    "url": "/concepts/ext2.html"
  },
  {
    "label": "Machiavelli",
    "id": "machiavelli",
    "url": "/concepts/machiavelli.html"
  },
  {
    "label": "c-talk",
    "id": "c-talk",
    "url": "/concepts/c-talk.html"
  },
  {
    "label": "SubRip Text",
    "id": "subrip-text",
    "url": "/concepts/subrip-text.html"
  },
  {
    "label": "Geography Markup Language",
    "id": "geo-ml",
    "url": "/concepts/geo-ml.html"
  },
  {
    "label": "Microsoft Macro Assembler",
    "id": "microsoft-macro-assembler",
    "url": "/concepts/microsoft-macro-assembler.html"
  },
  {
    "label": "MACE",
    "id": "mace",
    "url": "/concepts/mace.html"
  },
  {
    "label": "c-smile",
    "id": "c-smile",
    "url": "/concepts/c-smile.html"
  },
  {
    "label": "QuickBASIC",
    "id": "quickbasic",
    "url": "/concepts/quickbasic.html"
  },
  {
    "label": "MacAims",
    "id": "macaims",
    "url": "/concepts/macaims.html"
  },
  {
    "label": "N-Triples",
    "id": "n-triples",
    "url": "/concepts/n-triples.html"
  },
  {
    "label": "httplang",
    "id": "httplang",
    "url": "/concepts/httplang.html"
  },
  {
    "label": "Pick operating system",
    "id": "pick-operating-system",
    "url": "/concepts/pick-operating-system.html"
  },
  {
    "label": "M-LISP",
    "id": "m-lisp",
    "url": "/concepts/m-lisp.html"
  },
  {
    "label": "International System of Quantities",
    "id": "isq",
    "url": "/concepts/isq.html"
  },
  {
    "label": "topshell",
    "id": "topshell",
    "url": "/concepts/topshell.html"
  },
  {
    "label": "Hierarchical File System",
    "id": "hfs",
    "url": "/concepts/hfs.html"
  },
  {
    "label": "SQL-92",
    "id": "sql-92",
    "url": "/concepts/sql-92.html"
  },
  {
    "label": "Geany",
    "id": "geany-editor",
    "url": "/concepts/geany-editor.html"
  },
  {
    "label": "Lucinda",
    "id": "lucinda",
    "url": "/concepts/lucinda.html"
  },
  {
    "label": "General Activity Simulation Program",
    "id": "gasp",
    "url": "/concepts/gasp.html"
  },
  {
    "label": "stoneknifeforth",
    "id": "stoneknifeforth",
    "url": "/concepts/stoneknifeforth.html"
  },
  {
    "label": "Motif",
    "id": "motif-software",
    "url": "/concepts/motif-software.html"
  },
  {
    "label": "bamboo",
    "id": "bamboo",
    "url": "/concepts/bamboo.html"
  },
  {
    "label": "jsparagus",
    "id": "jsparagus",
    "url": "/concepts/jsparagus.html"
  },
  {
    "label": "Go!",
    "id": "go-bang",
    "url": "/concepts/go-bang.html"
  },
  {
    "label": "LRLTRAN",
    "id": "lrltran",
    "url": "/concepts/lrltran.html"
  },
  {
    "label": "FLANG",
    "id": "flang",
    "url": "/concepts/flang.html"
  },
  {
    "label": "RustScript",
    "id": "rustscript",
    "url": "/concepts/rustscript.html"
  },
  {
    "label": "TTM",
    "id": "ttm",
    "url": "/concepts/ttm.html"
  },
  {
    "label": "Extended file system",
    "id": "ext",
    "url": "/concepts/ext.html"
  },
  {
    "label": "LPL",
    "id": "lpl",
    "url": "/concepts/lpl.html"
  },
  {
    "label": "Connection Machine",
    "id": "connection-machine",
    "url": "/concepts/connection-machine.html"
  },
  {
    "label": "LOTOS",
    "id": "lotos",
    "url": "/concepts/lotos.html"
  },
  {
    "label": "LOTIS",
    "id": "lotis",
    "url": "/concepts/lotis.html"
  },
  {
    "label": "BrightScript",
    "id": "brightscript-lang",
    "url": "/concepts/brightscript-lang.html"
  },
  {
    "label": "FCL",
    "id": "fcl",
    "url": "/concepts/fcl.html"
  },
  {
    "label": "ZOPL",
    "id": "zopl",
    "url": "/concepts/zopl.html"
  },
  {
    "label": "Z",
    "id": "z",
    "url": "/concepts/z.html"
  },
  {
    "label": "Newick format",
    "id": "newick-format",
    "url": "/concepts/newick-format.html"
  },
  {
    "label": "Common Object File Format",
    "id": "coff",
    "url": "/concepts/coff.html"
  },
  {
    "label": "PACT I",
    "id": "pact-i",
    "url": "/concepts/pact-i.html"
  },
  {
    "label": "SAM76",
    "id": "sam76",
    "url": "/concepts/sam76.html"
  },
  {
    "label": "MessagePack",
    "id": "messagepack",
    "url": "/concepts/messagepack.html"
  },
  {
    "label": "RTL/2",
    "id": "rtl-2",
    "url": "/concepts/rtl-2.html"
  },
  {
    "label": "UCSD Pascal",
    "id": "ucsd-pascal",
    "url": "/concepts/ucsd-pascal.html"
  },
  {
    "label": "pipelines",
    "id": "pipelines",
    "url": "/concepts/pipelines.html"
  },
  {
    "label": "ADAM",
    "id": "adam",
    "url": "/concepts/adam.html"
  },
  {
    "label": "Blueprints",
    "id": "blueprints",
    "url": "/concepts/blueprints.html"
  },
  {
    "label": "PowerLanguage",
    "id": "powerlanguage",
    "url": "/concepts/powerlanguage.html"
  },
  {
    "label": "PL/C",
    "id": "pl-c",
    "url": "/concepts/pl-c.html"
  },
  {
    "label": "KUKA Robot Language",
    "id": "kuka",
    "url": "/concepts/kuka.html"
  },
  {
    "label": "fructure-editor",
    "id": "fructure-editor",
    "url": "/concepts/fructure-editor.html"
  },
  {
    "label": "Portal langage",
    "id": "portal-langage",
    "url": "/concepts/portal-langage.html"
  },
  {
    "label": "Namespace-based Validation Dispatching Language",
    "id": "nvdl",
    "url": "/concepts/nvdl.html"
  },
  {
    "label": "JRuby",
    "id": "jruby",
    "url": "/concepts/jruby.html"
  },
  {
    "label": "Z-machine",
    "id": "z-machine",
    "url": "/concepts/z-machine.html"
  },
  {
    "label": "Atmel AVR instruction set",
    "id": "avr",
    "url": "/concepts/avr.html"
  },
  {
    "label": "Lola-2",
    "id": "lola-2",
    "url": "/concepts/lola-2.html"
  },
  {
    "label": "Nord Programming Language",
    "id": "nord",
    "url": "/concepts/nord.html"
  },
  {
    "label": "SdlBasic",
    "id": "sdlbasic",
    "url": "/concepts/sdlbasic.html"
  },
  {
    "label": "MHEG-5",
    "id": "mheg-5",
    "url": "/concepts/mheg-5.html"
  },
  {
    "label": "MLAB",
    "id": "mlab",
    "url": "/concepts/mlab.html"
  },
  {
    "label": "DDA",
    "id": "dda",
    "url": "/concepts/dda.html"
  },
  {
    "label": "Kuin",
    "id": "kuin",
    "url": "/concepts/kuin.html"
  },
  {
    "label": "DATABUS",
    "id": "databus",
    "url": "/concepts/databus.html"
  },
  {
    "label": "Kuroko",
    "id": "kuroko",
    "url": "/concepts/kuroko.html"
  },
  {
    "label": "NATURAL",
    "id": "natural",
    "url": "/concepts/natural.html"
  },
  {
    "label": "tampio",
    "id": "tampio",
    "url": "/concepts/tampio.html"
  },
  {
    "label": "Hotdog",
    "id": "hotdog",
    "url": "/concepts/hotdog.html"
  },
  {
    "label": "Pro*C",
    "id": "pro-star-c",
    "url": "/concepts/pro-star-c.html"
  },
  {
    "label": "yeti",
    "id": "yeti",
    "url": "/concepts/yeti.html"
  },
  {
    "label": "Compiler-Compiler",
    "id": "compiler-compiler",
    "url": "/concepts/compiler-compiler.html"
  },
  {
    "label": ".QL",
    "id": "dot-ql",
    "url": "/concepts/dot-ql.html"
  },
  {
    "label": "LogScheme",
    "id": "logscheme",
    "url": "/concepts/logscheme.html"
  },
  {
    "label": "Split-C",
    "id": "split-c",
    "url": "/concepts/split-c.html"
  },
  {
    "label": "Assembly CLI",
    "id": "cli-assembly",
    "url": "/concepts/cli-assembly.html"
  },
  {
    "label": "MyBB",
    "id": "mybb",
    "url": "/concepts/mybb.html"
  },
  {
    "label": "General feature format",
    "id": "gff-format",
    "url": "/concepts/gff-format.html"
  },
  {
    "label": "BEAM Erlang virtual machine",
    "id": "beam-vm",
    "url": "/concepts/beam-vm.html"
  },
  {
    "label": "Logres",
    "id": "logres",
    "url": "/concepts/logres.html"
  },
  {
    "label": "MakeDoc",
    "id": "makedoc",
    "url": "/concepts/makedoc.html"
  },
  {
    "label": "PALcode",
    "id": "palcode",
    "url": "/concepts/palcode.html"
  },
  {
    "label": "Obliq",
    "id": "obliq",
    "url": "/concepts/obliq.html"
  },
  {
    "label": "SISC",
    "id": "sisc",
    "url": "/concepts/sisc.html"
  },
  {
    "label": "Meta Expressions",
    "id": "m-expressions",
    "url": "/concepts/m-expressions.html"
  },
  {
    "label": "RASP",
    "id": "rasp",
    "url": "/concepts/rasp.html"
  },
  {
    "label": "Secure Operations Language",
    "id": "secure-operations-language",
    "url": "/concepts/secure-operations-language.html"
  },
  {
    "label": "hr-code",
    "id": "hr-code",
    "url": "/concepts/hr-code.html"
  },
  {
    "label": "De Bruijn index",
    "id": "de-bruijn-index-notation",
    "url": "/concepts/de-bruijn-index-notation.html"
  },
  {
    "label": "Dendral",
    "id": "dendral",
    "url": "/concepts/dendral.html"
  },
  {
    "label": "o:XML",
    "id": "o-xml",
    "url": "/concepts/o-xml.html"
  },
  {
    "label": "SCM",
    "id": "scm",
    "url": "/concepts/scm.html"
  },
  {
    "label": "Dink Smallwood",
    "id": "dinkc",
    "url": "/concepts/dinkc.html"
  },
  {
    "label": "BML",
    "id": "behavior-markup-language",
    "url": "/concepts/behavior-markup-language.html"
  },
  {
    "label": "M2001",
    "id": "m2001",
    "url": "/concepts/m2001.html"
  },
  {
    "label": "QUTE",
    "id": "qute",
    "url": "/concepts/qute.html"
  },
  {
    "label": "O-Matrix",
    "id": "o-matrix",
    "url": "/concepts/o-matrix.html"
  },
  {
    "label": "MapBasic",
    "id": "mapbasic",
    "url": "/concepts/mapbasic.html"
  },
  {
    "label": "Turbo Basic",
    "id": "turbo-basic",
    "url": "/concepts/turbo-basic.html"
  },
  {
    "label": "LOGIST",
    "id": "logist",
    "url": "/concepts/logist.html"
  },
  {
    "label": "beautiful-report-language",
    "id": "beautiful-report-language",
    "url": "/concepts/beautiful-report-language.html"
  },
  {
    "label": "Moescript",
    "id": "moescript",
    "url": "/concepts/moescript.html"
  },
  {
    "label": "ProSet",
    "id": "proset",
    "url": "/concepts/proset.html"
  },
  {
    "label": "IPTSCRAE",
    "id": "iptscrae",
    "url": "/concepts/iptscrae.html"
  },
  {
    "label": "Lithe",
    "id": "lithe",
    "url": "/concepts/lithe.html"
  },
  {
    "label": "PL-11",
    "id": "pl-11",
    "url": "/concepts/pl-11.html"
  },
  {
    "label": "Lynx",
    "id": "lynx",
    "url": "/concepts/lynx.html"
  },
  {
    "label": "Stalin",
    "id": "stalin",
    "url": "/concepts/stalin.html"
  },
  {
    "label": "elymas",
    "id": "elymas",
    "url": "/concepts/elymas.html"
  },
  {
    "label": "Knowledge Query and Manipulation Language",
    "id": "kqml",
    "url": "/concepts/kqml.html"
  },
  {
    "label": "PowerHouse",
    "id": "powerhouse-programming-language",
    "url": "/concepts/powerhouse-programming-language.html"
  },
  {
    "label": "Logicon",
    "id": "logicon",
    "url": "/concepts/logicon.html"
  },
  {
    "label": "Lagoona",
    "id": "lagoona",
    "url": "/concepts/lagoona.html"
  },
  {
    "label": "LISP 2",
    "id": "lisp-2",
    "url": "/concepts/lisp-2.html"
  },
  {
    "label": "SASL",
    "id": "sasl-programming-language",
    "url": "/concepts/sasl-programming-language.html"
  },
  {
    "label": "mlpolyr",
    "id": "mlpolyr",
    "url": "/concepts/mlpolyr.html"
  },
  {
    "label": "Kid templating language",
    "id": "kid",
    "url": "/concepts/kid.html"
  },
  {
    "label": "ObjectLOGO",
    "id": "objectlogo",
    "url": "/concepts/objectlogo.html"
  },
  {
    "label": "Information Algebra",
    "id": "information-algebra",
    "url": "/concepts/information-algebra.html"
  },
  {
    "label": "XPL",
    "id": "xpl",
    "url": "/concepts/xpl.html"
  },
  {
    "label": "LOCS",
    "id": "locs",
    "url": "/concepts/locs.html"
  },
  {
    "label": "B3 IR",
    "id": "b3-ir",
    "url": "/concepts/b3-ir.html"
  },
  {
    "label": "Marmot",
    "id": "marmot",
    "url": "/concepts/marmot.html"
  },
  {
    "label": "Kaleidoscope",
    "id": "kaleidoscope",
    "url": "/concepts/kaleidoscope.html"
  },
  {
    "label": "IMP",
    "id": "imp",
    "url": "/concepts/imp.html"
  },
  {
    "label": "ΛProlog",
    "id": "lambda-prolog",
    "url": "/concepts/lambda-prolog.html"
  },
  {
    "label": "RuleML",
    "id": "ruleml",
    "url": "/concepts/ruleml.html"
  },
  {
    "label": "T",
    "id": "t",
    "url": "/concepts/t.html"
  },
  {
    "label": "Hook",
    "id": "hook",
    "url": "/concepts/hook.html"
  },
  {
    "label": "KonsolScript",
    "id": "konsolscript",
    "url": "/concepts/konsolscript.html"
  },
  {
    "label": "Extended ML",
    "id": "extended-ml",
    "url": "/concepts/extended-ml.html"
  },
  {
    "label": "FX-87",
    "id": "fx-87",
    "url": "/concepts/fx-87.html"
  },
  {
    "label": "MetaComCo",
    "id": "metacomco",
    "url": "/concepts/metacomco.html"
  },
  {
    "label": "HP BASIC for OpenVMS",
    "id": "hp-basic-for-openvms",
    "url": "/concepts/hp-basic-for-openvms.html"
  },
  {
    "label": "S/SL",
    "id": "s-sl",
    "url": "/concepts/s-sl.html"
  },
  {
    "label": "POP-2",
    "id": "pop-2",
    "url": "/concepts/pop-2.html"
  },
  {
    "label": "Sweave",
    "id": "sweave",
    "url": "/concepts/sweave.html"
  },
  {
    "label": "Augment",
    "id": "augment",
    "url": "/concepts/augment.html"
  },
  {
    "label": "LYaPAS",
    "id": "lyapas",
    "url": "/concepts/lyapas.html"
  },
  {
    "label": "EUMEL",
    "id": "eumel",
    "url": "/concepts/eumel.html"
  },
  {
    "label": "ELLA",
    "id": "ella-programming-language",
    "url": "/concepts/ella-programming-language.html"
  },
  {
    "label": "MIMIC",
    "id": "mimic",
    "url": "/concepts/mimic.html"
  },
  {
    "label": "Text Executive Programming Language",
    "id": "text-executive-programming-language",
    "url": "/concepts/text-executive-programming-language.html"
  },
  {
    "label": "Tosh",
    "id": "tosh",
    "url": "/concepts/tosh.html"
  },
  {
    "label": "JMAP",
    "id": "jmap",
    "url": "/concepts/jmap.html"
  },
  {
    "label": "Datapoint's Advanced Systems Language",
    "id": "datapoint-dasl",
    "url": "/concepts/datapoint-dasl.html"
  },
  {
    "label": "Extensible Embeddable Language",
    "id": "extensible-embeddable-language",
    "url": "/concepts/extensible-embeddable-language.html"
  },
  {
    "label": "Laning and Zierler system",
    "id": "laning-and-zierler-system",
    "url": "/concepts/laning-and-zierler-system.html"
  },
  {
    "label": "TASM",
    "id": "tasm",
    "url": "/concepts/tasm.html"
  },
  {
    "label": "Nomad software",
    "id": "nomad-software",
    "url": "/concepts/nomad-software.html"
  },
  {
    "label": "Adobe Font Metrics",
    "id": "adobe-font-metrics",
    "url": "/concepts/adobe-font-metrics.html"
  },
  {
    "label": "ACCENT",
    "id": "accent",
    "url": "/concepts/accent.html"
  },
  {
    "label": "GHC",
    "id": "ghc",
    "url": "/concepts/ghc.html"
  },
  {
    "label": "Creative Basic",
    "id": "creative-basic",
    "url": "/concepts/creative-basic.html"
  },
  {
    "label": "CYBIL",
    "id": "cybil",
    "url": "/concepts/cybil.html"
  },
  {
    "label": "KL0",
    "id": "kl0",
    "url": "/concepts/kl0.html"
  },
  {
    "label": "D4",
    "id": "d4-programming-language",
    "url": "/concepts/d4-programming-language.html"
  },
  {
    "label": "Knowledge Interchange Format",
    "id": "knowledge-interchange-format",
    "url": "/concepts/knowledge-interchange-format.html"
  },
  {
    "label": "Newsqueak",
    "id": "newsqueak",
    "url": "/concepts/newsqueak.html"
  },
  {
    "label": "AspectC++",
    "id": "aspectcpp",
    "url": "/concepts/aspectcpp.html"
  },
  {
    "label": "RoyalScript",
    "id": "royalscript",
    "url": "/concepts/royalscript.html"
  },
  {
    "label": "Concurrent METATEM",
    "id": "concurrent-metatem",
    "url": "/concepts/concurrent-metatem.html"
  },
  {
    "label": "CommonLoops",
    "id": "commonloops",
    "url": "/concepts/commonloops.html"
  },
  {
    "label": "DDML",
    "id": "ddml",
    "url": "/concepts/ddml.html"
  },
  {
    "label": "COWSEL",
    "id": "cowsel",
    "url": "/concepts/cowsel.html"
  },
  {
    "label": "GARP",
    "id": "garp",
    "url": "/concepts/garp.html"
  },
  {
    "label": "Lisp Machine Lisp",
    "id": "lisp-machine-lisp",
    "url": "/concepts/lisp-machine-lisp.html"
  },
  {
    "label": "Scratchpad",
    "id": "scratchpad",
    "url": "/concepts/scratchpad.html"
  },
  {
    "label": "Small-C",
    "id": "small-c",
    "url": "/concepts/small-c.html"
  },
  {
    "label": "LISP A",
    "id": "lisp-a",
    "url": "/concepts/lisp-a.html"
  },
  {
    "label": "CLX",
    "id": "clx",
    "url": "/concepts/clx.html"
  },
  {
    "label": "IBM HAScript",
    "id": "hascript",
    "url": "/concepts/hascript.html"
  },
  {
    "label": "Edinburgh IMP",
    "id": "edinburgh-imp",
    "url": "/concepts/edinburgh-imp.html"
  },
  {
    "label": "Flex language",
    "id": "flex-lang",
    "url": "/concepts/flex-lang.html"
  },
  {
    "label": "MDL",
    "id": "mdl",
    "url": "/concepts/mdl.html"
  },
  {
    "label": "Linden Scripting Language",
    "id": "linden-scripting-language",
    "url": "/concepts/linden-scripting-language.html"
  },
  {
    "label": "Game Oriented Assembly Lisp",
    "id": "game-oriented-assembly-lisp",
    "url": "/concepts/game-oriented-assembly-lisp.html"
  },
  {
    "label": "ABLE",
    "id": "able",
    "url": "/concepts/able.html"
  },
  {
    "label": "CMS Pipelines",
    "id": "cms-pipelines",
    "url": "/concepts/cms-pipelines.html"
  },
  {
    "label": "Caltech Intermediate Form",
    "id": "caltech-intermediate-form",
    "url": "/concepts/caltech-intermediate-form.html"
  },
  {
    "label": "GameMonkey Script",
    "id": "gamemonkey-script",
    "url": "/concepts/gamemonkey-script.html"
  },
  {
    "label": "INFER",
    "id": "infer",
    "url": "/concepts/infer.html"
  },
  {
    "label": "Liberty BASIC",
    "id": "liberty-basic",
    "url": "/concepts/liberty-basic.html"
  },
  {
    "label": "OGNL",
    "id": "ognl",
    "url": "/concepts/ognl.html"
  },
  {
    "label": "LiSEB",
    "id": "liseb",
    "url": "/concepts/liseb.html"
  },
  {
    "label": "Cambridge Algebra System",
    "id": "camal",
    "url": "/concepts/camal.html"
  },
  {
    "label": "Cayenne",
    "id": "cayenne",
    "url": "/concepts/cayenne.html"
  },
  {
    "label": "Winbatch",
    "id": "winbatch",
    "url": "/concepts/winbatch.html"
  },
  {
    "label": "Lava",
    "id": "lava",
    "url": "/concepts/lava.html"
  },
  {
    "label": "arend",
    "id": "arend",
    "url": "/concepts/arend.html"
  },
  {
    "label": "DomainKeys Identified Mail",
    "id": "dkim-standard",
    "url": "/concepts/dkim-standard.html"
  },
  {
    "label": "YAMP",
    "id": "yamp",
    "url": "/concepts/yamp.html"
  },
  {
    "label": "Octune",
    "id": "octune",
    "url": "/concepts/octune.html"
  },
  {
    "label": "Squire",
    "id": "squire",
    "url": "/concepts/squire.html"
  },
  {
    "label": "Dexterity",
    "id": "dexterity",
    "url": "/concepts/dexterity.html"
  },
  {
    "label": "Joule",
    "id": "joule",
    "url": "/concepts/joule.html"
  },
  {
    "label": "P′′",
    "id": "pqq",
    "url": "/concepts/pqq.html"
  },
  {
    "label": "Mobl",
    "id": "mobl-lang",
    "url": "/concepts/mobl-lang.html"
  },
  {
    "label": "Markus",
    "id": "markus",
    "url": "/concepts/markus.html"
  },
  {
    "label": "swizzle",
    "id": "swizzle",
    "url": "/concepts/swizzle.html"
  },
  {
    "label": "CFScript",
    "id": "cfscript",
    "url": "/concepts/cfscript.html"
  },
  {
    "label": "Apple BASIC",
    "id": "apple-basic",
    "url": "/concepts/apple-basic.html"
  },
  {
    "label": "DARPA Agent Markup Language",
    "id": "daml",
    "url": "/concepts/daml.html"
  },
  {
    "label": "Fuzzy Markup Language",
    "id": "fml",
    "url": "/concepts/fml.html"
  },
  {
    "label": "Pascal Script",
    "id": "pascal-script",
    "url": "/concepts/pascal-script.html"
  },
  {
    "label": "CRAM file format",
    "id": "cram-format",
    "url": "/concepts/cram-format.html"
  },
  {
    "label": "weebasic",
    "id": "weebasic",
    "url": "/concepts/weebasic.html"
  },
  {
    "label": "BASIC-E",
    "id": "basic-e",
    "url": "/concepts/basic-e.html"
  },
  {
    "label": "DATATRIEVE",
    "id": "datatrieve",
    "url": "/concepts/datatrieve.html"
  },
  {
    "label": "Mama",
    "id": "mama-software",
    "url": "/concepts/mama-software.html"
  },
  {
    "label": "Framework office suite",
    "id": "framework-office-suite",
    "url": "/concepts/framework-office-suite.html"
  },
  {
    "label": "DML",
    "id": "dml",
    "url": "/concepts/dml.html"
  },
  {
    "label": "Business Basic",
    "id": "business-basic",
    "url": "/concepts/business-basic.html"
  },
  {
    "label": "Facelets",
    "id": "facelets",
    "url": "/concepts/facelets.html"
  },
  {
    "label": "Kawa",
    "id": "kawa-scheme-implementation",
    "url": "/concepts/kawa-scheme-implementation.html"
  },
  {
    "label": "Just Another Scripting Syntax",
    "id": "jass",
    "url": "/concepts/jass.html"
  },
  {
    "label": "Steel Bank Common Lisp",
    "id": "sbcl",
    "url": "/concepts/sbcl.html"
  },
  {
    "label": "typecobol",
    "id": "typecobol",
    "url": "/concepts/typecobol.html"
  },
  {
    "label": "co2",
    "id": "co2",
    "url": "/concepts/co2.html"
  },
  {
    "label": "Lingua Graphica",
    "id": "lingua-graphica",
    "url": "/concepts/lingua-graphica.html"
  },
  {
    "label": "Timpani",
    "id": "timpani",
    "url": "/concepts/timpani.html"
  },
  {
    "label": "lambcalc",
    "id": "lambcalc",
    "url": "/concepts/lambcalc.html"
  },
  {
    "label": "nydp",
    "id": "nydp",
    "url": "/concepts/nydp.html"
  },
  {
    "label": "rio",
    "id": "rio",
    "url": "/concepts/rio.html"
  },
  {
    "label": "Typecast.js",
    "id": "typecastjs",
    "url": "/concepts/typecastjs.html"
  },
  {
    "label": "cql",
    "id": "cql",
    "url": "/concepts/cql.html"
  },
  {
    "label": "AgentSpeak",
    "id": "agentspeak",
    "url": "/concepts/agentspeak.html"
  },
  {
    "label": "Atlas Autocode",
    "id": "atlas-autocode",
    "url": "/concepts/atlas-autocode.html"
  },
  {
    "label": "Atom",
    "id": "atom",
    "url": "/concepts/atom.html"
  },
  {
    "label": "Star",
    "id": "star",
    "url": "/concepts/star.html"
  },
  {
    "label": "Easy Programming Language",
    "id": "easy",
    "url": "/concepts/easy.html"
  },
  {
    "label": "AUI",
    "id": "aui",
    "url": "/concepts/aui.html"
  },
  {
    "label": "Netlib",
    "id": "netlib",
    "url": "/concepts/netlib.html"
  },
  {
    "label": "PascalABC.NET",
    "id": "pascal-abc.net",
    "url": "/concepts/pascal-abc.net.html"
  },
  {
    "label": "MAPPER",
    "id": "mapper",
    "url": "/concepts/mapper.html"
  },
  {
    "label": "DYNAMO",
    "id": "dynamo",
    "url": "/concepts/dynamo.html"
  },
  {
    "label": "Lincoln Reckoner",
    "id": "lincoln-reckoner",
    "url": "/concepts/lincoln-reckoner.html"
  },
  {
    "label": "rocket",
    "id": "rocket",
    "url": "/concepts/rocket.html"
  },
  {
    "label": "tuplemarkup",
    "id": "tuplemarkup",
    "url": "/concepts/tuplemarkup.html"
  },
  {
    "label": "Document Structure Description",
    "id": "dsd",
    "url": "/concepts/dsd.html"
  },
  {
    "label": "Argus",
    "id": "argus",
    "url": "/concepts/argus.html"
  },
  {
    "label": "fork-lang",
    "id": "fork-lang",
    "url": "/concepts/fork-lang.html"
  },
  {
    "label": "Taijilang",
    "id": "taijilang",
    "url": "/concepts/taijilang.html"
  },
  {
    "label": "AUTOCODER",
    "id": "autocoder",
    "url": "/concepts/autocoder.html"
  },
  {
    "label": "Jazz",
    "id": "jazz",
    "url": "/concepts/jazz.html"
  },
  {
    "label": "BASIC-PLUS",
    "id": "basic-plus",
    "url": "/concepts/basic-plus.html"
  },
  {
    "label": "ircis",
    "id": "ircis",
    "url": "/concepts/ircis.html"
  },
  {
    "label": "V",
    "id": "v-golf",
    "url": "/concepts/v-golf.html"
  },
  {
    "label": "ATLAS Transformation Language",
    "id": "atlas",
    "url": "/concepts/atlas.html"
  },
  {
    "label": "Flavors",
    "id": "flavors",
    "url": "/concepts/flavors.html"
  },
  {
    "label": "l2",
    "id": "l2",
    "url": "/concepts/l2.html"
  },
  {
    "label": "Avionics Architecture Design Language",
    "id": "aadl",
    "url": "/concepts/aadl.html"
  },
  {
    "label": "Gist",
    "id": "gist",
    "url": "/concepts/gist.html"
  },
  {
    "label": "z2",
    "id": "z2",
    "url": "/concepts/z2.html"
  },
  {
    "label": "lila-lang",
    "id": "lila-lang",
    "url": "/concepts/lila-lang.html"
  },
  {
    "label": "microl",
    "id": "microl",
    "url": "/concepts/microl.html"
  },
  {
    "label": "alfred",
    "id": "alfred",
    "url": "/concepts/alfred.html"
  },
  {
    "label": "Cotton",
    "id": "cotton",
    "url": "/concepts/cotton.html"
  },
  {
    "label": "ForthScript",
    "id": "forthscript",
    "url": "/concepts/forthscript.html"
  },
  {
    "label": "Business Object Notation",
    "id": "business-object-notation",
    "url": "/concepts/business-object-notation.html"
  },
  {
    "label": "Curly",
    "id": "curly",
    "url": "/concepts/curly.html"
  },
  {
    "label": "nulan",
    "id": "nulan",
    "url": "/concepts/nulan.html"
  },
  {
    "label": "Flapjax",
    "id": "flapjax",
    "url": "/concepts/flapjax.html"
  },
  {
    "label": "ABSET",
    "id": "abset",
    "url": "/concepts/abset.html"
  },
  {
    "label": "quaint-lang",
    "id": "quaint-lang",
    "url": "/concepts/quaint-lang.html"
  },
  {
    "label": "Knight",
    "id": "knight",
    "url": "/concepts/knight.html"
  },
  {
    "label": "Alpha",
    "id": "alpha-programming-language",
    "url": "/concepts/alpha-programming-language.html"
  },
  {
    "label": "Chipmunk Basic",
    "id": "chipmunk-basic",
    "url": "/concepts/chipmunk-basic.html"
  },
  {
    "label": "AIL",
    "id": "ail",
    "url": "/concepts/ail.html"
  },
  {
    "label": "sham",
    "id": "sham",
    "url": "/concepts/sham.html"
  },
  {
    "label": "glush",
    "id": "glush",
    "url": "/concepts/glush.html"
  },
  {
    "label": "Common Data Format",
    "id": "cdf",
    "url": "/concepts/cdf.html"
  },
  {
    "label": "alan",
    "id": "alan",
    "url": "/concepts/alan.html"
  },
  {
    "label": "mai",
    "id": "mai",
    "url": "/concepts/mai.html"
  },
  {
    "label": "Jingo",
    "id": "jingo",
    "url": "/concepts/jingo.html"
  },
  {
    "label": "Leazy",
    "id": "leazy",
    "url": "/concepts/leazy.html"
  },
  {
    "label": "Esoteric Reaction",
    "id": "esoteric-reaction",
    "url": "/concepts/esoteric-reaction.html"
  },
  {
    "label": "Hina",
    "id": "hina",
    "url": "/concepts/hina.html"
  },
  {
    "label": "MeanscriptCLI",
    "id": "meanscriptcli",
    "url": "/concepts/meanscriptcli.html"
  },
  {
    "label": "Bon",
    "id": "bon-programming-language",
    "url": "/concepts/bon-programming-language.html"
  },
  {
    "label": "Libra",
    "id": "libra",
    "url": "/concepts/libra.html"
  },
  {
    "label": "Aime",
    "id": "aime",
    "url": "/concepts/aime.html"
  },
  {
    "label": "eskew",
    "id": "eskew",
    "url": "/concepts/eskew.html"
  },
  {
    "label": "passambler",
    "id": "passambler",
    "url": "/concepts/passambler.html"
  },
  {
    "label": "lsd",
    "id": "lsd",
    "url": "/concepts/lsd.html"
  },
  {
    "label": "H++",
    "id": "hpp",
    "url": "/concepts/hpp.html"
  },
  {
    "label": "penguor",
    "id": "penguor",
    "url": "/concepts/penguor.html"
  },
  {
    "label": "LGDF",
    "id": "lgdf",
    "url": "/concepts/lgdf.html"
  },
  {
    "label": "mountain",
    "id": "mountain",
    "url": "/concepts/mountain.html"
  },
  {
    "label": "Fern",
    "id": "fern",
    "url": "/concepts/fern.html"
  },
  {
    "label": "Broccoli",
    "id": "broccoli",
    "url": "/concepts/broccoli.html"
  },
  {
    "label": "3D Logo",
    "id": "3d-logo",
    "url": "/concepts/3d-logo.html"
  },
  {
    "label": "Leopard",
    "id": "leopard",
    "url": "/concepts/leopard.html"
  },
  {
    "label": "Leogo",
    "id": "leogo",
    "url": "/concepts/leogo.html"
  },
  {
    "label": "LEGOL",
    "id": "legol",
    "url": "/concepts/legol.html"
  },
  {
    "label": "LDL1",
    "id": "ldl1",
    "url": "/concepts/ldl1.html"
  },
  {
    "label": "LCL",
    "id": "lcl",
    "url": "/concepts/lcl.html"
  },
  {
    "label": "LCF",
    "id": "lcf",
    "url": "/concepts/lcf.html"
  },
  {
    "label": "LAURE",
    "id": "laure",
    "url": "/concepts/laure.html"
  },
  {
    "label": "Larch",
    "id": "larch",
    "url": "/concepts/larch.html"
  },
  {
    "label": "LABTRAN",
    "id": "labtran",
    "url": "/concepts/labtran.html"
  },
  {
    "label": "Kylix",
    "id": "kylix",
    "url": "/concepts/kylix.html"
  },
  {
    "label": "Kvikkalkul",
    "id": "kvikkalkul",
    "url": "/concepts/kvikkalkul.html"
  },
  {
    "label": "KRYPTON",
    "id": "krypton",
    "url": "/concepts/krypton.html"
  },
  {
    "label": "KRS",
    "id": "krs",
    "url": "/concepts/krs.html"
  },
  {
    "label": "KRL-0",
    "id": "krl-0",
    "url": "/concepts/krl-0.html"
  },
  {
    "label": "KLIPA",
    "id": "klipa",
    "url": "/concepts/klipa.html"
  },
  {
    "label": "KL-ONE",
    "id": "kl-one",
    "url": "/concepts/kl-one.html"
  },
  {
    "label": "King Kong",
    "id": "king-kong",
    "url": "/concepts/king-kong.html"
  },
  {
    "label": "Kiev",
    "id": "kiev",
    "url": "/concepts/kiev.html"
  },
  {
    "label": "KeyKit",
    "id": "keykit",
    "url": "/concepts/keykit.html"
  },
  {
    "label": "kew",
    "id": "kew",
    "url": "/concepts/kew.html"
  },
  {
    "label": "KEK-NODAL",
    "id": "kek-nodal",
    "url": "/concepts/kek-nodal.html"
  },
  {
    "label": "KEE",
    "id": "kee",
    "url": "/concepts/kee.html"
  },
  {
    "label": "Kaleidoscope'91",
    "id": "kaleidoscope91",
    "url": "/concepts/kaleidoscope91.html"
  },
  {
    "label": "Kaleidoscope'90",
    "id": "kaleidoscope90",
    "url": "/concepts/kaleidoscope90.html"
  },
  {
    "label": "Kaleidoquery",
    "id": "kaleidoquery",
    "url": "/concepts/kaleidoquery.html"
  },
  {
    "label": "KAIL",
    "id": "kail",
    "url": "/concepts/kail.html"
  },
  {
    "label": "Juno",
    "id": "juno",
    "url": "/concepts/juno.html"
  },
  {
    "label": "JSyn",
    "id": "jsyn",
    "url": "/concepts/jsyn.html"
  },
  {
    "label": "JOSS II",
    "id": "joss-ii",
    "url": "/concepts/joss-ii.html"
  },
  {
    "label": "JMSL",
    "id": "jmsl",
    "url": "/concepts/jmsl.html"
  },
  {
    "label": "JFugue",
    "id": "jfugue",
    "url": "/concepts/jfugue.html"
  },
  {
    "label": "jBC",
    "id": "jbc",
    "url": "/concepts/jbc.html"
  },
  {
    "label": "JavaScriptCore",
    "id": "javascriptcore",
    "url": "/concepts/javascriptcore.html"
  },
  {
    "label": "JACAL",
    "id": "jacal",
    "url": "/concepts/jacal.html"
  },
  {
    "label": "IVTRAN",
    "id": "ivtran",
    "url": "/concepts/ivtran.html"
  },
  {
    "label": "ISPL",
    "id": "ispl",
    "url": "/concepts/ispl.html"
  },
  {
    "label": "ISIS",
    "id": "isis",
    "url": "/concepts/isis.html"
  },
  {
    "label": "Isabelle/HOL",
    "id": "isabelle-hol",
    "url": "/concepts/isabelle-hol.html"
  },
  {
    "label": "Isabelle-91",
    "id": "isabelle-91",
    "url": "/concepts/isabelle-91.html"
  },
  {
    "label": "IQF",
    "id": "iqf",
    "url": "/concepts/iqf.html"
  },
  {
    "label": "IPL-V",
    "id": "ipl-v",
    "url": "/concepts/ipl-v.html"
  },
  {
    "label": "Interlisp-VAX",
    "id": "interlisp-vax",
    "url": "/concepts/interlisp-vax.html"
  },
  {
    "label": "InterCONS",
    "id": "intercons",
    "url": "/concepts/intercons.html"
  },
  {
    "label": "INTERCELLAS",
    "id": "intercellas",
    "url": "/concepts/intercellas.html"
  },
  {
    "label": "Inscan",
    "id": "inscan",
    "url": "/concepts/inscan.html"
  },
  {
    "label": "INMAGIC",
    "id": "inmagic",
    "url": "/concepts/inmagic.html"
  },
  {
    "label": "Industrial Modeling and Programming Language",
    "id": "impl",
    "url": "/concepts/impl.html"
  },
  {
    "label": "IMP72",
    "id": "imp72",
    "url": "/concepts/imp72.html"
  },
  {
    "label": "iikuse",
    "id": "iikuse",
    "url": "/concepts/iikuse.html"
  },
  {
    "label": "ICOT",
    "id": "icot",
    "url": "/concepts/icot.html"
  },
  {
    "label": "ICETRAN",
    "id": "icetran",
    "url": "/concepts/icetran.html"
  },
  {
    "label": "Integrated Civil Engineering System",
    "id": "ices-system",
    "url": "/concepts/ices-system.html"
  },
  {
    "label": "IBM Logo",
    "id": "ibm-logo",
    "url": "/concepts/ibm-logo.html"
  },
  {
    "label": "IB-Templog",
    "id": "ib-templog",
    "url": "/concepts/ib-templog.html"
  },
  {
    "label": "IAM",
    "id": "iam",
    "url": "/concepts/iam.html"
  },
  {
    "label": "HYTRAN",
    "id": "hytran",
    "url": "/concepts/hytran.html"
  },
  {
    "label": "Hyperlog",
    "id": "hyperlog",
    "url": "/concepts/hyperlog.html"
  },
  {
    "label": "Hyperlisp",
    "id": "hyperlisp",
    "url": "/concepts/hyperlisp.html"
  },
  {
    "label": "Hyperflow",
    "id": "hyperflow",
    "url": "/concepts/hyperflow.html"
  },
  {
    "label": "HYPAC",
    "id": "hypac",
    "url": "/concepts/hypac.html"
  },
  {
    "label": "Sublime Syntax",
    "id": "sublime-syntax",
    "url": "/concepts/sublime-syntax.html"
  },
  {
    "label": "TextMate Language",
    "id": "tmlanguage",
    "url": "/concepts/tmlanguage.html"
  },
  {
    "label": "HTEL",
    "id": "htel",
    "url": "/concepts/htel.html"
  },
  {
    "label": "HSML",
    "id": "hsml",
    "url": "/concepts/hsml.html"
  },
  {
    "label": "HSL",
    "id": "hsl",
    "url": "/concepts/hsl.html"
  },
  {
    "label": "HScript",
    "id": "hscript",
    "url": "/concepts/hscript.html"
  },
  {
    "label": "HPRL",
    "id": "hprl",
    "url": "/concepts/hprl.html"
  },
  {
    "label": "HP-PASCAL",
    "id": "hp-pascal",
    "url": "/concepts/hp-pascal.html"
  },
  {
    "label": "HOLCF",
    "id": "holcf",
    "url": "/concepts/holcf.html"
  },
  {
    "label": "HOL",
    "id": "hol",
    "url": "/concepts/hol.html"
  },
  {
    "label": "HMSL",
    "id": "hmsl",
    "url": "/concepts/hmsl.html"
  },
  {
    "label": "HiQ",
    "id": "hiq",
    "url": "/concepts/hiq.html"
  },
  {
    "label": "Hermes",
    "id": "hermes",
    "url": "/concepts/hermes.html"
  },
  {
    "label": "HERAKLIT",
    "id": "heraklit",
    "url": "/concepts/heraklit.html"
  },
  {
    "label": "HASL",
    "id": "hasl",
    "url": "/concepts/hasl.html"
  },
  {
    "label": "Haskell#",
    "id": "haskell-sharp",
    "url": "/concepts/haskell-sharp.html"
  },
  {
    "label": "Hank",
    "id": "hank",
    "url": "/concepts/hank.html"
  },
  {
    "label": "Gypsy",
    "id": "gypsy",
    "url": "/concepts/gypsy.html"
  },
  {
    "label": "GXL",
    "id": "gxl",
    "url": "/concepts/gxl.html"
  },
  {
    "label": "GVL",
    "id": "gvl",
    "url": "/concepts/gvl.html"
  },
  {
    "label": "GSBL",
    "id": "gsbl",
    "url": "/concepts/gsbl.html"
  },
  {
    "label": "GROUPLOG",
    "id": "grouplog",
    "url": "/concepts/grouplog.html"
  },
  {
    "label": "Graqula",
    "id": "graqula",
    "url": "/concepts/graqula.html"
  },
  {
    "label": "GRAPHOS",
    "id": "graphos",
    "url": "/concepts/graphos.html"
  },
  {
    "label": "GraphLog",
    "id": "graphlog",
    "url": "/concepts/graphlog.html"
  },
  {
    "label": "GRAD Assistant",
    "id": "grad-assistant",
    "url": "/concepts/grad-assistant.html"
  },
  {
    "label": "GQL",
    "id": "gql",
    "url": "/concepts/gql.html"
  },
  {
    "label": "GPSS FORTRAN",
    "id": "gpss-fortran",
    "url": "/concepts/gpss-fortran.html"
  },
  {
    "label": "GPSS/360",
    "id": "gpss-360",
    "url": "/concepts/gpss-360.html"
  },
  {
    "label": "GPGS",
    "id": "gpgs",
    "url": "/concepts/gpgs.html"
  },
  {
    "label": "GPDS",
    "id": "gpds",
    "url": "/concepts/gpds.html"
  },
  {
    "label": "Glue-Nail",
    "id": "glue-nail",
    "url": "/concepts/glue-nail.html"
  },
  {
    "label": "GLU",
    "id": "glu",
    "url": "/concepts/glu.html"
  },
  {
    "label": "GLIDE",
    "id": "glide",
    "url": "/concepts/glide.html"
  },
  {
    "label": "GKS",
    "id": "gks",
    "url": "/concepts/gks.html"
  },
  {
    "label": "GCC GIMPLE",
    "id": "gimple",
    "url": "/concepts/gimple.html"
  },
  {
    "label": "GENTRAN",
    "id": "gentran",
    "url": "/concepts/gentran.html"
  },
  {
    "label": "GENTRAN 90",
    "id": "gentran-90",
    "url": "/concepts/gentran-90.html"
  },
  {
    "label": "Generic Haskell",
    "id": "generic-haskell",
    "url": "/concepts/generic-haskell.html"
  },
  {
    "label": "zish",
    "id": "zish",
    "url": "/concepts/zish.html"
  },
  {
    "label": "Zork Implementation Language",
    "id": "zil",
    "url": "/concepts/zil.html"
  },
  {
    "label": "Gedanken",
    "id": "gedanken",
    "url": "/concepts/gedanken.html"
  },
  {
    "label": "GDPL",
    "id": "gdpl",
    "url": "/concepts/gdpl.html"
  },
  {
    "label": "Zed",
    "id": "zed",
    "url": "/concepts/zed.html"
  },
  {
    "label": "GCP",
    "id": "gcp",
    "url": "/concepts/gcp.html"
  },
  {
    "label": "GaussFit",
    "id": "gaussfit",
    "url": "/concepts/gaussfit.html"
  },
  {
    "label": "GAT",
    "id": "gat",
    "url": "/concepts/gat.html"
  },
  {
    "label": "Soulver",
    "id": "soulver",
    "url": "/concepts/soulver.html"
  },
  {
    "label": "yoga",
    "id": "yoga",
    "url": "/concepts/yoga.html"
  },
  {
    "label": "GASP II",
    "id": "gasp-ii",
    "url": "/concepts/gasp-ii.html"
  },
  {
    "label": "Gargoyle",
    "id": "gargoyle",
    "url": "/concepts/gargoyle.html"
  },
  {
    "label": "ycp",
    "id": "ycp",
    "url": "/concepts/ycp.html"
  },
  {
    "label": "g-2",
    "id": "g-2",
    "url": "/concepts/g-2.html"
  },
  {
    "label": "XQL",
    "id": "xql",
    "url": "/concepts/xql.html"
  },
  {
    "label": "FRAN",
    "id": "fran",
    "url": "/concepts/fran.html"
  },
  {
    "label": "FP2",
    "id": "fp2",
    "url": "/concepts/fp2.html"
  },
  {
    "label": "Xmind Format",
    "id": "xmind",
    "url": "/concepts/xmind.html"
  },
  {
    "label": "Fortran M",
    "id": "fortran-m",
    "url": "/concepts/fortran-m.html"
  },
  {
    "label": "XE",
    "id": "xe",
    "url": "/concepts/xe.html"
  },
  {
    "label": "FORTRAN II",
    "id": "fortran-ii",
    "url": "/concepts/fortran-ii.html"
  },
  {
    "label": "Fortran D",
    "id": "fortran-d",
    "url": "/concepts/fortran-d.html"
  },
  {
    "label": "FORTRAN CEP",
    "id": "fortran-cep",
    "url": "/concepts/fortran-cep.html"
  },
  {
    "label": "Fortran 8x",
    "id": "fortran-8x",
    "url": "/concepts/fortran-8x.html"
  },
  {
    "label": "FORMS/3",
    "id": "forms-3",
    "url": "/concepts/forms-3.html"
  },
  {
    "label": "Fork95",
    "id": "fork95",
    "url": "/concepts/fork95.html"
  },
  {
    "label": "WIZOR",
    "id": "wizor",
    "url": "/concepts/wizor.html"
  },
  {
    "label": "FORALL",
    "id": "forall",
    "url": "/concepts/forall.html"
  },
  {
    "label": "wizml",
    "id": "wizml",
    "url": "/concepts/wizml.html"
  },
  {
    "label": "FORAL",
    "id": "foral",
    "url": "/concepts/foral.html"
  },
  {
    "label": "Wikitax",
    "id": "wikitax",
    "url": "/concepts/wikitax.html"
  },
  {
    "label": "FORAL LP",
    "id": "foral-lp",
    "url": "/concepts/foral-lp.html"
  },
  {
    "label": "foogol",
    "id": "foogol",
    "url": "/concepts/foogol.html"
  },
  {
    "label": "WebGPU Shading Language",
    "id": "wgsl",
    "url": "/concepts/wgsl.html"
  },
  {
    "label": "flowlog",
    "id": "flowlog",
    "url": "/concepts/flowlog.html"
  },
  {
    "label": "Flora",
    "id": "flora",
    "url": "/concepts/flora.html"
  },
  {
    "label": "WATFOR",
    "id": "watfor",
    "url": "/concepts/watfor.html"
  },
  {
    "label": "Water",
    "id": "water",
    "url": "/concepts/water.html"
  },
  {
    "label": "flexbuffers",
    "id": "flexbuffers",
    "url": "/concepts/flexbuffers.html"
  },
  {
    "label": "FLENG++",
    "id": "flengpp",
    "url": "/concepts/flengpp.html"
  },
  {
    "label": "Filterscript",
    "id": "filterscript",
    "url": "/concepts/filterscript.html"
  },
  {
    "label": "Fickle",
    "id": "fickle",
    "url": "/concepts/fickle.html"
  },
  {
    "label": "Visual",
    "id": "visual",
    "url": "/concepts/visual.html"
  },
  {
    "label": "FCPU",
    "id": "fcpu",
    "url": "/concepts/fcpu.html"
  },
  {
    "label": "FAD",
    "id": "fad",
    "url": "/concepts/fad.html"
  },
  {
    "label": "FAC",
    "id": "fac",
    "url": "/concepts/fac.html"
  },
  {
    "label": "VEX",
    "id": "vex",
    "url": "/concepts/vex.html"
  },
  {
    "label": "Etude",
    "id": "etude",
    "url": "/concepts/etude.html"
  },
  {
    "label": "Ethereum Virtual Machine",
    "id": "ethereum-vm",
    "url": "/concepts/ethereum-vm.html"
  },
  {
    "label": "ERROL",
    "id": "errol",
    "url": "/concepts/errol.html"
  },
  {
    "label": "EQUATE",
    "id": "equate",
    "url": "/concepts/equate.html"
  },
  {
    "label": "EQLog",
    "id": "eqlog",
    "url": "/concepts/eqlog.html"
  },
  {
    "label": "EPILOG",
    "id": "epilog",
    "url": "/concepts/epilog.html"
  },
  {
    "label": "Emily",
    "id": "emily",
    "url": "/concepts/emily.html"
  },
  {
    "label": "ELMOL",
    "id": "elmol",
    "url": "/concepts/elmol.html"
  },
  {
    "label": "UC",
    "id": "uc",
    "url": "/concepts/uc.html"
  },
  {
    "label": "Ellie",
    "id": "ellie",
    "url": "/concepts/ellie.html"
  },
  {
    "label": "EL1",
    "id": "el1",
    "url": "/concepts/el1.html"
  },
  {
    "label": "whalecalf",
    "id": "whalecalf",
    "url": "/concepts/whalecalf.html"
  },
  {
    "label": "EGS4",
    "id": "egs4",
    "url": "/concepts/egs4.html"
  },
  {
    "label": "twoducks",
    "id": "twoducks",
    "url": "/concepts/twoducks.html"
  },
  {
    "label": "Wolfram Data Framework",
    "id": "wdf",
    "url": "/concepts/wdf.html"
  },
  {
    "label": "TWO-D",
    "id": "two-d",
    "url": "/concepts/two-d.html"
  },
  {
    "label": "EDUCE*",
    "id": "educe-star",
    "url": "/concepts/educe-star.html"
  },
  {
    "label": "EDSIM",
    "id": "edsim",
    "url": "/concepts/edsim.html"
  },
  {
    "label": "EDSAC Initial Orders",
    "id": "edsac-initial-orders",
    "url": "/concepts/edsac-initial-orders.html"
  },
  {
    "label": "Edinburgh LCF",
    "id": "edinburgh-lcf",
    "url": "/concepts/edinburgh-lcf.html"
  },
  {
    "label": "versioned-text-markup-language",
    "id": "versioned-text-markup-language",
    "url": "/concepts/versioned-text-markup-language.html"
  },
  {
    "label": "TS",
    "id": "ts",
    "url": "/concepts/ts.html"
  },
  {
    "label": "ECT",
    "id": "ect",
    "url": "/concepts/ect.html"
  },
  {
    "label": "Vely",
    "id": "vely",
    "url": "/concepts/vely.html"
  },
  {
    "label": "Eclectic CSP",
    "id": "eclectic-csp",
    "url": "/concepts/eclectic-csp.html"
  },
  {
    "label": "TRIPLE",
    "id": "triple",
    "url": "/concepts/triple.html"
  },
  {
    "label": "TRIO",
    "id": "trio",
    "url": "/concepts/trio.html"
  },
  {
    "label": "EASY ENGLISH",
    "id": "easy-english",
    "url": "/concepts/easy-english.html"
  },
  {
    "label": "EASL",
    "id": "easl",
    "url": "/concepts/easl.html"
  },
  {
    "label": "EAS-E",
    "id": "eas-e",
    "url": "/concepts/eas-e.html"
  },
  {
    "label": "TRANSLANG",
    "id": "translang",
    "url": "/concepts/translang.html"
  },
  {
    "label": "DYSTAL",
    "id": "dystal",
    "url": "/concepts/dystal.html"
  },
  {
    "label": "TRANSCODE",
    "id": "transcode",
    "url": "/concepts/transcode.html"
  },
  {
    "label": "TRACE",
    "id": "trace",
    "url": "/concepts/trace.html"
  },
  {
    "label": "DSL/90",
    "id": "dsl-90",
    "url": "/concepts/dsl-90.html"
  },
  {
    "label": "DROL",
    "id": "drol",
    "url": "/concepts/drol.html"
  },
  {
    "label": "Lambda Diagrams",
    "id": "tromp-diagrams",
    "url": "/concepts/tromp-diagrams.html"
  },
  {
    "label": "torchscript",
    "id": "torchscript",
    "url": "/concepts/torchscript.html"
  },
  {
    "label": "DRL",
    "id": "drl",
    "url": "/concepts/drl.html"
  },
  {
    "label": "topaz",
    "id": "topaz",
    "url": "/concepts/topaz.html"
  },
  {
    "label": "DPRL",
    "id": "dprl",
    "url": "/concepts/dprl.html"
  },
  {
    "label": "TOMAL",
    "id": "tomal",
    "url": "/concepts/tomal.html"
  },
  {
    "label": "DOWL",
    "id": "dowl",
    "url": "/concepts/dowl.html"
  },
  {
    "label": "DOLPHIN",
    "id": "dolphin",
    "url": "/concepts/dolphin.html"
  },
  {
    "label": "DOE Macsyma",
    "id": "doe-macsyma",
    "url": "/concepts/doe-macsyma.html"
  },
  {
    "label": "DMAP",
    "id": "dmap",
    "url": "/concepts/dmap.html"
  },
  {
    "label": "DITROFF",
    "id": "ditroff",
    "url": "/concepts/ditroff.html"
  },
  {
    "label": "terse",
    "id": "terse",
    "url": "/concepts/terse.html"
  },
  {
    "label": "DITROFF/FFORTID",
    "id": "ditroff-ffortid",
    "url": "/concepts/ditroff-ffortid.html"
  },
  {
    "label": "DITRAN",
    "id": "ditran",
    "url": "/concepts/ditran.html"
  },
  {
    "label": "Distributed Processes",
    "id": "distributed-processes",
    "url": "/concepts/distributed-processes.html"
  },
  {
    "label": "TEMPO",
    "id": "tempo",
    "url": "/concepts/tempo.html"
  },
  {
    "label": "Diplans",
    "id": "diplans",
    "url": "/concepts/diplans.html"
  },
  {
    "label": "tablatal",
    "id": "tablatal",
    "url": "/concepts/tablatal.html"
  },
  {
    "label": "CDL",
    "id": "cdl",
    "url": "/concepts/cdl.html"
  },
  {
    "label": "TeLa",
    "id": "tela",
    "url": "/concepts/tela.html"
  },
  {
    "label": "DIGRAF",
    "id": "digraf",
    "url": "/concepts/digraf.html"
  },
  {
    "label": "DIAMAG",
    "id": "diamag",
    "url": "/concepts/diamag.html"
  },
  {
    "label": "DFL",
    "id": "dfl",
    "url": "/concepts/dfl.html"
  },
  {
    "label": "JVM",
    "id": "jvm",
    "url": "/concepts/jvm.html"
  },
  {
    "label": "Deva",
    "id": "deva",
    "url": "/concepts/deva.html"
  },
  {
    "label": "Sublime Syntax Test Lang",
    "id": "sublime-syntax-test",
    "url": "/concepts/sublime-syntax-test.html"
  },
  {
    "label": "DETAP",
    "id": "detap",
    "url": "/concepts/detap.html"
  },
  {
    "label": "DETAB-X",
    "id": "detab-x",
    "url": "/concepts/detab-x.html"
  },
  {
    "label": "DETAB/65",
    "id": "detab-65",
    "url": "/concepts/detab-65.html"
  },
  {
    "label": "TAO",
    "id": "tao",
    "url": "/concepts/tao.html"
  },
  {
    "label": "DESCRIPTRAN",
    "id": "descriptran",
    "url": "/concepts/descriptran.html"
  },
  {
    "label": "TALL",
    "id": "tall",
    "url": "/concepts/tall.html"
  },
  {
    "label": "TALE",
    "id": "tale",
    "url": "/concepts/tale.html"
  },
  {
    "label": "srv",
    "id": "srv",
    "url": "/concepts/srv.html"
  },
  {
    "label": "DEM",
    "id": "dem",
    "url": "/concepts/dem.html"
  },
  {
    "label": "TACTICS",
    "id": "tactics",
    "url": "/concepts/tactics.html"
  },
  {
    "label": "System V ABI",
    "id": "system-v-abi",
    "url": "/concepts/system-v-abi.html"
  },
  {
    "label": "DeBuMa",
    "id": "debuma",
    "url": "/concepts/debuma.html"
  },
  {
    "label": "SYNTEX",
    "id": "syntex",
    "url": "/concepts/syntex.html"
  },
  {
    "label": "DEACON",
    "id": "deacon",
    "url": "/concepts/deacon.html"
  },
  {
    "label": "SymbMath",
    "id": "symbmath",
    "url": "/concepts/symbmath.html"
  },
  {
    "label": "SYMBAL",
    "id": "symbal",
    "url": "/concepts/symbal.html"
  },
  {
    "label": "DATAN",
    "id": "datan",
    "url": "/concepts/datan.html"
  },
  {
    "label": "DATA-TEXT",
    "id": "data-text",
    "url": "/concepts/data-text.html"
  },
  {
    "label": "SVL",
    "id": "svl",
    "url": "/concepts/svl.html"
  },
  {
    "label": "DartCVL",
    "id": "dartcvl",
    "url": "/concepts/dartcvl.html"
  },
  {
    "label": "SUPERMAC",
    "id": "supermac",
    "url": "/concepts/supermac.html"
  },
  {
    "label": "SuperForth",
    "id": "superforth",
    "url": "/concepts/superforth.html"
  },
  {
    "label": "DAP-Algol",
    "id": "dap-algol",
    "url": "/concepts/dap-algol.html"
  },
  {
    "label": "SUMMER",
    "id": "summer",
    "url": "/concepts/summer.html"
  },
  {
    "label": "Sue",
    "id": "sue",
    "url": "/concepts/sue.html"
  },
  {
    "label": "DAG",
    "id": "dag",
    "url": "/concepts/dag.html"
  },
  {
    "label": "simit",
    "id": "simit",
    "url": "/concepts/simit.html"
  },
  {
    "label": "CypherText",
    "id": "cyphertext",
    "url": "/concepts/cyphertext.html"
  },
  {
    "label": "cuscus",
    "id": "cuscus",
    "url": "/concepts/cuscus.html"
  },
  {
    "label": "CuPit-2",
    "id": "cupit-2",
    "url": "/concepts/cupit-2.html"
  },
  {
    "label": "Culler-Fried System",
    "id": "culler-fried-system",
    "url": "/concepts/culler-fried-system.html"
  },
  {
    "label": "The Synthetic Biology Open Language",
    "id": "sbol",
    "url": "/concepts/sbol.html"
  },
  {
    "label": "CSSA",
    "id": "cssa",
    "url": "/concepts/cssa.html"
  },
  {
    "label": "CSP-OZ",
    "id": "csp-oz",
    "url": "/concepts/csp-oz.html"
  },
  {
    "label": "CSP-OZ-DC",
    "id": "csp-oz-dc",
    "url": "/concepts/csp-oz-dc.html"
  },
  {
    "label": "CSMP",
    "id": "csmp",
    "url": "/concepts/csmp.html"
  },
  {
    "label": "ruby-mine-editor",
    "id": "ruby-mine-editor",
    "url": "/concepts/ruby-mine-editor.html"
  },
  {
    "label": "CQL++",
    "id": "cqlpp",
    "url": "/concepts/cqlpp.html"
  },
  {
    "label": "CQLF",
    "id": "cqlf",
    "url": "/concepts/cqlf.html"
  },
  {
    "label": "COSMO",
    "id": "cosmo",
    "url": "/concepts/cosmo.html"
  },
  {
    "label": "sqlite-storage-format",
    "id": "sqlite-storage-format",
    "url": "/concepts/sqlite-storage-format.html"
  },
  {
    "label": "CosmicOS",
    "id": "cosmicos",
    "url": "/concepts/cosmicos.html"
  },
  {
    "label": "retroforth",
    "id": "retroforth",
    "url": "/concepts/retroforth.html"
  },
  {
    "label": "CORC",
    "id": "corc",
    "url": "/concepts/corc.html"
  },
  {
    "label": "Coral++",
    "id": "coralpp",
    "url": "/concepts/coralpp.html"
  },
  {
    "label": "CORAL 64",
    "id": "coral-64",
    "url": "/concepts/coral-64.html"
  },
  {
    "label": "COPAS",
    "id": "copas",
    "url": "/concepts/copas.html"
  },
  {
    "label": "redpanda-app",
    "id": "redpanda-app",
    "url": "/concepts/redpanda-app.html"
  },
  {
    "label": "CONTRANS",
    "id": "contrans",
    "url": "/concepts/contrans.html"
  },
  {
    "label": "readable-lisp",
    "id": "readable-lisp",
    "url": "/concepts/readable-lisp.html"
  },
  {
    "label": "Base64",
    "id": "base64",
    "url": "/concepts/base64.html"
  },
  {
    "label": "Radish",
    "id": "radish",
    "url": "/concepts/radish.html"
  },
  {
    "label": "ConstraintLisp",
    "id": "constraintlisp",
    "url": "/concepts/constraintlisp.html"
  },
  {
    "label": "CONNIVER",
    "id": "conniver",
    "url": "/concepts/conniver.html"
  },
  {
    "label": "ConMan",
    "id": "conman",
    "url": "/concepts/conman.html"
  },
  {
    "label": "qbe",
    "id": "qbe",
    "url": "/concepts/qbe.html"
  },
  {
    "label": "conGolog",
    "id": "congolog",
    "url": "/concepts/congolog.html"
  },
  {
    "label": "Python Format Specification",
    "id": "python-format-spec",
    "url": "/concepts/python-format-spec.html"
  },
  {
    "label": "Concurrent Pascal",
    "id": "concurrent-pascal",
    "url": "/concepts/concurrent-pascal.html"
  },
  {
    "label": "CONCUR",
    "id": "concur",
    "url": "/concepts/concur.html"
  },
  {
    "label": "PSeInt",
    "id": "pseint",
    "url": "/concepts/pseint.html"
  },
  {
    "label": "Concert/C",
    "id": "concert-c",
    "url": "/concepts/concert-c.html"
  },
  {
    "label": "ConC",
    "id": "conc",
    "url": "/concepts/conc.html"
  },
  {
    "label": "COMSL",
    "id": "comsl",
    "url": "/concepts/comsl.html"
  },
  {
    "label": "Computer Compiler",
    "id": "computer-compiler",
    "url": "/concepts/computer-compiler.html"
  },
  {
    "label": "Complex-Prolog",
    "id": "complex-prolog",
    "url": "/concepts/complex-prolog.html"
  },
  {
    "label": "polly",
    "id": "polly",
    "url": "/concepts/polly.html"
  },
  {
    "label": "COLD-K",
    "id": "cold-k",
    "url": "/concepts/cold-k.html"
  },
  {
    "label": "COLASL",
    "id": "colasl",
    "url": "/concepts/colasl.html"
  },
  {
    "label": "CogMap",
    "id": "cogmap",
    "url": "/concepts/cogmap.html"
  },
  {
    "label": "CODIL",
    "id": "codil",
    "url": "/concepts/codil.html"
  },
  {
    "label": "COBLOC",
    "id": "cobloc",
    "url": "/concepts/cobloc.html"
  },
  {
    "label": "CMN",
    "id": "cmn",
    "url": "/concepts/cmn.html"
  },
  {
    "label": "CLP*",
    "id": "clp-star",
    "url": "/concepts/clp-star.html"
  },
  {
    "label": "pikachu",
    "id": "pikachu",
    "url": "/concepts/pikachu.html"
  },
  {
    "label": "CLOVER",
    "id": "clover",
    "url": "/concepts/clover.html"
  },
  {
    "label": "Siri",
    "id": "siri",
    "url": "/concepts/siri.html"
  },
  {
    "label": "CLEOPATRA",
    "id": "cleopatra",
    "url": "/concepts/cleopatra.html"
  },
  {
    "label": "CLeogo",
    "id": "cleogo",
    "url": "/concepts/cleogo.html"
  },
  {
    "label": "Clear Language for Expressing Orders",
    "id": "cleo",
    "url": "/concepts/cleo.html"
  },
  {
    "label": "pgql",
    "id": "pgql",
    "url": "/concepts/pgql.html"
  },
  {
    "label": "pegdown",
    "id": "pegdown",
    "url": "/concepts/pegdown.html"
  },
  {
    "label": "Classic-Ada",
    "id": "classic-ada",
    "url": "/concepts/classic-ada.html"
  },
  {
    "label": "Simple Stackless Lisp",
    "id": "simple-stackless-lisp",
    "url": "/concepts/simple-stackless-lisp.html"
  },
  {
    "label": "Clascal",
    "id": "clascal",
    "url": "/concepts/clascal.html"
  },
  {
    "label": "par",
    "id": "par",
    "url": "/concepts/par.html"
  },
  {
    "label": "CL-I",
    "id": "cl-i",
    "url": "/concepts/cl-i.html"
  },
  {
    "label": "CIMS PL/I",
    "id": "cims-pl-i",
    "url": "/concepts/cims-pl-i.html"
  },
  {
    "label": "cimfast",
    "id": "cimfast",
    "url": "/concepts/cimfast.html"
  },
  {
    "label": "ChronologZ",
    "id": "chronologz",
    "url": "/concepts/chronologz.html"
  },
  {
    "label": "ChronologMC",
    "id": "chronologmc",
    "url": "/concepts/chronologmc.html"
  },
  {
    "label": "ARM Templates",
    "id": "arm-templates",
    "url": "/concepts/arm-templates.html"
  },
  {
    "label": "Chronolog",
    "id": "chronolog",
    "url": "/concepts/chronolog.html"
  },
  {
    "label": "ChemTrains",
    "id": "chemtrains",
    "url": "/concepts/chemtrains.html"
  },
  {
    "label": "CHARYBDIS",
    "id": "charybdis",
    "url": "/concepts/charybdis.html"
  },
  {
    "label": "Charrette Ada",
    "id": "charrette-ada",
    "url": "/concepts/charrette-ada.html"
  },
  {
    "label": "CHARM++",
    "id": "charmpp",
    "url": "/concepts/charmpp.html"
  },
  {
    "label": "Objective-S",
    "id": "objective-s",
    "url": "/concepts/objective-s.html"
  },
  {
    "label": "objective-modula-2",
    "id": "objective-modula-2",
    "url": "/concepts/objective-modula-2.html"
  },
  {
    "label": "CHAMP",
    "id": "champ",
    "url": "/concepts/champ.html"
  },
  {
    "label": "Ceprol",
    "id": "ceprol",
    "url": "/concepts/ceprol.html"
  },
  {
    "label": "CELLSIM",
    "id": "cellsim",
    "url": "/concepts/cellsim.html"
  },
  {
    "label": "CELIP",
    "id": "celip",
    "url": "/concepts/celip.html"
  },
  {
    "label": "Cedar Fortran",
    "id": "cedar-fortran",
    "url": "/concepts/cedar-fortran.html"
  },
  {
    "label": "neovim-editor",
    "id": "neovim-editor",
    "url": "/concepts/neovim-editor.html"
  },
  {
    "label": "CCEL",
    "id": "ccel",
    "url": "/concepts/ccel.html"
  },
  {
    "label": "CAYLEY",
    "id": "cayley",
    "url": "/concepts/cayley.html"
  },
  {
    "label": "Catalysis",
    "id": "catalysis",
    "url": "/concepts/catalysis.html"
  },
  {
    "label": "IMAP",
    "id": "imap-protocol",
    "url": "/concepts/imap-protocol.html"
  },
  {
    "label": "CASSANDRE",
    "id": "cassandre",
    "url": "/concepts/cassandre.html"
  },
  {
    "label": "Capsule",
    "id": "capsule",
    "url": "/concepts/capsule.html"
  },
  {
    "label": "Common Authentication Protocol Specification Language",
    "id": "capsl",
    "url": "/concepts/capsl.html"
  },
  {
    "label": "Cantor",
    "id": "cantor",
    "url": "/concepts/cantor.html"
  },
  {
    "label": "CAMIL",
    "id": "camil",
    "url": "/concepts/camil.html"
  },
  {
    "label": "CAMAC",
    "id": "camac",
    "url": "/concepts/camac.html"
  },
  {
    "label": "CAISYS",
    "id": "caisys",
    "url": "/concepts/caisys.html"
  },
  {
    "label": "CAGES",
    "id": "cages",
    "url": "/concepts/cages.html"
  },
  {
    "label": "cado-systems-technical-information",
    "id": "cado-systems-technical-information",
    "url": "/concepts/cado-systems-technical-information.html"
  },
  {
    "label": "Cactus",
    "id": "cactus",
    "url": "/concepts/cactus.html"
  },
  {
    "label": "CABAL",
    "id": "cabal",
    "url": "/concepts/cabal.html"
  },
  {
    "label": "min",
    "id": "min",
    "url": "/concepts/min.html"
  },
  {
    "label": "SAUSTALL",
    "id": "saustall",
    "url": "/concepts/saustall.html"
  },
  {
    "label": "C Header Files",
    "id": "c-headers",
    "url": "/concepts/c-headers.html"
  },
  {
    "label": "ByteLisp",
    "id": "bytelisp",
    "url": "/concepts/bytelisp.html"
  },
  {
    "label": "MathWorks File Exchange",
    "id": "mathworks-file-exchange-pm",
    "url": "/concepts/mathworks-file-exchange-pm.html"
  },
  {
    "label": "Up-arrow notation",
    "id": "up-arrow-notation",
    "url": "/concepts/up-arrow-notation.html"
  },
  {
    "label": "Butterfly Common LISP",
    "id": "butterfly-common-lisp",
    "url": "/concepts/butterfly-common-lisp.html"
  },
  {
    "label": "MathLingua",
    "id": "mathlingua",
    "url": "/concepts/mathlingua.html"
  },
  {
    "label": "BUGSYS",
    "id": "bugsys",
    "url": "/concepts/bugsys.html"
  },
  {
    "label": "SALE",
    "id": "sale",
    "url": "/concepts/sale.html"
  },
  {
    "label": "BSP",
    "id": "bsp",
    "url": "/concepts/bsp.html"
  },
  {
    "label": "BSML",
    "id": "bsml",
    "url": "/concepts/bsml.html"
  },
  {
    "label": "Markdeep",
    "id": "markdeep",
    "url": "/concepts/markdeep.html"
  },
  {
    "label": "Brisk",
    "id": "brisk",
    "url": "/concepts/brisk.html"
  },
  {
    "label": "Basic Petri Net Programming Notation",
    "id": "bpn2",
    "url": "/concepts/bpn2.html"
  },
  {
    "label": "BPL",
    "id": "bpl",
    "url": "/concepts/bpl.html"
  },
  {
    "label": "Boxer",
    "id": "boxer",
    "url": "/concepts/boxer.html"
  },
  {
    "label": "Bounce",
    "id": "bounce",
    "url": "/concepts/bounce.html"
  },
  {
    "label": "Bossam Rule Language",
    "id": "bossam",
    "url": "/concepts/bossam.html"
  },
  {
    "label": "Borneo",
    "id": "borneo",
    "url": "/concepts/borneo.html"
  },
  {
    "label": "Booster",
    "id": "booster",
    "url": "/concepts/booster.html"
  },
  {
    "label": "BOIL",
    "id": "boil",
    "url": "/concepts/boil.html"
  },
  {
    "label": "Bob",
    "id": "bob",
    "url": "/concepts/bob.html"
  },
  {
    "label": "BMD",
    "id": "bmd",
    "url": "/concepts/bmd.html"
  },
  {
    "label": "BLOOMS",
    "id": "blooms",
    "url": "/concepts/blooms.html"
  },
  {
    "label": "BLAZE",
    "id": "blaze",
    "url": "/concepts/blaze.html"
  },
  {
    "label": "lasp",
    "id": "lasp",
    "url": "/concepts/lasp.html"
  },
  {
    "label": "BIOSSIM",
    "id": "biossim",
    "url": "/concepts/biossim.html"
  },
  {
    "label": "BIOMOD",
    "id": "biomod",
    "url": "/concepts/biomod.html"
  },
  {
    "label": "Binary Equation",
    "id": "binary-equation",
    "url": "/concepts/binary-equation.html"
  },
  {
    "label": "l",
    "id": "l",
    "url": "/concepts/l.html"
  },
  {
    "label": "Bigloo",
    "id": "bigloo",
    "url": "/concepts/bigloo.html"
  },
  {
    "label": "klong",
    "id": "klong",
    "url": "/concepts/klong.html"
  },
  {
    "label": "BHSL",
    "id": "bhsl",
    "url": "/concepts/bhsl.html"
  },
  {
    "label": "BGRAF2",
    "id": "bgraf2",
    "url": "/concepts/bgraf2.html"
  },
  {
    "label": "Beta-Prolog",
    "id": "beta-prolog",
    "url": "/concepts/beta-prolog.html"
  },
  {
    "label": "BESYS",
    "id": "besys",
    "url": "/concepts/besys.html"
  },
  {
    "label": "kate-editor",
    "id": "kate-editor",
    "url": "/concepts/kate-editor.html"
  },
  {
    "label": "juttle",
    "id": "juttle",
    "url": "/concepts/juttle.html"
  },
  {
    "label": "JuliaHub Packages",
    "id": "juliahub-pm",
    "url": "/concepts/juliahub-pm.html"
  },
  {
    "label": "JSYNC",
    "id": "jsync",
    "url": "/concepts/jsync.html"
  },
  {
    "label": "JSGF",
    "id": "jsgf",
    "url": "/concepts/jsgf.html"
  },
  {
    "label": "BEDSOCS",
    "id": "bedsocs",
    "url": "/concepts/bedsocs.html"
  },
  {
    "label": "joker",
    "id": "joker",
    "url": "/concepts/joker.html"
  },
  {
    "label": "Vienna Definition Language",
    "id": "vienna-definition-language",
    "url": "/concepts/vienna-definition-language.html"
  },
  {
    "label": "JMESPath",
    "id": "jmespath",
    "url": "/concepts/jmespath.html"
  },
  {
    "label": "Atari BASIC",
    "id": "atari-basic",
    "url": "/concepts/atari-basic.html"
  },
  {
    "label": "BDL",
    "id": "bdl",
    "url": "/concepts/bdl.html"
  },
  {
    "label": "BC NELIAC",
    "id": "bc-neliac",
    "url": "/concepts/bc-neliac.html"
  },
  {
    "label": "BASIL",
    "id": "basil",
    "url": "/concepts/basil.html"
  },
  {
    "label": "Basic PDP-1 Lisp",
    "id": "basic-pdp-1-lisp",
    "url": "/concepts/basic-pdp-1-lisp.html"
  },
  {
    "label": "NATO phonetic alphabet",
    "id": "nato-phonetic-alphabet",
    "url": "/concepts/nato-phonetic-alphabet.html"
  },
  {
    "label": "Bartok",
    "id": "bartok",
    "url": "/concepts/bartok.html"
  },
  {
    "label": "Baltík",
    "id": "baltik",
    "url": "/concepts/baltik.html"
  },
  {
    "label": "Hex-Rays",
    "id": "hex-rays",
    "url": "/concepts/hex-rays.html"
  },
  {
    "label": "RAPIDWRITE",
    "id": "rapidwrite",
    "url": "/concepts/rapidwrite.html"
  },
  {
    "label": "rapidgen-rpl",
    "id": "rapidgen-rpl",
    "url": "/concepts/rapidgen-rpl.html"
  },
  {
    "label": "BALSA",
    "id": "balsa",
    "url": "/concepts/balsa.html"
  },
  {
    "label": "XGBoost",
    "id": "xgboost",
    "url": "/concepts/xgboost.html"
  },
  {
    "label": "Autoconf",
    "id": "autoconf",
    "url": "/concepts/autoconf.html"
  },
  {
    "label": "RAND-ABEL",
    "id": "rand-abel",
    "url": "/concepts/rand-abel.html"
  },
  {
    "label": "BALM",
    "id": "balm",
    "url": "/concepts/balm.html"
  },
  {
    "label": "helium",
    "id": "helium",
    "url": "/concepts/helium.html"
  },
  {
    "label": "helena",
    "id": "helena",
    "url": "/concepts/helena.html"
  },
  {
    "label": "BALG",
    "id": "balg",
    "url": "/concepts/balg.html"
  },
  {
    "label": "QUIKTRAN",
    "id": "quiktran",
    "url": "/concepts/quiktran.html"
  },
  {
    "label": "QR code",
    "id": "qr-code",
    "url": "/concepts/qr-code.html"
  },
  {
    "label": "B4Tran",
    "id": "b4tran",
    "url": "/concepts/b4tran.html"
  },
  {
    "label": "GSQL",
    "id": "gsql",
    "url": "/concepts/gsql.html"
  },
  {
    "label": "Avalon/Common LISP",
    "id": "avalon-common-lisp",
    "url": "/concepts/avalon-common-lisp.html"
  },
  {
    "label": "General purpose",
    "id": "gp",
    "url": "/concepts/gp.html"
  },
  {
    "label": "AUTOMAST",
    "id": "automast",
    "url": "/concepts/automast.html"
  },
  {
    "label": "google-data-studio-app",
    "id": "google-data-studio-app",
    "url": "/concepts/google-data-studio-app.html"
  },
  {
    "label": "AUTOGRP",
    "id": "autogrp",
    "url": "/concepts/autogrp.html"
  },
  {
    "label": "Pygmalion",
    "id": "pygmalion",
    "url": "/concepts/pygmalion.html"
  },
  {
    "label": "AUTODRAFT",
    "id": "autodraft",
    "url": "/concepts/autodraft.html"
  },
  {
    "label": "AUTASIM",
    "id": "autasim",
    "url": "/concepts/autasim.html"
  },
  {
    "label": "Gnome Basic",
    "id": "gnome-basic",
    "url": "/concepts/gnome-basic.html"
  },
  {
    "label": "X PixMap",
    "id": "xpm-format",
    "url": "/concepts/xpm-format.html"
  },
  {
    "label": "glitch-editor",
    "id": "glitch-editor",
    "url": "/concepts/glitch-editor.html"
  },
  {
    "label": "ATOL",
    "id": "atol",
    "url": "/concepts/atol.html"
  },
  {
    "label": "Ghidra",
    "id": "ghidra-decompiler",
    "url": "/concepts/ghidra-decompiler.html"
  },
  {
    "label": "Unicode",
    "id": "unicode",
    "url": "/concepts/unicode.html"
  },
  {
    "label": "UTF-8",
    "id": "utf-8",
    "url": "/concepts/utf-8.html"
  },
  {
    "label": "ASTLOG",
    "id": "astlog",
    "url": "/concepts/astlog.html"
  },
  {
    "label": "Genshi Text",
    "id": "genshi-text",
    "url": "/concepts/genshi-text.html"
  },
  {
    "label": "Asspegique",
    "id": "asspegique",
    "url": "/concepts/asspegique.html"
  },
  {
    "label": "gemini-protocol",
    "id": "gemini-protocol",
    "url": "/concepts/gemini-protocol.html"
  },
  {
    "label": "associons",
    "id": "associons",
    "url": "/concepts/associons.html"
  },
  {
    "label": "COM Structured Storage",
    "id": "structured-storage",
    "url": "/concepts/structured-storage.html"
  },
  {
    "label": "ASPEN",
    "id": "aspen",
    "url": "/concepts/aspen.html"
  },
  {
    "label": "Speech Synthesis Markup Language",
    "id": "ssml",
    "url": "/concepts/ssml.html"
  },
  {
    "label": "ASF+SDF",
    "id": "asf-sdf",
    "url": "/concepts/asf-sdf.html"
  },
  {
    "label": "Microsoft Notepad",
    "id": "notepad-editor",
    "url": "/concepts/notepad-editor.html"
  },
  {
    "label": "Protosynthex",
    "id": "protosynthex",
    "url": "/concepts/protosynthex.html"
  },
  {
    "label": "ASCII Armor",
    "id": "ascii-armor",
    "url": "/concepts/ascii-armor.html"
  },
  {
    "label": "AUTOCAD",
    "id": "autocad-app",
    "url": "/concepts/autocad-app.html"
  },
  {
    "label": "Lightweight Directory Access Protocol",
    "id": "ldap",
    "url": "/concepts/ldap.html"
  },
  {
    "label": "Network Time Protocol",
    "id": "ntp",
    "url": "/concepts/ntp.html"
  },
  {
    "label": "Armani",
    "id": "armani",
    "url": "/concepts/armani.html"
  },
  {
    "label": "SHRDLU",
    "id": "shrdlu",
    "url": "/concepts/shrdlu.html"
  },
  {
    "label": "ARK",
    "id": "ark",
    "url": "/concepts/ark.html"
  },
  {
    "label": "Arjuna",
    "id": "arjuna",
    "url": "/concepts/arjuna.html"
  },
  {
    "label": "ARCHI",
    "id": "archi",
    "url": "/concepts/archi.html"
  },
  {
    "label": "ICD-10-CM diagnosis",
    "id": "icd",
    "url": "/concepts/icd.html"
  },
  {
    "label": "tbox-lib",
    "id": "tbox-lib",
    "url": "/concepts/tbox-lib.html"
  },
  {
    "label": "ARABLAN",
    "id": "arablan",
    "url": "/concepts/arablan.html"
  },
  {
    "label": "Aquarius Prolog",
    "id": "aquarius-prolog",
    "url": "/concepts/aquarius-prolog.html"
  },
  {
    "label": "AQL",
    "id": "aql",
    "url": "/concepts/aql.html"
  },
  {
    "label": "eno",
    "id": "eno",
    "url": "/concepts/eno.html"
  },
  {
    "label": "Security Assertion Markup Language",
    "id": "saml",
    "url": "/concepts/saml.html"
  },
  {
    "label": "Blender",
    "id": "blender-app",
    "url": "/concepts/blender-app.html"
  },
  {
    "label": "APROL",
    "id": "aprol",
    "url": "/concepts/aprol.html"
  },
  {
    "label": "APPLOG",
    "id": "applog",
    "url": "/concepts/applog.html"
  },
  {
    "label": "APPL/A",
    "id": "appl-a",
    "url": "/concepts/appl-a.html"
  },
  {
    "label": "APOSTLE",
    "id": "apostle",
    "url": "/concepts/apostle.html"
  },
  {
    "label": "APLGOL",
    "id": "aplgol",
    "url": "/concepts/aplgol.html"
  },
  {
    "label": "APLGOL-2",
    "id": "aplgol-2",
    "url": "/concepts/aplgol-2.html"
  },
  {
    "label": "ExFAT",
    "id": "exfat",
    "url": "/concepts/exfat.html"
  },
  {
    "label": "APL/Z80",
    "id": "apl-z80",
    "url": "/concepts/apl-z80.html"
  },
  {
    "label": "APAREL",
    "id": "aparel",
    "url": "/concepts/aparel.html"
  },
  {
    "label": "APAR",
    "id": "apar",
    "url": "/concepts/apar.html"
  },
  {
    "label": "A-0 system",
    "id": "a-0-system",
    "url": "/concepts/a-0-system.html"
  },
  {
    "label": "Snowman",
    "id": "snowman-decompiler",
    "url": "/concepts/snowman-decompiler.html"
  },
  {
    "label": "ANSI BASIC",
    "id": "ansi-basic",
    "url": "/concepts/ansi-basic.html"
  },
  {
    "label": "Pλ⍵NK",
    "id": "plunk",
    "url": "/concepts/plunk.html"
  },
  {
    "label": "ANS MUMPS",
    "id": "ans-mumps",
    "url": "/concepts/ans-mumps.html"
  },
  {
    "label": "Parasolid",
    "id": "parasolid",
    "url": "/concepts/parasolid.html"
  },
  {
    "label": "ZGRASS",
    "id": "zgrass",
    "url": "/concepts/zgrass.html"
  },
  {
    "label": "Andorra-I",
    "id": "andorra-i",
    "url": "/concepts/andorra-i.html"
  },
  {
    "label": "Andante",
    "id": "andante",
    "url": "/concepts/andante.html"
  },
  {
    "label": "Shapefile",
    "id": "shapefile",
    "url": "/concepts/shapefile.html"
  },
  {
    "label": "Apache Cassandra",
    "id": "apache-cassandra",
    "url": "/concepts/apache-cassandra.html"
  },
  {
    "label": "ZCCS",
    "id": "zccs",
    "url": "/concepts/zccs.html"
  },
  {
    "label": "And/Or",
    "id": "and-or",
    "url": "/concepts/and-or.html"
  },
  {
    "label": "Object Definition Language",
    "id": "object-definition-language",
    "url": "/concepts/object-definition-language.html"
  },
  {
    "label": "Amulet",
    "id": "amulet",
    "url": "/concepts/amulet.html"
  },
  {
    "label": "YugabyteDB",
    "id": "yugabytedb",
    "url": "/concepts/yugabytedb.html"
  },
  {
    "label": "cx",
    "id": "cx",
    "url": "/concepts/cx.html"
  },
  {
    "label": "HeLang",
    "id": "helang",
    "url": "/concepts/helang.html"
  },
  {
    "label": "Autodesk Revit",
    "id": "revit-app",
    "url": "/concepts/revit-app.html"
  },
  {
    "label": "Reko",
    "id": "reko-decompiler",
    "url": "/concepts/reko-decompiler.html"
  },
  {
    "label": "PL-X",
    "id": "pl-x",
    "url": "/concepts/pl-x.html"
  },
  {
    "label": "AMPPL-I",
    "id": "amppl-i",
    "url": "/concepts/amppl-i.html"
  },
  {
    "label": "ctalk",
    "id": "ctalk",
    "url": "/concepts/ctalk.html"
  },
  {
    "label": "Kaggle",
    "id": "kaggle-app",
    "url": "/concepts/kaggle-app.html"
  },
  {
    "label": "PL/S",
    "id": "pl-s",
    "url": "/concepts/pl-s.html"
  },
  {
    "label": "AMBUSH",
    "id": "ambush",
    "url": "/concepts/ambush.html"
  },
  {
    "label": ".dwg",
    "id": "dwg",
    "url": "/concepts/dwg.html"
  },
  {
    "label": "XTRAN",
    "id": "xtran",
    "url": "/concepts/xtran.html"
  },
  {
    "label": "PL/S-II",
    "id": "pl-s-ii",
    "url": "/concepts/pl-s-ii.html"
  },
  {
    "label": "crack",
    "id": "crack",
    "url": "/concepts/crack.html"
  },
  {
    "label": "Molecular Query Language",
    "id": "molecular-query-language",
    "url": "/concepts/molecular-query-language.html"
  },
  {
    "label": "Amber",
    "id": "amber",
    "url": "/concepts/amber.html"
  },
  {
    "label": "MathML",
    "id": "mathml",
    "url": "/concepts/mathml.html"
  },
  {
    "label": "XSIM",
    "id": "xsim",
    "url": "/concepts/xsim.html"
  },
  {
    "label": "Copilot",
    "id": "copilot",
    "url": "/concepts/copilot.html"
  },
  {
    "label": "ivy",
    "id": "ivy",
    "url": "/concepts/ivy.html"
  },
  {
    "label": "XPOP",
    "id": "xpop",
    "url": "/concepts/xpop.html"
  },
  {
    "label": "The Algebra",
    "id": "xml-query-algebra",
    "url": "/concepts/xml-query-algebra.html"
  },
  {
    "label": "XML Query Language",
    "id": "xml-ql",
    "url": "/concepts/xml-ql.html"
  },
  {
    "label": "ALPS",
    "id": "alps",
    "url": "/concepts/alps.html"
  },
  {
    "label": "Lincos",
    "id": "lincos",
    "url": "/concepts/lincos.html"
  },
  {
    "label": "lem-editor",
    "id": "lem-editor",
    "url": "/concepts/lem-editor.html"
  },
  {
    "label": "AutoCAD DXF",
    "id": "dxf",
    "url": "/concepts/dxf.html"
  },
  {
    "label": "XML-GL",
    "id": "xml-gl",
    "url": "/concepts/xml-gl.html"
  },
  {
    "label": "AlpHard",
    "id": "alphard",
    "url": "/concepts/alphard.html"
  },
  {
    "label": "DNS over HTTPS",
    "id": "doh",
    "url": "/concepts/doh.html"
  },
  {
    "label": "AL",
    "id": "al",
    "url": "/concepts/al.html"
  },
  {
    "label": "XCY",
    "id": "xcy",
    "url": "/concepts/xcy.html"
  },
  {
    "label": "Alma",
    "id": "alma",
    "url": "/concepts/alma.html"
  },
  {
    "label": "xCard",
    "id": "xcard",
    "url": "/concepts/xcard.html"
  },
  {
    "label": "xADL",
    "id": "xadl",
    "url": "/concepts/xadl.html"
  },
  {
    "label": "ALLO",
    "id": "allo",
    "url": "/concepts/allo.html"
  },
  {
    "label": "HFS Plus",
    "id": "hfs-plus",
    "url": "/concepts/hfs-plus.html"
  },
  {
    "label": "X11-Basic",
    "id": "x11-basic",
    "url": "/concepts/x11-basic.html"
  },
  {
    "label": "X-KLAIM",
    "id": "x-klaim",
    "url": "/concepts/x-klaim.html"
  },
  {
    "label": "Committee on Uniform Security Identification Procedures",
    "id": "cusip",
    "url": "/concepts/cusip.html"
  },
  {
    "label": "WYLBUR",
    "id": "wylbur",
    "url": "/concepts/wylbur.html"
  },
  {
    "label": "WRITEACOURSE",
    "id": "writeacourse",
    "url": "/concepts/writeacourse.html"
  },
  {
    "label": "circa",
    "id": "circa",
    "url": "/concepts/circa.html"
  },
  {
    "label": "Peridot",
    "id": "peridot",
    "url": "/concepts/peridot.html"
  },
  {
    "label": "Memex",
    "id": "memex-machine",
    "url": "/concepts/memex-machine.html"
  },
  {
    "label": "Cheri",
    "id": "cheri",
    "url": "/concepts/cheri.html"
  },
  {
    "label": "ballerina-central-pm",
    "id": "ballerina-central-pm",
    "url": "/concepts/ballerina-central-pm.html"
  },
  {
    "label": "Whirlwind",
    "id": "whirlwind",
    "url": "/concepts/whirlwind.html"
  },
  {
    "label": "VML",
    "id": "vml",
    "url": "/concepts/vml.html"
  },
  {
    "label": "Ext3",
    "id": "ext3",
    "url": "/concepts/ext3.html"
  },
  {
    "label": "Pegasus AUTOCODE",
    "id": "pegasus-autocode",
    "url": "/concepts/pegasus-autocode.html"
  },
  {
    "label": "Windows Registry Entries",
    "id": "windows-registry-entries",
    "url": "/concepts/windows-registry-entries.html"
  },
  {
    "label": "Yum",
    "id": "yum-pm",
    "url": "/concepts/yum-pm.html"
  },
  {
    "label": "TELOS",
    "id": "telos",
    "url": "/concepts/telos.html"
  },
  {
    "label": "HEIC",
    "id": "heic",
    "url": "/concepts/heic.html"
  },
  {
    "label": "ALDES",
    "id": "aldes",
    "url": "/concepts/aldes.html"
  },
  {
    "label": "chaos-lang",
    "id": "chaos-lang",
    "url": "/concepts/chaos-lang.html"
  },
  {
    "label": "Commodore BASIC",
    "id": "commodore-basic",
    "url": "/concepts/commodore-basic.html"
  },
  {
    "label": "WebL",
    "id": "webl",
    "url": "/concepts/webl.html"
  },
  {
    "label": "HCard",
    "id": "hcard",
    "url": "/concepts/hcard.html"
  },
  {
    "label": "Atmel AVR",
    "id": "atmel-avr",
    "url": "/concepts/atmel-avr.html"
  },
  {
    "label": "WCL",
    "id": "wcl",
    "url": "/concepts/wcl.html"
  },
  {
    "label": "Airtable",
    "id": "airtable-app",
    "url": "/concepts/airtable-app.html"
  },
  {
    "label": "PIC microcontroller",
    "id": "pic-microcontroller",
    "url": "/concepts/pic-microcontroller.html"
  },
  {
    "label": "forest-lang",
    "id": "forest-lang",
    "url": "/concepts/forest-lang.html"
  },
  {
    "label": "VULCAN",
    "id": "vulcan",
    "url": "/concepts/vulcan.html"
  },
  {
    "label": "AIDS",
    "id": "aids",
    "url": "/concepts/aids.html"
  },
  {
    "label": "Nios II",
    "id": "nios",
    "url": "/concepts/nios.html"
  },
  {
    "label": "C^3",
    "id": "c-cubed",
    "url": "/concepts/c-cubed.html"
  },
  {
    "label": "MBASIC",
    "id": "mbasic",
    "url": "/concepts/mbasic.html"
  },
  {
    "label": "X BitMap",
    "id": "x-bitmap",
    "url": "/concepts/x-bitmap.html"
  },
  {
    "label": "MultiDimensional eXpressions",
    "id": "mdx-lang",
    "url": "/concepts/mdx-lang.html"
  },
  {
    "label": "Lucidchart",
    "id": "lucid-chart-app",
    "url": "/concepts/lucid-chart-app.html"
  },
  {
    "label": "VSPL",
    "id": "vspl",
    "url": "/concepts/vspl.html"
  },
  {
    "label": "Wu",
    "id": "wu",
    "url": "/concepts/wu.html"
  },
  {
    "label": "Blockly",
    "id": "blockly",
    "url": "/concepts/blockly.html"
  },
  {
    "label": "Mangle",
    "id": "mangle",
    "url": "/concepts/mangle.html"
  },
  {
    "label": "X PixMap",
    "id": "x-pixmap",
    "url": "/concepts/x-pixmap.html"
  },
  {
    "label": "VPL",
    "id": "vpl",
    "url": "/concepts/vpl.html"
  },
  {
    "label": "bx",
    "id": "bx",
    "url": "/concepts/bx.html"
  },
  {
    "label": "Thymeleaf",
    "id": "thymeleaf",
    "url": "/concepts/thymeleaf.html"
  },
  {
    "label": "TextMate",
    "id": "textmate-editor",
    "url": "/concepts/textmate-editor.html"
  },
  {
    "label": "titan",
    "id": "titan",
    "url": "/concepts/titan.html"
  },
  {
    "label": "Textadept",
    "id": "textadept-editor",
    "url": "/concepts/textadept-editor.html"
  },
  {
    "label": "CBOR",
    "id": "cbor",
    "url": "/concepts/cbor.html"
  },
  {
    "label": "Boomerang Decompiler",
    "id": "boomerang-decompiler",
    "url": "/concepts/boomerang-decompiler.html"
  },
  {
    "label": "ARC processor",
    "id": "arc-isa",
    "url": "/concepts/arc-isa.html"
  },
  {
    "label": "business-rule-language",
    "id": "business-rule-language",
    "url": "/concepts/business-rule-language.html"
  },
  {
    "label": "Smalltalk MT",
    "id": "smalltalk-mt",
    "url": "/concepts/smalltalk-mt.html"
  },
  {
    "label": "mirth",
    "id": "mirth",
    "url": "/concepts/mirth.html"
  },
  {
    "label": "3DS",
    "id": "3ds",
    "url": "/concepts/3ds.html"
  },
  {
    "label": "viz",
    "id": "viz",
    "url": "/concepts/viz.html"
  },
  {
    "label": "FOAF",
    "id": "foaf",
    "url": "/concepts/foaf.html"
  },
  {
    "label": "Ubercode",
    "id": "ubercode",
    "url": "/concepts/ubercode.html"
  },
  {
    "label": "LC-3",
    "id": "lc-3",
    "url": "/concepts/lc-3.html"
  },
  {
    "label": "VIVA",
    "id": "viva",
    "url": "/concepts/viva.html"
  },
  {
    "label": "SuperTalk",
    "id": "supertalk",
    "url": "/concepts/supertalk.html"
  },
  {
    "label": "Visual Occam",
    "id": "visual-occam",
    "url": "/concepts/visual-occam.html"
  },
  {
    "label": "ADLIB",
    "id": "adlib",
    "url": "/concepts/adlib.html"
  },
  {
    "label": "BRL",
    "id": "brl",
    "url": "/concepts/brl.html"
  },
  {
    "label": "Ramis software",
    "id": "ramis-software",
    "url": "/concepts/ramis-software.html"
  },
  {
    "label": "TMG",
    "id": "tmg",
    "url": "/concepts/tmg.html"
  },
  {
    "label": "Visual Eiffel",
    "id": "visual-eiffel",
    "url": "/concepts/visual-eiffel.html"
  },
  {
    "label": "ZENO",
    "id": "zeno",
    "url": "/concepts/zeno.html"
  },
  {
    "label": "UBASIC",
    "id": "ubasic",
    "url": "/concepts/ubasic.html"
  },
  {
    "label": "VisaVis",
    "id": "visavis",
    "url": "/concepts/visavis.html"
  },
  {
    "label": "ADES",
    "id": "ades",
    "url": "/concepts/ades.html"
  },
  {
    "label": "Stackless Python",
    "id": "stackless-python",
    "url": "/concepts/stackless-python.html"
  },
  {
    "label": "ADES II",
    "id": "ades-ii",
    "url": "/concepts/ades-ii.html"
  },
  {
    "label": "ScriptBasic",
    "id": "scriptbasic",
    "url": "/concepts/scriptbasic.html"
  },
  {
    "label": "SMX",
    "id": "smx-computer-language",
    "url": "/concepts/smx-computer-language.html"
  },
  {
    "label": "t2b",
    "id": "t2b",
    "url": "/concepts/t2b.html"
  },
  {
    "label": "Viron",
    "id": "viron",
    "url": "/concepts/viron.html"
  },
  {
    "label": "Visual Tool Markup Language",
    "id": "vtml",
    "url": "/concepts/vtml.html"
  },
  {
    "label": "Ratfiv",
    "id": "ratfiv",
    "url": "/concepts/ratfiv.html"
  },
  {
    "label": "SYNAPSE",
    "id": "synapse",
    "url": "/concepts/synapse.html"
  },
  {
    "label": "VIPTRAN",
    "id": "viptran",
    "url": "/concepts/viptran.html"
  },
  {
    "label": "Parse Tree Notation",
    "id": "parse-tree-notation",
    "url": "/concepts/parse-tree-notation.html"
  },
  {
    "label": "PROC procedure language",
    "id": "proc-procedure-language",
    "url": "/concepts/proc-procedure-language.html"
  },
  {
    "label": "ObjectPAL",
    "id": "objectpal",
    "url": "/concepts/objectpal.html"
  },
  {
    "label": "Proteus",
    "id": "proteus-programming-language",
    "url": "/concepts/proteus-programming-language.html"
  },
  {
    "label": "MusicXML",
    "id": "musicxml",
    "url": "/concepts/musicxml.html"
  },
  {
    "label": "Vienna Fortran",
    "id": "vienna-fortran",
    "url": "/concepts/vienna-fortran.html"
  },
  {
    "label": "Object Oberon",
    "id": "object-oberon",
    "url": "/concepts/object-oberon.html"
  },
  {
    "label": "parboiled2",
    "id": "parboiled2",
    "url": "/concepts/parboiled2.html"
  },
  {
    "label": "SYMPL",
    "id": "sympl",
    "url": "/concepts/sympl.html"
  },
  {
    "label": "PIKT",
    "id": "pikt",
    "url": "/concepts/pikt.html"
  },
  {
    "label": "y-lang",
    "id": "y-lang",
    "url": "/concepts/y-lang.html"
  },
  {
    "label": "IBM POWER Instruction Set Architecture",
    "id": "powerisa",
    "url": "/concepts/powerisa.html"
  },
  {
    "label": "Parallax Propeller",
    "id": "parallax-propeller",
    "url": "/concepts/parallax-propeller.html"
  },
  {
    "label": "Edge Side Includes",
    "id": "edge-side-includes",
    "url": "/concepts/edge-side-includes.html"
  },
  {
    "label": "Fossil",
    "id": "fossil-scm",
    "url": "/concepts/fossil-scm.html"
  },
  {
    "label": "eqn",
    "id": "eqn",
    "url": "/concepts/eqn.html"
  },
  {
    "label": "Nested Context Language",
    "id": "nested-context-language",
    "url": "/concepts/nested-context-language.html"
  },
  {
    "label": "Polymorphic Programming Language",
    "id": "polymorphic-programming-language",
    "url": "/concepts/polymorphic-programming-language.html"
  },
  {
    "label": "RAPID",
    "id": "rapid",
    "url": "/concepts/rapid.html"
  },
  {
    "label": "GraphML",
    "id": "graphml",
    "url": "/concepts/graphml.html"
  },
  {
    "label": "XUML",
    "id": "xuml",
    "url": "/concepts/xuml.html"
  },
  {
    "label": "bjou",
    "id": "bjou",
    "url": "/concepts/bjou.html"
  },
  {
    "label": "OPL",
    "id": "opl-langage-informatique",
    "url": "/concepts/opl-langage-informatique.html"
  },
  {
    "label": "ZIM Format",
    "id": "zim-format",
    "url": "/concepts/zim-format.html"
  },
  {
    "label": "Google Data Protcol",
    "id": "gdata",
    "url": "/concepts/gdata.html"
  },
  {
    "label": "VENUS",
    "id": "venus",
    "url": "/concepts/venus.html"
  },
  {
    "label": "Omikron BASIC",
    "id": "omikron-basic",
    "url": "/concepts/omikron-basic.html"
  },
  {
    "label": "Ruby Document format",
    "id": "ruby-document-format",
    "url": "/concepts/ruby-document-format.html"
  },
  {
    "label": "BASIC Programming",
    "id": "basic-programming",
    "url": "/concepts/basic-programming.html"
  },
  {
    "label": "Binary Ninja",
    "id": "binary-ninja",
    "url": "/concepts/binary-ninja.html"
  },
  {
    "label": "Met-English",
    "id": "met-english",
    "url": "/concepts/met-english.html"
  },
  {
    "label": "Autocode",
    "id": "autocode",
    "url": "/concepts/autocode.html"
  },
  {
    "label": "Basic4android",
    "id": "basic4android",
    "url": "/concepts/basic4android.html"
  },
  {
    "label": "Vector PASCAL",
    "id": "vector-pascal",
    "url": "/concepts/vector-pascal.html"
  },
  {
    "label": "SA-C",
    "id": "sa-c-programming-language",
    "url": "/concepts/sa-c-programming-language.html"
  },
  {
    "label": "TUTOR",
    "id": "tutor",
    "url": "/concepts/tutor.html"
  },
  {
    "label": "Sam Coupé",
    "id": "sam-coupe",
    "url": "/concepts/sam-coupe.html"
  },
  {
    "label": "General-purpose macro processor",
    "id": "gema",
    "url": "/concepts/gema.html"
  },
  {
    "label": "ESC/P",
    "id": "esc-p",
    "url": "/concepts/esc-p.html"
  },
  {
    "label": "VARLIST",
    "id": "varlist",
    "url": "/concepts/varlist.html"
  },
  {
    "label": "Actors",
    "id": "actors",
    "url": "/concepts/actors.html"
  },
  {
    "label": "Moonrock Basic Compiler",
    "id": "moonrock-basic-compiler",
    "url": "/concepts/moonrock-basic-compiler.html"
  },
  {
    "label": "MacBASIC",
    "id": "macbasic",
    "url": "/concepts/macbasic.html"
  },
  {
    "label": "ALGO",
    "id": "algo",
    "url": "/concepts/algo.html"
  },
  {
    "label": "VAL II",
    "id": "val-ii",
    "url": "/concepts/val-ii.html"
  },
  {
    "label": "root-format",
    "id": "root-format",
    "url": "/concepts/root-format.html"
  },
  {
    "label": "PS-algol",
    "id": "ps-algol",
    "url": "/concepts/ps-algol.html"
  },
  {
    "label": "NCAR Command Language",
    "id": "ncar-command-language",
    "url": "/concepts/ncar-command-language.html"
  },
  {
    "label": "RenderMan Shading Language",
    "id": "renderman-shading-language",
    "url": "/concepts/renderman-shading-language.html"
  },
  {
    "label": "MUSIC/SP",
    "id": "music-sp",
    "url": "/concepts/music-sp.html"
  },
  {
    "label": "PSYCO",
    "id": "psyco",
    "url": "/concepts/psyco.html"
  },
  {
    "label": "MACRO-11",
    "id": "macro-11",
    "url": "/concepts/macro-11.html"
  },
  {
    "label": "RapidQ",
    "id": "rapidq",
    "url": "/concepts/rapidq.html"
  },
  {
    "label": "SCRIPT markup",
    "id": "script",
    "url": "/concepts/script.html"
  },
  {
    "label": "Mocklisp",
    "id": "mocklisp",
    "url": "/concepts/mocklisp.html"
  },
  {
    "label": "NorthStar BASIC",
    "id": "northstar-basic",
    "url": "/concepts/northstar-basic.html"
  },
  {
    "label": "IITRAN",
    "id": "iitran",
    "url": "/concepts/iitran.html"
  },
  {
    "label": "Joe-E",
    "id": "joe-e",
    "url": "/concepts/joe-e.html"
  },
  {
    "label": "Sing Sharp",
    "id": "sing-sharp",
    "url": "/concepts/sing-sharp.html"
  },
  {
    "label": "VAL",
    "id": "val",
    "url": "/concepts/val.html"
  },
  {
    "label": "V-Promela",
    "id": "v-promela",
    "url": "/concepts/v-promela.html"
  },
  {
    "label": "Sawzall",
    "id": "sawzall",
    "url": "/concepts/sawzall.html"
  },
  {
    "label": "Utopia 84",
    "id": "utopia-84",
    "url": "/concepts/utopia-84.html"
  },
  {
    "label": "Lazy ML",
    "id": "lazyml",
    "url": "/concepts/lazyml.html"
  },
  {
    "label": "Stockholm format",
    "id": "stockholm-format",
    "url": "/concepts/stockholm-format.html"
  },
  {
    "label": "USSA",
    "id": "ussa",
    "url": "/concepts/ussa.html"
  },
  {
    "label": "Jet Propulsion Laboratory Display Information System",
    "id": "jet-propulsion-laboratory-display-information-system",
    "url": "/concepts/jet-propulsion-laboratory-display-information-system.html"
  },
  {
    "label": "Object-Z",
    "id": "object-z",
    "url": "/concepts/object-z.html"
  },
  {
    "label": "PBASIC",
    "id": "pbasic",
    "url": "/concepts/pbasic.html"
  },
  {
    "label": "Python for S60",
    "id": "python-for-s60",
    "url": "/concepts/python-for-s60.html"
  },
  {
    "label": "M",
    "id": "m-programming-language",
    "url": "/concepts/m-programming-language.html"
  },
  {
    "label": "FLACC",
    "id": "flacc",
    "url": "/concepts/flacc.html"
  },
  {
    "label": "GNU E",
    "id": "gnu-e",
    "url": "/concepts/gnu-e.html"
  },
  {
    "label": "Nuprl",
    "id": "nuprl",
    "url": "/concepts/nuprl.html"
  },
  {
    "label": "FILETAB",
    "id": "filetab",
    "url": "/concepts/filetab.html"
  },
  {
    "label": "Janus",
    "id": "janus-programming-language",
    "url": "/concepts/janus-programming-language.html"
  },
  {
    "label": "PASCAL/MT+",
    "id": "pascal-mtp",
    "url": "/concepts/pascal-mtp.html"
  },
  {
    "label": "PROIV",
    "id": "proiv",
    "url": "/concepts/proiv.html"
  },
  {
    "label": "Protel",
    "id": "protel",
    "url": "/concepts/protel.html"
  },
  {
    "label": "Yabasic",
    "id": "yabasic",
    "url": "/concepts/yabasic.html"
  },
  {
    "label": "LSP",
    "id": "language-server-protocol",
    "url": "/concepts/language-server-protocol.html"
  },
  {
    "label": "FastTrack Scripting Host",
    "id": "fasttrack-scripting-host",
    "url": "/concepts/fasttrack-scripting-host.html"
  },
  {
    "label": "ODRL",
    "id": "odrl",
    "url": "/concepts/odrl.html"
  },
  {
    "label": "WOL",
    "id": "wol",
    "url": "/concepts/wol.html"
  },
  {
    "label": "UNRAVEL",
    "id": "unravel",
    "url": "/concepts/unravel.html"
  },
  {
    "label": "IBM Rational SQABasic",
    "id": "ibm-rational-sqabasic",
    "url": "/concepts/ibm-rational-sqabasic.html"
  },
  {
    "label": "IBM 1401 Symbolic Programming System",
    "id": "ibm-1401-symbolic-programming-system",
    "url": "/concepts/ibm-1401-symbolic-programming-system.html"
  },
  {
    "label": "Sibelius",
    "id": "sibelius-software",
    "url": "/concepts/sibelius-software.html"
  },
  {
    "label": "Izibasic",
    "id": "izibasic",
    "url": "/concepts/izibasic.html"
  },
  {
    "label": "DML",
    "id": "dependent-ml",
    "url": "/concepts/dependent-ml.html"
  },
  {
    "label": "Forte 4GL",
    "id": "forte-4gl",
    "url": "/concepts/forte-4gl.html"
  },
  {
    "label": "PL/P",
    "id": "pl-p",
    "url": "/concepts/pl-p.html"
  },
  {
    "label": "DAML+OIL",
    "id": "daml-oil",
    "url": "/concepts/daml-oil.html"
  },
  {
    "label": "FuzzyCLIPS",
    "id": "fuzzyclips",
    "url": "/concepts/fuzzyclips.html"
  },
  {
    "label": "MAI Basic Four",
    "id": "mai-basic-four",
    "url": "/concepts/mai-basic-four.html"
  },
  {
    "label": "Meta II",
    "id": "meta-ii",
    "url": "/concepts/meta-ii.html"
  },
  {
    "label": "Preferred Executable Format",
    "id": "preferred-executable-format",
    "url": "/concepts/preferred-executable-format.html"
  },
  {
    "label": "UNISIM",
    "id": "unisim",
    "url": "/concepts/unisim.html"
  },
  {
    "label": "CorbaScript",
    "id": "corbascript",
    "url": "/concepts/corbascript.html"
  },
  {
    "label": "CorVision",
    "id": "corvision",
    "url": "/concepts/corvision.html"
  },
  {
    "label": "Cornell University Programming Language",
    "id": "cornell-university-programming-language",
    "url": "/concepts/cornell-university-programming-language.html"
  },
  {
    "label": "HP-GL",
    "id": "hp-gl",
    "url": "/concepts/hp-gl.html"
  },
  {
    "label": "iCalendar",
    "id": "icalendar-format",
    "url": "/concepts/icalendar-format.html"
  },
  {
    "label": "Compact Application Solution Language",
    "id": "compact-application-solution-language",
    "url": "/concepts/compact-application-solution-language.html"
  },
  {
    "label": "Join Java",
    "id": "join-java",
    "url": "/concepts/join-java.html"
  },
  {
    "label": "Trellis",
    "id": "trellis",
    "url": "/concepts/trellis.html"
  },
  {
    "label": "UNICORN",
    "id": "unicorn",
    "url": "/concepts/unicorn.html"
  },
  {
    "label": "Arturo",
    "id": "arturo",
    "url": "/concepts/arturo.html"
  },
  {
    "label": "CaPSL",
    "id": "canon-capsl",
    "url": "/concepts/canon-capsl.html"
  },
  {
    "label": "CEEMAC",
    "id": "ceemac",
    "url": "/concepts/ceemac.html"
  },
  {
    "label": "COFFEE Cinema 4D",
    "id": "coffee-cinema-4d",
    "url": "/concepts/coffee-cinema-4d.html"
  },
  {
    "label": "Beta BASIC",
    "id": "beta-basic",
    "url": "/concepts/beta-basic.html"
  },
  {
    "label": "whack",
    "id": "whack",
    "url": "/concepts/whack.html"
  },
  {
    "label": "GeneXus",
    "id": "genexus",
    "url": "/concepts/genexus.html"
  },
  {
    "label": "Short Code computer language",
    "id": "short-code-computer-language",
    "url": "/concepts/short-code-computer-language.html"
  },
  {
    "label": "Oxide",
    "id": "oxide",
    "url": "/concepts/oxide.html"
  },
  {
    "label": "ABEL",
    "id": "abel",
    "url": "/concepts/abel.html"
  },
  {
    "label": "Bywater BASIC",
    "id": "bywater-basic",
    "url": "/concepts/bywater-basic.html"
  },
  {
    "label": "Texy!",
    "id": "texy",
    "url": "/concepts/texy.html"
  },
  {
    "label": "FpgaC",
    "id": "fpgac",
    "url": "/concepts/fpgac.html"
  },
  {
    "label": "Subtext",
    "id": "subtext",
    "url": "/concepts/subtext.html"
  },
  {
    "label": "GUIDO music notation",
    "id": "guido-music-notation",
    "url": "/concepts/guido-music-notation.html"
  },
  {
    "label": "Hopscotch",
    "id": "hopscotch",
    "url": "/concepts/hopscotch.html"
  },
  {
    "label": "Perl Data Language",
    "id": "perl-data-language",
    "url": "/concepts/perl-data-language.html"
  },
  {
    "label": "MML",
    "id": "man-machine-language",
    "url": "/concepts/man-machine-language.html"
  },
  {
    "label": "UMTA",
    "id": "umta",
    "url": "/concepts/umta.html"
  },
  {
    "label": "Zot",
    "id": "zot",
    "url": "/concepts/zot.html"
  },
  {
    "label": "Moby",
    "id": "moby-programming-language",
    "url": "/concepts/moby-programming-language.html"
  },
  {
    "label": "Batari Basic",
    "id": "batari-basic",
    "url": "/concepts/batari-basic.html"
  },
  {
    "label": "CA-Realizer",
    "id": "ca-realizer",
    "url": "/concepts/ca-realizer.html"
  },
  {
    "label": "Basic4GL",
    "id": "basic4gl",
    "url": "/concepts/basic4gl.html"
  },
  {
    "label": "BCX",
    "id": "bcx",
    "url": "/concepts/bcx.html"
  },
  {
    "label": "LispWorks",
    "id": "lispworks",
    "url": "/concepts/lispworks.html"
  },
  {
    "label": "HyTime",
    "id": "hytime",
    "url": "/concepts/hytime.html"
  },
  {
    "label": "Model 204",
    "id": "model-204",
    "url": "/concepts/model-204.html"
  },
  {
    "label": "Gene transfer format",
    "id": "gtf-format",
    "url": "/concepts/gtf-format.html"
  },
  {
    "label": "Tynker",
    "id": "tynker",
    "url": "/concepts/tynker.html"
  },
  {
    "label": "UFO",
    "id": "ufo",
    "url": "/concepts/ufo.html"
  },
  {
    "label": "Stutter",
    "id": "stutter-lang",
    "url": "/concepts/stutter-lang.html"
  },
  {
    "label": "Hbasic",
    "id": "hbasic",
    "url": "/concepts/hbasic.html"
  },
  {
    "label": "Business application language",
    "id": "business-application-language",
    "url": "/concepts/business-application-language.html"
  },
  {
    "label": "Atari Microsoft BASIC",
    "id": "atari-microsoft-basic",
    "url": "/concepts/atari-microsoft-basic.html"
  },
  {
    "label": "Basic4ppc",
    "id": "basic4ppc",
    "url": "/concepts/basic4ppc.html"
  },
  {
    "label": "Cullinet",
    "id": "cullinet",
    "url": "/concepts/cullinet.html"
  },
  {
    "label": "IDL specification language",
    "id": "idl-sl",
    "url": "/concepts/idl-sl.html"
  },
  {
    "label": "EasyLanguage",
    "id": "easylanguage",
    "url": "/concepts/easylanguage.html"
  },
  {
    "label": "Flowcode",
    "id": "flowcode",
    "url": "/concepts/flowcode.html"
  },
  {
    "label": "Integer BASIC",
    "id": "integer-basic",
    "url": "/concepts/integer-basic.html"
  },
  {
    "label": "UFL",
    "id": "ufl",
    "url": "/concepts/ufl.html"
  },
  {
    "label": "antha",
    "id": "antha",
    "url": "/concepts/antha.html"
  },
  {
    "label": "Escapade",
    "id": "escapade-programming-language",
    "url": "/concepts/escapade-programming-language.html"
  },
  {
    "label": "ALGOL 68-R",
    "id": "algol-68-r",
    "url": "/concepts/algol-68-r.html"
  },
  {
    "label": "Kermeta",
    "id": "kermeta",
    "url": "/concepts/kermeta.html"
  },
  {
    "label": "BEFLIX",
    "id": "beflix",
    "url": "/concepts/beflix.html"
  },
  {
    "label": "CS-Script",
    "id": "cs-script",
    "url": "/concepts/cs-script.html"
  },
  {
    "label": "Li-Chen Wang",
    "id": "li-chen-wang",
    "url": "/concepts/li-chen-wang.html"
  },
  {
    "label": "ABC ALGOL",
    "id": "abc-algol",
    "url": "/concepts/abc-algol.html"
  },
  {
    "label": "angr",
    "id": "angr",
    "url": "/concepts/angr.html"
  },
  {
    "label": "AMBIT",
    "id": "ambit",
    "url": "/concepts/ambit.html"
  },
  {
    "label": "Agora",
    "id": "agora",
    "url": "/concepts/agora.html"
  },
  {
    "label": "sugartex",
    "id": "sugartex",
    "url": "/concepts/sugartex.html"
  },
  {
    "label": "Color BASIC",
    "id": "color-basic",
    "url": "/concepts/color-basic.html"
  },
  {
    "label": "Energy Systems Language",
    "id": "energese-notation",
    "url": "/concepts/energese-notation.html"
  },
  {
    "label": "Ubik",
    "id": "ubik",
    "url": "/concepts/ubik.html"
  },
  {
    "label": "Boost C++ libraries",
    "id": "boost-lib",
    "url": "/concepts/boost-lib.html"
  },
  {
    "label": "t-lang",
    "id": "t-lang",
    "url": "/concepts/t-lang.html"
  },
  {
    "label": "IpTables Rope",
    "id": "iptables-rope",
    "url": "/concepts/iptables-rope.html"
  },
  {
    "label": "CHIP",
    "id": "chip-programming-language",
    "url": "/concepts/chip-programming-language.html"
  },
  {
    "label": "APSE",
    "id": "apse",
    "url": "/concepts/apse.html"
  },
  {
    "label": "ARITH-MATIC",
    "id": "arith-matic",
    "url": "/concepts/arith-matic.html"
  },
  {
    "label": "CMU Common Lisp",
    "id": "cmu-common-lisp",
    "url": "/concepts/cmu-common-lisp.html"
  },
  {
    "label": "Concurrent ML",
    "id": "concurrent-ml",
    "url": "/concepts/concurrent-ml.html"
  },
  {
    "label": "Algebraic modeling language",
    "id": "algebraic-modeling-language",
    "url": "/concepts/algebraic-modeling-language.html"
  },
  {
    "label": "Bounce",
    "id": "bounce-lang",
    "url": "/concepts/bounce-lang.html"
  },
  {
    "label": "UberScript",
    "id": "uberscript",
    "url": "/concepts/uberscript.html"
  },
  {
    "label": "Aardappel",
    "id": "aardappel",
    "url": "/concepts/aardappel.html"
  },
  {
    "label": "albatross",
    "id": "albatross",
    "url": "/concepts/albatross.html"
  },
  {
    "label": "Lax",
    "id": "lax",
    "url": "/concepts/lax.html"
  },
  {
    "label": "TextFrame",
    "id": "textframe",
    "url": "/concepts/textframe.html"
  },
  {
    "label": "CHAIN",
    "id": "chain-programming-language",
    "url": "/concepts/chain-programming-language.html"
  },
  {
    "label": "20-GATE",
    "id": "20-gate",
    "url": "/concepts/20-gate.html"
  },
  {
    "label": "Dixy",
    "id": "dixy",
    "url": "/concepts/dixy.html"
  },
  {
    "label": "51forth",
    "id": "51forth",
    "url": "/concepts/51forth.html"
  },
  {
    "label": "R2ML",
    "id": "r2ml",
    "url": "/concepts/r2ml.html"
  },
  {
    "label": "3APL",
    "id": "3apl",
    "url": "/concepts/3apl.html"
  },
  {
    "label": "Actor-Based Concurrent Language",
    "id": "abcl",
    "url": "/concepts/abcl.html"
  },
  {
    "label": "Abstract State Machine Language",
    "id": "abstract-state-machine-language",
    "url": "/concepts/abstract-state-machine-language.html"
  },
  {
    "label": "Alma-0",
    "id": "alma-0",
    "url": "/concepts/alma-0.html"
  },
  {
    "label": "UAN",
    "id": "uan",
    "url": "/concepts/uan.html"
  },
  {
    "label": "AArch64",
    "id": "aarch64",
    "url": "/concepts/aarch64.html"
  },
  {
    "label": "taxa",
    "id": "taxa",
    "url": "/concepts/taxa.html"
  },
  {
    "label": "wats",
    "id": "wats",
    "url": "/concepts/wats.html"
  },
  {
    "label": "U-Datalog",
    "id": "u-datalog",
    "url": "/concepts/u-datalog.html"
  },
  {
    "label": "A51 Assembly",
    "id": "a51",
    "url": "/concepts/a51.html"
  },
  {
    "label": "psyche",
    "id": "psyche",
    "url": "/concepts/psyche.html"
  },
  {
    "label": "tridash",
    "id": "tridash",
    "url": "/concepts/tridash.html"
  },
  {
    "label": "TyRuBa",
    "id": "tyruba",
    "url": "/concepts/tyruba.html"
  },
  {
    "label": "Khi",
    "id": "khi",
    "url": "/concepts/khi.html"
  },
  {
    "label": "algobox",
    "id": "algobox",
    "url": "/concepts/algobox.html"
  },
  {
    "label": "gfoo",
    "id": "gfoo",
    "url": "/concepts/gfoo.html"
  },
  {
    "label": "Tyco",
    "id": "tyco",
    "url": "/concepts/tyco.html"
  },
  {
    "label": "8th",
    "id": "8th",
    "url": "/concepts/8th.html"
  },
  {
    "label": "Blox",
    "id": "blox",
    "url": "/concepts/blox.html"
  },
  {
    "label": "Tutorial D",
    "id": "tutorial-d",
    "url": "/concepts/tutorial-d.html"
  },
  {
    "label": "turnstile-plus",
    "id": "turnstile-plus",
    "url": "/concepts/turnstile-plus.html"
  },
  {
    "label": "Turing Plus",
    "id": "turing-plus",
    "url": "/concepts/turing-plus.html"
  },
  {
    "label": "2-pak",
    "id": "2-pak",
    "url": "/concepts/2-pak.html"
  },
  {
    "label": "TSQL2",
    "id": "tsql2",
    "url": "/concepts/tsql2.html"
  },
  {
    "label": "TSL",
    "id": "tsl",
    "url": "/concepts/tsl.html"
  },
  {
    "label": "triroff",
    "id": "triroff",
    "url": "/concepts/triroff.html"
  },
  {
    "label": "TREET",
    "id": "treet",
    "url": "/concepts/treet.html"
  },
  {
    "label": "OMNITAB",
    "id": "omnitab",
    "url": "/concepts/omnitab.html"
  },
  {
    "label": "OMNITAB II",
    "id": "omnitab-ii",
    "url": "/concepts/omnitab-ii.html"
  },
  {
    "label": "Transforma",
    "id": "transforma",
    "url": "/concepts/transforma.html"
  },
  {
    "label": "TRANQUIL",
    "id": "tranquil",
    "url": "/concepts/tranquil.html"
  },
  {
    "label": "TRAMP",
    "id": "tramp",
    "url": "/concepts/tramp.html"
  },
  {
    "label": "Traits",
    "id": "traits",
    "url": "/concepts/traits.html"
  },
  {
    "label": "Trafola-H",
    "id": "trafola-h",
    "url": "/concepts/trafola-h.html"
  },
  {
    "label": "TPDL*",
    "id": "tpdl-star",
    "url": "/concepts/tpdl-star.html"
  },
  {
    "label": "TOOLBUS",
    "id": "toolbus",
    "url": "/concepts/toolbus.html"
  },
  {
    "label": "Tinkertoy",
    "id": "tinkertoy",
    "url": "/concepts/tinkertoy.html"
  },
  {
    "label": "Timed CSP",
    "id": "timed-csp",
    "url": "/concepts/timed-csp.html"
  },
  {
    "label": "TiDB",
    "id": "tidb",
    "url": "/concepts/tidb.html"
  },
  {
    "label": "TICS",
    "id": "tics",
    "url": "/concepts/tics.html"
  },
  {
    "label": "THREADED LISTS",
    "id": "threaded-lists",
    "url": "/concepts/threaded-lists.html"
  },
  {
    "label": "The Message System",
    "id": "the-message-system",
    "url": "/concepts/the-message-system.html"
  },
  {
    "label": "TFL",
    "id": "tfl",
    "url": "/concepts/tfl.html"
  },
  {
    "label": "Teradata",
    "id": "teradata",
    "url": "/concepts/teradata.html"
  },
  {
    "label": "Navigational User's Language",
    "id": "nul-lang",
    "url": "/concepts/nul-lang.html"
  },
  {
    "label": "Teradata Aster",
    "id": "teradata-aster",
    "url": "/concepts/teradata-aster.html"
  },
  {
    "label": "Temporal Prolog",
    "id": "temporal-prolog",
    "url": "/concepts/temporal-prolog.html"
  },
  {
    "label": "Templar",
    "id": "templar",
    "url": "/concepts/templar.html"
  },
  {
    "label": "TELSIM",
    "id": "telsim",
    "url": "/concepts/telsim.html"
  },
  {
    "label": "telefile-assembly",
    "id": "telefile-assembly",
    "url": "/concepts/telefile-assembly.html"
  },
  {
    "label": "TDMS",
    "id": "tdms",
    "url": "/concepts/tdms.html"
  },
  {
    "label": "TDFL",
    "id": "tdfl",
    "url": "/concepts/tdfl.html"
  },
  {
    "label": "NJCL",
    "id": "njcl",
    "url": "/concepts/njcl.html"
  },
  {
    "label": "TCSP",
    "id": "tcsp",
    "url": "/concepts/tcsp.html"
  },
  {
    "label": "TCOZ",
    "id": "tcoz",
    "url": "/concepts/tcoz.html"
  },
  {
    "label": "tcc",
    "id": "tcc",
    "url": "/concepts/tcc.html"
  },
  {
    "label": "Noms GraphQL",
    "id": "ngql",
    "url": "/concepts/ngql.html"
  },
  {
    "label": "Taxis",
    "id": "taxis",
    "url": "/concepts/taxis.html"
  },
  {
    "label": "Tarmac",
    "id": "tarmac",
    "url": "/concepts/tarmac.html"
  },
  {
    "label": "taktentus",
    "id": "taktentus",
    "url": "/concepts/taktentus.html"
  },
  {
    "label": "TAC",
    "id": "tac",
    "url": "/concepts/tac.html"
  },
  {
    "label": "TABTRAN",
    "id": "tabtran",
    "url": "/concepts/tabtran.html"
  },
  {
    "label": "TABSOL",
    "id": "tabsol",
    "url": "/concepts/tabsol.html"
  },
  {
    "label": "TABLOG",
    "id": "tablog",
    "url": "/concepts/tablog.html"
  },
  {
    "label": "SYNTOL",
    "id": "syntol",
    "url": "/concepts/syntol.html"
  },
  {
    "label": "SYNPROC",
    "id": "synproc",
    "url": "/concepts/synproc.html"
  },
  {
    "label": "SYNGLISH",
    "id": "synglish",
    "url": "/concepts/synglish.html"
  },
  {
    "label": "SW2",
    "id": "sw2",
    "url": "/concepts/sw2.html"
  },
  {
    "label": "N",
    "id": "n",
    "url": "/concepts/n.html"
  },
  {
    "label": "status-quo-script",
    "id": "status-quo-script",
    "url": "/concepts/status-quo-script.html"
  },
  {
    "label": "modl",
    "id": "modl",
    "url": "/concepts/modl.html"
  },
  {
    "label": "sourcelair-editor",
    "id": "sourcelair-editor",
    "url": "/concepts/sourcelair-editor.html"
  },
  {
    "label": "Socrata Query Language",
    "id": "soql-lang",
    "url": "/concepts/soql-lang.html"
  },
  {
    "label": "microPLANNER",
    "id": "microplanner",
    "url": "/concepts/microplanner.html"
  },
  {
    "label": "Metaweb Query Language",
    "id": "metaweb-query-language",
    "url": "/concepts/metaweb-query-language.html"
  },
  {
    "label": "metalex",
    "id": "metalex",
    "url": "/concepts/metalex.html"
  },
  {
    "label": "MDBS-QRS",
    "id": "mdbs-qrs",
    "url": "/concepts/mdbs-qrs.html"
  },
  {
    "label": "SimpleScript",
    "id": "simplescript",
    "url": "/concepts/simplescript.html"
  },
  {
    "label": "local",
    "id": "local",
    "url": "/concepts/local.html"
  },
  {
    "label": "SCAT",
    "id": "scat",
    "url": "/concepts/scat.html"
  },
  {
    "label": "Low Level Lisp",
    "id": "lll",
    "url": "/concepts/lll.html"
  },
  {
    "label": "LinkText",
    "id": "linktext",
    "url": "/concepts/linktext.html"
  },
  {
    "label": "SAP HANA",
    "id": "sap-hana",
    "url": "/concepts/sap-hana.html"
  },
  {
    "label": "lambda-obliv",
    "id": "lambda-obliv",
    "url": "/concepts/lambda-obliv.html"
  },
  {
    "label": "Konna",
    "id": "konna",
    "url": "/concepts/konna.html"
  },
  {
    "label": "kaukatcr",
    "id": "kaukatcr",
    "url": "/concepts/kaukatcr.html"
  },
  {
    "label": "Just",
    "id": "just",
    "url": "/concepts/just.html"
  },
  {
    "label": "jcard",
    "id": "jcard",
    "url": "/concepts/jcard.html"
  },
  {
    "label": "iota",
    "id": "iota",
    "url": "/concepts/iota.html"
  },
  {
    "label": "ibm-system-38-language",
    "id": "ibm-system-38-language",
    "url": "/concepts/ibm-system-38-language.html"
  },
  {
    "label": "honu",
    "id": "honu",
    "url": "/concepts/honu.html"
  },
  {
    "label": "IBM Programming Language/Advanced Systems",
    "id": "pl-as",
    "url": "/concepts/pl-as.html"
  },
  {
    "label": "TeaSharp",
    "id": "teasharp",
    "url": "/concepts/teasharp.html"
  },
  {
    "label": "Herbrand",
    "id": "herbrand",
    "url": "/concepts/herbrand.html"
  },
  {
    "label": "HAYSTAQ",
    "id": "haystaq",
    "url": "/concepts/haystaq.html"
  },
  {
    "label": "hackppl",
    "id": "hackppl",
    "url": "/concepts/hackppl.html"
  },
  {
    "label": "PGen",
    "id": "pgen",
    "url": "/concepts/pgen.html"
  },
  {
    "label": "uscript2",
    "id": "uscript2",
    "url": "/concepts/uscript2.html"
  },
  {
    "label": "uscript",
    "id": "uscript",
    "url": "/concepts/uscript.html"
  },
  {
    "label": "sugarj",
    "id": "sugarj",
    "url": "/concepts/sugarj.html"
  },
  {
    "label": "PCLOS",
    "id": "pclos",
    "url": "/concepts/pclos.html"
  },
  {
    "label": "Gaiman",
    "id": "gaiman",
    "url": "/concepts/gaiman.html"
  },
  {
    "label": "GAEA",
    "id": "gaea",
    "url": "/concepts/gaea.html"
  },
  {
    "label": "OrientDB",
    "id": "orient-db",
    "url": "/concepts/orient-db.html"
  },
  {
    "label": "Oracle",
    "id": "oracle",
    "url": "/concepts/oracle.html"
  },
  {
    "label": "FORTRAN IV",
    "id": "fortran-iv",
    "url": "/concepts/fortran-iv.html"
  },
  {
    "label": "FORTRAN III",
    "id": "fortran-iii",
    "url": "/concepts/fortran-iii.html"
  },
  {
    "label": "oniguruma",
    "id": "oniguruma",
    "url": "/concepts/oniguruma.html"
  },
  {
    "label": "forest-database",
    "id": "forest-database",
    "url": "/concepts/forest-database.html"
  },
  {
    "label": "floorplan",
    "id": "floorplan",
    "url": "/concepts/floorplan.html"
  },
  {
    "label": "filetab-d",
    "id": "filetab-d",
    "url": "/concepts/filetab-d.html"
  },
  {
    "label": "synergist",
    "id": "synergist",
    "url": "/concepts/synergist.html"
  },
  {
    "label": "EXTRAN",
    "id": "extran",
    "url": "/concepts/extran.html"
  },
  {
    "label": "ESP",
    "id": "esp",
    "url": "/concepts/esp.html"
  },
  {
    "label": "Neo4j",
    "id": "neo4j",
    "url": "/concepts/neo4j.html"
  },
  {
    "label": "english-programming-language",
    "id": "english-programming-language",
    "url": "/concepts/english-programming-language.html"
  },
  {
    "label": "NEBULA",
    "id": "nebula",
    "url": "/concepts/nebula.html"
  },
  {
    "label": "xsharp",
    "id": "xsharp",
    "url": "/concepts/xsharp.html"
  },
  {
    "label": "xmpp-protocol",
    "id": "xmpp-protocol",
    "url": "/concepts/xmpp-protocol.html"
  },
  {
    "label": "Elasticsearch Query DSL",
    "id": "elastic-query-dsl",
    "url": "/concepts/elastic-query-dsl.html"
  },
  {
    "label": "woofjs",
    "id": "woofjs",
    "url": "/concepts/woofjs.html"
  },
  {
    "label": "Visual Studio Marketplace",
    "id": "visual-studio-marketplace-pm",
    "url": "/concepts/visual-studio-marketplace-pm.html"
  },
  {
    "label": "Mushroom",
    "id": "mushroom",
    "url": "/concepts/mushroom.html"
  },
  {
    "label": "Visual Logic",
    "id": "visual-logic",
    "url": "/concepts/visual-logic.html"
  },
  {
    "label": "Vim Scripts",
    "id": "vim-scripts-pm",
    "url": "/concepts/vim-scripts-pm.html"
  },
  {
    "label": "ebg",
    "id": "ebg",
    "url": "/concepts/ebg.html"
  },
  {
    "label": "underlay",
    "id": "underlay",
    "url": "/concepts/underlay.html"
  },
  {
    "label": "ugnis",
    "id": "ugnis",
    "url": "/concepts/ugnis.html"
  },
  {
    "label": "dsym",
    "id": "dsym",
    "url": "/concepts/dsym.html"
  },
  {
    "label": "TWiki",
    "id": "twiki",
    "url": "/concepts/twiki.html"
  },
  {
    "label": "tilton",
    "id": "tilton",
    "url": "/concepts/tilton.html"
  },
  {
    "label": "tiddler",
    "id": "tiddler",
    "url": "/concepts/tiddler.html"
  },
  {
    "label": "MODEL-K",
    "id": "model-k",
    "url": "/concepts/model-k.html"
  },
  {
    "label": "runescript",
    "id": "runescript",
    "url": "/concepts/runescript.html"
  },
  {
    "label": "DM-1",
    "id": "dm-1",
    "url": "/concepts/dm-1.html"
  },
  {
    "label": "tetra",
    "id": "tetra",
    "url": "/concepts/tetra.html"
  },
  {
    "label": "Distributed Smalltalk",
    "id": "distributed-smalltalk",
    "url": "/concepts/distributed-smalltalk.html"
  },
  {
    "label": "tarot",
    "id": "tarot",
    "url": "/concepts/tarot.html"
  },
  {
    "label": "Microsoft SQL Server",
    "id": "microsoft-mysql-server",
    "url": "/concepts/microsoft-mysql-server.html"
  },
  {
    "label": "subscript",
    "id": "subscript",
    "url": "/concepts/subscript.html"
  },
  {
    "label": "Microsoft Azure Cosmos DB",
    "id": "microsoft-azure-cosmos-db",
    "url": "/concepts/microsoft-azure-cosmos-db.html"
  },
  {
    "label": "Microsoft Access",
    "id": "microsoft-access",
    "url": "/concepts/microsoft-access.html"
  },
  {
    "label": "moinmoin",
    "id": "moinmoin",
    "url": "/concepts/moinmoin.html"
  },
  {
    "label": "SNBT",
    "id": "snbt",
    "url": "/concepts/snbt.html"
  },
  {
    "label": "Memcached",
    "id": "memcached",
    "url": "/concepts/memcached.html"
  },
  {
    "label": "Data Package",
    "id": "datapackage",
    "url": "/concepts/datapackage.html"
  },
  {
    "label": "SmartGameFormat",
    "id": "smartgameformat",
    "url": "/concepts/smartgameformat.html"
  },
  {
    "label": "dalvik-bytecode",
    "id": "dalvik-bytecode",
    "url": "/concepts/dalvik-bytecode.html"
  },
  {
    "label": "CVL",
    "id": "cvl",
    "url": "/concepts/cvl.html"
  },
  {
    "label": "shade",
    "id": "shade",
    "url": "/concepts/shade.html"
  },
  {
    "label": "MarkLogic",
    "id": "marklogic",
    "url": "/concepts/marklogic.html"
  },
  {
    "label": "MariaDB ColumnStore",
    "id": "maria-db-column-store",
    "url": "/concepts/maria-db-column-store.html"
  },
  {
    "label": "pycharm-editor",
    "id": "pycharm-editor",
    "url": "/concepts/pycharm-editor.html"
  },
  {
    "label": "rlmeta",
    "id": "rlmeta",
    "url": "/concepts/rlmeta.html"
  },
  {
    "label": "Cosmos",
    "id": "cosmos",
    "url": "/concepts/cosmos.html"
  },
  {
    "label": "ra",
    "id": "ra",
    "url": "/concepts/ra.html"
  },
  {
    "label": "quicksight-app",
    "id": "quicksight-app",
    "url": "/concepts/quicksight-app.html"
  },
  {
    "label": "Schrödinger's Equation",
    "id": "schrodingers-equation",
    "url": "/concepts/schrodingers-equation.html"
  },
  {
    "label": "CONA",
    "id": "cona",
    "url": "/concepts/cona.html"
  },
  {
    "label": "powerloom-knowledgeBase",
    "id": "powerloom-knowledgebase",
    "url": "/concepts/powerloom-knowledgebase.html"
  },
  {
    "label": "paperalgo",
    "id": "paperalgo",
    "url": "/concepts/paperalgo.html"
  },
  {
    "label": "Chicon",
    "id": "chicon",
    "url": "/concepts/chicon.html"
  },
  {
    "label": "checkout",
    "id": "checkout",
    "url": "/concepts/checkout.html"
  },
  {
    "label": "kernel-e",
    "id": "kernel-e",
    "url": "/concepts/kernel-e.html"
  },
  {
    "label": "Cedar",
    "id": "cedar",
    "url": "/concepts/cedar.html"
  },
  {
    "label": "QED",
    "id": "qed-editor",
    "url": "/concepts/qed-editor.html"
  },
  {
    "label": "Pearson correlation coefficient equation",
    "id": "pearson-correlation-coefficient-equation",
    "url": "/concepts/pearson-correlation-coefficient-equation.html"
  },
  {
    "label": "Multihash",
    "id": "multihash-hash-function",
    "url": "/concepts/multihash-hash-function.html"
  },
  {
    "label": "Candy Codes",
    "id": "candy-codes",
    "url": "/concepts/candy-codes.html"
  },
  {
    "label": "miso-framework",
    "id": "miso-framework",
    "url": "/concepts/miso-framework.html"
  },
  {
    "label": "ji",
    "id": "ji",
    "url": "/concepts/ji.html"
  },
  {
    "label": "Mascara",
    "id": "mascara",
    "url": "/concepts/mascara.html"
  },
  {
    "label": "brooks-programming-language",
    "id": "brooks-programming-language",
    "url": "/concepts/brooks-programming-language.html"
  },
  {
    "label": "InterSystems Caché",
    "id": "intersystems-cache",
    "url": "/concepts/intersystems-cache.html"
  },
  {
    "label": "Bolin",
    "id": "bolin",
    "url": "/concepts/bolin.html"
  },
  {
    "label": "InterBase",
    "id": "interbase",
    "url": "/concepts/interbase.html"
  },
  {
    "label": "bml",
    "id": "bml",
    "url": "/concepts/bml.html"
  },
  {
    "label": "InfluxDB",
    "id": "influxdb",
    "url": "/concepts/influxdb.html"
  },
  {
    "label": "Blade",
    "id": "blade-lang",
    "url": "/concepts/blade-lang.html"
  },
  {
    "label": "lazarus-editor",
    "id": "lazarus-editor",
    "url": "/concepts/lazarus-editor.html"
  },
  {
    "label": "Bison++",
    "id": "bisonpp",
    "url": "/concepts/bisonpp.html"
  },
  {
    "label": "Lanai",
    "id": "lanai",
    "url": "/concepts/lanai.html"
  },
  {
    "label": "TI-BASIC",
    "id": "ti-basic",
    "url": "/concepts/ti-basic.html"
  },
  {
    "label": "kvsapi",
    "id": "kvsapi",
    "url": "/concepts/kvsapi.html"
  },
  {
    "label": "koi",
    "id": "koi",
    "url": "/concepts/koi.html"
  },
  {
    "label": "klisp",
    "id": "klisp",
    "url": "/concepts/klisp.html"
  },
  {
    "label": "IBM DB2",
    "id": "ibm-db2",
    "url": "/concepts/ibm-db2.html"
  },
  {
    "label": "Standard Portable Intermediate Representation",
    "id": "spir",
    "url": "/concepts/spir.html"
  },
  {
    "label": "Beatnik",
    "id": "beatnik",
    "url": "/concepts/beatnik.html"
  },
  {
    "label": "Imandra Protocol Language",
    "id": "imandra",
    "url": "/concepts/imandra.html"
  },
  {
    "label": "hsaml-format",
    "id": "hsaml-format",
    "url": "/concepts/hsaml-format.html"
  },
  {
    "label": "holonforth",
    "id": "holonforth",
    "url": "/concepts/holonforth.html"
  },
  {
    "label": "Common Log Format",
    "id": "common-log-format",
    "url": "/concepts/common-log-format.html"
  },
  {
    "label": "Spec Sharp",
    "id": "spec-sharp",
    "url": "/concepts/spec-sharp.html"
  },
  {
    "label": "hac",
    "id": "hac",
    "url": "/concepts/hac.html"
  },
  {
    "label": "Vcpkg",
    "id": "vcpkg-pm",
    "url": "/concepts/vcpkg-pm.html"
  },
  {
    "label": "axcess",
    "id": "axcess",
    "url": "/concepts/axcess.html"
  },
  {
    "label": "goose",
    "id": "goose",
    "url": "/concepts/goose.html"
  },
  {
    "label": "AUTOCODER III",
    "id": "autocoder-iii",
    "url": "/concepts/autocoder-iii.html"
  },
  {
    "label": "ed script",
    "id": "edscript",
    "url": "/concepts/edscript.html"
  },
  {
    "label": "Superplan",
    "id": "superplan",
    "url": "/concepts/superplan.html"
  },
  {
    "label": "frtime",
    "id": "frtime",
    "url": "/concepts/frtime.html"
  },
  {
    "label": "STRINGCOMP",
    "id": "stringcomp",
    "url": "/concepts/stringcomp.html"
  },
  {
    "label": "Visual Studio",
    "id": "visual-studio-editor",
    "url": "/concepts/visual-studio-editor.html"
  },
  {
    "label": "SQUOZE",
    "id": "squoze",
    "url": "/concepts/squoze.html"
  },
  {
    "label": "Visual Studio Code",
    "id": "visual-studio-code-editor",
    "url": "/concepts/visual-studio-code-editor.html"
  },
  {
    "label": "Greenplum",
    "id": "greenplum",
    "url": "/concepts/greenplum.html"
  },
  {
    "label": "SPARQCode",
    "id": "sparqcode",
    "url": "/concepts/sparqcode.html"
  },
  {
    "label": "arrow",
    "id": "arrow",
    "url": "/concepts/arrow.html"
  },
  {
    "label": "SK8",
    "id": "sk8",
    "url": "/concepts/sk8.html"
  },
  {
    "label": "Setun",
    "id": "setun",
    "url": "/concepts/setun.html"
  },
  {
    "label": "arezzo-notation",
    "id": "arezzo-notation",
    "url": "/concepts/arezzo-notation.html"
  },
  {
    "label": "Schoonschip",
    "id": "schoonschip",
    "url": "/concepts/schoonschip.html"
  },
  {
    "label": "Solaris",
    "id": "solaris",
    "url": "/concepts/solaris.html"
  },
  {
    "label": "envoy-app",
    "id": "envoy-app",
    "url": "/concepts/envoy-app.html"
  },
  {
    "label": "Google Cloud SQL",
    "id": "google-cloud-mysql",
    "url": "/concepts/google-cloud-mysql.html"
  },
  {
    "label": "Tableau Software",
    "id": "tableau-app",
    "url": "/concepts/tableau-app.html"
  },
  {
    "label": "Power BI",
    "id": "power-bi-app",
    "url": "/concepts/power-bi-app.html"
  },
  {
    "label": "emu",
    "id": "emu",
    "url": "/concepts/emu.html"
  },
  {
    "label": "FreeBSD",
    "id": "freebsd",
    "url": "/concepts/freebsd.html"
  },
  {
    "label": "Stripe company",
    "id": "stripe",
    "url": "/concepts/stripe.html"
  },
  {
    "label": "QFX file format",
    "id": "qfx",
    "url": "/concepts/qfx.html"
  },
  {
    "label": "gitignore",
    "id": "gitignore",
    "url": "/concepts/gitignore.html"
  },
  {
    "label": "PNG",
    "id": "png-format",
    "url": "/concepts/png-format.html"
  },
  {
    "label": "domino",
    "id": "domino",
    "url": "/concepts/domino.html"
  },
  {
    "label": "PM2",
    "id": "pm2",
    "url": "/concepts/pm2.html"
  },
  {
    "label": "dio",
    "id": "dio",
    "url": "/concepts/dio.html"
  },
  {
    "label": "PHIGS",
    "id": "phigs",
    "url": "/concepts/phigs.html"
  },
  {
    "label": "dec64",
    "id": "dec64",
    "url": "/concepts/dec64.html"
  },
  {
    "label": "Jargon",
    "id": "jargon",
    "url": "/concepts/jargon.html"
  },
  {
    "label": "dbml",
    "id": "dbml",
    "url": "/concepts/dbml.html"
  },
  {
    "label": "Andorra",
    "id": "andorra",
    "url": "/concepts/andorra.html"
  },
  {
    "label": "Flutter",
    "id": "flutter-framework",
    "url": "/concepts/flutter-framework.html"
  },
  {
    "label": "ObjVlisp",
    "id": "objvlisp",
    "url": "/concepts/objvlisp.html"
  },
  {
    "label": "Post Office Protocol",
    "id": "pop-protocol",
    "url": "/concepts/pop-protocol.html"
  },
  {
    "label": "nroff",
    "id": "nroff",
    "url": "/concepts/nroff.html"
  },
  {
    "label": "AMPPL-II",
    "id": "amppl-ii",
    "url": "/concepts/amppl-ii.html"
  },
  {
    "label": "Open Database Connectivity",
    "id": "odbc",
    "url": "/concepts/odbc.html"
  },
  {
    "label": "AMBIT/L",
    "id": "ambit-l",
    "url": "/concepts/ambit-l.html"
  },
  {
    "label": "AMBIT/G",
    "id": "ambit-g",
    "url": "/concepts/ambit-g.html"
  },
  {
    "label": "Swallow",
    "id": "swallow",
    "url": "/concepts/swallow.html"
  },
  {
    "label": "Coral",
    "id": "coral-lang",
    "url": "/concepts/coral-lang.html"
  },
  {
    "label": "Amanda",
    "id": "amanda",
    "url": "/concepts/amanda.html"
  },
  {
    "label": "ALTAC",
    "id": "altac",
    "url": "/concepts/altac.html"
  },
  {
    "label": "Punycode",
    "id": "punycode",
    "url": "/concepts/punycode.html"
  },
  {
    "label": "AlphaPop",
    "id": "alphapop",
    "url": "/concepts/alphapop.html"
  },
  {
    "label": "coherence",
    "id": "coherence",
    "url": "/concepts/coherence.html"
  },
  {
    "label": "coffeepp",
    "id": "coffeepp",
    "url": "/concepts/coffeepp.html"
  },
  {
    "label": "Alonzo",
    "id": "alonzo",
    "url": "/concepts/alonzo.html"
  },
  {
    "label": "ALMIR",
    "id": "almir",
    "url": "/concepts/almir.html"
  },
  {
    "label": "Alma-O",
    "id": "alma-o",
    "url": "/concepts/alma-o.html"
  },
  {
    "label": "cloe",
    "id": "cloe",
    "url": "/concepts/cloe.html"
  },
  {
    "label": "InterPlanetary File System",
    "id": "ipfs",
    "url": "/concepts/ipfs.html"
  },
  {
    "label": "Object Linking and Embedding",
    "id": "ole-protocol",
    "url": "/concepts/ole-protocol.html"
  },
  {
    "label": "ALGY",
    "id": "algy",
    "url": "/concepts/algy.html"
  },
  {
    "label": "Fast Healthcare Interoperability Resources",
    "id": "fhir",
    "url": "/concepts/fhir.html"
  },
  {
    "label": "ALGOL-E",
    "id": "algol-e",
    "url": "/concepts/algol-e.html"
  },
  {
    "label": "ALGERNON",
    "id": "algernon",
    "url": "/concepts/algernon.html"
  },
  {
    "label": "ALGEM",
    "id": "algem",
    "url": "/concepts/algem.html"
  },
  {
    "label": "chirp",
    "id": "chirp",
    "url": "/concepts/chirp.html"
  },
  {
    "label": "Algebraic Compiler",
    "id": "algebraic-compiler",
    "url": "/concepts/algebraic-compiler.html"
  },
  {
    "label": "Information Theory Equation",
    "id": "information-theory-equation",
    "url": "/concepts/information-theory-equation.html"
  },
  {
    "label": "APT Debian",
    "id": "apt-pm",
    "url": "/concepts/apt-pm.html"
  },
  {
    "label": "HyperFun",
    "id": "hyperfun",
    "url": "/concepts/hyperfun.html"
  },
  {
    "label": "ALEC",
    "id": "alec",
    "url": "/concepts/alec.html"
  },
  {
    "label": "RDF Schema",
    "id": "rdf-schema",
    "url": "/concepts/rdf-schema.html"
  },
  {
    "label": "Aldwych",
    "id": "aldwych",
    "url": "/concepts/aldwych.html"
  },
  {
    "label": "tsquery",
    "id": "tsquery",
    "url": "/concepts/tsquery.html"
  },
  {
    "label": "Altair BASIC",
    "id": "altair-basic",
    "url": "/concepts/altair-basic.html"
  },
  {
    "label": "Aldat",
    "id": "aldat",
    "url": "/concepts/aldat.html"
  },
  {
    "label": "C'Dent",
    "id": "cdent",
    "url": "/concepts/cdent.html"
  },
  {
    "label": "Unity3D Asset",
    "id": "unity3d-asset",
    "url": "/concepts/unity3d-asset.html"
  },
  {
    "label": "VCF",
    "id": "vcf-format",
    "url": "/concepts/vcf-format.html"
  },
  {
    "label": "Tiny BASIC",
    "id": "tiny-basic",
    "url": "/concepts/tiny-basic.html"
  },
  {
    "label": "ALBA",
    "id": "alba",
    "url": "/concepts/alba.html"
  },
  {
    "label": "Berkeley DB",
    "id": "berkeley-db-lib",
    "url": "/concepts/berkeley-db-lib.html"
  },
  {
    "label": "Alambik",
    "id": "alambik",
    "url": "/concepts/alambik.html"
  },
  {
    "label": "Sketchpad",
    "id": "sketchpad",
    "url": "/concepts/sketchpad.html"
  },
  {
    "label": "ALADIN",
    "id": "aladin",
    "url": "/concepts/aladin.html"
  },
  {
    "label": "Structured text",
    "id": "structured-text",
    "url": "/concepts/structured-text.html"
  },
  {
    "label": "AKL",
    "id": "akl",
    "url": "/concepts/akl.html"
  },
  {
    "label": "GENSTAT",
    "id": "genstat",
    "url": "/concepts/genstat.html"
  },
  {
    "label": "Yakou Lang",
    "id": "yakou-lang",
    "url": "/concepts/yakou-lang.html"
  },
  {
    "label": "XML Binding Language",
    "id": "xbl",
    "url": "/concepts/xbl.html"
  },
  {
    "label": "Firebase Realtime Database",
    "id": "firebase",
    "url": "/concepts/firebase.html"
  },
  {
    "label": "AIDA",
    "id": "aida",
    "url": "/concepts/aida.html"
  },
  {
    "label": "AGL",
    "id": "agl",
    "url": "/concepts/agl.html"
  },
  {
    "label": "Forsyth-Edwards Notation",
    "id": "fen-notation",
    "url": "/concepts/fen-notation.html"
  },
  {
    "label": "Agent-K",
    "id": "agent-k",
    "url": "/concepts/agent-k.html"
  },
  {
    "label": "SYMBOLIC ASSEMBLY",
    "id": "symbolic-assembly",
    "url": "/concepts/symbolic-assembly.html"
  },
  {
    "label": "WCPS",
    "id": "wcps",
    "url": "/concepts/wcps.html"
  },
  {
    "label": "Quicken Interchange Format",
    "id": "qif",
    "url": "/concepts/qif.html"
  },
  {
    "label": "Almquist shell",
    "id": "almquist-shell",
    "url": "/concepts/almquist-shell.html"
  },
  {
    "label": "Visual DialogScript",
    "id": "visual-dialogscript",
    "url": "/concepts/visual-dialogscript.html"
  },
  {
    "label": "AESOP",
    "id": "aesop",
    "url": "/concepts/aesop.html"
  },
  {
    "label": "SheerPower4GL",
    "id": "sheerpower4gl",
    "url": "/concepts/sheerpower4gl.html"
  },
  {
    "label": "AEPL",
    "id": "aepl",
    "url": "/concepts/aepl.html"
  },
  {
    "label": "BScript",
    "id": "bscript",
    "url": "/concepts/bscript.html"
  },
  {
    "label": "AED",
    "id": "aed",
    "url": "/concepts/aed.html"
  },
  {
    "label": "bscript-interpreter",
    "id": "bscript-interpreter",
    "url": "/concepts/bscript-interpreter.html"
  },
  {
    "label": "Robic",
    "id": "robic",
    "url": "/concepts/robic.html"
  },
  {
    "label": "TOM object-oriented",
    "id": "tom-oopl",
    "url": "/concepts/tom-oopl.html"
  },
  {
    "label": "Schema for Object-Oriented XML",
    "id": "sox",
    "url": "/concepts/sox.html"
  },
  {
    "label": "SuperBASIC",
    "id": "superbasic",
    "url": "/concepts/superbasic.html"
  },
  {
    "label": "Aditi",
    "id": "aditi",
    "url": "/concepts/aditi.html"
  },
  {
    "label": "Southampton BASIC System",
    "id": "southampton-basic-system",
    "url": "/concepts/southampton-basic-system.html"
  },
  {
    "label": "Stratego/XT",
    "id": "stratego",
    "url": "/concepts/stratego.html"
  },
  {
    "label": "Phoenix Object Basic",
    "id": "phoenix-object-basic",
    "url": "/concepts/phoenix-object-basic.html"
  },
  {
    "label": "ShEx",
    "id": "shex",
    "url": "/concepts/shex.html"
  },
  {
    "label": "SR",
    "id": "sr-programming-language",
    "url": "/concepts/sr-programming-language.html"
  },
  {
    "label": "Scieneer Common Lisp",
    "id": "scieneer-common-lisp",
    "url": "/concepts/scieneer-common-lisp.html"
  },
  {
    "label": "ZBasic",
    "id": "zbasic",
    "url": "/concepts/zbasic.html"
  },
  {
    "label": "Adaplex",
    "id": "adaplex",
    "url": "/concepts/adaplex.html"
  },
  {
    "label": "OWBasic",
    "id": "owbasic",
    "url": "/concepts/owbasic.html"
  },
  {
    "label": "Run BASIC",
    "id": "run-basic",
    "url": "/concepts/run-basic.html"
  },
  {
    "label": "SipHash",
    "id": "siphash-hash-function",
    "url": "/concepts/siphash-hash-function.html"
  },
  {
    "label": "WLambda",
    "id": "wlambda",
    "url": "/concepts/wlambda.html"
  },
  {
    "label": "Real-time Cmix",
    "id": "real-time-cmix",
    "url": "/concepts/real-time-cmix.html"
  },
  {
    "label": "Semantic Web Rule Language",
    "id": "swrl",
    "url": "/concepts/swrl.html"
  },
  {
    "label": "vega-editor-app",
    "id": "vega-editor-app",
    "url": "/concepts/vega-editor-app.html"
  },
  {
    "label": "Context Diff",
    "id": "context-diff",
    "url": "/concepts/context-diff.html"
  },
  {
    "label": "Adagio",
    "id": "adagio",
    "url": "/concepts/adagio.html"
  },
  {
    "label": "blank",
    "id": "blank",
    "url": "/concepts/blank.html"
  },
  {
    "label": "UniVerse",
    "id": "universe",
    "url": "/concepts/universe.html"
  },
  {
    "label": "Sort Merge Generator",
    "id": "sort-merge-generator",
    "url": "/concepts/sort-merge-generator.html"
  },
  {
    "label": "Portable Standard Lisp",
    "id": "portable-standard-lisp",
    "url": "/concepts/portable-standard-lisp.html"
  },
  {
    "label": "IBM BASIC",
    "id": "ibm-basic",
    "url": "/concepts/ibm-basic.html"
  },
  {
    "label": "Instruction list",
    "id": "instruction-list",
    "url": "/concepts/instruction-list.html"
  },
  {
    "label": "Family BASIC",
    "id": "family-basic",
    "url": "/concepts/family-basic.html"
  },
  {
    "label": "GNU Guix",
    "id": "guix",
    "url": "/concepts/guix.html"
  },
  {
    "label": "ADABTPL",
    "id": "adabtpl",
    "url": "/concepts/adabtpl.html"
  },
  {
    "label": "UNCOL",
    "id": "uncol",
    "url": "/concepts/uncol.html"
  },
  {
    "label": "Java EE version history",
    "id": "java-ee-version-history",
    "url": "/concepts/java-ee-version-history.html"
  },
  {
    "label": "Continuity of Care Document",
    "id": "ccd",
    "url": "/concepts/ccd.html"
  },
  {
    "label": "Ada/TL",
    "id": "ada-tl",
    "url": "/concepts/ada-tl.html"
  },
  {
    "label": "Energy Momentum Equation",
    "id": "energy-momentum-equation",
    "url": "/concepts/energy-momentum-equation.html"
  },
  {
    "label": "Optimized Systems Software",
    "id": "optimized-systems-software",
    "url": "/concepts/optimized-systems-software.html"
  },
  {
    "label": "Ada 9X",
    "id": "ada-9x",
    "url": "/concepts/ada-9x.html"
  },
  {
    "label": "MINC",
    "id": "minc",
    "url": "/concepts/minc.html"
  },
  {
    "label": "RicScript",
    "id": "ricscript",
    "url": "/concepts/ricscript.html"
  },
  {
    "label": "Napier88",
    "id": "napier88",
    "url": "/concepts/napier88.html"
  },
  {
    "label": "Schematron",
    "id": "schematron",
    "url": "/concepts/schematron.html"
  },
  {
    "label": "Ada 95",
    "id": "ada-95",
    "url": "/concepts/ada-95.html"
  },
  {
    "label": "RunRev",
    "id": "runrev",
    "url": "/concepts/runrev.html"
  },
  {
    "label": "Service Modeling Language",
    "id": "service-modeling-language",
    "url": "/concepts/service-modeling-language.html"
  },
  {
    "label": "NPL",
    "id": "npl-lang",
    "url": "/concepts/npl-lang.html"
  },
  {
    "label": "SQL/PSM",
    "id": "sql-psm",
    "url": "/concepts/sql-psm.html"
  },
  {
    "label": "Coda web development software",
    "id": "coda-editor",
    "url": "/concepts/coda-editor.html"
  },
  {
    "label": "EXAPT",
    "id": "exapt",
    "url": "/concepts/exapt.html"
  },
  {
    "label": "Actus",
    "id": "actus",
    "url": "/concepts/actus.html"
  },
  {
    "label": "Device independent file format",
    "id": "device-independent-file-format",
    "url": "/concepts/device-independent-file-format.html"
  },
  {
    "label": "Rexon",
    "id": "rexon",
    "url": "/concepts/rexon.html"
  },
  {
    "label": "Visual Test",
    "id": "visual-test",
    "url": "/concepts/visual-test.html"
  },
  {
    "label": "Visual Prolog",
    "id": "visual-prolog",
    "url": "/concepts/visual-prolog.html"
  },
  {
    "label": "Silicon Graphics Image",
    "id": "rgb-format",
    "url": "/concepts/rgb-format.html"
  },
  {
    "label": "Apple ProDOS",
    "id": "apple-prodos",
    "url": "/concepts/apple-prodos.html"
  },
  {
    "label": "Mortran",
    "id": "mortran",
    "url": "/concepts/mortran.html"
  },
  {
    "label": "Active-U-Datalog",
    "id": "active-u-datalog",
    "url": "/concepts/active-u-datalog.html"
  },
  {
    "label": "JSML",
    "id": "jsml",
    "url": "/concepts/jsml.html"
  },
  {
    "label": "Matita",
    "id": "matita",
    "url": "/concepts/matita.html"
  },
  {
    "label": "Crystallographic Information File",
    "id": "cif",
    "url": "/concepts/cif.html"
  },
  {
    "label": "Active Language I",
    "id": "active-language-i",
    "url": "/concepts/active-language-i.html"
  },
  {
    "label": "MARIA XML",
    "id": "maria-xml",
    "url": "/concepts/maria-xml.html"
  },
  {
    "label": "Mallard BASIC",
    "id": "mallard-basic",
    "url": "/concepts/mallard-basic.html"
  },
  {
    "label": "Actalk",
    "id": "actalk",
    "url": "/concepts/actalk.html"
  },
  {
    "label": "Structured Product Labeling",
    "id": "spl",
    "url": "/concepts/spl.html"
  },
  {
    "label": "Systems Biology Markup Language",
    "id": "sbml",
    "url": "/concepts/sbml.html"
  },
  {
    "label": "tamgu",
    "id": "tamgu",
    "url": "/concepts/tamgu.html"
  },
  {
    "label": "arret",
    "id": "arret",
    "url": "/concepts/arret.html"
  },
  {
    "label": "ACT ONE",
    "id": "act-one",
    "url": "/concepts/act-one.html"
  },
  {
    "label": "Micro-PROLOG",
    "id": "micro-prolog",
    "url": "/concepts/micro-prolog.html"
  },
  {
    "label": "Larceny Scheme implementation",
    "id": "larceny",
    "url": "/concepts/larceny.html"
  },
  {
    "label": "ACSL",
    "id": "acsl",
    "url": "/concepts/acsl.html"
  },
  {
    "label": "Galaksija BASIC",
    "id": "galaksija-basic",
    "url": "/concepts/galaksija-basic.html"
  },
  {
    "label": "Rocky Mountain BASIC",
    "id": "rocky-mountain-basic",
    "url": "/concepts/rocky-mountain-basic.html"
  },
  {
    "label": "WebDNA",
    "id": "webdna",
    "url": "/concepts/webdna.html"
  },
  {
    "label": "FleXML",
    "id": "flexml",
    "url": "/concepts/flexml.html"
  },
  {
    "label": "IFPS",
    "id": "ifps",
    "url": "/concepts/ifps.html"
  },
  {
    "label": "Wirth syntax notation",
    "id": "wirth-syntax-notation",
    "url": "/concepts/wirth-syntax-notation.html"
  },
  {
    "label": "XCAS",
    "id": "xcas",
    "url": "/concepts/xcas.html"
  },
  {
    "label": "ACOS",
    "id": "acos",
    "url": "/concepts/acos.html"
  },
  {
    "label": "Standard for Exchange of Non-clinical Data",
    "id": "send-standard",
    "url": "/concepts/send-standard.html"
  },
  {
    "label": "Template Attribute Language",
    "id": "template-attribute-language",
    "url": "/concepts/template-attribute-language.html"
  },
  {
    "label": "ACORN",
    "id": "acorn",
    "url": "/concepts/acorn.html"
  },
  {
    "label": "AUR",
    "id": "aur-pm",
    "url": "/concepts/aur-pm.html"
  },
  {
    "label": "Legal Knowledge Interchange Format",
    "id": "lkif",
    "url": "/concepts/lkif.html"
  },
  {
    "label": "BBN-LISP",
    "id": "bbn-lisp",
    "url": "/concepts/bbn-lisp.html"
  },
  {
    "label": "IBM BASICA",
    "id": "ibm-basica",
    "url": "/concepts/ibm-basica.html"
  },
  {
    "label": "WATFIV",
    "id": "watfiv",
    "url": "/concepts/watfiv.html"
  },
  {
    "label": "Acore",
    "id": "acore",
    "url": "/concepts/acore.html"
  },
  {
    "label": "aubit-4gl",
    "id": "aubit-4gl",
    "url": "/concepts/aubit-4gl.html"
  },
  {
    "label": "Klerer-May System",
    "id": "klerer-may-system",
    "url": "/concepts/klerer-may-system.html"
  },
  {
    "label": "Elliott ALGOL",
    "id": "elliott-algol",
    "url": "/concepts/elliott-algol.html"
  },
  {
    "label": "Robot Battle",
    "id": "robot-battle",
    "url": "/concepts/robot-battle.html"
  },
  {
    "label": "Piet",
    "id": "piet-programming-language",
    "url": "/concepts/piet-programming-language.html"
  },
  {
    "label": "StarLogo",
    "id": "starlogo",
    "url": "/concepts/starlogo.html"
  },
  {
    "label": "EqL",
    "id": "eql",
    "url": "/concepts/eql.html"
  },
  {
    "label": "ACL",
    "id": "acl",
    "url": "/concepts/acl.html"
  },
  {
    "label": "tsar",
    "id": "tsar",
    "url": "/concepts/tsar.html"
  },
  {
    "label": "FXScript",
    "id": "fxscript",
    "url": "/concepts/fxscript.html"
  },
  {
    "label": "Daplex",
    "id": "daplex",
    "url": "/concepts/daplex.html"
  },
  {
    "label": "Data Access Language",
    "id": "data-access-language",
    "url": "/concepts/data-access-language.html"
  },
  {
    "label": "Graphics BASIC",
    "id": "graphics-basic",
    "url": "/concepts/graphics-basic.html"
  },
  {
    "label": "Refer",
    "id": "refer",
    "url": "/concepts/refer.html"
  },
  {
    "label": "Shakespeare",
    "id": "shakespeare-programming-language",
    "url": "/concepts/shakespeare-programming-language.html"
  },
  {
    "label": "Enterprise Mashup Markup Language",
    "id": "enterprise-mashup-markup-language",
    "url": "/concepts/enterprise-mashup-markup-language.html"
  },
  {
    "label": "STOS BASIC",
    "id": "stos-basic",
    "url": "/concepts/stos-basic.html"
  },
  {
    "label": "Z++",
    "id": "zpp",
    "url": "/concepts/zpp.html"
  },
  {
    "label": "AC Toolbox",
    "id": "ac-toolbox",
    "url": "/concepts/ac-toolbox.html"
  },
  {
    "label": "Fenix Project",
    "id": "fenix-project",
    "url": "/concepts/fenix-project.html"
  },
  {
    "label": "NEWP",
    "id": "newp",
    "url": "/concepts/newp.html"
  },
  {
    "label": "MSX BASIC",
    "id": "msx-basic",
    "url": "/concepts/msx-basic.html"
  },
  {
    "label": "Abstracto",
    "id": "abstracto",
    "url": "/concepts/abstracto.html"
  },
  {
    "label": "Multi-user BASIC",
    "id": "multi-user-basic",
    "url": "/concepts/multi-user-basic.html"
  },
  {
    "label": "Data General Business Basic",
    "id": "data-general-business-basic",
    "url": "/concepts/data-general-business-basic.html"
  },
  {
    "label": "CodeGear Delphi",
    "id": "codegear-delphi",
    "url": "/concepts/codegear-delphi.html"
  },
  {
    "label": "ISBL",
    "id": "isbl",
    "url": "/concepts/isbl.html"
  },
  {
    "label": "Simons' BASIC",
    "id": "simons-basic",
    "url": "/concepts/simons-basic.html"
  },
  {
    "label": "OpenROAD",
    "id": "openroad",
    "url": "/concepts/openroad.html"
  },
  {
    "label": "WMLScript",
    "id": "wmlscript",
    "url": "/concepts/wmlscript.html"
  },
  {
    "label": "Morfik",
    "id": "morfik",
    "url": "/concepts/morfik.html"
  },
  {
    "label": "Zoem",
    "id": "zoem",
    "url": "/concepts/zoem.html"
  },
  {
    "label": "Tefkat",
    "id": "tefkat",
    "url": "/concepts/tefkat.html"
  },
  {
    "label": "Chrome",
    "id": "chrome-programming-language",
    "url": "/concepts/chrome-programming-language.html"
  },
  {
    "label": "CBASIC",
    "id": "cbasic",
    "url": "/concepts/cbasic.html"
  },
  {
    "label": "Ravenscar profile",
    "id": "ravenscar-profile",
    "url": "/concepts/ravenscar-profile.html"
  },
  {
    "label": "R++",
    "id": "rpp",
    "url": "/concepts/rpp.html"
  },
  {
    "label": "Hummingbird QuickScript",
    "id": "hummingbird-quickscript",
    "url": "/concepts/hummingbird-quickscript.html"
  },
  {
    "label": "BASIC A+",
    "id": "basic-ap",
    "url": "/concepts/basic-ap.html"
  },
  {
    "label": "CA-Telon",
    "id": "ca-telon",
    "url": "/concepts/ca-telon.html"
  },
  {
    "label": "HP Time-Shared BASIC",
    "id": "hp-time-shared-basic",
    "url": "/concepts/hp-time-shared-basic.html"
  },
  {
    "label": "LINC 4GL",
    "id": "linc-4gl",
    "url": "/concepts/linc-4gl.html"
  },
  {
    "label": "PALASM",
    "id": "palasm",
    "url": "/concepts/palasm.html"
  },
  {
    "label": "Processor Technology",
    "id": "processor-technology",
    "url": "/concepts/processor-technology.html"
  },
  {
    "label": "UPIC",
    "id": "upic",
    "url": "/concepts/upic.html"
  },
  {
    "label": "Property Specification Language",
    "id": "property-specification-language",
    "url": "/concepts/property-specification-language.html"
  },
  {
    "label": "BASIC Stamp",
    "id": "basic-stamp",
    "url": "/concepts/basic-stamp.html"
  },
  {
    "label": "ABC++",
    "id": "abcpp",
    "url": "/concepts/abcpp.html"
  },
  {
    "label": "High Tech BASIC",
    "id": "high-tech-basic",
    "url": "/concepts/high-tech-basic.html"
  },
  {
    "label": "Averest",
    "id": "averest",
    "url": "/concepts/averest.html"
  },
  {
    "label": "CAL Actor Language",
    "id": "cal",
    "url": "/concepts/cal.html"
  },
  {
    "label": "D data language specification",
    "id": "d-data-language-specification",
    "url": "/concepts/d-data-language-specification.html"
  },
  {
    "label": "Thue",
    "id": "thue-programming-language",
    "url": "/concepts/thue-programming-language.html"
  },
  {
    "label": "ABCL/f",
    "id": "abcl-f",
    "url": "/concepts/abcl-f.html"
  },
  {
    "label": "BasicX",
    "id": "basicx",
    "url": "/concepts/basicx.html"
  },
  {
    "label": "BASICODE",
    "id": "basicode",
    "url": "/concepts/basicode.html"
  },
  {
    "label": "Intuit Interchange Format",
    "id": "iif",
    "url": "/concepts/iif.html"
  },
  {
    "label": "JIS X 0201",
    "id": "jis-x-0201",
    "url": "/concepts/jis-x-0201.html"
  },
  {
    "label": "Content Assembly Mechanism",
    "id": "cam",
    "url": "/concepts/cam.html"
  },
  {
    "label": "ABCL/c+",
    "id": "abcl-cp",
    "url": "/concepts/abcl-cp.html"
  },
  {
    "label": "B32 Business Basic",
    "id": "b32-business-basic",
    "url": "/concepts/b32-business-basic.html"
  },
  {
    "label": "APLX",
    "id": "aplx",
    "url": "/concepts/aplx.html"
  },
  {
    "label": "Aztec C",
    "id": "aztec-c",
    "url": "/concepts/aztec-c.html"
  },
  {
    "label": "Croma",
    "id": "croma",
    "url": "/concepts/croma.html"
  },
  {
    "label": "Advice Taker",
    "id": "advice-taker",
    "url": "/concepts/advice-taker.html"
  },
  {
    "label": "BlitzPlus",
    "id": "blitzplus",
    "url": "/concepts/blitzplus.html"
  },
  {
    "label": "truck",
    "id": "truck",
    "url": "/concepts/truck.html"
  },
  {
    "label": "BASIC-11",
    "id": "basic-11",
    "url": "/concepts/basic-11.html"
  },
  {
    "label": "ALCOR",
    "id": "alcor",
    "url": "/concepts/alcor.html"
  },
  {
    "label": "BANCStar",
    "id": "bancstar-programming-language",
    "url": "/concepts/bancstar-programming-language.html"
  },
  {
    "label": "Atari ST BASIC",
    "id": "atari-st-basic",
    "url": "/concepts/atari-st-basic.html"
  },
  {
    "label": "Chinese BASIC",
    "id": "chinese-basic",
    "url": "/concepts/chinese-basic.html"
  },
  {
    "label": "Daisy Systems",
    "id": "daisy-systems",
    "url": "/concepts/daisy-systems.html"
  },
  {
    "label": "ABAL",
    "id": "abal",
    "url": "/concepts/abal.html"
  },
  {
    "label": "Pipefish",
    "id": "pipefish",
    "url": "/concepts/pipefish.html"
  },
  {
    "label": "Baby modula-3",
    "id": "baby-modula-3",
    "url": "/concepts/baby-modula-3.html"
  },
  {
    "label": "APE100",
    "id": "ape100",
    "url": "/concepts/ape100.html"
  },
  {
    "label": "Alphard",
    "id": "alphard-programming-language",
    "url": "/concepts/alphard-programming-language.html"
  },
  {
    "label": "Acornsoft Logo",
    "id": "acornsoft-logo",
    "url": "/concepts/acornsoft-logo.html"
  },
  {
    "label": "cytosol",
    "id": "cytosol",
    "url": "/concepts/cytosol.html"
  },
  {
    "label": "zlang",
    "id": "zlang",
    "url": "/concepts/zlang.html"
  },
  {
    "label": "Advanced Continuous Simulation Language",
    "id": "advanced-continuous-simulation-language",
    "url": "/concepts/advanced-continuous-simulation-language.html"
  },
  {
    "label": "Amigas",
    "id": "amiga-programming-languages",
    "url": "/concepts/amiga-programming-languages.html"
  },
  {
    "label": "Alternate Instruction Set",
    "id": "ais",
    "url": "/concepts/ais.html"
  },
  {
    "label": "ana",
    "id": "ana",
    "url": "/concepts/ana.html"
  },
  {
    "label": "world",
    "id": "world",
    "url": "/concepts/world.html"
  },
  {
    "label": "Moirai",
    "id": "moirai",
    "url": "/concepts/moirai.html"
  },
  {
    "label": "woe",
    "id": "woe",
    "url": "/concepts/woe.html"
  },
  {
    "label": "ABSYS",
    "id": "absys",
    "url": "/concepts/absys.html"
  },
  {
    "label": "ASIC",
    "id": "asic-programming-language",
    "url": "/concepts/asic-programming-language.html"
  },
  {
    "label": "Tawa",
    "id": "tawa",
    "url": "/concepts/tawa.html"
  },
  {
    "label": "beagle",
    "id": "beagle",
    "url": "/concepts/beagle.html"
  },
  {
    "label": "Sophie",
    "id": "sophie",
    "url": "/concepts/sophie.html"
  },
  {
    "label": "rlox",
    "id": "rlox",
    "url": "/concepts/rlox.html"
  },
  {
    "label": "Jet",
    "id": "jet",
    "url": "/concepts/jet.html"
  },
  {
    "label": "3RIP",
    "id": "3rip",
    "url": "/concepts/3rip.html"
  },
  {
    "label": "KGL",
    "id": "kgl",
    "url": "/concepts/kgl.html"
  },
  {
    "label": "dreamlisp",
    "id": "dreamlisp",
    "url": "/concepts/dreamlisp.html"
  },
  {
    "label": "3DComposer",
    "id": "3dcomposer",
    "url": "/concepts/3dcomposer.html"
  },
  {
    "label": "draconian",
    "id": "draconian",
    "url": "/concepts/draconian.html"
  },
  {
    "label": "Vortex",
    "id": "vortex",
    "url": "/concepts/vortex.html"
  },
  {
    "label": "clox",
    "id": "clox",
    "url": "/concepts/clox.html"
  },
  {
    "label": "3-LISP",
    "id": "3-lisp",
    "url": "/concepts/3-lisp.html"
  },
  {
    "label": "2OBJ",
    "id": "2obj",
    "url": "/concepts/2obj.html"
  },
  {
    "label": "1.pak",
    "id": "1-pak",
    "url": "/concepts/1-pak.html"
  },
  {
    "label": "urn",
    "id": "urn",
    "url": "/concepts/urn.html"
  },
  {
    "label": "unicon-adl",
    "id": "unicon-adl",
    "url": "/concepts/unicon-adl.html"
  },
  {
    "label": "uml2-sp",
    "id": "uml2-sp",
    "url": "/concepts/uml2-sp.html"
  },
  {
    "label": "parboiled",
    "id": "parboiled",
    "url": "/concepts/parboiled.html"
  },
  {
    "label": "typedefs",
    "id": "typedefs",
    "url": "/concepts/typedefs.html"
  },
  {
    "label": "thorn",
    "id": "thorn",
    "url": "/concepts/thorn.html"
  },
  {
    "label": "texpr",
    "id": "texpr",
    "url": "/concepts/texpr.html"
  },
  {
    "label": "tetruss-app",
    "id": "tetruss-app",
    "url": "/concepts/tetruss-app.html"
  },
  {
    "label": "tern",
    "id": "tern",
    "url": "/concepts/tern.html"
  },
  {
    "label": "tengo",
    "id": "tengo",
    "url": "/concepts/tengo.html"
  },
  {
    "label": "teal",
    "id": "teal",
    "url": "/concepts/teal.html"
  },
  {
    "label": "DinnerBell",
    "id": "dinnerbell",
    "url": "/concepts/dinnerbell.html"
  },
  {
    "label": "syndicate",
    "id": "syndicate",
    "url": "/concepts/syndicate.html"
  },
  {
    "label": "stx",
    "id": "stx",
    "url": "/concepts/stx.html"
  },
  {
    "label": "komodo-editor",
    "id": "komodo-editor",
    "url": "/concepts/komodo-editor.html"
  },
  {
    "label": "Decision Model & Notation",
    "id": "decision-model-notation",
    "url": "/concepts/decision-model-notation.html"
  },
  {
    "label": "DDF",
    "id": "ddfcsv",
    "url": "/concepts/ddfcsv.html"
  },
  {
    "label": "skookumscript",
    "id": "skookumscript",
    "url": "/concepts/skookumscript.html"
  },
  {
    "label": "D4",
    "id": "d4",
    "url": "/concepts/d4.html"
  },
  {
    "label": "sierra",
    "id": "sierra",
    "url": "/concepts/sierra.html"
  },
  {
    "label": "Cymbal",
    "id": "cymbal",
    "url": "/concepts/cymbal.html"
  },
  {
    "label": "Couchbase",
    "id": "couchbase",
    "url": "/concepts/couchbase.html"
  },
  {
    "label": "Couchbase Mobile",
    "id": "couchbase-mobile",
    "url": "/concepts/couchbase-mobile.html"
  },
  {
    "label": "rider-editor",
    "id": "rider-editor",
    "url": "/concepts/rider-editor.html"
  },
  {
    "label": "rhoscript",
    "id": "rhoscript",
    "url": "/concepts/rhoscript.html"
  },
  {
    "label": "resharper-editor",
    "id": "resharper-editor",
    "url": "/concepts/resharper-editor.html"
  },
  {
    "label": "redscript",
    "id": "redscript",
    "url": "/concepts/redscript.html"
  },
  {
    "label": "intellijidea-editor",
    "id": "intellijidea-editor",
    "url": "/concepts/intellijidea-editor.html"
  },
  {
    "label": "BEAM Bytecode",
    "id": "beam-bytecode",
    "url": "/concepts/beam-bytecode.html"
  },
  {
    "label": "ConCurr",
    "id": "concurr",
    "url": "/concepts/concurr.html"
  },
  {
    "label": "concept-script",
    "id": "concept-script",
    "url": "/concepts/concept-script.html"
  },
  {
    "label": "Plush",
    "id": "plush",
    "url": "/concepts/plush.html"
  },
  {
    "label": "COGO",
    "id": "cogo",
    "url": "/concepts/cogo.html"
  },
  {
    "label": "PhpStorm",
    "id": "phpstorm-editor",
    "url": "/concepts/phpstorm-editor.html"
  },
  {
    "label": "Cigale",
    "id": "cigale",
    "url": "/concepts/cigale.html"
  },
  {
    "label": "Celsius WebScript",
    "id": "celsius-webscript",
    "url": "/concepts/celsius-webscript.html"
  },
  {
    "label": "Nova",
    "id": "nova-editor",
    "url": "/concepts/nova-editor.html"
  },
  {
    "label": "patch",
    "id": "patch",
    "url": "/concepts/patch.html"
  },
  {
    "label": "Open Financial Exchange",
    "id": "ofx",
    "url": "/concepts/ofx.html"
  },
  {
    "label": "Imaginary Number Equation",
    "id": "imaginary-number-equation",
    "url": "/concepts/imaginary-number-equation.html"
  },
  {
    "label": "BullFrog",
    "id": "bullfrog",
    "url": "/concepts/bullfrog.html"
  },
  {
    "label": "Mass Energy Equation",
    "id": "mass-energy-equation",
    "url": "/concepts/mass-energy-equation.html"
  },
  {
    "label": "marten",
    "id": "marten",
    "url": "/concepts/marten.html"
  },
  {
    "label": "lunar",
    "id": "lunar",
    "url": "/concepts/lunar.html"
  },
  {
    "label": "gedit-editor",
    "id": "gedit-editor",
    "url": "/concepts/gedit-editor.html"
  },
  {
    "label": "JPEG",
    "id": "jpeg-format",
    "url": "/concepts/jpeg-format.html"
  },
  {
    "label": "listdown",
    "id": "listdown",
    "url": "/concepts/listdown.html"
  },
  {
    "label": "Lana",
    "id": "lana",
    "url": "/concepts/lana.html"
  },
  {
    "label": "BER",
    "id": "ber",
    "url": "/concepts/ber.html"
  },
  {
    "label": "BeeBasic",
    "id": "beebasic",
    "url": "/concepts/beebasic.html"
  },
  {
    "label": "Ethernet",
    "id": "ethernet",
    "url": "/concepts/ethernet.html"
  },
  {
    "label": "jedit-editor",
    "id": "jedit-editor",
    "url": "/concepts/jedit-editor.html"
  },
  {
    "label": "iqr",
    "id": "iqr",
    "url": "/concepts/iqr.html"
  },
  {
    "label": "hello",
    "id": "hello",
    "url": "/concepts/hello.html"
  },
  {
    "label": "USB",
    "id": "usb-standard",
    "url": "/concepts/usb-standard.html"
  },
  {
    "label": "HDMI",
    "id": "hdmi-standard",
    "url": "/concepts/hdmi-standard.html"
  },
  {
    "label": "AUTOCODER II",
    "id": "autocoder-ii",
    "url": "/concepts/autocoder-ii.html"
  },
  {
    "label": "GIF",
    "id": "gif-format",
    "url": "/concepts/gif-format.html"
  },
  {
    "label": "vCard",
    "id": "vcard",
    "url": "/concepts/vcard.html"
  },
  {
    "label": "Unix",
    "id": "unix",
    "url": "/concepts/unix.html"
  },
  {
    "label": "yinyang",
    "id": "yinyang",
    "url": "/concepts/yinyang.html"
  },
  {
    "label": "xsv-app",
    "id": "xsv-app",
    "url": "/concepts/xsv-app.html"
  },
  {
    "label": "Sprite Operating System",
    "id": "sprite-os",
    "url": "/concepts/sprite-os.html"
  },
  {
    "label": "MD5",
    "id": "md5-hash-function",
    "url": "/concepts/md5-hash-function.html"
  },
  {
    "label": "Sender Policy Framework",
    "id": "spf-standard",
    "url": "/concepts/spf-standard.html"
  },
  {
    "label": "SHA-2",
    "id": "sha-2-hash-function",
    "url": "/concepts/sha-2-hash-function.html"
  },
  {
    "label": "ARTA",
    "id": "arta",
    "url": "/concepts/arta.html"
  },
  {
    "label": "SHA-1",
    "id": "sha-1-hash-function",
    "url": "/concepts/sha-1-hash-function.html"
  },
  {
    "label": "Telnet",
    "id": "telnet-protocol",
    "url": "/concepts/telnet-protocol.html"
  },
  {
    "label": "BMP file format",
    "id": "bmp-format",
    "url": "/concepts/bmp-format.html"
  },
  {
    "label": "Bend",
    "id": "bend",
    "url": "/concepts/bend.html"
  },
  {
    "label": "Safari",
    "id": "safari",
    "url": "/concepts/safari.html"
  },
  {
    "label": "ArangoDB",
    "id": "arango-db",
    "url": "/concepts/arango-db.html"
  },
  {
    "label": "HTTP/2",
    "id": "http-2",
    "url": "/concepts/http-2.html"
  },
  {
    "label": "APLO",
    "id": "aplo",
    "url": "/concepts/aplo.html"
  },
  {
    "label": "SHA-3",
    "id": "sha-3-hash-function",
    "url": "/concepts/sha-3-hash-function.html"
  },
  {
    "label": "dss",
    "id": "dss",
    "url": "/concepts/dss.html"
  },
  {
    "label": "Price Equation",
    "id": "price-equation",
    "url": "/concepts/price-equation.html"
  },
  {
    "label": "Laravel",
    "id": "laravel-framework",
    "url": "/concepts/laravel-framework.html"
  },
  {
    "label": "Real-time Transport Protocol",
    "id": "rtp-protocol",
    "url": "/concepts/rtp-protocol.html"
  },
  {
    "label": "PL/I",
    "id": "pl-i-subset-g",
    "url": "/concepts/pl-i-subset-g.html"
  },
  {
    "label": "tinygo-compiler",
    "id": "tinygo-compiler",
    "url": "/concepts/tinygo-compiler.html"
  },
  {
    "label": "Apache Phoenix",
    "id": "apache-phoenix",
    "url": "/concepts/apache-phoenix.html"
  },
  {
    "label": "Apache Derby",
    "id": "apache-derby",
    "url": "/concepts/apache-derby.html"
  },
  {
    "label": "Parsec",
    "id": "parsec",
    "url": "/concepts/parsec.html"
  },
  {
    "label": "thune",
    "id": "thune",
    "url": "/concepts/thune.html"
  },
  {
    "label": "OpenDoc",
    "id": "opendoc-protocol",
    "url": "/concepts/opendoc-protocol.html"
  },
  {
    "label": "Datalisp",
    "id": "datalisp",
    "url": "/concepts/datalisp.html"
  },
  {
    "label": "InfiniBand",
    "id": "infiniband-standard",
    "url": "/concepts/infiniband-standard.html"
  },
  {
    "label": "AMTRAN 70",
    "id": "amtran-70",
    "url": "/concepts/amtran-70.html"
  },
  {
    "label": "PDP-11",
    "id": "pdp-11-machine",
    "url": "/concepts/pdp-11-machine.html"
  },
  {
    "label": "MP3",
    "id": "mp3-format",
    "url": "/concepts/mp3-format.html"
  },
  {
    "label": "tab",
    "id": "tab",
    "url": "/concepts/tab.html"
  },
  {
    "label": "Amazon RDS",
    "id": "amazon-rds",
    "url": "/concepts/amazon-rds.html"
  },
  {
    "label": "Amazon DynamoDB",
    "id": "amazon-dynamodb",
    "url": "/concepts/amazon-dynamodb.html"
  },
  {
    "label": "Macintosh",
    "id": "macintosh-machine",
    "url": "/concepts/macintosh-machine.html"
  },
  {
    "label": "amalthea",
    "id": "amalthea",
    "url": "/concepts/amalthea.html"
  },
  {
    "label": "MacBook Air",
    "id": "macbook-air-machine",
    "url": "/concepts/macbook-air-machine.html"
  },
  {
    "label": "Altibase",
    "id": "altibase",
    "url": "/concepts/altibase.html"
  },
  {
    "label": "Language H",
    "id": "language-h",
    "url": "/concepts/language-h.html"
  },
  {
    "label": "Smartsheet",
    "id": "smartsheet-app",
    "url": "/concepts/smartsheet-app.html"
  },
  {
    "label": "MurmurHash",
    "id": "murmur-hash-function",
    "url": "/concepts/murmur-hash-function.html"
  },
  {
    "label": "IPv4",
    "id": "ipv4",
    "url": "/concepts/ipv4.html"
  },
  {
    "label": "IPhone",
    "id": "iphone-machine",
    "url": "/concepts/iphone-machine.html"
  },
  {
    "label": "IBM System z",
    "id": "systemz",
    "url": "/concepts/systemz.html"
  },
  {
    "label": "ALJABR",
    "id": "aljabr",
    "url": "/concepts/aljabr.html"
  },
  {
    "label": "IPad",
    "id": "ipad-machine",
    "url": "/concepts/ipad-machine.html"
  },
  {
    "label": "cixl",
    "id": "cixl",
    "url": "/concepts/cixl.html"
  },
  {
    "label": "ALGOL 68-RT",
    "id": "algol-68-rt",
    "url": "/concepts/algol-68-rt.html"
  },
  {
    "label": "Tap code",
    "id": "tap-code",
    "url": "/concepts/tap-code.html"
  },
  {
    "label": "Integral Equation",
    "id": "integral-equation",
    "url": "/concepts/integral-equation.html"
  },
  {
    "label": "Ingres database",
    "id": "ingres",
    "url": "/concepts/ingres.html"
  },
  {
    "label": "International Chemical Identifier",
    "id": "inchi",
    "url": "/concepts/inchi.html"
  },
  {
    "label": "IMac",
    "id": "imac-machine",
    "url": "/concepts/imac-machine.html"
  },
  {
    "label": "ALEPH",
    "id": "aleph",
    "url": "/concepts/aleph.html"
  },
  {
    "label": "HLASM",
    "id": "hlasm",
    "url": "/concepts/hlasm.html"
  },
  {
    "label": "NixOS",
    "id": "nixos",
    "url": "/concepts/nixos.html"
  },
  {
    "label": "BIND",
    "id": "bind-app",
    "url": "/concepts/bind-app.html"
  },
  {
    "label": "HCCB",
    "id": "hccb",
    "url": "/concepts/hccb.html"
  },
  {
    "label": "Numbers",
    "id": "numbers-app",
    "url": "/concepts/numbers-app.html"
  },
  {
    "label": "Deb file format",
    "id": "deb",
    "url": "/concepts/deb.html"
  },
  {
    "label": "Gravity Equation",
    "id": "gravity-equation",
    "url": "/concepts/gravity-equation.html"
  },
  {
    "label": "BLAKE",
    "id": "blake-hash-function",
    "url": "/concepts/blake-hash-function.html"
  },
  {
    "label": "WSFN",
    "id": "wsfn-programming-language",
    "url": "/concepts/wsfn-programming-language.html"
  },
  {
    "label": "Gecko",
    "id": "gecko",
    "url": "/concepts/gecko.html"
  },
  {
    "label": "VlibTemplate",
    "id": "vlibtemplate",
    "url": "/concepts/vlibtemplate.html"
  },
  {
    "label": "OpenEXR",
    "id": "openexr-format",
    "url": "/concepts/openexr-format.html"
  },
  {
    "label": "bytecode-modeling-language",
    "id": "bytecode-modeling-language",
    "url": "/concepts/bytecode-modeling-language.html"
  },
  {
    "label": "ThingLab",
    "id": "thinglab",
    "url": "/concepts/thinglab.html"
  },
  {
    "label": "YAP",
    "id": "yap-prolog",
    "url": "/concepts/yap-prolog.html"
  },
  {
    "label": "april",
    "id": "april",
    "url": "/concepts/april.html"
  },
  {
    "label": "SMIL",
    "id": "synchronized-multimedia-integration-language",
    "url": "/concepts/synchronized-multimedia-integration-language.html"
  },
  {
    "label": "XCore Architecture",
    "id": "xcore",
    "url": "/concepts/xcore.html"
  },
  {
    "label": "Interchange File Format",
    "id": "interchange-file-format",
    "url": "/concepts/interchange-file-format.html"
  },
  {
    "label": "sharpscript",
    "id": "sharpscript",
    "url": "/concepts/sharpscript.html"
  },
  {
    "label": "Timber",
    "id": "timber-programming-language",
    "url": "/concepts/timber-programming-language.html"
  },
  {
    "label": "WFL",
    "id": "work-flow-language",
    "url": "/concepts/work-flow-language.html"
  },
  {
    "label": "X BitMap",
    "id": "x-bitmap-format",
    "url": "/concepts/x-bitmap-format.html"
  },
  {
    "label": "SDTM",
    "id": "sdtm",
    "url": "/concepts/sdtm.html"
  },
  {
    "label": "Turbo Assembler",
    "id": "turbo-assembler",
    "url": "/concepts/turbo-assembler.html"
  },
  {
    "label": "WebStorm",
    "id": "webstorm-editor",
    "url": "/concepts/webstorm-editor.html"
  },
  {
    "label": "Euler's Equation",
    "id": "eulers-equation",
    "url": "/concepts/eulers-equation.html"
  },
  {
    "label": "TACPOL",
    "id": "tacpol-programming-language",
    "url": "/concepts/tacpol-programming-language.html"
  },
  {
    "label": "PV-Wave",
    "id": "pv-wave",
    "url": "/concepts/pv-wave.html"
  },
  {
    "label": "WML",
    "id": "wireless-markup-language",
    "url": "/concepts/wireless-markup-language.html"
  },
  {
    "label": "Matrix protocol",
    "id": "matrix-protocol",
    "url": "/concepts/matrix-protocol.html"
  },
  {
    "label": "CSV++",
    "id": "csvpp",
    "url": "/concepts/csvpp.html"
  },
  {
    "label": "adam-standard",
    "id": "adam-standard",
    "url": "/concepts/adam-standard.html"
  },
  {
    "label": "TELCOMP",
    "id": "telcomp",
    "url": "/concepts/telcomp.html"
  },
  {
    "label": "TScript",
    "id": "tscript",
    "url": "/concepts/tscript.html"
  },
  {
    "label": "Clinical Document Architecture",
    "id": "cda",
    "url": "/concepts/cda.html"
  },
  {
    "label": "Tiger-BASIC",
    "id": "tiger-basic",
    "url": "/concepts/tiger-basic.html"
  },
  {
    "label": "TriG syntax",
    "id": "trig-syntax",
    "url": "/concepts/trig-syntax.html"
  },
  {
    "label": "BIPLAN",
    "id": "biplan",
    "url": "/concepts/biplan.html"
  },
  {
    "label": "OMeta",
    "id": "ometa",
    "url": "/concepts/ometa.html"
  },
  {
    "label": "Dot Product Equation",
    "id": "dot-product-equation",
    "url": "/concepts/dot-product-equation.html"
  },
  {
    "label": "VisualWorks",
    "id": "visualworks",
    "url": "/concepts/visualworks.html"
  },
  {
    "label": "BPML",
    "id": "business-process-modeling-language",
    "url": "/concepts/business-process-modeling-language.html"
  },
  {
    "label": "UIML",
    "id": "uiml",
    "url": "/concepts/uiml.html"
  },
  {
    "label": "ILBM",
    "id": "ilbm",
    "url": "/concepts/ilbm.html"
  },
  {
    "label": "Turbo-Basic XL",
    "id": "turbo-basic-xl",
    "url": "/concepts/turbo-basic-xl.html"
  },
  {
    "label": "LEXX",
    "id": "lexx-editor",
    "url": "/concepts/lexx-editor.html"
  },
  {
    "label": "unlws",
    "id": "unlws",
    "url": "/concepts/unlws.html"
  },
  {
    "label": "Steinberg Cubase",
    "id": "cubase",
    "url": "/concepts/cubase.html"
  },
  {
    "label": "GRML",
    "id": "grml",
    "url": "/concepts/grml.html"
  },
  {
    "label": "ACSI-Matic",
    "id": "acsi-matic",
    "url": "/concepts/acsi-matic.html"
  },
  {
    "label": "Visual Objects",
    "id": "visual-objects",
    "url": "/concepts/visual-objects.html"
  },
  {
    "label": "Xupdate",
    "id": "xupdate",
    "url": "/concepts/xupdate.html"
  },
  {
    "label": "Twelf",
    "id": "twelf",
    "url": "/concepts/twelf.html"
  },
  {
    "label": "Synon",
    "id": "synon",
    "url": "/concepts/synon.html"
  },
  {
    "label": "Gello Expression Language",
    "id": "gello",
    "url": "/concepts/gello.html"
  },
  {
    "label": "THINK C",
    "id": "think-c",
    "url": "/concepts/think-c.html"
  },
  {
    "label": "VisSim",
    "id": "vissim",
    "url": "/concepts/vissim.html"
  },
  {
    "label": "Bayes' Equation",
    "id": "bayes-equation",
    "url": "/concepts/bayes-equation.html"
  },
  {
    "label": "Omnis Studio",
    "id": "omnis-studio",
    "url": "/concepts/omnis-studio.html"
  },
  {
    "label": "atomo",
    "id": "atomo",
    "url": "/concepts/atomo.html"
  },
  {
    "label": "Tymshare SuperBasic",
    "id": "tymshare-superbasic",
    "url": "/concepts/tymshare-superbasic.html"
  },
  {
    "label": "String diagram",
    "id": "string-diagrams-notation",
    "url": "/concepts/string-diagrams-notation.html"
  },
  {
    "label": "Steinhaus-Moser notation",
    "id": "steinhaus-moser-notation",
    "url": "/concepts/steinhaus-moser-notation.html"
  },
  {
    "label": "Atom",
    "id": "atom-editor",
    "url": "/concepts/atom-editor.html"
  },
  {
    "label": "REC Studio",
    "id": "rec-studio",
    "url": "/concepts/rec-studio.html"
  },
  {
    "label": "Sugi",
    "id": "sugi",
    "url": "/concepts/sugi.html"
  },
  {
    "label": "Apple I",
    "id": "apple-1-machine",
    "url": "/concepts/apple-1-machine.html"
  },
  {
    "label": "IBM i Control Language",
    "id": "ibm-i-control-language",
    "url": "/concepts/ibm-i-control-language.html"
  },
  {
    "label": "SnapTag",
    "id": "snaptag",
    "url": "/concepts/snaptag.html"
  },
  {
    "label": "HTTP/3",
    "id": "http-3",
    "url": "/concepts/http-3.html"
  },
  {
    "label": "QtScript",
    "id": "qtscript",
    "url": "/concepts/qtscript.html"
  },
  {
    "label": "Continuity of Care Record",
    "id": "ccr",
    "url": "/concepts/ccr.html"
  },
  {
    "label": "UBJSON",
    "id": "ubjson",
    "url": "/concepts/ubjson.html"
  },
  {
    "label": "Acorn Atom",
    "id": "acorn-atom",
    "url": "/concepts/acorn-atom.html"
  },
  {
    "label": "ALGOL X",
    "id": "algol-x",
    "url": "/concepts/algol-x.html"
  },
  {
    "label": "BASIC09",
    "id": "basic09",
    "url": "/concepts/basic09.html"
  },
  {
    "label": "AFS",
    "id": "afs",
    "url": "/concepts/afs.html"
  },
  {
    "label": "Deesel",
    "id": "deesel",
    "url": "/concepts/deesel.html"
  },
  {
    "label": "nirvana",
    "id": "nirvana",
    "url": "/concepts/nirvana.html"
  },
  {
    "label": "vivaldi",
    "id": "vivaldi",
    "url": "/concepts/vivaldi.html"
  },
  {
    "label": "ALGOL N",
    "id": "algol-n",
    "url": "/concepts/algol-n.html"
  },
  {
    "label": "AmigaBASIC",
    "id": "amigabasic",
    "url": "/concepts/amigabasic.html"
  },
  {
    "label": "Address",
    "id": "address",
    "url": "/concepts/address.html"
  },
  {
    "label": "AlphaBasic",
    "id": "alphabasic",
    "url": "/concepts/alphabasic.html"
  },
  {
    "label": "Adenine",
    "id": "adenine-programming-language",
    "url": "/concepts/adenine-programming-language.html"
  },
  {
    "label": "Abbreviated Test Language for All Systems",
    "id": "abbreviated-test-language-for-all-systems",
    "url": "/concepts/abbreviated-test-language-for-all-systems.html"
  },
  {
    "label": "aplette",
    "id": "aplette",
    "url": "/concepts/aplette.html"
  },
  {
    "label": "ABC 80",
    "id": "abc-80",
    "url": "/concepts/abc-80.html"
  },
  {
    "label": "Bigwig Programming Language",
    "id": "bigwig-programming-language",
    "url": "/concepts/bigwig-programming-language.html"
  },
  {
    "label": "concordance",
    "id": "concordance",
    "url": "/concepts/concordance.html"
  },
  {
    "label": "chappe-code",
    "id": "chappe-code",
    "url": "/concepts/chappe-code.html"
  },
  {
    "label": "Zip file format",
    "id": "zip-format",
    "url": "/concepts/zip-format.html"
  },
  {
    "label": "codelite-editor",
    "id": "codelite-editor",
    "url": "/concepts/codelite-editor.html"
  },
  {
    "label": "code-blocks-editor",
    "id": "code-blocks-editor",
    "url": "/concepts/code-blocks-editor.html"
  },
  {
    "label": "clion-editor",
    "id": "clion-editor",
    "url": "/concepts/clion-editor.html"
  },
  {
    "label": "UTC",
    "id": "utc-format",
    "url": "/concepts/utc-format.html"
  },
  {
    "label": "DisplayPort",
    "id": "displayport-standard",
    "url": "/concepts/displayport-standard.html"
  },
  {
    "label": "Wiswesser line notation",
    "id": "wiswesser-line-notation",
    "url": "/concepts/wiswesser-line-notation.html"
  },
  {
    "label": "WATBOL",
    "id": "watbol",
    "url": "/concepts/watbol.html"
  },
  {
    "label": "Vienna Development Method Specification Language",
    "id": "vdm-sl",
    "url": "/concepts/vdm-sl.html"
  },
  {
    "label": "SYBYL line notation",
    "id": "sybyl-notation",
    "url": "/concepts/sybyl-notation.html"
  },
  {
    "label": "Digital Visual Interface",
    "id": "dvi-standard",
    "url": "/concepts/dvi-standard.html"
  },
  {
    "label": "Floral",
    "id": "floral",
    "url": "/concepts/floral.html"
  },
  {
    "label": "Set-builder notation",
    "id": "set-builder-notation",
    "url": "/concepts/set-builder-notation.html"
  },
  {
    "label": "Argon",
    "id": "argon",
    "url": "/concepts/argon.html"
  },
  {
    "label": "Tagged Image File Format",
    "id": "tiff-format",
    "url": "/concepts/tiff-format.html"
  },
  {
    "label": "arbortext-command-language",
    "id": "arbortext-command-language",
    "url": "/concepts/arbortext-command-language.html"
  },
  {
    "label": "Euclidean geometry",
    "id": "euclidean-geometry",
    "url": "/concepts/euclidean-geometry.html"
  },
  {
    "label": "Pythagorean Equation",
    "id": "pythagorean-equation",
    "url": "/concepts/pythagorean-equation.html"
  },
  {
    "label": "brackets-editor",
    "id": "brackets-editor",
    "url": "/concepts/brackets-editor.html"
  },
  {
    "label": "Normal Distribution Equation",
    "id": "normal-distribution-equation",
    "url": "/concepts/normal-distribution-equation.html"
  },
  {
    "label": "WHOIS",
    "id": "whois-protocol",
    "url": "/concepts/whois-protocol.html"
  },
  {
    "label": "MonoDevelop",
    "id": "monodevelop-editor",
    "url": "/concepts/monodevelop-editor.html"
  },
  {
    "label": "coi-protocol",
    "id": "coi-protocol",
    "url": "/concepts/coi-protocol.html"
  },
  {
    "label": "Visual J++",
    "id": "jpp",
    "url": "/concepts/jpp.html"
  },
  {
    "label": "clickpath",
    "id": "clickpath",
    "url": "/concepts/clickpath.html"
  },
  {
    "label": "TRS-80 Color Computer",
    "id": "trs-80-color-computer",
    "url": "/concepts/trs-80-color-computer.html"
  },
  {
    "label": "Babylonian numerals",
    "id": "babylonian-numerals",
    "url": "/concepts/babylonian-numerals.html"
  },
  {
    "label": "chicken-lang",
    "id": "chicken-lang",
    "url": "/concepts/chicken-lang.html"
  },
  {
    "label": "XProfan",
    "id": "xprofan",
    "url": "/concepts/xprofan.html"
  },
  {
    "label": "Gauss Magnetism Formula",
    "id": "gauss-magnetism-equation",
    "url": "/concepts/gauss-magnetism-equation.html"
  },
  {
    "label": "Function block diagram",
    "id": "function-block-diagram",
    "url": "/concepts/function-block-diagram.html"
  },
  {
    "label": "Analytical engine",
    "id": "analytical-engine-machine",
    "url": "/concepts/analytical-engine-machine.html"
  },
  {
    "label": "Wlanguage",
    "id": "wlanguage",
    "url": "/concepts/wlanguage.html"
  },
  {
    "label": "Gauss Flux Formula",
    "id": "gauss-flux-equation",
    "url": "/concepts/gauss-flux-equation.html"
  },
  {
    "label": "WinDev",
    "id": "windev",
    "url": "/concepts/windev.html"
  },
  {
    "label": "UJML",
    "id": "ujml",
    "url": "/concepts/ujml.html"
  },
  {
    "label": "4G",
    "id": "4g-standard",
    "url": "/concepts/4g-standard.html"
  },
  {
    "label": "TouchDevelop",
    "id": "touchdevelop",
    "url": "/concepts/touchdevelop.html"
  },
  {
    "label": "Visual Smalltalk Enterprise",
    "id": "visual-smalltalk-enterprise",
    "url": "/concepts/visual-smalltalk-enterprise.html"
  },
  {
    "label": "Liber Abaci",
    "id": "fibonacci-notation",
    "url": "/concepts/fibonacci-notation.html"
  },
  {
    "label": "Tektronix 4050",
    "id": "tektronix",
    "url": "/concepts/tektronix.html"
  },
  {
    "label": "Tibbo BASIC",
    "id": "tibbo-basic",
    "url": "/concepts/tibbo-basic.html"
  },
  {
    "label": "Superx++",
    "id": "superxpp",
    "url": "/concepts/superxpp.html"
  },
  {
    "label": "Faraday's Induction Equation",
    "id": "faradays-induction-equation",
    "url": "/concepts/faradays-induction-equation.html"
  },
  {
    "label": "XGMML",
    "id": "xgmml",
    "url": "/concepts/xgmml.html"
  },
  {
    "label": "Visual DataFlex",
    "id": "visual-dataflex",
    "url": "/concepts/visual-dataflex.html"
  },
  {
    "label": "Etruscan numerals",
    "id": "etruscan-numerals",
    "url": "/concepts/etruscan-numerals.html"
  },
  {
    "label": "XMTC",
    "id": "xmtc",
    "url": "/concepts/xmtc.html"
  },
  {
    "label": "Vilnius BASIC",
    "id": "vilnius-basic",
    "url": "/concepts/vilnius-basic.html"
  },
  {
    "label": "Typographical Number Theory",
    "id": "typographical-number-theory",
    "url": "/concepts/typographical-number-theory.html"
  },
  {
    "label": "THEOS",
    "id": "theos-multi-user-basic",
    "url": "/concepts/theos-multi-user-basic.html"
  },
  {
    "label": "Advanced Authoring Format",
    "id": "aaf",
    "url": "/concepts/aaf.html"
  },
  {
    "label": "WebKit",
    "id": "webkit",
    "url": "/concepts/webkit.html"
  },
  {
    "label": "Monesa",
    "id": "monesa",
    "url": "/concepts/monesa.html"
  },
  {
    "label": "Definite clause grammar",
    "id": "definite-clause-grammar-notation",
    "url": "/concepts/definite-clause-grammar-notation.html"
  },
  {
    "label": "WDDX",
    "id": "wddx",
    "url": "/concepts/wddx.html"
  },
  {
    "label": "CueCat",
    "id": "cuecat",
    "url": "/concepts/cuecat.html"
  },
  {
    "label": "Roman numerals",
    "id": "roman-numerals",
    "url": "/concepts/roman-numerals.html"
  },
  {
    "label": "Roman abacus",
    "id": "roman-abacus-machine",
    "url": "/concepts/roman-abacus-machine.html"
  },
  {
    "label": "MetaL",
    "id": "metal-programming-language",
    "url": "/concepts/metal-programming-language.html"
  },
  {
    "label": "Coulomb's Equation",
    "id": "coulombs-equation",
    "url": "/concepts/coulombs-equation.html"
  },
  {
    "label": "FM broadcasting",
    "id": "fm-standard",
    "url": "/concepts/fm-standard.html"
  },
  {
    "label": "WinWrap Basic",
    "id": "winwrap-basic",
    "url": "/concepts/winwrap-basic.html"
  },
  {
    "label": "XBEL",
    "id": "xbel",
    "url": "/concepts/xbel.html"
  },
  {
    "label": "X-BASIC",
    "id": "x-basic",
    "url": "/concepts/x-basic.html"
  },
  {
    "label": "Watcom",
    "id": "watcom",
    "url": "/concepts/watcom.html"
  },
  {
    "label": "Transaction Language 1",
    "id": "transaction-language-1",
    "url": "/concepts/transaction-language-1.html"
  },
  {
    "label": "Hyper Basic",
    "id": "hyper-basic",
    "url": "/concepts/hyper-basic.html"
  },
  {
    "label": "Firefox",
    "id": "firefox",
    "url": "/concepts/firefox.html"
  },
  {
    "label": "YARV",
    "id": "yarv",
    "url": "/concepts/yarv.html"
  },
  {
    "label": "Ampère's Circuital Equation",
    "id": "amperes-circuital-equation",
    "url": "/concepts/amperes-circuital-equation.html"
  },
  {
    "label": "ALOHAnet",
    "id": "alohanet",
    "url": "/concepts/alohanet.html"
  },
  {
    "label": "Hindu-Arabic numeral system",
    "id": "arabic-numerals",
    "url": "/concepts/arabic-numerals.html"
  },
  {
    "label": "Sun Raster",
    "id": "sun-raster-format",
    "url": "/concepts/sun-raster-format.html"
  },
  {
    "label": "Chomski",
    "id": "chomski",
    "url": "/concepts/chomski.html"
  },
  {
    "label": "w",
    "id": "w",
    "url": "/concepts/w.html"
  },
  {
    "label": "ApeScript",
    "id": "apescript",
    "url": "/concepts/apescript.html"
  },
  {
    "label": "Actor",
    "id": "actor",
    "url": "/concepts/actor.html"
  },
  {
    "label": "Pascal's calculator",
    "id": "pascals-calculator-machine",
    "url": "/concepts/pascals-calculator-machine.html"
  },
  {
    "label": "euboea",
    "id": "euboea",
    "url": "/concepts/euboea.html"
  },
  {
    "label": "Data Catalog Vocabulary",
    "id": "dcat",
    "url": "/concepts/dcat.html"
  },
  {
    "label": "Boxx",
    "id": "boxx",
    "url": "/concepts/boxx.html"
  },
  {
    "label": "BitC",
    "id": "bitc",
    "url": "/concepts/bitc.html"
  },
  {
    "label": "WebP",
    "id": "webp-format",
    "url": "/concepts/webp-format.html"
  },
  {
    "label": "Video Graphics Array",
    "id": "vga-standard",
    "url": "/concepts/vga-standard.html"
  },
  {
    "label": "2lisp",
    "id": "2lisp",
    "url": "/concepts/2lisp.html"
  },
  {
    "label": "Navier-Stokes Equation",
    "id": "navier-stokes-equation",
    "url": "/concepts/navier-stokes-equation.html"
  },
  {
    "label": "Ternary numeral system",
    "id": "ternary-notation",
    "url": "/concepts/ternary-notation.html"
  },
  {
    "label": "appcode-editor",
    "id": "appcode-editor",
    "url": "/concepts/appcode-editor.html"
  },
  {
    "label": "XBRL",
    "id": "xbrl",
    "url": "/concepts/xbrl.html"
  },
  {
    "label": "Greek numerals",
    "id": "greek-numerals",
    "url": "/concepts/greek-numerals.html"
  },
  {
    "label": "XDR Schema",
    "id": "xdr",
    "url": "/concepts/xdr.html"
  },
  {
    "label": "Zope",
    "id": "zope",
    "url": "/concepts/zope.html"
  },
  {
    "label": "ZigZag",
    "id": "zigzag",
    "url": "/concepts/zigzag.html"
  },
  {
    "label": "Feynman diagram",
    "id": "feynman-diagram",
    "url": "/concepts/feynman-diagram.html"
  },
  {
    "label": "Fast Fourier Transform Equation",
    "id": "fast-fourier-transform-equation",
    "url": "/concepts/fast-fourier-transform-equation.html"
  },
  {
    "label": "Visual Paradigm",
    "id": "visual-paradigm-app",
    "url": "/concepts/visual-paradigm-app.html"
  },
  {
    "label": "Tahoe-LAFS",
    "id": "tahoe-lafs",
    "url": "/concepts/tahoe-lafs.html"
  },
  {
    "label": "Balanced ternary",
    "id": "balanced-ternary-notation",
    "url": "/concepts/balanced-ternary-notation.html"
  },
  {
    "label": "Bit array",
    "id": "bitarray",
    "url": "/concepts/bitarray.html"
  },
  {
    "label": "Attic numerals",
    "id": "attic-numerals",
    "url": "/concepts/attic-numerals.html"
  },
  {
    "label": "ADS-B",
    "id": "ads-b-standard",
    "url": "/concepts/ads-b-standard.html"
  },
  {
    "label": "Abacus",
    "id": "abacus-machine",
    "url": "/concepts/abacus-machine.html"
  }
]

let autocompleteSearchIndex = window.autocompleteJs || [] // todo: cleanup?
// handle localhost differently
const isLocalHost = location.href.includes("/pldb/")
const isNested = isLocalHost && location.href.split("/pldb/")[1].split("/").length - 1
const normalizeUrl = url => (isLocalHost ? (isNested ? ".." + url : url.substr(1)) : url)
if (location.href.includes("/pldb/")) {
  autocompleteSearchIndex = autocompleteSearchIndex.map(row => {
    row.url = normalizeUrl(row.url)
    return row
  })
}

const initAutocomplete = elementId => {
  const input = document.getElementById(elementId)
  const urlParams = new URLSearchParams(window.location.search)
  const query = urlParams.get("q")
  if (query) input.value = query
  autocomplete({
    input,
    minLength: 1,
    emptyMsg: "No matching entities found",
    preventSubmit: true,
    fetch: async (query, update) => {
      const text = query.toLowerCase()
      const suggestions = autocompleteSearchIndex.filter(entity => entity.label.toLowerCase().startsWith(text))

      const htmlEncodedQuery = query.replace(/</g, "&lt;")

      suggestions.push({
        label: `Full text search for "${htmlEncodedQuery}"`,
        id: "",
        url: normalizeUrl(`/lists/explorer.html#q=${htmlEncodedQuery}`)
      })
      update(suggestions)
    },
    onSelect: item => {
      const { url, id } = item
      if (id) window.location = url
      else window.location = normalizeUrl("/lists/explorer.html#q=" + encodeURIComponent(input.value))
    }
  })
}