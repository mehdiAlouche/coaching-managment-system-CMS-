import { useMemo } from 'react'
import { AdminSectionLayout } from './AdminSectionLayout'
import StatsCards from '@/components/dashboard/StatsCards'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDashboardStats, useUsers, useAdminActivityFeed } from '@/hooks'
import { Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function AdminDashboardPage() {
  const { data: stats, isLoading: loadingStats } = useDashboardStats({ scope: 'admin' })
  const { data: users = [], isLoading: loadingUsers } = useUsers()
  const { data: activityResponse, isLoading: loadingActivity } = useAdminActivityFeed({ limit: 10 })

  // Calculate alerts (MVP logic)
  // Overdue invoices: if stats.payments?.overdue exists, use it, else 0
  const overdueInvoices = stats?.payments?.overdue ?? 0
  // Cancelled sessions (this month): if stats.sessions?.cancelled exists, use it, else 0
  const cancelledSessions = stats?.sessions?.cancelled ?? 0
  // Inactive users: users with no activity in last 30 days (based on updatedAt)
  const now = Date.now()
  const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30
  const inactiveUsers = users.filter(u => {
    if (!u.updatedAt) return true
    return now - new Date(u.updatedAt).getTime() > THIRTY_DAYS
  }).length

  const { coaches, entrepreneurs, managers } = useMemo(() => {
    const list = users ?? []
    return {
      coaches: list.filter((u) => u.role === 'coach').slice(0, 6),
      entrepreneurs: list.filter((u) => u.role === 'entrepreneur').slice(0, 6),
      managers: list.filter((u) => u.role === 'manager').slice(0, 6),
    }
  }, [users])

  return (
    <AdminSectionLayout
      title="Admin Dashboard"
      description="Platform-wide visibility into sessions, users, and revenue."
    >
      <div className="space-y-10">
        {/* System Alerts MVP */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">System Alerts</h2>
          <Card>
            <CardContent className="flex flex-col gap-2 p-4">
              <div className="flex items-center gap-2 text-yellow-600 text-sm">
                <span role="img" aria-label="warning">⚠️</span>
                {overdueInvoices} overdue invoices
              </div>
              <div className="flex items-center gap-2 text-yellow-600 text-sm">
                <span role="img" aria-label="warning">⚠️</span>
                {cancelledSessions} cancelled sessions this month
              </div>
              <div className="flex items-center gap-2 text-blue-600 text-sm">
                <span role="img" aria-label="info">ℹ️</span>
                {inactiveUsers} inactive users
              </div>
            </CardContent>
          </Card>
        </section>
        {/* Platform Stats Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Platform Overview</h2>
          {loadingStats ? (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">Loading stats...</CardContent>
            </Card>
          ) : stats ? (
            <StatsCards title="" stats={stats} />
          ) : (
            <Card>
              <CardContent className="p-6 text-sm text-destructive">Failed to load stats.</CardContent>
            </Card>
          )}
        </section>

        {/* Users Snapshots Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">User Snapshots</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <UsersSnapshot title="Top Coaches" loading={loadingUsers} users={coaches} empty="No coaches" />
            <UsersSnapshot title="Top Entrepreneurs" loading={loadingUsers} users={entrepreneurs} empty="No entrepreneurs" />
            <UsersSnapshot title="Managers" loading={loadingUsers} users={managers} empty="No managers" />
          </div>
        </section>

        {/* Activity Feed Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Recent Activity</h2>
          <Card>
            <CardContent className="p-0">
              {loadingActivity ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : !activityResponse?.data || activityResponse.data.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No activity yet
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {activityResponse.data.map((activity) => (
                    <li key={activity._id} className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            <span className="font-semibold">{activity.userName}</span>
                            {' '}
                            <span className="text-muted-foreground">{activity.description}</span>
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-xs">
                            <span className="text-muted-foreground">{activity.userEmail}</span>
                            <span className="px-2 py-0.5 bg-muted rounded text-muted-foreground capitalize">
                              {activity.activityType.replace(/_/g, ' ').toLowerCase()}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </AdminSectionLayout>
  )
}

type SnapshotUser = {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: string
}

function UsersSnapshot({
  title,
  users,
  loading,
  empty,
}: {
  title: string
  users: SnapshotUser[]
  loading: boolean
  empty: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-muted-foreground">{empty}</p>
        ) : (
          <ul className="space-y-3">
            {users.map((u) => (
              <li key={u._id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                    {u.firstName?.[0]}{u.lastName?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{u.firstName} {u.lastName}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
