$(document).ready(function(){
	$(".list[data-has-order='true'] tbody").sortable({
		items: 'tr',
		update : save_group_item_order
	});

    $('.btn-order-up').mousedown(item_up);
    $('.btn-order-down').mousedown(item_down);

    $('.btn-group-select').on('click',toggleSelectGroup);
    $('.btn-group-move').on('click',moveSelectedGroup);
});

function toggleSelectGroup(e){
    e.stopPropagation();
    //switch off
    var itemId = $(this).data('item');


    if($(this).hasClass('active')){
        $('#row'+itemId).removeClass('active');
        $(this).removeClass('active');
    }else{
        $('#row'+itemId).addClass('active');
        $(this).addClass('active');
    }
    return false;
}

function moveSelectedGroup(e){
    e.stopPropagation();
    var group_id = $(e.target).attr('data-group');

    //find all rows
    var rows = $('table[data-fieldgroup="'+group_id+'"] .group-item.active');
    console.log(rows);
    var newPosition = window.prompt("Move Selected Row before","0");
    if(newPosition==null){
        return false;
    }else{
        //
        $('#row'+group_id+'g'+newPosition).before(rows);
        reorder(group_id);
    }
    return false;
}


function item_up(e){
    e.stopPropagation();
    var item_id = $(e.target).attr('data-item');
    var group_id = $(e.target).attr('data-group');
    var row = $('#row'+item_id);
    row.prev().before(row);
    reorder(group_id);
    window.location = $(e.target).attr('href');
    return false;
}

function item_down(e){
    e.stopPropagation();
    var item_id = $(e.target).attr('data-item');
    var group_id = $(e.target).attr('data-group');
    var row = $('#row'+item_id);
    row.next().after(row);
    reorder(group_id);
    window.location = $(e.target).attr('href');
    return false;
}

function reorder(group_id){
    var items = $("TABLE.list[data-fieldgroup='"+group_id+"']").find('.group-item');

    var item;
    for(var i=0;i<items.length;i++){
        item = $(items[i]);
        item.attr('data-order',i);
        //all input name inside this item change
        var inputs = item.find('input,textarea');
        for(var j=0;j<inputs.length;j++){
            var oName = $(inputs[j]).attr('name');
            var nName = oName.replace(/\([\d]*\)/,'('+i+')');
            $(inputs[j]).attr('name',nName);
        }
    }
}

function save_group_item_order(e){
    var items = $(e.target).children('.group-item');
    var item;

    for(var i=0;i<items.length;i++){
        item = $(items[i]);
        item.attr('data-order',i);
        //all input name inside this item change
        var inputs = item.find('input,textarea');
        for(var j=0;j<inputs.length;j++){
            var oName = $(inputs[j]).attr('name');
            var nName = oName.replace(/\([\d]*\)/,'('+i+')');
            $(inputs[j]).attr('name',nName);
        }
    }
}