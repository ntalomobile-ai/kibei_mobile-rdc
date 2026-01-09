const fs = require('fs');
const path = require('path');

function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function main() {
  const repoRoot = path.resolve(__dirname, '..');
  const src = path.join(repoRoot, 'packages', 'db', 'node_modules', '.prisma', 'client');
  const dst = path.join(repoRoot, 'apps', 'api', 'node_modules', '.prisma', 'client');

  if (!exists(src)) {
    console.error(`[sync-prisma-engine] Source not found: ${src}`);
    process.exit(1);
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


