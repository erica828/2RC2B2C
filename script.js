/* ==========================================================
   LEADERBOARD LOGIC
   You normally do NOT need to edit this file.
   Edit config.js (texts, categories, rules) and runs.js (the times).
   ========================================================== */
(function () {
  "use strict";

  var cfg = window.SITE_CONFIG || {};
  var runs = window.RUNS || [];
  var categories = cfg.categories || [];

  function $(selector) { return document.querySelector(selector); }

  // "1:06.50" -> 66.5   |   "48.2" -> 48.2
  function parseTime(text) {
    var parts = String(text).trim().split(":");
    var seconds = 0;
    for (var i = 0; i < parts.length; i++) {
      seconds = seconds * 60 + parseFloat(parts[i]);
    }
    return seconds;
  }

  function isValidTime(text) {
    return /^(\d{1,2}:)?\d{1,2}(\.\d{1,3})?$/.test(String(text).trim());
  }

  function formatDate(iso) {
    if (!iso) return "";
    var d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return iso;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  // Only allow http(s) links so a bad entry can never run code.
  function safeUrl(url) {
    return /^https?:\/\//i.test(url || "") ? url : "";
  }

  // ---------- state ----------
  var activeCategory = categories.length ? categories[0].id : "";

  // ---------- page texts ----------
  document.title = cfg.siteName || document.title;
  $("#site-name").textContent = cfg.siteName || "Leaderboard";
  $("#tagline").textContent = cfg.tagline || "";
  $("#safety").textContent = cfg.safetyNote || "";

  var rulesList = $("#rules");
  (cfg.rules || []).forEach(function (rule) {
    var li = document.createElement("li");
    li.textContent = rule;
    rulesList.appendChild(li);
  });

  // ---------- tabs ----------
  var tabsEl = $("#tabs");
  var categorySelect = $("#category-select");

  categories.forEach(function (cat) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tab";
    btn.setAttribute("role", "tab");
    btn.dataset.id = cat.id;
    var strong = document.createElement("strong");
    strong.textContent = cat.short;
    var small = document.createElement("small");
    small.textContent = cat.label;
    btn.appendChild(strong);
    btn.appendChild(small);
    btn.addEventListener("click", function () {
      activeCategory = cat.id;
      history.replaceState(null, "", "#" + cat.id);
      render();
    });
    tabsEl.appendChild(btn);

    var opt = document.createElement("option");
    opt.value = cat.id;
    opt.textContent = cat.short + " – " + cat.label;
    categorySelect.appendChild(opt);
  });

  // open the right tab when the URL ends with #1rc1c1b etc.
  var hash = location.hash.replace("#", "");
  if (categories.some(function (c) { return c.id === hash; })) activeCategory = hash;

  $("#best-only").addEventListener("change", render);

  // ---------- leaderboard ----------
  function render() {
    var bestOnly = $("#best-only").checked;

    Array.prototype.forEach.call(tabsEl.children, function (btn) {
      btn.setAttribute("aria-selected", String(btn.dataset.id === activeCategory));
    });

    var list = runs
      .filter(function (r) { return r.category === activeCategory; })
      .map(function (r) { return Object.assign({}, r, { seconds: parseTime(r.time) }); })
      .filter(function (r) { return !isNaN(r.seconds); })
      .sort(function (a, b) { return a.seconds - b.seconds; });

    if (bestOnly) {
      var seen = {};
      list = list.filter(function (r) {
        var key = r.name.trim().toLowerCase();
        if (seen[key]) return false;
        seen[key] = true;
        return true;
      });
    }

    var tbody = $("#board tbody");
    tbody.innerHTML = "";

    list.forEach(function (run, index) {
      var tr = document.createElement("tr");

      var rank = document.createElement("td");
      rank.className = "col-rank" + (index < 3 ? " rank-" + (index + 1) : "");
      rank.textContent = index + 1;

      var name = document.createElement("td");
      name.textContent = run.name;
      if (run.notes) name.title = run.notes;

      var time = document.createElement("td");
      time.className = "time";
      time.textContent = run.time;

      var date = document.createElement("td");
      date.className = "col-date";
      date.textContent = formatDate(run.date);

      var proof = document.createElement("td");
      var url = safeUrl(run.video);
      if (url) {
        var a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = "Watch";
        proof.appendChild(a);
      } else {
        proof.textContent = "–";
      }

      [rank, name, time, date, proof].forEach(function (td) { tr.appendChild(td); });
      tbody.appendChild(tr);
    });

    $("#empty").hidden = list.length > 0;
    $("#board").hidden = list.length === 0;
    $("#count").textContent = list.length + (list.length === 1 ? " run" : " runs");
  }

  // ---------- submit form ----------
  var dialog = $("#submit-dialog");
  var form = $("#submit-form");
  var status = $("#form-status");

  function setStatus(message, type) {
    status.textContent = message;
    status.className = "status" + (type ? " " + type : "");
  }

  $("#open-submit").addEventListener("click", function () {
    form.elements.category.value = activeCategory;
    form.elements.date.valueAsDate = new Date();
    setStatus("");
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  });

  $("#close-submit").addEventListener("click", function () { dialog.close(); });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var f = form.elements;

    // spam bots fill the hidden field: pretend it worked and stop
    if (f.website.value) { dialog.close(); return; }

    var data = {
      name: f.name.value.trim(),
      category: f.category.value,
      time: f.time.value.trim(),
      date: f.date.value,
      video: f.video.value.trim(),
      notes: f.notes.value.trim()
    };

    if (!data.name) return setStatus("Please enter your name.", "err");
    if (!isValidTime(data.time)) return setStatus("Time must look like 1:06.50 or 48.20.", "err");
    if (!safeUrl(data.video)) return setStatus("Please paste a full video link starting with https://", "err");
    if (!f.confirm.checked) return setStatus("Please confirm the checkbox.", "err");

    if (cfg.formEndpoint) {
      setStatus("Sending…");
      fetch(cfg.formEndpoint, {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Request failed");
          setStatus("Thanks! Your run was sent and will be reviewed soon.", "ok");
          form.reset();
          setTimeout(function () { dialog.close(); }, 2200);
        })
        .catch(function () {
          setStatus("Something went wrong. Please try again later.", "err");
        });
    } else {
      // No form service configured: open the visitor's email app instead.
      var body =
        "Name: " + data.name + "\n" +
        "Category: " + data.category + "\n" +
        "Time: " + data.time + "\n" +
        "Date: " + data.date + "\n" +
        "Video: " + data.video + "\n" +
        "Notes: " + data.notes + "\n";
      location.href =
        "mailto:" + encodeURIComponent(cfg.contactEmail || "") +
        "?subject=" + encodeURIComponent("Run submission: " + data.name + " " + data.time) +
        "&body=" + encodeURIComponent(body);
      setStatus("Your email app should open. Press send there to submit your run.", "ok");
    }
  });

  render();
})();
