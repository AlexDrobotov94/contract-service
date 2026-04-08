import { ScalarViewer } from "@/shared/lib/scalar-viewer";

type Props = {
  contract: string;
};

export const ContractHttpServicePage = ({ contract }: Props) => {
  return (
    <div>
      <ScalarViewer content={contract} />
    </div>
  );
};
