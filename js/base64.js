const encodeInput = document.getElementById('encodeInput');
const encodeOutput = document.getElementById('encodeOutput');
const decodeInput = document.getElementById('decodeInput');
const decodeOutput = document.getElementById('decodeOutput');
const encodeFile = document.getElementById('encodeFile');

const downloadContainer = document.getElementById('downloadContainer');
const downloadBtn = document.getElementById('downloadBtn');
const decodePaneTitle = decodeOutput.previousElementSibling; 

let currentBlob = null;
let detectedFilename = "decodierte_datei.bin";

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
    let trimmed = base64.trim();
    
    if (trimmed === '') {
        decodeOutput.value = '';
        decodeOutput.style.display = 'block'; 
        if (decodePaneTitle) decodePaneTitle.style.display = 'block';
        downloadContainer.style.display = 'none';
        currentBlob = null;
        return;
    }
    
    try {
        let mimeType = "application/octet-stream";
        detectedFilename = "decodierte_datei.bin";
        let isFile = false; 

        if (trimmed.startsWith("data:")) {
            isFile = true; 
            const parts = trimmed.split(",");
            if (parts.length > 1) {
                const meta = parts[0];
                trimmed = parts[1];
                
                const nameMatch = meta.match(/name=(.*?);/);
                const mimeMatch = meta.match(/data:(.*?);/);
                
                if (mimeMatch && mimeMatch[1]) {
                    mimeType = mimeMatch[1];
                }

                if (nameMatch && nameMatch[1]) {
                    detectedFilename = decodeURIComponent(nameMatch[1]);
                } else if (mimeMatch && mimeMatch[1]) {
                    const subType = mimeType.split('/')[1];
                    let ext = subType === "jpeg" ? "jpg" : (subType === "plain" ? "txt" : (subType || "bin"));
                    if (ext === "octet-stream") ext = "bin";
                    detectedFilename = `decodierte_datei.${ext}`;
                }
            }
        }

        const binaryString = atob(trimmed);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        currentBlob = new Blob([bytes], { type: mimeType });

        if (isFile) {
            throw new Error("Als Datei erzwingen");
        }

        const decodedText = decodeURIComponent(binaryString.split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        
        if (/[\x00-\x08\x0E-\x1F\x7F]/.test(decodedText)) {
            throw new Error("Binärdatei");
        }
        
        decodeOutput.value = decodedText;
        decodeOutput.style.display = 'block';
        if (decodePaneTitle) decodePaneTitle.style.display = 'block';
        downloadContainer.style.display = 'none';

    } catch (textError) {
        decodeOutput.value = '';
        decodeOutput.style.display = 'none'; 
        if (decodePaneTitle) decodePaneTitle.style.display = 'none';
        downloadContainer.style.display = 'block';

        if (textError.message.includes("Base64")) {
            decodeOutput.value = "Fehler! Ungültiger Base64-String.";
            decodeOutput.style.display = 'block';
            if (decodePaneTitle) decodePaneTitle.style.display = 'block';
            downloadContainer.style.display = 'none';
            currentBlob = null;
        }
    }
}

function encodeFileToBase64(file) {
    const reader = new FileReader();
    reader.onload = () => {
        encodeInput.value = `[Datei geladen: ${file.name}]`;
        let result = reader.result;
        if (result.startsWith("data:")) {
            result = result.replace("data:", `data:name=${encodeURIComponent(file.name)};`);
        }
        encodeOutput.value = result;
    };
    reader.onerror = () => { encodeOutput.value = "Fehler!"; };
    reader.readAsDataURL(file);
}

downloadBtn.addEventListener('click', function() {
    if (!currentBlob) return;

    const blobUrl = URL.createObjectURL(currentBlob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = detectedFilename;
    
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
});

encodeInput.addEventListener('input', () => handleTextEncode(encodeInput.value));
decodeInput.addEventListener('input', () => handleTextDecode(decodeInput.value));

encodeFile.addEventListener('change', (e) => { 
    if (e.target.files[0]) encodeFileToBase64(e.target.files[0]); 
});

encodeInput.addEventListener('dragover', (e) => { 
    e.preventDefault(); 
    encodeInput.style.borderColor = '#ffa502'; 
});

encodeInput.addEventListener('dragleave', () => { 
    encodeInput.style.borderColor = ''; 
});

encodeInput.addEventListener('drop', (e) => {
    e.preventDefault();
    encodeInput.style.borderColor = '';
    if (e.dataTransfer.files[0]) encodeFileToBase64(e.dataTransfer.files[0]);
});