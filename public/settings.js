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
  for (var i = 0; i < trackerstypes.length; ++i) {
    tmenu += /ttype/g [Symbol.replace](tail_tracker_menu, trackerstypes[i]);
  }

  var ttail = /idname/g [Symbol.replace](tail, id);
  ttail = /ttitle/g [Symbol.replace](ttail, name);
  ttail = /iftracker/g [Symbol.replace](ttail, "");

  var tend = /ifrange/g [Symbol.replace](tail_end, 'style="display: none"');

  $("#panels").append(ttitle + tentry + ttail + tmenu + tend);
}

function generatePanels() {
  // w3.displayObject(selector)
  // w3.getHttpObject("customers.js", myFunction);

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

      var tend = /ifrange/g [Symbol.replace](tail_end, 'style="display: none"');

      $("#panels").append(ttitle + tentry + ttail + tend);
    }
  }
}

function generateTabs(evt) {
  var tabs = "";

  for (var i = 0; i < trackerlist.length; ++i) {
    var item = trackerlist[i];

    if (item.type === "list" && item.enabled) {
      var id = / /g [Symbol.replace](item.name, "-");
      var tab = /idname/g [Symbol.replace](tab_entries, id);
      tabs += /ttitle/g [Symbol.replace](tab, item.name);
    }
  }

  $("#tabs").empty();
  $("#tabs").append(tab_head + tabs + tab_tail);

  $(evt).click(function () {
    openTab(this);
  });
}

function openTab(evt) {
  $("#panels").children().hide();
  $("#panels").children("#" + $(evt).prop("id")).show();
}

function dragover(evt) {
  evt.preventDefault();
}

function dragstart(evt) {
  evt.originalEvent.dataTransfer.setData("text/html", this.parentElement.id);
}

function drop(evt) {
  evt.preventDefault();
  var src = evt.originalEvent.dataTransfer.getData("text/html");
  var dst = evt.target.parentElement.id;
  var pt = evt.target.parentElement.parentElement.id.replace(/^\S+?-(.*)/g, "cont-$1");

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
}

function enableDeleteBtns(evt) {
  var pnl = $(evt).parent().prop("id").replace(/^\S+?-(.*)/g, "pnl-$1");

  $("#" + pnl + " #delbtn").addClass("disabled");
  if ($(evt).prop("checked"))
    $("#" + pnl + " #delbtn").removeClass("disabled");
}


$(document).ready(function () {
  generateTabs();
  generatePanels();
  generateTrackerPanel();

  $("#tabs button").click(function () {
    openTab(this);
  });

  $("#panels #enabledeleteck").click(function () {
    enableDeleteBtns(this);
  });

  $("#panels #delbtn").click(function () {
    deleteButton(this);
  });

  $("#javascript").empty();
  $("#jssite").show();

  $("#panels [draggable|='true']").on({
    //"mouseleave": $.proxy(mouseLeave),
    //"mouseenter": $.proxy(mouseEnter),
    "drop": $.proxy(drop),
    "dragover": $.proxy(dragover),
    "dragstart": $.proxy(dragstart)
  });
});