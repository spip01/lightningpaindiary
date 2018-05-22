'use strict';

$(document).ready(function () {
    startUp();

    $("#save").click(function () {
        lpd.updateEntry();
    });

    $("#cancel").click(function () {
        if (lpd.lastvalue)
            lpd.doDiaryDisplay(lpd.lastvalue);
    });
});

lightningPainDiary.prototype.updateEntry = function () {
    let value = {};

    for (let i = 0; i < this.trackerlist.length; ++i) {
        let entry = this.trackerlist[i];

        switch (entry.type) {
            case "blood pressure":
                value[entry.name] = this.extractBPInput(entry);
                break;
            case "date":
                value[entry.name] = this.extractDateInput(entry);
                break;
            case "list":
                value[entry.name] = this.extractCheckboxList(entry);
                break;
            case "number":
                value[entry.name] = this.extractNumInput(entry);
                break;
            case "range":
                value[entry.name] = this.extractRange(entry);
                break;
            case "text":
                value[entry.name] = this.extractTextInput(entry);
                break;
            case "time":
                value[entry.name] = this.extractTimeInput(entry);
                break;
            case "true false":
                value[entry.name] = this.extractBoolInput(entry);
                break;
            case "weather":
                value[entry.name] = this.extractWeatherInput(entry);
                break;
        }
    }

    this.doDiaryEntryWrite(value);
}

lightningPainDiary.prototype.doDiaryDisplay = function (value) {
    this.lastvalue = value;

    for (let i = 0; i < this.trackerlist.length; ++i) {
        let entry = this.trackerlist[i];

        switch (entry.type) {
            case "blood pressure":
                this.setBPInput(value[entry.name]);
                break;
            case "date":
                this.setDateInput(value[entry.name]);
                break;
            case "list":
                this.setCheckboxList(value[entry.name]);
                break;
            case "number":
                this.setNumInput(value[entry.name]);
                break;
            case "range":
                this.setRange(value[entry.name]);
                break;
            case "text":
                this.setTextInput(value[entry.name]);
                break;
            case "time":
                this.setTimeInput(value[entry.name]);
                break;
            case "true false":
                this.setBoolInput(value[entry.name]);
                break;
            case "weather":
                this.setWeatherInput(value[entry.name]);
                break;
        }
    }
}

lightningPainDiary.prototype.doTrackerDisplay = function () {
    $("#panels").empty();

    for (let i = 0; i < this.trackerlist.length; ++i) {
        let entry = this.trackerlist[i];

        switch (entry.type) {
            case "blood pressure":
                this.buildBPInput(entry);
                break;
            case "date":
                this.buildDateInput(entry);
                break;
            case "list":
                this.buildCheckboxList(entry);
                break;
            case "number":
                this.buildNumInput(entry);
                break;
            case "range":
                this.buildRange(entry);
                break;
            case "text":
                this.buildTextInput(entry);
                break;
            case "time":
                this.buildTimeInput(entry);
                break;
            case "true false":
                this.buildBoolInput(entry);
                break;
            case "weather":
                this.buildWeatherInput(entry);
                break;
        }
    }

    $("#panels").show();

    $("#panels button").click(function () {
        lpd.procRange(this);
    });
}

lightningPainDiary.prototype.buildRange = function (entry) {
    const panel =
        `
        <div id="pnl-idname" class="row border-bottom">
            <div class="col-lg-3 col-md-3 col-sm-3 col-12 h6 clr-dark-green">ttitle</div>
            <div id="entry" class="row col-lg-9 col-md-9 col-sm-9 col-12"></div>
        </div>
        <div id="l8r-idname" style="display: none"></div>
        `;

    const item = `<button id="btn-ttitle" type="button" class="btn btn-sm" style="background-color: colors; width:10%">ttitle</button>`;

    let id = / /g [Symbol.replace](entry.name, "-");

    let container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);

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

            let btn = pnl.find("#entry").append(h);
        }
    }
}

lightningPainDiary.prototype.extractRange = function (entry) {
    let id = / /g [Symbol.replace](entry.name, "-");
    let btn = $("#pnl-" + id + " .btn-green").prop("id");
    return (btn ? btn.replace(/btn-(\d+)/g, "$1") : "");
}

lightningPainDiary.prototype.setRange = function (entry, val) {
    let id = / /g [Symbol.replace](entry.name, "-");
    let btn = $("#pnl-" + id).removeClass("btn-green");
    let btn = $("#pnl-" + id + " #btn-" + val).addclass("btn-green");
}

lightningPainDiary.prototype.procRange = function (evt) {
    $(evt).parent().find("button").removeClass("btn-green");
    $(evt).addClass("btn-green");
}

lightningPainDiary.prototype.buildTextInput = function (entry) {
    const panel =
        `
        <div id="pnl-idname" class="row border-bottom">
            <div class="col-lg-3 col-md-3 col-sm-3 col-12 h6 clr-dark-green">ttitle</div>
            <textarea id="txt" rows="2" class="rounded col-lg-8 col-md-8 col-sm-8 col-12"></textarea>
            </div>
        `;

    let id = / /g [Symbol.replace](entry.name, "-");

    let container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);

    $("#panels").append(container);
}

lightningPainDiary.prototype.extractTextInput = function (entry) {
    let id = / /g [Symbol.replace](entry.name, "-");
    return ($("#pnl-" + id + " #txt").val());
}

lightningPainDiary.prototype.setTextInput = function (entry, val) {
    let id = / /g [Symbol.replace](entry.name, "-");
    $("#pnl-" + id + " #txt").val(val);
}

lightningPainDiary.prototype.buildNumInput = function (entry) {
    const panel =
        `
        <div id="pnl-idname" class="row border-bottom">
            <div class="col-lg-3 col-md-3 col-sm-3 col-6 h6 clr-dark-green">ttitle</div>
            <div id="entry" class="row col-lg-9 col-md-9 col-sm-8 col-6">
                <input id="num" type="text" class="rounded col-lg-1 col-md-2 col-sm-2 col-7">
            </div>
        </div>
        `;

    let id = / /g [Symbol.replace](entry.name, "-");

    let container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);

    $("#panels").append(container);
}

lightningPainDiary.prototype.extractNumInput = function (entry) {
    let id = / /g [Symbol.replace](entry.name, "-");
    return (Number($("#pnl-" + id + " #num").val()));
}

lightningPainDiary.prototype.setNumInput = function (entry, val) {
    let id = / /g [Symbol.replace](entry.name, "-");
    $("#pnl-" + id + " #num").val(val);
}

lightningPainDiary.prototype.buildDateInput = function (entry, diary) {
    const panel =
        `
        <div id="pnl-idname" class="row border-bottom">
            <div class="col-lg-3 col-md-3 col-sm-3 col-6 h6 clr-dark-green">ttitle</div>
            <input id="date" type="date" class="rounded col-lg-3 col-md-3 col-sm-3 col-6">
        </div>
        `;

    let id = / /g [Symbol.replace](entry.name, "-");

    let container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);

    $("#panels").append(container);
}

lightningPainDiary.prototype.extractDateInput = function (entry) {
    let id = / /g [Symbol.replace](entry.name, "-");
    return ($("#pnl-" + id + " #date").val());
}

lightningPainDiary.prototype.setDateInput = function (entry, val) {
    let id = / /g [Symbol.replace](entry.name, "-");
    $("#pnl-" + id + " #date").val(val);
}

lightningPainDiary.prototype.buildTimeInput = function (entry, diary) {
    const panel =
        `
        <div id="pnl-idname" class="row border-bottom">
            <div class="col-lg-3 col-md-3 col-sm-3 col-6 h6 clr-dark-green">ttitle</div>
            <input id="time" type="time" class="rounded col-lg-3 col-md-3 col-sm-3 col-6">&nbsp;
            <button type="button" class="btn border btn-sm btn-green">Now</button>&nbsp;
        </div>
        `;

    let id = / /g [Symbol.replace](entry.name, "-");

    let container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);

    $("#panels").append(container);

    $("#pnl-" + id + " button").click(function () {
        let now = new Date();
        $(this).parent().find("input").val(now.toLocalTimeString());
        $("#pnl-Date input").val(now.toDateString());
    });
}

lightningPainDiary.prototype.extractTimeInput = function (entry) {
    let id = / /g [Symbol.replace](entry.name, "-");
    return ($("#pnl-" + id + " #time").val());
}

lightningPainDiary.prototype.setTimeInput = function (entry, val) {
    let id = / /g [Symbol.replace](entry.name, "-");
    $("#pnl-" + id + " #time").val(val);
}

lightningPainDiary.prototype.buildBoolInput = function (entry, diary) {
    const panel =
        `
        <div id="pnl-idname" class="row border-bottom">
            <div class="col-lg-3 col-md-3 col-sm-3 col-6 h6 clr-dark-green">ttitle</div>
            <label class="radio-inline"><input id="yes" type="radio" name="idname">&nbsp;Yes</label>&nbsp;
            <label class="radio-inline"><input id="no" type="radio" name="idname">&nbsp;No</label>
        </div>
        `;

    let id = / /g [Symbol.replace](entry.name, "-");

    let container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);

    $("#panels").append(container);
}

lightningPainDiary.prototype.extractBoolInput = function (entry) {
    let id = / /g [Symbol.replace](entry.name, "-");
    return ($("#pnl-" + id + " :checked").prop("id") === "yes");
}

lightningPainDiary.prototype.setBoolInput = function (entry, val) {
    let id = / /g [Symbol.replace](entry.name, "-");
    $("#pnl-" + id).removeAttr("checked");
    $("#pnl-" + id + val === "yes" ? " yes" : " no").prop("checked", true);
}

lightningPainDiary.prototype.buildBPInput = function (entry) {
    const panel =
        `
        <div id="pnl-idname" class="row border-bottom">
            <div class="col-lg-3 col-md-3 col-sm-3 col-6 h6 clr-dark-green">ttitle</div>
            <div id="entry" class="row col-lg-9 col-md-9 col-sm-9 col-6">
                <input id="high" class="rounded col-lg-1 col-md-2 col-sm-2 col-7" type="text">
                <div class="col-lg-1 col-md-1 col-sm-1 col-3 text-center">/</div>
                <input id="low" class="rounded col-lg-1 col-md-2 col-sm-2 col-7" type="text">
                <input id="pulse" class="rounded col-lg-1 col-md-2 col-sm-2 col-7" type="text">
                &nbsp;pulse
            </div>
        </div>
        `;

    let id = / /g [Symbol.replace](entry.name, "-");

    let container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);

    $("#panels").append(container);
}

lightningPainDiary.prototype.extractBPInput = function (entry) {
    let id = / /g [Symbol.replace](entry.name, "-");
    let value = {
        high: Number($("#pnl-" + id + " #high").val()),
        low: Number($("#pnl-" + id + " #low").val()),
        pulse: Number($("#pnl-" + id + " #pulse").val()),
    };

    return (value);
}

lightningPainDiary.prototype.setBPInput = function (entry, val) {
    let id = / /g [Symbol.replace](entry.name, "-");
    $("#pnl-" + id + " #high").val(val.high);
    $("#pnl-" + id + " #low").val(val.low);
    $("#pnl-" + id + " #pulse").val(val.pulse);
}

lightningPainDiary.prototype.buildCheckboxList = function (entry) {
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
            <input id="idname" type="checkbox">
            ttitle
        </label>
        `;

    const add = `<input id="add-idname" class="rounded col-lg-3 col-md-3 col-sm-3 col-6" placeholder="ttitle">`;

    let id = / /g [Symbol.replace](entry.name, "-");

    let container = /idname/g [Symbol.replace](panel, id);
    container = /ttitle/g [Symbol.replace](container, entry.name);

    $("#panels").append(container);
    let pnl = $("#pnl-" + id);

    for (let i = 0; i < entry.list.length; ++i) {
        let id = / /g [Symbol.replace](entry.list[i], "-");
        let h = /idname/g [Symbol.replace](items, id);
        h = /ttitle/g [Symbol.replace](h, entry.list[i]);

        pnl.find("#entry").append(h);
    }

    let h = /idname/g [Symbol.replace](add, id);
    h = /ttitle/g [Symbol.replace](h, "add item");
    pnl.find("#entry").append(h);
}

lightningPainDiary.prototype.extractCheckboxList = function (entry) {
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

lightningPainDiary.prototype.buildWeatherInput = function (entry) {
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

    $("#panels").append(container);
}

lightningPainDiary.prototype.extractWeatherInput = function (entry) {
    let id = / /g [Symbol.replace](entry.name, "-");
    let value = {};

    $("#pnl-" + id + " input").each(function () {
        value[$(this).parent().prop("id").replace(stripid, "$1")] = $(this).val();
    });
    value.icon = $("#pnl-" + id + " img").prop("src").replace(/^.*\/(.+?).png/g, "$1");

    return (value);
}

lightningPainDiary.prototype.setWeatherInput = function (entry, val) {
    let id = / /g [Symbol.replace](entry.name, "-");

    $("#pnl-" + id + " input").each(function () {
        $(this).val(val[$(this).parent().prop("id").replace(stripid, "$1")]);
    });
    
    $("#pnl-" + id + " img").prop("src", val.icon);
}

lightningPainDiary.prototype.loadWeather = function (entry) {
    const items =
        `
            <div id="in-idname" class="col-lg-4 col-md-4 col-sm-6 col-12">
                <input class="rounded col-lg-4 col-md-5 col-sm-6 col-6" type="text">
                &nbsp;ttitle
            </div>
            `;
    const icon = `<img src="https://openweathermap.org/img/w/iicon.png">`;
    const button = `<button type="button" class="btn border btn-sm btn-green">Now</button>&nbsp;`;

    let id = / /g [Symbol.replace](entry.name, "-");
    let pnl = $("#pnl-" + id + " [id|='val']");
    pnl.empty();

    let url = "https://api.openweathermap.org/data/2.5/weather?q=" + this.account.city + "," +
        this.account.state + "," + this.account.country + "&units=" + (this.account.ifmetric ? "metric" : "imperial") +
        "&appid=" + openweatherapikey;

    loadFile(url, null, function (data) {
        for (let i = 0; i < entry.list.length; ++i) {
            let name = entry.list[i];
            let value;

            let iid = / /g [Symbol.replace](name, "-");
            let h = /idname/g [Symbol.replace](items, iid);
            h = /ttitle/g [Symbol.replace](h, name);
            let j = "";

            pnl.append(h);

            if (name === "description") {
                pnl.find("#in-description input").prop("class", "rounded col-lg-8 col-md-10 col-sm-10 col-10")
                pnl.find("#in-description input").after(j);
            }
        }

        let h = /idname/g [Symbol.replace](button, id);
        pnl.append(h);

        pnl.find("button").click(function () {
            lpd.loadWeather(entry);
        });
    });
}