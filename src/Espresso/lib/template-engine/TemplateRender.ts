import { Writable } from 'node:stream';
import {
	Context,
	EachNode,
	IfNode,
	Node,
	PartialNode,
	TextNode,
	VariableNode,
} from './types';

export class TemplateRender {
	constructor(private partials: Map<string, Node[]> = new Map()) {}

	render(nodes: Node[], context: Context, stream: Writable) {
		for (const node of nodes) {
			this.renderNode(node, context, stream);
		}
	}

	private renderNode(node: Node, context: Context, stream: Writable) {
		switch (node.type) {
			case 'Text':
				stream.write((node as TextNode).value);
				break;
			case 'Variable':
				const variableNode = node as VariableNode;
				const value = this.getValue(context, variableNode.key);
				stream.write(
					variableNode.escape ? this.escapeHTML(value) : String(value)
				);
				break;
			case 'If':
				const ifNode = node as IfNode;
				const conditionValue = this.getValue(context, ifNode.condition);
				if (conditionValue) {
					this.render(ifNode.children, context, stream);
				} else if (ifNode.elseChildren?.length) {
					this.render(ifNode.elseChildren, context, stream);
				}
				break;
			case 'Each':
				const eachNode = node as EachNode;
				const arrayValue = this.getValue(context, eachNode.array) as any[];
				if (Array.isArray(arrayValue)) {
					for (const item of arrayValue) {
						const newContext = { ...context, [eachNode.itemVar]: item };
						this.render(eachNode.children, newContext, stream);
					}
				}
				break;
			case 'Partial':
				const partialNode = node as PartialNode;
				const partialTemplate = this.partials.get(partialNode.name);
				if (partialTemplate) {
					this.render(partialTemplate, context, stream);
				}
				break;
			default:
				throw new Error(`Unknown node type: ${node.type}`);
		}
	}

	private getValue(context: Context, key: string) {
		const keys = key.split('.');
		let value: any = context;

		for (const k of keys) {
			if (k === 'this') continue;
			value = value ? value[k] : undefined;
		}

		return value;
	}

	private escapeHTML(value: string) {
		return String(value)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');
	}
}
