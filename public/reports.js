'use strict';

lightningPainDiary.prototype.doLoggedout = function () {
    $("#panels").empty();
    $("#select").hide();
    $("#select #fields").empty();
    $("#filter").hide();
    $("#filter #fields").empty();
}

lightningPainDiary.prototype.doTrackerDisplay = function () {
    lpd.doReportlistRead(lpd.doReportMenuDisplay);
    lpd.doReportDisplay();
}

lightningPainDiary.prototype.doReportDisplay = function () {
    lpd.selectDisplay();
    lpd.filterDisplay();
    lpd.headerDisplay();
    lpd.doDiaryRead(lpd.diaryEntryDisplay, lpd.doReportUpdate);
}

lightningPainDiary.prototype.doReportUpdate = function () {
    lpd.setSelect();
    lpd.setFilter();
    lpd.diarySelectDisplay();
    lpd.diaryFilterDisplay();
}

const row =
    `<div id="row-idname" class="row" style="border-bottom: 1px solid #008000;">
        <div class="col-print-2 col-lg-2 col-md-2 col-sm-2 col-3 border-right border-bottom">
            <div id="date"></div>
            <div id="time"></div>
            <input id="sel-idname" class="radio-inline noprint" type="radio" name="selected">
        </div> 
        <div id="data" class="container row col-print-12 col-lg-12 col-md-12 col-sm-12 col-11"></div>
    </div>`;

const entry = `<div id="ent-idname" class="col-print-2 col-lg-2 col-md-2 col-sm-2 col-7 border-right border-bottom">dvalue</div>`;

lightningPainDiary.prototype.headerDisplay = function () {

    let pnl = $("#panels");
    pnl.empty();

    let h = /idname/g [Symbol.replace](row, "header");
    pnl.append(h);
    pnl.find("#sel-header").hide();
    pnl = pnl.find("#row-header #data");

    for (let i = 0; i < lpd.trackerlist.length; ++i) {
        let item = lpd.trackerlist[i];
        let name = item.name;
        let id = / /g [Symbol.replace](name, "-");

        switch (item.type) {
            case "blood pressure":
                name = "Blood Pressure & Pulse";
            case "date":
                if (item.name === "Date") {
                    $("#row-header #date").text("Date & Time");
                    break;
                }
            case "time":
                if (item.name === "Time")
                    break;
            default:
                let h = /dvalue/g [Symbol.replace](entry, name);
                h = /idname/g [Symbol.replace](h, id);
                pnl.append(h);
        }
    }
}

lightningPainDiary.prototype.diaryEntryDisplay = function (diary) {
    const mult = `<div id="sub-idname">dvalue</div>`;
    const img = '<img id="sub-idname" src="https://openweathermap.org/img/w/iicon.png" height="15" width="15">';

    let id = lpd.getDiaryKey(diary.Date, diary.Time);

    let h = /idname/g [Symbol.replace](row, id);
    let pnl = $("#panels");
    pnl.append(h);
    pnl = pnl.find("#row-" + id + " #data");

    for (let i = 0; i < lpd.trackerlist.length; ++i) {
        let item = lpd.trackerlist[i];
        let name = item.name;
        let iid = / /g [Symbol.replace](name, "-");
        let txt = diary[item.name];

        switch (item.type) {
            case "blood pressure":
                txt = !diary[item.name] || diary[item.name].high === 0 ? "" : diary[item.name].high + " / " + diary[item.name].low + " " + diary[item.name].pulse;
                break;

            case "date":
                if (item.name === "Date") {
                    $("#row-" + id + " #date").text(diary.Date);
                    $("#row-" + id + " #time").text(diary.Time);
                    txt = "";
                }
                break;

            case "time":
                if (item.name === "Time")
                    txt = "";
                break;

            case "weather":
            case "list":
                txt = "";
                break;
        }

        h = /dvalue/g [Symbol.replace](entry, !txt ? "" : txt);
        h = /idname/g [Symbol.replace](h, iid);
        pnl.append(h);

        let ent = pnl.find("#ent-" + iid);

        if (diary[item.name])
            switch (item.type) {
                case "weather":
                    for (let [name, val] of Object.entries(diary[item.name])) {
                        if (val !== "") {
                            let lid = / /g [Symbol.replace](name, "-");

                            if (name === "icon") {
                                h = /iicon/g [Symbol.replace](img, val);
                                h = /idname/g [Symbol.replace](h, lid);
                                ent.append(h);
                            } else {
                                let txt = name + ": " + val;

                                h = /dvalue/g [Symbol.replace](mult, txt);
                                h = /idname/g [Symbol.replace](h, lid);
                                ent.append(h);
                            }
                        }
                    }
                    break;

                case "list":
                    for (let i = 0; i < diary[item.name].length; ++i) {
                        let name = diary[item.name][i];
                        let lid = / /g [Symbol.replace](name, "-");

                        h = /dvalue/g [Symbol.replace](mult, name);
                        h = /idname/g [Symbol.replace](h, lid);
                        ent.append(h);
                    }
                    break;
            }
    }

    $("#panels [name='selected']").click(function () {
        $("#edit").removeClass("disabled");
        $("#edit").removeAttr("disabled");
        $("#delete").removeClass("disabled");
        $("#delete").removeAttr("disabled");
    });
}

lightningPainDiary.prototype.selectDisplay = function () {
    const row = `<div id="row-idname" class="row border-bottom"></div>`;
    const entry = `<label class="col-lg-2 col-md-3 col-sm-4 col-6">
            <input id="ent-idname" type="checkbox"> ttitle
        </label>
        `;
    const cntnr = `<div id="cont-idname" class="col-lg-12 col-md-11 col-sm-10 col-8 container"></div>`;
    const sub = `<label class="col-lg-2 col-md-3 col-sm-4 col-14">
            <input id="sub-sname" type="checkbox"> ttitle
        </label>
        `;

    let fld = $("#select #fields");
    fld.empty();

    for (let i = 0; i < lpd.trackerlist.length; ++i) {
        let item = lpd.trackerlist[i];
        let name = item.name;

        switch (item.type) {
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

                let sel = fld.find("#row-" + id);
                sel.append(h);

                if (item.type === "weather" || item.type === "list") {
                    h = /idname/g [Symbol.replace](cntnr, id);
                    sel.append(h);
                    let cont = sel.find("#cont-" + id);

                    for (let i = 0; i < item.list.length; ++i) {
                        let iname = item.list[i];
                        let iid = / /g [Symbol.replace](iname, "-");

                        h = /sname/g [Symbol.replace](sub, iid);
                        h = /ttitle/g [Symbol.replace](h, iname);

                        cont.append(h);
                    }

                    if (item.type === "list") {
                        h = /sname/g [Symbol.replace](sub, "all-others");
                        h = /ttitle/g [Symbol.replace](h, "all others");

                        cont.append(h);
                    }
                }
        }
    }

    fld.find(":checkbox").click(function () {
        if ($(this).prop("checked"))
            $("#panels #" + $(this).prop("id")).show();
        else
            $("#panels #" + $(this).prop("id")).hide();
    });
}

lightningPainDiary.prototype.setSelect = function () {
    $("#select :checkbox").prop("checked", false);

    for (let i = 0; i < lpd.report.select.length; ++i) {
        let item = lpd.report.select[i];
        let name = item.name;
        let id = / /g [Symbol.replace](name, "-");
        let sel = $("#select #row-" + id);

        switch (item.type) {
            case "date":
                if (name === "Date")
                    break;
            case "time":
                if (name === "Time")
                    break;
            default:
                sel.find("#ent-" + id).prop("checked", true);

                if (item.list)
                    for (let i = 0; i < item.list.length; ++i) {
                        let iid = / /g [Symbol.replace](item.list[i], "-");

                        sel.find("#cont-" + id + " #sub-" + iid).prop("checked", true);
                    }
        }
    }
}

lightningPainDiary.prototype.extractSelect = function () {
    let report = [];

    for (let i = 0; i < lpd.trackerlist.length; ++i) {
        let list = lpd.trackerlist[i];
        let name = list.name;

        switch (list.type) {
            case "date":
                if (name === "Date")
                    break;
            case "time":
                if (name === "Time")
                    break;
            default:
                let id = / /g [Symbol.replace](name, "-");

                let row = $("#select #row-" + id);
                let sel = row.find("#ent-" + id).prop("checked");

                if (sel) {
                    let item = {};
                    item.name = name;

                    if (list.type === "weather" || list.type === "list") {
                        item.list = [];
                        let cont = row.find("#cont-" + id);

                        for (let i = 0; i < list.list.length; ++i) {
                            let iname = list.list[i];
                            let iid = / /g [Symbol.replace](iname, "-");

                            if (cont.find("#sub-" + iid).prop("checked"))
                                item.list.push(iid);
                        }

                        if (list.type === "list" && row.find("#sub-all-others").prop("checked"))
                            item.list.push("all-others");
                    }

                    report.push(item);
                }
        }
    }

    return (report);
}

lightningPainDiary.prototype.diarySelectDisplay = function () {
    $("#panels [id|='ent']").hide();
    $("#panels [id|='sub']").hide();

    $("#fields :checked").each(function () {
        $("#panels #" + $(this).prop("id")).show();
    })
}

lightningPainDiary.prototype.doReportMenuDisplay = function () {
    const menu = `<button id="item" class="dropdown-item" type="button" style="cursor: pointer">ttype</button>`;

    let list = $("#menu #list");
    list.empty();
    $("#report-save #report-btn").text("all on");

    let mnu = /ttype/g [Symbol.replace](menu, "all on");
    list.append(mnu);

    for (let i = 0; i < lpd.reportlist.length; ++i) {
        let mnu = /ttype/g [Symbol.replace](menu, lpd.reportlist[i]);
        list.append(mnu);
    }

    list.find("button").click(function () {
        let name = $(this).text();
        $("#report-save #report-btn").text(name);

        lpd.doReportRead(name, lpd.doReportUpdate);
    });
}

lightningPainDiary.prototype.editSel = function () {
    let sel = $("#panels :checked");
    let edit = sel.prop("id");
    let datekey = edit.replace(stripid, "$1");

    lpd.account.lastdiaryupdate = datekey;
    lpd.doAccountWrite();

    window.location.assign("index.html")
}

lightningPainDiary.prototype.deleteSel = function () {
    let sel = $("#panels :checked");
    let del = sel.prop("id");
    let datekey = del.replace(stripid, "$1");

    lpd.doDiaryEntryDelete(datekey);
    lpd.doReportDisplay();
}

lightningPainDiary.prototype.filterDisplay = function () {
    const row = `<div id="row-idname" class="row border-bottom"></div>`;
    const entry = `<div class="col-lg-2 col-md-3 col-sm-4 col-6">ttitle</div>`;
    const input = `<label class="container col-14">
            <input id="ent-idname" type="text" class="rounded col-2">&nbsp;ttitle
        </label>
        `;
    const date = `<div class="row container">
            <label class="col-lg-5 col-md-5 col-sm-7 col-14">
                <input id="ent-start-idname" type="date" class="rounded col-9">&nbsp;Start ttitle&nbsp;
            </label>
            <label class="col-lg-5 col-md-5 col-sm-7 col-14">
                <input id="ent-end-idname" type="date" class="rounded col-9">&nbsp;End ttitle
            </label>
        </div>`;
    const cntnr = `<div id="cont-idname" class="col-lg-12 col-md-11 col-sm-10 col-8 container"></div>`;
    const sub = `<label class="col-lg-2 col-md-3 col-sm-4 col-14">
            <input id="sub-sname" type="checkbox">&nbsp;ttitle
        </label>
        `;

    let fld = $("#filter #fields");
    fld.empty();

    for (let i = 0; i < lpd.trackerlist.length; ++i) {
        let item = lpd.trackerlist[i];
        let r = null;

        switch (item.type) {
            case "date":
                if (item.name === "Date")
                    r = date;
                break;
            case "range":
                r = input;
                break;
            case "list":
                r = entry;
                break;
        }

        let name = item.name;
        let id = / /g [Symbol.replace](name, "-");

        if (r) {
            let h = /idname/g [Symbol.replace](row, id);
            fld.append(h);

            h = /idname/g [Symbol.replace](r, id);
            h = /ttitle/g [Symbol.replace](h, name);

            fld.find("#row-" + id).append(h);
        }

        if (item.type === "list") {
            let h = /idname/g [Symbol.replace](cntnr, id);
            fld.find("#row-" + id).append(h);
            let cont = fld.find("#row-" + id + " #cont-" + id);

            for (let i = 0; i < item.list.length; ++i) {
                let iname = item.list[i];
                let iid = / /g [Symbol.replace](iname, "-");

                let h = /sname/g [Symbol.replace](sub, iid);
                h = /ttitle/g [Symbol.replace](h, iname);

                cont.append(h);
            }
        }
    }

    fld.find(":checkbox").click(function () {
        lpd.report.filter = lpd.extractFilter();
        lpd.diaryFilterDisplay();
    });

    fld.find("[type='date']").focusout(function () {
        lpd.report.filter = lpd.extractFilter();
        lpd.diaryFilterDisplay();
    });

    fld.find(":text").focusout(function () {
        lpd.report.filter = lpd.extractFilter();
        lpd.diaryFilterDisplay();
    });
}

lightningPainDiary.prototype.extractFilter = function () {
    let filter = {};

    for (let i = 0; i < lpd.trackerlist.length; ++i) {
        let list = lpd.trackerlist[i];
        let name = list.name;
        let id = / /g [Symbol.replace](name, "-");

        let row = $("#filter #row-" + id);

        switch (list.type) {
            case "date":
                filter[name] = {};
                filter[name].type = list.type;
                filter[name].start = lpd.getDiaryKey(row.find("#ent-start-" + id).val());
                filter[name].end = lpd.getDiaryKey(row.find("#ent-end-" + id).val());
                break;
            case "range":
                filter[name] = {};
                filter[name].type = list.type;
                filter[name].val = row.find("#ent-" + id).val();
                break;
            case "list":
                filter[name] = {};
                filter[name].type = list.type;
                filter[name].list = [];
                row.find(":checked").each(function () {
                    let lname = /-/g [Symbol.replace]($(this).prop("id").replace(stripid, "$1"), " ");
                    filter[name].list.push(lname);
                });
                break;
        }
    }

    return (filter);
}

lightningPainDiary.prototype.setFilter = function () {
    $("#filter :checkbox").prop("checked", false);

    for (let [name, val] of Object.entries(lpd.report.filter)) {
        let id = / /g [Symbol.replace](name, "-");
        let row = $("#filter #row-" + id);

        switch (val.type) {
            case "date":
                let start = val.start === "T"?"":val.start.replace(/([0-9]{4})([0-9]{2})([0-9]{2})T/g, "$1-$2-$3");
                let end = val.end === "T"?"":val.end.replace(/([0-9]{4})([0-9]{2})([0-9]{2})T/g, "$1-$2-$3");
                row.find("#ent-start-" + id).val(start);
                row.find("#ent-end-" + id).val(end);
                break;
            case "range":
                row.find("#ent-" + id).val(val.val);
                break;
            case "list":
                if (val.list)
                    for (let i = 0; i < val.list.length; ++i) {
                        let iid = / /g [Symbol.replace](val.list[i], "-");

                        row.find("#cont-" + id + " #sub-" + iid).prop("checked", true);
                    }
                break;
        }
    }
}

lightningPainDiary.prototype.diaryFilterDisplay = function () {
    let row = $("#panels [id|='row']");

    let filter = lpd.report.filter;

    row.each(function () {
        let id = $(this).prop("id").replace(stripid, "$1");
        $(this).show();

        if (id !== "header")
            for (let [name, val] of Object.entries(filter)) {
                let nid = / /g [Symbol.replace](name, "-");
                let found = false;

                switch (val.type) {
                    case "date":
                        let start = filter.Date.start != "T" ? filter.Date.start : null;
                        let end = filter.Date.end != "T" ? filter.Date.end : null;
                        if (start && id < start || end && id > end) {
                            $(this).hide();
                            found = true;
                        }
                        break;
                    case "range":
                        if (val.val > 0 && $(this).find("#ent-" + nid).text() < val.val) {
                            $(this).hide();
                            found = true;
                        }
                        break;
                    case "list":
                        if (val.list) {
                            let ent = $(this).find("#ent-" + nid);

                            for (let i = 0; i < val.list.length; ++i) {
                                let lid = / /g [Symbol.replace](val.list[i], "-");
                                let cont = ent.find("#sub-" + lid);
                                if (cont.length===0) {
                                    $(this).hide();
                                    found = true;
                                }
                            }
                        }
                        break;
                }

                if (found) {
                    break;
                }
            }
    });
}

lightningPainDiary.prototype.initReport = function () {
    lpd.report = {};
    lpd.report.select = [];
    lpd.report.filter = {};

    for (let i = 0; i < lpd.trackerlist.length; ++i) {
        lpd.report.select.push(lpd.trackerlist[i]);
        if (lpd.report.select[i].type === "list")
            lpd.report.select[i].list.push("all others");
    }
}

/*********************************** */

$(document).ready(function () {
    startUp();

    $("#report-save #save-btn").click(function () {
        let name = $("#report-save #name").val();
        $("#report-save #report-btn").text(name);

        const menu = `<button id="item" class="dropdown-item" type="button" style="cursor: pointer">ttype</button>`;

        let mnu = /ttype/g [Symbol.replace](menu, name);
        $("#menu [id|='list']").append(mnu);

        lpd.report = {};
        lpd.report.select = lpd.extractSelect();
        lpd.report.filter = lpd.extractFilter();

        lpd.doReportWrite(name);
    });

    $("#report-save #cancel-btn").click(function () {
        lpd.doReportRead($("#report-save #report-btn").text(), lpd.doReportUpdate);
    });

    $("#report-save #delete-btn").click(function () {
        let name = $("#report #name").val();
        lpd.doReportDelete(name);
        $("#menu #list").find(":contains(" + name + ")").remove();
    });

    $("#edit-row #edit-btn").click(function () {
        lpd.editSel();
    });

    $("#edit-row #delete-btn").click(function () {
        lpd.deleteSel();
    });

    $("#report-header #show-select").click(function () {
        if ($(this).prop("checked")) {
            $("#select").show();
            $("#report-save").show();
        } else {
            $("#select").hide();
            if (!$("#show-filter").prop("checked"))
                $("#report-save").hide();
        }
    });

    $("#report-header #show-filter").click(function () {
        if ($(this).prop("checked")) {
            $("#filter").show();
            $("#report-save").show();
        } else {
            $("#filter").hide();
            if (!$("#show-select").prop("checked"))
                $("#report-save").hide();
        }
    });

    window.onscroll = function () {
        let navbarheight = $("#imported-navbar").outerHeight(true);
        let height = $("#report-header").outerHeight(true) + ($("#select").is(":visible") ? $("#select").outerHeight(true) : 0) + ($("#filter").is(":visible") ? $("#filter").outerHeight(true) : 0) + ($("#report-save").is(":visible") ? $("#report-save").outerHeight(true) : 0);
        let editbarheight = $("#edit-row").outerHeight(true);

        if (window.pageYOffset >= navbarheight + height) {
            $("#edit-row").addClass("sticky");
            $("#row-header").addClass("sticky");

            $("#edit-row").css("top", navbarheight + "px");
            $("#row-header").css("top", (navbarheight + editbarheight) + "px");
        } else {
            $("#edit-row").removeClass("sticky");
            $("#row-header").removeClass("sticky");
        }
    }
});