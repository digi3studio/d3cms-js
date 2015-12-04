/**
 * Created by Digi3 on 23/3/2015.
 */
$(document).ready(function(){
    //init page without pagetype id
    var fieldPagetype = $('#pagetype_id');
    if(!fieldPagetype.val()){
        fieldPagetype.val('1');
        $('#layout_id').val('0');
        reload();
        return;
    }

    $('#action-advance').on('click',function(){
        localStorage.d3cms_livepreview = (localStorage.d3cms_livepreview=='true')?'false':'true';
        store_fields(render);
    });

    $(window).on('resize', renderPreviewResize);

    //preview content on load
    var previewFrame = $('#inline-preview-frame');
    previewFrame.on('load',function(e){
        var frame = $(this);
        frameSetting(frame);
        addInteraction(frame);
    });

    //init modal
    if($('#prompt').length==0){
        var html = [];
        html.push('<div id="prompt" class="ui modal small">');
        html.push('<div id="prompt-header" class="header"></div>');
        html.push('<div id="prompt-content" class="content ui form"></div>');
        html.push('<div id="prompt-actions" class="actions">');
        html.push('<div class="ui deny cancel button">Cancel</div>');
        html.push('<div class="ui positive approve button">Update</div>');
        html.push('</div>');
        html.push('</div>');

        $('body').append(html.join('\n'));
    };

    $('#prompt').modal({
        onApprove: onPromptApprove
    });

    $('#btn-ajax-save a').on('click',function(e){
        e.preventDefault();
        $('#btn-ajax-save').addClass('pending');
        var url = $(e.currentTarget).attr('href');
        var result = $('#btn-save-result');
        result.html('saving...');

        store_fields(function(){
            $.getJSON(url,function(data){
                $('#btn-ajax-save').removeClass('pending');
                result.html(data.url);
                result.attr('href', data.url);
            });
        })
    });

    //store current fields and load liveview frame

    if(localStorage.d3cms_livepreview == 'true'){
        store_fields(render);
    }
});

function render(){
    renderLivePreview();
    renderPreviewResize();
}

function renderLivePreview(){
    var body = $('body');
    if(localStorage.d3cms_livepreview == 'true'){
        var previewFrame = $('#inline-preview-frame');
        previewFrame.attr('src',previewFrame.data('preview-url'));
        body.addClass('mode-preview');
    }else{
        body.removeClass('mode-preview');
    }
}

function renderPreviewResize(){
    $('#inline-preview-frame').height($(window).height()-300);
}

function frameSetting(frame){
    var frameDoc = frame.contents();
    //disable liveview links
    frameDoc.find('a').on('click', function (e){
        e.preventDefault();
        e.stopPropagation();
        return false;
    });

    //add highlighter css
    frameDoc.find('body').append(
        '<link type="text/css" href="'+frame.data('preview-css')+'" rel="stylesheet" media="all">'
    );

    //remember scroll position
    frameDoc.on('scroll',function(){
        sessionStorage.d3cms_previewScroll = $(this).scrollTop();
    });

    //restore scroll position
    frameDoc.scrollTop(sessionStorage.d3cms_previewScroll || 0);
}

function onPromptApprove(){
    //get the iframe
    var previewFrame = $('#inline-preview-frame');
    var frameDoc = previewFrame.contents();
    $('#prompt-content').find('input, textarea').each(function(){
        var promptInput = $(this);
        var id = promptInput.data('id');
        var field = getField(id);
        //update on demand
        if(field.val() != promptInput.val()){
            field.val(promptInput.val());
            field.trigger('change');
        }
    });

    store_fields(function(){});
}

/*add preview css, make editable links and */
function addInteraction(frame){
    //this is the iframe
    var frameDoc = frame.contents();

    //bind different type of editable item
    /*link*/
//    frameDoc.find("a > .inline-input")
//        .attr('contentEditable','false') //disable inline edit and use modal instead
//        .on('mousedown',startEditLinkTimer);

    //file attributes
    //apply to all image src contain editable=true
    frameDoc.find('img').each(setEditImg);

    //check link href
    //apply to all a href contain editable=true
    frameDoc.find('a').each(setEditLink);

    //text fields
    frameDoc.find('span.inline-input').each(setEditText);

    //click body highlighter
    frameDoc.find('body').on('click',function(e){
        //not click on inline-input will add highlight
        if(!$(e.target).hasClass('inline-input')){
            var body = $(this);
            body.addClass('show-admin-item');
            setTimeout(function(){
                body.removeClass('show-admin-item')
            },1000);
        }
    });
}

var fileSelectorSerialNumber = 0;
function setEditImg(){
    var inlineInput = $(this);
    var src = inlineInput.attr('src');
    if(src.indexOf('editable=true')==-1)return;
    var id = src.match(/id\=[^&]+/i)[0].replace('id=','');

    //add interaction

    //check file selector
    var fileSelectId = id.replace('field','img');
    var fieldFileSelector = $('input[name="'+fileSelectId+'"]');

    if(fieldFileSelector.length == 0){

        var field = $('textarea[name="'+id+'"]');
        field.after(
            '<input class="imagefield" id="file'+field.attr('id')+
            '" type="file" name="'+fileSelectId+
            '" onchange="on_image_file_select({target:this})">'
        )
    }

    //image on click trigger field click.
    inlineInput
        .attr('data-id',id)
        .addClass('inline-input')
        .on('click',function (e){
            e.preventDefault();
            var inlineInput = $(this);
            var id = inlineInput.data('id');
            var fileSelectId = id.replace('field','img');
            $('input[name="'+fileSelectId+'"]').trigger('click');
        });

    addEditableElement(id,inlineInput,'image');
}

function setEditLink(){
    var inlineInput = $(this);
    var href = inlineInput.attr('href');
    if(href==null || href.indexOf('editable=true')==-1)return;
    var id = href.match(/id\=[^&]+/i)[0].replace('id=','');

    //disable children's editable
    inlineInput.find('span.inline-input').each(function(){
        $(this).attr('contenteditable','false');
    });

    //add interaction
    inlineInput.on('click',function(e){
        var nodeLink = $(e.currentTarget);
        var promptName = 'Link Edit';
        var promptInputs = [];

        nodeLink.find('span.inline-input').each(function(){
            promptInputs.push(
                makeModalField($(this).attr('data-id'), 'Label', 'Text on button', '')
            );
        });

        var id = nodeLink.attr('href').match(/id\=[^&]+/i)[0].replace('id=','');
        //url edit

        promptInputs.push(
            makeModalField(id, 'Link', 'http://', 'linkify')
        );

        $('#prompt-header')
            .html(promptName);

        $('#prompt-content')
            .html(promptInputs.join('\n'));

        $('#prompt')
            .modal('setting', 'transition', 'vertical flip')
            .modal('show');
    });

    addEditableElement(id,inlineInput,'link');

    inlineInput.find('span.inline-input').each(function(){
        addEditableElement($(this).attr('data-id'),$(this),'text');
    });
}

function setEditText(){
    var inlineInput = $(this);
    //if span already set contentEditable to false, skip it.
    if(inlineInput.attr('contentEditable')=='false')return;
    var id = inlineInput.data('id');

    //enable content editable
    inlineInput.attr('contentEditable','true');

    //after edit
    //on keyup, directly write the result to field
    inlineInput
        .on('keyup',function(){
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

            $(getInputSelector(id)).val(inlineInput.html());
        })
        .on('blur',function(){
            var inlineInput = $(this);
            var inlineText = inlineInput.html();
            inlineText = inlineText.replace(/<[^>]*>/g,'');

            if(inlineText == ''){
                inlineInput.attr('data-empty','true').html('???');
            }
        });

    addEditableElement(id,inlineInput,'text');
    //inlineInput.on('click',editFieldUseModal);
}

function getField(id){
    return $('*[name="'+id+'"]');
}

function getEditableElement(id){
    for(var i=0;i<editableElements.length;i++){
        if(editableElements[i].id == id){
            return editableElements[i];
        }
    }
}

var editableElements = [];//{type:file|text,id:xxx,node:jquery}

//add Editable element and bind listener for field update.
function addEditableElement(id,node,type){
    editableElements.push({type:type,id:id,node:node});

    //bind elements
    var field = getField(id);//$('input[name="'+id+'"]');
    switch (type){
        case 'image':
            field.on('change',function(){
                var input = $(this);
                var originalSrc = node.attr('src');
                var path  = originalSrc.replace(/media\/upload\/[^\?]+\?[^\?]*/i,'media/upload/');
                var query = originalSrc.match(/\?[^\?]+/i)[0];
                var newSrc = path+input.val()+query;
                //update on demand
                if(originalSrc != newSrc){
                    node.attr('src', newSrc);
                }
            });

            break;
        case 'text':
            field.on('change',function(){
                var originalText = node.html();
                var newText = $(this).val();
                if(originalText != newText){
                    node.html(newText);
                }
            });
            break;
        case 'link':
            field.on('change',function(){
                var input = $(this);
                var originalSrc = node.attr('href');

                var value = input.val();
                if(value=='')value = 'http://sample.com';
                value = value+((value.indexOf('?')==-1)?'?':'&');

                var newSrc = value+'editable=true&id='+input.attr('name');
                //update on demand
                if(originalSrc != newSrc){
                    node.attr('href', newSrc);
                }
            })
    }
}

//reusable functions
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

function getText(htmlText){
    //remove tags
    return htmlText.replace(/<[^>]*>/g,'').replace(/\&nbsp;/gi,' ').replace(/\s+/g,' ');
}

function makeModalField(id, label, placeholder, icon){
    return '<div class="ui icon labeled input mini">'+
    '<div class="ui label">'+label+'</div>'+
    '<input data-id="' + id + '" type="text" placeholder="' + placeholder+ '" value="' +$(getInputSelector(id)).val()+ '"/>'+
    '<i class="icon ' + icon + '"></i>'+
    '</div>'+
    '</div>';
};

//depreciated
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

function editFieldUseModal(e){
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

    $('#prompt-header')
        .html(promptName);
    $('#prompt-content')
        .attr('data-id',contentId)
        .html(promptInputs.join('\n'));

    $('#prompt')
        .modal('setting', 'transition', 'vertical flip')
        .modal('show');
}

