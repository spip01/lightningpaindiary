loadFile("http://raw.githubusercontent.com/spip01/lightningpaindiary/bootstrap/public/navbar.html", "#navbar");
loadFile("http://raw.githubusercontent.com/spip01/lightningpaindiary/bootstrap/public/footer.html", "#footer");

function generateTrackerPanel() {
  var id = "tracker";
  var name = "Tracker";

  var ttitle = /idname/g [Symbol.replace](head, id);
  ttitle = /ttitle/g [Symbol.replace](ttitle, name);
  ttitle = /ifpanel/g [Symbol.replace](ttitle, "style='display: none'");
  ttitle = /iftracker/g [Symbol.replace](ttitle, "");

  var tentry = "";

  for (var i = 0; i < trackerlist.length; ++i) {
    var item = trackerlist[i];
    var iid = / /g [Symbol.replace](item.name, "-");

    var t = entry;
    t = /idname/g [Symbol.replace](t, iid);
    t = /ttitle/g [Symbol.replace](t, item.name);
    t = /ttype/g [Symbol.replace](t, item.type);
    t = /iftracker/g [Symbol.replace](t, "");

    if (item.type.indexOf("range") != -1) {
      t = /ifrange/g [Symbol.replace](t, "");
      t = /startrange/g [Symbol.replace](t, item.start);
      t = /endrange/g [Symbol.replace](t, item.end);
    } else
      t = /ifrange/g [Symbol.replace](t, 'style="display: none"');

    tentry += t;
  }

  var tmenu = "";

  // generate type menu
  for (var i = 0; i < trackertypes.length; ++i) {
    var mid = / /g [Symbol.replace](trackertypes[i], "-");
    var mitem = /idname/g [Symbol.replace](tail_tracker_menu, mid);
    mitem = /ttype/g [Symbol.replace](mitem, trackertypes[i]);

    tmenu += mitem;
  }

  var ttail = /idname/g [Symbol.replace](tail, id);
  ttail = /ttitle/g [Symbol.replace](ttail, name);
  ttail = /iftracker/g [Symbol.replace](ttail, "");

  var tend = /iftracker/g [Symbol.replace](tail_end, "");

  $("#panels").append(ttitle + tentry + ttail + tmenu + tend);
}

function generatePanels() {
  for (var i = 0; i < trackerlist.length; ++i) {
    var item = trackerlist[i];

    if (item.type === "list") {
      var id = / /g [Symbol.replace](item.name, "-");
      var name = item.name;

      var ttitle = /idname/g [Symbol.replace](head, id);
      ttitle = /ttitle/g [Symbol.replace](ttitle, name);
      ttitle = /ifpanel/g [Symbol.replace](ttitle, "");
      ttitle = /iftracker/g [Symbol.replace](ttitle, "style='display: none'");

      tentry = "";
      for (var j = 0; j < item.list.length; ++j) {
        var t = entry;
        var iid = / /g [Symbol.replace](item.list[j], "-");
        t = /idname/g [Symbol.replace](t, iid);
        t = /ttitle/g [Symbol.replace](t, item.list[j]);
        t = /iftracker/g [Symbol.replace](t, "style='display: none'");
        t = /ifrange/g [Symbol.replace](t, "style='display: none'");

        tentry += t;
      }

      var ttail = /idname/g [Symbol.replace](tail, id);
      ttail = /ttitle/g [Symbol.replace](ttail, name);
      ttail = /iftracker/g [Symbol.replace](ttail, 'style="display: none"');

      var tend = /iftracker/g [Symbol.replace](tail_end, 'style="display: none"');

      $("#panels").append(ttitle + tentry + ttail + tend);
    }
  }
}

function generateTabs() {
  var tabs = "";
  var rmds = "";

  var tab = /idname/g [Symbol.replace](tab_entries, "account");
  tabs += /ttitle/g [Symbol.replace](tab, "Account");
  tab = /idname/g [Symbol.replace](tab_entries, "tracker");
  tabs += /ttitle/g [Symbol.replace](tab, "Tracker");

  for (var i = 0; i < trackerlist.length; ++i) {
    var item = trackerlist[i];
    var id = / /g [Symbol.replace](item.name, "-");

    if (item.type === "list" && item.enabled) {
      tab = /idname/g [Symbol.replace](tab_entries, id);
      tabs += /ttitle/g [Symbol.replace](tab, item.name);
    }

    var rmd = /idname/g [Symbol.replace](rmd_entries, id);
    rmds += /ttitle/g [Symbol.replace](rmd, item.name);
  }

  $("#tabs").html(tab_head + tabs + tab_tail);

  $("#reminders").html(rmds);

  $("#tabs button").click(function () {
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

function deleteButton(evt) {
  var ent = $(evt).parent().prop("id").replace(/\S+?-(.*)/g, "$1");
  var pnl = $(evt).parent().parent().prop("id").replace(/\S+?-(.*)/g, "$1");
  var name = /-/g [Symbol.replace](ent, " ");

  var i = trackerlist.findIndex(trackerlist => trackerlist.name === name);
  var list = trackerlist[i].list;

  if (pnl === "tracker") {
    trackerlist[i].enabled = false;
  } else {
    var j = trackerlist[i].list.findIndex(list => list === ent);
    list.splice(j, 1);
  }

  $("#ent-" + ent).detach();
  generateTabs();
}

function enableDeleteBtns(evt) {
  var pnl = $(evt).parent().prop("id").replace(/^\S+?-(.*)/g, "pnl-$1");

  $("#" + pnl + " #delbtn").addClass("disabled");
  $("#" + pnl + " #delbtn").prop("disabled", "true");
  if ($(evt).prop("checked")) {
    $("#" + pnl + " #delbtn").removeClass("disabled");
    $("#" + pnl + " #delbtn").removeAttr("disabled");
  }
}

function enableAdd(evt) {
  var pnl = $(evt).parent().prop("id").replace(/^\S+?-(.*)/g, "pnl-$1");

  $("#" + pnl + " #menu").removeClass("disabled");
  $("#" + pnl + " #menu").removeAttr("disabled");
  $("#" + pnl + " #addent").removeClass("disabled");
  $("#" + pnl + " #addent").removeAttr("disabled");
  $("#" + pnl + " #startrangeinp").removeClass("disabled");
  $("#" + pnl + " #startrangeinp").removeAttr("disabled");
  $("#" + pnl + " #endrangeinp").removeClass("disabled");
  $("#" + pnl + " #endrangeinp").removeAttr("disabled");
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

        if (start) {
          if (l.search(/^h4>/) != -1) {
            var m = l.replace(/^h4>(.*)/, "$1");
            h.push(m);
          }
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
    list += /midname/g [Symbol.replace](med_import, ml[i]);
  }
  list += '<dev>';

  $("#druglist").html(list);
  $("#useselecteddrugs").removeClass("disabled");
  $("#useselecteddrugs").removeAttr("disabled");
}

function useSelectedDrugs(evt) {
  var remedies = [];
  if (i = trackerlist.findIndex(trackerlist => trackerlist.name === "Remedies") != -1) {
    remedies = trackerlist[i];
  } else {
    remedies.name = "Remedies";
    remedies.type = "list";
    remedies.list = "";
    remedies.removeable = true;
    remedies.enabled = true;
    trackerlist.push(remedies);
  }

  $("#druglist input").foreach(function () {
    if ($(this).prop("checked")) {
      if (remedies.list.findIndex(remedies => remedies.list === $(this).text()) != -1) {
        remedies.list.push($(this).text());
      }
    }
  });
}

function enableLoadDrugs(evt) {
  $("#loaddrugscom").removeClass("disabled");
  $("#loaddrugscom").removeAttr("disabled");
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

$(document).ready(function () {
  $("#javascript").hide();
  $("#jssite").show();

  generateTabs();
  generatePanels();
  generateTrackerPanel();

  //$("#tabs button").click(function () {
  //  openTab(this);
  //});

  $("#panels #enabledeleteck").click(function () {
    enableDeleteBtns(this);
  });

  $("#panels #delbtn").click(function () {
    deleteButton(this);
  });

  $("#panels #addinp").focus(function () {
    enableAddRecall(this);
  });

  $("#urldrugscom").focus(function () {
    enableLoadDrugs(this);
  })

  $("#loaddrugscom").click(function () {
    loadDrugsCom(this);
  });

  $("#useselecteddrugs").click(function () {
    useSelectedDrugs(this);
  });

  $("#demoloaddrugs").click(function () {
    loadDrugs("https://www.drugs.com/mn/wx7s49r");
  });

  $("#panels [draggable|='true']").on({
    //"mouseleave": $.proxy(mouseLeave),
    //"mouseenter": $.proxy(mouseEnter),
    "drop": $.proxy(drop),
    "dragover": $.proxy(dragover),
    "dragstart": $.proxy(dragstart)
  });
});

/************************************************** */
if (!('indexedDB' in window)) {
  console.log('This browser doesn\'t support IndexedDB');
}

var request = indexedDB.open("diary", 1);
var db = NaN;

request.onupgradeneeded = function () {
  db = request.result;
  var store = db.createObjectStore("tracking", {
    autoIncrement: true
  });

  var titleIndex = store.createIndex("by_position", "position", {
    unique: true
  });

  var titleIndex = store.createIndex("by_name", "name", {
    unique: true
  });

  var authorIndex = store.createIndex("by_type", "type", {
    unique: false
  });

  for (var i = 0; i < trackerlist.length; ++i) {
    store.put(trackerlist[i]);
  }
};

request.onerror = function (event) {
  console.log("error loading db: " + request.error);
};

request.onsuccess = function () {
  db = request.result;

  var transaction = db.transaction(["tracking"], "readwrite");

  transaction.oncomplete = function (event) {
    console.log("Transaction completed: database modification finished");
  };

  transaction.onerror = function (event) {
    console.log("Transaction not opened due to error: " + transaction.error);
  };

  var objectStore = transaction.objectStore("tracking");

  objectStore.onsuccess = function (event) {
    console.log("Request successful");
  }

  var myIndex = objectStore.index('by_type');

  myIndex.openCursor(IDBKeyRange.bound("list")).onsuccess = function (event) {
    var cursor = event.target.result;
    if (cursor) {
      console.log(cursor.value.position + ' ' + cursor.value.name + ' ' + cursor.value.type, cursor.value.list);

      var updateData = cursor.value;
          
      updateData.position += 20;
      var request = cursor.update(updateData);
      request.onsuccess = function() {
        console.log('updated');
      };
    
      cursor.continue();
    } else {
      console.log('Entries all displayed.');
    }
  };


};