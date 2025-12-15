/**
 * Copy template files from main project to CLI package
 *
 * 3-Stage Pipeline:
 * - Stage 1a: Copy static presets from presets/standalone/ (extensible: add files/dirs, they're auto-copied)
 * - Stage 1b: Copy root project files (source code that IS the monorepo app)
 * - Stage 1c: Assemble .ai/ from markers (uses .ai/standalone-overrides/ for @standalone:override files)
 * - Stage 2: Generate IDE rules and command adapters
 *
 * AI CONFIGURATION STRATEGY:
 * - Root .ai/ is canonical source of truth for all rules and commands
 * - Files marked with <!-- @standalone --> are copied verbatim
 * - Files marked with <!-- @standalone:override --> use versions from .ai/standalone-overrides/
 * - Files without markers are monorepo-only (not copied)
 * - hai3dev-* commands are monorepo-only (not copied to standalone projects)
 * - Command adapters are GENERATED for all IDEs
 * - OpenSpec commands are copied from root .claude/commands/openspec/ to all IDE directories
 */
import fs from 'fs-extra';
import lodash from 'lodash';
import path from 'path';
import { fileURLToPath } from 'url';

const { trim } = lodash;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_ROOT = path.resolve(__dirname, '..');
const PROJECT_ROOT = path.resolve(CLI_ROOT, '../..');
const TEMPLATES_DIR = path.join(CLI_ROOT, 'templates');

/**
 * Template configuration - simplified 3-stage pipeline
 */
const config = {
  // Stage 1b: Root-level files to copy (relative to project root)
  rootFiles: [
    'index.html',
    'postcss.config.ts',
    'tailwind.config.ts',
    'tsconfig.node.json',
    'vite.config.ts',
    '.gitignore',
    'src/vite-env.d.ts',
    'src/main.tsx',
    'src/App.tsx',
    'src/screensets/screensetRegistry.tsx',
  ],

  // Stage 1b: Directories to copy entirely (relative to project root)
  rootDirectories: [
    'src/themes',
    'src/uikit',
    'src/icons',
  ],

  // Stage 1c: Override files location (for @standalone:override markers)
  standaloneOverridesDir: '.ai/standalone-overrides',

  // Screensets to include in new projects
  screensets: ['demo'],

  // Screenset template for `hai3 screenset create`
  screensetTemplate: '_blank',
};

/**
 * Extract description from a command file
 * Looks for the first H1 header after the marker comment
 */
async function extractCommandDescription(filePath: string): Promise<string> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    // Look for "# hai3:command-name - Description" pattern
    const h1Match = content.match(/^#\s+hai3:\S+\s+-\s+(.+)$/m);
    if (h1Match) {
      return trim(h1Match[1]);
    }
    // Fallback: use filename
    const name = path.basename(filePath, '.md');
    return `HAI3 ${name.replace('hai3-', '').replace(/-/g, ' ')} command`;
  } catch {
    return 'HAI3 command';
  }
}

/**
 * Generate IDE command adapters from @standalone marked commands
 * Generates adapters for Claude (commands), Cursor (commands), and Windsurf (workflows)
 * Excludes hai3dev-* commands (monorepo-only)
 */
async function generateCommandAdapters(
  standaloneCommands: string[],
  templatesDir: string
): Promise<{ claude: number; cursor: number; windsurf: number }> {
  const claudeCommandsDir = path.join(templatesDir, '.claude', 'commands');
  const cursorCommandsDir = path.join(templatesDir, '.cursor', 'commands');
  const windsurfWorkflowsDir = path.join(templatesDir, '.windsurf', 'workflows');

  await fs.ensureDir(claudeCommandsDir);
  await fs.ensureDir(cursorCommandsDir);
  await fs.ensureDir(windsurfWorkflowsDir);

  let claudeCount = 0;
  let cursorCount = 0;
  let windsurfCount = 0;

  // Generate hai3-* command adapters
  for (const relativePath of standaloneCommands) {
    // Only process commands/ directory files
    if (!relativePath.startsWith('commands/')) continue;

    const cmdFileName = path.basename(relativePath); // e.g., "hai3-validate.md"

    // Skip internal commands (monorepo-only - hai3dev-* and commands/internal/)
    if (cmdFileName.startsWith('hai3dev-') || relativePath.includes('commands/internal/')) continue;

    const srcPath = path.join(PROJECT_ROOT, '.ai', relativePath);
    const description = await extractCommandDescription(srcPath);

    // Claude adapter
    const claudeContent = `---
description: ${description}
---

Use \`.ai/${relativePath}\` as the single source of truth.
`;
    await fs.writeFile(path.join(claudeCommandsDir, cmdFileName), claudeContent);
    claudeCount++;

    // Cursor adapter (same format as Claude)
    const cursorContent = `---
description: ${description}
---

Use \`.ai/${relativePath}\` as the single source of truth.
`;
    await fs.writeFile(path.join(cursorCommandsDir, cmdFileName), cursorContent);
    cursorCount++;

    // Windsurf adapter (workflow format)
    const windsurfContent = `---
description: ${description}
---

Use \`.ai/${relativePath}\` as the single source of truth.
`;
    await fs.writeFile(path.join(windsurfWorkflowsDir, cmdFileName), windsurfContent);
    windsurfCount++;
  }

  // Copy openspec commands (actual content, not adapters)
  // Source: .claude/commands/openspec/ (canonical location)
  // Claude/Cursor: copy to openspec/ subfolder
  // Windsurf: copy with flattened names (no subfolder support)
  const openspecSrc = path.join(PROJECT_ROOT, '.claude', 'commands', 'openspec');
  if (await fs.pathExists(openspecSrc)) {
    const claudeOpenspecDir = path.join(claudeCommandsDir, 'openspec');
    const cursorOpenspecDir = path.join(cursorCommandsDir, 'openspec');
    await fs.ensureDir(claudeOpenspecDir);
    await fs.ensureDir(cursorOpenspecDir);

    const openspecFiles = await fs.readdir(openspecSrc);
    for (const file of openspecFiles) {
      if (!file.endsWith('.md')) continue;

      const srcFilePath = path.join(openspecSrc, file);
      const name = file.replace('.md', ''); // e.g., "apply"

      // Claude: copy to openspec/apply.md
      await fs.copy(srcFilePath, path.join(claudeOpenspecDir, file));
      claudeCount++;

      // Cursor: copy to openspec/apply.md
      await fs.copy(srcFilePath, path.join(cursorOpenspecDir, file));
      cursorCount++;

      // Windsurf: copy to openspec-apply.md (flattened)
      await fs.copy(srcFilePath, path.join(windsurfWorkflowsDir, `openspec-${name}.md`));
      windsurfCount++;
    }
  }

  return { claude: claudeCount, cursor: cursorCount, windsurf: windsurfCount };
}

/**
 * Generate IDE rules as pointers to .ai/GUIDELINES.md
 * All IDEs use the same single source of truth
 */
async function generateIdeRules(templatesDir: string): Promise<void> {
  // CLAUDE.md at project root
  const claudeMdContent = `# CLAUDE.md

Use \`.ai/GUIDELINES.md\` as the single source of truth for HAI3 development guidelines.

For routing to specific topics, see the ROUTING section in GUIDELINES.md.
`;
  await fs.writeFile(path.join(templatesDir, 'CLAUDE.md'), claudeMdContent);

  // Cursor rules
  const cursorRulesDir = path.join(templatesDir, '.cursor', 'rules');
  await fs.ensureDir(cursorRulesDir);
  const cursorRuleContent = `---
description: HAI3 development guidelines
globs: ["**/*"]
alwaysApply: true
---

Use \`.ai/GUIDELINES.md\` as the single source of truth for HAI3 development guidelines.
`;
  await fs.writeFile(path.join(cursorRulesDir, 'hai3.mdc'), cursorRuleContent);

  // Windsurf rules
  const windsurfRulesDir = path.join(templatesDir, '.windsurf', 'rules');
  await fs.ensureDir(windsurfRulesDir);
  const windsurfRuleContent = `---
trigger: always_on
---

Use \`.ai/GUIDELINES.md\` as the single source of truth for HAI3 development guidelines.
`;
  await fs.writeFile(path.join(windsurfRulesDir, 'hai3.md'), windsurfRuleContent);
}

/**
 * Check if file has a standalone marker
 */
async function getStandaloneMarker(
  filePath: string
): Promise<'standalone' | 'override' | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const firstLines = content.slice(0, 200); // Check first 200 chars

    if (firstLines.includes('<!-- @standalone:override -->')) {
      return 'override';
    }
    if (firstLines.includes('<!-- @standalone -->')) {
      return 'standalone';
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Recursively scan directory for files with markers
 */
async function scanForMarkedFiles(
  dir: string,
  baseDir: string
): Promise<Array<{ relativePath: string; marker: 'standalone' | 'override' }>> {
  const results: Array<{
    relativePath: string;
    marker: 'standalone' | 'override';
  }> = [];

  if (!(await fs.pathExists(dir))) {
    return results;
  }

  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);

    if (entry.isDirectory()) {
      const subResults = await scanForMarkedFiles(fullPath, baseDir);
      results.push(...subResults);
    } else if (entry.name.endsWith('.md')) {
      const marker = await getStandaloneMarker(fullPath);
      if (marker) {
        results.push({ relativePath, marker });
      }
    }
  }

  return results;
}

async function countFiles(dir: string): Promise<number> {
  let count = 0;
  if (!(await fs.pathExists(dir))) return 0;
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      count += await countFiles(path.join(dir, entry.name));
    } else {
      count++;
    }
  }
  return count;
}

async function copyTemplates() {
  console.log('📦 Copying templates from main project...\n');

  // Clean templates directory
  await fs.remove(TEMPLATES_DIR);
  await fs.ensureDir(TEMPLATES_DIR);

  // ============================================
  // STAGE 1a: Copy static presets
  // ============================================
  console.log('Stage 1a: Static Presets (presets/standalone/):');
  const presetsDir = path.join(PROJECT_ROOT, 'presets/standalone');

  // Copy eslint-plugin-local
  const eslintPluginSrc = path.join(presetsDir, 'eslint-plugin-local');
  const eslintPluginDest = path.join(TEMPLATES_DIR, 'eslint-plugin-local');
  if (await fs.pathExists(eslintPluginSrc)) {
    await fs.copy(eslintPluginSrc, eslintPluginDest, {
      filter: (src: string) => !src.includes('/dist/') && !src.includes('/node_modules/'),
    });
    console.log(`  ✓ eslint-plugin-local/ (${await countFiles(eslintPluginDest)} files)`);
  }

  // Flatten configs/ to templates root
  const configsSrc = path.join(presetsDir, 'configs');
  if (await fs.pathExists(configsSrc)) {
    const configFiles = await fs.readdir(configsSrc);
    for (const file of configFiles) {
      const srcPath = path.join(configsSrc, file);
      const destPath = path.join(TEMPLATES_DIR, file);

      // Transform eslint.config.js path for standalone projects
      // In monorepo: ../eslint-plugin-local (configs/ -> eslint-plugin-local/)
      // In standalone: ./eslint-plugin-local (root -> eslint-plugin-local/)
      if (file === 'eslint.config.js') {
        let content = await fs.readFile(srcPath, 'utf-8');
        content = content.replace(
          "../eslint-plugin-local",
          './eslint-plugin-local'
        );
        await fs.writeFile(destPath, content);
      } else {
        await fs.copy(srcPath, destPath);
      }
    }
    console.log(`  ✓ configs/ flattened to root (${configFiles.length} files)`);
  }

  // Flatten scripts/ to templates/scripts/
  const scriptsSrc = path.join(presetsDir, 'scripts');
  const scriptsDest = path.join(TEMPLATES_DIR, 'scripts');
  if (await fs.pathExists(scriptsSrc)) {
    await fs.ensureDir(scriptsDest);
    const scriptFiles = await fs.readdir(scriptsSrc);
    for (const file of scriptFiles) {
      await fs.copy(path.join(scriptsSrc, file), path.join(scriptsDest, file));
    }
    console.log(`  ✓ scripts/ (${scriptFiles.length} files)`);
  }

  // Copy root-level files from presets/standalone/ (extensible: add files here, they're auto-copied)
  const presetsEntries = await fs.readdir(presetsDir, { withFileTypes: true });
  const rootFiles = presetsEntries.filter(e => e.isFile());
  for (const file of rootFiles) {
    await fs.copy(path.join(presetsDir, file.name), path.join(TEMPLATES_DIR, file.name));
    console.log(`  ✓ ${file.name}`);
  }

  // ============================================
  // STAGE 1b: Copy root project files
  // ============================================
  console.log('\nStage 1b: Root Project Files:');

  // Copy root files
  for (const file of config.rootFiles) {
    const src = path.join(PROJECT_ROOT, file);
    const dest = path.join(TEMPLATES_DIR, file);

    if (await fs.pathExists(src)) {
      await fs.copy(src, dest);
      console.log(`  ✓ ${file}`);
    } else {
      console.log(`  ⚠ ${file} (not found, skipping)`);
    }
  }

  // Copy root directories
  for (const dir of config.rootDirectories) {
    const src = path.join(PROJECT_ROOT, dir);
    const dest = path.join(TEMPLATES_DIR, dir);

    if (await fs.pathExists(src)) {
      await fs.copy(src, dest, {
        filter: (srcPath: string) => {
          // Exclude generated files (they exist in standalone projects, not in templates)
          if (srcPath.endsWith('tailwindColors.ts')) return false;
          return true;
        },
      });
      const fileCount = await countFiles(dest);
      console.log(`  ✓ ${dir}/ (${fileCount} files)`);
    } else {
      console.log(`  ⚠ ${dir}/ (not found, skipping)`);
    }
  }

  // Copy screensets
  for (const screenset of config.screensets) {
    const src = path.join(PROJECT_ROOT, 'src/screensets', screenset);
    const dest = path.join(TEMPLATES_DIR, 'src/screensets', screenset);

    if (await fs.pathExists(src)) {
      await fs.copy(src, dest);
      const fileCount = await countFiles(dest);
      console.log(`  ✓ src/screensets/${screenset}/ (${fileCount} files)`);
    } else {
      console.log(`  ⚠ src/screensets/${screenset}/ (not found, skipping)`);
    }
  }

  // Copy screenset template
  const templateSrc = path.join(PROJECT_ROOT, 'src/screensets', config.screensetTemplate);
  const templateDest = path.join(TEMPLATES_DIR, 'screenset-template');
  if (await fs.pathExists(templateSrc)) {
    await fs.copy(templateSrc, templateDest);
    const fileCount = await countFiles(templateDest);
    console.log(`  ✓ screenset-template/ (${fileCount} files)`);
  }

  // Copy layout templates (from packages/cli/templates-source/layout/)
  // These are separate from the project files and provide scaffold layout options
  const layoutSrc = path.join(CLI_ROOT, 'templates-source', 'layout');
  const layoutDest = path.join(TEMPLATES_DIR, 'layout');
  if (await fs.pathExists(layoutSrc)) {
    await fs.copy(layoutSrc, layoutDest);
    const fileCount = await countFiles(layoutDest);
    console.log(`  ✓ layout/ templates (${fileCount} files)`);
  }

  // ============================================
  // STAGE 1c: Assemble .ai/ from markers
  // ============================================
  console.log('\nStage 1c: AI Configuration (marker-based):');
  const aiSourceDir = path.join(PROJECT_ROOT, '.ai');
  const aiDestDir = path.join(TEMPLATES_DIR, '.ai');
  const overridesDir = path.join(PROJECT_ROOT, config.standaloneOverridesDir);

  await fs.ensureDir(aiDestDir);

  // Scan root .ai/ for marked files
  const markedFiles = await scanForMarkedFiles(aiSourceDir, aiSourceDir);

  let standaloneCount = 0;
  let overrideCount = 0;

  for (const { relativePath, marker } of markedFiles) {
    const destPath = path.join(aiDestDir, relativePath);
    await fs.ensureDir(path.dirname(destPath));

    // Skip internal commands (monorepo-only - hai3dev-* and commands/internal/)
    if (relativePath.includes('hai3dev-') || relativePath.includes('commands/internal/')) continue;

    if (marker === 'standalone') {
      // Copy verbatim from root .ai/
      const srcPath = path.join(aiSourceDir, relativePath);
      await fs.copy(srcPath, destPath);
      standaloneCount++;
    } else if (marker === 'override') {
      // Copy from presets/standalone-overrides/
      const overridePath = path.join(overridesDir, relativePath);
      if (await fs.pathExists(overridePath)) {
        await fs.copy(overridePath, destPath);
        overrideCount++;
      } else {
        console.log(`  ⚠ Override not found: ${relativePath}`);
      }
    }
  }

  console.log(`  ✓ .ai/ (${standaloneCount} standalone, ${overrideCount} overrides)`);

  // ============================================
  // STAGE 2: Generate IDE rules and adapters
  // ============================================
  console.log('\nStage 2: Generated IDE Configuration:');

  // Generate command adapters for all IDEs
  const standaloneCommands = markedFiles
    .filter((f) => f.marker === 'standalone')
    .map((f) => f.relativePath);
  const adapterCounts = await generateCommandAdapters(standaloneCommands, TEMPLATES_DIR);
  console.log(`  ✓ .claude/commands/ (${adapterCounts.claude} adapters)`);
  console.log(`  ✓ .cursor/commands/ (${adapterCounts.cursor} adapters)`);
  console.log(`  ✓ .windsurf/workflows/ (${adapterCounts.windsurf} adapters)`);

  // Generate IDE rules (CLAUDE.md, .cursor/rules/, .windsurf/rules/)
  await generateIdeRules(TEMPLATES_DIR);
  console.log('  ✓ CLAUDE.md (pointer to .ai/GUIDELINES.md)');
  console.log('  ✓ .cursor/rules/hai3.mdc (pointer)');
  console.log('  ✓ .windsurf/rules/hai3.md (pointer)');

  // ============================================
  // Write manifest
  // ============================================
  const standaloneCommandFiles = standaloneCommands
    .filter((f) => f.startsWith('commands/') && !f.includes('hai3dev-') && !f.includes('commands/internal/'));
  const manifest = {
    pipeline: '3-stage',
    stage1a: {
      source: 'presets/standalone/',
      items: ['eslint-plugin-local/', 'configs/ (flattened)', 'scripts/'],
    },
    stage1b: {
      source: 'project root',
      rootFiles: config.rootFiles,
      directories: config.rootDirectories,
      screensets: config.screensets,
    },
    stage1c: {
      source: 'root .ai/ (marker-based)',
      standaloneFiles: markedFiles
        .filter((f) => f.marker === 'standalone' && !f.relativePath.includes('hai3dev-') && !f.relativePath.includes('commands/internal/'))
        .map((f) => f.relativePath),
      overrideFiles: markedFiles
        .filter((f) => f.marker === 'override')
        .map((f) => f.relativePath),
    },
    stage2: {
      generated: [
        'CLAUDE.md',
        '.cursor/rules/hai3.mdc',
        '.windsurf/rules/hai3.md',
        ...standaloneCommandFiles.map((f) => `.claude/commands/${path.basename(f)}`),
      ],
    },
    screensetTemplate: 'screenset-template',
    generatedAt: new Date().toISOString(),
  };
  await fs.writeJson(path.join(TEMPLATES_DIR, 'manifest.json'), manifest, {
    spaces: 2,
  });

  console.log('\n✅ Templates copied successfully!');
  console.log(`   Location: ${TEMPLATES_DIR}`);
}

copyTemplates().catch((err) => {
  console.error('❌ Failed to copy templates:', err);
  process.exit(1);
});
