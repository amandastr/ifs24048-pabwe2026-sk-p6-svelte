import { describe, it, expect } from "vitest";
import { render } from "@testing-library/svelte";
import MarkdownViewer from "./MarkdownViewer.svelte";

describe("MarkdownViewer", () => {
  it("should render markdown content as html", () => {
    const { container } = render(MarkdownViewer, { props: { content: "Halo **Dunia**" } });

    const viewer = container.querySelector('[data-testid="markdown-viewer"]');
    expect(viewer).toBeTruthy();
    expect(viewer.innerHTML).toContain("<strong>Dunia</strong>");
    expect(viewer.textContent).toContain("Halo Dunia");
  });

  it("should update the output when the content prop changes", async () => {
    const { container, rerender } = render(MarkdownViewer, { props: { content: "Awal" } });
    const viewer = container.querySelector('[data-testid="markdown-viewer"]');
    expect(viewer.textContent).toContain("Awal");

    await rerender({ content: "- satu\n- dua" });
    expect(viewer.querySelectorAll("li").length).toBe(2);

    await rerender({ content: "" });
    expect(viewer.innerHTML).toBe("");
  });

  it("should render an empty viewer by default", () => {
    const { container } = render(MarkdownViewer);
    expect(container.querySelector('[data-testid="markdown-viewer"]').innerHTML).toBe("");
  });

  it("should never render raw html from the content", () => {
    const { container } = render(MarkdownViewer, {
      props: { content: '<img src=x onerror="alert(1)"><script>alert(1)</script>' },
    });
    const viewer = container.querySelector('[data-testid="markdown-viewer"]');
    expect(viewer.querySelector("img")).toBeNull();
    expect(viewer.querySelector("script")).toBeNull();
    expect(viewer.textContent).toContain("<script>");
  });
});
