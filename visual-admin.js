/**
 * Created by Digi3 on 23/3/2015.
 */

function initToggleEditMode(){
    $('#action-advance').on('click',function(){
        var isPreview = $('body').hasClass('mode-preview');
        if(isPreview){
            $('body').removeClass('mode-preview');
        }else{
            $('body').addClass('mode-preview');
        }
    });
}

function inlinePreviewResize(){
    $('#inline-preview-frame').height($(window).height()-150);
}

function initPreview(){
    $('body').addClass('mode-preview');
    $(window).on('resize', inlinePreviewResize);

    //load preview content
    var previewFrame = $('#inline-preview-frame');
//    var previewCSS = previewFrame.data('preview-css');
    previewFrame.on('load',previewOnLoadInjectEditing);

    store_fields(function(){
        inlinePreviewResize();
        previewFrame.attr('src',previewFrame.data('preview-url'));
    });
}

/*add preview css, make editable links and */
function previewOnLoadInjectEditing(){
    var frame = $(this);
    //this is the iframe
    var frameDoc = frame.contents();
    //add highlighter css
    frameDoc.find('body').append(
        '<link type="text/css" href="'+frame.data('preview-css')+'" rel="stylesheet" media="all">'
    );

    frameDoc.find('a').on('click',previewLinkDisable);
    /*text*/
    frameDoc.find('span.inline-input')
        .attr('contentEditable','true')
        .on('click',startEditField)
        .on('keyup',previewInlineEditOnChangeSyncInput)
        .on('blur',previewInlineEditCheck)

    /*file attributes*/
    frameDoc.find('img').each(function(){

        var inlineInput = $(this);
        var src = inlineInput.attr('src');
        if(src.indexOf('editable=true')==-1)return;
        var id = src.match(/id\=[^&]+/i)[0].replace('id=','');

        $('input[name="'+id+'"]').on('change',function(){
            var input = $(this);
            var originalSrc = inlineInput.attr('src');
            var path = originalSrc.replace(/media\/upload\/[^\?]+\?[^\?]*/i,'media/upload/')
            var query = originalSrc.match(/\?[^\?]+/)[0];
            inlineInput.attr('src',
                path+input.val()+query
            )
        });

        inlineInput
            .attr('data-id',id)
            .addClass('inline-input')
            .on('click',previewInlineStartUploadImage);
    });


    frameDoc.find('body').on('click',highlightEditField);

    frameDoc.on('scroll',previewOnScrollSavePos);
    frameDoc.scrollTop((sessionStorage.previewScroll!=null)?sessionStorage.previewScroll:0);
}

function previewInlineStartUploadImage(e){
    e.preventDefault();
    var inlineInput = $(this);
    var input = inlineInput.data('id').replace('field','img');
    $('input[name="'+input+'"]').click();
}

function previewLinkDisable(e){
    e.preventDefault();
    e.stopPropagation();
    return false;
}

function previewOnScrollSavePos(){
    sessionStorage.previewScroll = $(this).scrollTop();
}

//remove tags
function getText(htmlText){
    return htmlText.replace(/<[^>]*>/g,'').replace(/\&nbsp;/gi,' ').replace(/\s+/g,' ');
}

function previewInlineEditOnChangeSyncInput(){
    var inlineInput = $(this);

    if(inlineInput.attr('data-empty')=='true'){
        //it's empty, all pasted content's format removed.
        inlineInput.html(getText(inlineInput.html()));
    }

    if(inlineInput.data('type')=='link'){
        //remove html tags
        inlineInput.html(getText(inlineInput.html()));
    }

    inlineInput.attr('data-empty',(getText(inlineInput.html())=='')?'true':'false');

    $(getInputSelector(inlineInput.data('id'))).val(inlineInput.html());
}

function previewInlineEditCheck(){
    var inlineInput = $(this);
    var inlineText = inlineInput.html();
    inlineText = inlineText.replace(/<[^>]*>/g,'');

    if(inlineText == ''){
        inlineInput.attr('data-empty','true').html('???');
    }

    if(inlineInput.data('type')=='link'){

    }
}

function initPrompt(){
    $('#prompt')
        .modal({
            onApprove : function() {
                $('#prompt-content .input').each(function(){
                    console.log($(this));
                });
            }
        })
}


$(document).ready(function(){
    initToggleEditMode();
    initPreview();
    initPrompt();
});

function startEditField(e){
    return;
    var id = $(this).data('id');
    var isFieldInGroup = (id.indexOf('(')!=-1);

    var promptName = '';
    var promptInputs = [];
    var contentId='';
    var fieldInfo;

    if(isFieldInGroup){
        var masterGroup = id.match(/^field\d+/)[0];
        var masterGroupIndex = parseInt(id.match(/\(\d+\)/)[0].match(/\d+/)[0]);
        var groupId = masterGroup+'('+masterGroupIndex+')';
        //select fields
        //fields in group
        var item = $('tr.group-item[data-id="'+groupId+'"]');
        var fieldInfos = item.find('span.field-info');

        contentId = groupId;
        promptName = item.data('name');

        for(var i=0;i<fieldInfos.length;i++){
            fieldInfo  = $(fieldInfos[i]);
            promptInputs.push(getEditorHtml(
                fieldInfo.data('id'),
                fieldInfo.data('type'),
                fieldInfo.data('name'),
                fieldInfo.data('option')
            ));
        }
    }else{
        fieldInfo = $(getInputSelector(id)).parent();
        contentId = fieldInfo.data('id');
        promptName = fieldInfo.data('name');

        promptInputs.push(getEditorHtml(
            fieldInfo.data('id'),
            fieldInfo.data('type'),
            fieldInfo.data('name'),
            fieldInfo.data('option')
        ));

    }

    $('#prompt-header').html(promptName);
    $('#prompt-content')
        .attr('data-id',contentId)
        .html(promptInputs.join('\n'));

    $('#prompt')
        .modal('setting', 'transition', 'vertical flip')
        .modal('show');
}

function getInputSelector(id){
    return 'input[name="'+id+'"],textarea[name="'+id+'"]';
}

function getEditorHtml(id,type,placeholder,option){
    var fieldAttr = 'class="field" data-id="'+id+'"';
    var value = $(getInputSelector(id)).val();

    switch (type){
        case('file'):
            return '<input type="file" '+fieldAttr+'/>';
        case('link'):
            var html = [];
            html.push('<div '+fieldAttr+'>');

            html.push('<div class="ui icon input mini">');
            html.push('<input data-id="'+id+'_1" type="text" placeholder="'+placeholder+' Text to display" value="'+$(getInputSelector(id+'_1')).val()+'"/>');
            html.push('<i class="font icon"></i>');
            html.push('</div>');


            html.push('<div class="ui icon labeled input mini">');
            html.push('<div class="ui label">http://</div>');
            html.push('<input data-id="'+id+'_2" type="text" placeholder="'+placeholder+' url" value="'+$(getInputSelector(id+'_2')).val()+'"/>');
            html.push('<i class="linkify icon"></i>');
            html.push('</div>');
            html.push('</div>');

            return html.join('\n');
        case('text'):
            return '<input type="text" placeholder="'+placeholder+'" value="'+value+'" '+fieldAttr+'/>';
        case('text-long'):
            return '<textarea placeholder="'+placeholder+'" '+fieldAttr+'>'+value+'</textarea>';
    }
    return '';
}

function highlightEditField(e){
    if(!$(e.target).hasClass('inline-input')){
        var body = $(this);
        body.addClass('show-admin-item');
        setTimeout(function(){
            body.removeClass('show-admin-item')
        },1000);
    }
}