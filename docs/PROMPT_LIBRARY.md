# Prompt Library Documentation

Complete guide to CommercePix's Amazon-focused prompt system for AI image generation.

## Overview

The prompt library (`lib/prompts.ts`) provides server-only prompt templates for generating product images that comply with Amazon's strict listing requirements. Each mode has specific guardrails to ensure compliance and professional quality.

**Server-Only:** This library uses `'server-only'` to prevent accidental client-side exposure of prompt templates.

## Architecture

```
User Input (client)
    ↓
Mode Selection (main_white | lifestyle | feature_callout | packaging)
    ↓
Server validates & sanitizes inputs
    ↓
Compliance checks applied per mode
    ↓
Structured prompt generated
    ↓
Audit trail created (prompt_payload)
    ↓
OpenAI DALL-E API call
```

## Generation Modes

### 1. `main_white` - Amazon Main Image

**Purpose:** Pure white background product photography for Amazon main images.

**Requirements:**
- ✅ PURE white background (RGB: 255, 255, 255)
- ✅ NO props, accessories, or additional objects
- ✅ Realistic product representation
- ✅ Centered composition (80-85% of frame)
- ✅ NO text overlays, labels, or words

**Use Cases:**
- Amazon main product image (required)
- Product catalog listings
- E-commerce primary image
- Clean product showcase

**Example:**
```typescript
import { buildPrompt } from '@/lib/prompts'

const result = buildPrompt('main_white', {
  productDescription: 'wireless Bluetooth headphones',
  productCategory: 'electronics',
  brandTone: 'professional',
})

// result.prompt contains full DALL-E prompt
// result.promptPayload contains audit trail
```

**What Gets Generated:**
- Product on pure white background
- Front-facing angle
- Professional studio lighting
- Sharp focus throughout
- Minimal drop shadow for depth
- No text, props, or distractions

**Forbidden:**
- ❌ Any text, words, or labels
- ❌ Props or staging items
- ❌ People, hands, or body parts
- ❌ Colored/gradient backgrounds
- ❌ Artistic or dramatic lighting

---

### 2. `lifestyle` - Real-World Context

**Purpose:** Show product in authentic, realistic usage scenarios.

**Requirements:**
- ✅ Realistic scene that could exist in real life
- ✅ DO NOT invent included items or accessories
- ✅ Keep product representation 100% accurate
- ✅ Props for context ONLY (not suggesting inclusion)
- ✅ No misrepresentation of what customer receives

**Use Cases:**
- Secondary Amazon images
- Usage scenarios
- Lifestyle photography
- Context demonstrations

**Example:**
```typescript
const result = buildPrompt('lifestyle', {
  productDescription: 'stainless steel water bottle',
  productCategory: 'sports',
  brandTone: 'active',
  constraints: ['outdoor hiking setting'],
})
```

**What Gets Generated:**
- Product in natural, realistic environment
- Complementary props for context
- Product remains primary focus
- Authentic, achievable scene
- Natural or natural-looking lighting

**Forbidden:**
- ❌ Invented accessories suggesting inclusion
- ❌ Additional components not included
- ❌ Fantasy or impossible scenarios
- ❌ Misleading product presentation
- ❌ Props suggesting a bundle/set

---

### 3. `feature_callout` - Benefit Highlights

**Purpose:** Highlight exactly 3 key product benefits with text overlays.

**Requirements:**
- ✅ Text overlays ARE allowed (ONLY mode permitting text)
- ✅ Highlight EXACTLY 3 key benefits/features
- ✅ Clean e-commerce style suitable for Amazon
- ✅ Professional, informative (not promotional)
- ✅ Factual descriptions only (no marketing hype)

**Use Cases:**
- Feature highlight images
- Infographic-style product shots
- Benefit callout images
- Educational product images

**Example:**
```typescript
const result = buildPrompt('feature_callout', {
  productDescription: 'ergonomic office chair',
  productCategory: 'furniture',
  brandTone: 'professional',
})
```

**What Gets Generated:**
- Product on clean white/light gray background
- Exactly 3 benefit callouts with short text
- Subtle arrows/lines connecting text to features
- Minimal, professional graphic elements
- Clean infographic-style presentation

**Text Requirements:**
- Maximum 3 benefits
- 3-5 words per benefit
- Factual, informative language
- Clean sans-serif font
- Dark gray/black for readability

**Forbidden:**
- ❌ Promotional or marketing language
- ❌ Fake certifications or claims
- ❌ More or fewer than 3 callouts
- ❌ Unverifiable statements
- ❌ Competitor references

---

### 4. `packaging` - Retail Package Shot

**Purpose:** Show product in accurate, professional retail packaging.

**Requirements:**
- ✅ Product + packaging shown accurately
- ✅ NO fake claims, certifications, or seals
- ✅ NO invented badges, awards, or quality marks
- ✅ Generic, professional packaging design
- ✅ Realistic retail presentation

**Use Cases:**
- Package photography
- Unboxing preview images
- Retail display shots
- "What's in the box" images

**Example:**
```typescript
const result = buildPrompt('packaging', {
  productDescription: 'organic coffee beans',
  productCategory: 'food',
  brandTone: 'natural',
})
```

**What Gets Generated:**
- Product in professional retail packaging
- 3/4 angle view (front + side/top)
- Clean white or light gray background
- Generic, modern package design
- Sealed, new condition appearance

**Forbidden:**
- ❌ Fake certification seals (USDA Organic, FDA, etc.)
- ❌ Award marks or "best in class" badges
- ❌ Trademarked symbols (®, ™)
- ❌ Patent or certification claims
- ❌ Specific health/ingredient guarantees
- ❌ Quality marks requiring actual certification

---

## API Reference

### Types

```typescript
export type Mode = 'main_white' | 'lifestyle' | 'feature_callout' | 'packaging'

export interface PromptInputs {
  productCategory?: string  // e.g., "electronics", "clothing", "food"
  brandTone?: string         // e.g., "professional", "playful", "luxury"
  productDescription?: string // e.g., "wireless headphones"
  constraints?: string[]     // Additional constraints beyond defaults
}

export interface PromptResult {
  prompt: string              // Full prompt for DALL-E
  promptPayload: {
    mode: Mode
    version: string
    inputs: PromptInputs
    sanitizedInputs?: PromptInputs
    constraints: string[]
    template: string
    generatedAt: string
    complianceOverrides?: string[]
    complianceWarnings?: string[]
  }
}
```

### Main Function

```typescript
buildPrompt(mode: Mode, inputs?: PromptInputs): PromptResult
```

**Parameters:**
- `mode` - Generation mode (required)
- `inputs` - Structured prompt inputs (optional)

**Returns:**
- `PromptResult` with full prompt and audit payload

**Example:**
```typescript
import { buildPrompt } from '@/lib/prompts'

const result = buildPrompt('main_white', {
  productDescription: 'leather wallet',
  productCategory: 'accessories',
  brandTone: 'luxury',
})

console.log(result.prompt) // Full DALL-E prompt
console.log(result.promptPayload) // Audit trail
```

### Mode-Specific Functions

```typescript
buildMainWhitePrompt(inputs: PromptInputs): PromptResult
buildLifestylePrompt(inputs: PromptInputs): PromptResult
buildFeatureCalloutPrompt(inputs: PromptInputs): PromptResult
buildPackagingPrompt(inputs: PromptInputs): PromptResult
```

Each function:
1. Validates inputs for mode-specific compliance
2. Sanitizes disallowed terms
3. Applies mandatory constraints
4. Generates structured prompt
5. Creates audit trail

## Compliance System

### Amazon Compliance Rules

Applied to ALL modes:

- ✅ No visible logos from other companies
- ✅ No text on product (except authentic branding)
- ✅ No offensive or misleading imagery
- ✅ Professional e-commerce quality
- ✅ Clear product visibility
- ✅ Well-lit with accurate colors
- ✅ No watermarks or decorative frames
- ✅ High resolution and sharp focus

### Validation & Sanitization

**Process:**
1. Check inputs for disallowed terms
2. Sanitize text by removing violations
3. Apply mode-specific mandatory constraints
4. Record overrides and warnings
5. Return sanitized inputs with audit trail

**Example:**
```typescript
// Input contains disallowed terms
const inputs = {
  productDescription: 'certified organic headphones with text overlay'
}

// System sanitizes for main_white mode
const result = buildPrompt('main_white', inputs)

// result.promptPayload.complianceWarnings contains:
// ["Original description contained terms incompatible with main_white"]

// result.promptPayload.sanitizedInputs.productDescription:
// "headphones" (removed "certified organic" and "text overlay")
```

### Mode-Specific Guardrails

#### `main_white` Guardrails

**Disallowed Terms:**
- text, words, label, typography, caption
- props, accessories, objects, items
- background scene, environment, context
- dramatic lighting, colored background, gradient

**Forced Constraints:**
- Pure white background (RGB: 255, 255, 255)
- No text, words, or labels
- No props or accessories
- Product centered, front-facing
- Realistic studio lighting

#### `lifestyle` Guardrails

**Disallowed Terms:**
- fake, mockup, placeholder, dummy
- includes, comes with, bonus, free
- set of, bundle, package includes

**Forced Constraints:**
- All items realistic and appropriate
- Props do NOT imply inclusion
- Product representation accurate
- Scene achievable in real life

#### `feature_callout` Guardrails

**Disallowed Terms:**
- certified, approved, FDA, medical grade
- guaranteed, proven, scientifically tested
- award-winning, best seller, #1
- patent, trademarked, copyrighted

**Forced Constraints:**
- Text must be factual, not promotional
- No certifications or unverifiable claims
- Professional, minimal visual callouts
- Focus on actual features, not hype

#### `packaging` Guardrails

**Disallowed Terms:**
- organic seal, USDA organic, certified organic
- FDA approved, medical device, prescription
- patent pending, trademarked, ®, ™
- award seal, badge, certification mark

**Forced Constraints:**
- Generic professional packaging
- No certification seals or badges
- No specific ingredient/health claims
- Realistic, achievable packaging design

## Usage Examples

### Basic Usage

```typescript
import { buildPrompt } from '@/lib/prompts'

// Simple main_white image
const result = buildPrompt('main_white', {
  productDescription: 'blue ceramic mug',
})

console.log(result.prompt)
// Full prompt with pure white bg requirements

console.log(result.promptPayload.constraints)
// Array of all applied constraints
```

### With Category and Tone

```typescript
const result = buildPrompt('lifestyle', {
  productDescription: 'yoga mat',
  productCategory: 'sports',
  brandTone: 'minimal',
})

// Generates lifestyle scene with:
// - Sports/fitness context
// - Minimal aesthetic
// - Natural, authentic setting
```

### With Custom Constraints

```typescript
const result = buildPrompt('feature_callout', {
  productDescription: 'smart watch',
  productCategory: 'electronics',
  brandTone: 'professional',
  constraints: [
    'highlight heart rate monitoring',
    'show water resistance feature',
    'emphasize battery life',
  ],
})

// Generates feature callout with:
// - 3 benefit callouts
// - Custom feature focus
// - Professional style
```

### Accessing Audit Trail

```typescript
const result = buildPrompt('packaging', {
  productDescription: 'vitamin supplement',
  productCategory: 'health',
})

// Full audit trail
console.log(result.promptPayload)
// {
//   mode: 'packaging',
//   version: 'v1',
//   inputs: { ... },
//   sanitizedInputs: { ... }, // If sanitization occurred
//   constraints: [...],
//   template: 'packaging_v1',
//   generatedAt: '2026-01-05T12:00:00.000Z',
//   complianceOverrides: [...], // If any overrides applied
//   complianceWarnings: [...], // If any warnings
// }
```

## Integration with Generation API

### In `/api/generate` Route

```typescript
import { buildPrompt, type PromptInputs } from '@/lib/prompts'

export async function POST(request: NextRequest) {
  const { mode, productDescription, productCategory, brandTone } = await request.json()
  
  // Build prompt with compliance checks
  const promptInputs: PromptInputs = {
    productDescription,
    productCategory,
    brandTone,
  }
  
  const { prompt, promptPayload } = buildPrompt(mode, promptInputs)
  
  // Call DALL-E with generated prompt
  const response = await openai.images.edit({
    model: 'dall-e-2',
    image: inputFile,
    prompt: prompt, // ← Compliant prompt
    n: 1,
    size: '1024x1024',
  })
  
  // Store promptPayload in database for audit trail
  await createAsset({
    ...assetData,
    prompt_payload: promptPayload, // ← Full audit trail
  })
}
```

### Storing Audit Trail

```sql
-- assets table stores complete audit trail
CREATE TABLE assets (
  id uuid PRIMARY KEY,
  prompt_payload jsonb, -- Full promptPayload object
  -- ... other fields
)
```

**Example stored payload:**
```json
{
  "mode": "main_white",
  "version": "v1",
  "inputs": {
    "productDescription": "leather wallet",
    "productCategory": "accessories",
    "brandTone": "luxury"
  },
  "constraints": [
    "No visible logos from other companies",
    "No text on product",
    "MANDATORY: Pure white background",
    "MANDATORY: No text or labels"
  ],
  "template": "main_white_v1",
  "generatedAt": "2026-01-05T12:00:00.000Z",
  "complianceOverrides": [
    "Applied main_white mandatory constraints"
  ]
}
```

## Product Categories

Supported categories with context:

| Category | Context Description |
|----------|---------------------|
| electronics | Modern tech product |
| clothing | Fashion item |
| food | Food product |
| beauty | Beauty or cosmetic product |
| home | Home goods item |
| toys | Toy or children's product |
| sports | Sports or fitness equipment |
| books | Book or publication |

**Custom categories:** Any string is accepted, but recognized categories get enhanced context.

## Brand Tones

Supported tones with descriptions:

| Tone | Description |
|------|-------------|
| professional | Professional, clean, and business-appropriate |
| luxury | Luxurious, premium, and high-end |
| playful | Fun, energetic, and approachable |
| minimal | Minimalist, simple, and elegant |
| bold | Bold, striking, and attention-grabbing |

**Custom tones:** Any string is accepted, defaults to "professional and appealing".

## Best Practices

### 1. Choose the Right Mode

```typescript
// Amazon main image? Use main_white
buildPrompt('main_white', { ... })

// Show product in use? Use lifestyle
buildPrompt('lifestyle', { ... })

// Highlight features? Use feature_callout
buildPrompt('feature_callout', { ... })

// Show packaging? Use packaging
buildPrompt('packaging', { ... })
```

### 2. Provide Accurate Descriptions

```typescript
// ✅ Good: Specific and accurate
{
  productDescription: 'stainless steel insulated water bottle with flip-top lid',
  productCategory: 'sports',
}

// ❌ Bad: Vague or misleading
{
  productDescription: 'amazing water bottle with free carrying case',
  // (Don't mention items not included)
}
```

### 3. Use Constraints Appropriately

```typescript
// ✅ Good: Relevant, specific constraints
{
  constraints: [
    'show product at 45-degree angle',
    'emphasize texture detail',
  ]
}

// ❌ Bad: Constraints that violate mode rules
{
  constraints: [
    'add text overlay saying "Best Quality"', // ← Violates main_white
    'show with included accessories', // ← Violates lifestyle accuracy
  ]
}
```

### 4. Review Compliance Warnings

```typescript
const result = buildPrompt('main_white', inputs)

if (result.promptPayload.complianceWarnings) {
  console.warn('Compliance issues:', result.promptPayload.complianceWarnings)
  // Log or alert for review
}
```

### 5. Store Complete Audit Trail

```typescript
// Always store promptPayload for audit trail
await createAsset({
  ...assetData,
  prompt_payload: result.promptPayload, // ← Complete audit trail
  prompt_version: result.promptPayload.version,
})
```

## Testing

### Unit Tests

```typescript
import { buildPrompt } from '@/lib/prompts'
import { describe, it, expect } from '@jest/globals'

describe('Prompt Library', () => {
  it('should generate main_white prompt with pure white background', () => {
    const result = buildPrompt('main_white', {
      productDescription: 'coffee mug',
    })
    
    expect(result.prompt).toContain('pure white background')
    expect(result.prompt).toContain('RGB: 255, 255, 255')
    expect(result.prompt).not.toContain('text')
    expect(result.prompt).not.toContain('props')
  })
  
  it('should sanitize disallowed terms for main_white', () => {
    const result = buildPrompt('main_white', {
      productDescription: 'coffee mug with text label',
    })
    
    expect(result.promptPayload.sanitizedInputs?.productDescription).not.toContain('text')
    expect(result.promptPayload.complianceWarnings).toBeDefined()
  })
  
  it('should allow text overlays only in feature_callout', () => {
    const result = buildPrompt('feature_callout', {
      productDescription: 'smart phone',
    })
    
    expect(result.prompt).toContain('text overlays')
    expect(result.prompt).toContain('3')
    expect(result.prompt).toContain('benefit')
  })
})
```

### Integration Tests

```typescript
// Test with actual DALL-E API
import { buildPrompt } from '@/lib/prompts'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

async function testGeneration() {
  const result = buildPrompt('main_white', {
    productDescription: 'ceramic vase',
    brandTone: 'minimal',
  })
  
  const response = await openai.images.edit({
    model: 'dall-e-2',
    image: inputFile,
    prompt: result.prompt,
    n: 1,
    size: '1024x1024',
  })
  
  console.log('Generated image:', response.data[0].url)
  console.log('Audit trail:', result.promptPayload)
}
```

## Troubleshooting

### Issue: Generated images have text

**Problem:** main_white or lifestyle images contain text overlays.

**Solution:**
- Verify mode is `'main_white'` not `'feature_callout'`
- Check that sanitization is working
- Review `complianceWarnings` for issues

### Issue: Products have extra items

**Problem:** Lifestyle images show accessories not included with product.

**Solution:**
- Review `productDescription` for terms like "includes", "comes with"
- Use `constraints` to specify what should NOT appear
- Check `complianceWarnings` for sanitization

### Issue: Packaging has fake certifications

**Problem:** Packaging images show certification seals.

**Solution:**
- Verify using `packaging` mode with latest guardrails
- Check that input doesn't contain certification terms
- Review generated `promptPayload.complianceOverrides`

### Issue: Prompt too generic

**Problem:** Generated images lack specificity.

**Solution:**
- Provide detailed `productDescription`
- Specify `productCategory` for context
- Use `constraints` for additional guidance
- Choose appropriate `brandTone`

## Version History

### v1 (Current)

**Features:**
- Four generation modes (main_white, lifestyle, feature_callout, packaging)
- Compliance validation and sanitization
- Amazon-focused guardrails
- Structured audit trail
- Server-only security

**main_white_v1:**
- Pure white background requirement
- No text/props enforcement
- Centered composition
- Professional studio lighting

**lifestyle_v1:**
- Realistic scene requirement
- No invented items enforcement
- Accuracy guardrails
- Context props allowed

**feature_callout_v1:**
- Exactly 3 benefits requirement
- Text overlay permission (only mode)
- Factual language enforcement
- Clean infographic style

**packaging_v1:**
- Accurate packaging requirement
- No fake certifications enforcement
- Generic design requirement
- Retail quality standards

## Security

### Server-Only Enforcement

```typescript
import 'server-only' // ← Prevents client-side imports
```

**Why:**
- Prompt templates are proprietary
- Prevents prompt injection attacks
- Ensures consistent compliance
- Protects business logic

### Input Sanitization

All inputs are sanitized to prevent:
- Prompt injection
- Disallowed content
- Compliance violations
- Misleading claims

### Audit Trail

Every generation stores:
- Original inputs
- Sanitized inputs (if different)
- All applied constraints
- Compliance overrides
- Warnings issued
- Generation timestamp

## Future Enhancements

**Planned:**
- Additional modes (360-degree, size comparison, detail close-up)
- Multi-language support
- A/B testing prompts
- ML-based prompt optimization
- Industry-specific templates (fashion, food, electronics)

**Under Consideration:**
- Video generation prompts
- AR/3D model prompts
- Batch generation optimization
- Custom brand style guides

## Conclusion

The prompt library provides:

- ✅ **Amazon Compliance** - Built-in guardrails for marketplace approval
- ✅ **Mode Specificity** - Tailored prompts for each image type
- ✅ **Automatic Sanitization** - Removes disallowed content
- ✅ **Audit Trail** - Complete generation history
- ✅ **Server Security** - Protected proprietary templates
- ✅ **Extensible** - Easy to add new modes/constraints

Use the appropriate mode for each image type, provide accurate inputs, and let the system handle compliance automatically.

---

**For support or questions:** See [API Reference](#api-reference) or contact the development team.
