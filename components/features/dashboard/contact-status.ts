import type { ContactStatus } from "@/lib/api/contact-types";

const CHIP: Record<ContactStatus, string> = {
  new: "bg-[#dcfafb] text-[#5656e5]",
  in_progress: "bg-[#fffbeb] text-[#b45309]",
  closed: "bg-[#f1f5f9] text-[#475569]",
};

export function contactStatusChipClass(status: ContactStatus): string {
  return CHIP[status];
}
