Level-crash
===========
[![Code Climate](http://img.shields.io/codeclimate/github/eiriksm/level-crash.svg)](https://codeclimate.com/github/eiriksm/level-crash)
[![Build Status](https://travis-ci.org/eiriksm/level-crash.svg)](https://travis-ci.org/eiriksm/level-crash)
[![Coverage Status](http://img.shields.io/coveralls/eiriksm/level-crash.svg)](https://coveralls.io/r/eiriksm/level-crash?branch=master)
[![Dependency Status](https://david-dm.org/eiriksm/level-crash.svg?theme=shields.io)](https://david-dm.org/eiriksm/level-crash)

This is the open-source level-editor for [Crash n Dash](https://crashndash.com), and it can be seen in action at (https://levels.crashndash.com).

## Development
### Requirements
Requires the following stack to run:
- Node js
- Redis

### Installation
- Clone this repository: `git clone https://github.com/eiriksm/level-crash`
- Enter the directory: `cd level-crash`
- Install dependencies: `npm install`
- Start the server: `node index.js`

The server will by default be available at (http://localhost:4000)

### Tests
Tests are run with karma and mocha. All dependencies should get installed with
`npm install`

To run the backend tests, run `make test`.

To run the frontend tests, run `make test-front`

### Contribute
To contribute, check out the repository.

Please make sure all tests are passing (see above). This project has 100% test 
coverage on both frontend and backend, so when adding features, please also add
tests.
