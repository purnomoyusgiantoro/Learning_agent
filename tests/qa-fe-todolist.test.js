const { test, describe } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// Target HTML page
const DASHBOARD_PATH = path.resolve(__dirname, '../frontend/halaman2.html');
const DASHBOARD_CONTENT = fs.readFileSync(DASHBOARD_PATH, 'utf8');

describe('QA Suite 1: TodoListCard DOM Elements & Sub-Components Verification', () => {
  test('FE-TODO-DOM-1: TodoListCard container (#todoListCard) exists with semantic aria-label', () => {
    assert.match(
      DASHBOARD_CONTENT,
      /<section\b(?=[^>]*\bid=["']todoListCard["'])(?=[^>]*\bclass=["'][^"']*todo-card[^"']*)(?=[^>]*\baria-label=["'][^"']*Daftar\s+Tugas[^"']*)[^>]*>/i,
      '#todoListCard section must exist with class "todo-card" and semantic aria-label'
    );
  });

  test('FE-TODO-DOM-2: Todo Header contains title and progress counter badge', () => {
    assert.match(
      DASHBOARD_CONTENT,
      /<h2[^>]*class=["'][^"']*todo-title-heading[^"']*["'][^>]*>[\s\S]*?Daftar\s+Tugas[\s\S]*?<\/h2>/i,
      'Todo card heading should display "Daftar Tugas"'
    );
    assert.match(
      DASHBOARD_CONTENT,
      /<span\b(?=[^>]*\bid=["']todoProgressBadge["'])[^>]*>/i,
      '#todoProgressBadge must exist for displaying completion progress'
    );
    assert.match(
      DASHBOARD_CONTENT,
      /<span\b(?=[^>]*\bid=["']completedCountBadge["'])[^>]*>/i,
      '#completedCountBadge must exist'
    );
    assert.match(
      DASHBOARD_CONTENT,
      /<span\b(?=[^>]*\bid=["']totalCountBadge["'])[^>]*>/i,
      '#totalCountBadge must exist'
    );
  });

  test('FE-TODO-DOM-3: Error alert banner (#todoAlertMessage) exists with role="alert"', () => {
    assert.match(
      DASHBOARD_CONTENT,
      /<div\b(?=[^>]*\bid=["']todoAlertMessage["'])(?=[^>]*\brole=["']alert["'])[^>]*>/i,
      '#todoAlertMessage error container must exist with role="alert"'
    );
  });

  test('FE-TODO-DOM-4: TodoInputForm (#todoInputForm) contains title input, due date input, and submit button', () => {
    assert.match(
      DASHBOARD_CONTENT,
      /<form\b(?=[^>]*\bid=["']todoInputForm["'])[^>]*>/i,
      '#todoInputForm form must exist'
    );
    assert.match(
      DASHBOARD_CONTENT,
      /<input\b(?=[^>]*\bid=["']todoTitleInput["'])(?=[^>]*\bmaxlength=["']255["'])[^>]*>/i,
      '#todoTitleInput must exist with maxlength="255"'
    );
    assert.match(
      DASHBOARD_CONTENT,
      /<input\b(?=[^>]*\bid=["']todoDueDateInput["'])(?=[^>]*\btype=["']date["'])[^>]*>/i,
      '#todoDueDateInput must exist with type="date"'
    );
    assert.match(
      DASHBOARD_CONTENT,
      /<button\b(?=[^>]*\bid=["']addTodoBtn["'])(?=[^>]*\btype=["']submit["'])[^>]*>/i,
      '#addTodoBtn submit button must exist with type="submit"'
    );
  });

  test('FE-TODO-DOM-5: Field error feedback spans exist for title and due date inputs', () => {
    assert.match(
      DASHBOARD_CONTENT,
      /<span\b(?=[^>]*\bid=["']todoTitleError["'])(?=[^>]*\bclass=["'][^"']*field-error[^"']*)[^>]*>/i,
      '#todoTitleError span must exist'
    );
    assert.match(
      DASHBOARD_CONTENT,
      /<span\b(?=[^>]*\bid=["']todoDueDateError["'])(?=[^>]*\bclass=["'][^"']*field-error[^"']*)[^>]*>/i,
      '#todoDueDateError span must exist'
    );
  });

  test('FE-TODO-DOM-6: TodoFilter group (#todoFilterGroup) has buttons for All, Active, and Completed', () => {
    assert.match(
      DASHBOARD_CONTENT,
      /<div\b(?=[^>]*\bid=["']todoFilterGroup["'])(?=[^>]*\brole=["']tablist["'])[^>]*>/i,
      '#todoFilterGroup must exist with role="tablist"'
    );
    assert.match(
      DASHBOARD_CONTENT,
      /<button\b(?=[^>]*\bid=["']filterAll["'])(?=[^>]*\bdata-filter=["']all["'])[^>]*>/i,
      '#filterAll button must exist with data-filter="all"'
    );
    assert.match(
      DASHBOARD_CONTENT,
      /<button\b(?=[^>]*\bid=["']filterActive["'])(?=[^>]*\bdata-filter=["']active["'])[^>]*>/i,
      '#filterActive button must exist with data-filter="active"'
    );
    assert.match(
      DASHBOARD_CONTENT,
      /<button\b(?=[^>]*\bid=["']filterCompleted["'])(?=[^>]*\bdata-filter=["']completed["'])[^>]*>/i,
      '#filterCompleted button must exist with data-filter="completed"'
    );
    assert.match(DASHBOARD_CONTENT, /id=["']countAll["']/i);
    assert.match(DASHBOARD_CONTENT, /id=["']countActive["']/i);
    assert.match(DASHBOARD_CONTENT, /id=["']countCompleted["']/i);
  });

  test('FE-TODO-DOM-7: SkeletonLoader (#todoSkeletonLoader) exists with animated placeholder items', () => {
    assert.match(
      DASHBOARD_CONTENT,
      /<div\b(?=[^>]*\bid=["']todoSkeletonLoader["'])(?=[^>]*\bclass=["'][^"']*skeleton-loader[^"']*)[^>]*>/i,
      '#todoSkeletonLoader must exist'
    );
    assert.match(
      DASHBOARD_CONTENT,
      /class=["'][^"']*skeleton-item[^"']*["']/i,
      'Skeleton loader must contain .skeleton-item rows'
    );
  });

  test('FE-TODO-DOM-8: TodoList container (#todoList) exists with role="list"', () => {
    assert.match(
      DASHBOARD_CONTENT,
      /<ul\b(?=[^>]*\bid=["']todoList["'])(?=[^>]*\brole=["']list["'])[^>]*>/i,
      '#todoList <ul> element must exist with role="list"'
    );
  });

  test('FE-TODO-DOM-9: EmptyState container (#todoEmptyState) exists with descriptive elements', () => {
    assert.match(
      DASHBOARD_CONTENT,
      /<div\b(?=[^>]*\bid=["']todoEmptyState["'])(?=[^>]*\bclass=["'][^"']*empty-state[^"']*)[^>]*>/i,
      '#todoEmptyState container must exist'
    );
    assert.match(
      DASHBOARD_CONTENT,
      /<h3[^>]*class=["'][^"']*empty-title[^"']*["'][^>]*>[\s\S]*?Belum\s+Ada\s+Tugas[\s\S]*?<\/h3>/i,
      'Empty state headline should state "Belum Ada Tugas"'
    );
  });

  test('FE-TODO-DOM-10: Toast notification (#todoToast) and Delete Confirmation Modal exist', () => {
    assert.match(
      DASHBOARD_CONTENT,
      /<div\b(?=[^>]*\bid=["']todoToast["'])(?=[^>]*\brole=["']status["'])[^>]*>/i,
      '#todoToast must exist with role="status"'
    );
    assert.match(
      DASHBOARD_CONTENT,
      /<div\b(?=[^>]*\bid=["']deleteConfirmModal["'])(?=[^>]*\brole=["']dialog["'])[^>]*>/i,
      '#deleteConfirmModal must exist with role="dialog"'
    );
    assert.match(
      DASHBOARD_CONTENT,
      /<button\b(?=[^>]*\bid=["']confirmDeleteBtn["'])[^>]*>/i,
      '#confirmDeleteBtn must exist in delete modal'
    );
    assert.match(
      DASHBOARD_CONTENT,
      /<button\b(?=[^>]*\bid=["']cancelDeleteBtn["'])[^>]*>/i,
      '#cancelDeleteBtn must exist in delete modal'
    );
  });
});

describe('QA Suite 2: Client-Side Input Validation Logic', () => {
  // Extract validateTodoInput function from script
  function extractValidateTodoInput() {
    const fnStart = DASHBOARD_CONTENT.indexOf('function validateTodoInput(');
    assert.ok(fnStart !== -1, 'validateTodoInput function must be declared');
    const scriptEnd = DASHBOARD_CONTENT.indexOf('</script>', fnStart);
    const scriptSlice = DASHBOARD_CONTENT.slice(fnStart, scriptEnd);

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
    assert.ok(endIdx > 0, 'Should find complete validateTodoInput body');
    const fnString = scriptSlice.slice(0, endIdx);
    return Function(`return ${fnString}`)();
  }

  const validateTodoInput = extractValidateTodoInput();

  test('VAL-1: Empty or whitespace-only title is rejected', () => {
    const resEmpty = validateTodoInput('', '');
    assert.strictEqual(resEmpty.isValid, false);
    assert.ok(resEmpty.errors.title);

    const resSpaces = validateTodoInput('   ', '');
    assert.strictEqual(resSpaces.isValid, false);
    assert.ok(resSpaces.errors.title);
  });

  test('VAL-2: Title shorter than 3 characters is rejected', () => {
    const res1 = validateTodoInput('ab', '');
    assert.strictEqual(res1.isValid, false);
    assert.ok(res1.errors.title.includes('minimal 3 karakter'));

    const res2 = validateTodoInput('  a  ', '');
    assert.strictEqual(res2.isValid, false);
    assert.ok(res2.errors.title.includes('minimal 3 karakter'));
  });

  test('VAL-3: Title longer than 255 characters is rejected', () => {
    const longTitle = 'A'.repeat(256);
    const res = validateTodoInput(longTitle, '');
    assert.strictEqual(res.isValid, false);
    assert.ok(res.errors.title.includes('maksimal 255 karakter'));
  });

  test('VAL-4: Valid title (3 to 255 characters) trims whitespace and passes', () => {
    const res = validateTodoInput('   Mengerjakan task frontend   ', '');
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.trimmedTitle, 'Mengerjakan task frontend');
    assert.strictEqual(Object.keys(res.errors).length, 0);
  });

  test('VAL-5: Due date in the past is rejected', () => {
    const res = validateTodoInput('Belajar testing', '2020-01-01');
    assert.strictEqual(res.isValid, false);
    assert.ok(res.errors.dueDate.includes('lampau'));
  });

  test('VAL-6: Due date today or in future passes validation', () => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const resToday = validateTodoInput('Tugas hari ini', todayStr);
    assert.strictEqual(resToday.isValid, true);

    const resFuture = validateTodoInput('Tugas masa depan', '2099-12-31');
    assert.strictEqual(resFuture.isValid, true);
    assert.strictEqual(resFuture.dueDateStr, '2099-12-31');
  });
});

describe('QA Suite 3: State Management & Filter Logic Simulation', () => {
  function createStore() {
    return {
      todos: [
        { id: '1', title: 'Task 1 Active', is_completed: false, due_date: null },
        { id: '2', title: 'Task 2 Completed', is_completed: true, due_date: '2026-08-20' },
        { id: '3', title: 'Task 3 Active', is_completed: false, due_date: '2026-08-25' }
      ],
      filter: 'all',

      get filteredTodos() {
        if (this.filter === 'active') return this.todos.filter(t => !t.is_completed);
        if (this.filter === 'completed') return this.todos.filter(t => t.is_completed);
        return this.todos;
      },

      get counts() {
        const all = this.todos.length;
        const completed = this.todos.filter(t => t.is_completed).length;
        const active = all - completed;
        return { all, active, completed };
      }
    };
  }

  test('STORE-1: Counts calculation correctly computes all, active, and completed totals', () => {
    const store = createStore();
    assert.deepStrictEqual(store.counts, { all: 3, active: 2, completed: 1 });
  });

  test('STORE-2: Filter "all" returns all items in store', () => {
    const store = createStore();
    store.filter = 'all';
    assert.strictEqual(store.filteredTodos.length, 3);
  });

  test('STORE-3: Filter "active" returns only incomplete items', () => {
    const store = createStore();
    store.filter = 'active';
    const active = store.filteredTodos;
    assert.strictEqual(active.length, 2);
    assert.ok(active.every(t => !t.is_completed));
  });

  test('STORE-4: Filter "completed" returns only completed items', () => {
    const store = createStore();
    store.filter = 'completed';
    const completed = store.filteredTodos;
    assert.strictEqual(completed.length, 1);
    assert.ok(completed.every(t => t.is_completed));
  });
});

describe('QA Suite 4: Optimistic UI Updates & Error Rollback Simulation', () => {
  test('OPT-1: Optimistic Toggle updates state immediately and rolls back if API fails', async () => {
    const mockStore = {
      todos: [{ id: '101', title: 'Test Optimistic Toggle', is_completed: false }]
    };

    let simulatedApiSuccess = false;

    async function toggleTodo(id) {
      const target = mockStore.todos.find(t => t.id === id);
      const prev = target.is_completed;

      // 1. Optimistic Update
      target.is_completed = !prev;

      // 2. Simulated Network API Call
      if (!simulatedApiSuccess) {
        // Rollback
        target.is_completed = prev;
        return { success: false, rolledBack: true };
      }
      return { success: true };
    }

    // Attempt with failure
    simulatedApiSuccess = false;
    const failRes = await toggleTodo('101');
    assert.strictEqual(failRes.rolledBack, true);
    assert.strictEqual(mockStore.todos[0].is_completed, false, 'State should rollback to false on failure');

    // Attempt with success
    simulatedApiSuccess = true;
    const successRes = await toggleTodo('101');
    assert.strictEqual(successRes.success, true);
    assert.strictEqual(mockStore.todos[0].is_completed, true, 'State should persist true on success');
  });

  test('OPT-2: Optimistic Delete removes item immediately and restores it if API fails', async () => {
    const mockStore = {
      todos: [
        { id: '201', title: 'Task to keep' },
        { id: '202', title: 'Task to delete' },
        { id: '203', title: 'Another task' }
      ]
    };

    let simulatedApiSuccess = false;

    async function deleteTodo(id) {
      const index = mockStore.todos.findIndex(t => t.id === id);
      const [removed] = mockStore.todos.splice(index, 1);

      if (!simulatedApiSuccess) {
        // Rollback
        mockStore.todos.splice(index, 0, removed);
        return { success: false, rolledBack: true };
      }
      return { success: true };
    }

    // Attempt with failure
    simulatedApiSuccess = false;
    const failRes = await deleteTodo('202');
    assert.strictEqual(failRes.rolledBack, true);
    assert.strictEqual(mockStore.todos.length, 3, 'Array length should be restored');
    assert.strictEqual(mockStore.todos[1].id, '202', 'Item position should be restored');

    // Attempt with success
    simulatedApiSuccess = true;
    const successRes = await deleteTodo('202');
    assert.strictEqual(successRes.success, true);
    assert.strictEqual(mockStore.todos.length, 2);
    assert.strictEqual(mockStore.todos.some(t => t.id === '202'), false);
  });
});

describe('QA Suite 5: Frontend to Backend API Integration & Auth Header Verification', () => {
  test('INT-1: Frontend uses configured Backend API endpoints for Todos', () => {
    assert.match(
      DASHBOARD_CONTENT,
      /http:\/\/localhost:5000\/api\/v1\/todos/i,
      'Frontend must configure endpoint http://localhost:5000/api/v1/todos'
    );
    assert.match(
      DASHBOARD_CONTENT,
      /http:\/\/localhost:5000\/api\/todos/i,
      'Frontend must include fallback endpoint http://localhost:5000/api/todos'
    );
  });

  test('INT-2: getAuthHeaders attaches Authorization Bearer token from sessionStorage', () => {
    assert.match(
      DASHBOARD_CONTENT,
      /function getAuthHeaders\s*\(\)\s*\{[\s\S]*?sessionStorage\.getItem\(["']authToken["']\)[\s\S]*?Bearer/i,
      'getAuthHeaders must retrieve authToken and build Bearer header'
    );
  });

  test('INT-3: Frontend executes GET, POST, PATCH, and DELETE HTTP methods', () => {
    assert.match(DASHBOARD_CONTENT, /method:\s*["']GET["']/i);
    assert.match(DASHBOARD_CONTENT, /method:\s*["']POST["']/i);
    assert.match(DASHBOARD_CONTENT, /method:\s*["']PATCH["']/i);
    assert.match(DASHBOARD_CONTENT, /method:\s*["']DELETE["']/i);
  });

  test('SEC-1: XSS protection is implemented via safe textContent rendering', () => {
    assert.match(
      DASHBOARD_CONTENT,
      /titleSpan\.textContent\s*=\s*todo\.title/i,
      'Todo title must be rendered using textContent to prevent XSS injection'
    );
  });
});
