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
}: AlertProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
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
                    height={24}
                    width={24}
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
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center flex flex-col items-center">
            <span className="block rounded-full bg-red-500 p-2 w-10">
              <IconController
                name={actionName}
                height={24}
                width={24}
                color="white"
              />
            </span>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center flex flex-col items-center gap-5 max-h-[50vh] overflow-auto">
            <span className="block text-black font-bold">
              Are you sure you want to {actionName}?
            </span>
            {children}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <span className="flex justify-between gap-9 w-full">
            <AlertDialogCancel className="w-1/2">Cancel</AlertDialogCancel>
            <AlertDialogAction className="w-1/2" onClick={onContinue}>
              Continue
            </AlertDialogAction>
          </span>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default Alert;
