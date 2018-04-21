let setupdb;
let diarydb;
const stripid = /^.*?-(.*)/g;

loadHtml("https://lightningpaindiary.firebaseapp.com/navbar.html", "#navbar");
loadHtml("https://lightningpaindiary.firebaseapp.com/footer.html", "#footer");

$(document).ready(function () {
    $("#javascript").empty();
    $("#jssite").show();

    if (!('indexedDB' in window)) {
        console.log('This browser doesn\'t support IndexedDB');
    }

    let accountreq = indexedDB.open("account", 1);

    accountreq.onupgradeneeded = function () {};

    accountreq.onerror = function () {
        console.log("account not found");
    };

    accountreq.onsuccess = function () {
        accountdb = accountreq.result;

        let diaryreq = indexedDB.open("diary", 1);

        diaryreq.onsuccess = function () {
            diarydb = diaryreq.result;

            display(accountdb, diarydb);
        };
    };
});

function display(accountdb, diarydb) {
    const row =
        `<div id="row-idname" class="row" style="font-size: 15px; border-bottom: 1px solid #008000;">
            <div class="col-md-2 col-sm-2 col-3 border-right">
                <div id="date"></div>
                <div id="time"></div>
                <input id="sel-idname" type="checkbox">
            </div>
            <div id="rem" class="container row col-md-10 col-sm-10 col-9"></div>
        </div>`;
    const entry = `<div id="ent-idname" class="col-md-2 col-sm-4 col-6 border-right border-bottom">dvalue</div>`;
    const mult = `<div id="mult">dvalue</div>`;

    let account = [];
    let h = /idname/g [Symbol.replace](row, "header");
    let pnl = $("#panels");
    pnl.append(h);
    let header = pnl.find("#row-header");

    let store = accountdb.transaction(["account"], "readwrite").objectStore("account");
    let req = store.index('by_position').openCursor();
    req.onsuccess = function (event) {
        let cursor = event.target.result;

        if (cursor) {
            let item = cursor.value;
            let name = item.name;
            item.id = / /g [Symbol.replace](name, "-");

            switch (item.type) {
                case "account":
                case "reports":
                case "text":
                    item.id = null;
                    break;
                case "date":
                    if (item.name === "Date") {
                        header.children().find("#date").text("Date & Time");
                        header.children().find("#sel-header").hide();
                    }
                    break;
                case "time":
                    if (item.name === "Time")
                        item.id = null;
                    break;
                case "blood pressure":
                    name = "Blood Pressure & Pulse";
                default:
                    let h = /dvalue/g [Symbol.replace](entry, name);
                    header.find("#rem").append(h);
            }

            account.push(item);

            cursor.continue();
        } else {
            store = diarydb.transaction(["diary"], "readwrite").objectStore("diary");
            req = store.index('by_datetime').openCursor();
            req.onsuccess = function (event) {
                let cursor = event.target.result;

                if (cursor) {
                    let diary = cursor.value;

                    let id = /:/g [Symbol.replace](diary.DateTime, "--");
                    id = /\./g [Symbol.replace](id, "--");

                    let h = /idname/g [Symbol.replace](row, id);
                    pnl.append(h);
                    let header = pnl.find("#row-" + id);

                    for (let i = 0; i < account.length; ++i) {
                        let item = account[i];
                        let txt = diary[item.name];

                        if (item.id) {
                            switch (item.type) {
                                case "date":
                                    if (item.name === "Date") {
                                        header.children().find("#date").text(diary.Date);
                                        header.children().find("#time").text(diary.Time);
                                    } else {
                                        h = /dvalue/g [Symbol.replace](entry, txt ? "" : "n/a");
                                        h = /idname/g [Symbol.replace](h, item.id);
                                        header.find("#rem").append(h);
                                    }
                                    break;
                                case "weather":
                                    h = /dvalue/g [Symbol.replace](entry, txt ? "" : "n/a");
                                    h = /idname/g [Symbol.replace](h, item.id);
                                    header.find("#rem").append(h);

                                    for (let i = 0; txt && i < item.list.length; ++i) {
                                        let name = item.list[i];
                                        let txt = name + ": " + diary[item.name][name];

                                        h = /dvalue/g [Symbol.replace](mult, txt);
                                        header.find("#rem #ent-" + item.id).append(h);
                                    }
                                    break;
                                case "list":
                                    h = /dvalue/g [Symbol.replace](entry, txt ? "" : "n/a");
                                    h = /idname/g [Symbol.replace](h, item.id);
                                    header.find("#rem").append(h);

                                    for (let i = 0; txt && i < diary[item.name].length; ++i) {
                                        h = /dvalue/g [Symbol.replace](mult, diary[item.name][i]);
                                        header.find("#rem #ent-" + item.id).append(h);
                                    }
                                    break;
                                case "blood pressure":
                                    txt = txt ? diary[item.name].high + " / " + diary[item.name].low + " " + diary[item.name].pulse : "n/a";
                                default:
                                    h = /dvalue/g [Symbol.replace](entry, txt ? txt : "n/a");
                                    h = /idname/g [Symbol.replace](h, item.id);
                                    header.find("#rem").append(h);
                            }
                        }
                    }

                    cursor.continue();
                }
            };
        }
    };
}

/*
function selectReport(accountdb, diarydb) {}
*/

/************************************** */

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