// Тестовый Rust файл для проверки Garden Eye

use std::collections::HashMap;

pub struct Player {
    name: String,
    health: u32,
    inventory: Vec<Item>,
}

pub struct Item {
    id: u32,
    name: String,
}

impl Player {
    pub fn new(name: &str) -> Self {
        Player {
            name: name.to_string(),
            health: 100,
            inventory: Vec::new(),
        }
    }

    pub fn take_damage(&mut self, amount: u32) {
        if amount >= self.health {
            self.health = 0;
        } else {
            self.health -= amount;
        }
    }

    pub fn heal(&mut self, amount: u32) {
        self.health = (self.health + amount).min(100);
    }

    pub fn add_item(&mut self, item: Item) {
        self.inventory.push(item);
    }
}

pub trait Attackable {
    fn attack(&self, target: &mut Player);
    fn get_damage(&self) -> u32;
}

pub enum EnemyType {
    Goblin,
    Dragon,
    Skeleton,
}

pub struct Enemy {
    enemy_type: EnemyType,
    damage: u32,
}

impl Attackable for Enemy {
    fn attack(&self, target: &mut Player) {
        target.take_damage(self.damage);
    }

    fn get_damage(&self) -> u32 {
        self.damage
    }
}

fn main() {
    let mut player = Player::new("Lily");
    let enemy = Enemy {
        enemy_type: EnemyType::Goblin,
        damage: 10,
    };
    
    enemy.attack(&mut player);
    println!("Player health: {}", player.health);
}
