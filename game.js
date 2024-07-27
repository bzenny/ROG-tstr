// game-map.js
class GameMap {
    constructor() {
        this.screenWidth = 20;
        this.screenHeight = 20;
        this.worldWidth = 9;
        this.worldHeight = 9;
        this.currentScreen = { x: 4, y: 4 }; // Start in Centrium Square
        this.tiles = [];
        this.regions = [
            ['Nortland', 'Vena Cava Mnts', 'High Serpent Rvr'],
            ['Centrium Coast', 'Centrium Square', 'Easterlan'],
            ['Ahteyn', 'Share Farms', 'Southestra']
        ];
        this.terrainTypes = {
            '.': { name: 'Empty', passable: true },
            '~': { name: 'Water', passable: true, message: 'You are wet!' },
            'r': { name: 'River', passable: false, message: 'You need a boat to cross the river.' },
            'S': { name: 'Sea', passable: false, message: 'The sea is too vast to cross.' },
            '^': { name: 'Mountain', passable: false, message: 'The mountain is too steep to climb.' },
            'o': { name: 'Boulder', passable: false, message: 'The boulder blocks your path.' },
            'd': { name: 'Desert', passable: true, message: 'The desert sand is hot and dry.' },
            'T': { name: 'Tree', passable: false, message: 'The dense forest blocks your way.' },
            'R': { name: 'Ruins', passable: true, message: 'Ancient ruins surround you.' },
        };
        this.enemies = [];
    }

    generate() {
        for (let y = 0; y < this.worldHeight; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < this.worldWidth; x++) {
                this.tiles[y][x] = this.generateScreen(x, y);
            }
        }
        this.addRivers();
        this.addBridges();
    }

    generateScreen(worldX, worldY) {
        let screen = [];
        for (let y = 0; y < this.screenHeight; y++) {
            screen[y] = [];
            for (let x = 0; x < this.screenWidth; x++) {
                screen[y][x] = '.';
            }
        }
        this.addRegionalFeatures(screen, worldX, worldY);
        return screen;
    }

    addRegionalFeatures(screen, worldX, worldY) {
        const region = this.getRegion(worldX, worldY);
        const features = {
            'Nortland': ['T', '^', 'o'],
            'Vena Cava Mnts': ['^', 'o', 'R'],
            'High Serpent Rvr': ['r', '~', 'T'],
            'Centrium Coast': ['S', '~', 'T'],
            'Centrium Square': ['R', '.', 'T'],
            'Easterlan': ['T', 'R', '~'],
            'Ahteyn': ['R', 'd', 'o'],
            'Share Farms': ['T', '.', '~'],
            'Southestra': ['d', 'T', 'R']
        };
        const regionFeatures = features[region] || ['.', 'T', '~'];
        for (let i = 0; i < Math.floor(this.screenWidth * this.screenHeight * 0.2); i++) {
            const x = Math.floor(Math.random() * this.screenWidth);
            const y = Math.floor(Math.random() * this.screenHeight);
            screen[y][x] = regionFeatures[Math.floor(Math.random() * regionFeatures.length)];
        }
    }

    addRivers() {
        // Add horizontal river
        for (let x = 0; x < this.worldWidth; x++) {
            this.fillScreenBorder(this.tiles[1][x], 'bottom', 'r');
            this.fillScreenBorder(this.tiles[2][x], 'top', 'r');
        }
        // Add vertical river
        for (let y = 0; y < this.worldHeight; y++) {
            this.fillScreenBorder(this.tiles[y][2], 'right', 'r');
            this.fillScreenBorder(this.tiles[y][3], 'left', 'r');
        }
    }

    addBridges() {
        // Add bridge to Easterlan (blocked initially)
        this.tiles[1][4][this.screenHeight - 1][Math.floor(this.screenWidth / 2)] = '=';
        // Add portway to Nortland (blocked initially)
        this.tiles[3][4][0][Math.floor(this.screenWidth / 2)] = 'P';
    }

    fillScreenBorder(screen, side, tile) {
        switch(side) {
            case 'top':
                for (let x = 0; x < this.screenWidth; x++) screen[0][x] = tile;
                break;
            case 'bottom':
                for (let x = 0; x < this.screenWidth; x++) screen[this.screenHeight - 1][x] = tile;
                break;
            case 'left':
                for (let y = 0; y < this.screenHeight; y++) screen[y][0] = tile;
                break;
            case 'right':
                for (let y = 0; y < this.screenHeight; y++) screen[y][this.screenWidth - 1] = tile;
                break;
        }
    }

    getRegion(x, y) {
        return this.regions[Math.floor(y / 3)][Math.floor(x / 3)];
    }

    getTile(x, y) {
        return this.tiles[this.currentScreen.y][this.currentScreen.x][y][x];
    }

    isPassable(x, y) {
        const tile = this.getTile(x, y);
        return this.terrainTypes[tile].passable;
    }

    getTerrainMessage(x, y) {
        const tile = this.getTile(x, y);
        return this.terrainTypes[tile].message;
    }

    spawnEnemies() {
        const numEnemies = 3; // Adjust as needed
        for (let i = 0; i < numEnemies; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * this.screenWidth);
                y = Math.floor(Math.random() * this.screenHeight);
            } while (!this.isPassable(x, y));
            this.enemies.push({
                x: x,
                y: y,
                type: 'basic',
                symbol: 'E',
                hp: 20
            });
        }
    }

    updateEnemies() {
        for (let enemy of this.enemies) {
            // Basic AI: move randomly
            const dx = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
            const dy = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
            if (this.isPassable(enemy.x + dx, enemy.y + dy)) {
                enemy.x += dx;
                enemy.y += dy;
            }
        }
    }

    getEnemyAt(x, y) {
        return this.enemies.find(enemy => enemy.x === x && enemy.y === y);
    }

    removeEnemy(enemy) {
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
        }
    }
}

// game.js

const gameState = {
    player: {
        x: 10,
        y: 10,
        symbol: 'Æ',
        hp: 100,
        vp: 3,
        level: 1,
        abilities: {
            bloodlust: {
                name: "Bloodlust",
                vpCostPercentage: 75,
                availableThisScreen: true
            }
        }
    },
    gameMap: new GameMap(),
    currentScreen: { x: 4, y: 4 }, // Start in Centrium Square
    gameMode: 'exterminator',
    quests: [],
    completedQuests: []
};

function initGame() {
    showStartScreen();
    setupEventListeners();
}

function showStartScreen() {
    document.getElementById('start-screen').classList.remove('hidden');
    document.getElementById('game-container').classList.add('hidden');
}

function hideStartScreen() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
}

function showGameOverScreen() {
    document.getElementById('game-over-screen').classList.remove('hidden');
    document.getElementById('game-container').classList.add('hidden');
}

function startGame() {
    hideStartScreen();
    gameState.gameMap.generate();
    gameState.gameMap.spawnEnemies();
    addQuest(exampleQuest);
    renderMap();
    updatePlayerStats();
    updateQuestLog();
}

function setupEventListeners() {
    document.getElementById('choose-ae').addEventListener('click', () => {
        gameState.player.symbol = 'Æ';
        document.getElementById('choose-ae').classList.add('selected');
        document.getElementById('choose-eth').classList.remove('selected');
    });
    document.getElementById('choose-eth').addEventListener('click', () => {
        gameState.player.symbol = 'Ð';
        document.getElementById('choose-eth').classList.add('selected');
        document.getElementById('choose-ae').classList.remove('selected');
    });
    document.getElementById('exterminator-mode').addEventListener('click', () => {
        gameState.gameMode = 'exterminator';
        document.getElementById('exterminator-mode').classList.add('selected');
        document.getElementById('wanderer-mode').classList.remove('selected');
    });
    document.getElementById('wanderer-mode').addEventListener('click', () => {
        gameState.gameMode = 'wanderer';
        document.getElementById('wanderer-mode').classList.add('selected');
        document.getElementById('exterminator-mode').classList.remove('selected');
    });
    document.getElementById('start-game').addEventListener('click', startGame);
    document.getElementById('restart-game').addEventListener('click', restartGame);
    document.getElementById('controls').addEventListener('click', handleControlClick);
    document.addEventListener('keydown', handleKeyPress);
    document.getElementById('bloodlust-btn').addEventListener('click', () => useAbility('bloodlust'));
}

function handleControlClick(e) {
    if (e.target.tagName === 'BUTTON') {
        const direction = e.target.textContent;
        switch (direction) {
            case '↖': movePlayer(-1, -1); break;
            case '↑': movePlayer(0, -1); break;
            case '↗': movePlayer(1, -1); break;
            case '←': movePlayer(-1, 0); break;
            case '→': movePlayer(1, 0); break;
            case '↙': movePlayer(-1, 1); break;
            case '↓': movePlayer(0, 1); break;
            case '↘': movePlayer(1, 1); break;
            case 'Æ': searchArea(); break;
        }
    }
}

function handleKeyPress(e) {
    switch (e.key) {
        case 'ArrowUp': movePlayer(0, -1); break;
        case 'ArrowDown': movePlayer(0, 1); break;
        case 'ArrowLeft': movePlayer(-1, 0); break;
        case 'ArrowRight': movePlayer(1, 0); break;
        case ' ': searchArea(); break;
    }
}

function restartGame() {
    gameState.player.hp = 100;
    gameState.player.vp = 3;
    gameState.player.x = 10;
    gameState.player.y = 10;
    gameState.currentScreen = { x: 4, y: 4 };
    gameState.quests = [];
    gameState.completedQuests = [];
    document.getElementById('game-over-screen').classList.add('hidden');
    startGame();
}

function checkGameOver() {
    if (gameState.player.hp <= 0) {
        showGameOverScreen();
    }
}

function movePlayer(dx, dy) {
    const newX = gameState.player.x + dx;
    const newY = gameState.player.y + dy;

    if (gameState.gameMap.isPassable(newX, newY)) {
        const enemy = gameState.gameMap.getEnemyAt(newX, newY);
        if (enemy) {
            attackEnemy(enemy);
        } else {
            gameState.player.x = newX;
            gameState.player.y = newY;
            const message = gameState.gameMap.getTerrainMessage(newX, newY);
            if (message) {
                updateActionLog(message);
            }
            if (gameState.gameMode === 'exterminator') {
                gameState.player.hp -= 2;
            } else {
                gameState.player.hp -= 1;
            }
            gameState.gameMap.updateEnemies();
            checkGameOver();
            updatePlayerStats();
            renderMap();
        }

        // Check if player is moving to a new screen
        if (newX < 0 || newX >= gameState.gameMap.screenWidth || newY < 0 || newY >= gameState.gameMap.screenHeight) {
            // Screen transition logic will go here
            resetAbilityAvailability();
        }
    } else {
        const message = gameState.gameMap.getTerrainMessage(newX, newY);
        updateActionLog(message || "You can't move there!");
    }
}

function attackEnemy(enemy) {
    const damage = Math.floor(Math.random() * 5) + 1;
    enemy.hp -= damage;
    updateActionLog(`You attack the enemy for ${damage} damage!`);
    if (enemy.hp <= 0) {
        gameState.gameMap.removeEnemy(enemy);
        updateActionLog("You defeated the enemy!");
        for (let quest of gameState.quests) {
            quest.updateProgress('defeatEnemy');
        }
    } else {
        const enemyDamage = Math.floor(Math.random() * 3) + 1;
        gameState.player.hp -= enemyDamage;
        updateActionLog(`The enemy attacks you for ${enemyDamage} damage!`);
    }
    updatePlayerStats();
    checkGameOver();
}

function searchArea() {
    updateActionLog('Searched the area. Nothing found.');
}

function renderMap() {
    const mapElement = document.getElementById('game-map');
    mapElement.innerHTML = '';
    const currentScreen = gameState.gameMap.tiles[gameState.currentScreen.y][gameState.currentScreen.x];
    for (let y = 0; y < gameState.gameMap.screenHeight; y++) {
        for (let x = 0; x < gameState.gameMap.screenWidth; x++) {
            const tile = document.createElement('div');
            tile.classList.add('game-tile');
            if (x === gameState.player.x && y === gameState.player.y) {
                tile.classList.add('player-tile');
                tile.textContent = gameState.player.symbol;
            } else {
                const enemy = gameState.gameMap.getEnemyAt(x, y);
                if (enemy) {
                    tile.classList.add('enemy-tile');
                    tile.textContent = enemy.symbol;
                } else {
                    const terrainType = currentScreen[y][x];
                    tile.classList.add(`${gameState.gameMap.terrainTypes[terrainType].name.toLowerCase()}-tile`);
                    tile.textContent = terrainType;
                }
            }
            mapElement.appendChild(tile);
        }
    }
}

function updatePlayerStats() {
    document.getElementById('player-hp').textContent = gameState.player.hp;
    document.getElementById('player-vp').textContent = gameState.player.vp;
    document.getElementById('player-level').textContent = gameState.player.level;
    
    const bloodlustBtn = document.getElementById('bloodlust-btn');
    if (gameState.player.abilities.bloodlust.availableThisScreen) {
        bloodlustBtn.disabled = false;
        bloodlustBtn.textContent = "Bloodlust";
    } else {
        bloodlustBtn.disabled = true;
        bloodlustBtn.textContent = "Bloodlust (Used)";
    }
}

function updateActionLog(message) {
    const logEntries = document.getElementById('log-entries');
    const entry = document.createElement('p');
    entry.textContent = message;
    logEntries.prepend(entry);
    if (logEntries.children.length > 5) {
        logEntries.removeChild(logEntries.lastChild);
    }
}

function useAbility(abilityName) {
    switch(abilityName) {
        case 'bloodlust':
            bloodlust();
            break;
    }
    updatePlayerStats();
}

function bloodlust() {
    if (!gameState.player.abilities.bloodlust.availableThisScreen) {
        updateActionLog("Bloodlust has already been used on this screen.");
        return;
    }

    const vpCost = Math.ceil(gameState.player.vp * (gameState.player.abilities.bloodlust.vpCostPercentage / 100));
    
    if (vpCost < 1) {
        updateActionLog("Not enough VP to use Bloodlust.");
        return;
    }

    gameState.player.vp -= vpCost;
    gameState.player.abilities.bloodlust.availableThisScreen = false;

    const enemies = gameState.gameMap.enemies;
    let killedEnemies = 0;
    
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.hp -= 12;
        if (enemy.hp <= 0) {
            gameState.gameMap.removeEnemy(enemy);
            killedEnemies++;
        }
    }
    
    updateActionLog(`Bloodlust activated! Dealt 12 damage to all enemies. Used ${vpCost} VP.`);
    
    if (killedEnemies > 0) {
        gameState.player.hp += 15;
        updateActionLog(`Bloodlust killed ${killedEnemies} enemies. You gained 15 HP!`);
    }
    
    updatePlayerStats();
    renderMap();
}

function resetAbilityAvailability() {
    gameState.player.abilities.bloodlust.availableThisScreen = true;
}

class Quest {
    constructor(id, title, description, objectives, rewards) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.objectives = objectives;
        this.rewards = rewards;
        this.completed = false;
    }

    updateProgress(action, amount = 1) {
        if (this.completed) return;
        
        let allCompleted = true;
        for (let objective of this.objectives) {
            if (objective.action === action) {
                objective.current += amount;
                if (objective.current >= objective.target) {
                    objective.current = objective.target;
                }
            }
            if (objective.current < objective.target) {
                allCompleted = false;
            }
        }
        
        if (allCompleted) {
            this.complete();
        }
    }

    complete() {
        this.completed = true;
        updateActionLog(`Quest completed: ${this.title}`);
        for (let reward of this.rewards) {
            reward.apply(gameState.player);
        }
        updateQuestLog();
        updatePlayerStats();
    }
}

function addQuest(quest) {
    gameState.quests.push(quest);
    updateQuestLog();
    updateActionLog(`New quest added: ${quest.title}`);
}

function updateQuestLog() {
    const questLog = document.getElementById('quest-list');
    questLog.innerHTML = '';
    for (let quest of gameState.quests) {
        const questElement = document.createElement('div');
        questElement.className = 'quest-item';
        questElement.innerHTML = `
            <h3>${quest.title}</h3>
            <p>${quest.description}</p>
            <ul>
                ${quest.objectives.map(obj => `<li>${obj.description}: ${obj.current}/${obj.target}</li>`).join('')}
            </ul>
        `;
        questLog.appendChild(questElement);
    }
}

const exampleQuest = new Quest(
    'quest1',
    'Exterminator Initiation',
    'Prove your worth as an exterminator by defeating enemies.',
    [
        { action: 'defeatEnemy', target: 5, current: 0, description: 'Defeat enemies' }
    ],
    [
        { 
            apply: (player) => {
                player.vp += 2;
                updateActionLog('Reward: Gained 2 VP');
            }
        }
    ]
);

window.onload = initGame;
