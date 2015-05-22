/**
 * Created by Digi3 on 20/5/2015.
 */
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