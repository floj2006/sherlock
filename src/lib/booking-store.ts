import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, rename, unlink } from "node:fs/promises";
import path from "node:path";
import type { BookingSubmission } from "./booking-types";
import type { AccountVisit } from "./account-types";

export type BookingReceipt = { state: "confirmed"; recordId: number; account?: { userId: string; visit: AccountVisit } };
type Entry = { state: "pending" } | BookingReceipt;
// No guest contact details; signed-in visits also carry their account owner and service summary.
export async function reserveBooking(input: BookingSubmission) {
  const dir = process.env.BOOKING_STATE_DIR || path.join(process.cwd(), ".booking-state");
  const serviceIds = [...input.serviceIds].sort((a, b) => a - b);
  // Preserve existing single-service receipts; order never creates a new visit.
  const digest = createHash("sha256").update(JSON.stringify([serviceIds.length === 1 ? serviceIds[0] : serviceIds, input.staffId, input.datetime, input.phone])).digest("hex");
  // Booking receipts are runtime data on persistent storage, not build assets.
  const file = path.join(/* turbopackIgnore: true */ dir, digest + ".json");
  await mkdir(dir, { recursive: true, mode: 0o700 });
  try {
    await writeFile(file, JSON.stringify({ state: "pending" }), { flag: "wx", mode: 0o600 });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    let previous: Entry = { state: "pending" };
    try { previous = JSON.parse(await readFile(file, "utf8")); } catch { /* An in-flight writer remains pending. */ }
    return { previous };
  }
  return {
    async confirm(receipt: BookingReceipt) {
      const temporary = file + ".confirmed";
      await writeFile(temporary, JSON.stringify(receipt), { mode: 0o600 });
      await rename(temporary, file);
    },
    async reject() { await unlink(file); },
  };
}
