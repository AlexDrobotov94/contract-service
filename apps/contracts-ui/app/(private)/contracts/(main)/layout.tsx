import { PrivateLayout } from "@/app/layouts";

type Props = {
  children: React.ReactNode;
};

export default function AppContractsLayout({ children }: Readonly<Props>) {
  return <PrivateLayout>{children}</PrivateLayout>;
}
