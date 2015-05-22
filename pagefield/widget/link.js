$(document).ready(function(){
    setup_url_fields();
});

function setup_url_fields(){
    var url_fields = $('FORM#page input.textfield[data-type="link_url"]');
    for(var i=0;i<url_fields.length;i++){
        var field = $(url_fields[i]);
        var str = field.val();
        if(str=='')field.val('http://');
    }
}