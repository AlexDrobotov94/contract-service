"use client";

import dynamic from "next/dynamic";
import "@asyncapi/react-component/styles/default.min.css";
import type { AsyncApiProps, ConfigInterface } from "@asyncapi/react-component";

const AsyncApiComponent = dynamic(
  () => import("@asyncapi/react-component/browser"),
  { ssr: false },
);

const config: Partial<ConfigInterface> = {
  show: {
    sidebar: true,
    servers: false,
    errors: false,
  },
  expand: {
    messageExamples: true,
  },
  sidebar: {
    showOperations: "byOperationsTags",
    useChannelAddressAsIdentifier: true,
  },
};

export function AsyncApiViewer({ schema }: AsyncApiProps) {
  if (typeof navigator === "undefined") return null;
  return schema && <AsyncApiComponent schema={schema} config={config} />;
}
