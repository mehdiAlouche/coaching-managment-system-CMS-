import { useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { apiClient, endpoints } from '@/services'
import { useAuth } from '@/context/AuthContext'
import { Payment } from '@/models'
import InvoiceDetailView from '@/components/payments/InvoiceDetailView'
import { Loader2 } from 'lucide-react'
import { UserRole } from '@/models'

export default function PaymentDetailPage() {
  const { id: paymentId } = useParams({ from: '/payments/$id' })
  const { user } = useAuth()
  const isManager = user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN

  const { data: payment, isLoading, error, refetch } = useQuery<Payment>({
    queryKey: ['payment', paymentId],
    queryFn: async () => {
      const res = await apiClient.get(endpoints.payments.get(paymentId))
      return res.data?.data || res.data
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive font-semibold">Failed to load invoice</p>
          <p className="text-muted-foreground text-sm mt-2">Please try again later</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <InvoiceDetailView payment={payment} isManager={isManager} onMarkPaid={() => refetch()} />
      </div>
    </div>
  )
}
