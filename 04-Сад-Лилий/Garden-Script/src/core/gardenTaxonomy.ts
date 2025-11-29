import { GardenConfig, GardenNode, TaxonParseResult, TaxonomyNode } from "../types/garden.js";

export function parseGardenName(name: string): TaxonParseResult {
  const trimmed = name.trim();
  const base = trimmed.endsWith("()") ? trimmed.slice(0, -2) : trimmed;
  const parts = base.split("_");
  const gesture = parts.pop();

  if (!gesture) {
    throw new Error(`Garden function must have a gesture part: ${name}`);
  }

  if (parts.length === 0) {
    throw new Error(`Garden function must include a taxonomy path before gesture: ${name}`);
  }

  return { taxonPath: parts, gesture };
}

export function isValidTaxonPath(path: string[], taxonomy: TaxonomyNode[]): boolean {
  if (path.length === 0) {
    return false;
  }

  const [current, ...rest] = path;

  for (const node of taxonomy) {
    if (typeof node === "string") {
      if (node === current) {
        return rest.length === 0;
      }
    } else {
      const key = Object.keys(node)[0];
      const children = node[key] ?? [];

      if (key === current) {
        return rest.length === 0 ? true : isValidTaxonPath(rest, children);
      }
    }
  }

  return false;
}

export function validateAndBuildTree(functions: string[], config: GardenConfig): GardenNode {
  const root: GardenNode = { children: {}, functions: [] };
  const taxonomy = config.garden.taxonomy;

  for (const fn of functions) {
    const { taxonPath } = parseGardenName(fn);

    if (!isValidTaxonPath(taxonPath, taxonomy)) {
      throw new Error(
        `Unknown taxon path ${taxonPath.join("_")} in function ${fn}\nCheck garden.config.yaml`
      );
    }

    let current = root;

    for (const segment of taxonPath) {
      if (!current.children[segment]) {
        current.children[segment] = { children: {}, functions: [] };
      }

      current = current.children[segment];
    }

    current.functions.push(fn);
  }

  return root;
}

export function renderGardenTree(node: GardenNode, depth = 0): string[] {
  const lines: string[] = [];
  const indent = "  ".repeat(depth);
  const childrenKeys = Object.keys(node.children).sort((a, b) => a.localeCompare(b));

  for (const key of childrenKeys) {
    const child = node.children[key];
    lines.push(`${indent}// ${key}`);

    child.functions.sort((a, b) => a.localeCompare(b)).forEach((fn) => {
      lines.push(`${indent}${fn}`);
    });

    lines.push(...renderGardenTree(child, depth + 1));
  }

  return lines;
}

export function getSortedMethods(node: GardenNode): string[] {
  const methods: string[] = [];
  const childrenKeys = Object.keys(node.children).sort((a, b) => a.localeCompare(b));

  for (const key of childrenKeys) {
    const child = node.children[key];
    child.functions.sort((a, b) => a.localeCompare(b)).forEach((fn) => {
      methods.push(fn);
    });
    methods.push(...getSortedMethods(child));
  }

  return methods;
}
