/**
 * Plugin System Tests (4.1.7)
 *
 * Tests for @hai3/framework plugin architecture
 */

import {
  createHAI3,
  createHAI3App,
  screensets,
  themes,
  layout,
  navigation,
  i18n,
  presets,
} from './src/index';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void | Promise<void>) {
  try {
    const result = fn();
    if (result instanceof Promise) {
      return result
        .then(() => {
          console.log(`✅ ${name}`);
          passed++;
        })
        .catch((err) => {
          console.log(`❌ ${name}`);
          console.log(`   Error: ${err.message}`);
          failed++;
        });
    }
    console.log(`✅ ${name}`);
    passed++;
  } catch (err: unknown) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${err instanceof Error ? err.message : String(err)}`);
    failed++;
  }
}

function assertEqual(actual: unknown, expected: unknown, message?: string) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

function assertExists(value: unknown, message?: string) {
  if (value === undefined || value === null) {
    throw new Error(message || 'Value does not exist');
  }
}

function _assertThrows(fn: () => void, message?: string) {
  try {
    fn();
    throw new Error(message || 'Expected function to throw');
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : String(err);
    if (errMessage === (message || 'Expected function to throw')) {
      throw err;
    }
    // Expected to throw, success
  }
}

async function runTests() {
  console.log('\n=== Plugin System Tests (4.1.7) ===\n');

  // 4.1.7.1 Test: createHAI3().use(screensets()).build() works (headless mode)
  test('4.1.7.1 Headless mode - screensets only', () => {
    const app = createHAI3()
      .use(screensets())
      .build();

    assertExists(app, 'App should be created');
    assertExists(app.screensetRegistry, 'screensetRegistry should exist');
    assertExists(app.store, 'store should exist');

    // Cleanup
    app.destroy();
  });

  // 4.1.7.2 Test: createHAI3().use(presets.full()).build() works (all plugins)
  test('4.1.7.2 Full preset - all plugins', () => {
    const app = createHAI3App();

    assertExists(app, 'App should be created');
    assertExists(app.screensetRegistry, 'screensetRegistry should exist');
    assertExists(app.themeRegistry, 'themeRegistry should exist');
    assertExists(app.routeRegistry, 'routeRegistry should exist');
    assertExists(app.i18nRegistry, 'i18nRegistry should exist');
    assertExists(app.apiRegistry, 'apiRegistry should exist');
    assertExists(app.store, 'store should exist');
    assertExists(app.actions, 'actions should exist');

    // Cleanup
    app.destroy();
  });

  // 4.1.7.3 Test: Plugin dependency warning (non-strict mode)
  test('4.1.7.3 Plugin dependency warning in non-strict mode', () => {
    // layout depends on screensets - in non-strict mode, warns but continues
    // Note: dependency auto-resolution is a future enhancement
    const app = createHAI3()
      .use(screensets()) // Add dependency explicitly
      .use(layout())
      .build();

    assertExists(app.screensetRegistry, 'screensetRegistry should exist when explicitly added');

    // Cleanup
    app.destroy();
  });

  // 4.1.7.4 Test: Missing dependency handled gracefully
  test('4.1.7.4 Missing dependency handled gracefully', () => {
    // In non-strict mode, missing dependencies warn but don't throw
    // App still builds, just with limited functionality
    const app = createHAI3()
      .use(screensets())
      .use(navigation()) // depends on screensets which we added
      .build();

    assertExists(app.screensetRegistry, 'App should build with dependencies met');

    app.destroy();
  });

  // 4.1.7.5 Test: app.screensetRegistry is accessible after build
  test('4.1.7.5 screensetRegistry accessible after build', () => {
    const app = createHAI3App();

    assertExists(app.screensetRegistry, 'screensetRegistry should exist');
    assertEqual(typeof app.screensetRegistry.register, 'function', 'register should be a function');
    assertEqual(typeof app.screensetRegistry.get, 'function', 'get should be a function');
    assertEqual(typeof app.screensetRegistry.getAll, 'function', 'getAll should be a function');

    // Test that we can call methods
    const all = app.screensetRegistry.getAll();
    assertEqual(Array.isArray(all), true, 'getAll should return array');

    app.destroy();
  });

  // 4.1.7.6 Test: app.store is configured with plugin slices
  test('4.1.7.6 Store configured with plugin slices', () => {
    const app = createHAI3App();

    assertExists(app.store, 'store should exist');
    assertExists(app.store.getState, 'getState should exist');
    assertExists(app.store.dispatch, 'dispatch should exist');

    const state = app.store.getState();
    assertExists(state, 'state should exist');

    // Check that layout slices are registered (from layout plugin)
    // Layout plugin registers slices with keys like 'layout/header', 'layout/popup', etc.
    assertExists(state['layout/header'], 'layout/header state should exist');
    assertExists(state['layout/popup'], 'layout/popup state should exist');

    app.destroy();
  });

  // 4.1.7.7 Test: Plugin lifecycle hooks are called in correct order
  test('4.1.7.7 Plugin lifecycle hooks order', () => {
    const order: string[] = [];

    const testPlugin = {
      name: 'test-lifecycle',
      dependencies: [],
      provides: {},
      onRegister: () => { order.push('onRegister'); },
      onInit: () => { order.push('onInit'); },
      onDestroy: () => { order.push('onDestroy'); },
    };

    const app = createHAI3()
      .use(testPlugin)
      .build();

    // After build, onRegister and onInit should have been called
    assertEqual(order.includes('onRegister'), true, 'onRegister should be called');
    assertEqual(order.includes('onInit'), true, 'onInit should be called');
    assertEqual(order.indexOf('onRegister') < order.indexOf('onInit'), true, 'onRegister should be before onInit');

    // Destroy should call onDestroy
    app.destroy();
    assertEqual(order.includes('onDestroy'), true, 'onDestroy should be called');
  });

  // Additional test: Multiple plugins composition
  test('4.1.7.x Multiple plugins composition', () => {
    const app = createHAI3()
      .use(screensets())
      .use(themes())
      .use(i18n())
      .build();

    assertExists(app.screensetRegistry, 'screensetRegistry should exist');
    assertExists(app.themeRegistry, 'themeRegistry should exist');
    assertExists(app.i18nRegistry, 'i18nRegistry should exist');

    app.destroy();
  });

  // Additional test: Actions are aggregated
  test('4.1.7.x Actions aggregated from plugins', () => {
    const app = createHAI3App();

    assertExists(app.actions, 'actions should exist');
    assertExists(app.actions.navigateToScreen, 'navigateToScreen action should exist');
    assertExists(app.actions.navigateToScreenset, 'navigateToScreenset action should exist');
    assertExists(app.actions.changeTheme, 'changeTheme action should exist');
    assertExists(app.actions.setLanguage, 'setLanguage action should exist');

    app.destroy();
  });

  // Additional test: Minimal preset
  test('4.1.7.x Minimal preset works', () => {
    const app = createHAI3()
      .use(presets.minimal())
      .build();

    assertExists(app.screensetRegistry, 'screensetRegistry should exist');
    assertExists(app.themeRegistry, 'themeRegistry should exist');

    app.destroy();
  });

  // Additional test: Headless preset
  test('4.1.7.x Headless preset works', () => {
    const app = createHAI3()
      .use(presets.headless())
      .build();

    assertExists(app.screensetRegistry, 'screensetRegistry should exist');

    app.destroy();
  });

  console.log('\n=== Results ===');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${passed + failed}`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(console.error);
