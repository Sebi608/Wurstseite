const DNS_TYPES = [
    'A', 'AAAA', 'CAA', 'CNAME', 'DNAME', 'DNSKEY', 'DS', 'HINFO',
    'HTTPS', 'LOC', 'MX', 'NAPTR', 'NS', 'NSEC', 'NSEC3', 'NSEC3PARAM',
    'PTR', 'RRSIG', 'SOA', 'SPF', 'SRV', 'SSHFP', 'SVCB', 'TLSA', 'TXT'
];

async function fetchRecord(domain, type) {
    try {
        const response = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}`);
        const data = await response.json();

        if (data.Answer && data.Answer.length > 0) {
            return data.Answer.map(r => r.data);
        }
        return [];
    } catch (e) {
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

    const results = await Promise.all(DNS_TYPES.map(type => fetchRecord(domainInput, type)));

    if (results.every(res => res === null)) {
        resultDiv.innerHTML = '<div class="status-msg" style="color: var(--primary);">Fehler bei der DNS-Verbindung.</div>';
        return;
    }

    let outputHtml = '';

    DNS_TYPES.forEach((type, index) => {
        const records = results[index];

        if (records && records.length > 0) {

            outputHtml += `
                <div class="result-item">
                    <div><span class="record-badge badge-${type.toLowerCase()}">${type}</span></div>
                    <div class="ip-list">${records.map(r => escapeHtml(r)).join('<br>')}</div>
                </div>
            `;
        }
    });

    if (outputHtml === '') {
        resultDiv.innerHTML = '<div class="status-msg" style="color: var(--accent);">Keine DNS-Einträge für diese Domain gefunden.</div>';
    } else {
        resultDiv.innerHTML = outputHtml;
    }
}

function escapeHtml(string) {
    return String(string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}