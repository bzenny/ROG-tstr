// Game state
let gameWorld = [];
let currentScreen = { x: 4, y: 4 }; // Start in the middle of the 9x9 world
let playerPos = { x: 10, y: 10 };
let playerStats = { hp: 100, vp: 3, level: 1, xp: 0 };
let inventory = {
    use: {},
    eq: {},
    spec: {}
};
let equippedItems = {
    weapon: null,
    armor: null,
    accessory: null
};

const ITEMS = {
    use: {
        dOrb: { name: "D-Orb", effect: () => gainXP(20), rarity: 0.05 },
        redVile: { name: "Red Vile", effect: () => { playerStats.hp = Math.min(playerStats.hp + 10, 100); }, rarity: 0.4 },
        bgRdVile: { name: "BgRdVile", effect: () => { playerStats.hp = Math.min(playerStats.hp + 20, 100); }, rarity: 0.1 },
        blueVile: { name: "Blue Vile", effect: () => { playerStats.vp += 3; }, rarity: 0.4 },
        bgBluVile: { name: "BgBluVile", effect: () => { playerStats.vp += 7; }, rarity: 0.05 }
    },
    eq: {
        rapier: { name: "Rapier", effect: "Attack +5", type: "weapon", rarity: 0.2 },
        brdSward: { name: "Brd Sward", effect: "Attack +10", type: "weapon", rarity: 0.1 },
        mace: { name: "Mace", effect: "Attack +7", type: "weapon", rarity: 0.15 },
        dCloak: { name: "D-Cloak", effect: "Defense +5", type: "armor", rarity: 0.1 },
        fancyBoots: { name: "Fancy Boots", effect: "Speed +3", type: "armor", rarity: 0.15 },
        charm: { name: "Charm", effect: "Luck +2", type: "accessory", rarity: 0.1 }
    },
    spec: {
        redCrown: { name: "Red Crown", effect: "Opens specific doors", rarity: 0.05 },
        makersKey: { name: "Makers Key", effect: "Unlocks certain chests", rarity: 0.05 }
    }
};

// Initialize game
function initGame() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    gameWorld = createWorld();
    updateMap();
    updateStats();
    updateInventory();
}

// Update game map display
function updateMap() {
    const mapElement = document.getElementById('game-map');
    mapElement.innerHTML = '';

    const screen = gameWorld[currentScreen.y][currentScreen.x];

    for (let y = 0; y < SCREEN_SIZE; y++) {
        for (let x = 0; x < SCREEN_SIZE; x++) {
            const tile = document.createElement('div');
            tile.classList.add('w-[30px]', 'h-[30px]', 'flex', 'items-center', 'justify-center', 'font-bold', 'rounded');
            const terrainType = screen[y][x];
            tile.classList.add(TERRAIN_TYPES[terrainType].color);
            
            if (x === playerPos.x && y === playerPos.y) {
                tile.textContent = 'Æ';
                tile.classList.remove(TERRAIN_TYPES[terrainType].color);
                tile.classList.add('bg-red-500', 'text-white');
            } else {
                tile.textContent = TERRAIN_TYPES[terrainType].label;
            }

            mapElement.appendChild(tile);
        }
    }
}

// Update player stats display
function updateStats() {
    document.getElementById('player-hp').textContent = playerStats.hp;
    document.getElementById('player-vp').textContent = playerStats.vp;
    document.getElementById('player-level').textContent = playerStats.level;
    document.getElementById('player-xp').textContent = playerStats.xp;
    document.getElementById('current-screen').textContent = `(${currentScreen.x}, ${currentScreen.y})`;
    document.getElementById('current-region').textContent = getRegionName(currentScreen.x, currentScreen.y);
    
    // Display equipped items
    document.getElementById('equipped-weapon').textContent = equippedItems.weapon ? ITEMS.eq[equippedItems.weapon].name : "None";
    document.getElementById('equipped-armor').textContent = equippedItems.armor ? ITEMS.eq[equippedItems.armor].name : "None";
    document.getElementById('equipped-accessory').textContent = equippedItems.accessory ? ITEMS.eq[equippedItems.accessory].name : "None";
}

// Update inventory display
function updateInventory() {
    const useInventoryElement = document.getElementById('use-inventory');
    useInventoryElement.innerHTML = '';
    for (let itemKey in inventory.use) {
        const item = ITEMS.use[itemKey];
        const count = inventory.use[itemKey];
        if (count > 0) {
            const itemElement = document.createElement('div');
            itemElement.textContent = `${item.name} (x${count})`;
            itemElement.classList.add('cursor-pointer', 'hover:bg-gray-700', 'p-1');
            itemElement.onclick = () => useItem('use', itemKey);
            useInventoryElement.appendChild(itemElement);
        }
    }
}

// Update full inventory display
function updateFullInventory() {
    const fullInventoryElement = document.getElementById('full-inventory');
    fullInventoryElement.innerHTML = '';
    
    ['eq', 'spec'].forEach(category => {
        const categoryElement = document.createElement('div');
        categoryElement.innerHTML = `<h3 class="text-xl mt-2">${category.toUpperCase()}</h3>`;
        for (let itemKey in inventory[category]) {
            const item = ITEMS[category][itemKey];
            const count = inventory[category][itemKey];
            if (count > 0) {
                const itemElement = document.createElement('div');
                itemElement.textContent = `${item.name} (x${count})`;
                itemElement.classList.add('cursor-pointer', 'hover:bg-gray-700', 'p-1');
                itemElement.onclick = () => useItem(category, itemKey);
                categoryElement.appendChild(itemElement);
            }
        }
        fullInventoryElement.appendChild(categoryElement);
    });
}

// Move player
function movePlayer(direction) {
    let newPos = { ...playerPos };
    let newScreen = { ...currentScreen };

    switch (direction) {
        case 'up':
            newPos.y--;
            if (newPos.y < 0) {
                newScreen.y--;
                newPos.y = SCREEN_SIZE - 1;
            }
            break;
        case 'down':
            newPos.y++;
            if (newPos.y >= SCREEN_SIZE) {
                newScreen.y++;
                newPos.y = 0;
            }
            break;
        case 'left':
            newPos.x--;
            if (newPos.x < 0) {
                newScreen.x--;
                newPos.x = SCREEN_SIZE - 1;
            }
            break;
        case 'right':
            newPos.x++;
            if (newPos.x >= SCREEN_SIZE) {
                newScreen.x++;
                newPos.x = 0;
            }
            break;
    }

    // Check world boundaries
    if (newScreen.x < 0 || newScreen.x >= WORLD_SIZE || newScreen.y < 0 || newScreen.y >= WORLD_SIZE) {
        addToActionLog("You've reached the edge of the world!");
        return;
    }

    const newTerrain = gameWorld[newScreen.y][newScreen.x][newPos.y][newPos.x];

    // Check if the new position is impassable
    if (newTerrain === 'mountain' || newTerrain === 'tree' || newTerrain === 'sea' || newTerrain === 'desert' || newTerrain === 'plateau') {
        addToActionLog(`Can't move there, it's a ${newTerrain}!`);
        return;
    }

    // Update player position and current screen
    playerPos = newPos;
    if (currentScreen.x !== newScreen.x || currentScreen.y !== newScreen.y) {
        currentScreen = newScreen;
        addToActionLog(`Moved to a new screen in ${getRegionName(currentScreen.x, currentScreen.y)}`);
    } else {
        addToActionLog(`Moved ${direction}`);
    }

    // Check for water
    if (newTerrain === 'water') {
        addToActionLog("You are wet.");
    }

    // Check for item
    if (newTerrain === 'item') {
        collectItem();
    }

    updateMap();
    updateStats();
}

// Collect item
function collectItem() {
    const itemCategory = Math.random() < 0.7 ? 'use' : (Math.random() < 0.5 ? 'eq' : 'spec');
    let randomItemKey;
    
    if (itemCategory === 'use') {
        randomItemKey = getRandomItemKey(ITEMS.use);
    } else if (itemCategory === 'eq') {
        randomItemKey = getRandomEquipmentKey();
    } else {
        randomItemKey = getRandomItemKey(ITEMS.spec);
    }
    
    if (!inventory[itemCategory][randomItemKey]) {
        inventory[itemCategory][randomItemKey] = 0;
    }
    inventory[itemCategory][randomItemKey]++;

    const item = ITEMS[itemCategory][randomItemKey];
    addToActionLog(`You found a ${item.name}!`);
    gameWorld[currentScreen.y][currentScreen.x][playerPos.y][playerPos.x] = 'empty';
    updateInventory();
    if (itemCategory !== 'use') {
        updateFullInventory();
    }
}

// Get random item key based on rarity
function getRandomItemKey(itemCategory) {
    const roll = Math.random();
    let cumulativeProbability = 0;
    for (let itemKey in itemCategory) {
        cumulativeProbability += itemCategory[itemKey].rarity;
        if (roll <= cumulativeProbability) {
            return itemKey;
        }
    }
    return Object.keys(itemCategory)[0]; // Fallback to first item if something goes wrong
}

// Get random equipment key considering equipped items
function getRandomEquipmentKey() {
    const roll = Math.random();
    let cumulativeProbability = 0;
    let totalProbability = 0;

    // Calculate total probability excluding equipped items
    for (let itemKey in ITEMS.eq) {
        if (Object.values(equippedItems).includes(itemKey)) {
            totalProbability += ITEMS.eq[itemKey].rarity * 0.1; // Reduce probability for equipped items
        } else {
            totalProbability += ITEMS.eq[itemKey].rarity;
        }
    }

    for (let itemKey in ITEMS.eq) {
        let itemProbability = ITEMS.eq[itemKey].rarity;
        if (Object.values(equippedItems).includes(itemKey)) {
            itemProbability *= 0.1; // Reduce probability for equipped items
        }
        cumulativeProbability += itemProbability / totalProbability;
        if (roll <= cumulativeProbability) {
            return itemKey;
        }
    }
    return Object.keys(ITEMS.eq)[0]; // Fallback to first item if something goes wrong
}

// Use item
function useItem(category, itemKey) {
    if (inventory[category][itemKey] > 0) {
        const item = ITEMS[category][itemKey];
        if (category === 'use') {
            item.effect();
            inventory[category][itemKey]--;
            addToActionLog(`Used ${item.name}`);
            updateStats();
            updateInventory();
        } else if (category === 'eq') {
            equipItem(itemKey);
        } else {
            addToActionLog(`${item.name}: ${item.effect}`);
        }
    }
}

// Equip item
function equipItem(itemKey) {
    const item = ITEMS.eq[itemKey];
    const oldItem = equippedItems[item.type];
    equippedItems[item.type] = itemKey;
    addToActionLog(`Equipped ${item.name}`);
    if (oldItem) {
        addToActionLog(`Unequipped ${ITEMS.eq[oldItem].name}`);
    }
    updateStats();
    updateFullInventory();
}

// Gain XP
function gainXP(amount) {
    playerStats.xp += amount;
    if (playerStats.xp >= 100) {
        playerStats.level++;
        playerStats.xp -= 100;
        addToActionLog(`Level up! You are now level ${playerStats.level}`);
    }
    updateStats();
}

// Add message to action log
function addToActionLog(message) {
    const actionLog = document.getElementById('action-log');
    const logEntry = document.createElement('div');
    logEntry.textContent = message;
    actionLog.prepend(logEntry);
    if (actionLog.children.length > 5) {
        actionLog.removeChild(actionLog.lastChild);
    }
}

// Toggle full inventory
function toggleFullInventory() {
    const fullInventoryScreen = document.getElementById('full-inventory-screen');
    if (fullInventoryScreen.classList.contains('hidden')) {
        updateFullInventory();
        fullInventoryScreen.classList.remove('hidden');
    } else {
        fullInventoryScreen.classList.add('hidden');
    }
}

// Event listeners
document.getElementById('start-button').addEventListener('click', initGame);
document.querySelectorAll('.game-button').forEach(button => {
    button.addEventListener('click', (e) => movePlayer(e.target.dataset.direction));
});
document.getElementById('inv-button').addEventListener('click', toggleFullInventory);

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (document.getElementById('game-screen').classList.contains('hidden')) return;
    switch (e.key) {
        case 'ArrowUp': case 'w': movePlayer('up'); break;
        case 'ArrowDown': case 's': movePlayer('down'); break;
        case 'ArrowLeft': case 'a': movePlayer('left'); break;
        case 'ArrowRight': case 'd': movePlayer('right'); break;
        case 'i': toggleFullInventory(); break;
    }
});