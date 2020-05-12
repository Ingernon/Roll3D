import sys
sys.path.insert(1, "./src")
import flask as fl
import random
import flask_socketio as fl_sio

from Game import Game

def generateId(size):
	ret = ""
	for i in range(size):
		ret += random.choice("AZERTYUIOPQSDFGHJKLMWXCVBNazertyuiopqsdfghjklmwxcvbn123456789")
	return ret

services = {}
users = {}

def sessionIsValid(session):
	if not session or session['id'] not in users:
		return False
	return True

class User(object):
	def __init__(self):
		max_id_len = 10
		ida = generateId(max_id_len)

		def verifyUserId(ido):
			if ido in users:
				return True
			return False

		i = 0
		while verifyUserId(ida):
			if i == 1000:
				max_id_len += 1
			ida = generateId(max_id_len)
			i+=1
		self.id = ida
		self.role = 0
		self.service = ""

class Service():
	def __init__(self):
		max_id_len = 10
		url = generateId(max_id_len)
		def verifyServiceUrl(urlo):
			if urlo in services:
				return True
			return False
		i = 0
		while verifyServiceUrl(url):
			if i == 1000:
				max_id_len += 1
			url = generateId(max_id_len)
			i+=1
		self.url = url
		self.game = Game()
		self.users = []

app = fl.Flask(__name__)
app.secret_key = "ineedtohaveabetterkey" #this is true
socketio = fl_sio.SocketIO(app) 

@app.route('/')
def index():
	if not sessionIsValid(fl.session):
		u = User()
		users.update({u.id:u})
		fl.session['id'] = u.id
	return fl.render_template('index.html')

@app.route('/editor')
def editor():
	if not sessionIsValid(fl.session):
		return fl.redirect("/")
	return fl.render_template('editor.html')

@app.route('/game/<url>')
def game(url):
	if url not in services:
			return fl.redirect("/")
	if not sessionIsValid(fl.session):
		u = User()
		users.update({u.id:u})
		fl.session['id'] = u.id
	users[fl.session['id']].service = url

	if fl.session['id'] not in services[url].users:
		services[url].users.append(fl.session['id'])
	return fl.render_template('game.html')

@app.route('/host')
def host():
	if not sessionIsValid(fl.session):
		return fl.redirect("/")
	srv = Service()
	services.update({srv.url:srv})
	users[fl.session['id']].service = srv.url
	return fl.redirect("/game/"+srv.url)

@socketio.on('connect')
def connect():
	if not sessionIsValid(fl.session):
		return

	print('connect', file=sys.stderr)
	#fl_sio.emit('message', {'msg': fl.session['id']}) 

@socketio.on('map')
def map(data):
	if not sessionIsValid(fl.session):
		return
	fl_sio.join_room(users[fl.session['id']].service)
	fl_sio.emit('map', services[users[fl.session['id']].service].game.map, room=users[fl.session['id']].service, broadcast=False)

@socketio.on('users')
def send_users(data):
	if not sessionIsValid(fl.session):
		return
	fl_sio.join_room(users[fl.session['id']].service)
	fl_sio.emit('users', services[users[fl.session['id']].service].users, room=users[fl.session['id']].service, broadcast=False)

@socketio.on('move')
def move(data):
	if not sessionIsValid(fl.session):
		return
	fl_sio.leave_room(users[fl.session['id']].service)
	socketio.emit('move', data, room=users[fl.session['id']].service, broadcast=False)
	fl_sio.join_room(users[fl.session['id']].service)

@socketio.on('disconnect')
def handle_disconnect():
	print('disconnect', file=sys.stderr)

if __name__ == '__main__':
	#create_route("/host")
	socketio.run(app)
	#app.run(host='localhost', debug=True)
	#app.run(host='192.168.137.1', debug=True)