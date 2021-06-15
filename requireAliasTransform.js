const fs = require('fs')
const pathModule = require('path')

module.exports = (file, api) => {
  const j = api.jscodeshift

  return j(file.source)
  .find(j.CallExpression, e => e.callee.name === 'require')
    .forEach(path => {
      const conditions = [
        ['coi-constants', "src/coi-constants"],
        ['coi-server', "src/server"],
        ['coi-client', "src/client"],
        ['coi-shared', "src/shared"],
        ['coi-test', "test"],
        ['db', "./db"],
        ["~", "./src"]
      ]
      const nodeValue = path.node.arguments[0].value
      conditions.forEach(alias => {
        if (nodeValue.startsWith(alias[0])) {
          const myPath = pathModule.resolve(__dirname, alias[1])

          let relPath = pathModule.relative(pathModule.dirname(file.path), myPath)
          if (relPath === "") {
            relPath = '.' + relPath
          }
          path.node.arguments[0].value = path.node.arguments[0].value.replace(alias[0], relPath)
        }
      })

      j(path).replaceWith(path.node)
    })
    .toSource()
}
