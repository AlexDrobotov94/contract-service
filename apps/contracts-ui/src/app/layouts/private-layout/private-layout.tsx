type Props = {
  children: React.ReactNode;
};

export const PrivateLayout = ({ children }: Props) => {
  return (
    <div>
      <div>PrivateLayout</div>
      {children}
    </div>
  );
};
