import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { apiClient, endpoints } from '../services'
import { ActivityType } from './useAdminActivityFeed'

export interface ActivityStats {
  [ActivityType.USER_REGISTERED]?: number
  [ActivityType.USER_ACTIVATED]?: number
  [ActivityType.USER_DEACTIVATED]?: number
  [ActivityType.SESSION_CREATED]?: number
  [ActivityType.SESSION_COMPLETED]?: number
  [ActivityType.SESSION_CANCELLED]?: number
  [ActivityType.PAYMENT_GENERATED]?: number
  [ActivityType.PAYMENT_COMPLETED]?: number
  [ActivityType.ORGANIZATION_CREATED]?: number
  [ActivityType.ORGANIZATION_UPDATED]?: number
  [key: string]: number | undefined
}

interface ActivityStatsResponse {
  success: boolean
  data: ActivityStats
}

type QueryOpts<T> = Omit<UseQueryOptions<T, unknown, T, readonly unknown[]>, 'queryKey' | 'queryFn'>

export interface ActivityStatsParams {
  startDate?: string
  endDate?: string
}

export function useAdminActivityStats(
  params?: ActivityStatsParams,
  options?: QueryOpts<ActivityStatsResponse>
) {
  return useQuery({
    queryKey: ['admin', 'activity-stats', params],
    queryFn: async () => {
      const res = await apiClient.get(endpoints.admin.activityStats, { params })
      // Handle response format
      if (res.data?.success && res.data?.data) {
        return res.data as ActivityStatsResponse
      }
      if (res.data?.data) {
        return {
          success: true,
          data: res.data.data as ActivityStats,
        } as ActivityStatsResponse
      }
      return {
        success: true,
        data: {},
      } as ActivityStatsResponse
    },
    ...(options as object),
  })
}
