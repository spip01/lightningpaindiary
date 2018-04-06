var setupdb;
var diarydb;

$(document).ready(function () {
    $("#javascript").empty();
    $("#jssite").show();

    if (!('indexedDB' in window)) {
        console.log('This browser doesn\'t support IndexedDB');
    }

    let setupreq = indexedDB.open("setup", 1);

    setupreq.onupgradeneeded = function () {
        //setupoUpgrade(setupreq.result);
    };

    setupreq.onsuccess = function () {
        setupdb = setupreq.result;

        setup(setupdb);

        let diaryreq = indexedDB.open("diary", 1);

        diaryreq.onupgradeneeded = function () {
            //diaryUpgrade(diaryreq.result, setupdb);
        };

        diaryreq.onsuccess = function () {
            diarydb = diaryreq.result;
            newEntry(diarydb);
        };
    };

    $("#updt").click(function () {
        $("#l8r-Pain-Level").show();
        $("#last").removeClass("disabled");
        $("#last").removeAttr("disabled");
        $("#new").removeClass("disabled");
        $("#new").removeAttr("disabled");
        $("#cancel").removeClass("disabled");
        $("#cancel").removeAttr("disabled");

        updateEntry(accountdb);
    });

    $("#last").click(function () {
        lastEntry(accountdb);
    });

    $("#new").click(function () {
        newEntry(accountdb);
    });

    $("#cancel").click(function () {
        cancelEntry(accountdb);
    });
});

function diaryUpgrade(diarydb, setupdb) {
    let diaryentry = {};

    let store = setupdb.transaction(["tracking"], "readwrite").objectStore("tracking");
    let cursor = store.index('by_position').openCursor();
    cursor.onsuccess = function (event) {
        var cursor = event.target.result;

        if (cursor) {
            let entry = cursor.value;

            switch (entry.type) {
                case "blood pressure":
                    break;
                case "date":
                    break;
                case "list":
                    break;
                case "number":
                    break;
                case "range":
                    break;
                case "text":
                    break;
                case "time":
                    break;
                case "true false":
                    break;
                case "weather":
                    break;
            }

            cursor.continue();
        }
    }
}

function setup(db) {
    var store = db.transaction(["tracking"], "readwrite").objectStore("tracking");
    var cursor = store.index('by_position').openCursor();
    cursor.onsuccess = function (event) {
        var cursor = event.target.result;

        if (cursor) {
            var entry = cursor.value;

            switch (entry.type) {
                case "blood pressure":
                    buildBPInput(entry);
                    break;
                case "date":
                    buildDateInput(entry);
                    break;
                case "list":
                    buildCheckboxList(entry);
                    break;
                case "number":
                    buildNumInput(entry);
                    break;
                case "range":
                    buildButtonBars(entry);
                    break;
                case "text":
                    buildTextInput(entry);
                    break;
                case "time":
                    buildTimeInput(entry);
                    break;
                case "true false":
                    buildBoolInput(entry);
                    break;
                case "weather":
                    buildWeatherInput(entry);
                    break;
            }

            cursor.continue();
        }
    }
}

function buildButtonBars(entry) {
    var panel =
        `
            <div id="pnl-idname" class="row border-bottom">
            <div class="col-lg-3 col-md-3 col-sm-4 col-12 h6 clr-dark-green">ttitle</div>
            <div id="entry" class="row col-lg-9 col-md-9 col-sm-8 col-12"></div>
            </div>
            <div id="l8r-idname" style="display: none"></div>
            `;

    var item =
        `
                    <button type="button" class="btn btn-sm" style="background-color: colors; width:10%" value="ttitle">ttitle</button>
        `;

    var id = / /g [Symbol.replace](entry.name, "-");

    var container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);

    if ($("#l8r-Pain-Level").length)
        $("#l8r-Pain-Level").append(container);
    else
        $("#panels").append(container);
    var pnl = $("#pnl-" + id);

    if (entry.start < entry.end) {
        for (var i = entry.start; i <= entry.end; i++) {
            var c = 120 - (i - entry.start) / (entry.end - entry.start) * 120;
            var h = /ttitle/g [Symbol.replace](item, i);
            h = h.replace("colors", "hsl(" + c + ",100%,50%)");

            pnl.find("#entry").append(h);
        }
    } else {
        for (var i = entry.start; i >= entry.end; i--) {
            var c = (i - entry.end) / (entry.start - entry.end) * 120;

            var h = /ttitle/g [Symbol.replace](item, i);
            h = h.replace("colors", "hsl(" + c + ",100%,50%)");

            pnl.find("#entry").append(h);
        }
    }
}

/*
function buildSlider(entry) {
    var panel =
        `
            <div id="pnl-idname" class="row border-bottom">
                <div class="col-lg-4 col-md-4 col-sm-4 col-6 h6 clr-dark-green">ttitle</div>
                <div class="range range-primary col-lg-8 col-md-8 col-sm-8 col-8">
                    <input type="range" name="range" min="istart" max="iend" value="istart" onchange="rangePrimary.value=value" style="width: 90%">&nbsp;
                    <output id="rangePrimary" class="h6">istart</output>
                </div>
            </div>
        `;

    var id = / /g [Symbol.replace](entry.name, "-");

    var container = /idname/g [Symbol.replace](panel, id);
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

function buildTextInput(entry) {
    var panel =
        `
            <div id="pnl-idname" class="row border-bottom">
                <div class="col-lg-3 col-md-3 col-sm-4 col-12 h6 clr-dark-green">ttitle</div>
                <textarea id="txt" rows="2" class="rounded col-lg-8 col-md-8 col-sm-8 col-12"></textarea>
            </div>
        `;

    var id = / /g [Symbol.replace](entry.name, "-");

    var container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);

    $("#l8r-Pain-Level").append(container);
}

function buildNumInput(entry) {
    var panel =
        `
            <div id="pnl-idname" class="row border-bottom">
                <div class="col-lg-3 col-md-3 col-sm-4 col-6 h6 clr-dark-green">ttitle</div>
                <div id="entry" class="row col-lg-9 col-md-9 col-sm-8 col-6">
                    <input id="num" type="text" class="rounded col-lg-1 col-md-1 col-sm-1 col-1">
                </div>
            </div>
        `;

    var id = / /g [Symbol.replace](entry.name, "-");

    var container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);

    $("#l8r-Pain-Level").append(container);
}

function buildDateInput(entry) {
    var panel =
        `
            <div id="pnl-idname" class="row border-bottom">
                <div class="col-lg-3 col-md-3 col-sm-4 col-6 h6 clr-dark-green">ttitle</div>
                <input id="num" type="date" class="rounded col-lg-3 col-md-3 col-sm-3 col-6">
            </div>
        `;

    var id = / /g [Symbol.replace](entry.name, "-");

    var container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);

    if ($("#l8r-Pain-Level").length)
        $("#l8r-Pain-Level").append(container);
    else
        $("#panels").append(container);
}

function buildTimeInput(entry) {
    var panel =
        `
            <div id="pnl-idname" class="row border-bottom">
                <div class="col-lg-3 col-md-3 col-sm-4 col-6 h6 clr-dark-green">ttitle</div>
                <input id="num" type="time" class="rounded col-lg-3 col-md-3 col-sm-3 col-6">
            </div>
        `;

    var id = / /g [Symbol.replace](entry.name, "-");

    var container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);

    $("#l8r-Pain-Level").append(container);
}

function buildBoolInput(entry) {
    var panel =
        `
            <div id="pnl-idname" class="row border-bottom">
                <div class="col-lg-3 col-md-3 col-sm-4 col-6 h6 clr-dark-green">ttitle</div>
                <label class="radio-inline"><input type="radio" name="idname">&nbsp;Yes</label>&nbsp;
                <label class="radio-inline"><input type="radio" name="idname" checked>&nbsp;No</label>
            </div>
        `;

    var id = / /g [Symbol.replace](entry.name, "-");

    var container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);

    $("#l8r-Pain-Level").append(container);
}

function buildBPInput(entry) {
    var panel =
        `
            <div id="pnl-idname" class="row border-bottom">
                <div class="col-lg-3 col-md-3 col-sm-4 col-12 h6 clr-dark-green">ttitle</div>
                <div id="entry" class="row col-lg-9 col-md-9 col-sm-12 col-12">
                    <input id="idname" class="rounded col-lg-1 col-md-1 col-sm-1 col-1" type="text">
                    <div class="col-lg-1 col-md-1 col-sm-1 col-1 text-center">/</div>
                    <input id="idname" class="rounded col-lg-1 col-md-1 col-sm-1 col-1" type="text">
                    <div class="col-lg-1 col-md-2 col-sm-3 col-3 text-right">pulse</div>
                    <input id="idname" class="rounded col-lg-1 col-md-1 col-sm-1 col-1" type="text">
                </div>
            </div>
        `;

    var id = / /g [Symbol.replace](entry.name, "-");

    var container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);

    $("#l8r-Pain-Level").append(container);
}

function buildWeatherInput(entry) {
    var panel =
        `
        <div id="pnl-idname" class="row border-bottom">
            <div class="col-lg-3 col-md-3 col-sm-3 col-12 h6 clr-dark-green">ttitle</div>
            <div id="entry" class="row col-lg-9 col-md-9 col-sm-8 col-12 "></div>
        </div>

        `

    var items =
        `
        <input id="idname" class="rounded col-lg-1 col-md-1 col-sm-1 col-1" type="text">
        <div class="col-lg-2 col-md-2 col-sm-3 col-10 text-left">ttitle</div>
        `;

    var id = / /g [Symbol.replace](entry.name, "-");

    var container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);

    $("#l8r-Pain-Level").append(container);
    var pnl = $("#pnl-" + id);

    for (var i = 0; i < entry.list.length; ++i) {
        var id = / /g [Symbol.replace](entry.list[i], "-");
        var h = /idname/g [Symbol.replace](items, id);
        h = /ttitle/g [Symbol.replace](h, entry.list[i]);

        pnl.find("#entry").append(h);
    }
}

function buildCheckboxList(entry) {
    var panel =
        `
        <div id="pnl-idname" class="row border-bottom">
            <div class="col-lg-3 col-md-3 col-sm-4 col-12 h6 clr-dark-green">ttitle</div>
            <div id="entry" class="col-lg-9 col-md-9 col-sm-8 col-12"></div>
        </div>

        `;

    var items =
        `
        <label class="col-lg-3 col-md-3 col-sm-3 col-5">
            <input id="idname" type="checkbox">
            ttitle
        </label>
        `;

    var id = / /g [Symbol.replace](entry.name, "-");

    var container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);

    $("#l8r-Pain-Level").append(container);
    var pnl = $("#pnl-" + id);

    for (var i = 0; i < entry.list.length; ++i) {
        var id = / /g [Symbol.replace](entry.list[i], "-");
        var h = /idname/g [Symbol.replace](items, id);
        h = /ttitle/g [Symbol.replace](h, entry.list[i]);

        pnl.find("#entry").append(h);
    }
}

function procCheckboxList(listname) {
    var i = 0;
    var set = [];

    $("#" + listname + " :checked").each(function () {
        set[i++] = $(this).prop("id");
    });

    return (set);
}

function procButtons(evt, id) {
    $("#" + id + " button").removeClass("w3-light-gray");
    $(evt).addClass("w3-light-gray");

    return ($(evt).val());
}

function entryButtons(evt, id) {
    button = $(evt).text();

    switch (button) {
        case "Update":
            updateEntry(evt);
            break;
        case "New":
            newEntry(evt);
            break;
        case "Cancel":
            cancelEntry(evt);
            break;
    }

    diag();
}

Date.prototype.toDateTimeLocalString =
    function toDateTimeLocalString() {
        var date = this;
        var ten = function (i) {
            return i < 10 ? '0' + i : i;
        }
        return date.getFullYear() +
            "-" + ten(date.getMonth() + 1) +
            "-" + ten(date.getDate()) +
            "T" + ten(date.getHours()) +
            ":" + ten(date.getMinutes());
    }

Date.prototype.toDateLocalString =
    function toDateTimeLocalString() {
        var date = this;
        var ten = function (i) {
            return i < 10 ? '0' + i : i;
        }
        return date.getFullYear() +
            "-" + ten(date.getMonth() + 1) +
            "-" + ten(date.getDate()) +
            "-" + ten(date.getFullYear());
    }