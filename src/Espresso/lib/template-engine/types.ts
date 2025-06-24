export interface Node {
	type: 'Text' | 'Variable' | 'If' | 'Each' | 'Partial';
}

export interface TextNode extends Node {
	type: 'Text';
	value: string;
}

export interface VariableNode extends Node {
	type: 'Variable';
	key: string;
	escape: boolean;
}

export interface IfNode extends Node {
	type: 'If';
	condition: string;
	children: Node[];
	elseChildren?: Node[];
}

export interface EachNode extends Node {
	type: 'Each';
	array: string;
	itemVar: string;
	children: Node[];
}

export interface PartialNode extends Node {
	type: 'Partial';
	name: string;
}

export interface Context {
	[key: string]: any;
}
