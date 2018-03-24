loadFile("http://raw.githubusercontent.com/spip01/lightningpaindiary/bootstrap/public/navbar.html", "#navbar");
loadFile("http://raw.githubusercontent.com/spip01/lightningpaindiary/bootstrap/public/footer.html", "#footer");

function generateTrackersPanel(db) {
  var pnlid = "Trackers";
  var name = "Trackers";
  var reminders = "";

  var ttitle = /idname/g [Symbol.replace](head, pnlid);
  ttitle = /ttitle/g [Symbol.replace](ttitle, name);
  ttitle = /ifpanel/g [Symbol.replace](ttitle, "style='display: none'");
  ttitle = /iftrackers/g [Symbol.replace](ttitle, "");

  var panels = ttitle;

  var store = db.transaction(["tracking"], "readwrite").objectStore("tracking");
  var cursor = store.index('by_position').openCursor();
  cursor.onsuccess = function (event) {
    var cursor = event.target.result;

    if (cursor) {
      var item = cursor.value;
      var id = / /g [Symbol.replace](item.name, "-");

      var t = /idname/g [Symbol.replace](entry, id);
      t = /ttitle/g [Symbol.replace](t, item.name);
      t = /ttype/g [Symbol.replace](t, item.type);
      t = /iftrackers/g [Symbol.replace](t, "");
      t = /000/g [Symbol.replace](t, item.position);

      if (item.type.indexOf("range") != -1) {
        t = /ifrange/g [Symbol.replace](t, "");
        t = /startrange/g [Symbol.replace](t, item.start);
        t = /endrange/g [Symbol.replace](t, item.end);
      } else
        t = /ifrange/g [Symbol.replace](t, 'style="display: none"');

      t = /ifedit/g [Symbol.replace](t, item.editable === false ? 'style="display: none"' : '');

      panels += t;

      if (item.remindable === undefined) {
        var rmd = /idname/g [Symbol.replace](rmd_entries, id);
        rmd = /ttitle/g [Symbol.replace](rmd, item.name);
        reminders += rmd;
      }

      cursor.continue();
    } else {
      var ttail = /idname/g [Symbol.replace](tail, pnlid);
      ttail = /ttitle/g [Symbol.replace](ttail, name);
      ttail = /iftrackers/g [Symbol.replace](ttail, "");

      panels += ttail;

      for (var i = 0; i < trackerstypes.length; ++i) {
        var mid = / /g [Symbol.replace](trackerstypes[i], "-");
        var mitem = /idname/g [Symbol.replace](tail_trackers_menu, mid);
        mitem = /ttype/g [Symbol.replace](mitem, trackerstypes[i]);

        panels += mitem;
      }

      var tend = /iftrackers/g [Symbol.replace](tail_end, "");
      tend = /idname/g [Symbol.replace](tend, pnlid);

      panels += tend;

      $("#pnl-" + pnlid).remove();
      $("#panels").append(panels);
      $("#reminders").html(reminders);

      setPanelEvents(pnlid);
    }
  };
}

function generateTabsAndPanels(db) {
  newTabBar();

  var store = db.transaction(["tracking"], "readwrite").objectStore("tracking");
  var cursor = store.index('by_type').openCursor(IDBKeyRange.only("list"));
  cursor.onsuccess = function (event) {
    var cursor = event.target.result;

    if (cursor) {
      item = cursor.value;

      addTab(item);
      addPanel(item);

      cursor.continue();
    }
  };
}

function addPanel(panel) {
  var pnlid = / /g [Symbol.replace](panel.name, "-");
  var name = panel.name;

  var ttitle = /idname/g [Symbol.replace](head, pnlid);
  ttitle = /ttitle/g [Symbol.replace](ttitle, name);
  ttitle = /ifpanel/g [Symbol.replace](ttitle, "");
  ttitle = /iftrackers/g [Symbol.replace](ttitle, "style='display: none'");

  var panels = ttitle;

  for (var j = 0; j < panel.list.length; ++j) {
    var item = panel.list[j];
    var id = / /g [Symbol.replace](item, "-");

    var t = /idname/g [Symbol.replace](entry, id);
    t = /ttitle/g [Symbol.replace](t, item);
    t = /iftrackers/g [Symbol.replace](t, "style='display: none'");
    t = /ifrange/g [Symbol.replace](t, "style='display: none'");
    t = /ifedit/g [Symbol.replace](t, '');

    panels += t;
  }

  var ttail = /idname/g [Symbol.replace](tail, pnlid);
  ttail = /ttitle/g [Symbol.replace](ttail, name);
  ttail = /iftrackers/g [Symbol.replace](ttail, 'style="display: none"');

  var tend = /idname/g [Symbol.replace](tail_end, pnlid);
  tend = /iftrackers/g [Symbol.replace](tend, 'style="display: none"');

  panels += ttail + tend;

  $("#pnl-" + pnlid).remove();
  $("#panels").append(panels);
  setPanelEvents(pnlid);
}

function setPanelEvents(id) {
  var pnl = $("#pnl-" + id);

  $(pnl).find("[id|='en']").off();
  $(pnl).find("[id|='en']").click(function () {
    enableDeleteBtns(this);
  });

  $(pnl).find("[id|='edt']").off();
  $(pnl).find("[id|='edt']").click(function () {
    panelEditBtn(db, this);
  });

  $(pnl).find("[id|='del']").off();
  $(pnl).find("[id|='del']").click(function () {
    panelDeleteBtn(db, this);
  });

  $(pnl).find("[id|='inp']").off();
  $(pnl).find("[id|='inp']").focus(function () {
    enableAddBtns(this);
  });
  $(pnl).find("[id|='inp']").keydown(function (event) {
    if (event.which === 0x0a || event.which === 0x0d)
      panelAddBtn(db, this);
  });

  $(pnl).find("[id|='add']").off();
  $(pnl).find("[id|='add']").click(function () {
    panelAddBtn(db, this);
  });

  $(pnl).find("[id|='sr']").off();
  $(pnl).find("[id|='sr']").keydown(function (event) {
    if (event.which === 0x0a || event.which === 0x0d)
      panelAddBtn(db, this);
  });

  $(pnl).find("[id|='er']").off();
  $(pnl).find("[id|='er']").keydown(function (event) {
    if (event.which === 0x0a || event.which === 0x0d)
      panelAddBtn(db, this);
  });

  $(pnl).find("[draggable|='true']").off();
  $(pnl).find("[draggable|='true']").on({
    //"mouseleave": $.proxy(mouseLeave),
    //"mouseenter": $.proxy(mouseEnter),
    "drop": $.proxy(drop),
    "dragover": $.proxy(dragover),
    "dragstart": $.proxy(dragstart),
    "touchend": $.proxy(drop),
    "touchenter": $.proxy(dragover),
    "touchstart": $.proxy(dragstart),
  });

  $(pnl).find("[id|='menu']").off();
  $(pnl).find("[id|='menu']").click(function () {
    selectType(this);
  });

  $("#tablist #tab-" + id).off();
  $("#tablist #tab-" + id).click(function () {
    openTab(this);
  });

}

function newTabBar() {
  $("#tabs").html(tab_head);

  addTab({
    name: "Account",
    borderbottom: true,
  });
  addTab({
    name: "Trackers",
    borderright: true,
    borderbottom: true,
  });

  var tabs = $("#tablist");

  $(tabs).append(tab_tail);

  $(tabs).find("[id|=tab]").off();
  $(tabs).find("[id|=tab]").click(function () {
    openTab(this);
  });
}

function addTab(item) {
  var id = / /g [Symbol.replace](item.name, "-");

  var tab = /idname/g [Symbol.replace](tab_entries, id);
  tab = /ttitle/g [Symbol.replace](tab, item.name);
  tab = /trborder/g [Symbol.replace](tab, item.borderright === true ? "border-right" : "");
  tab = /tbborder/g [Symbol.replace](tab, item.borderbottom === true ? "border-bottom" : "");

  var tabs = $("#tablist");

  $(tabs).find("#tab-" + id).remove();
  $(tabs).append(tab);

  $(tabs).find("#tab-" + id).off();
  $(tabs).find("#tab-" + id).click(function () {
    openTab(this);
  });
}

/***********************************************/

function openTab(evt) {
  $("#panels").children().hide();
  var pnl = $(evt).prop("id").replace(/^\S+?-(.*)/g, "pnl-$1");
  $("#panels #" + pnl).show();
}

function dragover(evt) {
  evt.preventDefault();
}

function dragstart(evt) {
  evt.preventDefault();
  evt.originalEvent.dataTransfer.setData("text/html", $(this).parent().prop("id"));
}

function drop(evt) {
  evt.preventDefault();
  var src = evt.originalEvent.dataTransfer.getData("text/html");
  var dst = $(evt).prop("id");
  var pnlid = $(evt).parent().parent().prop("id").replace(/^\S+?-(.*)/g, "$1");

  var list = [];
  var found = 0;
  $("#pnl-" + pnlid).children().each(function () {
    var id = $(this).prop("id");

    switch (id) {
      case dst: // move up
        if (found == 0) {
          list.push($("#" + pt + " #" + src).detach());
          list.push($("#" + pt + " #" + dst).detach());
          found = 2;
        } else if (found == 1) {
          list.push($("#" + pt + " #" + dst).detach());
          list.push($("#" + pt + " #" + src).detach());
          found = 2;
        }
        break;
      case src: // move down
        if (found == 0)
          found = 1;
        break;
      default: //$("#diag").append("add id " + id + "");
        list.push($(this).detach());
    }
  });

  for (var i = 0; i < list.length; ++i) {
    $("#" + pt).append(list[i]);
  }
}

function enableDeleteBtns(evt) {
  var pnl = $("#pnl-" + $(evt).prop("id").replace(/^\S+?-(.*)/g, "$1"));

  if ($(evt).prop("checked")) {
    $(pnl).find("[id|='del']").removeClass("disabled");
    $(pnl).find("[id|='del']").removeAttr("disabled");
  } else {
    $(pnl).find("[id|='del']").addClass("disabled");
    $(pnl).find("[id|='del']").prop("disabled", "true");
  }
}

function enableAddBtns(evt) {
  var pnl = $("#pnl-" + $(evt).prop("id").replace(/^\S+?-(.*)/g, "$1"));

  $(pnl).find("[id|='add']").removeClass("disabled");
  $(pnl).find("[id|='add']").removeAttr("disabled");

  $(pnl).find("[id|='tkr']").removeClass("disabled");
  $(pnl).find("[id|='tkr']").removeAttr("disabled");
  //  $(pnl).find("[id|='sr']").removeClass("disabled");
  //  $(pnl).find("[id|='sr']").removeAttr("disabled");
  //  $(pnl).find("[id|='er']").removeClass("disabled");
  //  $(pnl).find("[id|='er']").removeAttr("disabled");
}

function loadDrugsCom(evt) {
  var url = $("#urldrugscom").val();
  if (!url.startsWith("http"))
    url = "https://www.drugs.com/mn/" + url;
  loadDrugs(url);
}

function loadDrugs(url) {
  var h = [];
  $.getJSON('http://www.whateverorigin.org/get?url=' + encodeURIComponent(url) + '&callback=?', function (data, status) {})
    .done(function (data, status) {
      var t = data.contents.split("<");
      var h = [];

      for (var i = 0; i < t.length; ++i) {
        var start;
        var l = t[i];

        if (l === "h2>Medication List") {
          start = true;
        }
        if (l === "/ul>") {
          start = false;
        }

        if (start && l.search(/^h4>/) != -1) {
          var m = l.replace(/^h4>(.*)/, "$1");
          h.push(m);
        }
      }

      applyMeds(h);
    })
    .fail(function (data, status) {
      console.log(status);
    });
}

function applyMeds(ml) {
  var list = '<dev class="row">';
  for (var i = 0; i < ml.length; ++i) {
    list += /ttitle/g [Symbol.replace](med_import, ml[i]);
  }
  list += '<dev>';

  var pnl = $("#pnl-Account");
  $(pnl).find("#druglist").html(list);
  $(pnl).find("#useselecteddrugs").removeClass("disabled");
  $(pnl).find("#useselecteddrugs").removeAttr("disabled");
}

function selectType(evt) {
  var name = $(evt).text();
  var pnl = $("#pnl-Trackers");

  $(pnl).find("[id|='tkr']").text(name);

  if (name.replace(/(\S+?) .*/g, "$1") === "range") {
    $(pnl).find("[id|='sr']").removeClass("disabled");
    $(pnl).find("[id|='sr']").removeAttr("disabled");
    $(pnl).find("[id|='er']").removeClass("disabled");
    $(pnl).find("[id|='er']").removeAttr("disabled");
  } else {
    $(pnl).find("[id|='sr']").addClass("disabled");
    $(pnl).find("[id|='sr']").prop("disabled", "true");
    $(pnl).find("[id|='er']").addClass("disabled");
    $(pnl).find("[id|='er']").prop("disabled", "true");
  }
}

function panelAddBtn(db, evt) {
  var pnlid = $(evt).prop("id").replace(/\S+?-(.*)/g, "$1");
  var pnlname = /-/g [Symbol.replace](pnlid, " ");
  var pnl = $("#pnl-" + pnlid);
  var name = $(("#pnl-" + pnlid + " [id|='inp']")).val();
  var id = / /g [Symbol.replace](name, "-");

  var store = db.transaction(["tracking"], "readwrite").objectStore("tracking");

  if (pnlid === "Trackers") {
    var pos = $("#cont-Trackers div:last-child").find("[id|='pos']").prop("id").replace(/\S+?-(.*)/g, "$1");
    var entry = {
      position: Number(pos) + 1,
      name: name,
      type: $(pnl).find("[id|='tkr']").text(),
    };

    if (entry.type.replace(/(\S+?) .*/g, "$1") === "range") {
      entry.start = $(pnl).find("[id|='sr']").val();
      entry.end = $(pnl).find("[id|='er']").val();
    }

    if (entry.type === "list")
      entry.list = [];

    store.add(entry);

    if (entry.type === "list") {
      addTab(entry);
      addPanel(entry);
    }

    generateTrackersPanel(db);
    $("#pnl-"+pnlid).show();
  } else {
    var panel = store.index("by_name").openCursor(IDBKeyRange.only(pnlname));

    panel.onsuccess = function (event) {
      var cursor = event.target.result;

      if (cursor) {
        var entry = cursor.value;
        if (!entry.list.includes(name))
          entry.list.push(name);

        cursor.update(entry);

        addPanel(entry);
         $("#pnl-"+pnlid).show();
      }
    }
  }
}

function panelEditBtn(db, evt) {
  var id = $(evt).prop("id").replace(/\S+?-(.*)/g, "$1");
  var ent = $(evt).parent();
  var pnlid = $(ent).parent().prop("id").replace(/\S+?-(.*)/g, "$1");
  var name = /-/g [Symbol.replace](id, " ");

  var input = /idname/g [Symbol.replace](editname, id);
  input = /ttitle/g [Symbol.replace](input, name);

  if (pnlid === "Trackers") {
    var type = $(ent).find("[id|='typ']").text().replace(/(\S+?) .*/g, "$1");

    if (type === "range") {
      var txt = $(ent).find("[id|='rng']").text();
      var startrange = txt.replace(/(\d+?)-.*/g, "$1");
      var endrange = txt.replace(/.*?-(\d+?)/g, "$1");

      var range = /vstartrange/g [Symbol.replace](editrange, startrange);
      range = /vendrange/g [Symbol.replace](range, endrange);

      $(ent).find("#shrnge").remove();
      $(ent).find("[id|='typ']").after(range);
    }
  }

  $(ent).find("[id|='pos']").remove();
  $(ent).prepend(input);

  $(ent).find("input").keydown(function (event) {
    if (event.which === 0x0a || event.which === 0x0d)
      doneEdit(this);
  });

  $(evt).text("Done");
  $(evt).off();
  $(evt).click(function () {
    doneEdit(this);
  });
}

function doneEdit(evt) {
  var id = $(evt).prop("id").replace(/\S+?-(.*)/g, "$1");
  var ent = $(evt).parent();
  var pnlid = $(ent).parent().prop("id").replace(/\S+?-(.*)/g, "$1");
  var pnlname = /-/g [Symbol.replace](pnlid, " ");

  var newname = $(ent).find("[id|='edt']").val();
  var oldname = /-/g [Symbol.replace](id, " ");

  var store = db.transaction(["tracking"], "readwrite").objectStore("tracking");
  var tracker = store.index("by_name").openCursor(IDBKeyRange.only(oldname));
  var panel = store.index("by_name").openCursor(IDBKeyRange.only(pnlname));

  tracker.onsuccess = function (event) {
    var cursor = event.target.result;

    if (cursor) {
      var entry = cursor.value;
      entry.name = newname;

      var type = $(ent).find("[id|='typ']").text().replace(/(\S+?) .*/g, "$1");

      if (type === "range") {
        entry.start = $(ent).find("[id|='start']").val();
        entry.end = $(ent).find("[id|='end']").val();
      }

      cursor.update(entry);

      if (type === "list")
        generateTabsAndPanels(db);

      generateTrackersPanel(db);
      $("#pnl-" + pnlid).show();
    }
  }

  panel.onsuccess = function (event) {
    var cursor = event.target.result;

    if (cursor) {
      var entry = cursor.value;
      var list = entry.list;
      var i = entry.list.findIndex(list => list === oldname);
      entry.list[i] = newname;

      cursor.update(entry);
      addPanel(entry);
      $("#pnl-" + pnlid).show();
    }
  }
}

function panelDeleteBtn(db, evt) {
  var id = $(evt).prop("id").replace(/\S+?-(.*)/g, "$1");
  var ent = $(evt).parent();
  var pnlid = $(ent).parent().prop("id").replace(/\S+?-(.*)/g, "$1");
  var pnlname = /-/g [Symbol.replace](pnlid, " ");
  var name = /-/g [Symbol.replace](id, " ");

  var store = db.transaction(["tracking"], "readwrite").objectStore("tracking");
  var tracker = store.index("by_name").openCursor(IDBKeyRange.only(name));
  var panel = store.index("by_name").openCursor(IDBKeyRange.only(pnlname));

  tracker.onsuccess = function (event) {
    var cursor = event.target.result;

    if (cursor) {
      var entry = cursor.value;
      cursor.delete();

      $("#pnl-" + pnlid + " #ent-" + id).remove();
      $("#panels #pnl-" + id).remove();
      $("#tablist #tab-" + pnlid).remove();
    }
  }

  panel.onsuccess = function (event) {
    var cursor = event.target.result;

    if (cursor) {
      var entry = cursor.value;
      var list = entry.list;
      var i = entry.list.findIndex(list => list === name);
      entry.list.splice(i, 1);

      cursor.update(entry);
      $("#pnl-" + pnlid + " #ent-" + id).remove();
    }
  }
}

function addSelectedDrugs(evt) {
  var list = [];

  $("#druglist input").each(function () {
    if ($(this).prop("checked")) {
      var name = $(this).parent().text().replace(/^\s+(.*?)\s+$/m, "$1");
      list.push(name);
    }
  });

  var store = db.transaction(["tracking"], "readwrite").objectStore("tracking");
  var cursor = store.index("by_name").openCursor(IDBKeyRange.only("Remedies"));
  cursor.onsuccess = function (event) {
    var cursor = event.target.result;

    if (cursor) {
      var remedies = cursor.value;
      for (var i = 0; i < list.length; ++i)
        if (!remedies.list.includes(list[i]))
          remedies.list.push(list[i]);

      cursor.update(remedies);
    } else {
      var pos = $("#cont-Trackers div:last-child").find("div:first").prop("id").replace(/\S+?-(.*)/g, "$1");
      var remedies = {
        position: Number(pos) + 1,
        name: "Remedies",
        type: "list",
        list: list,
        editable: false,
      };

      store.add(remedies);

      generateTrackersPanel(db);
      generateTabsAndPanels(db);
    }

    addPanel(remedies);
  }
}

function enableLoadDrugs(evt) {
  $("#pnl-Account #loaddrugscom").removeClass("disabled");
  $("#pnl-Account #loaddrugscom").removeAttr("disabled");
}

function loadFile(url, selector) {
  //  xhttp = new XMLHttpRequest();
  //  xhttp.onreadystatechange = function () {
  //    if (this.readyState == 4) {
  //      if (this.status == 200) {
  //        var html = this.responseText.replace(/(?:.*?\n)*?<body>((?:.*?\n)+?)<\/body>(.*?\n?)*/g, "$1");
  //        $(selector).append(html);
  //      }
  //    }
  //  }
  //  xhttp.open("GET", url, true);
  //  xhttp.send();

  $.getJSON('http://www.whateverorigin.org/get?url=' + encodeURIComponent(url) + '&callback=?', function (data, status) {
    if (status != "success")
      alert(status);

    //(http|ftp|https)://([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?

    var html = data.contents.replace(/(?:.*?\n)*?<body>((?:.*?\n)+?)<\/body>(.*?\n?)*/g, "$1");
    $(selector).append(html);
  });
}

var db = NaN;

$(document).ready(function () {
  $("#javascript").hide();
  $("#jssite").show();

  if (!('indexedDB' in window)) {
    console.log('This browser doesn\'t support IndexedDB');
  }

  var request = indexedDB.open("diary", 1);

  request.onupgradeneeded = function () {
    doUpgrade(request);
  };

  request.onerror = function (event) {
    console.log("error loading db: " + request.error);
  };

  request.onsuccess = function () {
    db = request.result;

    generateTrackersPanel(db);
    generateTabsAndPanels(db);
  };

  var pnl = $("#pnl-Account");
  $(pnl).find("#urldrugscom").focus(function () {
    enableLoadDrugs(this);
  });

  $(pnl).find("#loaddrugscom").click(function () {
    loadDrugsCom(this);
  });

  $(pnl).find("#demoloaddrugs").click(function () {
    loadDrugs("https://www.drugs.com/mn/wx7s49r");
  });

  $(pnl).find("#useselecteddrugs").click(function () {
    addSelectedDrugs(this);
  });
});

/************************************************** */

function doUpgrade(request) {
  db = request.result;
  var store = db.createObjectStore("tracking", {
    autoIncrement: true
  });

  store.createIndex("by_position", "position", {
    unique: true
  });

  store.createIndex("by_name", "name", {
    unique: true
  });

  store.createIndex("by_type", "type", {
    unique: false
  });

  for (var i = 0; i < trackerslist.length; ++i) {
    var tracker = trackerslist[i];
    tracker.position = i;

    store.put(tracker);
  }
}