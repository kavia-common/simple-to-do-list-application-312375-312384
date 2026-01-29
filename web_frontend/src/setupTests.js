// jest-dom adds custom jest matchers for asserting on DOM nodes.
import "@testing-library/jest-dom";

/**
 * Testing notes:
 * - Keep tests deterministic: no fake timers needed.
 * - Provide missing DOM APIs used by some components/libraries if needed.
 */
if (!window.HTMLElement.prototype.scrollIntoView) {
  // JSDOM doesn't implement this; harmless no-op for tests.
  window.HTMLElement.prototype.scrollIntoView = function scrollIntoView() {};
}
