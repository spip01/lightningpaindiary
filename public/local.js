var neednew = true;

// entry values
var createdDate = new Date();
var changedDate = new Date();
var entryDate = new Date();
var painlevel = "";
var relieflevel = "";
var moodlevel = "";

var medicines = [];
var triggers = [];
var painlocation = [];
var paintype = [];
var warnings = [];

// get these from db
var medlist = ["kepra", "relafin", "haldol", "cogentin", "benadryl", "compazine"];
var triggerlist = ["weather", "smells", "sleep"];
var locationlist = ["forehead", "temple", "eyes", "left", "right", "all"];
var typelist = ["throbbing", "burning", "pressure", "sharp"];
var warninglist = ["aura"];

// previous entry values
var createdDateOld = createdDate;
var changedDateOld = changedDate;
var entryDateOld = entryDate;
var painlevelOld = painlevel;
var relieflevelOld = relieflevel;
var moodlevelOld = moodlevel;

var medicinesOld = medicines;
var triggersOld = triggers;
var painlocationOld = painlocation;
var paintypeOld = paintype;
var warningsOld = warnings;

$(document).ready(function () {
    /*    $("#painbuttons button").click(function () {
            painlevel = painButtons(this, "painbuttons");
        });
        $("#reliefbuttons button").click(function () {
            relieflevel = procButtons(this, "reliefbuttons");
        });
        $("#moodbuttons button").click(function () {
            moodlevel = procButtons(this, "moodbuttons");
        });
        $("#entrybuttons button").click(function () {
            entryButtons(this, "entrybuttons");
        });
    */
    $("#javascript").empty();
    $("#jssite").show();

    if (!('indexedDB' in window)) {
        console.log('This browser doesn\'t support IndexedDB');
    }

    var request = indexedDB.open("diary", 1);

    request.onupgradeneeded = function () {
        doUpgrade(request);
    };

    request.onerror = function (event) {
        console.log("error loading db: " + request.error);
    };

    request.onsuccess = function () {
        db = request.result;

        setup(db);
    };
});

function setup(db) {
    var store = db.transaction(["tracking"], "readwrite").objectStore("tracking");
    var cursor = store.index('by_position').openCursor();
    cursor.onsuccess = function (event) {
        var cursor = event.target.result;

        if (cursor) {
            var entry = cursor.value;

            //var trackerstypes = ["blood pressure", "date", "list", "number",
            //"range", "range buttons", "range slider",
            //"text", "time", "true false", "weather"];

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
                case "range buttons":
                    buildButtonBars(entry);
                    break;
                case "range slider":
                    buildSlider(entry);
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
            <div class="col-lg-4 col-md-4 col-sm-4 col-6 h4 clr-dark-green">ttitle</div>
            <div id="entry" class="row col-lg-8 col-md-8 col-sm-8 col-6"></div>
            </div>
        `;

    var item =
        `
                    <button type="button" class="btn btn-sm" style="background-color: colors; width:10%" value="ttitle">ttitle</button>
        `;

    var id = / /g [Symbol.replace](entry.name, "-");

    var container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);

    $("#panels").append(container);
    var pnl = $("#pnl-" + id);

    if (entry.start < entry.end) {
        for (var i = entry.start; i <= entry.end; i++) {
            var c = 120 - (i - entry.start) / (entry.end - entry.start) * 120;
            var h = /ttitle/g [Symbol.replace](item, i);
            h = h.replace("colors", "hsl(" + c + ",100%,50%)");

            $(pnl).find("#entry").append(h);
        }
    } else {
        for (var i = entry.start; i >= entry.end; i--) {
            var c = (i - entry.end) / (entry.start - entry.end) * 120;

            var h = /ttitle/g [Symbol.replace](item, i);
            h = h.replace("colors", "hsl(" + c + ",100%,50%)");

            $(pnl).find("#entry").append(h);
        }
    }
}

function buildSlider(entry) {
    var panel =
        `
            <div id="pnl-idname" class="row border-bottom">
                <div class="col-lg-4 col-md-4 col-sm-4 col-6 h4 clr-dark-green">ttitle</div>
                <div class="range range-primary col-lg-8 col-md-8 col-sm-8 col-8">
                    <input type="range" name="range" min="istart" max="iend" value="istart" onchange="rangePrimary.value=value" style="width: 90%">&nbsp;
                    <output id="rangePrimary" class="h5">istart</output>
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

function buildTextInput(entry) {
    var panel =
        `
            <div id="pnl-idname" class="row border-bottom">
                <div class="col-lg-4 col-md-4 col-sm-4 col-4 h4 clr-dark-green">ttitle</div>
                <textarea id="txt" rows="2" class="rounded col-lg-8 col-md-8 col-sm-8 col-8"></textarea>
            </div>
        `;

    var id = / /g [Symbol.replace](entry.name, "-");

    var container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);

    $("#panels").append(container);
}

function buildNumInput(entry) {
    var panel =
        `
            <div id="pnl-idname" class="row border-bottom">
                <div class="col-lg-4 col-md-4 col-sm-4 col-4 h4 clr-dark-green">ttitle</div>
                <input id="num" type="text" class="rounded col-lg-1 col-md-1 col-sm-1 col-1">
            </div>
        `;

    var id = / /g [Symbol.replace](entry.name, "-");

    var container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);

    $("#panels").append(container);
}

function buildDateInput(entry) {
    var panel =
        `
            <div id="pnl-idname" class="row border-bottom">
                <div class="col-lg-4 col-md-4 col-sm-4 col-6 h4 clr-dark-green">ttitle</div>
                <input id="num" type="date" class="rounded col-lg-3 col-md-3 col-sm-3 col-6">
            </div>
        `;

    var id = / /g [Symbol.replace](entry.name, "-");

    var container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);

    $("#panels").append(container);
}

function buildTimeInput(entry) {
    var panel =
        `
            <div id="pnl-idname" class="row border-bottom">
                <div class="col-lg-4 col-md-4 col-sm-4 col-6 h4 clr-dark-green">ttitle</div>
                <input id="num" type="time" class="rounded col-lg-3 col-md-3 col-sm-3 col-6">
            </div>
        `;

    var id = / /g [Symbol.replace](entry.name, "-");

    var container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);

    $("#panels").append(container);
}

function buildBoolInput(entry) {
    var panel =
        `
            <div id="pnl-idname" class="row border-bottom">
                <div class="col-lg-4 col-md-4 col-sm-4 col-6 h4 clr-dark-green">ttitle</div>
                <label class="radio-inline"><input type="radio" name="idname">&nbsp;Yes</label>&nbsp;
                <label class="radio-inline"><input type="radio" name="idname" checked>&nbsp;No</label>
            </div>
        `;

    var id = / /g [Symbol.replace](entry.name, "-");

    var container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);

    $("#panels").append(container);
}

function buildBPInput(entry) {
    var panel =
        `
            <div id="pnl-idname" class="row border-bottom">
                <div class="col-lg-4 col-md-4 col-sm-4 col-12 h4 clr-dark-green">ttitle</div>
                <input id="idname" class="rounded col-lg-1 col-md-1 col-sm-1 col-1" type="text">
                <div class="col-lg-1 col-md-1 col-sm-1 col-1 text-center">/</div>
                <input id="idname" class="rounded col-lg-1 col-md-1 col-sm-1 col-1" type="text">
                <div class="col-lg-1 col-md-1 col-sm-2 col-3 text-right">pulse</div>
                <input id="idname" class="rounded col-lg-1 col-md-1 col-sm-1 col-1" type="text">
                </div>
        `;

    var id = / /g [Symbol.replace](entry.name, "-");

    var container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);

    $("#panels").append(container);
}

function buildWeatherInput(entry) {
    var panel =
        `
        <div id="pnl-idname" class="row border-bottom">
            <div class="col-lg-4 col-md-3 col-sm-3 col-12 h4 clr-dark-green">ttitle</div>
        </div>

        `

    var items =
        `
        <div class="col-lg-1 col-md-2 col-sm-2 col-4 text-right">ttitle</div>
        <input id="idname" class="rounded col-lg-1 col-md-1 col-sm-1 col-1" type="text">
        `;

    var id = / /g [Symbol.replace](entry.name, "-");

    var container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);

    $("#panels").append(container);
    var pnl = $("#pnl-" + id);

    for (var i = 0; i < entry.list.length; ++i) {
        var id = / /g [Symbol.replace](entry.list[i], "-");
        var h = /idname/g [Symbol.replace](items, id);
        h = /ttitle/g [Symbol.replace](h, entry.list[i]);

        $(pnl).append(h);
    }}

function buildCheckboxList(entry) {
    var panel =
        `
        <div id="pnl-idname" class="border-bottom">
            <div class="row col-lg-4 col-md-4 col-sm-4 col-8 h4 clr-dark-green">ttitle</div>
            <div id="entry" class="row"></div>
        </div>

        `;

    var items =
        `
        <label class="col-lg-2 col-md-3 col-sm-3 col-6">
            <input id="idname" type="checkbox">
            ttitle
        </label>
        `;

    var id = / /g [Symbol.replace](entry.name, "-");

    var container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);

    $("#panels").append(container);
    var pnl = $("#pnl-" + id);

    for (var i = 0; i < entry.list.length; ++i) {
        var id = / /g [Symbol.replace](entry.list[i], "-");
        var h = /idname/g [Symbol.replace](items, id);
        h = /ttitle/g [Symbol.replace](h, entry.list[i]);

        $(pnl).find("#entry").append(h);
    }
}

function procCheckboxLists() {
    medicines = procCheckboxList("medications");
    painlocation = procCheckboxList("painlocation");
    paintype = procCheckboxList("paintype");
    triggers = procCheckboxList("triggerlist");
    warnings = procCheckboxList("warninglist");
}

function resetCheckboxLists() {
    resetCheckboxList("medications", medlist, medicines);
    resetCheckboxList("painlocation", locationlist, painlocation);
    resetCheckboxList("paintype", typelist, paintype);
    resetCheckboxList("triggerlist", triggerlist, triggers);
    resetCheckboxList("warninglist", warninglist, warnings);
}

function procCheckboxList(listname) {
    var i = 0;
    var set = [];

    $("#" + listname + " :checked").each(function () {
        set[i++] = $(this).prop("id");
    });

    return (set);
}

function resetCheckboxList(listname, list, set) {
    $("#" + listname + " :checked").each(function () {
        $(this).trigger("click");
    });

    for (var i = 0; i < set.length; ++i) {
        $("#" + set[i]).prop("checked", "checked");

    }
}

function painButtons(evt, id) {
    $("#detail").show();

    if (neednew) {
        $("#entryDate").val(createdDate.toDateTimeLocalString());
        newEntry();
    }

    return (procButtons(evt, id));
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

function newEntry(evt) {
    neednew = false;
    createdDate = new Date();
    changedDate = new Date(createdDate);

    // start from last editDate not createdDate
    //editDate = new Date(createdDate);
}

function updateEntry(evt) {
    changedDate = new Date();
    entryDate = new Date($("#entryDate").val());

    procCheckboxLists();

    createdDateOld = createdDate;
    changedDateOld = changedDate;
    entryDateOld = entryDate;
    painlevelOld = painlevel;
    relieflevelOld = relieflevel;
    moodlevelOld = moodlevel;

    medicinesOld = medicines;
    triggersOld = triggers;
    painlocationOld = painlocation;
    paintypeOld = paintype;
    warningsOld = warnings;
}

function cancelEntry(evt) {
    createdDate = createdDateOld;
    changedDate = changedDateOld;
    entryDate = entryDateOld;
    painlevel = painlevelOld;
    relieflevel = relieflevelOld;
    moodlevel = moodlevelOld;

    medicines = medicinesOld;
    triggers = triggersOld;
    painlocation = painlocationOld;
    paintype = paintypeOld;
    warnings = warningsOld;

    $("#entryDate").val(entryDate.toDateTimeLocalString());

    $("#painbuttons button").removeClass("w3-light-gray");
    $("#painbuttons [value|='" + painlevel + "']").addClass("w3-light-gray");

    $("#reliefbuttons button").removeClass("w3-light-gray");
    $("#reliefbuttons [value|='" + relieflevel + "']").addClass("w3-light-gray");

    $("#moodbuttons button").removeClass("w3-light-gray");
    $("#moodbuttons [value|='" + moodlevel + "']").addClass("w3-light-gray");

    resetCheckboxLists();
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