/**
 * The source code displayed in the editor. Rendered into destructible glyphs.
 * A realistic ~160-line React codebase: hooks, API layer, store, components.
 */
export const SAMPLE_CODE = `import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { create } from "zustand";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: "admin" | "member" | "viewer";
}

export interface Project {
  id: string;
  title: string;
  ownerId: string;
  archived: boolean;
  createdAt: number;
}

// ---------------------------------------------------------------------------
// API layer
// ---------------------------------------------------------------------------

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE_URL + path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    throw new Error("Request failed: " + res.status);
  }
  return (await res.json()) as T;
}

export const api = {
  getUser: (id: string) => request<User>("/users/" + id),
  listProjects: () => request<Project[]>("/projects"),
  createProject: (title: string) =>
    request<Project>("/projects", {
      method: "POST",
      body: JSON.stringify({ title }),
    }),
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

interface AppState {
  user: User | null;
  projects: Project[];
  loading: boolean;
  setUser: (user: User | null) => void;
  loadProjects: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  projects: [],
  loading: false,
  setUser: (user) => set({ user }),
  loadProjects: async () => {
    set({ loading: true });
    try {
      const projects = await api.listProjects();
      set({ projects, loading: false });
    } catch {
      set({ loading: false });
    }
  },
}));

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useDebounced<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function useInterval(callback: () => void, ms: number | null): void {
  const saved = useRef(callback);
  useEffect(() => {
    saved.current = callback;
  }, [callback]);
  useEffect(() => {
    if (ms === null) return;
    const id = setInterval(() => saved.current(), ms);
    return () => clearInterval(id);
  }, [ms]);
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

export function ProjectList() {
  const { projects, loading, loadProjects } = useAppStore();
  const [query, setQuery] = useState("");
  const search = useDebounced(query, 200);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const visible = useMemo(
    () =>
      projects.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase()),
      ),
    [projects, search],
  );

  const handleCreate = useCallback(async () => {
    const title = "Untitled " + Date.now();
    await api.createProject(title);
    await loadProjects();
  }, [loadProjects]);

  if (loading) {
    return <div className="spinner" role="status" aria-label="Loading" />;
  }

  return (
    <section className="project-list">
      <header className="toolbar">
        <input
          value={query}
          placeholder="Search projects"
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={handleCreate}>New project</button>
      </header>
      <ul>
        {visible.map((project) => (
          <li key={project.id} className={project.archived ? "muted" : ""}>
            {project.title}
          </li>
        ))}
      </ul>
    </section>
  );
}
`;
