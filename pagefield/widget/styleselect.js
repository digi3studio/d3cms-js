/**
 * Created by Digi3 on 20/5/2015.
 */
$(document).ready(function(){
    setup_style_select();
});

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
        reload();
    });

    $('.page_type_select img[data-page-type=4]').css({'background-position':'-100px 0'});
}
