export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="lg-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2fd08c" />
          <stop offset="100%" stopColor="#0b6b4f" />
        </linearGradient>
      </defs>
      <path
        d="M24 3c8.5 10 13.5 16.3 13.5 23.6a13.5 13.5 0 1 1-27 0C10.5 19.3 15.5 13 24 3Z"
        fill="url(#lg-mark)"
      />
      <path
        d="M24 13.5c4.3 5.2 7 8.9 7 12.4a7 7 0 1 1-14 0c0-3.5 2.7-7.2 7-12.4Z"
        fill="#ffffff"
        opacity="0.95"
      />
      <path
        d="M19.5 28.2c1.7-3.6 4.6-5.4 8-5.8-.7 4-3.4 6.2-8 5.8Z"
        fill="url(#lg-mark)"
      />
    </svg>
  );
}

export function Logo({
  className,
  textClassName = "text-foreground",
}: {
  className?: string;
  textClassName?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <LogoMark className="h-8 w-8" />
      <span className={`text-lg font-bold tracking-tight ${textClassName}`}>LactoGrid</span>
    </div>
  );
}
