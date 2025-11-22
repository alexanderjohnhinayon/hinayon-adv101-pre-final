// ...existing code...
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { useEffect, useState } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // new: inline description editing state
  const [editingDescId, setEditingDescId] = useState(null);
  const [editDescTextOnly, setEditDescTextOnly] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("todos");
      if (raw) setTodos(JSON.parse(raw));
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("todos", JSON.stringify(todos));
    } catch (e) {}
  }, [todos]);

  function addTodo(e) {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    setTodos((prev) => [
      { id: Date.now(), text: value, description: description.trim(), done: false },
      ...prev,
    ]);
    setText("");
    setDescription("");
  }

  function toggleTodo(id) {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function removeTodo(id) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  function clearCompleted() {
    setTodos((prev) => prev.filter((t) => !t.done));
  }

  function startEdit(todo) {
    setEditingId(todo.id);
    setEditText(todo.text);
    setEditDescription(todo.description || "");
    // cancel inline desc edit if any
    setEditingDescId(null);
    setEditDescTextOnly("");
  }

  function saveEdit(id) {
    const newText = editText.trim();
    if (!newText) return;
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, text: newText, description: editDescription.trim() } : t)));
    setEditingId(null);
    setEditText("");
    setEditDescription("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditText("");
    setEditDescription("");
  }

  // new: start inline description edit
  function startEditDescription(todo) {
    setEditingDescId(todo.id);
    setEditDescTextOnly(todo.description || "");
    setEditingId(null);
    setEditText("");
    setEditDescription("");
  }

  // new: save inline description edit
  function saveDescriptionEdit(id) {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, description: editDescTextOnly.trim() } : t)));
    setEditingDescId(null);
    setEditDescTextOnly("");
  }

  function cancelDescEdit() {
    setEditingDescId(null);
    setEditDescTextOnly("");
  }

  const remaining = todos.filter((t) => !t.done).length;

  return (
    <div
      className={`${geistSans.className} ${geistMono.className} flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black`}
    >
      <main className="w-full max-w-2xl p-6">
        <div className="mx-auto bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
          <header className="flex items-center gap-4 mb-4">
            <Image src="/next.svg" alt="logo" width={36} height={12} className="dark:invert" />
            <h1 className="text-xl font-semibold text-black dark:text-zinc-50">Todo List</h1>
            <span className="ml-auto text-sm text-zinc-500 dark:text-zinc-400">{remaining} remaining</span>
          </header>

          <form onSubmit={addTodo} className="flex flex-col gap-2 mb-4">
            <div className="flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="flex-1 px-3 py-2 border rounded bg-transparent text-black dark:text-zinc-50"
                placeholder="What needs to be done?"
                aria-label="New todo title"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded bg-foreground text-background hover:opacity-90"
              >
                Add
              </button>
            </div>

            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="px-3 py-2 border rounded bg-transparent text-black dark:text-zinc-50"
              placeholder="Optional description"
              aria-label="New todo description"
            />
          </form>

          <ul className="space-y-2">
            {todos.length === 0 ? (
              <li className="text-zinc-500">No todos yet — add your first task.</li>
            ) : (
              todos.map((todo) => (
                <li
                  key={todo.id}
                  className="flex items-start justify-between gap-4 rounded px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  {editingId === todo.id ? (
                    <div className="flex-1">
                      <input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full px-2 py-1 mb-2 border rounded bg-transparent text-black dark:text-zinc-50"
                        aria-label="Edit todo title"
                      />
                      <input
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full px-2 py-1 border rounded bg-transparent text-black dark:text-zinc-50"
                        placeholder="Edit description (optional)"
                        aria-label="Edit todo description"
                      />
                    </div>
                  ) : (
                    <label className="flex-1 flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={todo.done}
                        onChange={() => toggleTodo(todo.id)}
                        className="w-4 h-4 mt-1"
                        aria-label={`Mark ${todo.text} as ${todo.done ? "incomplete" : "complete"}`}
                      />
                      <div>
                        <div className={todo.done ? "line-through text-zinc-400" : "text-black dark:text-zinc-50"}>
                          {todo.text}
                        </div>

                        {/* description display / inline edit */}
                        {todo.description ? (
                          editingDescId === todo.id ? (
                            <input
                              autoFocus
                              value={editDescTextOnly}
                              onChange={(e) => setEditDescTextOnly(e.target.value)}
                              onBlur={() => saveDescriptionEdit(todo.id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  saveDescriptionEdit(todo.id);
                                } else if (e.key === "Escape") {
                                  cancelDescEdit();
                                }
                              }}
                              className="mt-1 text-sm px-2 py-1 border rounded bg-transparent text-zinc-700 dark:text-zinc-300"
                              aria-label="Edit description inline"
                            />
                          ) : (
                            <div
                              className="text-sm text-zinc-500 dark:text-zinc-400 cursor-pointer"
                              onClick={() => startEditDescription(todo)}
                              title="Click to edit description"
                            >
                              {todo.description}
                            </div>
                          )
                        ) : null}
                      </div>
                    </label>
                  )}

                  <div className="flex gap-2 ml-4">
                    {editingId === todo.id ? (
                      <>
                        <button
                          onClick={() => saveEdit(todo.id)}
                          className="px-3 py-1 rounded border text-zinc-700 dark:text-zinc-200"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1 rounded border text-zinc-700 dark:text-zinc-200"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(todo)}
                          className="px-3 py-1 rounded border text-zinc-700 dark:text-zinc-200"
                          aria-label={`Edit ${todo.text}`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => removeTodo(todo.id)}
                          className="text-sm text-red-500 hover:underline"
                          aria-label={`Delete ${todo.text}`}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>

          <footer className="mt-4 flex items-center justify-between text-sm text-zinc-500">
            <div>{todos.length} total</div>
            <div className="flex gap-2">
              <button
                onClick={() => setTodos([])}
                className="px-3 py-1 rounded border text-zinc-700 dark:text-zinc-200"
              >
                Clear all
              </button>
              <button
                onClick={clearCompleted}
                className="px-3 py-1 rounded border text-zinc-700 dark:text-zinc-200"
              >
                Clear completed
              </button>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
// ...existing code...