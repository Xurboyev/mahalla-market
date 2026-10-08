import { parseCsv } from "./import-regions";

describe("parseCsv", () => {
  it("vergul va qo'shtirnoqli maydonlarni o'qiydi", () => {
    const rows = parseCsv('soato,parent_soato,level,name\n1726,,VILOYAT,"Toshkent, shahri"\n');
    expect(rows).toEqual([{ soato: "1726", parent_soato: "", level: "VILOYAT", name: "Toshkent, shahri" }]);
  });
  it("nuqta-vergul, BOM va Windows qator oxirini qo'llab-quvvatlaydi", () => {
    const rows = parseCsv("﻿soato;level;name\r\n1703;VILOYAT;Andijon viloyati\r\n");
    expect(rows[0]).toEqual({ soato: "1703", level: "VILOYAT", name: "Andijon viloyati" });
  });
});
