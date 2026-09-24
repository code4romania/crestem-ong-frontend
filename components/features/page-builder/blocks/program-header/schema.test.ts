import { describe, expect, it } from "vitest";
import {
  EMPTY_SUPPORTER,
  migrateProgramHeader,
  programHeaderSchema,
  PROGRAM_HEADER_DEFAULTS,
  MAX_SUPPORTER_GROUPS,
} from "./schema";

const supporter = (nume: string) => ({ ...EMPTY_SUPPORTER, nume });

describe("migrateProgramHeader", () => {
  it("folds the legacy single label + list into one group", () => {
    const migrated = migrateProgramHeader({
      titlu: "Program",
      sustinutDeTitlu: "Parteneri:",
      sustinatori: [supporter("FDSC")],
    }) as Record<string, unknown>;
    expect(migrated.grupuri).toEqual([
      { titlu: "Parteneri:", sustinatori: [supporter("FDSC")] },
    ]);
    expect(migrated).not.toHaveProperty("sustinutDeTitlu");
    expect(migrated).not.toHaveProperty("sustinatori");
  });

  it("keeps the legacy default label when the old block never set one", () => {
    const migrated = migrateProgramHeader({ titlu: "Program" }) as Record<
      string,
      unknown
    >;
    expect(migrated.grupuri).toEqual([
      { titlu: "Susținut de:", sustinatori: [] },
    ]);
  });

  it("leaves already-migrated data untouched", () => {
    const data = { ...PROGRAM_HEADER_DEFAULTS, titlu: "Program" };
    expect(migrateProgramHeader(data)).toBe(data);
  });
});

describe("programHeaderSchema", () => {
  it("parses a legacy block into groups", () => {
    const parsed = programHeaderSchema.safeParse({
      titlu: "Program",
      sustinutDeTitlu: "Susținut de:",
      sustinatori: [supporter("FDSC")],
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.grupuri).toHaveLength(1);
      expect(parsed.data.grupuri[0].sustinatori[0].nume).toBe("FDSC");
    }
  });

  it("accepts up to three named groups", () => {
    const parsed = programHeaderSchema.safeParse({
      ...PROGRAM_HEADER_DEFAULTS,
      titlu: "Program",
      grupuri: [
        { titlu: "Finanțatori", sustinatori: [supporter("A")] },
        { titlu: "Parteneri", sustinatori: [supporter("B")] },
        { titlu: "Susținători", sustinatori: [supporter("A")] },
      ],
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects more than three groups", () => {
    const parsed = programHeaderSchema.safeParse({
      ...PROGRAM_HEADER_DEFAULTS,
      titlu: "Program",
      grupuri: Array.from({ length: MAX_SUPPORTER_GROUPS + 1 }, () => ({
        titlu: "X",
        sustinatori: [],
      })),
    });
    expect(parsed.success).toBe(false);
  });

  it("still requires a name on every supporter in every group", () => {
    const parsed = programHeaderSchema.safeParse({
      ...PROGRAM_HEADER_DEFAULTS,
      titlu: "Program",
      grupuri: [
        { titlu: "Parteneri", sustinatori: [supporter("A")] },
        { titlu: "Finanțatori", sustinatori: [supporter("")] },
      ],
    });
    expect(parsed.success).toBe(false);
  });
});
