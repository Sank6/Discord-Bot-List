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

Array.prototype.shuffle = function() {
    let a = this;
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// cookie consent
window.addEventListener("load", function() {
    window.cookieconsent.initialise({
        "palette": {
            "popup": {
                "background": "#2e2d33",
                "text": "#ffffff"
            },
            "button": {
                "background": "transparent",
                "border": "#ffffff",
                "text": "#ffffff"
            }
        },
        "position": "bottom-left",
        "content": {
            "dismiss": "Got it!"
        }
    })
});

$('a[href^="#"]').on('click', function(event) {
    var target = $(this.getAttribute('href'));
    if (target.length) {
        event.preventDefault();
        $('html, body').stop().animate({
            scrollTop: target.offset().top
        }, 1500);
    }
});

document.getElementById('search').addEventListener("input", (e) => {
    let s = e.target.innerText.toLowerCase();
    let no = s.replace("\n", "");
    console.log(no);
    if (s.includes('\n')) location.href = `/search?q=${encodeURIComponent(no).replace('%0A', "")}`;
}, false);