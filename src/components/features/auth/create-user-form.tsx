"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, RefreshCw } from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, X } from "lucide-react";

const AVAILABLE_ROLES = ["ACCOUNT_MANAGER", "BDR", "TEAM_LEAD"] as const;
const ROLE_LABELS: Record<(typeof AVAILABLE_ROLES)[number], string> = {
  ACCOUNT_MANAGER: "Account Manager",
  BDR: "BDR",
  TEAM_LEAD: "Team Lead",
};
const ROLE_CLASSES: Record<(typeof AVAILABLE_ROLES)[number], string> = {
  ACCOUNT_MANAGER: "bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600",
  BDR: "bg-amber-400 text-amber-950 border-amber-500 hover:bg-amber-500",
  TEAM_LEAD: "bg-rose-500 text-white border-rose-500 hover:bg-rose-600",
};

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "Pacific/Honolulu",
];

type City = {
  id: string;
  name: string;
  state_code: string;
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
  const [timezone, setTimezone] = useState("America/New_York");
  const [cityIds, setCityIds] = useState<string[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [citySearchOpen, setCitySearchOpen] = useState(false);

  const { toast } = useToast();
  const { supabase } = useAuth();

  // Load cities
  useEffect(() => {
    if (!supabase) return;
    const loadCities = async () => {
      const { data, error } = await supabase
        .from("cities")
        .select("id, name, state_code")
        .eq("is_active", true)
        .order("name");
      if (!error && data) setCities(data as City[]);
    };
    loadCities();
  }, [supabase]);

  const isAccountManager = roles.includes("ACCOUNT_MANAGER");

  const toggleRole = (role: string) => {
    setRoles((prev) => {
      const next = prev.includes(role)
        ? prev.filter((item) => item !== role)
        : [...prev, role];
      // Clear cities if not Account Manager
      if (!next.includes("ACCOUNT_MANAGER")) {
        setCityIds([]);
      }
      return next;
    });
  };

  const toggleCity = (cityId: string) => {
    setCityIds((prev) =>
      prev.includes(cityId)
        ? prev.filter((id) => id !== cityId)
        : [...prev, cityId]
    );
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
    let pass = "";
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
    toast({
      title: "Password Generated",
      description: "A secure password has been generated",
    });
  };

  const validateForm = () => {
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }

    if (!password || password.length < 8) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return false;
    }

    if (roles.length === 0) {
      toast({
        title: "No Roles Selected",
        description: "Please select at least one role",
        variant: "destructive",
      });
      return false;
    }

    if (isAccountManager && cityIds.length === 0) {
      toast({
        title: "No Cities Selected",
        description: "Account Managers must have at least one city assigned",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const { data: { session } } = await supabase!.auth.getSession();

      const response = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          email,
          password,
          roles,
          display_name: displayName || email.split("@")[0],
          timezone,
          city_ids: isAccountManager ? cityIds : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create user");
      }

      toast({
        title: "User Created",
        description: `Successfully created user ${email}`,
        variant: "default",
      });

      // Reset form
      setEmail("");
      setPassword("");
      setRoles([]);
      setDisplayName("");
      setTimezone("America/New_York");
      setCityIds([]);

      onCreated?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedCities = cities.filter((city) => cityIds.includes(city.id));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
          required
        />
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password">Password *</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={generatePassword}
            className="shrink-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Display Name */}
      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="John Doe"
        />
      </div>

      {/* Timezone */}
      <div className="space-y-2">
        <Label htmlFor="timezone">Timezone</Label>
        <select
          id="timezone"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </div>

      {/* Roles */}
      <div className="space-y-2">
        <Label>Roles *</Label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_ROLES.map((role) => (
            <Button
              key={role}
              type="button"
              variant={roles.includes(role) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleRole(role)}
              className={roles.includes(role) ? ROLE_CLASSES[role] : ""}
            >
              {ROLE_LABELS[role]}
            </Button>
          ))}
        </div>
      </div>

      {/* Cities (only for Account Managers) */}
      {isAccountManager && (
        <div className="space-y-2">
          <Label>Assigned Cities *</Label>
          <Popover open={citySearchOpen} onOpenChange={setCitySearchOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                {selectedCities.length > 0
                  ? `${selectedCities.length} cities selected`
                  : "Select cities..."}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search cities..." />
                <CommandList>
                  <CommandEmpty>No cities found.</CommandEmpty>
                  <CommandGroup>
                    {cities.map((city) => (
                      <CommandItem
                        key={city.id}
                        onSelect={() => toggleCity(city.id)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <div
                            className={`flex h-4 w-4 items-center justify-center rounded border ${cityIds.includes(city.id)
                                ? "bg-primary border-primary"
                                : "border-input"
                              }`}
                          >
                            {cityIds.includes(city.id) && (
                              <Check className="h-3 w-3 text-primary-foreground" />
                            )}
                          </div>
                          <span>
                            {city.name}, {city.state_code}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Selected cities display */}
          {selectedCities.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedCities.map((city) => (
                <div
                  key={city.id}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-sm"
                >
                  <span>
                    {city.name}, {city.state_code}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleCity(city.id)}
                    className="hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create User"}
        </Button>
      </div>
    </form>
  );
}
