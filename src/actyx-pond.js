"use strict"
Object.defineProperty(exports, "__esModule", { value: true })

let nodes = require('./node-constructors')

const nodeInit = (RED) => {
  RED.nodes.registerType('pond-config', nodes.pondConfigNodeConstructor(RED))
  RED.nodes.registerType('actyx-fish', nodes.actyxFishNodeConstructor(RED))
  RED.nodes.registerType('pond-emit', nodes.pondEmitNodeConstructor(RED))
  RED.nodes.registerType('pond-observe-fish', nodes.pondObserveFishNodeConstructor(RED))
  RED.nodes.registerType('pond-observe', nodes.pondObserveNodeConstructor(RED))
  RED.nodes.registerType('aql-query', nodes.actyxAqlQueryConstructor(RED))
  RED.log.info("Actyx nodes initialized")
}

module.exports = nodeInit
