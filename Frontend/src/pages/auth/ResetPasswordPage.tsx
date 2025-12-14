import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { apiClient, endpoints } from '@/services'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Eye, EyeOff, Check } from 'lucide-react'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { useSearch } from '@tanstack/react-router'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const { handleError, showSuccess } = useErrorHandler()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const [isValid, setIsValid] = useState(false)
  const searchParams = useSearch({ from: '/auth/reset-password' })
  const token = (searchParams as any)?.token

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        handleError(new Error('Invalid or missing reset token'))
        return
      }
      try {
        await apiClient.post(endpoints.auth.verifyResetToken, { token })
        setIsValid(true)
      } catch (error) {
        handleError(error, { customMessage: 'Token is invalid or expired. Request a new reset link.' })
        setTimeout(() => navigate({ to: '/auth/forgot-password' }), 3000)
      } finally {
        setIsVerifying(false)
      }
    }
    verifyToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      handleError(new Error('Passwords do not match'))
      return
    }
    setIsLoading(true)
    try {
      await apiClient.post(endpoints.auth.resetPassword, { token, password })
      showSuccess('Password reset successfully', 'Redirecting to login...')
      setTimeout(() => navigate({ to: '/auth/login' }), 2000)
    } catch (error) {
      handleError(error, { customMessage: 'Failed to reset password. Try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-12 text-center">
            <h2 className="text-xl font-bold mb-2">Invalid or Expired Token</h2>
            <p className="text-muted-foreground text-sm">Redirecting...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Set new password</h1>
          <p className="text-muted-foreground mt-2">Enter your new password below</p>
        </div>

        <Card>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirm" className="block text-sm font-medium text-foreground mb-2">
                  Confirm Password
                </label>
                <Input
                  id="confirm"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm password"
                />
              </div>

              <Button type="submit" disabled={isLoading || !password || !confirmPassword} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Reset Password
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
