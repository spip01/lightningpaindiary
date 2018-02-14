function setup() {
    setupCheckboxList("Medicines", "medications", medlist);
    setupCheckboxList("Triggers", "triggerlist", triggerlist);
    setupCheckboxList("Pain Location", "painlocation", locationlist);
    setupCheckboxList("Pain Type", "paintype", typelist);
    setupCheckboxList("Warnings", "warninglist", warninglist);
}

function setupCheckboxList(title, id, list) {
    var row = 
        '<div class="w3-row w3-container">';
    var col =
        '    <div class="w3-col" style="width:20%">' +
        '       <input id="listname" class="w3-check" style="width:12px" type="checkbox">' +
        '       <label for="listname" class="w3-small">' +
        '           listname' +
        '       </label>' +
        '    </div>';
      //'</div>'
    var html =
        '<header class="w3-container w3-light-gray" style="color: rgb(0, 78, 0);">' + title + '</header>' + row;

    for (var i = 0; i < list.length; ++i) {
        var l = list[i];
        html += col.replace("listname", l).replace("listname", l).replace("listname", l);

        if ((i + 1) % 5 == 0)
            html += '</div>' + row;
    }

    html += '</div>';

    $("#" + id).html(html);
}

function procCheckboxList(listName) {
    var i = 0;
    var set = [];

    $("input #" + listName).each(function () {
        set[i++] = $(this).text();
    });

    return (set);
}

function resetCheckboxList(listname, set) {
    $("input #" + listname).removeAttr("checked");

    for (var i = 0; i < set.length; ++i) {
        $("input #" + listname).find("#" + set[i]).setAttribute("checked");
    }
}

function painButtons(evt) {
    $("#detail").show();

    $("#painlevelpanel button").removeClass("w3-light-gray");
    $(evt).addClass("w3-light-gray");

    if (neednew) {
        $("#entryDate").val(createdDate.toDateTimeLocalString());
        newEntry();
    }

    return ($(evt).text())
}

function reliefButtons(evt) {
    $("#relieflevelpanel button").removeClass("w3-light-gray");
    $(evt).addClass("w3-light-gray");

    return ($(evt).text());
}

function entryButtons(evt) {
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
    changedDate = new Date();

    //** keep current entry date so it doesn't have to be completely reentered every time **
    //var edate = document.getElementById("entryDate");
    //edate.value = createdDate.toDateTimeLocalString();
}

function updateEntry(evt) {
    changedDate = new Date();
    entryDate = new Date($("#entryDate").val());

    medicines = procCheckboxList("medlist");
    painlocation = procCheckboxList("painlocation");
    paintype = procCheckboxList("paintype");
    triggers = procCheckboxList("triggerlist");
    warnings = procCheckboxList("warninglist");

    createdDateOld = createdDate;
    changedDateOld = changedDate;
    entryDateOld = entryDate;
    painlevelOld = painlevel;
    relieflevelOld = relieflevel;

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

    medicines = medicinesOld;
    triggers = triggersOld;
    painlocation = painlocationOld;
    paintype = paintypeOld;
    warnings = warningsOld;

    $("#entryDate").val(entryDate.toDateTimeLocalString());

    $(".setPainLevel").removeClass("w3-aqua");
    $(".setPainLevel [value|=" + painlevel + "]").addClass("w3-aqua");

    $(".setReleifLevel").removeClass("w3-aqua");
    $(".setReleifLevel [value|=" + relieflevel + "]").addClass("w3-aqua");

    resetCheckboxList(medlist, medicines);
    resetCheckboxList(triggerlist, triggers);
    resetCheckboxList(locationlist, painlocation);
    resetCheckboxList(typelist, paintype);
    resetCheckboxList(warninglist, warnings);
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
        "<br>relief: " + relieflevel);
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