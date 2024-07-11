FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    FilePondPluginFileEncode 
)
FilePond.setOptions({
    stylePanelAspectRatio: 70/50,
    imageResizeTargetWidth: 50,
    imageResizeTargetHeight: 70
})

FilePond.parse(document.body);
