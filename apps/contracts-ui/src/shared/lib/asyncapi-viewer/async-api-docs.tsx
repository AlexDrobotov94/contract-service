"use client";

import dynamic from "next/dynamic";
import "@asyncapi/react-component/styles/default.min.css";
import type { AsyncApiProps } from "@asyncapi/react-component";

const AsyncApiComponent = dynamic(
  () => import("@asyncapi/react-component/browser"),
  { ssr: false },
);

export function AsyncApiViewer({ schema, config }: AsyncApiProps) {
  if (typeof navigator === "undefined") return null;
  return schema && <AsyncApiComponent schema={schema} config={config} />;
}
