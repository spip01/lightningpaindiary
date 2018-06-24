'use strict';

lightningPainDiary.prototype.doLoggedout = function () {
    $("#table, #calendar, #chart").empty();
    $("#select, #filter").find("#fields").empty();
    $("#select, #filter").hide();

    $("#edit-row").find("#edit, #delete").addClass("disabled");
    $("#edit-row").find("#edit, #delete").prop("disabled", true);
}

lightningPainDiary.prototype.doTrackerDisplay = function () {
    lpd.doReportlistRead();
    lpd.doReportRead(lpd.account.lastreport, lpd.doReportDisplay);
}

lightningPainDiary.prototype.doReportDisplay = function () {
    lpd.selectDisplay();
    lpd.filterDisplay();
    lpd.headerDisplay();
    lpd.doDiaryRead(lpd.report.filter.Date.start, lpd.report.filter.Date.end, lpd.diaryDisplay, lpd.doReportUpdate);
}

lightningPainDiary.prototype.diaryDisplay = function (diary) {
    lpd.tableDisplay(diary);
    lpd.calendarDisplay(diary);
}

lightningPainDiary.prototype.doReportUpdate = function () {
    lpd.setSelect();
    lpd.setFilter();
    lpd.diarySelectDisplay();
    lpd.doFilterUpdate();
    lpd.reportMenu();

    $("#table, #calendar, #chart").find("[name='selected']").click(function () {
        $("#edit-row").find("#edit, #delete").removeClass("disabled");
        $("#edit-row").find("#edit, #delete").removeAttr("disabled");
    });
}

lightningPainDiary.prototype.doFilterUpdate = function () {
    lpd.diaryFilterDisplay();
    lpd.chartDisplay();
}

/************************************************************************************************************************* */

const row = `<div id="row-idname" class="row small" style="border-bottom: 1px solid #008000;">
        <div class="col-print-2 col-lg-2 col-md-2 col-sm-2 col-3 border-right border-bottom" style="font-size: .5rem;">
            <div id="date"></div>
            <div id="time"></div>
            <input id="sel-idname" class="radio-inline noprint" type="radio" name="selected">
        </div> 
        <div id="data" class="row col-print-12 col-lg-12 col-md-12 col-sm-12 col-11"></div>
    </div>`;

const entry = `<div id="ent-idname" class="col-print-2 col-lg-2 col-md-2 col-sm-2 col-7 border-right border-bottom">ttext</div>`;
const painlevelentry = `<div id="ent-idname" class="col-print-2 col-lg-2 col-md-2 col-sm-2 col-7 border-right border-bottom h6" style="background-color: hsl(ccolor,100%,50%)">ttext</div>`;
const sub = `<div id="sub-idname">ttext</div>`;
const img = `<img id="sub-idname" src="https://openweathermap.org/img/w/iicon.png" height="15" width="15">`;

lightningPainDiary.prototype.headerDisplay = function () {
    let pnl = $("#table");
    pnl.empty();

    let h = row.symbolReplace(/idname/g, "header");
    pnl.append(h);
    pnl.find("#sel-header").hide();
    pnl = pnl.find("#row-header #data");

    for (let i = 0; i < lpd.trackerlist.length; ++i) {
        let item = lpd.trackerlist[i];
        let name = item.name;
        let id = name.spaceToDash();

        switch (item.type) {
            case "blood pressure":
                name = "Blood Pressure & Pulse";
            case "date":
                if (name === "Date") {
                    $("#row-header #date").text("Date & Time");
                    break;
                }
            case "time":
                if (name === "Time")
                    break;
            default:
                let h = entry.symbolReplace(/ttext/g, name);
                h = h.symbolReplace(/idname/g, id);
                pnl.append(h);
        }
    }
}

lightningPainDiary.prototype.tableDisplay = function (diary) {
    let id = lpd.getDiaryKey(diary.Date, diary.Time);

    let h = row.symbolReplace(/idname/g, id);
    let pnl = $("#table");
    pnl.append(h);
    pnl = pnl.find("#row-" + id + " #data");

    let color = 120 - diary["Pain Level"] * 12;

    for (let i = 0; i < lpd.trackerlist.length; ++i) {
        let item = lpd.trackerlist[i];
        let name = item.name;
        let iid = name.spaceToDash();
        let txt = diary[name];

        switch (item.type) {
            case "blood pressure":
                txt = !diary[name] || diary[name].high === 0 ? "" : diary[name].high + "/" + diary[name].low + " " + diary[name].pulse;
                break;

            case "date":
                if (name === "Date") {
                    $("#table #row-" + id + " #date").text(diary.Date);
                    $("#table #row-" + id + " #time").text(diary.Time);
                    txt = "";
                }
                break;

            case "time":
                if (name === "Time")
                    txt = "";
                break;

            case "weather":
            case "list":
                txt = "";
                break;
        }

        if (name === "Pain Level")
            h = painlevelentry.symbolReplace(/ccolor/g, color);
        else
            h = entry;

        h = h.symbolReplace(/ttext/g, !txt ? "" : txt);
        h = h.symbolReplace(/idname/g, iid);
        pnl.append(h);

        let ent = pnl.find("#ent-" + iid);

        if (diary[name])
            switch (item.type) {
                case "weather":
                    for (let [dname, val] of Object.entries(diary[name])) {
                        if (val !== "") {
                            let lid = dname.spaceToDash();

                            if (dname === "icon") {
                                h = img.symbolReplace(/iicon/g, val);
                                h = h.symbolReplace(/idname/g, lid);
                                ent.append(h);
                            } else {
                                let txt = dname + ": " + val;

                                h = sub.symbolReplace(/ttext/g, txt);
                                h = h.symbolReplace(/idname/g, lid);
                                ent.append(h);
                            }
                        }
                    }
                    break;

                case "list":
                    for (let i = 0; i < diary[name].length; ++i) {
                        let dname = diary[name][i];
                        let lid = dname.spaceToDash();

                        h = sub.symbolReplace(/ttext/g, dname);
                        h = h.symbolReplace(/idname/g, lid);
                        ent.append(h);
                    }
                    break;
            }
    }
}

/************************************************************************************************************************* */

lightningPainDiary.prototype.selectDisplay = function () {
    const row = `<div id="row-idname" class="row border-bottom"></div>`;
    const entry =
        `<label class="col-lg-2 col-md-3 col-sm-4 col-6">
            <input id="ent-idname" type="checkbox"> ttitle
        </label>`;
    const cntnr = `<div id="cont-idname" class="col-lg-12 col-md-11 col-sm-10 col-8 container"></div>`;
    const sub =
        `<label class="col-lg-2 col-md-3 col-sm-4 col-14">
            <input id="sub-sname" type="checkbox"> ttitle
        </label>`;

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
                let id = name.spaceToDash();
                let h = row.symbolReplace(/idname/g, id);

                fld.append(h);

                h = entry.symbolReplace(/idname/g, id);
                h = h.symbolReplace(/ttitle/g, name);

                let sel = fld.find("#row-" + id);
                sel.append(h);

                if (item.type === "weather" || item.type === "list") {
                    h = cntnr.symbolReplace(/idname/g, id);
                    sel.append(h);
                    let cont = sel.find("#cont-" + id);

                    for (let i = 0; i < item.list.length; ++i) {
                        let iname = item.list[i];
                        let iid = iname.spaceToDash();

                        h = sub.symbolReplace(/sname/g, iid);
                        h = h.symbolReplace(/ttitle/g, iname);

                        cont.append(h);
                    }

                    if (item.type === "list") {
                        h = sub.symbolReplace(/sname/g, "all-others");
                        h = h.symbolReplace(/ttitle/g, "all others");

                        cont.append(h);
                    }
                }
        }
    }

    fld.find(":checkbox").click(function () {
        let id = $(this).prop("id");
        if ($(this).prop("checked"))
            $("#table, #calendar").find("#" + id).show();
        else
            $("#table, #calendar").find("#" + id).hide();
    });
}

lightningPainDiary.prototype.setSelect = function () {
    $("#select :checkbox").prop("checked", false);

    for (let i = 0; i < lpd.report.select.length; ++i) {
        let item = lpd.report.select[i];
        let name = item.name;
        let id = name.spaceToDash();
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
                        let iid = item.list[i].spaceToDash();

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
                let id = name.spaceToDash();

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
                            let iid = iname.spaceToDash();

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
    $("#table, #calendar").find("[id|='ent']").hide();
    $("#table, #calendar").find("[id|='sub']").hide();

    $("#fields :checked").each(function () {
        let id = $(this).prop("id");
        $("#table, #calendar").find("#" + id).show();
    });

    $("#calendar #ent-Time").show();
}

lightningPainDiary.prototype.reportMenu = function () {
    const menu = `<button id="item" class="dropdown-item" type="button" style="cursor: pointer">ttype</button>`;

    let list = $("#menu #list");
    list.empty();
    $("#report-save #report-btn").text(lpd.account.lastreport);

    let mnu = menu.symbolReplace(/ttype/g, "all on");
    list.append(mnu);

    for (let i = 0; i < lpd.reportlist.length; ++i) {
        let mnu = menu.symbolReplace(/ttype/g, lpd.reportlist[i]);
        list.append(mnu);
    }

    list.find("button").click(function () {
        let name = $(this).text();
        $("#report-save #report-btn").text(name);

        lpd.doReportRead(name, lpd.doReportUpdate);
    });
}

/************************************************************************************************************************* */

lightningPainDiary.prototype.editSelected = function () {
    let sel = $("#table, #calendar").find(":checked");
    let edit = sel.prop("id");
    let datekey = edit.stripID();

    lpd.account.lastdiaryupdate = datekey;
    lpd.doAccountWrite();

    window.location.assign("index.html")
}

lightningPainDiary.prototype.deleteSelected = function () {
    let sel = $("#table, #calendar").find(":checked");
    let del = sel.prop("id");
    let datekey = del.stripID();

    lpd.doDiaryEntryDelete(datekey);
    lpd.doReportDisplay();
}

/************************************************************************************************************************* */

lightningPainDiary.prototype.filterDisplay = function () {
    const row = `<div id="row-idname" class="row border-bottom"></div>`;
    const entry = `<div class="col-lg-2 col-md-3 col-sm-4 col-6">ttitle</div>`;
    const input =
        `<label class="container col-14">
            <input id="ent-idname" type="text" class="rounded col-2">&nbsp;ttitle
        </label>`;
    const date =
        `<div class="row container">
            <label class="col-lg-5 col-md-5 col-sm-7 col-14">
                <input id="ent-start-idname" type="date" class="rounded col-9">&nbsp;Start ttitle&nbsp;
            </label>
            <label class="col-lg-5 col-md-5 col-sm-7 col-14">
                <input id="ent-end-idname" type="date" class="rounded col-9">&nbsp;End ttitle
            </label>

            <div id="menu-date-idname" class="col-lg-2 col-md-2 col-sm-3 col-6 dropdown">
                <button id="ent-length-idname" class="btn border btn-sm btn-green dropdown-toggle" type="button" data-toggle="dropdown">all</button>
                <div id="list-idname" class="dropdown-menu">
                    <button id="item" class="dropdown-item" type="button" style="cursor: pointer">all</button>
                    <button id="item" class="dropdown-item" type="button" style="cursor: pointer">30 days</button>
                    <button id="item" class="dropdown-item" type="button" style="cursor: pointer">60 days</button>
                    <button id="item" class="dropdown-item" type="button" style="cursor: pointer">90 days</button>
                    <button id="item" class="dropdown-item" type="button" style="cursor: pointer">180 days</button>
                </div>
            </div>
        </div>`;
    const cntnr = `<div id="cont-idname" class="col-lg-12 col-md-11 col-sm-10 col-8 container"></div>`;
    const sub =
        `<label class="col-lg-2 col-md-3 col-sm-4 col-14">
            <input id="sub-sname" type="checkbox">&nbsp;ttitle
        </label>`;

    let fld = $("#filter #fields");
    fld.empty();

    for (let i = 0; i < lpd.trackerlist.length; ++i) {
        let item = lpd.trackerlist[i];
        let name = item.name;
        let id = name.spaceToDash();
        let r = null;

        switch (item.type) {
            case "date":
                if (name === "Date")
                    r = date;
                break;
            case "range":
                r = input;
                break;
            case "list":
                r = entry;
                break;
        }

        if (r) {
            let h = row.symbolReplace(/idname/g, id);
            fld.append(h);

            h = r.symbolReplace(/idname/g, id);
            h = h.symbolReplace(/ttitle/g, name);

            fld.find("#row-" + id).append(h);
        }

        if (item.type === "list") {
            let h = cntnr.symbolReplace(/idname/g, id);
            fld.find("#row-" + id).append(h);
            let cont = fld.find("#row-" + id + " #cont-" + id);

            for (let i = 0; i < item.list.length; ++i) {
                let iname = item.list[i];
                let iid = iname.spaceToDash();

                let h = sub.symbolReplace(/sname/g, iid);
                h = h.symbolReplace(/ttitle/g, iname);

                cont.append(h);
            }
        }
    }

    fld.find(":checkbox").click(function () {
        lpd.report.filter = lpd.extractFilter();
        lpd.doFilterUpdate();
    });

    fld.find("[type='date']").focusout(function () {
        let id = $(this).prop("id");
        let sub = id.replace(/.*?-(.*?)-.*/g, "$1");
        let name = id.replace(/.*?-.*?-(.*)/g, "$1").dashToSpace();

        if (!lpd.report.filter[name]) {
            lpd.report.filter[name] = {};
            lpd.report.filter[name].type = "date";
        }

        lpd.report.filter[name][sub] = lpd.getDiaryKey($(this).val());
        lpd.doFilterUpdate();
    });

    fld.find(":text").focusout(function () {
        lpd.report.filter = lpd.extractFilter();
        lpd.doFilterUpdate();
    });

    fld.find("[id|='menu-date'] #item").click(function () {
        let id = $(this).parent().prop("id").stripID();
        let name = id.dashToSpace();

        let fld = $("#filter #fields").find("#ent-length-" + id);
        fld.text($(this).text());

        if (!lpd.report.filter[name]) {
            lpd.report.filter[name] = {};
            lpd.report.filter[name].type = "date";
        }

        lpd.report.filter[name].length = $(this).text().replace(/([all369180]*).*/g, "$1");
        lpd.doFilterUpdate();
    });
}

lightningPainDiary.prototype.extractFilter = function () {
    let filter = {};

    for (let i = 0; i < lpd.trackerlist.length; ++i) {
        let list = lpd.trackerlist[i];
        let name = list.name;
        let id = name.spaceToDash();

        let row = $("#filter #row-" + id);

        switch (list.type) {
            case "date":
                filter[name] = {};
                filter[name].type = list.type;
                filter[name].start = lpd.getDiaryKey(row.find("#ent-start-" + id).val());
                filter[name].end = lpd.getDiaryKey(row.find("#ent-end-" + id).val());
                filter[name].length = row.find("#ent-length-" + id).text().replace(/([all369180]*).*/g, "$1");
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
                    let lname = $(this).prop("id").idToName();
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
        let id = name.spaceToDash();
        let row = $("#filter #row-" + id);

        switch (val.type) {
            case "date":
                let start = val.start ? val.start.slice(0, 4) + "-" + val.start.slice(4, 6) + "-" + val.start.slice(6, 8) : "";
                let end = val.end ? val.end.slice(0, 4) + "-" + val.end.slice(4, 6) + "-" + val.end.slice(6, 8) : "";
                row.find("#ent-start-" + id).val(start);
                row.find("#ent-end-" + id).val(end);
                row.find("#ent-length-" + id).text(val.length + (val.length === "all" ? "" : " days"));
                break;
            case "range":
                row.find("#ent-" + id).val(val.val);
                break;
            case "list":
                if (val.list)
                    for (let i = 0; i < val.list.length; ++i) {
                        let iid = val.list[i].spaceToDash();

                        row.find("#cont-" + id + " #sub-" + iid).prop("checked", true);
                    }
                break;
        }
    }
}

lightningPainDiary.prototype.diaryFilterDisplay = function () {
    let trow = $("#table [id|='row']");

    let filter = lpd.report.filter;

    trow.each(function () {
        let id = $(this).prop("id");
        id = id.stripID();
        let sid = id.slice(0, 8);
        let crow = $("#calendar #row-" + id.slice(0, 8));
        let cmonth = $("#calendar #month-" + id.slice(0, 6));

        $(this).show();
        crow.show();
        cmonth.show();

        if (id !== "header") {
            let found = false;
            let list = 0;

            for (let [name, val] of Object.entries(filter)) {
                let nid = name.spaceToDash();

                switch (val.type) {
                    case "date":
                        let start = filter.Date.start != "T" ? filter.Date.start : null;
                        let end = filter.Date.end != "T" ? filter.Date.end : null;
                        let iddate = id.slice(0, 6);

                        if (start && id < start || end && id > end) {
                            $(this).hide();
                            crow.hide();
                            found = true;

                            if (iddate < start.slice(0, 6))
                                cmonth.hide();

                            if (iddate > end.slice(0, 6))
                                cmonth.hide();
                        }

                        if (filter.Date.length !== "all") {
                            let today = new Date();
                            let startdate = new Date(today.setDate(-filter.Date.length)).toDateShortString();

                            if (id < startdate) {
                                $(this).hide();
                                crow.hide();
                                found = true;
                            }

                            if (iddate < startdate.slice(0, 6)) {
                                cmonth.hide();
                            }
                        }
                        break;

                    case "range":
                        if (val.val > 0 && $(this).find("#ent-" + nid).text() < val.val) {
                            $(this).hide();
                            crow.hide();
                            found = true;
                        }
                        break;

                    case "list":
                        if (val.list) {
                            let ent = $(this).find("#ent-" + nid);
                            list += val.list.length;
                            for (let i = 0; i < val.list.length; ++i) {
                                let lid = val.list[i].spaceToDash();
                                if (ent.find("#sub-" + lid).length !== 0)
                                    found = true;
                            }

                        }
                        break;
                }

                if (found)
                    break;
            }

            if (!found && list > 0) {
                $(this).hide();
                crow.hide();
            }
        }
    });
}

/****************************************************************************************************** */

lightningPainDiary.prototype.initReport = function () {
    lpd.report = {};
    lpd.report.select = [];
    lpd.report.filter = {};

    for (let i = 0; i < lpd.trackerlist.length; ++i) {
        lpd.report.select.push(lpd.trackerlist[i]);
        if (lpd.report.select[i].type === "list")
            lpd.report.select[i].list.push("all others");
    }

    let filter = {};

    for (let i = 0; i < lpd.trackerlist.length; ++i) {
        let list = lpd.trackerlist[i];
        let name = list.name;
        let id = name.spaceToDash();

        let row = $("#filter #row-" + id);

        switch (list.type) {
            case "date":
                filter[name] = {};
                filter[name].type = list.type;
                filter[name].start = "";
                filter[name].end = "";
                filter[name].length = "all";
                break;
            case "range":
                filter[name] = {};
                filter[name].type = list.type;
                filter[name].val = 0;
                break;
            case "list":
                filter[name] = {};
                filter[name].type = list.type;
                filter[name].list = [];
                break;
        }
    }

    lpd.report.filter = filter;
}

/****************************************************************************************************** */

const calmonth =
    `<div id="month-idname" class="border">
        <div id="month-header" class="h4 bkg-light-green clr-dark-green border-bottom row">
            <div class="col-10">lmonth</div>
            <div class="col-4 h6">lyear</div>
        </div>
        <div id="week-header" class="row"></div>
    </div>`;
const dayhdr = `<div id="wday-idname" class="border bkg-white text-nowrap col-2">idname</div>`;
const calweek = `<div id="week-ddow" class="row bkg-white"></div>`;
const calday =
    `<div id="day-idname" class="border col-2 small">
        <div id="day" class="border row h5">dday</div>            
        <div id="row-idname" class="col-14">
            <div id="cont"></div>
        </div>
    </div>`;
const calentry =
    `<div id="ent-idname" class="row text-nowrap" style="font-size: .65rem;">nname
        <span style="font-size: .6rem;">ttext</span>
    </div>`;
const timeentry =
    `<label id="ent-idname" class="row" style="font-size: .7rem; background-color: hsl(ccolor,100%,50%)">
        <input id="sel-sidname" class="radio-inline text-nowrap text-center noprint h5" type="radio" name="selected" style="width: 10px; height: 10px;">&nbsp;ttext            
    </label>`;
const calsub = `<div id="sub-idname" class="col-14 text-nowrap" style="font-size: .6rem;">ttext</div>`;

lightningPainDiary.prototype.newCalendar = function (diary) {
    let year = diary.Date.slice(0, 4);
    let month = diary.Date.slice(5, 7);

    let mid = year + month;
    let pnl = $("#calendar");

    let h = calmonth.symbolReplace(/idname/g, mid);
    h = h.symbolReplace(/lmonth/g, month.getMonthString());
    h = h.symbolReplace(/lyear/g, year);

    pnl.append(h);
    let day = pnl.find("#month-" + mid + " #week-header");

    for (let i = 0; i < 7; ++i) {
        let h = dayhdr.symbolReplace(/idname/g, i.getDayString(true));
        day.append(h);
    }

    let week = 1;
    pnl.find("#month-" + mid).append(calweek.symbolReplace(/ddow/g, week));
    day = pnl.find("#month-" + mid + " #week-" + week);

    let startday = new Date(year, month - 1, 1).getDay();
    let dow;
    for (dow = 0; dow < startday; ++dow) {
        let h = calday.symbolReplace(/idname/g, "na");
        h = h.symbolReplace(/dday/g, "");
        day.append(h);
    }

    day.find("#day [id|='sel']").hide();

    for (let i = 1; i <= monthDays(year, month); ++i) {
        let h = calday.symbolReplace(/idname/g, year + month + ten(i));
        h = h.symbolReplace(/dday/g, i);
        day.append(h);

        if (++dow === 7 && i + 1 <= monthDays(year, month)) {
            dow = 0;
            pnl.find("#month-" + mid).append(calweek.symbolReplace(/ddow/g, ++week));
            day = pnl.find("#month-" + mid + " #week-" + week);
        }
    }
}

lightningPainDiary.prototype.calendarDisplay = function (diary) {
    if (!diary)
        return;

    let year = diary.Date.slice(0, 4);
    let month = diary.Date.slice(5, 7);
    let day = diary.Date.slice(8, 10);

    let mid = year + month;
    let fid = year + month + day;
    let pnl = $("#calendar");

    if (pnl.find("#month-" + mid).length === 0)
        lpd.newCalendar(diary);

    pnl = pnl.find("#row-" + fid + " #cont");
    let color = 120 - diary["Pain Level"] * 12;

    for (let i = 0; i < lpd.trackerlist.length; ++i) {
        let item = lpd.trackerlist[i];
        let name = item.name;
        let iid = name.spaceToDash();
        let skip = false;

        if (diary[name]) {
            let txt = diary[name];

            switch (item.type) {
                case "blood pressure":
                    if (!diary[name] || diary[name].high === 0)
                        skip = true;
                    else
                        txt = diary[name].high + "/" + diary[name].low + " " + diary[name].pulse;
                    break;
                case "date":
                    if (name === "Date")
                        skip = true;
                case "weather":
                case "list":
                    txt = "";
                    break;
            }

            if (!skip) {
                let h;

                switch (name) {
                    case "Pain Level":
                        h = painlevelentry;
                        break;
                    case "Time":
                        h = timeentry;
                        h = h.symbolReplace(/sidname/g, lpd.getDiaryKey(diary.Date, diary.Time));
                        break;
                    default:
                        h = calentry;
                        h = h.symbolReplace(/nname/g, name + ":&nbsp;");
                }

                h = h.symbolReplace(/ccolor/g, color);
                h = h.symbolReplace(/idname/g, iid);
                h = h.symbolReplace(/ttext/g, txt);

                pnl.append(h);
                let ent = pnl.find("#ent-" + iid).last();

                switch (item.type) {
                    case "weather":
                        for (let [dname, val] of Object.entries(diary[name])) {
                            if (val !== "") {
                                let lid = dname.spaceToDash();

                                if (dname === "icon") {
                                    h = img.symbolReplace(/iicon/g, val);
                                    h = h.symbolReplace(/idname/g, lid);
                                    ent.append(h);
                                } else {
                                    let txt = dname + ": " + val;

                                    h = calsub.symbolReplace(/ttext/g, txt);
                                    h = h.symbolReplace(/idname/g, lid);
                                    ent.append(h);
                                }
                            }
                        }
                        break;

                    case "list":
                        for (let i = 0; i < diary[name].length; ++i) {
                            let dname = diary[name][i];
                            let lid = dname.spaceToDash();

                            h = calsub.symbolReplace(/ttext/g, dname);
                            h = h.symbolReplace(/idname/g, lid);
                            ent.append(h);
                        }
                        break;
                }
            }
        }
    }
}

/************************************************************************************************************************* */

lightningPainDiary.prototype.chartDisplay = function () {
    if (lpd.snapshot) {
        let painlevel = [{}];
        let humidity = [{}];
        let pressure = [{}];
        let color = [];

        let filterdate = lpd.report.filter.Date;
        let reportstart = filterdate.start !== "" ? moment(filterdate.start) : 0;
        let reportend = filterdate.end !== "" ? moment(filterdate.end) : Number.MAX_SAFE_INTEGER;
        let reportdays = filterdate.length !== "" ? moment(new Date()).subtract(filterdate.length, 'days') : 0;
        if (reportstart.valueOf() < reportdays.valueOf())
            reportstart = reportdays;

        lpd.snapshot.forEach(function (data) {
            let entry = data.val();

            let entrydate = moment(entry.Date);
            if (entrydate.valueOf() >= reportstart.valueOf() && entrydate.valueOf() < reportend.valueOf()) {

                painlevel.push({
                    x: entry.Date + "T" + entry.Time + "Z",
                    y: parseInt(entry["Pain Level"], 10)
                });

                let rgb = hslToRgb(120 - entry["Pain Level"] * 12, 100, 50);
                color.push("#" + toHex(rgb.r) + toHex(rgb.g) + toHex(rgb.b));

                if (entry["Weather"]) {
                    humidity.push({
                        x: entry.Date + "T" + entry.Time + "Z",
                        y: parseInt(entry["Weather"]["humidity"], 10)
                    });
                    pressure.push({
                        x: entry.Date + "T" + entry.Time + "Z",
                        y: parseInt(entry["Weather"]["pressure"], 10)
                    });
                }
            }
        });

        let ctx = $("#chart #panel")[0].getContext("2d");

        let config = {
            type: "line",
            data: {
                datasets: [{
                    yAxisID: "pain level",
                    label: "pain level",
                    data: painlevel,
                    spanGaps:true,
                    pointBackgroundColor: color,
                    backgroundColor: "rgba(255,255,255,0)",
                    borderColor: "#ff0000",
                    borderWidth: 1
                }, {
                    yAxisID: "humidity",
                    label: "humidity",
                    data: humidity,
                    backgroundColor: "rgba(255,255,255,0)",
                    borderColor: "#00ff00",
                    borderWidth: 1
                }, {
                    yAxisID: "pressure",
                    label: "pressure",
                    data: pressure,
                    backgroundColor: "rgba(255,255,255,0)",
                    borderColor: "#0000ff",
                    borderWidth: 1
                }],
            },
            options: {
                scales: {
                    xAxes: [{
                        type: "time",
                        time: {
                            unit: 'week',
                            round: 'day',
                            displayFormats: {
                                day: 'MMM D'
                            },
                        },
                        gridLines: {
                            color: "rgba(0,0,0,0.5)",
                            lineWidth: 0.5
                        }
                    }],
                    yAxes: [{
                        id: "pain level",
                        ticks: {
                            beginAtZero: false
                        },
                        gridLines: {
                            color: "rgba(255,0,0,0.2)",
                            lineWidth: 0.5
                        }
                    }, {
                        id: "humidity",
                        ticks: {
                            beginAtZero: false
                        },
                        gridLines: {
                            color: "rgba(0,255,0,0.2)",
                            lineWidth: 0.5
                        }
                    }, {
                        id: "pressure",
                        ticks: {
                            beginAtZero: false
                        },
                        gridLines: {
                            color: "rgba(0,0,255,0.2)",
                            lineWidth: 0.5
                        }
                    }],
                },
                responsive: true
            }
        }

        let chart = new Chart(ctx, config);
    }
}

/************************************************************************************************************************* */

$(document).ready(function () {
    startUp();

    $("#report-save #save-btn").click(function () {
        let name = $("#report-save #name").val();
        if (name !== "all on") {
            $("#report-save #report-btn").text(name);

            const menu = `<button id="item" class="dropdown-item" type="button" style="cursor: pointer">ttype</button>`;

            if ($("#menu #list :contains(" + name + ")").length === 0) {
                let mnu = menu.symbolReplace(/ttype/g, name);
                $("#menu [id|='list']").append(mnu);
            }

            lpd.report = {};
            lpd.report.select = lpd.extractSelect();
            lpd.report.filter = lpd.extractFilter();

            lpd.doReportWrite(name);
        }
    });

    $("#report-save #cancel-btn").click(function () {
        lpd.doReportRead($("#report-save #report-btn").text(), lpd.doReportUpdate);
    });

    $("#report-save #delete-btn").click(function () {
        let name = $("#report-save #name").val();
        if (name !== "all on") {
            lpd.doReportDelete(name);
            $("#menu #list :contains(" + name + ")").remove();
        }
    });

    $("#report-save #clear-btn").click(function () {
        lpd.initReport();
        lpd.doReportUpdate();
    });

    $("#edit-row #edit").click(function () {
        lpd.editSelected();
    });

    $("#edit-row #delete").click(function () {
        lpd.deleteSelected();
    });

    $("#tab-row button").click(function () {
        $("#tab-row button").removeClass("border-bottom");
        $("#tab-row button").addClass("border-left border-right border-top");

        $(this).removeClass("border-left border-right border-top");
        $(this).addClass("border-bottom");

        $("#table, #calendar, #chart").hide();

        let id = $(this).prop("id").replace(/(.*?)-.*/g, "$1");
        $("#" + id).show();
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