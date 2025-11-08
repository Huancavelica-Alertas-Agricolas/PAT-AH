/* Wrapper de compatibilidad para el monolito UI.
 * Permite ambos estilos:
 *  - import { Button } from "../ui";  (reexportación por nombre)
 *  - import { UI } from "../ui"; UI.Button  (objeto agrupado)
 * Nota: Usamos la ruta con extensión .tsx porque coexistimos con index.ts.
 */
export * from './index.tsx';
import * as UIAll from './index.tsx';
export const UI = UIAll;
