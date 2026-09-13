import React from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { transform } from 'sucrase';
import * as LucideIcons from 'lucide-react';
import {
  MachineCodingChallenge,
  TestExecutionResult,
  SingleTestResult,
  TestExecutionHelpers,
} from '../../types/machineCodingChallenge';

const safeFlushSync = (fn: () => void) => {
  try {
    flushSync(fn);
  } catch {
    fn();
  }
};

export interface CompilationResult {
  Component?: React.ComponentType<any>;
  exports?: Record<string, any>;
  error?: string;
}

export function compileReactCode(userCode: string): CompilationResult {
  try {
    // 1. Transpile TSX/JSX using Sucrase
    const transpiled = transform(userCode, {
      transforms: ['jsx', 'typescript', 'imports'],
      jsxRuntime: 'classic',
    }).code;

    // 2. Prepare isolated module execution environment
    const moduleScope = {
      exports: {} as Record<string, any>,
    };

    const requireShim = (moduleName: string) => {
      if (moduleName === 'react') return React;
      if (moduleName === 'react-dom' || moduleName === 'react-dom/client') {
        return { createRoot };
      }
      if (moduleName === 'lucide-react') {
        return LucideIcons;
      }
      throw new Error(`Module "${moduleName}" is not available in Challenge sandbox.`);
    };

    // 3. Execute inside Function constructor
    const runner = new Function('React', 'require', 'exports', 'module', transpiled);
    runner(React, requireShim, moduleScope.exports, moduleScope);

    // 4. Resolve default or named App component
    let Component: React.ComponentType<any> | undefined;
    const potentialComponent =
      moduleScope.exports.default ||
      moduleScope.exports.App;

    if (
      typeof potentialComponent === 'function' ||
      (typeof potentialComponent === 'object' && potentialComponent !== null)
    ) {
      Component = potentialComponent;
    }

    const exportedKeys = Object.keys(moduleScope.exports);
    if (!Component && exportedKeys.length === 0) {
      return {
        error:
          'No valid React component or module export found. Please make sure to export your component or class/function (e.g. "export default App" or "export { ... }").',
      };
    }

    return { Component, exports: moduleScope.exports };
  } catch (err: any) {
    return {
      error: `Compilation Error: ${err?.message || String(err)}`,
    };
  }
}

export function createTestHelpers(
  container: HTMLElement,
  exportsModule?: Record<string, any>
): TestExecutionHelpers {
  const getByText = (matcher: string | RegExp): HTMLElement => {
    const el = queryByText(matcher);
    if (!el) {
      throw new Error(`Unable to find an element with text: ${matcher.toString()}`);
    }
    return el;
  };

  const queryByText = (matcher: string | RegExp): HTMLElement | null => {
    const all = Array.from(container.querySelectorAll('*')) as HTMLElement[];

    const matchesNode = (node: HTMLElement): boolean => {
      const text = (node.textContent || '').trim();
      if (typeof matcher === 'string') {
        if (text.toLowerCase() === matcher.trim().toLowerCase()) return true;
        // Fallback for leaf elements with partial match
        if (node.children.length === 0 && text.toLowerCase().includes(matcher.trim().toLowerCase())) {
          return true;
        }
        return false;
      }
      return matcher.test(text);
    };

    // Filter elements that match the text
    const matchingElements = all.filter(matchesNode);
    if (matchingElements.length === 0) return null;

    // Pick the leaf-most matching element:
    // If an ancestor matches because its children contain the text, prefer the specific child element
    for (let i = matchingElements.length - 1; i >= 0; i--) {
      const el = matchingElements[i];
      const hasMatchingDescendant = Array.from(el.querySelectorAll('*')).some((child) =>
        matchesNode(child as HTMLElement)
      );
      if (!hasMatchingDescendant) {
        return el;
      }
    }

    return matchingElements[matchingElements.length - 1] || null;
  };

  const getByTestId = (id: string): HTMLElement => {
    const el = queryByTestId(id);
    if (!el) {
      throw new Error(`Unable to find an element with data-testid="${id}"`);
    }
    return el;
  };

  const queryByTestId = (id: string): HTMLElement | null => {
    return container.querySelector(`[data-testid="${id}"]`);
  };

  const getByRole = (role: string, name?: string | RegExp): HTMLElement => {
    const el = queryByRole(role, name);
    if (!el) {
      throw new Error(`Unable to find role="${role}"${name ? ` with name "${name}"` : ''}`);
    }
    return el;
  };

  const queryByRole = (role: string, name?: string | RegExp): HTMLElement | null => {
    const selector =
      role === 'button'
        ? 'button, [role="button"], input[type="button"], input[type="submit"]'
        : role === 'textbox'
        ? 'input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]), textarea, [role="textbox"]'
        : role === 'heading'
        ? 'h1, h2, h3, h4, h5, h6, [role="heading"]'
        : role === 'list'
        ? 'ul, ol, [role="list"]'
        : role === 'listitem'
        ? 'li, [role="listitem"]'
        : `[role="${role}"]`;

    const elements = Array.from(container.querySelectorAll(selector)) as HTMLElement[];
    if (!name) return elements[0] || null;

    return (
      elements.find((el) => {
        const text = (el.textContent || el.getAttribute('aria-label') || (el as any).value || '').trim();
        return typeof name === 'string' ? text.toLowerCase().includes(name.toLowerCase()) : name.test(text);
      }) || null
    );
  };

  const getAllByRole = (role: string): HTMLElement[] => {
    const selector =
      role === 'button'
        ? 'button, [role="button"], input[type="button"], input[type="submit"]'
        : role === 'textbox'
        ? 'input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]), textarea, [role="textbox"]'
        : role === 'listitem'
        ? 'li, [role="listitem"]'
        : `[role="${role}"]`;
    return Array.from(container.querySelectorAll(selector)) as HTMLElement[];
  };

  const getByPlaceholderText = (placeholder: string | RegExp): HTMLInputElement | HTMLTextAreaElement => {
    const el = queryByPlaceholderText(placeholder);
    if (!el) {
      throw new Error(`Unable to find input with placeholder: ${placeholder.toString()}`);
    }
    return el;
  };

  const queryByPlaceholderText = (placeholder: string | RegExp): HTMLInputElement | HTMLTextAreaElement | null => {
    const inputs = Array.from(container.querySelectorAll('input, textarea')) as (HTMLInputElement | HTMLTextAreaElement)[];
    return (
      inputs.find((inp) => {
        const ph = inp.placeholder || '';
        return typeof placeholder === 'string' ? ph.toLowerCase().includes(placeholder.toLowerCase()) : placeholder.test(ph);
      }) || null
    );
  };

  const setElementValue = (element: HTMLElement, val: any) => {
    const win = element.ownerDocument?.defaultView || window;
    const proto =
      element.tagName === 'TEXTAREA'
        ? win.HTMLTextAreaElement?.prototype
        : element.tagName === 'SELECT'
        ? win.HTMLSelectElement?.prototype
        : win.HTMLInputElement?.prototype;
    const descriptor = Object.getOwnPropertyDescriptor(proto || {}, 'value');
    if (descriptor && descriptor.set) {
      descriptor.set.call(element, val);
    } else {
      (element as any).value = val;
    }
  };

  const fireEvent = {
    click: (element: HTMLElement) => {
      safeFlushSync(() => {
        element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      });
    },
    change: (element: HTMLElement, value: any) => {
      const targetValue = value?.target?.value !== undefined ? value.target.value : value;
      if ('value' in element && targetValue !== undefined) {
        setElementValue(element, targetValue);
      }
      safeFlushSync(() => {
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
      });
    },
    input: (element: HTMLElement, value: any) => {
      const targetValue = value?.target?.value !== undefined ? value.target.value : value;
      if ('value' in element && targetValue !== undefined) {
        setElementValue(element, targetValue);
      }
      safeFlushSync(() => {
        element.dispatchEvent(new Event('input', { bubbles: true }));
      });
    },
    submit: (element: HTMLElement) => {
      safeFlushSync(() => {
        element.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      });
    },
    keyDown: (element: HTMLElement, key: string, options: any = {}) => {
      safeFlushSync(() => {
        element.dispatchEvent(
          new KeyboardEvent('keydown', {
            key,
            bubbles: true,
            cancelable: true,
            ...options,
          })
        );
      });
    },
    focus: (element: HTMLElement) => {
      element.focus();
      safeFlushSync(() => {
        element.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
      });
    },
    blur: (element: HTMLElement) => {
      element.blur();
      safeFlushSync(() => {
        element.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
      });
    },
    scroll: (element: HTMLElement) => {
      safeFlushSync(() => {
        element.dispatchEvent(new Event('scroll', { bubbles: true }));
      });
    },
    dragStart: (element: HTMLElement) => {
      safeFlushSync(() => {
        element.dispatchEvent(new DragEvent('dragstart', { bubbles: true }));
      });
    },
    drop: (element: HTMLElement) => {
      safeFlushSync(() => {
        element.dispatchEvent(new DragEvent('drop', { bubbles: true }));
      });
    },
  };

  const type = async (element: HTMLInputElement | HTMLTextAreaElement, text: string): Promise<void> => {
    element.focus();
    setElementValue(element, text);
    safeFlushSync(() => {
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    });
    // Allow any queued effects to run
    await new Promise((r) => setTimeout(r, 40));
  };

  const waitFor = async (
    assertionFn: () => boolean | void | Promise<boolean | void>,
    options: { timeout?: number; interval?: number } = {}
  ): Promise<void> => {
    const timeout = options.timeout ?? 1200;
    const interval = options.interval ?? 25;
    const start = Date.now();

    while (Date.now() - start < timeout) {
      try {
        const res = await assertionFn();
        if (res !== false) {
          return;
        }
      } catch {
        // Continue waiting until timeout
      }
      await new Promise((r) => setTimeout(r, interval));
    }

    // Final attempt, will throw if it fails
    const finalRes = await assertionFn();
    if (finalRes === false) {
      throw new Error(`waitFor condition timed out after ${timeout}ms.`);
    }
  };

  const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

  const expect = (actual: any) => {
    return {
      toBe: (expected: any) => {
        if (actual !== expected) {
          throw new Error(`Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
        }
      },
      toEqual: (expected: any) => {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
          throw new Error(`Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
        }
      },
      toContain: (item: any) => {
        if (typeof actual === 'string') {
          if (!actual.includes(String(item))) {
            throw new Error(`Expected "${actual}" to contain "${item}"`);
          }
        } else if (Array.isArray(actual)) {
          if (!actual.includes(item)) {
            throw new Error(`Expected array to contain ${JSON.stringify(item)}`);
          }
        } else {
          throw new Error(`Cannot perform toContain on non-iterable type: ${typeof actual}`);
        }
      },
      toBeTruthy: () => {
        if (!actual) {
          throw new Error(`Expected truthy value, but received: ${JSON.stringify(actual)}`);
        }
      },
      toBeFalsy: () => {
        if (actual) {
          throw new Error(`Expected falsy value, but received: ${JSON.stringify(actual)}`);
        }
      },
      toHaveLength: (len: number) => {
        const length = actual?.length ?? actual?.size ?? 0;
        if (length !== len) {
          throw new Error(`Expected length ${len}, but received length ${length}`);
        }
      },
      toBeGreaterThan: (n: number) => {
        if (!(actual > n)) {
          throw new Error(`Expected ${actual} > ${n}`);
        }
      },
      toBeLessThan: (n: number) => {
        if (!(actual < n)) {
          throw new Error(`Expected ${actual} < ${n}`);
        }
      },
      toBeNull: () => {
        if (actual !== null) {
          throw new Error(`Expected null, received: ${JSON.stringify(actual)}`);
        }
      },
      not: {
        toBe: (expected: any) => {
          if (actual === expected) {
            throw new Error(`Expected not ${JSON.stringify(expected)}`);
          }
        },
        toContain: (item: any) => {
          if (typeof actual === 'string' && actual.includes(String(item))) {
            throw new Error(`Expected not to contain "${item}"`);
          }
          if (Array.isArray(actual) && actual.includes(item)) {
            throw new Error(`Expected not to contain ${JSON.stringify(item)}`);
          }
        },
        toBeTruthy: () => {
          if (actual) {
            throw new Error(`Expected not truthy`);
          }
        },
      },
    };
  };

  return {
    container,
    exports: exportsModule,
    getByText,
    queryByText,
    getByTestId,
    queryByTestId,
    getByRole,
    queryByRole,
    getByPlaceholderText,
    queryByPlaceholderText,
    getAllByRole,
    fireEvent,
    type,
    waitFor,
    sleep,
    expect,
  };
}

export async function runWithTimeout<T>(
  fn: () => Promise<T> | T,
  timeoutMs: number = 3000
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(
        new Error(
          `Execution timed out after ${timeoutMs}ms. Check for infinite loops or hanging async operations.`
        )
      );
    }, timeoutMs);

    Promise.resolve()
      .then(() => fn())
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export async function runChallengeTests(
  challenge: MachineCodingChallenge,
  userCode: string,
  includeHidden: boolean = false
): Promise<TestExecutionResult> {
  const overallStart = performance.now();
  const logs: Array<{ type: 'log' | 'info' | 'warn' | 'error'; message: string }> = [];

  // Filter test cases based on run mode (Run Tests = public only; Submit = all)
  const targetTests = includeHidden
    ? challenge.testCases
    : challenge.testCases.filter((tc) => !tc.hidden);

  // 1. Compile User Code
  const { Component, exports, error: compileErr } = compileReactCode(userCode);

  if (compileErr || (!Component && (!exports || Object.keys(exports).length === 0))) {
    const errorMsg = compileErr || 'No valid Component or module export found in your code.';
    return {
      challengeId: challenge.id,
      total: targetTests.length,
      passed: 0,
      failed: targetTests.length,
      durationMs: Math.round(performance.now() - overallStart),
      compileError: errorMsg,
      results: targetTests.map((tc) => ({
        testId: tc.id,
        name: tc.name,
        description: tc.description,
        hidden: !!tc.hidden,
        passed: false,
        error: errorMsg,
        durationMs: 0,
      })),
      logs,
    };
  }

  // 2. Prepare Sandbox DOM Container
  const sandboxHost = document.createElement('div');
  sandboxHost.setAttribute('id', 'challenge-test-sandbox-root');
  sandboxHost.style.position = 'fixed';
  sandboxHost.style.left = '-9999px';
  sandboxHost.style.top = '-9999px';
  sandboxHost.style.width = '1000px';
  sandboxHost.style.height = '1000px';
  sandboxHost.style.opacity = '0';
  sandboxHost.style.pointerEvents = 'none';
  document.body.appendChild(sandboxHost);

  // Intercept console messages during test run
  const originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
  };

  console.log = (...args: any[]) => {
    logs.push({ type: 'log', message: args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ') });
    originalConsole.log(...args);
  };
  console.info = (...args: any[]) => {
    logs.push({ type: 'info', message: args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ') });
    originalConsole.info(...args);
  };
  console.warn = (...args: any[]) => {
    logs.push({ type: 'warn', message: args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ') });
    originalConsole.warn(...args);
  };
  console.error = (...args: any[]) => {
    logs.push({ type: 'error', message: args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ') });
    originalConsole.error(...args);
  };

  const testResults: SingleTestResult[] = [];

  try {
    for (const tc of targetTests) {
      const testStart = performance.now();
      const testContainer = document.createElement('div');
      sandboxHost.appendChild(testContainer);
      let root: any = null;

      let testPassed = false;
      let errorMsg: string | undefined;
      let expectedStr = tc.expectedResult;
      let receivedStr: string | undefined;

      try {
        // Mount candidate component if it exists and not a backend challenge
        if (Component && challenge.track !== 'backend') {
          root = createRoot(testContainer);
          root.render(React.createElement(Component));
          // Allow initial mount and render effects to commit
          await new Promise((r) => setTimeout(r, 45));
        }

        const helpers = createTestHelpers(testContainer, exports);
        // Execute test case with 3000ms timeout guard
        await runWithTimeout(() => tc.testFn(helpers), 3000);

        testPassed = true;
      } catch (err: any) {
        testPassed = false;
        errorMsg = err?.message || String(err);

        // Parse expected/received details if available from matcher
        if (errorMsg && errorMsg.includes('Expected') && errorMsg.includes('received')) {
          const match = errorMsg.match(/Expected (.*?),? received (.*)/);
          if (match) {
            expectedStr = expectedStr || match[1];
            receivedStr = match[2];
          }
        }
      } finally {
        if (root) {
          try {
            root.unmount();
          } catch {
            // ignore unmount errors
          }
        }
        if (testContainer.parentNode) {
          testContainer.parentNode.removeChild(testContainer);
        }
      }

      testResults.push({
        testId: tc.id,
        name: tc.name,
        description: tc.description,
        hidden: !!tc.hidden,
        passed: testPassed,
        error: errorMsg,
        expected: expectedStr,
        received: receivedStr,
        hint: !testPassed && !tc.hidden ? challenge.hints[0] : undefined,
        durationMs: Math.round(performance.now() - testStart),
      });
    }
  } finally {
    // Restore console
    console.log = originalConsole.log;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;

    if (sandboxHost.parentNode) {
      sandboxHost.parentNode.removeChild(sandboxHost);
    }
  }

  const passedCount = testResults.filter((r) => r.passed).length;

  return {
    challengeId: challenge.id,
    total: testResults.length,
    passed: passedCount,
    failed: testResults.length - passedCount,
    durationMs: Math.round(performance.now() - overallStart),
    results: testResults,
    logs,
  };
}
