async function fetchIps() {
  const elemV4 = document.getElementById('my-ipv4');
  const elemV6 = document.getElementById('my-ipv6');

  fetch('https://api.ipify.org?format=json')
    .then(res => res.json())
    .then(data => {
      elemV4.innerText = data.ip;
    })
    .catch(() => {
      elemV4.innerText = 'Fehler beim Laden (IPv4)';
    });

  fetch('https://api6.ipify.org?format=json')
    .then(res => res.json())
    .then(data => {
      const parts = data.ip.split(':');
      const line1 = parts.slice(0, 4).join(':');
      const line2 = parts.slice(4).join(':');

      elemV6.innerHTML = `${line1}:<span class="responsive-break"></span>${line2}`;
    })
    .catch(() => {
      elemV6.innerText = 'Keine IPv6-Verbindung vorhanden';
    });
}

fetchIps();
