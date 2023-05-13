install:
	npm ci
loader:
	node bin/index.js
run-debug:
	DEBUG="page-loader:*",axios,nock.* page-loader $(1)
lint:
	npm run eslint .
publish:
	npm publish --dry-run
test:
	npm run test
test-coverage:
	npm run test -- --coverage
test-watch:
	npm run test-watch
test-debug:
	DEBUG="page-loader:*",axios,nock.* npm run test
link:
	sudo npm link