// Entry for the vendored three.js bundle (web/vendor/three.bundle.js).
// Only the classes web/bud.js uses are re-exported onto window.THREE, so esbuild
// tree-shakes the rest. Built as an IIFE: WKWebView cannot load ES modules from file://.
// If bud.js starts using another class, add it here and run scripts/build-three.sh.
import {
  BackSide, BoxGeometry, BufferGeometry, CanvasTexture, CapsuleGeometry, CircleGeometry,
  Color, CylinderGeometry, DataTexture, DirectionalLight, Float32BufferAttribute, Group,
  HemisphereLight, Mesh, MeshBasicMaterial, MeshToonMaterial, NearestFilter, PerspectiveCamera,
  Points, PointsMaterial, RedFormat, RepeatWrapping, SRGBColorSpace, Scene,
  SphereGeometry, TorusGeometry, Vector3, WebGLRenderer,
  Quaternion, SkinnedMesh,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

window.THREE = {
  BackSide, BoxGeometry, BufferGeometry, CanvasTexture, CapsuleGeometry, CircleGeometry,
  Color, CylinderGeometry, DataTexture, DirectionalLight, Float32BufferAttribute, Group,
  HemisphereLight, Mesh, MeshBasicMaterial, MeshToonMaterial, NearestFilter, PerspectiveCamera,
  Points, PointsMaterial, RedFormat, RepeatWrapping, SRGBColorSpace, Scene,
  SphereGeometry, TorusGeometry, Vector3, WebGLRenderer,
  Quaternion, SkinnedMesh, GLTFLoader,
};
