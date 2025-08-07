import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { launchTripleCompletionEffect } from './triple-completion-effect.js';

describe('triple-completion-effect.js', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        document.head.innerHTML = '';
    });

    afterEach(() => {
        document.body.innerHTML = '';
        document.head.innerHTML = '';
    });

    it('debería crear el overlay de triple completación', () => {
        launchTripleCompletionEffect();
        const overlay = document.getElementById('triple-completion-overlay');
        expect(overlay).toBeTruthy();
        expect(overlay.style.position).toBe('fixed');
        expect(overlay.style.zIndex).toBe('10000');
    });

    it('debería crear elementos de texto y trofeo', () => {
        launchTripleCompletionEffect();
        const overlay = document.getElementById('triple-completion-overlay');
        const mainText = overlay.querySelector('.triple-completion-text');
        const subtitle = overlay.querySelector('.triple-completion-subtitle');
        const trophy = overlay.querySelector('.trophy');
        
        expect(mainText).toBeTruthy();
        expect(mainText.textContent).toBe('¡TRIPLE CORONA!');
        expect(subtitle).toBeTruthy();
        expect(subtitle.textContent).toBe('¡Has completado los 3 tamaños en un día!');
        expect(trophy).toBeTruthy();
        expect(trophy.innerHTML).toBe('🏆');
    });

    it('debería añadir estilos CSS al head', () => {
        launchTripleCompletionEffect();
        const styles = document.head.querySelector('style');
        expect(styles).toBeTruthy();
        expect(styles.textContent).toContain('@keyframes gradientShift');
        expect(styles.textContent).toContain('@keyframes float');
        expect(styles.textContent).toContain('@keyframes pulse');
    });

    it('debería crear sparkles y fuegos artificiales', () => {
        launchTripleCompletionEffect();
        const overlay = document.getElementById('triple-completion-overlay');
        
        // Esperar un poco para que se creen los elementos
        setTimeout(() => {
            const sparkles = overlay.querySelectorAll('.sparkle');
            const fireworks = overlay.querySelectorAll('.firework');
            expect(sparkles.length).toBeGreaterThan(0);
            expect(fireworks.length).toBeGreaterThan(0);
        }, 100);
    });
});
