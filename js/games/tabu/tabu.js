let deck = [];
let currentCardIndex = 0;
let score = 0;
let timeLeft = 60;
let timerInterval = null;

function startGame() {
    // Setup resetten
    score = 0;
    timeLeft = 60;
    document.getElementById('score').textContent = score;
    document.getElementById('timer').textContent = timeLeft;

    // Karten mischen (Fisher-Yates)
    deck = [...cards].sort(() => Math.random() - 0.5);
    currentCardIndex = 0;

    // UI Umschalten
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    document.getElementById('controls').classList.remove('hidden');

    showCard();

    // Timer starten
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = timeLeft;
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function showCard() {
    if (currentCardIndex >= deck.length) {
        endGame("Alle Karten gespielt!");
        return;
    }

    const card = deck[currentCardIndex];
    document.getElementById('target-word').textContent = card.word;

    const listEl = document.getElementById('taboo-list');
    listEl.innerHTML = '';
    card.taboo.forEach(word => {
        const li = document.createElement('li');
        li.textContent = word;
        listEl.appendChild(li);
    });
}

function nextCard(isCorrect) {
    if (isCorrect) score++;
    else score--;

    document.getElementById('score').textContent = score;
    currentCardIndex++;
    showCard();
}

function endGame(message = "Zeit abgelaufen!") {
    clearInterval(timerInterval);
    alert(`${message}\nDein Endstand: ${score} Punkte!`);

    // UI zurücksetzen
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('controls').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
}