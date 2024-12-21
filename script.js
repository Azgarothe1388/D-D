document.addEventListener('DOMContentLoaded', () => {
    const creationForm = document.getElementById('creation-form');
    const characterCreation = document.getElementById('character-creation');
    const gameplay = document.getElementById('gameplay');
    const playerInfo = document.getElementById('player-info');
    const status = document.getElementById('status');
    const log = document.getElementById('log');
    const advanceButton = document.getElementById('advance');
    const attackButton = document.getElementById('attack');
    const fleeButton = document.getElementById('flee');
    const usePotionButton = document.getElementById('use-potion');
    const inventoryList = document.getElementById('inventory-list');
    const specialAttackButton = document.getElementById('useSpecialAttack');

    let player = {
        name: '',
        class: '',
        health: 100,
        experience: 0,
        level: 1,
        monstersDefeated: 0,
        inventory: [],
        specialAttack: null,
        attackDamage: 20 // Dégâts d'attaque normaux
    };

    let currentMonster = null;
    let totalMoves = 0; // Nombre total de cases avancées
    const bossRoomThreshold = 50; // Nombre de cases à avancer pour atteindre la salle du boss


    function logMessage(message) {
        log.innerHTML += `<p>${message}</p>`;
        log.scrollTop = log.scrollHeight;
    }

    function generateMonster() {
        const monsters = [
            { name: 'mort-vivant', health: 15, damage: 5 },
            { name: 'Gobelin', health: 30, damage: 10 },
            { name: 'Orc', health: 50, damage: 15 },
            { name: 'Dragon', health: 100, damage: 25 }
        ];
        return monsters[Math.floor(Math.random() * monsters.length)];
    }

    function generateBoss() {
        return { name: 'Boss Final', health: 150, damage: 30 }; // Monstre de boss
    }

    function generateLoot() {
        const lootTable = [
            { type: 'potion', effect: 'heal', value: 20, name: 'Potion de soin' },
            { type: 'potion', effect: 'xp', value: 35, name: 'Potion d\'expérience' },
            null
        ];
        return lootTable[Math.floor(Math.random() * lootTable.length)];
    }

    function setSpecialAttack() {
        if (player.class === 'guerrier') {
            player.specialAttack = {
                name: 'Coup Puissant',
                damage: 30
            };
        } else if (player.class === 'mage') {
            player.specialAttack = {
                name: 'Boule de Feu',
                damage: 40
            };
        } else if (player.class === 'archer') {
            player.specialAttack = {
                name: 'Tir Précis',
                damage: 25
            };
        }
    }

    function usePotion() {
        const potion = player.inventory.find(item => item.type === 'potion');
        if (potion) {
            if (potion.effect === 'heal') {
                player.health = Math.min(player.health + potion.value);
                logMessage(`Vous utilisez une ${potion.name} et récupérez ${potion.value} points de vie.`);
            } else if (potion.effect === 'xp') {
                player.experience += potion.value;
                logMessage(`Vous utilisez une ${potion.name} et gagnez ${potion.value} points d'expérience.`);
                checkLevelUp(); // Vérifier si le joueur passe un niveau
            }
            player.inventory = player.inventory.filter(item => item !== potion);
            updateUI();
        } else {
            logMessage('Aucune potion disponible dans votre inventaire.');
        }
    }

    function levelUp() {
        player.level++;
        player.health += 50; // Augmentation de la santé
        player.experience = 0; // Réinitialiser l'expérience après le passage de niveau
        logMessage(`Vous avez atteint le niveau ${player.level}! Santé augmentée de 50 points.`);
    }

    function checkLevelUp() {
        if (player.experience >= 100) {
            levelUp(); // Passer au niveau supérieur
        }
    }

    
    function openChest() {
        const loot = generateLoot();
        if (loot) {
            player.inventory.push(loot);
            logMessage(`Vous ouvrez un coffre et trouvez : ${loot.name}.`);
        } else {
            logMessage(`Le coffre est vide.`);
        }
    }

    function useAttack() {
        if (currentMonster) {
            currentMonster.health -= player.attackDamage; // Utiliser les dégâts d'attaque normaux
            logMessage(`Vous attaquez le ${currentMonster.name} et lui infligez ${player.attackDamage} points de dégâts. Il lui reste ${currentMonster.health} points de vie.`);
            
            if (currentMonster.health <= 0) {
                logMessage(`Vous avez vaincu le ${currentMonster.name}!`);
                currentMonster = null;
                player.experience += 25;
                player.monstersDefeated += 1;

                if (player.experience >= player.level * 20) {
                    levelUp();
                }

                const loot = generateLoot();
                if (loot) {
                    player.inventory.push(loot);
                    logMessage(`Le ${currentMonster.name} laisse tomber : ${loot.name}.`);
                }

                updateUI();
                attackButton.disabled = true; // Désactiver le bouton d'attaque après la victoire
                specialAttackButton.disabled = true; // Désactiver le bouton d'attaque spéciale après la victoire
            } else {
                player.health -= currentMonster.damage;
                logMessage(`Le ${currentMonster.name} riposte! Vous perdez ${currentMonster.damage} points de vie.`);
                if (player.health <= 0) {
                    status.textContent = `Vous êtes mort... Game Over.`;
                    logMessage(`Vous êtes tombé dans le donjon. Fin de l'aventure.`);
                    attackButton.disabled = true;
                    fleeButton.disabled = true;
                    advanceButton.disabled = true;
                }
            }
            updateUI();
        }
    }

    function useSpecialAttack() {
        if (currentMonster) {
            currentMonster.health -= player.specialAttack.damage;
            logMessage(`Vous utilisez ${player.specialAttack.name} sur le ${currentMonster.name}. Il lui reste ${currentMonster.health} points de vie.`);
            
            if (currentMonster.health <= 0) {
                logMessage(`Vous avez vaincu le ${currentMonster.name}!`);
                currentMonster = null;
                player.experience += 25;
                player.monstersDefeated += 1;

                if (player.experience >= player.level * 20) {
                    levelUp();
                }

                const loot = generateLoot();
                if (loot) {
                    player.inventory.push(loot);
                    logMessage(`Le ${currentMonster.name} laisse tomber : ${loot.name}.`);
                }

                updateUI();
                attackButton.disabled = true; // Désactiver le bouton d'attaque après la victoire
                specialAttackButton.disabled = true; // Désactiver le bouton d'attaque spéciale après la victoire
            } else {
                player.health -= currentMonster.damage;
                logMessage(`Le ${currentMonster.name} riposte! Vous perdez ${currentMonster.damage} points de vie.`);
                if (player.health <= 0) {
                    status.textContent = `Vous êtes mort... Game Over.`;
                    logMessage(`Vous êtes tombé dans le donjon. Fin de l'aventure.`);
                    attackButton.disabled = true;
                    fleeButton.disabled = true;
                    advanceButton.disabled = true;
                }
            }
            updateUI();
        }
    }

    function flee() {
        logMessage(`Vous fuyez le combat!`);
        currentMonster = null;
        attackButton.disabled = true; // Désactiver le bouton d'attaque en fuyant
        specialAttackButton.disabled = true; // Désactiver le bouton d'attaque spéciale en fuyant
        fleeButton.disabled = true; // Désactiver le bouton "Fuir" après avoir fui
        updateUI();
    }

    function updateUI() {
        playerInfo.textContent = `Nom: ${player.name}, Classe: ${player.class}, Niveau: ${player.level}, Santé: ${player.health}, Expérience: ${player.experience}`;
        inventoryList.innerHTML = player.inventory.map(item => `<li>${item.name}</li>`).join('');
        attackButton.disabled = !currentMonster; // Activer ou désactiver le bouton d'attaque selon la présence d'un monstre
        specialAttackButton.disabled = !currentMonster; // Activer ou désactiver le bouton d'attaque spéciale selon la présence d'un monstre
        fleeButton.disabled = !currentMonster; // Activer ou désactiver le bouton "Fuir" selon la présence d'un monstre
        usePotionButton.disabled = !player.inventory.some(item => item.type === 'potion'); // Activer le bouton "Utiliser Potion" si une potion est dans l'inventaire
    }

    creationForm.addEventListener('submit', (event) => {
        event
        event.preventDefault();
        player.name = event.target.elements.name.value;
        player.class = event.target.elements.class.value;
        characterCreation.style.display = 'none';
        gameplay.style.display = 'block';
        setSpecialAttack();
        updateUI();
        logMessage(`Bienvenue, ${player.name} le ${player.class}!`);
    });

    function advance() {
        totalMoves++;
        logMessage(`Vous avancez d'une case. Total de cases avancées : ${totalMoves}.`);

        const randomEvent = Math.random();
        if (totalMoves >= bossRoomThreshold && randomEvent < 0.1) {
            currentMonster = generateBoss(); // Générer le boss si le joueur a avancé suffisamment
            logMessage(`Vous êtes face à ${currentMonster.name}!`);
        } else if (randomEvent < 0.3) {
            currentMonster = generateMonster(); // Générer un monstre normal
            logMessage(`Un ${currentMonster.name} apparaît!`);
        } else if (randomEvent < 0.5) {
            openChest(); // Ouvrir un coffre
        }

        updateUI();
        attackButton.disabled = !currentMonster; // Activer ou désactiver le bouton d'attaque selon la présence d'un monstre
        specialAttackButton.disabled = !currentMonster; // Activer ou désactiver le bouton d'attaque spéciale selon la présence d'un monstre
    }

    advanceButton.addEventListener('click', () => {
        advance(); // Appeler la fonction d'avancement
    });

    attackButton.addEventListener('click', () => {
        useAttack(); // Appeler la fonction d'attaque normale
    });

    fleeButton.addEventListener('click', () => {
        flee();
    });

    usePotionButton.addEventListener('click', () => {
        usePotion();
    });

    specialAttackButton.addEventListener('click', () => {
        useSpecialAttack();
    });
});