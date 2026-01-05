'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { updateDefaultBrandTone, requestAccountDeletion } from '@/app/actions/settings'
import type { UserPreferences, BrandTone } from '@/lib/db/preferences'
import { User as UserIcon, Palette, AlertTriangle, Loader2 } from 'lucide-react'

interface SettingsClientProps {
  user: User
  initialPreferences: UserPreferences
}

const brandToneOptions: { value: BrandTone; label: string; description: string }[] = [
  { value: 'professional', label: 'Professional', description: 'Clean and business-appropriate' },
  { value: 'luxury', label: 'Luxury', description: 'Premium and high-end' },
  { value: 'playful', label: 'Playful', description: 'Fun and energetic' },
  { value: 'minimal', label: 'Minimal', description: 'Simple and elegant' },
  { value: 'bold', label: 'Bold', description: 'Striking and attention-grabbing' },
]

export default function SettingsClient({ user, initialPreferences }: SettingsClientProps) {
  const [brandTone, setBrandTone] = useState<BrandTone | null>(
    initialPreferences.default_brand_tone
  )
  const [savingBrandTone, setSavingBrandTone] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deleting, setDeleting] = useState(false)

  const handleSaveBrandTone = async () => {
    setSavingBrandTone(true)

    try {
      const result = await updateDefaultBrandTone(brandTone)

      if (result.success) {
        toast.success('Preferences saved!', {
          description: result.message,
        })
      } else {
        toast.error('Failed to save', {
          description: result.error,
        })
      }
    } catch (error) {
      toast.error('An error occurred', {
        description: 'Please try again later',
      })
    } finally {
      setSavingBrandTone(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type DELETE to confirm')
      return
    }

    setDeleting(true)

    try {
      const result = await requestAccountDeletion()

      if (result.success) {
        toast.success('Request received', {
          description: result.message,
          duration: 10000,
        })
        setShowDeleteDialog(false)
        setDeleteConfirmation('')
      } else {
        toast.error('Request failed', {
          description: result.error,
        })
      }
    } catch (error) {
      toast.error('An error occurred', {
        description: 'Please try again or contact support',
      })
    } finally {
      setDeleting(false)
    }
  }

  const brandToneChanged = brandTone !== initialPreferences.default_brand_tone

  return (
    <div className="p-8 space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-primary" />
            <CardTitle>Profile Information</CardTitle>
          </div>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={user.email || ''}
              disabled
              className="bg-muted cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">
              Your email address is used for authentication and cannot be changed directly.
              Contact support if you need to update it.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-id">User ID</Label>
            <Input
              id="user-id"
              type="text"
              value={user.id}
              disabled
              className="bg-muted cursor-not-allowed font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Your unique identifier (useful for support requests)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Project Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <CardTitle>Default Project Preferences</CardTitle>
          </div>
          <CardDescription>
            Set defaults to save time when creating new projects
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="brand-tone">Default Brand Tone</Label>
              <Select
                value={brandTone || 'none'}
                onValueChange={(value) =>
                  setBrandTone(value === 'none' ? null : (value as BrandTone))
                }
              >
                <SelectTrigger id="brand-tone">
                  <SelectValue placeholder="Choose a default brand tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <span className="text-muted-foreground">No default (ask each time)</span>
                  </SelectItem>
                  {brandToneOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This will be automatically applied to new generations. You can always override it
                per project.
              </p>
            </div>

            {brandToneChanged && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border">
                <div className="flex-1 text-sm">
                  <p className="font-medium">Unsaved changes</p>
                  <p className="text-muted-foreground text-xs">
                    Your brand tone preference has been changed
                  </p>
                </div>
                <Button onClick={handleSaveBrandTone} disabled={savingBrandTone}>
                  {savingBrandTone ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">How this helps</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Setting a default brand tone saves you time by automatically applying your
                  preferred aesthetic to all new generations. This is especially useful if you
                  consistently work with a particular style.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </div>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-semibold text-destructive">Delete Account</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Permanently delete your account and all associated data. This action cannot be
                  undone.
                </p>
                <ul className="mt-3 text-sm text-muted-foreground space-y-1">
                  <li>• All projects and generated images will be deleted</li>
                  <li>• Your subscription will be canceled</li>
                  <li>• Credit balance will be forfeited</li>
                  <li>• This cannot be reversed</li>
                </ul>
              </div>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                className="flex-shrink-0"
              >
                Delete Account
              </Button>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Need help instead?</p>
            <p className="text-sm text-muted-foreground mb-3">
              If you're experiencing issues or have concerns, please reach out to our support team
              before deleting your account. We're here to help!
            </p>
            <Button variant="outline" size="sm">
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Account Permanently?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                This action is <strong>permanent and irreversible</strong>. All of your data will be
                deleted:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>All projects and generated images</li>
                <li>Your subscription and billing information</li>
                <li>Credit balance and generation history</li>
                <li>Account settings and preferences</li>
              </ul>
              <div className="pt-4 border-t">
                <p className="font-medium text-foreground mb-2">
                  Type <span className="font-mono text-destructive">DELETE</span> to confirm:
                </p>
                <Input
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="Type DELETE"
                  className="font-mono"
                  disabled={deleting}
                />
              </div>
              <p className="text-xs">
                <strong>MVP Note:</strong> In this version, this will submit a deletion request to
                our team. You'll be contacted to confirm and complete the process.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation !== 'DELETE' || deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Delete My Account'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

