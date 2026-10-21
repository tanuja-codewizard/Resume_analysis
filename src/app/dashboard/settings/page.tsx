"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Moon, 
  Sun, 
  Laptop, 
  Check, 
  AlertCircle, 
  Loader2, 
  LogOut,
  Save
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "next-themes";
import { getUserProfile, updateUserProfile, requestEmailChange } from "@/app/actions/settings";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { theme, setTheme } = useTheme();

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingName, setIsSavingName] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);

  const [name, setName] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [role, setRole] = useState("USER");
  const [createdAt, setCreatedAt] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showEmailChangeInput, setShowEmailChangeInput] = useState(false);

  useEffect(() => {
    let ignore = false;
    getUserProfile()
      .then((data) => {
        if (!ignore) {
          setName(data.name || "");
          setCurrentEmail(data.email || "");
          setRole(data.role || "USER");
          setCreatedAt(data.createdAt);
          setIsLoadingProfile(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : "Failed to load user profile.";
          setErrorMessage(msg);
          setIsLoadingProfile(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingName(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await updateUserProfile({ name });
      setName(res.user.name);
      setSuccessMessage("Profile updated successfully.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile.";
      setErrorMessage(msg);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleEmailChangeRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) {
      setErrorMessage("Please enter a new email address.");
      return;
    }

    setIsChangingEmail(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await requestEmailChange(newEmail);
      setSuccessMessage(res.message);
      setShowEmailChangeInput(false);
      setNewEmail("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to request email change.";
      setErrorMessage(msg);
    } finally {
      setIsChangingEmail(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Account Settings</h1>
        <p className="text-muted-foreground text-sm">
          Manage your personal profile, authenticated credentials, and workspace preferences.
        </p>
      </div>

      <Separator />

      {/* Notifications */}
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Notice</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Check className="h-4 w-4 text-emerald-500" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {isLoadingProfile ? (
        <div className="py-20 flex flex-col items-center justify-center text-muted-foreground gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Loading your profile settings...</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Profile Card */}
          <Card className="bg-card/60 backdrop-blur-md border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" /> Profile Details
                  </CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1 text-primary" />
                    Role: {role}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="max-w-md bg-background/50"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    This name will appear across your candidate dashboard and resume evaluations.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex max-w-md items-center gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="email"
                        type="email"
                        value={currentEmail}
                        disabled
                        className="bg-muted/50 cursor-not-allowed text-muted-foreground pl-8"
                      />
                      <Mail className="w-4 h-4 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowEmailChangeInput(!showEmailChangeInput)}
                      className="text-xs h-9 shrink-0"
                    >
                      {showEmailChangeInput ? "Cancel" : "Change Email"}
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Email updates require Supabase verification. Your role ({role}) is system-enforced.
                  </p>
                </div>

                <Button type="submit" disabled={isSavingName} className="mt-2">
                  {isSavingName ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Save Profile
                    </>
                  )}
                </Button>
              </form>

              {/* Sub-form: Email Change */}
              {showEmailChangeInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-4 rounded-xl border border-border bg-muted/20 max-w-md space-y-3"
                >
                  <Label htmlFor="newEmail" className="text-xs font-semibold">
                    New Email Address
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="newEmail"
                      type="email"
                      placeholder="new-email@example.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      disabled={isChangingEmail}
                      className="text-xs h-9 bg-background"
                    />
                    <Button
                      size="sm"
                      onClick={handleEmailChangeRequest}
                      disabled={isChangingEmail || !newEmail.trim()}
                      className="text-xs h-9 shrink-0"
                    >
                      {isChangingEmail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Send Link"}
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    A confirmation email will be sent to the new address to verify ownership.
                  </p>
                </motion.div>
              )}

              {createdAt && (
                <p className="text-[11px] text-muted-foreground pt-2">
                  Account member since {new Date(createdAt).toLocaleDateString()}.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Preferences Card: Theme & Appearance */}
          <Card className="bg-card/60 backdrop-blur-md border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Appearance &amp; Theme</CardTitle>
              <CardDescription>Select your preferred color theme for CareerAI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3 max-w-md">
                <Button
                  type="button"
                  variant={theme === "light" ? "default" : "outline"}
                  onClick={() => setTheme("light")}
                  className="flex flex-col items-center justify-center gap-1.5 h-20 p-2"
                >
                  <Sun className="w-5 h-5" />
                  <span className="text-xs">Light</span>
                </Button>
                <Button
                  type="button"
                  variant={theme === "dark" ? "default" : "outline"}
                  onClick={() => setTheme("dark")}
                  className="flex flex-col items-center justify-center gap-1.5 h-20 p-2"
                >
                  <Moon className="w-5 h-5" />
                  <span className="text-xs">Dark</span>
                </Button>
                <Button
                  type="button"
                  variant={theme === "system" ? "default" : "outline"}
                  onClick={() => setTheme("system")}
                  className="flex flex-col items-center justify-center gap-1.5 h-20 p-2"
                >
                  <Laptop className="w-5 h-5" />
                  <span className="text-xs">System</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="bg-card/60 backdrop-blur-md border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-destructive flex items-center gap-2">
                <LogOut className="w-4 h-4" /> Account Session
              </CardTitle>
              <CardDescription>Sign out of your active session on this device</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
