type Props = {
  label: string;
  value: React.ReactNode;
};

export const InfoField = ({ label, value }: Props) => {
  return (
    <ul className="list-none p-0 m-0 flex flex-col text-sm gap-1">
      <li className="font-bold uppercase text-secondary-foreground">{label}</li>
      <li>{value}</li>
    </ul>
  );
};
