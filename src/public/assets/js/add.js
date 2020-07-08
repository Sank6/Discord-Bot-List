function submit(resubmit=false) {
    if (!document.getElementById('botid').value)
        return flash(document.getElementById('botid'))
    if (!document.getElementById('prefix').value)
        return flash(document.getElementById('prefix'))
    if (!document.getElementById('short').value)
        return flash(document.getElementById('short'))
    if (!document.getElementById('longdesc').value)
        return flash(document.getElementById('longdesc'))

    let data = {
        token: localStorage.getItem('token'),
        id: document.getElementById('botid').value,
        prefix: document.getElementById('prefix').value,
        short: document.getElementById('short').value,
        invite: document.getElementById('invite').value,
        owners: document.getElementById('owners').value,
        long: document.getElementById('longdesc').value
    };

    let url = `/api/bots/submit`
    if (resubmit) url = `/api/bots/resubmit`

    fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers:{
          'Content-Type': 'application/json'
        }
    }).then(res => res.json())
    .then(response => {
        location.href = response.redirect
    })
}

function flash(element) {
    element.scrollIntoView();
    element.style.border = "2px solid #ff0000";
    element.style.backgroundColor = "rgba(255, 0, 0, 0.5)";
    setTimeout(() => {
        element.style.backgroundColor = "rgba(0, 0, 0, 0)";
        element.style.border = "1px solid #888";
    }, 600)
}