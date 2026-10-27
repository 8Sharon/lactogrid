import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Search, Bell, ChevronDown, LogOut, RefreshCw } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getAlerts, getProfile } from "@/lib/lactogrid.functions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} day${Math.floor(hrs / 24) > 1 ? "s" : ""} ago`;
}

export function Topbar() {
  const navigate = useNavigate();
  const getProfileFn = useServerFn(getProfile);
  const getAlertsFn = useServerFn(getAlerts);
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: getProfileFn });
  const { data: alertsData } = useQuery({ queryKey: ["alerts"], queryFn: getAlertsFn });
  const [open, setOpen] = useState(false);
  const initials = (profile?.full_name ?? "C M")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="flex h-16 items-center gap-4 border-b border-border bg-card px-6">
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search anything..."
          className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40"
        />
      </div>
      <div className="ml-auto flex items-center gap-4">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button className="relative rounded-full p-2 hover:bg-muted" aria-label="Notifications">
              <Bell className="h-5 w-5 text-muted-foreground" />
              {(alertsData?.unread ?? 0) > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                  {alertsData?.unread}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="border-b border-border px-4 py-3 text-sm font-semibold">
              Notifications
            </div>
            <div className="max-h-72 overflow-auto p-2">
              {(alertsData?.alerts ?? []).slice(0, 4).map((a) => (
                <Link
                  to="/alerts"
                  key={a.id}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg p-2 hover:bg-muted"
                >
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{timeAgo(a.created_at)}</p>
                </Link>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 rounded-lg px-2 py-1 hover:bg-muted">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-sm font-semibold text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-sm font-semibold leading-tight">{profile?.full_name}</p>
                <p className="text-xs text-muted-foreground leading-tight">{profile?.job_title}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={signOut}>
              <LogOut className="h-4 w-4" /> Sign out
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { navigate({ to: "/settings" }); }}>
              <RefreshCw className="h-4 w-4" /> Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
