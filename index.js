function setup() {
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
    resetCheckboxList("medications", medicines);
    resetCheckboxList("painlocation", painlocation);
    resetCheckboxList("paintype", paintype);
    resetCheckboxList("triggerlist", triggers);
    resetCheckboxList("warninglist", warnings);
}

function setupCheckboxList(title, id, list) {
    var row =
        '<div class="w3-row w3-container">';
    var col =
        '    <div class="w3-col" style="width:20%">' +
        '       <input id="itemname" class="w3-check" style="width:12px" type="checkbox">' +
        '       <label for="itemname">&nbsp;' +
        '           itemname' +
        '       </label>' +
        '    </div>';
    //'</div>'
    var html =
        '<header class="w3-container w3-light-gray" style="color: rgb(0, 78, 0);">' + title + '</header>' + row;

    for (var i = 0; i < list.length; ++i) {
        var l = list[i];
        html += col.replace("itemname", l).replace("itemname", l).replace("itemname", l);

        if ((i + 1) % 5 == 0)
            html += '</div>' + row;
    }

    html += '</div>';

    $("#" + id).html(html);
}

function procCheckboxList(listname) {
    //  <div id="medications">
    //      <header class="w3-container w3-light-gray" style="color: rgb(0, 78, 0);">Medicines</header>
    //      <div class="w3-row w3-container">
    //          <div class="w3-col" style="width:20%">
    //              <input id="kepra" class="w3-check" style="width:12px" type="checkbox">
    //              <label for="kepra" class="w3-small"> kepra </label>
    //          </div>
    //          <div class="w3-col" style="width:20%">
    //              <input id="relafin" class="w3-check" style="width:12px" type="checkbox">
    //              <label for="relafin" class="w3-small"> relafin </label>
    //          </div>
    //      </div>
    //      <div class="w3-row w3-container">
    //          <div class="w3-col" style="width:20%">
    //              <input id="compazine" class="w3-check" style="width:12px" type="checkbox">
    //              <label for="compazine" class="w3-small"> compazine </label>
    //          </div>
    //      </div>
    //  </div>

    var i = 0;
    var set = [];

    $("#" + listname + " :checked").each(function () {
        set[i++] = $(this).prop("id");
    });

    return (set);
}

function resetCheckboxList(listname, set) {
    $("#" + listname).removeProp("checked");

    for (var i = 0; i < set.length; ++i) {
        $("#" + set[i]).prop("checked", "checked");
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

    procCheckboxLists();

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

    $("#painlevelpanel button").removeClass("w3-light-gray");
    $("#painlevelpanel [value|=" + painlevel + "]").addClass("w3-light-gray");

    $("#relieflevelpanel button").removeClass("w3-light-gray");
    $("#relieflevelpanel [value|=" + relieflevel + "]").addClass("w3-light-gray");

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