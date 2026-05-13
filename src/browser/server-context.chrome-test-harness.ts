import { vi } from "vitest";
import { installChromeUserDataDirHooks } from "./chrome-user-data-dir.test-harness.js";

const chromeUserDataDir = { dir: "/tmp/qingclaws" };
installChromeUserDataDirHooks(chromeUserDataDir);

vi.mock("./chrome.js", () => ({
  isChromeCdpReady: vi.fn(async () => true),
  isChromeReachable: vi.fn(async () => true),
  launchQingClawsChrome: vi.fn(async () => {
    throw new Error("unexpected launch");
  }),
  resolveQingClawsUserDataDir: vi.fn(() => chromeUserDataDir.dir),
  stopQingClawsChrome: vi.fn(async () => {}),
}));
