var controller;
var last_key = 0;
var code_meta_key = 91;
var code_s = 83;
var code_p = 80;
var base;

$(document).ready(function(){
    base = $('body').data('base');
    controller = $('body').data('controller');
    setup_form_action();
    setup_before_action();

    $(this).on('keydown', setup_hotkeys);

    $('a[data-action]').on('click', function(e){
        e.stopPropagation();
        eval($(this).data('action')+'()');
        return false;
    });
});

function copyfield(){
    //loop all form and fields
    $('#output').html($('input[type!="hidden"],textarea[type!="hidden"]').serialize());
}

function pastefield(){
    var data = prompt('paste data here:');
    $('form').deserialize(data);
}

function setup_hotkeys(e){
    e.stopPropagation();
    /*control s*/
    if (last_key == code_meta_key && event.keyCode == code_s) {
        save();
        return false;
    }

    if (last_key == code_meta_key && event.keyCode == code_p) {
        preview();
        return false;
    }

    last_key = (event.keyCode == code_meta_key) ? code_meta_key : 0;

    if(e.ctrlKey==true){
        switch(e.keyCode){
            case(code_s):
                save();
                return false;
            case(code_p):
                preview();
                return false;
        }
    }
}

function setup_before_action(){
    $('a[data-before="store_session"]').on('click',function(e){
        e.preventDefault();

        var destination = $(this).attr('href');
        store_fields(function(){
            window.location = destination;
        });
    })
}

function setup_form_action(){
    $('A#form_save').click(function(e){
        e.preventDefault();
        save();
    })
}

function save(){
    store_fields(
        function(){
            $('FORM#page').submit();
        }
    );
}

function preview(){
    store_fields(function(){
        var pageId    = $('#id').val();
        var campaign  = $('#campaign').val();
        var sessionId = $('#session_id').val();
        var language  = $('#language').val();
        var parameter = pageId+'?campaign='+campaign+'&session_id='+sessionId+'&language='+language;

        window.location = base+controller+'/preview/'+parameter;
    });
}

function reload(){
    store_fields(function(){
        var pageId    = $('#id').val();
        var campaign  = $('#campaign').val();
        var sessionId = $('#session_id').val();
        var language  = $('#language').val();
        var parameter = pageId+'?campaign='+campaign+'&session_id='+sessionId+'&language='+language;

        window.location = base+controller+'/edit/'+parameter;
    });
}

function store_fields(onSuccess){
    if(onSuccess==null){
        onSuccess = function(){}
    }
    $('#ajax_wait').removeClass('hide');
    //store fields value as session;
    //clean up korean fix break
    var fields = $("FORM#page textarea.textfield");
    for(var i=0;i<fields.length;i++){
        var field = $(fields[i]);
        var str = field.html();
        field.html(str.replace(/?/gi,''));
    }

    //add &nbsp; to special wording
    var form = $('form#page');
    var fields = form.find('textarea.textfield');
    var i, field, str;
    for(i=0;i<fields.length;i++){
        field = $(fields[i]);
        var fieldName = field.attr('name');

        if(fieldName=='field101'||fieldName=='field111'||fieldName=='field121'){
            continue;
        }
        str = field.val();
        field.val(str.replace(/veuve clicquot/gi,"Veuve&nbsp;Clicquot"));
    }

    var shortStrings = form.find('input.textfield');
    for(i=0;i<shortStrings.length;i++){
        field = $(shortStrings[i]);
        str = field.val();
        field.val(str.replace(/"/gi,'&quot;'));
    }

    /*checkbox fix*/
    $('input[type="checkbox"]').each(function(e){
        if(this.checked==true){
            $(this).attr('value','1');
            this.checked=true;
        }else{
            $(this).attr('value','0');
            this.checked=true;
            this.hidden = true;
        }
    });

    $.ajax({
        type:'POST',
        url:  base+controller+'/storefields/save.json?session_id='+$('#form #session_id').val(),
        data: form.serialize(),
        success: function(){
            $('#ajax_wait').addClass('hide');
            onSuccess();
        }
    });
}