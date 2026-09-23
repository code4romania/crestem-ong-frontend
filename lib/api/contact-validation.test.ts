import { describe, expect, it } from "vitest";
import { validateContactForm } from "./contact-validation";

const valid = {
  name: "Ion Popescu",
  email: "ion@example.org",
  organization: "",
  subject: "Parteneriate",
  message: "Bună ziua",
  consent: true,
};

describe("validateContactForm", () => {
  it("returns no errors for a valid form", () => {
    expect(validateContactForm(valid)).toEqual({});
  });

  it("flags a blank name", () => {
    expect(validateContactForm({ ...valid, name: "  " }).name).toBeTruthy();
  });

  it("flags a malformed email", () => {
    expect(validateContactForm({ ...valid, email: "ion@" }).email).toBeTruthy();
  });

  it("flags a missing subject", () => {
    expect(validateContactForm({ ...valid, subject: "" }).subject).toBeTruthy();
  });

  it("flags a subject over 160 chars", () => {
    expect(validateContactForm({ ...valid, subject: "x".repeat(161) }).subject).toBeTruthy();
  });

  it("flags an email over 160 chars", () => {
    const longEmail = `${"x".repeat(156)}@a.co`;
    expect(validateContactForm({ ...valid, email: longEmail }).email).toBeTruthy();
  });

  it("flags a blank message", () => {
    expect(validateContactForm({ ...valid, message: "   " }).message).toBeTruthy();
  });

  it("flags a message under 3 chars", () => {
    expect(validateContactForm({ ...valid, message: "ok" }).message).toBeTruthy();
  });

  it("accepts a message of exactly 3 chars", () => {
    expect(validateContactForm({ ...valid, message: "bun" }).message).toBeUndefined();
  });

  it("flags a message over 5000 chars", () => {
    expect(validateContactForm({ ...valid, message: "x".repeat(5001) }).message).toBeTruthy();
  });

  it("flags an unchecked consent box", () => {
    expect(validateContactForm({ ...valid, consent: false }).consent).toBeTruthy();
  });

  it("reports every problem at once, not just the first", () => {
    const errors = validateContactForm({
      name: "",
      email: "nope",
      organization: "",
      subject: "",
      message: "",
      consent: false,
    });
    expect(Object.keys(errors).sort()).toEqual(["consent", "email", "message", "name", "subject"]);
  });
});
