const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const inputPath = path.join(rootDir, "data.sql");
const outputPath = path.join(rootDir, "data.postgres.sql");

const mysql = fs.readFileSync(inputPath, "utf8").replace(/\r\n/g, "\n");
const lines = mysql.split("\n");

const tables = new Map();
const output = [
  "-- Converted from data.sql MySQL dump for PostgreSQL.",
  "-- Source database: app_quan_tri; target database: app_ke_toan.",
  "SET client_encoding = 'UTF8';",
  "SET standard_conforming_strings = on;",
  "",
];
const indexes = [];
const constraints = [];

function quoteIdent(name) {
  return `"${name.replace(/"/g, '""')}"`;
}

function convertIdentifiers(sql) {
  return sql.replace(/`([^`]+)`/g, (_, name) => quoteIdent(name));
}

function trimTrailingComma(line) {
  return line.replace(/,\s*$/, "");
}

function splitColumns(definition) {
  const result = [];
  let current = "";
  let depth = 0;
  let quote = null;

  for (let index = 0; index < definition.length; index += 1) {
    const char = definition[index];
    const next = definition[index + 1];

    if (quote) {
      current += char;
      if (char === "\\" && next) {
        current += next;
        index += 1;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === "'" || char === '"') {
      quote = char;
      current += char;
      continue;
    }

    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;

    if (char === "," && depth === 0) {
      result.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  if (current.trim()) result.push(current.trim());
  return result;
}

function convertColumn(line, table) {
  let converted = trimTrailingComma(convertIdentifiers(line.trim()));
  converted = converted.replace(/\s+COLLATE\s+utf8mb4_unicode_ci/gi, "");
  converted = converted.replace(/\s+CHARACTER SET\s+utf8mb4/gi, "");
  converted = converted.replace(/\blongtext\b/gi, "text");
  converted = converted.replace(/\bdatetime\((\d+)\)/gi, "timestamp($1)");
  converted = converted.replace(/\bdatetime\b/gi, "timestamp");
  converted = converted.replace(/\btinyint\(1\)/gi, "boolean");
  converted = converted.replace(/\bint\s+unsigned\b/gi, "integer");
  converted = converted.replace(/\bint\b/gi, "integer");
  converted = converted.replace(/\benum\s*\([^)]*\)/gi, "varchar(64)");

  if (/\bboolean\b/i.test(converted)) {
    converted = converted.replace(/DEFAULT\s+'1'/gi, "DEFAULT true");
    converted = converted.replace(/DEFAULT\s+'0'/gi, "DEFAULT false");
  }

  const match = converted.match(/^"([^"]+)"\s+(.+)$/);
  if (match) {
    table.columns.push(match[1]);
    table.booleanColumns.push(/\bboolean\b/i.test(match[2]));
  }

  return `  ${converted}`;
}

function convertKeyColumns(columnSql) {
  return convertIdentifiers(columnSql);
}

function convertCreateTable(startIndex) {
  const createMatch = lines[startIndex].match(/^CREATE TABLE `([^`]+)` \($/);
  if (!createMatch) return startIndex;

  const tableName = createMatch[1];
  const table = { columns: [], booleanColumns: [] };
  const columnDefinitions = [];
  let index = startIndex + 1;

  for (; index < lines.length; index += 1) {
    const rawLine = lines[index];
    if (/^\)\s+ENGINE=/i.test(rawLine)) break;

    const line = rawLine.trim();
    if (!line) continue;

    if (/^PRIMARY KEY/i.test(line)) {
      columnDefinitions.push(`  ${trimTrailingComma(convertIdentifiers(line))}`);
      continue;
    }

    const uniqueMatch = line.match(/^UNIQUE KEY `([^`]+)` \((.+)\),?$/i);
    if (uniqueMatch) {
      indexes.push(`CREATE UNIQUE INDEX ${quoteIdent(uniqueMatch[1])} ON ${quoteIdent(tableName)} (${convertKeyColumns(uniqueMatch[2])});`);
      continue;
    }

    const keyMatch = line.match(/^KEY `([^`]+)` \((.+)\),?$/i);
    if (keyMatch) {
      const indexName = keyMatch[1].startsWith("fk_") ? `${keyMatch[1]}_idx` : keyMatch[1];
      indexes.push(`CREATE INDEX ${quoteIdent(indexName)} ON ${quoteIdent(tableName)} (${convertKeyColumns(keyMatch[2])});`);
      continue;
    }

    const constraintMatch = line.match(/^CONSTRAINT `([^`]+)` (FOREIGN KEY .+)$/i);
    if (constraintMatch) {
      const constraint = convertIdentifiers(trimTrailingComma(constraintMatch[2]));
      constraints.push(`ALTER TABLE ${quoteIdent(tableName)} ADD CONSTRAINT ${quoteIdent(constraintMatch[1])} ${constraint};`);
      continue;
    }

    columnDefinitions.push(convertColumn(line, table));
  }

  tables.set(tableName, table);
  output.push(`DROP TABLE IF EXISTS ${quoteIdent(tableName)} CASCADE;`);
  output.push(`CREATE TABLE ${quoteIdent(tableName)} (`);
  output.push(columnDefinitions.join(",\n"));
  output.push(");");
  output.push("");

  return index;
}

function splitTuples(valuesSql) {
  const tuples = [];
  let current = "";
  let depth = 0;
  let quote = null;

  for (let index = 0; index < valuesSql.length; index += 1) {
    const char = valuesSql[index];
    const next = valuesSql[index + 1];

    if (quote) {
      current += char;
      if (char === "\\" && next) {
        current += next;
        index += 1;
      } else if (char === quote) {
        if (next === quote) {
          current += next;
          index += 1;
        } else {
          quote = null;
        }
      }
      continue;
    }

    if (char === "'") {
      quote = char;
      current += char;
      continue;
    }

    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;

    if (char === "," && depth === 0) {
      tuples.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  if (current.trim()) tuples.push(current.trim());
  return tuples;
}

function splitValues(tupleSql) {
  const inner = tupleSql.replace(/^\(/, "").replace(/\)$/, "");
  return splitColumns(inner);
}

function convertValue(value, isBoolean) {
  let converted = value.trim();
  converted = converted.replace(/\\'/g, "''");
  converted = converted.replace(/\\"/g, '"');

  if (isBoolean) {
    if (converted === "1" || /^'1'$/.test(converted)) return "true";
    if (converted === "0" || /^'0'$/.test(converted)) return "false";
  }

  return converted;
}

function convertInsert(line) {
  const match = line.match(/^INSERT INTO `([^`]+)` VALUES (.+);$/i);
  if (!match) return convertIdentifiers(line);

  const tableName = match[1];
  const table = tables.get(tableName);
  if (!table) return convertIdentifiers(line);

  const tuples = splitTuples(match[2]).map((tuple) => {
    const values = splitValues(tuple).map((value, index) =>
      convertValue(value, table.booleanColumns[index]),
    );
    return `(${values.join(",")})`;
  });

  const columns = table.columns.map(quoteIdent).join(",");
  return `INSERT INTO ${quoteIdent(tableName)} (${columns}) VALUES ${tuples.join(",")};`;
}

for (let index = 0; index < lines.length; index += 1) {
  const line = lines[index];

  if (/^CREATE TABLE `/.test(line)) {
    index = convertCreateTable(index);
    continue;
  }

  if (/^INSERT INTO `/.test(line)) {
    output.push(convertInsert(line));
    continue;
  }

  if (
    /^\/\*!/.test(line) ||
    /^\s*SET\s+/i.test(line) ||
    /^LOCK TABLES/i.test(line) ||
    /^UNLOCK TABLES/i.test(line) ||
    /^DROP TABLE/i.test(line)
  ) {
    continue;
  }

  if (line.trim().startsWith("--") || line.trim() === "") {
    continue;
  }
}

output.push("");
output.push("-- Indexes");
output.push(...indexes);
output.push("");
output.push("-- Foreign keys");
output.push(...constraints);
output.push("");

fs.writeFileSync(outputPath, output.join("\n"), "utf8");
console.log(`Converted ${tables.size} tables to ${path.relative(rootDir, outputPath)}`);
