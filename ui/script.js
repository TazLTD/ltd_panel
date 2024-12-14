let lastUpdateTime = 0;
let updateInterval = 30; // 30 seconds interval
let updateTimer = null;
let playersData = [];
let currentTheme = 'light'; // start with light by default

window.addEventListener('message', (event) => {
    const data = event.data;

    if (data.type === 'ui') {
        const container = document.getElementById('container');
        if (data.status === true) {
            container.style.display = "flex";
            applySavedTheme(); // apply saved theme if any
            startAutoUpdateTimer();
        } else {
            container.style.display = "none";
            stopAutoUpdateTimer();
        }
    } else if (data.type === 'updateLeaderboard') {
        playersData = data.players;
        updateLeaderboard(data.players, data.onlineCount, data.maxPlayers);
        lastUpdateTime = 0;
    } else if (data.type === 'updateServerInfo') {
        updateServerInfo(data.serverInfo);
    }
});

document.getElementById('closeBtn').addEventListener('click', () => {
    fetch(`https://${GetParentResourceName()}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({})
    });
});

document.getElementById('refreshBtn').addEventListener('click', () => {
    refreshLeaderboard();
});

document.getElementById('refreshInfoBtn').addEventListener('click', () => {
    refreshServerInfo();
});

document.getElementById('searchInput').addEventListener('input', filterLeaderboard);

const tabs = document.querySelectorAll('.tab');
const sections = {
    keybinds: document.getElementById('keybinds-section'),
    leaderboard: document.getElementById('leaderboard-section'),
    info: document.getElementById('info-section')
};

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Hide all sections
        Object.values(sections).forEach(sec => sec.style.display = 'none');

        // Show the correct section
        const target = tab.getAttribute('data-tab');
        sections[target].style.display = 'block';
    });
});

const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', toggleTheme);

// Apply saved theme on load
function applySavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        setTheme('light'); // default
    }
}

function setTheme(theme) {
    const body = document.body;
    if (theme === 'dark') {
        body.classList.remove('light-theme');
        themeToggle.textContent = '🌑';
        currentTheme = 'dark';
    } else {
        body.classList.add('light-theme');
        themeToggle.textContent = '☀️';
        currentTheme = 'light';
    }
    localStorage.setItem('theme', currentTheme);
}

function toggleTheme() {
    if (currentTheme === 'light') {
        setTheme('dark');
    } else {
        setTheme('light');
    }
}

function updateLeaderboard(players, onlineCount, maxPlayers) {
    const tbody = document.getElementById('leaderboardBody');
    tbody.innerHTML = '';

    players.forEach(p => {
        const row = document.createElement('tr');
        const rankCell = document.createElement('td');
        const nameCell = document.createElement('td');

        rankCell.textContent = p.rank;
        nameCell.textContent = p.name;

        row.appendChild(rankCell);
        row.appendChild(nameCell);
        tbody.appendChild(row);
    });

    document.getElementById('playerCount').textContent = `Players: ${onlineCount}/${maxPlayers}`;
    filterLeaderboard(); // re-apply filter after update
}

function filterLeaderboard() {
    const searchValue = document.getElementById('searchInput').value.toLowerCase();
    const tbody = document.getElementById('leaderboardBody');
    const rows = tbody.getElementsByTagName('tr');
    for (let i = 0; i < rows.length; i++) {
        const nameCell = rows[i].getElementsByTagName('td')[1];
        if (nameCell) {
            const name = nameCell.textContent.toLowerCase();
            if (name.includes(searchValue)) {
                rows[i].style.display = '';
            } else {
                rows[i].style.display = 'none';
            }
        }
    }
}

function refreshLeaderboard() {
    fetch(`https://${GetParentResourceName()}/refreshLeaderboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({})
    });
}

function refreshServerInfo() {
    fetch(`https://${GetParentResourceName()}/refreshServerInfo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({})
    });
}

function startAutoUpdateTimer() {
    stopAutoUpdateTimer();
    updateTimer = setInterval(() => {
        lastUpdateTime++;
        document.getElementById('lastUpdated').textContent = `Last updated: ${lastUpdateTime}s ago`;
        if (lastUpdateTime >= updateInterval) {
            refreshLeaderboard();
            lastUpdateTime = 0;
        }
    }, 1000);
}

function stopAutoUpdateTimer() {
    if (updateTimer) {
        clearInterval(updateTimer);
        updateTimer = null;
    }
}

function updateServerInfo(info) {
    const container = document.getElementById('server-info');
    container.innerHTML = '';
    const title = document.createElement('h2');
    title.textContent = info.name;
    container.appendChild(title);

    const uptime = document.createElement('p');
    uptime.textContent = `Server Uptime: ${info.uptime}`;
    container.appendChild(uptime);

    const eventsHeading = document.createElement('h2');
    eventsHeading.textContent = 'Upcoming Events:';
    container.appendChild(eventsHeading);

    const ul = document.createElement('ul');
    info.events.forEach(e => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${e.title}</strong>: ${e.description}`;
        ul.appendChild(li);
    });
    container.appendChild(ul);
}
