"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import {
  addNote,
  deleteApplication,
  isStatus,
  isUuid,
  NOTE_MAX,
  purgeExpired,
  updateStatus,
} from "@/lib/server/applications";
import { audit, requireAdmin } from "@/lib/server/auth";
import { log } from "@/lib/server/log";
import { STATUS_LABELS } from "@/lib/validation/casting";

/**
 * Casting review mutations. Each action re-authenticates via requireAdmin()
 * (and the data layer re-verifies the session), validates its input, writes
 * an audit entry, and never logs applicant answers.
 */

export type ActionState = { ok: boolean; message: string; at?: number } | null;

const fail = (message: string): ActionState => ({ ok: false, message, at: Date.now() });
const done = (message: string): ActionState => ({ ok: true, message, at: Date.now() });

export async function updateStatusAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const id = formData.get("id");
  const status = formData.get("status");
  if (!isUuid(id)) return fail("Unknown application.");
  if (!isStatus(status)) return fail("Choose a valid status.");

  try {
    const result = await updateStatus(user, id, status);
    if (!result.found) return fail("This application no longer exists.");
    if (!result.changed) return done(`Status is already ${STATUS_LABELS[status]}.`);
    await audit(user, "application.status", id, { from: result.from, to: result.to });
    refresh();
    return done(`Status changed to ${STATUS_LABELS[status]}.`);
  } catch (e) {
    log.error("casting.status_update_failed", { applicationId: id, error: String(e) });
    return fail("Could not update the status. Please try again.");
  }
}

export async function addNoteAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const id = formData.get("id");
  const body = String(formData.get("body") ?? "").trim();
  if (!isUuid(id)) return fail("Unknown application.");
  if (!body) return fail("Write a note before saving.");
  if (body.length > NOTE_MAX) return fail(`Notes are limited to ${NOTE_MAX.toLocaleString()} characters.`);

  try {
    const note = await addNote(user, id, body);
    if (!note) return fail("This application no longer exists.");
    await audit(user, "application.note", id, { noteId: note.id });
    refresh();
    return done("Note added.");
  } catch (e) {
    log.error("casting.note_failed", { applicationId: id, error: String(e) });
    return fail("Could not save the note. Please try again.");
  }
}

export async function deleteApplicationAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAdmin("admin");
  const id = formData.get("id");
  const confirm = String(formData.get("confirm") ?? "").slice(0, 64);
  if (!isUuid(id)) return fail("Unknown application.");
  if (!confirm.trim()) return fail("Type the application reference to confirm deletion.");

  let reference: string;
  try {
    // The reference is checked against the database, not against anything the client sent.
    const result = await deleteApplication(user, id, confirm);
    if (result.status === "not_found") return fail("This application no longer exists.");
    if (result.status === "mismatch") return fail("That reference doesn't match. Nothing was deleted.");
    reference = result.reference;
    await audit(user, "application.delete", id, { reference, hadVideo: result.hadVideo });
  } catch (e) {
    log.error("casting.delete_failed", { applicationId: id, error: String(e) });
    return fail("Could not delete the application (the video may not have been removed). Nothing was deleted.");
  }
  redirect(`/admin/casting?deleted=${encodeURIComponent(reference)}`);
}

export async function purgeExpiredAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAdmin("admin");
  if (String(formData.get("confirm") ?? "").trim() !== "PURGE") return fail("Type PURGE to confirm.");

  try {
    const { deleted, failed, retentionDays } = await purgeExpired(user);
    await audit(user, "applications.purge", null, { deleted, failed, retentionDays });
    refresh();
    if (deleted === 0 && failed === 0) return done("Nothing to purge.");
    return failed
      ? fail(`Purged ${deleted} application${deleted === 1 ? "" : "s"}. ${failed} could not be removed — try again.`)
      : done(`Purged ${deleted} application${deleted === 1 ? "" : "s"} and their videos.`);
  } catch (e) {
    log.error("casting.purge_failed", { error: String(e) });
    return fail("Purge failed. Please try again.");
  }
}
