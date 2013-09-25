// JavaScript Document
var adminPath;

$(document).ready(function()
{
	adminPath = String(window.location).split('/admin/')[0];
	setup_campaign_change_load_page();
	setup_form_post();
});

function setup_campaign_change_load_page()
{
	$('SELECT[name="campaign_id"]').change(on_campaign_change);
}

function on_campaign_change(e)
{
	$('#ajax_wait').removeClass('hide');

	var city_id 	= $(e.target).attr('data-city');
	var campaign_id	= $('FORM#frontpage_'+city_id+' SELECT[name="campaign_id"]').val();

	$.ajax({
		url:  adminPath+'/admin/api/pagesbycampaign/'+campaign_id+'.json',
		dataType:'json'
	}).done(function(data){on_campaign_change_success(data,city_id);});
}

function on_campaign_change_success(data,city_id)
{
    console.log(data,city_id);
	var html = [];

	for(var i=0;i<data.length;i++){
		html.push('<option value="'+data[i]['id']+'">'+data[i]['name']+'</option>');
	}
    console.log(html);
	$('FORM#frontpage_'+city_id+' SELECT[name="page_id"]').html(html.join('\n'));
	console.log('done');
	$('#ajax_wait').addClass('hide');
}

function setup_form_post()
{
	$('FORM .button').click(function(e){
		var city_id = $(e.target).attr('data-city');
		if($('FORM#frontpage_'+city_id+' SELECT[name="campaign_id"]').val()==0){
			alert('Please select campaign.');
			return false;
		};

		return true;
	})
}