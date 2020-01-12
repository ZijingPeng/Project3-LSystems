import * as THREE from "three";
import Framework from "./framework";
import Lsystem, { LinkedListToString } from "./lsystem.js";
import Turtle from "./turtle.js";
import ModelFactory from "./ModelFactory";

let turtle;
var time;

// called after the scene loads
async function onLoad(framework) {
  var scene = framework.scene;
  var camera = framework.camera;
  var renderer = framework.renderer;
  var gui = framework.gui;
  var stats = framework.stats;
  time = 0;

  var ambientLight, hemisphereLight, shadowLight;

  hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 0.3);

  ambientLight = new THREE.AmbientLight(0xf0f0ff, 1);

  shadowLight = new THREE.DirectionalLight(0xffffff, 0.2);
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
  camera.position.set(8, 10, 0);
  camera.lookAt(new THREE.Vector3(0, 6.5, 0));

  // initialize LSystem and a Turtle to draw
  var lsys = new Lsystem();
  turtle = new Turtle(scene);
  await ModelFactory.loadAllModel();

  gui.add(camera, "fov", 0, 180).onChange(function(newVal) {
    camera.updateProjectionMatrix();
  });

  var params = {
    reload : function() { 
      time = 0;
    }
  };
  gui.add(params, 'reload').name('Play Again');

/*
  gui.add(lsys, "axiom").onChange(function(newVal) {
    lsys.UpdateAxiom(newVal);
    doLsystem(lsys, lsys.iterations, turtle);
  });

  
  gui
    .add(lsys, "iterations", 0, 7)
    .step(1)
    .onChange(function(newVal) {
      clearScene(turtle);
      doLsystem(lsys, newVal, turtle);
    });
    */
}

// clears the scene by removing all geometries added by turtle.js
function clearScene(turtle) {
  var obj;
  for (var i = turtle.scene.children.length - 1; i > 2; i--) {
    obj = turtle.scene.children[i];
    turtle.scene.remove(obj);
  }
}

function doLsystem(lsystem, iterations, turtle) {
  var result = lsystem.doIterations(iterations);
  turtle.clear();
  turtle = new Turtle(turtle.scene, iterations);
  turtle.renderSymbols(result);
  turtle.createGround();
}

// called on frame updates
async function onUpdate(framework) {
  if (time % 5 == 0) {

    if (time % 300 == 0 && time <= 3299 && time > 1 ) {
      var lsys = new Lsystem();
      turtle = new Turtle(framework.scene);
      clearScene(turtle);
      doLsystem(lsys, ((time / 300) % 11) / 2, turtle);
      if ((time / 300) % 11 == 10) {
        turtle.createPetals();
      }
    }
    
    for (var i = 0; i < 25; i++) {
      var petal = framework.scene.getObjectByName("p"+ i);
      if (petal) {
        if (petal.position.y-0.1 < 0) {
          petal.position.set(petal.position.x, petal.position.y-0.2 + 8, petal.position.z);
        }
        else {
          petal.position.set(petal.position.x, petal.position.y-0.2, petal.position.z);
        }

      }
    }
    //console.log(petal);
  }
  time++;
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
