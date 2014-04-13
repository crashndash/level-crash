test:
	@NODE_ENV=test ./node_modules/mocha/bin/_mocha --reporter spec
	./node_modules/.bin/jshint src/ static/js/*.js static/js/components/ lib/ routes/

test-front:
		./node_modules/gulp/bin/gulp.js scripts
	@NODE_ENV=test ./node_modules/karma/bin/karma start karma.conf.js

test-cov:
	@NODE_ENV=test node ./node_modules/istanbul/lib/cli.js \
cover ./node_modules/mocha/bin/_mocha -- -d --recursive -R spec


.PHONY: test test-cov test-front
