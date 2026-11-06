import { NextRequest, NextResponse } from "next/server";
import { signupUser } from "@/features/auth/services/auth-api";
import type { SignupCredentials } from "@/features/auth/types/auth.types";
import { ApiError } from "@/lib/api/api-error";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let firstName = "";
    let lastName = "";
    let userName = "";
    let email = "";
    let password = "";
    let confirmPassword = "";
    let countryCode = "+94";
    let country: string | undefined;
    let phoneNumber: string | undefined;
    let address: string | undefined;
    let profilePicture: File | null = null;
    let agreeToTerms = false;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      firstName = getString(formData.get("firstName") || formData.get("FirstName")) || "";
      lastName = getString(formData.get("lastName") || formData.get("LastName")) || "";
      userName = getString(formData.get("userName") || formData.get("UserName")) || "";
      email = getString(formData.get("email") || formData.get("Email")) || "";
      password = getString(formData.get("password") || formData.get("Password")) || "";
      confirmPassword =
        getString(formData.get("confirmPassword") || formData.get("ConfirmPassword")) || password;
      countryCode =
        getString(formData.get("countryCode") || formData.get("CountryCode")) || "+94";
      country = getString(formData.get("country") || formData.get("Country")) || undefined;
      phoneNumber =
        getString(formData.get("phoneNumber") || formData.get("PhoneNumber")) || undefined;
      address = getString(formData.get("address") || formData.get("Address")) || undefined;

      const file = formData.get("profilePicture");
      if (file && typeof file === "object" && "size" in file && (file as File).size > 0) {
        profilePicture = file as File;
      }

      const agreeValue = formData.get("agreeToTerms");
      agreeToTerms =
        agreeValue === "true" ||
        agreeValue === "on" ||
        agreeValue === "1";
    } else {
      const body: unknown = await request.json();
      if (typeof body !== "object" || body === null || Array.isArray(body)) {
        return NextResponse.json(
          { success: false, errorCode: 400, message: "Invalid signup request." },
          { status: 400 }
        );
      }

      const data = body as Record<string, unknown>;
      firstName = getString(data.firstName || data.FirstName) || "";
      lastName = getString(data.lastName || data.LastName) || "";
      userName = getString(data.userName || data.UserName) || "";
      email = getString(data.email || data.Email) || "";
      password = getString(data.password || data.Password) || "";
      confirmPassword =
        getString(data.confirmPassword || data.ConfirmPassword) || password;
      countryCode = getString(data.countryCode || data.CountryCode) || "+94";
      country = getString(data.country || data.Country) || undefined;
      phoneNumber = getString(data.phoneNumber || data.PhoneNumber) || undefined;
      address = getString(data.address || data.Address) || undefined;
      agreeToTerms = data.agreeToTerms === true;
    }

    if (
      !firstName ||
      !lastName ||
      !userName ||
      !email ||
      !password ||
      !confirmPassword ||
      !countryCode ||
      !agreeToTerms
    ) {
      return NextResponse.json(
        {
          success: false,
          errorCode: 400,
          message: "Please complete all required fields and accept the terms.",
        },
        { status: 400 }
      );
    }

    const credentials: SignupCredentials = {
      firstName,
      lastName,
      userName,
      email,
      password,
      confirmPassword,
      countryCode,
      country,
      phoneNumber: phoneNumber || "",
      address,
      profilePicture,
      agreeToTerms: true,
    };

    const result = await signupUser(credentials);
    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      const status = error.status >= 400 ? error.status : 400;
      return NextResponse.json(
        {
          success: false,
          errorCode: error.errorCode,
          message: error.message,
        },
        { status }
      );
    }

    return NextResponse.json(
      {
        success: false,
        errorCode: 500,
        message: "Internal server error occurred.",
      },
      { status: 500 }
    );
  }
}

function getString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}
