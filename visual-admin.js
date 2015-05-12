/**
 * Created by Digi3 on 23/3/2015.
 */

var onWindowResizePreviewFrame = function(){
    $('#inline-preview iframe').height(500);
}

$(document).ready(function(){
    $('body').addClass('mode-preview');
    $(window).on('resize', onWindowResizePreviewFrame);
    onWindowResizePreviewFrame();

    $('#action-advance').on('click',function(){
        var isPreview = $('body').hasClass('mode-preview');
        if(isPreview){
            $('body').removeClass('mode-preview');
        }else{
            $('body').addClass('mode-preview');
        }
    });

    //load preview content
    var previewFrame = $('#inline-preview-frame');
    var previewCSS = previewFrame.data('preview-css');
    previewFrame.on('load',function(){
       $(this).contents().find('body').append(
           '<link type="text/css" href="'+previewCSS+'" rel="stylesheet" media="all">'
       );

       $(this).contents().find('a').on('click',disableLinks);
       $(this).contents().find('span.admin-item').on('click',startEditField);
       $(this).contents().find('body').on('click',highlightEditField);
    });

    previewFrame.attr('src',previewFrame.data('preview-url'));
});

function disableLinks(e){
    e.preventDefault();
    e.stopPropagation();
    return false;
}

function startEditField(e){
    var id = $(this).data('id');
    var hiddenField = $(window.parent.document.getElementById(id));
    var newText = prompt("edit text", hiddenField.val());

    if(newText!=null && newText!=hiddenField.val()){
        hiddenField.val(newText);
        window.parent.store_fields();
    }
}

function highlightEditField(e){
    if(!$(e.target).hasClass('admin-item')){
        var body = $(this);
        body.addClass('show-admin-item');
        setTimeout(function(){
            body.removeClass('show-admin-item')
        },1000);
    }
}