import {
	EachNode,
	IfNode,
	Node,
	PartialNode,
	TextNode,
	VariableNode,
} from './types';

export class TemplateParser {
	private pos: number = 0;
	private partials: Map<string, Node[]> = new Map();

	constructor(private input: string) {}

	parse(): Node[] {
		const nodes: Node[] = [];

		while (this.pos < this.input.length) {
			// Parse nodes
			const node = this.parseNode();
			if (node) {
				nodes.push(node);
			}
		}

		return nodes;
	}

	registerPartial(name: string, template: string) {
		const parser = new TemplateParser(template);
		this.partials.set(name, parser.parse());
	}

	getPartials() {
		return this.partials;
	}

	// Private methods
	private parseNode(): Node | null {
		if (this.peek(2) === '{{') {
			return this.parseTag();
		}
		return this.parseText();
	}

	private peek(n: number): string {
		return this.input.slice(this.pos, this.pos + n);
	}

	private parseText(): TextNode | null {
		let text = '';
		while (this.pos < this.input.length && this.peek(2) !== '{{') {
			text += this.input[this.pos++];
		}

		return text ? { type: 'Text', value: text } : null;
	}

	private parseTag(): Node | null {
		if (this.peek(2) !== '{{') return null;
		this.pos += 2;

		// Handle escaped unescaped
		const isUnescaped = this.peek(1) === '{';
		if (isUnescaped) this.pos++;

		// Read content between tags
		const content = this.readUntil('}}').trim();
		if (isUnescaped && this.peek(1) === '}') this.pos++;

		// Handle tag contents
		if (content.startsWith('#if')) {
			return this.parseIf(content.slice(3).trim());
		}
		if (content === '/if') return null;

		if (content.startsWith('#each')) {
			return this.parseEach(content.slice(5).trim());
		}
		if (content === '/each') return null;

		if (content.startsWith('>')) {
			return {
				type: 'Partial',
				name: content.slice(1).trim(),
			} as PartialNode;
		}

		if (content === 'else') return null;

		return {
			type: 'Variable',
			key: content,
			escape: !isUnescaped,
		} as VariableNode;
	}

	private readUntil(end: string) {
		let result = '';
		while (this.pos < this.input.length && this.peek(end.length) !== end) {
			result += this.input[this.pos++];
		}
		this.pos += end.length;
		return result;
	}

	private parseIf(condition: string): IfNode {
		const ifNode: IfNode = {
			type: 'If',
			condition,
			children: [],
			elseChildren: [],
		};
		const currentChildren = ifNode.children;
		let depth = 0;

		while (this.pos < this.input.length) {
			if (this.peek(2) === '{{') {
				const savedPos = this.pos;
				this.pos += 2;

				const isUnescaped = this.peek(1) === '{';
				if (isUnescaped) this.pos++;

				const content = this.readUntil('}}').trim();
				if (isUnescaped && this.peek(1) === '}') this.pos++;

				if (content === 'else' && depth === 0) {
					break;
				}

				if (content.startsWith('#if')) {
					depth++;
				}

				this.pos = savedPos;
			}

			const node = this.parseNode();
			if (node) currentChildren.push(node);
		}

		return ifNode;
	}

	private parseEach(input: string): EachNode {
		const parts = input.split(' as ');
		const array = parts[0].trim();
		const itemVar = parts[1]?.trim() || 'item';
		const eachNode: EachNode = {
			type: 'Each',
			array,
			itemVar,
			children: [],
		};
		let depth = 0;

		while (this.pos < this.input.length) {
			if (this.peek(2) === '{{') {
				const savedPos = this.pos;
				this.pos += 2;

				const isUnescaped = this.peek(1) === '{';
				if (isUnescaped) this.pos++;

				const content = this.readUntil('}}').trim();
				if (isUnescaped && this.peek(1) === '}') this.pos++;

				if (content === '/each' && depth === 0) {
					break;
				}

				if (content.startsWith('#each')) {
					depth++;
				}

				this.pos = savedPos;
			}

			const node = this.parseNode();
			if (node) eachNode.children.push(node);
		}

		return eachNode;
	}
}
