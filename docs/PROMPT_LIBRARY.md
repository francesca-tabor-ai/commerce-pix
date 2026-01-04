# Prompt Library Documentation

## Overview

The Commerce PIX prompt library (`lib/prompts.ts`) provides structured, reusable prompt templates for AI image generation. All prompts are **server-side only** and include Amazon compliance rules by default.

## Key Principles

1. **Server-Side Only**: Clients select a `mode`, not the full prompt
2. **Structured Inputs**: Prompts are built from structured parameters, not free-form text
3. **Audit Trail**: Every generation includes a `prompt_payload` JSON object for auditing
4. **Amazon Compliance**: All prompts include e-commerce best practices and Amazon guidelines

## Modes

### 1. `main_white` (v1)
**Purpose**: Professional product photo on pure white background  
**Ideal for**: Amazon main images, product catalogs, e-commerce listings

**Features**:
- Pure white background (RGB: 255, 255, 255)
- Product centered in frame (80-85% coverage)
- Front-facing primary angle
- Bright, even lighting from multiple angles
- No harsh shadows
- Slight shadow under product for depth

**Use Cases**:
- Amazon main product image
- Product catalog listing
- Search result thumbnail
- Category page display

---

### 2. `lifestyle` (v1)
**Purpose**: Product in real-world context  
**Ideal for**: Secondary images, lifestyle shots, usage scenarios

**Features**:
- Natural, authentic environment
- Product in context but clearly visible as focal point
- Realistic setting with complementary props
- Natural or natural-looking lighting
- Warm, inviting atmosphere
- Optional human element (hands using product)

**Use Cases**:
- Amazon secondary images
- Social media marketing
- Email campaigns
- Product stories

---

### 3. `feature_callout` (v1)
**Purpose**: Highlight specific product features  
**Ideal for**: Feature highlights, infographic-style images, benefit callouts

**Features**:
- Clean, uncluttered background (light gray or white)
- Product positioned to showcase important features
- Subtle visual cues (arrows, circles, lines)
- Close-up insets showing details
- Informative and clear presentation
- Marketing-focused but not cluttered

**Use Cases**:
- Feature comparison images
- Product detail pages
- Marketing collateral
- Benefit explanations

---

### 4. `packaging` (v1)
**Purpose**: Product in retail packaging  
**Ideal for**: Package shots, unboxing previews, retail displays

**Features**:
- Complete retail packaging shown
- Angled view (3/4 angle showing front + side/top)
- Package takes up 75-85% of frame
- Professional studio lighting
- Minimal glare on glossy surfaces
- Sealed, new condition appearance

**Use Cases**:
- Package design previews
- Retail display planning
- Unboxing content
- Gift shopping scenarios

---

## Structured Inputs

### `PromptInputs` Interface

```typescript
interface PromptInputs {
  productCategory?: string  // e.g., "electronics", "clothing", "food"
  brandTone?: string         // e.g., "professional", "playful", "luxury"
  productDescription?: string // e.g., "wireless headphones", "organic coffee"
  constraints?: string[]     // Additional constraints beyond defaults
}
```

### Product Categories

| Category | Context |
|----------|---------|
| `electronics` | Modern tech product |
| `clothing` | Fashion item |
| `food` | Food product |
| `beauty` | Beauty or cosmetic product |
| `home` | Home goods item |
| `toys` | Toy or children's product |
| `sports` | Sports or fitness equipment |
| `books` | Book or publication |

### Brand Tones

| Tone | Description |
|------|-------------|
| `professional` | Professional, clean, and business-appropriate |
| `luxury` | Luxurious, premium, and high-end |
| `playful` | Fun, energetic, and approachable |
| `minimal` | Minimalist, simple, and elegant |
| `bold` | Bold, striking, and attention-grabbing |

---

## Usage

### Basic Usage

```typescript
import { buildPrompt } from '@/lib/prompts'

// Simple generation with just mode
const result = buildPrompt('main_white')

// With structured inputs
const result = buildPrompt('lifestyle', {
  productDescription: 'wireless headphones',
  productCategory: 'electronics',
  brandTone: 'professional',
})
```

### Result Structure

```typescript
interface PromptResult {
  prompt: string              // Full prompt for DALL-E
  promptPayload: {           // JSON object for auditing
    mode: Mode
    version: string
    inputs: PromptInputs
    constraints: string[]
    template: string
    generatedAt: string      // ISO 8601 timestamp
  }
}
```

### API Integration

The `/api/generate` endpoint accepts structured inputs and uses the prompt library internally:

```typescript
// POST /api/generate
{
  "inputAssetId": "uuid",
  "mode": "main_white",
  "productDescription": "wireless headphones",
  "productCategory": "electronics",
  "brandTone": "professional",
  "promptVersion": "v1"
}
```

The server:
1. Validates authentication and input asset
2. Builds prompt using `buildPrompt()` with structured inputs
3. Calls OpenAI DALL-E 3 API
4. Stores `promptPayload` in `assets.prompt_payload` for auditing
5. Returns job ID

---

## Amazon Compliance Rules

All prompts automatically include these compliance rules:

- ✅ No visible logos or brand names from other companies
- ✅ No text or words on the product (except authentic product branding)
- ✅ No offensive, inappropriate, or misleading imagery
- ✅ Professional quality suitable for e-commerce
- ✅ Clear product visibility from front/primary angle
- ✅ Well-lit with proper exposure and color accuracy
- ✅ No watermarks, borders, or decorative frames
- ✅ High resolution and sharp focus on product

### Additional Constraints

You can add custom constraints per generation:

```typescript
const result = buildPrompt('main_white', {
  productDescription: 'glass bottle',
  constraints: [
    'Product must be photographed on non-reflective surface',
    'Avoid harsh reflections on glass',
  ],
})
```

---

## Prompt Versioning

Each template has a version (e.g., `v1`). When improving prompts:

1. Create a new version function (e.g., `buildMainWhitePromptV2`)
2. Update the `buildPrompt()` switch to support both versions
3. Accept a `version` parameter in API calls
4. Store `prompt_version` in database for audit trail

This allows:
- A/B testing of prompt improvements
- Rollback if new version underperforms
- Historical comparison of results
- Gradual migration to improved prompts

---

## Testing

### Test Page: `/api-test`

The API test page allows interactive testing of:
1. **Upload**: Upload input image
2. **Generate**: Trigger generation with structured inputs
3. **View**: Fetch signed URLs for generated outputs

### Test Workflow

1. Navigate to `/api-test`
2. Select a project
3. Upload an input image (jpg/png/webp, max 8MB)
4. Fill in structured inputs:
   - **Input Asset**: Select from uploaded assets
   - **Mode**: Choose generation mode
   - **Product Description**: Optional description
   - **Product Category**: Optional category
   - **Brand Tone**: Optional tone
5. Click "Generate"
6. Monitor job status in `/jobs-test`
7. View generated output using signed URL

---

## Security

### Why Server-Side Only?

1. **Prompt Injection Protection**: Users can't manipulate prompts to generate inappropriate content
2. **Business Logic Protection**: Competitors can't reverse-engineer prompt strategies
3. **Cost Control**: Server validates all requests before calling OpenAI
4. **Compliance**: Server enforces Amazon rules in every prompt
5. **Consistency**: All generations use tested, approved prompts

### Import Verification

The library includes `import 'server-only'` at the top to prevent accidental client-side imports. If you try to import it in a Client Component, you'll get a build error.

---

## Future Enhancements

### Planned Improvements

1. **Dynamic Constraints**: Mode-specific constraint libraries
2. **Prompt Analytics**: Track which prompts produce best results
3. **Multi-Language**: Support for international markets
4. **Custom Brand Profiles**: User-defined brand guidelines
5. **Advanced Modes**: 360-view, comparison, size guide, etc.
6. **Fine-Tuning Integration**: Use custom models trained on brand style

### Adding New Modes

To add a new mode:

1. Define mode in `Mode` type union
2. Create template function (e.g., `buildCustomModePrompt`)
3. Add case to `buildPrompt()` switch
4. Update database ENUM if necessary
5. Document in this file
6. Add to API test UI

---

## Example Prompts

### Main White - Electronics

```
Create a professional product photography image of wireless headphones (modern tech product).

COMPOSITION:
- Pure white background (RGB: 255, 255, 255)
- Product centered in frame
- Front-facing primary angle
- Product takes up 80-85% of frame
- Slight shadow under product for depth

LIGHTING:
- Bright, even lighting from multiple angles
- No harsh shadows
- Proper exposure with no overblown highlights
- Natural color representation

STYLE:
- professional and appealing aesthetic
- Commercial photography quality
- Professional studio setup
- Sharp focus throughout product

REQUIREMENTS:
- No visible logos or brand names from other companies
- No text or words on the product (except authentic product branding)
- No offensive, inappropriate, or misleading imagery
...
```

### Lifestyle - Food

```
Create a lifestyle product photography image showing organic coffee (food product) in a real-world setting.

SCENE:
- Natural, authentic environment where product would be used
- Product in context but clearly visible as the focal point
- Realistic setting with complementary props or background
- Human element optional (hands using product, or lifestyle context)

COMPOSITION:
- Product prominent but naturally integrated into scene
- Rule of thirds or other compositionally pleasing arrangement
...
```

---

## Related Documentation

- [Database Schema](./DATABASE_SCHEMA.md) - `assets` table and `prompt_payload` JSONB column
- [API Documentation](./API_DOCUMENTATION.md) - `/api/generate` endpoint details
- [Storage Implementation](./STORAGE_IMPLEMENTATION.md) - File upload and signed URLs

---

## Support

For questions or issues with the prompt library:
1. Check this documentation
2. Review example usage in `/app/api/generate/route.ts`
3. Test interactively at `/api-test`
4. Check generation job logs in database

