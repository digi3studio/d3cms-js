// JavaScript Document
 
var basePath;
$().ready(function(){
	basePath = String(window.location).split('/admin/')[0];
	$('.imagefield').change(on_image_file_select);
    $('.btn_crop').mousedown(on_crop_tool_toggle);
    $('.crop-tool-viewer .target-image').mousedown(crop_pic);
    $('.crop-tool-viewer .target-image').mouseout(out_crop_pic);
});

function on_image_file_select(e){
	var uploadPath = basePath+'/admin/image/upload.json';
	var field_id = $(e.target).attr('id');

	$('#ajax_wait').removeClass('hide');
	//post the image to server
	$.ajaxFileUpload({
		url:uploadPath,
		secureuri:false,
		fileElementId:field_id,
		data:{'pagefieldvalue_key':field_id},
		dataType:'json',
		success:on_image_file_select_success,
		error:on_image_file_select_error
	});
	return false;
}

function on_image_file_select_success(data,status){
	var field_id = (data.post['pagefieldvalue_key'].split('img')[1]);

	$('#field'+field_id).val(data.response);

	$('#ajax_wait').addClass('hide');
}

function on_image_file_select_error(data,status){
	$('#ajax_wait').addClass('hide');
}

//crop tool
function on_crop_tool_toggle(e){
    e.stopPropagation();
    var field_jsid = $(e.target).attr('data-field');
    var cropTool = $(".crop-tool-viewer[data-field='"+field_jsid+"']");
    var image_url = $('#field'+field_jsid).val();
    if(image_url==''){
        alert('no image to crop');
        return false;
    }

    //toggle crop tool show/hide
    if(cropTool.hasClass('none')==false){
        cropTool.addClass('none');
        return false;
    }else{
        $('.crop-tool-viewer').addClass('none');
        cropTool.removeClass('none');
    }

    curr_crop_pic = field_jsid;
    //load image into croptool.
    cropTool.children('.target-image').attr('src','/imagefly/w200-h200/media/upload/'+image_url);

    return false;
}

var curr_crop_pic;
var crop_parameter = '';
var crop_start_offsetX = 0;
var crop_start_offsetY = 0;
var crop_width = 0;
function crop_pic(e){
    e.stopPropagation();
    if(e.ctrlKey==true){
        var cropValues = $('#field'+curr_crop_pic+'_2').attr('value');
        if(cropValues.split("_").length!=3)return false;

        var cx = String((e.offsetX-crop_start_offsetX)/crop_width).substr(2,4);
        var cy = String((e.offsetY-crop_start_offsetY)/crop_width).substr(2,4);
        $('#field'+curr_crop_pic+'_2').attr('value',cropValues+"_"+cx+"_"+cy);

        update_crop_center_pos(e.offsetX,e.offsetY);
        return false;
    }

    //crop pic
    var pic = $(e.target);
    pic.bind('mousemove',editing_crop);
    pic.bind('mouseup',end_crop_pic);

    crop_start_offsetX = e.offsetX;
    crop_start_offsetY = e.offsetY;
    crop_width = 0;

    var sx = String(e.offsetX/pic.width()).substr(2,4);
    var sy = String(e.offsetY/pic.height()).substr(2,4);

    crop_parameter = 'r'+sx+'_'+sy+'_';
    update_crop_area_pos(e.offsetX,e.offsetY);
    update_crop_center_pos(0,0);

    return false;
}

function out_crop_pic(e){
    var pic = $(e.target);
    pic.unbind('mousemove',editing_crop);
    pic.unbind('mouseup',end_crop_pic);

    e.stopPropagation();
    crop_parameter = '';
    return false;
}

function editing_crop(e){
    var size = e.offsetX - crop_start_offsetX;
    update_crop_area_size(size);
}

function end_crop_pic(e){
    e.stopPropagation();
    if(crop_parameter=="")return false;

    var pic = $(e.target);
    crop_width = e.offsetX - crop_start_offsetX;
    var box_size = crop_width/pic.width();
    crop_parameter = crop_parameter+String(box_size).substr(2,4);
    $('#field'+curr_crop_pic+'_2').attr('value',crop_parameter);

    //update crop area;
    pic.unbind('mousemove',editing_crop);
    pic.unbind('mouseup',end_crop_pic);

    update_crop_area_size(crop_width);

    return false;
}

function update_crop_area_pos(x,y){
    $(".crop-tool-viewer[data-field="+curr_crop_pic+"] .crop-area").attr('style','margin:'+y+'px 0 0 '+x+'px;');
}

function update_crop_area_size(w){
    $(".crop-tool-viewer[data-field="+curr_crop_pic+"] .crop-area").attr('style','margin:'+crop_start_offsetY+'px 0 0 '+crop_start_offsetX+'px;'+'width:'+w+'px; height:'+w+'px');
}

function update_crop_center_pos(x,y){
    $(".crop-tool-viewer[data-field="+curr_crop_pic+"] .crop-center").attr('style','margin:'+(y-2)+'px 0 0 '+(x-2)+'px;');
}