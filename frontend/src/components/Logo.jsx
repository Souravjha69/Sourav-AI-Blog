export default function Logo({ size = "md", inverted = false, className = "" }) {
  const badge = size === "lg" ? "w-9 h-9 text-base" : size === "sm" ? "w-7 h-7 text-xs" : "w-8 h-8 text-sm";
  const text = size === "lg" ? "text-xl" : size === "sm" ? "text-base" : "text-lg";
  const badgeClasses = inverted
    ? "bg-[var(--bg)] text-[var(--text)]"
    : "bg-[var(--text)] text-[var(--bg)]";

  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <span className={`${badge} rounded-full ${badgeClasses} flex items-center justify-center font-display font-bold shrink-0`}>
        S
      </span>
      <span className={`font-display font-bold ${text} tracking-tight`}>
        sourav<span className="font-mono font-medium text-[var(--accent)]">.log</span>
      </span>
    </span>
  );
}
