import { AsyncApiViewer } from "@/shared/lib/asyncapi-viewer";

type Props = {
  contract: string;
};

export const ContractAsyncServicePage = ({ contract }: Props) => {
  return <AsyncApiViewer schema={contract} />;
};
