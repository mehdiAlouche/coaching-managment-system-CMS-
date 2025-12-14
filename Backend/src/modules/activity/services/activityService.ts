import Activity, { IActivity, ActivityType } from '../model/activity.model';
import { Types } from 'mongoose';

export class ActivityService {
  /**
   * Log an activity event
   */
  static async logActivity(
    activityType: ActivityType,
    description: string,
    options?: {
      organizationId?: Types.ObjectId | string;
      userId?: Types.ObjectId | string;
      userName?: string;
      userEmail?: string;
      userRole?: string;
      sessionId?: Types.ObjectId | string;
      paymentId?: Types.ObjectId | string;
      amount?: number;
      metadata?: Record<string, unknown>;
    }
  ): Promise<IActivity> {
    try {
      const activity = new Activity({
        activityType,
        description,
        organizationId: options?.organizationId,
        userId: options?.userId,
        userName: options?.userName,
        userEmail: options?.userEmail,
        userRole: options?.userRole,
        sessionId: options?.sessionId,
        paymentId: options?.paymentId,
        amount: options?.amount,
        metadata: options?.metadata,
      });

      return await activity.save();
    } catch (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  }

  /**
   * Get activities for a specific organization (admin view)
   */
  static async getOrganizationActivities(
    organizationId: Types.ObjectId | string,
    options?: {
      limit?: number;
      skip?: number;
      activityType?: ActivityType;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<{ activities: IActivity[]; total: number }> {
    const limit = options?.limit || 50;
    const skip = options?.skip || 0;

    const query: Record<string, unknown> = { organizationId };

    if (options?.activityType) {
      query.activityType = options.activityType;
    }

    if (options?.startDate || options?.endDate) {
      query.createdAt = {};
      if (options.startDate) {
        (query.createdAt as Record<string, Date>).$gte = options.startDate;
      }
      if (options.endDate) {
        (query.createdAt as Record<string, Date>).$lte = options.endDate;
      }
    }

    const [activities, total] = await Promise.all([
      Activity.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean(),
      Activity.countDocuments(query),
    ]);

    return { activities, total };
  }

  /**
   * Get all activities across all organizations (super admin view)
   */
  static async getAllActivities(options?: {
    limit?: number;
    skip?: number;
    activityType?: ActivityType;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{ activities: IActivity[]; total: number }> {
    const limit = options?.limit || 50;
    const skip = options?.skip || 0;

    const query: Record<string, unknown> = {};

    if (options?.activityType) {
      query.activityType = options.activityType;
    }

    if (options?.startDate || options?.endDate) {
      query.createdAt = {};
      if (options.startDate) {
        (query.createdAt as Record<string, Date>).$gte = options.startDate;
      }
      if (options.endDate) {
        (query.createdAt as Record<string, Date>).$lte = options.endDate;
      }
    }

    const [activities, total] = await Promise.all([
      Activity.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate('organizationId', 'name slug')
        .populate('userId', 'email firstName lastName')
        .lean(),
      Activity.countDocuments(query),
    ]);

    return { activities, total };
  }

  /**
   * Get activity statistics for a specific organization
   */
  static async getActivityStats(
    organizationId: Types.ObjectId | string,
    options?: {
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<Record<string, number>> {
    const query: Record<string, unknown> = { organizationId };

    if (options?.startDate || options?.endDate) {
      query.createdAt = {};
      if (options.startDate) {
        (query.createdAt as Record<string, Date>).$gte = options.startDate;
      }
      if (options.endDate) {
        (query.createdAt as Record<string, Date>).$lte = options.endDate;
      }
    }

    const stats = await Activity.aggregate([
      { $match: query as never },
      {
        $group: {
          _id: '$activityType',
          count: { $sum: 1 },
        },
      },
    ]);

    const result: Record<string, number> = {};
    stats.forEach((stat) => {
      result[stat._id] = stat.count;
    });

    return result;
  }
}
