/*
 *  @TODO(franfran): JS namespace for d3cms??
 *  var d3cms = d3cms || {};
 *  d3cms.fileupload = new function(swfoptions) {
 *      this.swfupload = new SWFUpload(swfoptions);
 *      this.init = function(){
 *      }
 *  };
 *  @TODO(franfran): cancel upload, error handling
 *  @TODO(franfran): swfupload is for IE compatible only
 *  for future compatibility using HTML5, there is a new draft for FormData which support
 *  client side file access(e.g. filesize, type checking)
 *  So in future, we should use XHR + FormData for uploading file
 *  However, FormData is ONLY supported for IE10+, thx again Microsoft
 */
$(document).ready(function(){
    // FORM FIELD FUNCTIONS
    function get_all_file_fields(){
        var fields = $("input[type='file']");
        var unique_fields = [];//img191_g0_3
        fields.each(function(){
            //The name field could have multiple groups, e.g. img191_g2_5_g9_4, the last group has the id we are looking for, i.e. g9_4
            var match = this.name.match(/([_][g][\d]*[_][\d]*$)/gi);
            if(!match){
                return;
            }
            var field_id = match.pop();
            field_id = field_id.match(/([_][g][\d]*)[_]/gi);
            field_id = field_id.pop();

            var field_name = this.name;
            field_name = field_name.split("").reverse().join(""); //reverse string
            field_name = field_name.replace(field_id.split("").reverse().join(""), "_NEKOTg_");
            field_name = field_name.split("").reverse().join("");
            var found = false;
            for(var j = 0;j<=unique_fields.length;j++){
                if(unique_fields[j]){
                    if(unique_fields[j].field == field_name){
                        unique_fields[j].count = unique_fields[j].count + 1;
                        found = true;
                    }
                }
            }
            j--;
            if(!found){
                unique_fields[j] = {};
                unique_fields[j].count = 1;
                unique_fields[j].field = field_name;
            }
        });

        return unique_fields;
    }

    /*
     * Given an array of file_fields, search the object
     * that match the given target(e.g. img191_g2_5_gTOKEN_4)
     */
    function get_node_from_fields(fields, target){
        var node = null;
        for(var i=0;i<file_fields.length;i++){
            if(file_fields[i].field == target){
                node = file_fields[i];
                break;
            }
        }

        return node;
    }

    function update_file_field_using_index(index, filename){
        var from = $("input[name='token_from']").val();
        var to = $("input[name='token_to']").val();

        if((index < from) || (index > to)){
            //out of expected range!
            return false;
        }

        var s = $("#batchupload-dialog .file_fields LI.select").text();
        var p = s.search(/\d/);
        var field_name = 'field'+ s.substr(p, s.length);
        field_name = field_name.replace('TOKEN', index);
        $("#"+field_name).val(filename);

        return true;
    }

    function isNumber(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }

    function highlight_fields(field, from, to){
        //clear all highlight first
        $("input[type='file']").removeClass("highlight");

        //fieldtoken.field = img191_g2_5_gTOKEN_4
        //will highlight img191_g2_5_g0_4, img191_g2_5_g1_4, img191_g2_5_g2_4...
        var name;
        for(var i=from;i<=to;i++){
            name = field.field.replace("_gTOKEN_", "_g"+i+"_");
            $("input[type='file'][name='"+name+"']").addClass("highlight");
        }
    }
    // END OF FORM FIELD FUNCTIONS

    // FORM SWFUPLOAD FUNCTIONS
    function upload_success_handler(file, data, response){
        var xml = $.parseXML(data);
        $xml = $(xml);
        var status = $xml.find('Filedata > status').text();
        var storage = $xml.find('Filedata > storage').text();
        if(status == 'true'){
            $("#batchupload-dialog [data-file-id='"+file.id+"'] .remote-filename").html(storage);
            if (update_file_field_using_index(file.index, storage)){
                $("#batchupload-dialog [data-file-id='"+file.id+"'] .upload_button").attr("disabled", "disabled");
                if(file_queued_is_batch_uploading()){
                    //we are in batch uploading
                    file_queued_upload_first_available();
                }
            }
        }
    }
    function upload_progress_handler(file, bytesLoaded, bytesTotal) {
        $("#batchupload-dialog [data-file-id='"+file.id+"'] .uploaded").html(bytesLoaded);
    }
    function file_queued_handler(file) {
        var to = $("input[name='token_to']").val();

        if(file.index > to){
            return;
        }

        var html = $('<li><div class="index"></div><div class="filename"></div><div class="status"></div><div class="size"><span class="uploaded">0</span>/<span class="total">0</span></div><div class="remote-filename"></div><div><input type="button" value="upload" class="upload_button"></div></li>');
        $(html).attr("data-file-id", file.id);
        $(html).find(".index").html(file.index);
        $(html).find(".filename").html(file.name);
        $(html).find(".total").html(file.size);
        $(html).find(".upload_button").attr("data-file-id", file.id);
        $(".file_queue").append(html);
    }
    function file_queued_clear(){
        $("#batchupload-dialog .file_queue").empty();
        //the swfupload object has no method to reset the index number
        //it is the "file_index" array in the SWFUpload.as file
        //the cancelUpload() method won't decrement the file_index array
        swfupload_init(swfoptions);
        file_queued_reset_batch_upload();
    }
    function file_queued_upload_first_available(){
        var first = $("#batchupload-dialog .file_queue LI .upload_button:not([disabled])").first();

        if(first.length > 0){
            first.click();
        }else{
            file_queued_reset_batch_upload();
        }
    }
    function file_queued_is_batch_uploading(){
        var uploading = false;

        if($("#upload_all_button").attr("disabled") == "disabled"){
            uploading = true;
        }

        return uploading;
    }
    function file_queued_reset_batch_upload(){
        $("#upload_all_button").removeAttr("disabled");
    }
    function swfupload_init(swfoptions){
        if(swfu){
            swfu.destroy();
            $(".swfupload_control").prepend("<span id='"+swfoptions.button_placeholder_id+"'></span>");
        }
        swfu = new SWFUpload(swfoptions);
    }
    // END OF FORM SWFUPLOAD FUNCTIONS

    // Setup listener
    $(document.body).on("click", "#batchupload-dialog .file_fields LI", function(){
        $("#batchupload-dialog .file_fields LI.select").removeClass("select");
        var target = $(this).text();
        var node = get_node_from_fields(file_fields, target);

        $("input[name='token_from']").val(0);
        $("input[name='token_to']").val((node.count - 1));
        highlight_fields(node, 0, (node.count - 1));
        file_queued_clear();
        $(this).addClass("select");
    });
    $(document.body).on("keyup", "input[name='token_from'], input[name='token_to']", function(){
        var s = $("#batchupload-dialog .file_fields LI.select");
        var from = $("input[name='token_from']").val();
        var to = $("input[name='token_to']").val();
        if((s.length <= 0) || (!isNumber(from)) || (!isNumber(to))){
            return;
        }
        var target = s.text();
        var node = get_node_from_fields(file_fields, target);
        highlight_fields(node, from, to);
    });
    $(document.body).on("click", ".upload_button" ,function(){
        var file_id = $(this).attr("data-file-id");
        swfu.startUpload(file_id);
    });
    $(".field_group_batchupload").click(function (e) {
        e.preventDefault();
        var x = $("#form").offset().left + $("#form").width();
        var y = e.clientY;
        // Load all file fields
        var d = $('#batchupload-dialog').dialog({
            width: 300,
            height: 600,
            position: [x, y],
            close:function (e, ui){
                $("input[type='file']").removeClass("highlight");
            }
        });
        $("#batchupload-dialog .file_fields").empty();
        file_fields = get_all_file_fields();
        for (var i = 0; i < file_fields.length; i++) {
            $("#batchupload-dialog .file_fields").append('<li>' + file_fields[i].field + '</li>');
        }
        if (file_fields.length == 1) {
            $("#batchupload-dialog .file_fields LI").click();
        }
        file_queued_clear();
    });
    $("#upload_all_button").click(function(){
        if(file_queued_is_batch_uploading()){
            return;
        }

        $("#upload_all_button").attr("disabled", "disabled");
        file_queued_upload_first_available();
    });

    //setup upload button
    var swfu;
    var file_fields;
    var basePath = String(window.location).split('/admin/')[0];
    var swfoptions = {
                upload_url : basePath + "/file/save.xml",
                flash_url : basePath + "/media/admin/d3cms/js/swfupload/swfupload_fp9.swf",
                button_placeholder_id : "spanSWFUploadButton",
                button_width: 90,
        		button_height: 20,
        		button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
        		button_cursor: SWFUpload.CURSOR.HAND,
                file_queued_handler: file_queued_handler,
                upload_progress_handler : upload_progress_handler,
                upload_success_handler : upload_success_handler
    };
    swfupload_init(swfoptions);
});






/*
$(document).ready(function(){
    var dlg_width = 300;
    var dlg_height = 200;
    var dlg_offset_x = $("#page").width() - dlg_width + 100;
    var dlg_margin_top = $("#header").outerHeight(true); // includeMargins=true
    var dlg_margin_bottom = $("#footer").outerHeight(true); // includeMargins=true

    $d = $('#dialog').dialog({
        width: dlg_width,
        height: dlg_height,
        position: [dlg_offset_x, dlg_margin_top]
    });

    $(window).bind('scroll', function(evt){
        var scrollTop = $(window).scrollTop();
        var bottom = $(document).height() - scrollTop;
            $d.dialog("option", {"position": [
                dlg_offset_x,
                ((dlg_margin_top - scrollTop > 0) ?
                    dlg_margin_top - scrollTop :
                        ((bottom - dlg_height > dlg_margin_bottom) ?
                            0 :
                            bottom - dlg_height - dlg_margin_bottom
                        )
                )
            ]});
    });
});
*/