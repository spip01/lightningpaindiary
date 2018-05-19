'use strict';

var lpd;

function startUp() {
    $("#javascript").empty();
    $("#jssite").show();
    
    lpd = new lightningPainDiary();

    loadHtml("https://lightningpaindiary.firebaseapp.com/navbar.html", "http://raw.githubusercontent.com/spip01/lightningpaindiary/firebase/public/navbar.html", "#navbar");
    loadHtml("https://lightningpaindiary.firebaseapp.com/footer.html", "http://raw.githubusercontent.com/spip01/lightningpaindiary/firebase/public/footer.html", "#footer");

    lpd.doAccountInit();
    lpd.initFirebase();
};

function lightningPainDiary() {
    this.account = {};
    this.trackerlist = [];

    this.fbauth = null;
    this.fbdatabase = null;
    this.fbstorage = null;
}

const openweatherapikey = "36241d90d27162ebecabf6c334851f16";
const stripid = /^.*?-(.*)/g;

const trackertypes = ["blood pressure", "date", "list", "number", "range", "text",
    "time", "true false", "weather"
];

const demotrackerlist = [
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
    }
];

// Sets up shortcuts to Firebase features and initiate firebase auth.
lightningPainDiary.prototype.initFirebase = function () {
    firebase.initializeApp({
        apiKey: 'AIzaSyBb58wdzKURN8OipGiaOgmpF_UJgA2yUEk',
        authDomain: 'lightningpaindiary.firebaseapp.com',
        databaseURL: "https://lightningpaindiary.firebaseio.com",
        storageBucket: "lightningpaindiary.appspot.com",
        projectId: 'lightningpaindiary'
    });

    this.fbauth = firebase.auth();
    this.fbdatabase = firebase.database();
    this.fbstorage = firebase.storage();

    this.fbauth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};

lightningPainDiary.prototype.logIn = function () {
    let provider = new firebase.auth.GoogleAuthProvider();
    this.fbauth.signInWithPopup(provider);
};

lightningPainDiary.prototype.logOut = function () {
    this.fbauth.signOut();
};

lightningPainDiary.prototype.onAuthStateChanged = function (user) {
    if (user) {
        let profilePicUrl = user.photoURL;
        let userName = user.displayName;

        $("#userpic").attr('src', profilePicUrl || '/images/body_image.png');
        $("#username").text(userName);

        $("#login").hide();
        $("#usermenu").show();

        this.uid = user.uid;
        this.account.email = user.email;

        var ref = firebase.database().ref("users/" + this.uid + '/Account');
        ref.once("value")
            .then(function (snapshot) {
                if (snapshot.exists())
                    lpd.doAccountRead(snapshot.val());
                else
                    lpd.doAccountWrite();
            });
    } else {
        this.uid = null;

        $("#usermenu").hide();
        $("#login").show();
    }
};

lightningPainDiary.prototype.checkLoggedInWithMessage = function () {
    if (this.fbauth.currentUser) {
        return true;
    }

    var data = {
        message: 'You must Login first',
        timeout: 2000
    };

    signInSnackbar.MaterialSnackbar.showSnackbar(data);
    return false;
};

lightningPainDiary.prototype.doAccountRead = function (val) {
    this.account = val;

    // check/set local storage

    var ref = firebase.database().ref("users/" + this.uid + '/Trackers');
    ref.once("value")
        .then(function (snapshot) {
            lpd.trackerlist = snapshot.val();
            lpd.doDisplayUpdate(lpd.trackerlist);
        });
};

lightningPainDiary.prototype.doAccountWrite = function () {
    // check/set local storage

    firebase.database().ref('users/' + this.uid + '/Account').set(this.account);
    firebase.database().ref('users/' + this.uid + '/Trackers').set(this.trackerlist);
};

lightningPainDiary.prototype.doAccountInit = function () {
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

    this.account.lastreport = "all on";
    this.account.lastdiaryupdate = 0;

    for (let i = 0; i < demotrackerlist.length; ++i)
        this.trackerlist.push(demotrackerlist[i]);

    // set local storage

    this.doDisplayUpdate(this.trackerlist);
}

function loadHtml(url, alturl, selector) {
    loadFile(url, alturl, function (data) {
        let html = data.substring(data.indexOf("<body>") + 6, data.indexOf("</body>"));
        $(selector).append(html);

        $("#login").off();
        $("#login").click(function () {
            lpd.logIn();
        });

        $("#logout").off();
        $("#logout").click(function () {
            lpd.logOut();
        });
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