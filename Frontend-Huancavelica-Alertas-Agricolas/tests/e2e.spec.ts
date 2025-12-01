import { test, expect } from '@playwright/test';

test.describe('Autenticación con GraphQL', () => {
  test('debe mostrar formulario de login con teléfono', async ({ page }) => {
    await page.goto('/');
    
    // Verificar elementos del formulario
    await expect(page.getByLabel(/número de teléfono/i)).toBeVisible();
    await expect(page.getByLabel(/contraseña/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /iniciar sesión/i })).toBeVisible();
  });

  test('debe permitir login exitoso', async ({ page }) => {
    await page.goto('/');
    
    await page.getByLabel(/número de teléfono/i).fill('+51999999999');
    await page.getByLabel(/contraseña/i).fill('password123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    
    // Esperar navegación al dashboard
    await expect(page.getByText(/dashboard/i)).toBeVisible({ timeout: 5000 });
  });

  test('debe mostrar error con credenciales inválidas', async ({ page }) => {
    await page.goto('/');
    
    await page.getByLabel(/número de teléfono/i).fill('+51111111111');
    await page.getByLabel(/contraseña/i).fill('wrongpass');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    
    // Verificar mensaje de error
    await expect(page.getByRole('alert')).toBeVisible();
  });

  test('debe abrir recuperación de contraseña', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('button', { name: /olvidaste tu contraseña/i }).click();
    
    // Verificar pantalla de recuperación
    await expect(page.getByText(/recuperar contraseña/i)).toBeVisible();
  });

  test('debe completar flujo de recuperación de contraseña', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /olvidaste tu contraseña/i }).click();
    
    // Seleccionar método SMS
    await page.getByRole('button', { name: /sms/i }).click();
    await page.getByLabel(/número de teléfono/i).fill('+51999999999');
    await page.getByRole('button', { name: /enviar código/i }).click();
    
    // Verificar código
    await expect(page.getByText(/verificar código/i)).toBeVisible();
    await page.getByLabel(/código de verificación/i).fill('123456');
    await page.getByRole('button', { name: /verificar/i }).click();
    
    // Nueva contraseña
    await expect(page.getByText(/nueva contraseña/i)).toBeVisible();
  });
});

test.describe('Detalle de Alerta con GraphQL', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/');
    await page.getByLabel(/número de teléfono/i).fill('+51999999999');
    await page.getByLabel(/contraseña/i).fill('password123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    await page.waitForLoadState('networkidle');
  });

  test('debe abrir modal de detalle al hacer click en alerta', async ({ page }) => {
    const firstAlert = page.locator('[data-testid="alert-card"]').first();
    await firstAlert.click();
    
    // Verificar modal visible
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/datos meteorológicos/i)).toBeVisible();
  });

  test('debe mostrar recomendaciones específicas por tipo', async ({ page }) => {
    await page.locator('[data-testid="alert-card"]').first().click();
    
    // Verificar sección de recomendaciones
    await expect(page.getByText(/recomendaciones/i)).toBeVisible();
    await expect(page.locator('[data-testid="recommendation"]').first()).toBeVisible();
  });

  test('debe permitir compartir en Telegram', async ({ page }) => {
    await page.locator('[data-testid="alert-card"]').first().click();
    
    const shareButton = page.getByRole('button', { name: /compartir.*telegram/i });
    await expect(shareButton).toBeVisible();
  });

  test('debe cerrar modal correctamente', async ({ page }) => {
    await page.locator('[data-testid="alert-card"]').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    
    await page.getByRole('button', { name: /cerrar/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});

test.describe('Filtros Avanzados con GraphQL', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByLabel(/número de teléfono/i).fill('+51999999999');
    await page.getByLabel(/contraseña/i).fill('password123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    await page.waitForLoadState('networkidle');
  });

  test('debe expandir y contraer filtros', async ({ page }) => {
    const showButton = page.getByRole('button', { name: /mostrar/i });
    await showButton.click();
    
    await expect(page.getByText(/tipo de alerta/i)).toBeVisible();
    await expect(page.getByText(/severidad/i)).toBeVisible();
    await expect(page.getByText(/zona geográfica/i)).toBeVisible();
  });

  test('debe filtrar por tipo de alerta', async ({ page }) => {
    await page.getByRole('button', { name: /mostrar/i }).click();
    await page.getByRole('button', { name: /helada/i }).click();
    
    // Verificar que el filtro está activo
    await expect(page.getByText(/filtros activos/i)).toBeVisible();
  });

  test('debe filtrar por severidad', async ({ page }) => {
    await page.getByRole('button', { name: /mostrar/i }).click();
    await page.getByRole('button', { name: /crítica/i }).click();
    
    await expect(page.getByText(/filtros activos/i)).toBeVisible();
  });

  test('debe filtrar por rango de fechas', async ({ page }) => {
    await page.getByRole('button', { name: /mostrar/i }).click();
    
    const today = new Date().toISOString().split('T')[0];
    await page.getByLabel(/fecha desde/i).fill(today);
    await page.getByLabel(/fecha hasta/i).fill(today);
    
    await expect(page.getByText(/filtros activos/i)).toBeVisible();
  });

  test('debe limpiar todos los filtros', async ({ page }) => {
    await page.getByRole('button', { name: /mostrar/i }).click();
    await page.getByRole('button', { name: /helada/i }).click();
    
    await page.getByRole('button', { name: /limpiar/i }).click();
    
    await expect(page.getByText(/filtros activos/i)).not.toBeVisible();
  });
});

test.describe('Reportes con Gráficos GraphQL', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByLabel(/número de teléfono/i).fill('+51999999999');
    await page.getByLabel(/contraseña/i).fill('password123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    await page.waitForLoadState('networkidle');
    
    // Navegar a reportes
    await page.getByRole('link', { name: /reportes/i }).click();
  });

  test('debe mostrar selección de cultivos', async ({ page }) => {
    await expect(page.getByRole('button', { name: /papa/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /maíz/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /quinua/i })).toBeVisible();
  });

  test('debe seleccionar cultivo y mostrar datos', async ({ page }) => {
    await page.getByRole('button', { name: /papa/i }).click();
    
    // Verificar que hay gráficos
    const svgCount = await page.locator('svg').count();
    expect(svgCount).toBeGreaterThan(0);
  });

  test('debe cambiar período de reporte', async ({ page }) => {
    await page.locator('select').selectOption('7d');
    
    // Esperar carga de datos
    await page.waitForTimeout(1000);
    const svgCount = await page.locator('svg').count();
    expect(svgCount).toBeGreaterThan(0);
  });

  test('debe descargar reporte PDF', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /descargar pdf/i }).click();
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  test('debe mostrar estadísticas calculadas', async ({ page }) => {
    await expect(page.getByText(/temp\. promedio/i)).toBeVisible();
    await expect(page.getByText(/precipitación total/i)).toBeVisible();
    await expect(page.getByText(/humedad promedio/i)).toBeVisible();
    await expect(page.getByText(/total alertas/i)).toBeVisible();
  });
});

test.describe('Tooltips y Accesibilidad', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByLabel(/número de teléfono/i).fill('+51999999999');
    await page.getByLabel(/contraseña/i).fill('password123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    await page.waitForLoadState('networkidle');
  });

  test('debe mostrar tooltips al hacer hover', async ({ page }) => {
    const button = page.getByRole('button').first();
    await button.hover();
    
    // Esperar a que aparezca el tooltip
    await page.waitForTimeout(400);
  });

  test('todos los botones deben tener aria-label', async ({ page }) => {
    const buttons = await page.getByRole('button').all();
    
    for (const button of buttons) {
      const ariaLabel = await button.getAttribute('aria-label');
      const text = await button.textContent();
      
      expect(ariaLabel || text).toBeTruthy();
    }
  });

  test('debe soportar navegación por teclado', async ({ page }) => {
    await page.keyboard.press('Tab');
    
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('inputs deben tener labels asociados', async ({ page }) => {
    await page.goto('/');
    
    const inputs = await page.locator('input').all();
    
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      if (id) {
        const label = await page.locator(`label[for="${id}"]`).count();
        expect(label).toBeGreaterThan(0);
      }
    }
  });
});

test.describe('PWA y Modo Offline', () => {
  test('debe registrar service worker', async ({ page }) => {
    await page.goto('/');
    
    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        return !!registration;
      }
      return false;
    });
    
    expect(swRegistered).toBeTruthy();
  });

  test('debe tener manifest.json accesible', async ({ page }) => {
    const response = await page.request.get('http://localhost:5173/manifest.json');
    expect(response.ok()).toBeTruthy();
    
    const manifest = await response.json();
    expect(manifest.name).toBeTruthy();
    expect(manifest.icons).toBeTruthy();
  });

  test('debe funcionar sin conexión (offline)', async ({ page, context }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Simular offline
    await context.setOffline(true);
    await page.reload();
    
    // Debería mostrar contenido cacheado
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('debe funcionar en móvil', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await expect(page.getByRole('button', { name: /iniciar sesión/i })).toBeVisible();
  });

  test('debe funcionar en tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    await page.getByLabel(/número de teléfono/i).fill('+51999999999');
    await page.getByLabel(/contraseña/i).fill('password123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    
    await expect(page.getByText(/dashboard/i)).toBeVisible();
  });

  test('debe funcionar en desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    await page.getByLabel(/número de teléfono/i).fill('+51999999999');
    await page.getByLabel(/contraseña/i).fill('password123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    
    await expect(page.getByText(/dashboard/i)).toBeVisible();
  });
});

test.describe('Integración GraphQL Real', () => {
  test('debe hacer query de alertas a GraphQL', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel(/número de teléfono/i).fill('+51999999999');
    await page.getByLabel(/contraseña/i).fill('password123');
    
    // Interceptar llamada GraphQL
    const responsePromise = page.waitForResponse(
      response => response.url().includes('graphql') && response.request().method() === 'POST'
    );
    
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    
    const response = await responsePromise;
    expect(response.status()).toBe(200);
  });
});
