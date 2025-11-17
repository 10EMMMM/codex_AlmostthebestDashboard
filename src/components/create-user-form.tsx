"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const AVAILABLE_ROLES = ["ACCOUNT_MANAGER", "BDR", "TEAM_LEAD"] as const;
const ROLE_LABELS: Record<(typeof AVAILABLE_ROLES)[number], string> = {
  ACCOUNT_MANAGER: "Account Manager",
  BDR: "BDR",
  TEAM_LEAD: "Team Lead",
};
const ROLE_CLASSES: Record<(typeof AVAILABLE_ROLES)[number], string> = {
  ACCOUNT_MANAGER: "bg-emerald-500 text-white border border-emerald-500 hover:bg-emerald-500/90",
  BDR: "bg-amber-400 text-amber-950 border border-amber-500 hover:bg-amber-400/90",
  TEAM_LEAD: "bg-rose-500 text-white border border-rose-500 hover:bg-rose-500/90",
};
const ROLE_HOVER_CLASSES: Record<(typeof AVAILABLE_ROLES)[number], string> = {
  ACCOUNT_MANAGER: "hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50",
  BDR: "hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50",
  TEAM_LEAD: "hover:border-rose-400 hover:text-rose-600 hover:bg-rose-50",
};

export function CreateUserForm({
  onCancel,
  onCreated,
}: {
  onCancel?: () => void;
  onCreated?: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [displayName, setDisplayName] = useState("");
  const timezone = "America/New_York";
  const [cityIds, setCityIds] = useState<string[]>([]);
  const [cityQuery, setCityQuery] = useState("");
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();
  const { supabase } = useAuth();

  useEffect(() => {
    if (!supabase) return;
    const loadCities = async () => {
      const { data, error } = await supabase.from("cities").select("id,name").order("name");
      if (!error && data) setCities(data as { id: string; name: string }[]);
    };
    loadCities();
  }, [supabase]);

  const filteredCities = useMemo(() => {
    const q = cityQuery.toLowerCase();
    return cities.filter((city) => city.name.toLowerCase().includes(q));
  }, [cities, cityQuery]);

  const cityLookup = useMemo(() => {
    const map: Record<string, string> = {};
    cities.forEach((city) => {
      map[city.id] = city.name;
    });
    return map;
  }, [cities]);

  const isAccountManager = roles.includes("ACCOUNT_MANAGER");

  const toggleRole = (role: string) => {
    setRoles((prev) => {
      const next = prev.includes(role)
        ? prev.filter((item) => item !== role)
        : [...prev, role];
      if (!next.includes("ACCOUNT_MANAGER")) {
        setCityIds([]);
        setCityQuery("");
      }
      return next;
    });
  };

  const handleGeneratePassword = () => {
    const randomPassword = Math.random().toString(36).slice(-12);
    setPassword(randomPassword);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (isAccountManager && !cityIds.length) {
        toast({
          title: "City required",
          description: "Assign at least one city when creating an Account Manager.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase!.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to create a user.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const response = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          email,
          password,
          roles,
          display_name: displayName,
          timezone,
          city_ids: cityIds,
        }),
      });

      const data = await response.json().catch(() => null);
      setLoading(false);

      if (!response.ok) {
        toast({
          title: "Error",
          description: data?.error || "Failed to create user.",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Success", description: "User created successfully.", variant: "success" });
      setEmail("");
      setPassword("");
      setRoles([]);
      setDisplayName("");
      setCityIds([]);
      setCityQuery("");
      onCreated?.();
      onCancel?.();
    } catch (error: any) {
      setLoading(false);
      toast({
        title: "Error",
        description: error?.message || "Unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <form className="space-y-4 text-sm" onSubmit={handleSubmit}>
      <div className="grid gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            placeholder="Jane Doe"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter a secure password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <Button type="button" variant="outline" onClick={handleGeneratePassword} className="mt-2">
            Generate password
          </Button>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Roles</Label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_ROLES.map((role) => {
              const selected = roles.includes(role);
              return (
                <Button
                  key={role}
                  type="button"
                  size="xs"
                  variant="ghost"
                  className={`px-2 py-1 text-xs ${
                    selected
                      ? ROLE_CLASSES[role]
                      : `border border-border text-muted-foreground ${ROLE_HOVER_CLASSES[role]}`
                  }`}
                  onClick={() => toggleRole(role)}
                >
                  {ROLE_LABELS[role]}
                </Button>
              );
            })}
          </div>
        </div>
        {isAccountManager && (
          <div className="space-y-1.5">
            <Label>Assigned City</Label>
            <div className="rounded-lg border border-border/70 bg-background px-2 py-1">
              <Command>
                <CommandInput
                  placeholder="Search cities..."
                  value={cityQuery}
                  onValueChange={(value) => setCityQuery(value)}
                  className="w-full placeholder:text-muted-foreground"
                />
                {cityQuery ? (
                  <CommandList>
                    {!filteredCities.length && <CommandEmpty>No cities found.</CommandEmpty>}
                    <CommandGroup>
                      {filteredCities.map((city) => (
                        <CommandItem
                          key={city.id}
                          onSelect={() => {
                                if (!cityIds.includes(city.id)) {
                                  setCityIds((prev) => [...prev, city.id]);
                                }
                                setCityQuery("");
                          }}
                        >
                          {city.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                ) : (
                  <p className="px-2 py-1 text-xs text-muted-foreground">
                    Start typing to search cities.
                  </p>
                )}
              </Command>
            </div>
            {cityIds.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {cityIds.map((city) => (
                  <span
                    key={city}
                    className="inline-flex items-center gap-2 rounded-full bg-white/10 px-2 py-1 text-xs font-semibold"
                  >
                    {cityLookup[city] ?? city}
                    <button
                      type="button"
                      onClick={() =>
                        setCityIds((prev) => prev.filter((entry) => entry !== city))
                      }
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex justify-between gap-2 pt-6">
        <Button size="sm" variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" type="submit" disabled={loading}>
          {loading ? "Creating..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
