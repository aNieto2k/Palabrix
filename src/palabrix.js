import { puzzles } from './puzzle.js';
import { launchConfetti } from './confetti.js';

// --- DEBUGGING ---
window.debug = {
    enable() {
        window.DEBUG_WORDSEARCH = true;
        localStorage.setItem('DEBUG_WORDSEARCH', 'true');
        console.log('[WordSearch DEBUG] Modo debug ACTIVADO y persistente.');
    },
    disable() {
        window.DEBUG_WORDSEARCH = false;
        localStorage.setItem('DEBUG_WORDSEARCH', 'false');
        console.log('[WordSearch DEBUG] Modo debug DESACTIVADO y persistente.');
    },
    setDate(dateStr) {
        // Espera formato dd/mm/yyyy
        const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (!match) {
            console.error('[WordSearch DEBUG] Formato de fecha inválido. Usa dd/mm/yyyy');
            return;
        }
        const [_, dd, mm, yyyy] = match;
        const date = new Date(`${yyyy}-${mm}-${dd}T09:00:00`); // 9:00 hora local
        if (isNaN(date.getTime())) {
            console.error('[WordSearch DEBUG] Fecha inválida.');
            return;
        }
        window.DEBUG_WORDSEARCH_DATE = date;
        localStorage.setItem('DEBUG_WORDSEARCH_DATE', date.toISOString());
        console.log(`[WordSearch DEBUG] Fecha forzada: ${date.toLocaleDateString()}`);
        location.reload();
    },
    clearDate() {
        window.DEBUG_WORDSEARCH_DATE = undefined;
        localStorage.removeItem('DEBUG_WORDSEARCH_DATE');
        console.log('[WordSearch DEBUG] Fecha forzada eliminada.');
        location.reload();
    }
};
(function() {
    const debugValue = localStorage.getItem('DEBUG_WORDSEARCH');
    window.DEBUG_WORDSEARCH = debugValue === 'true';
    const debugDate = localStorage.getItem('DEBUG_WORDSEARCH_DATE');
    if (debugDate) {
        window.DEBUG_WORDSEARCH_DATE = new Date(debugDate);
    }
})();
function debugLog(...args) {
    if (window.DEBUG_WORDSEARCH) {
        console.log('[WordSearch DEBUG]', ...args);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const elements = {
        gridContainer: document.getElementById('grid-container'),
        gridBlurOverlay: null, // Se creará dinámicamente
        wordListDesktop: document.getElementById('word-list-desktop'),
        wordListMobile: document.getElementById('word-list-mobile'),
        messageArea: document.getElementById('message-area'),
        themeDisplay: document.getElementById('theme-display'),
        timer: document.getElementById('timer'),
        timerButton: null, // Se creará dinámicamente
        modal: document.getElementById('modal'),
        modalTitle: document.getElementById('modal-title'),
        modalText: document.getElementById('modal-text'),
        secretMessage: document.getElementById('secret-message'),
        closeModalBtn: document.getElementById('close-modal-btn'),
        gridSizeSelect: document.getElementById('grid-size-select'),
        gridSizeSelectMobile: document.getElementById('grid-size-select-mobile'),
        resetProgressBtn: document.getElementById('reset-progress-btn'),
        resetProgressBtnMobile: document.getElementById('reset-progress-btn-mobile'),
        modalStatsPlayed: document.getElementById('modal-stats-played'),
        modalStatsCompleted: document.getElementById('modal-stats-completed'),
        modalStatsBestTime: document.getElementById('modal-stats-best-time'),
        modalStatsAvgTime: document.getElementById('modal-stats-avg-time'),
        copyFeedback: document.getElementById('copy-feedback'),
        shareTwitter: document.getElementById('share-twitter'),
        shareCopy: document.getElementById('share-copy'),
    };

    // --- GAME CONFIG ---
    let gridSize = 16;
    let currentPuzzle;
    let grid = [];
    let foundWords = [];
    let startCellCoords = null; 
    let timerInterval = null;
    let countdownInterval = null;
    let startTime = 0;
    let finalTime = 0;
    let stats = {};
    let puzzleDayIdentifier = 0;
    
    // --- SEEDED RANDOM NUMBER GENERATOR ---
    let seed = 0;
    function srand(s) {
        seed = s;
    }
    function srandom() {
        seed = (1664525 * seed + 1013904223) % 4294967296; 
        return seed / 4294967296;
    }

    // --- DAILY PUZZLE LOGIC ---
    function getPuzzleDayIdentifier() {
        let now;
        if (window.DEBUG_WORDSEARCH_DATE instanceof Date) {
            now = new Date(window.DEBUG_WORDSEARCH_DATE);
        } else {
            now = new Date();
        }
        const puzzleDayStart = new Date(now);
        puzzleDayStart.setHours(9, 0, 0, 0);
        if (now < puzzleDayStart) {
            puzzleDayStart.setDate(puzzleDayStart.getDate() - 1);
        }
        return Math.floor(puzzleDayStart.getTime() / (1000 * 60 * 60 * 24));
    }


    // --- STATISTICS FUNCTIONS ---
    function loadSettingsAndStats() {
        // Load grid size
        const savedGridSize = localStorage.getItem('wordSearchGridSize');
        if (savedGridSize) {
            gridSize = parseInt(savedGridSize, 10);
            elements.gridSizeSelect.value = gridSize;
        }
        
        // Load stats
        const statsJSON = localStorage.getItem('wordSearchStats');
        const defaultStats = {
            gamesPlayed: 0,
            gamesCompleted: 0,
            totalCompletionTime: 0,
            bestTimes: {}, // Stores best time per puzzleDayIdentifier-gridSize
            lastPlayedDay: 0,
            gameState: {} // Stores progress for the current day
        };
        const loadedStats = statsJSON ? JSON.parse(statsJSON) : {};
        stats = { ...defaultStats, ...loadedStats };

        // FIX: Ensure gameState is an object if it's missing from old saves
        if (!stats.gameState) {
            stats.gameState = {};
        }
    }

    function saveGridSize() {
        localStorage.setItem('wordSearchGridSize', gridSize);
    }

    function saveStats() {
        localStorage.setItem('wordSearchStats', JSON.stringify(stats));
    }

    function formatTime(totalSeconds) {
        if (isNaN(totalSeconds) || totalSeconds === null || totalSeconds === Infinity) return '--:--';
        const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    }
    
    function renderStats() {
        elements.modalStatsPlayed.textContent = stats.gamesPlayed;
        elements.modalStatsCompleted.textContent = stats.gamesCompleted;
        const bestTimeKey = `${puzzleDayIdentifier}-${gridSize}`;
        const bestTimeForToday = stats.bestTimes[bestTimeKey] || null;
        elements.modalStatsBestTime.textContent = formatTime(bestTimeForToday);
        const avgTime = stats.gamesCompleted > 0 ? Math.round(stats.totalCompletionTime / stats.gamesCompleted) : null;
        elements.modalStatsAvgTime.textContent = formatTime(avgTime);
    }

    // --- GAME LOGIC ---
    function updateGridStyles() {
        let size, fontSize;
        if (gridSize <= 16) {
            size = 'clamp(15px, 5vw, 35px)';
            fontSize = 'clamp(10px, 3vw, 18px)';
        } else if (gridSize <= 20) {
            size = 'clamp(12px, 4vw, 28px)';
            fontSize = 'clamp(8px, 2.5vw, 14px)';
        } else { // 24x24
            size = 'clamp(10px, 3vw, 20px)';
            fontSize = 'clamp(7px, 2vw, 12px)';
        }
        document.documentElement.style.setProperty('--grid-cell-size', size);
        document.documentElement.style.setProperty('--grid-font-size', fontSize);
    }

    // --- OVERLAY Y BOTÓN DE INICIO ---
    function showBlurOverlay() {
        debugLog('[DEBUG] showBlurOverlay called', timerInterval, startTime, Date.now());
        
        // Verificar si el juego ya ha empezado (timer activo o startTime válido con progreso)
        const gameStateKey = `${puzzleDayIdentifier}-${gridSize}`;
        const gameState = stats.gameState[gameStateKey];
        const hasProgress = gameState && gameState.foundWordsData && gameState.foundWordsData.length > 0;
        const gameStarted = timerInterval || (startTime > 0 && hasProgress);
        
        // Solo mostrar si el timer NO ha empezado y no hay progreso guardado
        if (gameStarted) {
            // Timer ya iniciado o hay progreso, no mostrar overlay
            debugLog('[DEBUG] No mostrar overlay - juego ya iniciado o con progreso');
            return;
        }
        
        // Elimina overlays previos si existen
        if (elements.gridBlurOverlay) {
            elements.gridBlurOverlay.remove();
            elements.gridBlurOverlay = null;
        }
        const overlay = document.createElement('div');
        overlay.id = 'grid-blur-overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backdropFilter = 'blur(8px)';
        overlay.style.webkitBackdropFilter = 'blur(8px)';
        overlay.style.zIndex = '9999';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.transition = 'opacity 0.3s';
        overlay.style.border = 'none';

        overlay.className = 'rounded-2xl shadow-2xl';
        elements.gridContainer.style.position = 'relative';
        elements.gridContainer.style.overflow = 'visible';
        // Botón dentro del overlay
        const btn = document.createElement('button');
        btn.textContent = 'Comenzar';
        btn.className = 'start-btn';
        btn.style.padding = '1em 2em';
        btn.style.fontSize = '1.2em';
        btn.style.borderRadius = '8px';
        btn.style.background = '#2563eb';
        btn.style.color = 'white';
        btn.style.border = 'none';
        btn.style.cursor = 'pointer';
        btn.style.boxShadow = '0 2px 12px rgba(0,0,0,0.15)';
        btn.addEventListener('click', () => {
            hideBlurOverlay();
            startTime = Date.now();
            elements.timer.textContent = formatTime(0);
            if (timerInterval) clearInterval(timerInterval);
            timerInterval = setInterval(updateTimer, 1000);
            elements.messageArea.textContent = '¡Busca las palabras!';
        });
        overlay.appendChild(btn);
        elements.gridContainer.appendChild(overlay);
        elements.gridBlurOverlay = overlay;
        elements.timerButton = btn;
        console.log('[DEBUG] Overlay blur mostrado');
    }

    function hideBlurOverlay() {
        if (elements.gridBlurOverlay) {
            elements.gridBlurOverlay.remove();
            elements.gridBlurOverlay = null;
            elements.timerButton = null;
        }
    }

    function setupNewGame(isRestart = false) {
        debugLog('setupNewGame', { isRestart, gridSize, puzzleDayIdentifier: getPuzzleDayIdentifier() });
        if (timerInterval) clearInterval(timerInterval);
        if (countdownInterval) clearInterval(countdownInterval);

        puzzleDayIdentifier = getPuzzleDayIdentifier();
        if (!isRestart) {
            if (stats.lastPlayedDay !== puzzleDayIdentifier) {
                stats.gamesPlayed++;
                stats.lastPlayedDay = puzzleDayIdentifier;
                stats.gameState = {}; // Clear game state for the new day
                saveStats();
            }
        }
        
        updateGridStyles();
        srand(puzzleDayIdentifier);
        // Selección determinista del puzzle diario
        const puzzleIndex = puzzleDayIdentifier % puzzles.length;
        currentPuzzle = puzzles[puzzleIndex];
        debugLog('Puzzle seleccionado', currentPuzzle);

        const gameStateKey = `${puzzleDayIdentifier}-${gridSize}`;
        let gameState = stats.gameState[gameStateKey];

        if (gameState && gameState.foundWordsData) {
            foundWords = gameState.foundWordsData.map(data => data.word);
            startTime = gameState.startTime;
            // Si hay progreso, reiniciar el timer automáticamente
            if (foundWords.length > 0) {
                elements.timer.textContent = formatTime(Math.floor((Date.now() - startTime) / 1000));
                timerInterval = setInterval(updateTimer, 1000);
                elements.messageArea.textContent = '¡Busca las palabras!';
            }
        } else {
            foundWords = [];
            startTime = Date.now();
            stats.gameState[gameStateKey] = { startTime, foundWords: [], foundWordsData: [] };
            saveStats();
        }

        resetSelection();
        elements.modal.classList.add('hidden');
        // --- BLUR y botón de inicio ---
        showBlurOverlay();
        elements.themeDisplay.textContent = `Tema: ${currentPuzzle.theme}`;

        // Inicialización robusta del grid: cada celda es un objeto independiente
        grid = Array.from({ length: gridSize }, () => Array.from({ length: gridSize }, () => ({ char: '', isWord: false, isSecret: false })));
        // Ordenar palabras de mayor a menor longitud
        const wordsToPlace = [...currentPuzzle.words].filter(w => w.length <= gridSize).sort((a, b) => b.length - a.length);
        wordsToPlace.forEach(word => placeWord(word));
        placeSecretMessage(currentPuzzle.secret.replace(/\s/g, ''));
        fillEmptyCells();

        renderGrid();
        renderWordList(wordsToPlace);
        // No arrancar timer aquí, solo tras pulsar el botón
        debugLog('Puzzle del día:', currentPuzzle.theme, 'GridSize:', gridSize);
    }

    function updateTimer() {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        elements.timer.textContent = formatTime(elapsedTime);
    }

    function placeWord(word) {
        debugLog('Intentando colocar palabra', word);
        const directions = [{ r: 0, c: 1 }, { r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: -1 }];
        const wordToPlace = srandom() > 0.5 ? word : word.split('').reverse().join('');
        let placed = false, attempts = 0;
        while (!placed && attempts < 100) {
            const dir = directions[Math.floor(srandom() * directions.length)];
            const startRow = Math.floor(srandom() * gridSize);
            const startCol = Math.floor(srandom() * gridSize);
            if (canPlaceWord(wordToPlace, startRow, startCol, dir)) {
                for (let i = 0; i < wordToPlace.length; i++) {
                    const r = startRow + i * dir.r;
                    const c = startCol + i * dir.c;
                    grid[r][c] = { char: wordToPlace[i], isWord: true };
                }
                placed = true;
                debugLog('Palabra colocada', wordToPlace, { startRow, startCol, dir });
            }
            attempts++;
        }
        // Si no se pudo colocar tras 100 intentos, forzar colocación
        if (!placed) {
            debugLog('Forzando colocación de palabra', wordToPlace);
            for (let d = 0; d < directions.length && !placed; d++) {
                const dir = directions[d];
                for (let row = 0; row < gridSize && !placed; row++) {
                    for (let col = 0; col < gridSize && !placed; col++) {
                        if (canPlaceWord(wordToPlace, row, col, dir)) {
                            for (let i = 0; i < wordToPlace.length; i++) {
                                const r = row + i * dir.r;
                                const c = col + i * dir.c;
                                grid[r][c] = { char: wordToPlace[i], isWord: true };
                            }
                            placed = true;
                            debugLog('Palabra forzada', wordToPlace, { row, col, dir });
                        }
                    }
                }
            }
        }
    }
    function canPlaceWord(word, r, c, dir) {
        for (let i = 0; i < word.length; i++) {
            const newR = r + i * dir.r;
            const newC = c + i * dir.c;
            if (newR < 0 || newR >= gridSize || newC < 0 || newC >= gridSize) {
                return false;
            }
            if (grid[newR][newC].char !== '' && grid[newR][newC].char !== word[i]) {
                return false;
            }
        }
        return true;
    }
    function placeSecretMessage(secret, rng = srandom) {
        let secretIndex = 0;
        const emptyCells = [];
        for (let r = 0; r < gridSize; r++) { for (let c = 0; c < gridSize; c++) { if (grid[r][c].char === '') emptyCells.push({r, c}); } }
        for (let i = emptyCells.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            [emptyCells[i], emptyCells[j]] = [emptyCells[j], emptyCells[i]];
        }
        for (const cell of emptyCells) {
            if (secretIndex < secret.length) {
                grid[cell.r][cell.c] = { ...grid[cell.r][cell.c], char: secret[secretIndex++], isSecret: true };
            } else break;
        }
    }
    function fillEmptyCells(rng = srandom) {
        const alphabet = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
        for (let r = 0; r < gridSize; r++) { for (let c = 0; c < gridSize; c++) { if (grid[r][c].char === '') grid[r][c] = { char: alphabet[Math.floor(rng() * alphabet.length)]}; } }
    }

    function renderGrid() {
        elements.gridContainer.innerHTML = '';
        elements.gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, minmax(0, 1fr))`;
        elements.gridContainer.style.position = 'relative';
        elements.gridContainer.style.minHeight = '300px';
        grid.forEach((row, r) => {
            row.forEach((cell, c) => {
                const cellEl = document.createElement('div');
                cellEl.className = 'grid-cell';
                cellEl.textContent = cell.char;
                cellEl.dataset.r = r;
                cellEl.dataset.c = c;
                elements.gridContainer.appendChild(cellEl);
            });
        });
        applyProgressToUI();
        addCellListeners();
        // Mostrar overlay y botón SIEMPRE en nuevo juego
        showBlurOverlay();
    }

    function applyProgressToUI() {
        const gameStateKey = `${puzzleDayIdentifier}-${gridSize}`;
        const gameState = stats.gameState[gameStateKey];
        if (gameState && gameState.foundWordsData) {
            let colorIndex = 1;
            gameState.foundWordsData.forEach(wordData => {
                const colorClass = `found-permanent-${(colorIndex % 8) + 1}`;
                wordData.coords.forEach(coord => {
                    const cellEl = elements.gridContainer.querySelector(`[data-r='${coord.r}'][data-c='${coord.c}']`);
                    if(cellEl) {
                        cellEl.classList.add('found', colorClass);
                    }
                });
                colorIndex++;
            });
        }
    }

    function renderWordList(words) {
        elements.wordListDesktop.innerHTML = '';
        elements.wordListMobile.innerHTML = '';

        const shuffledWords = [...words];
        for (let i = shuffledWords.length - 1; i > 0; i--) {
            const j = Math.floor(srandom() * (i + 1));
            [shuffledWords[i], shuffledWords[j]] = [shuffledWords[j], shuffledWords[i]];
        }

        shuffledWords.forEach(word => {
            const li = document.createElement('li');
            li.textContent = word;
            li.id = `word-desktop-${word}`;
            if (foundWords.includes(word)) {
                li.classList.add('word-found');
            }
            elements.wordListDesktop.appendChild(li);

            const liMobile = li.cloneNode(true);
            liMobile.id = `word-mobile-${word}`;
            elements.wordListMobile.appendChild(liMobile);
        });
    }

    function addCellListeners() {
        elements.gridContainer.addEventListener('pointerdown', handleCellClick);
    }

    function handleCellClick(e) {
        const cell = e.target.closest('.grid-cell');
        if (!cell) return;

        const r = parseInt(cell.dataset.r), c = parseInt(cell.dataset.c);
        if (!startCellCoords) {
            if (cell.classList.contains('found')) return;
            startCellCoords = { r, c, el: cell };
            cell.classList.add('first-pick');
            elements.messageArea.textContent = 'Ahora haz clic en la última letra';
        } else {
            if (startCellCoords.r === r && startCellCoords.c === c) {
                resetSelection();
                return;
            }
            
            const selectionData = getLineSelection(startCellCoords.r, startCellCoords.c, r, c);
            
            if (!tryToCompleteWord(selectionData)) {
                showIncorrectSelectionFeedback(selectionData.selectionCoords);
            }
            
            resetSelection();
        }
    }
    
    function resetSelection() {
        if (startCellCoords && startCellCoords.el) {
            startCellCoords.el.classList.remove('first-pick');
        }
        startCellCoords = null;
        elements.messageArea.textContent = 'Haz clic en la primera letra';
    }

    function getLineSelection(r1, c1, r2, c2) {
        let selection = [], selectionCoords = [];
        const dr = r2 - r1;
        const dc = c2 - c1;

        if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) {
            return { selection: [], selectionCoords: [] };
        }

        const steps = Math.max(Math.abs(dr), Math.abs(dc));
        const stepR = dr === 0 ? 0 : Math.sign(dr);
        const stepC = dc === 0 ? 0 : Math.sign(dc);

        for (let i = 0; i <= steps; i++) {
            const r = r1 + i * stepR;
            const c = c1 + i * stepC;
            const cellEl = elements.gridContainer.querySelector(`[data-r='${r}'][data-c='${c}']`);
            if (cellEl) {
                selection.push(cellEl.textContent);
                selectionCoords.push({ r, c, el: cellEl });
            }
        }
        return { selection, selectionCoords };
    }

    function tryToCompleteWord({ selection, selectionCoords }) {
        if (selection.length === 0) return false;
        const selectedWord = selection.join('');
        const selectedWordReversed = selection.slice().reverse().join('');
        let wordFound = false;
        const wordsToFind = currentPuzzle.words.filter(w => w.length <= gridSize);

        for (const word of wordsToFind) {
            if (!foundWords.includes(word) && (selectedWord === word || selectedWordReversed === word)) {
                foundWords.push(word);
                wordFound = true;
                const colorClass = `found-permanent-${(foundWords.length % 8) + 1}`;
                selectionCoords.forEach(coord => coord.el.classList.add('found', colorClass));
                document.getElementById(`word-desktop-${word}`).classList.add('word-found');
                document.getElementById(`word-mobile-${word}`).classList.add('word-found');
                elements.messageArea.textContent = `¡Encontraste "${word}"!`;

                // Save progress
                const gameStateKey = `${puzzleDayIdentifier}-${gridSize}`;
                const coordsToSave = selectionCoords.map(c => ({r: c.r, c: c.c}));
                stats.gameState[gameStateKey].foundWords.push(word);
                if (!stats.gameState[gameStateKey].foundWordsData) {
                    stats.gameState[gameStateKey].foundWordsData = [];
                }
                stats.gameState[gameStateKey].foundWordsData.push({ word, coords: coordsToSave });
                saveStats();

                break; 
            }
        }
        if (wordFound && foundWords.length === wordsToFind.length) gameOver();
        return wordFound;
    }

    function showIncorrectSelectionFeedback(selectionCoords) {
        selectionCoords.forEach(coord => coord.el.classList.add('selecting'));
        setTimeout(() => {
            selectionCoords.forEach(coord => coord.el.classList.remove('selecting'));
            elements.messageArea.textContent = 'Palabra incorrecta.';
        }, 500);
    }
    
    function gameOver() {
        if (timerInterval) clearInterval(timerInterval);
        finalTime = Math.floor((Date.now() - startTime) / 1000);
        // Lanzar confeti al ganar
        launchConfetti();
        stats.gamesCompleted++;
        stats.totalCompletionTime += finalTime;
        const bestTimeKey = `${puzzleDayIdentifier}-${gridSize}`;
        const currentBest = stats.bestTimes[bestTimeKey];
        if (!currentBest || finalTime < currentBest) {
            stats.bestTimes[bestTimeKey] = finalTime;
        }
        saveStats();
        
        elements.messageArea.textContent = '¡Has encontrado todas las palabras!';
        setTimeout(revealSecretMessage, 1000);
    }

    function revealSecretMessage() {
        renderStats(); 
        document.querySelectorAll('.grid-cell').forEach(cell => {
            const r = parseInt(cell.dataset.r), c = parseInt(cell.dataset.c);
            // Solo marcar en amarillo si es letra secreta y NO es parte de palabra
            if (grid[r][c].isSecret && !grid[r][c].isWord) cell.classList.add('secret-letter');
        });
        elements.modalTitle.textContent = "¡Felicidades!";
        elements.modalText.textContent = `¡Has completado la sopa de letras!\nTu tiempo: ${formatTime(finalTime)}`;
        elements.secretMessage.textContent = '';
        elements.modal.classList.remove('hidden');
    }

    // --- EVENT LISTENERS ---
    elements.closeModalBtn.addEventListener('click', () => {
        elements.modal.classList.add('hidden');
    });


    elements.gridSizeSelectMobile.addEventListener('change', (e) => {
        gridSize = parseInt(e.target.value, 10);
        saveGridSize();
        // Reiniciar timer y estado para forzar overlay
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = null;
        startTime = 0;
        const bestTimeKey = `${getPuzzleDayIdentifier()}-${gridSize}`;
        if (stats.bestTimes[bestTimeKey]) {
            showCompletedPuzzleScreen();
        } else {
            setupNewGame(true);
        }
    });
    elements.gridSizeSelect.addEventListener('change', (e) => {
        gridSize = parseInt(e.target.value, 10);
        saveGridSize();
        // Reiniciar timer y estado para forzar overlay
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = null;
        startTime = 0;
        const bestTimeKey = `${getPuzzleDayIdentifier()}-${gridSize}`;
        if (stats.bestTimes[bestTimeKey]) {
            showCompletedPuzzleScreen();
        } else {
            setupNewGame(true);
        }
    });

    const resetAction = () => {
        const dayId = getPuzzleDayIdentifier();
        let progressFound = false;
        for (const key in stats.bestTimes) {
            if (key.startsWith(`${dayId}-`)) {
                delete stats.bestTimes[key];
                progressFound = true;
            }
        }
        if(stats.gameState) {
            for (const key in stats.gameState) {
                    if (key.startsWith(`${dayId}-`)) {
                    delete stats.gameState[key];
                    progressFound = true;
                }
            }
        }


        if (progressFound) {
            saveStats();
            location.reload();
        } else {
            elements.messageArea.textContent = 'No hay progreso que resetear para hoy.';
            setTimeout(() => { elements.messageArea.textContent = ''; }, 2000);
        }
    };

    elements.resetProgressBtnMobile.addEventListener('click', resetAction);
    elements.resetProgressBtn.addEventListener('click', resetAction);

    // --- SHARE FUNCTIONALITY ---
    function getShareText() {
        return `¡He resuelto la Sopa de Letras Diaria! 🎉\nTema: ${currentPuzzle.theme}\nTamaño: ${gridSize}x${gridSize}\nMi tiempo: ${formatTime(finalTime)}\n¡Inténtalo tú también en https://palabrix.anieto2k.com!`;
    }

    elements.shareTwitter.addEventListener('click', () => {
        const text = encodeURIComponent(getShareText());
        window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    });

    elements.shareCopy.addEventListener('click', () => {
        const textToCopy = getShareText();
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            elements.copyFeedback.textContent = '¡Copiado!';
            setTimeout(() => { elements.copyFeedback.textContent = ''; }, 2000);
        } catch (err) {
            console.error('Error al copiar texto: ', err);
            elements.copyFeedback.textContent = 'Error al copiar';
        }
        document.body.removeChild(textArea);
    });


    // --- START ---
    function initializeGame() {
        loadSettingsAndStats();
        const bestTimeKey = `${getPuzzleDayIdentifier()}-${gridSize}`;
        if (stats.bestTimes[bestTimeKey]) {
            showCompletedPuzzleScreen();
        } else {
            setupNewGame(false);
        }
    }

    function showCompletedPuzzleScreen() {
        if (timerInterval) clearInterval(timerInterval);
        if (countdownInterval) clearInterval(countdownInterval);
        hideBlurOverlay(); // Asegura que no quede overlay
        elements.gridContainer.innerHTML = '';
        elements.gridBlurOverlay = null;
        elements.timerButton = null;
        puzzleDayIdentifier = getPuzzleDayIdentifier();
        srand(puzzleDayIdentifier);
        // Selección determinista del puzzle diario
        const puzzleIndex = puzzleDayIdentifier % puzzles.length;
        currentPuzzle = puzzles[puzzleIndex];
        elements.themeDisplay.textContent = `Tema: ${currentPuzzle.theme}`;
        const wordsToDisplay = currentPuzzle.words.filter(w => w.length <= gridSize);
        renderGrid(); // Renderiza el grid vacío para mantener la UI consistente
        renderWordList(wordsToDisplay);
        elements.gridContainer.innerHTML = `<div class="text-slate-400 text-center p-8" style="grid-column: 1 / -1;">¡Ya has completado el puzle de hoy para este tamaño!</div>`;
        startNextPuzzleCountdown();
        renderStats();
        elements.modalTitle.textContent = "Puzle del día completado";
        const bestTimeKey = `${puzzleDayIdentifier}-${gridSize}`;
        finalTime = stats.bestTimes[bestTimeKey]; // Set finalTime for sharing
        elements.modalText.textContent = `Tu mejor tiempo hoy: ${formatTime(finalTime)}. El mensaje secreto es:`;
        elements.secretMessage.textContent = currentPuzzle.secret;
        elements.modal.classList.remove('hidden');
    }

    function startNextPuzzleCountdown() {
        const getNextPuzzleTime = () => {
            const now = new Date();
            const nextPuzzleTime = new Date();
            nextPuzzleTime.setHours(9, 0, 0, 0);
            if (now.getHours() >= 9) {
                nextPuzzleTime.setDate(nextPuzzleTime.getDate() + 1);
            }
            return nextPuzzleTime;
        };

        const nextPuzzleTime = getNextPuzzleTime();

        const updateCountdown = () => {
            const now = new Date();
            const remaining = nextPuzzleTime - now;

            if (remaining <= 0) {
                clearInterval(countdownInterval);
                location.reload();
                return;
            }

            const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
            const seconds = Math.floor((remaining % (1000 * 60)) / 1000).toString().padStart(2, '0');

            elements.timer.textContent = `${hours}:${minutes}:${seconds}`;
        };
        
        elements.messageArea.textContent = 'Próximo puzle en:';
        updateCountdown();
        countdownInterval = setInterval(updateCountdown, 1000);
    }

    initializeGame();
});

// --- FUNCIONES PURAS PARA TESTS ---
export function formatTime(totalSeconds) {
  if (isNaN(totalSeconds) || totalSeconds === null || totalSeconds === Infinity) return '--:--';
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function createEmptyGrid(size) {
  return Array(size).fill(null).map(() => Array(size).fill({ char: '', isWord: false, isSecret: false }));
}

export function canPlaceWord(grid, word, r, c, dir, gridSize) {
  for (let i = 0; i < word.length; i++) {
    const newR = r + i * dir.r;
    const newC = c + i * dir.c;
    if (newR < 0 || newR >= gridSize || newC < 0 || newC >= gridSize) {
      return false;
    }
    if (grid[newR][newC].char !== '' && grid[newR][newC].char !== word[i]) {
      return false;
    }
  }
  return true;
}

export function placeWord(grid, word, gridSize, rng = Math.random) {
  const directions = [{ r: 0, c: 1 }, { r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: -1 }];
  let placed = false, attempts = 0;
  while (!placed && attempts < 100) {
    const dir = directions[Math.floor(rng() * directions.length)];
    const startRow = Math.floor(rng() * gridSize);
    const startCol = Math.floor(rng() * gridSize);
    if (canPlaceWord(grid, word, startRow, startCol, dir, gridSize)) {
      for (let i = 0; i < word.length; i++) {
        const r = startRow + i * dir.r;
        const c = startCol + i * dir.c;
        grid[r][c] = { ...grid[r][c], char: word[i], isWord: true };
      }
      placed = true;
    }
    attempts++;
  }
  return placed;
}

export function placeSecretMessage(grid, secret, gridSize, rng = Math.random) {
  let secretIndex = 0;
  const emptyCells = [];
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c].char === '') emptyCells.push({ r, c });
    }
  }
  for (let i = emptyCells.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [emptyCells[i], emptyCells[j]] = [emptyCells[j], emptyCells[i]];
  }
  for (const cell of emptyCells) {
    if (secretIndex < secret.length) {
      grid[cell.r][cell.c] = { ...grid[cell.r][cell.c], char: secret[secretIndex++], isSecret: true };
    } else break;
  }
}