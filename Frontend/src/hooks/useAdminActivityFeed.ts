import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { apiClient, endpoints } from '../services'

export enum ActivityType {
  USER_REGISTERED = 'USER_REGISTERED',
  USER_ACTIVATED = 'USER_ACTIVATED',
  USER_DEACTIVATED = 'USER_DEACTIVATED',
  SESSION_CREATED = 'SESSION_CREATED',
  SESSION_COMPLETED = 'SESSION_COMPLETED',
  SESSION_CANCELLED = 'SESSION_CANCELLED',
  PAYMENT_GENERATED = 'PAYMENT_GENERATED',
  PAYMENT_COMPLETED = 'PAYMENT_COMPLETED',
  ORGANIZATION_CREATED = 'ORGANIZATION_CREATED',
  ORGANIZATION_UPDATED = 'ORGANIZATION_UPDATED',
}

export interface ActivityFeedItem {
  _id: string
  organizationId: string
  activityType: ActivityType | string
  userId: string
  userName: string
  userEmail: string
  userRole: string
  sessionId?: string
  paymentId?: string
  amount?: number
  description: string
  metadata?: Record<string, any>
  createdAt: string
}

interface ActivityFeedResponse {
  success: boolean
  data: ActivityFeedItem[]
  pagination: {
    total: number
    limit: number
    skip: number
    hasMore: boolean
  }
}

type QueryOpts<T> = Omit<UseQueryOptions<T, unknown, T, readonly unknown[]>, 'queryKey' | 'queryFn'>

export interface ActivityFeedParams {
  limit?: number
  skip?: number
  activityType?: ActivityType | string
  startDate?: string
  endDate?: string
}

export function useAdminActivityFeed(
  params?: ActivityFeedParams,
  options?: QueryOpts<ActivityFeedResponse>
) {
  return useQuery({
    queryKey: ['admin', 'activity', params],
    queryFn: async () => {
      const res = await apiClient.get(endpoints.admin.activity, { params })
      // Handle response format
      if (res.data?.success && res.data?.data) {
        return res.data as ActivityFeedResponse
      }
      if (res.data?.data) {
        return {
          success: true,
          data: Array.isArray(res.data.data) ? res.data.data : [],
          pagination: res.data.pagination || { total: 0, limit: 50, skip: 0, hasMore: false },
        } as ActivityFeedResponse
      }
      return {
        success: true,
        data: [],
        pagination: { total: 0, limit: 50, skip: 0, hasMore: false },
      } as ActivityFeedResponse
    },
    ...(options as object),
  })
}

