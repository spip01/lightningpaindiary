'use strict';

var lpd;
/*
ui.start('#firebaseui-auth-container', {
    signInOptions: [
        // List of OAuth providers supported.
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
        firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        firebase.auth.GithubAuthProvider.PROVIDER_ID
    ],
});
*/

function startUp() {
    $("#javascript").empty();
    $("#jssite").show();

    loadHtml("https://lightningpaindiary.firebaseapp.com/navbar.html", "http://raw.githubusercontent.com/spip01/lightningpaindiary/firebase/public/navbar.html", "#navbar");
    loadHtml("https://lightningpaindiary.firebaseapp.com/footer.html", "http://raw.githubusercontent.com/spip01/lightningpaindiary/firebase/public/footer.html", "#footer");

    lpd = new lightningPainDiary();

    lpd.init();
    lpd.initFirebase();
}

function lightningPainDiary() {
    this.account = {};
    this.trackerlist = [];
    this.report = [];

    this.fbauth = null;
    this.fbdatabase = null;
    this.fbstorage = null;
}

const trackertypes = ["blood pressure", "date", "list", "number", "range", "text",
    "time", "true false", "weather"
];

const demotrackerlist = [{
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
    list: ["forehead", "temple", "eyes", "left", "center", "right"],
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
    list: ["temp", "humidity", "pressure", "wind", "clouds", "description", "icon"],
    // http://openweathermap.org/api
}, {
    name: "Notes",
    type: "text",
}];

// Sets up shortcuts to Firebase features and initiate firebase auth.
lightningPainDiary.prototype.initFirebase = function () {
    firebase.initializeApp({
        apiKey: FIREBASE_API,
        authDomain: 'lightningpaindiary.firebaseapp.com',
        databaseURL: "https://lightningpaindiary.firebaseio.com",
        storageBucket: "lightningpaindiary.appspot.com",
        projectId: 'lightningpaindiary',
        messagingSenderId: MESSAGING_ID
    });

    lpd.fbauth = firebase.auth();
    lpd.fbdatabase = firebase.database();
    lpd.fbstorage = firebase.storage();

    lpd.fbauth.onAuthStateChanged(lpd.onAuthStateChanged.bind(lpd));
}

lightningPainDiary.prototype.logIn = function () {
    let provider = new firebase.auth.GoogleAuthProvider();
    lpd.fbauth.signInWithPopup(provider);
}

lightningPainDiary.prototype.logOut = function () {
    lpd.fbauth.signOut();
}

lightningPainDiary.prototype.onAuthStateChanged = function (user) {
    if (user) {
        let profilePicUrl = user.photoURL;
        let userName = user.displayName;

        $("#userpic").attr('src', profilePicUrl || '/images/body_image.png');
        $("#username").text(userName);

        $("#login").hide();
        $("#usermenu").show();
        $("#report").show();
        $("#loggedout").hide();

        if (lpd.doLoggedin)
            lpd.doLoggedin();

        lpd.uid = user.uid;
        lpd.account.email = user.email;

        var ref = firebase.database().ref("users/" + lpd.uid + '/Account');
        ref.once("value", function (snapshot) {
            if (snapshot.exists()) {
                lpd.account = snapshot.val();

                lpd.doTrackerlistRead(lpd.doTrackerDisplay);

                //lpd.doDBUpdate();
            } else {
                lpd.doAccountWrite();
                lpd.doTrackerlistWrite();
            }

            if (lpd.doAccountDisplay)
                lpd.doAccountDisplay();
        });
    } else {
        lpd.uid = null;

        $("#usermenu").hide();
        $("#login").show();
        $("#loggedout").show();
        $("#report").hide();

        lpd.init();

        if (lpd.doLoggedout)
            lpd.doLoggedout()
    }
}

lightningPainDiary.prototype.checkLoggedInWithMessage = function () {
    if (lpd.fbauth.currentUser)
        return true;

    var data = {
        message: 'You must Login first',
        timeout: 2000
    };

    signInSnackbar.MaterialSnackbar.showSnackbar(data);

    return false;
}

lightningPainDiary.prototype.doTrackerlistRead = function (finishfcn) {
    var ref = firebase.database().ref("users/" + lpd.uid + '/Trackers');
    ref.once("value")
        .then(function (snapshot) {
            lpd.trackerlist = snapshot.val();

            if (finishfcn)
                finishfcn();
        });
}

lightningPainDiary.prototype.doAccountWrite = function (key) {
    if (lpd.checkLoggedInWithMessage()) {
        if (key)
            firebase.database().ref('users/' + lpd.uid + '/Account/' + key).set(lpd.account[key]);
        else
            firebase.database().ref('users/' + lpd.uid + '/Account').set(lpd.account);
    }
}

lightningPainDiary.prototype.doTrackerlistWrite = function () {
    if (lpd.checkLoggedInWithMessage())
        firebase.database().ref('users/' + lpd.uid + '/Trackers/').set(lpd.trackerlist);
}

lightningPainDiary.prototype.doTrackerWrite = function (entry, idx) {
    if (lpd.checkLoggedInWithMessage())
        firebase.database().ref('users/' + lpd.uid + '/Trackers/' + idx).set(entry);
}

lightningPainDiary.prototype.getDiaryKey = function (date, time) {
    let datekey = date;
    if (time)
        datekey += "T" + time;
    datekey = datekey.symbolReplace(/:/g, "");
    datekey = datekey.symbolReplace(/-/g, "");

    return (datekey);
}

lightningPainDiary.prototype.doDBUpdate = function () {
    debugger;
    var ref = firebase.database().ref("users/" + lpd.uid + '/Diary/');
    ref.once("value", function (snapshot) {
        snapshot.forEach(function (data) {
            if (data.key.length === 15) {
                //lpd.doDiaryEntryWrite(data.val());
                //lpd.doDiaryEntryDelete(data.key);
            }
        });
    });
}

lightningPainDiary.prototype.doDiaryRead = function (start, end, entryfcn, finishfcn) {
    //ref.child("userFavorites").queryOrderedByKey().queryEqual(toValue: user.uid).observe(...)

    var ref = firebase.database().ref("users/" + lpd.uid + '/Diary/');
    ref.once("value", function (snapshot) {
        lpd.snapshot = snapshot;

        snapshot.forEach(function (data) {
            if (entryfcn)
                entryfcn(data.val());
        });

        if (finishfcn)
            finishfcn();
    });
}

lightningPainDiary.prototype.doDiaryTrackerRename = function (oldname, newname) {
    //ref.child("userFavorites").queryOrderedByKey().queryEqual(toValue: user.uid).observe(...)

    var ref = firebase.database().ref("users/" + lpd.uid + '/Diary/');
    ref.once("value", function (snapshot) {
        lpd.snapshot = snapshot;

        snapshot.forEach(function (diary) {
            let entry = diary.val();

            if (entry[oldname]) {
                entry[newname] = entry[oldname];
                delete entry[oldname];
            }

            lpd.doDiaryEntryWrite(entry);
        });

    });
}

lightningPainDiary.prototype.doDiaryUpdate = function () {
    var ref = firebase.database().ref("users/" + lpd.uid + '/Diary/');
    ref.once("value", function (snapshot) {
        snapshot.forEach(function (diary) {
            let entry = diary.val();
            for (let [name, val] of Object.entries(entry)) {
                if (val.constructor === Array) {
                    let i = val.indexOf("");
                    if (1 !== -1)
                        val.splice(val, 1);
                }
            }

            let key = lpd.getDiaryKey(entry.Date, entry.Time);
            firebase.database().ref('users/' + lpd.uid + '/Diary/' + diary.key).remove();
            firebase.database().ref('users/' + lpd.uid + '/Diary/' + key).set(entry);
        });
    });
}

lightningPainDiary.prototype.doDiaryEntryRead = function (datekey, finishfcn) {
    if (lpd.checkLoggedInWithMessage()) {
        var ref = firebase.database().ref("users/" + lpd.uid + '/Diary/' + datekey);
        ref.once("value").then(function (snapshot) {
            if (snapshot.exists()) {
                finishfcn(snapshot.val());

                if (lpd.account.lastdiaryupdate !== datekey) {
                    lpd.account.lastdiaryupdate = datekey;
                    lpd.doAccountWrite("lastdiaryupdate");
                }
            }
        });
    }
}

lightningPainDiary.prototype.doDiaryEntryWrite = function (value) {
    if (lpd.checkLoggedInWithMessage()) {
        let datekey = lpd.getDiaryKey(value.Date, value.Time);
        firebase.database().ref('users/' + lpd.uid + '/Diary/' + datekey).set(value);

        if (lpd.account.lastdiaryupdate !== datekey) {
            lpd.account.lastdiaryupdate = datekey;
            lpd.doAccountWrite("lastdiaryupdate");
        }
    }
}

lightningPainDiary.prototype.doDiaryEntryDelete = function (datekey) {
    if (lpd.checkLoggedInWithMessage()) {
        firebase.database().ref('users/' + lpd.uid + '/Diary/' + datekey).remove();
    }
}

lightningPainDiary.prototype.doReportlistRead = function (finishfcn) {
    lpd.reportlist = [];

    var ref = firebase.database().ref("users/" + lpd.uid + '/Reports/');
    ref.once("value", function (snapshot) {
        snapshot.forEach(function (data) {
            lpd.reportlist.push(data.key);
        });

        if (finishfcn)
            finishfcn();
    });
}

lightningPainDiary.prototype.doReportRead = function (namekey, finishfcn) {
    if (lpd.checkLoggedInWithMessage()) {
        var ref = firebase.database().ref("users/" + lpd.uid + '/Reports/' + namekey);
        ref.once("value", function (snapshot) {
            if (snapshot.exists()) {
                lpd.report = snapshot.val();

            } else if (lpd.initReport)
                lpd.initReport();

            if (lpd.account.lastreport !== namekey) {
                lpd.account.lastreport = namekey;
                lpd.doAccountWrite("lastreport");
            }

            finishfcn();
        });
    }
}

lightningPainDiary.prototype.doReportWrite = function (namekey) {
    if (lpd.checkLoggedInWithMessage()) {
        firebase.database().ref('users/' + lpd.uid + '/Reports/' + namekey).set(lpd.report);

        if (lpd.account.lastreport !== namekey) {
            lpd.account.lastreport = namekey;
            lpd.doAccountWrite("lastreport");
        }
    }
}

lightningPainDiary.prototype.doReportDelete = function (namekey) {
    if (lpd.checkLoggedInWithMessage()) {
        firebase.database().ref('users/' + lpd.uid + '/Reports/' + namekey).remove();
    }
}

lightningPainDiary.prototype.init = function () {
    lpd.trackerlist = [];

    for (let i = 0; i < demotrackerlist.length; ++i)
        lpd.trackerlist.push(demotrackerlist[i]);

    if (lpd.initReport)
        lpd.initReport();

    lpd.account.city = "";
    lpd.account.state = "";
    lpd.account.country = "";
    lpd.account.ifmetric = false;
    lpd.account.ifnotify = false;
    lpd.account.notifytime = "20:00:00";
    lpd.account.ifemail = false;
    lpd.account.email = "";
    lpd.account.ifsms = false;
    lpd.account.phone = "";

    lpd.account.lastreport = "all on";
    lpd.account.lastdiaryupdate = null;
}

function loadHtml(url, alturl, selector) {
    loadFile(url, alturl, function (data) {
        let html = data.substring(data.indexOf("<body>") + 6, data.indexOf("</body>"));
        $(selector).append(html);

        if (selector === "#navbar") {
            let navbarheight = $("#imported-navbar").outerHeight(true);
            $("#jssite").css("margin-top", navbarheight + "px");

            $("#login").click(function () {
                lpd.logIn();
            });

            $("#logout").click(function () {
                lpd.logOut();
            });
        }
    });
}

function loadFile(url, alturl, fctn) {
    $.ajax({
        url: url,
        method: 'GET',
        success: function (data) {
            fctn(data);
        },
        error: function (data) {
            if (alturl)
                loadFile(alturl, null, fctn);
        }
    });

    /***************
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200)
                fctn(this.responseText);
            else if (alturl)
                loadFile(alturl, null, fctn);
        }
    }
    xhttp.open("GET", url, true);
    xhttp.send();
    *************/
}

Date.prototype.toDateLocalTimeString = function () {
    let date = this;
    return date.getFullYear() +
        "-" + ten(date.getMonth() + 1) +
        "-" + ten(date.getDate()) +
        "T" + ten(date.getHours()) +
        ":" + ten(date.getMinutes());
}

Date.prototype.toLocalTimeString = function () {
    let date = this;
    return ten(date.getHours()) +
        ":" + ten(date.getMinutes());
}

Date.prototype.toDateString = function () {
    let date = this;
    return date.getFullYear() +
        "-" + ten(date.getMonth() + 1) +
        "-" + ten(date.getDate());
}

Date.prototype.toDateShortString = function () {
    let date = this;
    return date.getFullYear() +
        ten(date.getMonth() + 1) +
        ten(date.getDate());
}

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const days = ["Sunday", "Monday", "Tuesday", "Wednessday", "Thursday", "Friday", "Saturday"];
const daysabbrev = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

Date.prototype.getMonthString = function () {
    return months[this.getMonth()];
}

Date.prototype.getDayString = function (abbrev) {
    return abbrev ? daysabbrev[this.getDay()] : days[this.getDay()];
}

Number.prototype.getDayString = function (abbrev) {
    return abbrev ? daysabbrev[this] : days[this];
}

String.prototype.getMonthString = function () {
    return months[this - 1];
}

String.prototype.idToName = function () {
    return this.stripID().dashToSpace();
}

String.prototype.stripID = function () {
    return this.replace(/^.*?-(.*)/g, "$1");
}

String.prototype.dashToSpace = function () {
    return /-/g [Symbol.replace](this, " ");
}

String.prototype.spaceToDash = function () {
    return / /g [Symbol.replace](this, "-");
}

String.prototype.symbolReplace = function (name, repwith) {
    return name[Symbol.replace](this, repwith);
}

function monthDays(year, month) {
    const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let leap = month === 2 ? (year % 100 === 0 ? (year % 400 === 0 ? 1 : 0) : (year % 4 === 0 ? 1 : 0)) : 0;
    return (days[month - 1] + leap);
}

function ten(i) {
    return i < 10 ? '0' + i : i;
}

// from http://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/
function hslToRgb(h, s, l) {
    let r, g, b;
    h /= 360;
    s /= 100;
    l /= 100;

    if (s === 0)
        r = g = b = l * 255;
    else {
        let t1 = l < 50 ? l * (1.0 + s) : l + s - l * s;
        let t2 = 2 * l - t1;

        let range = function (x) {
            return (x <= 0 ? x + 1 : x >= 1 ? x - 1 : x);
        }

        let tr = range(h + 0.333);
        let tg = range(h);
        let tb = range(h - 0.333);

        let color = function (t1, t2, tc) {
            let c;

            if (6 * tc < 1)
                c = t2 + (t1 - t2) * 6 * tc;
            else if (2 * tc < 1)
                c = t1;
            else if (3 * tc < 2)
                c = t2 + (t1 - t2) * 6 * (0.666 - tc);
            else
                c = t2;
                
            return (c);
        }

        r = Math.round(color(t1, t2, tr) * 255);
        g = Math.round(color(t1, t2, tg) * 255);
        b = Math.round(color(t1, t2, tb) * 255);
    }

    return {
        r: r,
        g: g,
        b: b
    };
}

function toHex(n) {
    var hex = n.toString(16);
    if (hex.length % 2 === 1)
        hex = "0" + hex;
    return hex;
}