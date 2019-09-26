const path = require('path')

const { Solc } = require('@evan.network/smart-contracts-core')


function compile(src, dst) {
  return async () => {
    const scc = new Solc({ log: console.log, config: { compileContracts: true } })
    const srcR = path.resolve(process.cwd(), src)
    const dstR = path.resolve(process.cwd(), dst)
    return scc.ensureCompiled(srcR, dstR)
  }
}

module.exports = { compile }
