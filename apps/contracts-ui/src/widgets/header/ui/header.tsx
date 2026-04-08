import { SwitchTheme } from "@/features/switch-theme";

export const Header = () => {
  return (
    <div className="w-full border-b flex items-center justify-end p-4">
      <SwitchTheme />
    </div>
  );
};
