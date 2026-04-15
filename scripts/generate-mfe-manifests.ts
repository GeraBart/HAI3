#!/usr/bin/env node

// @cpt-FEATURE:cpt-frontx-dod-mfe-isolation-chunk-path-type:p2

/**
 * MFE Manifest Generation Script
 *
 * Reads the enriched mfe.json produced by the frontx-mf-gts Vite plugin for
 * each MFE package and generates a TypeScript module consumed by the host
 * application's bootstrap.
 *
 * The enriched mfe.json already contains all required data:
 * - manifest.metaData: publicPath, remoteEntry, buildInfo from mf-manifest.json
 * - manifest.shared[]: standalone ESM deps with resolved versions and chunkPaths
 * - manifest.mfInitKey: empty string (MF 2.0 runtime removed)
 * - entries[].exposeAssets: from mf-manifest.json exposes[]
 *
 * Pipeline per MFE package:
 *   1. Read mfe.json — enriched by the build plugin
 *   2. Inject resolved publicPath (overrides build-time placeholder)
 *   3. Resolve shared dep chunkPaths (override with --shared-base-url if given)
 *   4. Map entries to MfeEntryMF shape with manifest reference and exposeAssets
 *
 * Usage:
 *   npx tsx scripts/generate-mfe-manifests.ts [--base-url <url>] [--shared-base-url <url>]
 *
 * When --base-url is omitted, publicPath comes from manifest.metaData.publicPath
 * in the enriched mfe.json (set by the build plugin from mf-manifest.json).
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// ---------------------------------------------------------------------------
// Raw JSON shape types (what we read from the enriched mfe.json on disk)
// ---------------------------------------------------------------------------

interface RawMetaData {
  name: string;
  type: string;
  buildInfo: { buildVersion: string; buildName: string };
  remoteEntry: { name: string; path: string; type: string };
  globalName: string;
  publicPath: string;
}

interface RawShared {
  name: string;
  version: string;
  chunkPath: string;
  unwrapKey: string | null;
}

interface RawExposeAssets {
  js: { async: string[]; sync: string[] };
  css: { async: string[]; sync: string[] };
}

interface RawEntry {
  id: string;
  requiredProperties: string[];
  optionalProperties?: string[];
  actions: string[];
  domainActions: string[];
  manifest: string;
  exposedModule: string;
  exposeAssets: RawExposeAssets;
}

interface RawExtension {
  id: string;
  domain: string;
  entry: string;
  presentation?: Record<string, unknown>;
  [key: string]: unknown;
}

interface RawSchema {
  $id?: string;
  [key: string]: unknown;
}

interface RawManifest {
  id: string;
  remoteEntry: string;
  metaData: RawMetaData;
  shared: RawShared[];
  mfInitKey: string;
}

/** Enriched mfe.json shape produced by the frontx-mf-gts Vite plugin. */
interface RawEnrichedMfeJson {
  sharedDependencies?: string[];
  manifest: RawManifest;
  entries: RawEntry[];
  extensions: RawExtension[];
  schemas?: RawSchema[];
}

// ---------------------------------------------------------------------------
// Output shape types (mirror the SDK MfManifest / MfeEntryMF types; kept
// local so the script has no dependency on @cyberfabric packages at run time)
// ---------------------------------------------------------------------------

interface OutMfManifestShared {
  name: string;
  version: string;
  chunkPath: string;
  unwrapKey: string | null;
}

interface OutMfManifest {
  id: string;
  name: string;
  metaData: {
    name: string;
    type: string;
    buildInfo: { buildVersion: string; buildName: string };
    remoteEntry: { name: string; path: string; type: string };
    globalName: string;
    publicPath: string;
  };
  shared: OutMfManifestShared[];
}

interface OutMfManifestAssets {
  js: { async: string[]; sync: string[] };
  css: { async: string[]; sync: string[] };
}

interface OutMfeEntryMF {
  id: string;
  requiredProperties: string[];
  optionalProperties?: string[];
  actions: string[];
  domainActions: string[];
  manifest: string;
  exposedModule: string;
  exposeAssets: OutMfManifestAssets;
}

interface OutMfeManifestConfig {
  manifest: OutMfManifest;
  entries: OutMfeEntryMF[];
  extensions: RawExtension[];
  schemas?: RawSchema[];
}

// ---------------------------------------------------------------------------
// ManifestGenerator — class-based implementation
// ---------------------------------------------------------------------------

// @cpt-begin:cpt-frontx-dod-mfe-isolation-chunk-path-type:p2:inst-1
class ManifestGenerator {
  private readonly mfePackagesDir: string;
  private readonly outputFile: string;
  private readonly globalBaseUrl: string | null;
  private readonly sharedBaseUrl: string | null;

  // Packages to skip (hidden dirs, non-MFE directories)
  private static readonly EXCLUDED = new Set(['.git', '.DS_Store', 'shared']);

  constructor(
    mfePackagesDir: string,
    outputFile: string,
    globalBaseUrl: string | null,
    sharedBaseUrl: string | null
  ) {
    this.mfePackagesDir = mfePackagesDir;
    this.outputFile = outputFile;
    this.globalBaseUrl = globalBaseUrl;
    this.sharedBaseUrl = sharedBaseUrl;
  }

  run(): void {
    const packageDirs = this.discoverPackages();
    console.log(`Found ${packageDirs.length} MFE package(s):`);
    packageDirs.forEach((p) => console.log(`  - ${p}`));

    const configs = packageDirs.map((dir) => this.processPackage(dir));
    this.resolveSharedChunkPaths(configs);
    const output = this.renderOutputFile(configs);
    writeFileSync(this.outputFile, output, 'utf-8');
    console.log(`\nGenerated ${this.outputFile}`);
  }

  private discoverPackages(): string[] {
    return readdirSync(this.mfePackagesDir).filter((dir) => {
      if (ManifestGenerator.EXCLUDED.has(dir) || dir.startsWith('.')) {
        return false;
      }
      const pkgPath = join(this.mfePackagesDir, dir);
      return existsSync(join(pkgPath, 'mfe.json'));
    });
  }

  private processPackage(packageDir: string): OutMfeManifestConfig {
    const pkgPath = join(this.mfePackagesDir, packageDir);

    const mfeJson = this.readEnrichedMfeJson(pkgPath, packageDir);
    const publicPath = this.resolvePublicPath(mfeJson, packageDir);

    const outManifest = this.buildManifest(mfeJson.manifest, publicPath);
    const outEntries = this.buildEntries(mfeJson.entries, outManifest.id, packageDir);

    return {
      manifest: outManifest,
      entries: outEntries,
      extensions: mfeJson.extensions,
      ...(mfeJson.schemas !== undefined && { schemas: mfeJson.schemas }),
    };
  }

  private readEnrichedMfeJson(pkgPath: string, packageDir: string): RawEnrichedMfeJson {
    const mfeJsonPath = join(pkgPath, 'mfe.json');
    if (!existsSync(mfeJsonPath)) {
      throw new Error(
        `[${packageDir}] mfe.json not found. ` +
          `Ensure the MFE package has an mfe.json file.`
      );
    }
    let mfeJson: RawEnrichedMfeJson;
    try {
      mfeJson = JSON.parse(readFileSync(mfeJsonPath, 'utf-8')) as RawEnrichedMfeJson;
    } catch (err) {
      throw new Error(`[${packageDir}] Cannot parse mfe.json: ${String(err)}`);
    }
    if (!mfeJson.manifest?.metaData) {
      throw new Error(
        `[${packageDir}] mfe.json is not enriched (missing manifest.metaData). ` +
          `Run 'vite build' for this MFE first (cd src/mfe_packages/${packageDir} && npm run build). ` +
          `Ensure the frontxMfGts plugin is configured in vite.config.ts.`
      );
    }
    return mfeJson;
  }

  /**
   * Resolve publicPath for this MFE.
   * Priority:
   *   1. --base-url CLI flag (global override for all packages)
   *   2. publicPath from enriched mfe.json manifest.metaData (set by plugin)
   *   3. Origin from mfe.json manifest.remoteEntry URL (per-package default)
   *   4. "/" as final fallback
   */
  private resolvePublicPath(
    mfeJson: RawEnrichedMfeJson,
    packageDir: string
  ): string {
    if (this.globalBaseUrl !== null) {
      return this.globalBaseUrl.endsWith('/')
        ? this.globalBaseUrl
        : `${this.globalBaseUrl}/`;
    }

    // Use publicPath from enriched manifest (set by the plugin from mf-manifest.json).
    const manifestPublicPath = mfeJson.manifest.metaData.publicPath;
    if (manifestPublicPath && manifestPublicPath !== '/') {
      return manifestPublicPath.endsWith('/')
        ? manifestPublicPath
        : `${manifestPublicPath}/`;
    }

    // Fall back to mfe.json manifest.remoteEntry origin.
    const remoteEntry = mfeJson.manifest.remoteEntry;
    if (remoteEntry) {
      try {
        const url = new URL(remoteEntry);
        return `${url.origin}/`;
      } catch {
        console.warn(
          `[${packageDir}] Cannot parse remoteEntry URL "${remoteEntry}", defaulting publicPath to "/"`
        );
      }
    }

    return '/';
  }

  private buildManifest(rawManifest: RawManifest, publicPath: string): OutMfManifest {
    return {
      id: rawManifest.id,
      name: rawManifest.name ?? rawManifest.metaData.name,
      metaData: {
        name: rawManifest.metaData.name,
        type: rawManifest.metaData.type,
        buildInfo: {
          buildVersion: rawManifest.metaData.buildInfo.buildVersion,
          buildName: rawManifest.metaData.buildInfo.buildName,
        },
        remoteEntry: {
          name: rawManifest.metaData.remoteEntry.name,
          path: rawManifest.metaData.remoteEntry.path,
          type: rawManifest.metaData.remoteEntry.type,
        },
        globalName: rawManifest.metaData.globalName,
        // Inject resolved publicPath — overrides the "/" placeholder from the build
        publicPath,
      },
      shared: rawManifest.shared.map((s) => ({
        name: s.name,
        version: s.version,
        chunkPath: s.chunkPath,
        unwrapKey: s.unwrapKey,
      })),
    };
  }

  private buildEntries(
    entries: RawEntry[],
    manifestId: string,
    packageDir: string
  ): OutMfeEntryMF[] {
    return entries.map((entry) => {
      if (!entry.exposeAssets) {
        throw new Error(
          `[${packageDir}] Entry "${entry.id}" has no exposeAssets. ` +
            `This usually means mfe.json was not enriched by the build plugin. ` +
            `Rebuild the MFE (cd src/mfe_packages/${packageDir} && npm run build).`
        );
      }

      const out: OutMfeEntryMF = {
        id: entry.id,
        requiredProperties: entry.requiredProperties,
        actions: entry.actions,
        domainActions: entry.domainActions,
        manifest: manifestId,
        exposedModule: entry.exposedModule,
        exposeAssets: {
          js: {
            async: entry.exposeAssets.js.async,
            sync: entry.exposeAssets.js.sync,
          },
          css: {
            async: entry.exposeAssets.css.async,
            sync: entry.exposeAssets.css.sync,
          },
        },
      };

      if (entry.optionalProperties !== undefined) {
        out.optionalProperties = entry.optionalProperties;
      }

      return out;
    });
  }

  /**
   * Override shared dep chunkPaths when --shared-base-url is provided.
   *
   * Enriched mfe.json shared[] entries already have host-relative chunkPaths
   * (e.g. "/shared/react.js"). When --shared-base-url is given, these are
   * replaced with absolute URLs under the shared base (e.g.
   * "https://cdn.example.com/shared/react.js").
   *
   * All MFEs that share the same dependency must resolve to the SAME URL
   * so the handler's sourceTextCache deduplicates fetches.
   */
  private resolveSharedChunkPaths(configs: OutMfeManifestConfig[]): void {
    if (configs.length === 0 || this.sharedBaseUrl === null) return;

    const sharedBase = this.sharedBaseUrl.endsWith('/')
      ? this.sharedBaseUrl
      : `${this.sharedBaseUrl}/`;

    let count = 0;
    for (const config of configs) {
      for (const shared of config.manifest.shared) {
        // Strip leading "/shared/" prefix and prepend the shared base URL.
        const filename = shared.chunkPath.replace(/^\/shared\//, '');
        shared.chunkPath = sharedBase + filename;
        count++;
      }
    }

    if (count > 0) {
      console.log(`  Resolved ${count} shared dep(s) to: ${sharedBase}`);
    }
  }

  private renderOutputFile(configs: OutMfeManifestConfig[]): string {
    const serialized = JSON.stringify(configs, null, 2);

    return `// AUTO-GENERATED FILE
// Generated by: scripts/generate-mfe-manifests.ts
// Do not edit manually!
// Regenerate: npm run generate:mfe-manifests
//
// @cpt-FEATURE:cpt-frontx-dod-mfe-isolation-chunk-path-type:p2

import type { MfManifest, MfeEntryMF, Extension, ScreenExtension, JSONSchema } from '@cyberfabric/react';

export interface MfeManifestConfig {
  // @cpt-FEATURE:cpt-frontx-dod-mfe-isolation-chunk-path-type:p2
  /** MF2 package-level manifest (publicPath, remoteEntry, shared deps, mfInitKey). */
  manifest: MfManifest;
  entries: MfeEntryMF[];
  /**
   * Extensions from mfe.json. ScreenExtension is the concrete type for screen-domain
   * extensions. Extension is the base type accepted by screensetsRegistry.registerExtension().
   */
  extensions: (Extension | ScreenExtension)[];
  // @cpt-FEATURE:cpt-frontx-dod-screenset-registry-mfe-schema-registration:p1
  /** MFE-carried schemas (custom actions, properties). Registered before entries and extensions. */
  schemas?: JSONSchema[];
}

export const MFE_MANIFESTS: MfeManifestConfig[] = ${serialized};

// Get all MFE manifests
// Allows Vite to statically analyze imports without warnings
export function getMfeManifests(): MfeManifestConfig[] {
  return MFE_MANIFESTS;
}
`;
  }
}
// @cpt-end:cpt-frontx-dod-mfe-isolation-chunk-path-type:p2:inst-1

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

function parseArgs(argv: string[]): { baseUrl: string | null; sharedBaseUrl: string | null } {
  const idx = argv.indexOf('--base-url');
  const baseUrl = (idx !== -1 && idx + 1 < argv.length) ? argv[idx + 1] : null;
  const sidx = argv.indexOf('--shared-base-url');
  const sharedBaseUrl = (sidx !== -1 && sidx + 1 < argv.length) ? argv[sidx + 1] : null;
  return { baseUrl, sharedBaseUrl };
}

const { baseUrl, sharedBaseUrl } = parseArgs(process.argv.slice(2));

const MFE_PACKAGES_DIR = join(process.cwd(), 'src/mfe_packages');
const OUTPUT_FILE = join(process.cwd(), 'src/app/mfe/generated-mfe-manifests.ts');

try {
  new ManifestGenerator(MFE_PACKAGES_DIR, OUTPUT_FILE, baseUrl, sharedBaseUrl).run();
} catch (err) {
  console.error('Error generating MFE manifests:', err instanceof Error ? err.message : String(err));
  process.exit(1);
}
