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
    $('#inline-preview-frame').height($(window).height()-300);
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

    /*link*/
    frameDoc.find("a > .inline-input")
        .attr('contentEditable','false') //disable inline edit and use modal instead
        .on('mousedown',startEditLinkTimer);

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

function initPrompt() {
    $('#prompt')
        .modal({
            onApprove: function () {
                //get the iframe
                var previewFrame = $('#inline-preview-frame');
                var frameDoc = previewFrame.contents();

                $('#prompt-content .input > [data-id]').each(function () {
                    //for each updated field in the modal, update the real form and the preview iframe
                    var modalInput = $(this).get(0);
                    var data_id = $(modalInput).attr("data-id");
                    switch (modalInput.tagName) {
                        case 'INPUT':
                            //update the preview iframe
                            var m = data_id.match("[_]([0-9])$");
                            var t = frameDoc.find('span.inline-input[data-id="' + data_id + '"]');
                            if (m.length > 1) {
                                switch (m[1]) {
                                    case '1'://label
                                        t.html($(modalInput).val());
                                        break;
                                    case '2'://link
                                        //we cannot update preview href at this moment, as it doesn't has 'data-id' attribute
                                        t.parent().attr("href", $(modalInput).val());
                                        break;
                                    default:
                                        break;
                                }
                            }
                            //now update the real form
                            $('#form_fields input[name="' + data_id + '"]').val($(modalInput).val());
                            break;
                        case 'TEXTAREA':
                            break;
                        default:
                            break;
                    }
                });
            }
        })
}

$(document).ready(function(){
    initToggleEditMode();
    initPreview();
    initPrompt();
});

function startEditLinkTimer(e){
    e.stopPropagation();

    var timeout_id;
    var hold_time = 1000;//hold mousedown for 1 second
    var element = $(this);
    timeout_id = setTimeout(function(){
        startEditLink(e, element);
    }, hold_time);
    $(this).bind('mouseup mouseleave', function() {
        clearTimeout(timeout_id);
    });
}

function startEditLink(e, element){
    e.stopPropagation();

    var id = element.data('id');
    var group = id.replace(/([_][0-9])$/, '');//remove _1, _2 at the end
    var fieldInfo = $('span[data-id="' + group + '"].field-info');

    var promptName = 'Link Edit';
    var promptInputs = [];
    var contentId = group;

    promptInputs.push(getEditorHtml(
        fieldInfo.data('id'),
        fieldInfo.data('type'),
        fieldInfo.data('name'),
        fieldInfo.data('option')
    ));

    $('#prompt-header').html(promptName);
    $('#prompt-content')
        .attr('data-id',contentId)
        .html(promptInputs.join('\n'));

    $('#prompt')
        .modal('setting', 'transition', 'vertical flip')
        .modal('show');
}

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