async function fetchRecord(domain, type) {
    try {
        const response = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}`);
        const data = await response.json();
        return data.Answer ? data.Answer.map(r => r.data) : [];
    } catch (e) {
        console.error(e);
        return null;
    }
}

async function resolveDomain() {
    const domainInput = document.getElementById('domainInput').value.trim();
    const resultDiv = document.getElementById('result');

    if (!domainInput) {
        resultDiv.innerHTML = '<div class="status-msg" style="color: var(--primary);">Bitte gib eine gültige Domain ein.</div>';
        return;
    }

    resultDiv.innerHTML = '<div class="status-msg">Frage Google DNS ab...</div>';

    const [ipv4Records, ipv6Records] = await Promise.all([
        fetchRecord(domainInput, 'A'),
        fetchRecord(domainInput, 'AAAA')
    ]);

    if (ipv4Records === null && ipv6Records === null) {
        resultDiv.innerHTML = '<div class="status-msg" style="color: var(--primary);">Fehler bei der DNS-Verbindung.</div>';
        return;
    }

    let outputHtml = '';

    if (ipv4Records && ipv4Records.length > 0) {
        outputHtml += `
            <div class="result-item">
                <div><span class="record-badge">A (IPv4)</span></div>
                <div class="ip-list">${ipv4Records.join('<br>')}</div>
            </div>`;
    }

    if (ipv6Records && ipv6Records.length > 0) {
        outputHtml += `
            <div class="result-item">
                <div><span class="record-badge" style="background: var(--accent); color: var(--secondary);">AAAA (IPv6)</span></div>
                <div class="ip-list">${ipv6Records.join('<br>')}</div>
            </div>`;
    }

    if (outputHtml === '') {
        resultDiv.innerHTML = '<div class="status-msg" style="color: var(--accent);">Keine IP-Einträge für diese Domain gefunden.</div>';
    } else {
        resultDiv.innerHTML = outputHtml;
    }
}
