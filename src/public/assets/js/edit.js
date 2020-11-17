$( document ).ready(async function() {
    $(".link").click((e) => {
        $(".section").hide();
        $(e.target.href.split("/#").slice(-1)[0]).show()
    })
    $(document).on("click",".delete", function () {
        let newval = prompt(`Type ${$(this).attr("data-name")} to confirm`)
        
        if (newval.toLowerCase() === $(this).attr("data-name").toLowerCase()) {
            fetch(`/api/bots/${$(this).attr("data-id")}`, {method: "DELETE"}).then(() => location.href = "/me")
        } else location.reload();
    })
})