const THREE = require("three");
var OBJLoader = require("three-obj-loader");
OBJLoader(THREE);

// A class used to encapsulate the state of a turtle at a given moment.
// The Turtle class contains one TurtleState member variable.
// You are free to add features to this state class,
// such as color or whimiscality
var TurtleState = function(pos, head, up, left, width) {
  return {
    pos: new THREE.Vector3(pos.x, pos.y, pos.z),
    head: new THREE.Vector3(head.x, head.y, head.z),
    up: new THREE.Vector3(up.x, up.y, up.z),
    left: new THREE.Vector3(left.x, left.y, left.z),
    width: width
  };
};

// FIXME: we should use a factory or asset store here
let maki_pink = null;
let maki_red = null;
let maki_white = null;
let leaf = null;
let petal_pink = null;

function loadModel(modelPath, materialCb, manager) {
  return new Promise((resolve, reject) => {
    new THREE.OBJLoader(manager).load(modelPath, obj => {
      materialCb(obj);
      resolve(obj);
    });
  });
}

class modelFactory {

  constructor() {
    this.manager = new THREE.LoadingManager();
  }
  
  async loadObj (model, path, color) {
    if (model) {
      return;
    }
    this.manager.onStart = (url, itemsLoaded, itemsTotal) => {
      console.log(
        "Started loading file: " +
          url +
          ".\nLoaded " +
          itemsLoaded +
          " of " +
          itemsTotal +
          " files."
      );
    };

    this.manager.onLoad = () => {
      console.log("Loading complete!");
    };

    this.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      console.log(
        "Loading file: " +
          url +
          ".\nLoaded " +
          itemsLoaded +
          " of " +
          itemsTotal +
          " files."
      );
    };

    this.manager.onError = url => {
      console.log("There was an error loading " + url);
    };

    maki_pink = await loadModel(
      path,
      obj => {
        obj.traverse(child => {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshLambertMaterial({
              color: color,
              transparent: true,
              shading: THREE.FlatShading,
              side: THREE.DoubleSide
            });
          }
        });
      },
      this.manager
    );
  }
};


export async function loadObj() {
  if (maki_red || maki_white || leaf || petal_pink) {
    return;
  }

  var manager = new THREE.LoadingManager();
  manager.onStart = (url, itemsLoaded, itemsTotal) => {
    console.log(
      "Started loading file: " +
        url +
        ".\nLoaded " +
        itemsLoaded +
        " of " +
        itemsTotal +
        " files."
    );
  };

  manager.onLoad = () => {
    console.log("Loading complete!");
  };

  manager.onProgress = (url, itemsLoaded, itemsTotal) => {
    console.log(
      "Loading file: " +
        url +
        ".\nLoaded " +
        itemsLoaded +
        " of " +
        itemsTotal +
        " files."
    );
  };

  manager.onError = url => {
    console.log("There was an error loading " + url);
  };
  
  // pink maki
  maki_pink = await loadModel(
    "/src/assets/maki.obj",
    obj => {
      obj.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshLambertMaterial({
            color: 0xeaa7d7,
            transparent: true,
            shading: THREE.FlatShading,
            side: THREE.DoubleSide
          });
        }
      });
    },
    manager
  );
  
  // red maki
  maki_red = await loadModel(
    "/src/assets/maki.obj",
    obj => {
      obj.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshLambertMaterial({
            color: 0xd4636f,
            transparent: true,
            shading: THREE.FlatShading,
            side: THREE.DoubleSide
          });
        }
      });
    },
    manager
  );

  // white maki
  maki_white = await loadModel(
    "/src/assets/maki.obj",
    obj => {
      obj.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshLambertMaterial({
            color: 0xfaf0e6,
            transparent: true,
            shading: THREE.FlatShading,
            side: THREE.DoubleSide
          });
        }
      });
    },
    manager
  );

  // leaf
  leaf = await loadModel(
    "/src/assets/leaf.obj",
    obj => {
      obj.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshLambertMaterial({
            color: 0x559f77,
            transparent: true,
            shading: THREE.FlatShading,
            side: THREE.DoubleSide
          });
        }
      });
    },
    manager
  );

  // pink patal
  petal_pink = await loadModel(
    "/src/assets/petal.obj",
    obj => {
      obj.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshLambertMaterial({
            color: 0xeaa7d7,
            transparent: true,
            shading: THREE.FlatShading,
            side: THREE.DoubleSide
          });
        }
      });
    },
    manager
  );
  petal_pink.scale.set(0.015, 0.015, 0.015);
}

export default class Turtle {
  constructor(scene, iter, grammar) {
    this.state = new TurtleState(
      new THREE.Vector3(0, 4, 0),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 0, 1),
      0.1
    );
    this.scene = scene;
    this.records = [];

    this.maki_pink = maki_pink;
    this.maki_red = maki_red;
    this.maki_white = maki_white;
    this.leaf = leaf;
    this.length = 3 / (parseInt(iter + 0.5, 10) + 1) + (iter + 0.5 - parseInt(iter + 0.5, 10)) * 0.2;
    console.log(iter);
    console.log(this.length);
    //this.length = iter / 50 + 0.5;

    this.modelFactory = new modelFactory();

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
        A: this.makeRoot.bind(this),
        L: this.makeFlower.bind(this),
        "[": this.storePos.bind(this),
        "]": this.restorePos.bind(this),
        "!": this.decreaseWidth.bind(this)
      };
    } else {
      this.renderGrammar = grammar;
    }
  }

  // Resets the turtle's position to the origin
  // and its orientation to the Y axis
  clear() {
    this.state = new TurtleState(
      new THREE.Vector3(0, 4, 0),
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
    var rand = (Math.random() - 0.5) * 10;
    var radius = ((angle + rand) * 3.14) / 180;
    var axis = this.state.left;
    this.state.head.applyAxisAngle(axis, radius);
    this.state.up.applyAxisAngle(axis, radius);
  }

  rotateByUp(angle) {
    var rand = (Math.random() - 0.5) * 10;
    var radius = ((angle + rand) * 3.14) / 180;
    var axis = this.state.up;
    this.state.head.applyAxisAngle(axis, radius);
    this.state.left.applyAxisAngle(axis, radius);
  }

  rotateByHead(angle) {
    var rand = (Math.random() - 0.5) * 10;
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
  }

  // Make a cylinder of given length and width starting at turtle pos
  // Moves turtle pos ahead to end of the new cylinder
  makeCylinder(len, width) {
    len = this.length;
    var width1 = this.state.width;
    var width2 = this.state.width;
    var geometry = new THREE.CylinderGeometry(width2, width1, len);
    //var material = new THREE.MeshBasicMaterial({ color: 0x6c4327 });
    var material = new THREE.MeshPhongMaterial({
      color: 0x6c4327,
      shading: THREE.FlatShading
    });
    var cylinder = new THREE.Mesh(geometry, material);
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;
    this.scene.add(cylinder);

    //Orient the cylinder to the turtle's current direction
    var quat = new THREE.Quaternion();
    quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), this.state.head);
    var mat4 = new THREE.Matrix4();
    mat4.makeRotationFromQuaternion(quat);
    cylinder.applyMatrix(mat4);

    //Move the cylinder so its base rests at the turtle's current position
    var mat5 = new THREE.Matrix4();

    var trans = this.state.pos
      .clone()
      .add(this.state.head.clone().multiplyScalar(0.5 * len));
    mat5.makeTranslation(trans.x, trans.y, trans.z);
    cylinder.applyMatrix(mat5);

    //Scoot the turtle forward by len units
    this.moveForward(len);
  }

  makeRoot() {
    var geometry = new THREE.CylinderGeometry(0.15, 0.25, 4);
    var material = new THREE.MeshPhongMaterial({
      color: 0x6c4327,
      shading: THREE.FlatShading
    });
    var cylinder = new THREE.Mesh(geometry, material);
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;
    this.scene.add(cylinder);

    var mat5 = new THREE.Matrix4();
    mat5.makeTranslation(0, 2, 0);
    cylinder.applyMatrix(mat5);
  }

  async makeFlower() {
    let makiMesh;
    let rand = Math.random();
    if (rand < 0.3) {
      if (!maki_pink) {
        await this.modelFactory.loadObj(maki_pink, "/src/assets/maki.obj", 0xeaa7d7);
      }
      makiMesh = this.maki_pink.clone();
    } else if (rand < 0.6) {
      makiMesh = this.maki_red.clone();
    } else if (rand < 0.8) {
      makiMesh = this.maki_white.clone();
    } else {
      makiMesh = this.leaf.clone();
    }

    rand = Math.random();
    rand = 0.006 + rand / 200;

    //Orient the cylinder to the turtle's current direction
    var quat = new THREE.Quaternion();
    quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), this.state.head);
    var mat4 = new THREE.Matrix4();
    mat4.set(
      this.state.up.x,
      this.state.head.x,
      this.state.up.x,
      this.state.pos.x + this.state.up.x * this.state.width,
      this.state.up.y,
      this.state.head.y,
      this.state.up.y,
      this.state.pos.y + this.state.up.y * this.state.width,
      this.state.up.z,
      this.state.head.z,
      this.state.up.z,
      this.state.pos.z + this.state.up.z * this.state.width,
      0,
      0,
      0,
      1
    );
    makiMesh.applyMatrix(mat4);
    makiMesh.scale.set(rand, rand, rand);

    this.scene.add(makiMesh);
  }

  decreaseWidth() {
    this.state.width *= 0.6;
  }

  storePos() {
    this.records.push(this.state.pos.clone());
    this.records.push(this.state.head.clone());
    this.records.push(this.state.up.clone());
    this.records.push(this.state.left.clone());
    this.records.push(this.state.width);
  }

  restorePos() {
    this.state.width = this.records.pop();
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
      func();
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

  creatPetals() {
    let n = 0;
    for (let i = -3; i <= 3; i += 1.5) {
      for (let j = -3; j <= 3; j += 1.5) {
        let petal = petal_pink.clone();
        petal.name = 'p' + n++;
        petal.position.set(i, Math.random() * 8, j);
        petal.rotation.set(Math.random() * 2 - 1, 0, Math.random() * 2 - 1);
        this.scene.add(petal);
      }
    }
  }

  createGround() {
    var geometry = new THREE.PlaneGeometry( 20, 20);
    var material = new THREE.MeshBasicMaterial( {color: 0xe7e7be, side: THREE.DoubleSide} );
    var plane = new THREE.Mesh( geometry, material );
    plane.position.set(0, 0, 0);
    var quat = new THREE.Quaternion();
    quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1));
    var mat4 = new THREE.Matrix4();
    mat4.makeRotationFromQuaternion(quat);
    plane.applyMatrix(mat4);
    this.scene.add( plane );
  }
}
