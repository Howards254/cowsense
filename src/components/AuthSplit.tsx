import { Sprout, Users, Brain, Package, BarChart3 } from "lucide-react";
import type { ReactNode } from "react";

const features = [
  { icon: Users, text: "Manage farmers and field visits" },
  { icon: Brain, text: "AI-powered prioritization & reasoning" },
  { icon: Package, text: "Track input demand and supply chains" },
  { icon: BarChart3, text: "Real-time dashboards and analytics" },
];

export function AuthSplit({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 text-primary-foreground relative overflow-hidden"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="size-11 rounded-xl grid place-items-center bg-white/20 backdrop-blur">
              <Sprout className="size-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">CowSense AI</span>
          </div>
          <p className="text-base opacity-80 mt-4 max-w-sm leading-relaxed">
            AI-powered intelligence for dairy extension agents — helping you serve more farmers with
            data-driven decisions.
          </p>
        </div>
        <div className="space-y-5">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.text} className="flex items-center gap-3">
                <div className="size-9 rounded-lg grid place-items-center bg-white/15 backdrop-blur shrink-0">
                  <Icon className="size-4" />
                </div>
                <span className="text-sm font-medium opacity-85">{f.text}</span>
              </div>
            );
          })}
        </div>
        <p className="text-xs opacity-50">© 2026 DigiCow · AgriTech Intelligence</p>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
