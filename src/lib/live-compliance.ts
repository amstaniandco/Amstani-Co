import type { Db, ObjectId } from "mongodb";

export const REQUIRED_LIVE_MINUTES_PER_DAY = 360;
export const REQUIRED_LIVE_DAYS_PER_WEEK = 5;
export const WARNING_RESET_DAYS = 30;

type StoreLike = {
  _id: ObjectId;
  ownerId?: ObjectId;
  name?: string;
  status?: string;
  createdAt?: Date | string | null;
  warnings?: number;
  warningsResetAt?: Date | string | null;
  liveComplianceLastCheckedWeek?: string | null;
  liveComplianceEscalatedAt?: Date | string | null;
};

type LiveSessionLike = {
  startedAt?: Date | string | null;
  endedAt?: Date | string | null;
  durationMinutes?: number;
};

function startOfWeek(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const daysSinceMonday = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - daysSinceMonday);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function dateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addSessionMinutesByDay(
  totals: Map<string, number>,
  session: LiveSessionLike,
  weekStart: Date,
  weekEnd: Date
) {
  const startedAt = session.startedAt ? new Date(session.startedAt) : null;
  const endedAt = session.endedAt ? new Date(session.endedAt) : null;
  if (!startedAt || !endedAt || Number.isNaN(startedAt.getTime()) || Number.isNaN(endedAt.getTime())) return;
  if (endedAt <= weekStart || startedAt >= weekEnd || endedAt <= startedAt) return;

  let cursor = new Date(Math.max(startedAt.getTime(), weekStart.getTime()));
  const end = new Date(Math.min(endedAt.getTime(), weekEnd.getTime()));

  while (cursor < end) {
    const nextDay = new Date(cursor);
    nextDay.setHours(24, 0, 0, 0);
    const chunkEnd = new Date(Math.min(nextDay.getTime(), end.getTime()));
    const minutes = Math.floor((chunkEnd.getTime() - cursor.getTime()) / 60000);
    if (minutes > 0) {
      const key = dateKey(cursor);
      totals.set(key, (totals.get(key) || 0) + minutes);
    }
    cursor = chunkEnd;
  }
}

function resetExpiredWarnings(store: StoreLike, now: Date) {
  const resetAt = store.warningsResetAt ? new Date(store.warningsResetAt) : null;
  if (resetAt && resetAt < now) {
    return { warnings: 0, warningsResetAt: null as Date | null };
  }
  return {
    warnings: store.warnings || 0,
    warningsResetAt: resetAt && !Number.isNaN(resetAt.getTime()) ? resetAt : null,
  };
}

async function notifyOwnerAboutWeeklyWarning(
  db: Db,
  store: StoreLike,
  checkedWeek: string,
  qualifiedDays: number,
  warnings: number,
  now: Date
) {
  if (!store.ownerId) return;

  await db.collection("notifications").updateOne(
    {
      userId: store.ownerId,
      type: "live_compliance_warning",
      "metadata.storeId": store._id.toString(),
      "metadata.week": checkedWeek,
    },
    {
      $setOnInsert: {
        userId: store.ownerId,
        title: "Weekly live warning",
        message: `${store.name || "Your store"} completed ${qualifiedDays}/${REQUIRED_LIVE_DAYS_PER_WEEK} required live days last week. Go live 5 days per week for 6 hours each day to avoid suspension.`,
        type: "live_compliance_warning",
        isRead: false,
        createdAt: now,
        metadata: {
          storeId: store._id.toString(),
          week: checkedWeek,
          qualifiedDays,
          requiredDays: REQUIRED_LIVE_DAYS_PER_WEEK,
          warnings,
        },
      },
    },
    { upsert: true }
  );
}

async function notifyAdminsAboutWeeklyWarning(
  db: Db,
  store: StoreLike,
  checkedWeek: string,
  qualifiedDays: number,
  warnings: number,
  now: Date
) {
  const admins = await db.collection<{ _id: ObjectId }>("users").find({ role: "admin" }, { projection: { _id: 1 } }).toArray();
  if (admins.length === 0) return;

  const title = warnings >= 3 ? "Store reached live warning limit" : "Store missed weekly live requirement";
  const message = `${store.name || "A store"} completed ${qualifiedDays}/${REQUIRED_LIVE_DAYS_PER_WEEK} required live days last week and is now at ${warnings}/3 warnings.`;

  await Promise.all(admins.map((admin) =>
    db.collection("notifications").updateOne(
      {
        userId: admin._id,
        type: "live_compliance_admin",
        "metadata.storeId": store._id.toString(),
        "metadata.week": checkedWeek,
      },
      {
        $setOnInsert: {
          userId: admin._id,
          title,
          message,
          type: "live_compliance_admin",
          isRead: false,
          createdAt: now,
          metadata: {
            storeId: store._id.toString(),
            week: checkedWeek,
            qualifiedDays,
            requiredDays: REQUIRED_LIVE_DAYS_PER_WEEK,
            warnings,
            href: warnings >= 3 ? "/admin/stores?tab=warnings" : `/admin/stores?highlight=${store._id.toString()}`,
          },
        },
      },
      { upsert: true }
    )
  ));
}

export async function evaluateWeeklyLiveCompliance(db: Db, store: StoreLike, now = new Date()) {
  const currentWeekStart = startOfWeek(now);
  const weekStart = addDays(currentWeekStart, -7);
  const weekEnd = currentWeekStart;
  const checkedWeek = dateKey(weekStart);

  const resetState = resetExpiredWarnings(store, now);
  const baseUpdate: Record<string, unknown> = {};
  if ((store.warnings || 0) !== resetState.warnings || Boolean(store.warningsResetAt) !== Boolean(resetState.warningsResetAt)) {
    baseUpdate.warnings = resetState.warnings;
    baseUpdate.warningsResetAt = resetState.warningsResetAt;
    if (resetState.warnings === 0) baseUpdate.liveComplianceEscalatedAt = null;
  }

  if (store.status !== "active") {
    if (Object.keys(baseUpdate).length > 0) {
      await db.collection("stores").updateOne({ _id: store._id }, { $set: { ...baseUpdate, updatedAt: now } });
    }
    return { warnings: resetState.warnings, warningsResetAt: resetState.warningsResetAt, qualifiedDays: 0, checkedWeek };
  }

  const createdAt = store.createdAt ? new Date(store.createdAt) : null;
  const wasCreatedAfterWeekStarted = createdAt && !Number.isNaN(createdAt.getTime()) && createdAt > weekStart;
  if (store.liveComplianceLastCheckedWeek === checkedWeek || wasCreatedAfterWeekStarted) {
    const update = wasCreatedAfterWeekStarted ? { ...baseUpdate, liveComplianceLastCheckedWeek: checkedWeek } : baseUpdate;
    if (Object.keys(update).length > 0) {
      await db.collection("stores").updateOne({ _id: store._id }, { $set: { ...update, updatedAt: now } });
    }
    return { warnings: resetState.warnings, warningsResetAt: resetState.warningsResetAt, qualifiedDays: 0, checkedWeek };
  }

  const sessions = await db
    .collection<LiveSessionLike>("liveSessions")
    .find({
      storeId: store._id,
      startedAt: { $lt: weekEnd },
      endedAt: { $gte: weekStart },
    })
    .toArray();

  const minutesByDay = new Map<string, number>();
  sessions.forEach((session) => addSessionMinutesByDay(minutesByDay, session, weekStart, weekEnd));
  const qualifiedDays = Array.from(minutesByDay.values()).filter((minutes) => minutes >= REQUIRED_LIVE_MINUTES_PER_DAY).length;

  const missedWeeklyRequirement = qualifiedDays < REQUIRED_LIVE_DAYS_PER_WEEK;
  let warnings = resetState.warnings;
  let warningsResetAt = resetState.warningsResetAt;
  const previousWarnings = warnings;

  if (missedWeeklyRequirement) {
    warnings = Math.min(warnings + 1, 3);
    if (!warningsResetAt) warningsResetAt = addDays(now, WARNING_RESET_DAYS);
  }

  if (missedWeeklyRequirement) {
    await notifyOwnerAboutWeeklyWarning(db, store, checkedWeek, qualifiedDays, warnings, now);
    await notifyAdminsAboutWeeklyWarning(db, store, checkedWeek, qualifiedDays, warnings, now);
  }

  const escalatedAt = warnings >= 3
    ? previousWarnings < 3
      ? now
      : store.liveComplianceEscalatedAt || now
    : null;

  await db.collection("stores").updateOne(
    { _id: store._id },
    {
      $set: {
        ...baseUpdate,
        warnings,
        warningsResetAt,
        liveComplianceLastCheckedWeek: checkedWeek,
        liveComplianceEscalatedAt: escalatedAt,
        updatedAt: now,
      },
    }
  );

  return { warnings, warningsResetAt, qualifiedDays, checkedWeek };
}
