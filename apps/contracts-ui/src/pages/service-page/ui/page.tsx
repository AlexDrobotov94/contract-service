import { notFound } from "next/navigation";
import { getService } from "@/entities/service/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/atoms/card";
import { InfoField } from "./info-field";
import { Badge } from "@/shared/ui/atoms/badge";

type Props = {
  serviceName: string;
};

export const ServicePage = async ({ serviceName }: Props) => {
  const service = await getService(serviceName);

  if (!service) {
    return notFound();
  }

  const { name, description, owner, lifecycle, type, tags } = service;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-10">
        <Card>
          <CardHeader>
            <CardTitle>О сервисе</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
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
      </div>
      <div className="flex flex-col gap-10">2</div>
    </div>
  );
};
