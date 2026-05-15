import { Building2, User } from "lucide-react";

function getItemClass(variant) {
  if (variant === "primary") return "rounded-lg bg-blue-700 px-5 py-2 shadow hover:bg-blue-800 text-white";
  if (variant === "outline") return "rounded-lg border border-white/50 px-5 py-2 text-white";
  return "text-white font-medium hover:text-slate-200 transition-colors";
}

export default function DefaultNavbar({ items = [], actionLabel = "Logout", onAction, className = "" }) {
  return (
    <header className={`flex flex-wrap items-center justify-between gap-4 ${className}`.trim()}>
      <div className="flex items-center gap-3 text-4xl font-bold tracking-wide">
        <Building2 className="h-10 w-10 text-blue-900" />
        <span className="text-blue-900">CityVoice</span>
      </div>
      <nav className="flex items-center gap-6 text-sm font-semibold md:text-base">
        {items.map((item) => {
          if (item.isProfileAvatar) {
            return (
              <button
                key="profile-avatar"
                type="button"
                onClick={item.onClick}
                title="View Profile"
                className="relative flex h-11 w-11 shrink-0 overflow-hidden items-center justify-center rounded-full bg-blue-700 text-white ring-2 ring-white shadow-md hover:scale-105 hover:shadow-blue-300/50 hover:shadow-lg transition-all duration-200 ml-2"
              >
                {item.avatarUrl ? (
                  <img src={item.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <User strokeWidth={2.5} className="h-5 w-5" />
                )}
              </button>
            );
          }
          return (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              className={getItemClass(item.variant)}
            >
              {item.label}
            </button>
          );
        })}
        {actionLabel && (
          <button type="button" onClick={onAction} className="rounded-lg bg-red-500 px-5 py-2 text-white hover:bg-red-600">
            {actionLabel}
          </button>
        )}
      </nav>
    </header>
  );
}
