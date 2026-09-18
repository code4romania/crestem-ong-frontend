# Related Articles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let an editor pick up to 3 "related articles" (ranked by tag overlap) while
editing an article in the custom Next.js CMS, and show them as a card section at the
bottom of the public article page.

**Architecture:** A new one-way self-relation field on the backend `article` content
type, persisted through the *existing* create/update endpoints (no new routes). The
top-10 tag-match ranking is a pure frontend function run server-side in the article
edit page against data it already fetches (`listArticleOptions()`). A new checkbox
field component in the existing custom article editor (`ArticleForm.tsx`) lets the
editor pick 3; a new card-grid component renders them on the public article page.

**Tech Stack:** Next.js (App Router, TS strict) + Tailwind, on the frontend; Strapi
v5 + zod validation, on the backend. Tests: vitest (`environment: "node"` on the
frontend — no component-rendering setup exists, so UI is verified manually per this
codebase's convention).

**Spec:** `docs/superpowers/specs/2026-09-18-related-articles-design.md`

## Global Constraints

- The relation attribute name is `articoleRelationate` — **ASCII, no diacritics** —
  matching every existing attribute name in this schema (`etichete`, `subcategorie`,
  `dataPublicarii`). Diacritics are for UI copy and error messages only.
- Max 3 related articles, enforced by zod's `.max(3, …)` in the shared validation
  schema (both create and update).
- The relation is **one-way**: no `inversedBy`/`mappedBy`. Picking B as A's related
  article never makes A show on B's page.
- No new backend routes and no new `src/index.ts` permission entries — every backend
  change rides on the already-permissioned `createOne`/`updateOne` actions.
- Candidates are computed **frontend-side only**, from the existing
  `listArticleOptions()` read — no new backend endpoint for ranking.
- The related-articles box in the editor renders **only when editing an existing
  article** (`article` is non-null) — never on the "creeaza" (create) screen.

---

### Task 1: Backend — zod validation for `articoleRelationate`

**Files:**
- Modify: `../crestem-ong-backend/src/api/article/validation/article.ts`
- Test: `../crestem-ong-backend/src/api/article/validation/article.test.ts`

**Interfaces:**
- Produces: `createArticleSchema` and `updateArticleSchema` both gain an
  `articoleRelationate: string[]` field (defaulted to `[]` on create, undefaulted/
  optional on update — same "no fabricated defaults on partial update" rule the file
  already documents for `rezumat`/`etichete`). `CreateArticleInput`/
  `UpdateArticleInput` (both `z.infer<...>`) pick it up automatically.

- [ ] **Step 1: Write the failing tests**

Add this `describe` block to the end of
`../crestem-ong-backend/src/api/article/validation/article.test.ts` (before the final
closing of the file — it's a new top-level `describe`, same level as `describe("tip",
...)`):

```ts
describe("articoleRelationate", () => {
  it("defaults to empty on create", () => {
    const parsed = createArticleSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
    expect(parsed.success && parsed.data.articoleRelationate).toEqual([]);
  });

  it("accepts up to 3 ids", () => {
    expect(
      createArticleSchema.safeParse({ ...valid, articoleRelationate: ["a", "b", "c"] }).success,
    ).toBe(true);
  });

  it("rejects a 4th id", () => {
    expect(
      createArticleSchema.safeParse({ ...valid, articoleRelationate: ["a", "b", "c", "d"] })
        .success,
    ).toBe(false);
  });

  it("leaves an absent value absent on update", () => {
    const parsed = updateArticleSchema.safeParse({ titlu: "Titlu nou" });
    expect(parsed.success).toBe(true);
    expect(parsed.success && "articoleRelationate" in parsed.data).toBe(false);
  });

  it("still enforces the cap on update", () => {
    expect(
      updateArticleSchema.safeParse({ articoleRelationate: ["a", "b", "c", "d"] }).success,
    ).toBe(false);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run (from `../crestem-ong-backend`): `npm test -- article.test.ts`
Expected: FAIL — `createArticleSchema.safeParse(valid).success` is still `true` (it's
a `z.strictObject` and `articoleRelationate` isn't part of `valid`, so the base cases
pass), but every case that includes `articoleRelationate` in the input now fails
validation because `z.strictObject` rejects the unrecognized key — so "accepts up to
3 ids" gets `success === false` when the test expects `true`.

- [ ] **Step 3: Implement**

In `../crestem-ong-backend/src/api/article/validation/article.ts`, add near the
`eticheteBase`/`etichete` pair (after line 44, `const etichete = eticheteBase.default([]);`):

```ts
/**
 * Up to 3 documentIds, picked by the editor from the tag-matched candidates the
 * frontend computes. Existence and self-reference are checked in the
 * controller, which can read the taxonomy — this schema only caps the count.
 */
const articoleRelationateBase = z
  .array(z.string().trim().min(1, "Id-ul articolului relaționat este invalid"))
  .max(3, "Cel mult 3 articole relaționate");
const articoleRelationate = articoleRelationateBase.default([]);
```

Then add the field to both schemas:

```ts
export const createArticleSchema = z.strictObject({
  titlu: titluSchema,
  slug: slugSchema,
  rezumat,
  subcategorie,
  autor,
  etichete,
  tip: tipBase.default(""),
  vizibilitate: vizibilitateSchema,
  blocuri: blocksSchema,
  articoleRelationate,
});

export const updateArticleSchema = z.strictObject({
  titlu: titluSchema.optional(),
  slug: slugSchema.optional(),
  rezumat: rezumatBase.optional(),
  subcategorie: subcategorie.optional(),
  autor: autorBase.optional(),
  etichete: eticheteBase.optional(),
  tip: tipBase.optional(),
  vizibilitate: vizibilitateSchema.optional(),
  blocuri: blocksSchemaBase.optional(),
  articoleRelationate: articoleRelationateBase.optional(),
});
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- article.test.ts`
Expected: PASS — all cases in `validation/article.test.ts`, including the 5 new ones.

- [ ] **Step 5: Commit**

```bash
cd ../crestem-ong-backend
git add src/api/article/validation/article.ts src/api/article/validation/article.test.ts
git commit -m "feat(article): validate articoleRelationate (max 3)"
```

---

### Task 2: Backend — schema field, populate, view mapping, controller wiring

**Files:**
- Modify: `../crestem-ong-backend/src/api/article/content-types/article/schema.json`
- Modify: `../crestem-ong-backend/src/api/article/controllers/article.ts`

**Interfaces:**
- Consumes: `createArticleSchema`/`updateArticleSchema` from Task 1 (now parse
  `articoleRelationate: string[]`).
- Produces: every read that returns the detail shape (`detail`, `createOne`,
  `updateOne`, `publicByPath` — anything using `detailView`) now includes
  `articoleRelationate: { documentId, titlu, cale, etichete, tip }[]` in its
  response. `list`/`publicList` (the `ArticleSummary`-shaped, `listView`-only reads)
  are deliberately untouched. `createOne`/`updateOne` persist the relation and 400 on
  a self-reference or an unknown id.

This task has no automated test (the schema change requires a Strapi restart / DB
migration that a unit test can't drive, and the two new controller checks are the
same trivial shape as the existing, untested `checkSubcategory` — matching that
precedent). It's verified with `curl` against the running dev server in Step 5.

- [ ] **Step 1: Add the relation field to the content-type schema**

In `../crestem-ong-backend/src/api/article/content-types/article/schema.json`, add
after the `tip` attribute (before the closing `}` of `attributes`):

```json
    "tip": {
      "type": "string"
    },
    "articoleRelationate": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::article.article"
    }
```

(No `inversedBy` — this is deliberately one-way: an article's own picks never imply
the reverse.)

- [ ] **Step 2: Extend `POPULATE` and add `relatedView`**

In `../crestem-ong-backend/src/api/article/controllers/article.ts`, replace:

```ts
const POPULATE = { subcategorie: { populate: { parinte: true } } } as const;
```

with:

```ts
const POPULATE = {
  subcategorie: { populate: { parinte: true } },
  // Nested populate so `articlePath` can derive each related article's own
  // `cale` — same two levels `POPULATE` already fetches for the article itself.
  articoleRelationate: { populate: { subcategorie: { populate: { parinte: true } } } },
} as const;
```

Then, right after `relationView` (after line 24), add:

```ts
const relatedView = (article: any) => ({
  documentId: article.documentId,
  titlu: article.titlu,
  cale: articlePath(article),
  etichete: article.etichete ?? [],
  tip: article.tip ?? "",
});
```

Add the projection to `detailView` (**not** `listView`): `list`/`publicList` reuse
`listView` for the `ArticleSummary` shape, and `publicList`'s own `findMany` doesn't
even populate this relation (it builds its own bespoke `fields`/`populate`, not the
shared `POPULATE`) — the related-articles list only belongs on the detail shape.
Replace:

```ts
const detailView = (article: any) => ({
  ...listView(article),
  blocuri: article.blocuri ?? [],
});
```

with:

```ts
const detailView = (article: any) => ({
  ...listView(article),
  blocuri: article.blocuri ?? [],
  articoleRelationate: (article.articoleRelationate ?? []).map(relatedView),
});
```

- [ ] **Step 3: Add `checkRelatedArticles`**

Right after the existing `checkSubcategory` function (after line 67), add:

```ts
/**
 * Mirrors `checkSubcategory`: every picked id must be a real article, checked
 * here so a stale or mistyped id 400s instead of failing inside the relation
 * write (or silently dropping the id).
 */
async function checkRelatedArticles(strapi: any, ids: string[]): Promise<string | null> {
  if (ids.length === 0) return null;
  const found = await strapi.documents(UID).findMany({
    filters: { documentId: { $in: ids } },
    fields: ["documentId"],
    limit: -1,
  });
  if (found.length !== ids.length) return "Unul dintre articolele relaționate nu există";
  return null;
}
```

- [ ] **Step 4: Wire `createOne` and `updateOne`**

In `createOne`, after the existing `subcategoryError` check (after line 197) and
before `const { subcategorie, ...fields } = parsed.data;`, add:

```ts
    const relatedError = await checkRelatedArticles(strapi, parsed.data.articoleRelationate);
    if (relatedError) return ctx.badRequest(relatedError);
```

Then in the `create` call, add the relation to the `data` object (the spread already
carries `articoleRelationate` as a plain array from `fields` — this line overrides it
with the relational shape, same pattern as `subcategorie: { set: [subcategorie] }`):

```ts
    const created = await strapi.documents(UID).create({
      data: {
        ...fields,
        subcategorie: { set: [subcategorie] },
        articoleRelationate: { set: fields.articoleRelationate },
        stare: "schita",
        dataPublicarii: null,
        fisiere: collectFileIds(fields.blocuri),
      } as any,
    });
```

In `updateOne`, after the existing slug-duplicate check (after line 236) and before
`const { subcategorie, ...fields } = parsed.data;`, add:

```ts
    if (parsed.data.articoleRelationate !== undefined) {
      if (parsed.data.articoleRelationate.includes(ctx.params.documentId)) {
        return ctx.badRequest("Un articol nu poate fi relaționat cu el însuși");
      }
      const relatedError = await checkRelatedArticles(strapi, parsed.data.articoleRelationate);
      if (relatedError) return ctx.badRequest(relatedError);
    }
```

Then, right after the existing `if (parsed.data.blocuri !== undefined) { ... }` block
(after line 246), add:

```ts
    if (parsed.data.articoleRelationate !== undefined) {
      data.articoleRelationate = { set: parsed.data.articoleRelationate };
    }
```

- [ ] **Step 5: Verify manually against the running dev server**

Start (or confirm running) the backend: `cd ../crestem-ong-backend && npm run dev`
(this restart is required — Strapi only picks up a new content-type attribute on
restart). Using an FDSC-staff session cookie/JWT (however you normally authenticate
against this local instance — see `argent`/manual login, or an existing admin
session), run:

```bash
# 1. Two articles that share a tag, both published, via the existing endpoints
#    (skip if you already have two such articles) — then:

# 2. Update article A to relate to article B:
curl -X PUT "http://localhost:1337/api/articles/<A_DOCUMENT_ID>" \
  -H "Content-Type: application/json" -H "Authorization: Bearer <JWT>" \
  -d '{"articoleRelationate": ["<B_DOCUMENT_ID>"]}'
# Expected: 200, and the response's `data.articoleRelationate` contains B's
# { documentId, titlu, cale, etichete, tip }.

# 3. Self-reference is rejected:
curl -X PUT "http://localhost:1337/api/articles/<A_DOCUMENT_ID>" \
  -H "Content-Type: application/json" -H "Authorization: Bearer <JWT>" \
  -d '{"articoleRelationate": ["<A_DOCUMENT_ID>"]}'
# Expected: 400 "Un articol nu poate fi relaționat cu el însuși"

# 4. An unknown id is rejected:
curl -X PUT "http://localhost:1337/api/articles/<A_DOCUMENT_ID>" \
  -H "Content-Type: application/json" -H "Authorization: Bearer <JWT>" \
  -d '{"articoleRelationate": ["not-a-real-id"]}'
# Expected: 400 "Unul dintre articolele relaționate nu există"

# 5. Confirm the read side too:
curl "http://localhost:1337/api/articles/<A_DOCUMENT_ID>" -H "Authorization: Bearer <JWT>"
# Expected: `data.articoleRelationate` still shows B.
```

- [ ] **Step 6: Commit**

```bash
cd ../crestem-ong-backend
git add src/api/article/content-types/article/schema.json src/api/article/controllers/article.ts
git commit -m "feat(article): add articoleRelationate relation and wire it into create/update/read"
```

---

### Task 3: Frontend — types for the related-article shape

**Files:**
- Modify: `lib/api/articles-types.ts`
- Modify: `lib/api/articles-actions.ts`

**Interfaces:**
- Produces: `RelatedArticleRef` (exported from `articles-types.ts`) — the card shape:
  `{ documentId: string; titlu: string; cale: string | null; etichete: string[]; tip:
  string }`. `ArticleDetail.articoleRelationate: RelatedArticleRef[]`.
  `ArticleInput.articoleRelationate: string[]` (the documentIds being saved).

No dedicated test — this is a pure type addition, verified by the typecheck in Task
6's final step (and every task after this one depends on it compiling).

- [ ] **Step 1: Add `RelatedArticleRef` and extend `ArticleDetail`**

In `lib/api/articles-types.ts`, add after the `ArticleTaxonomyRef` interface (after
line 17):

```ts
/** The card shape for one entry in an article's related-articles relation. */
export interface RelatedArticleRef {
  documentId: string;
  titlu: string;
  cale: string | null;
  etichete: string[];
  tip: string;
}
```

Then add one field to `ArticleDetail` (it already extends `ArticleSummary` and adds
`blocuri` — add the new field alongside it):

```ts
export interface ArticleDetail extends ArticleSummary {
  blocuri: PageBlock[];
  articoleRelationate: RelatedArticleRef[];
}
```

- [ ] **Step 2: Extend `ArticleInput`**

In `lib/api/articles-actions.ts`, add one field to the `ArticleInput` interface
(after `blocuri: PageBlock[];`):

```ts
export interface ArticleInput {
  titlu: string;
  slug: string;
  rezumat: string;
  subcategorie: string;
  autor: string;
  etichete: string[];
  tip: string;
  vizibilitate: VisibilityAudience[];
  blocuri: PageBlock[];
  articoleRelationate: string[];
}
```

No other change to this file — `createArticleAction`/`updateArticleAction` already
forward the whole `input` object as-is.

- [ ] **Step 3: Commit**

```bash
git add lib/api/articles-types.ts lib/api/articles-actions.ts
git commit -m "feat(articles): add RelatedArticleRef type and articoleRelationate field"
```

---

### Task 4: Frontend — `rankRelatedCandidates` (top-10 tag-match ranking)

**Files:**
- Create: `lib/api/related-articles.ts`
- Test: `lib/api/related-articles.test.ts`

**Interfaces:**
- Consumes: `ArticleOption` (from `lib/api/articles-types.ts`, already defined —
  `documentId`, `titlu`, `cale`, `etichete`, `tip`, `stare`, `dataPublicarii`) and
  `RelatedArticleRef` (from Task 3).
- Produces: `rankRelatedCandidates(target: { documentId: string; etichete: string[]
  }, candidates: ArticleOption[]): RelatedArticleRef[]` — the top 10, ranked
  desc by shared-tag count then desc by `dataPublicarii`, excluding the target
  itself and any non-`"publicat"` candidate, dropping zero-overlap candidates.

- [ ] **Step 1: Write the failing tests**

Create `lib/api/related-articles.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { rankRelatedCandidates } from "./related-articles";
import type { ArticleOption } from "./articles-types";

function option(overrides: Partial<ArticleOption>): ArticleOption {
  return {
    documentId: "id",
    titlu: "Titlu",
    rezumat: "",
    cale: "/biblioteca/a/b/c",
    categorie: null,
    categorieId: null,
    subcategorieId: null,
    etichete: [],
    tip: "",
    stare: "publicat",
    vizibilitate: ["public"],
    dataPublicarii: "2024-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("rankRelatedCandidates", () => {
  const target = { documentId: "target", etichete: ["fiscal", "ong"] };

  it("ranks by shared tag count, highest first", () => {
    const a = option({ documentId: "a", etichete: ["fiscal"] });
    const b = option({ documentId: "b", etichete: ["fiscal", "ong"] });
    expect(rankRelatedCandidates(target, [a, b]).map((r) => r.documentId)).toEqual([
      "b",
      "a",
    ]);
  });

  it("drops candidates with no shared tags", () => {
    const a = option({ documentId: "a", etichete: ["altceva"] });
    expect(rankRelatedCandidates(target, [a])).toEqual([]);
  });

  it("excludes the target article itself", () => {
    const self = option({ documentId: "target", etichete: ["fiscal"] });
    expect(rankRelatedCandidates(target, [self])).toEqual([]);
  });

  it("excludes unpublished (draft) candidates", () => {
    const draft = option({ documentId: "a", etichete: ["fiscal"], stare: "schita" });
    expect(rankRelatedCandidates(target, [draft])).toEqual([]);
  });

  it("breaks ties by most recently published first", () => {
    const older = option({
      documentId: "older",
      etichete: ["fiscal"],
      dataPublicarii: "2023-01-01T00:00:00.000Z",
    });
    const newer = option({
      documentId: "newer",
      etichete: ["fiscal"],
      dataPublicarii: "2024-06-01T00:00:00.000Z",
    });
    expect(rankRelatedCandidates(target, [older, newer]).map((r) => r.documentId)).toEqual([
      "newer",
      "older",
    ]);
  });

  it("caps the result at 10", () => {
    const many = Array.from({ length: 15 }, (_, i) =>
      option({ documentId: `a${i}`, etichete: ["fiscal"] }),
    );
    expect(rankRelatedCandidates(target, many)).toHaveLength(10);
  });

  it("projects only the fields the card needs", () => {
    const a = option({
      documentId: "a",
      titlu: "Ghid",
      etichete: ["fiscal"],
      tip: "Ghid",
      cale: "/biblioteca/x/y/ghid",
    });
    expect(rankRelatedCandidates(target, [a])).toEqual([
      { documentId: "a", titlu: "Ghid", cale: "/biblioteca/x/y/ghid", etichete: ["fiscal"], tip: "Ghid" },
    ]);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- related-articles.test.ts`
Expected: FAIL with "Cannot find module './related-articles'" (the file doesn't
exist yet).

- [ ] **Step 3: Implement**

Create `lib/api/related-articles.ts`:

```ts
import type { ArticleOption, RelatedArticleRef } from "./articles-types";

function sharedTagCount(a: string[], b: string[]): number {
  const set = new Set(b);
  return a.filter((tag) => set.has(tag)).length;
}

/**
 * The top 10 other published articles ranked by shared-tag count, for the
 * editor to pick up to 3 from. Runs over `listArticleOptions()`'s already
 * unpaginated read — no dedicated backend endpoint exists for this.
 */
export function rankRelatedCandidates(
  target: { documentId: string; etichete: string[] },
  candidates: ArticleOption[],
): RelatedArticleRef[] {
  return candidates
    .filter((candidate) => candidate.documentId !== target.documentId)
    .filter((candidate) => candidate.stare === "publicat")
    .map((candidate) => ({
      candidate,
      score: sharedTagCount(target.etichete, candidate.etichete),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (b.candidate.dataPublicarii ?? "").localeCompare(a.candidate.dataPublicarii ?? "");
    })
    .slice(0, 10)
    .map(({ candidate }) => ({
      documentId: candidate.documentId,
      titlu: candidate.titlu,
      cale: candidate.cale,
      etichete: candidate.etichete,
      tip: candidate.tip,
    }));
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- related-articles.test.ts`
Expected: PASS — all 7 cases.

- [ ] **Step 5: Commit**

```bash
git add lib/api/related-articles.ts lib/api/related-articles.test.ts
git commit -m "feat(articles): add rankRelatedCandidates tag-match ranking"
```

---

### Task 5: Frontend — admin editor: `RelatedArticlesField`, wired into `ArticleForm` and the edit page

**Files:**
- Create: `components/features/biblioteca/RelatedArticlesField.tsx`
- Modify: `components/features/biblioteca/ArticleForm.tsx`
- Modify: `app/dashboard/fdsc/biblioteca/[documentId]/page.tsx`

**Interfaces:**
- Consumes: `RelatedArticleRef` (Task 3), `rankRelatedCandidates` (Task 4).
- Produces: `RelatedArticlesField({ candidates, value, onChange })` — a checkbox
  list capped at 3 selections. `ArticleForm` gains a `relatedCandidates:
  RelatedArticleRef[]` prop (default `[]`) and includes `articoleRelationate` in its
  save payload.

No automated test — this repo has no component-render test setup (confirmed: vitest
runs with `environment: "node"`, no `@testing-library/react` dependency, no existing
`.test.tsx` file). Verified manually in Step 4.

- [ ] **Step 1: Create `RelatedArticlesField`**

Create `components/features/biblioteca/RelatedArticlesField.tsx`:

```tsx
"use client";

import type { RelatedArticleRef } from "@/lib/api/articles-types";

export function RelatedArticlesField({
  candidates,
  value,
  onChange,
}: {
  /** The top-10 tag-matched candidates, already ranked. */
  candidates: RelatedArticleRef[];
  /** The currently checked documentIds (0 to 3). */
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const atLimit = value.length >= 3;

  const toggle = (documentId: string) => {
    if (value.includes(documentId)) {
      onChange(value.filter((id) => id !== documentId));
      return;
    }
    if (atLimit) return;
    onChange([...value, documentId]);
  };

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-[#475569]">
        Articole relaționate
      </label>
      <p className="mb-2 text-xs text-muted-foreground">
        Alege până la 3 articole dintre cele mai apropiate ca etichete. Vor apărea la
        finalul articolului, pe site.
      </p>

      {candidates.length === 0 ? (
        <p className="rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm text-muted-foreground">
          Niciun articol cu etichete comune încă.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-white">
          {candidates.map((candidate) => {
            const checked = value.includes(candidate.documentId);
            const disabled = !checked && atLimit;
            return (
              <li key={candidate.documentId} className="flex items-start gap-3 px-4 py-3">
                <input
                  type="checkbox"
                  id={`related-${candidate.documentId}`}
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggle(candidate.documentId)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-[#2dbe8f] focus:ring-[#2dbe8f] disabled:opacity-40"
                />
                <label
                  htmlFor={`related-${candidate.documentId}`}
                  className={`text-sm ${disabled ? "text-muted-foreground" : "text-[#162040]"}`}
                >
                  <span className="font-semibold">{candidate.titlu}</span>
                  {candidate.etichete.length > 0 ? (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {candidate.etichete.map((tag) => `#${tag}`).join(" ")}
                    </span>
                  ) : null}
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Wire it into `ArticleForm.tsx`**

Add two imports at the top of `components/features/biblioteca/ArticleForm.tsx`
(alongside the existing `TagsField` import):

```ts
import type { RelatedArticleRef } from "@/lib/api/articles-types";
import { RelatedArticlesField } from "./RelatedArticlesField";
```

Add a `relatedCandidates` prop to the component's destructured params (alongside
`pages = []`):

```ts
export function ArticleForm({
  article,
  categories,
  tagSuggestions,
  pages = [],
  relatedCandidates = [],
}: {
  article: ArticleDetail | null;
  categories: LibraryCategory[];
  tagSuggestions: string[];
  pages?: PageOption[];
  /** The top-10 tag-matched candidates for this article; empty on the create screen. */
  relatedCandidates?: RelatedArticleRef[];
}) {
```

Add state, alongside the existing `subcategorie` state (after line 51):

```ts
  const [articoleRelationate, setArticoleRelationate] = useState<string[]>(
    article?.articoleRelationate.map((r) => r.documentId) ?? [],
  );
```

Add it to the `input` object inside `save()` (alongside `etichete,`):

```ts
    const input = {
      titlu: shell.titlu.trim(),
      slug: shell.slug.trim(),
      rezumat: rezumat.trim(),
      subcategorie,
      autor: autor.trim(),
      etichete,
      tip: tip.trim(),
      vizibilitate: shell.vizibilitate,
      blocuri: shell.blocuri,
      articoleRelationate,
    };
```

Finally, render the new box **after** the `<ContentEditorShell ... />` element closes
— i.e. right before the outer wrapping `</div>` at the very end of the component's
returned JSX (after the `extraActions={...}` prop's closing `/>`), only when editing
an existing article:

```tsx
      />

      {article ? (
        <div className="mt-8 rounded-xl border border-border bg-white p-6">
          <RelatedArticlesField
            candidates={relatedCandidates}
            value={articoleRelationate}
            onChange={setArticoleRelationate}
          />
        </div>
      ) : null}
    </div>
  );
}
```

(The `/>` above is `ContentEditorShell`'s own closing tag — the new block is a sibling
after it, still inside the outer `<div className="mx-auto max-w-6xl">`.)

- [ ] **Step 3: Compute and pass `relatedCandidates` from the edit page**

In `app/dashboard/fdsc/biblioteca/[documentId]/page.tsx`, add the import:

```ts
import { rankRelatedCandidates } from "@/lib/api/related-articles";
```

After the existing `Promise.all([...])` fetch (after the `suggestions` line), compute:

```ts
  const relatedCandidates = rankRelatedCandidates(article, articles);
```

And pass it to `<ArticleForm>`:

```tsx
  return (
    <ArticleForm
      article={article}
      categories={categories}
      tagSuggestions={suggestions}
      pages={pages}
      relatedCandidates={relatedCandidates}
    />
  );
```

(The "creeaza" create-screen route is untouched — it has no `article`, so
`ArticleForm`'s `relatedCandidates` prop defaults to `[]` there and the box does not
render, per the `{article ? ... : null}` gate in Step 2.)

- [ ] **Step 4: Verify manually**

Run `npm run dev`, open `/dashboard/fdsc/biblioteca/creeaza` — confirm no related-
articles box appears anywhere on the create screen. Create an article with a tag that
matches an existing **published** article's tag, save it (redirects to
`/dashboard/fdsc/biblioteca/<documentId>`) — confirm the new box appears with that
published article listed and checkable. Check it, save again, reload the page —
confirm it's still checked. Check 3 candidates — confirm the remaining boxes become
disabled; uncheck one — confirm the rest re-enable.

- [ ] **Step 5: Typecheck and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add components/features/biblioteca/RelatedArticlesField.tsx components/features/biblioteca/ArticleForm.tsx app/dashboard/fdsc/biblioteca/\[documentId\]/page.tsx
git commit -m "feat(articles): add related-articles picker to the article editor"
```

---

### Task 6: Frontend — public rendering: `RelatedArticles` section on the article page

**Files:**
- Create: `components/features/biblioteca-public/RelatedArticles.tsx`
- Modify: `app/biblioteca/[categorie]/[subcategorie]/[slug]/page.tsx`

**Interfaces:**
- Consumes: `RelatedArticleRef[]` (Task 3), `article.articoleRelationate` (now
  populated by `publicByPath` per Task 2).
- Produces: `RelatedArticles({ articles })` — renders nothing when `articles` is
  empty; otherwise a heading, a card grid (styled like `ArticleCard`, CTA text
  "Accesează"), and a link to `/biblioteca`.

No automated test (same reasoning as Task 5 — no component-render test setup).
Verified manually in Step 3.

- [ ] **Step 1: Create `RelatedArticles`**

Create `components/features/biblioteca-public/RelatedArticles.tsx`:

```tsx
import Link from "next/link";
import { ChevronRight, ExternalLink, FileText } from "lucide-react";
import type { RelatedArticleRef } from "@/lib/api/articles-types";
import { tipBadgeColors } from "./tip-badge";

export function RelatedArticles({ articles }: { articles: RelatedArticleRef[] }) {
  if (articles.length === 0) return null;

  return (
    <div className="border-t border-border bg-slate-50">
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <h2 className="font-heading text-2xl font-extrabold text-[#162040]">
          Articole relaționate
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => {
            const tint = article.tip ? tipBadgeColors(article.tip) : null;
            const body = (
              <>
                <div className="flex-1 p-6">
                  {article.tip && tint ? (
                    <span
                      className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                      style={{ background: tint.bg, color: tint.fg }}
                    >
                      <FileText size={12} className="shrink-0" />
                      {article.tip}
                    </span>
                  ) : null}
                  <h3 className="mt-4 font-heading text-lg font-bold text-[#162040] wrap-break-word">
                    {article.titlu}
                  </h3>
                </div>
                <div className="flex items-center justify-end border-t border-border px-6 py-3.5">
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#2dbe8f]">
                    Accesează <ChevronRight size={15} />
                  </span>
                </div>
              </>
            );

            return article.cale ? (
              <Link
                key={article.documentId}
                href={article.cale}
                className="flex h-full min-w-0 flex-col rounded-2xl border border-border bg-white transition-shadow hover:shadow-md"
              >
                {body}
              </Link>
            ) : (
              <div
                key={article.documentId}
                className="flex h-full min-w-0 flex-col rounded-2xl border border-border bg-white"
              >
                {body}
              </div>
            );
          })}
        </div>

        <Link
          href="/biblioteca"
          className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#162040] hover:text-[#2dbe8f]"
        >
          <ExternalLink size={16} />
          Vezi toate resursele din bibliotecă
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Render it on the article page**

In `app/biblioteca/[categorie]/[subcategorie]/[slug]/page.tsx`, add the import:

```ts
import { RelatedArticles } from "@/components/features/biblioteca-public/RelatedArticles";
```

And render it right after the existing content block, as a sibling of that `<div>`
(still inside the top-level `<>...</>` fragment):

```tsx
  return (
    <>
      <PublicArticleHeader article={article} />
      <div className="mx-auto w-full max-w-4xl px-6 py-12">
        <BlockRenderer blocks={article.blocuri ?? []} />
      </div>
      <RelatedArticles articles={article.articoleRelationate} />
    </>
  );
```

- [ ] **Step 3: Verify manually**

With the Task 5 setup still in place (an article with 1–3 related articles saved),
run `npm run dev` and open that article's public page. Confirm the "Articole
relaționate" section renders below the content, with the tag/title/"Accesează" card
shape and a working "Vezi toate resursele din bibliotecă" link to `/biblioteca`.
Then open an article with **no** related articles set and confirm the section is
absent entirely (no empty heading, no empty grid).

- [ ] **Step 4: Commit**

```bash
git add components/features/biblioteca-public/RelatedArticles.tsx "app/biblioteca/[categorie]/[subcategorie]/[slug]/page.tsx"
git commit -m "feat(articles): render related articles on the public article page"
```

---

### Task 7: Full verification pass (both repos)

**Files:** none (verification only).

- [ ] **Step 1: Frontend — full test suite, typecheck, lint, build**

```bash
npm test
npx tsc --noEmit
npm run lint
npm run build
```

Expected: all green. `next build` also re-runs the TypeScript check across the whole
app, so this is the final guard that nothing outside the touched files broke.

- [ ] **Step 2: Backend — test suite and build**

```bash
cd ../crestem-ong-backend
npm test
npm run build
```

Expected: all green.

- [ ] **Step 3: End-to-end manual re-check**

Re-run the full editorial flow once more end to end, matching the request's own
description of "flowul ideal": create a new article with tags overlapping an
existing published article → save → the related-articles box appears with that
article ranked in the top 10 → check 3 → save → open the public page → the 3 chosen
articles render as cards at the bottom with "Accesează" CTAs and the library link.
Edit the article's tags, save again, confirm the candidate ranking changes while the
3 previously-picked articles remain checked (per the confirmed "recompute on every
save, keep the selection" behavior).
