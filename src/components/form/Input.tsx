import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    helper?: string;
    isError?: boolean;
    isLoading?: boolean;
}

const baseInputClasses =
    "block w-full rounded-md border px-3 py-2 text-sm transition-colors focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed";
const errorClasses =
    "border-red-500 text-red-600 placeholder-red-400 focus:border-red-500 focus:ring-red-500";
const normalClasses =
    "border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-primary";

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    (
        { label, helper, isError, isLoading, id, className = "", ...props },
        ref
    ) => {
        const inputId =
            id || label?.toLowerCase().replace(/\s+/g, "-") || undefined;
        return (
            <div className="space-y-1">
                {label && (
                    <label
                        htmlFor={inputId}
                        className={`block text-sm font-medium ${isError ? "text-red-600" : "text-gray-700"}`}
                    >
                        {label}
                    </label>
                )}
                <input
                    id={inputId}
                    ref={ref}
                    disabled={isLoading}
                    className={[
                        baseInputClasses,
                        isError ? errorClasses : normalClasses,
                        className,
                    ].join(" ")}
                    aria-invalid={isError || undefined}
                    aria-busy={isLoading || undefined}
                    {...props}
                />
                {helper && (
                    <p
                        className={`text-xs ${isError ? "text-red-600" : "text-gray-500"}`}
                    >
                        {helper}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";
