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

function generateTrackersPanel(db) {
  const pnlid = "Trackers";
  const name = "Trackers";

  let panel = /idname/g [Symbol.replace](panels, pnlid);
  panel = /ttitle/g [Symbol.replace](panel, name);
  panel = /iftrackers/g [Symbol.replace](panel, "");

  $("#pnl-" + pnlid).remove();
  $("#panels").append(panel);
  let pnl = $("#pnl-" + pnlid);

  //$("#pnl-Account #reminders").empty();

  let store = db.transaction(["account"], "readwrite").objectStore("account");
  let cursor = store.index('by_position').openCursor();
  cursor.onsuccess = function (event) {
    let cursor = event.target.result;

    if (cursor) {
      let item = cursor.value;
      if (item.name !== "Account") {

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

        // if (item.fixed) {
        //   const acct_entries =
        //     `
        //   <label class="col-lg-2 col-md-3 col-sm-6 col-12">
        //     <input id="itm-idname" type="checkbox">
        //     ttitle
        //   </label>
        //   `;

        //   let reminders = /idname/g [Symbol.replace](acct_entries, id);
        //   reminders = /ttitle/g [Symbol.replace](reminders, item.name);
        //   $("#pnl-Account #reminders").append(reminders);
        // }
      }

      cursor.continue();
    } else {
      const menu_entries = `<button id="item" class="dropdown-item" type="button" style="cursor: pointer">ttype</button>`;

      for (let i = 0; i < trackerstypes.length; ++i) {
        let menu = /ttype/g [Symbol.replace](menu_entries, trackerstypes[i]);
        pnl.find("[id|='list']").append(menu);
      }

      setPanelEvents(pnlid);
    }
  };
}

function generateTabsAndPanels(db) {
  newTabBar();

  let store = db.transaction(["account"], "readwrite").objectStore("account");
  let cursor = store.index('by_position').openCursor();
  cursor.onsuccess = function (event) {
    let cursor = event.target.result;

    if (cursor) {
      item = cursor.value;

      if (item.type === "list") {
        addTab(item);
        addPanel(item);
      }

      cursor.continue();
    }
  };
}

function addPanel(items) {
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

  setPanelEvents(pnlid);
}

function setPanelEvents(id) {
  let pnl = $("#pnl-" + id);

  pnl.find("[id|='en']").click(function () {
    enableDeleteBtns(this);
  });

  pnl.find("[id|='editname']").keydown(function (event) {
    if (event.which === 0x0a || event.which === 0x0d)
      doneEdit(accountdb, this);
  });

  pnl.find("[id|='edit']").click(function () {
    panelEditBtn(accountdb, this);
  });

  pnl.find("[id|='del']").click(function () {
    panelDeleteBtn(accountdb, this);
  });

  pnl.find("[id|='new']").keydown(function (event) {
    if (event.which === 0x0a || event.which === 0x0d)
      panelAddBtn(accountdb, this);
    else
      enableAddBtns(this);
  });

  pnl.find("[id|='add']").click(function () {
    panelAddBtn(accountdb, this);
  });

  if (id === "Trackers") {
    pnl.find("[id|='edtstart']").keydown(function (event) {
      if (event.which === 0x0a || event.which === 0x0d)
        doneEdit(accountdb, this);
    });

    pnl.find("[id|='edtend']").keydown(function (event) {
      if (event.which === 0x0a || event.which === 0x0d)
        doneEdit(accountdb, this);
    });

    pnl.find("[id|='newstart']").keydown(function (event) {
      if (event.which === 0x0a || event.which === 0x0d)
        panelAddBtn(accountdb, this);
    });

    pnl.find("[id|='newend']").keydown(function (event) {
      if (event.which === 0x0a || event.which === 0x0d)
        panelAddBtn(accountdb, this);
    });

    pnl.find("[id|='item']").click(function () {
      selectType(this);
    });

    loadAccount(accountdb);
  }

  pnl.find("[draggable|='true']").on({
    //"mouseleave": $.proxy(mouseLeave),
    //"mouseenter": $.proxy(mouseEnter),
    "drop": $.proxy(drop),
    "dragover": $.proxy(dragover),
    "dragstart": $.proxy(dragstart),
    //"touchend": $.proxy(drop),
    //"touchenter": $.proxy(dragover),
    //"touchstart": $.proxy(dragstart),
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
    openTab(this);
  });
}

/***********************************************/

function openTab(evt) {
  $("#panels").children().hide();
  let pnl = $(evt).prop("id").replace(stripid, "$1");
  $("#panels #pnl-" + pnl).show();
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

function enableDeleteBtns(evt) {
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

function enableAddBtns(evt) {
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

function applyMeds(ml) {
  const acct_entries =
    `
    <label class="col-lg-2 col-md-3 col-sm-6 col-12">
      <input id="itm-idname" type="checkbox">
      ttitle
    </label>
    `;

  let pnl = $("#pnl-Account");

  for (let i = 0; i < ml.length; ++i) {
    let id = / /g [Symbol.replace](ml[i], "-");
    let entry = /idname/g [Symbol.replace](acct_entries, "med-" + id);
    entry = /ttitle/g [Symbol.replace](entry, ml[i]);
    pnl.find("#druglist").append(entry);
  }

  pnl.find("#useselecteddrugs").removeClass("disabled");
  pnl.find("#useselecteddrugs").removeAttr("disabled");
}

function selectType(evt) {
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

function panelAddBtn(db, evt) {
  let pnlid = $(evt).prop("id").replace(stripid, "$1");
  let pnlname = /-/g [Symbol.replace](pnlid, " ");
  let pnl = $("#pnl-" + pnlid);
  let name = pnl.find("[id|='new']").val();
  let id = / /g [Symbol.replace](name, "-");

  let store = db.transaction(["account"], "readwrite").objectStore("account");
  req = store.index('by_name').openCursor(IDBKeyRange.only("Account"));
  req.onsuccess = function (event) {
    let cursor = event.target.result;

    let account = cursor.value;

    if (pnlid === "Trackers") {
      let entry = {
        name: name,
        position: ++account.lastposition,
        type: pnl.find("[id|='sel']").text(),
      };

      if (entry.type.indexOf("Type") != -1)
        return;

      if (entry.type === "range") {
        entry.start = Number(pnl.find("[id|='newstart']").val());
        entry.end = Number(pnl.find("[id|='newend']").val());

        if (entry.start === 0 && entry.end === 0)
          return;
      }

      if (entry.type === "weather") {
        entry.list = trackerslist.find(function (x) {
          return (x.type === "weather");
        }).list;
      }

      if (entry.type === "list")
        entry.list = [];

      store.add(entry);
      cursor.update(account);

      if (entry.type === "list") {
        addTab(entry);
        addPanel(entry);
      }

      generateTrackersPanel(db);
      $("#pnl-" + pnlid).show();
    } else {
      let req = store.index("by_name").openCursor(IDBKeyRange.only(pnlname));

      req.onsuccess = function (event) {
        let cursor = event.target.result;

        if (cursor) {
          let entry = cursor.value;
          if (!entry.list.includes(name))
            entry.list.push(name);

          cursor.update(entry);

          addPanel(entry);
          $("#pnl-" + pnlid).show();
        }
      }
    }
  };
}

function panelEditBtn(db, evt) {
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
    doneEdit(db, this);
  });
}

function doneEdit(db, evt) {
  let id = $(evt).prop("id").replace(stripid, "$1");
  let ent = $(evt).parent();
  let pnlid = ent.parent().prop("id").replace(stripid, "$1");
  let pnl = $("#pnl-" + pnlid);
  let pnlname = /-/g [Symbol.replace](pnlid, " ");

  let newname = ent.find("[id|='editname']").val();
  let oldname = /-/g [Symbol.replace](id, " ");

  let store = db.transaction(["account"], "readwrite").objectStore("account");

  if (pnlid === "Trackers") {
    let req = store.index("by_name").openCursor(IDBKeyRange.only(oldname));

    req.onsuccess = function (event) {
      let cursor = event.target.result;

      if (cursor) {
        let entry = cursor.value;
        entry.name = newname;

        if (entry.type === "range") {
          entry.start = ent.find("[id|='edtstart']").val();
          entry.end = ent.find("[id|='edtend']").val();
        }

        cursor.update(entry);

        if (entry.type === "list")
          generateTabsAndPanels(db);

        generateTrackersPanel(db);
        $("#pnl-" + pnlid).show();
      }
    }
  } else {
    let req = store.index("by_name").openCursor(IDBKeyRange.only(pnlname));

    req.onsuccess = function (event) {
      let cursor = event.target.result;

      if (cursor) {
        let entry = cursor.value;
        let i = entry.list.indexOf(oldname);
        entry.list[i] = newname;

        cursor.update(entry);
        addPanel(entry);
        $("#pnl-" + pnlid).show();
      }
    }
  }
}

function panelDeleteBtn(db, evt) {
  let id = $(evt).prop("id").replace(stripid, "$1");
  let pnlid = $(evt).parent().parent().prop("id").replace(stripid, "$1");
  let pnlname = /-/g [Symbol.replace](pnlid, " ");
  let name = /-/g [Symbol.replace](id, " ");

  let store = db.transaction(["account"], "readwrite").objectStore("account");

  if (pnlid === "Trackers") {
    let req = store.index("by_name").openCursor(IDBKeyRange.only(name));

    req.onsuccess = function (event) {
      let cursor = event.target.result;

      if (cursor) {
        cursor.delete();

        $("#pnl-" + pnlid + " #ent-" + id).remove();
        $("#panels #pnl-" + id).remove();
        $("#tablist #tab-" + id).remove();
      }
    }
  } else {
    let req = store.index("by_name").openCursor(IDBKeyRange.only(pnlname));

    req.onsuccess = function (event) {
      let cursor = event.target.result;

      if (cursor) {
        let entry = cursor.value;
        let i = entry.list.indexOf(name);
        entry.list.splice(i, 1);

        cursor.update(entry);

        $("#pnl-" + pnlid + " #ent-" + id).remove();
      }
    }
  }
}

function addSelectedDrugs(evt) {
  let list = [];

  $("#druglist input").find(":checked").each(function () {
    let name = $(this).prop("id").replace(stripid, "$1");
    list.push(name);
  });

  let store = accountdb.transaction(["account"], "readwrite").objectStore("account");
  let remreq = store.index("by_name").openCursor(IDBKeyRange.only("Remedies"));
  remreq.onsuccess = function (event) {
    let cursor = event.target.result;

    if (cursor) {
      let remedies = cursor.value;
      for (let i = 0; i < list.length; ++i)
        if (!remedies.list.includes(list[i]))
          remedies.list.push(list[i]);

      cursor.update(remedies);
    } else {
      let acctreq = store.index("by_name").openCursor(IDBKeyRange.only("Account"));
      acctreq.onsuccess = function (event) {
        let cursor = event.target.result;
        let account = cursor.value;

        let remedies = {
          position: ++account.lastposition,
          name: "Remedies",
          type: "list",
          list: list,
          editable: false,
        };

        store.add(remedies);
        cursor.update(account);

        generateTrackersPanel(accountdb);
        generateTabsAndPanels(accountdb);
        addPanel(remedies);
      };
    }
  };
}

function loadDrugsCom(evt, page) {
  let url = "'http://www.whateverorigin.org/get?url=";

  if (page) {
    page = $("#urldrugscom").val();
    page = page.replace(/.*\/(\S.*)/g, "$1");
  }

  url += encodeURIComponent("https://www.drugs.com/mn/" + page);

  $.getJSON(url + '&callback=?', function (data, status) {})

  loadFile(url, function (data) {
    let t = data.contents.split("<");
    let h = [];

    for (let i = 0; i < t.length; ++i) {
      let start;
      let l = t[i];

      if (l === "h2>Medication List") {
        start = true;
      }
      if (l === "/ul>") {
        start = false;
      }

      if (start && l.search(/^h4>/) != -1) {
        let m = l.replace(/^h4>(.*)/, "$1");
        h.push(m);
      }
    }

    applyMeds(h);
  });
}

function lookupWeather(evt) {
  let city = $("#city").val();
  let state = $("#state").val();
  let country = $("#country").val();
  let tmpFormat = $("[name='temp'] :checked").text();

  let url = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "," + state + "," + country + "&units=" + tmpFormat + "&appid=" + openweatherapikey;

  loadFile(url, function (data) {
    let h = "<div class='row container'>Lon: " + data.coord.lon + " Lat: " + data.coord.lat + "</div>";
    $("#addressinp").after(h);
  });
}

function updateAccount(db) {
  let store = db.transaction(["account"], "readwrite").objectStore("account");
  let req = store.index('by_name').openCursor(IDBKeyRange.only("Account"));

  req.onsuccess = function (event) {
    let cursor = event.target.result;
    let pnl = $("#pnl-Account");

    let account = cursor.value;
    account.ifdefault = pnl.find("#ifdefault").prop("checked");
    account.city = pnl.find("#city").val();
    account.state = pnl.find("#state").val();
    account.country = pnl.find("#country").val();
    account.metric = pnl.find("[name = 'metric'] :checked").prop("id") == "ifmetric";
    account.ifnotify = pnl.find("#ifnotify").prop("checked");
    account.ifemail = pnl.find("#ifemail").prop("checked");
    account.email = pnl.find("#email").val();
    account.ifsms = pnl.find("#ifsms").prop("checked");
    account.phone = pnl.find("#phone").val();
    account.notifylist = [];

    pnl.find("#reminders :checked").each(function () {
      let name = $(this).prop("id").replace(stripid, "$1");
      name = /-/g [Symbol.replace](name, " ");
      account.notifylist.push(name);
    });

    cursor.update(account);
  };
}

function loadAccount(db) {
  let store = db.transaction(["account"], "readwrite").objectStore("account");
  let req = store.index("by_name").get("Account");

  req.onsuccess = function (event) {
    let account = req.result;
    let pnl = $("#pnl-Account");

    pnl.find("#ifdefault").prop("checked", account.ifdefault);
    pnl.find("#city").val(account.city);
    pnl.find("#state").val(account.state);
    pnl.find("#country").val(account.country);
    pnl.find("#ifimperial").prop("checked", !account.metric);
    pnl.find("#ifmetric").prop("checked", account.metric);
    pnl.find("#ifnotify").prop("checked", account.ifnotify);
    pnl.find("#ifemail").prop("checked", account.ifemail);
    pnl.find("#email").val(account.email);
    pnl.find("#ifsms").prop("checked", account.ifsms);
    pnl.find("#phone").val(account.phone);

    pnl.find("[id|=itm]").prop("checked", false);

    for (let i = 0; i < account.notifylist.length; ++i) {
      let id = / /g [Symbol.replace](account.notifylist[i], "-");
      pnl.find("#itm-" + id).prop("checked", true);
    }
  };
}

/************************************************** */

//$(document).ready(function () {

$("#javascript").hide();
$("#jssite").show();

if (!('indexedDB' in window)) {
  console.log('This browser doesn\'t support IndexedDB');
}

let accountreq = indexedDB.open("account", 1);

accountreq.onupgradeneeded = function () {
  doAccountUpgrade(accountreq.result);
};

accountreq.onerror = function (event) {
  doReqError(accountreq.error);
};

accountreq.onsuccess = function () {
  accountdb = accountreq.result;

  generateTrackersPanel(accountdb);
  generateTabsAndPanels(accountdb);

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

  $("#urldrugscom").keydown(function () {
    $("#loaddrugscom").removeClass("disabled");
    pnl.find("#loaddrugscom").removeAttr("disabled");

    if (event.which === 0x0a || event.which === 0x0d)
      loadDrugsCom(this);
  });

  pnl.find("#loaddrugscom").click(function () {
    loadDrugsCom(this);
  });

  pnl.find("#demoloaddrugs").click(function () {
    loadDrugsCom(this, "wx7s49r");
  });

  pnl.find("#useselecteddrugs").click(function () {
    addSelectedDrugs(this);
  });

  pnl.find("#save-acct").click(function () {
    updateAccount(accountdb);
  });
};

//});