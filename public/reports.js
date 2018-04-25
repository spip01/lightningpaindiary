let setupdb;
let diarydb;
const stripid = /^.*?-(.*)/g;

loadHtml("https://lightningpaindiary.firebaseapp.com/navbar.html", "#navbar");
loadHtml("https://lightningpaindiary.firebaseapp.com/footer.html", "#footer");

$(document).ready(function () {
    $("#javascript").empty();
    $("#jssite").show();

    if (!('indexedDB' in window)) {
        console.log('This browser doesn\'t support IndexedDB');
    }

    let accountreq = indexedDB.open("account", 1);

    accountreq.onupgradeneeded = function () {};

    accountreq.onsuccess = function () {
        accountdb = accountreq.result;

        let diaryreq = indexedDB.open("diary", 1);

        diaryreq.onsuccess = function () {
            diarydb = diaryreq.result;

            selectFields(accountdb, diarydb);

            $("#selectfields :checkbox").click(function () {
                display(accountdb, diarydb);
            });

            $("#selectfields #save").click(function () {
                saveReport(accountdb, $("#savereport #name").val());
            });

            $("#selectfields #cancel").click(function () {
                loadReport(accountdb, $("#selectmenu #report").text());
                display(accountdb, diarydb);
            });

            $("#edit").click(function () {
                editSel(accountdb);
            });
        };
    };

    $("#selectfields #show").click(function () {
        if ($(this).prop("checked")) {
            $("#selectfields [id|='row']").show();
            $("#selectfields #savereport").show();
        } else {
            $("#selectfields [id|='row']").hide();
            $("#selectfields #savereport").hide();
        }
    });

});

function display(accountdb, diarydb) {
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
            req = store.index('by_datetime').openCursor();
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

function selectFields(accountdb, diarydb) {
    const row = `<div id="row-idname" class="row border-bottom" style="display: none"></div>`;
    const cont = `<div id="cont-idname" class="col-lg-10 col-md-9 col-sm-9 col-6"></div>`;
    const entry =
        `<label class="col-lg-2 col-md-3 col-sm-3 col-6">
            <input id="pnt-idname" type="checkbox" checked>ttitle
        </label>
        `;
    const sub =
        `<label class="col-lg-2 col-md-3 col-sm-5 col-12">
            <input id="sub-idname--subname" type="checkbox" checked>ttitle
        </label>
        `;
    const menu = `<li id="item">ttype</li>`;

    let lastReport = "all on";
    let mnu = /ttype/g [Symbol.replace](menu, lastReport);
    $("#selectmenu [id|='list']").append(mnu);

    let store = accountdb.transaction(["account"], "readwrite").objectStore("account");
    let req = store.index('by_position').openCursor();
    req.onsuccess = function (event) {
        let cursor = event.target.result;

        if (cursor) {
            let item = cursor.value;
            let name = item.name;

            switch (item.type) {
                case "account":
                    lastReport = item.lastreport;
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

                    $("#savereport").before(h);

                    h = /idname/g [Symbol.replace](entry, id);
                    h = /ttitle/g [Symbol.replace](h, name);

                    let sel = $("#selectfields #row-" + id);
                    sel.append(h);

                    if (item.type === "weather" || item.type === "list") {
                        h = /idname/g [Symbol.replace](cont, id);
                        sel.append(h);
                        sel.find("#cont-" + id).addClass("container");

                        for (let i = 0; i < item.list.length; ++i) {
                            let name = item.list[i];
                            let iid = / /g [Symbol.replace](name, "-");

                            h = /idname/g [Symbol.replace](sub, id);
                            h = /subname/g [Symbol.replace](h, iid);
                            h = /ttitle/g [Symbol.replace](h, name);

                            sel.find("#cont-" + id).append(h);
                        }

                        if (item.type === "list") {
                            h = /idname/g [Symbol.replace](sub, id);
                            h = /subname/g [Symbol.replace](h, "all-others");
                            h = /ttitle/g [Symbol.replace](h, "all others");

                            sel.find("#cont-" + id).append(h);
                        }
                    }
            }

            cursor.continue();
        } else {
            $("#selectmenu [id|='item']").off();
            $("#selectmenu [id|='item']").click(function () {
                selectReport(accountdb, diarydb, $(this).text());
            });

            $("#selectfields [id|='pnt']").off();
            $("#selectfields [id|='pnt']").click(function () {
                display(accountdb, diarydb);
            });

            $("#selectfields [id|='sub']").off();
            $("#selectfields [id|='sub']").click(function () {
                display(accountdb, diarydb);
            });

            loadReport(accountdb, diarydb, lastReport);
        }
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

        loadReport(accountdb, diarydb, report);
    };
}

function loadReport(accountdb, diarydb, reportname) {
    let sel = $("#selectfields");

    if (reportname === "all on") {
        sel.find("[id|='pnt']").prop("checked", "true");
        sel.find("[id|='sub']").prop("checked", "true");
        display(accountdb, diarydb);
    } else {
        sel.find("[id|='pnt']").removeAttr("checked");
        sel.find("[id|='sub']").removeAttr("checked");

        let store = accountdb.transaction(["account"], "readwrite").objectStore("account");
        let req = store.index("by_name").get(IDBKeyRange.only(reportname));

        req.onsuccess = function (event) {
            let account = req.result;

            for (let i = 0; i < account.list.length; ++i) {
                let name = account.list[i];
                let id = / /g [Symbol.replace](name, "-");

                sel.find("#pnt-" + id).prop("checked", "true");

                if (account[name] !== undefined) {
                    for (let j = 0; j < account[name].length; ++j) {
                        let lid = / /g [Symbol.replace](account[name][j], "-");

                        sel.find("#sub-" + id + "--" + lid).prop("checked", "true");
                    }
                }
            }

            display(accountdb, diarydb);
        };
    }
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
            if (show[parent] === undefined)
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


/************************************** */

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

Date.prototype.toDateLocalTimeString =
    function () {
        let date = this;
        let ten = function (i) {
            return i < 10 ? '0' + i : i;
        }
        return date.getFullYear() +
            "-" + ten(date.getMonth() + 1) +
            "-" + ten(date.getDate()) +
            "T" + ten(date.getHours()) +
            ":" + ten(date.getMinutes());
    }

Date.prototype.toLocalTimeString =
    function () {
        let date = this;
        let ten = function (i) {
            return i < 10 ? '0' + i : i;
        }
        return ten(date.getHours()) +
            ":" + ten(date.getMinutes());
    }

Date.prototype.toDateString =
    function () {
        let date = this;
        let ten = function (i) {
            return i < 10 ? '0' + i : i;
        }
        return date.getFullYear() +
            "-" + ten(date.getMonth() + 1) +
            "-" + ten(date.getDate());
    }