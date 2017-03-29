var sandalchest = {};
sandalchest.drawDiv = function(e, n, t) {
    var a = e.options && e.options.speed || 1e3,
        o = e.options && e.options.rotation || 2,
        par = e.options && e.options.parent || 'body',
        s = document.createElement("div");
    s.id = "sandalchest-modal-bg", s.innerHTML = "&nbsp;";
    var l = document.createElement("div");
    l.className = "col-sm-12 col-md-4 col-md-offset-4 sandalchest-modal-main", l.innerHTML = "<h2>" + (e.title || " ") + '</h2><div class="sandalchest-text-main">' + (e.text || "") + "</div>", l.style.transform = "rotateZ(" + o + "deg)", $(s).append(l);
    var r = document.createElement("div"),
        u = document.createElement("div");
    r.className = "sandalchest-modal-scroll-top", u.className = "sandalchest-modal-scroll-bot", $(l).append(r), $(l).append(u);
    var i = document.createElement("div");
    i.className = "sandalchest-modal-scroll-right", $(r).append(i);
    var c = document.createElement("div");
    c.className = "sandalchest-modal-scroll-right", $(u).append(c);
    var m = document.createElement("div");
    m.className = "sandalchest-modal-scroll-left", $(r).append(m);
    var d = document.createElement("div");
    d.className = "sandalchest-modal-scroll-left", $(u).append(d), $(par).append(s), $(s).fadeIn(250), $(l).animate({ height: "80vh", top: "10vh" }, { duration: a, queue: !1 }), $(r).animate({ height: "0%" }, { duration: a, queue: !1 }), $(u).animate({ height: "0%" }, { duration: a, queue: !1 }), $(".sandalchest-modal-scroll-right").animate({ width: ".25%" }, { duration: a, queue: !1 }), $(".sandalchest-modal-scroll-left").animate({ width: ".25%" }, { duration: a, queue: !1 });
    var p = document.createElement("div");
    if (p.className = "sandalchest-modal-buttons", $(l).append(p), 3 > n) {
        var f = document.createElement("button"),
            g = document.createElement("button"),
            h = document.createElement("input");
        f.className = "btn btn-stone", g.className = "btn btn-stone", f.id = "sandalchest-okay", g.id = "sandalchest-nope", f.tabIndex = 0, g.tabIndex = 1, f.innerHTML = "Okay", g.innerHTML = "Cancel", h.id = "sandalchest-input";
        var y = null;
        $(p).append(f), 0 == n || ($(p).append(g), 1 == n || ($(".sandalchest-text-main").append("<br/><br/>").append(h), h.tabIndex = 0, f.tabIndex = 1, g.tabIndex = 2)), document.querySelector("#sandalchest-okay").onkeyup = function(e) { 27 == e.which && $("#sandalchest-nope").click() }, 2 > n ? document.querySelector("#sandalchest-okay").focus() : (document.querySelector("#sandalchest-input").focus(), document.querySelector("#sandalchest-input").onkeyup = function(e) { console.log(e), 27 == e.which ? $("#sandalchest-nope").click() : 13 == e.which && $("#sandalchest-okay").click() }), f.onclick = function() { $(s).fadeOut(250, function() { n > 1 ? y = $("#sandalchest-input").val() || !1 : 1 == n && (y = !0), t && t(y), $(this).remove() }) }, g.onclick = function() { $(s).fadeOut(250, function() { t && t(null), console.log(null), $(this).remove() }) } } else
        for (var b = 0; b < e.options.buttons.length; b++) {
            var v = document.createElement("button");
            v.className = "btn btn-stone", v.id = "customButton" + b, v.innerHTML = e.options.buttons[b].text || "Undefined", e.options.buttons[b].click && (console.log("Applying custom cb ", e.options.buttons[b].click), v.onclick = e.options.buttons[b].click), e.options.buttons[b].close && (v.onmouseup = function() { $(s).fadeOut(250, function() { $(this).remove() }) }), $(p).append(v) } }, sandalchest.alert = function(e, n, t, a) { console.log(arguments);
    for (var o = null, s = null, l = null, r = null, u = 0; u < arguments.length; u++) {
        if ("string" == typeof arguments[u] && null == o) o = arguments[u];
        else if ("string" == typeof arguments[u] && null == s) s = arguments[u];
        else if ("string" == typeof arguments[u]) throw new Error("Too many string params supplied!");
        if ("object" == typeof arguments[u] && null == l) l = arguments[u];
        else if ("object" == typeof arguments[u]) throw new Error("Too many configuration objects supplied!");
        if ("function" == typeof arguments[u] && null == r) r = arguments[u];
        else if ("function" == typeof arguments[u]) throw new Error("You can only have one callback function!") }
    var i = { title: o, text: s, options: l };
    sandalchest.drawDiv(i, 0, r) }, sandalchest.confirm = function(e, n, t, a) { console.log(arguments);
    for (var o = null, s = null, l = null, r = null, u = 0; u < arguments.length; u++) {
        if ("string" == typeof arguments[u] && null == o) o = arguments[u];
        else if ("string" == typeof arguments[u] && null == s) s = arguments[u];
        else if ("string" == typeof arguments[u]) throw new Error("Too many string params supplied!");
        if ("object" == typeof arguments[u] && null == l) l = arguments[u];
        else if ("object" == typeof arguments[u]) throw new Error("Too many configuration objects supplied!");
        if ("function" == typeof arguments[u] && null == r) r = arguments[u];
        else if ("function" == typeof arguments[u]) throw new Error("You can only have one callback function!") }
    var i = { title: o, text: s, options: l };
    sandalchest.drawDiv(i, 1, r) }, sandalchest.prompt = function(e, n, t, a) {
    for (var o = null, s = null, l = null, r = null, u = 0; u < arguments.length; u++) {
        if ("string" == typeof arguments[u] && null == o) o = arguments[u];
        else if ("string" == typeof arguments[u] && null == s) s = arguments[u];
        else if ("string" == typeof arguments[u]) throw new Error("Too many string params supplied!");
        if ("object" == typeof arguments[u] && null == l) l = arguments[u];
        else if ("object" == typeof arguments[u]) throw new Error("Too many configuration objects supplied!");
        if ("function" == typeof arguments[u] && null == r) r = arguments[u];
        else if ("function" == typeof arguments[u]) throw new Error("You can only have one callback function!") }
    var i = { title: o, text: s, options: l };
    sandalchest.drawDiv(i, 2, r) }, sandalchest.dialog = function(e, n, t, a) {
    for (var o = null, s = null, l = null, r = null, u = 0; u < arguments.length; u++) {
        if ("string" == typeof arguments[u] && null == o) o = arguments[u];
        else if ("string" == typeof arguments[u] && null == s) s = arguments[u];
        else if ("string" == typeof arguments[u]) throw new Error("Too many string params supplied!");
        if ("object" == typeof arguments[u] && null == l) l = arguments[u];
        else if ("object" == typeof arguments[u]) throw new Error("Too many configuration objects supplied!");
        if ("function" == typeof arguments[u] && null == r) r = arguments[u];
        else if ("function" == typeof arguments[u]) throw new Error("You can only have one callback function!") }
    if (!l || !l.buttons) throw new Error("Custom dialog specified without any buttons!");
    if (!o || !s) throw new Error("Custom dialogs MUST have both a title and body text!");
    var i = { title: o, text: s, options: l };
    sandalchest.drawDiv(i, 3, r) };
