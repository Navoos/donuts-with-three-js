import * as THREE from 'three'
import { FontLoader, OrbitControls, TextGeometry } from 'three/examples/jsm/Addons.js';
import { RGBELoader } from 'three/examples/jsm/Addons.js';

// definitions
const texturePath = "textures";
const matcapsPath = `${texturePath}/matcaps`;
const donutTexture = "/delicious.png"
const background = texturePath + "/enviMap/background.hdr";
const fontsPath = "fonts";
const textTexture = "/sunny.png"
const fontFamily = "/bubble-font.json"

// control sizes of the renderer
const maxWidth = 1440;
const maxHeight = 1024;
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

// manager for loading assets
const loadingManager = new THREE.LoadingManager();


// Basic setup of a scene with orbit control
const canvas = document.querySelector("canvas.webgl");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height);
camera.position.y = Math.floor(sizes.height / maxHeight * 16);
camera.position.z = Math.floor( -8 - (sizes.width / maxWidth * 16));
const controls = new OrbitControls(camera, canvas);

// add background
const rgbeLoader = new RGBELoader(loadingManager);
rgbeLoader.load(background, (texture) => {
	texture.mapping = THREE.EquirectangularReflectionMapping;
	scene.background = texture;
})

// add inertia
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));

loadingManager.onError = (resource) => {
	console.log(`failed to load resource ${resource}`);
}
// loading matcaps
const textureLoader = new THREE.TextureLoader(loadingManager);
const sunnyMatcap = textureLoader.load(matcapsPath + textTexture);

// loading fonts

const fontLoader = new FontLoader(loadingManager);
fontLoader.load(fontsPath + fontFamily, (font) => {
	const message = "NAVOOS";
	const textGeometry = new TextGeometry(message, {
		font: font,
		size: 0.5,
		depth: 0.1,
		curveSegments: 16,
	});
	textGeometry.center();

	const textMaterial = new THREE.MeshMatcapMaterial();
	textMaterial.matcap = sunnyMatcap;	
	const textMesh = new THREE.Mesh(textGeometry, textMaterial);
	textMesh.scale.x = -1;
	textMesh.rotation.y = - Math.PI / 6;
	scene.add(textMesh);
	textMesh.updateMatrixWorld();
	const textBox = new THREE.Box3().setFromObject(textMesh);
	const deliciousMatcap = textureLoader.load(matcapsPath + donutTexture);
	const donutMatcap = new THREE.MeshMatcapMaterial();
	donutMatcap.matcap = deliciousMatcap;
	const numberOfDonuts = 150;
	const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45);
	for (let i = 0; i < numberOfDonuts; ++i) {
		const donutMesh = new THREE.Mesh(donutGeometry, donutMatcap);
		donutMesh.position.x = (Math.random() - 0.5) * 10 ;
		donutMesh.position.y = (Math.random() - 0.5) * 10;
		donutMesh.position.z = (Math.random() - 0.5) * 10;
		donutMesh.rotation.x = Math.random() * Math.PI;
		donutMesh.rotation.y = Math.random() * Math.PI;
		donutMesh.updateMatrixWorld();
		const donutBox = new THREE.Box3().setFromObject(donutMesh);
		// skip elements that collide with text
		if (textBox.intersectsBox(donutBox)) continue;
		scene.add(donutMesh);
	}
})

// handle resizing
window.addEventListener("resize", () => {
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
});


const tick = () => {
	controls.update();
	renderer.render(scene, camera);
	requestAnimationFrame(tick);
}

tick();