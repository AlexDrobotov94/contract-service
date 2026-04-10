import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/atoms/card";
import { ServiceMeta } from "@/entities/service";
import { LinkIcon } from "./components/link-icon";
import Link from "next/link";

type Props = Pick<ServiceMeta, "links">;

export const LinksSection = async (props: Props) => {
  const { links } = props;

  if (!links) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ссылки</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-3">
          {links.map(({ url, title, icon }) => (
            <div key={url} className="flex items-center gap-2">
              <Link
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm"
              >
                {icon && <LinkIcon icon={icon} />}
                {title}
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
