import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { CAMPUS_OPTIONS } from "@/lib/campusOptions";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, Loader2, Pencil } from "lucide-react";

const BANK_OPTIONS = [
  "Access Bank",
  "Citibank",
  "Ecobank",
  "Fidelity Bank",
  "First Bank",
  "FCMB",
  "Globus Bank",
  "GTBank",
  "Heritage Bank",
  "Keystone Bank",
  "Kuda",
  "Moniepoint",
  "Opay",
  "Polaris Bank",
  "Providus Bank",
  "Stanbic IBTC",
  "Sterling Bank",
  "UBA",
  "Union Bank",
  "Unity Bank",
  "Wema Bank",
  "Zenith Bank",
  "Other",
];

function splitFullName(fullName?: string | null) {
  const cleaned = (fullName || "").trim();
  if (!cleaned) return { firstName: "", lastName: "" };

  const parts = cleaned.split(/\s+/);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
}

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [campus, setCampus] = useState("");

  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSavingPersonal, setIsSavingPersonal] = useState(false);
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const [personalSaved, setPersonalSaved] = useState(true);
  const [bankSaved, setBankSaved] = useState(true);

  useEffect(() => {
    if (!user || !profile) return;

    const metadata = (user.user_metadata || {}) as Record<string, string | undefined>;
    const nameParts = splitFullName(profile.full_name);

    setFirstName((metadata.first_name || nameParts.firstName || "") as string);
    setLastName((metadata.last_name || nameParts.lastName || "") as string);
    setEmailAddress(user.email || "");
    setPhoneNumber((metadata.phone || "") as string);
    setCampus(profile.school || "");

    setBankName((metadata.bank_name || "") as string);
    setAccountNumber((metadata.account_number || "") as string);
    setAccountName((metadata.account_name || "") as string);

    setPersonalSaved(true);
    setBankSaved(true);
    setIsEditingPersonal(false);
    setIsEditingBank(false);
  }, [user?.id, user?.email, user?.user_metadata, profile?.id, profile?.full_name, profile?.school]);

  const fullName = useMemo(() => [firstName, lastName].filter(Boolean).join(" ").trim(), [firstName, lastName]);

  const resetPersonal = () => {
    if (!user || !profile) return;
    const metadata = (user.user_metadata || {}) as Record<string, string | undefined>;
    const nameParts = splitFullName(profile.full_name);

    setFirstName((metadata.first_name || nameParts.firstName || "") as string);
    setLastName((metadata.last_name || nameParts.lastName || "") as string);
    setEmailAddress(user.email || "");
    setPhoneNumber((metadata.phone || "") as string);
    setCampus(profile.school || "");
    setPersonalSaved(true);
    setIsEditingPersonal(false);
  };

  const resetBank = () => {
    if (!user) return;
    const metadata = (user.user_metadata || {}) as Record<string, string | undefined>;
    setBankName((metadata.bank_name || "") as string);
    setAccountNumber((metadata.account_number || "") as string);
    setAccountName((metadata.account_name || "") as string);
    setBankSaved(true);
    setIsEditingBank(false);
  };

  const markPersonalDirty = () => setPersonalSaved(false);
  const markBankDirty = () => setBankSaved(false);

  const handleSavePersonal = async () => {
    if (!user) return;
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First name and last name are required.");
      return;
    }

    setIsSavingPersonal(true);
    try {
      const metadata = (user.user_metadata || {}) as Record<string, unknown>;
      const authPayload: { email?: string; data: Record<string, unknown> } = {
        data: {
          ...metadata,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phoneNumber.trim(),
        },
      };

      if (emailAddress.trim() && emailAddress.trim() !== user.email) {
        authPayload.email = emailAddress.trim();
      }

      const { error: authError } = await supabase.auth.updateUser(authPayload);
      if (authError) throw authError;

      await updateProfile.mutateAsync({
        full_name: fullName,
        school: campus || null,
      } as any);

      setPersonalSaved(true);
      setIsEditingPersonal(false);
      toast.success("Personal information saved.");
    } catch (error: any) {
      toast.error(error.message || "Failed to save personal information.");
    } finally {
      setIsSavingPersonal(false);
    }
  };

  const handleSaveBank = async () => {
    if (!user) return;
    if (!bankName.trim() || !accountNumber.trim() || !accountName.trim()) {
      toast.error("Complete all bank account fields.");
      return;
    }

    setIsSavingBank(true);
    try {
      const metadata = (user.user_metadata || {}) as Record<string, unknown>;
      const { error } = await supabase.auth.updateUser({
        data: {
          ...metadata,
          bank_name: bankName.trim(),
          account_number: accountNumber.trim(),
          account_name: accountName.trim(),
        },
      });
      if (error) throw error;

      setBankSaved(true);
      setIsEditingBank(false);
      toast.success("Bank account details saved.");
    } catch (error: any) {
      toast.error(error.message || "Failed to save bank details.");
    } finally {
      setIsSavingBank(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword.trim()) {
      toast.error("Enter your current password.");
      return;
    }
    if (!newPassword.trim() || !confirmPassword.trim()) {
      toast.error("Complete the password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password must match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully.");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    const confirmed = window.confirm(
      "Delete your account permanently? This removes your profile, events, registrations, and cannot be undone.",
    );
    if (!confirmed) return;

    setIsDeletingAccount(true);
    try {
      const { error } = await supabase.functions.invoke("delete-account");
      if (error) throw error;

      toast.success("Account deleted successfully.");
      await signOut();
      navigate("/auth", { replace: true });
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete account.");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account, profile, and bank details.</p>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 sm:p-7 space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-display font-semibold">Personal Information</h2>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {personalSaved ? "Saved" : "Unsaved"}
            </span>
          </div>

          <Button variant="ghost" size="sm" onClick={() => setIsEditingPersonal((value) => !value)} className="rounded-full px-3">
            <Pencil className="w-4 h-4 mr-1.5" />
            {isEditingPersonal ? "Close" : "Edit"}
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>First Name</Label>
            <Input value={firstName} onChange={(e) => { setFirstName(e.target.value); markPersonalDirty(); }} disabled={!isEditingPersonal} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Last Name</Label>
            <Input value={lastName} onChange={(e) => { setLastName(e.target.value); markPersonalDirty(); }} disabled={!isEditingPersonal} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input value={emailAddress} onChange={(e) => { setEmailAddress(e.target.value); markPersonalDirty(); }} disabled={!isEditingPersonal} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input value={phoneNumber} onChange={(e) => { setPhoneNumber(e.target.value); markPersonalDirty(); }} disabled={!isEditingPersonal} className="rounded-xl" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>University / Campus</Label>
          <Select value={campus} onValueChange={(value) => { setCampus(value); markPersonalDirty(); }} disabled={!isEditingPersonal}>
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CAMPUS_OPTIONS.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isEditingPersonal && (
          <div className="flex flex-wrap gap-3 pt-1">
            <Button onClick={handleSavePersonal} disabled={isSavingPersonal} className="rounded-xl bg-black text-white hover:bg-black/90">
              {isSavingPersonal ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="outline" onClick={resetPersonal} className="rounded-xl">
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 sm:p-7 space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-display font-semibold">Bank Account (for payouts)</h2>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {bankSaved ? "Saved" : "Unsaved"}
            </span>
          </div>

          <Button variant="ghost" size="sm" onClick={() => setIsEditingBank((value) => !value)} className="rounded-full px-3">
            <Pencil className="w-4 h-4 mr-1.5" />
            {isEditingBank ? "Close" : "Edit"}
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2 sm:col-span-2">
            <Label>Bank Name</Label>
            <Select value={bankName} onValueChange={(value) => { setBankName(value); markBankDirty(); }} disabled={!isEditingBank}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select bank" />
              </SelectTrigger>
              <SelectContent>
                {BANK_OPTIONS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Account Number</Label>
            <Input value={accountNumber} onChange={(e) => { setAccountNumber(e.target.value); markBankDirty(); }} disabled={!isEditingBank} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Account Name</Label>
            <Input value={accountName} onChange={(e) => { setAccountName(e.target.value); markBankDirty(); }} disabled={!isEditingBank} className="rounded-xl" />
          </div>
        </div>

        {isEditingBank && (
          <div className="flex flex-wrap gap-3 pt-1">
            <Button onClick={handleSaveBank} disabled={isSavingBank} className="rounded-xl bg-black text-white hover:bg-black/90">
              {isSavingBank ? "Saving..." : "Save Bank Details"}
            </Button>
            <Button variant="outline" onClick={resetBank} className="rounded-xl">
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 sm:p-7 space-y-6">
        <div>
          <h2 className="text-xl font-display font-semibold">Change Password</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2 sm:col-span-2">
            <Label>Current Password</Label>
            <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Confirm Password</Label>
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="rounded-xl" />
          </div>
        </div>

        <div className="pt-1">
          <Button onClick={handleUpdatePassword} disabled={isUpdatingPassword} className="rounded-xl bg-black text-white hover:bg-black/90">
            {isUpdatingPassword ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 sm:p-7 space-y-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h2 className="text-xl font-display font-semibold text-red-700">Danger Zone</h2>
            <p className="text-sm text-red-700/80 mt-1">
              Deleting your account will permanently remove all your events and data.
            </p>
          </div>
        </div>

        <Button variant="destructive" onClick={handleDeleteAccount} className="rounded-xl" disabled={isDeletingAccount}>
          {isDeletingAccount ? "Deleting account..." : "Delete Account"}
        </Button>
      </div>
    </div>
  );
}
