function loop () {
	requestAnimationFrame(loop)
	engine.renderer.render(engine.scene, engine.camera)
	engine.stats.update();
}

const engine = new Engine()
engine.init()
engine.dummy_scene(50,50)
loop()