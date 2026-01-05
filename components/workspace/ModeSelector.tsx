'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Check } from 'lucide-react'

type Mode = 'main_white' | 'lifestyle' | 'feature_callout' | 'packaging'

interface ModeSelectorProps {
  selectedMode: Mode
  onModeChange: (mode: Mode) => void
}

const MODES = [
  {
    id: 'main_white' as Mode,
    name: 'Main Image',
    description: 'Clean white background, Amazon main image compliant',
    icon: '🎯',
  },
  {
    id: 'lifestyle' as Mode,
    name: 'Lifestyle',
    description: 'Product in real-world context and usage scenarios',
    icon: '🏡',
  },
  {
    id: 'feature_callout' as Mode,
    name: 'Feature Callout',
    description: 'Highlight key features with annotations',
    icon: '⭐',
  },
  {
    id: 'packaging' as Mode,
    name: 'Packaging / In-box',
    description: 'Professional packaging and unboxing shots',
    icon: '📦',
  },
]

export function ModeSelector({ selectedMode, onModeChange }: ModeSelectorProps) {
  return (
    <Card>
      <CardContent className="p-6 space-y-3">
        <h3 className="text-sm font-semibold mb-3">Generation Mode</h3>

        <div className="space-y-2">
          {MODES.map((mode) => {
            const isSelected = selectedMode === mode.id
            return (
              <button
                key={mode.id}
                onClick={() => onModeChange(mode.id)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl">{mode.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-sm mb-1">{mode.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {mode.description}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

