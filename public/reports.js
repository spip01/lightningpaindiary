function display(accountdb, diarydb, startdate) {
    const row =
        `<div id="row-idname" class="row" style="font-size: 15px; border-bottom: 1px solid #008000;">
            <div class="col-md-2 col-sm-2 col-3 border-right">
                <div id="date"></div>
                <div id="time"></div>
                <input id="sel-idname" class="radio-inline" type="radio" name="selected">
            </div>
            <div id="rem" class="container row col-md-10 col-sm-10 col-9"></div>
        </div>
        `;
    const entry = `<div id="ent-idname" class="col-md-2 col-sm-4 col-6 border-right border-bottom">dvalue</div>`;
    const mult = `<div id="mult">dvalue</div>`;

    let account = [];
    let h = /idname/g [Symbol.replace](row, "header");
    let pnl = $("#panels");
    pnl.empty();
    pnl.append(h);
    let header = pnl.find("#row-header");

    let store = accountdb.transaction(["account"], "readwrite").objectStore("account");
    let req = store.index('by_position').openCursor();
    req.onsuccess = function (event) {
        let cursor = event.target.result;

        if (cursor) {
            let item = cursor.value;
            let name = item.name;
            item.id = / /g [Symbol.replace](name, "-");

            switch (item.type) {
                case "account":
                case "reports":
                case "text":
                    item.id = null;
                    break;
                case "date":
                    if (item.name === "Date") {
                        header.children().find("#date").text("Date & Time");
                        header.children().find("#sel-header").remove();
                        break;
                    }
                case "time":
                    if (item.name === "Time") {
                        item.id = null;
                        break;
                    }
                case "blood pressure":
                    name = "Blood Pressure & Pulse";
                default:
                    if ($("#pnt-" + item.id).prop("checked")) {
                        let h = /dvalue/g [Symbol.replace](entry, name);
                        header.find("#rem").append(h);
                    } else
                        item.id = null;
            }

            if (item.id)
                account.push(item);

            cursor.continue();
        } else {
            store = diarydb.transaction(["diary"], "readwrite").objectStore("diary");
            req = store.index('by_datetime').openCursor(IDBKeyRange.lowerBound(startdate ? startdate : 0));
            req.onsuccess = function (event) {
                let cursor = event.target.result;

                if (cursor) {
                    let diary = cursor.value;

                    let id = /:/g [Symbol.replace](diary.DateTime, "--");
                    id = /\./g [Symbol.replace](id, "---");

                    let h = /idname/g [Symbol.replace](row, id);
                    pnl.append(h);
                    let header = pnl.find("#row-" + id);

                    for (let i = 0; i < account.length; ++i) {
                        let item = account[i];
                        let txt = diary[item.name];

                        if (item.id) {
                            switch (item.type) {
                                case "date":
                                    if (item.name === "Date") {
                                        header.children().find("#date").text(diary.Date);
                                        header.children().find("#time").text(diary.Time);
                                    } else {
                                        h = /dvalue/g [Symbol.replace](entry, txt ? "" : "n/a");
                                        h = /idname/g [Symbol.replace](h, item.id);
                                        header.find("#rem").append(h);
                                    }
                                    break;
                                case "weather":
                                    h = /dvalue/g [Symbol.replace](entry, txt ? "" : "n/a");
                                    h = /idname/g [Symbol.replace](h, item.id);
                                    header.find("#rem").append(h);

                                    for (let i = 0; txt && i < item.list.length; ++i) {
                                        let name = item.list[i];

                                        let lid = / /g [Symbol.replace](name, "-");;
                                        if ($("#sub-" + item.id + "--" + lid).prop("checked")) {
                                            let txt = name + ": " + diary[item.name][name];

                                            h = /dvalue/g [Symbol.replace](mult, txt);
                                            header.find("#rem #ent-" + item.id).append(h);
                                        }
                                    }
                                    break;
                                case "list":
                                    h = /dvalue/g [Symbol.replace](entry, txt ? "" : "n/a");
                                    h = /idname/g [Symbol.replace](h, item.id);
                                    header.find("#rem").append(h);

                                    for (let i = 0; txt && i < diary[item.name].length; ++i) {
                                        let name = diary[item.name][i];
                                        let lid = / /g [Symbol.replace](name, "-");;

                                        if ($("#sub-" + item.id + "--" + lid).prop("checked") ||
                                            $("#sub-" + item.id + "--all-others").prop("checked") &&
                                            item.list.indexOf(name) == -1) {

                                            h = /dvalue/g [Symbol.replace](mult, name);
                                            header.find("#rem #ent-" + item.id).append(h);
                                        }
                                    }
                                    break;
                                case "blood pressure":
                                    txt = txt ? diary[item.name].high + " / " + diary[item.name].low + " " + diary[item.name].pulse : "n/a";
                                default:
                                    h = /dvalue/g [Symbol.replace](entry, txt ? txt : "n/a");
                                    h = /idname/g [Symbol.replace](h, item.id);
                                    header.find("#rem").append(h);
                            }
                        }
                    }

                    cursor.continue();
                } else {
                    $("[name='selected']").off();
                    $("[name='selected']").click(function () {
                        $("#edit").removeClass("disabled");
                        $("#edit").removeAttr("disabled");
                        $("#delete").removeClass("disabled");
                        $("#delete").removeAttr("disabled");
                    });
                }
            };
        }
    };
}

function editSel(accountdb) {
    let sel = $("#panels :checked");
    let edit = sel.prop("id");
    edit = edit.replace(/\S*?-(.*)/g, "$1");
    edit = /---/g [Symbol.replace](edit, ".");
    edit = /--/g [Symbol.replace](edit, ":");

    let store = accountdb.transaction(["account"], "readwrite").objectStore("account");
    let req = store.index('by_name').openCursor(IDBKeyRange.only("Account"));
    req.onsuccess = function (event) {
        let cursor = event.target.result;
        let account = cursor.value;

        account.lastedit = edit;
        cursor.update(account);

        window.location.assign("index.html")
    };
}

function deleteSel(accountdb, diarydb) {
    let sel = $("#panels :checked");
    let del = sel.prop("id");
    del = del.replace(/\S*?-(.*)/g, "$1");
    del = /---/g [Symbol.replace](del, ".");
    del = /--/g [Symbol.replace](del, ":");

    let store = diarydb.transaction(["diary"], "readwrite").objectStore("diary");
    let req = store.index('by_datetime').openCursor(IDBKeyRange.only(del));
    req.onsuccess = function (event) {
        let cursor = event.target.result;

        cursor.delete();
        display(accountdb, diarydb);
    };
}

function selectFields(accountdb, diarydb, reportname) {
    const row = `<div id="row-idname" class="row border-bottom"></div>`;
    const cont = `<div id="cont-idname" class="col-lg-10 col-md-9 col-sm-9 col-6"></div>`;
    const entry =
        `<label class="col-lg-2 col-md-3 col-sm-3 col-6">
            <input id="pnt-idname" type="checkbox" ifchecked> ttitle
        </label>
        `;
    const sub =
        `<label class="col-lg-2 col-md-3 col-sm-5 col-12">
            <input id="sub-idname--subname" type="checkbox" ifchecked> ttitle
        </label>
        `;
    const menu = `<button id="item" class="dropdown-item" type="button" style="cursor: pointer">ttype</button>`;

    $("#selectmenu [id|='list']").empty();
    $("#selectmenu #report").text(reportname);
    let mnu = /ttype/g [Symbol.replace](menu, "all on");
    $("#selectmenu [id|='list']").append(mnu);

    let fld = $("#fields");
    fld.empty();

    let store = accountdb.transaction(["account"], "readwrite").objectStore("account");
    let req = store.index("by_name").openCursor(IDBKeyRange.only(reportname));
    req.onsuccess = function (event) {
        let cursor = event.target.result;
        let report = {};
        report.list = [];

        if (cursor)
            report = cursor.value;

        let store = accountdb.transaction(["account"], "readwrite").objectStore("account");
        let req = store.index('by_position').openCursor();
        req.onsuccess = function (event) {
            let cursor = event.target.result;

            if (cursor) {
                let item = cursor.value;
                let name = item.name;

                switch (item.type) {
                    case "account":
                        break;
                    case "report":
                        let mnu = /ttype/g [Symbol.replace](menu, item.name);
                        $("#selectmenu [id|='list']").append(mnu);
                        break;
                    case "text":
                        break;
                    case "date":
                        if (name === "Date")
                            break;
                    case "time":
                        if (name === "Time")
                            break;
                    default:
                        let id = / /g [Symbol.replace](name, "-");
                        let h = /idname/g [Symbol.replace](row, id);

                        fld.append(h);

                        h = /idname/g [Symbol.replace](entry, id);
                        h = /ttitle/g [Symbol.replace](h, name);
                        h = /ifchecked/g [Symbol.replace](h, reportname == "all on" || report.list.indexOf(name) != -1 ? "checked" : "");

                        let sel = fld.find("#row-" + id);
                        sel.append(h);

                        if (item.type === "weather" || item.type === "list") {
                            h = /idname/g [Symbol.replace](cont, id);
                            sel.append(h);
                            sel.find("#cont-" + id).addClass("container");

                            for (let i = 0; i < item.list.length; ++i) {
                                let iname = item.list[i];
                                let iid = / /g [Symbol.replace](iname, "-");

                                h = /idname/g [Symbol.replace](sub, id);
                                h = /subname/g [Symbol.replace](h, iid);
                                h = /ttitle/g [Symbol.replace](h, iname);
                                h = /ifchecked/g [Symbol.replace](h, reportname == "all on" || report[name] && report[name].indexOf(iname) != -1 ? "checked" : "");

                                sel.find("#cont-" + id).append(h);
                            }

                            if (item.type === "list") {
                                h = /idname/g [Symbol.replace](sub, id);
                                h = /subname/g [Symbol.replace](h, "all-others");
                                h = /ttitle/g [Symbol.replace](h, "all others");
                                h = /ifchecked/g [Symbol.replace](h, reportname == "all on" || report[name] && report[name].indexOf("all others") != -1 ? "checked" : "");

                                sel.find("#cont-" + id).append(h);
                            }
                        }
                }

                cursor.continue();
            } else {
                $("#selectmenu [id|='item']").click(function () {
                    selectReport(accountdb, diarydb, $(this).text());
                });

                fld.find("[id|='pnt']").click(function () {
                    display(accountdb, diarydb);
                });

                fld.find("[id|='sub']").click(function () {
                    display(accountdb, diarydb);
                });

                display(accountdb, diarydb);
            }
        };
    };
}

function selectReport(accountdb, diarydb, report) {
    $("#report").text(report);

    let store = accountdb.transaction(["account"], "readwrite").objectStore("account");
    let req = store.index('by_name').openCursor(IDBKeyRange.only("Account"));
    req.onsuccess = function (event) {
        let cursor = event.target.result;

        let account = cursor.value;

        account.lastreport = report;
        cursor.update(account);

        selectFields(accountdb, diarydb, report);
    };
}

function saveReport(accountdb, reportname) {
    const menu = `<li id="item">ttype</li>`;

    let show = {};

    show.name = reportname;
    show.type = "report";
    show.list = [];

    $("#selectfields [id|='row']").find(":checked").each(function () {
        let id = $(this).prop("id");
        let type = id.replace(/(\S+?)-.*/g, "$1");
        id = id.replace(/\S+?-(.*)/g, "$1");

        let parent = type === "pnt" ? id : id.replace(/(\S+?)--.*/g, "$1");
        parent = /-/g [Symbol.replace](parent, " ");

        let sub = type === "pnt" ? null : id.replace(/\S+?--(.*)/g, "$1");
        sub = /-/g [Symbol.replace](sub, " ");

        if (type === "pnt") {
            show.list.push(parent);
        } else {
            if (!show[parent])
                show[parent] = [];
            show[parent].push(sub);
        }
    });

    store = accountdb.transaction(["account"], "readwrite").objectStore("account");
    req = store.index('by_name').openCursor(IDBKeyRange.only("Account"));
    req.onsuccess = function (event) {
        let cursor = event.target.result;

        let account = cursor.value;
        account.lastreport = reportname;

        let rptreq = store.index('by_name').openCursor(IDBKeyRange.only(show.name));
        rptreq.onsuccess = function (event) {
            let rptcursor = event.target.result;

            if (rptcursor)
                rptcursor.update(show);
            else {
                show.position = ++account.lastposition;
                store.add(show);

                let mnu = /ttype/g [Symbol.replace](menu, show.name);
                $("#selectmenu [id|='list']").append(mnu);

                $("#selectmenu [id|='item']").off();
                $("#selectmenu [id|='item']").click(function () {
                    selectReport(accountdb, diarydb, $(this).text());
                });
            }

            cursor.update(account);
        };
    };
}

/*********************************** */

//$(document).ready(function () {
$("#javascript").empty();
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

    let diaryreq = indexedDB.open("diary", 1);

    diaryreq.onerror = function () {
        doReqError(diaryreq.error);
    };

    diaryreq.onsuccess = function () {
        diarydb = diaryreq.result;

        let store = accountdb.transaction(["account"], "readwrite").objectStore("account");
        let req = store.index("by_name").get(IDBKeyRange.only("Account"));

        req.onsuccess = function (event) {
            let account = req.result;

            selectFields(accountdb, diarydb, account.lastreport);
        };

        $("#selectfields :checkbox").click(function () {
            display(accountdb, diarydb);
        });

        $("#selectfields #save").click(function () {
            saveReport(accountdb, $("#savereport #name").val());
        });

        $("#selectfields #cancel").click(function () {
            selectFields(accountdb, diarydb, $("#selectmenu #report").text());
        });

        $("#edit").click(function () {
            editSel(accountdb);
        });

        $("#delete").click(function () {
            deleteSel(accountdb, diarydb);
        });
    };
};

$("#selectfields #show").click(function () {
    if ($(this).prop("checked")) {
        $("#fields").show();
        $("#savereport").show();
    } else {
        $("#fields").hide();
        $("#savereport").hide();
    }
});

$("#search").click(function (event) {
    display(accountdb, diarydb, $(this).val());
});

//});