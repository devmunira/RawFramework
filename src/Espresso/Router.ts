import { Handler, HTTPMethods } from "./types";

export class TrieNode {
  path: string = "";
  isEnd: boolean = false;
  HTTPMethods: HTTPMethods = "GET";
  children: Map<string, TrieNode> = new Map();
  handlers: Map<HTTPMethods, Handler> = new Map();
}

type MatchResult = {
  handler: Handler;
  params: Record<string, string>;
  originalPath: string;
};

export class Router {
  private root: TrieNode = new TrieNode();

  add(HTTPMethods: HTTPMethods, path: string, handler: Handler): void {
    const segments = path.split("/").filter(Boolean);

    let node = this.root;
    for (const segment of segments) {
      if (!node.children.has(segment)) {
        const newNode = new TrieNode();
        newNode.path = segment;
        node.children.set(segment, newNode);
      }

      node = node.children.get(segment)!;
    }

    node.isEnd = true;
    node.HTTPMethods = HTTPMethods;
    node.handlers.set(HTTPMethods, handler);
  }

  match(HTTPMethods: HTTPMethods, path: string): MatchResult | null {
    const segments = path.split("/").filter(Boolean);

    let node: TrieNode | null = this.root;
    const params: Record<string, string> = {};
    let i = 0;
    let originalPath = "";

    while (i < segments.length && node) {
      const segment = segments[i];

      // Try exact match
      if (node.children.has(segment)) {
        node = node.children.get(segment)!;
        originalPath += `/${node.path}`;
        i++;
        continue;
      }

      // Try dynamic match
      let matched = false;
      for (const [childPath, childNode] of node.children) {
        if (childPath.startsWith(":")) {
          params[childPath.slice(1)] = segment;
          node = childNode;
          originalPath += `/${node?.path}`;
          i++;
          matched = true;
          break;
        }
      }

      if (!matched) {
        node = null;
        break;
      }
    }

    if (node && node.isEnd && node.handlers.has(HTTPMethods)) {
      const handler = node.handlers.get(HTTPMethods)!;
      return {
        handler,
        params,
        originalPath,
      };
    }

    return null;
  }

  toString(): string {
    const routes: string[] = [];

    const traverse = (node: TrieNode, path: string = "") => {
      if (node.isEnd) {
        for (const [HTTPMethods, handler] of node.handlers) {
          routes.push(`${HTTPMethods.padEnd(6)} ${path} -> ${handler.name}`);
        }
      }

      for (const [segment, childNode] of node.children) {
        traverse(childNode, `${path}/${segment}`);
      }
    };

    traverse(this.root);
    return routes.length ? routes.join("\n") : "No routes found";
  }
}
