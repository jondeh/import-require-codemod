const fs = require('fs')
const pathModule = require('path')

module.exports = (file, api) => {
  const j = api.jscodeshift

  return j(file.source)
    .find(j.ImportDeclaration)
    .forEach(path => {
      const conditions = [
        '../',
        './',
        'coi-constants/',
        'coi-server/',
        'coi-client/',
        'coi-shared/',
        'coi-test/',
        'db/',
        '~'
      ]
      const nullConditions = ['.css', '.js', '.json']
      if (
        conditions.some(e => path.node.source.value.startsWith(e)) &&
        !nullConditions.some(e => path.node.source.value.endsWith(e))
      ) {

        const newPath = path.node.source.value
        const absolutePath = pathModule.resolve(pathModule.dirname(file.path), newPath)

        if (fs.existsSync(absolutePath))  {
          if (fs.statSync(absolutePath).isDirectory()) {
            const indexPath = pathModule.join(absolutePath, '/index.js')
            if (fs.existsSync(indexPath)) {
              path.node.source.value = path.node.source.value.endsWith('/') ? path.node.source.value + 'index.js' : path.node.source.value + '/index.js'
            }
          } 

        } else {
          if (path.node.source.value.endsWith('/style' || path.node.source.value.endsWith('/styles'))) {
            path.node.source.value = path.node.source.value + '.css'
          } else {
            path.node.source.value = path.node.source.value + '.js'
          }
        }
      }
      j(path).replaceWith(path.node)
    })
    .toSource()
}
