
# Dynamic Branding Colors Implementation Plan

## Summary
We need to implement dynamic branding colors that are editable in the dashboard settings and reflected in Tailwind CSS `bg-primary` and `text-primary` utilities using CSS variables.

## Key Files to Modify

1. **`lib/database/models/setting.model.ts`**  
   - Update the `ISetting` interface and `SettingSchema` to include branding color fields.
   - Fields: `primaryColor`, `primaryForegroundColor` (defaults matching current `#226B3A` and `#FFFFFF`).

2. **`types/index.ts`**  
   - Update `SettingFormParams` to include the new branding color fields.

3. **`lib/actions/setting.actions.ts`**  
   - Update `getSetting` (no change needed, it already returns all fields).
   - Update `updateSetting` to handle the new branding color fields.

4. **`tailwind.config.ts`**  
   - Change the `primary` color to use CSS variables instead of hard-coded hex values.

5. **`app/layout.tsx`**  
   - Fetch the settings in the root layout.
   - Inject CSS variables (e.g., `--primary`, `--primary-foreground`) into the HTML.

6. **`app/dashboard/settings/SettingsClient.tsx`**  
   - Update the UI to include inputs for setting the primary color and primary foreground color.

7. **`app/globals.css`**  
   - Add default values for the CSS variables in the `:root` selector.


## Step-by-Step Changes

### Step 1: Update the Setting Model
Add `primaryColor` and `primaryForegroundColor` to the `ISetting` interface and `SettingSchema` in `lib/database/models/setting.model.ts`.

### Step 2: Update Types
Add the new fields to `SettingFormParams` in `types/index.ts`.

### Step 3: Update Setting Actions
Modify `updateSetting` in `lib/actions/setting.actions.ts` to handle `primaryColor` and `primaryForegroundColor`.

### Step 4: Configure Tailwind
Update `tailwind.config.ts` so that `primary` uses CSS variables `--primary` and `--primary-foreground`.

### Step 5: Inject CSS Variables in Root Layout
In `app/layout.tsx`, retrieve the settings and add a `style` tag to the `html` or `body` element that sets the CSS variables.

### Step 6: Update Settings UI
Add color pickers in `app/dashboard/settings/SettingsClient.tsx` for the branding colors.

### Step 7: Set Defaults in `globals.css`
Add default values for `--primary` and `--primary-foreground` in the `:root` block.

