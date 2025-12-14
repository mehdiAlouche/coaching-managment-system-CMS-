import { useState } from 'react'
import { Star, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { apiClient, endpoints } from '@/services'

interface SessionRatingModalProps {
  isOpen: boolean
  onClose: () => void
  sessionId: string
  onSuccess?: () => void
}

export default function SessionRatingModal({ isOpen, onClose, sessionId, onSuccess }: SessionRatingModalProps) {
  const { handleError, showSuccess } = useErrorHandler()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      handleError(new Error('Please provide a rating'))
      return
    }
    setIsLoading(true)
    try {
      await apiClient.post(endpoints.sessions.rate(sessionId), { rating, comment })
      showSuccess('Rating submitted', 'Thank you for your feedback!')
      onSuccess?.()
      onClose()
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rate This Session</DialogTitle>
          <DialogDescription>Help us improve by rating your coaching session</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Star Rating */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoveredRating || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Comment */}
          <Textarea
            placeholder="Share your feedback (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={isLoading} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading || rating === 0} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Rating'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
