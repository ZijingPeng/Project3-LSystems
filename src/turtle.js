const THREE = require("three");

// A class used to encapsulate the state of a turtle at a given moment.
// The Turtle class contains one TurtleState member variable.
// You are free to add features to this state class,
// such as color or whimiscality
var TurtleState = function(pos, head, up, left, layer) {
  return {
    pos: new THREE.Vector3(pos.x, pos.y, pos.z),
    head: new THREE.Vector3(head.x, head.y, head.z),
    up: new THREE.Vector3(up.x, up.y, up.z),
    left: new THREE.Vector3(left.x, left.y, left.z),
    layer: layer
  };
};

export default class Turtle {
  constructor(scene, grammar) {
    this.state = new TurtleState(
      new THREE.Vector3(0, -2, 0),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 0, 1),
      0
    );
    this.scene = scene;
    this.records = [];

    // TODO: Start by adding rules for '[' and ']' then more!
    // Make sure to implement the functions for the new rules inside Turtle
    if (typeof grammar === "undefined") {
      this.renderGrammar = {
        "+": this.rotateByUp.bind(this, 22.5),
        "-": this.rotateByUp.bind(this, -22.5),
        "&": this.rotateByLeft.bind(this, 22.5),
        "^": this.rotateByLeft.bind(this, -22.5),
        "\\": this.rotateByHead.bind(this, 22.5),
        "/": this.rotateByHead.bind(this, -22.5),
        "|": this.rotateByUp.bind(this, 180),
        F: this.makeCylinder.bind(this, 2.5, 0.1),
        "[": this.storePos.bind(this),
        "]": this.restorePos.bind(this)
      };
    } else {
      this.renderGrammar = grammar;
    }
  }

  // Resets the turtle's position to the origin
  // and its orientation to the Y axis
  clear() {
    this.state = new TurtleState(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 0, 1)
    );
  }

  // A function to help you debug your turtle functions
  // by printing out the turtle's current state.
  printState() {
    console.log(this.state.pos);
    //console.log(this.state.dir);
  }

  // Rotate the turtle's _dir_ vector by each of the
  // Euler angles indicated by the input.
  rotateTurtle(x, y, z) {
    var e = new THREE.Euler(
      (x * 3.14) / 180,
      (y * 3.14) / 180,
      (z * 3.14) / 180
    );
    this.state.head.applyEuler(e);
    this.state.up.applyEuler(e);
    this.state.left.applyEuler(e);
  }

  rotateByLeft(angle) {
    var rand = (Math.random() - 0.5) * 8;
    var radius = ((angle + rand) * 3.14) / 180;
    var axis = this.state.left;
    this.state.head.applyAxisAngle(axis, radius);
    this.state.up.applyAxisAngle(axis, radius);
  }

  rotateByUp(angle) {
    var rand = (Math.random() - 0.5) * 8;
    var radius = ((angle + rand) * 3.14) / 180;
    var axis = this.state.up;
    this.state.head.applyAxisAngle(axis, radius);
    this.state.left.applyAxisAngle(axis, radius);
  }

  rotateByHead(angle) {
    var rand = (Math.random() - 0.5) * 8;
    var radius = ((angle + rand) * 3.14) / 180;
    var axis = this.state.head;
    this.state.left.applyAxisAngle(axis, radius);
    this.state.up.applyAxisAngle(axis, radius);
  }

  // Translate the turtle along the input vector.
  // Does NOT change the turtle's _dir_ vector
  moveTurtle(x, y, z) {
    var new_vec = THREE.Vector3(x, y, z);
    this.state.pos.add(new_vec);
  }

  // Translate the turtle along its _dir_ vector by the distance indicated
  moveForward(dist) {
    //this.state.head.normalize();
    var newVec = this.state.head.clone().multiplyScalar(dist);
    this.state.pos.add(newVec);
    this.state.layer++;
  }

  // Make a cylinder of given length and width starting at turtle pos
  // Moves turtle pos ahead to end of the new cylinder
  makeCylinder(len, width) {
    len =  2 * (1 - this.state.layer / 10);
    var width1 = 0.4 / (this.state.layer * 4 + 4);
    var width2 = 0.4 / (this.state.layer * 4 + 6);
    var geometry = new THREE.CylinderGeometry(width2, width1, len);
    var material = new THREE.MeshBasicMaterial({ color: 0x6c4327 });
    var cylinder = new THREE.Mesh(geometry, material);
    this.scene.add(cylinder);
    
    //Orient the cylinder to the turtle's current direction
    var quat = new THREE.Quaternion();
    quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), this.state.head);
    var mat4 = new THREE.Matrix4();
    mat4.makeRotationFromQuaternion(quat);
    cylinder.applyMatrix(mat4);

    //Move the cylinder so its base rests at the turtle's current position
    var mat5 = new THREE.Matrix4();
    
    var trans = this.state.pos.clone().add(this.state.head.clone().multiplyScalar(0.5 * len));
    mat5.makeTranslation(trans.x, trans.y, trans.z);
    cylinder.applyMatrix(mat5);

    //Scoot the turtle forward by len units
    this.moveForward(len);
  }

  storePos() {
    this.records.push(this.state.pos.clone());
    this.records.push(this.state.head.clone());
    this.records.push(this.state.up.clone());
    this.records.push(this.state.left.clone());
    this.records.push(this.state.layer);
  }

  restorePos() {
    this.state.layer = this.records.pop();
    this.state.left = this.records.pop();
    this.state.up = this.records.pop();
    this.state.head = this.records.pop();
    this.state.pos = this.records.pop();
  }

  // Call the function to which the input symbol is bound.
  // Look in the Turtle's constructor for examples of how to bind
  // functions to grammar symbols.
  renderSymbol(symbolNode) {
    var func = this.renderGrammar[symbolNode.symbol];
    if (func) {
        //console.log(symbolNode.symbol); 
      func();
      //console.log(this.state.head);
    }
  }

  // Invoke renderSymbol for every node in a linked list of grammar symbols.
  renderSymbols(linkedList) {
    var currentNode;
    for (
      currentNode = linkedList.head;
      currentNode != null;
      currentNode = currentNode.next
    ) {
      this.renderSymbol(currentNode);
    }
  }
}
