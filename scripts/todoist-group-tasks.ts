#!/usr/bin/env -S deno run --allow-read --allow-sys --allow-env --allow-run --allow-net
import {
    createCommand,
    SyncCommand,
    type Task,
    TodoistApi,
} from "npm:@doist/todoist-api-typescript@6.8.0";
import { getEnvVar, logStep, logSuccess } from "./utils.ts";

const api = new TodoistApi(getEnvVar("TODOIST_API_KEY"));

async function* getTasks(projectId: string) {
    let cursor;
    while (true) {
        const tasks = await api.getTasks({ projectId, cursor, limit: 30 });
        cursor = tasks.nextCursor;
        const results = tasks.results;
        if (tasks.nextCursor) {
            yield results;
        } else {
            yield results;
            return;
        }
    }
}

async function main(projectId: string) {
    const allTasks = (await Array.fromAsync(getTasks(projectId))).flat();
    logStep("Загружено задач: " + allTasks.length);
    const tasks = allTasks
        .filter(({ addedAt, content, parentId }) =>
            addedAt && !content.trim().startsWith("* ") && !parentId
        )
        .map((task) => {
            const date = new Date(task.addedAt ?? 0);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return { ...task, groupName: `* **${year}.${month}.${day}**` };
        });
    const groups = Object.entries(
        Object.groupBy(tasks, ({ groupName }) => groupName),
    );

    const groupTasks = new Map<string, Task>();
    const getTaskByGroup = async (group: string) => {
        if (groupTasks.has(group)) {
            return groupTasks.get(group);
        } else {
            const task = allTasks.find(({ content }) =>
                content.includes(group)
            );
            if (task) {
                groupTasks.set(group, task);
                return task;
            }
        }
        logStep(`Создание задачи: ${group}`);
        const task = await api.addTask({
            projectId,
            content: group,
        });
        groupTasks.set(group, task);
        return task;
    };

    let moveCommands: Array<SyncCommand> = [];
    for (const [group, tasks] of groups) {
        if (!tasks) continue;
        for (const task of tasks) {
            const parentId = (await getTaskByGroup(group))?.id;
            if (!parentId || task.parentId === parentId) continue;
            moveCommands.push(createCommand("item_move", {
                id: task.id,
                parentId,
            }));
        }
    }

    let portion = 0;
    while (moveCommands.length > 0) {
        portion++;
        logStep(
            `Выполнение ${portion} порции команд на перемещение.`,
        );
        const endIndex = moveCommands.length > 50 ? 50 : moveCommands.length;
        logStep(
            `Перемещение ${endIndex} задач`,
        );
        await api.sync({
            commands: moveCommands.slice(0, endIndex),
        });
        moveCommands = moveCommands.slice(endIndex);
    }

    logSuccess("Задачи успешно сгруппированы");
}

for (const projectId of getEnvVar("TODOIST_PROJECTS").split(",")) {
    main(projectId);
}
