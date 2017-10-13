'use strict'
const fs = require('fs')
const mkdirp = require('mkdirp');
const yaml = require('js-yaml')
const redis = require('redis')
const base64 = require('./lib/base-64');
let config = yaml.safeLoad(fs.readFileSync(__dirname + '/config.yml', 'utf8'));

mkdirp(config.dataDir)

// Get all keys from redis.
let namespace = process.env.LEVEL_CRASHER_NS || 'levelcrasher';
let c = redis.createClient()
c.hgetall(namespace + '.levels', (err, data) => {

    for (let prop in data) {
        fs.writeFileSync(config.dataDir + '/' + base64.encode(prop), data[prop])
    }
    c.quit()
})
