import { SidebarMenu } from "@/features/menues";
import { Header } from "@/widgets/header";

type Props = {
  children: React.ReactNode;
};

export const PrivateLayout = ({ children }: Props) => {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] grid-cols-[240px_1fr] min-h-screen">
      <header className="col-span-2">
        <Header />
      </header>
      <aside className="border-r px-4 py-6">
        <SidebarMenu />
      </aside>
      <main className="px-6 py-6">{children}</main>
      <footer className="col-span-2 border-t px-6 py-4">Footer</footer>
    </div>
  );
};
