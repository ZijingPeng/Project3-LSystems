
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
import Lsystem, {LinkedListToString} from './lsystem.js'
import Turtle from './turtle.js'
import { Scene } from 'three';

var turtle;

// called after the scene loads
function onLoad(framework) {
  var scene = framework.scene;
  var camera = framework.camera;
  var renderer = framework.renderer;
  var gui = framework.gui;
  var stats = framework.stats;
  
  // initialize a simple box and material
  //var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  //directionalLight.color.setHSL(0.1, 1, 0.95);
  //directionalLight.position.set(5, 8, 0);
  //scene.add(directionalLight);

  //var ambientLight = new THREE.AmbientLight( 0xeeeeee ); // soft white light
  //scene.add( ambientLight );

  var ambientLight, hemisphereLight, shadowLight;

  hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .3);

  ambientLight = new THREE.AmbientLight(0xf0f0ff, 1);

  shadowLight = new THREE.DirectionalLight(0xffffff, .2);
  shadowLight.position.set(15, 35, 35);
  shadowLight.castShadow = true;
  shadowLight.shadow.camera.left = -400;
  shadowLight.shadow.camera.right = 400;
  shadowLight.shadow.camera.top = 400;
  shadowLight.shadow.camera.bottom = -400;
  shadowLight.shadow.camera.near = 1;
  shadowLight.shadow.camera.far = 1000;
  shadowLight.shadow.mapSize.width = 2048;
  shadowLight.shadow.mapSize.height = 2048;

  
  
  scene.add(shadowLight);
  scene.add(hemisphereLight);
  scene.add(ambientLight);
  //console.log(scene);

  // set camera position
  camera.position.set(16, 0, 0);
  camera.lookAt(new THREE.Vector3(0,0,0));

  // initialize LSystem and a Turtle to draw
  var lsys = new Lsystem();
  turtle = new Turtle(scene);
  
  turtle.loadObj(lsys, 5, turtle);

  gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
    camera.updateProjectionMatrix();
  });

  gui.add(lsys, 'axiom').onChange(function(newVal) {
    lsys.UpdateAxiom(newVal);
    doLsystem(lsys, lsys.iterations, turtle);
  });

  gui.add(lsys, 'iterations', 0, 10).step(1).onChange(function(newVal) {
    //console.log(newVal);
    clearScene(turtle);
    doLsystem(lsys, newVal, turtle);
  });
}

// clears the scene by removing all geometries added by turtle.js
function clearScene(turtle) {
  var obj;
  for( var i = turtle.scene.children.length - 1; i > 2; i--) {
      obj = turtle.scene.children[i];
      turtle.scene.remove(obj);
  }
}

function doLsystem(lsystem, iterations, turtle) {
    var result = lsystem.doIterations(iterations);
    turtle.clear();
    turtle = new Turtle(turtle.scene);
    turtle.renderSymbols(result);
}

// called on frame updates
function onUpdate(framework) {
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
