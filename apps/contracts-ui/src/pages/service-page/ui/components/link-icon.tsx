import { ServiceMeta } from "@/entities/service";
import {
  IconAlertCircle,
  IconHelpCircle,
  IconProps,
  IconWorldWww,
} from "@tabler/icons-react";
import { RefAttributes } from "react";

type LinkType = Required<Pick<ServiceMeta, "links">>["links"][number];
type IconType = Required<Pick<LinkType, "icon">>["icon"];

type IconPropsType = IconProps & RefAttributes<SVGSVGElement>;

const renderIcons = (
  iconProps?: IconPropsType,
): Record<IconType, React.ReactNode> => {
  const defaultIconProps: IconPropsType = {
    size: 20,
    stroke: 1.5,
  };
  return {
    alert: <IconAlertCircle {...defaultIconProps} {...iconProps} />,
    support: <IconHelpCircle {...defaultIconProps} {...iconProps} />,
    website: <IconWorldWww {...defaultIconProps} {...iconProps} />,
  };
};

export const LinkIcon = ({
  icon,
  iconProps,
}: {
  icon: IconType;
  iconProps?: IconPropsType;
}) => {
  return renderIcons(iconProps)[icon];
};
