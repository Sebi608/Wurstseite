// IP-Converter Logik für Team Wurstwasser mit dynamischer Balken-Anzeige
const bitValues = [128, 64, 32, 16, 8, 4, 2, 1];

// Wechselt den Beispielwert im Input-Feld passend zum Modus
function handleModeChange() {
    const mode = document.getElementById('modeSelect').value;
    const input = document.getElementById('ipInput');
    
    if (mode === 'bin') {
        input.value = "11111111.11111111.11111111.00000000";
    } else {
        input.value = "255.255.255.0";
    }
    liveConvertIP();
}

function liveConvertIP() {
    const input = document.getElementById('ipInput').value.trim();
    const mode = document.getElementById('modeSelect').value;
    const errorOut = document.getElementById('errorOut');
    
    errorOut.innerText = ""; 

    let octetsDec = [];
    let octetsBin = [];
    const parts = input.split('.');

    if (parts.length !== 4) {
        errorOut.innerText = "Hinweis: Eine IP-Adresse benötigt genau 4 Oktette, getrennt durch Punkte.";
        return;
    }

    if (mode === 'bin') {
        for (let i = 0; i < 4; i++) {
            let binStr = parts[i];

            if (binStr.length > 8) {
                errorOut.innerText = `Fehler im ${i+1}. Oktett: Maximal 8 Bits erlaubt.`;
                return;
            }
            if (binStr.length > 0 && !/^[01]+$/.test(binStr)) {
                errorOut.innerText = `Fehler im ${i+1}. Oktett: Nur '0' und '1' erlaubt.`;
                return;
            }

            let paddedBin = binStr.padStart(8, '0');
            octetsBin.push(paddedBin);
            octetsDec.push(parseInt(paddedBin, 2));
        }
    } else {
        for (let i = 0; i < 4; i++) {
            let rawVal = parts[i];

            if (rawVal.length > 0 && !/^\d+$/.test(rawVal)) {
                errorOut.innerText = `Fehler im ${i+1}. Oktett: Nur Zahlen von 0 bis 255 erlaubt.`;
                return;
            }

            let decNum = parseInt(rawVal, 10);
            if (isNaN(decNum)) decNum = 0;

            if (decNum < 0 || decNum > 255) {
                errorOut.innerText = `Fehler im ${i+1}. Oktett: Zahl muss zwischen 0 und 255 liegen.`;
                return;
            }

            octetsDec.push(decNum);
            octetsBin.push(decNum.toString(2).padStart(8, '0'));
        }
    }

    const binResult = octetsBin.join('.');
    const decResult = octetsDec.join('.');

    // Hier findet das dynamische Umdrehen statt
    if (mode === 'bin') {
        document.getElementById('headerText').innerText = `IP-Adresse in binär: ${binResult}`;
        document.getElementById('footerText').innerText = `IP-Adresse in dezimal: ${decResult}`;
        document.getElementById('headerText').style.color = "var(--accent)";
        document.getElementById('footerText').style.color = "#ffffff";
    } else {
        document.getElementById('headerText').innerText = `IP-Adresse in dezimal: ${decResult}`;
        document.getElementById('footerText').innerText = `IP-Adresse in binär: ${binResult}`;
        document.getElementById('headerText').style.color = "#ffffff";
        document.getElementById('footerText').style.color = "var(--accent)";
    }

    renderOctets(octetsBin, octetsDec);
}

function renderOctets(octetsBin, octetsDec) {
    const container = document.getElementById('octetsContainer');
    container.innerHTML = '';

    for (let i = 0; i < 4; i++) {
        const binStr = octetsBin[i];
        const decVal = octetsDec[i];
        
        const col = document.createElement('div');
        col.className = 'ip-octet-column';

        const title = document.createElement('div');
        title.className = 'ip-octet-title';
        title.innerText = `${i + 1}. Oktett`;
        col.appendChild(title);

        const table = document.createElement('table');
        table.className = 'ip-bit-table';
        
        let thRow = '<tr>';
        let tdRow = '<tr>';
        
        for (let b = 0; b < 8; b++) {
            thRow += `<th>${bitValues[b]}</th>`;
            const activeClass = binStr[b] === '1' ? 'class="ip-bit-active"' : '';
            tdRow += `<td ${activeClass} onclick="toggleBit(${i}, ${b})">${binStr[b]}</td>`;
        }
        thRow += '</tr>';
        tdRow += '</tr>';
        table.innerHTML = thRow + tdRow;
        col.appendChild(table);

        const explanation = document.createElement('div');
        explanation.className = 'ip-explanation';
        explanation.innerHTML = `Gesetzte Bits zusammengezählt ergeben den Wert:`;
        col.appendChild(explanation);

        const calculation = document.createElement('div');
        calculation.className = 'ip-calculation';
        calculation.innerHTML = `<strong>${decVal}</strong>`;
        
        col.appendChild(calculation);
        container.appendChild(col);
    }
}

function toggleBit(octetIndex, bitIndex) {
    const input = document.getElementById('ipInput');
    const mode = document.getElementById('modeSelect').value;
    let parts = input.value.split('.');
    
    if (parts.length !== 4) return;

    let currentBinStr = mode === 'bin' 
        ? parts[octetIndex].padStart(8, '0').split('') 
        : parseInt(parts[octetIndex], 10).toString(2).padStart(8, '0').split('');

    currentBinStr[bitIndex] = currentBinStr[bitIndex] === '1' ? '0' : '1';
    let newBinStr = currentBinStr.join('');

    if (mode === 'bin') {
        parts[octetIndex] = newBinStr;
    } else {
        parts[octetIndex] = parseInt(newBinStr, 2).toString();
    }

    input.value = parts.join('.');
    liveConvertIP();
}

// Initialer Start beim Laden der Seite
liveConvertIP();