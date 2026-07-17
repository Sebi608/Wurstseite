const DNS_TYPES = [
    'A', 'AAAA', 'CAA', 'CNAME', 'DNAME', 'MX', 'NS', 'PTR', 'SOA', 'SRV', 'TXT', 
    'HTTPS', 'SVCB', 'NAPTR', 'ALPN',
    'DNSKEY', 'DS', 'NSEC', 'NSEC3', 'NSEC3PARAM', 'RRSIG', 'SSHFP', 'TLSA', 
    'CDNSKEY', 'CDS', 'CSYNC', 'IPSECKEY',
    '3', '4', '7', '8', '9', '10', '11', '13', '14', '17', '18', '19', '20', 
    '21', '22', '23', '24', '25', '26', '29', '31', '32', '36', '37', '38', 
    '40', '41', '42', '49', '55', '56', '57', '58', '61', '99', '100', '101', 
    '102', '103', '104', '105', '106', '107', '108', '109', '249', '250', '256'
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
    const geoContainer = document.getElementById('geoContainer');

    if (geoContainer) {
        geoContainer.style.display = 'none';
    }

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
    let foundIPv4 = null;

    DNS_TYPES.forEach((type, index) => {
        const records = results[index];

        if (records && records.length > 0) {
            if (type === 'A' && !foundIPv4) {
                foundIPv4 = records[0];
            }

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
        if (foundIPv4) {
            fetchIPDetails(foundIPv4);
        }
    }
}

async function fetchIPDetails(ipAddress) {
    const geoContainer = document.getElementById('geoContainer');
    if (!geoContainer) return;

    try {
        const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
        const data = await response.json();

        if (!data.error) {
            document.getElementById('geoCity').innerText = data.city || '-';
            document.getElementById('geoRegion').innerText = data.region || '-';
            document.getElementById('geoCountry').innerText = `${data.country_name} (${data.country_code})`;
            document.getElementById('geoZip').innerText = data.postal || '-';
            document.getElementById('geoTimezone').innerText = data.timezone || '-';
            document.getElementById('geoIsp').innerText = data.org || '-';
            document.getElementById('geoAs').innerText = data.asn || '-';

            const mapFrame = document.getElementById('mapFrame');
            if (mapFrame) {
                mapFrame.src = `https://maps.google.com/maps?q=${data.latitude},${data.longitude}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
            }

            geoContainer.style.display = 'grid';
        } else {
            geoContainer.style.display = 'none';
        }
    } catch (error) {
        console.error(error);
        geoContainer.style.display = 'none';
    }
}

function escapeHtml(string) {
    return String(string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}