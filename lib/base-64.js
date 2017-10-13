module.exports = {
  encode: (str) => {
    return Buffer.from(str + '', 'utf8').toString('base64')
  },
  decode: (str) => {
    return Buffer.from(str, 'base64').toString('utf8')
  }
}