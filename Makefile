test:
	@NODE_ENV=test ./node_modules/mocha/bin/_mocha --reporter spec

test-cov:
	@NODE_ENV=test node ./node_modules/istanbul/lib/cli.js \
cover ./node_modules/mocha/bin/_mocha -- -d --recursive -R spec


.PHONY: test test-cov
