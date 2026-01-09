const fs = require('fs');
const path = require('path');
const os = require('os');

function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function main() {
  // Sur Linux (Vercel), Prisma génère automatiquement le bon moteur
  // Ce script n'est nécessaire que sur Windows
  if (os.platform() !== 'win32') {
    console.log('[sync-prisma-engine] Skipping on non-Windows platform');
    return;
  }

  const repoRoot = path.resolve(__dirname, '..');
  const src = path.join(repoRoot, 'packages', 'db', 'node_modules', '.prisma', 'client');
  const dst = path.join(repoRoot, 'apps', 'api', 'node_modules', '.prisma', 'client');

  if (!exists(src)) {
    console.warn(`[sync-prisma-engine] Source not found: ${src}`);
    console.warn('[sync-prisma-engine] This is normal if Prisma hasn't been generated yet.');
    console.warn('[sync-prisma-engine] Prisma will be generated during build.');
    return; // Ne pas faire échouer le build
  }

  const engineDll = path.join(dst, 'query_engine-windows.dll.node');
  if (exists(engineDll)) {
    // already present
    return;
  }

  fs.mkdirSync(dst, { recursive: true });
  fs.cpSync(src, dst, { recursive: true });
  console.log(`[sync-prisma-engine] Copied Prisma engine to ${dst}`);
}

main();


