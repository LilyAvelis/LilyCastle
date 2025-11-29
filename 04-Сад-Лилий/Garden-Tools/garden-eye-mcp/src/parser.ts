/**
 * Парсер для извлечения структуры файлов
 */

// ============ MARKDOWN ============

export function parseMarkdown(content: string): string {
  const lines = content.split("\n");
  const result: string[] = [];

  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)/);
    if (match) {
      const level = match[1].length;
      const indent = "  ".repeat(level - 1);
      const icon = level === 1 ? "📄" : level === 2 ? "📑" : "📌";
      result.push(`${indent}${icon} ${match[0]}`);
    }
  }

  if (result.length === 0) {
    return "📝 (нет заголовков)";
  }

  return result.join("\n");
}

// ============ TYPESCRIPT ============

type SymbolKind =
  | "class"
  | "interface"
  | "type"
  | "function"
  | "method"
  | "property"
  | "constructor"
  | "key"
  | "array"
  | "object"
  | "section"
  | "package"
  | "module"
  | "namespace"
  | "struct"
  | "enum"
  | "trait"
  | "impl"
  | "selector"
  | "media"
  | "protocol"
  | "extension"
  | "decorator"
  | "annotation"
  | "tag"
  | "element"
  | "traitImpl"
  | "objectLiteral"
  | "field"
  | "unknown";

interface Symbol {
  name: string;
  kind: SymbolKind;
  startLine: number;
  endLine: number;
  children?: Symbol[];
  signature?: string;
  details?: string;
}

export function parseTypeScript(content: string): string {
  const lines = content.split("\n");
  const symbols: Symbol[] = [];

  let currentClass: Symbol | null = null;
  let braceStack: number[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Пропускаем пустые строки и комментарии
    if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("*")) {
      continue;
    }

    // Import statements — пропускаем
    if (trimmed.startsWith("import ")) {
      continue;
    }

    // Class
    const classMatch = trimmed.match(
      /^(?:export\s+)?(?:abstract\s+)?class\s+(\w+)(?:\s+extends\s+\w+)?(?:\s+implements\s+[\w,\s]+)?/
    );
    if (classMatch) {
      currentClass = {
        name: classMatch[1],
        kind: "class",
        startLine: i + 1,
        endLine: i + 1,
        children: [],
      };
      symbols.push(currentClass);
      braceStack.push(i);
      continue;
    }

    // Interface
    const interfaceMatch = trimmed.match(/^(?:export\s+)?interface\s+(\w+)/);
    if (interfaceMatch) {
      symbols.push({
        name: interfaceMatch[1],
        kind: "interface",
        startLine: i + 1,
        endLine: i + 1,
      });
      continue;
    }

    // Type
    const typeMatch = trimmed.match(/^(?:export\s+)?type\s+(\w+)/);
    if (typeMatch) {
      symbols.push({
        name: typeMatch[1],
        kind: "type",
        startLine: i + 1,
        endLine: i + 1,
      });
      continue;
    }

    // Top-level function
    const funcMatch = trimmed.match(
      /^(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*(<[^>]+>)?\s*\(([^)]*)\)(?:\s*:\s*([^{]+))?/
    );
    if (funcMatch && !currentClass) {
      const signature = `function ${funcMatch[1]}(${funcMatch[3]})${funcMatch[4] ? `: ${funcMatch[4].trim()}` : ""}`;
      symbols.push({
        name: funcMatch[1],
        kind: "function",
        startLine: i + 1,
        endLine: i + 1,
        signature,
      });
      continue;
    }

    // Method inside class
    if (currentClass) {
      // Constructor
      const ctorMatch = trimmed.match(/^constructor\s*\(([^)]*)\)/);
      if (ctorMatch) {
        currentClass.children?.push({
          name: "constructor",
          kind: "constructor",
          startLine: i + 1,
          endLine: i + 1,
          signature: `constructor(${ctorMatch[1]})`,
        });
        continue;
      }

      // Method
      const methodMatch = trimmed.match(
        /^(?:private\s+|public\s+|protected\s+)?(?:static\s+)?(?:async\s+)?(\w+)\s*(<[^>]+>)?\s*\(([^)]*)\)(?:\s*:\s*([^{]+))?/
      );
      if (methodMatch && !trimmed.startsWith("if") && !trimmed.startsWith("for") && !trimmed.startsWith("while")) {
        const visibility = trimmed.match(/^(private|public|protected)/)?.[1] || "";
        const isAsync = trimmed.includes("async ");
        const signature = `${visibility ? visibility + " " : ""}${isAsync ? "async " : ""}${methodMatch[1]}(${methodMatch[3]})${methodMatch[4] ? `: ${methodMatch[4].trim()}` : ""}`;
        
        currentClass.children?.push({
          name: methodMatch[1],
          kind: "method",
          startLine: i + 1,
          endLine: i + 1,
          signature,
        });
        continue;
      }

      // Property
      const propMatch = trimmed.match(
        /^(?:private\s+|public\s+|protected\s+)?(?:readonly\s+)?(\w+)(?:\?)?:\s*([^=;]+)/
      );
      if (propMatch && !trimmed.includes("(")) {
        currentClass.children?.push({
          name: propMatch[1],
          kind: "property",
          startLine: i + 1,
          endLine: i + 1,
          signature: `${propMatch[1]}: ${propMatch[2].trim()}`,
        });
      }
    }

    // Track braces to know when class ends
    const openBraces = (line.match(/{/g) || []).length;
    const closeBraces = (line.match(/}/g) || []).length;

    for (let j = 0; j < openBraces; j++) braceStack.push(i);
    for (let j = 0; j < closeBraces; j++) {
      braceStack.pop();
      if (braceStack.length === 0 && currentClass) {
        currentClass.endLine = i + 1;
        currentClass = null;
      }
    }
  }

  return stringifySymbols(symbols);
}

// ============ JSON ============

export function parseJson(content: string): string {
  let data: any;
  try {
    data = JSON.parse(content);
  } catch (error) {
    return `⚠️ Invalid JSON: ${(error as Error).message}`;
  }

  if (Array.isArray(data)) {
    return `🔢 Array with ${data.length} items`;
  }

  if (data === null || typeof data !== "object") {
    return `🔑 value: ${truncateValue(JSON.stringify(data))}`;
  }

  const lines = content.split("\n");
  const symbols: Symbol[] = [];
  for (const key of Object.keys(data)) {
    const descriptor = describeJsonValue(data[key]);
    const lineNumber = findLineNumber(lines, new RegExp(`"${escapeRegExp(key)}"\\s*:`));
    symbols.push({
      name: key,
      kind: "key",
      startLine: lineNumber,
      endLine: lineNumber,
      signature: `${key}: ${descriptor}`,
    });
  }

  return stringifySymbols(symbols, "📝 (нет ключей верхнего уровня)");
}

// ============ YAML ============

export function parseYaml(content: string): string {
  const lines = content.split("\n");
  const symbols: Symbol[] = [];
  const stack: { indent: number; node: Symbol }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const indent = rawLine.match(/^\s*/)?.[0].length ?? 0;
    const keyMatch = rawLine.match(/^\s*([\w.-]+):\s*(.*)$/);
    if (!keyMatch) {
      continue;
    }

    while (stack.length && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }

    const key = keyMatch[1];
    const valuePart = keyMatch[2].trim();
    const node: Symbol = {
      name: key,
      kind: "key",
      startLine: i + 1,
      endLine: i + 1,
      signature: valuePart ? `${key}: ${valuePart}` : `${key}:`,
      children: [],
    };

    const parent = stack.length ? stack[stack.length - 1].node : null;
    if (parent) {
      parent.children = parent.children || [];
      parent.children.push(node);
    } else {
      symbols.push(node);
    }

    if (!valuePart || valuePart === "|" || valuePart === ">" || valuePart === "-") {
      stack.push({ indent, node });
    }
  }

  return stringifySymbols(symbols, "📝 (нет YAML ключей)");
}

// ============ PYTHON ============

export function parsePython(content: string): string {
  const lines = content.split("\n");
  const symbols: Symbol[] = [];
  const stack: { indent: number; node: Symbol }[] = [];
  let pendingDecorators: string[] = [];

  const pushNode = (node: Symbol, indent: number, isBlock: boolean) => {
    const parent = stack.length ? stack[stack.length - 1].node : null;
    if (parent) {
      parent.children = parent.children || [];
      parent.children.push(node);
    } else {
      symbols.push(node);
    }

    if (isBlock) {
      stack.push({ indent, node });
    }
  };

  const getNearestClass = (indent: number) => {
    for (let i = stack.length - 1; i >= 0; i--) {
      if (stack[i].node.kind === "class" && indent > stack[i].indent) {
        return stack[i].node;
      }
    }
    return null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }

    const indent = line.match(/^\s*/)?.[0].length ?? 0;

    while (stack.length && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }

    stack.forEach((entry) => (entry.node.endLine = i + 1));

    if (trimmed.startsWith("@")) {
      pendingDecorators.push(trimmed);
      continue;
    }

    const classMatch = trimmed.match(/^class\s+(\w+)(?:\(([^)]*)\))?:/);
    if (classMatch) {
      const parents = classMatch[2]?.trim();
      const node: Symbol = {
        name: classMatch[1],
        kind: "class",
        startLine: i + 1,
        endLine: i + 1,
        signature: `class ${classMatch[1]}${parents ? ` (${parents})` : ""}`,
        details: pendingDecorators.length ? pendingDecorators.join(" ") : undefined,
        children: [],
      };
      pushNode(node, indent, true);
      pendingDecorators = [];
      continue;
    }

    const funcMatch = trimmed.match(/^(async\s+)?def\s+(\w+)\s*\(([^)]*)\):/);
    if (funcMatch) {
      const parentClass = getNearestClass(indent);
      const kind: SymbolKind = parentClass ? "method" : "function";
      const signature = `${funcMatch[1] ? "async " : ""}def ${funcMatch[2]}(${funcMatch[3]})`;
      const node: Symbol = {
        name: funcMatch[2],
        kind,
        startLine: i + 1,
        endLine: i + 1,
        signature,
        details: pendingDecorators.length ? pendingDecorators.join(" ") : undefined,
        children: [],
      };
      pushNode(node, indent, true);
      pendingDecorators = [];
      continue;
    }

    pendingDecorators = [];
  }

  return stringifySymbols(symbols, "📝 (нет Python символов)");
}

// ============ HTML ============

export function parseHtml(content: string): string {
  const lines = content.split("\n");
  const symbols: Symbol[] = [];
  const stack: { tag: string; node: Symbol }[] = [];
  const interestingTags = new Set(["html", "head", "body", "main", "nav", "section", "article", "header", "footer", "aside"]);
  const selfClosing = new Set(["br", "img", "input", "meta", "link", "hr", "source", "path", "circle", "rect"]);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const matches = line.matchAll(/<\s*(\/)?([a-zA-Z0-9:-]+)([^>]*)>/g);

    for (const match of matches) {
      const isClosing = !!match[1];
      const tag = match[2].toLowerCase();
      const attrs = match[3] || "";

      if (isClosing) {
        for (let s = stack.length - 1; s >= 0; s--) {
          if (stack[s].tag === tag) {
            stack[s].node.endLine = i + 1;
            stack.splice(s, 1);
            break;
          }
        }
        continue;
      }

      const id = attrs.match(/id\s*=\s*["']([^"']+)["']/i)?.[1];
      const classAttr = attrs.match(/class\s*=\s*["']([^"']+)["']/i)?.[1];
      const hasInterestingTag = interestingTags.has(tag) || !!id || !!classAttr;
      if (!hasInterestingTag) {
        continue;
      }

      const node: Symbol = {
        name: id ? `#${id}` : classAttr ? `.${classAttr.split(/\s+/)[0]}` : `<${tag}>`,
        kind: interestingTags.has(tag) ? "tag" : "element",
        startLine: i + 1,
        endLine: i + 1,
        signature: `<${tag}${id ? ` id=\"${id}\"` : ""}${classAttr ? ` class=\"${classAttr}\"` : ""}>`,
        children: [],
      };

      const parent = stack.length ? stack[stack.length - 1].node : null;
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(node);
      } else {
        symbols.push(node);
      }

      const isSelfClosing = selfClosing.has(tag) || /\/\s*>$/.test(match[0]);
      if (!isSelfClosing) {
        stack.push({ tag, node });
      }
    }
  }

  for (const entry of stack) {
    entry.node.endLine = lines.length;
  }

  return stringifySymbols(symbols, "📝 (нет HTML структуры)");
}

// ============ CSS ============

export function parseCss(content: string): string {
  return parseBraceLanguage(
    content,
    ({ trimmed, lineNumber, addSymbol }) => {
      if (!trimmed || trimmed.startsWith("/*")) {
        return;
      }

      if (trimmed.startsWith("@media")) {
        addSymbol(
          {
            name: "@media",
            kind: "media",
            startLine: lineNumber + 1,
            endLine: lineNumber + 1,
            signature: trimmed.replace("{", "").trim(),
          },
          true
        );
        return;
      }

      const selectorMatch = trimmed.match(/^([^{}]+)\{/);
      if (selectorMatch) {
        const selectors = selectorMatch[1]
          .split(",")
          .map((sel) => sel.trim())
          .filter((sel) => sel.length && /[.#]/.test(sel));
        for (const selector of selectors) {
          addSymbol(
            {
              name: selector,
              kind: "selector",
              startLine: lineNumber + 1,
              endLine: lineNumber + 1,
              signature: selector,
            },
            true
          );
        }
      }
    },
    "📝 (нет CSS селекторов)"
  );
}

// ============ YAML already defined ==========

// ============ RUST ============

export function parseRust(content: string): string {
  return parseBraceLanguage(
    content,
    ({ trimmed, lineNumber, addSymbol, currentContext }) => {
      if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("#!")) {
        return;
      }

      if (trimmed.startsWith("#[")) {
        return;
      }

      const modMatch = trimmed.match(/^(?:pub\s+)?mod\s+(\w+)/);
      if (modMatch) {
        addSymbol(
          {
            name: modMatch[1],
            kind: "module",
            startLine: lineNumber + 1,
            endLine: lineNumber + 1,
            signature: `mod ${modMatch[1]}`,
          },
          true
        );
        return;
      }

      const structMatch = trimmed.match(/^(?:pub\s+)?struct\s+(\w+)/);
      if (structMatch) {
        addSymbol(
          {
            name: structMatch[1],
            kind: "struct",
            startLine: lineNumber + 1,
            endLine: lineNumber + 1,
            signature: `struct ${structMatch[1]}`,
          },
          true
        );
        return;
      }

      const enumMatch = trimmed.match(/^(?:pub\s+)?enum\s+(\w+)/);
      if (enumMatch) {
        addSymbol(
          {
            name: enumMatch[1],
            kind: "enum",
            startLine: lineNumber + 1,
            endLine: lineNumber + 1,
            signature: `enum ${enumMatch[1]}`,
          },
          true
        );
        return;
      }

      const traitMatch = trimmed.match(/^(?:pub\s+)?trait\s+(\w+)/);
      if (traitMatch) {
        addSymbol(
          {
            name: traitMatch[1],
            kind: "trait",
            startLine: lineNumber + 1,
            endLine: lineNumber + 1,
            signature: `trait ${traitMatch[1]}`,
          },
          true
        );
        return;
      }

      const implMatch = trimmed.match(/^impl(?:\s*<[^>]+>)?(?:\s+([\w:<>]+)(?:\s+for\s+([\w:<>]+))?)?/);
      if (implMatch) {
        const target = implMatch[2] ? `${implMatch[1]} for ${implMatch[2]}` : implMatch[1] || "impl";
        addSymbol(
          {
            name: target,
            kind: "impl",
            startLine: lineNumber + 1,
            endLine: lineNumber + 1,
            signature: `impl ${target}`,
          },
          true
        );
        return;
      }

      const fnMatch = trimmed.match(/^(?:pub\s+)?(?:async\s+)?fn\s+(\w+)\s*\(([^)]*)\)(?:\s*->\s*([^\s{]+))?/);
      if (fnMatch) {
        const parent = currentContext();
        const isMethod = parent && (parent.kind === "impl" || parent.kind === "trait");
        const signature = `fn ${fnMatch[1]}(${fnMatch[2]})${fnMatch[3] ? ` -> ${fnMatch[3]}` : ""}`;
        addSymbol(
          {
            name: fnMatch[1],
            kind: isMethod ? "method" : "function",
            startLine: lineNumber + 1,
            endLine: lineNumber + 1,
            signature,
          },
          true
        );
      }
    },
    "📝 (нет Rust символов)"
  );
}

// ============ GO ============

export function parseGo(content: string): string {
  return parseBraceLanguage(
    content,
    ({ trimmed, lineNumber, addSymbol, currentContext }) => {
      if (!trimmed || trimmed.startsWith("//")) {
        return;
      }

      const packageMatch = trimmed.match(/^package\s+([\w.]+)/);
      if (packageMatch) {
        addSymbol(
          {
            name: packageMatch[1],
            kind: "package",
            startLine: lineNumber + 1,
            endLine: lineNumber + 1,
            signature: `package ${packageMatch[1]}`,
          },
          false
        );
        return;
      }

      const typeMatch = trimmed.match(/^type\s+(\w+)\s+(struct|interface)\b/);
      if (typeMatch) {
        addSymbol(
          {
            name: typeMatch[1],
            kind: typeMatch[2] === "struct" ? "struct" : "interface",
            startLine: lineNumber + 1,
            endLine: lineNumber + 1,
            signature: `type ${typeMatch[1]} ${typeMatch[2]}`,
          },
          true
        );
        return;
      }

      const funcMatch = trimmed.match(/^func\s*(?:\(([^)]*)\))?\s*(\w+)\s*\(([^)]*)\)\s*(?:([^\s{]+))?/);
      if (funcMatch) {
        const receiver = funcMatch[1]?.trim();
        const name = funcMatch[2];
        const args = funcMatch[3];
        const returnType = funcMatch[4]?.trim();
        const parent = currentContext();
        const kind: SymbolKind = receiver || (parent && parent.kind === "struct") ? "method" : "function";
        const signature = `func ${receiver ? `(${receiver}) ` : ""}${name}(${args})${returnType ? ` ${returnType}` : ""}`;
        addSymbol(
          {
            name,
            kind,
            startLine: lineNumber + 1,
            endLine: lineNumber + 1,
            signature,
          },
          true
        );
      }
    },
    "📝 (нет Go символов)"
  );
}

// ============ C/C++ ============

export function parseCpp(content: string): string {
  return parseBraceLanguage(
    content,
    ({ trimmed, lineNumber, addSymbol }) => {
      if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("#")) {
        return;
      }

      const namespaceMatch = trimmed.match(/^namespace\s+(\w+)/);
      if (namespaceMatch) {
        addSymbol(
          {
            name: namespaceMatch[1],
            kind: "namespace",
            startLine: lineNumber + 1,
            endLine: lineNumber + 1,
            signature: `namespace ${namespaceMatch[1]}`,
          },
          true
        );
        return;
      }

      const typeMatch = trimmed.match(/^(?:class|struct|enum)\s+(\w+)/);
      if (typeMatch) {
        const keyword = trimmed.split(/\s+/)[0];
        const kind: SymbolKind = keyword === "enum" ? "enum" : "struct";
        addSymbol(
          {
            name: typeMatch[1],
            kind,
            startLine: lineNumber + 1,
            endLine: lineNumber + 1,
            signature: `${keyword} ${typeMatch[1]}`,
          },
          true
        );
        return;
      }

      const funcMatch = trimmed.match(/^(?:inline\s+)?(?:virtual\s+)?(?:static\s+)?[\w:<>&\*\s]+\s+(\w+)\s*\([^;]*\)\s*(?:const)?\s*\{/);
      if (funcMatch) {
        addSymbol(
          {
            name: funcMatch[1],
            kind: "function",
            startLine: lineNumber + 1,
            endLine: lineNumber + 1,
            signature: trimmed.replace("{", "").trim(),
          },
          true
        );
      }
    },
    "📝 (нет C/C++ символов)"
  );
}

// ============ JAVA ============

export function parseJava(content: string): string {
  return parseBraceLanguage(
    content,
    ({ trimmed, lineNumber, addSymbol, currentContext }) => {
      if (!trimmed || trimmed.startsWith("//")) {
        return;
      }

      const packageMatch = trimmed.match(/^package\s+([\w.]+);/);
      if (packageMatch) {
        addSymbol(
          {
            name: packageMatch[1],
            kind: "package",
            startLine: lineNumber + 1,
            endLine: lineNumber + 1,
            signature: `package ${packageMatch[1]}`,
          },
          false
        );
        return;
      }

      const classMatch = trimmed.match(/^(?:@[\w.]+\s+)*(?:public\s+|protected\s+|private\s+|abstract\s+|final\s+|static\s+)?(class|interface|enum)\s+(\w+)/);
      if (classMatch) {
        const keyword = classMatch[1];
        const kind: SymbolKind = keyword === "interface" ? "interface" : keyword === "enum" ? "enum" : "class";
        addSymbol(
          {
            name: classMatch[2],
            kind,
            startLine: lineNumber + 1,
            endLine: lineNumber + 1,
            signature: `${keyword} ${classMatch[2]}`,
          },
          true
        );
        return;
      }

      const methodMatch = trimmed.match(
        /^(?:@[\w.]+\s+)*(?:public|protected|private|static|final|abstract|synchronized|default|native)\s+[\w<>,\[\]\s\.]+\s+(\w+)\s*\(([^)]*)\)\s*(?:throws[^{]+)?\{/
      );
      if (methodMatch) {
        const parent = currentContext();
        const kind: SymbolKind = parent && parent.kind !== "package" ? "method" : "function";
        addSymbol(
          {
            name: methodMatch[1],
            kind,
            startLine: lineNumber + 1,
            endLine: lineNumber + 1,
            signature: `${methodMatch[1]}(${methodMatch[2]})`,
          },
          true
        );
      }
    },
    "📝 (нет Java символов)"
  );
}

// ============ C# ============

export function parseCSharp(content: string): string {
  return parseBraceLanguage(
    content,
    ({ trimmed, lineNumber, addSymbol, currentContext }) => {
      if (!trimmed || trimmed.startsWith("//")) {
        return;
      }

      const namespaceMatch = trimmed.match(/^namespace\s+([\w.]+)/);
      if (namespaceMatch) {
        addSymbol(
          {
            name: namespaceMatch[1],
            kind: "namespace",
            startLine: lineNumber + 1,
            endLine: lineNumber + 1,
            signature: `namespace ${namespaceMatch[1]}`,
          },
          true
        );
        return;
      }

      const typeMatch = trimmed.match(/^(?:public|private|protected|internal|static|partial|abstract|sealed)\s+(class|interface|struct|enum)\s+(\w+)/);
      if (typeMatch) {
        const keyword = typeMatch[1];
        let kind: SymbolKind = "class";
        if (keyword === "interface") kind = "interface";
        else if (keyword === "struct") kind = "struct";
        else if (keyword === "enum") kind = "enum";
        addSymbol(
          {
            name: typeMatch[2],
            kind,
            startLine: lineNumber + 1,
            endLine: lineNumber + 1,
            signature: `${keyword} ${typeMatch[2]}`,
          },
          true
        );
        return;
      }

      const methodMatch = trimmed.match(
        /^(?:public|private|protected|internal|static|virtual|override|async|sealed|extern|partial)\s+[\w<>,\[\]\s\.]+\s+(\w+)\s*\(([^)]*)\)\s*(?:=>|\{)/
      );
      if (methodMatch) {
        const parent = currentContext();
        const isMethod = parent && parent.kind !== "namespace";
        const signature = `${trimmed.split("{")[0].trim()}`;
        addSymbol(
          {
            name: methodMatch[1],
            kind: isMethod ? "method" : "function",
            startLine: lineNumber + 1,
            endLine: lineNumber + 1,
            signature,
          },
          true
        );
      }
    },
    "📝 (нет C# символов)"
  );
}

// ============ PHP ============

export function parsePhp(content: string): string {
  return parseBraceLanguage(
    content,
    ({ trimmed, lineNumber, addSymbol, currentContext }) => {
      if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("#")) {
        return;
      }

      const namespaceMatch = trimmed.match(/^namespace\s+([\\\\\w]+)/);
      if (namespaceMatch) {
        addSymbol(
          {
            name: namespaceMatch[1],
            kind: "namespace",
            startLine: lineNumber + 1,
            endLine: lineNumber + 1,
            signature: `namespace ${namespaceMatch[1]}`,
          },
          true
        );
        return;
      }

      const typeMatch = trimmed.match(/^(?:abstract\s+|final\s+)?(class|interface|trait)\s+(\w+)/);
      if (typeMatch) {
        const keyword = typeMatch[1];
        const kind: SymbolKind = keyword === "interface" ? "interface" : keyword === "trait" ? "trait" : "class";
        addSymbol(
          {
            name: typeMatch[2],
            kind,
            startLine: lineNumber + 1,
            endLine: lineNumber + 1,
            signature: `${keyword} ${typeMatch[2]}`,
          },
          true
        );
        return;
      }

      const funcMatch = trimmed.match(/^(?:public|protected|private|static|final|abstract)?\s*function\s+(\w+)\s*\(([^)]*)\)/);
      if (funcMatch) {
        const parent = currentContext();
        const kind: SymbolKind = parent && parent.kind !== "namespace" ? "method" : "function";
        addSymbol(
          {
            name: funcMatch[1],
            kind,
            startLine: lineNumber + 1,
            endLine: lineNumber + 1,
            signature: `function ${funcMatch[1]}(${funcMatch[2]})`,
          },
          true
        );
      }
    },
    "📝 (нет PHP символов)"
  );
}

// ============ RUBY ============

export function parseRuby(content: string): string {
  const lines = content.split("\n");
  const symbols: Symbol[] = [];
  const stack: { node: Symbol; depth: number }[] = [];
  let depth = 0;

  const pushNode = (node: Symbol, isBlock: boolean) => {
    const parent = stack.length ? stack[stack.length - 1].node : null;
    if (parent) {
      parent.children = parent.children || [];
      parent.children.push(node);
    } else {
      symbols.push(node);
    }
    if (isBlock) {
      stack.push({ node, depth: depth + 1 });
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    if (trimmed === "end") {
      depth = Math.max(0, depth - 1);
      const entry = stack.pop();
      if (entry) {
        entry.node.endLine = i + 1;
      }
      continue;
    }

    if (/^(class|module)\s+/.test(trimmed)) {
      const [, keyword, name] = trimmed.match(/^(class|module)\s+([\w:]+)/) || [];
      if (keyword && name) {
        const node: Symbol = {
          name,
          kind: keyword === "class" ? "class" : "module",
          startLine: i + 1,
          endLine: i + 1,
          signature: `${keyword} ${name}`,
          children: [],
        };
        pushNode(node, true);
        depth++;
        continue;
      }
    }

    const defMatch = trimmed.match(/^(?:def)\s+([\w!?=]+)/);
    if (defMatch) {
      const parent = stack.length ? stack[stack.length - 1].node : null;
      const kind: SymbolKind = parent ? "method" : "function";
      const node: Symbol = {
        name: defMatch[1],
        kind,
        startLine: i + 1,
        endLine: i + 1,
        signature: trimmed,
        children: [],
      };
      pushNode(node, true);
      depth++;
      continue;
    }

    const attrMatch = trimmed.match(/^attr_(?:accessor|reader|writer)\s+:([\w]+)/);
    if (attrMatch) {
      const parent = stack.length ? stack[stack.length - 1].node : null;
      const node: Symbol = {
        name: attrMatch[1],
        kind: "property",
        startLine: i + 1,
        endLine: i + 1,
        signature: trimmed,
      };
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(node);
      } else {
        symbols.push(node);
      }
    }
  }

  while (stack.length) {
    const entry = stack.pop();
    if (entry) {
      entry.node.endLine = lines.length;
    }
  }

  return stringifySymbols(symbols, "📝 (нет Ruby символов)");
}

// ============ SWIFT ============

export function parseSwift(content: string): string {
  return parseBraceLanguage(
    content,
    ({ trimmed, lineNumber, addSymbol, currentContext }) => {
      if (!trimmed || trimmed.startsWith("//")) {
        return;
      }

      const typeMatch = trimmed.match(/^(?:public\s+|internal\s+|private\s+|open\s+|final\s+)?(class|struct|enum|protocol|extension)\s+(\w+)/);
      if (typeMatch) {
        const keyword = typeMatch[1];
        let kind: SymbolKind = "class";
        if (keyword === "struct") kind = "struct";
        else if (keyword === "enum") kind = "enum";
        else if (keyword === "protocol") kind = "protocol";
        else if (keyword === "extension") kind = "extension";
        addSymbol(
          {
            name: typeMatch[2],
            kind,
            startLine: lineNumber + 1,
            endLine: lineNumber + 1,
            signature: `${keyword} ${typeMatch[2]}`,
          },
          true
        );
        return;
      }

      const funcMatch = trimmed.match(/^(?:public\s+|internal\s+|private\s+|open\s+|static\s+|mutating\s+|async\s+|throws\s+)*func\s+(\w+)\s*\(([^)]*)\)/);
      if (funcMatch) {
        const parent = currentContext();
        const kind: SymbolKind = parent ? "method" : "function";
        addSymbol(
          {
            name: funcMatch[1],
            kind,
            startLine: lineNumber + 1,
            endLine: lineNumber + 1,
            signature: `func ${funcMatch[1]}(${funcMatch[2]})`,
          },
          true
        );
      }
    },
    "📝 (нет Swift символов)"
  );
}

// ============ KOTLIN ============

export function parseKotlin(content: string): string {
  return parseBraceLanguage(
    content,
    ({ trimmed, lineNumber, addSymbol, currentContext }) => {
      if (!trimmed || trimmed.startsWith("//")) {
        return;
      }

      const packageMatch = trimmed.match(/^package\s+([\w.]+)/);
      if (packageMatch) {
        addSymbol(
          {
            name: packageMatch[1],
            kind: "package",
            startLine: lineNumber + 1,
            endLine: lineNumber + 1,
            signature: `package ${packageMatch[1]}`,
          },
          false
        );
        return;
      }

      const typeMatch = trimmed.match(/^(?:data\s+)?(class|object|interface)\s+(\w+)/);
      if (typeMatch) {
        const keyword = typeMatch[1];
        let kind: SymbolKind = keyword === "interface" ? "interface" : keyword === "object" ? "object" : "class";
        addSymbol(
          {
            name: typeMatch[2],
            kind,
            startLine: lineNumber + 1,
            endLine: lineNumber + 1,
            signature: `${keyword} ${typeMatch[2]}`,
          },
          true
        );
        return;
      }

      const funcMatch = trimmed.match(/^(?:suspend\s+)?fun\s+(\w+)\s*\(([^)]*)\)/);
      if (funcMatch) {
        const parent = currentContext();
        const kind: SymbolKind = parent ? "method" : "function";
        addSymbol(
          {
            name: funcMatch[1],
            kind,
            startLine: lineNumber + 1,
            endLine: lineNumber + 1,
            signature: `${trimmed.split("{")[0].trim()}`,
          },
          true
        );
      }
    },
    "📝 (нет Kotlin символов)"
  );
}

function formatSymbols(symbols: Symbol[], indent: number = 0): string {
  const lines: string[] = [];
  const prefix = "  ".repeat(indent);

  for (const sym of symbols) {
    const icon = getIcon(sym.kind);
    const range = sym.startLine === sym.endLine ? `[${sym.startLine}]` : `[${sym.startLine}–${sym.endLine}]`;
    const labelParts: string[] = [];
    if (sym.signature) {
      labelParts.push(sym.signature);
    } else {
      labelParts.push(`${sym.kind} ${sym.name}`.trim());
    }
    if (sym.details) {
      labelParts.push(sym.details);
    }
    lines.push(`${prefix}${icon} ${labelParts.join(" ")} ${range}`.trim());

    if (sym.children && sym.children.length > 0) {
      lines.push(formatSymbols(sym.children, indent + 1));
    }
  }

  return lines.join("\n");
}

function stringifySymbols(symbols: Symbol[], emptyMessage = "📝 (ничего не найдено)"): string {
  return symbols.length > 0 ? formatSymbols(symbols) : emptyMessage;
}

function getIcon(kind: Symbol["kind"]): string {
  const icons: Record<string, string> = {
    class: "🏛️",
    interface: "🔷",
    type: "🔤",
    function: "⚡",
    method: "⚙️",
    property: "🔹",
    constructor: "🔨",
    key: "🔑",
    array: "🔢",
    object: "🧱",
    section: "📑",
    package: "📦",
    module: "📦",
    namespace: "📦",
    struct: "🏗️",
    enum: "🎚️",
    trait: "🔶",
    impl: "🏛️",
    selector: "🎯",
    media: "📺",
    protocol: "📡",
    extension: "➕",
    decorator: "✨",
    annotation: "🏷️",
    tag: "🔖",
    element: "🔸",
    traitImpl: "🧩",
    objectLiteral: "🧱",
    field: "🔸",
    unknown: "❓",
  };
  return icons[kind] || "❓";
}

interface BraceContext {
  depth: number;
  node: Symbol;
}

interface BraceHandlerOptions {
  line: string;
  trimmed: string;
  lineNumber: number;
  braceDepth: number;
  addSymbol: (symbol: Symbol, hasBlock?: boolean) => void;
  currentContext: () => Symbol | undefined;
  contextStack: BraceContext[];
}

function parseBraceLanguage(
  content: string,
  handler: (options: BraceHandlerOptions) => void,
  emptyMessage = "📝 (ничего не найдено)"
): string {
  const lines = content.split("\n");
  const symbols: Symbol[] = [];
  const stack: BraceContext[] = [];
  let braceDepth = 0;

  const addSymbol = (symbol: Symbol, hasBlock = false) => {
    const parent = stack.length ? stack[stack.length - 1].node : null;
    if (parent) {
      parent.children = parent.children || [];
      parent.children.push(symbol);
    } else {
      symbols.push(symbol);
    }

    if (hasBlock) {
      symbol.children = symbol.children || [];
      stack.push({ depth: braceDepth + 1, node: symbol });
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    handler({
      line,
      trimmed,
      lineNumber: i,
      braceDepth,
      addSymbol,
      currentContext: () => (stack.length ? stack[stack.length - 1].node : undefined),
      contextStack: stack,
    });

    for (const char of line) {
      if (char === "{") {
        braceDepth++;
      } else if (char === "}") {
        braceDepth = Math.max(0, braceDepth - 1);
        closeBraceContexts(stack, braceDepth, i + 1);
      }
    }
  }

  finalizeBraceContexts(stack, lines.length);

  return stringifySymbols(symbols, emptyMessage);
}

function closeBraceContexts(stack: BraceContext[], braceDepth: number, lineNumber: number) {
  while (stack.length && stack[stack.length - 1].depth > braceDepth) {
    const ctx = stack.pop();
    if (ctx) {
      ctx.node.endLine = lineNumber;
    }
  }
}

function finalizeBraceContexts(stack: BraceContext[], totalLines: number) {
  while (stack.length) {
    const ctx = stack.pop();
    if (ctx) {
      ctx.node.endLine = totalLines;
    }
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findLineNumber(lines: string[], pattern: RegExp, fallback = 1): number {
  for (let i = 0; i < lines.length; i++) {
    if (pattern.test(lines[i])) {
      return i + 1;
    }
  }
  return fallback;
}

function describeJsonValue(value: any): string {
  if (Array.isArray(value)) {
    return `[ ... ${value.length} items ]`;
  }
  if (value && typeof value === "object") {
    const keys = Object.keys(value).length;
    return `{ ... ${keys} keys }`;
  }
  if (typeof value === "string") {
    return truncateValue(`"${value}"`);
  }
  return String(value);
}

function truncateValue(value: string, maxLength = 60): string {
  return value.length > maxLength ? `${value.slice(0, maxLength)}…` : value;
}

export function focusJson(content: string, target: string): string {
  let data: any;
  try {
    data = JSON.parse(content);
  } catch (error) {
    return `⚠️ Invalid JSON: ${(error as Error).message}`;
  }

  if (!target) {
    return "❌ Не указан ключ";
  }

  const segments = target
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .map((seg) => seg.trim())
    .filter(Boolean);

  let current = data;
  for (const segment of segments) {
    if (current === undefined || current === null) {
      return `❌ Не найден путь: ${target}`;
    }

    if (Array.isArray(current)) {
      const index = Number(segment);
      if (Number.isNaN(index) || index < 0 || index >= current.length) {
        return `❌ Индекс вне диапазона: ${segment}`;
      }
      current = current[index];
      continue;
    }

    current = current[segment];
  }

  if (current === undefined) {
    return `❌ Не найдено: ${target}`;
  }

  return JSON.stringify(current, null, 2);
}
