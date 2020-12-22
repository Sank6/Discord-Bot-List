async function approve(id, username) {
    await Swal.fire({
        title: `Approve ${username}`,
        html: `Are you sure you want to approve <u>${username}?</u>`,
        showCancelButton: true,
        confirmButtonText: `Approve`,
        showLoaderOnConfirm: true,
        preConfirm: async () => {
            let body = await fetch(`/api/admin/approve/${id}`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' }
            });
            body = await body.json();
            if (body.success) location.reload()
            else Swal.showValidationMessage(body.message)
        }
    })
    location.reload()
}

async function deny(id, username) {
    await Swal.fire({
        title: `Deny ${username}`,
        html: `Enter a reason to deny <u>${username}</u>`,
        showCancelButton: true,
        input: "text",
        confirmButtonText: `Deny`,
        showLoaderOnConfirm: true,
        preConfirm: async (reason) => {
            let body = await fetch(`/api/admin/deny/${id}`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({reason})
            });
            body = await body.json();
            if (body.success) location.reload()
            else Swal.showValidationMessage(body.message)
        }
    })
    location.reload()
}

async function note(note, username) {
    await Swal.fire({
        title: `Note for ${username}`,
        text: note,
        confirmButtonText: `Ok`
    })
}