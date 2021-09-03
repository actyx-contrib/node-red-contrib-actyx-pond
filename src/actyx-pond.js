"use strict"
const Nodes = require('./node-constructors')

const nodeInit = (RED) => {
  RED.nodes.registerType('pond-emit', Nodes.pondEmitNodeConstructor(RED))
  RED.nodes.registerType('pond-config', Nodes.pondConfigNodeConstructor(RED))
  RED.nodes.registerType('pond-observe-fish', Nodes.pondObserveFishNodeConstructor(RED))
  RED.nodes.registerType('pond-observe', Nodes.pondObserveNodeConstructor(RED))
  RED.nodes.registerType('actyx-fish', Nodes.actyxFishNodeConstructor(RED))
}

module.exports = nodeInit
