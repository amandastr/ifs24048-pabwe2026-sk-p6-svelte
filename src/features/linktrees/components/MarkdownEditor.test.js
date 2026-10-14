import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/svelte";
import MarkdownEditor from "./MarkdownEditor.svelte";

let mockEvents = {};
const mockGetMarkdown = vi.fn(() => "mock editor text");
const mockSetMarkdown = vi.fn();
const mockDestroy = vi.fn();

vi.mock("@toast-ui/editor", () => {
  return {
    default: vi.fn().mockImplementation(function (options) {
      mockEvents = options.events || {};
      this.getMarkdown = mockGetMarkdown;
      this.setMarkdown = mockSetMarkdown;
      this.destroy = mockDestroy;
    }),
  };
});

describe("MarkdownEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEvents = {};
  });

  it("should initialize Editor with props and handle change event", async () => {
    const { container, rerender, unmount } = render(MarkdownEditor, {
      props: {
        value: "initial text",
        placeholder: "Tulis...",
        height: "300px",
        textareaTestId: "custom-editor-textarea",
      },
    });

    const textarea = container.querySelector('[data-testid="custom-editor-textarea"]');
    expect(textarea).toBeTruthy();

    // Trigger editor event change
    if (mockEvents.change) {
      mockEvents.change();
    }

    // Update prop value to different value
    await rerender({ value: "updated prop" });
    expect(mockSetMarkdown).toHaveBeenCalledWith("updated prop");

    // Update prop value to empty
    await rerender({ value: "" });
    expect(mockSetMarkdown).toHaveBeenCalledWith("");

    // Unmount
    unmount();
    expect(mockDestroy).toHaveBeenCalled();
  });

  it("should handle onTextareaInput fallback", async () => {
    const { container } = render(MarkdownEditor, {
      props: {
        value: "",
      },
    });

    const textarea = container.querySelector("textarea");
    await fireEvent.input(textarea, { target: { value: "manual input" } });

    expect(mockSetMarkdown).toHaveBeenCalledWith("manual input");
  });

  it("should handle input and unmount gracefully when Editor fails to initialize", async () => {
    const EditorMock = (await import("@toast-ui/editor")).default;
    EditorMock.mockImplementationOnce(function () {
      throw new Error("Initialization failed");
    });

    const { container, unmount } = render(MarkdownEditor, {
      props: {
        value: "fallback text",
      },
    });

    const textarea = container.querySelector("textarea");
    await fireEvent.input(textarea, { target: { value: "manual input fallback" } });
    unmount();
  });
});
