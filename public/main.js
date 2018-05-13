'use strict';

function updateEntry(diarydb, accountdb) {
    let value = {};

    let store = accountdb.transaction(["account"], "readwrite").objectStore("account");
    let cursor = store.index('by_position').openCursor();
    cursor.onsuccess = function (event) {
        let cursor = event.target.result;

        if (cursor) {
            let entry = cursor.value;

            switch (entry.type) {
                case "blood pressure":
                    value[entry.name] = extractBPInput(entry);
                    break;
                case "date":
                    value[entry.name] = extractDateInput(entry);
                    break;
                case "list":
                    value[entry.name] = extractCheckboxList(entry);
                    break;
                case "number":
                    value[entry.name] = extractNumInput(entry);
                    break;
                case "range":
                    value[entry.name] = extractRange(entry);
                    break;
                case "text":
                    value[entry.name] = extractTextInput(entry);
                    break;
                case "time":
                    value[entry.name] = extractTimeInput(entry);
                    break;
                case "true false":
                    value[entry.name] = extractBoolInput(entry);
                    break;
                case "weather":
                    value[entry.name] = extractWeatherInput(entry);
                    break;
            }

            cursor.continue();
        } else {
            value.DateTime = new Date(value["Date"] + " " + value["Time"]).toJSON();

            let diarystore = diarydb.transaction(["diary"], "readwrite").objectStore("diary");
            let diaryreq = diarystore.index('by_datetime').openCursor(IDBKeyRange.only(value.DateTime));
            diaryreq.onsuccess = function (event) {
                let cursor = event.target.result;

                if (cursor)
                    cursor.update(value);
                else
                    diarystore.add(value);
            };

            let acctstore = accountdb.transaction(["account"], "readwrite").objectStore("account");
            let acctreq = acctstore.index('by_name').openCursor("Account");
            acctreq.onsuccess = function (event) {
                let cursor = event.target.result;
                let account = cursor.value;
                account.lastedit = value.DateTime;

                cursor.update(account);
            };
        }
    }
}

function setup(diarydb, accountdb) {
    $("#panels").empty();

    let store = accountdb.transaction(["account"], "readwrite").objectStore("account");
    let accountreq = store.index("by_name").get(IDBKeyRange.only("Account"));
    accountreq.onsuccess = function (event) {
        let account = accountreq.result;

        let diarystore = diarydb.transaction(["diary"], "readwrite").objectStore("diary");
        let diaryreq = diarystore.index('by_datetime').openCursor(account.lastedit);
        diaryreq.onsuccess = function (event) {
            let diarycursor = event.target.result;
            let diary = diarycursor ? diarycursor.value : null;

            //if (!account.ifdefault) // || ifcancel)
            //    diary = null;

            let posstore = accountdb.transaction(["account"], "readwrite").objectStore("account");
            let posreq = posstore.index('by_position').openCursor();
            posreq.onsuccess = function (event) {
                let poscursor = event.target.result;

                if (poscursor) {
                    let entry = poscursor.value;

                    switch (entry.type) {
                        case "blood pressure":
                            buildBPInput(entry, diary);
                            break;
                        case "date":
                            buildDateInput(entry, diary);
                            break;
                        case "list":
                            buildCheckboxList(entry, diary);
                            break;
                        case "number":
                            buildNumInput(entry, diary);
                            break;
                        case "range":
                            buildRange(entry, diary);
                            break;
                        case "text":
                            buildTextInput(entry, diary);
                            break;
                        case "time":
                            buildTimeInput(entry, diary);
                            break;
                        case "true false":
                            buildBoolInput(entry, diary);
                            break;
                        case "weather":
                            buildWeatherInput(entry, diary);
                            break;
                    }

                    poscursor.continue();
                } else {
                    if (!account.lastedit) {
                        let now = new Date();
                        $("#pnl-Date input").val(now.toDateString());
                        $("#pnl-Time input").val(now.toLocalTimeString());
                    }

                    $("#panels").show();
                    $("#l8r-Pain-Level").show();

                    $("#panels button").click(function () {
                        procRange(this);
                    });
                }
            };
        };
    };
}

function buildRange(entry, diary) {
    const panel =
        `
        <div id="pnl-idname" class="row border-bottom">
            <div class="col-lg-3 col-md-3 col-sm-3 col-12 h6 clr-dark-green">ttitle</div>
            <div id="entry" class="row col-lg-9 col-md-9 col-sm-9 col-12"></div>
        </div>
        <div id="l8r-idname" style="display: none"></div>
        `;

    const item = `<button id="btn-ttitle" type="button" class="btn btn-sm iffocus" style="background-color: colors; width:10%">ttitle</button>`;

    let id = / /g [Symbol.replace](entry.name, "-");

    let container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);

    if ($("#l8r-Pain-Level").length) {
        $("#l8r-Pain-Level").append(container);
    } else {
        $("#panels").append(container);
    }

    let pnl = $("#pnl-" + id);

    if (entry.start < entry.end) {
        for (let i = entry.start; i <= entry.end; i++) {
            let c = 120 - (i - entry.start) / (entry.end - entry.start) * 120;
            let h = /ttitle/g [Symbol.replace](item, i);
            h = /iffocus/g [Symbol.replace](h, diary && diary[entry.name] == i ? "btn-green" : "");
            h = h.replace("colors", "hsl(" + c + ",100%,50%)");

            pnl.find("#entry").append(h);
        }
    } else {
        for (let i = entry.start; i >= entry.end; i--) {
            let c = (i - entry.end) / (entry.start - entry.end) * 120;

            let h = /ttitle/g [Symbol.replace](item, i);
            h = /iffocus/g [Symbol.replace](h, diary && diary[entry.name] == i ? "btn-green" : "");
            h = h.replace("colors", "hsl(" + c + ",100%,50%)");

            let btn = pnl.find("#entry").append(h);
        }
    }
}

function extractRange(entry) {
    let id = / /g [Symbol.replace](entry.name, "-");
    let btn = $("#pnl-" + id + " .btn-green").prop("id");
    return (btn ? btn.replace(/btn-(\d+)/g, "$1") : "");
}

function procRange(evt) {
    $(evt).parent().find("button").removeClass("btn-green");
    $(evt).addClass("btn-green");
}

/*
function buildSlider(entry, diary) {
    const panel =
        `
        <div id="pnl-idname" class="row border-bottom">
            <div class="col-lg-4 col-md-4 col-sm-4 col-6 h6 clr-dark-green">ttitle</div>
            <div class="range range-primary col-lg-8 col-md-8 col-sm-8 col-8">
                <input type="range" name="range" min="istart" max="iend" value="istart" onchange="rangePrimary.value=value" style="width: 90%">&nbsp;
                <output id="rangePrimary" class="h6">istart</output>
            </div>
        </div>
        `;

    let id = / /g [Symbol.replace](entry.name, "-");

    let container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);
    container = /istart/g [Symbol.replace](container, entry.start);
    container = /iend/g [Symbol.replace](container, entry.end);

        $("#panels").append(container);

    $('#slider').slider({
        formatter: function (value) {
            return 'Current value: ' + value;
        }
    });
}
*/

function buildTextInput(entry, diary) {
    const panel =
        `
        <div id="pnl-idname" class="row border-bottom">
            <div class="col-lg-3 col-md-3 col-sm-3 col-12 h6 clr-dark-green">ttitle</div>
            <textarea id="txt" rows="2" class="rounded col-lg-8 col-md-8 col-sm-8 col-12">vvalue</textarea>
        </div>
        `;

    let id = / /g [Symbol.replace](entry.name, "-");

    let container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);
    container = /vvalue/g [Symbol.replace](container, diary ? diary[entry.name] : "");

    $("#l8r-Pain-Level").append(container);
}

function extractTextInput(entry) {
    let id = / /g [Symbol.replace](entry.name, "-");
    return ($("#pnl-" + id + " #txt").val());
}

function buildNumInput(entry, diary) {
    const panel =
        `
        <div id="pnl-idname" class="row border-bottom">
            <div class="col-lg-3 col-md-3 col-sm-3 col-6 h6 clr-dark-green">ttitle</div>
            <div id="entry" class="row col-lg-9 col-md-9 col-sm-8 col-6">
                <input id="num" type="text" class="rounded col-lg-1 col-md-2 col-sm-2 col-7" value="vvalue">
            </div>
        </div>
        `;

    let id = / /g [Symbol.replace](entry.name, "-");

    let container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);
    container = /vvalue/g [Symbol.replace](container, diary ? diary[entry.name] : "");

    $("#l8r-Pain-Level").append(container);
}

function extractNumInput(entry) {
    let id = / /g [Symbol.replace](entry.name, "-");
    return (Number($("#pnl-" + id + " #num").val()));
}

function buildDateInput(entry, diary) {
    const panel =
        `
        <div id="pnl-idname" class="row border-bottom">
            <div class="col-lg-3 col-md-3 col-sm-3 col-6 h6 clr-dark-green">ttitle</div>
            <input id="date" type="date" class="rounded col-lg-3 col-md-3 col-sm-3 col-6" value="vvalue">
        </div>
        `;

    let id = / /g [Symbol.replace](entry.name, "-");

    let container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);
    container = /vvalue/g [Symbol.replace](container, diary ? diary[entry.name] : "");

    if ($("#l8r-Pain-Level").length) {
        $("#l8r-Pain-Level").append(container);
    } else {
        $("#panels").append(container);
    }
}

function extractDateInput(entry) {
    let id = / /g [Symbol.replace](entry.name, "-");
    return ($("#pnl-" + id + " #date").val());
}

function buildTimeInput(entry, diary) {
    const panel =
        `
        <div id="pnl-idname" class="row border-bottom">
            <div class="col-lg-3 col-md-3 col-sm-3 col-6 h6 clr-dark-green">ttitle</div>
            <input id="time" type="time" class="rounded col-lg-3 col-md-3 col-sm-3 col-6" value="vvalue">&nbsp;
            <button type="button" class="btn border btn-sm btn-green">Now</button>&nbsp;
        </div>
        `;

    let id = / /g [Symbol.replace](entry.name, "-");

    let container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);
    container = /vvalue/g [Symbol.replace](container, diary ? diary[entry.name] : "");

    if ($("#l8r-Pain-Level").length) {
        $("#l8r-Pain-Level").append(container);
    } else {
        $("#panels").append(container);
    }

    $("#pnl-" + id + " button").click(function () {
        let now = new Date();
        $(this).parent().find("input").val(now.toLocalTimeString());
        $("#pnl-Date input").val(now.toDateString());
    });
}

function extractTimeInput(entry) {
    let id = / /g [Symbol.replace](entry.name, "-");
    return ($("#pnl-" + id + " #time").val());
}

function buildBoolInput(entry, diary) {
    const panel =
        `
        <div id="pnl-idname" class="row border-bottom">
            <div class="col-lg-3 col-md-3 col-sm-3 col-6 h6 clr-dark-green">ttitle</div>
            <label class="radio-inline"><input id="yes" type="radio" name="idname" ckyes>&nbsp;Yes</label>&nbsp;
            <label class="radio-inline"><input id="no" type="radio" name="idname" ckno>&nbsp;No</label>
        </div>
        `;

    let id = / /g [Symbol.replace](entry.name, "-");

    let container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);
    container = /ckyes/g [Symbol.replace](container, diary && diary[entry.name] ? "checked" : "");
    container = /ckno/g [Symbol.replace](container, !diary || !diary[entry.name] ? "checked" : "");

    $("#l8r-Pain-Level").append(container);
}

function extractBoolInput(entry) {
    let id = / /g [Symbol.replace](entry.name, "-");
    return ($("#pnl-" + id + " :checked").prop("id") === "yes");
}

function buildBPInput(entry, diary) {
    const panel =
        `
        <div id="pnl-idname" class="row border-bottom">
            <div class="col-lg-3 col-md-3 col-sm-3 col-6 h6 clr-dark-green">ttitle</div>
            <div id="entry" class="row col-lg-9 col-md-9 col-sm-9 col-6">
                <input id="high" class="rounded col-lg-1 col-md-2 col-sm-2 col-7" type="text" value="vbphigh">
                <div class="col-lg-1 col-md-1 col-sm-1 col-3 text-center">/</div>
                <input id="low" class="rounded col-lg-1 col-md-2 col-sm-2 col-7" type="text" value="vbplow">
                <input id="pulse" class="rounded col-lg-1 col-md-2 col-sm-2 col-7" type="text" value="vpulse">
                &nbsp;pulse
            </div>
        </div>
        `;

    let id = / /g [Symbol.replace](entry.name, "-");

    let container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);
    container = /vbphigh/g [Symbol.replace](container, diary && diary[entry.name] ? diary[entry.name].high : "");
    container = /vbplow/g [Symbol.replace](container, diary && diary[entry.name] ? diary[entry.name].low : "");
    container = /vpulse/g [Symbol.replace](container, diary && diary[entry.name] ? diary[entry.name].pulse : "");

    $("#l8r-Pain-Level").append(container);
}

function extractBPInput(entry) {
    let id = / /g [Symbol.replace](entry.name, "-");
    let value = {
        high: Number($("#pnl-" + id + " #high").val()),
        low: Number($("#pnl-" + id + " #low").val()),
        pulse: Number($("#pnl-" + id + " #pulse").val()),
    };

    return (value);
}

function buildCheckboxList(entry, diary) {
    const panel =
        `
        <div id="pnl-idname" class="row border-bottom">
            <div class="col-lg-3 col-md-3 col-sm-3 col-12 h6 clr-dark-green">ttitle</div>
            <div id="entry" class="row col-lg-9 col-md-9 col-sm-9 col-12"></div>
        </div>
        `;

    const items =
        `
        <label class="col-lg-3 col-md-3 col-sm-4 col-5">
            <input id="idname" type="checkbox" ifchecked>
            ttitle
        </label>
        `;

    const add = `<input id="add-idname" class="rounded col-lg-3 col-md-3 col-sm-3 col-6" placeholder="ttitle">`;

    let id = / /g [Symbol.replace](entry.name, "-");

    let container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);

    $("#l8r-Pain-Level").append(container);
    let pnl = $("#pnl-" + id);

    for (let i = 0; i < entry.list.length; ++i) {
        let id = / /g [Symbol.replace](entry.list[i], "-");
        let h = /idname/g [Symbol.replace](items, id);
        h = /ifchecked/g [Symbol.replace](h, diary && diary[entry.name] && diary[entry.name].indexOf(id) != -1 ? "checked" : "");
        h = /ttitle/g [Symbol.replace](h, entry.list[i]);

        pnl.find("#entry").append(h);
    }

    let h = /idname/g [Symbol.replace](add, id);
    h = /ttitle/g [Symbol.replace](h, "add item");
    pnl.find("#entry").append(h);
}

function extractCheckboxList(entry) {
    let set = [];
    let id = / /g [Symbol.replace](entry.name, "-");

    $("#pnl-" + id + " :checked").each(function () {
        set.push($(this).prop("id"));
    });

    let t = $("#pnl-" + id + " [id|='add']").val();
    if (t !== "add item")
        set.push(t);

    return (set);
}

function buildWeatherInput(entry, diary) {
    const panel =
        `
        <div id="pnl-idname" class="row border-bottom">
            <div class="col-lg-3 col-md-3 col-sm-3 col-12 h6 clr-dark-green">ttitle</div>
            <div id="val-idname" class="row col-lg-9 col-md-9 col-sm-9 col-12 "></div>
        </div>
        `;

    let id = / /g [Symbol.replace](entry.name, "-");

    let container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);

    $("#l8r-Pain-Level").append(container);

    loadWeather(entry, diary);
}

function extractWeatherInput(entry) {
    let id = / /g [Symbol.replace](entry.name, "-");
    let value = {};

    $("#pnl-" + id + " input").each(function () {
        value[$(this).parent().prop("id").replace(stripid, "$1")] = $(this).val();
    });
    value.icon = $("#pnl-" + id + " img").prop("src").replace(/^.*\/(.+?).png/g, "$1");

    return (value);
}

function loadWeather(entry, diary) {
    const items =
        `
            <div id="in-idname" class="col-lg-4 col-md-4 col-sm-6 col-12">
                <input class="rounded col-lg-4 col-md-5 col-sm-6 col-6" type="text" value="vvalue">
                &nbsp;ttitle
            </div>
            `;
    const icon = `<img src="https://openweathermap.org/img/w/iicon.png">`;
    const button = `<button type="button" class="btn border btn-sm btn-green">Now</button>&nbsp;`;

    let id = / /g [Symbol.replace](entry.name, "-");
    let pnl = $("#pnl-" + id + " [id|='val']");
    pnl.empty();

    let store = accountdb.transaction(["account"], "readwrite").objectStore("account");
    let accountreq = store.index("by_name").get(IDBKeyRange.only("Account"));
    accountreq.onsuccess = function (event) {
        let account = accountreq.result;

        let url = "https://api.openweathermap.org/data/2.5/weather?q=" + account.city + "," +
            account.state + "," + account.country + "&units=" + (account.ifmetric ? "metric" : "imperial") +
            "&appid=" + openweatherapikey;

        loadFile(url, null, function (data) {
            for (let i = 0; i < entry.list.length; ++i) {
                let name = entry.list[i];
                let value;

                let iid = / /g [Symbol.replace](name, "-");
                let h = /idname/g [Symbol.replace](items, iid);
                h = /ttitle/g [Symbol.replace](h, name);
                let j = "";

                switch (name) {
                    case "wind":
                        value = diary ? diary[entry.name].wind : data.wind.speed;
                        break;
                    case "clouds":
                        value = diary ? diary[entry.name].clouds : data.clouds.all;
                        break;
                    case "description":
                        value = diary ? diary[entry.name].description : data.weather[0].description
                        let iicon = diary ? diary[entry.name].icon : data.weather[0].icon;
                        j = /iicon/g [Symbol.replace](icon, iicon);
                        break;
                    default:
                        value = diary ? diary[entry.name][name] : data.main[name];
                }

                h = /vvalue/g [Symbol.replace](h, value);

                pnl.append(h);

                if (name === "description") {
                    pnl.find("#in-description input").prop("class", "rounded col-lg-8 col-md-10 col-sm-10 col-10")
                    pnl.find("#in-description input").after(j);
                }
            }

            let h = /idname/g [Symbol.replace](button, id);
            pnl.append(h);

            pnl.find("button").click(function () {
                loadWeather(entry, null);
            });
        });
    };
}

/**************************************** */

$(document).ready(function () {
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

        diaryreq.onupgradeneeded = function () {
            diarydb = diaryreq.result;
            let store = diarydb.createObjectStore("diary", {
                autoIncrement: true,
            });

            store.createIndex("by_datetime", "DateTime", {
                unique: true,
            });
        };

        diaryreq.onsuccess = function () {
            diarydb = diaryreq.result;
            setup(diarydb, accountdb, false, false);

            $("#save").click(function () {
                //$("#l8r-Pain-Level").show();
                updateEntry(diarydb, accountdb);
            });

            $("#cancel").click(function () {
                setup(diarydb, accountdb, true, true);
            });
        };
    };
});