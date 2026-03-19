"use client";

import { ApiReferenceReact } from "@scalar/api-reference-react";
import { useTheme } from "next-themes";

import "@scalar/api-reference-react/style.css";

type Props = {
  url: string;
};

export function ScalarViewer({ url }: Props) {
  const { resolvedTheme } = useTheme();

  return (
    <ApiReferenceReact
      key={resolvedTheme}
      configuration={{
        url, // /openapi.yaml
        forceDarkModeState: resolvedTheme === "dark" ? "dark" : "light",
        hideDarkModeToggle: true,
        withDefaultFonts: false,

        hiddenClients: {
          c: true,
          clojure: true,
          csharp: true,
          dart: true,
          fsharp: true,
          http: true,
          java: true,
          kotlin: true,
          objc: true,
          ocaml: true,
          php: true,
          powershell: true,
          r: true,
          ruby: true,
          rust: true,
          swift: true,
          // Оставляем только эти:
          // shell: ['curl']
          // js: ['fetch', 'axios']
          // node: ['fetch', 'axios']
          // python: ['requests']
          // go: ['native']
        },

        documentDownloadType: "none",
        showDeveloperTools: "never",
        hideClientButton: true,
        hideTestRequestButton: true,
        mcp: {
          disabled: true,
        },
        agent: {
          disabled: true,
        },
        telemetry: false,
      }}
    />
  );
}
