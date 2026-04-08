import { PrivateLayout } from "@/app/layouts";

type Props = {
  children: React.ReactNode;
};

export default function AppAdminLayout({ children }: Readonly<Props>) {
  return <PrivateLayout>{children}</PrivateLayout>;
}
