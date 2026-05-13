import type {
  AnyAgentTool,
  QingClawsPluginApi,
  QingClawsPluginToolFactory,
} from "../../src/plugins/types.js";
import { createLobsterTool } from "./src/lobster-tool.js";

export default function register(api: QingClawsPluginApi) {
  api.registerTool(
    ((ctx) => {
      if (ctx.sandboxed) {
        return null;
      }
      return createLobsterTool(api) as AnyAgentTool;
    }) as QingClawsPluginToolFactory,
    { optional: true },
  );
}
