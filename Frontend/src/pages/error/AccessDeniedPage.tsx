import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LockIcon } from 'lucide-react'

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-12 text-center">
          <LockIcon className="h-16 w-16 mx-auto mb-6 text-destructive" />
          <h1 className="text-3xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-8">
            You don't have permission to access this resource. Contact your administrator if you believe this is an error.
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/">
              <Button className="w-full">Go Home</Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="w-full">Contact Support</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
