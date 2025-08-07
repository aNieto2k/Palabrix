// word-completion-effect.js
// Efectos visuales para cuando se completa una palabra correcta

export function launchWordCompletionEffect(word, selectionCoords) {
    // Crear efecto de partículas alrededor de la palabra
    createParticleEffect(selectionCoords);
    
    // Crear efecto de texto flotante
    createFloatingText(word, selectionCoords);
    
    // Crear efecto de pulso en las celdas
    createPulseEffect(selectionCoords);
    
    // Crear efecto de sparkles
    createSparkles(selectionCoords);
}

function createParticleEffect(selectionCoords) {
    const colors = ['#FFD700', '#FF69B4', '#00CFFF', '#FF6347', '#7CFC00', '#FFB347'];
    const particleCount = 15;
    
    selectionCoords.forEach(coord => {
        const rect = coord.el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                left: ${centerX}px;
                top: ${centerY}px;
                width: 4px;
                height: 4px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
                animation: particle-explosion 1s ease-out forwards;
            `;
            
            // Añadir keyframes para la animación
            if (!document.querySelector('#particle-keyframes')) {
                const style = document.createElement('style');
                style.id = 'particle-keyframes';
                style.textContent = `
                    @keyframes particle-explosion {
                        0% {
                            transform: translate(0, 0) scale(1);
                            opacity: 1;
                        }
                        100% {
                            transform: translate(${(Math.random() - 0.5) * 100}px, ${(Math.random() - 0.5) * 100}px) scale(0);
                            opacity: 0;
                        }
                    }
                `;
                document.head.appendChild(style);
            }
            
            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 1000);
        }
    });
}

function createFloatingText(word, selectionCoords) {
    // Calcular el centro de la selección
    const rects = selectionCoords.map(coord => coord.el.getBoundingClientRect());
    const centerX = rects.reduce((sum, rect) => sum + rect.left + rect.width / 2, 0) / rects.length;
    const centerY = rects.reduce((sum, rect) => sum + rect.top + rect.height / 2, 0) / rects.length;
    
    const floatingText = document.createElement('div');
    floatingText.style.cssText = `
        position: fixed;
        left: ${centerX}px;
        top: ${centerY}px;
        transform: translate(-50%, -50%);
        font-size: 1.5rem;
        font-weight: bold;
        color: #FFD700;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        pointer-events: none;
        z-index: 1001;
        animation: floating-text 2s ease-out forwards;
        white-space: nowrap;
    `;
    floatingText.textContent = `¡${word}!`;
    
    // Añadir keyframes para la animación
    if (!document.querySelector('#floating-text-keyframes')) {
        const style = document.createElement('style');
        style.id = 'floating-text-keyframes';
        style.textContent = `
            @keyframes floating-text {
                0% {
                    transform: translate(-50%, -50%) scale(0.5);
                    opacity: 0;
                }
                20% {
                    transform: translate(-50%, -50%) scale(1.2);
                    opacity: 1;
                }
                80% {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 1;
                }
                100% {
                    transform: translate(-50%, -50%) scale(1) translateY(-50px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(floatingText);
    setTimeout(() => floatingText.remove(), 2000);
}

function createPulseEffect(selectionCoords) {
    selectionCoords.forEach(coord => {
        const cell = coord.el;
        cell.style.animation = 'cell-pulse 0.6s ease-out';
        
        // Añadir keyframes para la animación
        if (!document.querySelector('#cell-pulse-keyframes')) {
            const style = document.createElement('style');
            style.id = 'cell-pulse-keyframes';
            style.textContent = `
                @keyframes cell-pulse {
                    0% {
                        transform: scale(1);
                        box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.7);
                    }
                    50% {
                        transform: scale(1.1);
                        box-shadow: 0 0 0 10px rgba(255, 215, 0, 0.3);
                    }
                    100% {
                        transform: scale(1);
                        box-shadow: 0 0 0 0 rgba(255, 215, 0, 0);
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        setTimeout(() => {
            cell.style.animation = '';
        }, 600);
    });
}

function createSparkles(selectionCoords) {
    const sparkleCount = 8;
    
    selectionCoords.forEach(coord => {
        const rect = coord.el.getBoundingClientRect();
        
        for (let i = 0; i < sparkleCount; i++) {
            setTimeout(() => {
                const sparkle = document.createElement('div');
                sparkle.style.cssText = `
                    position: fixed;
                    left: ${rect.left + Math.random() * rect.width}px;
                    top: ${rect.top + Math.random() * rect.height}px;
                    width: 12px;
                    height: 12px;
                    background: radial-gradient(circle, #fff, #ffd700);
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 1002;
                    animation: sparkle-effect 1.5s ease-in-out infinite;
                `;
                
                // Añadir keyframes para la animación
                if (!document.querySelector('#sparkle-effect-keyframes')) {
                    const style = document.createElement('style');
                    style.id = 'sparkle-effect-keyframes';
                    style.textContent = `
                        @keyframes sparkle-effect {
                            0%, 100% {
                                opacity: 0;
                                transform: scale(0) rotate(0deg);
                            }
                            50% {
                                opacity: 1;
                                transform: scale(1) rotate(180deg);
                            }
                        }
                    `;
                    document.head.appendChild(style);
                }
                
                document.body.appendChild(sparkle);
                setTimeout(() => sparkle.remove(), 1500);
            }, i * 100);
        }
    });
}

// Efecto adicional: ondas de choque
export function createShockwaveEffect(selectionCoords) {
    const rects = selectionCoords.map(coord => coord.el.getBoundingClientRect());
    const centerX = rects.reduce((sum, rect) => sum + rect.left + rect.width / 2, 0) / rects.length;
    const centerY = rects.reduce((sum, rect) => sum + rect.top + rect.height / 2, 0) / rects.length;
    
    const shockwave = document.createElement('div');
    shockwave.style.cssText = `
        position: fixed;
        left: ${centerX}px;
        top: ${centerY}px;
        transform: translate(-50%, -50%);
        width: 0;
        height: 0;
        border: 2px solid #FFD700;
        border-radius: 50%;
        pointer-events: none;
        z-index: 999;
        animation: shockwave 1s ease-out forwards;
    `;
    
    // Añadir keyframes para la animación
    if (!document.querySelector('#shockwave-keyframes')) {
        const style = document.createElement('style');
        style.id = 'shockwave-keyframes';
        style.textContent = `
            @keyframes shockwave {
                0% {
                    width: 0;
                    height: 0;
                    opacity: 1;
                    border-width: 2px;
                }
                100% {
                    width: 200px;
                    height: 200px;
                    opacity: 0;
                    border-width: 1px;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(shockwave);
    setTimeout(() => shockwave.remove(), 1000);
}
