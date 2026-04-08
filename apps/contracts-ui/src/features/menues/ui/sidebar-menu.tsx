"use client";

import { ROUTES } from "@/shared/configs";
import { Button } from "@/shared/ui/atoms/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items: { label: string; path: string }[] = [
  { label: "Services", path: ROUTES.services() },
  { label: "Contracts", path: ROUTES.contracts() },
];

const isActiveLink = ({
  linkPath,
  currentPath,
}: {
  linkPath: string;
  currentPath: string | null;
}) => {
  if (!currentPath) return false;
  return currentPath.startsWith(linkPath);
};

export const SidebarMenu = () => {
  const pathname = usePathname();

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => {
        const active = isActiveLink({
          linkPath: item.path,
          currentPath: pathname,
        });
        return (
          <li key={item.path}>
            <Button
              asChild
              variant="link"
              className={active ? "font-bold" : ""}
            >
              <Link href={item.path}>{item.label}</Link>
            </Button>
          </li>
        );
      })}
    </ul>
  );
};
