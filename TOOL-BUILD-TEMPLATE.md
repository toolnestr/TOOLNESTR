# Tool Build Template — Instructions for AI

Use this template when adding a **new tool page** to the site. Follow every section below exactly.

---

## 1. Register the tool in `src/data/tools.js`

Add a category entry if needed, then add the tool object:

```js
// Category (if new)
{ id: 'engineering', name: 'Electrical Engineering', emoji: '⚡' },

// Tool entry
{ slug: 'my-tool', title: 'My Tool Name', short: 'Short description under 60 chars.', category: 'engineering', emoji: '🔧', enabled: true, status: 'live' },
```

## 2. Add category content in `src/pages/tools/[category].astro`

Add an entry in `categoryContent`:

```js
engineering: {
  intro: 'One-sentence category intro.',
  highlights: [
    'Highlight benefit 1',
    'Highlight benefit 2',
    'Highlight benefit 3',
    'Highlight benefit 4',
  ],
},
```

## 3. Create the tool page at `src/pages/tools/{slug}.astro`

### 3a. Frontmatter block

```astro
---
import ToolLayout from '../../layouts/ToolLayout.astro';

const title = 'Tool Name';
const description = 'Free tool description for SEO meta. 150-160 chars.';
const intro = 'One-line intro explaining what the user enters and gets.';
const category = { id: 'engineering', name: 'Electrical Engineering' };
const faqs = [
  { q: 'Question?', a: 'Answer paragraph.' },
  // ...10 questions total
];
---
```

### 3b. ToolLayout wrapper

```astro
<ToolLayout title={title} description={description} intro={intro} category={category} faqs={faqs}>
```

All content goes inside this wrapper. ToolLayout provides breadcrumbs, H1, intro, FAQs, related tools, JSON-LD.

### 3c. Calculator UI

- A card (`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6`)
- Input fields with `<label>` + `<input>` or `<select>`, styled as:
  ```html
  <label class="block"><span class="text-sm font-medium text-slate-700">Label</span>
    <input id="x" type="number" step="any" placeholder="..." class="mt-1 w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" /></label>
  ```
- Result boxes using colored cards:
  ```html
  <div class="rounded-xl bg-indigo-600 p-5 text-center text-white">
    <div class="text-sm opacity-80">Label</div>
    <div id="r-x" class="mt-1 text-2xl font-bold">—</div>
  </div>
  ```

### 3d. Rich content sections (in order)

1. **Bar chart** — "What different X mean"
   - Horizontal colored bars showing ranges/categories
   ```html
   <section class="mt-10">
     <h2 class="text-xl font-bold text-slate-900">What different X mean</h2>
     <p class="mt-2 text-slate-600">Intro sentence.</p>
     <div class="mt-5 space-y-3">
       <div>
         <div class="flex items-baseline justify-between text-sm">
           <span class="font-medium text-slate-700">Label</span>
           <span class="text-slate-400">Range</span>
         </div>
         <div class="mt-1 h-3 w-full rounded-full bg-slate-100">
           <div class="h-3 rounded-full bg-emerald-500" style="width:X%"></div>
         </div>
       </div>
       <!-- repeat for each bar -->
     </div>
   </section>
   ```
   Bar colors cycle: `bg-emerald-500`, `bg-indigo-500`, `bg-amber-500`, `bg-orange-500`, `bg-red-500`, `bg-purple-500`

2. **Persona cards** — 4 cards in a 2-column grid
   ```html
   <section class="mt-10 grid gap-4 sm:grid-cols-2">
     <div class="rounded-xl border border-slate-200 bg-white p-5">
       <span class="text-2xl">👤</span>
       <h3 class="mt-2 font-semibold text-slate-900">Persona Name</h3>
       <p class="mt-1 text-sm text-slate-600">Description of how they use this tool.</p>
     </div>
     <!-- ...3 more -->
   </section>
   ```

3. **Reference table** — comparison/reference data
   ```html
   <section class="mt-10 overflow-hidden rounded-xl border border-slate-200">
     <table class="w-full text-left text-sm">
       <thead class="bg-slate-50 text-slate-500">
         <tr><th class="p-3">Header</th><th class="p-3">Header</th><th class="p-3">Header</th></tr>
       </thead>
       <tbody class="divide-y divide-slate-100 text-slate-700">
         <tr><td class="p-3 font-medium">Value</td><td class="p-3">Value</td><td class="p-3">Value</td></tr>
       </tbody>
     </table>
   </section>
   ```

4. **3-step guide** — "How to use the X"
   ```html
   <section class="mt-10">
     <h2 class="text-xl font-bold text-slate-900">How to use the X</h2>
     <div class="mt-4 grid gap-4 sm:grid-cols-3">
       <div class="rounded-xl border border-slate-200 bg-white p-4 text-center">
         <span class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700">1</span>
         <h3 class="mt-3 font-semibold text-slate-900">Step title</h3>
         <p class="mt-1 text-sm text-slate-600">Step description.</p>
       </div>
       <!-- step 2, step 3 -->
     </div>
   </section>
   ```

5. **Tips section**
   ```html
   <section class="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
     <h2 class="text-xl font-bold text-slate-900">Tips for best results</h2>
     <div class="mt-4 space-y-5">
       <div>
         <h3 class="font-semibold text-slate-900">Tip title</h3>
         <p class="mt-1 text-sm text-slate-600">Tip details.</p>
       </div>
       <!-- repeat -->
     </div>
   </section>
   ```

6. **Detailed content sections** — 3-5 sections with `h2` explaining the concept, formulas, applications, common mistakes

### 3e. Inline script

```html
<script is:inline>
const el = (id) => document.getElementById(id);
function update() {
  // Read input values, compute, update DOM
}
document.querySelectorAll('input,select').forEach((e) => e.addEventListener('input', update));
</script>
```

### 3f. FAQs

Provided via the `faqs` array in the frontmatter. ToolLayout renders them automatically.

---

## Rules summary

| Rule | Value |
|------|-------|
| Layout wrapper | `ToolLayout.astro` |
| Category format | `{ id: 'category-id', name: 'Category Name' }` |
| FAQ count | 10 |
| Content sections order | Bar chart → Personas → Reference table → 3-step guide → Tips → Content |
| Bar chart colors cycle | emerald, indigo, amber, orange, red, purple |
| Persona cards grid | `sm:grid-cols-2` (4 cards) |
| Input styling | `rounded-xl border border-slate-300 p-3 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100` |
| Result box (primary) | `rounded-xl bg-indigo-600 p-5 text-center text-white` |
| Result box (secondary) | `rounded-xl bg-slate-50 p-5 text-center` |
| JS pattern | `el(id)` helper, `update()` function, `addEventListener('input', update)` |
| Script type | `is:inline` (no client directives) |
