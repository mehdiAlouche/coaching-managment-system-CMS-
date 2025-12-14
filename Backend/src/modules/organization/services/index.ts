import { BaseService } from '../../_shared/base-services';
import { OrganizationModel, IOrganization } from '../model';
import { UserModel } from '../../user/model/user.model';
import { SessionModel } from '../../session/model/session.model';
import { PaymentModel } from '../../payment/model/payment.model';
import { OrganizationStats } from '../types/organization.types';

export class OrganizationService extends BaseService<IOrganization> {
  constructor() {
    super(OrganizationModel);
  }

  /**
   * Create a new organization (admin only)
   */
  async createOrganization(data: {
    name: string;
    slug: string;
    billingEmail?: string;
    subscriptionPlan?: 'free' | 'standard' | 'premium';
    maxUsers?: number;
    maxCoaches?: number;
    maxEntrepreneurs?: number;
    contact?: Record<string, unknown>;
    settings?: Record<string, unknown>;
    preferences?: Record<string, unknown>;
  }): Promise<IOrganization> {
    // Ensure slug is lowercase and unique
    const slug = data.slug.toLowerCase().trim();
    const existing = await OrganizationModel.findOne({ slug });
    if (existing) {
      throw new Error(`Organization slug "${slug}" already exists`);
    }

    const organization = await OrganizationModel.create({
      ...data,
      slug,
      subscriptionPlan: data.subscriptionPlan || 'free',
      subscriptionStatus: data.subscriptionPlan === 'free' ? 'active' : 'trialing',
    });

    return organization;
  }

  /**
   * Get organization statistics (quota usage, member counts, revenue)
   */
  async getOrganizationStats(organizationId: string): Promise<OrganizationStats> {
    const org = await OrganizationModel.findById(organizationId);
    if (!org) {
      throw new Error('Organization not found');
    }

    const [totalUsers, totalCoaches, totalEntrepreneurs, totalSessions, payments] = await Promise.all([
      UserModel.countDocuments({ organizationId, role: { $ne: 'admin' } }),
      UserModel.countDocuments({ organizationId, role: 'coach' }),
      UserModel.countDocuments({ organizationId, role: 'entrepreneur' }),
      SessionModel.countDocuments({ organizationId }),
      PaymentModel.find({ organizationId }, { amount: 1 }).lean(),
    ]);

    const totalRevenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

    return {
      organizationId: org._id.toString(),
      name: org.name,
      totalUsers,
      totalCoaches,
      totalEntrepreneurs,
      totalSessions,
      totalRevenue,
      subscriptionPlan: org.subscriptionPlan,
      subscriptionStatus: org.subscriptionStatus,
      quotaUsage: {
        users: {
          used: totalUsers,
          limit: org.maxUsers,
          percentage: org.maxUsers ? (totalUsers / org.maxUsers) * 100 : undefined,
        },
        coaches: {
          used: totalCoaches,
          limit: org.maxCoaches,
          percentage: org.maxCoaches ? (totalCoaches / org.maxCoaches) * 100 : undefined,
        },
        entrepreneurs: {
          used: totalEntrepreneurs,
          limit: org.maxEntrepreneurs,
          percentage: org.maxEntrepreneurs ? (totalEntrepreneurs / org.maxEntrepreneurs) * 100 : undefined,
        },
      },
    };
  }

  /**
   * List all organizations with pagination and filtering (admin only)
   */
  async listOrganizations(
    page: number = 1,
    limit: number = 50,
    filters?: {
      isActive?: boolean;
      subscriptionPlan?: string;
      subscriptionStatus?: string;
      search?: string;
    }
  ): Promise<{
    data: IOrganization[];
    total: number;
    page: number;
    pages: number;
  }> {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }
    if (filters?.subscriptionPlan) {
      query.subscriptionPlan = filters.subscriptionPlan;
    }
    if (filters?.subscriptionStatus) {
      query.subscriptionStatus = filters.subscriptionStatus;
    }
    if (filters?.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { slug: { $regex: filters.search, $options: 'i' } },
        { billingEmail: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      OrganizationModel.find(query).skip(skip).limit(limit).lean(),
      OrganizationModel.countDocuments(query),
    ]);

    return {
      data,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Soft-delete organization (mark as inactive)
   */
  async softDeleteOrganization(organizationId: string): Promise<IOrganization | null> {
    return OrganizationModel.findByIdAndUpdate(organizationId, { isActive: false }, { new: true });
  }

  /**
   * Check quota limits before adding new members
   */
  async checkQuotaLimits(
    organizationId: string,
    role: string
  ): Promise<{
    isAllowed: boolean;
    message?: string;
    currentUsage?: number;
    limit?: number;
  }> {
    const org = await OrganizationModel.findById(organizationId);
    if (!org) {
      return { isAllowed: false, message: 'Organization not found' };
    }

    let limit: number | undefined;
    let countQuery: any = { organizationId, role };

    if (role === 'coach') {
      limit = org.maxCoaches;
    } else if (role === 'entrepreneur') {
      limit = org.maxEntrepreneurs;
    } else {
      limit = org.maxUsers;
    }

    // No limit configured
    if (!limit) {
      return { isAllowed: true };
    }

    const currentUsage = await UserModel.countDocuments(countQuery);

    if (currentUsage >= limit) {
      return {
        isAllowed: false,
        message: `Organization has reached the maximum limit of ${limit} ${role}s`,
        currentUsage,
        limit,
      };
    }

    return {
      isAllowed: true,
      currentUsage,
      limit,
    };
  }
}

export const organizationService = new OrganizationService();
