/**
 * Created by Digi3 on 23/3/2015.
 */
$(document).ready(function(){
    $('span.admin-item').on('click',startEditField);
    $('body').on('click',highlightEditField);
});

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
        $('body').addClass('show-admin-item');
        setTimeout(function(){
            $('body').removeClass('show-admin-item')
        },1000);
    }
}