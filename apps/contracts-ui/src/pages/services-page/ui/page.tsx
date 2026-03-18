import { getServices } from "@/shared/lib/services";
import { ServicesTable } from "@/widgets/services-table";

export const ServicesPage = async () => {
  const services = await getServices();

  return (
    <div>
      <ServicesTable services={services} />
    </div>
  );
};
