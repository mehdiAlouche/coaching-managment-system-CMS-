import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, endpoints } from '@/services'
import { Goal } from '@/models'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link, Trash2, Loader2 } from 'lucide-react'
import { useErrorHandler } from '@/hooks/useErrorHandler'

interface RelatedGoalsProps {
  sessionId: string
  entrepreneurId?: string
}

export default function RelatedGoals({ sessionId, entrepreneurId }: RelatedGoalsProps) {
  const queryClient = useQueryClient()
  const { handleError, showSuccess } = useErrorHandler()
  const { data: linkedGoals = [] } = useQuery<Goal[]>({
    queryKey: ['session-goals', sessionId],
    queryFn: async () => {
      const res = await apiClient.get(`${endpoints.goals.list}?linkedSessions=${sessionId}`)
      return Array.isArray(res.data) ? res.data : res.data?.data || []
    },
  })

  const { data: availableGoals = [] } = useQuery<Goal[]>({
    queryKey: ['goals', entrepreneurId],
    queryFn: async () => {
      if (!entrepreneurId) return []
      const res = await apiClient.get(endpoints.goals.list, {
        params: { entrepreneurId, status: 'in_progress' },
      })
      return Array.isArray(res.data) ? res.data : res.data?.data || []
    },
    enabled: !!entrepreneurId,
  })

  const linkGoalMutation = useMutation({
    mutationFn: async (goalId: string) => {
      await apiClient.post(endpoints.goals.linkSession(goalId, sessionId))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-goals', sessionId] })
      showSuccess('Goal linked', 'Session linked to goal successfully')
    },
    onError: (error) => handleError(error),
  })

  const unlinkGoalMutation = useMutation({
    mutationFn: async (goalId: string) => {
      await apiClient.delete(`${endpoints.goals.get(goalId)}/sessions/${sessionId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-goals', sessionId] })
      showSuccess('Goal unlinked', 'Session removed from goal')
    },
    onError: (error) => handleError(error),
  })

  const unlinkedGoals = availableGoals.filter((g) => !linkedGoals.some((lg) => lg._id === g._id))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Link className="h-4 w-4" />
          Related Goals
        </h3>
      </div>

      {/* Linked Goals */}
      {linkedGoals.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Linked to this session:</p>
          {linkedGoals.map((goal) => (
            <Card key={goal._id}>
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm">{goal.title}</p>
                  <Badge variant="secondary" className="mt-1 capitalize text-xs">
                    {goal.status}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => unlinkGoalMutation.mutate(goal._id)}
                  disabled={unlinkGoalMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Available Goals to Link */}
      {unlinkedGoals.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Available to link:</p>
          {unlinkedGoals.map((goal) => (
            <Card key={goal._id}>
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm">{goal.title}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="capitalize text-xs">
                      {goal.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {goal.progress}%
                    </Badge>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => linkGoalMutation.mutate(goal._id)}
                  disabled={linkGoalMutation.isPending}
                >
                  {linkGoalMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Link className="h-4 w-4" />
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {linkedGoals.length === 0 && unlinkedGoals.length === 0 && (
        <Card>
          <CardContent className="p-4 text-center text-muted-foreground text-sm">
            No goals to display
          </CardContent>
        </Card>
      )}
    </div>
  )
}
