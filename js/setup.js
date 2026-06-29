function loadSidebarStyles() {
    const stylesheetHref = `/css/setup.css`;
    const existingStylesheet = document.querySelector(`link[rel="stylesheet"][href="${stylesheetHref}"]`);

    if (existingStylesheet) {
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        const linkElement = document.createElement('link');
        linkElement.rel = 'stylesheet';
        linkElement.href = stylesheetHref;
        linkElement.onload = () => resolve();
        document.head.appendChild(linkElement);
    });
}

function generateSidebar() {
    const navItems = [
        { emoji: '🏠', text: 'Startseite', href: '/index.html' },
        { emoji: '👥', text: 'Mitglieder', href: '/mitglieder/mitglieder.html' },
        { emoji: '🏫', text: 'Lehrer', href: '/lehrer.html' },
        { emoji: '🎮', text: 'Games', href: '/games.html' },
        { emoji: '🔢', text: 'Random Stuff', href: '/random-stuff.html' }
    ];

    const sidebarHTML = `
        <nav class="sidebar">
            <div class="sidebar-header">
                <a href="/index.html" class="sidebar-link">
                    <img class="sidebar-logo" alt="Logo" src="/img/Logo.png">
                    <span class="sidebar-span">Menü</span>
                </a>
            </div>
            <ul class="nav-links">
                ${navItems.map(item => 
                    `<li><a href="${item.href}">${item.emoji} ${item.text}</a></li>`
                ).join('')}
            </ul>
        </nav>

        <div class="menu-toggle" onclick="document.body.classList.toggle('sidebar-open')">
            ☰
        </div>
    `;

    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
}

function generateFooter() {
    const footerHTML = `
        <footer>
            <ul>
                <li><a href="/index.html">&copy; 2026 Team Wurstwasser</a></li>
                <li><a href="/impressum.html">Impressum</a></li>
            </ul>
        </footer>
    `;
    
    document.body.insertAdjacentHTML('beforeend', footerHTML);
}

loadSidebarStyles().then(() => {
    generateSidebar();
    generateFooter();
});