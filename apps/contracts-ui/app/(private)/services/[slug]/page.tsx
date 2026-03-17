type Props = {
  params: Promise<{ slug: string }>;
};

export default async function AppServicePage({ params }: Props) {
  const { slug } = await params;

  return <div>AppServicePage: {slug}</div>;
}
