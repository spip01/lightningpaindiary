loadHtml("https://raw.githubusercontent.com/spip01/lightningpaindiary/bootstrap/public/navbar.html", "#navbar");
loadHtml("https://raw.githubusercontent.com/spip01/lightningpaindiary/bootstrap/public/footer.html", "#footer");

function generateTrackersPanel(db) {
  const pnlid = "Trackers";
  const name = "Trackers";

  let panel = /idname/g [Symbol.replace](panels, pnlid);
  panel = /ttitle/g [Symbol.replace](panel, name);
  panel = /iftrackers/g [Symbol.replace](panel, "");

  $("#pnl-" + pnlid).remove();
  $("#panels").append(panel);
  let pnl = $("#pnl-" + pnlid);

  $("#pnl-Account #reminders").html("");

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

        if (item.fixed === undefined) {
          const acct_entries =
            `
          <label class="col-lg-2 col-md-3 col-sm-6 col-12">
            <input id="itm-idname" type="checkbox">
            ttitle
          </label>
          `;

          let reminders = /idname/g [Symbol.replace](acct_entries, id);
          reminders = /ttitle/g [Symbol.replace](reminders, item.name);
          $("#pnl-Account #reminders").append(reminders);
        }
      }

      cursor.continue();
    } else {
      const menu_entries = `<li id="item">ttype</li>`;

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
  $("#tablist").empty();

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

  if (pnlid === "Trackers") {
    let pos = $("#cont-Trackers div:last-child").find("[id|='pos']").prop("id").replace(stripid, "$1");
    let entry = {
      position: Number(pos) + 1,
      name: name,
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
    let panel = store.index("by_name").openCursor(IDBKeyRange.only(pnlname));

    panel.onsuccess = function (event) {
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
    let tracker = store.index("by_name").openCursor(IDBKeyRange.only(oldname));

    tracker.onsuccess = function (event) {
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
    let panel = store.index("by_name").openCursor(IDBKeyRange.only(pnlname));

    panel.onsuccess = function (event) {
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
    let tracker = store.index("by_name").openCursor(IDBKeyRange.only(name));

    tracker.onsuccess = function (event) {
      let cursor = event.target.result;

      if (cursor) {
        cursor.delete();

        $("#pnl-" + pnlid + " #ent-" + id).remove();
        $("#panels #pnl-" + id).remove();
        $("#tablist #tab-" + id).remove();
      }
    }
  } else {
    let panel = store.index("by_name").openCursor(IDBKeyRange.only(pnlname));

    panel.onsuccess = function (event) {
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
  let remediesreq = store.index("by_name").openCursor(IDBKeyRange.only("Remedies"));
  remediesreq.onsuccess = function (event) {
    let cursor = event.target.result;

    if (cursor) {
      let remedies = cursor.value;
      for (let i = 0; i < list.length; ++i)
        if (!remedies.list.includes(list[i]))
          remedies.list.push(list[i]);

      cursor.update(remedies);
    } else {
      let pos = $("#cont-Trackers div:last-child").find("div:first").prop("id").replace(stripid, "$1");
      let remedies = {
        position: Number(pos) + 1,
        name: "Remedies",
        type: "list",
        list: list,
        editable: false,
      };

      store.add(remedies);

      generateTrackersPanel(accountdb);
      generateTabsAndPanels(accountdb);
      addPanel(remedies);
    }
  }
}

function loadDrugsCom(evt, page) {
  let url = "'http://www.whateverorigin.org/get?url=";

  if (page === undefined) {
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
  let apikey = "36241d90d27162ebecabf6c334851f16";

  let url = "http://api.openweathermap.org/data/2.5/weather?q=" + city + "," + state + "," + country + "&units=" + tmpFormat + "&appid=" + apikey;

  loadFile(url, function (data) {
    let h = "<div class='row container'>Lon: " + data.coord.lon + " Lat: " + data.coord.lat + "</div>";
    $("#addressinp").after(h);
  });
}

function loadHtml(url, selector) {
  loadFile(url, function (data) {
    let html = data.replace(/(?:.*?\n)*?<body>((?:.*?\n)+?)<\/body>(.*?\n?)*/g, "$1");
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

  //let xhttp = new XMLHttpRequest();
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

function updateAccount(db) {
  let store = db.transaction(["account"], "readwrite").objectStore("account");
  let accountreq = store.index('by_name').openCursor(IDBKeyRange.only("Account"));

  accountreq.onsuccess = function (event) {
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
  let accountreq = store.index("by_name").get("Account");

  accountreq.onsuccess = function (event) {
    let account = accountreq.result;
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

function doAccountUpgrade(db) {
  let store = db.createObjectStore("account", {
    autoIncrement: true
  });

  store.createIndex("by_position", "position", {
    unique: true
  });

  store.createIndex("by_name", "name", {
    unique: true
  });

  let account = {};
  account.name = "Account";
  account.type = "account";
  account.position = 0;
  account.ifdefault = true;
  account.city = "";
  account.state = "";
  account.country = "";
  account.metric = false;
  account.ifnotify = false;
  account.ifemail = false;
  account.email = "";
  account.ifsms = false;
  account.phone = "";
  account.notifylist = [];

  store.put(account);

  for (let i = 0; i < trackerslist.length; ++i) {
    let tracker = trackerslist[i];
    tracker.position = i + 1;

    store.put(tracker);
  }
}

var accountdb;
const stripid = /^.*?-(.*)/g;

$(document).ready(function () {
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
    console.log("error loading account: " + accountreq.error);
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

    pnl.find("#submit-acct").click(function () {
      updateAccount(accountdb);
    });
  };
});