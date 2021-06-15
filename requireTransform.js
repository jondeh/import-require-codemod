const fs = require('fs')
const pathModule = require('path')

module.exports = (file, api) => {
  const j = api.jscodeshift

  return j(file.source)
    .find(j.CallExpression, e => e.callee.name === 'require')
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
        conditions.some(e => path.node.arguments[0].value.startsWith(e)) &&
        !nullConditions.some(e =>
          path.node.arguments[path.node.arguments.length - 1].value.endsWith(e)
        )
      ) {
        const nodeValue = path.node.arguments[0].value
        const absolutePath = pathModule.resolve(
          pathModule.dirname(file.path),
          nodeValue
        )

        if (fs.existsSync(absolutePath)) {
          console.log('EXISTS', absolutePath)
          if (fs.statSync(absolutePath).isDirectory()) {
            const indexPath = pathModule.join(absolutePath, '/index.js')
            if (fs.existsSync(indexPath)) {
              path.node.arguments[
                path.node.arguments.length - 1
              ].value = path.node.arguments[
                path.node.arguments.length - 1
              ].value.endsWith('/')
                ? path.node.arguments[path.node.arguments.length - 1].value +
                  'index.js'
                : path.node.arguments[path.node.arguments.length - 1].value +
                  '/index.js'
            }
          }
        } else {
          if (
            path.node.arguments[path.node.arguments.length - 1].value.endsWith(
              '/style' ||
                path.node.arguments[
                  path.node.arguments.length - 1
                ].value.endsWith('/styles')
            )
          ) {
            path.node.arguments[path.node.arguments.length - 1].value =
              path.node.arguments[path.node.arguments.length - 1].value + '.css'
          } else {
            path.node.arguments[path.node.arguments.length - 1].value =
              path.node.arguments[path.node.arguments.length - 1].value + '.js'
          }
        }
      }
      j(path).replaceWith(path.node)
    })
    .toSource()
}
