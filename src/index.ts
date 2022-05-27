import { ArrowHelper, BoxGeometry, Color, Euler, Mesh, MeshBasicMaterial, Object3D, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from "three";
import { wait } from "./utils";

const liftoff_heigth = 12.5;
const liftoff_coefficient = .01;
const camera_distance = 7.5;
const FOV = 75;
const rot = new Euler(Math.PI/3, Math.PI/4, Math.PI/16, 'YXZ');

const scene = new Scene();
scene.background = new Color(getComputedStyle(document.body).background);

const camera = new PerspectiveCamera(FOV, window.innerWidth/window.innerWidth, .1, 1000);
camera.rotation.copy(rot);
camera.position.set(0, 0, liftoff_heigth + 2);
camera.position.add(new Vector3(0,0,camera_distance).applyEuler(rot));

const renderer = new WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
const place = document.querySelector(".header__canvas") as HTMLDivElement;
place.appendChild(renderer.domElement);

function randomDisplacement(w: number = 3e-3) { return (Math.random()-0.5)*w; }

function startAnimation(obj: Object3D) {
    let height = 0;
    requestAnimationFrame(animate);

    function animate() {
        obj.position.x += randomDisplacement();
        obj.position.y += randomDisplacement();
        obj.position.z += randomDisplacement();
        obj.rotateZ(2e-3);

        if(height < liftoff_heigth) {
            height += liftoff_coefficient*(liftoff_heigth - height);
            obj.position.z = height;
        }
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    } 
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
    try {
        // const loader = new VRMLLoader();
        // const rocket = await loader.loadAsync("./assets/assieme_2022-05-25.wrl", onProgress);
        // scene.add(rocket);
        
        addAxisArrows();
        addAxisArrows(new Vector3(0,0,liftoff_heigth));
        
        const geometry = new BoxGeometry(1, 1, 1);
        const material = new MeshBasicMaterial({ color: 0xff7f50 })
        const cube = new Mesh(geometry, material);
        scene.add(cube);

        startAnimation(cube);
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


