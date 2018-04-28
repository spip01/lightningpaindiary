let accountdb;
let diarydb;
const openweatherapikey = "36241d90d27162ebecabf6c334851f16";
const stripid = /^.*?-(.*)/g;

loadHtml("https://lightningpaindiary.firebaseapp.com/navbar.html", "#navbar");
loadHtml("https://lightningpaindiary.firebaseapp.com/footer.html", "#footer");

const trackerstypes = ["blood pressure", "date", "list", "number", "range", "text",
    "time", "true false", "weather"
];

const trackerslist = [ // sql, can't reuse names with stored data unless confirmed by user for deletion
    // new user start pain level, start time, remedies, relief
    {
        name: "Date",
        type: "date",
        fixed: true,
    }, {
        name: "Time",
        type: "time",
        fixed: true,
    }, {
        name: "Pain Level",
        type: "range",
        start: "1",
        end: "10",
        fixed: true,
    }, {
        name: "Woke Up With",
        type: "true false",
    }, {
        name: "Lasted All Day",
        type: "true false",
    }, {
        name: "End Time",
        type: "time",
    }, {
        name: "Pain Location",
        type: "list",
        list: ["forehead", "temple", "eyes", "left", "right"],
    }, {
        name: "Pain Type",
        type: "list",
        list: ["throbbing", "burning", "pressure", "sharp"],
    }, {
        name: "Sensitivities",
        type: "list",
        list: ["light", "sound"],
    }, {
        name: "Remedies",
        type: "list",
        list: ["Kepra", "Relafin", "Haldol", "Cogentin", "Benadryl", "Compazine", "sleep"],
    }, {
        name: "Triggered By",
        type: "list",
        list: ["weather", "smell", "sleep", "light", "noise"],
    }, {
        name: "Warnings",
        type: "list",
        list: ["aura", "tunnel vision", "light sensitivity", "sound sensitivity",
            "smell sensitivity"
        ],
    }, {
        name: "Pain Relief",
        type: "range",
        start: "5",
        end: "1",
    }, {
        name: "Mood Level",
        type: "range",
        start: "5",
        end: "1",
    }, {
        name: "Blood Pressure",
        type: "blood pressure",
    }, {
        name: "Weight",
        type: "number",
    }, {
        name: "Weather",
        type: "weather",
        list: ["temp", "humidity", "pressure", "wind", "clouds", "description"],
        // http://openweathermap.org/api
    }, {
        name: "Notes",
        type: "text",
    }
];

function doReqError(errstr) {
    console.log("error loading account: " + errstr);
};

function doAccountUpgrade(db) {
    let store = db.createObjectStore("account", {
        autoIncrement: true
    });

    store.createIndex("by_position", "position", {
        unique: true
    });

    store.createIndex("by_name", "name", {
        unique: true
    });

    let account = {};
    account.name = "Account";
    account.type = "account";
    account.position = 0;
    account.lastposition = 0;
    account.lastreport = "all on";
    account.ifdefault = true;
    account.city = "";
    account.state = "";
    account.country = "";
    account.metric = false;
    account.ifnotify = false;
    account.ifemail = false;
    account.email = "";
    account.ifsms = false;
    account.phone = "";
    account.notifylist = [];

    for (let i = 0; i < trackerslist.length; ++i) {
        let tracker = trackerslist[i];
        tracker.position = ++account.lastposition;

        store.add(tracker);
    }

    store.add(account);
}

function loadHtml(url, selector) {
    loadFile(url, function (data) {
        let html = data.replace(/(?:.*?\n)*?<body>((?:.*?\n)+?)<\/body>(.*?\n?)*/g, "$1");
        $(selector).append(html);
    });
}

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
    function () {
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
    function () {
        let date = this;
        let ten = function (i) {
            return i < 10 ? '0' + i : i;
        }
        return ten(date.getHours()) +
            ":" + ten(date.getMinutes());
    }

Date.prototype.toDateString =
    function () {
        let date = this;
        let ten = function (i) {
            return i < 10 ? '0' + i : i;
        }
        return date.getFullYear() +
            "-" + ten(date.getMonth() + 1) +
            "-" + ten(date.getDate());
    }