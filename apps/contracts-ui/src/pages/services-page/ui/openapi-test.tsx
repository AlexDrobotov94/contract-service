"use client";

import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";

export default function OpenApiTest() {
  return (
    <ApiReferenceReact
      configuration={{
        url: "/openapi.yaml",
        darkMode: true,
      }}
    />
  );
}
