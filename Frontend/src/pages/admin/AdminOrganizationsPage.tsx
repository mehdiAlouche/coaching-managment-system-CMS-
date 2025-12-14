import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { apiClient, endpoints } from '@/services'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Loader2, Plus, Edit2, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useErrorHandler } from '@/hooks/useErrorHandler'

interface Organization {
  _id: string
  name: string
  slug: string
  isActive: boolean
  settings: {
    timezone: string
    locale: string
  }
  subscriptionPlan: string
  subscriptionStatus: string
  maxUsers: number
  billingEmail: string
  createdAt: string
  updatedAt: string
}

interface OrganizationsResponse {
  data: Organization[]
  total: number
  page: number
  pages: number
}

export default function AdminOrganizationsPage() {
  const navigate = useNavigate()
  const { handleError } = useErrorHandler()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search input to reduce API calls while typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1) // Reset to first page on search
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  const { data: response, isLoading, refetch } = useQuery<OrganizationsResponse>({
    queryKey: ['organizations', page, debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      })
      if (debouncedSearch) {
        params.append('search', debouncedSearch)
      }
      const res = await apiClient.get(`${endpoints.organizationAdmin.list}?${params.toString()}`)
      return res.data || { data: [], total: 0, page: 1, pages: 1 }
    },
  })

  const organizations = response?.data || []

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(endpoints.organizationAdmin.delete(id))
      refetch()
      setDeleteId(null)
    } catch (error) {
      handleError(error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Organizations</h1>
            <p className="text-muted-foreground mt-2">Manage platform organizations</p>
          </div>
          <Button onClick={() => navigate({ to: '/admin/organizations/new' })}>
            <Plus className="h-4 w-4 mr-2" />
            New Organization
          </Button>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search organizations by name, slug, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Max Users</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Billing Email</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizations.map((org) => (
                  <TableRow key={org._id}>
                    <TableCell className="font-semibold">{org.name}</TableCell>
                    <TableCell className="capitalize">{org.subscriptionPlan}</TableCell>
                    <TableCell>{org.maxUsers}</TableCell>
                    <TableCell>
                      <Badge variant={org.isActive ? 'default' : 'secondary'}>
                        {org.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{org.billingEmail}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            navigate({
                              to: '/admin/organizations/$id',
                              params: { id: org._id },
                            })
                          }
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            deleteId === org._id
                              ? handleDelete(org._id)
                              : setDeleteId(org._id)
                          }
                        >
                          <Trash2
                            className={`h-4 w-4 ${deleteId === org._id ? 'text-destructive' : ''}`}
                          />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        {response && response.pages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              Showing {organizations.length} of {response.total} organizations
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div className="flex items-center gap-2 px-4">
                <span className="text-sm">
                  Page {response.page} of {response.pages}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(response.pages, p + 1))}
                disabled={page >= response.pages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {organizations.length === 0 && !isLoading && (
          <Card className="mt-6">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">
                {search ? 'No organizations found matching your search' : 'No organizations yet'}
              </p>
              {!search && (
                <Button onClick={() => navigate({ to: '/admin/organizations/new' })}>
                  Create First Organization
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
