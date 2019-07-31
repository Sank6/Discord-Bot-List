function submit() {
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

    var url = `${window.location.origin}/new`;
    var form = $(`<form action="${url}" method="post">
<input type="text" name="token" value="${data.token}" />
<input type="text" name="id" value="${data.id}" />
<input type="text" name="prefix" value="${data.prefix}" />
<input type="text" name="short" value="${data.short}" />
<input type="text" name="invite" value="${data.invite}" />
<input type="text" name="owners" value="${data.owners}" />
<textarea name="long" value="${data.long}">${data.long}</textarea>
</form>
`);
    $('body').append(form);
    form.submit();
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