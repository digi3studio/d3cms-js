function get_facebook_share(url, callback, params){

       $.get(url, function(xml) {
			var count = new Array();	   
           $(xml).find('link_stat').each(function() {
		   count[0] = $(this).find('share_count').text();   
		   count[1] = $(this).find('like_count').text(); 
		   
		   callback(count, params);			
           })
       });
   };
