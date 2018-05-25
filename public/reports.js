'use strict';

lightningPainDiary.prototype.doReportDisplay = function () {
    this.doReportHeaderDisplay();

    this.doDiaryRead(this.doReportEntryDisplay, this.doSelectReportDisplay);
}

lightningPainDiary.prototype.doReportHeaderDisplay = function () {
    const row =
        `<div id="row-idname" class="row" style="font-size: 15px; border-bottom: 1px solid #008000;">
            <div class="col-md-2 col-sm-2 col-3 border-right">
                Date & Time
            </div>
            <div id="cont" class="container row col-md-10 col-sm-10 col-9"></div>
        </div>
        `;
    const entry = `<div id="ent-idname" class="col-md-2 col-sm-4 col-6 border-right border-bottom">dvalue</div>`;

    let pnl = $("#panels");
    pnl.empty();

    let h = /idname/g [Symbol.replace](row, "header");
    pnl.append(h);
    let header = pnl.find("#row-header");

    for (let i = 0; i < this.trackerlist.length; ++i) {
        let item = this.trackerlist[i];
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

lightningPainDiary.prototype.doReportEntryDisplay = function (diary) {
    const row =
        `<div id="row-idname" class="row" style="font-size: 15px; border-bottom: 1px solid #008000;">
            <div class="col-md-2 col-sm-2 col-3 border-right">
                <div id="date"></div>
                <div id="time"></div>
                <input id="sel-idname" class="radio-inline" type="radio" name="selected">
            </div>
            <div id="cont" class="container row col-md-10 col-sm-10 col-9"></div>
        </div>
        `;
    const entry = `<div id="ent-idname" class="col-md-2 col-sm-4 col-6 border-right border-bottom">dvalue</div>`;
    const mult = `<div id="sub-idname">dvalue</div>`;

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

                for (let i = 0; txt && i < diary[item.name].length; ++i) {
                    let name = item.list[i];
                    let lid = / /g [Symbol.replace](name, "-");

                    let txt = name + ": " + diary[item.name][name];

                    h = /dvalue/g [Symbol.replace](mult, txt);
                    h = /idname/g [Symbol.replace](h, lid);
                    ent.find("#cont #ent-" + item.id).append(h);
                }
                break;

            case "list":
                h = /dvalue/g [Symbol.replace](entry, "");
                h = /idname/g [Symbol.replace](h, iid);
                ent.find("#cont").append(h);

                for (let i = 0; txt && i < diary[item.name].length; ++i) {
                    let name = diary[item.name][i];
                    let lid = / /g [Symbol.replace](name, "-");;

                    h = /dvalue/g [Symbol.replace](mult, name);
                    h = /idname/g [Symbol.replace](h, lid);
                    ent.find("#cont #ent-" + iid).append(h);
                }
                break;

            case "blood pressure":
                txt = typeof txt === undefined || diary[item.name].high === 0 ?
                    "" : diary[item.name].high + " / " + diary[item.name].low + " " + diary[item.name].pulse;

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

lightningPainDiary.prototype.doSelectReportDisplay = function () {
    $("#panels [id|='ent']").hide();
    $("#panels [id|='list']").hide();
    
    $("#fields :checked").each(function(){
        $("#panels #"+$(this).prop("id")).show();
    })
}

lightningPainDiary.prototype.editSel = function () {
    let sel = $("#panels :checked");
    let edit = sel.prop("id");
    let datekey = edit.replace(stripid, "$1");

    this.account.lastdiaryupdate = datekey;
    this.doAccountWrite();

    window.location.assign("index.html")
}

lightningPainDiary.prototype.deleteSel = function () {
    let sel = $("#panels :checked");
    let del = sel.prop("id");
    let datekey = del.replace(stripid, "$1");

    this.doDiaryEntryDelete(datekey);
    this.doReportDisplay();
}

lightningPainDiary.prototype.doReportSelectDisplay = function () {
    const row = `<div id="row-idname" class="row border-bottom"></div>`;
    const cont = `<div id="cont" class="col-lg-10 col-md-9 col-sm-9 col-6 container"></div>`;
    const entry =
        `<label class="col-lg-2 col-md-3 col-sm-3 col-6">
            <input id="ent-idname" type="checkbox"> ttitle
        </label>
        `;
    const sub =
        `<label class="col-lg-2 col-md-3 col-sm-5 col-12">
            <input id="sub-subname" type="checkbox"> ttitle
        </label>
        `;
    //const menu = `<button id="item" class="dropdown-item" type="button" style="cursor: pointer">ttype</button>`;

    //$("#selectmenu [id|='list']").empty();
    //$("#selectmenu #report").text(reportname);
    //let mnu = /ttype/g [Symbol.replace](menu, "all on");
    //$("#selectmenu [id|='list']").append(mnu);

    let fld = $("#fields");
    fld.empty();

    for (let i = 0; i < this.trackerlist.length; ++i) {
        let item = this.trackerlist[i];
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
                    h = /idname/g [Symbol.replace](cont, id);
                    sel.append(h);

                    for (let i = 0; i < item.list.length; ++i) {
                        let iname = item.list[i];
                        let iid = / /g [Symbol.replace](iname, "-");

                        h = /subname/g [Symbol.replace](sub, iid);
                        h = /ttitle/g [Symbol.replace](h, iname);

                        sel.find("#cont").append(h);
                    }

                    if (item.type === "list") {
                        h = /subname/g [Symbol.replace](sub, "all-others");
                        h = /ttitle/g [Symbol.replace](h, "all others");

                        sel.find("#cont").append(h);
                    }
                }
        }
    }

    for (let i = 0; i < this.report.length; ++i) {
        let item = this.report[i];
        let name = item.name;
        let id = / /g [Symbol.replace](name, "-");
        let sel = fld.find("#row-" + id);

        switch (item.type) {
            case "date":
                if (name === "Date")
                    break;
            case "time":
                if (name === "Time")
                    break;
            default:

                sel.find("#ent-" + id).prop("checked", true);

                if (item.type === "weather" || item.type === "list") {

                    for (let i = 0; i < item.list.length; ++i) {
                        let iid = / /g [Symbol.replace](item.list[i], "-");

                        sel.find("#sub-" + iid).prop("checked", true);
                    }
                    
                    sel.find("#sub-all-others").prop("checked", true);
                }
        }
    }

    $("#selectfields :checkbox").click(function () {
        if($(this).prop("checked"))
            $("#panels #"+$(this).prop("id")).show();
        else
            $("#panels #"+$(this).prop("id")).hide();
    });
}

/*********************************** */

$(document).ready(function () {
    startUp();

    $("#selectfields #save").click(function () {
        lpd.extractReport();
        lpd.doReportWrite($("#savereport #name").val());
    });

    $("#selectfields #cancel").click(function () {
        lpd.doReportRead(lpd.account.lastreport);
    });

    $("#edit").click(function () {
        lpd.editSel();
    });

    $("#delete").click(function () {
        lpd.deleteSel();
    });

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
        lpd.doReportDisplay();
    });
});