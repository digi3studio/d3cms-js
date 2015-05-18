var controller;
$(document).ready(function(){
    controller = $('body').data('controller');

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
    var data = prompt('paste data here:');
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
            url:  adminPath+'/'+controller+'/storefields/save.json?session_id='+$('#form #session_id').val(),
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
        $(albums[i]).css({'background':'url('+imgpath+'/page'+pageType+'s.gif) no-repeat'});
    }

    var thumbnail_size = 50;
    //mousemove change image function
    $('.page_type_select IMG').mousemove(function(e){
        e.preventDefault();
        if($('div.role-admin').length == 0){
            return false;
        };

        var selectorSize = $(this).width();
        var layoutCount = parseInt($(e.target).attr('data-layout-count'));

        var x = (e.pageX - this.offsetLeft)/selectorSize;
        var tx = -Math.floor(x*layoutCount)*thumbnail_size;

        $(e.target).css({'background-position':tx+'px 0px'});
        //basic user only can select simple content layout1, gallery layout3

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

        if($('div.role-admin').length == 0){
            switch(selected_page_type){
                case('1'):
                    selected_page_layout = 0;
                    break;
                case('4'):
                    selected_page_layout = 2;
                    break;
            }
        };

        $('.page_selected IMG').css({'background':'url('+imgpath+'/page'+selected_page_type+'.gif) no-repeat '+(-selected_page_layout*100)+'px 0px'});

        $('#pagetype_id').attr('value',selected_page_type);
        $('#layout_id').attr('value',selected_page_layout);

        //store fields value as session;
        store_fields();
    });

    $('.page_type_select img[data-page-type=4]').css({'background-position':'-100px 0'});
}

function store_fields(){
    $('#ajax_wait').removeClass('hide');
    //store fields value as session;
    //add &nbsp; to special wording
    var fields = $("FORM#page textarea.textfield");
    for(var i=0;i<fields.length;i++){
        var field = $(fields[i]);
        var fieldName = field.attr('name');
        if(fieldName=='field101'||fieldName=='field111'||fieldName=='field121'){
            continue;
        }
        var str = field.val();
        field.val(str.replace(/veuve clicquot/gi,"Veuve&nbsp;Clicquot"));
    }

    var shortStrings = $("form#page input.textfield");
    for(var i=0;i<shortStrings.length;i++){
        var field = $(shortStrings[i]);
        var str = field.val();
        field.val(str.replace(/"/gi,"&quot;"));
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
        url:  adminPath+'/'+controller+'/storefields/save.json?session_id='+$('#form #session_id').val(),
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
        window.location = adminPath+'/'+controller+'/preview/'+parameter;
        return;
    }

    window.location = adminPath+'/'+controller+'/edit/'+parameter;
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

/*gallery sort image view*/
function toggle_image_sortable() {
    var mode = $('[data-type="22"]').hasClass('image_sortable');
    if(!mode) {
        $('[data-type="22"]').addClass('image_sortable');
        $('input.imagefield.textfield').each(function( index ) {
            var image = $(this).val()
            $(this).closest('tr').css('background', 'url(/imagefly/w160-h160-c/media/upload/' + image + ')');
        });
    }
    else {
        $('[data-type="22"]').removeClass('image_sortable');
        $('input.imagefield.textfield').each(function( index ) {

            $(this).closest('tr').css('background', 'none');
        });
    }
}

function add_toggle_image_sortable_switch () {
    $('#count22').after('<a onclick="toggle_image_sortable()">#</a>');
}