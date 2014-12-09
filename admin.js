//add roles to navigation
$(document).ready(function(){
    $('#adminnav li a').each(function(index,obj){
        if($(this).html()=='teasers'){
            $(this).addClass('allow-editor');
            $(this).addClass('allow-admin');
        }
    });

})