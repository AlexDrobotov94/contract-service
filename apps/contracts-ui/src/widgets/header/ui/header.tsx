import { SwitchTheme } from "@/features/switch-theme";

export const Header = () => {
  return (
    <header className="w-full border-b flex items-center justify-between py-4">
      <div className="container flex justify-end">
        <SwitchTheme />
      </div>
    </header>
  );
};
