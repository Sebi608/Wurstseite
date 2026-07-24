function fetchIp() {
  fetch('https://api64.ipify.org?format=json')
    .then(response => response.json())
    .then(data => {
      document.getElementById('my-ip').innerText = data.ip;
    })
    .catch(() => {
      document.getElementById('my-ip').innerText = 'Fehler beim Laden';
    });
}

fetchIp();