import { Prisma } from "@prisma/client";
import { AppError } from "../../errors/app-error.js";
import { prisma } from "../../lib/prisma.js";
import type {
  CreatePartNumberSuggestionInput,
  PartNumberSuggestionQuery,
  UpdatePartNumberSuggestionInput
} from "./part-number-suggestion.schemas.js";

const partNumberSuggestionSelect = {
  id: true,
  partNumber: true,
  deviceName: true,
  createdAt: true,
  updatedAt: true
} satisfies Prisma.PartNumberSuggestionSelect;

const getSuggestionOrThrow = async (suggestionId: string) => {
  const suggestion = await prisma.partNumberSuggestion.findUnique({
    where: { id: suggestionId },
    select: partNumberSuggestionSelect
  });

  if (!suggestion) {
    throw new AppError("Part number suggestion not found.", 404, "PART_NUMBER_SUGGESTION_NOT_FOUND");
  }

  return suggestion;
};

export const partNumberSuggestionService = {
  async listSuggestions(input: PartNumberSuggestionQuery) {
    const normalizedQuery = input.query?.trim() ?? "";

    const suggestions = await prisma.partNumberSuggestion.findMany({
      where: normalizedQuery
        ? {
            OR: [
              {
                partNumber: {
                  contains: normalizedQuery,
                  mode: "insensitive"
                }
              },
              {
                deviceName: {
                  contains: normalizedQuery,
                  mode: "insensitive"
                }
              }
            ]
          }
        : undefined,
      orderBy: [{ partNumber: "asc" }],
      take: input.limit,
      select: partNumberSuggestionSelect
    });

    return {
      query: normalizedQuery,
      suggestions
    };
  },

  async createSuggestion(input: CreatePartNumberSuggestionInput) {
    try {
      return await prisma.partNumberSuggestion.create({
        data: {
          partNumber: input.partNumber.trim(),
          deviceName: input.deviceName?.trim()
        },
        select: partNumberSuggestionSelect
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new AppError(
          "Die P/N ist bereits in der Vorschlagsliste vorhanden.",
          409,
          "PART_NUMBER_SUGGESTION_ALREADY_EXISTS"
        );
      }

      throw error;
    }
  },

  async updateSuggestion(suggestionId: string, input: UpdatePartNumberSuggestionInput) {
    await getSuggestionOrThrow(suggestionId);

    try {
      return await prisma.partNumberSuggestion.update({
        where: { id: suggestionId },
        data: {
          partNumber: input.partNumber.trim(),
          deviceName: input.deviceName?.trim()
        },
        select: partNumberSuggestionSelect
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new AppError(
          "Die P/N ist bereits in der Vorschlagsliste vorhanden.",
          409,
          "PART_NUMBER_SUGGESTION_ALREADY_EXISTS"
        );
      }

      throw error;
    }
  },

  async deleteSuggestion(suggestionId: string) {
    await getSuggestionOrThrow(suggestionId);

    return prisma.partNumberSuggestion.delete({
      where: { id: suggestionId },
      select: partNumberSuggestionSelect
    });
  }
};
