"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Building2,
  Shield,
  Palette,
  Bell,
  Lock,
  Plug,
  CreditCard,
  Database,
  Settings,
  Save,
  Trash2,
  Upload,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import TaxDisclaimer from "@/components/TaxDisclaimer";
import ThemeToggle from "@/components/ThemeToggle";
import MobileBlocker from "@/components/MobileBlocker";

const SETTINGS_SECTIONS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "business", label: "Business", icon: Building2 },
  { id: "tax", label: "Tax & GST", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Lock },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "data", label: "Data & Privacy", icon: Database },
  { id: "preferences", label: "Preferences", icon: Settings },
];

interface ProfileData {
  full_name: string;
  display_name?: string;
  phone?: string;
  bio?: string;
  company_name?: string;
  designation?: string;
  website?: string;
  city?: string;
  state?: string;
  country?: string;
  timezone?: string;
  currency?: string;
  user_type: string;
  gst_registered: boolean;
  tax_regime: string;
  tax_method: string;
  monthly_expense_estimate: string;
  gst_number: string;
  pan_number?: string;
  company_address: string;
  business_email?: string;
  business_phone?: string;
  profile_image_url?: string;
  business_logo_url?: string;
}

export default function SettingsPage() {
  const supabase = createClient();

  const [activeSection, setActiveSection] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  // Profile states
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    display_name: "",
    phone: "",
    bio: "",
    company_name: "",
    designation: "",
    website: "",
    city: "",
    state: "",
    country: "India",
    timezone: "Asia/Kolkata",
    currency: "INR",
    user_type: "freelancer",
    gst_registered: false,
    tax_regime: "new",
    tax_method: "normal",
    monthly_expense_estimate: "20000",
    gst_number: "",
    pan_number: "",
    company_address: "",
    business_email: "",
    business_phone: "",
  });

  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [businessLogo, setBusinessLogo] = useState<string | null>(null);

  // Additional UI states
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Mock states for advanced sections
  const [notificationsEnabled, setNotificationsEnabled] = useState({
    email: true,
    sms: false,
    push: true,
    invoice: true,
    expense: true,
    investment: true,
    tax: true,
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [currentPlan] = useState("Pro");

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    async function loadProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (data) {
          setProfile({
            full_name: data.full_name || "",
            display_name: data.display_name || "",
            phone: data.phone || "",
            bio: data.bio || "",
            company_name: data.company_name || "",
            designation: data.designation || "",
            website: data.website || "",
            city: data.city || "",
            state: data.state || "",
            country: data.country || "India",
            timezone: data.timezone || "Asia/Kolkata",
            currency: data.currency || "INR",
            user_type: data.user_type || "freelancer",
            gst_registered: data.gst_registered || false,
            tax_regime: data.tax_regime || "new",
            tax_method: data.tax_method || "normal",
            monthly_expense_estimate: String(
              data.monthly_expense_estimate || 20000,
            ),
            gst_number: data.gst_number || "",
            pan_number: data.pan_number || "",
            company_address: data.company_address || "",
            business_email: data.business_email || user.email || "",
            business_phone: data.business_phone || "",
            profile_image_url: data.profile_image_url || null,
            business_logo_url: data.business_logo_url || null,
          });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleProfileChange = (field: keyof ProfileData, value: any) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setUnsavedChanges(true);
  };

  async function handleSave(e?: React.FormEvent) {
    if (e) e.preventDefault();

    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      let profileImageUrl = null;
      let businessLogoUrl = null;

      // Upload Profile Picture
      if (profilePic && profilePic.startsWith("blob:")) {
        const file = await fetch(profilePic).then((res) => res.blob());
        const fileExt = "png"; // or extract from original file
        const fileName = `profile-${user.id}-${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("profile-images")
          .upload(fileName, file, { upsert: true });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("profile-images").getPublicUrl(fileName);

        profileImageUrl = publicUrl;
      }

      // Upload Business Logo
      if (businessLogo && businessLogo.startsWith("blob:")) {
        const file = await fetch(businessLogo).then((res) => res.blob());
        const fileName = `logo-${user.id}-${Date.now()}.png`;

        const { error: uploadError } = await supabase.storage
          .from("business-logos")
          .upload(fileName, file, { upsert: true });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("business-logos").getPublicUrl(fileName);

        businessLogoUrl = publicUrl;
      }

      // Save to profiles table
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: profile.full_name,
        display_name: profile.display_name,
        phone: profile.phone,
        bio: profile.bio,
        company_name: profile.company_name,
        designation: profile.designation,
        website: profile.website,
        city: profile.city,
        state: profile.state,
        country: profile.country,
        timezone: profile.timezone,
        currency: profile.currency,
        user_type: profile.user_type,
        gst_registered: profile.gst_registered,
        tax_regime: profile.tax_regime,
        tax_method: profile.tax_method,
        monthly_expense_estimate: Number(profile.monthly_expense_estimate),
        gst_number: profile.gst_number,
        pan_number: profile.pan_number,
        company_address: profile.company_address,
        business_email: profile.business_email,
        business_phone: profile.business_phone,
        profile_image_url: profileImageUrl || undefined, // only update if new upload
        business_logo_url: businessLogoUrl || undefined,
        updated_at: new Date().toISOString(),
        notifications: notificationsEnabled,
        dark_mode: "system", // or make it dynamic if you add toggle
      });

      if (error) throw error;

      setUnsavedChanges(false);
      setSaved(true);
      setShowSuccess(true);

      setTimeout(() => setShowSuccess(false), 2500);
      setTimeout(() => setSaved(false), 2000);
    } catch (error: any) {
      console.error("Error saving settings:", error);
      alert(`Failed to save settings: ${error.message || "Please try again."}`);
    } finally {
      setSaving(false);
    }
  }

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      // 2MB limit
      alert("Image size must be less than 2MB");
      return;
    }

    const url = URL.createObjectURL(file);
    setProfilePic(url);
    setUnsavedChanges(true);
  };

  const handleBusinessLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Logo size must be less than 2MB");
      return;
    }

    const url = URL.createObjectURL(file);
    setBusinessLogo(url);
    setUnsavedChanges(true);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") return;

    // Existing delete logic preserved
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch("/api/delete-account", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!response.ok) throw new Error("Failed to delete");

      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (error) {
      console.error(error);
      alert("Failed to delete account.");
    }
  };

  if (isMobile === null) return null;
  if (isMobile) return <MobileBlocker />;

  if (loading) {
    return (
      <div className="ml-64 min-h-screen bg-gray-50 dark:bg-zinc-950 p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const profileCompletion = Math.min(
    Math.floor(
      [
        profile.full_name,
        profile.display_name,
        profile.phone,
        profile.bio,
        profile.company_name,
        profile.designation,
        profile.website,
        profile.city,
        profile.state,
        profile.gst_number,
        profile.pan_number,
        profile.business_email,
        profile.business_phone,
        profile.profile_image_url || profilePic,
        profile.business_logo_url || businessLogo,
      ].filter(Boolean).length * 7.7, // ~13 important fields = 100%
    ),
    100,
  );

  return (
    <div className="ml-64 min-h-screen bg-gray-50 dark:bg-zinc-950 p-8">
      <div className="max-w-7xl mx-auto">
        {" "}
        {/* Increased width + better spacing */}
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account and preferences
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleSave}
              disabled={saving || !unsavedChanges}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
        <div className="flex gap-8">
          {/* Sidebar Navigation - Fixed width */}
          <Card className="w-72 h-fit sticky top-8 self-start flex-shrink-0">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Settings className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Account Settings</p>
                  <p className="text-xs text-muted-foreground">FinWise</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-2">
              <nav className="space-y-1">
                {SETTINGS_SECTIONS.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "hover:bg-gray-100 dark:hover:bg-zinc-800 text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {section.label}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>

          {/* Main Content - Full remaining width */}
          <div className="flex-1 space-y-8 min-w-0">
            <AnimatePresence mode="wait">
              {/* PROFILE SECTION */}
              {activeSection === "profile" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>
                        Update your personal details and profile picture
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      {/* Profile Completion */}
                      <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-2xl">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-2">
                            <span>Profile Completion</span>
                            <span className="font-semibold">
                              {profileCompletion}%
                            </span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 transition-all"
                              style={{ width: `${profileCompletion}%` }}
                            />
                          </div>
                        </div>
                        {profileCompletion < 80 && (
                          <Badge variant="secondary">
                            Complete your profile
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-start gap-6">
                        <div className="relative">
                          <div className="w-28 h-28 rounded-2xl overflow-hidden border border-border bg-muted">
                            {profilePic ? (
                              <Image
                                src={profilePic}
                                alt="Profile"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-muted-foreground">
                                {profile.full_name?.charAt(0) || "U"}
                              </div>
                            )}
                          </div>
                          <label className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition">
                            <Upload className="h-4 w-4" />
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleProfilePicChange}
                            />
                          </label>
                        </div>

                        <div className="flex-1 space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium mb-1.5 block">
                                Full Name
                              </label>
                              <Input
                                value={profile.full_name}
                                onChange={(e) =>
                                  handleProfileChange(
                                    "full_name",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-1.5 block">
                                Display Name
                              </label>
                              <Input
                                value={profile.display_name}
                                onChange={(e) =>
                                  handleProfileChange(
                                    "display_name",
                                    e.target.value,
                                  )
                                }
                                placeholder="How others see you"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium mb-1.5 block">
                                Email
                              </label>
                              <Input value="user@example.com" disabled />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-1.5 block">
                                Phone
                              </label>
                              <Input
                                value={profile.phone}
                                onChange={(e) =>
                                  handleProfileChange("phone", e.target.value)
                                }
                                placeholder="+91 98765 43210"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-1.5 block">
                              Bio
                            </label>
                            <textarea
                              className="w-full min-h-24 px-4 py-3 rounded-xl border border-input bg-background resize-y"
                              value={profile.bio}
                              onChange={(e) =>
                                handleProfileChange("bio", e.target.value)
                              }
                              placeholder="Tell us about yourself..."
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Danger Zone - Now only in Profile */}
                  <Card className="mt-8 border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20">
                    <CardHeader>
                      <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Danger Zone
                      </CardTitle>
                      <CardDescription>
                        Irreversible actions. Proceed with caution.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <button
                        onClick={() => setDeleteModalOpen(true)}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-medium flex items-center gap-2 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Account
                      </button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* BUSINESS SECTION */}
              {activeSection === "business" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Business Details</CardTitle>
                      <CardDescription>
                        Information used for invoices and official documents
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex gap-6">
                        <div>
                          <label className="text-sm font-medium mb-1.5 block">
                            Business Logo
                          </label>
                          <div className="w-28 h-28 border-2 border-dashed border-border rounded-2xl flex items-center justify-center relative overflow-hidden">
                            {businessLogo ? (
                              <Image
                                src={businessLogo}
                                alt="Logo"
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <Building2 className="h-10 w-10 text-muted-foreground" />
                            )}
                            <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 hover:opacity-100 transition cursor-pointer">
                              <Upload className="h-5 w-5 text-white" />
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleBusinessLogoChange}
                              />
                            </label>
                          </div>
                        </div>

                        <div className="flex-1 grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium mb-1.5 block">
                              Business Name
                            </label>
                            <Input
                              value={profile.company_name}
                              onChange={(e) =>
                                handleProfileChange(
                                  "company_name",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-1.5 block">
                              Designation
                            </label>
                            <Input
                              value={profile.designation}
                              onChange={(e) =>
                                handleProfileChange(
                                  "designation",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-1.5 block">
                              Website
                            </label>
                            <Input
                              value={profile.website}
                              onChange={(e) =>
                                handleProfileChange("website", e.target.value)
                              }
                              placeholder="https://"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-1.5 block">
                              PAN Number
                            </label>
                            <Input
                              value={profile.pan_number}
                              onChange={(e) =>
                                handleProfileChange(
                                  "pan_number",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-1.5 block">
                          Business Address
                        </label>
                        <textarea
                          className="w-full h-28 px-4 py-3 rounded-xl border border-input"
                          value={profile.company_address}
                          onChange={(e) =>
                            handleProfileChange(
                              "company_address",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* TAX & GST SECTION */}
              {activeSection === "tax" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Tax &amp; GST Preferences</CardTitle>
                      <CardDescription>
                        Configure your tax settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      <div>
                        <label className="text-sm font-medium mb-3 block">
                          User Type
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {["freelancer", "business"].map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() =>
                                handleProfileChange("user_type", type)
                              }
                              className={cn(
                                "border rounded-2xl px-6 py-4 text-left transition-all",
                                profile.user_type === type
                                  ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
                                  : "border-border hover:border-muted-foreground",
                              )}
                            >
                              <p className="font-medium capitalize">{type}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-3 block">
                          Tax Regime
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {["new", "old"].map((regime) => (
                            <button
                              key={regime}
                              type="button"
                              onClick={() =>
                                handleProfileChange("tax_regime", regime)
                              }
                              className={cn(
                                "border rounded-2xl px-6 py-4 text-left transition-all",
                                profile.tax_regime === regime
                                  ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
                                  : "border-border hover:border-muted-foreground",
                              )}
                            >
                              {regime === "new" ? "New Regime" : "Old Regime"}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Tax Method
                        </label>
                        <select
                          value={profile.tax_method}
                          onChange={(e) =>
                            handleProfileChange("tax_method", e.target.value)
                          }
                          className="w-full px-4 py-3 rounded-2xl border border-input bg-background"
                        >
                          <option value="normal">Normal Taxation</option>
                          <option value="44ada">
                            Section 44ADA (Professionals)
                          </option>
                          <option value="44ad">
                            Section 44AD (Businesses)
                          </option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-1.5 block">
                            GST Number
                          </label>
                          <Input
                            value={profile.gst_number}
                            onChange={(e) =>
                              handleProfileChange("gst_number", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1.5 block">
                            Estimated Monthly Expenses (₹)
                          </label>
                          <Input
                            type="number"
                            value={profile.monthly_expense_estimate}
                            onChange={(e) =>
                              handleProfileChange(
                                "monthly_expense_estimate",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-2xl">
                        <div>
                          <p className="font-medium">GST Registered</p>
                          <p className="text-sm text-muted-foreground">
                            Enable GST features
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            handleProfileChange(
                              "gst_registered",
                              !profile.gst_registered,
                            )
                          }
                          className={cn(
                            "w-12 h-6 rounded-full relative transition-all",
                            profile.gst_registered
                              ? "bg-emerald-600"
                              : "bg-gray-300 dark:bg-zinc-700",
                          )}
                        >
                          <span
                            className={cn(
                              "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-all",
                              profile.gst_registered && "translate-x-6",
                            )}
                          />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* APPEARANCE */}
              {activeSection === "appearance" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Appearance</CardTitle>
                      <CardDescription>
                        Customize how FinWise looks for you
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between py-4 border-b">
                        <div>
                          <p className="font-medium">Dark Mode</p>
                          <p className="text-sm text-muted-foreground">
                            Switch between light and dark themes
                          </p>
                        </div>
                        <ThemeToggle />
                      </div>
                      {/* Additional appearance options can be extended here */}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* NOTIFICATIONS */}
              {activeSection === "notifications" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Notifications</CardTitle>
                      <CardDescription>
                        Choose what you want to be notified about
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Object.entries(notificationsEnabled).map(
                        ([key, enabled]) => (
                          <div
                            key={key}
                            className="flex justify-between items-center py-3 border-b last:border-0"
                          >
                            <div className="capitalize">
                              {key.replace(/([A-Z])/g, " $1")}
                            </div>
                            <button
                              onClick={() =>
                                setNotificationsEnabled((prev) => ({
                                  ...prev,
                                  [key]: !enabled,
                                }))
                              }
                              className={cn(
                                "w-11 h-6 rounded-full relative",
                                enabled ? "bg-emerald-600" : "bg-gray-300",
                              )}
                            >
                              <span
                                className={cn(
                                  "absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-all",
                                  enabled && "translate-x-5",
                                )}
                              />
                            </button>
                          </div>
                        ),
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* SECURITY */}
              {activeSection === "security" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Security</CardTitle>
                      <CardDescription>
                        Keep your account secure
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex justify-between items-center p-4 border rounded-2xl">
                        <div>
                          <p>Two-Factor Authentication</p>
                          <p className="text-sm text-muted-foreground">
                            Add an extra layer of security
                          </p>
                        </div>
                        <Button
                          variant={twoFactorEnabled ? "default" : "outline"}
                          onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                        >
                          {twoFactorEnabled ? "Enabled" : "Enable"}
                        </Button>
                      </div>
                      <Button variant="destructive" className="w-full">
                        Change Password
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* INTEGRATIONS, BILLING, DATA, PREFERENCES, etc. - Similar card structures can be added */}
              {(activeSection === "integrations" ||
                activeSection === "billing" ||
                activeSection === "data" ||
                activeSection === "preferences" ||
                activeSection === "advanced") && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="capitalize">
                        {activeSection}
                      </CardTitle>
                      <CardDescription>
                        Feature coming soon or UI placeholder
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="py-20 text-center text-muted-foreground">
                        This section is ready for backend integration.
                        <br />
                        The UI is fully designed and consistent.
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-md w-full"
            >
              <h3 className="text-2xl font-semibold">Delete Account</h3>
              <p className="mt-2 text-muted-foreground">
                This action is permanent and cannot be undone.
              </p>

              <div className="mt-6">
                <label className="block text-sm mb-2">
                  Type DELETE to confirm
                </label>
                <Input
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder="DELETE"
                />
              </div>

              <div className="flex gap-3 mt-8">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setDeleteConfirm("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  disabled={deleteConfirm !== "DELETE"}
                  onClick={handleDeleteAccount}
                >
                  Delete Forever
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <div className="fixed bottom-8 right-8 z-50">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-emerald-600 text-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-xl"
            >
              <Check className="h-5 w-5" />
              Settings saved successfully
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <TaxDisclaimer />
    </div>
  );
}
