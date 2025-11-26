#!/usr/bin/env node
import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join, extname } from 'node:path';

const root = join(process.cwd(), 'src', 'components');
let count = 0;
const files = [];
const uiDir = join(root, 'ui');
const alertsDir = join(root, 'alerts');
function walk(dir){
  for(const entry of readdirSync(dir)){
    const full = join(dir, entry);
    const st = statSync(full);
    if(st.isDirectory()) walk(full);
    else if(extname(full) === '.tsx'){
          // Excluir todos los ui/*.tsx excepto index.tsx (la fuente canónica)
          if(full.startsWith(uiDir)){
            const isIndex = /[\\\/]ui[\\\/]index\.tsx$/.test(full);
            if(!isIndex) continue;
          }
          // Excluir todos los alerts/*.tsx excepto alerts.tsx (consolidado del dominio)
          if(full.startsWith(alertsDir)){
            const isConsolidated = /[\\\/]alerts[\\\/]alerts\.tsx$/.test(full);
            if(!isConsolidated) continue;
          }
          // Ignorar wrappers legacy y archivos marcados
          const legacyNames = new Set([
            'forms.tsx',
            'overlay.tsx',
            'navbar.tsx',
            'data-display.tsx',
            'feedback.tsx'
          ]);
          const base = entry; // nombre en este nivel
          if(legacyNames.has(base)) continue;
          const content = readFileSync(full, 'utf8');
          if(/DEPRECATED_WRAPPER/.test(content)) continue;
          files.push(full.replace(process.cwd()+"\\",''));
          count++;
        }
  }
}
walk(root);
// Nueva métrica pública: si existe src/components/public.ts o public.tsx, contar sus exports nombrados
function getPublicMetric(){
  try{
    const publicPaths = [
      join(process.cwd(), 'src', 'components', 'public.ts'),
      join(process.cwd(), 'src', 'components', 'public.tsx'),
    ];
    for(const p of publicPaths){
      try{
        const content = readFileSync(p, 'utf8');
        // conteo simple de exports nombrados en la forma `export const X` o `export { A, B as C }` o `export default` (no cuenta default)
        const named1 = (content.match(/export\s+(const|let|var|function|class)\s+([A-Za-z0-9_]+)/g) || []).length;
        const namedBlock = (content.match(/export\s*\{[\s\S]*?\}/g) || []).reduce((acc, m)=>{
          const inside = m.replace(/^[\s\S]*?\{/,'').replace(/\}[\s\S]*$/,'');
          const names = inside.split(',').map(s=>s.trim()).filter(Boolean);
          return acc + names.length;
        }, 0);
        // export * as Foo from "...";
        const starAs = (content.match(/export\s*\*\s*as\s+[A-Za-z0-9_]+\s+from\s+['"][^'"]+['"]/g) || []).length;
        return { publicComponents: named1 + namedBlock + starAs, publicFile: p.replace(process.cwd()+"\\",'') };
      }catch(e){ /* try next */ }
    }
  }catch(e){ /* ignore */ }
  return { publicComponents: null, publicFile: null };
}

const publicMetric = getPublicMetric();
console.log(JSON.stringify({ totalTSXComponents: count, files, ...publicMetric }, null, 2));
