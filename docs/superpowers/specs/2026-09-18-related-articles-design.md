# Related Articles — Design

## Context

Article pages (`app/biblioteca/[categorie]/[subcategorie]/[slug]/page.tsx`) render
`article.blocuri` through the page-builder `BlockRenderer`, the same mechanism used
for full CMS `page`s. There is currently no "related articles" or "similar content"
concept anywhere in the frontend or backend — greenfield on both sides (confirmed by
grep: no `related`/`similar`/`inrudit` hits in either repo).

Article tags (`etichete`) are a plain `json` string array on the article content type
(`../crestem-ong-backend/src/api/article/content-types/article/schema.json`), entered
via a free-text chip input (`components/features/biblioteca/TagsField.tsx`) with
autocomplete suggestions drawn from other articles' tags — not a relation to a
taxonomy content-type. `draftAndPublish` is `false` on this content type; publish
state is tracked by its own `stare` enum (`"schita"` / `"publicat"`), with
`dataPublicarii` set on first publish and never recleared — Strapi's native
`publishedAt` is not used here.

**Correction from an earlier version of this design:** articles are edited through a
**custom Next.js editor**, not Strapi's native admin panel — `components/features/
biblioteca/ArticleForm.tsx` (built on the shared `components/features/content-editor/
ContentEditorShell.tsx`, also used by the `page` editor). "Vizibilitate" is
`VisibilityField` rendered inside that shell. There is no Strapi admin-panel
customization anywhere in the backend repo, and this feature does not need to add
one — no `addEditViewSidePanel`, no admin-only routes. The edit page
(`app/dashboard/fdsc/biblioteca/[documentId]/page.tsx`) already server-fetches
`listArticleOptions()` — every article, unpaginated, with `etichete`/`tip`/`stare`/
`dataPublicarii`/`cale` — specifically as "the tag-suggestion vocabulary," which is
exactly the data a tag-match ranking needs. So the top-10 ranking can be computed as a
pure frontend function over data already being fetched, with no new backend endpoint.

Desired editorial flow (from the request): an editor creates/saves an article, and a
new box shows the top 10 other articles ranked by tag overlap, each with a checkbox;
the editor checks up to 3, and those become the "Articole relaționate" section
rendered at the bottom of the public article page.

## Scope

**In scope:**
- New one-way self-relation field (`articoleRelationate`, ASCII — every existing
  attribute name in this schema is ASCII-only, e.g. `etichete`, `subcategorie`,
  `dataPublicarii`; diacritics are UI copy only) on the `article` content type,
  capturing up to 3 related articles, persisted through the *existing*
  `createOne`/`updateOne` endpoints exactly like every other field.
- A pure ranking function (top-10 by shared-tag count) added to the frontend, run at
  page-load time in the article edit page against the already-fetched
  `listArticleOptions()` result.
- A new `RelatedArticlesField` checkbox component in `ArticleForm.tsx`.
- `publicByPath`/`detail` populate + project the new relation for reads.
- A new fixed "Articole relaționate" section on the public article page, rendered only
  when the article has ≥1 related article set, styled like the existing
  `ArticleCard`/library-grid cards, with a "Vezi toate resursele din bibliotecă" link
  to `/biblioteca`.

**Explicitly out of scope for this pass:**
- **Cross-content-type matching.** Only article ↔ article.
- **Automatic/AI-assisted matching beyond tag-overlap count.** No semantic similarity,
  no weighting by category/author/recency beyond the stated tie-break.
- **Symmetric relations.** Article A picking B as related does NOT make B show A —
  the relation is one-way, set independently per article.
- **Editor search/filter inside the candidates box.** Exactly the top-10 computed
  list, no search box, no manual "add article not in top 10."
- **Migrating this into the page-builder block system.** This section is not a
  draggable `blocuri` block; it's a fixed template section, because it must appear on
  every article automatically rather than be opt-in per page.
- **Reordering UI.** Display order of the 3 chosen cards follows their shared-tag rank
  (highest overlap first, same tie-break as the candidates list), not manual drag
  order.
- **A dedicated Strapi admin-panel field.** Explicitly ruled out per the correction
  above — the custom Next.js editor is the only place this is edited.

## Data model (backend)

```
api::article (existing content type, add one field)
  articoleRelationate   relation   manyToMany -> api::article.article, one-way
                                    (no inversedBy/mappedBy — A → B does not imply B → A)
                                    max 3, enforced in the controller (not declarable
                                    in Strapi schema)
```

Chosen over a plain `json` array of documentIds because Strapi's relation cleanup
removes a dangling reference automatically if the related article is later deleted,
and `populate` works the same way every other relation in this codebase already does
(`subcategorie`, etc.) — no bespoke resolution code.

## Backend changes

All changes are to the existing `api::article` module — no new routes, no new
permission entries (no new controller actions are added; `createOne`/`updateOne`
already carry the `global::is-fdsc-staff` policy and are already granted in
`src/index.ts`'s `SUPER_ADMIN_PERMISSIONS`).

1. **Schema** (`content-types/article/schema.json`): add the `articoleRelationate`
   field above.
2. **`POPULATE`** (`controllers/article.ts`): extend the shared constant —
   ```ts
   const POPULATE = {
     subcategorie: { populate: { parinte: true } },
     articoleRelationate: { populate: { subcategorie: { populate: { parinte: true } } } },
   } as const;
   ```
   The nested populate is required because `articlePath` (existing helper,
   `utils/path.ts`) needs each related article's own `subcategorie.parinte` to derive
   its `cale`. `POPULATE` is already used by `list`, `detail`, `createOne`,
   `updateOne`, and `publicByPath`, so this one change reaches every read this feature
   needs — public and editorial — with no per-action edits.
3. **View mapping** (`controllers/article.ts`): add
   ```ts
   const relatedView = (article: any) => ({
     documentId: article.documentId,
     titlu: article.titlu,
     cale: articlePath(article),
     etichete: article.etichete ?? [],
     tip: article.tip ?? "",
   });
   ```
   and include `articoleRelationate: (article.articoleRelationate ?? []).map(relatedView)`
   in `listView` (inherited by `detailView`).
4. **Validation** (`validation/article.ts`): add
   ```ts
   const articoleRelationateBase = z
     .array(z.string().trim().min(1))
     .max(3, "Cel mult 3 articole relaționate");
   const articoleRelationate = articoleRelationateBase.default([]);
   ```
   `createArticleSchema` gets `articoleRelationate` (defaulted); `updateArticleSchema`
   gets `articoleRelationate: articoleRelationateBase.optional()` (undefaulted, same
   reasoning the file already documents for `rezumat`/`etichete`: a partial `PUT` must
   not blank out a field it didn't mention).
5. **Controller** (`createOne`/`updateOne`): when `articoleRelationate` is present in
   the parsed input,
   - reject self-reference: `updateOne` 400s if the array contains
     `ctx.params.documentId` ("Un articol nu poate fi relaționat cu el însuși");
     impossible in `createOne` since the id doesn't exist yet.
   - verify every id resolves to a real article — mirroring `checkSubcategory`'s
     shape, a new `checkRelatedArticles(strapi, ids)` does
     `strapi.documents(UID).findMany({ filters: { documentId: { $in: ids } } })`
     (the `$in` filter is the existing convention — see `utils/ong-scope.ts`,
     `utils/membership.ts`) and 400s ("Unul dintre articolele relaționate nu există")
     if the result count is short.
   - on success, `data.articoleRelationate = { set: fields.articoleRelationate }`
     (same `{ set: [...] }` shape already used for `subcategorie`).

No change to `publicList` or `options` — the frontend ranking function only needs
what `options` already returns.

## Frontend changes

1. **`lib/api/articles-types.ts`**: add
   ```ts
   export interface RelatedArticleRef {
     documentId: string;
     titlu: string;
     cale: string | null;
     etichete: string[];
     tip: string;
   }
   ```
   and `articoleRelationate: RelatedArticleRef[]` on `ArticleDetail`.
2. **`lib/api/articles-actions.ts`**: add `articoleRelationate: string[]` to the
   `ArticleInput` interface — no other change; it's already forwarded as-is in the
   `createOne`/`updateOne` request bodies.
3. **New pure function**, `lib/api/related-articles.ts`:
   ```ts
   export function rankRelatedCandidates(
     target: { documentId: string; etichete: string[] },
     candidates: ArticleOption[],
   ): RelatedArticleRef[]
   ```
   Filters out `stare !== "publicat"` and `documentId === target.documentId`, computes
   shared-tag count against `target.etichete`, drops zero-overlap candidates, sorts by
   count desc then `dataPublicarii` desc, returns the top 10 mapped to
   `RelatedArticleRef` (using `ArticleOption.cale`, already derived server-side).
   Unit-tested with vitest (`related-articles.test.ts`) — this codebase's existing
   convention for pure logic (e.g. backend's `utils/browse.ts` /
   `browse.test.ts`), no rendering involved.
4. **`app/dashboard/fdsc/biblioteca/[documentId]/page.tsx`**: after the existing
   `Promise.all([listLibraryCategories(), listArticleOptions(), listPageOptions()])`,
   compute `const relatedCandidates = rankRelatedCandidates(article, articles)` and
   pass it to `<ArticleForm relatedCandidates={relatedCandidates} .../>`. The `creeaza`
   (create) route has no article yet, so it passes nothing — `ArticleForm` defaults
   the prop to `[]`, and the box does not render for an unsaved article. This
   satisfies "the box only appears after Save" for free: saving a new article
   redirects (`router.push`) to this same `[documentId]` route, which now has
   `relatedCandidates` computed from the just-saved `etichete`. Saving an existing
   article calls `router.refresh()`, which reruns this server component and
   recomputes the list from the latest saved tags — satisfying "recompute on every
   Save."
5. **New component**, `components/features/biblioteca/RelatedArticlesField.tsx`,
   styled like `TagsField.tsx` (same label/input conventions, `inputClass` import):
   props `{ candidates: RelatedArticleRef[]; value: string[]; onChange: (next:
   string[]) => void }`. Renders a bordered list of the up-to-10 candidates, each a
   checkbox + title + tag pills; once `value.length === 3`, unchecked boxes get
   `disabled`. Empty `candidates` renders "Niciun articol cu etichete comune încă."
6. **`ArticleForm.tsx`**: add `relatedCandidates` prop (default `[]`); add state
   `articoleRelationate` initialized from
   `article?.articoleRelationate.map((r) => r.documentId) ?? []`; include it in the
   `save()` input payload; render `<RelatedArticlesField>` **after** the
   `<ContentEditorShell>` element closes (confirmed placement: end of the page, after
   the block content and the Save/Cancel buttons — no change to the shared
   `ContentEditorShell`, so the `page` editor is untouched).
7. **Public rendering**: new `components/features/biblioteca-public/
   RelatedArticles.tsx`, styled after `ArticleCard`'s card shape (tag pill, title,
   CTA), heading "Articole relaționate", CTA text "Accesează" (per your choice —
   distinct from `ArticleCard`'s own "Citește", so this stays a separate small
   component rather than a shared one). Section wrapper follows the `max-w-6xl`
   / `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6` convention already used by
   `app/biblioteca/page.tsx`'s card grid. A "Vezi toate resursele din bibliotecă" link
   to `/biblioteca` sits below the grid.
8. **`app/biblioteca/[categorie]/[subcategorie]/[slug]/page.tsx`**: render
   `<RelatedArticles articles={article.articoleRelationate} />` after
   `BlockRenderer`, only when the array is non-empty.

## Error handling

- Candidates ranking on an article with no tags, or no other article sharing any tag:
  `rankRelatedCandidates` returns `[]`; `RelatedArticlesField` shows the empty-state
  copy above rather than an empty box.
- Controller 400s (>3 ids via zod's `.max`, self-reference, unknown id) surface
  through the existing `updateArticleAction`/`createArticleAction` → `toast.error`
  path already used for every other validation failure in `ArticleForm.save()`.
- Public page: if `articoleRelationate` comes back with fewer than 3 populated
  entries (e.g. one was deleted — Strapi's relation cleanup drops the dangling ref
  automatically), the section renders however many remain (1–2), never a placeholder
  card.

## Testing

- Backend: `checkRelatedArticles` is a local, unexported controller helper with the
  same trivial shape as the existing `checkSubcategory` (a lookup plus a null/count
  check) — matching that precedent, it gets no dedicated unit test either; the
  self-reference and >3 checks are covered by manual QA. The one thing that *is*
  automated is the zod cap: `validation/article.test.ts` gets cases for
  `articoleRelationate` mirroring the existing `etichete` max-length/duplicate tests
  (e.g. rejecting a 4th id).
- Frontend: `related-articles.test.ts` covers `rankRelatedCandidates` — ranking order,
  the zero-overlap drop, the `stare !== "publicat"` exclusion, the tie-break by
  `dataPublicarii`, and self-exclusion. This repo's vitest config runs with
  `environment: "node"` and has no component-rendering test setup (no
  `@testing-library/react`, no `.test.tsx` files exist), so `RelatedArticlesField`
  and `RelatedArticles` are verified manually in the dev server per this project's
  existing convention for UI work, not with an automated render test.
- Manual QA (both repos): create an article with tags overlapping an existing
  published one, save, confirm the candidates box appears with the expected ranking;
  check 3 and save, confirm the public article page renders the section with
  "Accesează" CTAs and the `/biblioteca` link; edit the article's tags and re-save,
  confirm the candidate list re-ranks while the previous 3 picks remain checked/saved.
