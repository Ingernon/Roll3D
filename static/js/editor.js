class Element {
	constructor (shape, color) {
		this.shape = shape
		this.color = color
	}
}

class Editor {
	constructor () {
		this.engine = new Engine()
		this.engine.init()
		this.init_scene()
		this.init_buttons()
		this.lol = "lol"
		
		this.mouse = new THREE.Vector2()
		this.INTERSECTED = null
		this.raycaster = new THREE.Raycaster()
		this.selection = true
	}

	init_buttons () {
		document.getElementById('square').addEventListener("click", () => this.create_square());
		//document.getElementById('backward').addEventListener("click", () => move('backward'));
		//document.getElementById('left').addEventListener("click", () => move('left'));

		this.engine.control.onMouseMove = (() => this.onMouseMove())
	}

	init_scene () {
		var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
		this.engine.scene.add(hemiLight)

		let lightoffsetx = -100;
		let lightoffsety = -100;
		var dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
		dirLight.position.set(lightoffsetx, lightoffsety, 200);
		dirLight.castShadow = true;
		this.engine.scene.add(dirLight);
		dirLight.shadow.mapSize.width = 2048;
		dirLight.shadow.mapSize.height = 2048;
		let d = 500;
		dirLight.shadow.camera.left = - d;
		dirLight.shadow.camera.right = d;
		dirLight.shadow.camera.top = d;
		dirLight.shadow.camera.bottom = - d;
		this.engine.camera.position.y =+ -40

		function draw(p1,p2, mat){       
			var geo = new THREE.Geometry()
			geo.vertices.push( p1 )
			geo.vertices.push( p2 )
			var line = new THREE.Line(geo,mat)
			return line
		}

		var axe = new THREE.Group()
		let len = 1000
		axe.add(draw(new THREE.Vector3(-len,0,0),
					new THREE.Vector3(len,0,0), 
					new THREE.LineBasicMaterial({color:'red'})))
		axe.add(draw(new THREE.Vector3(0,-len,0),
					new THREE.Vector3(0,len,0), 
					new THREE.LineBasicMaterial({color:'green'})))
		axe.add(draw(new THREE.Vector3(0,0,-len),
					new THREE.Vector3(0,0,len), 
					new THREE.LineBasicMaterial({color:'blue'})))

		for ( let i = -len; i < len; i+=10 ) {
			if (i != 0) {
				axe.add(draw(new THREE.Vector3(-len,i,0),
							new THREE.Vector3(len,i,0), 
							new THREE.LineBasicMaterial({color:'grey'})))
				axe.add(draw(new THREE.Vector3(i,-len,0),
							new THREE.Vector3(i,len,0),  
							new THREE.LineBasicMaterial({color:'grey'})))
			}
		}

		this.engine.scene.add(axe)
	}

	create_square () {
		let geometry = new THREE.BoxBufferGeometry( 10, 10, 10 );
		let material = new THREE.MeshPhongMaterial( { color: picked_color, flatShading: true } )
		let object = new THREE.Mesh( geometry, material)
		this.engine.scene.add(object)
	}

	onMouseMove () {
		if (this.INTERSECTED != null) {
			enableControl = false
			this.selection = false
		}
		if (event.buttons == 1) {
			if (this.INTERSECTED != null) {
				this.INTERSECTED.rotation.x = this.INTERSECTED.rotation.x - (this.engine.control.lasty-event.y)/100
				this.INTERSECTED.rotation.y = this.INTERSECTED.rotation.y + (this.engine.control.lastx-event.x)/100
			}
		} else if (event.buttons == 2) {
			if (this.INTERSECTED != null) {
				this.INTERSECTED.position.x = this.INTERSECTED.position.x - (this.engine.control.lastx-event.x)
				this.INTERSECTED.position.y = this.INTERSECTED.position.y + (this.engine.control.lasty-event.y)
			}
		} else {
			this.selection = true 
			enableControl = true
		}
		this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	}

	select_object () {
		if (this.selection) {
			this.raycaster.setFromCamera( this.mouse, this.engine.camera );
				var intersects = this.raycaster.intersectObjects( this.engine.scene.children );
				if ( intersects.length > 0 ) {
						if ( this.INTERSECTED != intersects[ 0 ].object ) {
							if ( this.INTERSECTED ) this.INTERSECTED.material.emissive.setHex( this.INTERSECTED.currentHex );
							this.INTERSECTED = intersects[ 0 ].object;
							this.INTERSECTED.currentHex = this.INTERSECTED.material.emissive.getHex();
							this.INTERSECTED.material.emissive.setHex( 0xff0000 );
						}
				} else {
					if ( this.INTERSECTED ) this.INTERSECTED.material.emissive.setHex( this.INTERSECTED.currentHex )
					this.INTERSECTED = null
				}
			}
	}

}

function loop () {
	requestAnimationFrame(loop)
	//console.log(picked_color)
	editor.select_object()
	editor.engine.renderer.render(editor.engine.scene, editor.engine.camera)
	editor.engine.stats.update();
}

const editor = new Editor()
loop()