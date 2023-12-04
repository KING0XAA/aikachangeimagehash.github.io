document.addEventListener('paste', function (event) {
    var items = (event.clipboardData || event.originalEvent.clipboardData).items;
    const files = [];
    for (var index in items) {
        var item = items[index];
        const mimeType = item.type;
        if (mimeType && mimeType.startsWith('image/') && item.kind === 'file') {
            var file = item.getAsFile();
            files.push(file);
        }
    }
    if (files.length > 0) {
        processFiles(files);
    }
});
function onInputImgSubmit() {
    const inputEl = document.getElementById('input-imgfile');
    if ((inputEl.files?.length ?? 0) > 0) {
        processFiles(inputEl.files);
    }
}
async function processFiles(files) {
    for (const file of files) {
        console.log('process ' + file.name);
        await readFileAsDataURL(file)
            .then((results) => createModImageDownload(results[0], results[1]))
    }
}
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        var reader = new FileReader();
        reader.onloadend = function (e) {
            resolve([e.target.result, file]);
        };
        reader.readAsDataURL(file);
    })
}
function createModImageDownload(dataUrl, file) {
    return new Promise((resolve, reject) => {
        var img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);
            changeBottomRightPixelColor(context, img.width, img.height);
            var modifiedImageDataUrl = canvas.toDataURL(file.type);
            const hashName = 'aika' + new Date().getTime();
            const type = file.type.replace(/^image\//, '');
            var fileName = `${hashName}.${type}`;
            createDownload(fileName, modifiedImageDataUrl);
            resolve();
        }
        img.src = dataUrl;
    });
}
function changeBottomRightPixelColor(context, width, height) {
    var imageData = context.getImageData(width - 1, height - 1, 1, 1);
    var pixel = imageData.data;
    var randomColor = [Math.random() * 255, Math.random() * 255, Math.random() * 255, 255];
    for (var i = 0; i < 4; i++) {
        pixel[i] = randomColor[i];
    }
    context.putImageData(imageData, width - 1, height - 1);
}
function createDownload(fileName, dataUrl) {
    var downloadLink = document.createElement("a");
    downloadLink.href = dataUrl;
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    setTimeout(() => {
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(dataUrl);
    }, 1);
}