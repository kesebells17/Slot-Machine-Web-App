/* ============================================================
   Galaxy Treasure Slot Machine — Main JavaScript
   
   This script powers the entire slot machine game logic,
   including spinning reels, coin management, statistics,
   auto-spin, lucky spin, confetti, and bonus features.
   
   JavaScript Concepts Demonstrated:
   - Variables (let, const)
   - Arrays (symbols list, history)
   - Functions (regular and arrow functions)
   - DOM Manipulation (getElementById, querySelector, classList)
   - Event Listeners (click, keydown)
   - Loops (for, forEach)
   - Conditional Statements (if/else, switch, ternary)
   - Math.random() for randomization
   - setInterval() for spinning animation
   - setTimeout() for delayed reel stops
   - Template Literals for dynamic HTML
   ============================================================ */

// ==================== SYMBOL DEFINITIONS ====================

/**
 * Array of image filenames used as slot symbols.
 * Only these three images are used for all reels.
 */
const symbols = [
    "symbol_1.jpg",
    "symbol_2.jpg",
    "symbol_3.jpg"
];

// ==================== GAME STATE VARIABLES ====================

/** Current number of coins the player has */
let coins = 100;

/** Total number of spins performed */
let totalSpins = 0;

/** Number of winning spins (jackpot + match) */
let totalWins = 0;

/** Number of losing spins */
let totalLosses = 0;

/** Number of jackpot wins (all three match) */
let jackpotWins = 0;

/** Highest coin balance ever achieved */
let highestBalance = 100;

/** Current consecutive win streak */
let winStreak = 0;

/** Best win streak ever achieved */
let bestStreak = 0;

/** Whether the reels are currently spinning */
let isSpinning = false;

/** Whether auto-spin mode is active */
let isAutoSpinning = false;

/** Number of auto-spins remaining */
let autoSpinsLeft = 0;

/** Whether dark mode is enabled (starts in dark mode) */
let isDarkMode = true;

/** Whether background music is playing */
let isMusicOn = false;

/** Array to store recent spin results (max 5) */
let spinHistory = [];

/** Cost per regular spin */
const SPIN_COST = 10;

/** Cost per lucky spin */
const LUCKY_SPIN_COST = 25;

/** Jackpot reward (all three match) */
const JACKPOT_REWARD = 50;

/** Match reward (two match) */
const MATCH_REWARD = 20;

/** Starting coins */
const STARTING_COINS = 100;

// ==================== DOM ELEMENT REFERENCES ====================

// Reel image elements
const reel1 = document.getElementById('reel-1');
const reel2 = document.getElementById('reel-2');
const reel3 = document.getElementById('reel-3');

// Reel box containers (for styling/animation classes)
const reelBox1 = document.getElementById('reel-box-1');
const reelBox2 = document.getElementById('reel-box-2');
const reelBox3 = document.getElementById('reel-box-3');
const reelBoxes = [reelBox1, reelBox2, reelBox3];

// Control buttons
const spinBtn = document.getElementById('spin-btn');
const autoSpinBtn = document.getElementById('auto-spin-btn');
const resetBtn = document.getElementById('reset-btn');
const luckySpinBtn = document.getElementById('lucky-spin-btn');

// Display elements
const coinsAmountEl = document.getElementById('coins-amount');
const resultMessage = document.getElementById('result-message');
const resultText = document.getElementById('result-text');
const gameOverEl = document.getElementById('game-over');
const gameOverResetBtn = document.getElementById('game-over-reset');

// Statistics elements
const statCoins = document.getElementById('stat-coins');
const statSpins = document.getElementById('stat-spins');
const statWins = document.getElementById('stat-wins');
const statLosses = document.getElementById('stat-losses');
const statJackpots = document.getElementById('stat-jackpots');
const statHighest = document.getElementById('stat-highest');
const statStreak = document.getElementById('stat-streak');
const statBestStreak = document.getElementById('stat-best-streak');

// History panel
const historyList = document.getElementById('history-list');

// Bonus feature buttons
const darkModeBtn = document.getElementById('dark-mode-btn');
const musicBtn = document.getElementById('music-btn');
const fullscreenBtn = document.getElementById('fullscreen-btn');

// Loading screen
const loadingScreen = document.getElementById('loading-screen');

// Stars & confetti containers
const starsContainer = document.getElementById('stars-container');
const confettiContainer = document.getElementById('confetti-container');

// ==================== INITIALIZATION ====================

/**
 * Initialize the game when the page loads.
 * Sets up stars, hides loading screen, and attaches event listeners.
 */
function initGame() {
    // Create animated star background
    createStars();

    // Create occasional shooting stars
    createShootingStars();

    // Hide loading screen after a short delay
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
    }, 1500);

    // Attach event listeners to buttons
    setupEventListeners();

    // Update the UI to match initial state
    updateDisplay();
}

// Run initialization when DOM is ready
document.addEventListener('DOMContentLoaded', initGame);

// ==================== EVENT LISTENERS ====================

/**
 * Set up all event listeners for buttons and keyboard shortcuts.
 */
function setupEventListeners() {
    // Main controls
    spinBtn.addEventListener('click', () => handleSpin(false));
    autoSpinBtn.addEventListener('click', handleAutoSpin);
    resetBtn.addEventListener('click', resetGame);

    // Lucky spin
    luckySpinBtn.addEventListener('click', () => handleSpin(true));

    // Game over reset
    gameOverResetBtn.addEventListener('click', resetGame);

    // Bonus feature toggles
    darkModeBtn.addEventListener('click', toggleDarkMode);
    musicBtn.addEventListener('click', toggleMusic);
    fullscreenBtn.addEventListener('click', toggleFullscreen);

    // Keyboard shortcut: Spacebar to spin
    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space' && !isSpinning) {
            event.preventDefault(); // Prevent page scroll
            handleSpin(false);
        }
    });
}

// ==================== CORE GAME LOGIC ====================

/**
 * Handle a single spin action.
 * Validates coins, deducts cost, spins reels, and evaluates results.
 * 
 * @param {boolean} isLucky - Whether this is a lucky spin (guaranteed match+)
 */
function handleSpin(isLucky = false) {
    // Determine spin cost
    const cost = isLucky ? LUCKY_SPIN_COST : SPIN_COST;

    // Prevent spinning if already spinning
    if (isSpinning) return;

    // Check if player has enough coins
    if (coins < cost) {
        showGameOver();
        return;
    }

    // === Sound placeholder: Button click sound ===
    // playSound('click');

    // Deduct spin cost
    coins -= cost;
    totalSpins++;
    isSpinning = true;

    // Disable all buttons while spinning
    setButtonsDisabled(true);

    // Hide previous result message
    resultMessage.classList.add('hidden');

    // Clear previous reel highlights
    clearReelHighlights();

    // Update coins display immediately
    updateCoinsDisplay();

    // Generate the final results for each reel
    let finalResults;
    if (isLucky) {
        // Lucky spin: guarantee at least two matching symbols
        finalResults = generateLuckyResult();
    } else {
        // Normal spin: fully random
        finalResults = [
            getRandomSymbol(),
            getRandomSymbol(),
            getRandomSymbol()
        ];
    }

    // Start the spinning animation
    startSpinAnimation(finalResults);
}

/**
 * Get a random symbol from the symbols array.
 * 
 * @returns {string} A random image filename
 */
function getRandomSymbol() {
    const randomIndex = Math.floor(Math.random() * symbols.length);
    return symbols[randomIndex];
}

/**
 * Generate a lucky spin result (guaranteed at least 2 matching).
 * 
 * @returns {string[]} Array of 3 symbol filenames
 */
function generateLuckyResult() {
    // Pick one symbol to match
    const matchSymbol = getRandomSymbol();
    
    // 30% chance of jackpot (all 3 match), 70% chance of just a pair
    if (Math.random() < 0.3) {
        return [matchSymbol, matchSymbol, matchSymbol];
    }

    // Create a pair in random positions
    const results = [matchSymbol, matchSymbol, matchSymbol];
    
    // Pick one position to be different
    const diffIndex = Math.floor(Math.random() * 3);
    let diffSymbol;
    do {
        diffSymbol = getRandomSymbol();
    } while (diffSymbol === matchSymbol);
    
    results[diffIndex] = diffSymbol;
    return results;
}

// ==================== REEL SPINNING ANIMATION ====================

/**
 * Animate the reels spinning and stop them one by one.
 * Uses setInterval for rapid image changes and setTimeout for staggered stops.
 * 
 * @param {string[]} finalResults - The final symbols to display [reel1, reel2, reel3]
 */
function startSpinAnimation(finalResults) {
    const reelImages = [reel1, reel2, reel3];
    const intervals = [];

    // === Sound placeholder: Reel spinning sound ===
    // playSound('spin');

    // Start all reels spinning with rapid image changes
    for (let i = 0; i < 3; i++) {
        // Add spinning class for CSS animation
        reelBoxes[i].classList.add('spinning');
        reelBoxes[i].classList.remove('stopped');

        // Rapidly swap images using setInterval
        intervals[i] = setInterval(() => {
            reelImages[i].src = getRandomSymbol();
        }, 80); // Change image every 80ms for fast spinning effect
    }

    // Stop reels one by one with staggered delays
    // Reel 1 stops at 800ms
    setTimeout(() => {
        clearInterval(intervals[0]);
        reelImages[0].src = finalResults[0];
        reelBoxes[0].classList.remove('spinning');
        reelBoxes[0].classList.add('stopped');
    }, 800);

    // Reel 2 stops at 1400ms
    setTimeout(() => {
        clearInterval(intervals[1]);
        reelImages[1].src = finalResults[1];
        reelBoxes[1].classList.remove('spinning');
        reelBoxes[1].classList.add('stopped');
    }, 1400);

    // Reel 3 stops at 2000ms — then evaluate the result
    setTimeout(() => {
        clearInterval(intervals[2]);
        reelImages[2].src = finalResults[2];
        reelBoxes[2].classList.remove('spinning');
        reelBoxes[2].classList.add('stopped');

        // Evaluate the spin result after all reels have stopped
        evaluateResult(finalResults);
    }, 2000);
}

// ==================== RESULT EVALUATION ====================

/**
 * Evaluate the final reel results and award coins accordingly.
 * Checks for jackpot (all 3 match), match (2 match), or lose.
 * 
 * @param {string[]} results - Array of 3 symbol filenames
 */
function evaluateResult(results) {
    const [r1, r2, r3] = results;
    let outcome = '';
    let reward = 0;

    // Check for JACKPOT — all three symbols match
    if (r1 === r2 && r2 === r3) {
        outcome = 'jackpot';
        reward = JACKPOT_REWARD;
        jackpotWins++;
        totalWins++;
        winStreak++;

        // Show jackpot result
        showResult('🎉 JACKPOT! +50 Coins!', 'jackpot');

        // Highlight all reels with jackpot effect
        reelBoxes.forEach(box => box.classList.add('jackpot-highlight'));

        // Launch confetti celebration
        launchConfetti();

        // === Sound placeholder: Jackpot sound ===
        // playSound('jackpot');

    // Check for MATCH — any two symbols match
    } else if (r1 === r2 || r2 === r3 || r1 === r3) {
        outcome = 'match';
        reward = MATCH_REWARD;
        totalWins++;
        winStreak++;

        // Show match result
        showResult('✨ Nice Match! +20 Coins!', 'match');

        // Highlight the matching reels
        if (r1 === r2) {
            reelBoxes[0].classList.add('win-highlight');
            reelBoxes[1].classList.add('win-highlight');
        }
        if (r2 === r3) {
            reelBoxes[1].classList.add('win-highlight');
            reelBoxes[2].classList.add('win-highlight');
        }
        if (r1 === r3) {
            reelBoxes[0].classList.add('win-highlight');
            reelBoxes[2].classList.add('win-highlight');
        }

        // === Sound placeholder: Win sound ===
        // playSound('win');

    // LOSE — all three are different
    } else {
        outcome = 'lose';
        totalLosses++;
        winStreak = 0; // Reset streak on loss

        // Show lose result
        showResult('Better luck next spin!', 'lose');
    }

    // Add reward to coins
    coins += reward;

    // Update highest balance if needed
    if (coins > highestBalance) {
        highestBalance = coins;
    }

    // Update best streak if current streak is higher
    if (winStreak > bestStreak) {
        bestStreak = winStreak;
    }

    // Add this spin to history
    addToHistory(results, outcome);

    // Update all displays
    updateDisplay();

    // Re-enable buttons
    isSpinning = false;
    setButtonsDisabled(false);

    // Check if game over (no coins left)
    if (coins < SPIN_COST) {
        // Small delay so player can see the result first
        setTimeout(() => {
            showGameOver();
        }, 800);
        return;
    }

    // If auto-spinning, trigger next spin
    if (isAutoSpinning && autoSpinsLeft > 0) {
        autoSpinsLeft--;
        if (autoSpinsLeft > 0 && coins >= SPIN_COST) {
            setTimeout(() => handleSpin(false), 1000);
        } else {
            // Auto-spin finished
            isAutoSpinning = false;
            autoSpinBtn.querySelector('.btn-text').textContent = 'AUTO SPIN (5x)';
        }
    }
}

// ==================== AUTO SPIN ====================

/**
 * Start or stop auto-spin mode.
 * Automatically spins 5 times with delays between each spin.
 */
function handleAutoSpin() {
    // If already auto-spinning, stop
    if (isAutoSpinning) {
        isAutoSpinning = false;
        autoSpinsLeft = 0;
        autoSpinBtn.querySelector('.btn-text').textContent = 'AUTO SPIN (5x)';
        return;
    }

    // Check if player has enough coins for at least one spin
    if (coins < SPIN_COST) {
        showGameOver();
        return;
    }

    // Start auto-spin mode
    isAutoSpinning = true;
    autoSpinsLeft = 5;
    autoSpinBtn.querySelector('.btn-text').textContent = `STOP AUTO (${autoSpinsLeft})`;

    // Start the first spin
    handleSpin(false);
}

// ==================== UI UPDATE FUNCTIONS ====================

/**
 * Update all display elements to reflect current game state.
 */
function updateDisplay() {
    updateCoinsDisplay();
    updateStatsDisplay();
}

/**
 * Update the coins display with animation.
 */
function updateCoinsDisplay() {
    // Update the main coins display
    coinsAmountEl.textContent = coins;
    
    // Trigger the bounce animation
    coinsAmountEl.classList.remove('coins-change');
    // Force reflow to restart animation
    void coinsAmountEl.offsetWidth;
    coinsAmountEl.classList.add('coins-change');

    // Also update stats panel coins
    statCoins.textContent = coins;
}

/**
 * Update the statistics panel.
 */
function updateStatsDisplay() {
    statSpins.textContent = totalSpins;
    statWins.textContent = totalWins;
    statLosses.textContent = totalLosses;
    statJackpots.textContent = jackpotWins;
    statHighest.textContent = highestBalance;
    statStreak.textContent = winStreak;
    statBestStreak.textContent = bestStreak;
}

/**
 * Show the result message with the appropriate style.
 * 
 * @param {string} message - The message text to display
 * @param {string} type - The result type: 'jackpot', 'match', or 'lose'
 */
function showResult(message, type) {
    resultText.textContent = message;
    resultMessage.className = `result-message ${type}`;
}

/**
 * Show the game over overlay.
 */
function showGameOver() {
    gameOverEl.classList.remove('hidden');
}

/**
 * Enable or disable all control buttons.
 * 
 * @param {boolean} disabled - Whether buttons should be disabled
 */
function setButtonsDisabled(disabled) {
    spinBtn.disabled = disabled;
    autoSpinBtn.disabled = disabled;
    resetBtn.disabled = disabled;
    luckySpinBtn.disabled = disabled;

    // Update auto spin button text with remaining count
    if (isAutoSpinning && autoSpinsLeft > 0) {
        autoSpinBtn.querySelector('.btn-text').textContent = `STOP AUTO (${autoSpinsLeft})`;
        autoSpinBtn.disabled = false; // Allow stopping auto-spin
    }
}

/**
 * Clear all highlight classes from reel boxes.
 */
function clearReelHighlights() {
    reelBoxes.forEach(box => {
        box.classList.remove('win-highlight', 'jackpot-highlight', 'stopped');
    });
}

// ==================== HISTORY ====================

/**
 * Add a spin result to the history panel.
 * Keeps only the last 5 results.
 * 
 * @param {string[]} results - Array of 3 symbol filenames
 * @param {string} outcome - The outcome: 'jackpot', 'match', or 'lose'
 */
function addToHistory(results, outcome) {
    // Create history entry object
    const entry = {
        results: [...results],
        outcome: outcome
    };

    // Add to beginning of array (newest first)
    spinHistory.unshift(entry);

    // Keep only the last 5 entries
    if (spinHistory.length > 5) {
        spinHistory.pop();
    }

    // Re-render the history list
    renderHistory();
}

/**
 * Render the spin history list in the UI.
 * Uses template literals to build the HTML.
 */
function renderHistory() {
    // If no history, show empty message
    if (spinHistory.length === 0) {
        historyList.innerHTML = '<p class="history-empty">No spins yet. Start playing!</p>';
        return;
    }

    // Build HTML for each history entry using template literals
    let historyHTML = '';

    spinHistory.forEach((entry, index) => {
        // Determine the outcome label and CSS class
        let label = '';
        let tagClass = '';

        switch (entry.outcome) {
            case 'jackpot':
                label = '🎉 Jackpot';
                tagClass = 'jackpot-tag';
                break;
            case 'match':
                label = '✨ Match';
                tagClass = 'match-tag';
                break;
            case 'lose':
                label = '💫 Lose';
                tagClass = 'lose-tag';
                break;
        }

        historyHTML += `
            <div class="history-entry" style="animation-delay: ${index * 0.08}s">
                <div class="history-images">
                    <img src="${entry.results[0]}" alt="Reel 1">
                    <img src="${entry.results[1]}" alt="Reel 2">
                    <img src="${entry.results[2]}" alt="Reel 3">
                </div>
                <span class="history-result ${tagClass}">${label}</span>
            </div>
        `;
    });

    historyList.innerHTML = historyHTML;
}

// ==================== RESET ====================

/**
 * Reset the entire game to its initial state.
 * Restores coins, clears statistics, and resets the UI.
 */
function resetGame() {
    // Reset all game state variables
    coins = STARTING_COINS;
    totalSpins = 0;
    totalWins = 0;
    totalLosses = 0;
    jackpotWins = 0;
    highestBalance = STARTING_COINS;
    winStreak = 0;
    bestStreak = 0;
    isSpinning = false;
    isAutoSpinning = false;
    autoSpinsLeft = 0;
    spinHistory = [];

    // Reset reel images to defaults
    reel1.src = symbols[0];
    reel2.src = symbols[1];
    reel3.src = symbols[2];

    // Clear highlights
    clearReelHighlights();

    // Hide result message
    resultMessage.classList.add('hidden');

    // Hide game over
    gameOverEl.classList.add('hidden');

    // Re-enable buttons
    setButtonsDisabled(false);

    // Reset auto spin button text
    autoSpinBtn.querySelector('.btn-text').textContent = 'AUTO SPIN (5x)';

    // Update displays
    updateDisplay();

    // Clear history display
    renderHistory();
}

// ==================== ANIMATED STARS BACKGROUND ====================

/**
 * Create animated twinkling stars in the background.
 * Generates small dot elements with randomized positions and animations.
 */
function createStars() {
    const numberOfStars = 120;

    for (let i = 0; i < numberOfStars; i++) {
        const star = document.createElement('div');
        star.classList.add('star');

        // Random position across the viewport
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;

        // Random size (1-3px)
        const size = Math.random() * 2.5 + 0.5;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;

        // Random animation duration and delay for natural twinkling
        const duration = Math.random() * 4 + 2; // 2-6 seconds
        star.style.setProperty('--duration', `${duration}s`);
        star.style.animationDelay = `${Math.random() * duration}s`;

        // Random max opacity
        star.style.setProperty('--max-opacity', `${Math.random() * 0.5 + 0.3}`);

        starsContainer.appendChild(star);
    }
}

/**
 * Create periodic shooting stars.
 */
function createShootingStars() {
    // Create a new shooting star every 4-8 seconds
    setInterval(() => {
        const shootingStar = document.createElement('div');
        shootingStar.classList.add('shooting-star');

        // Random starting position (top area)
        shootingStar.style.top = `${Math.random() * 40}%`;
        shootingStar.style.left = `${Math.random() * 60 + 40}%`;

        const duration = Math.random() * 1.5 + 1;
        shootingStar.style.setProperty('--shoot-duration', `${duration}s`);

        starsContainer.appendChild(shootingStar);

        // Remove after animation completes
        setTimeout(() => {
            shootingStar.remove();
        }, duration * 1000 + 500);
    }, Math.random() * 4000 + 4000);
}

// ==================== CONFETTI ====================

/**
 * Launch a confetti celebration for jackpot wins.
 * Creates colorful particles that fall and fade out.
 */
function launchConfetti() {
    const colors = ['#fbbf24', '#f59e0b', '#ef4444', '#ec4899', '#a855f7', '#6366f1', '#22c55e', '#06b6d4'];
    const numberOfPieces = 60;

    for (let i = 0; i < numberOfPieces; i++) {
        const piece = document.createElement('div');
        piece.classList.add('confetti-piece');

        // Random color
        const color = colors[Math.floor(Math.random() * colors.length)];
        piece.style.backgroundColor = color;

        // Random horizontal position
        piece.style.left = `${Math.random() * 100}%`;

        // Random shape (square, rectangle, or circle)
        const shapes = ['50%', '2px', '0'];
        piece.style.borderRadius = shapes[Math.floor(Math.random() * shapes.length)];

        // Random size
        const size = Math.random() * 8 + 6;
        piece.style.width = `${size}px`;
        piece.style.height = `${size * (Math.random() * 0.5 + 0.5)}px`;

        // Random fall duration and delay
        const fallDuration = Math.random() * 2 + 2;
        const fallDelay = Math.random() * 0.8;
        piece.style.setProperty('--fall-duration', `${fallDuration}s`);
        piece.style.setProperty('--fall-delay', `${fallDelay}s`);

        confettiContainer.appendChild(piece);

        // Clean up confetti after animation
        setTimeout(() => {
            piece.remove();
        }, (fallDuration + fallDelay) * 1000 + 500);
    }
}

// ==================== BONUS FEATURES ====================

/**
 * Toggle between dark mode and light mode.
 */
function toggleDarkMode() {
    isDarkMode = !isDarkMode;

    if (isDarkMode) {
        document.body.classList.remove('light-mode');
        darkModeBtn.querySelector('.btn-icon').textContent = '🌙';
        darkModeBtn.querySelector('.btn-text').textContent = 'DARK MODE';
        darkModeBtn.classList.remove('active');
    } else {
        document.body.classList.add('light-mode');
        darkModeBtn.querySelector('.btn-icon').textContent = '☀️';
        darkModeBtn.querySelector('.btn-text').textContent = 'LIGHT MODE';
        darkModeBtn.classList.add('active');
    }
}

/**
 * Toggle background music on/off.
 * Placeholder implementation — add an audio file to enable.
 */
function toggleMusic() {
    isMusicOn = !isMusicOn;

    if (isMusicOn) {
        musicBtn.querySelector('.btn-icon').textContent = '🔊';
        musicBtn.querySelector('.btn-text').textContent = 'MUSIC ON';
        musicBtn.classList.add('active');

        // === Sound placeholder: Start background music ===
        // backgroundMusic.play();
    } else {
        musicBtn.querySelector('.btn-icon').textContent = '🔇';
        musicBtn.querySelector('.btn-text').textContent = 'MUSIC OFF';
        musicBtn.classList.remove('active');

        // === Sound placeholder: Stop background music ===
        // backgroundMusic.pause();
    }
}

/**
 * Toggle fullscreen mode for the browser window.
 */
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        // Enter fullscreen
        document.documentElement.requestFullscreen().then(() => {
            fullscreenBtn.querySelector('.btn-text').textContent = 'EXIT FULL';
            fullscreenBtn.classList.add('active');
        }).catch((err) => {
            console.warn(`Fullscreen request failed: ${err.message}`);
        });
    } else {
        // Exit fullscreen
        document.exitFullscreen().then(() => {
            fullscreenBtn.querySelector('.btn-text').textContent = 'FULLSCREEN';
            fullscreenBtn.classList.remove('active');
        });
    }
}

// ==================== SOUND PLACEHOLDER FUNCTIONS ====================

/**
 * Placeholder function for playing sound effects.
 * Uncomment and provide audio files to enable sounds.
 * 
 * Supported sound types:
 * - 'click'   : Button click sound
 * - 'spin'    : Reel spinning sound
 * - 'win'     : Match win sound
 * - 'jackpot' : Jackpot celebration sound
 * 
 * @param {string} type - The type of sound to play
 */
// function playSound(type) {
//     const sounds = {
//         click:   new Audio('sounds/click.mp3'),
//         spin:    new Audio('sounds/spin.mp3'),
//         win:     new Audio('sounds/win.mp3'),
//         jackpot: new Audio('sounds/jackpot.mp3')
//     };
//
//     if (sounds[type]) {
//         sounds[type].currentTime = 0;
//         sounds[type].play().catch(e => console.warn('Audio play failed:', e));
//     }
// }

// ==================== BACKGROUND MUSIC PLACEHOLDER ====================

/**
 * Background music setup (commented out).
 * Add a music file and uncomment to enable.
 */
// const backgroundMusic = new Audio('sounds/background.mp3');
// backgroundMusic.loop = true;
// backgroundMusic.volume = 0.3;
