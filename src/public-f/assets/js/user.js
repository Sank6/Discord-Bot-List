var HttpClient = function() {
    this.get = function(aUrl, aCallback) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() {
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                aCallback(anHttpRequest.responseText);
        }

        anHttpRequest.open("GET", aUrl, true);
        anHttpRequest.send(null);
    }
}

function update(text) {
    text = encodeURIComponent(text);
    let t = encodeURIComponent(localStorage.getItem('token'));
    var client = new HttpClient();
    client.get(`https://discordbotlist.xyz/bio?token=${t}&text=${text}`, () => {})
}

$(document).ready(() => {
    document.getElementById("bio").addEventListener("input", function() {
        update(this.innerHTML)
    }, false);
})