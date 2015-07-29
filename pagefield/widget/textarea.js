$(document).on('ready',function() {
    var selectors = [];
    $('span[data-name="body"] textarea.textarea').each(function(){
        selectors.push('textarea#'+$(this).attr('id'));
    });

    tinymce.init({
        selector: selectors.join(", "),
        theme: "modern",
        height: 200,
        width:  510,
        menubar: "insert edit table tools",
        plugins: [
            "advlist autolink link image lists",
            "code",
            "save table directionality paste"
        ],
        toolbar: "insertfile undo redo | styleselect | bold underline | bullist numlist  | link image",
        style_formats: [
            {title: 'header 1', block: 'h1'},
            {title: 'header 2', block: 'h2'},
            {title: 'header 3', block: 'h3'}
        ],
        relative_urls: false,
        image_advtab: true ,
        fix_list_elements : true,
        force_p_newlines : true,
        keep_styles: false,
        document_base_url: '/',
        remove_trailing_brs: false
    });

});

