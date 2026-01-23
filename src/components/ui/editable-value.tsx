import * as React from "react";
import { cn } from "@/lib/utils";
import { CurrencyInput } from "@/components/ui/currency-input";

export interface EditableValueProps {
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  formatDisplay?: (value: number) => string;
  className?: string;
  inputClassName?: string;
  min?: number;
  max?: number;
  step?: number;
  "aria-label"?: string;
}

const EditableValue = ({ 
  value, 
  onChange, 
  prefix, 
  suffix, 
  formatDisplay, 
  className,
  inputClassName,
  min,
  max,
  step,
  "aria-label": ariaLabel,
}: EditableValueProps) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(value.toString());
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Sync editValue when external value changes
  React.useEffect(() => {
    if (!isEditing) {
      setEditValue(value.toString());
    }
  }, [value, isEditing]);

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const parsed = parseFloat(editValue);
    if (!isNaN(parsed) && parsed !== value) {
      onChange(parsed);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      setEditValue(value.toString());
      setIsEditing(false);
    }
  };

  const displayValue = formatDisplay 
    ? formatDisplay(value) 
    : `${prefix || ''}${value}${suffix || ''}`;

  if (isEditing) {
    return (
      <CurrencyInput
        ref={inputRef}
        prefix={prefix}
        suffix={suffix}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={cn("w-28", inputClassName)}
        min={min}
        max={max}
        step={step}
        aria-label={ariaLabel || `Edit value: ${displayValue}`}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setEditValue(value.toString());
        setIsEditing(true);
      }}
      className={cn(
        "font-semibold text-foreground px-2 py-1 -mx-2 -my-1 rounded-md",
        "hover:bg-muted/50 focus-visible:bg-muted/50 cursor-text transition-colors",
        "text-left inline-flex items-center",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        className
      )}
      aria-label={ariaLabel || `Edit value: ${displayValue}. Click to edit.`}
    >
      {displayValue}
    </button>
  );
};

EditableValue.displayName = "EditableValue";

export { EditableValue };
