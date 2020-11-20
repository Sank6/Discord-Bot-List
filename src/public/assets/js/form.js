var recaptcha_token = null;

function update_token(token) {
    recaptcha_token = token;
}

function flash(element_id) {
    let element = document.getElementById(element_id);
    
    const yOffset = -100; 
    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

    window.scrollTo({top: y, behavior: 'smooth'});

    element.style.border = "2px solid #ff0000";
    element.style.backgroundColor = "rgba(255, 0, 0, 0.5)";
    setTimeout(() => {
        element.style.backgroundColor = "rgba(0, 0, 0, 0)";
        element.style.border = "1px solid #888";
    }, 600)
}

function submit(edit=false) {
    var $select = $('select').selectize({
        plugins: ['remove_button', 'restore_on_backspace'],
        delimiter: ',',
        persist: false,
    });
    var selectizeControl = $select[0].selectize

    let required = ["botid", "prefix", "description", "tags"]
    for (let v of required) {
        if (!document.getElementById(v).value) {
            $(`a[href="##edit"]`).click()
            flash(v)
            return;
        }
    }

    let form_items = ["botid", "prefix", "description", "invite", "support", "website", "github", "tags", "owner-ids"]
    let data = {}
    for (let form_item of form_items) {
        data[form_item] = $(`#${form_item}`).val()
    }

    data["id"] = data["botid"];
    data["owners"] = data["owner-ids"];
    data["long"] = CKEDITOR.instances.longdesc.getData();
    data["tags"] = selectizeControl.getValue()
    data["recaptcha_token"] = recaptcha_token

    let method = "POST";
    if (location.href.includes("/bots/edit")) method = "PATCH"
    fetch(`/api/bots/${data.id}`, {
        method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(body => body.json()).then(body => {
        if (!body.success) {
            recaptcha_token = null;
            grecaptcha.reset();
            let opts = {
                type: "error",
                text: body.message,
                theme: "sunset",
                timeout: 3500
            }
            if (body.button) {
                opts.buttons = [
                    Noty.button(body.button.text, 'btn btn-success', function () {
                        location.href = body.button.url
                    }),
                ]
            }
            new Noty(opts).show();
        } else {
            if (location.href.includes("/bots/edit")) location.href = `/bots/${data.id}`;
            else location.href = "/success"
        }
    })
}

$( document ).ready(async function() {
    var $select = $('select').selectize({
        plugins: ['remove_button', 'restore_on_backspace'],
        delimiter: ',',
        persist: false,
        maxItems: Number(document.getElementById('count').innerText),
    });
    document.getElementById('count').innerText = ''
    if (location.href.includes("/bots/edit")) {
        let botId = location.href.split(location.host)[1].replace('/bots/edit/', '').replace('/', '');
        $('#auth').click(() => {
            fetch(`/api/auth/${botId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        title: 'Your authorisation token',
                        icon: 'info',
                        html:
                        `Your authorisation token is <code>${data.auth}</code>`,
                        showCloseButton: true,
                        focusConfirm: false,
                        confirmButtonText: 'Close',
                        confirmButtonAriaLabel: 'close',
                    })
                } else {
                    Swal.fire({
                        title: 'Your authorisation token',
                        icon: 'error',
                        html:
                        `There was an error with your authorisation token.`,
                        showCloseButton: true,
                        focusConfirm: false,
                        confirmButtonText: 'Close',
                        confirmButtonAriaLabel: 'close',
                    })
                }
            });
        })
        $('#reset').click(() => {
            fetch(`/api/auth/reset/${botId}`)
            .then(res => res.json())
            .then(data => {
                
                if (data.success) {
                    Swal.fire({
                        title: 'Your new authorisation token',
                        icon: 'info',
                        html:
                        `Your new authorisation token is <code>${data.auth}</code>`,
                        showCloseButton: true,
                        focusConfirm: false,
                        confirmButtonText: 'Close',
                        confirmButtonAriaLabel: 'close',
                    })
                } else {
                    Swal.fire({
                        title: 'Your new authorisation token',
                        icon: 'error',
                        html:
                        `There was an error with your authorisation token.`,
                        showCloseButton: true,
                        focusConfirm: false,
                        confirmButtonText: 'Close',
                        confirmButtonAriaLabel: 'close',
                    })
                }
            });
        });
    }
    CKEDITOR.replace('longdesc', {
        toolbarGroups: [
            { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
            { name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi', 'paragraph' ] },
            { name: 'clipboard', groups: [ 'undo', 'clipboard' ] },
            { name: 'editing', groups: [ 'find', 'selection', 'spellchecker', 'editing' ] },
            { name: 'forms', groups: [ 'forms' ] },
            { name: 'links', groups: [ 'links' ] },
            { name: 'insert', groups: [ 'insert' ] },
            { name: 'styles', groups: [ 'styles' ] },
            { name: 'colors', groups: [ 'colors' ] },
            { name: 'tools', groups: [ 'tools' ] },
            { name: 'document', groups: [ 'mode', 'document', 'doctools' ] },
            { name: 'others', groups: [ 'others' ] },
            { name: 'about', groups: [ 'about' ] }
        ],
        uiColor: window.getComputedStyle(document.body).getPropertyValue('--background-2').replace(" ", ""),
        removeButtons: 'Save,Templates,Cut,Find,SelectAll,Scayt,Form,Checkbox,Replace,NewPage,Preview,Print,Paste,Copy,PasteText,PasteFromWord,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,CopyFormatting,RemoveFormat,Superscript,Subscript,Outdent,Indent,CreateDiv,Language,BidiRtl,BidiLtr,Unlink,Anchor,Flash,Font,Smiley,PageBreak,SpecialChar,Iframe,FontSize,ShowBlocks,Maximize,About,Format,Styles'
    });
})
CKEDITOR.on('instanceReady', () => {
    let bg = window.getComputedStyle(document.body).getPropertyValue('--background-color')
    let color = window.getComputedStyle(document.body).getPropertyValue('--color')
    $(".cke_wysiwyg_frame ").contents().find('body').css({'background-color' : bg, color});;
})
CKEDITOR.disableAutoInline = true;
