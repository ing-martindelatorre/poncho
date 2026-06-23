"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireManagerAccess } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { numberFromCsv, parseCsv, rowsToObjects } from "@/lib/csv";

type ImportRow = Record<string, string>;

function required(row: ImportRow, key: string) {
  const value = row[key]?.trim();

  if (!value) {
    throw new Error(`La columna ${key} es obligatoria.`);
  }

  return value;
}

function dateFrom(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

export async function importWeeklySummary(formData: FormData) {
  await requireManagerAccess();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Selecciona un archivo CSV.");
  }

  const text = await file.text();
  const rows = rowsToObjects(parseCsv(text));
  let imported = 0;

  for (const row of rows) {
    const projectName = required(row, "project_name");
    const weekNumber = Number(required(row, "week_number"));
    const startDate = dateFrom(required(row, "start_date"));
    const endDate = dateFrom(required(row, "end_date"));
    const label = row.label || `${row.start_date} - ${row.end_date}`;
    const cash = numberFromCsv(row.cash);
    const invoiced = numberFromCsv(row.invoiced);
    const payments = numberFromCsv(row.payments);

    if (!Number.isInteger(weekNumber) || weekNumber <= 0) {
      throw new Error(`Semana invalida para ${projectName}.`);
    }

    const existingProject = await prisma.project.findFirst({
      where: {
        name: {
          equals: projectName,
          mode: "insensitive",
        },
      },
    });
    const project = existingProject
      ? await prisma.project.update({
          data: {
            address: row.address || undefined,
            clientName: row.client_name || undefined,
          },
          where: { id: existingProject.id },
        })
      : await prisma.project.create({
          data: {
        address: row.address || null,
        clientName: row.client_name || null,
        name: projectName,
          },
        });

    const period = await prisma.weeklyPeriod.upsert({
      create: {
        endDate,
        label,
        projectId: project.id,
        startDate,
        weekNumber,
      },
      update: {
        endDate,
        label,
      },
      where: {
        projectId_weekNumber_startDate: {
          projectId: project.id,
          startDate,
          weekNumber,
        },
      },
    });

    await prisma.$transaction([
      prisma.workItem.deleteMany({
        where: {
          category: "Importado",
          weeklyPeriodId: period.id,
        },
      }),
      prisma.payment.deleteMany({
        where: {
          targetType: "imported_weekly_summary",
          weeklyPeriodId: period.id,
        },
      }),
    ]);

    if (cash > 0) {
      await prisma.workItem.create({
        data: {
          category: "Importado",
          description: "Importado efectivo desde Excel/CSV",
          moneyKind: "CASH",
          total: cash.toFixed(2),
          unit: "LOTE",
          unitPrice: cash.toFixed(2),
          volume: "1",
          weeklyPeriodId: period.id,
        },
      });
    }

    if (invoiced > 0) {
      await prisma.workItem.create({
        data: {
          category: "Importado",
          description: "Importado facturado desde Excel/CSV",
          moneyKind: "INVOICED",
          total: invoiced.toFixed(2),
          unit: "LOTE",
          unitPrice: invoiced.toFixed(2),
          volume: "1",
          weeklyPeriodId: period.id,
        },
      });
    }

    if (payments > 0) {
      await prisma.payment.create({
        data: {
          amount: payments.toFixed(2),
          description: "Pago importado desde Excel/CSV",
          moneyKind: "CASH",
          targetId: period.id,
          targetType: "imported_weekly_summary",
          weeklyPeriodId: period.id,
        },
      });
    }

    imported += 1;
  }

  revalidatePath("/");
  revalidatePath("/projects");
  redirect(`/imports?imported=${imported}`);
}
