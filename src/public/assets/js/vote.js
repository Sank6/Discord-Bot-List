$(document).ready(async function () {
  $('#vote').click(async () => {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    })
    let { isConfirmed } = await swalWithBootstrapButtons.fire({
      title: 'Are you sure you want to vote this bot ?',
      text: "You won't be able to vote for the next 12 hours.",
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Yes, Vote'
    })
    if (!isConfirmed) return;
    let botid = location.href.split(location.host)[1].replace('/bots/vote/', '').replace('/', '');
    let req = await fetch(`/api/vote/${botid}`, {
      method: "PATCH",
      headers: { 'Content-Type': 'application/json' }
    })
    req = await req.json()
    if (req.success) {
      await swalWithBootstrapButtons.fire({
        title: 'Success',
        text: 'You have successfully voted !',
        icon: 'success'
      })
      location.href = `/bots/${botid}`
    } else {
      let hours = 11 - Math.floor(req.time / 3600000);
      let minutes = 60 - Math.ceil(req.time  / 60000);
      await swalWithBootstrapButtons.fire({
        title: 'Error',
        text: `You can vote again after ${hours} hours and ${minutes} minutes`,
        icon: 'error'
      })
      location.href = `/bots/${botid}`
    }
  })
})
