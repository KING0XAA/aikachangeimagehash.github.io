document.addEventListener('paste', function (event) {
    var items = (event.clipboardData || event.originalEvent.clipboardData).items;
    for (var index in items) {
        var item = items[index];
        const mimeType = item.type;
        console.log(item);
        if (mimeType && mimeType.startsWith('image/') && item.kind === 'file') {
            var blob = item.getAsFile();
            var reader = new FileReader();
            reader.onloadend = function (e) {
                createModBytesDownload(reader.result, mimeType);
            };

            reader.readAsArrayBuffer(blob);
        }
    }
});
function onInputImgSubmit() {
    /** @type {HTMLInputElement} */
    const inputEl = document.getElementById('input-imgfile');
    if ((inputEl.files?.length ?? 0) > 0) {
        const file = inputEl.files[0];
        console.log(file);
        const mimeType = file.type;
        const fileName = file.name;
        file.arrayBuffer().then((arrayBuffer) => {
            createModBytesDownload(arrayBuffer, mimeType);
        });
    }
}
function stringToBytes(str) {
    var encoder = new TextEncoder('utf-8');
    return encoder.encode(str);
}
function bytesToString(byteArray) {
    var decoder = new TextDecoder('utf-8');
    return decoder.decode(byteArray);
}
function getLast17Bytes(byteArray) {
    return byteArray.subarray(byteArray.length - 17, byteArray.length);
}
function getNewAikaHashBytes() {
    return stringToBytes('aika' + new Date().getTime());
}
const aikaHashRegexp = new RegExp('aika\\d{13}');
function checkAndReplaceHashBytes(byteArray, newHashBytes) {
    const hashBytes = getLast17Bytes(byteArray);
    const hash = bytesToString(hashBytes);
    if (aikaHashRegexp.test(hash)) {
        const combinedArray = new Uint8Array(byteArray.length);
        combinedArray.set(byteArray, 0);
        combinedArray.set(newHashBytes, byteArray.length - 17);
        return combinedArray;
    } else {
        const combinedArray = new Uint8Array(byteArray.length + newHashBytes.length);
        combinedArray.set(byteArray, 0);
        combinedArray.set(newHashBytes, byteArray.length);
        return combinedArray;
    }
}
function byteArrayToDataURL(byteArray, mimeType) {
    var blob = new Blob([byteArray], { type: mimeType });
    var dataUrl = URL.createObjectURL(blob);
    return dataUrl;
}
function createModBytesDownload(arrayBuffer, mimeType) {
    const originalData = new Uint8Array(arrayBuffer);
    const hashName = 'aika' + new Date().getTime();
    const newHashBytes = stringToBytes(hashName);
    const modedImageData = checkAndReplaceHashBytes(originalData, newHashBytes);
    const type = mimeType.replace(/^image\//, '');
    var fileName = `${hashName}.${type}`;
    const newImgDataUrl = byteArrayToDataURL(modedImageData, mimeType);
    createDownload(fileName, newImgDataUrl);
}
function createDownload(fileName, dataUrl) {
    var downloadLink = document.createElement("a");
    downloadLink.href = dataUrl;
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(dataUrl);
}


const testbytes = getNewAikaHashBytes();
const reStr = bytesToString(testbytes);