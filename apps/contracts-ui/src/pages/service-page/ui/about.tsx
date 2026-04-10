import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/atoms/card";
import { InfoField } from "./components/info-field";
import { Badge } from "@/shared/ui/atoms/badge";
import Link from "next/link";
import { IconBrandGitlab } from "@tabler/icons-react";
import { ServiceMeta } from "@/entities/service";

type Props = Pick<
  ServiceMeta,
  "description" | "owner" | "lifecycle" | "type" | "tags" | "source"
>;

export const AboutSection = async (props: Props) => {
  const { description, owner, lifecycle, type, tags, source } = props;

  return (
    <Card>
      <CardHeader>
        <CardTitle>О сервисе</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {source && (
          <div className="border-y border-secondary py-4 flex">
            <Link
              href={source}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center"
            >
              <IconBrandGitlab size={40} stroke={1.5} />
              <span className="text-sm">VIEW SOURCE</span>
            </Link>
          </div>
        )}

        <div>
          <InfoField label="Описание" value={description} />
        </div>
        <div className="grid grid-cols-2">
          <InfoField label="Owner" value={owner} />
          <InfoField label="Type" value={type} />
        </div>
        <div className="grid grid-cols-2">
          <InfoField label="Lifecycle" value={lifecycle} />

          {tags && tags.length > 0 && (
            <InfoField
              label="Tags"
              value={
                <ul className="flex items-center gap-2 flex-wrap">
                  {tags.map((tag) => (
                    <li key={tag}>
                      <Badge variant="secondary">{tag}</Badge>
                    </li>
                  ))}
                </ul>
              }
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
