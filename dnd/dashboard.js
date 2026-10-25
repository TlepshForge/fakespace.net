/* Renders dnd/index.html from the JSON path on this script tag.
   Values are inserted as text, never as HTML.
   A future Python service can return the same JSON document. */
(function () {
  "use strict";

  var script = document.querySelector("script[data-campaign]");
  var source = script ? script.getAttribute("data-campaign") : "";
  var banner = document.getElementById("data-banner");
  var main = document.getElementById("content");
  var busyIds = [
    "next-session",
    "party",
    "sessions",
    "quests-active",
    "quests-completed",
    "npcs",
    "links"
  ];

  function setBanner(message, isError) {
    if (!banner) return;
    banner.hidden = false;
    banner.className = isError ? "banner banner-error" : "banner";
    banner.setAttribute("role", isError ? "alert" : "status");
    banner.textContent = message;
  }

  function clearBusy() {
    busyIds.forEach(function (id) {
      var node = document.getElementById(id);
      if (node) node.removeAttribute("aria-busy");
    });
    if (main) main.removeAttribute("aria-busy");
  }

  function asList(value) {
    return Array.isArray(value) ? value : [];
  }

  function isBlank(value) {
    return value === null || value === undefined || String(value).trim() === "";
  }

  function isPlaceholder(value) {
    return /^\[[\s\S]*\]$/.test(String(value).trim());
  }

  function spanFor(value) {
    var span = document.createElement("span");
    if (isBlank(value)) {
      span.className = "missing";
      span.textContent = "—";
      return span;
    }
    var str = String(value);
    if (isPlaceholder(str)) span.className = "ph";
    span.textContent = str;
    return span;
  }

  function fill(id, value) {
    var node = document.getElementById(id);
    if (!node) return;
    node.replaceChildren(spanFor(value));
  }

  function emptyItem(text) {
    var li = document.createElement("li");
    var p = document.createElement("p");
    p.className = "empty";
    p.textContent = text;
    li.appendChild(p);
    return li;
  }

  function hrefFor(url) {
    if (typeof url !== "string") return "";
    var trimmed = url.trim();
    if (!trimmed || /[\s]/.test(trimmed) || trimmed.slice(0, 2) === "//") return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(trimmed)) return trimmed;
    if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return "";
    return trimmed;
  }

  function renderParty(rows) {
    var body = document.getElementById("party");
    if (!body) return;
    body.replaceChildren();
    if (!rows.length) {
      var tr = document.createElement("tr");
      var td = document.createElement("td");
      td.colSpan = 4;
      td.textContent = "No characters yet.";
      tr.appendChild(td);
      body.appendChild(tr);
      return;
    }
    rows.forEach(function (member) {
      var row = member || {};
      var tr = document.createElement("tr");
      [
        ["Character", row.character],
        ["Player", row.player],
        ["Class", row["class"]],
        ["Level", row.level]
      ].forEach(function (pair) {
        var cell = document.createElement("td");
        var label = document.createElement("span");
        label.className = "cell-label";
        label.textContent = pair[0];
        var value = document.createElement("span");
        value.className = "cell-value";
        value.appendChild(spanFor(pair[1]));
        cell.append(label, value);
        tr.appendChild(cell);
      });
      body.appendChild(tr);
    });
  }

  function renderSessions(rows) {
    var list = document.getElementById("sessions");
    if (!list) return;
    list.replaceChildren();
    if (!rows.length) {
      list.appendChild(emptyItem("No sessions logged yet."));
      return;
    }
    rows.forEach(function (session) {
      var item = session || {};
      var li = document.createElement("li");
      var article = document.createElement("article");
      article.className = "entry";
      var kicker = document.createElement("p");
      kicker.className = "kicker";
      kicker.append(document.createTextNode("Session "), spanFor(item.number), document.createTextNode(" · "), spanFor(item.date));
      var title = document.createElement("h3");
      title.appendChild(spanFor(item.title));
      var recap = document.createElement("p");
      recap.className = "prose";
      recap.appendChild(spanFor(item.recap));
      article.append(kicker, title, recap);
      li.appendChild(article);
      list.appendChild(li);
    });
  }

  function renderQuests(id, rows, emptyText) {
    var list = document.getElementById(id);
    if (!list) return;
    list.replaceChildren();
    if (!rows.length) {
      list.appendChild(emptyItem(emptyText));
      return;
    }
    rows.forEach(function (quest) {
      var item = quest || {};
      var li = document.createElement("li");
      li.className = "entry";
      var name = document.createElement("p");
      name.className = "item-name";
      name.appendChild(spanFor(item.name));
      var detail = document.createElement("p");
      detail.className = "prose";
      detail.appendChild(spanFor(item.detail));
      li.append(name, detail);
      list.appendChild(li);
    });
  }

  function renderNpcs(rows) {
    var list = document.getElementById("npcs");
    if (!list) return;
    list.replaceChildren();
    if (!rows.length) {
      list.appendChild(emptyItem("No NPCs noted yet."));
      return;
    }
    rows.forEach(function (npc) {
      var item = npc || {};
      var li = document.createElement("li");
      var article = document.createElement("article");
      article.className = "entry";
      var role = document.createElement("p");
      role.className = "kicker";
      role.appendChild(spanFor(item.role));
      var name = document.createElement("h3");
      name.appendChild(spanFor(item.name));
      var note = document.createElement("p");
      note.className = "prose";
      note.appendChild(spanFor(item.note));
      article.append(role, name, note);
      li.appendChild(article);
      list.appendChild(li);
    });
  }

  function renderLinks(rows) {
    var list = document.getElementById("links");
    if (!list) return;
    list.replaceChildren();
    if (!rows.length) {
      list.appendChild(emptyItem("No links yet."));
      return;
    }
    rows.forEach(function (link) {
      var item = link || {};
      var li = document.createElement("li");
      li.className = "entry";
      var name = document.createElement("p");
      name.className = "item-name";
      var href = hrefFor(item.url);
      var labelText = !isBlank(item.label) ? item.label : href;
      if (href) {
        var anchor = document.createElement("a");
        anchor.href = href;
        if (/^https?:/i.test(href)) anchor.rel = "noreferrer";
        anchor.appendChild(spanFor(labelText));
        name.appendChild(anchor);
      } else {
        name.appendChild(spanFor(labelText));
      }
      li.appendChild(name);
      if (!href) {
        var pending = document.createElement("p");
        pending.className = "missing";
        pending.textContent = "Link not added yet.";
        li.appendChild(pending);
      } else {
        var url = document.createElement("p");
        url.className = "url";
        url.textContent = href;
        li.appendChild(url);
      }
      var note = document.createElement("p");
      note.className = "prose";
      note.appendChild(spanFor(item.note));
      li.appendChild(note);
      list.appendChild(li);
    });
  }

  function render(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("Campaign data must be a JSON object.");
    }
    var campaign = data.campaign || {};
    var next = data.nextSession || {};
    var quests = data.quests || {};

    fill("campaign-name", campaign.name);
    fill("campaign-tagline", campaign.tagline);
    fill("overview", campaign.overview);
    fill("next-date", next.date);
    fill("next-time", next.time);
    fill("next-location", next.location);
    fill("next-note", next.note);
    renderParty(asList(data.party));
    renderSessions(asList(data.sessions));
    renderQuests("quests-active", asList(quests.active), "No active quests.");
    renderQuests("quests-completed", asList(quests.completed), "No completed quests.");
    renderNpcs(asList(data.npcs));
    renderLinks(asList(data.links));
    clearBusy();

    if (data.placeholder === true) {
      setBanner("Placeholder content. Edit data/campaign.json — this page only displays that file.");
    } else if (banner) {
      banner.hidden = true;
      banner.textContent = "";
    }

    if (!isBlank(campaign.name) && !isPlaceholder(campaign.name)) {
      document.title = String(campaign.name) + " · fakespace";
    }
  }

  if (!source) {
    setBanner("This page is missing the path to the campaign data.", true);
    clearBusy();
    return;
  }

  fetch(source, { cache: "no-cache" })
    .then(function (response) {
      if (!response.ok) throw new Error("Could not load campaign data (" + response.status + ").");
      return response.json();
    })
    .then(render)
    .catch(function (error) {
      setBanner(error && error.message ? error.message : "Could not load campaign data.", true);
      clearBusy();
    });
})();
