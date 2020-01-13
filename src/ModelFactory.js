import * as THREE from "three";

function createLoadingManager() {
  let manager = new THREE.LoadingManager();

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

  return manager;
}

function loadModelAsync(modelPath, materialCb, manager) {
  return new Promise((resolve, reject) => {
    new THREE.OBJLoader(manager).load(modelPath, obj => {
      materialCb(obj);
      resolve(obj);
    });
  });
}

class ModelFactory {
  constructor() {
    this.manager = createLoadingManager();
    this.store = {};
  }

  async loadModel(modelName, path, color) {
    if (this.store[modelName]) {
      return this.store[modelName];
    }
    let model = await loadModelAsync(
      path,
      obj => {
        obj.traverse(child => {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshLambertMaterial({
              color,
              transparent: true,
              shading: THREE.FlatShading,
              side: THREE.DoubleSide
            });
          }
        });
      },
      this.manager
    );
    this.store[modelName] = model;
    return model;
  }

  getModel(key) {
    // FIXME: maybe store doesn't contains key
    return this.store[key];
  }

  async loadAllModel() {
    const makiPath = "assets/lsystem/maki.obj";
    const leafPath = "assets/lsystem/leaf.obj";
    const petalPath = "assets/lsystem/petal.obj";

    // FIXME: use constants to replace magic strings
    const models = {
      "maki/red": [makiPath, 0xd4636f],
      "maki/white": [makiPath, 0xfaf0e6],
      "maki/pink": [makiPath, 0xeaa7d7],
      leaf: [leafPath, 0x559f77],
      petal: [petalPath, 0xeaa7d7]
    };

    for (const key of Object.keys(models)) {
      const val = models[key];
      let model = await this.loadModel(key, val[0], val[1]);
      // FIXME: petal hack. avoid it.
      if (key === "petal") {
        model.scale.set(0.015, 0.015, 0.015);
      }
    }
  }
}

export default new ModelFactory();
