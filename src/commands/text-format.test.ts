import { describe, expect, it } from "vitest";
import { shortenText } from "./text-format.js";

describe("shortenText", () => {
  it("returns original text when it fits", () => {
    expect(shortenText("qingclaws", 16)).toBe("qingclaws");
  });

  it("truncates and appends ellipsis when over limit", () => {
    expect(shortenText("qingclaws-status-output", 10)).toBe("qingclaws-…");
  });

  it("counts multi-byte characters correctly", () => {
    expect(shortenText("hello🙂world", 7)).toBe("hello🙂…");
  });
});
