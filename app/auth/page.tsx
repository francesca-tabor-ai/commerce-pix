'use client'

import { useState, FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert } from '@/components/ui/primitives/Alert'
import { Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get('tab') || 'signin'
  const redirectTo = searchParams.get('redirect') || '/app'
  
  const [activeTab, setActiveTab] = useState<string>(defaultTab)
  const supabase = createClient()

  // Sign In State
  const [signInEmail, setSignInEmail] = useState('')
  const [signInPassword, setSignInPassword] = useState('')
  const [signInLoading, setSignInLoading] = useState(false)

  // Sign Up State
  const [signUpEmail, setSignUpEmail] = useState('')
  const [signUpPassword, setSignUpPassword] = useState('')
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('')
  const [signUpLoading, setSignUpLoading] = useState(false)

  // Reset Password State
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSignInLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: signInEmail,
        password: signInPassword,
      })

      if (error) {
        toast.error('Sign in failed', {
          description: error.message,
        })
      } else {
        toast.success('Welcome back!', {
          description: 'Redirecting to your dashboard...',
        })
        
        // Check if user needs onboarding
        await handlePostLoginOnboarding()
      }
    } catch (err) {
      toast.error('Unexpected error', {
        description: 'An unexpected error occurred. Please try again.',
      })
    } finally {
      setSignInLoading(false)
    }
  }

  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Validate passwords match
    if (signUpPassword !== signUpConfirmPassword) {
      toast.error('Passwords do not match', {
        description: 'Please ensure both passwords are identical.',
      })
      return
    }

    // Validate password length
    if (signUpPassword.length < 6) {
      toast.error('Password too short', {
        description: 'Password must be at least 6 characters long.',
      })
      return
    }

    setSignUpLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email: signUpEmail,
        password: signUpPassword,
      })

      if (error) {
        toast.error('Sign up failed', {
          description: error.message,
        })
      } else {
        toast.success('Account created!', {
          description: 'Setting up your workspace...',
        })
        
        // Handle post-signup onboarding
        await handlePostLoginOnboarding()
      }
    } catch (err) {
      toast.error('Unexpected error', {
        description: 'An unexpected error occurred. Please try again.',
      })
    } finally {
      setSignUpLoading(false)
    }
  }

  const handlePasswordReset = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setResetLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        toast.error('Reset failed', {
          description: error.message,
        })
      } else {
        setResetSent(true)
        toast.success('Check your email', {
          description: 'We sent you a password reset link.',
        })
      }
    } catch (err) {
      toast.error('Unexpected error', {
        description: 'An unexpected error occurred. Please try again.',
      })
    } finally {
      setResetLoading(false)
    }
  }

  const handlePostLoginOnboarding = async () => {
    try {
      // If there's a specific redirect, use that
      if (redirectTo && redirectTo !== '/app') {
        router.push(redirectTo)
        router.refresh()
        return
      }

      // Check if user has any projects
      const { data: projects } = await supabase
        .from('projects')
        .select('id')
        .limit(1)

      if (!projects || projects.length === 0) {
        // Create first project
        const { data: newProject, error } = await supabase
          .from('projects')
          .insert({
            name: 'My First Project',
          })
          .select()
          .single()

        if (error) {
          console.error('Error creating first project:', error)
          // Still redirect to app even if project creation fails
          router.push('/app')
        } else if (newProject) {
          // Redirect to the new project
          router.push(`/app/projects/${newProject.id}`)
        }
      } else {
        // User has projects, go to dashboard
        router.push('/app')
      }
      
      router.refresh()
    } catch (err) {
      console.error('Onboarding error:', err)
      // Fallback to app dashboard
      router.push('/app')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-warm-white to-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">CommercePix</span>
          </Link>
        </div>

        <Card className="shadow-soft-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              {activeTab === 'reset' ? 'Reset Password' : 'Welcome'}
            </CardTitle>
            <CardDescription className="text-center">
              {activeTab === 'signin' && 'Sign in to your account to continue'}
              {activeTab === 'signup' && 'Create an account to get started'}
              {activeTab === 'reset' && 'Enter your email to receive a reset link'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {/* Sign In Tab */}
              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="name@example.com"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      disabled={signInLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="signin-password">Password</Label>
                      <button
                        type="button"
                        onClick={() => setActiveTab('reset')}
                        className="text-sm text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <Input
                      id="signin-password"
                      type="password"
                      autoComplete="current-password"
                      required
                      placeholder="••••••••"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      disabled={signInLoading}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={signInLoading}
                  >
                    {signInLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      New to CommercePix?
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setActiveTab('signup')}
                  type="button"
                >
                  Create an account
                </Button>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="name@example.com"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      disabled={signUpLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      autoComplete="new-password"
                      required
                      placeholder="••••••••"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      disabled={signUpLoading}
                      minLength={6}
                    />
                    <p className="text-xs text-muted-foreground">
                      Must be at least 6 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                    <Input
                      id="signup-confirm-password"
                      type="password"
                      autoComplete="new-password"
                      required
                      placeholder="••••••••"
                      value={signUpConfirmPassword}
                      onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                      disabled={signUpLoading}
                      minLength={6}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={signUpLoading}
                  >
                    {signUpLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By creating an account, you agree to our{' '}
                    <Link href="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </p>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Already have an account?
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setActiveTab('signin')}
                  type="button"
                >
                  Sign in instead
                </Button>
              </TabsContent>

              {/* Password Reset */}
              {activeTab === 'reset' && (
                <div className="space-y-4">
                  {resetSent ? (
                    <Alert variant="success" className="mb-4">
                      Check your email for a password reset link. You can close this page.
                    </Alert>
                  ) : (
                    <form onSubmit={handlePasswordReset} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="reset-email">Email</Label>
                        <Input
                          id="reset-email"
                          type="email"
                          autoComplete="email"
                          required
                          placeholder="name@example.com"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          disabled={resetLoading}
                        />
                        <p className="text-xs text-muted-foreground">
                          We'll send you a link to reset your password
                        </p>
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={resetLoading}
                      >
                        {resetLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          'Send Reset Link'
                        )}
                      </Button>
                    </form>
                  )}

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Remember your password?
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setActiveTab('signin')}
                    type="button"
                  >
                    Back to sign in
                  </Button>
                </div>
              )}
            </Tabs>
          </CardContent>
        </Card>

        {/* Back to home link */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}

