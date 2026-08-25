let deck = [];
let currentCardIndex = 0;
let score = 0;
let timeLeft = 60;
let timerInterval = null;

// Echter Fisher-Yates Shuffle
function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function startGame() {
    // Altes Intervall löschen, falls vorhanden
    if (timerInterval) clearInterval(timerInterval);

    // Setup zurücksetzen
    score = 0;
    timeLeft = 60;
    document.getElementById('score').textContent = score;
    document.getElementById('timer').textContent = timeLeft;

    // Karten korrekt mischen
    deck = shuffle(cards);
    currentCardIndex = 0;

    // UI umschalten
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

    // Modernere Variante zum Leeren & Befüllen der Liste
    const listEl = document.getElementById('taboo-list');
    listEl.replaceChildren(
        ...card.taboo.map(word => {
            const li = document.createElement('li');
            li.textContent = word;
            return li;
        })
    );
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
    
    // Kurze Verzögerung, damit die UI vor dem Alert gerendert wird
    setTimeout(() => {
        alert(`${message}\nDein Endstand: ${score} Punkte!`);

        // UI zurücksetzen
        document.getElementById('game-screen').classList.add('hidden');
        document.getElementById('controls').classList.add('hidden');
        document.getElementById('start-screen').classList.remove('hidden');
    }, 50);
}