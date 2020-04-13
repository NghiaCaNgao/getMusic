var data;
const Ppanel = document.getElementById("container");
const search = document.getElementById("search");
const result_num = document.getElementById("result_num");

window.onload = function() {
    chrome.tabs.query({ currentWindow: true, active: true }, function(tabs) {
        chrome.tabs.executeScript(
            tabs[0].id, { code: 'chrome.runtime.sendMessage(window.localStorage.zmp3_mini_player);' });
    });
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            data = xly(JSON.parse(request));
            showSong();
        });
}

function showSong(arr) {
    Ppanel.innerHTML = "";
    if (!arr) {
        data.queueSongIds.forEach(element => {
            creatPanel({
                id: data.queueSongMap[element.songId].id,
                avatar: data.queueSongMap[element.songId].thumbnail,
                title: data.queueSongMap[element.songId].title,
                listen_link: `http://api.mp3.zing.vn/api/streaming/audio/${element.songId}/128`,
                download_link: `http://api.mp3.zing.vn/api/download/audio/${element.songId}/128`
            });
        });
    } else {
        arr.forEach(element => {
            creatPanel({
                id: data.queueSongMap[element].id,
                avatar: data.queueSongMap[element].thumbnail,
                title: data.queueSongMap[element].title,
                listen_link: `http://api.mp3.zing.vn/api/streaming/audio/${element}/128`,
                download_link: `http://api.mp3.zing.vn/api/download/audio/${element}/128`
            });
        });
    }
}

function creatPanel(panelInfor) {
    let panel = document.createElement("div");
    panel.classList.add("panel");
    panel.id = panelInfor.id;

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

function xly(obj) {
    return {
        queueSongIds: obj.queueSongIds,
        queueSongMap: obj.queueSongMap
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