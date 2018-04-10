let setupdb;
let diarydb;
const openweatherapikey = "36241d90d27162ebecabf6c334851f16";

$(document).ready(function () {
    $("#javascript").empty();
    $("#jssite").show();

    if (!('indexedDB' in window)) {
        console.log('This browser doesn\'t support IndexedDB');
    }

    let accountreq = indexedDB.open("account", 1);

    accountreq.onupgradeneeded = function () {};

    accountreq.onerror = function () {
        console.log("account not found");
    };

    accountreq.onsuccess = function () {
        accountdb = accountreq.result;

        let diaryreq = indexedDB.open("diary", 1);

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
            setup(diarydb, accountdb, false);
        };
    };
});

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
                    //value[entry.name] = extractCheckboxList(entry);
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
                    //value[entry.name] = extractWeatherInput(entry);
                    break;
            }

            cursor.continue();
        } else {
            let store = diarydb.transaction(["diary"], "readwrite").objectStore("diary");
            store.put(value);
        }
    }
}

function setup(diarydb, accountdb, ifcancel) {
    $("#panels").empty();

    let store = diarydb.transaction(["diary"], "readwrite").objectStore("diary");
    let req = store.openCursor(null, "prev");
    req.onsuccess = function (event) {
        let cursor = event.target.result;
        let diary = null;

        if (cursor)
            diary = cursor.value;

        let store = accountdb.transaction(["account"], "readwrite").objectStore("account");
        let req = store.index("by_name").get("Account");
        req.onsuccess = function () {
            let account = req.result;
            if (!account.ifdefault || ifcancel)
                diary = null;

            let cursor = store.index('by_position').openCursor();
            cursor.onsuccess = function (event) {
                let cursor = event.target.result;

                if (cursor) {
                    let entry = cursor.value;

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

                    cursor.continue();
                } else {
                    $("#save").click(function () {
                        $("#l8r-Pain-Level").show();
                        $("#new").removeClass("disabled");
                        $("#new").removeAttr("disabled");
                        $("#del").removeClass("disabled");
                        $("#del").removeAttr("disabled");

                        updateEntry(diarydb, accountdb);
                    });

                    $("#new").click(function () {
                        setup(diarydb, accountdb, false);
                    });

                    $("#del").click(function () {
                        setup(diarydb, accountdb, true);
                    });

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
                <div class="col-lg-3 col-md-3 col-sm-4 col-12 h6 clr-dark-green">ttitle</div>
                <div id="entry" class="row col-lg-9 col-md-9 col-sm-8 col-12"></div>
            </div>
            <div id="l8r-idname" style="display: none"></div>
            `;

    const item =
        `
        <button type="button" class="btn btn-sm" style="background-color: colors; width:10%" value="ttitle">ttitle</button>
        `;

    let id = / /g [Symbol.replace](entry.name, "-");

    let container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);

    if ($("#l8r-Pain-Level").length)
        $("#l8r-Pain-Level").append(container);
    else
        $("#panels").append(container);
    let pnl = $("#pnl-" + id);

    if (entry.start < entry.end) {
        for (let i = entry.start; i <= entry.end; i++) {
            let c = 120 - (i - entry.start) / (entry.end - entry.start) * 120;
            let h = /ttitle/g [Symbol.replace](item, i);
            h = h.replace("colors", "hsl(" + c + ",100%,50%)");

            pnl.find("#entry").append(h);
        }
    } else {
        for (let i = entry.start; i >= entry.end; i--) {
            let c = (i - entry.end) / (entry.start - entry.end) * 120;

            let h = /ttitle/g [Symbol.replace](item, i);
            h = h.replace("colors", "hsl(" + c + ",100%,50%)");

            pnl.find("#entry").append(h);
        }
    }
}

function extractRange(entry, diary) {
    let id = / /g [Symbol.replace](entry.name, "-");
    return ($("#pnl-" + id + " .btn-green").val());
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
                <div class="col-lg-3 col-md-3 col-sm-4 col-12 h6 clr-dark-green">ttitle</div>
                <textarea id="txt" rows="2" class="rounded col-lg-8 col-md-8 col-sm-8 col-12"></textarea>
            </div>
        `;

    let id = / /g [Symbol.replace](entry.name, "-");

    let container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);

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
                <div class="col-lg-3 col-md-3 col-sm-4 col-6 h6 clr-dark-green">ttitle</div>
                <div id="entry" class="row col-lg-9 col-md-9 col-sm-8 col-6">
                    <input id="num" type="text" class="rounded col-lg-1 col-md-1 col-sm-1 col-1">
                </div>
            </div>
        `;

    let id = / /g [Symbol.replace](entry.name, "-");

    let container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);

    $("#l8r-Pain-Level").append(container);
}

function extractNumInput(entry, diary) {
    let id = / /g [Symbol.replace](entry.name, "-");
    return (Number($("#pnl-" + id + " #num").val()));
}

function buildDateInput(entry, diary) {
    const panel =
        `
            <div id="pnl-idname" class="row border-bottom">
                <div class="col-lg-3 col-md-3 col-sm-4 col-6 h6 clr-dark-green">ttitle</div>
                <input id="date" type="date" class="rounded col-lg-3 col-md-3 col-sm-3 col-6">
            </div>
        `;

    let id = / /g [Symbol.replace](entry.name, "-");

    let container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);

    if ($("#l8r-Pain-Level").length)
        $("#l8r-Pain-Level").append(container);
    else
        $("#panels").append(container);
}

function extractDateInput(entry, diary) {
    let id = / /g [Symbol.replace](entry.name, "-");
    return (Date($("#pnl-" + id + " #date").val()));
}

function buildTimeInput(entry, diary) {
    const panel =
        `
            <div id="pnl-idname" class="row border-bottom">
                <div class="col-lg-3 col-md-3 col-sm-4 col-6 h6 clr-dark-green">ttitle</div>
                <input id="time" type="time" class="rounded col-lg-3 col-md-3 col-sm-3 col-6">
            </div>
        `;

    let id = / /g [Symbol.replace](entry.name, "-");

    let container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);

    $("#l8r-Pain-Level").append(container);
}

function extractTimeInput(entry, diary) {
    let id = / /g [Symbol.replace](entry.name, "-");
    return (Date($("#pnl-" + id + " #time").val()));
}

function buildBoolInput(entry, diary) {
    const panel =
        `
            <div id="pnl-idname" class="row border-bottom">
                <div class="col-lg-3 col-md-3 col-sm-4 col-6 h6 clr-dark-green">ttitle</div>
                <label class="radio-inline"><input type="radio" name="idname">&nbsp;Yes</label>&nbsp;
                <label class="radio-inline"><input type="radio" name="idname" checked>&nbsp;No</label>
            </div>
        `;

    let id = / /g [Symbol.replace](entry.name, "-");

    let container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);

    $("#l8r-Pain-Level").append(container);
}

function extractBoolInput(entry, diary) {
    let id = / /g [Symbol.replace](entry.name, "-");
    return ($("#pnl-" + id + " :checked").parent().text() === " Yes");
}

function buildBPInput(entry, diary) {
    const panel =
        `
            <div id="pnl-idname" class="row border-bottom">
                <div class="col-lg-3 col-md-3 col-sm-4 col-12 h6 clr-dark-green">ttitle</div>
                <div id="entry" class="row col-lg-9 col-md-9 col-sm-12 col-12">
                    <input id="high" class="rounded col-lg-1 col-md-1 col-sm-1 col-1" type="text">
                    <div class="col-lg-1 col-md-1 col-sm-1 col-1 text-center">/</div>
                    <input id="low" class="rounded col-lg-1 col-md-1 col-sm-1 col-1" type="text">
                    <div class="col-lg-1 col-md-2 col-sm-3 col-3 text-right">pulse</div>
                    <input id="pulse" class="rounded col-lg-1 col-md-1 col-sm-1 col-1" type="text">
                </div>
            </div>
        `;

    let id = / /g [Symbol.replace](entry.name, "-");

    let container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);

    $("#l8r-Pain-Level").append(container);
}

function extractBPInput(entry, diary) {
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
            <div class="col-lg-3 col-md-3 col-sm-4 col-12 h6 clr-dark-green">ttitle</div>
            <div id="entry" class="col-lg-9 col-md-9 col-sm-8 col-12"></div>
        </div>
        `;

    const items =
        `
        <label class="col-lg-3 col-md-3 col-sm-3 col-5">
            <input id="idname" type="checkbox">
            ttitle
        </label>
        `;

    let id = / /g [Symbol.replace](entry.name, "-");

    let container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);

    $("#l8r-Pain-Level").append(container);
    let pnl = $("#pnl-" + id);

    for (let i = 0; i < entry.list.length; ++i) {
        let id = / /g [Symbol.replace](entry.list[i], "-");
        let h = /idname/g [Symbol.replace](items, id);
        h = /ttitle/g [Symbol.replace](h, entry.list[i]);

        pnl.find("#entry").append(h);
    }
}

function buildWeatherInput(entry, diary) {
    const panel =
        `
        <div id="pnl-idname" class="row border-bottom">
            <div class="col-lg-3 col-md-3 col-sm-3 col-12 h6 clr-dark-green">ttitle</div>
            <div id="weather" class="row col-lg-9 col-md-9 col-sm-8 col-12 "></div>
        </div>
        `;

    let id = / /g [Symbol.replace](entry.name, "-");

    let container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);

    $("#l8r-Pain-Level").append(container);

    loadWeather(entry, diary);
}

/************************************** */

function loadWeather(entry, diary) {
    let store = accountdb.transaction(["account"], "readwrite").objectStore("account");
    let accountreq = store.index("by_name").get("Account");

    accountreq.onsuccess = function (event) {
        const items = `<div id="idname" class="col-lg-3 col-md-4 col-sm-6 col-6">ttitle: value</div>`;
        const icon = `<img src="http://openweathermap.org/img/w/iicon.png">`;
        let account = accountreq.result;

        let url = "http://api.openweathermap.org/data/2.5/weather?q=" + account.city + "," +
            account.state + "," + account.country + "&units=" + (account.ifmetric ? "metric" : "imperial") +
            "&appid=" + openweatherapikey;

        loadFile(url, function (data) {
            console.log(data);
            let pnl = $("#pnl-Weather #weather");

            for (let i = 0; i < entry.list.length; ++i) {
                let name = entry.list[i];
                let value;

                let id = / /g [Symbol.replace](name, "-");
                let h = /idname/g [Symbol.replace](items, id);
                h = /ttitle/g [Symbol.replace](h, name);
                let j = "";

                switch (name) {
                    case "wind":
                        value = data.wind.speed;
                        break;
                    case "clouds":
                        value = data.clouds.all;
                        break;
                    case "description":
                        value = data.weather[0].description
                        let iicon = data.weather[0].icon;
                        j = /iicon/g [Symbol.replace](icon, iicon);
                        break;
                    default:
                        value = data.main[name];
                }

                h = /value/g [Symbol.replace](h, value);

                pnl.append(h);
                pnl.find("#" + id).append(j);
            }
        });
    };
}

function procCheckboxList(listname) {
    let i = 0;
    let set = [];

    $("#" + listname + " :checked").each(function () {
        set[i++] = $(this).prop("id");
    });

    return (set);
}

/************************************** */

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
    function toDateTimeLocalString() {
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
    function toDateTimeLocalString() {
        let date = this;
        let ten = function (i) {
            return i < 10 ? '0' + i : i;
        }
        return ten(date.getHours()) +
            ":" + ten(date.getMinutes());
    }

Date.prototype.toDateString =
    function toDateTimeLocalString() {
        let date = this;
        let ten = function (i) {
            return i < 10 ? '0' + i : i;
        }
        return date.getFullYear() +
            "-" + ten(date.getMonth() + 1) +
            "-" + ten(date.getDate());
    }