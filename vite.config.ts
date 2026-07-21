import vue from "@vitejs/plugin-vue";
import { defineConfig, type Plugin } from "vite";
import { sites } from "./build/sites-vite-plugin";

const inlineCss = (): Plugin => ({
  name: "inline-css",
  apply: "build",
  enforce: "post",
  transformIndexHtml: {
    order: "post",
    handler(html, context) {
      const { bundle } = context;
      if (!bundle) return html;

      return html.replace(
        /<link rel="stylesheet" crossorigin href="\/(assets\/[^\"]+\.css)">/g,
        (stylesheetTag, fileName: string) => {
          const asset = bundle[fileName];
          if (!asset || asset.type !== "asset") return stylesheetTag;

          const css =
            typeof asset.source === "string"
              ? asset.source
              : new TextDecoder().decode(asset.source);

          delete bundle[fileName];
          return `<style>${css}</style>`;
        },
      );
    },
  },
});

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [vue(), ...(isSsrBuild ? [] : [inlineCss(), sites()])],
}));
