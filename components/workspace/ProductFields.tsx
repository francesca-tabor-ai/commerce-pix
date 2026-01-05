'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ProductFieldsProps {
  category: string
  onCategoryChange: (value: string) => void
  brandTone: string
  onBrandToneChange: (value: string) => void
  notes: string
  onNotesChange: (value: string) => void
}

const BRAND_TONES = [
  { value: 'professional', label: 'Professional' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'casual', label: 'Casual' },
  { value: 'playful', label: 'Playful' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'bold', label: 'Bold' },
]

export function ProductFields({
  category,
  onCategoryChange,
  brandTone,
  onBrandToneChange,
  notes,
  onNotesChange,
}: ProductFieldsProps) {
  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <h3 className="text-sm font-semibold mb-3">Product Details</h3>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            placeholder="e.g., Electronics, Clothing, Home Goods"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Help AI understand your product type
          </p>
        </div>

        {/* Brand Tone */}
        <div className="space-y-2">
          <Label htmlFor="brandTone">Brand Tone</Label>
          <Select value={brandTone} onValueChange={onBrandToneChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select brand tone" />
            </SelectTrigger>
            <SelectContent>
              {BRAND_TONES.map((tone) => (
                <SelectItem key={tone.value} value={tone.value}>
                  {tone.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Sets the style and mood of generated images
          </p>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Any specific requirements or context..."
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Additional context for better results
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

