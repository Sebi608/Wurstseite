const suits = ['♠', '♥', '♦', '♣'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

let deck = [];
let playerHand = [];
let dealerHand = [];
let balance = 1000;
let currentBet = 50;
let activeBet = 0;
let gameOver = true;

const balanceEl = document.getElementById('balance');
const betEl = document.getElementById('bet');
const dealerCardsEl = document.getElementById('dealer-cards');
const playerCardsEl = document.getElementById('player-cards');
const dealerScoreEl = document.getElementById('dealer-score');
const playerScoreEl = document.getElementById('player-score');
const statusEl = document.getElementById('status');

const btnStart = document.getElementById('btn-start');
const btnHit = document.getElementById('btn-hit');
const btnStand = document.getElementById('btn-stand');
const btnDouble = document.getElementById('btn-double');
const btnPlus = document.getElementById('btn-plus');
const btnMinus = document.getElementById('btn-minus');

function adjustBet(amount) {
    if (!gameOver) return;

    const newBet = currentBet + amount;
    if (newBet >= 10 && (amount < 0 || newBet <= balance)) {
        currentBet = newBet;
        betEl.textContent = `${currentBet} $`;
    }
}

function createDeck() {
    deck = [];
    for (let suit of suits) {
        for (let val of values) {
            deck.push({ suit, val });
        }
    }
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function getCardValue(card) {
    if (['J', 'Q', 'K'].includes(card.val)) return 10;
    if (card.val === 'A') return 11;
    return parseInt(card.val);
}

function calculateScore(hand) {
    let score = 0;
    let aces = 0;

    for (let card of hand) {
        score += getCardValue(card);
        if (card.val === 'A') aces++;
    }

    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }

    return score;
}

function renderCard(card, isHidden = false) {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';

    if (isHidden) {
        cardEl.classList.add('hidden');
        return cardEl;
    }

    if (card.suit === '♥' || card.suit === '♦') {
        cardEl.classList.add('red');
    }

    cardEl.innerHTML = `
                <div>${card.val}${card.suit}</div>
                <div style="text-align: right;">${card.val}</div>
            `;
    return cardEl;
}

function updateUI(hideDealerCard = true) {
    playerCardsEl.innerHTML = '';
    playerHand.forEach(card => playerCardsEl.appendChild(renderCard(card)));
    playerScoreEl.textContent = calculateScore(playerHand);

    dealerCardsEl.innerHTML = '';
    dealerHand.forEach((card, index) => {
        if (index === 1 && hideDealerCard) {
            dealerCardsEl.appendChild(renderCard(card, true));
        } else {
            dealerCardsEl.appendChild(renderCard(card));
        }
    });

    if (hideDealerCard && dealerHand.length > 0) {
        dealerScoreEl.textContent = getCardValue(dealerHand[0]);
    } else {
        dealerScoreEl.textContent = calculateScore(dealerHand);
    }

    balanceEl.textContent = `${balance} $`;
}

function startGame() {
    if (balance < currentBet) {
        statusEl.textContent = "Nicht genug Guthaben!";
        return;
    }

    activeBet = currentBet;
    balance -= activeBet;
    gameOver = false;
    createDeck();

    playerHand = [deck.pop(), deck.pop()];
    dealerHand = [deck.pop(), deck.pop()];

    btnStart.disabled = true;
    btnPlus.disabled = true;
    btnMinus.disabled = true;

    btnHit.disabled = false;
    btnStand.disabled = false;
    btnDouble.disabled = balance < activeBet;

    statusEl.textContent = "Viel Erfolg!";
    updateUI(true);

    if (calculateScore(playerHand) === 21) {
        endGame("Blackjack! Du gewinnst 3:2!", 2.5);
    }
}

function hit() {
    if (gameOver) return;

    btnDouble.disabled = true;

    playerHand.push(deck.pop());
    updateUI(true);

    if (calculateScore(playerHand) > 21) {
        endGame("Überkauft! (Bust) - Verloren.", 0);
    }
}

function doubleDown() {
    if (gameOver || balance < activeBet) return;

    balance -= activeBet;
    activeBet *= 2;

    playerHand.push(deck.pop());
    updateUI(true);

    if (calculateScore(playerHand) > 21) {
        endGame("Überkauft nach Double! Verloren.", 0);
    } else {
        stand();
    }
}

function stand() {
    if (gameOver) return;

    while (calculateScore(dealerHand) < 17) {
        dealerHand.push(deck.pop());
    }

    const playerScore = calculateScore(playerHand);
    const dealerScore = calculateScore(dealerHand);

    updateUI(false);

    if (dealerScore > 21) {
        endGame("Dealer überkauft! Du gewinnst!", 2);
    } else if (playerScore > dealerScore) {
        endGame("Du gewinnst!", 2);
    } else if (playerScore < dealerScore) {
        endGame("Dealer gewinnt!", 0);
    } else {
        endGame("Unentschieden (Push)!", 1);
    }
}

function endGame(message, payoutMultiplier) {
    gameOver = true;
    balance += activeBet * payoutMultiplier;
    statusEl.textContent = message;
    updateUI(false);

    btnStart.disabled = false;
    btnPlus.disabled = false;
    btnMinus.disabled = false;

    btnHit.disabled = true;
    btnStand.disabled = true;
    btnDouble.disabled = true;

    if (currentBet > balance && balance >= 10) {
        currentBet = balance;
        betEl.textContent = `${currentBet} $`;
    }
}