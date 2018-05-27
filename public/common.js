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
    list: ["temp", "humidity", "pressure", "wind", "clouds", "description"],
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

    this.fbauth = firebase.auth();
    this.fbdatabase = firebase.database();
    this.fbstorage = firebase.storage();

    this.fbauth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
}

lightningPainDiary.prototype.logIn = function () {
    let provider = new firebase.auth.GoogleAuthProvider();
    this.fbauth.signInWithPopup(provider);
}

lightningPainDiary.prototype.logOut = function () {
    this.fbauth.signOut();
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

        this.uid = user.uid;
        this.account.email = user.email;

        var ref = firebase.database().ref("users/" + this.uid + '/Account');
        ref.once("value", function (snapshot) {
            if (snapshot.exists()) {
                lpd.account = snapshot.val();
                if (lpd.doAccountUpdate)
                    lpd.doAccountUpdate(snapshot.val());

                //lpd.doDiaryUpdate();
                //lpd.doReportUpdate();

                lpd.doTrackerlistRead();
                lpd.doReportRead(lpd.account.lastreport);
                lpd.doDiaryEntryRead(lpd.account.lastdiaryupdate);
            } else {
                lpd.doAccountWrite();
                lpd.doTrackerlistWrite();
            }
        });
    } else {
        this.uid = null;

        $("#usermenu").hide();
        $("#login").show();
        $("#report").hide();

        if (this.doTrackerDisplay)
            this.doTrackerDisplay();

        if (this.doAccountDisplay)
            this.doAccountDisplay();

        if (this.doReportDisplay)
            this.doReportDisplay();

    }
}

lightningPainDiary.prototype.checkLoggedInWithMessage = function () {
    if (this.fbauth.currentUser)
        return true;

    var data = {
        message: 'You must Login first',
        timeout: 2000
    };

    signInSnackbar.MaterialSnackbar.showSnackbar(data);

    return false;
}

lightningPainDiary.prototype.doTrackerlistRead = function (val) {
    var ref = firebase.database().ref("users/" + this.uid + '/Trackers');
    ref.once("value")
        .then(function (snapshot) {
            lpd.trackerlist = snapshot.val();
            if (lpd.doTrackerDisplay)
                lpd.doTrackerDisplay();
        });
}

lightningPainDiary.prototype.doAccountWrite = function () {
    if (this.checkLoggedInWithMessage())
        firebase.database().ref('users/' + this.uid + '/Account').set(this.account);
}

lightningPainDiary.prototype.doTrackerlistWrite = function () {
    if (this.checkLoggedInWithMessage())
        firebase.database().ref('users/' + this.uid + '/Trackers/').set(this.trackerlist);
}

lightningPainDiary.prototype.doTrackerWrite = function (entry, idx) {
    if (this.checkLoggedInWithMessage())
        firebase.database().ref('users/' + this.uid + '/Trackers/' + idx).set(entry);
}

lightningPainDiary.prototype.getDiaryKey = function (entry) {
    let datekey = new Date(entry.Date + " " + entry.Time).toJSON();
    datekey = /:/g [Symbol.replace](datekey, "");
    datekey = /-/g [Symbol.replace](datekey, "");
    datekey = datekey.replace(/(.*?)\..*/g, "$1");

    return (datekey);
}

lightningPainDiary.prototype.doDiaryRead = function (entryfcn, finishfcn) {
    var ref = firebase.database().ref("users/" + this.uid + '/Diary/');
    ref.once("value", function (snapshot) {
        snapshot.forEach(function (data) {
            entryfcn(data.val());
        });

        finishfcn();
    });
}

lightningPainDiary.prototype.doDiaryUpdate = function () {
    var ref = firebase.database().ref("users/" + this.uid + '/Diary/');
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

            let key = lpd.getDiaryKey(entry);
            firebase.database().ref('users/' + lpd.uid + '/Diary/' + diary.key).remove();
            firebase.database().ref('users/' + lpd.uid + '/Diary/' + key).set(entry);
        });
    });
}

lightningPainDiary.prototype.doDiaryEntryRead = function (datekey) {
    if (this.doDiaryDisplay) {
        var ref = firebase.database().ref("users/" + this.uid + '/Diary/' + datekey);
        ref.once("value")
            .then(function (snapshot) {
                if (snapshot.exists()) {
                    lpd.doDiaryDisplay(snapshot.val());

                    lpd.account.lastdiaryupdate = datekey;
                    lpd.doAccountWrite();
                }
            });
    }
}

lightningPainDiary.prototype.doDiaryEntryWrite = function (value) {
    // check/set local storage

    if (this.checkLoggedInWithMessage()) {
        let datekey = this.getDiaryKey(value);
        firebase.database().ref('users/' + this.uid + '/Diary/' + datekey).set(value);

        this.account.lastdiaryupdate = datekey;
        this.doAccountWrite();
    }
}

lightningPainDiary.prototype.doDiaryEntryDelete = function (datekey) {
    if (this.checkLoggedInWithMessage()) {
        firebase.database().ref('users/' + this.uid + '/Diary/' + datekey).remove();
    }
}

lightningPainDiary.prototype.doReportRead = function (namekey) {
    var ref = firebase.database().ref("users/" + this.uid + '/Reports/' + namekey);
    ref.once("value", function (snapshot) {
        if (snapshot.exists()) {
            lpd.report = snapshot.val();
            lpd.account.lastreport = namekey;
            lpd.doAccountWrite();
        } else {
            lpd.report = [];
            for (let i = 0; i < lpd.trackerlist.length; ++i)
                lpd.report.push(lpd.trackerlist[i]);
        }

        if (lpd.doReportSelectDisplay)
            lpd.doReportSelectDisplay();
        if (lpd.doReportDisplay)
            lpd.doReportDisplay();
    });
}

lightningPainDiary.prototype.doReportWrite = function (namekey) {
    if (this.checkLoggedInWithMessage()) {
        firebase.database().ref('users/' + this.uid + '/Reports/' + namekey).set(this.report);

        this.account.lastreport = namekey;
        this.doAccountWrite();
    }
}

lightningPainDiary.prototype.init = function () {
    for (let i = 0; i < demotrackerlist.length; ++i) {
        this.trackerlist.push(demotrackerlist[i]);
        this.report.push(demotrackerlist[i]);
    }

    this.account.city = "";
    this.account.state = "";
    this.account.country = "";
    this.account.ifmetric = false;
    this.account.ifnotify = false;
    this.account.notifytime = "20:00:00";
    this.account.ifemail = false;
    this.account.email = "";
    this.account.ifsms = false;
    this.account.phone = "";

    this.account.lastreport = null;
    this.account.lastdiaryupdate = null;
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