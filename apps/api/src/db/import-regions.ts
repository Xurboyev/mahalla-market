/**
 * Rasmiy hududlar ro'yxatini (SOATO) CSV fayldan import qiladi.
 *
 *   npm run db:import-regions -- hududlar.csv
 *
 * CSV ustunlari (sarlavha qatori majburiy, ajratuvchi: vergul yoki nuqta-vergul):
 *   soato,parent_soato,level,name,name_ru,lat,lng
 *   1726,,VILOYAT,Toshkent shahri,город Ташкент,41.2995,69.2401
 *   1726287,1726,TUMAN,Yunusobod tumani,Юнусабадский район,,
 *   ...
 * level: VILOYAT | TUMAN | MFY. Ota-yozuv fayldan oldinroq kelishi yoki bazada bo'lishi kerak.
 * SOATO bo'yicha upsert qiladi — qayta ishga tushirish xavfsiz.
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import { eq } from "drizzle-orm";
import { createDb } from "./client";
import { regions } from "./schema";

type Level = "VILOYAT" | "TUMAN" | "MFY";
const LEVELS: Level[] = ["VILOYAT", "TUMAN", "MFY"];

export function parseCsv(text: string): Record<string, string>[] {
  const lines = text.replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim());
  const sep = lines[0].includes(";") ? ";" : ",";
  const split = (line: string) => {
    const out: string[] = [];
    let cur = "";
    let q = false;
    for (const ch of line) {
      if (ch === '"') q = !q;
      else if (ch === sep && !q) {
        out.push(cur);
        cur = "";
      } else cur += ch;
    }
    out.push(cur);
    return out.map((s) => s.trim());
  };
  const head = split(lines[0]).map((h) => h.toLowerCase());
  return lines.slice(1).map((l) => {
    const cells = split(l);
    return Object.fromEntries(head.map((h, i) => [h, cells[i] ?? ""]));
  });
}

async function main(file: string) {
  const rows = parseCsv(readFileSync(file, "utf8"));
  // Ota-onalar avval kelishi uchun darajasi bo'yicha saralaymiz
  rows.sort((a, b) => LEVELS.indexOf(a.level as Level) - LEVELS.indexOf(b.level as Level));

  const { db, pool } = createDb();
  const idBySoato = new Map<string, number>();
  let ok = 0;
  const errors: string[] = [];
  try {
    for (const [i, r] of rows.entries()) {
      const level = r.level?.toUpperCase() as Level;
      if (!r.soato || !r.name || !LEVELS.includes(level)) {
        errors.push(`${i + 2}-qator: soato/name/level noto'g'ri`);
        continue;
      }
      let parentId: number | null = null;
      if (r.parent_soato) {
        parentId = idBySoato.get(r.parent_soato) ?? null;
        if (!parentId) {
          const p = await db.query.regions.findFirst({ where: eq(regions.soato, r.parent_soato) });
          parentId = p?.id ?? null;
        }
        if (!parentId) {
          errors.push(`${i + 2}-qator: ota SOATO ${r.parent_soato} topilmadi`);
          continue;
        }
      }
      const values = {
        soato: r.soato,
        name: r.name,
        nameRu: r.name_ru || null,
        level,
        parentId,
        lat: r.lat ? Number(r.lat) : null,
        lng: r.lng ? Number(r.lng) : null,
      };
      const [row] = await db
        .insert(regions)
        .values(values)
        .onConflictDoUpdate({ target: regions.soato, set: values })
        .returning({ id: regions.id });
      idBySoato.set(r.soato, row.id);
      ok++;
    }
  } finally {
    await pool.end();
  }
  console.log(`✔ ${ok} ta hudud yozildi, ${errors.length} ta xato`);
  errors.slice(0, 20).forEach((e) => console.log("  ✖", e));
}

if (require.main === module) {
  const file = process.argv[2];
  if (!file) {
    console.error("Foydalanish: npm run db:import-regions -- hududlar.csv");
    process.exit(1);
  }
  main(file).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
