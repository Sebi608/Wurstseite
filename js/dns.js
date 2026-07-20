const DNS_TYPES = [
  // --- Standard & Core (RFC 1035 & neuere) ---
  'A',           // Host Address (IPv4)
  'AAAA',        // IPv6 Address
  'CNAME',       // Canonical Name for an Alias
  'MX',          // Mail Exchange
  'NS',          // Name Server
  'PTR',         // Pointer Record (Reverse DNS)
  'SOA',         // Start of Authority
  'TXT',         // Text Record (oft für SPF, DKIM, DMARC)

  // --- Services, Routing & Web ---
  'SRV',         // Service Locator
  'CAA',         // Certification Authority Authorization
  'NAPTR',       // Naming Authority Pointer
  'HTTPS',       // HTTPS Service Binding (modern)
  'SVCB',        // Service Binding (modern)
  'URI',         // Uniform Resource Identifier

  // --- Sicherheit & DNSSEC ---
  'DNSKEY',      // DNSSEC Public Key
  'DS',          // Delegation Signer
  'CDNSKEY',     // Child DNSKEY
  'CDS',         // Child DS
  'NSEC',        // Next Secure
  'NSEC3',       // Next Secure v3
  'NSEC3PARAM',  // NSEC3 Parameters
  'RRSIG',       // RRset Signature
  'TLSA',        // TLSA Certificate Association (DANE)
  'SMIMEA',      // S/MIME Certificate Association
  'SSHFP',       // SSH Public Key Fingerprint
  'IPSECKEY',    // IPsec Key
  'CERT',        // Certificate / CRL
  'OPENPGPKEY',  // OpenPGP Public Key
  'TA',          // Trust Anchor
  'DLV',         // DNSSEC Lookaside Validation (historisch)

  // --- Erweiterte Delegation & Identifikation ---
  'DNAME',       // Delegation Name (Alias für ganze Subtrees)
  'AFSDB',       // AFS Data Base Location
  'APL',         // Address Prefix List
  'KX',          // Key Exchanger
  'RP',          // Responsible Person
  'RT',          // Route Through
  'LOC',         // Location Information (Koordinaten)
  'HINFO',       // Host Information (CPU/OS)
  'MINFO',       // Mailbox or Mail List Information
  'DHCID',       // DHCP Identifier
  'EUI48',       // MAC Address (48-bit)
  'EUI64',       // MAC Address (64-bit)

  // --- Zonentransfer, Updates & Pseudo-Records ---
  'AXFR',        // Full Zone Transfer (Query-Typ)
  'IXFR',        // Incremental Zone Transfer (Query-Typ)
  'OPT',         // Option (EDNS0)
  'TSIG',        // Transaction Signature
  'TKEY',        // Transaction Key
  'ANY',         // All Cached Records (Query-Typ, oft `*` genannt)
  'CSYNC',       // Child-to-Parent Synchronization
  'ZONEMD',      // Message Digests for DNS Zones

  // --- Veraltet / Obsolete (aber noch im IANA-Standard) ---
  'MD',          // Mail Destination (ersetzt durch MX)
  'MF',          // Mail Forwarder (ersetzt durch MX)
  'MAILA',       // Mail Routing Information
  'MAILB',       // Mailbox-related Records
  'MB',          // Mailbox Domain Name
  'MG',          // Mail Group Member
  'MR',          // Mail Rename Domain Name
  'NULL',        // Null Record (experimentell)
  'WKS',         // Well Known Service Information
  'X25',         // X.25 PSDN Address
  'ISDN',        // ISDN Address
  'NSAP',        // NSAP Address
  'NSAP-PTR',    // NSAP Pointer
  'SIG',         // Security Signature (ersetzt durch RRSIG)
  'KEY',         // Security Key (ersetzt durch DNSKEY)
  'PX',          // X.400 Mail Mapping
  'GPOS',        // Geographical Position (ersetzt durch LOC)
  'NXT',         // Next Domain (ersetzt durch NSEC)
  'A6',          // IPv6 Address (ersetzt durch AAAA)
  'NINFO',       // Zone Status Information
  'RKEY',        // RKEY (Kryptografie)
  'TALINK',      // Trust Anchor Link
  'NID',         // Node Identifier
  'L32',         // Locator 32-bit
  'L64',         // Locator 64-bit
  'LP',          // Locator Pointer
  'DOA'          // Digital Object Architecture
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
