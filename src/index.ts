import { ArrowHelper, Color, DirectionalLight, Euler, Object3D, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { wait } from "./utils";

const liftoff_heigth = 20;
const liftoff_coefficient = 4e-3;
const camera_distance = 7.5;
const FOV = 75;
const rot = new Euler(Math.PI/3, Math.PI/4, Math.PI/16, 'YXZ');

const scene = new Scene();
setSceneBg();
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", setSceneBg);

const camera = new PerspectiveCamera(FOV, window.innerWidth/window.innerHeight, .1, 100);
camera.rotation.copy(rot);
camera.position.set(0, 0, liftoff_heigth + 5);
camera.position.add(new Vector3(0,0,camera_distance).applyEuler(rot));
// camera.position.z = 20;

const light = new DirectionalLight(0xffffff, 1);
light.position.set(2, -.2, 1);
scene.add(light);

const renderer = new WebGLRenderer({antialias: true});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
const place = document.querySelector(".header__canvas") as HTMLDivElement;
place.appendChild(renderer.domElement);

function setSceneBg() { scene.background = new Color(getComputedStyle(document.body).background); }

function randomDisplacement(w: number = 3e-3) { return (Math.random()-0.5)*w; }

function startAnimation(obj: Object3D) {
    let height = 0;
    let changedSize = false;
    let req = requestAnimationFrame(animate);
    window.addEventListener("resize", onResize);

    function animate() {
        obj.position.x += randomDisplacement();
        obj.position.y += randomDisplacement();
        obj.position.z += randomDisplacement();
        obj.rotateZ(2e-3);

        if(height < liftoff_heigth) {
            height += liftoff_coefficient*Math.pow(liftoff_heigth-height, 1.5);
            obj.position.z = height;
        }
        if(changedSize) {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth/window.innerHeight;
            camera.updateProjectionMatrix();
            changedSize = false;
        }
        renderer.render(scene, camera);
        req = requestAnimationFrame(animate);
    }
    function onResize() { changedSize = true; }
}

const scene_progress = document.querySelector(".scene-progress") as HTMLDivElement;
function onProgress(e: ProgressEvent) {
    const progress = e.loaded/e.total;
    scene_progress.style.setProperty("--p", progress.toFixed(3));
    if(progress == 1) wait(200).then(() => scene_progress.classList.add("hide"));
}

function addAxisArrows(origin?: Vector3) {
    if(!origin) origin = new Vector3(0,0,0);
    scene.add(
        new ArrowHelper(new Vector3(1,0,0), origin, 1, 0xff0000, .2, .1),
        new ArrowHelper(new Vector3(0,1,0), origin, 1, 0x00ff00, .2, .1),
        new ArrowHelper(new Vector3(0,0,1), origin, 1, 0x0000ff, .2, .1)
    );
}
    
async function loadScene() {
    await wait(1000);
    try {
        addAxisArrows();
        addAxisArrows(new Vector3(0,0,liftoff_heigth));

        const loader = new GLTFLoader();
        const gltf = await loader.loadAsync("./assets/Assieme_3D_tolleranze_2mm_20.gltf", onProgress);
        const rocket = gltf.scene;
        rocket.scale.multiplyScalar(3.5e-3);
        scene.add(rocket);
        startAnimation(rocket);

        // const geometry = new BoxGeometry(1, 1, 1);
        // const material = new MeshStandardMaterial({ color: 0xff7f50 })
        // const cube = new Mesh(geometry, material);
        // scene.add(cube);
        // startAnimation(cube);
    } catch(e) {
        console.log("Couldn't load the rocket");
        console.dir(e);
    }
}

function isWebGLAvailable() {
    try {
        const canvas = document.createElement( 'canvas' );
        return !! ( window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ) );
    } catch ( e ) {
        return false;
    }
}

if(isWebGLAvailable()) loadScene();


