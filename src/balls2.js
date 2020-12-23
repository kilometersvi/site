import * as THREE from '../build/three.module.js'; 
//'../build/three.module.js';

//import Stats from './jsm/libs/stats.module.js';

let container;//, stats;

let camera, scene, renderer;

let gradient;


let current = 0, next = 10, balls = [];

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

/**** config ****/

//radius of balls:
let radius = 50;
//balls per frame:
let max_rate = 0.03;
//bounds
let b = 1000;

let customUniforms;

function vertexShader() {
    return `
        varying vec3 vUv;
        
        void main() {
            vUv = position;
            vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * modelViewPosition;
        }
    `
}

function fragmentShader() {
    return `
        uniform vec3 colorA; 
        uniform vec3 colorB;
        varying vec3 vUv;

        void main() {
            gl_FragColor = vec4(mix(colorA, colorB, vUv.x/100.0), 1.0);
        }
    `
}

init();
animate();


function Ball(posx, posy, radius, randomInitVelocity){
    
    this.x = posx;
    this.y = posy;
    this.vx = 0;
    this.vy = 0;
    if (randomInitVelocity>0){
        this.vx = Math.random()*randomInitVelocity-randomInitVelocity/2;
        this.vy = Math.random()*randomInitVelocity-randomInitVelocity/2;
    }
    this.ax = 0;
    this.ay = -9.8;
    
    
    this.geometry = new THREE.IcosahedronBufferGeometry( radius, 1 );
    const count = this.geometry.attributes.position.count;
    this.geometry.setAttribute( 'color', new THREE.BufferAttribute( new Float32Array( count * 3 ), 3 ) );
    
    const color = new THREE.Color();
    
    /*
    const material = new THREE.MeshPhongMaterial( {
        color: 0xffffff,
        flatShading: true,
        vertexColors: true,
        shininess: 0
    } );
    */
    
    const material = new THREE.ShaderMaterial({
        uniforms: customUniforms,
        transparent: true,
        vertexShader: vertexShader(),
        fragmentShader: fragmentShader()
    });

    const wireframeMaterial = new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true, transparent: true } );

    this.mesh = new THREE.Mesh( this.geometry, material );
    let wireframe = new THREE.Mesh( this.geometry, wireframeMaterial );
    this.mesh.add( wireframe );
    this.mesh.position.x = posx;
    this.mesh.position.y = posy;
    this.mesh.rotation.x = - 1.87;
    
    this.mesh.name = Math.floor(Math.random()*999999);
    scene.add( this.mesh );
    balls.push(this);
    
}
Ball.prototype.getPhysicsAttributes = function() {
    return [this.x, this.y, this.vx, this.vy, this.ax, this.ay]
}

function init() {

    container = document.getElementById( 'container' );

    camera = new THREE.PerspectiveCamera( 
        20, 
        window.innerWidth / window.innerHeight, 
        1, 
        10000 
    );
    camera.position.z = 1800;

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );

    const light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 0, 0, 1 );
    scene.add( light );
    
    customUniforms = {
        colorA : {value: new THREE.Vector4(255,255,255,255)}, //(0.5,0.02,0.45,0)},//{value: new THREE.Vector3(120,10,100)},//new THREE.Color( "rgba(120,10,100,255)")
        colorB : {value: new THREE.Vector4(255,255,255,255)} //(0.8,0.8,0.8,0)}//{value: new THREE.Vector3(210,210,210)}//new THREE.Color( "rgba(210,210,210,255)")
    };
    
    //shadow
    const canvas = document.createElement( 'canvas' );
    canvas.width = 128;
    canvas.height = 128;

    const context = canvas.getContext( '2d' );
    
    gradient = context.createRadialGradient( canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2 );
    gradient.addColorStop( 0.1, 'rgba(210,210,210,1)' );
    gradient.addColorStop( 1, 'rgba(255,255,255,1)' );
    
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );
    
    window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

    requestAnimationFrame( animate );

    
    current ++;
    if (current > next){
        current = 0;
        next = Math.floor((Math.random() * 1/(3*max_rate)) + 1/(4*max_rate));
        var b = new Ball(Math.random()*windowHalfX*2-windowHalfX, windowHalfY*2.5, radius, 50);
    }
    
    var t = 0.1;
    var toPop = []
    for (let i = 0; i < balls.length; i++){
        var x0 = balls[i].x;
        var y0 = balls[i].y;
        var vx0 = balls[i].vx;
        var vy0 = balls[i].vy;
        var ax = balls[i].ax;
        var ay = balls[i].ay;
        
        if (y0 < b*-1 || y0 > b || x0 < b*-1 || x0 > b){
            toPop.push(i);
            continue;
        }
        balls[i].vx = vx0+ax*t;
        balls[i].vy = vy0+ay*t;
        balls[i].x = x0 + vx0*t + 0.5*ax*t*t;
        balls[i].y = y0 + vy0*t + 0.5*ay*t*t;
        balls[i].mesh.position.set(balls[i].x,balls[i].y,0)
        
        const count = balls[i].geometry.attributes.position.count;
        balls[i].geometry.setAttribute( 'color', new THREE.BufferAttribute( new Float32Array( count * 3 ), 3 ) );
        const color = new THREE.Color();
        /*const positions1 = balls[i].geometry.attributes.position;
        const positions2 = balls[i].geometry.attributes.position;
        const positions3 = balls[i].geometry.attributes.position;
        const colors1 = balls[i].geometry.attributes.color;
        const colors2 = balls[i].geometry.attributes.color;
        const colors3 = balls[i].geometry.attributes.color;

        for ( let i = 0; i < count; i ++ ) {

            color.setHSL( ( positions1.getY( i ) / radius + 1 ) / 2, 1.0, 0.5 );
            colors1.setXYZ( i, color.r, color.g, color.b );

            color.setRGB( 1, 0.8 - ( positions3.getY( i ) / radius + 1 ) / 2, 0 );
            colors3.setXYZ( i, color.r, color.g, color.b );

        }*/
    }
    if (toPop.length > 0){
        toPop.sort().reverse();
        for (let i of toPop){
            scene.remove(scene.getObjectByName(balls[i].mesh.name));
            balls[i].geometry.dispose();
            balls.splice(i,1);
        }
        //toPop.forEach(balls.pop);
    }

    render();
    //stats.update();

}

function render() {

    renderer.render( scene, camera );

}
