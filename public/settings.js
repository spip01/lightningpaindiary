loadFile("http://raw.githubusercontent.com/spip01/lightningpaindiary/bootstrap/public/navbar.html", "#navbar");
loadFile("http://raw.githubusercontent.com/spip01/lightningpaindiary/bootstrap/public/footer.html", "#footer");

function generateTrackersPanel(db) {
  var id = "Trackers";
  var name = "Trackers";
  var reminders = "";

  var ttitle = /idname/g [Symbol.replace](head, id);
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
      var iid = / /g [Symbol.replace](item.name, "-");

      var t = /idname/g [Symbol.replace](entry, iid);
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

      t = /ifremove/g [Symbol.replace](t, item.removeable === false ? 'style="display: none"' : '');

      panels += t;

      if (item.remindable === undefined) {
        var rmd = /idname/g [Symbol.replace](rmd_entries, iid);
        rmd = /ttitle/g [Symbol.replace](rmd, item.name);
        reminders += rmd;
      }

      cursor.continue();
    } else {
      var ttail = /idname/g [Symbol.replace](tail, id);
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

      panels += tend;

      $("#pnl-" + id).remove();
      $("#panels").append(panels);
      $("#reminders").html(reminders);
      setPanelEvents("#pnl-" + id);
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
  }
}

function addPanel(panel) {
  var id = / /g [Symbol.replace](panel.name, "-");
  var name = panel.name;

  var ttitle = /idname/g [Symbol.replace](head, id);
  ttitle = /ttitle/g [Symbol.replace](ttitle, name);
  ttitle = /ifpanel/g [Symbol.replace](ttitle, "");
  ttitle = /iftrackers/g [Symbol.replace](ttitle, "style='display: none'");

  var panels = ttitle;

  for (var j = 0; j < panel.list.length; ++j) {
    var item = panel.list[j];
    var iid = / /g [Symbol.replace](item, "-");

    var t = /idname/g [Symbol.replace](entry, iid);
    t = /ttitle/g [Symbol.replace](t, item);
    t = /iftrackers/g [Symbol.replace](t, "style='display: none'");
    t = /ifrange/g [Symbol.replace](t, "style='display: none'");
    t = /ifremove/g [Symbol.replace](t, '');

    panels += t;
  }

  var ttail = /idname/g [Symbol.replace](tail, id);
  ttail = /ttitle/g [Symbol.replace](ttail, name);
  ttail = /iftrackers/g [Symbol.replace](ttail, 'style="display: none"');

  var tend = /iftrackers/g [Symbol.replace](tail_end, 'style="display: none"');

  panels += ttail + tend;

  $("#pnl-" + id).remove();
  $("#panels").append(panels);
  setPanelEvents("#pnl-" + id);
}

function setPanelEvents(sel) {
  $(sel + " #enabledeleteck").click(function () {
    enableDeleteBtns(this);
  });

  $(sel + " #editbtn").click(function () {
    panelEditBtn(db, this);
  });

  $(sel + " #delbtn").click(function () {
    panelDeleteBtn(db, this);
  });

  $(sel + " #addinp").focus(function () {
    enableAddBtns(this);
  });

  $(sel + " #addbtn").click(function () {
    panelAddBtn(db, this);
  });

  $(sel + " [draggable|='true']").on({
    //"mouseleave": $.proxy(mouseLeave),
    //"mouseenter": $.proxy(mouseEnter),
    "drop": $.proxy(drop),
    "dragover": $.proxy(dragover),
    "dragstart": $.proxy(dragstart)
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

  $("#tabs").append(tab_tail);
}

function addTab(item) {
  var id = / /g [Symbol.replace](item.name, "-");

  var tab = /idname/g [Symbol.replace](tab_entries, id);
  tab = /ttitle/g [Symbol.replace](tab, item.name);
  tab = /trborder/g [Symbol.replace](tab, item.borderright === true ? "border-right" : "");
  tab = /tbborder/g [Symbol.replace](tab, item.borderbottom === true ? "border-bottom" : "");

  $("#tablist").append(tab);

  $("#tabs #tab-" + id).click(function () {
    openTab(this);
  });
}

function openTab(evt) {
  $("#panels").children().hide();
  var pnl = $(evt).prop("id").replace(/^\S+?-(.*)/g, "pnl-$1");
  $("#panels #" + pnl).show();
}

function dragover(evt) {
  evt.preventDefault();
}

function dragstart(evt) {
  evt.originalEvent.dataTransfer.setData("text/html", $(this).parent().prop("id"));
}

function drop(evt) {
  evt.preventDefault();
  var src = evt.originalEvent.dataTransfer.getData("text/html");
  var dst = $(evt).parent().prop("id");
  var pt = $(evt).parent().parent().prop("id").replace(/^\S+?-(.*)/g, "cont-$1");

  var list = [];
  var found = 0;
  $("#" + pt).children().each(function () {
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
  var pnl = $(evt).parent().parent();

  if ($(evt).prop("checked")) {
    $(pnl).find("#delbtn").removeClass("disabled");
    $(pnl).find("#delbtn").removeAttr("disabled");
  } else {
    $(pnl).find("#delbtn").addClass("disabled");
    $(pnl).find("#delbtn").prop("disabled", "true");
  }
}

function enableAddBtns(evt) {
  var pnl = $(evt).parent().parent();

  $(pnl).find("#addent").removeClass("disabled");
  $(pnl).find("#addent").removeAttr("disabled");

  $(pnl).find("#tkr-menu").removeClass("disabled");
  $(pnl).find("#tkr-menu").removeAttr("disabled");
//  $(pnl).find("#startrangeinp").removeClass("disabled");
//  $(pnl).find("#startrangeinp").removeAttr("disabled");
//  $(pnl).find("#endrangeinp").removeClass("disabled");
//  $(pnl).find("#endrangeinp").removeAttr("disabled");
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

  $("#pnl-Account #druglist").html(list);
  $("#pnl-Account #useselecteddrugs").removeClass("disabled");
  $("#pnl-Account #useselecteddrugs").removeAttr("disabled");
}

function PanelAddBtn(db, evt) {
  var ent = $(evt).val();
  var pnl = $(evt).parent().parent().prop("id").replace(/\S+?-(.*)/g, "$1");
  var name = /-/g [Symbol.replace](ent, " ");

  var store = db.transaction(["tracking"], "readwrite").objectStore("tracking");
  var cursor = store.index("by_name").openCursor(IDBKeyRange.only(pnl));
  cursor.onsuccess = function () {
    var cursor = event.target.result;

    if (cursor) {
      if (!cursor.value.list.includes(ent))
        cursor.value.list.push(ent);

      cursor.update(remedies);

      generateTabsAndPanels(db);
    }
  }
}

function panelEditBtn(db, evt) {
  var ent = $(evt).parent().prop("id").replace(/\S+?-(.*)/g, "$1");
  var pnl = $(evt).parent().parent().prop("id").replace(/\S+?-(.*)/g, "$1");
  var name = /-/g [Symbol.replace](ent, " ");

  generateTabsAndPanels(db);
}

function panelDeleteBtn(db, evt) {
  var ent = $(evt).parent().prop("id").replace(/\S+?-(.*)/g, "$1");
  var pnl = $(evt).parent().parent().prop("id").replace(/\S+?-(.*)/g, "$1");
  var name = /-/g [Symbol.replace](ent, " ");

  var i = trackerslist.findIndex(trackerslist => trackerslist.name === name);
  var list = trackerslist[i].list;

  if (pnl === "trackers") {
    trackerslist[i].enabled = false;
  } else {
    var j = trackerslist[i].list.findIndex(list => list === ent);
    list.splice(j, 1);
  }

  $("#ent-" + ent).detach();
  generateTabsAndPanels(db);
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
  cursor.onsuccess = function () {
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

  $("#pnl-Account #urldrugscom").focus(function () {
    enableLoadDrugs(this);
  });

  $("#pnl-Account #loaddrugscom").click(function () {
    loadDrugsCom(this);
  });

  $("#pnl-Account #demoloaddrugs").click(function () {
    loadDrugs("https://www.drugs.com/mn/wx7s49r");
  });

  $("#pnl-Account #useselecteddrugs").click(function () {
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