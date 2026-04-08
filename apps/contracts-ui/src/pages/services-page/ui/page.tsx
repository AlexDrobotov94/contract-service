import { getServices } from "@/entities/service/server";
import { ServicesTable } from "@/widgets/services-table";

export const ServicesPage = async () => {
  const services = await getServices();

  return (
    <div className="flex flex-col gap-10">
      <ServicesTable services={services} />
    </div>
  );
};
