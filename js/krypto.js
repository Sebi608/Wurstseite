async function fetchCrypto() {
    const listEl = document.getElementById('cryptoList');
    const errorEl = document.getElementById('cryptoError');

    try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&order=market_cap_desc&per_page=50&page=1&sparkline=false');

        if (!response.ok) throw new Error('API Fehler');

        const data = await response.json();

        listEl.innerHTML = '';
        data.forEach((coin, index) => {
            const change = coin.price_change_percentage_24h || 0;
            renderRow(listEl, index + 1, coin.name, coin.symbol, coin.current_price, change, coin.image);
        });
    } catch (err) {
        errorEl.textContent = 'Fehler beim Laden der Kryptokurse.';
    }
}

function renderRow(container, rank, name, symbol, price, change, icon) {
    const isPositive = change >= 0;
    const changeClass = isPositive ? 'positive' : 'negative';
    const changeSign = isPositive ? '+' : '';

    const formattedPrice = price.toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: price < 1 ? 4 : 2
    }) + ' €';

    const item = document.createElement('div');
    item.className = 'market-row';
    item.innerHTML = `
                <div class="item-info">
                    <span class="rank">#${rank}</span>
                    <img src="${icon}" alt="${name}" class="item-icon">
                    <div>
                        <span class="item-name">${name}</span>
                        <span class="item-symbol">${symbol}</span>
                    </div>
                </div>
                <div class="item-price">
                    <div>${formattedPrice}</div>
                    <span class="item-change ${changeClass}">${changeSign}${change.toFixed(2)}%</span>
                </div>
            `;

    container.appendChild(item);
}

fetchCrypto();

setInterval(() => {
    fetchCrypto();
}, 60000);