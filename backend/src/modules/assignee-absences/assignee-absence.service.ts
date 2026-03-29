import { Prisma } from "@prisma/client";
import { AppError } from "../../errors/app-error.js";
import { prisma } from "../../lib/prisma.js";
import type { SetAssigneeAbsenceInput } from "./assignee-absence.schemas.js";

const assigneeAbsenceSelect = {
  id: true,
  workshopId: true,
  responsibleName: true,
  createdAt: true,
  updatedAt: true
} satisfies Prisma.AssigneeAbsenceSelect;

const getWorkshopOrThrow = async () => {
  const workshop = await prisma.workshop.findFirst({
    orderBy: {
      createdAt: "asc"
    },
    select: {
      id: true,
      name: true
    }
  });

  if (!workshop) {
    throw new AppError("Workshop is not initialized.", 500, "WORKSHOP_NOT_INITIALIZED");
  }

  return workshop;
};

export const assigneeAbsenceService = {
  async listAbsences() {
    const workshop = await getWorkshopOrThrow();

    const absences = await prisma.assigneeAbsence.findMany({
      where: {
        workshopId: workshop.id
      },
      orderBy: {
        responsibleName: "asc"
      },
      select: assigneeAbsenceSelect
    });

    return {
      workshop,
      absences
    };
  },

  async setAbsence(input: SetAssigneeAbsenceInput) {
    const workshop = await getWorkshopOrThrow();
    const responsibleName = input.responsibleName.trim();

    if (input.isAbsent) {
      return prisma.assigneeAbsence.upsert({
        where: {
          responsibleName
        },
        update: {
          responsibleName,
          workshopId: workshop.id
        },
        create: {
          workshopId: workshop.id,
          responsibleName
        },
        select: assigneeAbsenceSelect
      });
    }

    const existingAbsence = await prisma.assigneeAbsence.findUnique({
      where: {
        responsibleName
      },
      select: assigneeAbsenceSelect
    });

    if (!existingAbsence) {
      return null;
    }

    await prisma.assigneeAbsence.delete({
      where: {
        responsibleName
      }
    });

    return null;
  }
};
