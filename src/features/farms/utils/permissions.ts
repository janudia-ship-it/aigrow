import type { UserProfile } from "@/features/auth/types/auth.types";
import type { FarmMemberPermissions } from "../types/member.types";


/**
 * Determines whether the user has permission to edit farm properties.
 * Rule:
 * 1. If user.role === 'admin' or 'superadmin' -> Returns true (bypasses farmMemberPermissions).
 * 2. Otherwise -> Checks if farm permission === 'Manage'.
 */
export function canEditFarmProperties(
    user?: UserProfile | null,
    permissions?: FarmMemberPermissions | null
): boolean {
    if (!user) return false;

    const role = user.role?.toLowerCase();
    if (role === "admin" || role === "superadmin") {
        return true;
    }

    return permissions?.farm?.toLowerCase() === "manage";
}

export function canEditDeviceName(
    user?: UserProfile | null,
    permissions?: FarmMemberPermissions | null
): boolean {
    if (!user) return false;
    const role = user.role?.toLowerCase()?.trim();
    if (
        role === "admin" ||
        role === "superadmin" ||
        role === "super admin"
    ) {
        return true;
    }
    return permissions?.device?.toLowerCase() === "manage";
}

export const canRenameSensor = canEditDeviceName;

/**
 * Alias for canEditFarmProperties — determines whether a user can manage a farm
 * (add zones, add members, etc.).
 * Rule: admin | superadmin role → true; else permissions.farm === "Manage" → true.
 */
export const canManageFarm = canEditFarmProperties;


/**
 * Determines whether the user has permission to add devices.
 * Rule: Only Admin or SuperAdmin role.
 */
export function canAddDevices(user?: UserProfile | null): boolean {
    if (!user) return false;
    const role = user.role?.toLowerCase();
    return role === "admin" || role === "superadmin";
}

/**
 * Determines whether the user has permission to update, move, or delete devices.
 * Rule: Only Admin or SuperAdmin role.
 */
export function canUpdateDevice(user?: UserProfile | null): boolean {
    if (!user) return false;
    const role = user.role?.toLowerCase()?.trim();
    return (
        role === "admin" ||
        role === "superadmin" ||
        role === "super admin" ||
        role === "administrator"
    );
}

export const canMoveDevice = canUpdateDevice;
export const canDeleteDevice = canUpdateDevice;
export const canRenameDevice = canEditDeviceName;

export function canRenameActuator(
    user?: UserProfile | null,
    permissions?: FarmMemberPermissions | null
): boolean {
    if (!user) return false;
    const role = user.role?.toLowerCase()?.trim();
    if (
        role === "admin" ||
        role === "superadmin" ||
        role === "super admin" ||
        role === "device manager" ||
        role === "devicemanager"
    ) {
        return true;
    }
    return permissions?.device?.toLowerCase() === "manage";
}



