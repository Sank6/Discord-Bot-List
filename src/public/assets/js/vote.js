$(document).ready(async function () {
  $('#vote').click(() => {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    })
    swalWithBootstrapButtons.fire({
      title: 'Are you sure you want to vote this bot ?',
      text: "You won't be able to vote for the next 12 hours!",
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Vote!',
      cancelButtonText: 'No, Cancel!',
      reverseButtons: false
    }).then((result) => {
      if (result.isConfirmed) {
        if (document.getElementById('date').innerText == 'Undefined') {
          const text = document.getElementById('votes').innerHTML.replace(' Votes', '')
          const votes = Number(text) + 1
          document.getElementById('votes').innerHTML = `${votes} Votes`;
          document.getElementById('date').innerText = new Date();
          let method = "PATCH";
          let botId = location.href.split(location.host)[1].replace('/bots/vote/', '').replace('/', '');
          fetch(`/api/vote/${botId}`, {
            method,
            headers: {
              'Content-Type': 'application/json'
            }
          })
          swalWithBootstrapButtons.fire({
            title: 'Success',
            text: 'You have successfully voted !',
            icon: 'success',
            confirmButtonColor: '#28a745'
          })

        } else {
          const date = document.getElementById('date').innerText;
          var dt = new Date(date)
          dt.setHours(dt.getHours() + 12);
          var countDownDate = dt.getTime();
          var now = new Date().getTime();
          var distance = countDownDate - now;
          var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          var seconds = Math.floor((distance % (1000 * 60)) / 1000);
          if (distance < 0) {
            const text = document.getElementById('votes').innerHTML.replace(' Votes', '')
            const votes = Number(text) + 1
            document.getElementById('votes').innerHTML = `${votes} Votes`
            document.getElementById('date').innerHTML = new Date();
            let method = "PATCH";
            let botId = location.href.split(location.host)[1].replace('/bots/vote/', '').replace('/', '');
            fetch(`/api/vote/${botId}`, {
              method,
              headers: {
                'Content-Type': 'application/json'
              }
            })
            swalWithBootstrapButtons.fire({
              title: 'Success',
              text: 'You have successfullf voted !',
              icon: 'success',
              confirmButtonColor: '#28a745'
            })
          } else {
            swalWithBootstrapButtons.fire({
              title: 'Error',
              text: `You can only vote again after ${hours} Hours ${minutes} Minutes ${seconds} Seconds !`,
              icon: 'error',
              confirmButtonColor: '#d33'
            })
          }
        }
      } else if (
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire({
          title: 'Cancelled',
          text: 'Voting Cancelled',
          icon: 'error',
          confirmButtonColor: '#d33'
        })
      }
    })
  })
})
