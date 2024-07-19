// Constants
const SCREEN_SIZE = 20;
const WORLD_SIZE = 9;
const TERRAIN_TYPES = {
    empty: { color: 'bg-gray-700', label: '' },
    tree: { color: 'bg-green-700', label: 'T' },
    mountain: { color: 'bg-gray-500', label: 'M' },
    water: { color: 'bg-blue-500', label: 'W' },
    desert: { color: 'bg-yellow-600', label: 'D' },
    plateau: { color: 'bg-orange-700', label: 'P' },
    sea: { color: 'bg-blue-700', label: 'S' },
    item: { color: 'bg-gray-700', label: '.' }
};

const REGIONS = [
    ['Nortland', 'Vena Cava Mtns', 'High Serpent Rvr'],
    ['Centrium Coast', 'Centrium Square', 'Easterlan'],
    ['Ashteyn', 'Share Farms', 'Southestra']
];

// Create initial game world
function createWorld() {
    const gameWorld = [];
    for (let worldY = 0; worldY < WORLD_SIZE; worldY++) {
        gameWorld[worldY] = [];
        for (let worldX = 0; worldX < WORLD_SIZE; worldX++) {
            gameWorld[worldY][worldX] = createScreen(worldX, worldY);
        }
    }
    return gameWorld;
}

// Create a single screen
function createScreen(worldX, worldY) {
    const screen = [];
    for (let y = 0; y < SCREEN_SIZE; y++) {
        screen[y] = [];
        for (let x = 0; x < SCREEN_SIZE; x++) {
            if (worldY === 0 && y < 3) {
                screen[y][x] = 'mountain'; // North border
            } else if (worldY === WORLD_SIZE - 1 && y >= SCREEN_SIZE - 3) {
                screen[y][x] = 'plateau'; // South border
            } else if (worldX === 0 && x < 3) {
                screen[y][x] = 'sea'; // West border
            } else if (worldX === WORLD_SIZE - 1 && x >= SCREEN_SIZE - 3) {
                screen[y][x] = 'desert'; // East border
            } else {
                screen[y][x] = generateTerrain(worldX, worldY);
            }
        }
    }
    
    addItemsToScreen(screen);
    return screen;
}

// Generate terrain based on region
function generateTerrain(worldX, worldY) {
    const region = REGIONS[Math.floor(worldY / 3)][Math.floor(worldX / 3)];
    const random = Math.random();
    
    switch (region) {
        case 'Nortland':
        case 'Vena Cava Mtns':
            return random < 0.3 ? 'mountain' : (random < 0.6 ? 'tree' : 'empty');
        case 'High Serpent Rvr':
        case 'Centrium Coast':
            return random < 0.3 ? 'water' : (random < 0.6 ? 'tree' : 'empty');
        case 'Centrium Square':
            return random < 0.1 ? 'tree' : 'empty';
        case 'Easterlan':
            return random < 0.2 ? 'desert' : (random < 0.5 ? 'tree' : 'empty');
        case 'Ashteyn':
        case 'Share Farms':
            return random < 0.4 ? 'tree' : 'empty';
        case 'Southestra':
            return random < 0.3 ? 'plateau' : (random < 0.6 ? 'tree' : 'empty');
        default:
            return 'empty';
    }
}

// Add items to the screen
function addItemsToScreen(screen) {
    const itemCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 items per screen
    for (let i = 0; i < itemCount; i++) {
        let x, y;
        do {
            x = Math.floor(Math.random() * SCREEN_SIZE);
            y = Math.floor(Math.random() * SCREEN_SIZE);
        } while (screen[y][x] !== 'empty');
        screen[y][x] = 'item';
    }
}

// Get region name
function getRegionName(x, y) {
    return REGIONS[Math.floor(y / 3)][Math.floor(x / 3)];
}

// Export functions and constants
window.createWorld = createWorld;
window.getRegionName = getRegionName;
window.SCREEN_SIZE = SCREEN_SIZE;
window.WORLD_SIZE = WORLD_SIZE;
window.TERRAIN_TYPES = TERRAIN_TYPES;
