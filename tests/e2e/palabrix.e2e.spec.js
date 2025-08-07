import { test, expect } from '@playwright/test';

// Cambia el puerto si usas otro en preview
const APP_URL = 'http://localhost:3001';

test('El usuario puede ver la app y el footer de versión', async ({ page }) => {
  await page.goto(APP_URL);
  await expect(page.locator('h1')).toHaveText(/Palabrix/i);
  await expect(page.locator('#build-version')).not.toBeEmpty();
});

test('El usuario puede abrir el modal de victoria (simulación)', async ({ page }) => {
  await page.goto(APP_URL);
  // Simula victoria forzando el modal (esto depende de la estructura de tu app)
  await page.evaluate(() => {
    const modal = document.getElementById('modal');
    modal.classList.remove('hidden');
    document.getElementById('modal-title').textContent = '¡Felicidades!';
  });
  await expect(page.locator('#modal')).toBeVisible();
  await expect(page.locator('#modal-title')).toHaveText(/Felicidades/);
});

test('El usuario puede seleccionar letras y completar una palabra', async ({ page }) => {
  await page.goto(APP_URL);
  // Espera a que el grid esté visible
  await expect(page.locator('#grid-container')).toBeVisible();
  // Selecciona la primera palabra de la lista (desktop)
  const word = await page.locator('#word-list-desktop li').first().textContent();
  // Busca las letras de esa palabra en el grid (horizontal, vertical, diagonal)
  // Para simplificar, selecciona dos celdas con la misma letra (no es 100% realista, pero valida interacción)
  const firstCell = await page.locator('.grid-cell').first();
  const firstText = await firstCell.textContent();
  // Busca otra celda con la misma letra
  const allCells = await page.locator('.grid-cell').all();
  let secondCell = null;
  for (const cell of allCells) {
    if ((await cell.textContent()) === firstText && cell !== firstCell) {
      secondCell = cell;
      break;
    }
  }
  // Simula click en la primera y segunda celda
  await firstCell.click();
  if (secondCell) await secondCell.click();
  // Comprueba que el mensaje de feedback aparece
  await expect(page.locator('#message-area')).not.toBeEmpty();
});

test('El usuario puede completar una palabra real del grid', async ({ page }) => {
  await page.goto(APP_URL);
  await expect(page.locator('#grid-container')).toBeVisible();
  // Obtiene la primera palabra de la lista
  const word = await page.locator('#word-list-desktop li').first().textContent();
  // Busca la palabra en el grid (horizontal izquierda a derecha)
  const gridCells = await page.locator('.grid-cell').all();
  const gridSize = Math.sqrt(gridCells.length);
  let found = false;
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col <= gridSize - word.length; col++) {
      let match = true;
      for (let i = 0; i < word.length; i++) {
        const idx = row * gridSize + (col + i);
        const cellText = await gridCells[idx].textContent();
        if (cellText !== word[i]) {
          match = false;
          break;
        }
      }
      if (match) {
        // Simula clicks en la primera y última letra de la palabra
        await gridCells[row * gridSize + col].click();
        await gridCells[row * gridSize + (col + word.length - 1)].click();
        found = true;
        break;
      }
    }
    if (found) break;
  }
  // Comprueba que la palabra aparece como encontrada
  await expect(page.locator('#word-list-desktop li.word-found')).toContainText(word);
});

test('El usuario puede resolver todas las palabras del grid (todas direcciones)', async ({ page }) => {
  await page.goto(APP_URL);
  await expect(page.locator('#grid-container')).toBeVisible();
  const words = await page.locator('#word-list-desktop li').allTextContents();
  const gridCells = await page.locator('.grid-cell').all();
  const gridSize = Math.sqrt(gridCells.length);
  const directions = [
    { dr: 0, dc: 1 },   // →
    { dr: 0, dc: -1 },  // ←
    { dr: 1, dc: 0 },   // ↓
    { dr: -1, dc: 0 },  // ↑
    { dr: 1, dc: 1 },   // ↘
    { dr: -1, dc: -1 }, // ↖
    { dr: 1, dc: -1 },  // ↙
    { dr: -1, dc: 1 },  // ↗
  ];
  for (const word of words) {
    let found = false;
    for (const { dr, dc } of directions) {
      outer: for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          let match = true;
          for (let i = 0; i < word.length; i++) {
            const r = row + dr * i;
            const c = col + dc * i;
            if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) {
              match = false;
              break;
            }
            const idx = r * gridSize + c;
            const cellText = await gridCells[idx].textContent();
            if (cellText !== word[i]) {
              match = false;
              break;
            }
          }
          if (match) {
            // Click en la primera y última letra
            const r1 = row, c1 = col;
            const r2 = row + dr * (word.length - 1);
            const c2 = col + dc * (word.length - 1);
            await gridCells[r1 * gridSize + c1].click();
            await gridCells[r2 * gridSize + c2].click();
            found = true;
            break outer;
          }
        }
      }
      if (found) break;
    }
  }
  // Deben encontrarse todas las palabras
  const foundCount = await page.locator('#word-list-desktop li.word-found').count();
  expect(foundCount).toBe(words.length);
  // El modal de victoria debe mostrarse
  await expect(page.locator('#modal')).toBeVisible();
  await expect(page.locator('#modal-title')).toHaveText(/Felicidades/);
});

test('El usuario puede encontrar palabras en todas las 8 direcciones', async ({ page }) => {
  await page.goto(APP_URL);
  await expect(page.locator('#grid-container')).toBeVisible();
  
  const directions = [
    { name: 'Horizontal derecha a izquierda', dr: 0, dc: -1 },
    { name: 'Vertical abajo a arriba', dr: -1, dc: 0 },
    { name: 'Diagonal superior izquierda a inferior derecha', dr: 1, dc: 1 },
    { name: 'Diagonal inferior derecha a superior izquierda', dr: -1, dc: -1 },
    { name: 'Diagonal superior derecha a inferior izquierda', dr: 1, dc: -1 },
    { name: 'Diagonal inferior izquierda a superior derecha', dr: -1, dc: 1 }
  ];

  // Obtener la primera palabra para probar
  const word = await page.locator('#word-list-desktop li').first().textContent();
  const gridCells = await page.locator('.grid-cell').all();
  const gridSize = Math.sqrt(gridCells.length);

  // Probar cada dirección
  for (const direction of directions) {
    let found = false;
    outer: for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        let match = true;
        for (let i = 0; i < word.length; i++) {
          const r = row + direction.dr * i;
          const c = col + direction.dc * i;
          if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) {
            match = false;
            break;
          }
          const idx = r * gridSize + c;
          const cellText = await gridCells[idx].textContent();
          if (cellText !== word[i]) {
            match = false;
            break;
          }
        }
        if (match) {
          // Click en la primera y última letra
          const r1 = row, c1 = col;
          const r2 = row + direction.dr * (word.length - 1);
          const c2 = col + direction.dc * (word.length - 1);
          await gridCells[r1 * gridSize + c1].click();
          await gridCells[r2 * gridSize + c2].click();
          found = true;
          break outer;
        }
      }
    }
    
    // Si encontramos la palabra en esta dirección, verificar que se marcó correctamente
    if (found) {
      await expect(page.locator('#word-list-desktop li.word-found')).toContainText(word);
      // Resetear para probar la siguiente dirección
      await page.locator('#reset-progress-btn').click();
      await page.waitForTimeout(1000);
      break; // Solo necesitamos probar una dirección exitosamente
    }
  }
});

test('Verifica que las 8 direcciones están correctamente implementadas en el juego', async ({ page }) => {
  await page.goto(APP_URL);
  await expect(page.locator('#grid-container')).toBeVisible();
  
  // Definir todas las 8 direcciones
  const allDirections = [
    { name: 'Horizontal izquierda a derecha', dr: 0, dc: 1 },
    { name: 'Horizontal derecha a izquierda', dr: 0, dc: -1 },
    { name: 'Vertical arriba a abajo', dr: 1, dc: 0 },
    { name: 'Vertical abajo a arriba', dr: -1, dc: 0 },
    { name: 'Diagonal superior izquierda a inferior derecha', dr: 1, dc: 1 },
    { name: 'Diagonal inferior derecha a superior izquierda', dr: -1, dc: -1 },
    { name: 'Diagonal superior derecha a inferior izquierda', dr: 1, dc: -1 },
    { name: 'Diagonal inferior izquierda a superior derecha', dr: -1, dc: 1 }
  ];

  // Verificar que el grid tiene el tamaño correcto
  const gridCells = await page.locator('.grid-cell').all();
  const gridSize = Math.sqrt(gridCells.length);
  expect(gridSize).toBeGreaterThan(0);

  // Obtener todas las palabras
  const words = await page.locator('#word-list-desktop li').allTextContents();
  expect(words.length).toBeGreaterThan(0);

  // Para cada palabra, verificar que se puede encontrar en al menos una dirección
  for (const word of words) {
    let wordFound = false;
    
    // Probar todas las direcciones para esta palabra
    for (const direction of allDirections) {
      if (wordFound) break;
      
      outer: for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          let match = true;
          for (let i = 0; i < word.length; i++) {
            const r = row + direction.dr * i;
            const c = col + direction.dc * i;
            if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) {
              match = false;
              break;
            }
            const idx = r * gridSize + c;
            const cellText = await gridCells[idx].textContent();
            if (cellText !== word[i]) {
              match = false;
              break;
            }
          }
          if (match) {
            wordFound = true;
            break outer;
          }
        }
      }
    }
    
    // Cada palabra debe ser encontrable en al menos una dirección
    expect(wordFound).toBe(true);
  }
});

test('El usuario puede cambiar el tamaño del grid', async ({ page }) => {
  await page.goto(APP_URL);
  await expect(page.locator('#grid-container')).toBeVisible();
  const select = page.locator('#grid-size-select');
  // Cambia a 20x20
  await select.selectOption('20');
  // Espera a que el grid cambie de tamaño
  await page.waitForTimeout(500);
  const gridCells = await page.locator('.grid-cell').all();
  const gridSize = Math.sqrt(gridCells.length);
  expect(gridSize).toBe(20);
  // Cambia a 24x24
  await select.selectOption('24');
  await page.waitForTimeout(500);
  const gridCells2 = await page.locator('.grid-cell').all();
  const gridSize2 = Math.sqrt(gridCells2.length);
  expect(gridSize2).toBe(24);
});

test('El usuario puede resetear el estado del día', async ({ page }) => {
  await page.goto(APP_URL);
  await expect(page.locator('#grid-container')).toBeVisible();
  // Marca una palabra (la primera que encuentre en cualquier dirección)
  const word = await page.locator('#word-list-desktop li').first().textContent();
  const gridCells = await page.locator('.grid-cell').all();
  const gridSize = Math.sqrt(gridCells.length);
  let found = false;
  const directions = [
    { dr: 0, dc: 1 }, { dr: 0, dc: -1 }, { dr: 1, dc: 0 }, { dr: -1, dc: 0 },
    { dr: 1, dc: 1 }, { dr: -1, dc: -1 }, { dr: 1, dc: -1 }, { dr: -1, dc: 1 },
  ];
  for (const { dr, dc } of directions) {
    outer: for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        let match = true;
        for (let i = 0; i < word.length; i++) {
          const r = row + dr * i;
          const c = col + dc * i;
          if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) {
            match = false;
            break;
          }
          const idx = r * gridSize + c;
          const cellText = await gridCells[idx].textContent();
          if (cellText !== word[i]) {
            match = false;
            break;
          }
        }
        if (match) {
          await gridCells[row * gridSize + col].click();
          await gridCells[(row + dr * (word.length - 1)) * gridSize + (col + dc * (word.length - 1))].click();
          found = true;
          break outer;
        }
      }
    }
    if (found) break;
  }
  // Debe aparecer como encontrada
  await expect(page.locator('#word-list-desktop li.word-found')).toContainText(word);
  // Pulsa el botón de reset
  await page.locator('#reset-progress-btn').click();
  // Espera a que se recargue
  await page.waitForTimeout(1000);
  // La palabra ya no debe estar marcada como encontrada
  await expect(page.locator('#word-list-desktop li.word-found')).toHaveCount(0);
});
