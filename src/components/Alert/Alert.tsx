import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import IconController from "@/IconController/IconController";

interface AlertProps {
  disabled: boolean;
  tooltipTitle?: string;
  children?: React.ReactNode;
  actionName: string;
  onContinue: () => void;
  onClick?: () => void;
  tooltipAdjustmentStyle?: string | undefined;
  iconColor?: string;
  customButton?: React.ReactNode;
}

const Alert = ({
  disabled,
  tooltipTitle,
  children,
  actionName,
  onContinue,
  onClick,
  tooltipAdjustmentStyle,
  iconColor = "black",
  customButton,
}: AlertProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {customButton ? (
          customButton
        ) : (
          <button
            onClick={onClick}
            disabled={disabled}
            className={`${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <IconController
                      name={actionName}
                      color={disabled ? "#e5e5e5" : iconColor}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent className={tooltipAdjustmentStyle}>
                  <p>{tooltipTitle}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="pb-2 border-b">
            <span className="text-black text-[16px]">
              Are you sure you want to {actionName}?
            </span>
          </AlertDialogTitle>
          <AlertDialogDescription className="max-h-[50vh] overflow-auto mt-2 text-gray-700">
            {children}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <span className="flex justify-end gap-6 w-full">
            <AlertDialogCancel className="w-[140px] h-[40px]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="w-[140px] h-[40px]"
              onClick={onContinue}
            >
              Continue
            </AlertDialogAction>
          </span>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default Alert;
