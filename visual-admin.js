/**
 * Created by Digi3 on 23/3/2015.
 */
var onWindowResizePreviewFrame = function(){
    $('#inline-preview iframe').height($(window).height()-128);
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
    })
});
