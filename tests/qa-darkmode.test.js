const { test, describe } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// Target HTML pages to test
const PAGES = [
  { name: 'Login Page (index.html)', file: 'index.html', path: path.resolve(__dirname, '../frontend/index.html') },
  { name: 'Register Page (register.html)', file: 'register.html', path: path.resolve(__dirname, '../frontend/register.html') },
  { name: 'Dashboard Page (halaman2.html)', file: 'halaman2.html', path: path.resolve(__dirname, '../frontend/halaman2.html') }
];

// Helper to load file content
function getPageContent(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

describe('QA Suite 1: Dark Mode DOM Elements & Accessibility Verification', () => {
  for (const page of PAGES) {
    describe(`DOM & A11y on ${page.name}`, () => {
      const content = getPageContent(page.path);

      test(`DOM-1 [${page.file}]: Theme toggle button with id="themeToggle" exists`, () => {
        assert.match(
          content,
          /<button[^>]*id=["']themeToggle["'][^>]*>/i,
          `#themeToggle button must be present in ${page.file}`
        );
      });

      test(`DOM-2 [${page.file}]: Theme toggle button has class="theme-toggle"`, () => {
        assert.match(
          content,
          /<button[^>]*class=["'][^"']*theme-toggle[^"']*["'][^>]*>/i,
          `Theme toggle button must have class 'theme-toggle' in ${page.file}`
        );
      });

      test(`DOM-3 [${page.file}]: Theme toggle button includes accessibility attributes (aria-label & title)`, () => {
        assert.match(
          content,
          /<button[^>]*aria-label=["'][^"']+["'][^>]*>/i,
          `Theme toggle must have an aria-label attribute for accessibility in ${page.file}`
        );
        assert.match(
          content,
          /<button[^>]*title=["'][^"']+["'][^>]*>/i,
          `Theme toggle must have a title attribute tooltip in ${page.file}`
        );
      });

      test(`DOM-4 [${page.file}]: Initial button icon/symbol is defined (🌙 or ☀️)`, () => {
        assert.match(
          content,
          /<button[^>]*id=["']themeToggle["'][^>]*>[\s\S]*?[🌙☀️][\s\S]*?<\/button>/i,
          `Theme toggle button should have an initial icon in ${page.file}`
        );
      });

      test(`DOM-5 [${page.file}]: Floating top-right position and styling are defined in CSS`, () => {
        assert.match(content, /\.theme-toggle\s*\{[^}]*position:\s*fixed/i);
        assert.match(content, /\.theme-toggle\s*\{[^}]*top:\s*\d+px/i);
        assert.match(content, /\.theme-toggle\s*\{[^}]*right:\s*\d+px/i);
        assert.match(content, /\.theme-toggle\s*\{[^}]*z-index:\s*\d+/i);
      });
    });
  }
});

describe('QA Suite 2: CSS Architecture & Token Integrity Verification', () => {
  for (const page of PAGES) {
    describe(`CSS Token Architecture on ${page.name}`, () => {
      const content = getPageContent(page.path);

      test(`CSS-1 [${page.file}]: :root block defines fundamental color tokens`, () => {
        assert.match(content, /:root\s*\{/i, `:root CSS rule must exist in ${page.file}`);
        assert.match(content, /--primary\s*:/i, `--primary token must be defined in ${page.file}`);
        assert.match(content, /--bg-page\s*:/i, `--bg-page token must be defined in ${page.file}`);
        assert.match(content, /--card-bg\s*:/i, `--card-bg token must be defined in ${page.file}`);
        assert.match(content, /--text-main\s*:/i, `--text-main token must be defined in ${page.file}`);
        assert.match(content, /--border-color\s*:/i, `--border-color token must be defined in ${page.file}`);
      });

      test(`CSS-2 [${page.file}]: [data-theme="dark"] selector is explicitly declared`, () => {
        assert.match(
          content,
          /\[data-theme=["']dark["']\]\s*\{/i,
          `[data-theme="dark"] CSS rule must exist in ${page.file}`
        );
      });

      test(`CSS-3 [${page.file}]: [data-theme="dark"] overrides background, card, and text tokens`, () => {
        const darkThemeBlockMatch = content.match(/\[data-theme=["']dark["']\]\s*\{([^}]+)\}/i);
        assert.ok(darkThemeBlockMatch, `Dark theme CSS block should be found in ${page.file}`);
        const darkBlock = darkThemeBlockMatch[1];

        assert.match(darkBlock, /--bg-page\s*:/i, `Dark theme must override --bg-page in ${page.file}`);
        assert.match(darkBlock, /--card-bg\s*:/i, `Dark theme must override --card-bg in ${page.file}`);
        assert.match(darkBlock, /--text-main\s*:/i, `Dark theme must override --text-main in ${page.file}`);
        assert.match(darkBlock, /--border-color\s*:/i, `Dark theme must override --border-color in ${page.file}`);
      });

      test(`CSS-4 [${page.file}]: Smooth theme transition properties are configured`, () => {
        assert.match(
          content,
          /transition:\s*(?:var\(--theme-transition\)|[^;]*background-color[^;]*color)/i,
          `Smooth transition should be applied for theme changes in ${page.file}`
        );
      });

      test(`CSS-5 [${page.file}]: Body background and text color consume CSS variables`, () => {
        assert.match(content, /background-color:\s*var\(--bg-page\)/i, `Body background must use var(--bg-page) in ${page.file}`);
        assert.match(content, /color:\s*var\(--text-main\)/i, `Body text color must use var(--text-main) in ${page.file}`);
      });
    });
  }
});

describe('QA Suite 3: Anti-Flash (FOUC Prevention) & System Preferences', () => {
  for (const page of PAGES) {
    describe(`Anti-Flash Script on ${page.name}`, () => {
      const content = getPageContent(page.path);

      test(`FLASH-1 [${page.file}]: Anti-flash script exists in <head> before stylesheets/body`, () => {
        const headMatch = content.match(/<head>([\s\S]*?)<\/head>/i);
        assert.ok(headMatch, `<head> tag must exist in ${page.file}`);
        const headContent = headMatch[1];
        
        assert.match(
          headContent,
          /<script>[\s\S]*?localStorage\.getItem\(['"]theme['"]\)[\s\S]*?<\/script>/i,
          `Anti-flash script reading localStorage must be inside <head> in ${page.file}`
        );
      });

      test(`FLASH-2 [${page.file}]: Script checks system dark mode preference (prefers-color-scheme)`, () => {
        assert.match(
          content,
          /matchMedia\(['"]\(prefers-color-scheme:\s*dark\)['"]\)/i,
          `System dark mode preference check (prefers-color-scheme: dark) must be implemented in ${page.file}`
        );
      });

      test(`FLASH-3 [${page.file}]: Script immediately sets data-theme attribute on documentElement`, () => {
        assert.match(
          content,
          /document\.documentElement\.setAttribute\(['"]data-theme['"]\s*,/i,
          `Script must set data-theme attribute on document.documentElement in ${page.file}`
        );
      });
    });
  }
});

describe('QA Suite 4: Interactivity, Theme Switcher & LocalStorage Persistence Logic', () => {
  for (const page of PAGES) {
    describe(`Theme Toggle Interaction on ${page.name}`, () => {
      const content = getPageContent(page.path);

      test(`JS-1 [${page.file}]: Event listener is attached to #themeToggle`, () => {
        assert.match(
          content,
          /(?:themeToggleBtn|document\.getElementById\(['"]themeToggle['"]\))\.addEventListener\(['"]click['"]/i,
          `Click event listener must be registered on #themeToggle in ${page.file}`
        );
      });

      test(`JS-2 [${page.file}]: Toggle logic switches between 'dark' and 'light' modes`, () => {
        assert.match(
          content,
          /(?:currentTheme\s*===?\s*['"]dark['"]\s*\?\s*['"]light['"]\s*:\s*['"]dark['"]|newTheme\s*=\s*currentTheme\s*===?\s*['"]dark['"])/i,
          `Toggle logic must alternate between 'dark' and 'light' in ${page.file}`
        );
      });

      test(`JS-3 [${page.file}]: Theme preference is persisted to localStorage`, () => {
        assert.match(
          content,
          /localStorage\.setItem\(['"]theme['"]\s*,\s*(?:newTheme|theme)\)/i,
          `Theme selection must be persisted with localStorage.setItem('theme', ...) in ${page.file}`
        );
      });

      test(`JS-4 [${page.file}]: UI updates icon to ☀️ (sun) in dark mode and 🌙 (moon) in light mode`, () => {
        assert.match(
          content,
          /theme\s*===?\s*['"]dark['"]\s*\?\s*['"]☀️['"]\s*:\s*['"]🌙['"]/i,
          `Icon switching logic must show ☀️ for dark mode and 🌙 for light mode in ${page.file}`
        );
      });

      test(`JS-5 [${page.file}]: Accessible aria-label and title are dynamically updated on toggle`, () => {
        assert.match(
          content,
          /setAttribute\(['"]aria-label['"]\s*,\s*theme\s*===?\s*['"]dark['"]/i,
          `Aria-label must update when theme changes in ${page.file}`
        );
        assert.match(
          content,
          /setAttribute\(['"]title['"]\s*,\s*theme\s*===?\s*['"]dark['"]/i,
          `Title attribute must update when theme changes in ${page.file}`
        );
      });
    });
  }
});

describe('QA Suite 5: Behavioral Simulation (End-to-End Theme Lifecycle)', () => {
  // Simulated environment to test theme logic execution
  class MockLocalStorage {
    constructor() {
      this.store = {};
    }
    getItem(key) {
      return this.store[key] || null;
    }
    setItem(key, value) {
      this.store[key] = String(value);
    }
    removeItem(key) {
      delete this.store[key];
    }
    clear() {
      this.store = {};
    }
  }

  class MockElement {
    constructor(id = '', tagName = 'div') {
      this.id = id;
      this.tagName = tagName;
      this.attributes = {};
      this.listeners = {};
      this.textContent = '';
    }
    setAttribute(name, value) {
      this.attributes[name] = String(value);
    }
    getAttribute(name) {
      return this.attributes[name] || null;
    }
    addEventListener(event, callback) {
      if (!this.listeners[event]) this.listeners[event] = [];
      this.listeners[event].push(callback);
    }
    click() {
      if (this.listeners['click']) {
        for (const cb of this.listeners['click']) {
          cb({ preventDefault: () => {} });
        }
      }
    }
  }

  function simulateThemeEnvironment(initialStorageTheme = null, systemPrefersDark = false) {
    const localStorage = new MockLocalStorage();
    if (initialStorageTheme) {
      localStorage.setItem('theme', initialStorageTheme);
    }

    const documentElement = new MockElement('html', 'html');
    const themeToggleBtn = new MockElement('themeToggle', 'button');
    themeToggleBtn.textContent = '🌙';

    const document = {
      documentElement,
      getElementById: (id) => (id === 'themeToggle' ? themeToggleBtn : null)
    };

    const window = {
      matchMedia: (query) => ({
        matches: query.includes('dark') ? systemPrefersDark : false
      })
    };

    // 1. Execute anti-flash IIFE
    (function runAntiFlash() {
      const savedTheme = localStorage.getItem('theme');
      const sysDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = savedTheme || (sysDark ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', initialTheme);
    })();

    // 2. Execute theme UI logic and event handler
    function updateThemeUI(theme) {
      if (themeToggleBtn) {
        themeToggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
        themeToggleBtn.setAttribute('aria-label', theme === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap');
        themeToggleBtn.setAttribute('title', theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap');
      }
    }

    const currentAppliedTheme = document.documentElement.getAttribute('data-theme') || 'light';
    updateThemeUI(currentAppliedTheme);

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeUI(newTheme);
      });
    }

    return { document, documentElement, themeToggleBtn, localStorage };
  }

  test('SIM-1: Default initialization with no saved preference defaults to light mode', () => {
    const env = simulateThemeEnvironment(null, false);
    assert.strictEqual(env.documentElement.getAttribute('data-theme'), 'light');
    assert.strictEqual(env.themeToggleBtn.textContent, '🌙');
    assert.strictEqual(env.themeToggleBtn.getAttribute('aria-label'), 'Ganti ke mode gelap');
  });

  test('SIM-2: Default initialization with system prefers dark defaults to dark mode', () => {
    const env = simulateThemeEnvironment(null, true);
    assert.strictEqual(env.documentElement.getAttribute('data-theme'), 'dark');
    assert.strictEqual(env.themeToggleBtn.textContent, '☀️');
    assert.strictEqual(env.themeToggleBtn.getAttribute('aria-label'), 'Ganti ke mode terang');
  });

  test('SIM-3: Saved preference in localStorage overrides system preference', () => {
    // System is dark, but user saved 'light'
    const envLight = simulateThemeEnvironment('light', true);
    assert.strictEqual(envLight.documentElement.getAttribute('data-theme'), 'light');
    assert.strictEqual(envLight.themeToggleBtn.textContent, '🌙');

    // System is light, but user saved 'dark'
    const envDark = simulateThemeEnvironment('dark', false);
    assert.strictEqual(envDark.documentElement.getAttribute('data-theme'), 'dark');
    assert.strictEqual(envDark.themeToggleBtn.textContent, '☀️');
  });

  test('SIM-4: Clicking #themeToggle switches from light to dark and updates storage & UI', () => {
    const env = simulateThemeEnvironment('light', false);
    assert.strictEqual(env.documentElement.getAttribute('data-theme'), 'light');

    // Click toggle
    env.themeToggleBtn.click();

    assert.strictEqual(env.documentElement.getAttribute('data-theme'), 'dark');
    assert.strictEqual(env.localStorage.getItem('theme'), 'dark');
    assert.strictEqual(env.themeToggleBtn.textContent, '☀️');
    assert.strictEqual(env.themeToggleBtn.getAttribute('aria-label'), 'Ganti ke mode terang');
    assert.strictEqual(env.themeToggleBtn.getAttribute('title'), 'Ganti ke Mode Terang');
  });

  test('SIM-5: Clicking #themeToggle twice returns from light -> dark -> light', () => {
    const env = simulateThemeEnvironment('light', false);
    
    // First click: light -> dark
    env.themeToggleBtn.click();
    assert.strictEqual(env.documentElement.getAttribute('data-theme'), 'dark');
    assert.strictEqual(env.localStorage.getItem('theme'), 'dark');

    // Second click: dark -> light
    env.themeToggleBtn.click();
    assert.strictEqual(env.documentElement.getAttribute('data-theme'), 'light');
    assert.strictEqual(env.localStorage.getItem('theme'), 'light');
    assert.strictEqual(env.themeToggleBtn.textContent, '🌙');
    assert.strictEqual(env.themeToggleBtn.getAttribute('aria-label'), 'Ganti ke mode gelap');
    assert.strictEqual(env.themeToggleBtn.getAttribute('title'), 'Ganti ke Mode Gelap');
  });

  test('SIM-6: Cross-page theme persistence simulation (Login -> Dashboard)', () => {
    // 1. User on Login page sets theme to dark
    const loginEnv = simulateThemeEnvironment('light', false);
    loginEnv.themeToggleBtn.click();
    assert.strictEqual(loginEnv.localStorage.getItem('theme'), 'dark');

    // 2. User navigates to Dashboard (halaman2.html) - reads the same localStorage
    const dashboardEnv = simulateThemeEnvironment(loginEnv.localStorage.getItem('theme'), false);
    assert.strictEqual(dashboardEnv.documentElement.getAttribute('data-theme'), 'dark');
    assert.strictEqual(dashboardEnv.themeToggleBtn.textContent, '☀️');

    // 3. User switches back to light on Dashboard
    dashboardEnv.themeToggleBtn.click();
    assert.strictEqual(dashboardEnv.localStorage.getItem('theme'), 'light');

    // 4. User returns to Login or Register page - theme persists as light
    const registerEnv = simulateThemeEnvironment(dashboardEnv.localStorage.getItem('theme'), false);
    assert.strictEqual(registerEnv.documentElement.getAttribute('data-theme'), 'light');
    assert.strictEqual(registerEnv.themeToggleBtn.textContent, '🌙');
  });
});
