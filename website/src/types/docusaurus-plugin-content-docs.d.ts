// Minimal ambient module declaration to improve editor DX for sidebars.ts
// Docusaurus provides this type via the plugin package, but some editors
// don't resolve transitive type deps. This local shim avoids TS2307.
declare module '@docusaurus/plugin-content-docs' {
  export type SidebarItem = any;
  export type Sidebar = SidebarItem[];
  export type SidebarsConfig = Record<string, Sidebar>;
}
