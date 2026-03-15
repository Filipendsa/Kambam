import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean existing seed data
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();

  const project1 = await prisma.project.create({
    data: {
      name: "TaskBoard Yesode",
      description: "Painel interno de gestão de tarefas da equipe Yesode",
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: "Site Institucional",
      description: "Novo site da Yesode com landing pages por serviço",
    },
  });

  await prisma.task.createMany({
    data: [
      {
        title: "Implementar autenticação Google OAuth",
        description: "NextAuth v5 com allowlist de emails @yesode.com",
        status: "done",
        priority: "high",
        assignee: "filipe.nogueira@yesode.com",
        createdBy: "filipe.nogueira@yesode.com",
        projectId: project1.id,
      },
      {
        title: "Criar board Kanban com drag-and-drop",
        status: "in_progress",
        priority: "high",
        assignee: "davi.ribeiro@yesode.com",
        createdBy: "filipe.nogueira@yesode.com",
        projectId: project1.id,
      },
      {
        title: "Definir paleta de cores e tipografia",
        status: "backlog",
        priority: "medium",
        assignee: "",
        createdBy: "davi.ribeiro@yesode.com",
        projectId: project2.id,
      },
    ],
  });

  console.log("Seed completed: 2 projects, 3 tasks");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
