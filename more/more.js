const Ppanel = document.getElementById("container");
const search = document.getElementById("search");
const result_num = document.getElementById("result_num");
const title = document.getElementById("title");
const singer = document.getElementById("singer");
const pause = document.getElementById("pause");
const time = document.getElementById("time");
const _time = document.getElementById("_time");
var data;
var audio = new Audio;
var playerM = {
    songId: 0,
    songUId: "",
    isPlaying: false
}
var showTime;

window.onload = function() {
    clearInterval(showTimeFunc);
    chrome.tabs.query({ currentWindow: true, url: ["https://zingmp3.vn/*"] }, function(tabs) {
        chrome.tabs.executeScript(
            tabs[0].id, { code: 'chrome.runtime.sendMessage(window.localStorage.zmp3_mini_player);' });
    });
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            data = xly(JSON.parse(request));
            console.log(data);
            showSong();
        });
}

function showTimeFunc() {
    _time.innerHTML = timeToString(audio.currentTime) + " / " + timeToString(audio.duration);
    time.style.width = 20 + (audio.currentTime / audio.duration * 80) + "%";
}

function xly(obj) {
    return {
        queueSongIds: obj.queueSongIds,
        queueSongMap: obj.queueSongMap
    }
}

function timeToString(t) {
    if (!t) return "00:00";
    t = Math.floor(t);
    let hour = Math.floor(t / 3600);
    let min = Math.floor((t % 3600) / 60);
    let sec = t % 3600 % 60;
    if (hour == 0) hour = "";
    else hour = hour.toString() + ":";
    if (min < 10) min = "0" + min.toString();
    if (sec < 10) sec = "0" + sec.toString();
    return hour + min + ":" + sec;
}

function showSong(arr) {
    Ppanel.innerHTML = "";
    if (!arr) {
        data.queueSongIds.forEach((element, index) => {
            creatPanel({
                id: index,
                uid: data.queueSongMap[element.songId].id,
                avatar: data.queueSongMap[element.songId].thumbnail,
                title: data.queueSongMap[element.songId].title,
                artists_names: data.queueSongMap[element.songId].artists_names,
                listen_link: `http://api.mp3.zing.vn/api/streaming/audio/${element.songId}/128`,
                download_link: `http://api.mp3.zing.vn/api/download/audio/${element.songId}/128`
            });
        });
    } else {
        arr.forEach((element, index) => {
            creatPanel({
                id: index,
                uid: data.queueSongMap[element].id,
                avatar: data.queueSongMap[element].thumbnail,
                title: data.queueSongMap[element].title,
                artists_names: data.queueSongMap[element].artists_names,
                listen_link: `http://api.mp3.zing.vn/api/streaming/audio/${element}/128`,
                download_link: `http://api.mp3.zing.vn/api/download/audio/${element}/128`
            });
        });
    }
}

function creatPanel(panelInfor) {
    let panel = document.createElement("div");
    panel.classList.add("panel");
    panel.id = panelInfor.uid;
    panel.addEventListener("click", function() {
        PlayAudio({
            src: panelInfor.listen_link,
            artists_names: panelInfor.artists_names,
            title: panelInfor.title,
            id: panelInfor.id,
            uid: panelInfor.uid
        })
    });

    let image = document.createElement("div");
    image.classList.add("_img");
    image.innerHTML = `<img loading="lazy" src="${panelInfor.avatar}" alt="icon" width="100%">`;

    let title = document.createElement("div");
    title.classList.add("_title");
    title.innerHTML = `<p>${panelInfor.title}</p>`;

    let tool = document.createElement("div");
    tool.classList.add("_tool");
    // tool.innerHTML = ` <a href = "${panelInfor.download_link}" target = "_blank"><i class="fas fa-cloud-download-alt"></i></a><a href = "${panelInfor.listen_link}" target = "_blank"><i class="fas fa-volume-up"></i></a>`;
    tool.innerHTML = `<a href = "${panelInfor.listen_link}" target = "_blank"><i class="fas fa-volume-up"></i></a>`;

    panel.appendChild(image);
    panel.appendChild(title);
    panel.appendChild(tool);
    Ppanel.appendChild(panel);
}

function PlayAudio(objData) {
    if (!objData) {
        if (playerM.isPlaying) {
            audio.pause();
            clearInterval(showTime)
            playerM.isPlaying = !1;
            pause.innerHTML = `<i class="fas fa-play"></i>`;
        } else {
            if (audio.src == "") {
                alert("Chose a song to play");
                return;
            } else {
                audio.play()
                    .then(function() {
                        showTime = setInterval(showTimeFunc, 500);
                    })
                playerM.isPlaying = !0;
                pause.innerHTML = `<i class="fas fa-pause"></i>`;
            }
        }
    } else {
        audio.src = objData.src;
        title.innerHTML = "Loading new song";
        singer.innerHTML = "please wait for a moment";
        audio.play()
            .then(function() {
                title.innerHTML = objData.title;
                singer.innerHTML = objData.artists_names;
                playerM = {
                    isPlaying: true,
                    songId: objData.id,
                    songUId: objData.uid
                }
                pause.innerHTML = `<i class="fas fa-pause"></i>`;
                showTime = setInterval(showTimeFunc, 500);
            });
    }
}

function match(str1, str2) {
    str1 = str1.toLowerCase().replace(/\s/g, "");
    str2 = str2.toLowerCase().replace(/\s/g, "");
    if (str1.search(str2) > -1) return true;
    else return false
}

function find(searchInp) {
    let ans = [];
    data.queueSongIds.forEach(element => {
        if (match(data.queueSongMap[element.songId].title, searchInp)) {
            ans.push(element.songId);
        }
    });
    return ans;
}
search.onkeyup = function(key) {
    if (search.value != "") {
        let t = find(search.value);
        showSong(t);
        result_num.style.height = "30px";
        result_num.style.opacity = "1";
        result_num.innerHTML = t.length.toString() + " result(s)";
    } else {
        showSong();
        result_num.style.height = "0";
        result_num.style.opacity = "0";
    }
}

audio.addEventListener("ended", function() {
    let id;
    if (playerM.songId + 2 > data.queueSongIds.length) id = 0
    else id = playerM.songId + 1;
    let uid = data.queueSongIds[id].songId;
    let next = data.queueSongMap[uid].id;
    PlayAudio({
        src: `http://api.mp3.zing.vn/api/download/audio/${next}/128`,
        artists_names: data.queueSongMap[next].artists_names,
        title: data.queueSongMap[next].title,
        id: id,
        uid: uid
    })
});

pause.addEventListener("click", function() {
    PlayAudio();
});