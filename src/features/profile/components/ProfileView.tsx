"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Mail,
  MapPin,
  Camera,
  Pencil,
  Check,
  Eye,
  EyeOff,
  Lock,
  ChevronDown,
  Loader2,
  AlertCircle,
  CheckCircle2,
  BadgeCheck,
} from "lucide-react";
import {
  getCountries,
  getCountryCallingCode,
} from "react-phone-number-input";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { UserProfile } from "@/features/auth/types/auth.types";
import {
  changePasswordSchema,
  profileDetailsSchema,
  type ChangePasswordFormData,
  type ProfileDetailsFormData,
} from "../schemas/profile.schema";

const COUNTRY_CODES = getCountries()
  .map((country) => {
    const code = `+${getCountryCallingCode(country)}`;
    return {
      code,
      label: `${country} (${code})`,
      country,
    };
  })
  .sort((a, b) => {
    if (a.country === "LK") return -1;
    if (b.country === "LK") return 1;
    return a.country.localeCompare(b.country);
  });

interface ProfileViewProps {
  user: UserProfile;
}

export function ProfileView({ user }: ProfileViewProps) {
  const router = useRouter();

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status notifications
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState("");
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(
    user.profilePictureUrl || null
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle profile picture selection
  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate format
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setPhotoError("Only JPEG, PNG, and WebP images are allowed.");
      event.target.value = "";
      return;
    }

    // Validate size (<= 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError("Image size must not exceed 2MB.");
      event.target.value = "";
      return;
    }

    setPhotoError("");
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // Profile Details Form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    setValue: setProfileValue,
    formState: { errors: profileErrors },
  } = useForm<ProfileDetailsFormData>({
    resolver: zodResolver(profileDetailsSchema),
    defaultValues: {
      firstName: user.firstName || "Olivia",
      lastName: user.lastName || "Green",
      userName: user.userName || "Olivia Green",
      email: user.email || "olivia.green@example.com",
      countryCode: "+94",
      country: user.country || "LK",
      phoneNumber: user.phoneNumber || "775443467",
      address: user.address || "Galle, Sri Lanka",
    },
  });

  // Change Password Form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    watch: watchPassword,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPasswordValue = watchPassword("newPassword") || "";

  // Password criteria checks matching the UI image
  const hasMinLength = newPasswordValue.length >= 8;
  const hasNumber = /[0-9]/.test(newPasswordValue);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPasswordValue);

  // Handle Profile Update
  const onProfileSubmit = async (data: ProfileDetailsFormData) => {
    setProfileLoading(true);
    setProfileError("");
    setProfileSuccess("");

    try {
      let response: Response;

      // Check if a new picture was selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append("firstName", (data.firstName || "").trim());
        formData.append("lastName", (data.lastName || "").trim());
        formData.append("userName", (data.userName || "").trim());
        formData.append("email", (data.email || "").trim());
        formData.append("countryCode", data.countryCode);
        if (data.country) formData.append("country", data.country);
        if (data.phoneNumber) formData.append("phoneNumber", data.phoneNumber.trim());
        if (data.address) formData.append("address", data.address.trim());

        // Append binary file
        formData.append("profilePicture", selectedFile, selectedFile.name);

        response = await fetch("/api/user/profile", {
          method: "PUT",
          // IMPORTANT: Do NOT specify Content-Type header here.
          // The browser will automatically set 'multipart/form-data; boundary=...'
          body: formData,
        });
      } else {
        // Standard JSON update if no photo was selected
        response = await fetch("/api/user/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(result.errorMessage || "Failed to update profile.");
      }

      // 1. Update the avatar to the server-returned URL
      if (result.user?.profilePictureUrl) {
        setCurrentAvatarUrl(result.user.profilePictureUrl);
      }

      // 2. Revoke blob preview and clear file state
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // 3. Show success notification and sync server components
      setProfileSuccess(result.message || "Profile updated successfully!");
      router.refresh();
      setTimeout(() => setProfileSuccess(""), 4000);
    } catch (err) {
      setProfileError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle Change Password
  const onPasswordSubmit = async (data: ChangePasswordFormData) => {
    setPasswordLoading(true);
    setPasswordError("");
    setPasswordSuccess("");

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(
          result.errorMessage ||
          result.message ||
          "Unable to change password. Please verify current password."
        );
      }

      // setPasswordSuccess(
      //   result.message || "Password updated successfully! Redirecting to login..."
      // );
      // resetPasswordForm();

      // Logout and redirect to login page prompting the user to login again
      setTimeout(async () => {
        try {
          await fetch("/api/auth/logout", { method: "POST" });
        } catch {
          // Continue to login even if logout request fails
        }
        router.push("/login?reset=true");
        router.refresh();
      }, 1500);
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const displayName =
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    user.userName ||
    "Olivia Green";

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed p-4 sm:p-6"
      style={{
        backgroundImage: "url('/Images/bg.png')",
      }}
    >
      <div className="space-y-6">
        {/* ── Top Cover and Avatar Header Banner ── */}
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-xs border border-gray-100">
          {/* Cover Landscape Image */}
          <div className="relative h-44 sm:h-56 w-full overflow-hidden bg-emerald-100">
            <Image
              src="/Images/bg.png"
              alt="Farm Landscape"
              fill
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

            {/* Edit Cover Button */}
            <button
              type="button"
              aria-label="Edit cover photo"
              className="absolute top-4 right-4 sm:bottom-4 sm:top-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md backdrop-blur-xs transition hover:bg-white"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>

          {/* Profile Card Header Info */}
          <div className="relative px-6 pb-6 pt-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 -mt-16 sm:-mt-14 mb-2">
              {/* Avatar with Camera badge */}
              <div className="relative">
                <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
                  <Image
                    src={
                      previewUrl ||
                      currentAvatarUrl ||
                      "/Images/bg.png"
                    }
                    alt={displayName}
                    fill
                    className="object-cover"
                    unoptimized={!!previewUrl || !!currentAvatarUrl?.startsWith("http")}
                  />
                </div>
                <button
                  type="button"
                  aria-label="Upload profile picture"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={profileLoading}
                  className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white border border-gray-200 text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
                >
                  <Camera className="h-4 w-4" />
                </button>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handlePhotoChange}
                />

                {photoError && (
                  <p className="absolute top-full left-0 mt-2 w-48 text-xs text-red-500">
                    {photoError}
                  </p>
                )}
              </div>

              {/* User Meta Information */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#004C4B]">
                    {displayName}
                  </h2>
                </div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {user.role || "Farmer"}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                    {user.address || "Galle, Sri Lanka"}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">
                    {user.email || "olivia.green@example.com"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Two Column Forms: Personal Details & Account Security ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* ── LEFT: Personal Details ── */}
          <div className="rounded-2xl bg-white p-6 sm:p-7 shadow-xs border border-gray-100">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-[#004C4B]">Personal Details</h3>
            </div>

            {/* Profile Success / Error */}
            {profileSuccess && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs sm:text-sm text-emerald-800">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs sm:text-sm text-red-800">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-4">
              {/* First Name & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">
                    First Name
                  </label>
                  <Input
                    type="text"
                    placeholder="First name"
                    startIcon={<User className="h-4 w-4 text-gray-400" />}
                    error={!!profileErrors.firstName}
                    disabled={profileLoading}
                    {...registerProfile("firstName")}
                  />
                  {profileErrors.firstName && (
                    <p className="text-xs text-red-500">
                      {profileErrors.firstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">
                    Last Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Last name"
                    startIcon={<User className="h-4 w-4 text-gray-400" />}
                    error={!!profileErrors.lastName}
                    disabled={profileLoading}
                    {...registerProfile("lastName")}
                  />
                  {profileErrors.lastName && (
                    <p className="text-xs text-red-500">
                      {profileErrors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* User Name */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">
                  User name
                </label>
                <Input
                  type="text"
                  placeholder="User name"
                  startIcon={<User className="h-4 w-4 text-gray-400" />}
                  error={!!profileErrors.userName}
                  disabled={profileLoading}
                  {...registerProfile("userName")}
                />
                {profileErrors.userName && (
                  <p className="text-xs text-red-500">
                    {profileErrors.userName.message}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="Email address"
                  startIcon={<Mail className="h-4 w-4 text-gray-400" />}
                  endIcon={<BadgeCheck className="h-5 w-5 text-[#004C4B]" />}
                  error={!!profileErrors.email}
                  disabled={profileLoading}
                  {...registerProfile("email")}
                />
                {profileErrors.email && (
                  <p className="text-xs text-red-500">
                    {profileErrors.email.message}
                  </p>
                )}
              </div>

              {/* Phone Number with country dropdown */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <div className="relative w-28 shrink-0">
                    <select
                      className="h-12 w-full appearance-none rounded-xl border border-[var(--input-border)] bg-[var(--input-fill)] px-3 py-2 text-sm font-medium text-gray-700 outline-none transition focus:border-[#004C4B] focus:ring-1 focus:ring-[#004C4B]"
                      disabled={profileLoading}
                      {...registerProfile("countryCode", {
                        onChange: (e) => {
                          const match = COUNTRY_CODES.find(
                            (c) => c.code === e.target.value
                          );
                          if (match) {
                            setProfileValue("country", match.country);
                          }
                        },
                      })}
                    >
                      {COUNTRY_CODES.map((item) => (
                        <option key={item.country} value={item.code}>
                          {item.code} ({item.country})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-4 h-4 w-4 text-gray-400" />
                  </div>

                  <div className="flex-1">
                    <Input
                      type="tel"
                      placeholder="775443467"
                      error={!!profileErrors.phoneNumber}
                      disabled={profileLoading}
                      {...registerProfile("phoneNumber")}
                    />
                  </div>
                </div>
                {profileErrors.phoneNumber && (
                  <p className="text-xs text-red-500">
                    {profileErrors.phoneNumber.message}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">
                  Your Address (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="Galle, Sri Lanka"
                  startIcon={<MapPin className="h-4 w-4 text-gray-400" />}
                  error={!!profileErrors.address}
                  disabled={profileLoading}
                  {...registerProfile("address")}
                />
                {profileErrors.address && (
                  <p className="text-xs text-red-500">
                    {profileErrors.address.message}
                  </p>
                )}
              </div>

              {/* Update Profile Button */}
              <div className="pt-3">
                <Button
                  type="submit"
                  disabled={profileLoading}
                  className="w-full h-12 rounded-xl bg-[#004C4B] hover:bg-[#003837] text-white font-medium shadow-none transition"
                >
                  {profileLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating Profile...
                    </span>
                  ) : (
                    "Update Profile"
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* ── RIGHT: Account Security (Change Password) ── */}
          <div className="rounded-2xl bg-white p-6 sm:p-7 shadow-xs border border-gray-100">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-[#004C4B]">Account Security</h3>
            </div>

            {/* Password Success / Error */}
            {passwordSuccess && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs sm:text-sm text-emerald-800">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs sm:text-sm text-red-800">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4">
              {/* Current Password */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">
                  Current Password
                </label>
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Enter current password"
                  startIcon={<Lock className="h-4 w-4 text-gray-400" />}
                  endIcon={
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  }
                  error={!!passwordErrors.currentPassword}
                  disabled={passwordLoading}
                  autoComplete="current-password"
                  {...registerPassword("currentPassword")}
                />
                {passwordErrors.currentPassword && (
                  <p className="text-xs text-red-500">
                    {passwordErrors.currentPassword.message}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">
                  New Password
                </label>
                <Input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  startIcon={<Lock className="h-4 w-4 text-gray-400" />}
                  endIcon={
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  }
                  error={!!passwordErrors.newPassword}
                  disabled={passwordLoading}
                  autoComplete="new-password"
                  {...registerPassword("newPassword")}
                />
                {passwordErrors.newPassword && (
                  <p className="text-xs text-red-500">
                    {passwordErrors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Password Criteria checklist from the design */}
              <div className="space-y-2 py-1 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <Check
                    className={`h-3.5 w-3.5 transition-colors ${hasMinLength ? "text-emerald-600 font-bold" : "text-gray-400"
                      }`}
                  />
                  <span className={hasMinLength ? "text-emerald-700 font-medium" : ""}>
                    At least 8 Characters.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Check
                    className={`h-3.5 w-3.5 transition-colors ${hasNumber ? "text-emerald-600 font-bold" : "text-gray-400"
                      }`}
                  />
                  <span className={hasNumber ? "text-emerald-700 font-medium" : ""}>
                    Include at least one number.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Check
                    className={`h-3.5 w-3.5 transition-colors ${hasSpecial ? "text-emerald-600 font-bold" : "text-gray-400"
                      }`}
                  />
                  <span className={hasSpecial ? "text-emerald-700 font-medium" : ""}>
                    Include special character.
                  </span>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">
                  Confirm New Password
                </label>
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  startIcon={<Lock className="h-4 w-4 text-gray-400" />}
                  endIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  }
                  error={!!passwordErrors.confirmPassword}
                  disabled={passwordLoading}
                  autoComplete="new-password"
                  {...registerPassword("confirmPassword")}
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-xs text-red-500">
                    {passwordErrors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Update Password Button */}
              <div className="pt-3">
                <Button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full h-12 rounded-xl bg-[#004C4B] hover:bg-[#003837] text-white font-medium shadow-none transition"
                >
                  {passwordLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating Password...
                    </span>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

