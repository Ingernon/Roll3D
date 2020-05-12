DEFAULT_MAP =  [[[1,0],[1,0],[1,0],[1,0],[1,0]],[[1,0],[1,0],[1,0],[1,0],[1,0]],[[1,0],[1,0],[1,2],[1,0],[1,0]],[[1,0],[1,0],[1,0],[1,0],[1,0]],[[1,0],[1,0],[1,0],[1,0],[1,0]]]

class Entity(object):
	def __init__(self):
		self.controll = ""
		self.x = 0
		self.y = 0

class Game(object):
	def __init__(self):
		self.entity = []
		self.map = DEFAULT_MAP

if __name__ == '__main__':
	pass