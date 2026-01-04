'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Check } from 'lucide-react'

type Mode = 'main_white' | 'lifestyle' | 'feature_callout' | 'packaging'

interface ModeSettings {
  mode: Mode
  productCategory?: string
  brandTone?: string
  productDescription?: string
  scene?: string
}

interface ModeSelectorProps {
  value: ModeSettings
  onChange: (settings: ModeSettings) => void
  disabled?: boolean
}

const MODES = [
  {
    id: 'main_white' as Mode,
    name: 'Main Image',
    subtitle: 'White Background',
    description: 'Professional product photo on pure white background. Ideal for Amazon main images.',
    icon: '🎯',
  },
  {
    id: 'lifestyle' as Mode,
    name: 'Lifestyle Scene',
    subtitle: 'In Context',
    description: 'Product in real-world setting. Shows usage and creates emotional connection.',
    icon: '🏠',
  },
  {
    id: 'feature_callout' as Mode,
    name: 'Feature Callout',
    subtitle: 'Highlight Details',
    description: 'Emphasize key features with visual cues. Great for technical or benefit-focused images.',
    icon: '✨',
  },
  {
    id: 'packaging' as Mode,
    name: 'Packaging / In-Box',
    subtitle: 'Retail Ready',
    description: 'Product in professional retail packaging. Perfect for unboxing and gift previews.',
    icon: '📦',
  },
]

const BRAND_TONES = [
  { value: '', label: 'Default' },
  { value: 'professional', label: 'Clean / Minimal' },
  { value: 'luxury', label: 'Premium' },
  { value: 'playful', label: 'Playful' },
  { value: 'bold', label: 'Rugged' },
]

const SCENES = [
  { value: '', label: 'Any Scene' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'bathroom', label: 'Bathroom' },
  { value: 'desk', label: 'Desk / Office' },
  { value: 'outdoor', label: 'Outdoor' },
  { value: 'living room', label: 'Living Room' },
  { value: 'bedroom', label: 'Bedroom' },
  { value: 'gym', label: 'Gym / Fitness' },
  { value: 'car', label: 'Car / Travel' },
]

export default function ModeSelector({ value, onChange, disabled }: ModeSelectorProps) {
  const handleModeChange = (mode: Mode) => {
    onChange({ ...value, mode })
  }

  const handleFieldChange = (field: keyof ModeSettings, fieldValue: string) => {
    onChange({ ...value, [field]: fieldValue })
  }

  return (
    <div className="space-y-6">
      {/* Mode Cards */}
      <div>
        <Label className="text-base mb-3 block">Select Generation Mode</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => !disabled && handleModeChange(mode.id)}
              disabled={disabled}
              className={`relative text-left p-4 rounded-lg border-2 transition-all ${
                value.mode === mode.id
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-muted-foreground/50 bg-background'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {/* Selected indicator */}
              {value.mode === mode.id && (
                <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}

              {/* Content */}
              <div className="flex items-start gap-3">
                <div className="text-2xl shrink-0">{mode.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{mode.name}</div>
                  <div className="text-xs text-muted-foreground mb-1">{mode.subtitle}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    {mode.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Optional Settings */}
      <div className="space-y-4 pt-4 border-t">
        <div>
          <Label className="text-sm mb-2 block">Optional Settings</Label>
          <p className="text-xs text-muted-foreground mb-4">
            Customize the generation with additional details. These settings are optional but help create more accurate results.
          </p>
        </div>

        {/* Product Description */}
        <div className="space-y-2">
          <Label htmlFor="product-description" className="text-sm">
            Product Description
          </Label>
          <Input
            id="product-description"
            placeholder="e.g., wireless headphones, organic coffee, leather wallet"
            value={value.productDescription || ''}
            onChange={(e) => handleFieldChange('productDescription', e.target.value)}
            disabled={disabled}
          />
          <p className="text-xs text-muted-foreground">
            Brief description of your product
          </p>
        </div>

        {/* Product Category */}
        <div className="space-y-2">
          <Label htmlFor="product-category" className="text-sm">
            Product Category
          </Label>
          <Input
            id="product-category"
            placeholder="e.g., electronics, clothing, food"
            value={value.productCategory || ''}
            onChange={(e) => handleFieldChange('productCategory', e.target.value)}
            disabled={disabled}
          />
          <p className="text-xs text-muted-foreground">
            What type of product is this?
          </p>
        </div>

        {/* Brand Tone */}
        <div className="space-y-2">
          <Label htmlFor="brand-tone" className="text-sm">
            Brand Tone
          </Label>
          <Select
            value={value.brandTone || ''}
            onValueChange={(val) => handleFieldChange('brandTone', val)}
            disabled={disabled}
          >
            <SelectTrigger id="brand-tone">
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
            Visual style and aesthetic approach
          </p>
        </div>

        {/* Scene (only for lifestyle) */}
        {value.mode === 'lifestyle' && (
          <div className="space-y-2">
            <Label htmlFor="scene" className="text-sm">
              Scene Setting
            </Label>
            <Select
              value={value.scene || ''}
              onValueChange={(val) => handleFieldChange('scene', val)}
              disabled={disabled}
            >
              <SelectTrigger id="scene">
                <SelectValue placeholder="Select scene" />
              </SelectTrigger>
              <SelectContent>
                {SCENES.map((scene) => (
                  <SelectItem key={scene.value} value={scene.value}>
                    {scene.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Where should the product be shown? (Lifestyle mode only)
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

