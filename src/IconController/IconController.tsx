import { Circle, CircleOff, Trash } from "lucide-react";
import React from "react";

interface IconControllerProps {
  name: string;
  height?: number;
  width?: number;
  color?: string;
}
const IconController = React.forwardRef<SVGSVGElement, IconControllerProps>(
  (
    { name, height = 24, width = 24, color = "#000000" }: IconControllerProps,
    ref
  ) => {
    const getIcon = (
      iconName: string,
      width: number,
      height: number,
      color: string
    ) => {
      switch (iconName) {
        case "cancel":
          return (
            <CircleOff width={width} height={height} color={color} ref={ref} />
          );
        case "re shedule":
          return (
            <Circle width={width} height={height} color={color} ref={ref} />
          );
        case "delete":
          return (
            <Trash width={width} height={height} color={color} ref={ref} />
          );
        case "move to reyclebin":
          return (
            <Trash width={width} height={height} color={color} ref={ref} />
          );
        default:
          return null;
      }
    };

    return (
      <>
        <div className="justify-center items-center">
          {getIcon(name, height, width, color)}
        </div>
      </>
    );
  }
);

export default IconController;
