export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" };
  return (
    <div className="flex justify-center items-center p-8">
      <div
        className={`${sizes[size]} border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin dark:border-gray-700 dark:border-t-brand-500`}
      />
    </div>
  );
}
