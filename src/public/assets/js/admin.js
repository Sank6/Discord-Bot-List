function approve(id) {
    let method = "PATCH";
    let conf = confirm(`Are you sure you want to approve bot of id ${id} ?`)
    if (conf) {
        let data = {
            method: 'approve',
            id: id
        }
        fetch(`/api/admin/${data.id}`, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(body => body.json()).then(body => {
            if (body.success) {
                location.reload()
            } else {
                alert(`Error:- ${body.message}`)
                location.reload()
            }
        })

    } else return
}

function deny(id) {
    let method = "PATCH";
    let reason = prompt('Reason For Denying')
    let conf = confirm(`Are you sure you want to deny bot of id ${id} for ${reason}?`)
    if (conf) {
        let data = {
            method: 'deny',
            reason: reason,
            id: id
        }
        fetch(`/api/admin/${data.id}`, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(body => body.json()).then(body => {
            if (body.success) {
                location.reload()
            } else {
                alert(`Error:- ${body.message}`)
                location.reload()
            }
        })
    } else return
}
