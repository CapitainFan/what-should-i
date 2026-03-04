import { CheckIcon } from "lucide-react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { cn } from "@/shared/lib/utils"


type CheckboxAuthProps = React.ComponentProps<typeof CheckboxPrimitive.Root> & {
  onCheck?: () => void;
};

export const CheckboxAuth = ({className, onCheck, ...props}: CheckboxAuthProps) => {
  const handleCheckedChange = (checked: CheckboxPrimitive.CheckedState) => {
    if (props.onCheckedChange) {
      props.onCheckedChange(checked);
    }
    
    if (checked === true && onCheck) {
      onCheck();
    }
  };

  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer border-blue-300 data-[state=checked]:border-blue-300 data-[state=checked]:bg-transparent size-5 shrink-0 rounded-[4px] border shadow-xs transition-colors outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
      onCheckedChange={handleCheckedChange}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-blue-600"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}