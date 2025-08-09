import { puzzles } from './puzzle.js';
import { launchConfetti } from './confetti.js';
import { launchTripleCompletionEffect } from './triple-completion-effect.js';
import { launchWordCompletionEffect } from './word-completion-effect.js';
import { launchPanelCompletionEffect } from './panel-completion-effect.js';

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
    },
    launchTripleEffect() {
        console.log('[WordSearch DEBUG] Ejecutando efecto de triple completación...');
        launchTripleCompletionEffect();
    },
    launchWordEffect() {
        console.log('[WordSearch DEBUG] Ejecutando efecto de palabra completada...');
        // Crear coordenadas de ejemplo para el efecto
        const mockCoords = [
            { el: document.querySelector('.grid-cell') || document.createElement('div') }
        ];
        if (mockCoords[0].el) {
            launchWordCompletionEffect('EJEMPLO', mockCoords);
        } else {
            console.log('[WordSearch DEBUG] No se encontraron celdas para el efecto de ejemplo');
        }
    },
    launchPanelEffect() {
        console.log('[WordSearch DEBUG] Ejecutando efecto de completación de panel...');
        launchPanelCompletionEffect();
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
        copyFeedback: document.getElementById('copy-feedback'),
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
            completedBySize: {}, // Stores completed games count per puzzleDayIdentifier-gridSize
            timesBySize: {}, // Stores all individual times per puzzleDayIdentifier-gridSize
            lastPlayedDay: 0,
            gameState: {} // Stores progress for the current day
        };
        const loadedStats = statsJSON ? JSON.parse(statsJSON) : {};
        stats = { ...defaultStats, ...loadedStats };

        // FIX: Ensure gameState is an object if it's missing from old saves
        if (!stats.gameState) {
            stats.gameState = {};
        }
        
        // FIX: Ensure completedBySize is an object if it's missing from old saves
        if (!stats.completedBySize) {
            stats.completedBySize = {};
        }
        
        // FIX: Ensure timesBySize is an object if it's missing from old saves
        if (!stats.timesBySize) {
            stats.timesBySize = {};
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
        // Obtener estadísticas por tamaño para el día actual
        const gridSizes = [16, 20, 24];
        const statsBySize = {};
        
        gridSizes.forEach(size => {
            const bestTimeKey = `${puzzleDayIdentifier}-${size}`;
            const completedKey = `${puzzleDayIdentifier}-${size}`;
            const bestTimeForToday = stats.bestTimes[bestTimeKey] || null;
            
            // Contar partidas completadas para este tamaño
            let completedForSize = 0;
            let totalTimeForSize = 0;
            
            // Usar la nueva estructura completedBySize si existe
            if (stats.completedBySize && stats.completedBySize[completedKey]) {
                completedForSize = stats.completedBySize[completedKey];
            } else {
                // Fallback: contar en bestTimes (cada entrada representa una partida completada)
                for (const key in stats.bestTimes) {
                    if (key.startsWith(`${puzzleDayIdentifier}-${size}`)) {
                        completedForSize++;
                        totalTimeForSize += stats.bestTimes[key];
                    }
                }
            }
            
            // Calcular tiempo total acumulado
            if (stats.timesBySize && stats.timesBySize[completedKey]) {
                // Usar los tiempos individuales almacenados para un cálculo preciso
                totalTimeForSize = stats.timesBySize[completedKey].reduce((sum, time) => sum + time, 0);
            } else if (stats.completedBySize && stats.completedBySize[completedKey]) {
                // Fallback: si no tenemos tiempos individuales, usar aproximación
                if (completedForSize === 1) {
                    totalTimeForSize = bestTimeForToday || 0;
                } else if (completedForSize > 1) {
                    // Para múltiples partidas, usamos una aproximación más conservadora
                    // Asumimos que el tiempo promedio es 1.2 veces el mejor tiempo
                    totalTimeForSize = bestTimeForToday ? Math.round(bestTimeForToday * completedForSize * 1.2) : 0;
                } else {
                    totalTimeForSize = 0;
                }
            } else {
                // Usar el cálculo anterior basado en bestTimes
                for (const key in stats.bestTimes) {
                    if (key.startsWith(`${puzzleDayIdentifier}-${size}`)) {
                        totalTimeForSize += stats.bestTimes[key];
                    }
                }
            }
            
            statsBySize[size] = {
                completed: completedForSize,
                bestTime: bestTimeForToday,
                totalTime: totalTimeForSize
            };
        });
        
        // Actualizar el HTML del modal con las estadísticas por tamaño
        const statsContainer = document.querySelector('.modal-stats-container');
        if (statsContainer) {
            statsContainer.innerHTML = '';
            
            gridSizes.forEach(size => {
                const sizeStats = statsBySize[size];
                const color = sizeStats.completed > 0 ? 'bg-emerald-700' : 'bg-slate-700';
                const sizeSection = document.createElement('div');
                sizeSection.className = `mb-4 p-3 ${color} rounded-lg` ;
                
                const sizeTitle = document.createElement('h4');
                sizeTitle.className = 'text-lg font-bold text-amber-300 mb-2';
                sizeTitle.textContent = `Tamaño (${size}x${size})`;
                
                const statsList = document.createElement('div');
                statsList.className = 'space-y-1 text-sm mb-3';
                
                // Partidas completadas
                const completedItem = document.createElement('div');
                completedItem.className = 'flex justify-between';
                completedItem.innerHTML = `<span>Partidas completadas:</span> <span class="font-mono font-bold">${sizeStats.completed}</span>`;
                
                // Mejor tiempo (hoy)
                const bestTimeItem = document.createElement('div');
                bestTimeItem.className = 'flex justify-between';
                bestTimeItem.innerHTML = `<span>Mejor tiempo (hoy):</span> <span class="font-mono font-bold">${formatTime(sizeStats.bestTime)}</span>`;
                
                // Tiempo acumulado
                const totalTimeItem = document.createElement('div');
                totalTimeItem.className = 'flex justify-between';
                totalTimeItem.innerHTML = `<span>Tiempo acumulado:</span> <span class="font-mono font-bold">${formatTime(sizeStats.totalTime)}</span>`;
                
                statsList.appendChild(completedItem);
                statsList.appendChild(bestTimeItem);
                statsList.appendChild(totalTimeItem);
                
                // Botones de compartir para este tamaño
                const shareButtons = document.createElement('div');
                shareButtons.className = 'flex justify-center items-center gap-2 mt-2';
                
                // Botón compartir en X
                const shareXBtn = document.createElement('button');
                shareXBtn.className = 'p-2 bg-slate-600 hover:bg-slate-500 rounded-full transition';
                shareXBtn.innerHTML = `
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path fill="white" d="M 2.3671875 3 L 9.4628906 13.140625 L 2.7402344 21 L 5.3808594 21 L 10.644531 14.830078 L 14.960938 21 L 21.871094 21 L 14.449219 10.375 L 20.740234 3 L 18.140625 3 L 13.271484 8.6875 L 9.2988281 3 L 2.3671875 3 z M 6.2070312 5 L 8.2558594 5 L 18.033203 19 L 16.001953 19 L 6.2070312 5 z"></path>
                    </svg>
                `;
                shareXBtn.addEventListener('click', () => {
                    const text = getShareTextForSize(size, sizeStats);
                    const encodedText = encodeURIComponent(text);
                    window.open(`https://twitter.com/intent/tweet?text=${encodedText}`, '_blank');
                });
                
                // Botón copiar enlace
                const copyBtn = document.createElement('button');
                copyBtn.className = 'p-2 bg-slate-600 hover:bg-slate-500 rounded-full transition';
                copyBtn.innerHTML = `
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                        <path fill="white" stroke="white" d="M48.186 92.137c0-8.392 6.49-14.89 16.264-14.89s29.827-.225 29.827-.225-.306-6.99-.306-15.88c0-8.888 7.954-14.96 17.49-14.96 9.538 0 56.786.401 61.422.401 4.636 0 8.397 1.719 13.594 5.67 5.196 3.953 13.052 10.56 16.942 14.962 3.89 4.402 5.532 6.972 5.532 10.604 0 3.633 0 76.856-.06 85.34-.059 8.485-7.877 14.757-17.134 14.881-9.257.124-29.135.124-29.135.124s.466 6.275.466 15.15-8.106 15.811-17.317 16.056c-9.21.245-71.944-.49-80.884-.245-8.94.245-16.975-6.794-16.975-15.422s.274-93.175.274-101.566zm16.734 3.946-1.152 92.853a3.96 3.96 0 0 0 3.958 4.012l73.913.22a3.865 3.865 0 0 0 3.91-3.978l-.218-8.892a1.988 1.988 0 0 0-2.046-1.953s-21.866.64-31.767.293c-9.902-.348-16.672-6.807-16.675-15.516-.003-8.709.003-69.142.003-69.142a1.989 1.989 0 0 0-2.007-1.993l-23.871.082a4.077 4.077 0 0 0-4.048 4.014zm106.508-35.258c-1.666-1.45-3.016-.84-3.016 1.372v17.255c0 1.106.894 2.007 1.997 2.013l20.868.101c2.204.011 2.641-1.156.976-2.606l-20.825-18.135zm-57.606.847a2.002 2.002 0 0 0-2.02 1.988l-.626 96.291a2.968 2.968 0 0 0 2.978 2.997l75.2-.186a2.054 2.054 0 0 0 2.044-2.012l1.268-62.421a1.951 1.951 0 0 0-1.96-2.004s-26.172.042-30.783.042c-4.611 0-7.535-2.222-7.535-6.482S152.3 63.92 152.3 63.92a2.033 2.033 0 0 0-2.015-2.018l-36.464-.23z"></path>
                    </svg>
                `;
                copyBtn.addEventListener('click', () => {
                    const text = getShareTextForSize(size, sizeStats);
                    navigator.clipboard.writeText(text).then(() => {
                        showCopyFeedback(copyBtn);
                    }).catch(() => {
                        // Fallback para navegadores antiguos
                        const textArea = document.createElement('textarea');
                        textArea.value = text;
                        document.body.appendChild(textArea);
                        textArea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textArea);
                        showCopyFeedback(copyBtn);
                    });
                });
                
                shareButtons.appendChild(shareXBtn);
                shareButtons.appendChild(copyBtn);
                
                sizeSection.appendChild(sizeTitle);
                sizeSection.appendChild(statsList);
                sizeSection.appendChild(shareButtons);
                statsContainer.appendChild(sizeSection);
            });
            
            // Botones de compartir generales al final
            const generalShareSection = document.createElement('div');
            generalShareSection.className = 'mt-6 p-3 bg-slate-600 rounded-lg';
            
            const generalTitle = document.createElement('h4');
            generalTitle.className = 'text-lg font-bold text-amber-300 mb-3 text-center';
            generalTitle.textContent = 'Compartir todas las estadísticas';
            
            const generalShareButtons = document.createElement('div');
            generalShareButtons.className = 'flex justify-center items-center gap-4';
            
            // Botón compartir en X general
            const generalShareXBtn = document.createElement('button');
            generalShareXBtn.className = 'p-3 bg-slate-700 hover:bg-slate-600 rounded-full transition';
            generalShareXBtn.innerHTML = `
                <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path fill="white" d="M 2.3671875 3 L 9.4628906 13.140625 L 2.7402344 21 L 5.3808594 21 L 10.644531 14.830078 L 14.960938 21 L 21.871094 21 L 14.449219 10.375 L 20.740234 3 L 18.140625 3 L 13.271484 8.6875 L 9.2988281 3 L 2.3671875 3 z M 6.2070312 5 L 8.2558594 5 L 18.033203 19 L 16.001953 19 L 6.2070312 5 z"></path>
                </svg>
            `;
            generalShareXBtn.addEventListener('click', () => {
                const text = getShareTextForAllSizes(statsBySize);
                const encodedText = encodeURIComponent(text);
                window.open(`https://twitter.com/intent/tweet?text=${encodedText}`, '_blank');
            });
            
            // Botón copiar enlace general
            const generalCopyBtn = document.createElement('button');
            generalCopyBtn.className = 'p-3 bg-slate-700 hover:bg-slate-600 rounded-full transition';
            generalCopyBtn.innerHTML = `
                <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                    <path fill="white" stroke="white" d="M48.186 92.137c0-8.392 6.49-14.89 16.264-14.89s29.827-.225 29.827-.225-.306-6.99-.306-15.88c0-8.888 7.954-14.96 17.49-14.96 9.538 0 56.786.401 61.422.401 4.636 0 8.397 1.719 13.594 5.67 5.196 3.953 13.052 10.56 16.942 14.962 3.89 4.402 5.532 6.972 5.532 10.604 0 3.633 0 76.856-.06 85.34-.059 8.485-7.877 14.757-17.134 14.881-9.257.124-29.135.124-29.135.124s.466 6.275.466 15.15-8.106 15.811-17.317 16.056c-9.21.245-71.944-.49-80.884-.245-8.94.245-16.975-6.794-16.975-15.422s.274-93.175.274-101.566zm16.734 3.946-1.152 92.853a3.96 3.96 0 0 0 3.958 4.012l73.913.22a3.865 3.865 0 0 0 3.91-3.978l-.218-8.892a1.988 1.988 0 0 0-2.046-1.953s-21.866.64-31.767.293c-9.902-.348-16.672-6.807-16.675-15.516-.003-8.709.003-69.142.003-69.142a1.989 1.989 0 0 0-2.007-1.993l-23.871.082a4.077 4.077 0 0 0-4.048 4.014zm106.508-35.258c-1.666-1.45-3.016-.84-3.016 1.372v17.255c0 1.106.894 2.007 1.997 2.013l20.868.101c2.204.011 2.641-1.156.976-2.606l-20.825-18.135zm-57.606.847a2.002 2.002 0 0 0-2.02 1.988l-.626 96.291a2.968 2.968 0 0 0 2.978 2.997l75.2-.186a2.054 2.054 0 0 0 2.044-2.012l1.268-62.421a1.951 1.951 0 0 0-1.96-2.004s-26.172.042-30.783.042c-4.611 0-7.535-2.222-7.535-6.482S152.3 63.92 152.3 63.92a2.033 2.033 0 0 0-2.015-2.018l-36.464-.23z"></path>
                </svg>
            `;
            generalCopyBtn.addEventListener('click', () => {
                const text = getShareTextForAllSizes(statsBySize);
                navigator.clipboard.writeText(text).then(() => {
                    showCopyFeedback(generalCopyBtn);
                }).catch(() => {
                    // Fallback para navegadores antiguos
                    const textArea = document.createElement('textarea');
                    textArea.value = text;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    showCopyFeedback(generalCopyBtn);
                });
            });
            
            generalShareButtons.appendChild(generalShareXBtn);
            generalShareButtons.appendChild(generalCopyBtn);
            
            generalShareSection.appendChild(generalTitle);
            generalShareSection.appendChild(generalShareButtons);
            statsContainer.appendChild(generalShareSection);
        }
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
        const directions = [
            { r: 0, c: 1 },   // ➡️ Horizontal (izquierda a derecha)
            { r: 0, c: -1 },  // ⬅️ Horizontal (derecha a izquierda)
            { r: 1, c: 0 },   // ⬇️ Vertical (arriba a abajo)
            { r: -1, c: 0 },  // ⬆️ Vertical (abajo a arriba)
            { r: 1, c: 1 },   // ↘️ Diagonal (esquina superior izquierda a inferior derecha)
            { r: -1, c: -1 }, // ↖️ Diagonal (esquina inferior derecha a superior izquierda)
            { r: 1, c: -1 },  // ↙️ Diagonal (esquina superior derecha a inferior izquierda)
            { r: -1, c: 1 }   // ↗️ Diagonal (esquina inferior izquierda a superior derecha)
        ];
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

                // Lanzar efecto de palabra completada
                launchWordCompletionEffect(word, selectionCoords);

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
        launchPanelCompletionEffect();
        stats.gamesCompleted++;
        stats.totalCompletionTime += finalTime;
        const bestTimeKey = `${puzzleDayIdentifier}-${gridSize}`;
        const currentBest = stats.bestTimes[bestTimeKey];
        if (!currentBest || finalTime < currentBest) {
            stats.bestTimes[bestTimeKey] = finalTime;
        }
        
        // Almacenar también el número de partidas completadas por tamaño
        if (!stats.completedBySize) {
            stats.completedBySize = {};
        }
        const completedKey = `${puzzleDayIdentifier}-${gridSize}`;
        if (!stats.completedBySize[completedKey]) {
            stats.completedBySize[completedKey] = 0;
        }
        stats.completedBySize[completedKey]++;
        
        // Almacenar todos los tiempos individuales para cálculo preciso
        if (!stats.timesBySize) {
            stats.timesBySize = {};
        }
        const timesKey = `${puzzleDayIdentifier}-${gridSize}`;
        if (!stats.timesBySize[timesKey]) {
            stats.timesBySize[timesKey] = [];
        }
        stats.timesBySize[timesKey].push(finalTime);
        
        saveStats();
        
        // Verificar si se han completado los 3 tamaños
        checkTripleCompletion();
        
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
        if(stats.completedBySize) {
            for (const key in stats.completedBySize) {
                if (key.startsWith(`${dayId}-`)) {
                    delete stats.completedBySize[key];
                    progressFound = true;
                }
            }
        }
        if(stats.timesBySize) {
            for (const key in stats.timesBySize) {
                if (key.startsWith(`${dayId}-`)) {
                    delete stats.timesBySize[key];
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

    function getShareTextForSize(size, sizeStats) {
        return `¡He resuelto la Sopa de Letras Diaria! 🎉\nTema: ${currentPuzzle.theme}\nTamaño: ${size}x${size}\nPartidas completadas: ${sizeStats.completed}\nMejor tiempo: ${formatTime(sizeStats.bestTime)}\nTiempo acumulado: ${formatTime(sizeStats.totalTime)}\n¡Inténtalo tú también en https://palabrix.anieto2k.com! #palabrix`;
    }

    function getShareTextForAllSizes(statsBySize) {
        let text = `¡He resuelto la Sopa de Letras Diaria! 🎉\nTema: ${currentPuzzle.theme}\n\nMis estadísticas:\n `;
        
        Object.entries(statsBySize).forEach(([size, stats]) => {
            if (stats.completed > 0) {
                text += `• ${size}x${size}: ${stats.completed} partidas, mejor tiempo ${formatTime(stats.bestTime)}\n`;
            }
        });
        
        text += `\n¡Inténtalo tú también en https://palabrix.anieto2k.com! #palabrix`;
        return text;
    }

    function showCopyFeedback(button) {
        const originalHTML = button.innerHTML;
        button.innerHTML = '<span class="text-green-400 text-xs">¡Copiado!</span>';
        setTimeout(() => { 
            button.innerHTML = originalHTML; 
        }, 2000);
    }


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
        elements.modalTitle.textContent = `Puzle (${gridSize}x${gridSize}) del día completado`;
        const bestTimeKey = `${puzzleDayIdentifier}-${gridSize}`;
        finalTime = stats.bestTimes[bestTimeKey]; // Set finalTime for sharing
        elements.modalText.innerHTML = `Tu tiempo para ${gridSize}x${gridSize} ha sido de <strong>${formatTime(finalTime)}.</strong>`;
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

    function checkTripleCompletion() {
        const gridSizes = [16, 20, 24];
        let completedSizes = 0;
        
        gridSizes.forEach(size => {
            const completedKey = `${puzzleDayIdentifier}-${size}`;
            if (stats.completedBySize && stats.completedBySize[completedKey] && stats.completedBySize[completedKey] > 0) {
                completedSizes++;
            }
        });
        
        // Si se han completado los 3 tamaños, ejecutar el efecto especial
        if (completedSizes === 3) {
            console.log('¡TRIPLE CORONA! Se han completado los 3 tamaños en un día.');
            setTimeout(() => {
                launchTripleCompletionEffect();
            }, 2000); // Esperar 2 segundos después del confeti normal
        }
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
  // 1) Intento preferente horizontal (para estabilizar tests que escanean por filas)
  const horizontalDirections = [
    { r: 0, c: 1 },   // ➡️ Horizontal (izquierda a derecha)
    { r: 0, c: -1 }   // ⬅️ Horizontal (derecha a izquierda)
  ];
  for (const dir of horizontalDirections) {
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (canPlaceWord(grid, word, row, col, dir, gridSize)) {
          for (let i = 0; i < word.length; i++) {
            const r = row + i * dir.r;
            const c = col + i * dir.c;
            grid[r][c] = { ...grid[r][c], char: word[i], isWord: true };
          }
          return true;
        }
      }
    }
  }

  // 2) Si no se pudo en horizontal, intentar con todas las direcciones de forma aleatoria
  const allDirections = [
    ...horizontalDirections,
    { r: 1, c: 0 },   // ⬇️ Vertical (arriba a abajo)
    { r: -1, c: 0 },  // ⬆️ Vertical (abajo a arriba)
    { r: 1, c: 1 },   // ↘️ Diagonal (esquina superior izquierda a inferior derecha)
    { r: -1, c: -1 }, // ↖️ Diagonal (esquina inferior derecha a superior izquierda)
    { r: 1, c: -1 },  // ↙️ Diagonal (esquina superior derecha a inferior izquierda)
    { r: -1, c: 1 }   // ↗️ Diagonal (esquina inferior izquierda a superior derecha)
  ];
  let placed = false;
  let attempts = 0;
  while (!placed && attempts < 200) {
    const dir = allDirections[Math.floor(rng() * allDirections.length)];
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
  if (placed) return true;

  // 3) Último recurso: escaneo determinista de todas las celdas y direcciones
  for (const dir of allDirections) {
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (canPlaceWord(grid, word, row, col, dir, gridSize)) {
          for (let i = 0; i < word.length; i++) {
            const r = row + i * dir.r;
            const c = col + i * dir.c;
            grid[r][c] = { ...grid[r][c], char: word[i], isWord: true };
          }
          return true;
        }
      }
    }
  }
  return false;
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