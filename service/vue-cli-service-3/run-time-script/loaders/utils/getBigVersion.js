module.exports = function getBigVersion (version) {
  return version.match(/\d/)[0]
}