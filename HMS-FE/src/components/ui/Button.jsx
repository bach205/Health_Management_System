import { cn } from "../../lib/utils";
import React from "react";

const Button = ({ children, className, variant = "primary", ...props }) => {
    const base =
        "inline-flex items-center justify-center px-4 py-2 rounded-sm text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50";

    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
        danger: "bg-red-600 text-white hover:bg-red-700",
        outline: "border border-gray-300 text-gray-700 hover:bg-gray-100",
    };

    return (
        <button className={cn(base, variants[variant], className)} {...props}>
            {children}
        </button>
    );
};

export default Button; 