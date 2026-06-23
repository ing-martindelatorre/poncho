import { PeriodStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function assertWeeklyPeriodOpen(weeklyPeriodId: string) {
  const period = await prisma.weeklyPeriod.findUnique({
    select: {
      status: true,
    },
    where: { id: weeklyPeriodId },
  });

  if (!period) {
    throw new Error("La semana no existe.");
  }

  if (period.status === PeriodStatus.CLOSED) {
    throw new Error("La semana esta cerrada y no permite cambios.");
  }
}
