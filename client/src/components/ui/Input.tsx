import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

// Wrap Input in forwardRef
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => {
    return (
      <input 
        {...props} 
        ref={ref} // Attach the forwarded ref here
        className={twMerge("field", props.className)} 
      />
    );
  }
);

// Add a display name for easier debugging in DevTools
Input.displayName = "Input";

// Wrap Textarea in forwardRef
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  (props, ref) => {
    return (
      <textarea 
        {...props} 
        ref={ref} // Attach the forwarded ref here
        className={twMerge("field min-h-28 resize-none", props.className)} 
      />
    );
  }
);

Textarea.displayName = "Textarea";