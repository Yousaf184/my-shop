tinymce.init({
    selector: 'textarea', // textarea id
    // to keep the value of tinyMCE editor in sync with textarea value
    setup: function (editor) {
        editor.on('change', function () {
            editor.save();
        });
    },
    resize: false,
    height: 400,
    plugins: [
        'autolink autosave charmap code emoticons fullscreen hr image',
        'insertdatetime link lists preview searchreplace spellchecker table toc wordcount'
    ],
    toolbar: `
        undo redo | bold italic underline | restoredraft | charmap code emoticons | fullscreen | hr |
        numlist bullist | image media link | preview | searchreplace | table | toc |
    `
});