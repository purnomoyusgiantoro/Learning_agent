const { test, describe } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// Target HTML page
const DASHBOARD_PATH = path.resolve(__dirname, '../frontend/halaman2.html');
const DASHBOARD_CONTENT = fs.readFileSync(DASHBOARD_PATH, 'utf8');

describe('QA Suite 1: DOM Elements & Welcome Dashboard Content Verification', () => {
  test('DOM-1: Page title reflects welcome/dashboard context', () => {
    assert.match(
      DASHBOARD_CONTENT,
      /<title>.*Selamat\s+Datang\s+Kembali.*<\/title>/i,
      'Page <title> should contain "Selamat Datang Kembali"'
    );
  });

  test('DOM-2: Headline <h1> contains "Selamat Datang Kembali!"', () => {
    assert.match(
      DASHBOARD_CONTENT,
      /<h1[^>]*>[\s\S]*?Selamat\s+Datang\s+Kembali!?[\s\S]*?<\/h1>/i,
      'Main <h1> must contain greeting headline "Selamat Datang Kembali!"'
    );
  });

  test('DOM-3: Subtitle / greeting description is present', () => {
    assert.match(
      DASHBOARD_CONTENT,
      /<p[^>]*class=["'][^"']*subtitle[^"']*["'][^>]*>[\s\S]*?<\/p>/i,
      'Subtitle paragraph explaining the greeting should be present'
    );
  });

  test('DOM-4: Active session badge (.badge-status) with animated pulse dot exists', () => {
    assert.match(
      DASHBOARD_CONTENT,
      /<div[^>]*class=["'][^"']*badge-status[^"']*["'][^>]*>[\s\S]*?Sesi\s+Aktif[\s\S]*?<\/div>/i,
      'Active session badge with "Sesi Aktif" text must be present'
    );
    assert.match(
      DASHBOARD_CONTENT,
      /<span[^>]*class=["'][^"']*status-dot[^"']*["'][^>]*>/i,
      'Status indicator dot must exist within badge'
    );
  });

  test('DOM-5: User avatar container (#userAvatar) exists with proper class and aria attributes', () => {
    assert.match(
      DASHBOARD_CONTENT,
      /<div\b(?=[^>]*\bid=["']userAvatar["'])(?=[^>]*\bclass=["'][^"']*avatar[^"']*)(?=[^>]*\baria-hidden=["']true["'])[^>]*>/i,
      '#userAvatar element must exist with class "avatar" and aria-hidden="true"'
    );
  });

  test('DOM-6: User profile name and email display elements exist', () => {
    assert.match(
      DASHBOARD_CONTENT,
      /<div\b(?=[^>]*\bid=["']userNameDisplay["'])(?=[^>]*\bclass=["'][^"']*user-name[^"']*)[^>]*>/i,
      '#userNameDisplay element must exist for displaying user full name'
    );
    assert.match(
      DASHBOARD_CONTENT,
      /<div\b(?=[^>]*\bid=["']userEmailDisplay["'])(?=[^>]*\bclass=["'][^"']*user-email[^"']*)[^>]*>/i,
      '#userEmailDisplay element must exist for displaying user email'
    );
    assert.match(
      DASHBOARD_CONTENT,
      /<span\b(?=[^>]*\bid=["']userDisplay["'])[^>]*>/i,
      '#userDisplay element must exist for backward compatibility'
    );
  });

  test('DOM-7: Profile summary card section exists with semantic aria-label', () => {
    assert.match(
      DASHBOARD_CONTENT,
      /<section\b(?=[^>]*\bclass=["'][^"']*profile-card[^"']*)(?=[^>]*\baria-label=["'][^"']*Ringkasan Profil[^"']*)[^>]*>/i,
      'Profile card section should have class "profile-card" and semantic aria-label'
    );
  });

  test('DOM-8: Account verification status and user role details are rendered', () => {
    assert.match(
      DASHBOARD_CONTENT,
      /Status\s+Akun[\s\S]*?Terverifikasi/i,
      'Account status item should show "Terverifikasi"'
    );
    assert.match(
      DASHBOARD_CONTENT,
      /Peran[\s\S]*?Member/i,
      'User role item should show "Member"'
    );
  });

  test('DOM-9: Unauthenticated warning notice (#unauthWarning) exists with role="alert"', () => {
    assert.match(
      DASHBOARD_CONTENT,
      /<div\b(?=[^>]*\bid=["']unauthWarning["'])(?=[^>]*\brole=["']alert["'])[^>]*>/i,
      '#unauthWarning banner should exist with role="alert"'
    );
  });

  test('DOM-10: Logout button (#logoutBtn) exists with class, type, and accessibility label', () => {
    assert.match(
      DASHBOARD_CONTENT,
      /<button\b(?=[^>]*\bid=["']logoutBtn["'])(?=[^>]*\bclass=["'][^"']*btn-logout[^"']*)(?=[^>]*\baria-label=["'][^"']*Keluar[^"']*)[^>]*>/i,
      'Logout button must have id="logoutBtn", class="btn-logout", and aria-label'
    );
    assert.match(
      DASHBOARD_CONTENT,
      /Keluar\s*\/\s*Logout/i,
      'Logout button should have clear text label "Keluar / Logout"'
    );
  });

  test('DOM-11: Theme toggle button (#themeToggle) exists with accessibility attributes', () => {
    assert.match(
      DASHBOARD_CONTENT,
      /<button\b(?=[^>]*\bid=["']themeToggle["'])(?=[^>]*\bclass=["'][^"']*theme-toggle[^"']*)[^>]*>/i,
      '#themeToggle button must exist with class "theme-toggle"'
    );
    assert.match(
      DASHBOARD_CONTENT,
      /<button\b(?=[^>]*\bid=["']themeToggle["'])(?=[^>]*\baria-label=["'][^"']+["'])(?=[^>]*\btitle=["'][^"']+["'])[^>]*>/i,
      '#themeToggle button must include aria-label and title attributes'
    );
  });
});

describe('QA Suite 2: CSS Token Architecture & Dark Mode Compatibility on Dashboard', () => {
  test('CSS-1: :root defines complete design tokens for dashboard styling', () => {
    assert.match(DASHBOARD_CONTENT, /:root\s*\{/i);
    assert.match(DASHBOARD_CONTENT, /--primary\s*:/i);
    assert.match(DASHBOARD_CONTENT, /--bg-page\s*:/i);
    assert.match(DASHBOARD_CONTENT, /--card-bg\s*:/i);
    assert.match(DASHBOARD_CONTENT, /--profile-bg\s*:/i);
    assert.match(DASHBOARD_CONTENT, /--text-main\s*:/i);
    assert.match(DASHBOARD_CONTENT, /--text-muted\s*:/i);
    assert.match(DASHBOARD_CONTENT, /--border-color\s*:/i);
    assert.match(DASHBOARD_CONTENT, /--badge-bg\s*:/i);
    assert.match(DASHBOARD_CONTENT, /--badge-text\s*:/i);
    assert.match(DASHBOARD_CONTENT, /--status-dot\s*:/i);
    assert.match(DASHBOARD_CONTENT, /--btn-logout-bg\s*:/i);
    assert.match(DASHBOARD_CONTENT, /--btn-logout-text\s*:/i);
    assert.match(DASHBOARD_CONTENT, /--theme-transition\s*:/i);
  });

  test('CSS-2: [data-theme="dark"] overrides all relevant theme tokens', () => {
    const darkThemeMatch = DASHBOARD_CONTENT.match(/\[data-theme=["']dark["']\]\s*\{([^}]+)\}/i);
    assert.ok(darkThemeMatch, '[data-theme="dark"] CSS block must exist');
    const darkBlock = darkThemeMatch[1];

    assert.match(darkBlock, /--primary\s*:/i);
    assert.match(darkBlock, /--bg-page\s*:/i);
    assert.match(darkBlock, /--card-bg\s*:/i);
    assert.match(darkBlock, /--profile-bg\s*:/i);
    assert.match(darkBlock, /--text-main\s*:/i);
    assert.match(darkBlock, /--text-muted\s*:/i);
    assert.match(darkBlock, /--border-color\s*:/i);
    assert.match(darkBlock, /--badge-bg\s*:/i);
    assert.match(darkBlock, /--badge-text\s*:/i);
    assert.match(darkBlock, /--status-dot\s*:/i);
    assert.match(darkBlock, /--btn-logout-bg\s*:/i);
  });

  test('CSS-3: Smooth theme transition is applied to body and elements', () => {
    assert.match(
      DASHBOARD_CONTENT,
      /transition:\s*var\(--theme-transition\)/i,
      'Theme transition token must be used for smooth mode switches'
    );
  });

  test('CSS-4: Avatar styling defines circular shape, gradient, and centered initials', () => {
    assert.match(DASHBOARD_CONTENT, /\.avatar\s*\{[^}]*border-radius:\s*50%/i);
    assert.match(DASHBOARD_CONTENT, /\.avatar\s*\{[^}]*display:\s*flex/i);
    assert.match(DASHBOARD_CONTENT, /\.avatar\s*\{[^}]*align-items:\s*center/i);
    assert.match(DASHBOARD_CONTENT, /\.avatar\s*\{[^}]*justify-content:\s*center/i);
    assert.match(DASHBOARD_CONTENT, /\.avatar\s*\{[^}]*background:\s*linear-gradient/i);
  });

  test('CSS-5: Status dot pulse animation is configured', () => {
    assert.match(DASHBOARD_CONTENT, /@keyframes\s+pulse-dot/i);
    assert.match(DASHBOARD_CONTENT, /\.status-dot\s*\{[^}]*animation:\s*pulse-dot/i);
  });

  test('CSS-6: Responsive layout rules exist for mobile devices (@media max-width: 480px)', () => {
    assert.match(DASHBOARD_CONTENT, /@media\s*\(\s*max-width:\s*480px\s*\)/i);
  });
});

describe('QA Suite 3: Anti-Flash (FOUC Prevention) & Theme Toggle Functionality', () => {
  test('FLASH-1: Anti-flash script is placed inside <head> before stylesheets/body', () => {
    const headMatch = DASHBOARD_CONTENT.match(/<head>([\s\S]*?)<\/head>/i);
    assert.ok(headMatch, '<head> tag must exist');
    const headContent = headMatch[1];

    assert.match(
      headContent,
      /<script>[\s\S]*?localStorage\.getItem\(['"]theme['"]\)[\s\S]*?<\/script>/i,
      'Anti-flash script reading localStorage must be inside <head>'
    );
  });

  test('FLASH-2: Script detects system dark mode preference (prefers-color-scheme)', () => {
    assert.match(
      DASHBOARD_CONTENT,
      /matchMedia\(['"]\(prefers-color-scheme:\s*dark\)['"]\)/i,
      'System dark mode query must be present in anti-flash script'
    );
  });

  test('FLASH-3: Script immediately sets data-theme attribute on documentElement', () => {
    assert.match(
      DASHBOARD_CONTENT,
      /document\.documentElement\.setAttribute\(['"]data-theme['"]\s*,/i,
      'Script must set data-theme attribute on document.documentElement'
    );
  });

  test('JS-THEME-1: Theme toggle click handler alternates between dark and light', () => {
    assert.match(
      DASHBOARD_CONTENT,
      /(?:currentTheme\s*===?\s*['"]dark['"]\s*\?\s*['"]light['"]\s*:\s*['"]dark['"]|newTheme\s*=\s*currentTheme\s*===?\s*['"]dark['"])/i,
      'Toggle logic must alternate between dark and light modes'
    );
  });

  test('JS-THEME-2: Theme preference is persisted to localStorage on toggle', () => {
    assert.match(
      DASHBOARD_CONTENT,
      /localStorage\.setItem\(['"]theme['"]\s*,\s*(?:newTheme|theme)\)/i,
      'Theme changes must be saved to localStorage'
    );
  });

  test('JS-THEME-3: Toggle updates button icon (☀️ in dark, 🌙 in light) and accessibility labels', () => {
    assert.match(
      DASHBOARD_CONTENT,
      /theme\s*===?\s*['"]dark['"]\s*\?\s*['"]☀️['"]\s*:\s*['"]🌙['"]/i,
      'Button icon must switch between ☀️ and 🌙'
    );
    assert.match(
      DASHBOARD_CONTENT,
      /setAttribute\(['"]aria-label['"]\s*,\s*theme\s*===?\s*['"]dark['"]/i,
      'aria-label must update on theme change'
    );
  });
});

describe('QA Suite 4: Client-Side Session Data Parsing & Avatar Initial Logic', () => {
  // Extract getInitials function safely using regex slice to its end
  function extractGetInitials() {
    const fnStart = DASHBOARD_CONTENT.indexOf('function getInitials(');
    assert.ok(fnStart !== -1, 'getInitials function must be declared in script');
    const scriptEnd = DASHBOARD_CONTENT.indexOf('</script>', fnStart);
    const scriptSlice = DASHBOARD_CONTENT.slice(fnStart, scriptEnd);
    
    // Find matching braces
    let depth = 0;
    let endIdx = -1;
    for (let i = 0; i < scriptSlice.length; i++) {
      if (scriptSlice[i] === '{') depth++;
      if (scriptSlice[i] === '}') {
        depth--;
        if (depth === 0) {
          endIdx = i + 1;
          break;
        }
      }
    }
    assert.ok(endIdx > 0, 'Should find complete getInitials function body');
    const fnString = scriptSlice.slice(0, endIdx);
    return Function(`return ${fnString}`)();
  }

  const getInitials = extractGetInitials();

  test('INITIALS-1: Multi-word full name generates 2 initials uppercase ("John Doe" -> "JD")', () => {
    assert.strictEqual(getInitials('John Doe', 'john@example.com'), 'JD');
    assert.strictEqual(getInitials('Purnomo Yusgiantoro', 'purnomo@example.com'), 'PY');
    assert.strictEqual(getInitials('Agus Pratama Wijaya', 'agus@example.com'), 'AP');
  });

  test('INITIALS-2: Single-word name generates first 2 characters uppercase ("Purnomo" -> "PU")', () => {
    assert.strictEqual(getInitials('Purnomo', 'purnomo@example.com'), 'PU');
    assert.strictEqual(getInitials('Alice', 'alice@example.com'), 'AL');
  });

  test('INITIALS-3: Empty name falls back to username part of email ("user@example.com" -> "US")', () => {
    assert.strictEqual(getInitials('', 'user@example.com'), 'US');
    assert.strictEqual(getInitials(null, 'admin@example.com'), 'AD');
    assert.strictEqual(getInitials(undefined, 'agus.pratama@example.com'), 'AG');
  });

  test('INITIALS-4: Single letter username fallback generates single uppercase letter ("a@example.com" -> "A")', () => {
    assert.strictEqual(getInitials('', 'a@example.com'), 'A');
  });

  test('INITIALS-5: Empty name and email falls back to default "U"', () => {
    assert.strictEqual(getInitials('', ''), 'U');
    assert.strictEqual(getInitials(null, null), 'U');
    assert.strictEqual(getInitials(undefined, undefined), 'U');
  });

  test('SESSION-PARSE-1: Script retrieves userEmail, userName, and authToken from sessionStorage', () => {
    assert.match(DASHBOARD_CONTENT, /sessionStorage\.getItem\(["']userEmail["']\)/);
    assert.match(DASHBOARD_CONTENT, /sessionStorage\.getItem\(["']userName["']\)/);
    assert.match(DASHBOARD_CONTENT, /sessionStorage\.getItem\(["']authToken["']\)/);
  });

  test('SESSION-PARSE-2: Unauthenticated warning display toggles based on session status', () => {
    assert.match(
      DASHBOARD_CONTENT,
      /if\s*\(\s*!userEmail\s*&&\s*!authToken\s*\)\s*\{[\s\S]*?unauthWarning\.style\.display\s*=\s*["']flex["']/i,
      'Warning banner should display when no session exists'
    );
    assert.match(
      DASHBOARD_CONTENT,
      /unauthWarning\.style\.display\s*=\s*["']none["']/i,
      'Warning banner should be hidden when session exists'
    );
  });
});

describe('QA Suite 5: Logout Flow & Session Cleanup (Behavioral Simulation)', () => {
  class MockSessionStorage {
    constructor(initial = {}) {
      this.store = { ...initial };
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
    constructor(id = '') {
      this.id = id;
      this.style = {};
      this.textContent = '';
      this.listeners = {};
    }
    addEventListener(event, fn) {
      if (!this.listeners[event]) this.listeners[event] = [];
      this.listeners[event].push(fn);
    }
    click() {
      if (this.listeners['click']) {
        for (const cb of this.listeners['click']) {
          cb({ preventDefault: () => {} });
        }
      }
    }
  }

  function simulateDashboardSession(sessionData = {}) {
    const sessionStorage = new MockSessionStorage(sessionData);
    let redirectedTo = null;

    const unauthWarning = new MockElement('unauthWarning');
    const avatarEl = new MockElement('userAvatar');
    const userNameEl = new MockElement('userNameDisplay');
    const userEmailEl = new MockElement('userEmailDisplay');
    const userDisplayEl = new MockElement('userDisplay');
    const logoutBtn = new MockElement('logoutBtn');

    const elements = {
      unauthWarning,
      userAvatar: avatarEl,
      userNameDisplay: userNameEl,
      userEmailDisplay: userEmailEl,
      userDisplay: userDisplayEl,
      logoutBtn
    };

    const document = {
      getElementById: (id) => elements[id] || null
    };

    const window = {
      location: {
        set href(val) {
          redirectedTo = val;
        },
        get href() {
          return redirectedTo;
        }
      }
    };

    // getInitials helper
    function getInitials(name, email) {
      if (name && typeof name === "string" && name.trim()) {
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
          return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return parts[0].slice(0, 2).toUpperCase();
      }
      if (email && typeof email === "string" && email.trim()) {
        const usernamePart = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
        if (usernamePart.length >= 2) {
          return usernamePart.slice(0, 2).toUpperCase();
        } else if (usernamePart.length === 1) {
          return usernamePart.toUpperCase();
        }
      }
      return "U";
    }

    // Execute session parsing logic
    const userEmail = sessionStorage.getItem("userEmail");
    const userName = sessionStorage.getItem("userName");
    const authToken = sessionStorage.getItem("authToken");

    if (!userEmail && !authToken) {
      unauthWarning.style.display = "flex";
    } else {
      unauthWarning.style.display = "none";
    }

    let displayUserName = "Pengguna";
    let displayUserEmail = "Pengguna Tamu";

    if (userName && userName.trim()) {
      displayUserName = userName.trim();
    } else if (userEmail && userEmail.trim()) {
      const namePrefix = userEmail.split("@")[0];
      displayUserName = namePrefix.charAt(0).toUpperCase() + namePrefix.slice(1);
    }

    if (userEmail && userEmail.trim()) {
      displayUserEmail = userEmail.trim();
    }

    avatarEl.textContent = getInitials(userName, userEmail);
    userNameEl.textContent = displayUserName;
    userEmailEl.textContent = displayUserEmail;
    userDisplayEl.textContent = userName ? `${userName} (${userEmail})` : (userEmail || "Pengguna");

    // Attach logout event handler
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("userEmail");
      sessionStorage.removeItem("userName");
      sessionStorage.removeItem("userData");
      window.location.href = "index.html";
    });

    return {
      sessionStorage,
      elements,
      getRedirectedUrl: () => redirectedTo
    };
  }

  test('LOGOUT-1: Full user session displays correctly on dashboard load', () => {
    const env = simulateDashboardSession({
      authToken: 'mock-jwt-token-xyz-123',
      userEmail: 'purnomo@example.com',
      userName: 'Purnomo Yusgiantoro'
    });

    assert.strictEqual(env.elements.unauthWarning.style.display, 'none');
    assert.strictEqual(env.elements.userAvatar.textContent, 'PY');
    assert.strictEqual(env.elements.userNameDisplay.textContent, 'Purnomo Yusgiantoro');
    assert.strictEqual(env.elements.userEmailDisplay.textContent, 'purnomo@example.com');
    assert.strictEqual(env.elements.userDisplay.textContent, 'Purnomo Yusgiantoro (purnomo@example.com)');
  });

  test('LOGOUT-2: Session without name formats email prefix as capitalized name', () => {
    const env = simulateDashboardSession({
      authToken: 'mock-token-abc',
      userEmail: 'agus.pratama@example.com'
    });

    assert.strictEqual(env.elements.unauthWarning.style.display, 'none');
    assert.strictEqual(env.elements.userAvatar.textContent, 'AG');
    assert.strictEqual(env.elements.userNameDisplay.textContent, 'Agus.pratama');
    assert.strictEqual(env.elements.userEmailDisplay.textContent, 'agus.pratama@example.com');
  });

  test('LOGOUT-3: Unauthenticated visit shows warning banner and fallback info', () => {
    const env = simulateDashboardSession({});

    assert.strictEqual(env.elements.unauthWarning.style.display, 'flex');
    assert.strictEqual(env.elements.userAvatar.textContent, 'U');
    assert.strictEqual(env.elements.userNameDisplay.textContent, 'Pengguna');
    assert.strictEqual(env.elements.userEmailDisplay.textContent, 'Pengguna Tamu');
  });

  test('LOGOUT-4: Clicking #logoutBtn removes authToken, userEmail, userName, and userData from sessionStorage', () => {
    const env = simulateDashboardSession({
      authToken: 'active-jwt-token',
      userEmail: 'user@example.com',
      userName: 'Regular User',
      userData: JSON.stringify({ role: 'member' })
    });

    assert.strictEqual(env.sessionStorage.getItem('authToken'), 'active-jwt-token');
    assert.strictEqual(env.sessionStorage.getItem('userEmail'), 'user@example.com');
    assert.strictEqual(env.sessionStorage.getItem('userName'), 'Regular User');
    assert.ok(env.sessionStorage.getItem('userData'));

    // Trigger logout
    env.elements.logoutBtn.click();

    // Verify all keys are purged
    assert.strictEqual(env.sessionStorage.getItem('authToken'), null, 'authToken should be removed');
    assert.strictEqual(env.sessionStorage.getItem('userEmail'), null, 'userEmail should be removed');
    assert.strictEqual(env.sessionStorage.getItem('userName'), null, 'userName should be removed');
    assert.strictEqual(env.sessionStorage.getItem('userData'), null, 'userData should be removed');
  });

  test('LOGOUT-5: Clicking #logoutBtn redirects user back to index.html', () => {
    const env = simulateDashboardSession({
      authToken: 'token-123',
      userEmail: 'user@example.com'
    });

    env.elements.logoutBtn.click();
    assert.strictEqual(env.getRedirectedUrl(), 'index.html', 'Should redirect to index.html on logout');
  });
});
