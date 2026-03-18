import { getServices } from "@/shared/lib/services";
import { ServicesTable } from "@/widgets/services-table";
import OpenApiTest from "./openapi-test";

export const ServicesPage = async () => {
  const services = await getServices();

  return (
    <div className="flex flex-col gap-10">
      <ServicesTable services={services} />

      <OpenApiTest />
    </div>
  );
};
