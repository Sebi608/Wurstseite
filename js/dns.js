const DNS_TYPES = [
    // Standard- & Web-Records
    'A', 'AAAA', 'CAA', 'CNAME', 'DNAME', 'MX', 'NS', 'PTR', 'SOA', 'SRV', 'TXT', 
    'HTTPS', 'SVCB', 'NAPTR', 'ALPN',

    // DNSSEC & Sicherheit
    'DNSKEY', 'DS', 'NSEC', 'NSEC3', 'NSEC3PARAM', 'RRSIG', 'SSHFP', 'TLSA', 
    'CDNSKEY', 'CDS', 'CSYNC', 'IPSECKEY',

    // Weitere von IANA registrierte Typen
    '3',     // MD
    '4',     // MF
    '7',     // MB
    '8',     // MG
    '9',     // MR
    '10',    // NULL
    '11',    // WKS
    '13',    // HINFO
    '14',    // MINFO
    '17',    // RP
    '18',    // AFSDB
    '19',    // X25
    '20',    // ISDN
    '21',    // RT
    '22',    // NSAP
    '23',    // NSAP-PTR
    '24',    // SIG
    '25',    // KEY
    '26',    // PX
    '29',    // LOC
    '31',    // EID
    '32',    // NIMLOC
    '36',    // KX
    '37',    // CERT
    '38',    // A6
    '40',    // SINK
    '41',    // OPT
    '42',    // APL
    '49',    // DHCID
    '55',    // HIP
    '56',    // NINFO
    '57',    // RKEY
    '58',    // TALINK
    '61',    // OPENPGPKEY
    '99',    // SPF
    '100',   // UINFO
    '101',   // UID
    '102',   // GID
    '103',   // UNSPEC
    '104',   // NID
    '105',   // L32
    '106',   // L64
    '107',   // LP
    '108',   // EUI48
    '109',   // EUI64
    '249',   // TKEY
    '250',   // TSIG
    '256'    // URI
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