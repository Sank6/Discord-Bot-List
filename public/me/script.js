var HttpClient = function() {
    this.get = function(aUrl, aCallback) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() { 
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                aCallback(anHttpRequest.responseText);
        }

        anHttpRequest.open( "GET", aUrl, true );            
        anHttpRequest.send(null);
    }
}
var client = new HttpClient();
var client2 = new HttpClient();
client2.get(`https://${window.location.hostname}/api/get?token=${localStorage.token}`, function(res2) {
  client.get(`https://${window.location.hostname}/list`, function(response) {
    let res = JSON.parse(response)
    res.forEach(function(shell) {
      let bot = shell.bot;
      if (!bot.owner) return;
      if (bot.owner !== JSON.parse(res2)[0].id) return;
      let outer = document.createElement("div")
      outer.classList.add("card");

      $(outer).on('click', function (e) {
        if (!$(e.target).hasClass('invite') && !$(e.target).hasClass('detail') && !$(e.target).hasClass('fas')) {
          console.log(outer.children[1].children[0].children[0])
          outer.children[1].children[0].children[0].click()
        }
      });


      let banner = document.createElement("span")
      banner.classList.add('banner')
      outer.appendChild(banner)

      let icon = document.createElement("img")
      icon.src = bot.logo
      icon.classList.add('icon', bot.status)
      banner.appendChild(icon)

      let name = document.createElement("h2")
      name.classList.add('title')
      name.innerHTML = bot.name
      banner.appendChild(name)





      let links = document.createElement("span")
      links.classList.add('links')

      let view = document.createElement("a")
      view.href = "/bots/" + bot.id + "/"
      view.classList.add('view')
      view.innerHTML = "View"
      links.appendChild(view)


      let invite = document.createElement("a");
      invite.href = bot.invite
      invite.classList.add('invite')
      invite.target = '_blank';
      let t = document.createTextNode(" Invite");

      let i = document.createElement("i")
      i.classList.add('fa-link')
      i.classList.add('fas');

      invite.appendChild(i)
      invite.appendChild(t)
      links.appendChild(invite)


      let details = document.createElement("a")
      details.classList.add('detail');
      let text;
      if (bot.servers == undefined) text = ""
      else text = "  " + String(bot.servers)
      let t2 = document.createTextNode(text);

      let i2 = document.createElement("i")
      i2.classList.add('fa-chart-bar')
      i2.classList.add('fas');

      details.appendChild(i2)
      details.appendChild(t2)
      links.appendChild(details)






      let holder = document.createElement("span")
      holder.classList.add('desc-holder')

      holder.appendChild(links)
      let p = document.createElement("p")
      p.classList.add('desc')
      p.innerHTML = bot.description
      holder.appendChild(p)

      outer.appendChild(holder)

      let stuff = document.getElementById('your')
      stuff.appendChild(outer)

    })
  })
})



  function switched(e) {
    if (e.classList.contains('fas')) {
      e.classList.remove("fas", 'dark');
      e.classList.add("far", 'light');
      localStorage.colour = "dark"
      document.body.style.backgroundColor = "#201F23"
    } else {
      e.classList.add("fas", 'dark');
      e.classList.remove("far", 'light');
      localStorage.colour = "light"
      document.body.style.backgroundColor = "#727177"
    }
  }

  function onload() {
    let e = document.getElementById('switch')
    let choice = localStorage.getItem("colour");
    if (choice == 'dark') {
      e.classList.remove("fas", 'dark');
      e.classList.add("far", 'light');
      document.body.style.backgroundColor = "#201F23";
    }
    else {
      e.classList.add("fas", 'dark');
      e.classList.remove("far", 'light');
      document.body.style.backgroundColor = "#727177"
    }

    document.getElementById('logout').onclick = function() {
      localStorage.removeItem('token');
      window.location.href = "/"
    }
    let title = document.getElementById('h1');
    var client = new HttpClient();
    client.get(`https://${window.location.hostname}/api/get?token=${localStorage.token}`, function(response) {
      let res = JSON.parse(response)
      title.innerHTML = `${res[0].username}#${res[0].discriminator}`
      title.style.display = "inline";
    })
}