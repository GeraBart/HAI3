/**
 * HAI3 Application Component
 *
 * This component returns null because HAI3Provider renders AppRouter internally,
 * which includes the Layout component.
 *
 * HAI3Provider (in main.tsx) handles:
 * - Redux Provider setup
 * - AppRouter with BrowserRouter + RouterSync + Layout
 *
 * Framework handles everything else:
 * - Footer discovers registered themes/screensets
 * - Navigation events switch screensets automatically
 * - Routes sync lazily from registered screensets
 * - Menu displays logo and handles expand/collapse
 */

function App() {
  return null;
}

export default App;
