import { Response } from 'express';
import { AuthRequest } from '../../../middleware/auth';
import { ActivityService } from '../services/activityService';
import { AppError, ErrorFactory } from '../../../_shared/errors/AppError';
import { HttpStatus } from '../../../_shared/enums/httpStatus';
import { ActivityType } from '../model/activity.model';

export class ActivityController {
  /**
   * GET /admin/activity
   * Get activities for organization (admin) or all activities (super admin)
   */
  static async getActivities(req: AuthRequest, res: Response) {
    try {
      const { limit = '50', skip = '0', activityType, startDate, endDate } = req.query;
      const user = req.user;

      if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
        throw ErrorFactory.forbidden('Access denied. Only admins or managers can view activities.');
      }

      const limitNum = Math.min(parseInt(limit as string, 10) || 50, 100);
      const skipNum = parseInt(skip as string, 10) || 0;

      const options: {
        limit: number;
        skip: number;
        activityType?: ActivityType;
        startDate?: Date;
        endDate?: Date;
      } = {
        limit: limitNum,
        skip: skipNum,
      };

      if (activityType) {
        options.activityType = activityType as ActivityType;
      }

      if (startDate) {
        const parsedDate = new Date(startDate as string);
        if (!isNaN(parsedDate.getTime())) {
          options.startDate = parsedDate;
        }
      }

      if (endDate) {
        const parsedDate = new Date(endDate as string);
        if (!isNaN(parsedDate.getTime())) {
          options.endDate = parsedDate;
        }
      }

      let result;

      // Super admin (no organizationId) sees all activities
      if (user.role === 'admin' && !user.organizationId) {
        result = await ActivityService.getAllActivities(options);
      } else {
        // Organization admin/manager sees only their organization's activities
        const organizationId = user.organizationId || user.id;
        result = await ActivityService.getOrganizationActivities(organizationId, options);
      }

      res.status(HttpStatus.OK).json({
        success: true,
        data: result.activities,
        pagination: {
          total: result.total,
          limit: limitNum,
          skip: skipNum,
          hasMore: skipNum + limitNum < result.total,
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }

      console.error('Error fetching activities:', error);
      res.status(HttpStatus.INTERNAL_ERROR).json({
        success: false,
        message: 'Failed to fetch activities',
      });
    }
  }

  /**
   * GET /admin/activity/stats
   * Get activity statistics for organization
   */
  static async getActivityStats(req: AuthRequest, res: Response) {
    try {
      const { startDate, endDate } = req.query;
      const user = req.user;

      if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
        throw ErrorFactory.forbidden('Access denied. Only admins or managers can view activity stats.');
      }

      const options: {
        startDate?: Date;
        endDate?: Date;
      } = {};

      if (startDate) {
        const parsedDate = new Date(startDate as string);
        if (!isNaN(parsedDate.getTime())) {
          options.startDate = parsedDate;
        }
      }

      if (endDate) {
        const parsedDate = new Date(endDate as string);
        if (!isNaN(parsedDate.getTime())) {
          options.endDate = parsedDate;
        }
      }

      const organizationId = user.organizationId || user.id;
      const stats = await ActivityService.getActivityStats(organizationId, options);

      res.status(HttpStatus.OK).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }

      console.error('Error fetching activity stats:', error);
      res.status(HttpStatus.INTERNAL_ERROR).json({
        success: false,
        message: 'Failed to fetch activity stats',
      });
    }
  }
}
