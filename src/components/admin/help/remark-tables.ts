/**
 * Minimal GitHub-style pipe tables for help markdown, without adding
 * remark-gfm. CommonMark parses a pipe table as one paragraph; this plugin
 * turns such paragraphs into mdast `table` nodes, which remark-rehype renders.
 * Inline formatting inside cells (code, links, emphasis) is kept.
 */

interface MdNode {
  type: string;
  value?: string;
  children?: MdNode[];
  align?: (null | "left" | "right" | "center")[];
  [key: string]: unknown;
}

type Cell = MdNode[];
type Row = Cell[];

/** Split a paragraph's inline children into rows (on newlines) and cells (on pipes). */
function splitRows(children: MdNode[]): Row[] {
  const rows: Row[] = [];
  let row: Row = [];
  let cell: Cell = [];
  const pushText = (value: string) => {
    if (value) cell.push({ type: "text", value });
  };
  for (const child of children) {
    if (child.type === "text" && typeof child.value === "string") {
      let buf = "";
      for (const ch of child.value) {
        if (ch === "\n") {
          pushText(buf);
          buf = "";
          row.push(cell);
          rows.push(row);
          row = [];
          cell = [];
        } else if (ch === "|") {
          pushText(buf);
          buf = "";
          row.push(cell);
          cell = [];
        } else {
          buf += ch;
        }
      }
      pushText(buf);
    } else if (child.type === "break") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = [];
    } else {
      cell.push(child);
    }
  }
  row.push(cell);
  rows.push(row);
  return rows.map(trimRow).filter((r) => r.length > 0);
}

function cellText(cell: Cell): string {
  return cell.map((n) => (n.type === "text" ? (n.value ?? "") : "x")).join("");
}

function trimCell(cell: Cell): Cell {
  const out = cell.map((n) => ({ ...n }));
  if (out[0]?.type === "text") out[0].value = (out[0].value ?? "").replace(/^\s+/, "");
  const last = out.at(-1);
  if (last?.type === "text") last.value = (last.value ?? "").replace(/\s+$/, "");
  return out.filter((n) => n.type !== "text" || n.value);
}

/** Drop the empty cells created by leading and trailing pipes. */
function trimRow(row: Row): Row {
  const cells = row.map(trimCell);
  if (cells.length > 1 && cells[0].length === 0) cells.shift();
  if (cells.length > 1 && cells.at(-1)!.length === 0) cells.pop();
  if (cells.length === 1 && cells[0].length === 0) return [];
  return cells;
}

function isDelimiterRow(row: Row): boolean {
  return row.length > 0 && row.every((c) => /^\s*:?-{1,}:?\s*$/.test(cellText(c)));
}

function alignOf(cell: Cell): null | "left" | "right" | "center" {
  const t = cellText(cell).trim();
  const left = t.startsWith(":");
  const right = t.endsWith(":");
  if (left && right) return "center";
  if (right) return "right";
  if (left) return "left";
  return null;
}

function toTable(paragraph: MdNode): MdNode | null {
  const children = paragraph.children ?? [];
  const first = children[0];
  if (!first || first.type !== "text" || !first.value?.includes("|")) return null;
  const rows = splitRows(children);
  if (rows.length < 2 || !isDelimiterRow(rows[1])) return null;
  const width = rows[0].length;
  if (rows[1].length !== width) return null;
  const body = [rows[0], ...rows.slice(2)];
  return {
    type: "table",
    align: rows[1].map(alignOf),
    children: body.map((r) => ({
      type: "tableRow",
      children: Array.from({ length: width }, (_, i) => ({ type: "tableCell", children: r[i] ?? [] })),
    })),
  };
}

function walk(node: MdNode) {
  if (!node.children) return;
  node.children = node.children.map((child) => {
    if (child.type === "paragraph") return toTable(child) ?? child;
    walk(child);
    return child;
  });
}

export function remarkPipeTables() {
  return (tree: MdNode) => {
    walk(tree);
  };
}
