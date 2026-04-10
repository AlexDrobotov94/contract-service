import { notFound } from "next/navigation";
import { getService } from "@/entities/service/server";
import { AboutSection } from "./about";
import { LinksSection } from "./links";
import { RelationsSection } from "./relations";

type Props = {
  serviceName: string;
};

export const ServicePage = async ({ serviceName }: Props) => {
  const service = await getService(serviceName);

  if (!service) {
    return notFound();
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-10">
        <AboutSection {...service} />

        <LinksSection links={service.links} />
      </div>
      <div className="flex flex-col gap-10">
        <RelationsSection />
      </div>
    </div>
  );
};
