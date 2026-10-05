"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  icon: LucideIcon;
  hint?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "className">;

export default function AuthField({ label, icon: Icon, hint, type = "text", ...props }: Props) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-1.5">{label}</label>
      <div className="relative">
        <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          {...props}
          type={isPassword && show ? "text" : type}
          className="w-full bg-paper text-ink border border-hairline rounded-lg pl-9 pr-10 py-2.5 text-sm placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary"
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {hint && <p className="text-xs text-muted mt-1.5">{hint}</p>}
    </div>
  );
}