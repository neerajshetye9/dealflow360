import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { usersTable, rolesTable, userRolesTable, UserRecord } from "../models/User.model";
import { negotiationRequestsTable } from "../models/Negotiation.model";
import { env } from "../config/environment";
import { AuthenticatedUser, JwtAccessPayload, UserRole } from "../types";
import { AuditLogService } from "./AuditLogService";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  user: AuthenticatedUser;
}

export class AuthService {
  public static async registerInternalUser(
    email: string,
    passwordPlain: string,
    fullName: string,
    roleName: UserRole,
    actorId?: string,
    actorIp?: string
  ): Promise<AuthenticatedUser> {
    const existing = await usersTable().where({ email: email.toLowerCase().trim() }).first();
    if (existing) {
      throw new Error("User with this email already exists");
    }

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(passwordPlain, saltRounds);

    const [createdUser] = await usersTable()
      .insert({
        email: email.toLowerCase().trim(),
        password_hash: passwordHash,
        full_name: fullName.trim(),
        is_active: true,
      })
      .returning("*");

    let role = await rolesTable().where({ name: roleName }).first();
    if (!role) {
      const [newRole] = await rolesTable().insert({ name: roleName, description: `System role: ${roleName}` }).returning("*");
      role = newRole;
    }

    await userRolesTable().insert({
      user_id: createdUser.id,
      role_id: role.id,
    });

    await AuditLogService.recordEvent(
      actorId || createdUser.id,
      actorIp || "127.0.0.1",
      "USER",
      createdUser.id,
      "USER_REGISTERED",
      null,
      { email: createdUser.email, role: roleName }
    );

    return {
      id: createdUser.id,
      email: createdUser.email,
      fullName: createdUser.full_name,
      role: roleName,
    };
  }

  public static async loginWithEmailAndPassword(
    email: string,
    passwordPlain: string,
    actorIp?: string
  ): Promise<TokenPair> {
    const user = await usersTable().where({ email: email.toLowerCase().trim() }).first();
    if (!user || !user.is_active) {
      throw new Error("Invalid credentials or account inactive");
    }

    const isMatch = await bcrypt.compare(passwordPlain, user.password_hash);
    if (!isMatch) {
      throw new Error("Invalid credentials or account inactive");
    }

    const userRoleRecord = await userRolesTable().where({ user_id: user.id }).first();
    let userRole: UserRole = "sales_rep";
    if (userRoleRecord) {
      const role = await rolesTable().where({ id: userRoleRecord.role_id }).first();
      if (role) {
        userRole = role.name;
      }
    }

    const authUser: AuthenticatedUser = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: userRole,
    };

    const tokens = this.generateTokenPair(authUser);

    await AuditLogService.recordEvent(
      user.id,
      actorIp || "127.0.0.1",
      "USER",
      user.id,
      "USER_LOGIN_SUCCESS",
      null,
      { role: userRole }
    );

    return tokens;
  }

  public static generateTokenPair(user: AuthenticatedUser): TokenPair {
    const payload: JwtAccessPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as any,
    });

    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
    });

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  public static async rotateRefreshToken(token: string): Promise<TokenPair> {
    try {
      const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtAccessPayload;
      const user = await usersTable().where({ id: decoded.userId }).first();
      if (!user || !user.is_active) {
        throw new Error("User no longer exists or is inactive");
      }

      const userRoleRecord = await userRolesTable().where({ user_id: user.id }).first();
      let userRole: UserRole = decoded.role;
      if (userRoleRecord) {
        const role = await rolesTable().where({ id: userRoleRecord.role_id }).first();
        if (role) userRole = role.name;
      }

      const authUser: AuthenticatedUser = {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: userRole,
      };

      return this.generateTokenPair(authUser);
    } catch (err) {
      throw new Error("Invalid or expired refresh token");
    }
  }

  public static async generateCustomerPortalToken(quotationId: string, hoursValid?: number): Promise<string> {
    const hours = hoursValid || parseInt(env.CUSTOMER_PORTAL_TOKEN_EXPIRES_HOURS, 10) || 72;
    const rawToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);

    await negotiationRequestsTable().insert({
      quotation_id: quotationId,
      portal_token: rawToken,
      token_expires_at: expiresAt,
      status: "ACTIVE",
    });

    return rawToken;
  }

  public static async verifyCustomerPortalToken(token: string): Promise<{ quotationId: string; negotiationRequestId: string }> {
    const record = await negotiationRequestsTable().where({ portal_token: token }).first();
    if (!record) {
      throw new Error("Invalid or unknown customer portal token");
    }

    if (new Date() > new Date(record.token_expires_at)) {
      await negotiationRequestsTable().where({ id: record.id }).update({ status: "EXPIRED" });
      throw new Error("Customer portal token has expired");
    }

    return {
      quotationId: record.quotation_id,
      negotiationRequestId: record.id,
    };
  }
}
