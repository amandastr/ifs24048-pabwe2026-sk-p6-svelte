import "@testing-library/jest-dom";
import { vi, afterEach } from "vitest";
import { cleanup } from "@testing-library/svelte";

afterEach(() => {
  cleanup();
});

if (typeof document !== "undefined") {
  if (!document.elementFromPoint) {
    document.elementFromPoint = () => null;
  }
  if (!Range.prototype.getClientRects) {
    Range.prototype.getClientRects = () => [];
  }
  if (!Range.prototype.getBoundingClientRect) {
    Range.prototype.getBoundingClientRect = () => ({
      bottom: 0,
      height: 0,
      left: 0,
      right: 0,
      top: 0,
      width: 0,
      x: 0,
      y: 0,
    });
  }
}

if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

import * as $ from "svelte/internal/client";

function DummyIcon(anchor, props) {
  let el = null;
  if (typeof document !== "undefined") {
    el = document.createElement("span");
    el.setAttribute("data-testid", "icon");
    if (anchor && anchor.parentNode) {
      anchor.parentNode.insertBefore(el, anchor);
    }
  }
  if (props) {
    try {
      $.render_effect(() => {
        for (const key of Object.getOwnPropertyNames(props)) {
          const val = props[key];
          if (el && key === "class" && val) {
            el.className = String(val);
          }
        }
      });
    } catch {
      for (const key of Object.getOwnPropertyNames(props)) {
        try {
          const val = props[key];
          if (el && key === "class" && val) el.className = String(val);
        } catch {}
      }
    }
  }
  return {};
}

const iconNames = [
  "CircleQuestionMark", "ArrowLeft", "House", "Link2", "Globe", "EyeOff", "ExternalLink", "Mail", "Lock",
  "LoaderCircle", "LogIn", "UserPlus", "User", "Plus", "X", "PenLine",
  "ImagePlus", "Upload", "LayoutDashboard", "CircleUser", "ChevronRight",
  "ChevronDown", "Menu", "LogOut", "Camera", "Check", "ShieldCheck",
  "Users", "Search", "Calendar", "CircleCheck", "Clock", "Eye",
  "Pencil", "Trash2", "Funnel", "Sparkles", "CircleAlert",
];

vi.mock("lucide-svelte", async (importOriginal) => {
  const actual = await importOriginal();
  const mocked = {};
  for (const key of Object.keys(actual)) {
    mocked[key] = DummyIcon;
  }
  return {
    ...actual,
    ...mocked,
    default: mocked,
  };
});

vi.mock("@toast-ui/editor", () => {
  return {
    default: vi.fn().mockImplementation(function (options) {
      let markdown = options?.initialValue || "";
      this.options = options;
      this.getMarkdown = vi.fn(() => markdown);
      this.setMarkdown = vi.fn((val) => {
        markdown = val;
      });
      this.destroy = vi.fn();
    }),
  };
});

vi.mock("@toast-ui/editor/dist/toastui-editor-viewer", () => {
  return {
    default: vi.fn().mockImplementation(function (options) {
      let markdown = options?.initialValue || "";
      if (options?.el) {
        options.el.innerHTML = `<div class="toastui-editor-contents">${markdown}</div>`;
      }
      this.options = options;
      this.setMarkdown = vi.fn((val) => {
        markdown = val;
        if (options?.el) {
          options.el.innerHTML = `<div class="toastui-editor-contents">${markdown}</div>`;
        }
      });
      this.destroy = vi.fn();
    }),
  };
});

