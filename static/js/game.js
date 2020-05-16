class Entity {
	constructor (mesh) {
		this.mesh = mesh
		this.id = 0//game.entity.length
		this.target_x = this.mesh.position.x
		this.target_y = this.mesh.position.y
		this.target_z = this.mesh.position.z
		this.steps = 10
	}

	animate () {
		this.mesh.position.x += (this.target_x - this.mesh.position.x)/this.steps
		this.mesh.position.y += (this.target_y - this.mesh.position.y)/this.steps
		this.mesh.position.z += (this.target_z - this.mesh.position.z)/this.steps + Math.max(Math.abs((this.target_y - this.mesh.position.y)/this.steps),Math.abs((this.target_x - this.mesh.position.x)/this.steps))
	}

	controler () {
		window.addEventListener('keydown', this.handleKey.bind(this))
	}


	move () {
		console.log("emit")
					
	}

	handleKey (e) {
		switch (e.keyCode) { 
			case 37: 
				this.target_x -= 10
				break; 
			case 38: 
				this.target_y += 10
				break; 
			case 39: 
				this.target_x += 10 
				break; 
			case 40: 
				this.target_y -= 10 
				break; 
		}
		game.socket.emit("move", [this.id,this.target_x, this.target_y, this.target_z])
		//this.move()
	}
}

class Game {
	constructor () {
		this.engine = new Engine()
		this.engine.init()
		this.map = null
		this.entity = []
		this.id = window.location.href.split('/').pop()

		this.mouse = new THREE.Vector2()
		this.raycaster = new THREE.Raycaster()
		this.cursor = this.engine.assets.entity.cursor()
		this.engine.scene.add(this.cursor)

		this.init_light()
		this.request_repeat = false
		this.init_requests()
		this.request_map()
		this.socket.emit("users", this.id)
		this.engine.control.onMouseMove = (() => this.onMouseMove())
	}

	init_requests() {
		this.socket = io.connect('http://' + document.domain + ':' + location.port);
		this.socket.on('message', function(data) {
			console.log(data);
			});
		this.socket.on('map', function(data) {
			game.update_map(data)  // This is ugly
			});
		this.socket.on('users', function(data) {
			var currentDiv = document.getElementById('players');
			currentDiv.innerHTML = '';
			for (var i = 0; i < data.length; i++) {
				var button = document.createElement("button");
				button.innerHTML = data[i];
				currentDiv.appendChild(button);
			}
			});
		this.socket.on('move', function(data) {
			console.log(data)
			game.entity[data[0]].target_x = data[1]
			game.entity[data[0]].target_y = data[2]
			game.entity[data[0]].target_z = data[3]  // This is ugly
		});
		}
	init_light() {
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
	}

	update_map (res) {
		if (this.map == null && res.length > 0) {
			let max_x = 0
			let max_y = 0
			for ( let i = 0; i < res.length; i++ ) {
				if (res.length > max_x)
					max_x = res.length
				for ( let j = 0; j < res[i].length; j++ ) {
					if (res[i].length > max_y)
						max_y = res[i].length
				}
			}
			this.engine.camera.position.x = ((max_x/2)*10)-5
			this.engine.camera.position.y = -(((max_y/2)*10)-5)
			this.engine.camera.position.z += Math.round(res[Math.round(max_x/2)][Math.round(max_y/2)].length)-1
		}
		this.map = res
		this.genarate_map()
		if (this.request_repeat)
			this.request_map()
	}

	genarate_map () {
		let x_len = this.map.length
		let y_len = this.map[0].length
		let z_len = this.map[0][0].length
		for ( let i = 0; i < this.map.length; i++ ) {
			for ( let j = 0; j < this.map[i].length; j++ ) {
				for ( let k = 0; k < this.map[j].length; k++ ) {
					if (this.map[i][j][k] == 1)
						this.engine.assets.grass(i*10,j*10,k*10)
					if (this.map[i][j][k] == 2)
						this.engine.assets.tree(i*10,j*10,k*10)
				}
			}
		}
		this.engine.assets.refresh(this.engine.scene)
	}

	request_map () {
		this.socket.emit("map", this.id)
	}

	add_player () {
		var player_mesh = this.engine.assets.entity.player()
		player_mesh.position.z = 10
		this.engine.scene.add(player_mesh)
		var ent = new Entity(player_mesh)
		ent.controler()
		this.entity.push(ent)
	}

	onMouseMove () {
		this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	}

	select_object () {
		this.raycaster.setFromCamera( this.mouse, this.engine.camera );
		var intersects = this.raycaster.intersectObjects( this.engine.scene.children);
		var players = this.raycaster.intersectObject( this.entity[0].mesh,true );
		if ( intersects.length > 0 ) {
			console.log(intersects)
			this.cursor.position.x = Math.floor(intersects[0].point.x/ 10) * 10
			this.cursor.position.y = Math.floor(intersects[0].point.y/ 10) * 10
			this.cursor.position.z = Math.floor(intersects[0].point.z/ 10) * 10
			//console.log(intersects)
			//console.log(this.engine.scene.children)
			//console.log(this.entity[0].mesh)
			//console.log(players)
		}
	}
}

function loop () {
	requestAnimationFrame(loop)
	for (var i = 0; i < game.entity.length; i++) {
		game.entity[i].animate()
	}
	game.select_object()
	game.engine.renderer.render(game.engine.scene, game.engine.camera)
	game.engine.stats.update();
}

var game = new Game()
game.add_player()
loop()