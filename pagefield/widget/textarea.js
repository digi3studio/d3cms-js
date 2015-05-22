jQuery(document).ready(function($) {
	$('.pagefield_group .textarea').keyup(update_edit);
	$('.pagefield_group .textarea').keydown(on_key_down);
	$('.textarea_control A').click(toggle_editor);
//	$('.pagefield_group .textarea').bind('keydown', 'ctrl+i', italic_text);
});

function on_key_down(e){
	if(e.ctrlKey){
		switch (e.which){
			case(66):
				$(document)[0].execCommand('bold',null,false);
				break;
			case(76):
				$(document)[0].execCommand('italy',null,false);
				break;
		}
	};
}

function update_edit(e){
	var id = $(e.target).attr('id').split('txt')[1];
	var textarea 	= $('TEXTAREA[name="field'+id+'"]');
	textarea.html($(e.target).html());
}

function toggle_editor(e){
	var id = $(e.target).attr('id').split('ctl')[1];
	var textarea 	= $('TEXTAREA[name="field'+id+'"]');
	var inlineEditor= $('DIV[name="txt'+id+'"]');

	if(textarea.hasClass('none')){
		textarea.removeClass('none');
		inlineEditor.addClass('none');
	}else{
		textarea.addClass('none');
		inlineEditor.removeClass('none');

		inlineEditor.html(textarea.val().replace(/[\r\n]\n?/gi,'<br\/><br\/>'));
		textarea.html(inlineEditor.html());
	}
	return false;
}
