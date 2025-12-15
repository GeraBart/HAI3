/**
 * createHAI3 - App Builder Factory
 *
 * Creates a HAI3 app builder for custom plugin composition.
 * This is the core of the plugin architecture.
 *
 * Framework Layer: L2 (Depends on SDK packages)
 */

import { createStore } from '@hai3/store';
import type { EffectInitializer } from '@hai3/store';
import type { Reducer } from '@reduxjs/toolkit';
import type {
  HAI3Config,
  HAI3Plugin,
  HAI3AppBuilder,
  HAI3App,
  HAI3Actions,
  HAI3Store,
  PluginFactory,
  ScreensetRegistry,
  ThemeRegistry,
  RouteRegistry,
} from './types';
import { apiRegistry } from '@hai3/api';

// ============================================================================
// Plugin Resolution
// ============================================================================

/**
 * Check if value is a plugin factory function
 */
function isPluginFactory(
  value: HAI3Plugin | PluginFactory
): value is PluginFactory {
  return typeof value === 'function';
}

/**
 * Resolve plugin - if it's a factory, call it; otherwise return as-is
 */
function resolvePlugin(plugin: HAI3Plugin | PluginFactory): HAI3Plugin {
  return isPluginFactory(plugin) ? plugin() : plugin;
}

// ============================================================================
// App Builder Implementation
// ============================================================================

/**
 * HAI3 App Builder Implementation
 */
class HAI3AppBuilderImpl implements HAI3AppBuilder {
  private plugins: HAI3Plugin[] = [];
  private config: HAI3Config;

  constructor(config: HAI3Config = {}) {
    this.config = {
      name: 'HAI3 App',
      devMode: false,
      strictMode: false,
      ...config,
    };
  }

  /**
   * Add a plugin to the application.
   * Also accepts an array of plugins (for preset support).
   */
  use(plugin: HAI3Plugin | PluginFactory | HAI3Plugin[]): HAI3AppBuilder {
    // Handle arrays (presets return arrays)
    if (Array.isArray(plugin)) {
      plugin.forEach((p) => this.use(p));
      return this;
    }

    const resolved = resolvePlugin(plugin);

    // Check if plugin already registered
    if (this.plugins.some((p) => p.name === resolved.name)) {
      if (this.config.devMode) {
        console.warn(
          `Plugin "${resolved.name}" is already registered. Skipping duplicate.`
        );
      }
      return this;
    }

    this.plugins.push(resolved);
    return this;
  }

  /**
   * Add multiple plugins at once.
   */
  useAll(plugins: Array<HAI3Plugin | PluginFactory>): HAI3AppBuilder {
    plugins.forEach((plugin) => this.use(plugin));
    return this;
  }

  /**
   * Build the application.
   */
  build(): HAI3App {
    // 1. Resolve dependencies and order plugins
    const orderedPlugins = this.resolveDependencies();

    // 2. Call onRegister for each plugin
    orderedPlugins.forEach((plugin) => {
      if (plugin.onRegister) {
        plugin.onRegister(this, plugin._configType);
      }
    });

    // 3. Aggregate all provides
    const aggregated = this.aggregateProvides(orderedPlugins);

    // 4. Create store with aggregated slices
    const store = this.createStoreWithSlices(aggregated.slices);

    // 5. Initialize effects
    aggregated.effects.forEach((initEffect) => {
      initEffect(store.dispatch);
    });

    // 6. Build the app object
    // Cast actions to HAI3Actions - all plugins have contributed their actions
    // via module augmentation, so the runtime object matches the declared type
    const app: HAI3App = {
      config: this.config,
      store: store as HAI3Store,
      screensetRegistry: aggregated.registries.screensetRegistry as ScreensetRegistry,
      themeRegistry: aggregated.registries.themeRegistry as ThemeRegistry,
      routeRegistry: aggregated.registries.routeRegistry as RouteRegistry,
      apiRegistry: apiRegistry,
      i18nRegistry: aggregated.registries.i18nRegistry as HAI3App['i18nRegistry'],
      actions: aggregated.actions as HAI3Actions,
      destroy: () => this.destroyApp(orderedPlugins, app),
    };

    // 7. Call onInit for each plugin
    orderedPlugins.forEach((plugin) => {
      if (plugin.onInit) {
        plugin.onInit(app);
      }
    });

    return app;
  }

  /**
   * Resolve plugin dependencies using topological sort.
   */
  private resolveDependencies(): HAI3Plugin[] {
    const resolved: HAI3Plugin[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (plugin: HAI3Plugin) => {
      if (visited.has(plugin.name)) return;

      if (visiting.has(plugin.name)) {
        throw new Error(
          `Circular dependency detected: ${plugin.name} depends on itself or creates a cycle.`
        );
      }

      visiting.add(plugin.name);

      // Process dependencies first
      if (plugin.dependencies) {
        for (const depName of plugin.dependencies) {
          const dep = this.plugins.find((p) => p.name === depName);

          if (!dep) {
            if (this.config.strictMode) {
              throw new Error(
                `Plugin "${plugin.name}" requires "${depName}" but it is not registered.\n` +
                  `Add the missing plugin: .use(${depName}())`
              );
            } else {
              console.warn(
                `Plugin "${plugin.name}" requires "${depName}" but it is not registered. ` +
                  `Some features may not work correctly.`
              );
              continue;
            }
          }

          visit(dep);
        }
      }

      visiting.delete(plugin.name);
      visited.add(plugin.name);
      resolved.push(plugin);
    };

    this.plugins.forEach(visit);
    return resolved;
  }

  /**
   * Aggregate all provides from plugins.
   */
  private aggregateProvides(plugins: HAI3Plugin[]) {
    const registries: Record<string, unknown> = {};
    const slices: Array<{ name: string; reducer: Reducer }> = [];
    const effects: EffectInitializer[] = [];
    // Actions are typed via module augmentation - each plugin declares its actions
    // in HAI3Actions interface. At runtime we merge them all together.
    const actions: Partial<HAI3Actions> = {};

    plugins.forEach((plugin) => {
      if (!plugin.provides) return;

      // Merge registries
      if (plugin.provides.registries) {
        Object.assign(registries, plugin.provides.registries);
      }

      // Collect slices
      if (plugin.provides.slices) {
        plugin.provides.slices.forEach((slice) => {
          slices.push(slice as { name: string; reducer: Reducer });
        });
      }

      // Collect effects
      if (plugin.provides.effects) {
        effects.push(...plugin.provides.effects);
      }

      // Merge actions (type-safe via HAI3Actions module augmentation)
      if (plugin.provides.actions) {
        Object.assign(actions, plugin.provides.actions);
      }
    });

    return { registries, slices, effects, actions };
  }

  /**
   * Create store with all aggregated slices.
   */
  private createStoreWithSlices(
    slices: Array<{ name: string; reducer: Reducer }>
  ): HAI3Store {
    // Create initial reducers map
    const initialReducers: Record<string, Reducer> = {};
    slices.forEach((slice) => {
      initialReducers[slice.name] = slice.reducer;
    });

    // Create store with initial reducers
    return createStore(initialReducers);
  }

  /**
   * Destroy the app and cleanup resources.
   */
  private destroyApp(plugins: HAI3Plugin[], app: HAI3App): void {
    // Call onDestroy in reverse order
    [...plugins].reverse().forEach((plugin) => {
      if (plugin.onDestroy) {
        plugin.onDestroy(app);
      }
    });
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create a HAI3 app builder for custom plugin composition.
 *
 * @param config - Optional application configuration
 * @returns App builder for plugin composition
 *
 * @example
 * ```typescript
 * const app = createHAI3()
 *   .use(screensets())
 *   .use(themes())
 *   .build();
 * ```
 */
export function createHAI3(config?: HAI3Config): HAI3AppBuilder {
  return new HAI3AppBuilderImpl(config);
}
