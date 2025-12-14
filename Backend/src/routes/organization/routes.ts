import { Router, Request, Response } from 'express';
import path from 'path';
import { requireAuth, AuthRequest } from '../../middleware/auth';
import { requireSameOrganization } from '../../middleware/organizationScope';
import { requireRole } from '../../middleware/roleCheck';
import { validate } from '../../middleware/validate';
import { OrganizationModel } from '../../modules/organization/model/organization.model';
import {
  organizationUpdateSchema,
  organizationCreateSchema,
  organizationManagerSettingsSchema,
} from '../../modules/validation/schemas';
import { createUploader } from '../../middleware/upload';
import { FileAssetModel } from '../../modules/file/model/fileAsset.model';
import {
  getOrganization,
  getOrganizationStats,
  updateOrganization,
  updateManagerSettings,
  listOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganizationById,
  deleteOrganization,
  getOrganizationQuotaStatus,
} from '../../modules/organization/controller';

const router = Router();

// ============================================================================
// ORGANIZATION SETTINGS (Manager & Admin - Scoped to current org)
// ============================================================================

/**
 * GET /organization
 * Get current organization details
 */
router.get(
  '/',
  requireAuth,
  requireSameOrganization,
  requireRole('admin', 'manager'),
  getOrganization
);

/**
 * GET /organization/stats
 * Get organization statistics (quota usage, member counts, revenue)
 */
router.get(
  '/stats',
  requireAuth,
  requireSameOrganization,
  requireRole('admin', 'manager'),
  getOrganizationStats
);

/**
 * PATCH /organization
 * Update organization (admin only - full access)
 */
router.patch(
  '/',
  requireAuth,
  requireSameOrganization,
  requireRole('admin'),
  validate(organizationUpdateSchema),
  updateOrganization
);

/**
 * PATCH /organization/settings/manager
 * Update manager-specific settings (manager only)
 */
router.patch(
  '/settings/manager',
  requireAuth,
  requireSameOrganization,
  requireRole('admin', 'manager'),
  validate(organizationManagerSettingsSchema),
  updateManagerSettings
);

const logoUpload = createUploader({
  subDirectory: 'organization',
  maxFileSizeMb: 5,
  allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
}).single('logo');

/**
 * POST /organization/logo
 * Upload organization logo
 */
router.post(
  '/logo',
  requireAuth,
  requireSameOrganization,
  requireRole('admin', 'manager'),
  (req, res, next) => {
    logoUpload(req, res, (err: unknown) => {
      if (err instanceof Error) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthRequest;
      const organizationId = authReq.user?.organizationId;
      const uploadedBy = authReq.user?.userId || authReq.user?._id;
      const file = (req as Request & { file?: Express.Multer.File }).file;

      if (!file) {
        return res.status(400).json({ message: 'Logo file is required' });
      }

      const asset = await FileAssetModel.create({
        organizationId,
        uploadedBy,
        originalName: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        tags: ['organization', 'logo'],
      });

      const organization = await OrganizationModel.findByIdAndUpdate(
        organizationId,
        { logoPath: path.relative(process.cwd(), file.path) },
        { new: true }
      ).lean();

      res.status(201).json({
        message: 'Organization logo updated',
        logo: organization?.logoPath,
        asset,
      });
    } catch (err) {
      console.error('Upload organization logo error:', err);
      res.status(500).json({ message: 'Failed to upload organization logo' });
    }
  }
);

// ============================================================================
// ORGANIZATION ADMIN CRUD (Admin only - Global access)
// ============================================================================

/**
 * GET /organizations
 * List all organizations (admin only)
 */
router.get(
  '/admin/list',
  requireAuth,
  requireRole('admin'),
  listOrganizations
);

/**
 * POST /organizations
 * Create new organization (admin only)
 */
router.post(
  '/admin/create',
  requireAuth,
  requireRole('admin'),
  validate(organizationCreateSchema),
  createOrganization
);

/**
 * GET /organizations/:organizationId
 * Get single organization by ID (admin only)
 */
router.get(
  '/admin/:organizationId',
  requireAuth,
  requireRole('admin'),
  getOrganizationById
);

/**
 * PATCH /organizations/:organizationId
 * Update organization by ID (admin only)
 */
router.patch(
  '/admin/:organizationId',
  requireAuth,
  requireRole('admin'),
  validate(organizationUpdateSchema),
  updateOrganizationById
);

/**
 * DELETE /organizations/:organizationId
 * Soft-delete organization (admin only)
 */
router.delete(
  '/admin/:organizationId',
  requireAuth,
  requireRole('admin'),
  deleteOrganization
);

/**
 * GET /organizations/:organizationId/quota
 * Get organization quota status (admin only)
 */
router.get(
  '/admin/:organizationId/quota',
  requireAuth,
  requireRole('admin'),
  getOrganizationQuotaStatus
);

export default router;

