// JavaScript Document
$().ready(function (){
	$( "INPUT.textfield.date" ).datepicker();
	setup_url_suggest();
})

function setup_url_suggest(){
	var input_campaign_name 		= $('#campaign .field INPUT.textfield[name="name"]');
	var input_campaign_shortname 	= $('#campaign .field INPUT.textfield[name="shortname"]');
	input_campaign_name.change(function(){
		if(input_campaign_shortname.val()==''){
			input_campaign_shortname.val(
				input_campaign_name.val().toLowerCase().replace(/\s/gi,'')
			);
		}
	});
}
