import { describe, it, expect } from "vitest";
import useInput from "./useInput";

describe("useInput", () => {
  it("should initialize with default value and change value on change handler", () => {
    const [value, handleValueChange, setValue] = useInput("initial");

    expect(value.value).toBe("initial");

    handleValueChange({ target: { value: "updated" } });
    expect(value.value).toBe("updated");

    setValue("direct");
    expect(value.value).toBe("direct");
  });

  it("should initialize with empty string when no default given and handle direct value without event.target", () => {
    const [value, handleValueChange] = useInput();
    expect(value.value).toBe("");

    handleValueChange("direct-val");
    expect(value.value).toBe("direct-val");
  });
});
