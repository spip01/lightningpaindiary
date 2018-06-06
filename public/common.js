'use strict';

var lpd;

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

const openweatherapikey = "36241d90d27162ebecabf6c334851f16";
const firebaseapikey = 'AIzaSyBb58wdzKURN8OipGiaOgmpF_UJgA2yUEk';
const stripid = /^.*?-(.*)/g;

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
        apiKey: firebaseapikey,
        authDomain: 'lightningpaindiary.firebaseapp.com',
        databaseURL: "https://lightningpaindiary.firebaseio.com",
        storageBucket: "lightningpaindiary.appspot.com",
        projectId: 'lightningpaindiary'
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
        $("#save").removeClass("disabled");
        $("#save").removeAttr("disabled");
        $("#cancel").removeClass("disabled");
        $("#cancel").removeAttr("disabled");

        if (lpd.doLoggedin)
            lpd.doLoggedin();

        lpd.uid = user.uid;
        lpd.account.email = user.email;

        var ref = firebase.database().ref("users/" + lpd.uid + '/Account');
        ref.once("value", function (snapshot) {
            if (snapshot.exists()) {
                lpd.account = snapshot.val();

                lpd.doTrackerlistRead(lpd.doTrackerDisplay);
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
        $("#save").addClass("disabled");
        $("#save").prop("disabled", true);
        $("#cancel").addClass("disabled");
        $("#cancel").prop("disabled", true);

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
    datekey = /:/g [Symbol.replace](datekey, "");
    datekey = /-/g [Symbol.replace](datekey, "");

    return (datekey);
}

lightningPainDiary.prototype.doDiaryRead = function (entryfcn, finishfcn) {
    var ref = firebase.database().ref("users/" + lpd.uid + '/Diary/');
    ref.once("value", function (snapshot) {
        snapshot.forEach(function (data) {
            entryfcn(data.val());
        });

        finishfcn();
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
        ref.once("value")
            .then(function (snapshot) {
                if (snapshot.exists())
                    finishfcn(snapshot.val());
            });

        if (lpd.account.lastdiaryupdate !== datekey) {
            lpd.account.lastdiaryupdate = datekey;
            lpd.doAccountWrite("lastdiaryupdate");
        }
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

        finishfcn();
    });
}

lightningPainDiary.prototype.doReportRead = function (namekey, finishfcn) {
    if (lpd.checkLoggedInWithMessage()) {
        var ref = firebase.database().ref("users/" + lpd.uid + '/Reports/' + namekey);
        ref.once("value", function (snapshot) {
            if (snapshot.exists())
                lpd.report = snapshot.val();
            else if (lpd.initReport)
                lpd.initReport();

            finishfcn();
        });

        if (lpd.account.lastreport !== namekey) {
            lpd.account.lastreport = namekey;
            lpd.doAccountWrite("lastreport");
        }
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