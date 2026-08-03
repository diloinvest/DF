import { clsx } from "@/lib/clsx";

export function Container({
  children,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "header" | "footer" | "nav" | "main";
}) {
  return (
    <Tag
      className={clsx(
        "mx-auto w-full max-w-[var(--container)] px-5 sm:px-8",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
