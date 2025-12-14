import { Request, Response } from 'express';
import { AuthRequest } from '../../../middleware/auth';
import { organizationService } from '../services';
import { OrganizationModel } from '../model/organization.model';
import { CreateOrganizationDto, UpdateOrganizationDto, UpdateManagerSettingsDto } from '../types/organization.types';

/**
 * Get current organization details (manager & admin)
 */
export const getOrganization = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const organizationId = authReq.user?.organizationId;

    const organization = await OrganizationModel.findById(organizationId).lean();
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    res.json(organization);
  } catch (err) {
    console.error('Get organization error:', err);
    res.status(500).json({ message: 'Failed to fetch organization' });
  }
};

/**
 * Get organization statistics (manager & admin)
 */
export const getOrganizationStats = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const organizationId = authReq.user?.organizationId;

    const stats = await organizationService.getOrganizationStats(organizationId!);
    res.json(stats);
  } catch (err) {
    console.error('Get organization stats error:', err);
    res.status(500).json({ message: 'Failed to fetch organization statistics' });
  }
};

/**
 * Update organization (admin only - full access to all fields)
 */
export const updateOrganization = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const organizationId = authReq.user?.organizationId;
    const updates: UpdateOrganizationDto = req.body;

    // Normalize slug
    if (updates.slug) {
      updates.slug = updates.slug.toLowerCase();
    }

    // Check for slug uniqueness if slug is being updated
    if (updates.slug) {
      const existing = await OrganizationModel.findOne({
        slug: updates.slug,
        _id: { $ne: organizationId },
      });
      if (existing) {
        return res.status(409).json({ message: 'Organization slug already exists' });
      }
    }

    const organization = await OrganizationModel.findByIdAndUpdate(organizationId, updates, { new: true });
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    res.json(organization);
  } catch (err) {
    console.error('Update organization error:', err);
    res.status(500).json({ message: 'Failed to update organization' });
  }
};

/**
 * Update manager-specific settings (manager only)
 */
export const updateManagerSettings = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const organizationId = authReq.user?.organizationId;
    const managerUpdates: UpdateManagerSettingsDto = req.body;

    // Merge with existing settings
    const org = await OrganizationModel.findById(organizationId);
    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Update only manager-specific settings
    const settings: any = org.settings || {};
    if (managerUpdates.notificationPreferences) {
      settings.notificationPreferences = {
        ...(settings.notificationPreferences || {}),
        ...managerUpdates.notificationPreferences,
      };
    }
    if (managerUpdates.dashboardLayout) {
      settings.dashboardLayout = {
        ...(settings.dashboardLayout || {}),
        ...managerUpdates.dashboardLayout,
      };
    }
    if (managerUpdates.approvalThresholds) {
      settings.approvalThresholds = {
        ...(settings.approvalThresholds || {}),
        ...managerUpdates.approvalThresholds,
      };
    }

    const updated = await OrganizationModel.findByIdAndUpdate(organizationId, { settings }, { new: true });
    res.json(updated);
  } catch (err) {
    console.error('Update manager settings error:', err);
    res.status(500).json({ message: 'Failed to update manager settings' });
  }
};

/**
 * List all organizations (admin only)
 */
export const listOrganizations = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 500);
    const isActive = req.query.isActive ? req.query.isActive === 'true' : undefined;
    const subscriptionPlan = req.query.subscriptionPlan as string | undefined;
    const subscriptionStatus = req.query.subscriptionStatus as string | undefined;
    const search = req.query.search as string | undefined;

    const result = await organizationService.listOrganizations(page, limit, {
      isActive,
      subscriptionPlan,
      subscriptionStatus,
      search,
    });

    res.json(result);
  } catch (err) {
    console.error('List organizations error:', err);
    res.status(500).json({ message: 'Failed to fetch organizations' });
  }
};

/**
 * Get single organization by ID (admin only)
 */
export const getOrganizationById = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.params;

    const organization = await OrganizationModel.findById(organizationId).lean();
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    res.json(organization);
  } catch (err) {
    console.error('Get organization by ID error:', err);
    res.status(500).json({ message: 'Failed to fetch organization' });
  }
};

/**
 * Create new organization (admin only)
 */
export const createOrganization = async (req: Request, res: Response) => {
  try {
    const createDto: CreateOrganizationDto = req.body;

    // Validate slug uniqueness
    const existing = await OrganizationModel.findOne({ slug: createDto.slug.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'Organization slug already exists' });
    }

    const organization = await organizationService.createOrganization(createDto);

    res.status(201).json({
      message: 'Organization created successfully',
      data: organization,
    });
  } catch (err: any) {
    console.error('Create organization error:', err);
    const statusCode = err.message?.includes('already exists') ? 409 : 500;
    res.status(statusCode).json({ message: err.message || 'Failed to create organization' });
  }
};

/**
 * Update organization by ID (admin only)
 */
export const updateOrganizationById = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.params;
    const updates: UpdateOrganizationDto = req.body;

    // Normalize slug
    if (updates.slug) {
      updates.slug = updates.slug.toLowerCase();

      // Check for slug uniqueness
      const existing = await OrganizationModel.findOne({
        slug: updates.slug,
        _id: { $ne: organizationId },
      });
      if (existing) {
        return res.status(409).json({ message: 'Organization slug already exists' });
      }
    }

    const organization = await OrganizationModel.findByIdAndUpdate(organizationId, updates, { new: true });
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    res.json({
      message: 'Organization updated successfully',
      data: organization,
    });
  } catch (err) {
    console.error('Update organization by ID error:', err);
    res.status(500).json({ message: 'Failed to update organization' });
  }
};

/**
 * Soft-delete organization (admin only)
 */
export const deleteOrganization = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.params;

    const organization = await organizationService.softDeleteOrganization(organizationId);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    res.json({
      message: 'Organization deleted successfully',
      data: organization,
    });
  } catch (err) {
    console.error('Delete organization error:', err);
    res.status(500).json({ message: 'Failed to delete organization' });
  }
};

/**
 * Get organization quota status (admin only)
 */
export const getOrganizationQuotaStatus = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.params;

    const stats = await organizationService.getOrganizationStats(organizationId);
    res.json({
      quotaUsage: stats.quotaUsage,
      subscriptionPlan: stats.subscriptionPlan,
      subscriptionStatus: stats.subscriptionStatus,
    });
  } catch (err) {
    console.error('Get quota status error:', err);
    res.status(500).json({ message: 'Failed to fetch quota status' });
  }
};
