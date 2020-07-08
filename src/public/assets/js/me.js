$(document).ready(() => {
    $('.delete').click((x) => {
        $('#botconfirm').val("")
        let bot = x.currentTarget.parentNode.childNodes[3].innerText;
        let id = x.currentTarget.parentNode.childNodes[7].href.split("/bots/")[1].replace("/", "");
        $('#botname').text(bot)
        $('#botconfirm').on("input", async function(){
            let newval = $('#botconfirm').val();
            if (newval.toLowerCase() === bot.toLowerCase()) {
                await fetch(`/api/bots/delete/${id}`);
                location.reload();
            }
        })
    })
})