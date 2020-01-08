// A class that represents a symbol replacement rule to
// be used when expanding an L-system grammar.
function Rule(prob, str) {
	this.probability = prob; // The probability that this Rule will be used when replacing a character in the grammar string
	this.successorString = str; // The string that will replace the char that maps to this Rule
}

// TODO: Implement a linked list class and its requisite functions
// as described in the homework writeup
class LinkedList {
	constructor() {
		this.head = null;
		this.tail = null;
	}
}

class Node {
	constructor(symbol) {
		this.next = null;
		this.prev = null;
		this.symbol = symbol;
	}
}

var linkNodes = function(node1, node2) {
	if (node1) {
		node1.next = node2;
	}
	if (node2) {
		node2.prev = node1;
	}
}

var chooseRule = function(node, ruleList) {
	var symbol = node.symbol;
	var rules = ruleList[symbol];
	if (!rules) {
		return null;
	}
	var rand = Math.random();
	var sum = 0;
	for (var i = 0; i < rules.length; i++) {
		if (rand <= sum + rules[i].probability) {
			return rules[i].successorString;
		}
		sum += rules[i].probability;
	}
	return null;
}

// TODO: Turn the string into linked list 
export function stringToLinkedList(input_string) {

	// ex. assuming input_string = "F+X"
	// you should return a linked list where the head is 
	// at Node('F') and the tail is at Node('X')
	var ll = new LinkedList();
	if (!input_string) {
		return ll;
	}
	ll.head = new Node(input_string.charAt(0));
	var p = ll.head;
	for (var i = 1; i < input_string.length; i++) {
		var next = new Node(input_string.charAt(i));
		linkNodes(p, next);
		p = next;
	}
	ll.tail = p;
	return ll;
}

// TODO: Return a string form of the LinkedList
export function linkedListToString(linkedList) {
	// ex. Node1("F")->Node2("X") should be "FX"
	var result = "";
	var p = linkNodes.head;
	while (p) {
		result += p.symbol;
		p = p.next;
	}
	return result;
}

// TODO: Given the node to be replaced, 
// insert a sub-linked-list that represents replacementString
function replaceNode(linkedList, node, replacementString) {
	var prev = node.prev;
	var next = node.next;
	var ll = stringToLinkedList(replacementString);
	linkNodes(prev, ll.head);
	linkNodes(ll.tail, next);
	node = ll.tail;
}

export default function Lsystem(axiom, grammar, iterations) {
	// default LSystem
	this.axiom = "FX";
	this.grammar = {};
	this.grammar['X'] = [
		//new Rule(1.0, '[-FX][+FX]')
		//new Rule(1.0, '[+FX][-FX[-FX]FX]FX[+FX][-FX]')
		//new Rule(1.0, '[&FL!X]/////’[&FL!X]///////’[&FL!X]')
		new Rule(1.0, '[&FX]/////[&FX]///////[&FX]')
	];
	this.iterations = 1; 
	
	// Set up the axiom string
	if (typeof axiom !== "undefined") {
		this.axiom = axiom;
	}

	// Set up the grammar as a dictionary that 
	// maps a single character (symbol) to a Rule.
	if (typeof grammar !== "undefined") {
		this.grammar = Object.assign({}, grammar);
	}
	
	// Set up iterations (the number of times you 
	// should expand the axiom in DoIterations)
	if (typeof iterations !== "undefined") {
		this.iterations = iterations;
	}

	// A function to alter the axiom string stored 
	// in the L-system
	this.updateAxiom = function(axiom) {
		// Setup axiom
		if (typeof axiom !== "undefined") {
			this.axiom = axiom;
		}
	}

	// TODO
	// This function returns a linked list that is the result 
	// of expanding the L-system's axiom n times.
	// The implementation we have provided you just returns a linked
	// list of the axiom.
	this.doIterations = function(n) {	
		var lSystemLL = stringToLinkedList(this.axiom);
		for (var i = 0; i < n; i++) {
			var head = lSystemLL.head;
			var node = head;
			while (node) {
				var rule = chooseRule(node, this.grammar);
				if (rule) {
					replaceNode(lSystemLL, node, rule);
				}
				node = node.next;
			}
		}
		//console.log(lSystemLL);
		return lSystemLL;
	}
}