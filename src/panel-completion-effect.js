// panel-completion-effect.js
// Efecto espectacular para cuando se completa un panel/puzzle

export function launchPanelCompletionEffect() {
    // Crear overlay de fondo con gradiente animado
    const overlay = document.createElement('div');
    overlay.id = 'panel-completion-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        background-size: 400% 400%;
        animation: gradientShift 4s ease-in-out infinite;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        opacity: 0;
        transition: opacity 0.8s ease-in-out;
        pointer-events: none;
    `;
    
    // Añadir keyframes para el gradiente animado
    const style = document.createElement('style');
    style.textContent = `
        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-30px) rotate(180deg); }
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
        }
        
        @keyframes sparkle {
            0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
            50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }
        
        @keyframes firework {
            0% { transform: scale(0); opacity: 1; }
            100% { transform: scale(1); opacity: 0; }
        }
        
        @keyframes trophy-bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0) scale(1); }
            40% { transform: translateY(-50px) scale(1.1); }
            60% { transform: translateY(-25px) scale(1.05); }
        }
        
        @keyframes text-glow {
            0%, 100% { text-shadow: 0 0 10px #FFD700, 0 0 20px #FFD700, 0 0 30px #FFD700; }
            50% { text-shadow: 0 0 20px #FFD700, 0 0 30px #FFD700, 0 0 40px #FFD700; }
        }
        
        @keyframes star-rotate {
            0% { transform: rotate(0deg) scale(1); }
            50% { transform: rotate(180deg) scale(1.2); }
            100% { transform: rotate(360deg) scale(1); }
        }
        
        .panel-completion-text {
            font-size: 3.5rem;
            font-weight: bold;
            color: white;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            text-align: center;
            animation: pulse 2s ease-in-out infinite, text-glow 3s ease-in-out infinite;
            z-index: 10001;
            margin-bottom: 1rem;
        }
        
        .panel-completion-subtitle {
            font-size: 1.3rem;
            color: white;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
            text-align: center;
            margin-top: 0.5rem;
            animation: float 3s ease-in-out infinite;
            z-index: 10001;
        }
        
        .trophy-large {
            font-size: 6rem;
            animation: trophy-bounce 2s ease-in-out infinite;
            z-index: 10001;
            filter: drop-shadow(0 0 30px rgba(255, 215, 0, 0.8));
            margin: 1rem 0;
        }
        
        .stars-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 10000;
        }
        
        .star {
            position: absolute;
            font-size: 2rem;
            color: #FFD700;
            animation: star-rotate 3s linear infinite;
            filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.8));
        }
        
        .sparkle {
            position: absolute;
            width: 15px;
            height: 15px;
            background: radial-gradient(circle, #fff, #ffd700);
            border-radius: 50%;
            animation: sparkle 2s ease-in-out infinite;
            z-index: 10002;
        }
        
        .firework {
            position: absolute;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            animation: firework 1.5s ease-out forwards;
            z-index: 10003;
        }
        
        .celebration-particles {
            position: absolute;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            animation: particle-celebration 2s ease-out forwards;
            z-index: 10004;
        }
        
        @keyframes particle-celebration {
            0% {
                transform: translate(0, 0) scale(1);
                opacity: 1;
            }
            100% {
                transform: translate(var(--tx), var(--ty)) scale(0);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Crear texto principal
    const mainText = document.createElement('div');
    mainText.className = 'panel-completion-text';
    mainText.textContent = '¡PUZZLE COMPLETADO!';
    
    // Crear subtítulo
    const subtitle = document.createElement('div');
    subtitle.className = 'panel-completion-subtitle';
    subtitle.textContent = '¡Excelente trabajo!';
    
    // Crear trofeo grande
    const trophy = document.createElement('div');
    trophy.className = 'trophy-large';
    trophy.innerHTML = '🏆';
    
    // Crear contenedor de estrellas
    const starsContainer = document.createElement('div');
    starsContainer.className = 'stars-container';
    
    // Añadir elementos al overlay
    overlay.appendChild(mainText);
    overlay.appendChild(trophy);
    overlay.appendChild(subtitle);
    overlay.appendChild(starsContainer);
    
    // Añadir overlay al body
    document.body.appendChild(overlay);
    
    // Mostrar overlay con fade in
    setTimeout(() => {
        overlay.style.opacity = '1';
    }, 100);
    
    // Crear estrellas
    createStars(starsContainer);
    
    // Crear sparkles
    createSparkles(overlay);
    
    // Crear fuegos artificiales
    createFireworks(overlay);
    
    // Crear partículas de celebración
    createCelebrationParticles(overlay);
    
    // Crear ondas de choque
    createShockwaves(overlay);
    
    // Reproducir sonido de celebración
    playCelebrationSound();
    
    // Remover overlay después de 6 segundos
    setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }
            if (document.head.contains(style)) {
                document.head.removeChild(style);
            }
        }, 800);
    }, 6000);
}

function createStars(container) {
    const starCount = 12;
    const stars = ['⭐', '🌟', '💫', '✨'];
    
    for (let i = 0; i < starCount; i++) {
        setTimeout(() => {
            const star = document.createElement('div');
            star.className = 'star';
            star.textContent = stars[Math.floor(Math.random() * stars.length)];
            star.style.left = Math.random() * 100 + 'vw';
            star.style.top = Math.random() * 100 + 'vh';
            star.style.animationDelay = Math.random() * 2 + 's';
            container.appendChild(star);
            
            setTimeout(() => star.remove(), 6000);
        }, i * 200);
    }
}

function createSparkles(overlay) {
    const sparkleCount = 30;
    
    for (let i = 0; i < sparkleCount; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.left = Math.random() * 100 + 'vw';
            sparkle.style.top = Math.random() * 100 + 'vh';
            sparkle.style.animationDelay = Math.random() * 2 + 's';
            overlay.appendChild(sparkle);
            
            setTimeout(() => sparkle.remove(), 3000);
        }, i * 150);
    }
}

function createFireworks(overlay) {
    const fireworkCount = 20;
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#ffd700'];
    
    for (let i = 0; i < fireworkCount; i++) {
        setTimeout(() => {
            const firework = document.createElement('div');
            firework.className = 'firework';
            firework.style.left = Math.random() * 100 + 'vw';
            firework.style.top = Math.random() * 100 + 'vh';
            firework.style.background = colors[Math.floor(Math.random() * colors.length)];
            overlay.appendChild(firework);
            
            setTimeout(() => firework.remove(), 1500);
        }, i * 300);
    }
}

function createCelebrationParticles(overlay) {
    const particleCount = 50;
    const colors = ['#FFD700', '#FF69B4', '#00CFFF', '#FF6347', '#7CFC00', '#FFB347', '#FF1493', '#00CED1'];
    
    for (let i = 0; i < particleCount; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'celebration-particles';
            particle.style.cssText = `
                position: fixed;
                left: 50vw;
                top: 50vh;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                --tx: ${(Math.random() - 0.5) * 400}px;
                --ty: ${(Math.random() - 0.5) * 400}px;
            `;
            overlay.appendChild(particle);
            
            setTimeout(() => particle.remove(), 2000);
        }, i * 50);
    }
}

function createShockwaves(overlay) {
    const shockwaveCount = 3;
    
    for (let i = 0; i < shockwaveCount; i++) {
        setTimeout(() => {
            const shockwave = document.createElement('div');
            shockwave.style.cssText = `
                position: fixed;
                left: 50vw;
                top: 50vh;
                transform: translate(-50%, -50%);
                width: 0;
                height: 0;
                border: 3px solid #FFD700;
                border-radius: 50%;
                pointer-events: none;
                z-index: 9998;
                animation: shockwave-expand 2s ease-out forwards;
            `;
            
            // Añadir keyframes para la onda de choque
            if (!document.querySelector('#shockwave-expand-keyframes')) {
                const style = document.createElement('style');
                style.id = 'shockwave-expand-keyframes';
                style.textContent = `
                    @keyframes shockwave-expand {
                        0% {
                            width: 0;
                            height: 0;
                            opacity: 1;
                            border-width: 3px;
                        }
                        100% {
                            width: 300px;
                            height: 300px;
                            opacity: 0;
                            border-width: 1px;
                        }
                    }
                `;
                document.head.appendChild(style);
            }
            
            overlay.appendChild(shockwave);
            setTimeout(() => shockwave.remove(), 2000);
        }, i * 800);
    }
}

function playCelebrationSound() {
    if (typeof Audio !== 'undefined') {
        try {
            // Crear un sonido de celebración usando Web Audio API
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator1 = audioContext.createOscillator();
            const oscillator2 = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator1.connect(gainNode);
            oscillator2.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Melodía de celebración
            oscillator1.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator1.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
            oscillator1.frequency.setValueAtTime(1200, audioContext.currentTime + 0.2);
            oscillator1.frequency.setValueAtTime(1000, audioContext.currentTime + 0.3);
            
            oscillator2.frequency.setValueAtTime(600, audioContext.currentTime);
            oscillator2.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
            oscillator2.frequency.setValueAtTime(1000, audioContext.currentTime + 0.2);
            oscillator2.frequency.setValueAtTime(800, audioContext.currentTime + 0.3);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
            
            oscillator1.start(audioContext.currentTime);
            oscillator2.start(audioContext.currentTime);
            oscillator1.stop(audioContext.currentTime + 0.4);
            oscillator2.stop(audioContext.currentTime + 0.4);
        } catch (e) {
            // Silenciar errores de audio
        }
    }
}
