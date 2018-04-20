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
        `
        <div id="row-idname" class="grid-container row border-bottom"></div>
        `;
    const entry =
        `
        <div id="ent-idname"></div>
        `;
    const mult =
        `
        <div id="mult-idname"></div>
        `;

    let account = [];
    let h = /idname/g [Symbol.replace](row, "header");
    let pnl = $("#panels");
    pnl.append(h);

    let store = accountdb.transaction(["account"], "readwrite").objectStore("account");
    let req = store.index('by_position').openCursor();
    req.onsuccess = function (event) {
        let cursor = event.target.result;

        if (cursor) {
            let item = cursor.value;
            let id = / /g [Symbol.replace](item.name, "-");
            let name = item.name;
            item.id = id;

            let h = /idname/g [Symbol.replace](entry, id);

            switch (item.type) {
                case "account":
                case "reports":
                case "text":
                    item.id = null;
                    break;
                case "date":
                    if (item.name === "Date")
                        name = "Date & Time";
                    break;
                case "time":
                    if (item.name === "Time")
                        item.id = null;
                    break;
                case "blood pressure":
                    name = "Blood Pressure & Pulse";
                    break;
            }

            account.push(item);

            if (item.id) {
                pnl.find("#row-header").append(h);
                pnl.find("#ent-" + item.id).text(name);
            }

            cursor.continue();
        } else {
            store = diarydb.transaction(["diary"], "readwrite").objectStore("diary");
            req = store.index('by_datetime').openCursor();
            req.onsuccess = function (event) {
                let cursor = event.target.result;

                if (cursor) {
                    let diary = cursor.value;

                    let did = /:/g [Symbol.replace](diary.DateTime, "");
                    did = /\./g [Symbol.replace](did, "");

                    let h = /idname/g [Symbol.replace](row, did);
                    pnl.append(h);
                    let hrow = pnl.find("#row-" + did);

                    for (let i = 0; i < account.length; ++i) {
                        let item = account[i];
                        let txt = diary[item.name];

                        if (item.id) {
                            let h = /idname/g [Symbol.replace](entry, item.id);
                            hrow.append(h);
                            let hent = hrow.find("#ent-" + item.id);

                            switch (item.type) {
                                case "date":
                                    if (item.name === "Date") {
                                        let h = /idname/g [Symbol.replace](mult, "Date-Date");
                                        hent.append(h);
                                        hent.find("#mult-Date-Date").text(diary.Date);

                                        h = /idname/g [Symbol.replace](mult, "Date-Time");
                                        hent.append(h);
                                        hent.find("#mult-Date-Time").text(diary.Time);
                                    }
                                    break;
                                case "weather":
                                    for (let i = 0; i < item.list.length; ++i) {
                                        let litem = item.list[i];
                                        let txt = litem + ": " + diary[item.name][litem];
                                        let id = / /g [Symbol.replace](item.id + "-" + litem, "-");
                                        let h = /idname/g [Symbol.replace](mult, id);
                                        hent.append(h);
                                        hent.find("#mult-" + id).text(txt);
                                    }
                                    break;
                                case "list":
                                    for (let i = 0; i < item.list.length; ++i) {
                                        let txt = item.list[i];
                                        let id = / /g [Symbol.replace](item.id + "-" + txt, "-");
                                        let h = /idname/g [Symbol.replace](mult, id);
                                        hent.append(h);
                                        hent.find("#mult-" + id).text(txt);
                                    }
                                    break;
                                case "blood pressure":
                                    txt = diary[item.name].high + " / " + diary[item.name].low + " " + diary[item.name].pulse;
                                default:
                                    hent.text(txt);
                            }
                        }
                    }

                    cursor.continue();
                }
            };
        }
    };
}

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