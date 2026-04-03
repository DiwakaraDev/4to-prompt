// src/components/prompts/PromptCardSkeleton.tsx
export function PromptCardSkeleton() {
  return (
    <div className="card overflow-hidden" aria-hidden="true">
      <div className="skeleton skeleton-image" />
      <div className="card-body flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="skeleton skeleton-text" style={{ width: "60%", height: "13px" }} />
          <div className="skeleton skeleton-badge" />
        </div>
        <div className="skeleton skeleton-text" style={{ height: "11px" }} />
        <div className="skeleton skeleton-text-sm" style={{ height: "11px" }} />
        <div className="flex items-center justify-between mt-1">
          <div className="skeleton" style={{ width: "30px", height: "11px", borderRadius: "4px" }} />
          <div className="skeleton skeleton-btn" style={{ width: "56px", height: "28px" }} />
        </div>
      </div>
    </div>
  );
}