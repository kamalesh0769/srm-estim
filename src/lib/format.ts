// Formatting helpers — Indian currency (₹) and date formats.

export function inr(n: number): string {
  if (!Number.isFinite(n)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function num(n: number): string {
  return new Intl.NumberFormat("en-IN").format(n);
}

export function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return (
    date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
    ", " +
    date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
  );
}

export function quoteNumber(quoteNo: number): string {
  return `SRM-${String(quoteNo).padStart(4, "0")}`;
}

/** Normalise a phone number for wa.me: strip non-digits, add India code when needed. */
export function waPhone(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 10) digits = "91" + digits;
  return digits;
}
