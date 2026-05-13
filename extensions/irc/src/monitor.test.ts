import { describe, expect, it } from "vitest";
import { resolveIrcInboundTarget } from "./monitor.js";

describe("irc monitor inbound target", () => {
  it("keeps channel target for group messages", () => {
    expect(
      resolveIrcInboundTarget({
        target: "#qingclaws",
        senderNick: "alice",
      }),
    ).toEqual({
      isGroup: true,
      target: "#qingclaws",
      rawTarget: "#qingclaws",
    });
  });

  it("maps DM target to sender nick and preserves raw target", () => {
    expect(
      resolveIrcInboundTarget({
        target: "qingclaws-bot",
        senderNick: "alice",
      }),
    ).toEqual({
      isGroup: false,
      target: "alice",
      rawTarget: "qingclaws-bot",
    });
  });

  it("falls back to raw target when sender nick is empty", () => {
    expect(
      resolveIrcInboundTarget({
        target: "qingclaws-bot",
        senderNick: " ",
      }),
    ).toEqual({
      isGroup: false,
      target: "qingclaws-bot",
      rawTarget: "qingclaws-bot",
    });
  });
});
