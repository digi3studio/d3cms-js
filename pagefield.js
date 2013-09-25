$(document).ready(function(){
    setup_style_select();
    setup_form_action();
    setup_add_field_group();

    setup_before_action();
    setup_url_fields();

    setup_toggle_group();

    $(document).on('keydown', setup_hotkeys);

    $('a[data-action]').on('click',function(e){e.stopPropagation();eval($(this).data('action')+'()');return false;});
});

function copyfield(){
    //loop all form and fields
    $('#output').html($('input[type!="hidden"],textarea[type!="hidden"]').serialize());
}

function pastefield(){
    data = prompt('paste data here:');
    $('form').deserialize(data);
}

function setup_toggle_group(){
    $('.btn-group-toggle').on('click',function(e){
        e.stopPropagation();

        var item     = $(this).attr('data-item');
        var eleGroup = $('.group[data-item='+item+']');
        if(eleGroup.hasClass('none')){
            eleGroup.removeClass('none');
        }else{
            eleGroup.addClass('none');
        };
        return false;
    });

    $('.btn-group-shrink').on('click',function(e){
        e.stopPropagation();

        var item     = $(this).attr('data-group');
        var eleGroup = $('.group[data-group='+item+']');
        eleGroup.addClass('none');
        return false;
    });

    $('.btn-group-expand').on('click',function(e){
        e.stopPropagation();

        var item     = $(this).attr('data-group');
        var eleGroup = $('.group[data-group='+item+']');
        eleGroup.removeClass('none');
        return false;
    });
}

var last_key = 0;
var code_meta_key = 91;
var code_s = 83;
var code_p = 80;
function setup_hotkeys(e){
    /*control s*/
    if (last_key == code_meta_key && event.keyCode == code_s) {
        e.stopPropagation();
        isSave = true;
        store_fields();
        return false;
    }

    if (last_key == code_meta_key && event.keyCode == code_p) {
        e.stopPropagation();
        isPreview = true;
        store_fields();
        return false;
    }

    last_key = (event.keyCode == code_meta_key) ? code_meta_key : 0;

    if(e.ctrlKey==true){
        switch(e.keyCode){
            case(code_s):
                e.stopPropagation();
                isSave = true;
                store_fields();
                return false;
            case(code_p):
                e.stopPropagation();
                isPreview = true;
                store_fields();
                return false;
        }
    }
}

function setup_url_fields(){
    var url_fields = $('FORM#page input.textfield[data-type="link_url"]');
    for(var i=0;i<url_fields.length;i++){
        var field = $(url_fields[i]);
        var str = field.val();
        if(str=='')field.val('http://');
    }
}

function setup_before_action(){
    $('a[data-before="store_session"]').click(function(){
        var destination = $(this).attr('href');
        var windowTarget = $(this).attr('target');

        $('#ajax_wait').removeClass('hide');
        //store fields value as session;

        $.ajax({
            type:'POST',
            url:  adminPath+'/admin/page/storefields/save.json?session_id='+$('#form #session_id').val(),
            data: $('FORM#page').serialize(),
            success: function(){
                window.location = destination;
            }
        });
        return false;
    })
}

function setup_form_action(){
    $('A#form_save').click(function(){
        isSave = true;
        store_fields();
        return false;
    })

    $('A#form_preview').click(function(){
        isPreview = true;
        store_fields();
        return false;
    })
}

var isPreview = false;
var isSave = false;
var adminPath;
var landingAnchor="";
function setup_style_select(){
    //find the page folder;
    adminPath = String(window.location).split('/admin/')[0];
    //find the image folder;
    var imgpaths = $('.page_type_select IMG').attr('src').split("/");
    imgpaths.pop();
    var imgpath = imgpaths.join('/');

    //render the selected page
    $('.page_selected IMG').css({'background':'url('+imgpath+'/page0.gif) no-repeat'});

    //render the page type selections
    var albums = $('.page_type_select IMG');
    for(var i=0;i<albums.length;i++){
        var pageType = $(albums[i]).attr('data-page-type');
        $(albums[i]).css({'background':'url('+imgpath+'/page'+pageType+'.gif) no-repeat'});
    }

    //mousemove change image function
    $('.page_type_select IMG').mousemove(function(e){
        var selectorSize = $(this).width();
        var layoutCount = parseInt($(e.target).attr('data-layout-count'));

        var x = (e.pageX - this.offsetLeft)/selectorSize;
        var tx = -Math.floor(x*layoutCount)*100;

        $(e.target).css({'background-position':tx+'px 0px'});
    });

    //fix the mouse over
    $('.page_type_select IMG').hover(function() {
        $(this).css('cursor','pointer');
    }, function() {
        $(this).css('cursor','auto');
    });

    /* defaut layout*/
    var selected_page_type		= $('#pagetype_id').val();
    var selected_page_layout	= $('#layout_id').val();

    if(selected_page_type!="" && selected_page_layout!=""){
        $('.page_selected IMG').css({'background':'url('+imgpath+'/page'+selected_page_type+'.gif) no-repeat '+(-selected_page_layout*100)+'px 0px'});
    };

    //click to select page and layout
    $('.page_type_select IMG').click(function(e){
        var layoutCount  = parseInt($(e.target).attr('data-layout-count'));
        var selectorSize = $(this).width();

        var selected_page_type		= $(e.target).attr('data-page-type');
        var selected_page_layout	= Math.floor((e.pageX - this.offsetLeft)/selectorSize* layoutCount);

        $('.page_selected IMG').css({'background':'url('+imgpath+'/page'+selected_page_type+'.gif) no-repeat '+(-selected_page_layout*100)+'px 0px'});

        $('#pagetype_id').attr('value',selected_page_type);
        $('#layout_id').attr('value',selected_page_layout);

        //store fields value as session;
        store_fields();
    });
}

function store_fields(){
    $('#ajax_wait').removeClass('hide');

    var url_fields = $('FORM#page input.textfield[data-type="link_url"]');
    for(var i=0;i<url_fields.length;i++){
        var field = $(url_fields[i]);
        var str = field.val();
        if(str=='http://')field.val('');
    }

    //store fields value as session;
    $.ajax({
        type:'POST',
        url:  adminPath+'/admin/page/storefields/save.json?session_id='+$('#form #session_id').val(),
        data: $('FORM#page').serialize(),
        success: store_fields_success
    });
}

function store_fields_success(){
    $('#ajax_wait').addClass('hide');
    if(isSave==true){
        $('FORM#page').submit();
        return;
    }

    var pageId    = $('#form #id').val();
    var campaign  = $('#form #campaign').val();
    var sessionId = $('#form #session_id').val();
    var language  = $('#form #language').val();
    var parameter = pageId+'?campaign='+campaign+'&session_id='+sessionId+'&language='+language;

    if(isPreview==true){
        window.location = adminPath+'/admin/page/preview/'+parameter;
        return;
    }

    window.location = adminPath+'/admin/page/edit/'+parameter;
}

function setup_add_field_group(){
    $('.field_group_add').click(add_field_group);
}

function add_field_group(e){
    var field_group_id 		= $(e.target).attr('data-fieldgroup');
    var field_group_count	= parseInt($('#count'+field_group_id).attr('value'));

    $('#count'+field_group_id).attr('value',field_group_count+1);
    store_fields();
    return false;
}