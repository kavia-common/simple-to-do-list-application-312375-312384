import { loadTasksFromStorage, saveTasksToStorage } from "./utils/storage";

describe("storage utils", () => {
  const realLocalStorage = window.localStorage;

  beforeEach(() => {
    // Ensure clean slate and isolate localStorage behavior per-test.
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
      },
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "localStorage", {
      value: realLocalStorage,
      configurable: true,
    });
  });

  test("loadTasksFromStorage returns [] when storage is empty", () => {
    window.localStorage.getItem.mockReturnValue(null);
    expect(loadTasksFromStorage()).toEqual([]);
  });

  test("loadTasksFromStorage returns [] when JSON is invalid", () => {
    window.localStorage.getItem.mockReturnValue("{not json");
    expect(loadTasksFromStorage()).toEqual([]);
  });

  test("loadTasksFromStorage returns [] when parsed value is not an array", () => {
    window.localStorage.getItem.mockReturnValue(JSON.stringify({ nope: true }));
    expect(loadTasksFromStorage()).toEqual([]);
  });

  test("loadTasksFromStorage filters out invalid task shapes", () => {
    const raw = JSON.stringify([
      { id: "ok", text: "Good", completed: false },
      { id: 123, text: "Bad", completed: false }, // invalid id
      { id: "bad2", text: null, completed: false }, // invalid text
      { id: "bad3", text: "No completed", completed: "nope" }, // invalid completed
    ]);

    window.localStorage.getItem.mockReturnValue(raw);
    expect(loadTasksFromStorage()).toEqual([{ id: "ok", text: "Good", completed: false }]);
  });

  test("loadTasksFromStorage returns [] if localStorage.getItem throws", () => {
    window.localStorage.getItem.mockImplementation(() => {
      throw new Error("SecurityError");
    });

    expect(loadTasksFromStorage()).toEqual([]);
  });

  test("saveTasksToStorage writes JSON to localStorage (stringify)", () => {
    const tasks = [{ id: "1", text: "Hello", completed: false }];
    saveTasksToStorage(tasks);

    expect(window.localStorage.setItem).toHaveBeenCalledTimes(1);
    const [, value] = window.localStorage.setItem.mock.calls[0];

    // should be valid JSON matching tasks
    expect(JSON.parse(value)).toEqual(tasks);
  });

  test("saveTasksToStorage swallows localStorage errors (quota/security)", () => {
    window.localStorage.setItem.mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    expect(() => saveTasksToStorage([{ id: "1", text: "x", completed: false }])).not.toThrow();
  });
});
