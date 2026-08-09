# Plan: Enable Multiple Image Uploads in Media Library

## 1. Repo Research Conclusion

### Current Architecture

The project uses **UploadThing** (`@uploadthing/react` v7.3.3, `uploadthing` v7.4.1) as the file upload backend, with a MongoDB Media collection for metadata.

**Key findings:**

1. **UploadThing config** (`app/api/uploadthing/core.ts`): The `mediaUploader` endpoint currently declares `image: { maxFileSize: "8MB" }` **without an explicit `maxFileCount`**. UploadThing defaults to allowing multiple files, but the count is unbounded — there's no guard against excessive simultaneous uploads.

2. **`onUploadComplete` callback**: Already creates one `Media` document **per file** (called individually per uploaded file). The database layer correctly handles multiple uploaded images.

3. **`UploadDropzone` component**: Used in both `MediaClient.tsx` and `MediaLibraryModal.tsx`. UploadThing's `UploadDropzone` already supports multi-file drag/drop or multi-select by default — no configuration change is needed to *allow* it. However, the UI feedback and toasts don't clearly communicate multi-upload status.

4. **MediaLibraryModal Browse tab**: Currently **SINGLE-select only**. Clicking an asset calls `onSelect(url)` and immediately closes the modal. This blocks workflows that need to pick multiple images (e.g., a product gallery).

5. **ImageUploader component**: Single-select (`value: string`, `onChange(url: string)`). Used for 7 single-image fields (featuredImage, logo, banner, etc.) — should remain single-select.

6. **Product Gallery (`images: string[]`)**: Currently uses a plain text input expecting comma-separated URLs (see [ProductManagerClient.tsx](file:///Users/n.i.nazmul/Documents/Working%20Files/Landing%20Page/qorvan/app/dashboard/products/ProductManagerClient.tsx#L574-L585)). There is **no visual gallery UI** and **no multi-select from the library**. The form data serializes `images` to a comma-separated string (`product.images.join(", ")`) and presumably splits it on save.

7. **Product actions save logic**: Needs verification for `images` split/join behavior.

### Summary of what "works already" vs "needs work"

| Capability | Status |
|---|---|
| Drag-drop multiple files into UploadDropzone | ✅ Works (UploadThing default) |
| Multi-select files from OS file picker | ✅ Works (UploadThing default) |
| Per-file Media document creation | ✅ Works (callback fires per file) |
| Toast for N files successfully uploaded | ❌ Singular wording in MediaLibraryModal; no count |
| Explicit `maxFileCount` limit to prevent abuse | ❌ Not set (unbounded) |
| Multi-select assets from Browse tab (in modal) | ❌ Single-select only, closes on click |
| Product gallery UI (thumbnails, reorder, remove) | ❌ Plain text input only |
| Multi-select modal used for product gallery | ❌ No integration |
| Settings/SEO ogImage uploader integration | ❌ Plain text only (out of scope, noted) |

---

## 2. Files and Modules to Edit

### Core Upload Layer
1. **`app/api/uploadthing/core.ts`** — Add explicit `maxFileCount` to protect against excessive simultaneous uploads.

### Shared Media Components
2. **`components/shared/MediaLibrary/MediaLibraryModal.tsx`** — Add multi-select mode prop (checkboxes, confirm button, selection counter), keep existing single-select as default. Fix toast wording for plural uploads.

3. **`components/shared/MultiImageUploader.tsx`** — **NEW FILE**. Gallery-style multi-image picker/editor (thumbnail grid + add from library + remove + reorder).

### Dashboard Media Page
4. **`app/dashboard/media/MediaClient.tsx`** — Improve upload completion toast to show count of uploaded files.

### Product Manager
5. **`app/dashboard/products/ProductManagerClient.tsx`** — Replace the comma-separated text input with the new `MultiImageUploader` component; fix form data serialization to/from `string[]`.

### Product Actions (verify & fix if needed)
6. **`lib/actions/product.actions.ts`** — Confirm `images` field is correctly handled as `string[]` (split comma input if needed).

---

## 3. Steps for Modifications or New Features

### Step 1 — Add explicit `maxFileCount` to UploadThing endpoint
- **File**: `app/api/uploadthing/core.ts`
- Change `image: { maxFileSize: "8MB" }` to `image: { maxFileSize: "8MB", maxFileCount: 20 }` (sensible limit of 20 images at a time).

### Step 2 — Enhance MediaLibraryModal with multi-select mode
- **File**: `components/shared/MediaLibrary/MediaLibraryModal.tsx`
- **Props changes**:
  - Add `mode?: "single" | "multi"` (default `"single"`).
  - Change `onSelect` to union:
    - Single mode: `onSelect: (url: string) => void`
    - Multi mode: add `onSelectMultiple?: (urls: string[]) => void`
    - Alternatively use a discriminating union or a single callback `onSelect: (value: string | string[]) => void`.
  - Add `initialSelection?: string[]` (for multi mode).
- **UI changes in Browse tab**:
  - If `mode === "multi"`: render a checkbox overlay on each tile; keep selection state (`Set<string>` of URLs).
  - Show a selection counter / summary bar at the bottom with "Select X images" and a "Confirm Selection" button (instead of click-to-close).
  - Keep `mode === "single"` behavior unchanged for existing consumers.
  - In Upload tab: change `toast.success("File uploaded successfully.")` to plural wording like `toast.success("File(s) uploaded successfully.")` since the dropzone accepts multiple.

### Step 3 — Create MultiImageUploader shared component
- **New File**: `components/shared/MultiImageUploader.tsx`
- **Props**:
  - `label?: string`
  - `value: string[]` (array of URLs)
  - `onChange: (urls: string[]) => void`
  - `maxImages?: number` (default 10)
  - `required?: boolean`
  - `className?: string`
- **Features**:
  - Render a grid of thumbnail previews (80x80, same style as single `ImageUploader`).
  - Each thumbnail has a hover "Remove" (X) overlay → splice out of array.
  - Drag-reorder (optional MVP: keep simple without drag, add up/down arrows or just append-only for simplicity).
  - An "Add Images from Library" button opens `MediaLibraryModal` in `mode="multi"` with `initialSelection`.
  - "Confirm" in modal → `onChange([...existing, ...newlySelected])` (dedupe URLs).
  - Show count: `3/10 images` when `maxImages` is set.
  - Empty state: dashed border placeholder + "Add images" CTA.
  - No manual URL text input (MVP decision: library-only; simpler UX and consistent with "upload multiple images" intent; gallery URLs should always come from the media library).

### Step 4 — Improve upload feedback in MediaClient
- **File**: `app/dashboard/media/MediaClient.tsx`
- The `UploadDropzone` `onClientUploadComplete` receives `res: UploadedFile[]` (array). Update `handleUploadComplete` signature to accept the results array and show a toast like `toast.success(`${res.length} file(s) uploaded successfully.`)`.

### Step 5 — Replace Product gallery text input with MultiImageUploader
- **File**: `app/dashboard/products/ProductManagerClient.tsx`
- **Form state**: Change `images: ""` (string) to `images: [] as string[]` (array).
- **Load editing product**: Replace `images: product.images ? product.images.join(", ") : ""` with `images: Array.isArray(product.images) ? product.images : []`.
- **UI**: Replace the text input block (lines ~574-585) with `<MultiImageUploader label="Gallery Images" value={formData.images} onChange={(urls) => setFormData({ ...formData, images: urls })} maxImages={15} />`.
- **Submission/serialization**: When submitting create/update, pass `images` as `formData.images` (ensure it's always an array — never a comma string). Remove any `split(",")` logic in favor of direct array.

### Step 6 — Verify product actions handle `images: string[]` correctly
- **File**: `lib/actions/product.actions.ts`
- Read the create/update product action bodies. Confirm that:
  - `images` is passed through as an array.
  - No accidental `images.split(",")` call exists on an array.
  - If a split call exists on the assumption of comma-separated input, remove it — the new UI always delivers `string[]`.
  - Add defensive `Array.isArray(images) ? images : []` normalization on the server side as a safety net.

---

## 4. Potential Dependencies or Considerations

- **UploadThing version compatibility**: `maxFileCount` in the file router config is supported in UploadThing v7.x (the repo uses 7.4.1). No new dependency installations are required.
- **Breaking changes to existing consumers of `ImageUploader`**: None. `ImageUploader` remains single-select and untouched. `MediaLibraryModal` defaults to `mode="single"` preserving existing behavior in all 7 places it's used.
- **Product create/update action signatures**: The actions currently accept the full form payload. No API signature change — only the shape of `images` changes from (possibly) comma-string to guaranteed `string[]`. Server-side defensive normalization in step 6 prevents old cached forms from breaking.
- **Zod validation schema**: Check `lib/validations/schemas.ts` for a product schema — ensure `images` is typed as `z.string().array()` or equivalent, not `z.string()`.

---

## 5. Risk Handling

| Risk | Mitigation |
|---|---|
| Adding `maxFileCount: 20` could block a user with a legitimate need to upload more than 20 at once | The limit is high enough for a batch; users can perform multiple sequential upload batches. If they need more, we can raise it. |
| `MediaLibraryModal` breaking existing single-select consumers | `mode` prop defaults to `"single"`; the single code path is left exactly as-is (click → `onSelect(url)` → close). Multi mode only activates when explicitly passed. |
| Product form previously saved `images` as a string; old records may be strings in DB | Mongoose likely coerces; but in `ProductManagerClient.tsx` load code, explicitly handle both: `Array.isArray(product.images) ? product.images : typeof product.images === "string" ? product.images.split(",").map(s => s.trim()).filter(Boolean) : []`. |
| Multi-select modal with 100s of images causing layout shift / scroll jump | Keep checkbox overlay small (top-left corner); the modal already has its own scroll container, so selection state doesn't affect layout. |
| User selecting duplicate URLs (same image twice) | In `MultiImageUploader` onChange, dedupe via `Array.from(new Set([...existing, ...new]))` before setting. |
| UploadThing `onClientUploadComplete` type mismatch for new handler signatures | Use the typed `UploadedFile` from `@uploadthing/react` or just `any[]` for the results array argument to avoid TS friction; length is all we need for the toast. |
