import os

# Map definition (9 screens, each 20x20)
full_map = [
    ['#' * 60 for _ in range(20)],  # Top row of screens
    ['#' * 60 for _ in range(20)],  # Middle row of screens
    ['#' * 60 for _ in range(20)]   # Bottom row of screens
]

# Fill the center screen with some features
for i in range(5, 15):
    full_map[1][i] = full_map[1][i][:20] + '.' * 20 + full_map[1][i][40:]

# Player starting position (center of the middle screen)
player_pos = [30, 30]

# Player inventory
inventory = ["Wooden Sword", "Cryptic Instructions"]

def draw_screen():
    os.system('cls' if os.name == 'nt' else 'clear')
    print("You do not know how or where you are, but you can feel great purpose in your heart.")
    print("Go, Adventurer, and find the secrets of this doomed place.")
    print("\nUse WASD or arrow keys to move. Press 'i' for inventory, 'h' for help.")
    print("\n" + "=" * 22)
    
    for y in range(player_pos[1] - 10, player_pos[1] + 10):
        row = ""
        for x in range(player_pos[0] - 10, player_pos[0] + 10):
            if [x, y] == player_pos:
                row += "@"
            else:
                row += full_map[y // 20][y % 20][x]
        print(row)
    
    print("=" * 22)

def show_inventory():
    print("\nInventory:")
    for item in inventory:
        print(f"- {item}")
    input("\nPress Enter to continue...")

def show_help():
    print("\nHelp:")
    print("WASD or Arrow Keys: Move")
    print("i: Show Inventory")
    print("h: Show Help")
    print("q: Quit Game")
    input("\nPress Enter to continue...")

def main():
    global player_pos
    draw_screen()
    
    while True:
        action = input("Enter action: ").lower()
        
        if action in ['w', 'a', 's', 'd', '\x1b[A', '\x1b[D', '\x1b[B', '\x1b[C']:
            dx, dy = {'w': (0, -1), 'a': (-1, 0), 's': (0, 1), 'd': (1, 0),
                      '\x1b[A': (0, -1), '\x1b[D': (-1, 0), '\x1b[B': (0, 1), '\x1b[C': (1, 0)}[action]
            new_pos = [player_pos[0] + dx, player_pos[1] + dy]
            if full_map[new_pos[1] // 20][new_pos[1] % 20][new_pos[0]] != '#':
                player_pos = new_pos
            draw_screen()
        elif action == 'i':
            show_inventory()
            draw_screen()
        elif action == 'h':
            show_help()
            draw_screen()
        elif action == 'q':
            print("Thanks for playing!")
            break
        else:
            print("Invalid action. Press 'h' for help.")

if __name__ == "__main__":
    main()  
