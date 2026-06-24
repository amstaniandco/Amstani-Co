import { Db, WithId } from "mongodb";

export type ApprovedStoreApplication = WithId<{
  applicant?: {
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
  };
  status: string;
}>;

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Looks up an admin-approved store application by email, case-insensitively.
 * Emails submitted via the public `/form` page are stored as typed (not
 * lowercased), so a plain equality match would miss e.g. "Mohsin@gmail.com"
 * when a later step normalizes the same address to lowercase.
 */
export async function findApprovedStoreApplication(
  db: Db,
  email: string
): Promise<ApprovedStoreApplication | null> {
  const trimmed = email.trim();
  if (!trimmed) return null;

  return db.collection<ApprovedStoreApplication>("store_applications").findOne({
    status: "approved_by_admin",
    "applicant.email": { $regex: `^${escapeRegex(trimmed)}$`, $options: "i" },
  });
}
