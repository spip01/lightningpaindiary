function setupCheckboxList(title, id, list) {
    var panel = document.getElementById(id);
    var row = '<div class="w3-row">';
    var col =
        '<div class="w3-col" style="width:20%">' +
        '<input id = "iname" class = "w3-check" style = "width:12px" type = "checkbox">' +
        '<label for = "iname" class = "w3 - small">' +
        'iname' +
        '</label>' +
        '</div>';
    var html = '<header class="w3-container w3-light-gray" style="color: rgb(0, 78, 0);">' +
        title +
        '</header>' +
        row;

    var items = list.split(",").sort();
    for (i = 0; i < items.length; ++i) {
        html += col.replace("iname", items[i]).replace("iname", items[i]).replace("iname", items[i]);

        if ((i + 1) % 5 == 0)
            html += '</div>' + row;
    }

    html += '</div></div>';
    panel.innerHTML += html;
}

function procCheckboxList(list) {
    var rstr = "";
    var items = list.split(",").sort();

    $(: checked)
    for (i = 0; i < items.length; ++i) {
        id = "#" + items[i];
        $(id)
        chk = document.getElementById(items[i]);
        if (chk.checked)
            rstr += items[i] + ",";
    }

    rstr = rstr.slice(0, rstr.length - 1);

    return rstr;
}

function resetCheckboxList(list, set) {
    var items = list.split(",").sort();
    var setitems = set.split(",").sort();

    var i, j;

    for (i = 0; i < items.length; ++i) {
        chk = document.getElementById(items[i]);
        chk.removeAttribute("checked");

        for (j = 0; j < setitems.length; ++j) {
            if (items[i] == setitems[j]) {
                chk.setAttribute("checked", "");
                break;
            }
        }
    }
}

function painButtons(event) {
    painlevel = event.currentTarget.innerText;

    var panel = document.getElementById("detail");
    if (panel.style.display === "none") {
        panel.style.display = "block";

        var edate = document.getElementById("entryDate");
        edate.value = createdDate.toDateTimeLocalString();

        newEntry()
        diag();
    }

    var i;
    var pl = document.getElementsByClassName("setPainLevel");

    for (i = 0; i < pl.length; i++) {
        pl[i].className = pl[i].className.replace(" w3-aqua", "");
    }

    event.currentTarget.className += " w3-aqua";
}

function reliefButtons(event) {
    relieflevel = event.currentTarget.innerText;

    var i;
    var rl = document.getElementsByClassName("setReliefLevel");

    $()
    for (i = 0; i < rl.length; i++) {
        rl[i].className = rl[i].className.replace(" w3-aqua", "");
    }

    event.currentTarget.className += " w3-aqua";
}

function entryButtons(event) {
    if (event.currentTarget.innerText == "Update")
        updateEntry();
    else if (event.currentTarget.innerText == "New")
        newEntry();
    else if (event.currentTarget.innerText == "Cancel")
        cancelEntry()

    diag();
}

function newEntry() {
    createdDate = new Date();
    changedDate = new Date();

    //** keep current entry date so it doesn't have to be completely reentered every time **
    //var edate = document.getElementById("entryDate");
    //edate.value = createdDate.toDateTimeLocalString();
}

function updateEntry() {
    changedDate = new Date();

    var edate = document.getElementById("entryDate");
    entryDate = new Date(edate.value);

    medicines = procCheckboxList(medlist);
    triggers = procCheckboxList(triggerlist);
    painlocation = procCheckboxList(locationlist);
    paintype = procCheckboxList(typelist);
    warnings = procCheckboxList(warninglist);

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

function cancelEntry() {
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

    var edate = document.getElementById("entryDate");
    edate.value = entryDate.toDateTimeLocalString();

    var i;
    var pl = document.getElementsByClassName("setPainLevel");

    for (i = 0; i < pl.length; i++) {
        if (painlevel == pl[i].innerText)
            pl[i].className += " w3-aqua";
        else
            pl[i].className = pl[i].className.replace(" w3-aqua", "");
    }

    pl = document.getElementsByClassName("setReliefLevel");

    for (i = 0; i < pl.length; i++) {
        if (relieflevel == pl[i].innerText)
            pl[i].className += " w3-aqua";
        else
            pl[i].className = pl[i].className.replace(" w3-aqua", "");
    }

    resetCheckboxList(medlist, medicines);
    resetCheckboxList(triggerlist, triggers);
    resetCheckboxList(locationlist, painlocation);
    resetCheckboxList(typelist, paintype);
    resetCheckboxList(warninglist, warnings);
}

function diag() {
    var diag = document.getElementById("diag");
    diag.innerHTML =
        "<br>created: " + createdDate.toISOString() +
        "<br>updated: " + changedDate.toISOString() +
        "<br>entry: " + entryDate.toISOString() +
        "<br>pain: " + painlevel +
        "<br>meds: " + medicines +
        "<br>triggers: " + triggers +
        "<br>location: " + painlocation +
        "<br>type: " + paintype +
        "<br>warnings: " + warnings +
        "<br>relief: " + relieflevel;
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