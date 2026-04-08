import { ServicePage } from "@/pages/service-page";

type Props = {
  params: Promise<{ service: string }>;
};

export default async function AppServicePage({ params }: Props) {
  const { service } = await params;

  return <ServicePage serviceName={service} />;
}
