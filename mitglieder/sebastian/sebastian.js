function updateClock() {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    document.getElementById('clock').textContent = timeStr;
}
setInterval(updateClock, 1000);
updateClock();

const cpuCanvas = document.getElementById('cpuChart');
const cpuCtx = cpuCanvas.getContext('2d');
let cpuData = Array(30).fill(20);

function drawChart(canvas, ctx, data) {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();

    const step = canvas.width / (data.length - 1);
    data.forEach((val, i) => {
        const x = i * step;
        const y = canvas.height - (val / 100 * canvas.height);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();
}

setInterval(() => {
    cpuData.shift();
    cpuData.push(Math.floor(Math.random() * 50) + 20);
    drawChart(cpuCanvas, cpuCtx, cpuData);
}, 300);

const netCanvas = document.getElementById('netChart');
const netCtx = netCanvas.getContext('2d');
let netData = Array(30).fill(10);

setInterval(() => {
    netData.shift();
    netData.push(Math.floor(Math.random() * 80) + 10);
    drawChart(netCanvas, netCtx, netData);
}, 200);

const globeCanvas = document.getElementById('globeCanvas');
const globeCtx = globeCanvas.getContext('2d');
let angle = 0;

function drawGlobe() {
    globeCanvas.width = globeCanvas.clientWidth;
    globeCanvas.height = globeCanvas.clientHeight;
    const radius = Math.min(globeCanvas.width, globeCanvas.height) / 2.5;
    const cx = globeCanvas.width / 2;
    const cy = globeCanvas.height / 2;

    globeCtx.clearRect(0, 0, globeCanvas.width, globeCanvas.height);
    globeCtx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    globeCtx.lineWidth = 1;

    for (let i = -4; i <= 4; i++) {
        const r = radius * Math.cos(i * 0.3);
        const y = cy + radius * Math.sin(i * 0.3);
        globeCtx.beginPath();
        globeCtx.ellipse(cx, y, r, r * 0.3, 0, 0, Math.PI * 2);
        globeCtx.stroke();
    }

    for (let i = 0; i < 8; i++) {
        const rad = angle + (i * Math.PI / 4);
        const xOffset = Math.sin(rad) * radius;
        globeCtx.beginPath();
        globeCtx.ellipse(cx, cy, Math.abs(xOffset), radius, 0, 0, Math.PI * 2);
        globeCtx.stroke();
    }

    angle += 0.02;
    requestAnimationFrame(drawGlobe);
}
drawGlobe();

const termInput = document.getElementById('termInput');
const termBody = document.getElementById('termBody');

window.addEventListener('keydown', (e) => {
    termInput.focus();
    highlightVirtualKey(e.key);

    if (
        e.key === 'Alt' || 
        e.key === 'AltGraph' || 
        e.key === 'Tab' || 
        e.key === 'F5' || 
        e.key === 'ContextMenu'
    ) {
        e.preventDefault();
    }

    if (e.key === 'Enter') {
        const cmd = termInput.value;
        const currentPromptText = document.querySelector('.prompt').textContent;
        
        const executedLine = document.createElement('div');
        executedLine.className = 'cmd-line';
        executedLine.innerHTML = `<span class="prompt">${currentPromptText}</span><span>${cmd}</span>`;
        termBody.insertBefore(executedLine, termInput.parentElement);

        if (cmd.trim() !== '') {
            const trimmedCmd = cmd.trim();
            const res = document.createElement('div');
            res.style.color = '#a8eeff';

            if (trimmedCmd === 'clear') {
                termBody.innerHTML = '';
                termBody.appendChild(termInput.parentElement);
            } else if (trimmedCmd === 'help') {
                res.textContent = 'Verfügbare Befehle: help, clear, date, echo, whoami';
                termBody.insertBefore(res, termInput.parentElement);
            } else if (trimmedCmd === 'whoami') {
                res.textContent = 'sebastian';
                termBody.insertBefore(res, termInput.parentElement);
            } else if (trimmedCmd === 'date') {
                res.textContent = new Date().toString();
                termBody.insertBefore(res, termInput.parentElement);
            } else if (trimmedCmd.startsWith('echo ')) {
                res.textContent = trimmedCmd.substring(5);
                termBody.insertBefore(res, termInput.parentElement);
            } else if (trimmedCmd === 'echo') {
                res.textContent = '';
                termBody.insertBefore(res, termInput.parentElement);
            } else {
                res.textContent = `bash: command not found: ${cmd}`;
                termBody.insertBefore(res, termInput.parentElement);
            }
        }

        termInput.value = '';
        termBody.scrollTop = termBody.scrollHeight;
    }
});

window.addEventListener('keyup', (e) => {
    unhighlightVirtualKey(e.key);
});

function highlightVirtualKey(key) {
    const keys = document.querySelectorAll('.key');
    keys.forEach(k => {
        if (k.dataset.key.toLowerCase() === key.toLowerCase()) {
            k.classList.add('active');
        }
    });
}

function unhighlightVirtualKey(key) {
    const keys = document.querySelectorAll('.key');
    keys.forEach(k => {
        if (k.dataset.key.toLowerCase() === key.toLowerCase()) {
            k.classList.remove('active');
        }
    });
}

document.addEventListener('click', () => {
    termInput.focus();
});