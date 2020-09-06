$(document).ready(() => {
    $('.delete').click((x) => {
        let bot = x.currentTarget.parentNode.childNodes[3].innerText;
        let id = x.currentTarget.parentNode.childNodes[7].href.split("/bots/")[1].replace("/", "");
        let newval = prompt(`Type ${bot} to confirm`)
        
        if (newval.toLowerCase() === bot.toLowerCase()) {
            fetch(`/api/bots/${id}`, {method: "DELETE"}).then(() => location.reload());
        } else location.reload();
    })
})