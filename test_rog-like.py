import unittest
from roguelike import inventory, player_pos, full_map

class TestRoguelike(unittest.TestCase):
    def test_initial_inventory(self):
        self.assertEqual(inventory, ["Wooden Sword", "Cryptic Instructions"])

    def test_initial_player_position(self):
        self.assertEqual(player_pos, [30, 30])

    def test_map_size(self):
        self.assertEqual(len(full_map), 3)
        self.assertEqual(len(full_map[0]), 20)
        self.assertEqual(len(full_map[0][0]), 60)

if __name__ == '__main__':
    unittest.main()
