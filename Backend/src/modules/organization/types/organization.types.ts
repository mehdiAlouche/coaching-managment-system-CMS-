import { Types } from 'mongoose';
import { SubscriptionPlan, SubscriptionStatus } from '../model/organization.model';

/**
 * Manager-specific settings that only managers can configure
 */
export interface IManagerSettings {
  notificationPreferences?: {
    emailOnNewSession?: boolean;
    emailOnSessionCancel?: boolean;
    emailOnGoalUpdate?: boolean;
    emailOnPaymentReceived?: boolean;
    emailDigestFrequency?: 'daily' | 'weekly' | 'never';
  };
  dashboardLayout?: {
    defaultView?: 'overview' | 'sessions' | 'members' | 'revenue';
    widgets?: string[];
  };
  approvalThresholds?: {
    sessionPricingApproval?: boolean;
    coachOnboardingApproval?: boolean;
  };
  [key: string]: unknown;
}

/**
 * Organization creation request (admin only)
 */
export interface CreateOrganizationDto {
  name: string;
  slug: string;
  billingEmail?: string;
  subscriptionPlan?: SubscriptionPlan;
  maxUsers?: number;
  maxCoaches?: number;
  maxEntrepreneurs?: number;
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
  };
  settings?: Record<string, unknown>;
  preferences?: Record<string, unknown>;
}

/**
 * Organization update request (admin only - full updates)
 */
export interface UpdateOrganizationDto {
  name?: string;
  slug?: string;
  billingEmail?: string;
  subscriptionPlan?: SubscriptionPlan;
  subscriptionStatus?: SubscriptionStatus;
  subscriptionRenewalAt?: Date;
  maxUsers?: number;
  maxCoaches?: number;
  maxEntrepreneurs?: number;
  isActive?: boolean;
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
  };
  settings?: Record<string, unknown>;
  preferences?: Record<string, unknown>;
}

/**
 * Manager settings update request (manager only)
 */
export interface UpdateManagerSettingsDto {
  notificationPreferences?: IManagerSettings['notificationPreferences'];
  dashboardLayout?: IManagerSettings['dashboardLayout'];
  approvalThresholds?: IManagerSettings['approvalThresholds'];
}

/**
 * Organization response DTO (for API responses)
 */
export interface OrganizationResponseDto {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  subscriptionRenewalAt?: Date;
  maxUsers?: number;
  maxCoaches?: number;
  maxEntrepreneurs?: number;
  billingEmail?: string;
  contact?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  preferences?: Record<string, unknown>;
  logoPath?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Organization stats for admin/manager dashboard
 */
export interface OrganizationStats {
  organizationId: string;
  name: string;
  totalUsers: number;
  totalCoaches: number;
  totalEntrepreneurs: number;
  totalSessions: number;
  totalRevenue: number;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  quotaUsage: {
    users: {
      used: number;
      limit?: number;
      percentage?: number;
    };
    coaches: {
      used: number;
      limit?: number;
      percentage?: number;
    };
    entrepreneurs: {
      used: number;
      limit?: number;
      percentage?: number;
    };
  };
}
