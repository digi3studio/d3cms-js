$(document).ready(function(){
	alert('hi');
	setup_album_select();
	setup_form_action();
	display_selected_style();
});

function setup_form_action(){
	$('A#form_save').click(function(){
		$('FORM#page').submit();
	})
}

var selected_page_type;
var selected_page_layout;
var adminPath;
function setup_album_select(){
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
		$(albums[i]).css({'background':'url('+imgpath+'/page'+pageType+'.gif) no-repeat'});
	}

	//mousemove change image function
	$('.page_type_select IMG').mousemove(function(e){
		var layoutCount = parseInt($(e.target).attr('data-layout-count'));

		var x = (e.pageX - this.offsetLeft)/100;
		var tx = -Math.floor(x*layoutCount)*100;

		$(e.target).css({'background-position':tx+'px 0px'});
	});

	//fix the mouse over
	$('.page_type_select IMG').hover(function() {
		$(this).css('cursor','pointer');
	}, function() {
		$(this).css('cursor','auto');
	});

	//click to select page and layout
	$('.page_type_select IMG').click(function(e){
		selected_page_type		= $(e.target).attr('data-page-type');
		selected_page_layout	= Math.floor((e.pageX - this.offsetLeft)/100* parseInt($(e.target).attr('data-layout-count')));
		$('.page_selected IMG').css({'background':'url('+imgpath+'/page'+selected_page_type+'.gif) no-repeat '+(-selected_page_layout*100)+'px 0px'});

		$('#pagetype_id').attr('value',selected_page_type);
		$('#layout_id').attr('value',selected_page_layout);

		$.ajax({
			type:'POST',
			url:  adminPath+'/admin/page/storefields',
			data: $('FORM#page').serialize(),
			success: render_form
		});
	});
}

function display_selected_style(){
	
//	var page_type	= $('#pagetype_id').val();
//	var page_layout= $('#layout_id').val();

	alert(page_type+','+page_layout);

	return;
	selected_page_type	= $(e.target).attr('data-page-type');
	selected_page_layout	= Math.floor((e.pageX - this.offsetLeft)/100* parseInt($(e.target).attr('data-layout-count')));
	$('.page_selected IMG').css({'background':'url('+imgpath+'/page'+selected_page_type+'.gif) no-repeat '+(-selected_page_layout*100)+'px 0px'});
}

function render_form(){
//	window.location = adminPath+'/admin/page/edit/?r='+Math.round(Math.random()*10000);
	window.location = adminPath+'/admin/page/edit';
/*	$.ajax({
		url:  adminPath+'/admin/page/type/'+selected_page_type+'.json',
		success: render_form_success,
		dataType: 'jsonp'
	});*/
}

function render_form_success(data){
	var htmlForm = "";
	var option;
	var name;
	var values;
	var fields = data['fields'];
	
	for(name in fields){
		htmlForm += getHTML(name, fields[name]['id'], fields[name]['type'], fields[name]['option'], values);
	}

	$('#form_fields').html(htmlForm);
	$('#page_type_name').html(String(data['name']).toUpperCase());
	Cufon.replace('.body .headline',	{fontFamily:'Veuve Clicquot Serif'});
}

function getHTML(fieldName, key, type, option, values){
	var htmlForm='<div>'+String(fieldName).toUpperCase()+'</div>';
	switch(type){
		case('text'):
			htmlForm+= (option<=0)?getHTMLTextArea(key,values):getHTMLTextField(key,values,option);
			break;
		case('file'):
			htmlForm+= (option=='image')?getHTMLFileImage(key,values):'';
			break;
		case('link'):
			htmlForm+= getHTMLLink(key,values);
			break;
		case('daterange'):
			htmlForm+= getHTMLDateRange(key,values);
			break;
		case('date'):
			htmlForm+= getHTMLDate(key,values);
			break;
		case('group'):
			htmlForm+= getHTMLGroup(fieldName,key,values,option);
			break;
	}
	return htmlForm;
}

function getHTMLGroup(groupName,key,values,option){
	var fields 		= option;
	var htmlForm	= '';

	for(name in fields){
		htmlForm += getHTML(groupName+'-'+name, key+'_'+fields[name]['id'], fields[name]['type'], fields[name]['option'], values);
	}
	return htmlForm;
}