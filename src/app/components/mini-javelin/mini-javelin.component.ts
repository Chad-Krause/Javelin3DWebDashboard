import { Component, OnInit, ElementRef, Input, ViewChild, AfterViewInit } from '@angular/core';
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";


@Component({
  selector: 'app-mini-javelin',
  templateUrl: './mini-javelin.component.html',
  styleUrls: ['./mini-javelin.component.scss']
})
export class MiniJavelinComponent implements OnInit, AfterViewInit {
  @ViewChild('minijavelincanvas') private canvasRef: ElementRef;
  private camera!: THREE.PerspectiveCamera;
  
  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  private controls: OrbitControls;
  
  private loader = new THREE.TextureLoader();
  private gltfLoader = new GLTFLoader();

  private groundGeo = new THREE.PlaneGeometry(50, 31.72);
  private groundMat = new THREE.MeshPhongMaterial({
    map: this.loader.load("/assets/basketball_court.jpg"), 
    side: THREE.DoubleSide});
  private groundMesh = new THREE.Mesh(this.groundGeo, this.groundMat)
  
  private renderer!: THREE.WebGL1Renderer;

  private scene!: THREE.Scene;

  private ambiLight: THREE.HemisphereLight;
  
  private robot: GLTF;
  private barrelAngle = 1;
  
  constructor() { 

  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.createScene();
    
    this.startRenderingLoop();
  }

  private animateRobot() {
    if(!this.robot) return;
    let now = new Date();

    let turretAngle = (.436 * Math.sin(now.getTime()/1000) + .436 - .086);

    let barrel = this.robot.scene.children[0].children[3];
    barrel.rotation.y += .01

    let rotationalAxis = new THREE.Vector3(0.092075, 0, 0);
    //barrel.rotateOnAxis(rotationalAxis, turretAngle);
    //barrel.position.y += 0.092075;
    barrel.rotation.x = turretAngle + Math.PI;
    //barrel.position.y += -0.092075;


    let turret = this.robot.scene.children[0].children[1];
    turret.rotation.x = turretAngle;
  }

  private startRenderingLoop() {
    this.renderer = new THREE.WebGL1Renderer({ canvas: this.canvas });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

    let component: MiniJavelinComponent = this;
    (function render() {
      requestAnimationFrame(render);
      component.animateRobot();
      component.renderer.render(component.scene, component.camera);
    }())
  }

  private addRobotToScene(gltf: GLTF) {
    this.robot = gltf;

    this.robot.scene.rotateX( -.5 * Math.PI)

    this.robot.scene.scale.set(3, 3, 3);
    console.log(this.robot);

    this.scene.add(this.robot.scene);
  }

  private createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x888888);

    this.groundMesh.rotation.x = Math.PI * -.5;
    this.scene.add(this.groundMesh);

    let aspectRatio = this.getAspectRatio();
    this.camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
    this.camera.position.set(2, 2, -1);

    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.target.set(0, 0, 0);

    this.ambiLight = new THREE.HemisphereLight(0xB1E1FF, 1);
    this.scene.add(this.ambiLight);

    this.gltfLoader.load("/assets/javelin_low_v3.gltf", (gltf) => {
      this.addRobotToScene(gltf)
    });
    

  }

  private getAspectRatio(): number {
    return this.canvas.clientWidth / this.canvas.clientHeight;
  }
}
