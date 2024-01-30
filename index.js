const pxLimitInput = document.getElementById('pxlimit');
const pxMaxInput = document.getElementById('pxmax');
const saveformatInputs = {}
document.querySelectorAll('input[name=saveformat]').forEach(e => {
    saveformatInputs[e.value] = e;
});
function getSaveFormat() {
    const keys = Object.keys(saveformatInputs);
    for (const formatName of keys) {
        if (saveformatInputs[formatName].checked) {
            return saveformatInputs[formatName].value;
        }
    }
}
function saveInputStatus() {
    localStorage.setItem('pxlimit', pxLimitInput.checked);
    localStorage.setItem('pxmax', pxMaxInput.value);
    localStorage.setItem('saveformat', getSaveFormat());
}
function loadInputStatus() {
    pxLimitInput.checked = localStorage.getItem('pxlimit') == 'true';
    pxMaxInput.value = Number(localStorage.getItem('pxmax') ?? 3000);
    saveformatInputs[(localStorage.getItem('saveformat') ?? 'jpeg')].checked = true;
}
loadInputStatus();

let modImageDowdloadUrls = [];

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
            context.imageSmoothingQuality = 'high';
            context.drawImage(img, 0, 0);
            changeBottomRightPixelColor(context, img.width, img.height);
            if (pxLimitInput.checked) {
                resizeImage(img, canvas, Number(pxMaxInput.value));
            }
            let saveformat = getSaveFormat();
            let fileType = file.type;
            if (saveformat != 'original') {
                fileType = 'image/' + saveformat;
            }
            var modifiedImageDataUrl = canvas.toDataURL(fileType, 1);

            const hashName = 'aika' + new Date().getTime();
            const type = fileType.replace(/^image\//, '');
            var fileName = `${hashName}.${type}`;

            modImageDowdloadUrls.push({ name: fileName, url: modifiedImageDataUrl });
            updateDownloadUrls();

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
function resizeImage(img, canvas, maxSize) {
    if (img.width <= maxSize && img.height <= maxSize) {
        return;
    }
    var newWidth, newHeight;

    if (img.width > img.height) {
        newWidth = maxSize;
        newHeight = Math.floor((img.height / img.width) * maxSize);
    } else {
        newWidth = Math.floor((img.width / img.height) * maxSize);
        newHeight = maxSize;
    }

    canvas.width = newWidth;
    canvas.height = newHeight;
    var context = canvas.getContext('2d');
    context.drawImage(img, 0, 0, newWidth, newHeight);
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
function clearDownloadUrls() {
    modImageDowdloadUrls = [];
    updateDownloadUrls();
}
function updateDownloadUrls() {
    const listElement = document.getElementById('download-url-list');
    for (const chEl of listElement.children) {
        listElement.removeChild(chEl);
    }

    for (const data of modImageDowdloadUrls) {
        const urlEl = document.createElement('a');
        urlEl.href = data.url;
        urlEl.download = data.name;
        urlEl.textContent = data.name;
        urlEl.target = '_blank';
        listElement.appendChild(urlEl);
    }
}