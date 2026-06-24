const encodeInput = document.getElementById('encodeInput');
const encodeOutput = document.getElementById('encodeOutput');
const decodeInput = document.getElementById('decodeInput');
const decodeOutput = document.getElementById('decodeOutput');
const encodeFile = document.getElementById('encodeFile');
const decodeFile = document.getElementById('decodeFile');

function handleTextEncode(text) {
    if (text === '') {
        encodeOutput.value = '';
        return;
    }
    try {
        encodeOutput.value = btoa(encodeURIComponent(text).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode('0x' + p1)));
    } catch (e) {
        encodeOutput.value = "Fehler!";
    }
}

function handleTextDecode(base64) {
    const cleanBase64 = base64.trim();
    if (cleanBase64 === '') {
        decodeOutput.value = '';
        return;
    }
    try {
        decodeOutput.value = decodeURIComponent(atob(cleanBase64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    } catch (e) {
        decodeOutput.value = "Fehler!";
    }
}

function encodeFileToBase64(file) {
    const reader = new FileReader();
    reader.onload = () => {
        encodeInput.value = `[Datei geladen: ${file.name}]`;
        encodeOutput.value = reader.result.split(',')[1];
    };
    reader.onerror = () => { encodeOutput.value = "Fehler!"; };
    reader.readAsDataURL(file);
}

function decodeBase64File(file) {
    const reader = new FileReader();
    reader.onload = () => {
        decodeInput.value = `[Datei geladen: ${file.name}]`;
        handleTextDecode(reader.result);
    };
    reader.onerror = () => { decodeOutput.value = "Fehler!"; };
    reader.readAsText(file);
}

encodeInput.addEventListener('input', () => handleTextEncode(encodeInput.value));
decodeInput.addEventListener('input', () => handleTextDecode(decodeInput.value));

encodeFile.addEventListener('change', (e) => { if (e.target.files[0]) encodeFileToBase64(e.target.files[0]); });
decodeFile.addEventListener('change', (e) => { if (e.target.files[0]) decodeBase64File(e.target.files[0]); });

[encodeInput, decodeInput].forEach(input => {
    input.addEventListener('dragover', (e) => { e.preventDefault(); input.style.borderColor = '#007bff'; });
    input.addEventListener('dragleave', () => { input.style.borderColor = ''; });
});

encodeInput.addEventListener('drop', (e) => {
    e.preventDefault();
    encodeInput.style.borderColor = '';
    if (e.dataTransfer.files[0]) encodeFileToBase64(e.dataTransfer.files[0]);
});

decodeInput.addEventListener('drop', (e) => {
    e.preventDefault();
    decodeInput.style.borderColor = '';
    if (e.dataTransfer.files[0]) decodeBase64File(e.dataTransfer.files[0]);
});