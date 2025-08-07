import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { launchWordCompletionEffect } from './word-completion-effect.js';

describe('word-completion-effect.js', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        document.head.innerHTML = '';
    });

    afterEach(() => {
        document.body.innerHTML = '';
        document.head.innerHTML = '';
    });

    it('debería crear efectos de partículas', () => {
        // Crear elementos mock para las coordenadas
        const mockCell = document.createElement('div');
        mockCell.style.position = 'absolute';
        mockCell.style.left = '100px';
        mockCell.style.top = '100px';
        mockCell.style.width = '50px';
        mockCell.style.height = '50px';
        document.body.appendChild(mockCell);
        
        const mockCoords = [{ el: mockCell }];
        
        launchWordCompletionEffect('TEST', mockCoords);
        
        // Verificar que se crearon partículas
        const particles = document.querySelectorAll('div[style*="particle-explosion"]');
        expect(particles.length).toBeGreaterThan(0);
    });

    it('debería crear texto flotante', () => {
        const mockCell = document.createElement('div');
        mockCell.style.position = 'absolute';
        mockCell.style.left = '100px';
        mockCell.style.top = '100px';
        mockCell.style.width = '50px';
        mockCell.style.height = '50px';
        document.body.appendChild(mockCell);
        
        const mockCoords = [{ el: mockCell }];
        
        launchWordCompletionEffect('TEST', mockCoords);
        
        // Verificar que se creó el texto flotante
        const floatingText = document.querySelector('div[style*="floating-text"]');
        expect(floatingText).toBeTruthy();
        expect(floatingText.textContent).toBe('¡TEST!');
    });

    it('debería crear sparkles', async () => {
        const mockCell = document.createElement('div');
        mockCell.style.position = 'absolute';
        mockCell.style.left = '100px';
        mockCell.style.top = '100px';
        mockCell.style.width = '50px';
        mockCell.style.height = '50px';
        document.body.appendChild(mockCell);
        
        const mockCoords = [{ el: mockCell }];
        
        launchWordCompletionEffect('TEST', mockCoords);
        
        // Esperar un poco para que se creen los sparkles
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Verificar que se crearon sparkles
        const sparkles = document.querySelectorAll('div[style*="sparkle-effect"]');
        expect(sparkles.length).toBeGreaterThan(0);
    });

    it('debería añadir estilos CSS al head', async () => {
        const mockCell = document.createElement('div');
        mockCell.style.position = 'absolute';
        mockCell.style.left = '100px';
        mockCell.style.top = '100px';
        mockCell.style.width = '50px';
        mockCell.style.height = '50px';
        document.body.appendChild(mockCell);
        
        const mockCoords = [{ el: mockCell }];
        
        launchWordCompletionEffect('TEST', mockCoords);
        
        // Esperar un poco para que se añadan todos los estilos
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Verificar que se añadieron estilos
        const styles = document.head.querySelectorAll('style');
        expect(styles.length).toBeGreaterThan(0);
        
        const styleContent = Array.from(styles).map(style => style.textContent).join('');
        expect(styleContent).toContain('@keyframes particle-explosion');
        expect(styleContent).toContain('@keyframes floating-text');
        expect(styleContent).toContain('@keyframes cell-pulse');
    });
});
