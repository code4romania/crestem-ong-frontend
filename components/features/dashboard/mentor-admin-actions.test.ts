import { describe, expect, it } from "vitest";
import { mentorAdminActions } from "./mentor-admin-actions";

describe("mentorAdminActions", () => {
  it.each([
    ["pending", { resend: true, changeEmail: true, remove: true }],
    ["active", { resend: false, changeEmail: true, remove: true }],
    ["deleted", { resend: false, changeEmail: false, remove: false }],
  ] as const)("%s", (status, expected) => {
    expect(mentorAdminActions(status)).toEqual(expected);
  });
});
