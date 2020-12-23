let p, scene, camera, renderer, cube

function init(){
    p = document.getElementById('showcase');
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
      75,
      p.offsetWidth / p.offsetHeight,
      0.1,
      1000
    );

    const light = new THREE.DirectionalLight( 0xffffff );
				light.position.set( 0, 0, 1 );
				scene.add( light );

    renderer = new THREE.WebGLRenderer({antialiasing:true});

    renderer.setSize(p.offsetWidth, p.offsetHeight);
    p.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry(1,1,1);
    //const material = new THREE.MeshBasicMaterial( {color:0x0000ff});
    const texture = new THREE.TextureLoader().load('textures/crate.gif');
    const material = new THREE.MeshBasicMaterial( {map:texture});

    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;
}

function animate() {
    requestAnimationFrame(animate);

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render(scene,camera);
}

function onWindowResize(){
    camera.aspect = p.offsetWidth/p.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(p.offsetWidth, p.offsetHeight);

}

window.addEventListener('resize', onWindowResize, false)
init();
animate();
