// triple-completion-effect.js
// Efecto especial para cuando se completan los 3 tamaños en un día

export function launchTripleCompletionEffect() {
    // Crear overlay de fondo con gradiente animado
    const overlay = document.createElement('div');
    overlay.id = 'triple-completion-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3);
        background-size: 400% 400%;
        animation: gradientShift 3s ease-in-out infinite;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        opacity: 0;
        transition: opacity 0.5s ease-in-out;
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
            50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        
        @keyframes sparkle {
            0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
            50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }
        
        @keyframes firework {
            0% { transform: scale(0); opacity: 1; }
            100% { transform: scale(1); opacity: 0; }
        }
        
        .triple-completion-text {
            font-size: 4rem;
            font-weight: bold;
            color: white;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            text-align: center;
            animation: pulse 2s ease-in-out infinite;
            z-index: 10001;
        }
        
        .triple-completion-subtitle {
            font-size: 1.5rem;
            color: white;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
            text-align: center;
            margin-top: 1rem;
            animation: float 3s ease-in-out infinite;
            z-index: 10001;
        }
        
        .sparkle {
            position: absolute;
            width: 20px;
            height: 20px;
            background: radial-gradient(circle, #fff, #ffd700);
            border-radius: 50%;
            animation: sparkle 1.5s ease-in-out infinite;
            z-index: 10002;
        }
        
        .firework {
            position: absolute;
            width: 4px;
            height: 4px;
            border-radius: 50%;
            animation: firework 1s ease-out forwards;
            z-index: 10003;
        }
        
        .trophy {
            font-size: 8rem;
            animation: float 2s ease-in-out infinite;
            z-index: 10001;
            filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.8));
        }
    `;
    document.head.appendChild(style);
    
    // Crear texto principal
    const mainText = document.createElement('div');
    mainText.className = 'triple-completion-text';
    mainText.textContent = '¡TRIPLE CORONA!';
    
    // Crear subtítulo
    const subtitle = document.createElement('div');
    subtitle.className = 'triple-completion-subtitle';
    subtitle.textContent = '¡Has completado los 3 tamaños en un día!';
    
    // Crear trofeo
    const trophy = document.createElement('div');
    trophy.className = 'trophy';
    trophy.innerHTML = '🏆';
    
    // Añadir elementos al overlay
    overlay.appendChild(mainText);
    overlay.appendChild(subtitle);
    overlay.appendChild(trophy);
    
    // Añadir overlay al body
    document.body.appendChild(overlay);
    
    // Mostrar overlay con fade in
    setTimeout(() => {
        overlay.style.opacity = '1';
    }, 100);
    
    // Crear sparkles
    const createSparkles = () => {
        for (let i = 0; i < 20; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.left = Math.random() * 100 + 'vw';
            sparkle.style.top = Math.random() * 100 + 'vh';
            sparkle.style.animationDelay = Math.random() * 2 + 's';
            overlay.appendChild(sparkle);
            
            setTimeout(() => sparkle.remove(), 3000);
        }
    };
    
    // Crear fuegos artificiales
    const createFireworks = () => {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#ffd700'];
        
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const firework = document.createElement('div');
                firework.className = 'firework';
                firework.style.left = Math.random() * 100 + 'vw';
                firework.style.top = Math.random() * 100 + 'vh';
                firework.style.background = colors[Math.floor(Math.random() * colors.length)];
                overlay.appendChild(firework);
                
                setTimeout(() => firework.remove(), 1000);
            }, i * 200);
        }
    };
    
    // Crear confeti especial
    const createSpecialConfetti = () => {
        const colors = ['#FFD700', '#FF69B4', '#00CFFF', '#FF6347', '#7CFC00', '#FFB347', '#FF1493', '#00CED1'];
        const shapes = ['★', '♦', '●', '▲', '■', '♥'];
        
        for (let i = 0; i < 200; i++) {
            setTimeout(() => {
                const conf = document.createElement('div');
                conf.style.cssText = `
                    position: fixed;
                    top: -10px;
                    left: ${Math.random() * 100}vw;
                    font-size: ${Math.random() * 20 + 10}px;
                    color: ${colors[Math.floor(Math.random() * colors.length)]};
                    z-index: 10004;
                    pointer-events: none;
                    animation: confetti-fall 4s linear forwards;
                    transform: rotate(${Math.random() * 360}deg);
                `;
                conf.textContent = shapes[Math.floor(Math.random() * shapes.length)];
                document.body.appendChild(conf);
                
                setTimeout(() => conf.remove(), 4000);
            }, i * 20);
        }
    };
    
    // Ejecutar efectos
    createSparkles();
    setTimeout(createFireworks, 500);
    setTimeout(createSpecialConfetti, 1000);
    
    // Crear más sparkles periódicamente
    const sparkleInterval = setInterval(createSparkles, 2000);
    
    // Remover overlay después de 8 segundos
    setTimeout(() => {
        overlay.style.opacity = '0';
        clearInterval(sparkleInterval);
        setTimeout(() => {
            document.body.removeChild(overlay);
            document.head.removeChild(style);
        }, 500);
    }, 8000);
    
    // Reproducir sonido si está disponible
    if (typeof Audio !== 'undefined') {
        try {
            // Crear un beep simple usando Web Audio API
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (e) {
            // Silenciar errores de audio
        }
    }
}
