loadHtml("https://raw.githubusercontent.com/spip01/lightningpaindiary/bootstrap/public/navbar.html", "#navbar");
loadHtml("https://raw.githubusercontent.com/spip01/lightningpaindiary/bootstrap/public/footer.html", "#footer");

function generateTrackersPanel(db) {
  var pnlid = "Trackers";
  var name = "Trackers";

  var panel = /idname/g [Symbol.replace](panels, pnlid);
  panel = /ttitle/g [Symbol.replace](panel, name);
  panel = /iftrackers/g [Symbol.replace](panel, "");

  $("#pnl-" + pnlid).remove();
  $("#panels").append(panel);
  var pnl = $("#pnl-" + pnlid);

  $("#pnl-Account #reminders").html("");

  var store = db.transaction(["tracking"], "readwrite").objectStore("tracking");
  var cursor = store.index('by_position').openCursor();
  cursor.onsuccess = function (event) {
    var cursor = event.target.result;

    if (cursor) {
      var item = cursor.value;
      var id = / /g [Symbol.replace](item.name, "-");

      var entry = /idname/g [Symbol.replace](panels_entry, id);
      entry = /ttitle/g [Symbol.replace](entry, item.name);
      entry = /ttype/g [Symbol.replace](entry, item.type);
      entry = /iftrackers/g [Symbol.replace](entry, "");
      entry = /000/g [Symbol.replace](entry, item.position);

      if (item.type.indexOf("range") != -1) {
        entry = /ifrange/g [Symbol.replace](entry, "");
        entry = /startrange/g [Symbol.replace](entry, item.start);
        entry = /endrange/g [Symbol.replace](entry, item.end);

      } else
        entry = /ifrange/g [Symbol.replace](entry, 'style="display: none"');

      entry = /ifedit/g [Symbol.replace](entry, item.editable === false ? 'style="display: none"' : '');

      $(pnl).find("[id|='cont']").append(entry);

      if (item.remindable === undefined) {
        var reminders = /idname/g [Symbol.replace](acct_entries, "rem-" + id);
        reminders = /ttitle/g [Symbol.replace](reminders, item.name);
        $("#pnl-Account #reminders").append(reminders);
      }

      cursor.continue();
    } else {

      generateTypeMenu();
      generateRangeMenu();

      setPanelEvents(pnlid);
    }
  };
}

function generateRangeMenu() {
  var store = db.transaction(["tracking"], "readwrite").objectStore("tracking");
  var cursor = store.index('by_position').openCursor();
  cursor.onsuccess = function (event) {
    var cursor = event.target.result;

    if (cursor) {
      var item = cursor.value;

      if (item.type.indexOf("range") != -1) {
        var id = / /g [Symbol.replace](item.name, "-");

        for (var i = 0; i < trackerstypes.length; ++i) {
          if (trackerstypes[i].indexOf("range") != -1) {
            var menu = /ttype/g [Symbol.replace](menu_entries, trackerstypes[i]);
            $("#ent-" + id + " [id|='items']").append(menu);
          }
        }
      }

      cursor.continue();
    }
  }
}

function generateTypeMenu() {
  for (var i = 0; i < trackerstypes.length; ++i) {
    var menu = /ttype/g [Symbol.replace](menu_entries, trackerstypes[i]);
    $("#pnl-Trackers #menu-type").find("[id|='items']").append(menu);
  }
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

function addPanel(items) {
  var pnlid = / /g [Symbol.replace](items.name, "-");
  var name = items.name;

  var panel = /idname/g [Symbol.replace](panels, pnlid);
  panel = /ttitle/g [Symbol.replace](panel, name);
  panel = /iftrackers/g [Symbol.replace](panel, "style='display: none'");

  $("#pnl-" + pnlid).remove();
  $("#panels").append(panel);

  for (var j = 0; j < items.list.length; ++j) {
    var item = items.list[j];
    var id = / /g [Symbol.replace](item, "-");

    var entry = /idname/g [Symbol.replace](panels_entry, id);
    entry = /ttitle/g [Symbol.replace](entry, item);
    entry = /iftrackers/g [Symbol.replace](entry, "style='display: none'");
    entry = /ifrange/g [Symbol.replace](entry, "style='display: none'");
    entry = /ifedit/g [Symbol.replace](entry, '');

    $("#pnl-" + pnlid + " [id|='cont']").append(entry);
  }

  setPanelEvents(pnlid);
}

function setPanelEvents(id) {
  var pnl = $("#pnl-" + id);

  $(pnl).find("[id|='en']").click(function () {
    enableDeleteBtns(this);
  });

  $(pnl).find("[id|='edtname']").keydown(function (event) {
    if (event.which === 0x0a || event.which === 0x0d)
      doneEdit(db, this);
  });

  $(pnl).find("[id|='edit']").click(function () {
    panelEditBtn(db, this);
  });

  $(pnl).find("[id|='del']").click(function () {
    panelDeleteBtn(db, this);
  });

  $(pnl).find("[id|='new']").keydown(function () {
    enableAddBtns(this);
  });

  $(pnl).find("[id|='new']").keydown(function (event) {
    if (event.which === 0x0a || event.which === 0x0d)
      panelAddBtn(db, this);
  });

  $(pnl).find("[id|='add']").click(function () {
    panelAddBtn(db, this);
  });

  if (id === "Trackers") {
    $(pnl).find("[id|='edtstart']").keydown(function (event) {
      if (event.which === 0x0a || event.which === 0x0d)
        doneEdit(db, this);
    });

    $(pnl).find("[id|='edtend']").keydown(function (event) {
      if (event.which === 0x0a || event.which === 0x0d)
        doneEdit(db, this);
    });

    $(pnl).find("[id|='newstart']").keydown(function (event) {
      if (event.which === 0x0a || event.which === 0x0d)
        panelAddBtn(db, this);
    });

    $(pnl).find("[id|='newend']").keydown(function (event) {
      if (event.which === 0x0a || event.which === 0x0d)
        panelAddBtn(db, this);
    });

    $(pnl).find("[id|='item']").click(function () {
      selectType(this);
    });
  }

  $(pnl).find("[draggable|='true']").on({
    //"mouseleave": $.proxy(mouseLeave),
    //"mouseenter": $.proxy(mouseEnter),
    "drop": $.proxy(drop),
    "dragover": $.proxy(dragover),
    "dragstart": $.proxy(dragstart),
    //"touchend": $.proxy(drop),
    //"touchenter": $.proxy(dragover),
    //"touchstart": $.proxy(dragstart),
  });

  $("#tabs #tab-" + id).off();
  $("#tabs #tab-" + id).click(function () {
    openTab(this);
  });
}

function newTabBar() {
  addTab({
    name: "Account",
    borderbottom: true,
  });

  addTab({
    name: "Trackers",
    borderright: true,
    borderbottom: true,
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
  var pnlid = $(evt).prop("id").replace(/^\S+?-(.*)/g, "$1");
  var pnl = $("#pnl-" + pnlid);

  if ($(evt).prop("checked")) {
    $(pnl).find("[id|='del']").removeClass("disabled");
    $(pnl).find("[id|='del']").removeAttr("disabled");
  } else {
    $(pnl).find("[id|='del']").addClass("disabled");
    $(pnl).find("[id|='del']").prop("disabled", "true");
  }
}

function enableAddBtns(evt) {
  var pnlid = $(evt).prop("id").replace(/^\S+?-(.*)/g, "$1");
  var pnl = $("#pnl-" + pnlid);

  $(pnl).find("#menu-type [id|='sel']").removeClass("disabled");
  $(pnl).find("#menu-type [id|='sel']").removeAttr("disabled");

  if (pnlid != "Trackers") {
    $(pnl).find("[id|='add']").removeClass("disabled");
    $(pnl).find("[id|='add']").removeAttr("disabled");
  }
}

function applyMeds(ml) {
  var pnl = $("#pnl-Account");

  for (var i = 0; i < ml.length; ++i) {
    var id = / /g [Symbol.replace](ml[i], "-");
    var entry = /idname/g [Symbol.replace](acct_entries, "med-" + id);
    entry = /ttitle/g [Symbol.replace](entry, ml[i]);
    $(pnl).find("#druglist").append(entry);
  }

  $(pnl).find("#useselecteddrugs").removeClass("disabled");
  $(pnl).find("#useselecteddrugs").removeAttr("disabled");
}

function selectType(evt) {
  var name = $(evt).text();
  var menu = $(evt).parent().parent();

  $(menu).find("[id|='sel']").text(name);

  $("#pnl-Trackers [id|='add']").removeClass("disabled");
  $("#pnl-Trackers [id|='add']").removeAttr("disabled");

  if ($(menu).prop("id") === "menu-type") {
    if (name.indexOf("range") != -1) {
      $(menu).find("[id|='newstart']").removeClass("disabled");
      $(menu).find("[id|='newstart']").removeAttr("disabled");
      $(menu).find("[id|='newend']").removeClass("disabled");
      $(menu).find("[id|='newend']").removeAttr("disabled");
    } else {
      $(menu).find("[id|='newstart']").addClass("disabled");
      $(menu).find("[id|='newstart']").prop("disabled", "true");
      $(menu).find("[id|='newend']").addClass("disabled");
      $(menu).find("[id|='newend']").prop("disabled", "true");
    }
  }
}

function panelAddBtn(db, evt) {
  var pnlid = $(evt).prop("id").replace(/\S+?-(.*)/g, "$1");
  var pnlname = /-/g [Symbol.replace](pnlid, " ");
  var pnl = $("#pnl-" + pnlid);
  var name = $(("#pnl-" + pnlid + " [id|='new']")).val();
  var id = / /g [Symbol.replace](name, "-");

  var store = db.transaction(["tracking"], "readwrite").objectStore("tracking");

  if (pnlid === "Trackers") {
    var pos = $("#cont-Trackers div:last-child").find("[id|='pos']").prop("id").replace(/\S+?-(.*)/g, "$1");
    var entry = {
      position: Number(pos) + 1,
      name: name,
      type: $(pnl).find("#menu-type [id|='sel']").text(),
    };

    if (entry.type.replace(/(\S+?) .*/g, "$1") === "range") {
      entry.start = $(pnl).find("[id|='newstart']").val();
      entry.end = $(pnl).find("[id|='newend']").val();
    }

    if (entry.type === "list")
      entry.list = [];

    store.add(entry);

    if (entry.type === "list") {
      addTab(entry);
      addPanel(entry);
    }

    generateTrackersPanel(db);
    $("#pnl-" + pnlid).show();
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
        $("#pnl-" + pnlid).show();
      }
    }
  }
}

function panelEditBtn(db, evt) {
  var ent = $(evt).parent();
  var pnlid = $(ent).parent().prop("id").replace(/\S+?-(.*)/g, "$1");

  $(ent).find("[id|='pos']").hide();
  $(ent).find("[id|='edtname']").show();

  if (pnlid === "Trackers") {
    var type = $(ent).find("[id|='type']").text().replace(/(\S+?) .*/g, "$1");

    if (type === "range") {
      $(ent).find("[id|='type']").hide();
      $(ent).find("[id|='show']").hide();

      $(ent).find("[id|='edtstart']").show();
      $(ent).find("[id|='edtend']").show();
      $(ent).find("[id|='menu']").show();
    }
  }

  $(evt).text("Done");
  $(evt).off();
  $(evt).click(function () {
    doneEdit(db, this);
  });
}

function doneEdit(db, evt) {
  var id = $(evt).prop("id").replace(/\S+?-(.*)/g, "$1");
  var ent = $(evt).parent();
  var pnlid = $(ent).parent().prop("id").replace(/\S+?-(.*)/g, "$1");
  var pnlname = /-/g [Symbol.replace](pnlid, " ");

  var newname = $(ent).find("[id|='edtname']").val();
  var oldname = /-/g [Symbol.replace](id, " ");

  var store = db.transaction(["tracking"], "readwrite").objectStore("tracking");
  var tracker = store.index("by_name").openCursor(IDBKeyRange.only(oldname));
  var panel = store.index("by_name").openCursor(IDBKeyRange.only(pnlname));

  tracker.onsuccess = function (event) {
    var cursor = event.target.result;

    if (cursor) {
      var entry = cursor.value;
      entry.name = newname;

      var type = $(ent).find("[id|='type']").text();

      if (type.indexOf("range") != -1) {
        entry.type = type;
        entry.start = $(ent).find("[id|='edtstart']").val();
        entry.end = $(ent).find("[id|='edtend']").val();
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
      $("#tablist #tab-" + id).remove();
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

function loadDrugsCom(evt, page) {
  var url = "'http://www.whateverorigin.org/get?url=";
  url += encodeURIComponent("https://www.drugs.com/mn/"+page);

  if (page === undefined) {
    page = $("#urldrugscom").val();
    page = page.replace(/.*?\/?(\S.*)$/g, "$1");
  }

  $.getJSON(url + '&callback=?', function (data, status) {})


  loadFile(url, function (data) {
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
  });
}

function lookupWeather(evt) {
  var city = $("#city").val();
  var state = $("#state").val();
  var country = $("#country").val();
  var tmpFormat = $("[name='temp'] :checked").text();
  var apikey = "36241d90d27162ebecabf6c334851f16";

  var url = "http://api.openweathermap.org/data/2.5/weather?q=" + city + "," + state + "," + country + "&units=" + tmpFormat + "&appid=" + apikey;

  loadFile(url, function (data) {
    var h = "<div class='row container'>Lon: " + data.coord.lon + " Lat: " + data.coord.lat + "</div>";
    $("#addressinp").after(h);
  });
}

function loadHtml(url, selector) {
  loadFile(url, function (data) {
    var html = data.replace(/(?:.*?\n)*?<body>((?:.*?\n)+?)<\/body>(.*?\n?)*/g, "$1");
    $(selector).append(html);
  });
}

function loadFile(url, fctn) {
  $.ajax({
    url: url,
    method: 'GET',
    success: function (data) {
      fctn(data);
    }
  });

  //var xhttp = new XMLHttpRequest();
  //xhttp.onreadystatechange = function () {
  //  if (this.readyState == 4) {
  //    if (this.status == 200) {
  //      fctn(this.responseText);
  //    }
  //  }
  //}
  //xhttp.open("GET", url, true);
  //xhttp.send();
}

var db;

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
  $(pnl).find("#city").keydown(function (event) {
    if (event.which === 0x0a || event.which === 0x0d)
      lookupWeather(this);
  });

  $(pnl).find("#state").keydown(function (event) {
    if (event.which === 0x0a || event.which === 0x0d)
      lookupWeather(this);
  });

  $(pnl).find("#country").keydown(function (event) {
    if (event.which === 0x0a || event.which === 0x0d)
      lookupWeather(this);
  });

  $("#urldrugscom").keydown(function () {
    $("#loaddrugscom").removeClass("disabled");
    $(pnl).find("#loaddrugscom").removeAttr("disabled");

    if (event.which === 0x0a || event.which === 0x0d)
      loadDrugsCom(this);
  });

  $(pnl).find("#loaddrugscom").click(function () {
    loadDrugsCom(this);
  });

  $(pnl).find("#demoloaddrugs").click(function () {
    loadDrugsCom(this, "wx7s49r");
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