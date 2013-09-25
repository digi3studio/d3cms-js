$(document).ready(function(){
	$(".list[data-has-order='true'] tbody").sortable({
		items: 'tr',
		update : save_list_order
	});
});

function save_list_order(e){
	var model 		= $(e.target).attr('data-model');
	var adminPath 	= String(window.location).split('/admin/')[0];

	$('#ajax_wait').removeClass('hide');
	$.ajax({
		type:'POST',
		url:  adminPath+'/admin/'+model+'/order',
		data: $(e.target).sortable('serialize'),
		success: save_list_order_success
	});
}

function save_list_order_success(){
	$('#ajax_wait').addClass('hide');
}