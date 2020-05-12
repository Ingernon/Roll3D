function do_nothing () {}

var enableControl = true

class Assets {

	constructor () {
		class Entity {
			constructor () {
			}

			player () {
				var player = new THREE.Group()
				
				let mesh = new THREE.Mesh(new THREE.BoxGeometry( 7, 7, 10 ), 
					new THREE.MeshPhongMaterial( { color: 'blue', flatShading: false } ))
				mesh.castShadow = true;
				mesh.receiveShadow = true;
				player.add(mesh)
				return(player)
			}

			enemy () {
				var enemy = new THREE.Group()
				enemy.add(new THREE.Mesh(new THREE.BoxGeometry( 7, 7, 10 ), 
					new THREE.MeshPhongMaterial( { color: 'red', flatShading: false } )))
				return(enemy)
			}
		}
		this.entity = new Entity()
		this.floorGeometry = new THREE.Geometry()
		this.objectGeometry = new THREE.Geometry()
		this.init_material()
		this.floor = new THREE.Mesh( this.floorGeometry, this.meshFaceMaterial )
		this.object = new THREE.Mesh( this.objectGeometry, this.meshFaceMaterial )
	}

	init_material () {
		let material_list = [
		new THREE.MeshPhongMaterial( { color: 0x4d2926, flatShading: false } ),
		new THREE.MeshLambertMaterial( { color: 0x7aa21d, flatShading: false } ),
		new THREE.MeshPhongMaterial( { color: 0xbaf455, flatShading: true } ),
		new THREE.MeshPhongMaterial( { color: 0x624a2e, flatShading: true } ),
		new THREE.MeshPhongMaterial( { color: 0x999999, flatShading: true } )
		]
		this.meshFaceMaterial = new THREE.MeshFaceMaterial( material_list )
	}

	add_to_floor (boxGeometry) {
		this.floorGeometry.merge( boxGeometry, boxGeometry.matrix )

	}

	add_to_object (boxGeometry) {
		this.objectGeometry.merge( boxGeometry, boxGeometry.matrix )

	}

	refresh (scene) {
		for (let i = scene.children.length - 1; i >= 0; i--) {
			if(scene.children[i].type === "Mesh")
				scene.remove(scene.children[i]);
		}
		this.floor = new THREE.Mesh( this.floorGeometry, this.meshFaceMaterial )
		this.floor.castShadow = false;
		this.floor.receiveShadow = true;
		this.object = new THREE.Mesh( this.objectGeometry, this.meshFaceMaterial )
		this.object.castShadow = true;
		this.object.receiveShadow = true;
		scene.add(this.floor)
		scene.add(this.object)
	}

	tree (x,y,z) {
		const treeHeights = [10,15,20];
		let boxGeometry = new THREE.BoxGeometry( 5, 5, 10 )
		for ( let face in boxGeometry.faces ) {
			boxGeometry.faces[ face ].materialIndex = 0;
		}
		boxGeometry.applyMatrix4( new THREE.Matrix4().makeTranslation(x,y,z))
		this.add_to_object(boxGeometry)
		let height = treeHeights[Math.floor(Math.random()*treeHeights.length)]
		boxGeometry = new THREE.BoxGeometry( 8, 8, height )
		for ( let face in boxGeometry.faces ) {
			boxGeometry.faces[ face ].materialIndex = 1;
		}
		boxGeometry.applyMatrix4( new THREE.Matrix4().makeTranslation(x,y,z+(height/2)))
		this.add_to_object(boxGeometry)
	}

	grass (x, y, z) {
		let boxGeometry = new THREE.BoxGeometry( 10, 10, 10 )
		for ( let face in boxGeometry.faces ) {
			boxGeometry.faces[ face ].materialIndex = 3;
		}
		boxGeometry.faces[ 8 ].materialIndex = 2;
		boxGeometry.faces[ 9 ].materialIndex = 2;
		boxGeometry.applyMatrix4( new THREE.Matrix4().makeTranslation(x,y,0))
		this.add_to_floor(boxGeometry)
	}

	trap (x, y, z) {
		let boxGeometry = new THREE.BoxGeometry( 10, 10, 1)
		for ( let face in boxGeometry.faces ) {
			boxGeometry.faces[ face ].materialIndex = 3;
		}
		boxGeometry.applyMatrix4( new THREE.Matrix4().makeTranslation(x,y,z-3))
		this.add_to_floor(boxGeometry)
		for ( let i = 0; i < 3; i ++ ) {
			for ( let j = 0; j < 3; j ++ ) {
				let boxGeometry = new THREE.BoxGeometry( 1, 1, 8)
				for ( let face in boxGeometry.faces ) {
					boxGeometry.faces[ face ].materialIndex = 4;
				}
				boxGeometry.applyMatrix4( new THREE.Matrix4().makeTranslation(x+(i*3-3),y+(j*3-3),z+Math.random()*4-4))
				this.add_to_floor(boxGeometry)
			}
		}
	}
}

class Control {
	constructor (engine) {
		this.engine = engine
		this.handlers = {
			handleWindowResize: this.handleWindowResize.bind(this),
			handleMouseMove: this.handleMouseMove.bind(this),
			handleScroll: this.handleScroll.bind(this)
		}
		document.addEventListener('contextmenu', event => event.preventDefault())
		window.addEventListener('mousemove', this.handlers.handleMouseMove)
		window.addEventListener( 'resize', this.handlers.handleWindowResize)
		window.addEventListener('wheel', this.handlers.handleScroll)
		this.lastx = 0
		this.lasty = 0
		this.enable_rotation_y = false
		this.onMouseMove = do_nothing
		this.onScroll = do_nothing
	}

	handleWindowResize() {
		this.engine.camera.aspect = window.innerWidth / window.innerHeight
		this.engine.camera.updateProjectionMatrix()
		this.engine.renderer.setSize( window.innerWidth, window.innerHeight )
	}

	handleMouseMove (event) {
		event.preventDefault();
		if (enableControl) {
			if (event.buttons == 1) {
					this.engine.camera.rotation.x =this.engine.camera.rotation.x + (this.lasty-event.y)/1000
					if (this.enable_rotation_y) {
						this.engine.camera.rotation.y= this.engine.camera.rotation.y + (this.lastx-event.x)/1000}
				}
				if (event.buttons == 2) {
				 	this.engine.camera.position.x = this.engine.camera.position.x + (this.lastx-event.x)/10
					this.engine.camera.position.y = this.engine.camera.position.y - (this.lasty-event.y)/10
					//console.log(this.engine.camera.position.x,this.engine.camera.position.y)
				}
		}
		this.onMouseMove()
		this.lastx = event.x
		this.lasty = event.y
	}

	handleScroll (event) {
		if (enableControl) {
			if (event.buttons == 2) {
					if (event.wheelDelta > 0) { this.engine.camera.position.z = this.engine.camera.position.z - 1 }
					if (event.wheelDelta < 0) { this.engine.camera.position.z = this.engine.camera.position.z + 1 }
				}
		}
		this.onScroll()
	}
}

class Engine {
	constructor () {
		this.assets = new Assets()
	}

	init () {
		this.init_renderer()
		this.init_camera()
		this.init_Scene()
		this.renderer.render(this.scene, this.camera)
		this.control = new Control(this)
	}

	init_renderer () {
		this.renderer = new THREE.WebGLRenderer({alpha: true, antialias: true})
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		document.getElementById('game').appendChild(this.renderer.domElement)
		this.stats = new Stats();
		document.getElementById('game').appendChild( this.stats.dom );
	}

	init_camera () {
		this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 )
		this.camera.position.z = 50;
		this.camera.rotation.x = 0.85;
	}

	init_Scene () {
		this.scene = new THREE.Scene()
		this.scene.add(this.camera)
		this.scene.background = new THREE.Color( 0x87ceeb );
	}

	dummy_scene (x,y) {
		var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
		this.scene.add(hemiLight)

		this.lightoffsetx = -100;
		this.lightoffsety = -100;
		this.dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
		this.dirLight.position.set(this.lightoffsetx, this.lightoffsety, 200);
		this.dirLight.castShadow = true;
		this.scene.add(this.dirLight);

		this.dirLight.shadow.mapSize.width = 2048;
		this.dirLight.shadow.mapSize.height = 2048;
		let d = 500;
		this.dirLight.shadow.camera.left = - d;
		this.dirLight.shadow.camera.right = d;
		this.dirLight.shadow.camera.top = d;
		this.dirLight.shadow.camera.bottom = - d;


		for ( let i = -x/2; i < x/2; i ++ ) {
			for ( let j = -y/2; j < y/2; j ++ ) {
				if (Math.random() > 0.95) {
					this.assets.trap(i*10, j*10, 0)
				} else {
					this.assets.grass(i*10, j*10, 0)
					if (Math.random() > 0.9) {
						this.assets.tree(i*10,j*10,10)
					}
				}
			}
		}
		this.assets.refresh(this.scene)
		this.renderer.render(this.scene, this.camera)
	}
}