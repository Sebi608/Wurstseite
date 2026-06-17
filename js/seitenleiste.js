const pathname = window.location.pathname.replace(/\\/g, '/');
const basePath = pathname.includes('/person/') ? '../../' : pathname.includes('/random-stuff/') ? '../' : './';

function generateSidebar() {
    const navItems = [
        { emoji: '🏠', text: 'Startseite', href: 'index.html' },
        { emoji: '👥', text: 'Mitglieder', href: 'mitglieder.html' },
        { emoji: '🏫', text: 'Lehrer', href: 'lehrer.html' },
        { emoji: '🎮', text: 'Games', href: 'games.html' },
        { emoji: '🔢', text: 'Random Stuff', href: 'random-stuff.html' }
    ];

    const sidebarHTML = `
        <nav class="sidebar">
            <div class="sidebar-header">
                <a href="${basePath}index.html" class="sidebar-link">
                    <img class="sidebar-logo" src="${basePath}img/Logo.png">
                    <span class="sidebar-span">Menü</span>
                </a>
            </div>
            <ul class="nav-links">
                ${navItems.map(item => 
                    `<li><a href="${basePath}${item.href}">${item.emoji} ${item.text}</a></li>`
                ).join('')}
            </ul>
        </nav>

        <div class="menu-toggle" onclick="document.body.classList.toggle('sidebar-open')">
            ☰
        </div>
    `;

    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
}

generateSidebar();