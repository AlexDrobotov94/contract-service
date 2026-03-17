import { notFound } from "next/navigation";
import { getService } from "@/entities/service";

type Props = {
  serviceName: string;
};

export const ServicePage = async ({ serviceName }: Props) => {
  const service = await getService(serviceName);

  if (!service) {
    return notFound();
  }

  return (
    <div className="p-8">
      <h2>Single ServicePage</h2>

      <ul>
        <li>Название: {service.name}</li>
        <li>Описание: {service.description}</li>
      </ul>
    </div>
  );
};
