const API_BASE = "https://meme-api.com/gimme";

const subredditSelect = document.getElementById("subredditSelect");
const customInput = document.getElementById("customInput");
const memeTitle = document.getElementById("memeTitle");
const memeImg = document.getElementById("memeImg");
const subredditBadge = document.getElementById("subredditBadge");
const author = document.getElementById("author");
const upvotesCount = document.getElementById("upvotesCount");
const redditLink = document.getElementById("redditLink");
const spinner = document.getElementById("spinner");
const fetchBtn = document.getElementById("fetchBtn");

function handleSelectChange() {
    if (subredditSelect.value === "custom") {
        customInput.style.display = "block";
        customInput.focus();
    } else {
        customInput.style.display = "none";
    }
}

async function fetchMeme() {
    let endpoint = API_BASE;

    let selectedSub = subredditSelect.value;
    if (selectedSub === "custom") {
        selectedSub = customInput.value.trim().replace(/^r\//, '');
    }

    if (selectedSub) {
        endpoint += `/${selectedSub}`;
    }

    spinner.style.display = "block";
    memeImg.style.display = "none";
    fetchBtn.disabled = true;
    fetchBtn.style.opacity = "0.6";
    memeTitle.innerText = "Lade frisches Meme...";

    try {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error("Meme konnte nicht geladen werden.");
        const data = await response.json();

        memeTitle.innerText = data.title || "Unbenanntes Meme";
        subredditBadge.innerText = `r/${data.subreddit}`;
        subredditBadge.href = `https://reddit.com/r/${data.subreddit}`;
        author.innerText = `u/${data.author || 'unknown'}`;
        upvotesCount.innerText = data.ups ? data.ups.toLocaleString() : '0';
        redditLink.href = data.postLink || `https://reddit.com/r/${data.subreddit}`;

        memeImg.src = data.url;
    } catch (error) {
        console.error(error);
        spinner.style.display = "none";
        memeTitle.innerText = "⚠️ Meme konnte nicht geladen werden.";
        fetchBtn.disabled = false;
        fetchBtn.style.opacity = "1";
    }
}

function onImageLoaded() {
    spinner.style.display = "none";
    memeImg.style.display = "block";
    fetchBtn.disabled = false;
    fetchBtn.style.opacity = "1";
}

function onImageError() {
    spinner.style.display = "none";
    memeTitle.innerText = "⚠️ Bild konnte nicht geladen werden.";
    fetchBtn.disabled = false;
    fetchBtn.style.opacity = "1";
}

document.addEventListener("keydown", (e) => {
    if (document.activeElement === customInput) return;
    if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        fetchMeme();
    }
});

fetchMeme();