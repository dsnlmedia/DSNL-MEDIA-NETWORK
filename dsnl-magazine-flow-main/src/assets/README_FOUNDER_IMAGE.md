# Founder Image Setup

## Required Action

Please add the founder's image (Dr. S. N. Lal's photograph) to this assets folder with the name `founder-dr-sn-lal.jpg`.

## Image Requirements

- **Format**: JPG or PNG
- **Recommended Size**: 400px width × 500px height (portrait orientation)
- **Quality**: High resolution for clear display
- **Background**: Professional portrait format

## File Location

Save the image as:
```
src/assets/founder-dr-sn-lal.jpg
```

## After Adding the Image

Update the import in `src/components/FounderSection.tsx`:

Replace:
```typescript
const founderImage = "/api/placeholder/400/500";
```

With:
```typescript
import founderImage from "@/assets/founder-dr-sn-lal.jpg";
```

This will properly display Dr. S. N. Lal's photograph in the Founder's Vision modal.