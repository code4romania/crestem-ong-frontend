import { describe, expect, it } from "vitest";
import {
  formatTransferDate,
  matchesMemberSearch,
  transferProposerLabel,
  transferRecipientLabel,
} from "./admin-transfer-format";

describe("transferRecipientLabel", () => {
  it("shows the name with the email when both are known", () => {
    expect(
      transferRecipientLabel({ recipientName: "Mihai Membru", recipientEmail: "mihai@ong.ro" }),
    ).toBe("Mihai Membru (mihai@ong.ro)");
  });

  it("falls back to the email alone", () => {
    expect(transferRecipientLabel({ recipientName: null, recipientEmail: "mihai@ong.ro" })).toBe(
      "mihai@ong.ro",
    );
  });
});

describe("formatTransferDate", () => {
  it("formats in Romanian, in Bucharest time", () => {
    // 22:30 UTC on 30 Sept is already 1 Oct in Bucharest.
    expect(formatTransferDate("2026-09-30T22:30:00.000Z")).toBe("1 octombrie 2026");
  });
});

describe("matchesMemberSearch", () => {
  const member = { nume: "Ștefan Ţăranu", email: "Stefan.T@ong.ro" };

  it("matches everything when the query is blank", () => {
    expect(matchesMemberSearch(member, "   ")).toBe(true);
  });

  it("matches the name ignoring case and diacritics", () => {
    expect(matchesMemberSearch(member, "stefan tar")).toBe(true);
    expect(matchesMemberSearch(member, "ȘTEFAN")).toBe(true);
  });

  it("matches the email", () => {
    expect(matchesMemberSearch(member, "t@ong")).toBe(true);
  });

  it("does not match unrelated text", () => {
    expect(matchesMemberSearch(member, "popescu")).toBe(false);
  });
});

describe("transferProposerLabel", () => {
  it("names FDSC as a team, whoever clicked", () => {
    expect(transferProposerLabel({ initiatedBy: "fdsc", initiatorName: "Florin" })).toBe("Echipa FDSC");
  });

  it("names the admin who proposed", () => {
    expect(transferProposerLabel({ initiatedBy: "ngo-admin", initiatorName: "Ana Admin" })).toBe(
      "Ana Admin",
    );
  });

  it("falls back to the role when the admin's name is missing", () => {
    expect(transferProposerLabel({ initiatedBy: "ngo-admin", initiatorName: null })).toBe(
      "Administratorul organizației",
    );
  });
});
