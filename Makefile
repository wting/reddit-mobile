.PHONY: dev-server
dev-server: dependencies dev-tools
	nodemon -e jsx,js,less,css index.js

.PHONY: dev-autobuild
dev-autobuild: dependencies dev-tools
	npm run watch

.PHONY: dev-tools
dev-tools:
	@command -v mocha &>/dev/null || npm install -g mocha
	@command -v nodemon &>/dev/null || npm install -g nodemon

.PHONY: lint
lint:
	npm run lint

.PHONY: test
test: dev-tools
	mocha

.PHONY: clean
clean:
	rm -fr ./build ./node_modules

.PHONY: dependencies
dependencies: node_modules lib/snooboots/LICENSE build

build:
	npm run build

lib/snooboots/LICENSE:
	git submodule update --init

node_modules:
	npm install
