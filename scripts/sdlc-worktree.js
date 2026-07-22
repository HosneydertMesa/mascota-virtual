'use strict';

/**
 * sdlc-worktree.js — helper para workers paralelos con git worktrees.
 *
 * Cada worker en paralelo necesita su propio directorio físico (worktree)
 * para no pisarse en main.js / package.json cuando hace git checkout.
 *
 * Uso:
 *   node scripts/sdlc-worktree.js add <branch>     # crea ../<repo>-<branch>
 *   node scripts/sdlc-worktree.js list              # lista worktrees activos
 *   node scripts/sdlc-worktree.js remove <branch>   # elimina worktree
 *   node scripts/sdlc-worktree.js help              # ayuda
 *
 * Convenciones:
 *   - Worktrees se crean en `<parent>/<basename>-<branch>` (sibling del repo)
 *   - Cada worktree arranca en branch nueva (git worktree add -b)
 *   - El main repo queda en su branch original (sin pisarse)
 */

const { execSync, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const repoRoot = path.resolve(__dirname, '..');
const repoName = path.basename(repoRoot);
const parent = path.dirname(repoRoot);

function run(cmd, opts = {}) {
  return execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8', ...opts });
}

function help() {
  console.log(`sdlc-worktree — helper para workers paralelos con git worktrees

Uso:
  node scripts/sdlc-worktree.js add <branch>      Crea ../${repoName}-<branch> en branch nueva
  node scripts/sdlc-worktree.js list               Lista worktrees activos
  node scripts/sdlc-worktree.js remove <branch>    Elimina worktree (NO borra la branch)
  node scripts/sdlc-worktree.js clean              Elimina worktrees cuyo branch ya está mergeada
  node scripts/sdlc-worktree.js help               Muestra esta ayuda

Por qué:
  Workers en paralelo que comparten cwd se pisan en main.js / package.json
  al hacer git checkout. Cada worktree = directorio físico separado = sin
  pisarse. Ver docs/sdlc/PHASES.md para más contexto.`);
}

function add(branchArg) {
  if (!branchArg) {
    console.error('Error: falta <branch>');
    process.exit(1);
  }
  // Sanitize: feat/xyz → feat-xyz (no / en dir names)
  const safeBranch = branchArg.replace(/\//g, '-');
  const target = path.join(parent, `${repoName}-${safeBranch}`);

  if (fs.existsSync(target)) {
    console.error(`Error: ya existe ${target}`);
    process.exit(1);
  }

  // git worktree add -b <branch> <path>
  const result = spawnSync('git', ['worktree', 'add', '-b', branchArg, target], {
    cwd: repoRoot,
    stdio: 'inherit'
  });
  if (result.status !== 0) {
    console.error(`git worktree add falló con código ${result.status}`);
    process.exit(result.status || 1);
  }

  console.log(`\n✓ Worktree creado: ${target}`);
  console.log(`  Branch: ${branchArg}`);
  console.log(`\nPróximos pasos:`);
  console.log(`  cd "${target}"`);
  console.log(`  npm install     # si es la primera vez`);
  console.log(`  # trabajar acá, hacer commits, push`);
}

function list() {
  try {
    const out = run('git worktree list --porcelain', { cwd: repoRoot });
    console.log(out);
  } catch (e) {
    console.error('Error listando worktrees:', e.message);
    process.exit(1);
  }
}

function remove(branchArg) {
  if (!branchArg) {
    console.error('Error: falta <branch>');
    process.exit(1);
  }
  const safeBranch = branchArg.replace(/\//g, '-');
  const target = path.join(parent, `${repoName}-${safeBranch}`);

  if (!fs.existsSync(target)) {
    console.error(`Error: no existe ${target}`);
    process.exit(1);
  }

  const result = spawnSync('git', ['worktree', 'remove', target], {
    cwd: repoRoot,
    stdio: 'inherit'
  });
  if (result.status !== 0) {
    console.error(`git worktree remove falló con código ${result.status}`);
    process.exit(result.status || 1);
  }

  console.log(`\n✓ Worktree eliminado: ${target}`);
  console.log(`  (la branch ${branchArg} sigue existiendo — para borrarla: git branch -d ${branchArg})`);
}

function clean() {
  // Elimina worktrees cuyo branch ya está mergeada a main
  // Útil para limpiar después de un batch
  const wtList = run('git worktree list --porcelain', { cwd: repoRoot });
  const worktrees = wtList.split('\n\n').filter(Boolean).map(block => {
    const lines = block.split('\n');
    const obj = {};
    for (const line of lines) {
      const [k, ...v] = line.split(' ');
      obj[k] = v.join(' ');
    }
    return obj;
  });

  // Detectamos el branch default. La logica de `git symbolic-ref ... HEAD` puede
  // devolver stale data (si en algun momento se checkout otra branch con `git
  // checkout` y se reasigno el upstream), asi que validamos que sea main/master
  // y sino caemos al branch actual.
  //
  // Tambien: `2>/dev/null` no existe en Windows (cmd usa `2>nul`), asi que
  // usamos Node para silenciar el stderr via stdio en su lugar.
  const SILENT = { stdio: ['ignore', 'pipe', 'ignore'] };
  let mainBranch;
  try {
    const symbolic = execSync('git symbolic-ref refs/remotes/origin/HEAD', { ...SILENT, cwd: repoRoot })
      .toString()
      .trim();
    const match = symbolic.match(/refs\/remotes\/origin\/(main|master)$/);
    if (match) {
      mainBranch = match[1];
    }
  } catch (_e) {
    // no upstream HEAD configurado — seguimos al fallback
  }
  if (!mainBranch) {
    try {
      mainBranch = execSync('git rev-parse --abbrev-ref HEAD', { ...SILENT, cwd: repoRoot })
        .toString()
        .trim() || 'main';
    } catch (_e) {
      mainBranch = 'main';
    }
  }

  // Listamos las branches mergeadas a main y las parseamos en Node
  // (antes usabamos `| grep -w` que no existe en Windows).
  const mergedList = run(`git branch --merged ${mainBranch}`, { cwd: repoRoot });
  const mergedBranches = new Set(
    mergedList
      .split('\n')
      .map(line => line.replace(/^\*?\s+/, '').trim())
      .filter(Boolean)
  );

  let removed = 0;
  for (const wt of worktrees) {
    if (wt.HEAD === '(detached)' || !wt.branch) continue;
    const branch = wt.branch.replace(/^refs\/heads\//, '');
    if (branch === mainBranch) continue;
    if (mergedBranches.has(branch)) {
      console.log(`✓ ${branch} está mergeada a ${mainBranch} → removiendo worktree`);
      try {
        run(`git worktree remove --force "${wt.worktree}"`, { cwd: repoRoot });
        removed++;
      } catch (e) {
        console.log(`  Error removiendo worktree de ${branch}: ${e.message}`);
      }
    } else {
      console.log(`  ${branch} NO está mergeada → mantener`);
    }
  }
  console.log(`\n${removed} worktree(s) eliminado(s).`);
}

const cmd = process.argv[2];
const arg = process.argv[3];

switch (cmd) {
  case 'add': add(arg); break;
  case 'list': list(); break;
  case 'remove': case 'rm': remove(arg); break;
  case 'clean': clean(); break;
  case 'help': case '--help': case '-h': help(); break;
  default:
    console.error(`Comando desconocido: ${cmd}`);
    help();
    process.exit(1);
}
