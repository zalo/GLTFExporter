
import * as THREE from 'three';

import { GLTFExporter } from '../node_modules/three/examples/jsm/exporters/GLTFExporter.js';
import { GUI          } from '../node_modules/three/examples/jsm/libs/lil-gui.module.min.js';

import { FBXLoader    } from '../node_modules/three/examples/jsm/loaders/FBXLoader.js';
import { OBJLoader    } from '../node_modules/three/examples/jsm/loaders/OBJLoader.js';

function exportGLTF( input ) {
  const gltfExporter = new GLTFExporter();

  const options = {
    trs: params.trs,
    onlyVisible: params.onlyVisible,
    truncateDrawRange: params.truncateDrawRange,
    binary: params.binary,
    maxTextureSize: params.maxTextureSize };
  gltfExporter.parse(
    input,
    function ( result ) {
      if ( result instanceof ArrayBuffer ) {
        saveArrayBuffer( result, 'scene.glb' );
      } else {
        const output = JSON.stringify( result, null, 2 );
        console.log( output );
        saveString( output, 'scene.gltf' );
      }
    },
    function ( error ) {
      console.log( 'An error happened during parsing', error );
    },
    options
  );
}

const link = document.createElement( 'a' );
link.style.display = 'none';
document.body.appendChild( link ); // Firefox workaround, see #6594

function save( blob, filename ) {
  link.href = URL.createObjectURL( blob );
  link.download = filename;
  link.click();

  // URL.revokeObjectURL( url ); breaks Firefox...
}

function saveString( text, filename ) {
  save( new Blob( [ text ], { type: 'text/plain' } ), filename );
}


function saveArrayBuffer( buffer, filename ) {
  save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );
}

let container;

let camera, scene1, renderer, gridHelper, file = {}, mainModel, mainMaterial = new THREE.MeshPhysicalMaterial();

const params = {
  trs: true,
  onlyVisible: true,
  truncateDrawRange: true,
  binary: false,
  maxTextureSize: 4096,
  loadModel: loadModel, 
  loadTexture: loadTexture, 
  exportSceneObject: exportSceneObject
};

init();
animate();

function init() {
  container = document.createElement( 'div' );
  document.body.appendChild( container );

  // Make linear gradient texture

  const data = new Uint8ClampedArray( 100 * 100 * 4 );

  for ( let y = 0; y < 100; y ++ ) {
    for ( let x = 0; x < 100; x ++ ) {
      const stride = 4 * ( 100 * y + x );

      data[ stride ] = Math.round( 255 * y / 99 );
      data[ stride + 1 ] = Math.round( 255 - 255 * y / 99 );
      data[ stride + 2 ] = 0;
      data[ stride + 3 ] = 255;
    }
  }

  const gradientTexture = new THREE.DataTexture( data, 100, 100, THREE.RGBAFormat );
  gradientTexture.minFilter = THREE.LinearFilter;
  gradientTexture.magFilter = THREE.LinearFilter;
  gradientTexture.needsUpdate = true;

  scene1 = new THREE.Scene();
  scene1.name = 'Scene1';

  // ---------------------------------------------------------------------
  // Perspective Camera
  // ---------------------------------------------------------------------
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
  camera.position.set( 60, 40, 0 );

  camera.name = 'PerspectiveCamera';
  scene1.add( camera );

  // ---------------------------------------------------------------------
  // Ambient light
  // ---------------------------------------------------------------------
  const ambientLight = new THREE.AmbientLight( 0xffffff, 0.2 );
  ambientLight.name = 'AmbientLight';
  scene1.add( ambientLight );

  // ---------------------------------------------------------------------
  // DirectLight
  // ---------------------------------------------------------------------
  const dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
  dirLight.target.position.set( 0, 0, - 1 );
  dirLight.add( dirLight.target );
  dirLight.lookAt( - 1, - 1, 0 );
  dirLight.name = 'DirectionalLight';
  scene1.add( dirLight );

  // ---------------------------------------------------------------------
  // Grid
  // ---------------------------------------------------------------------
  gridHelper = new THREE.GridHelper( 2000, 20, 0x888888, 0x444444 );
  gridHelper.position.y = - 50;
  gridHelper.name = 'Grid';
  scene1.add( gridHelper );

  // ---------------------------------------------------------------------
  // Axes
  // ---------------------------------------------------------------------
  const axes = new THREE.AxesHelper( 500 );
  axes.name = 'AxesHelper';
  scene1.add( axes );

  //

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );

  container.appendChild( renderer.domElement );

  //

  window.addEventListener( 'resize', onWindowResize );

  const gui = new GUI();

  let h = gui.addFolder( 'Settings' );
  h.add( params, 'trs' ).name( 'Use TRS' );
  h.add( params, 'onlyVisible' ).name( 'Only Visible Objects' );
  h.add( params, 'truncateDrawRange' ).name( 'Truncate Draw Range' );
  h.add( params, 'binary' ).name( 'Binary (GLB)' );
  h.add( params, 'maxTextureSize', 2, 8192 ).name( 'Max Texture Size' ).step( 1 );

  h = gui.addFolder( 'Export' );
  h.add( params, 'loadModel' ).name( 'Import Model' );
  h.add( params, 'loadTexture' ).name( 'Import Texture' );
  h.add( params, 'exportSceneObject' ).name( 'Export Scene' );

  gui.open();
}

async function getNewFileHandle(desc, mime, extensions, open = false) {
  const options = {
    types: [
      { description: desc, accept: { [mime]: extensions} },
    ],
  };
  if (open) { return await window.showOpenFilePicker(options);
  }   else  { return await window.showSaveFilePicker(options); }
}

async function loadModel() {
  var loader = new FBXLoader(); // ModelLoader

  // Load Project .json from a file
  [file.handle] = await getNewFileHandle(
    '3D Model Files', 'application/octet-stream', [".fbx", ".FBX"], open = true);
  let fileSystemFile = await file.handle.getFile();
  let fileURL        = URL.createObjectURL(fileSystemFile);//await fileSystemFile.text();

  loader.load(fileURL,
    (model) => {
      mainModel = model;
      console.log(mainModel);
      mainModel.traverse((child) => {
        if (child.isMesh) {
          child.material = mainMaterial;
        }
      });

      scene1.add(mainModel);
    },
    (progress) => { /*console.log(progress);*/ },
    (error) => { console.error(error); },
    { extension: "fbx" });
}

async function loadTexture() {
  // Load Project .json from a file
  [file.handle] = await getNewFileHandle(
    'Texture Files', 'application/octet-stream', [".png", ".jpg"], open = true);
  let fileSystemFile = await file.handle.getFile();
  let fileURL        = URL.createObjectURL(fileSystemFile);

  let map = new THREE.TextureLoader().load( fileURL );
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  if        (file.handle.name.includes("normal"   )) {
    mainMaterial.normalMap = map;
  } else if (file.handle.name.includes("specular" )) {
    mainMaterial.specularIntensityMap = map;
  } else if (file.handle.name.includes("roughness")) {
    mainMaterial.roughnessMap = map;
  } else {
    mainMaterial.map = map;
  }

  mainMaterial.needsUpdate = true;
  console.log(map);
}

function exportSceneObject() {
  exportGLTF(mainModel);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}

//

function animate() {
  requestAnimationFrame( animate );

  render();
}

function render() {
  const timer = Date.now() * 0.0001;

  camera.position.x = Math.cos( timer ) * 80;
  camera.position.z = Math.sin( timer ) * 80;

  camera.lookAt( scene1.position );
  renderer.render( scene1, camera );
}
