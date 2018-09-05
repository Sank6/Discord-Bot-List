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

  window.onload = function() {
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
    
  var client = new HttpClient();
  client.get(`https://${window.location.hostname}/api/get?token=${localStorage.token}`, function(res) {
    res = JSON.parse(res)[0];
    console.log(res)
    if (res.id === document.getElementById('botOwnerGetter').innerHTML || res.id === "297403616468140032") {
      document.getElementById('by').onclick = function() {
        let id = window.location.href.replace(`${window.location.hostname}`, "")
          .replace("https://", "")
          .replace("http://", "")
          .replace("/bots/", "")
          .replace("/", "")
        window.location.href = `https://${window.location.hostname}/edit/${id}`
      }
    }
  });
    
}