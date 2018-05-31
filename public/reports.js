'use strict';

lightningPainDiary.prototype.doLoggedout = function () {
    $("#select #fields").empty();
    $("#panels").empty();
    $("#select").hide();
    $("#search").hide();
}

lightningPainDiary.prototype.doTrackerDisplay = function () {
    lpd.doReportlistRead(lpd.doReportMenuDisplay);
    lpd.doReportDisplay();
}

lightningPainDiary.prototype.doReportDisplay = function () {
    lpd.selectDisplay();
    lpd.searchDisplay();
    lpd.headerDisplay();
    lpd.doDiaryRead(null, lpd.diaryEntryDisplay, lpd.doReportUpdate);
}

lightningPainDiary.prototype.doReportUpdate = function () {
    lpd.setSelect();
    lpd.diarySelectDisplay();
}

lightningPainDiary.prototype.headerDisplay = function () {
    const row =
        `<div id="row-idname" class="row" style="border-bottom: 1px solid #008000;">
            <div class="col-print-2 col-lg-2 col-md-2 col-sm-2 col-3 border-right border-bottom">
                Date & Time
            </div>
            <div class="container col-print-12 col-lg-12 col-md-12 col-sm-12 col-11">
                <div id="cont" class="row"></div>
            </div>
        </div>
        `;
    const entry = `<div id="ent-idname" class="col-print-2 col-lg-2 col-md-2 col-sm-2 col-7 border-right border-bottom">dvalue</div>`;

    let pnl = $("#panels");
    pnl.empty();

    let h = /idname/g [Symbol.replace](row, "header");
    pnl.append(h);
    let header = pnl.find("#row-header");

    for (let i = 0; i < lpd.trackerlist.length; ++i) {
        let item = lpd.trackerlist[i];
        let name = item.name;
        let id = / /g [Symbol.replace](name, "-");

        switch (item.type) {
            case "blood pressure":
                name = "Blood Pressure & Pulse";
            case "date":
                if (item.name === "Date")
                    break;
            case "time":
                if (item.name === "Time")
                    break;
            default:
                let h = /dvalue/g [Symbol.replace](entry, name);
                h = /idname/g [Symbol.replace](h, id);
                header.find("#cont").append(h);
        }
    }
}

lightningPainDiary.prototype.diaryEntryDisplay = function (diary) {
    const row =
        `<div id="row-idname" class="row" style="border-bottom: 1px solid #008000;">
            <div class="col-print-2 col-lg-2 col-md-2 col-sm-2 col-3 border-right border-bottom">
                <div id="date"></div>
                <div id="time"></div>
                <input id="sel-idname" class="radio-inline noprint" type="radio" name="selected">
            </div>
            <div class="container col-print-12 col-lg-12 col-md-12 col-sm-12 col-11">
                <div id="cont" class="row"></div>
            </div>
        </div>
        `;
    const entry = `<div id="ent-idname" class="col-print-2 col-lg-2 col-md-2 col-sm-2 col-7 border-right border-bottom">dvalue</div>`;
    const mult = `<div id="sub-idname">dvalue</div>`;
    const img = '<img id="sub-idname" src="https://openweathermap.org/img/w/iicon.png" height="15" width="15">';

    let id = lpd.getDiaryKey(diary);

    let h = /idname/g [Symbol.replace](row, id);
    let pnl = $("#panels");
    pnl.append(h);
    let ent = pnl.find("#row-" + id);

    for (let i = 0; i < lpd.trackerlist.length; ++i) {
        let item = lpd.trackerlist[i];
        let name = item.name;
        let iid = / /g [Symbol.replace](name, "-");
        let txt = diary[item.name];

        switch (item.type) {
            case "weather":
                h = /dvalue/g [Symbol.replace](entry, "");
                h = /idname/g [Symbol.replace](h, iid);
                ent.find("#cont").append(h);

                if (diary[item.name] && diary[item.name].description !== "") {
                    for (let name in diary[item.name]) {
                        let lid = / /g [Symbol.replace](name, "-");

                        if (name === "icon") {
                            h = /iicon/g [Symbol.replace](img, diary[item.name][name]);
                            h = /idname/g [Symbol.replace](h, lid);
                            ent.find("#cont #sub-description").append(h);
                        } else {
                            let txt = name + ": " + diary[item.name][name];

                            h = /dvalue/g [Symbol.replace](mult, txt);
                            h = /idname/g [Symbol.replace](h, lid);
                            ent.find("#cont #ent-" + iid).append(h);
                        }
                    }
                }
                break;

            case "list":
                h = /dvalue/g [Symbol.replace](entry, "");
                h = /idname/g [Symbol.replace](h, iid);
                ent.find("#cont").append(h);

                if (diary[item.name]) {
                    for (let i = 0; i < diary[item.name].length; ++i) {
                        let name = diary[item.name][i];
                        let lid = / /g [Symbol.replace](name, "-");

                        h = /dvalue/g [Symbol.replace](mult, name);
                        h = /idname/g [Symbol.replace](h, lid);
                        ent.find("#cont #ent-" + iid).append(h);
                    }
                }
                break;

            case "blood pressure":
                txt = !diary[item.name] || diary[item.name].high === 0 ? "" :
                    diary[item.name].high + " / " + diary[item.name].low + " " + diary[item.name].pulse;

            case "date":
                if (item.name === "Date") {
                    ent.children().find("#date").text(diary.Date);
                    ent.children().find("#time").text(diary.Time);
                    break;
                }

            case "time":
                if (item.name === "Time")
                    break;

            default:
                h = /dvalue/g [Symbol.replace](entry, typeof txt === undefined ? "" : txt);
                h = /idname/g [Symbol.replace](h, iid);
                ent.find("#cont").append(h);
        }
    }

    ent.find("[name='selected']").click(function () {
        $("#edit").removeClass("disabled");
        $("#edit").removeAttr("disabled");
        $("#delete").removeClass("disabled");
        $("#delete").removeAttr("disabled");
    });
}

lightningPainDiary.prototype.selectDisplay = function () {
    const row = `<div id="row-idname" class="row border-bottom"></div>`;
    const entry =
        `<label class="col-lg-2 col-md-3 col-sm-4 col-6">
            <input id="ent-idname" type="checkbox"> ttitle
        </label>
        `;
    const cont = `<div id="cont" class="col-lg-12 col-md-11 col-sm-10 col-8 container"></div>`;
    const sub =
        `<label class="col-lg-2 col-md-3 col-sm-4 col-14">
            <input id="sub-sname" type="checkbox"> ttitle
        </label>
        `;

    let fld = $("#fields");
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
                    sel.append(cont);

                    for (let i = 0; i < item.list.length; ++i) {
                        let iname = item.list[i];
                        let iid = / /g [Symbol.replace](iname, "-");

                        h = /sname/g [Symbol.replace](sub, iid);
                        h = /ttitle/g [Symbol.replace](h, iname);

                        sel.find("#cont").append(h);
                    }

                    if (item.type === "list") {
                        h = /sname/g [Symbol.replace](sub, "all-others");
                        h = /ttitle/g [Symbol.replace](h, "all others");

                        sel.find("#cont").append(h);
                    }
                }
        }
    }

    $("#fields :checkbox").click(function () {
        if ($(this).prop("checked"))
            $("#panels #" + $(this).prop("id")).show();
        else
            $("#panels #" + $(this).prop("id")).hide();
    });
}

lightningPainDiary.prototype.setSelect = function () {
    $("#select :checkbox").prop("checked", false);

    for (let i = 0; i < lpd.report.length; ++i) {
        let item = lpd.report[i];
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

                        sel.find("#sub-" + iid).prop("checked", true);
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

                        for (let i = 0; i < list.list.length; ++i) {
                            let iname = list.list[i];
                            let iid = / /g [Symbol.replace](iname, "-");

                            if (row.find("#sub-" + iid).prop("checked"))
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

    let list = $("#selectmenu #list");
    list.empty();
    $("#selectmenu #report").text("all on");

    let mnu = /ttype/g [Symbol.replace](menu, "all on");
    list.append(mnu);

    for (let i = 0; i < lpd.reportlist.length; ++i) {
        let mnu = /ttype/g [Symbol.replace](menu, lpd.reportlist[i]);
        list.append(mnu);
    }

    list.find("button").click(function () {
        let name = $(this).text();
        $("#selectmenu #report").text(name);

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

lightningPainDiary.prototype.searchDisplay = function () {
    const row =
        `<div class="col-lg-2 col-md-2 col-sm-4 col-6">ttitle</div>
         <div id="cont" class="col-lg-12 col-md-12 col-sm-10 col-8 container"></div>`;
    const sub =
        `<label class="col-lg-2 col-md-3 col-sm-4 col-14">
            <input id="sub-sname" type="checkbox"> ttitle
        </label>`;

    let fld = $("#search");

    for (let i = 0; i < lpd.trackerlist.length; ++i) {
        let item = lpd.trackerlist[i];
        let name = item.name;

        switch (item.name) {
            case "Remedies":
            case "Triggered By":
            let id = / /g[Symbol.replace](item.name, "-");
            let h = /ttitle/g [Symbol.replace](row, name);

                let rem = fld.find("#"+id)
                rem.empty();
                rem.append(h);

                for (let i = 0; i < item.list.length; ++i) {
                    let iname = item.list[i];
                    let iid = / /g [Symbol.replace](iname, "-");

                    h = /sname/g [Symbol.replace](sub, iid);
                    h = /ttitle/g [Symbol.replace](h, iname);

                    rem.find("#cont").append(h);
                }
        }
    }

    $("#fields :checkbox").click(function () {
        if ($(this).prop("checked"))
            $("#panels #" + $(this).prop("id")).show();
        else
            $("#panels #" + $(this).prop("id")).hide();
    });
}

lightningPainDiary.prototype.doSearch = function () {
    $("#panels").empty();
    lpd.headerDisplay();
    lpd.search = {};
    let search=$("#search");
    lpd.search.startdate = /-/g[Symbol.replace](search.find("#Start-Date").val(),"");
    lpd.search.enddate = /-/g[Symbol.replace](search.find("#End-Date").val(),"");
    lpd.search.painlevel = search.find("#Pain-Level").val();
    lpd.search.remedies = [];
    search.find("#Remedies").find(":checked").each(function () {
        let name = $(this).prop("id").replace(stripid, "$1");
        lpd.search.remedies.push(name);
    });
    lpd.search.triggeredby = [];
    search.find("#Triggered-By").find(":checked").each(function () {
        let name = $(this).prop("id").replace(stripid, "$1");
        lpd.search.triggeredby.push(name);
    });

    lpd.doDiaryRead(lpd.search, lpd.diaryEntryDisplay, lpd.diarySelectDisplay);
}

lightningPainDiary.prototype.doClearSearch = function () {
    $("#panels").empty();
    lpd.headerDisplay();

    lpd.search = [];
    $("#search #date").val("");
    $("#search #pain-level").val("");
    $("#search #remedies-list").prop("checked", false);

    lpd.doDiaryRead(null, lpd.diaryEntryDisplay, lpd.diarySelectDisplay);
}

/*********************************** */

$(document).ready(function () {
    startUp();

    $("#select #save").click(function () {
        let name = $("#select #name").val();
        $("#selectmenu #report").text(name);

        const menu = `<button id="item" class="dropdown-item" type="button" style="cursor: pointer">ttype</button>`;

        let mnu = /ttype/g [Symbol.replace](menu, name);
        $("#selectmenu [id|='list']").append(mnu);

        lpd.report = lpd.extractSelect();
        lpd.doReportWrite(name);
    });

    $("#select #cancel").click(function () {
        lpd.doReportRead($("#selectmenu #report").text(), lpd.doReportUpdate);
    });

    $("#select #delete").click(function () {
        let name = $("#select #name").val();
        lpd.doReportDelete(name);
        $("#selectmenu #list").find(":contains("+name+")").remove();
    });

    $("#stickyedit #edit").click(function () {
        lpd.editSel();
    });

    $("#stickyedit #delete").click(function () {
        lpd.deleteSel();
    });

    $("#show-search").click(function () {
        if ($(this).prop("checked"))
            $("#search").show();
        else
            $("#search").hide();
    });

    $("#show-select").click(function () {
        if ($(this).prop("checked"))
            $("#select").show();
        else
            $("#select").hide();
    });

    $("#search-btn").click(function (event) {
        lpd.doSearch();
    });

    $("#clear-btn").click(function (event) {
        lpd.doClearSearch();
    });

    window.onscroll = function () {
        let navbarheight = $("#imported-navbar").outerHeight(true);
        let reporthdrheight = $("#report-header").outerHeight(true);
        let searchheight = $("#search").is(":visible") ? $("#search").outerHeight(true) : 0;
        let selectheight = $("#select").is(":visible") ? $("#select").outerHeight(true) : 0;
        let editbarheight = $("#stickyedit").outerHeight(true);

        if (window.pageYOffset >= navbarheight + reporthdrheight + searchheight + selectheight) {
            $("#stickyedit").addClass("sticky");
            $("#row-header").addClass("sticky");

            $("#stickyedit").css("top", navbarheight + "px");
            $("#row-header").css("top", (navbarheight + editbarheight) + "px");
        } else {
            $("#stickyedit").removeClass("sticky");
            $("#row-header").removeClass("sticky");
        }
    }
});