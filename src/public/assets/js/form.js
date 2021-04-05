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

function submit() {
    let required = ["botid", "prefix", "description"]
    for (let v of required) {
        if (!document.getElementById(v).value) {
            $(`a[href="##edit"]`).click()
            flash(v)
            return;
        }
    }

    let form_items = ["botid", "prefix", "description", "invite", "support", "website", "github", "tags", "owner-ids", "note", "webhook"]
    let data = {}
    for (let form_item of form_items) {
        data[form_item] = $(`#${form_item}`).val()
    }

    data["id"] = data["botid"];
    data["owners"] = data["owner-ids"];
    data["long"] = CKEDITOR.instances.longdesc.getData();
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

    /* Tags */
    var select = $('select[multiple]');
    var options = select.find('option');

    var div = $('<div />').addClass('selectMultiple');
    var active = $('<div />');
    var list = $('<ul />');
    var placeholder = select.data('placeholder');

    var span = $('<span />').text(placeholder).appendTo(active);

    options.each(function() {
        var text = $(this).text();
        if($(this).is(':selected')) {
            active.append($('<a />').html('<em>' + text + '</em><i></i>'));
            span.addClass('hide');
        } else {
            list.append($('<li />').html(text));
        }
    });

    active.append($('<div />').addClass('arrow'));
    div.append(active).append(list);

    select.wrap(div);

    $(document).on('click', '.selectMultiple ul li', function(e) {
        var select = $(this).parent().parent();
        var li = $(this);
        if(!select.hasClass('clicked')) {
            select.addClass('clicked');
            li.prev().addClass('beforeRemove');
            li.next().addClass('afterRemove');
            li.addClass('remove');
            var a = $('<a />').addClass('notShown').html('<em>' + li.text() + '</em><i></i>').hide().appendTo(select.children('div'));
            a.slideDown(100, function() {
                a.addClass('shown');
                select.children('div').children('span').addClass('hide');
                select.find('option:contains(' + li.text() + ')').prop('selected', true);
            });
            if(li.prev().is(':last-child'))
                li.prev().removeClass('beforeRemove');
            if (li.next().is(':first-child'))
                li.next().removeClass('afterRemove');

            li.prev().removeClass('beforeRemove');
            li.next().removeClass('afterRemove');

            li.slideUp(400);
            li.remove();
            select.removeClass('clicked');
        }
    });

    $(document).on('click', '.selectMultiple > div a', function(e) {
        var select = $(this).parent().parent();
        var self = $(this);
        self.removeClass().addClass('remove');
        select.addClass('open');
        self.addClass('disappear');
        self.animate({ width: 0, height: 0, padding: 0, margin: 0 })
        var li = $('<li />').text(self.children('em').text()).addClass('notShown').appendTo(select.find('ul'));
        li.slideDown(400);
        li.addClass('show');
        select.find('option:contains(' + self.children('em').text() + ')').prop('selected', false);
        if(!select.find('option:selected').length)
            select.children('div').children('span').removeClass('hide');
        li.removeClass();
        self.remove();
    });

    $(document).on('click', '.selectMultiple', function(e) {
        $(this).toggleClass('open');
    });
})

CKEDITOR.on('instanceReady', () => {
    let bg = window.getComputedStyle(document.body).getPropertyValue('--background-color')
    let color = window.getComputedStyle(document.body).getPropertyValue('--color')
    $(".cke_wysiwyg_frame ").contents().find('body').css({'background-color' : bg, color});;
})
CKEDITOR.disableAutoInline = true;
