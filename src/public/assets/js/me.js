$(document).ready(() => {
    $(document).on("click",".delete", async function () {
        await Swal.fire({
            title: `Deleting ${$(this).attr("data-name")}`,
            icon: 'warning',
            html: `Type <u>${$(this).attr("data-name")}</u> to confirm`,
            showCancelButton: true,
            input: "text",
            confirmButtonText: `Delete`,
            preConfirm: async (name) => {
                if (name.toLowerCase() !== $(this).attr("data-name").toLowerCase()) {
                    Swal.update({
                        title: "Cancelled",
                        html: ""
                    });
                    await wait(1)
                } else {
                    await fetch(`/api/bots/${$(this).attr("data-id")}`, {method: "DELETE"});
                    location.href = "/me";
                }
            }
        })
    })
})