"use strict"
Object.defineProperty(exports, "__esModule", { value: true })

exports.getPond = void 0
const { Tag } = require('PondV3')
const PondV3 = require("PondV3")
let pond = undefined
let mkPond = false
const getPond = async (config, node) => {
  if (pond === undefined) {
    // if nobody is building the pond right now
    if (mkPond === false) {
      mkPond = true
      pond = await PondV3.Pond.default({
        appId: config.appid,
        displayName: config.displayname,
        version: config.version,
        signature: config.signature ? config.signature : undefined,
      })
      console.log('Actyx-Pond: Connected')
      return pond
    }
    // get pond when it is done
    return await new Promise((res) => {
      const interval = setInterval(() => {
        if (pond !== undefined) {
          clearInterval(interval)
          res(pond)
        }
      }, 25)
    })
  }
  console.log('Actyx-Pond: Return existing pond')
  return pond
}
exports.getPond = getPond
exports.Tag = Tag
