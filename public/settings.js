'use strict';

$(document).ready(function () {
  startUp();

  let pnl = $("#pnl-Account");
  pnl.show();

  pnl.find("#city").keydown(function (event) {
    if (event.which === 0x0a || event.which === 0x0d)
      lookupWeather(this);
  });

  pnl.find("#state").keydown(function (event) {
    if (event.which === 0x0a || event.which === 0x0d)
      lookupWeather(this);
  });

  pnl.find("#country").keydown(function (event) {
    if (event.which === 0x0a || event.which === 0x0d)
      lookupWeather(this);
  });

  pnl.find("#save-acct").click(function () {
    lpd.updateAccount(lpd.account);
  });
});

const panels =
  `            
<div id="pnl-idname" class="card card-body container-fluid" style="display: none">
    <div id="ctrl-idname" class="row clr-dark-green">
        <div class="col-lg-4 col-md-4 col-sm-4 col-8 h4">ttitle</div>
        <label class="col-lg-4 col-md-4 col-sm-6 col-8">
            <input id="en-idname" type="checkbox">
            Enable Delete Buttons
        </label>
    </div>

    <div class = "row border-bottom" style="font-size: 12px">
        Controls data displayed and saved on the entry page. Drag to rearrange which changes the order on the entry page.
        Deleting items doesn't delete any saved data just the controls. Enter the name and hit add to restore it to the display.
    </div>
    <br>
        
    <div id="cont-idname" class="container-fluid pad-bottom"></div>
    <br>

    <div class="row">
        <input id="new-idname" class="rounded col-lg-3 col-md-3 col-sm-3 col-6" type="text" placeholder="ttitle">
        <div id="menu-idname" class="col-lg-2 col-md-2 col-sm-3 col-6 dropdown" iftrackers>
            <button id="sel-idname" class="btn border btn-sm btn-green dropdown-toggle disabled" disabled type="button" data-toggle="dropdown">
                Type
            </button>
            <div id="list-idname" class="dropdown-menu"></div>
        </div>
        <input id="newstart-idname" class="rounded col-lg-1 col-md-1 col-sm-1 col-3 disabled" disabled type="text" placeholder="1" iftrackers>&nbsp;
        <input id="newend-idname" class="rounded col-lg-1 col-md-1 col-sm-1 col-3 disabled" disabled type="text" placeholder="10" iftrackers>&nbsp;&nbsp;
        <button id="add-idname" type="button" class="btn border btn-sm btn-green disabled" disabled>Add</button>
    </div>
</div>
`;

const panels_entry =
  `
<div id="ent-idname" class="row border-bottom">
    <div id="pos-000" class="col-lg-3 col-md-3 col-sm-3 col-6" draggable="true">ttitle</div>
    <input id="editname-idname" class="rounded col-lg-3 col-md-3 col-sm-3 col-6" value="ttitle" style="display: none">
    <div id="type" class="col-lg-2 col-md-2 col-sm-3 col-6" iftrackers>ttype</div>
    <div id="show-idname" class="col-lg-2 col-md-2 col-sm-2 col-6" iftrackers>
        <div id="rng-startrange-endrange" ifrange>startrange-endrange</div>
    </div>
    <input id="edtstart-idname" class="rounded col-lg-1 col-md-1 col-sm-1 col-3" value="startrange" style="display: none">&nbsp;
    <input id="edtend-idname" class="rounded col-lg-1 col-md-1 col-sm-1 col-3" val="endrange" style="display: none">&nbsp;
    <button id="edit-idname" type="button" class="edit-button btn border btn-sm btn-green" ifedit>Edit</button>&nbsp;
    <button id="del-idname" type="button" class="del-button btn border btn-sm btn-green disabled" disabled ifedit>Delete</button>
</div>
`;

lightningPainDiary.prototype.doDisplayUpdate = function (trackerlist) {
  this.generateTrackersPanel(trackerlist);
  this.generateTabsAndPanels(trackerlist);
}

lightningPainDiary.prototype.generateTrackersPanel = function (trackerlist) {
  const pnlid = "Trackers";
  const name = "Trackers";

  let panel = /idname/g [Symbol.replace](panels, pnlid);
  panel = /ttitle/g [Symbol.replace](panel, name);
  panel = /iftrackers/g [Symbol.replace](panel, "");

  $("#pnl-" + pnlid).remove();
  $("#panels").append(panel);
  let pnl = $("#pnl-" + pnlid);

  for (let i = 0; i < trackerlist.length; ++i) {
    let item = trackerlist[i];

    let id = / /g [Symbol.replace](item.name, "-");

    let entry = /idname/g [Symbol.replace](panels_entry, id);
    entry = /ttitle/g [Symbol.replace](entry, item.name);
    entry = /ttype/g [Symbol.replace](entry, item.type);
    entry = /iftrackers/g [Symbol.replace](entry, "");
    entry = /000/g [Symbol.replace](entry, item.position);

    if (item.type === "range") {
      entry = /ifrange/g [Symbol.replace](entry, "");
      entry = /startrange/g [Symbol.replace](entry, item.start);
      entry = /endrange/g [Symbol.replace](entry, item.end);
    } else
      entry = /ifrange/g [Symbol.replace](entry, 'style="display: none"');

    entry = /ifedit/g [Symbol.replace](entry, item.fixed === true ? 'style="display: none"' : '');

    pnl.find("[id|='cont']").append(entry);
  }

  const menu_entries = `<button id="item" class="dropdown-item" type="button" style="cursor: pointer">ttype</button>`;

  for (let i = 0; i < trackertypes.length; ++i) {
    let menu = /ttype/g [Symbol.replace](menu_entries, trackertypes[i]);
    pnl.find("[id|='list']").append(menu);
  }

  this.setPanelEvents(pnlid);
}

lightningPainDiary.prototype.generateTabsAndPanels = function (trackerlist) {
  this.newTabBar();

  for (let i = 0; i < trackerlist.length; ++i) {
    let item = trackerlist[i];

    if (item.type === "list") {
      this.addTab(item);
      this.addPanel(item);
    }
  }
}

lightningPainDiary.prototype.addPanel = function (items) {
  let pnlid = / /g [Symbol.replace](items.name, "-");
  let name = items.name;

  let panel = /idname/g [Symbol.replace](panels, pnlid);
  panel = /ttitle/g [Symbol.replace](panel, name);
  panel = /iftrackers/g [Symbol.replace](panel, "style='display: none'");

  $("#pnl-" + pnlid).remove();
  $("#panels").append(panel);

  for (let j = 0; j < items.list.length; ++j) {
    let item = items.list[j];
    let id = / /g [Symbol.replace](item, "-");

    let entry = /idname/g [Symbol.replace](panels_entry, id);
    entry = /ttitle/g [Symbol.replace](entry, item);
    entry = /iftrackers/g [Symbol.replace](entry, "style='display: none'");
    entry = /ifrange/g [Symbol.replace](entry, "style='display: none'");
    entry = /ifedit/g [Symbol.replace](entry, '');

    $("#pnl-" + pnlid + " [id|='cont']").append(entry);
  }

  this.setPanelEvents(pnlid);
}

lightningPainDiary.prototype.setPanelEvents = function (id) {
  let pnl = $("#pnl-" + id);

  pnl.find("[id|='en']").click(function () {
    lpd.enableDeleteBtns(this);
  });

  pnl.find("[id|='editname']").keydown(function (event) {
    if (event.which === 0x0a || event.which === 0x0d)
      lpd.doneEdit(lpd.trackerlist, this);
  });

  pnl.find("[id|='edit']").click(function () {
    lpd.panelEditBtn(lpd.trackerlist, this);
  });

  pnl.find("[id|='del']").click(function () {
    lpd.panelDeleteBtn(lpd.trackerlist, this);
  });

  pnl.find("[id|='new']").keydown(function (event) {
    if (event.which === 0x0a || event.which === 0x0d)
      lpd.panelAddBtn(lpd.trackerlist, this);
    else
      lpd.enableAddBtns(this);
  });

  pnl.find("[id|='add']").click(function () {
    lpd.panelAddBtn(lpd.trackerlist, this);
  });

  if (id === "Trackers") {
    pnl.find("[id|='edtstart']").keydown(function (event) {
      if (event.which === 0x0a || event.which === 0x0d)
        lpd.doneEdit(lpd.trackerlist, this);
    });

    pnl.find("[id|='edtend']").keydown(function (event) {
      if (event.which === 0x0a || event.which === 0x0d)
        lpd.doneEdit(lpd.trackerlist, this);
    });

    pnl.find("[id|='newstart']").keydown(function (event) {
      if (event.which === 0x0a || event.which === 0x0d)
        lpd.panelAddBtn(lpd.trackerlist, this);
    });

    pnl.find("[id|='newend']").keydown(function (event) {
      if (event.which === 0x0a || event.which === 0x0d)
        lpd.panelAddBtn(lpd.trackerlist, this);
    });

    pnl.find("[id|='item']").click(function () {
      lpd.selectType(this);
    });

    lpd.loadAccount(lpd.account);
  }

  pnl.find("[draggable|='true']").on({
    //"mouseleave": $.proxy(mouseLeave),
    //"mouseenter": $.proxy(mouseEnter),
    "drop": $.proxy(lpd.drop),
    "dragover": $.proxy(lpd.dragover),
    "dragstart": $.proxy(lpd.dragstart),
    //"touchend": $.proxy(drop),
    //"touchenter": $.proxy(dragover),
    //"touchstart": $.proxy(dragstart),
  });
}

lightningPainDiary.prototype.newTabBar = function () {
  this.addTab({
    name: "Account",
    borderbottom: true,
  });

  this.addTab({
    name: "Trackers",
    borderright: true,
    borderbottom: true,
  });
}

lightningPainDiary.prototype.addTab = function (item) {
  const tab_entries = `<button id="tab-idname" class="col-lg-2 col-md-3 col-sm-4 col-6 h4 btn-green no-border trborder tbborder">ttitle</button>`;

  let id = / /g [Symbol.replace](item.name, "-");

  let tab = /idname/g [Symbol.replace](tab_entries, id);
  tab = /ttitle/g [Symbol.replace](tab, item.name);
  tab = /trborder/g [Symbol.replace](tab, item.borderright === true ? "border-right" : "");
  tab = /tbborder/g [Symbol.replace](tab, item.borderbottom === true ? "border-bottom" : "");

  let tabs = $("#tablist");

  tabs.find("#tab-" + id).remove();
  tabs.append(tab);

  tabs.find("#tab-" + id).click(function () {
    lpd.openTab(this);
  });
}

/***********************************************/

lightningPainDiary.prototype.openTab = function (evt) {
  $("#panels").children().hide();
  let pnl = $(evt).prop("id").replace(stripid, "$1");
  $("#panels #pnl-" + pnl).show();
}

lightningPainDiary.prototype.dragover = function (evt) {
  evt.preventDefault();
}

lightningPainDiary.prototype.dragstart = function (evt) {
  evt.preventDefault();
  evt.originalEvent.dataTransfer.setData("text/html", $(this).parent().prop("id"));
}

lightningPainDiary.prototype.drop = function (evt) {
  evt.preventDefault();
  let src = evt.originalEvent.dataTransfer.getData("text/html");
  let dst = $(evt).prop("id");
  let pnlid = $(evt).parent().parent().prop("id").replace(stripid, "$1");

  let list = [];
  let found = 0;
  $("#pnl-" + pnlid).children().each(function () {
    let id = $(this).prop("id");

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

  for (let i = 0; i < list.length; ++i) {
    $("#" + pt).append(list[i]);
  }
}

lightningPainDiary.prototype.enableDeleteBtns = function (evt) {
  let pnlid = $(evt).prop("id").replace(stripid, "$1");
  let pnl = $("#pnl-" + pnlid);

  if ($(evt).prop("checked")) {
    pnl.find("[id|='del']").removeClass("disabled");
    pnl.find("[id|='del']").removeAttr("disabled");
  } else {
    pnl.find("[id|='del']").addClass("disabled");
    pnl.find("[id|='del']").prop("disabled", "true");
  }
}

lightningPainDiary.prototype.enableAddBtns = function (evt) {
  let pnlid = $(evt).prop("id").replace(stripid, "$1");
  let pnl = $("#pnl-" + pnlid);

  if (pnlid === "Trackers") {
    pnl.find("[id|='sel']").removeClass("disabled");
    pnl.find("[id|='sel']").removeAttr("disabled");
  } else {
    pnl.find("[id|='add']").removeClass("disabled");
    pnl.find("[id|='add']").removeAttr("disabled");
  }
}

lightningPainDiary.prototype.selectType = function (evt) {
  let name = $(evt).text();
  let menu = $(evt).parent().parent();
  let pnl = $("#pnl-Trackers");

  menu.find("[id|='sel']").text(name);

  pnl.find("[id|='add']").removeClass("disabled");
  pnl.find("[id|='add']").removeAttr("disabled");

  if (name === "range") {
    pnl.find("[id|='newstart']").removeClass("disabled");
    pnl.find("[id|='newstart']").removeAttr("disabled")
    pnl.find("[id|='newend']").removeClass("disabled");
    pnl.find("[id|='newend']").removeAttr("disabled")
  } else {
    pnl.find("[id|='newstart']").addClass("disabled");
    pnl.find("[id|='newstart']").prop("disabled", "true");
    pnl.find("[id|='newend']").addClass("disabled");
    pnl.find("[id|='newend']").prop("disabled", "true");
  }
}

lightningPainDiary.prototype.panelAddBtn = function (trackerlist, evt) {
  let pnlid = $(evt).prop("id").replace(stripid, "$1");
  let pnlname = /-/g [Symbol.replace](pnlid, " ");
  let pnl = $("#pnl-" + pnlid);
  let name = pnl.find("[id|='new']").val();
  let id = / /g [Symbol.replace](name, "-");

  if (pnlid === "Trackers") {
    let entry = {
      name: name,
      type: pnl.find("[id|='sel']").text(),
    };

    let found = trackerlist.find(function (x) {
      return (x.name === name);
    });

    if (entry.type === "Type" || found)
      return;

    if (entry.type === "range") {
      entry.start = Number(pnl.find("[id|='newstart']").val());
      entry.end = Number(pnl.find("[id|='newend']").val());

      if (entry.start === 0 && entry.end === 0)
        return;
    }

    if (entry.type === "weather") {
      entry.list = demotrackerlist.find(function (x) {
        return (x.type === "weather");
      }).list;
    }

    if (entry.type === "list") {
      entry.list = [];

      this.addTab(entry);
      this.addPanel(entry);
    }

    trackerlist.push(entry);

    this.generateTrackersPanel(trackerlist);
    $("#pnl-" + pnlid).show();

    firebase.database().ref('users/' + this.uid + '/Trackers').push(entry);
  } else {
    let i = trackerlist.findIndex(function (x) {
      return (x.name === pnlname);
    });

    let entry = trackerlist[i];
    if (!entry.list.includes(name))
      entry.list.push(name);

    this.addPanel(entry);
    $("#pnl-" + pnlid).show();

    firebase.database().ref('users/' + this.uid + '/Trackers/' + i).set(entry);
  }
}

lightningPainDiary.prototype.panelEditBtn = function (trackerlist, evt) {
  let ent = $(evt).parent();
  let pnlid = ent.prop("id").replace(stripid, "$1");

  ent.find("[id|='pos']").hide();
  ent.find("[id|='editname']").show();

  if (pnlid === "Trackers") {
    if (ent.find("[id|='type']").text() === "range") {
      ent.find("[id|='show']").hide();

      ent.find("[id|='edtstart']").show();
      ent.find("[id|='edtend']").show();
    }
  }

  $(evt).text("Done");
  $(evt).off();
  $(evt).click(function () {
    lpd.doneEdit(trackerlist, this);
  });
}

lightningPainDiary.prototype.doneEdit = function (trackerlist, evt) {
  let id = $(evt).prop("id").replace(stripid, "$1");
  let ent = $(evt).parent();
  let pnlid = ent.parent().prop("id").replace(stripid, "$1");
  let pnl = $("#pnl-" + pnlid);
  let pnlname = /-/g [Symbol.replace](pnlid, " ");

  let newname = ent.find("[id|='editname']").val();
  let oldname = /-/g [Symbol.replace](id, " ");

  if (pnlname === "Trackers") {
    let i = trackerlist.findIndex(function (x) {
      return (x.name === oldname);
    });

    let entry = trackerlist[i];
    entry.name = newname;

    if (entry.type === "range") {
      entry.start = ent.find("[id|='edtstart']").val();
      entry.end = ent.find("[id|='edtend']").val();
    }

    if (entry.type === "list")
      lpd.generateTabsAndPanels(trackerlist);

    lpd.generateTrackersPanel(trackerlist);
    $("#pnl-" + pnlid).show();

    firebase.database().ref('users/' + this.uid + '/Trackers/' + i).set(entry);

  } else {
    let i = trackerlist.findIndes(function (x) {
      return (x.name === pnlname);
    });

    let entry = trackerlist[i];

    let j = entry.list.indexOf(oldname);
    entry.list[j] = newname;

    this.addPanel(entry);
    $("#pnl-" + pnlid).show();

    firebase.database().ref('users/' + this.uid + '/Trackers/' + i).set(entry);
  }
}

lightningPainDiary.prototype.panelDeleteBtn = function (trackerlist, evt) {
  let id = $(evt).prop("id").replace(stripid, "$1");
  let pnlid = $(evt).parent().parent().prop("id").replace(stripid, "$1");
  let pnlname = /-/g [Symbol.replace](pnlid, " ");
  let name = /-/g [Symbol.replace](id, " ");

  if (pnlid === "Trackers") {
    let i = trackerlist.findIndex(function (x) {
      return (x.name === name);
    });

    trackerlist.splice(i, 1);

    $("#pnl-" + pnlid + " #ent-" + id).remove();
    $("#panels #pnl-" + id).remove();
    $("#tablist #tab-" + id).remove();

    firebase.database().ref('users/' + this.uid + '/Trackers/').set(trackerlist);
  } else {
    let i = trackerlist.findIndex(function (x) {
      return (x.name === pnlname);
    });

    let entry = trackerlist[i];

    let j = entry.list.indexOf(name);
    entry.list.splice(j, 1);

    $("#pnl-" + pnlid + " #ent-" + id).remove();

    firebase.database().ref('users/' + this.uid + '/Trackers/' + i).set(entry);
  }
}

function lookupWeather(evt) {
  let city = $("#city").val();
  let state = $("#state").val();
  let country = $("#country").val();
  let tmpFormat = $("[name='temp'] :checked").text();

  let url = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "," + state + "," + country + "&units=" + tmpFormat + "&appid=" + openweatherapikey;

  loadFile(url, null, function (data) {
    let h = "<div class='row container'>Lon: " + data.coord.lon + " Lat: " + data.coord.lat + "</div>";
    $("#addressinp").after(h);
  });
}

lightningPainDiary.prototype.updateAccount = function (account) {
  let pnl=$("#pnl-Account");
  
  account.city = pnl.find("#city").val();
  account.state = pnl.find("#state").val();
  account.country = pnl.find("#country").val();
  account.ifmetric = pnl.find("#ifmetric").prop("checked");
  account.ifnotify = pnl.find("#ifnotify").prop("checked");
  account.notifytime = pnl.find("#notifytime").val();
  account.ifemail = pnl.find("#ifemail").prop("checked");
  account.ifsms = pnl.find("#ifsms").prop("checked");
  account.phone = pnl.find("#phone").val();

  firebase.database().ref('users/' + this.uid + '/Account').set(account);
}

lightningPainDiary.prototype.loadAccount = function (account) {
  let pnl = $("#pnl-Account");

  pnl.find("#city").val(account.city);
  pnl.find("#state").val(account.state);
  pnl.find("#country").val(account.country);
  pnl.find("#ifimperial").prop("checked", !account.ifmetric);
  pnl.find("#ifmetric").prop("checked", account.ifmetric);
  pnl.find("#ifnotify").prop("checked", account.ifnotify);
  pnl.find("#notifytime").val(account.notifytime);
  pnl.find("#ifemail").prop("checked", account.ifemail);
  pnl.find("#ifsms").prop("checked", account.ifsms);
  pnl.find("#phone").val(account.phone);
}