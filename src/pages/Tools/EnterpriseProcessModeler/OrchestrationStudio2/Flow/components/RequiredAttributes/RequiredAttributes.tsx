import { Controller } from "react-hook-form";
import { IRequiredAttributes } from "../../Flow";

interface ValidationRules {
  required?: boolean | string | { value: boolean; message: string };
  pattern?: { value: RegExp; message: string };
  minLength?: { value: number; message: string };
  maxLength?: { value: number; message: string };
  min?: { value: number; message: string };
  max?: { value: number; message: string };
  validate?: { [key: string]: (value: any) => boolean | string };
  valueAsNumber?: boolean;
  valueAsDate?: boolean;
  disabled?: boolean;
}

interface IRequiredAttributeProps {
  requiredAttributes: IRequiredAttributes[];
  handleSetAttributesAndRunFlow: () => void;
  control: any;
  setValue?: any;
  rules?: ValidationRules;
  setRequiredAttributes: React.Dispatch<
    React.SetStateAction<IRequiredAttributes[]>
  >;
}

function RequiredAttributes({
  requiredAttributes,
  control,
  setValue,
  handleSetAttributesAndRunFlow,
  setRequiredAttributes,
}: IRequiredAttributeProps) {
  return (
    <>
      <div className="absolute left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] bg-slate-300 p-3 pt-0 border rounded mb-2 shadow">
        <p className="text-red-600 py-2">
          Required Attribute{requiredAttributes.length > 1 && "s"}
        </p>
        <form>
          {requiredAttributes.map((attribute, index) => (
            <Controller
              key={index}
              name={attribute.name}
              control={control}
              rules={{
                required: `${attribute.name} is required`,
                min: {
                  value: 1,
                  message: `${attribute.name} must be at least 1 characters long`,
                },
              }}
              render={({ field: { value, onBlur }, fieldState: { error } }) => (
                <>
                  <p>{attribute.name}</p>
                  <input
                    type="text"
                    value={value || ""}
                    onBlur={onBlur}
                    onChange={(e) => {
                      setValue(attribute.name, e.target.value, {
                        shouldDirty: true,
                      });
                    }}
                    // autoFocus
                    className="px-2 py-1 rounded mr-2"
                  />
                  {error && <p className="text-red-500">{error.message}</p>}
                </>
              )}
            />
          ))}

          <button
            className="bg-slate-200 p-1 rounded-l-md border-black border hover:bg-slate-300 hover:shadow"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSetAttributesAndRunFlow();
            }}
          >
            Ok
          </button>
          <button
            className="bg-slate-200 p-1 rounded-r-md border-black border hover:bg-slate-300 hover:shadow"
            onClick={(e) => {
              e.preventDefault();
              setRequiredAttributes([]);
            }}
          >
            Cancel
          </button>
        </form>
      </div>
    </>
  );
}
export default RequiredAttributes;
