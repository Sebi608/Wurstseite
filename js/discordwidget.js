const statusText = document.getElementById('discord-status');
const discordBtn = document.getElementById('discord-button');
const dot = document.querySelector('.status-dot');


async function loadDiscord() {
    try {
        const response = await fetch('https://discord.com/api/guilds/1472365419816816877/widget.json');
        const data = await response.json();

        if (data.instant_invite) {
            statusText.innerHTML = `<span style="color: #23a559;">${data.presence_count} Würste online</span>`;
            discordBtn.href = data.instant_invite;
            discordBtn.style.display = 'inline-block';
            discordBtn.innerText = "Jetzt mitmischen";
        } else {
            statusText.innerText = "Server online (Invite aus)";
            dot.style.backgroundColor = "#ffa502";
        }
    } catch (e) {
        statusText.innerText = "Funkstille im Wurstwasser";
        dot.style.backgroundColor = "#ff4757";
    }
}

loadDiscord();