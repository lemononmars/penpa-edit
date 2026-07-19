1. **Improve variant other names display**:
   - In `docs/src/VariantCatalogApp.svelte`, modify the rendering of `variation.otherNames`. Instead of a single span, we will split `variation.otherNames` by commas (if it's a comma-separated string) or handle it accordingly, and render each name on a new line (e.g. using `<div class="other-name">{name.trim()}</div>`).

2. **Add "Has Example" filter**:
   - Add a new state variable `hasExampleFilter = "all"` in `docs/src/VariantCatalogApp.svelte`.
   - Update the `filteredVariations` reactive block to filter by `hasExampleFilter` (e.g., if `"yes"`, `variation.example` must be truthy; if `"no"`, `variation.example` must be falsy).
   - Add a new `<label>` and `<select>` for this filter in the toolbar area, next to Status and Tag filters.

3. **Add "Feeling Lucky" button**:
   - Add a "Feeling lucky!" button in the toolbar.
   - The click handler will clear the `query`, evaluate `filteredVariations`, pick a random variant from it, and set `query` to its exact name.

4. **Add "Suggests a variant" link**:
   - Add a link somewhere appropriate (maybe below the "Variant not found" or above the table) pointing to GitHub to create a new pull request/issue. Since the instruction says "suggests a variant ... would create a new pull request on gibhub", I can create a link that opens a new issue/PR on the repo. Wait, the prompt says "create a new pull request on gibhub". Maybe link to `https://github.com/lemononmars/penpa-edit/compare` or `https://github.com/lemononmars/penpa-edit/pulls`? Or just `https://github.com/lemononmars/penpa-edit/issues/new`? Let's use `https://github.com/lemononmars/penpa-edit/pulls`.

5. **Run tests & verify frontend**:
   - Run relevant tests (e.g., `npm run test:solver`) to verify the changes and ensure no regressions are introduced.
   - Use `frontend_verification_instructions` and verify frontend changes.

6. **Pre-commit step**:
   - Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.

7. **Submit**:
   - Commit the changes and push.
