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

  fetch('https://api64.ipify.org?format=json')
    .then(res => res.json())
    .then(data => {
      if (data.ip.includes(':')) {
        elemV6.innerText = data.ip;
      } else {
        elemV6.innerText = 'Keine IPv6-Verbindung vorhanden';
      }
    })
    .catch(() => {
      elemV6.innerText = 'Fehler beim Laden (IPv6)';
    });
}

fetchIps();
