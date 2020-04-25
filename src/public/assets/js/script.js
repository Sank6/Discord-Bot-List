Array.prototype.shuffle = function () {
    let a = this;
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

async function load() {
    var n = 0;
    let BotList = await fetch(`${window.location.origin}/api/bots/list`);
    BotList = await BotList.json()
    BotList = BotList.shuffle();;
    
    $('#loading').css("display","none");

    let selection = BotList.slice(n, n + 10);
    loadMore(selection);

    $(window).scroll(function () {
        if ($(window).scrollTop() + $(window).height() > $(document).height() - 200) {
            n += 10;
            loadMore(BotList.slice(n, n + 10));
        }
    });
};

function loadMore(res) {
    res.forEach(function (bot) {
        if (bot.state == "unverified") return;
        let outer = document.createElement("div")
        outer.classList.add("card");

        $(outer).on('click', function (e) {
            if (!$(e.target).hasClass('invite') && !$(e.target).hasClass('detail') && !$(e.target).hasClass('fas')) {
                console.log(outer.children[1].children[0].children[0])
                outer.children[1].children[0].children[0].click()
            }
        });
        let icon = document.createElement("img")
        icon.src = bot.logo
        icon.classList.add('icon')
        if (bot.nsfw) icon.classList.add('nsfw')
        outer.appendChild(icon)

        let name = document.createElement("h2")
        name.classList.add('title')
        name.innerHTML = bot.username
        outer.appendChild(name)

        let p = document.createElement("p")
        p.classList.add('desc')
        p.innerHTML = bot.description
        outer.appendChild(p)

        let view = document.createElement("a")
        view.href = "/bots/" + bot.botid + "/"
        view.innerHTML = "View bot info"
        view.classList.add('button', 'small')
        outer.appendChild(view)

        let stuff = document.getElementById('cards')
        stuff.appendChild(outer)
    })
}

function search() {
    if (document.getElementById('search').contentEditable === "false") return;
    let s = String(document.getElementById('search').innerHTML.toLowerCase()).replaceAll('<br>', "");
    let cards = document.getElementById('cards');
    cards.style.display = "none";
    if (document.getElementById('loading')) document.getElementById('loading').display = "block";
    if (cards) {
        let totalCards = 0;
        let cardsVisible = 0;

        let list = cards.children;
        for (var i = 1; i < list.length; i++) {
            totalCards++
            let card = list[i];
            let title = card.children[1].innerHTML.toLowerCase();
            let desc = card.children[2].innerHTML.toLowerCase();
            if (!title.includes(s) && !desc.includes(s)) card.style.display = "none";
            else {
                card.style.display = "inline-block";
                cardsVisible++;
            }
        }

        if (cardsVisible === 0) {
            document.getElementById('searchMore').innerHTML = `No bots found. Would you like to <a href="/bots/search/?q=${s}">search all bots</a>?`;
            document.getElementById('searchMore').style.display = "block";
        } else {
            document.getElementById('searchMore').innerHTML = `Would you like to <a href="/bots/search/?q=${s}">search all bots</a>`
            document.getElementById('searchMore').style.display = "block";
        }

        if (document.getElementById('search').innerHTML === "") {
            document.getElementById('searchMore').style.display = "none";
            for (var i = 1; i < list.length; i++) {
                let card = list[i];
                card.style.display = "inline-block";
            }
        }
    }
    if (document.getElementById('loading')) document.getElementById('loading').display = "none";
    cards.style.display = "block";
}