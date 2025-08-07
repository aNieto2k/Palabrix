import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { launchPanelCompletionEffect } from './panel-completion-effect.js';

describe('panel-completion-effect.js', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        document.head.innerHTML = '';
    });

    afterEach(() => {
        document.body.innerHTML = '';
        document.head.innerHTML = '';
    });

    it('debería crear el overlay de completación de panel', () => {
        launchPanelCompletionEffect();
        const overlay = document.getElementById('panel-completion-overlay');
        expect(overlay).toBeTruthy();
        expect(overlay.style.position).toBe('fixed');
        expect(overlay.style.zIndex).toBe('9999');
    });

    it('debería crear elementos de texto y trofeo', () => {
        launchPanelCompletionEffect();
        const overlay = document.getElementById('panel-completion-overlay');
        const mainText = overlay.querySelector('.panel-completion-text');
        const subtitle = overlay.querySelector('.panel-completion-subtitle');
        const trophy = overlay.querySelector('.trophy-large');
        
        expect(mainText).toBeTruthy();
        expect(mainText.textContent).toBe('¡PUZZLE COMPLETADO!');
        expect(subtitle).toBeTruthy();
        expect(subtitle.textContent).toBe('¡Excelente trabajo!');
        expect(trophy).toBeTruthy();
        expect(trophy.innerHTML).toBe('🏆');
    });

    it('debería crear estrellas y sparkles', async () => {
        launchPanelCompletionEffect();
        const overlay = document.getElementById('panel-completion-overlay');
        
        // Esperar un poco para que se creen los elementos
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const stars = overlay.querySelectorAll('.star');
        const sparkles = overlay.querySelectorAll('.sparkle');
        expect(stars.length).toBeGreaterThan(0);
        expect(sparkles.length).toBeGreaterThan(0);
    });

    it('debería añadir estilos CSS al head', async () => {
        launchPanelCompletionEffect();
        
        // Esperar un poco para que se añadan todos los estilos
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const styles = document.head.querySelectorAll('style');
        expect(styles.length).toBeGreaterThan(0);
        
        const styleContent = Array.from(styles).map(style => style.textContent).join('');
        expect(styleContent).toContain('@keyframes gradientShift');
        expect(styleContent).toContain('@keyframes trophy-bounce');
        expect(styleContent).toContain('@keyframes text-glow');
    });

    it('debería crear fuegos artificiales y partículas', async () => {
        launchPanelCompletionEffect();
        const overlay = document.getElementById('panel-completion-overlay');
        
        // Esperar un poco para que se creen los elementos
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const fireworks = overlay.querySelectorAll('.firework');
        const particles = overlay.querySelectorAll('.celebration-particles');
        expect(fireworks.length).toBeGreaterThan(0);
        expect(particles.length).toBeGreaterThan(0);
    });
});
