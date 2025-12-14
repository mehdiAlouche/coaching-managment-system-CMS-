import { Download, Mail, Printer, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Payment } from '@/models'
import { formatFriendlyDate } from '@/lib/date-utils'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { apiClient, endpoints } from '@/services'

interface InvoiceDetailViewProps {
  payment: Payment
  onMarkPaid?: () => void
  isManager?: boolean
}

export default function InvoiceDetailView({ payment, onMarkPaid, isManager }: InvoiceDetailViewProps) {
  const { handleError, showSuccess } = useErrorHandler()
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const handleDownloadPDF = async () => {
    setIsDownloading(true)
    try {
      const res = await apiClient.get(endpoints.payments.invoice(payment._id), {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `invoice-${payment.invoiceNumber || payment._id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      showSuccess('Downloaded', 'Invoice PDF downloaded successfully')
    } catch (error) {
      handleError(error)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleSendEmail = async () => {
    setIsSending(true)
    try {
      await apiClient.post(endpoints.payments.sendInvoice(payment._id))
      showSuccess('Sent', 'Invoice sent via email')
    } catch (error) {
      handleError(error)
    } finally {
      setIsSending(false)
    }
  }

  const handleMarkPaid = async () => {
    try {
      await apiClient.patch(endpoints.payments.markPaid(payment._id))
      showSuccess('Updated', 'Payment marked as paid')
      onMarkPaid?.()
    } catch (error) {
      handleError(error)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const isPaid = payment.status === 'paid'
  const isOverdue = new Date(payment.dueDate) < new Date() && !isPaid

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Invoice {payment.invoiceNumber}</h1>
          <p className="text-muted-foreground mt-2">
            {payment.status === 'paid' ? 'Paid' : 'Pending'} • Due {formatFriendlyDate(payment.dueDate)}
          </p>
        </div>
        <Badge
          variant={isPaid ? 'default' : isOverdue ? 'destructive' : 'secondary'}
          className="capitalize"
        >
          {payment.status}
        </Badge>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleDownloadPDF} disabled={isDownloading}>
          {isDownloading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </>
          )}
        </Button>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
        {isManager && (
          <>
            <Button variant="outline" size="sm" onClick={handleSendEmail} disabled={isSending}>
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
            {!isPaid && (
              <Button size="sm" onClick={handleMarkPaid}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Paid
              </Button>
            )}
          </>
        )}
      </div>

      {/* Invoice Details */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Invoice Number</p>
              <p className="font-semibold">{payment.invoiceNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Invoice Date</p>
              <p className="font-semibold">{formatFriendlyDate(payment.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Due Date</p>
              <p className="font-semibold">{formatFriendlyDate(payment.dueDate)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={isPaid ? 'default' : 'secondary'} className="capitalize">
                {payment.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Duration</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payment.lineItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">{item.duration} min</TableCell>
                  <TableCell className="text-right">${item.rate.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${item.amount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Totals */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold">${payment.amount.toFixed(2)}</span>
            </div>
            {payment.taxAmount && (
              <div className="flex justify-between">
                <span>Tax</span>
                <span className="font-semibold">${payment.taxAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${payment.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
