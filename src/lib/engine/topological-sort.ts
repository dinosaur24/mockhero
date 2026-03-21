/**
 * Topological sort for table dependency resolution.
 * Ensures parent tables (referenced by "ref" fields) are generated before child tables.
 */

import type { TableDefinition } from "./types";

export type SortResult =
  | { success: true; sorted: TableDefinition[] }
  | { success: false; cycle: string[] };

export function topologicalSort(tables: TableDefinition[]): SortResult {
  const tableMap = new Map<string, TableDefinition>();

  for (const table of tables) {
    tableMap.set(table.name, table);
  }

  // If table A has a ref to table B, then B must come before A.
  // Edge: B → A (B is a prerequisite for A)
  const deps = new Map<string, Set<string>>(); // table -> tables that must come AFTER it
  const inDeg = new Map<string, number>();

  for (const table of tables) {
    deps.set(table.name, new Set());
    inDeg.set(table.name, 0);
  }

  for (const table of tables) {
    for (const field of table.fields) {
      if (field.type === "ref" && field.params?.table) {
        const parent = field.params.table as string;
        if (tableMap.has(parent) && parent !== table.name) {
          // parent → table (parent must be generated first)
          if (!deps.get(parent)!.has(table.name)) {
            deps.get(parent)!.add(table.name);
            inDeg.set(table.name, (inDeg.get(table.name) ?? 0) + 1);
          }
        }
      }
    }
  }

  // Kahn's algorithm
  const queue: string[] = [];
  for (const [name, degree] of inDeg) {
    if (degree === 0) queue.push(name);
  }

  const sorted: TableDefinition[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    sorted.push(tableMap.get(current)!);

    for (const dependent of deps.get(current) ?? []) {
      const newDeg = inDeg.get(dependent)! - 1;
      inDeg.set(dependent, newDeg);
      if (newDeg === 0) queue.push(dependent);
    }
  }

  // If we didn't sort all tables, there's a cycle
  if (sorted.length !== tables.length) {
    // Find the cycle
    const remaining = tables
      .filter((t) => !sorted.some((s) => s.name === t.name))
      .map((t) => t.name);

    // Build simple cycle path
    const cycle: string[] = [];
    const visited = new Set<string>();
    let current = remaining[0];

    while (current && !visited.has(current)) {
      visited.add(current);
      cycle.push(current);

      // Find a dependency that's also in remaining
      const table = tableMap.get(current)!;
      let next: string | undefined;
      for (const field of table.fields) {
        if (field.type === "ref" && field.params?.table) {
          const ref = field.params.table as string;
          if (remaining.includes(ref)) {
            next = ref;
            break;
          }
        }
      }
      current = next!;
    }

    if (current) cycle.push(current); // Close the cycle

    return { success: false, cycle };
  }

  return { success: true, sorted };
}
