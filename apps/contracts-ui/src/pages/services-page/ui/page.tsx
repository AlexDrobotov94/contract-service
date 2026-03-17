import { getServices } from "@/shared/lib/services";
import { ServicesTable } from "@/widgets/services-table";

export const ServicesPage = async () => {
  const services = await getServices();

  console.log("[services]: ", services);

  return (
    <div>
      <ServicesTable />
    </div>
  );
};
