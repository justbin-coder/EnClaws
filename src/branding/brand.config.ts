// src/branding/brand.config.ts
// QINGCLAWS-CUSTOM: brand — single source of truth for QingClaws brand identifiers.
// Upstream EnClaws uses hard-coded strings; this layer allows designer-replace-in-place.
export const BRAND = {
  productName: "QingClaws",
  productNameZh: "QingClaws",
  productTagline: "企业级 AI 助手容器平台",
  cliName: "qingclaws",
  pkgName: "qingclaws",
  configDirName: ".qingclaws",
  envPrefix: "QINGCLAWS_",

  assets: {
    logo: "/branding/assets/logo.svg",
    logoDark: "/branding/assets/logo-dark.svg",
    favicon: "/branding/assets/favicon.svg",
    banner: "/branding/assets/banner.svg",
  },

  links: {
    homepage: "",
    docs: "",
    issues: "",
    repo: "",
  },

  upstream: {
    project: "EnClaws",
    org: "hashSTACS-Global",
    parent: "OpenClaw",
    license: "Apache-2.0",
  },
} as const;
