import _ from "lodash";
import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const DB_PATH = path.resolve("database.json");
let db: Record<string, any> = {};

async function load() {
    if (existsSync(DB_PATH)) {
        const raw = await readFile(DB_PATH, "utf-8");
        db = JSON.parse(raw);
    }
}

async function save() {
    await writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

export async function set<T>(path: string, data: any) {
    await load();
    _.set(db, path, data);
    await save();
}

export async function get<T>(path: string, data?: any): Promise<T | null> {
    await load();
    return _.get(db, path, null);
}
