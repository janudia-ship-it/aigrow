import { z } from "zod";

export const loginSchema = z.object({
  userName: z.string().min(1, { message: "usernameRequired" }).trim(),
  password: z.string().min(1, { message: "passwordRequired" }),
  rememberMe: z.boolean(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required"),

    lastName: z.string().trim().min(1, "Last name is required"),

    userName: z.string().trim().min(1, "Username is required"),

    email: z.string().trim().email("Enter a valid email address"),

    password: z
      .string()
      .min(8, "Password must contain at least 8 characters")
      .max(128, "Password cannot exceed 128 characters")
      .regex(/[A-Z]/, "At least one uppercase letter is required")
      .regex(/[a-z]/, "At least one lowercase letter is required")
      .regex(/[0-9]/, "At least one number is required"),

    confirmPassword: z.string(),

    countryCode: z.string().min(1, "Country calling code is required"),

    country: z.string().optional(),

    phoneNumber: z.string().optional(),

    address: z.string().optional(),

    profilePicture: z
      .any()
      .nullable()
      .optional(),

    agreeToTerms: z.boolean().refine(
      (value) => value === true,
      "You must accept the terms and conditions"
    ),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  )
  .refine(
    (data) =>
      !data.phoneNumber?.trim() || !!data.countryCode?.trim(),
    {
      message: "Country calling code is required when providing a phone number",
      path: ["countryCode"],
    }
  );

export type SignupFormData = z.infer<typeof signupSchema>;


export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
});

export type ForgotPasswordFormData = z.infer<
  typeof forgotPasswordSchema
>;

export const resetPasswordSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email address is required")
      .email("Please enter a valid email address"),
    code: z
      .string()
      .trim()
      .min(1, "Verification code is required"),
    newPassword: z
      .string()
      .min(8, "Password must contain at least 8 characters")
      .max(128, "Password cannot exceed 128 characters")
      .regex(/[A-Z]/, "At least one uppercase letter is required")
      .regex(/[a-z]/, "At least one lowercase letter is required")
      .regex(/[0-9]/, "At least one number is required"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;