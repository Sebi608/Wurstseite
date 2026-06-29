
function handleCalcModeChange() {
    const mode = document.getElementById('calcModeSelect').value;
    const label = document.getElementById('dynamicLabel');
    const input = document.getElementById('dynamicValueInput');

    if (mode === 'subnets') {
        label.innerText = "Gewünschte Subnetze";
        input.value = "4";
    } else {
        label.innerText = "Hosts pro Subnetz";
        input.value = "30";
    }
    liveCalculateSubnets();
}

function liveCalculateSubnets() {
    const baseIpStr = document.getElementById('baseIpInput').value.trim();
    const baseCidr = parseInt(document.getElementById('cidrSelect').value, 10);
    const mode = document.getElementById('calcModeSelect').value;
    const reqValue = parseInt(document.getElementById('dynamicValueInput').value, 10);

    const errorOut = document.getElementById('errorOut');
    const listContainer = document.getElementById('subnetListContainer');
    errorOut.innerText = "";

    const parts = baseIpStr.split('.');
    if (parts.length !== 4) {
        errorOut.innerText = "Hinweis: Eine IP-Adresse benötigt genau 4 Oktette, getrennt durch Punkte.";
        return;
    }

    let ipNum = 0;
    for (let i = 0; i < 4; i++) {
        let val = parseInt(parts[i], 10);
        if (isNaN(val) || val < 0 || val > 255 || !/^\d+$/.test(parts[i])) {
            errorOut.innerText = `Fehler im ${i + 1}. Oktett der Basis-IP.`;
            return;
        }
        ipNum = (ipNum << 8) + val;
    }

    if (isNaN(reqValue) || reqValue <= 0) {
        errorOut.innerText = "Bitte gib einen gültigen Wert größer als 0 ein.";
        return;
    }

    let additionalBits = 0;
    if (mode === 'subnets') {
        while ((1 << additionalBits) < reqValue) {
            additionalBits++;
        }
    } else {
        let hostBitsNeeded = 0;
        while ((1 << hostBitsNeeded) < (reqValue + 2)) {
            hostBitsNeeded++;
        }
        additionalBits = (32 - baseCidr) - hostBitsNeeded;
    }

    const newCidr = baseCidr + additionalBits;

    if (newCidr > 32 || additionalBits < 0) {
        errorOut.innerText = "Das gewählte Netz ist zu klein für diese Aufteilung!";
        return;
    }
    if (newCidr === 31 || newCidr === 32) {
        errorOut.innerText = "CIDR /31 und /32 bieten keinen Platz für nutzbare Host-Bereiche.";
        return;
    }

    let maskNum = 0xFFFFFFFF << (32 - newCidr);
    let maskStr = [
        (maskNum >>> 24) & 255,
        (maskNum >>> 16) & 255,
        (maskNum >>> 8) & 255,
        maskNum & 255
    ].join('.');

    const totalHosts = (1 << (32 - newCidr)) - 2;

    document.getElementById('resSubnetMask').innerText = maskStr;
    document.getElementById('resCidr').innerText = `/${newCidr}`;
    document.getElementById('resMaxHosts').innerText = totalHosts;

    const numSubnets = 1 << additionalBits;
    const subnetSize = 1 << (32 - newCidr);

    let currentNetNum = (ipNum & (0xFFFFFFFF << (32 - baseCidr))) >>> 0;

    let html = `
                    <table class="subnet-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Netz-ID / CIDR</th>
                                <th>Nutzbarer Host-Bereich</th>
                                <th>Broadcast</th>
                            </tr>
                        </thead>
                        <tbody>
                `;

    const displayLimit = Math.min(numSubnets, 64);
    for (let i = 0; i < displayLimit; i++) {
        let netId = numToIp(currentNetNum);
        let firstHost = numToIp(currentNetNum + 1);
        let lastHost = numToIp(currentNetNum + subnetSize - 2);
        let broadcast = numToIp(currentNetNum + subnetSize - 1);

        html += `
                        <tr>
                            <td><strong>${i + 1}</strong></td>
                            <td style="color: var(--accent); font-family: monospace;">${netId} /${newCidr}</td>
                            <td style="font-family: monospace;">${firstHost} - ${lastHost}</td>
                            <td style="color: var(--primary); font-family: monospace;">${broadcast}</td>
                        </tr>
                    `;
        currentNetNum += subnetSize;
    }

    html += `</tbody></table>`;

    if (numSubnets > 64) {
        html += `<p style="margin-top: 15px; opacity: 0.6; font-size: 0.9rem; text-align: center;">... und ${numSubnets - 64} weitere Subnetze wurden aus Performancegründen nicht gelistet.</p>`;
    }

    listContainer.innerHTML = html;
}

function numToIp(num) {
    return [
        (num >>> 24) & 255,
        (num >>> 16) & 255,
        (num >>> 8) & 255,
        num & 255
    ].join('.');
}

const cidrSelect = document.getElementById('cidrSelect');
cidrSelect.innerHTML = "";
for (let i = 8; i <= 30; i++) {
    let maskNum = 0xFFFFFFFF << (32 - i);
    let maskStr = [(maskNum >>> 24) & 255, (maskNum >>> 16) & 255, (maskNum >>> 8) & 255, maskNum & 255].join('.');
    let opt = document.createElement('option');
    opt.value = i;
    opt.innerText = `/${i} (${maskStr})`;
    if (i === 24) opt.selected = true;
    cidrSelect.appendChild(opt);
}

liveCalculateSubnets();