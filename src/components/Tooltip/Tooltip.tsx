import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React from "react";

interface CustomTooltipProps {
  children: React.ReactNode;
  tooltipTitle: string;
  tooltipAdjustmentStyle?: string | undefined;
}

function CustomTooltip({
  children,
  tooltipTitle,
  tooltipAdjustmentStyle,
}: CustomTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent className={tooltipAdjustmentStyle}>
          <p>{tooltipTitle}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default CustomTooltip;
