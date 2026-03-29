import { config as loadEnv } from "dotenv";
import { CardArchiveStatus, CardUcStatus, PrismaClient } from "@prisma/client";

loadEnv({ path: "../../.env" });
loadEnv({ path: "../.env", override: false });

const prisma = new PrismaClient();

const columnTemplates = [
  { key: "eingang", title: "Eingang", position: 1 },
  { key: "in_arbeit", title: "In Arbeit", position: 2 },
  { key: "warten", title: "Warten", position: 3 },
  { key: "testing", title: "Testing", position: 4 },
  { key: "fertig", title: "Fertig", position: 5 }
] as const;

const boardNames = ["Linear", "Rotary", "Starter"] as const;
const partNumberSuggestions = [
  { partNumber: "1809", deviceName: "Starter Anlasser 1809" },
  { partNumber: "1812", deviceName: "Starter Einheit 1812" },
  { partNumber: "1824", deviceName: "Starter Modul 1824" },
  { partNumber: "Linear", deviceName: "Linear-Standardgerät" },
  { partNumber: "Rotary", deviceName: "Rotary-Standardgerät" },
  { partNumber: "Starter", deviceName: "Starter-Standardgerät" }
] as const;
const completionForecastRules = [
  { columnKey: "eingang", estimatedRemainingDays: 4, blocksCompletion: false },
  { columnKey: "warten", estimatedRemainingDays: 5, blocksCompletion: true },
  { columnKey: "testing", estimatedRemainingDays: 1, blocksCompletion: false },
  { columnKey: "fertig", estimatedRemainingDays: 0, blocksCompletion: false },
  {
    boardGroupName: "Linear",
    columnKey: "in_arbeit",
    estimatedRemainingDays: 2,
    blocksCompletion: false
  },
  {
    boardGroupName: "Rotary",
    columnKey: "in_arbeit",
    estimatedRemainingDays: 3,
    blocksCompletion: false
  },
  {
    boardGroupName: "Starter",
    columnKey: "in_arbeit",
    estimatedRemainingDays: 4,
    blocksCompletion: false
  }
] as const;

const assigneeNames = [
  "Max",
  "Maikel",
  "Mathias",
  "Enes",
  "Alex",
  "Tobias",
  "Tamera",
  "Joul",
  "Anna",
  "Tim",
  "Mikko",
  "Peter  ",
  "Stephan",
  "Michael",
  "Niklas",
  "Christian",
  "Markus",
  "Petra",
  "Peter",
  "Marco",
  "Yvonne",
  "Maik",
  "Paul",
  "Nicole",
  "Andrea",
  "Eric",
  "René"
] as const;

type BoardName = (typeof boardNames)[number];

type GeneratedCard = {
  creatorName: string;
  responsibleName: string;
  deviceName: string;
  priority: string;
  dueDate: Date;
  partNumber: string;
  serialNumber: string;
  sapNumber: string;
  orderNumber: string;
  archiveStatus: CardArchiveStatus;
  ucStatus: CardUcStatus;
  previousColumnId: null;
  statusChangedAt: Date;
};

function createBoardCards(boardName: BoardName, boardIndex: number) {
  const cards: GeneratedCard[] = [];
  const baseDueDate = new Date("2026-04-01T00:00:00.000Z");
  const priorities = ["Normal", "Hoch", "Mittel"] as const;

  assigneeNames.forEach((assigneeName, assigneeIndex) => {
    for (let deviceOffset = 0; deviceOffset < 2; deviceOffset += 1) {
      const globalSequence = boardIndex * assigneeNames.length * 2 + assigneeIndex * 2 + deviceOffset + 1;
      const dueDate = new Date(baseDueDate);
      dueDate.setUTCDate(baseDueDate.getUTCDate() + assigneeIndex + deviceOffset + boardIndex);

      cards.push({
        creatorName: assigneeName,
        responsibleName: assigneeName,
        deviceName: `${boardName} Gerät ${String(assigneeIndex + 1).padStart(2, "0")}-${deviceOffset + 1}`,
        priority: priorities[(assigneeIndex + deviceOffset + boardIndex) % priorities.length],
        dueDate,
        partNumber: boardName,
        serialNumber: `SN-${boardName.toUpperCase().slice(0, 3)}-${String(globalSequence).padStart(4, "0")}`,
        sapNumber: `SAP-${boardIndex + 1}${String(assigneeIndex + 1).padStart(2, "0")}${deviceOffset + 1}${String(globalSequence).padStart(3, "0")}`,
        orderNumber: `ORD-${boardName.toUpperCase().slice(0, 3)}-${String(globalSequence).padStart(5, "0")}`,
        archiveStatus: CardArchiveStatus.ACTIVE,
        ucStatus: CardUcStatus.NOT_IN_UC,
        previousColumnId: null,
        statusChangedAt: dueDate
      });
    }
  });

  return cards;
}

async function main() {
  const existingWorkshopCount = await prisma.workshop.count();

  if (existingWorkshopCount > 0) {
    console.log("Seed skipped: database already contains workshop data.");
    return;
  }

  const workshop = await prisma.workshop.create({
    data: {
      name: "T/AO425"
    }
  });

  await Promise.all(
    partNumberSuggestions.map((suggestion) =>
      prisma.partNumberSuggestion.create({
        data: {
          partNumber: suggestion.partNumber,
          deviceName: suggestion.deviceName
        }
      })
    )
  );

  await prisma.completionForecastRule.createMany({
    data: completionForecastRules.map((rule) => ({
      workshopId: workshop.id,
      boardGroupName: rule.boardGroupName ?? null,
      partNumber: null,
      columnKey: rule.columnKey,
      estimatedRemainingDays: rule.estimatedRemainingDays,
      blocksCompletion: rule.blocksCompletion
    }))
  });

  for (const [boardIndex, boardName] of boardNames.entries()) {
    const board = await prisma.board.create({
      data: {
        workshopId: workshop.id,
        groupName: boardName,
        title: boardName
      }
    });

    const createdColumns = await Promise.all(
      columnTemplates.map((column) =>
        prisma.column.create({
          data: {
            boardId: board.id,
            key: column.key,
            title: column.title,
            position: column.position
          }
        })
      )
    );

    const firstColumn = createdColumns.find((column) => column.key === "eingang");

    if (!firstColumn) {
      throw new Error(`Startspalte Eingang für Board ${board.title} nicht gefunden.`);
    }

    const generatedCards = createBoardCards(boardName, boardIndex);

    for (const [cardIndex, card] of generatedCards.entries()) {
      await prisma.card.create({
        data: {
          boardId: board.id,
          columnId: firstColumn.id,
          archiveStatus: card.archiveStatus,
          ucStatus: card.ucStatus,
          previousColumnId: card.previousColumnId,
          position: cardIndex + 1,
          creatorName: card.creatorName,
          responsibleName: card.responsibleName,
          deviceName: card.deviceName,
          priority: card.priority,
          dueDate: card.dueDate,
          statusChangedAt: card.statusChangedAt,
          partNumber: card.partNumber,
          serialNumber: card.serialNumber,
          sapNumber: card.sapNumber,
          orderNumber: card.orderNumber
        }
      });
    }
  }

  console.log(`Seed completed with ${boardNames.length} boards and ${assigneeNames.length * 6} cards.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
