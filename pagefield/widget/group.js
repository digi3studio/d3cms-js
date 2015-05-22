$(document).ready(function(){
	$(".list[data-has-order='true'] tbody").sortable({
		items: 'tr',
		update : save_group_item_order
	});

    $('.btn-group-select').on('click',toggleSelectGroup);
    $('.btn-group-move').on('click',moveSelectedGroup);
    $('.btn-group-remove').on('click',removeSelectedGroup);

    setup_add_field_group();
    setup_toggle_group();
});

function setup_add_field_group(){
    $('.field_group_add').on('click',add_field_group);
}

function add_field_group(e){
    var field_group_id 		= $(e.target).attr('data-fieldgroup');

    var inputCount = $('input[name="'+field_group_id+'"]');
    var field_group_count = parseInt(inputCount.val());
    inputCount.val(field_group_count+1);

    reload();
    return false;
}

function setup_toggle_group(){
    $('.btn-group-toggle').on('click',function(e){
        e.stopPropagation();

        var item     = $(this).attr('data-item');
        var eleGroup = $('.group[data-item='+item+']');
        if(eleGroup.hasClass('none')){
            eleGroup.removeClass('none');
        }else{
            eleGroup.addClass('none');
        };
        return false;
    });

    $('.btn-group-shrink').on('click',function(e){
        e.stopPropagation();

        var item     = $(this).attr('data-group');
        var eleGroup = $('.group[data-group='+item+']');
        eleGroup.addClass('none');
        return false;
    });

    $('.btn-group-expand').on('click',function(e){
        e.stopPropagation();

        var item     = $(this).attr('data-group');
        var eleGroup = $('.group[data-group='+item+']');
        eleGroup.removeClass('none');
        return false;
    });
}

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

function removeSelectedGroup(e){
    e.stopPropagation();
    var group_id = $(e.target).attr('data-group');
    //find all rows
    var rows = $('table[data-fieldgroup="'+group_id+'"] .group-item.active');
    var itemCountInput = $('#count'+group_id);
    var itemCount = parseInt(itemCountInput.val());

    var r = window.confirm('are you sure to delete '+rows.length+' items?');
    if(r == false)return false;

    //move selected items to last row.
    $('#row'+group_id+'g'+(itemCount-1))
        .after(rows);

    reorder(group_id);

    itemCountInput.val(
        itemCount-rows.length
    );

    rows.find('input, textarea').val('');
    store_fields();
    return false;
}

function reorder(group_id){
    var items = $("TABLE.list[data-fieldgroup='"+group_id+"']").find('.group-item');
    doReorder(items);
}

function save_group_item_order(e){
    var items = $(e.target).children('.group-item');
    doReorder(items);
}

function doReorder(items){
    for(var i=0;i<items.length;i++){
        var item = $(items[i]);
        item.attr('data-order',i);
        //all input name inside this item change
        var inputs = item.find('input,textarea');
        for(var j=0;j<inputs.length;j++){
            var parent = $(inputs[j]).parent();
            var poName = parent.data('id');
            if(poName!=null){
                parent.attr('data-id',poName.replace(/\([\d]*\)/,'('+i+')'));
            }

            var oName = $(inputs[j]).attr('name');
            var nName = oName.replace(/\([\d]*\)/,'('+i+')');
            $(inputs[j]).attr('name',nName);
        }
    }
}