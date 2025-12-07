**CI: Coverage checks**

- **Propósito**: Ejecutar `test:cov` por servicio, recolectar `coverage/coverage-summary.json` y comprobar umbrales globales o por servicio.
- **Workflow**: `.github/workflows/coverage.yml` (GitHub Actions) ejecuta instalación por servicio, corre cobertura, ejecuta `scripts/check-coverage.js` y sube artefactos.

Cómo probar localmente (PowerShell):

```powershell
# Ejecutar coverage en un servicio (ejemplo: rest-service)
Push-Location "A:\Proyecto\PAT-AH\Backend-Huancavelica-Alertas-Agricolas\services\rest-service"
npm ci --legacy-peer-deps
npm run test:cov --if-present
Pop-Location

# Ejecutar el comprobador local (desde la raíz del repo)
node scripts/check-coverage.js --path services --config coverage.config.json
```
                                                                                                                                                                                                                                                                                            
