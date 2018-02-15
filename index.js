function setup() {
    buildButtonBars(1, 10, false, "Pain Level", "painbuttons")
    buildButtonBars(1,5, true, "Relief Level", "reliefbuttons")
    buildButtonBars(1, 10, false, "Mood Level", "moodbuttons");

    setupCheckboxList("Medicines", "medications", medlist);
    setupCheckboxList("Pain Location", "painlocation", locationlist);
    setupCheckboxList("Pain Type", "paintype", typelist);
    setupCheckboxList("Triggers", "triggerlist", triggerlist);
    setupCheckboxList("Warnings", "warninglist", warninglist);
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

function buildButtonBars(start, end, reverse, title, id) {
    var colors = [0, "rgb(0, 255, 0)", "rgb(120, 255, 0)", "rgb(180, 255, 0)", "rgb(220, 255, 0)", "rgb(255, 255, 0)",
        "rgb(255, 225, 0)", "rgb(255, 175, 0)", "rgb(255, 125, 0)", "rgb(255, 70, 0)", "rgb(255, 0, 0)"
    ];
    var coloroffset = (colors.length - 1) / (end - start + 1);
    var button = '<button type="button" class="w3-btn w3-small w3-bar-item w3-ripple w3-hover-light-gray"' +
        ' style="background-color: colors; width:10%" value="name">name</button>';
    var html = '<header class="w3-container w3-light-gray">' + title + '</header>';

    var j = start;
    for (var i = start; i <= end; i++) {
        var k = reverse ? end - i + 1 : i;
        html += button.replace("name", k).replace("name", k).replace("colors", colors[j]);
        j += coloroffset;
    }

    $("#" + id).html(html + '<br><br>');
}

function setupCheckboxList(title, id, list) {
    var row =
        '<div class="w3-row w3-container">';
    var col =
        '    <div class="w3-col" style="width:20%">' +
        '       <input id="itemname" type="checkbox" class="w3-check" style="width:12px">' +
        '       <label for="itemname">&nbsp;itemname</label>' +
        '    </div>';
    //'</div>' // row
    var html =
        '<header class="w3-container w3-light-gray" style="color: rgb(0, 78, 0);">' + title + '</header>' + row;

    for (var i = 0; i < list.length; ++i) {
        var l = list[i];
        html += col.replace("itemname", l).replace("itemname", l).replace("itemname", l);

        if ((i + 1) % 5 == 0)
            html += /* row */ '</div>' + row;
    }

    html += /* row */ '</div>'; 

    $("#" + id).html(html + '<br>');
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
    $("#" + listname).removeProp("checked");

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

function diag() {
    $("#diag").html(
        "<br>created: " + createdDate.toISOString() +
        "<br>updated: " + changedDate.toISOString() +
        "<br>entry: " + entryDate.toISOString() +
        "<br>pain: " + painlevel +
        "<br>meds: " + medicines +
        "<br>triggers: " + triggers +
        "<br>location: " + painlocation +
        "<br>type: " + paintype +
        "<br>warnings: " + warnings +
        "<br>relief: " + relieflevel +
        "<br>mood: " + moodlevel);
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