import { Header } from "@/widgets/header";

type Props = {
  children: React.ReactNode;
};

export const PrivateLayout = ({ children }: Props) => {
  return (
    <div className="flex flex-col gap-10">
      <Header />

      {children}
    </div>
  );
};
