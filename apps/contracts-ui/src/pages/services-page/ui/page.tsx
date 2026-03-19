import { ServicesTable } from "@/widgets/services-table";
import { ScalarViewer } from "@/shared/lib/scalar-viewer";
import { getServices } from "@/shared/lib/services";

export const ServicesPage = async () => {
  const services = await getServices();

  return (
    <div className="flex flex-col gap-10">
      <ServicesTable services={services} />

      <ScalarViewer url="/openapi.yaml" />
    </div>
  );
};
