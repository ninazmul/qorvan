"use server";

import { connectToDatabase } from "@/lib/database";
import User, { IUser } from "@/lib/database/models/user.model";
import { requirePermission } from "@/lib/auth/rbac";
import { safeJson, handleError } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { CMS_ACTIONS, CMS_MODULES, SUPER_ADMIN_ONLY_MODULES } from "@/constants/permissions";

const SUPER_ADMIN_EMAIL = "nazmulsaw@gmail.com";

function hasAllDashboardPermissions(
  permissions: { module: string; actions: string[] }[] = [],
) {
  return CMS_MODULES.filter(
    (module) =>
      module !== "dashboard" && !SUPER_ADMIN_ONLY_MODULES.includes(module),
  ).every((module) => {
    const modulePerms = permissions.find((p) => p.module === module);
    if (!modulePerms) return false;
    return CMS_ACTIONS.every(
      (action) =>
        modulePerms.actions.includes(action) ||
        modulePerms.actions.includes("all"),
    );
  });
}

function isSuperAdminUser(user: Pick<IUser, "email" | "permissions">) {
  return (
    user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ||
    hasAllDashboardPermissions(user.permissions)
  );
}

// ===== Seeding =====

export async function seedInitialSuperAdminUser() {
  try {
    await connectToDatabase();

    console.log("=== Starting seedInitialSuperAdminUser ===");

    // Check if the user already exists
    let user = await User.findOne({ email: SUPER_ADMIN_EMAIL });
    console.log("Found user (by email):", user);

    if (!user) {
      // Create the user with a placeholder clerkId
      user = await User.create({
        clerkId: `temp_${SUPER_ADMIN_EMAIL}`, // Will be replaced when they log in via Clerk
        email: SUPER_ADMIN_EMAIL,
        name: "Nazmul Saw",
        status: "active",
        permissions: [],
      });
      console.log("✅ Created new super admin user:", user._id);
    } else {
      // Force update user to be active, no matter what
      user.status = "active";
      await user.save();
      console.log("✅ Updated user to active:", user._id);
    }

    // Verify the user was updated correctly
    user = await User.findOne({ email: SUPER_ADMIN_EMAIL });
    console.log("Final user after seed:", user);

    return { success: true, user };
  } catch (error) {
    console.error("Error in seedInitialSuperAdminUser:", error);
    handleError(error);
  }
}

// ===== Users & RBAC Assignment =====

export async function getAllUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  await requirePermission("users", "read");
  try {
    await connectToDatabase();

    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (params.search) {
      query.$or = [
        { name: new RegExp(params.search, "i") },
        { email: new RegExp(params.search, "i") },
      ];
    }

    const [users, totalCount, allUsersForSuperAdminCount] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<IUser[]>(),
      User.countDocuments(query),
      User.find({}, "email permissions").lean<IUser[]>(),
    ]);

    return {
      users: safeJson(users),
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      superAdminCount: allUsersForSuperAdminCount.filter(isSuperAdminUser)
        .length,
    };
  } catch (error) {
    handleError(error);
    return {
      users: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
      superAdminCount: 0,
    };
  }
}

export async function createPreRegisteredAdmin(params: {
  email: string;
  name: string;
}) {
  const adminAccess = await requirePermission("users", "create");
  try {
    await connectToDatabase();

    const normalizedEmail = params.email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new Error("A user with this email already exists");
    }

    // Create the user record with a temporary clerkId placeholder
    const newUser = await User.create({
      clerkId: `pre_${Date.now()}`,
      email: normalizedEmail,
      name: params.name.trim(),
      status: "active",
      permissions: [],
    });

    revalidatePath("/dashboard/users");
    return safeJson(newUser);
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function updateUserPermissions(
  userId: string,
  permissions: { module: string; actions: string[] }[],
) {
  const adminAccess = await requirePermission("users", "update");
  try {
    await connectToDatabase();

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    // Prevent modifying the super admin's permissions
    if (user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      throw new Error("Cannot modify super admin's permissions");
    }

    user.permissions = permissions;
    await user.save();

    revalidatePath("/dashboard/users");
    return safeJson(user);
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function toggleUserStatus(userId: string) {
  const adminAccess = await requirePermission("users", "update");
  try {
    await connectToDatabase();

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    // Check if we're trying to suspend the super admin
    if (user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      throw new Error("Cannot suspend the super admin");
    }

    user.status = user.status === "active" ? "suspended" : "active";
    await user.save();

    revalidatePath("/dashboard/users");
    return safeJson(user);
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function deleteUser(userId: string) {
  const adminAccess = await requirePermission("users", "delete");
  try {
    await connectToDatabase();

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const targetIsSuperAdmin = isSuperAdminUser(user);

    if (targetIsSuperAdmin) {
      const users = await User.find({}, "email permissions").lean<IUser[]>();
      const superAdminCount = users.filter(isSuperAdminUser).length;

      if (superAdminCount <= 1) {
        throw new Error("Cannot delete the last super admin");
      }
    }

    await User.findByIdAndDelete(userId);

    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (error) {
    handleError(error);
    throw error;
  }
}

// ===== Audit Logs =====

export async function getAuditLogs(params: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  return { logs: [], totalCount: 0, totalPages: 0, currentPage: 1 };
}
