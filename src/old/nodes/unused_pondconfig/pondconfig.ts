import { NodeInitializer } from 'node-red'
import { PondConfigNodeDef, PondConfigNode } from './types'

const nodeInit: NodeInitializer = (RED): void => {
  function pondConfigNodeConstructor(
    this: PondConfigNode,
    config: PondConfigNodeDef,
  ) {
    RED.nodes.createNode(this, config)

    this.pondVersion = config.pondVersion
    this.appid = config.appid
    this.displayname = config.displayname
    this.version = config.version
    this.signature = config.signature
  }
  RED.nodes.registerType('pond-config', pondConfigNodeConstructor)
}

export = nodeInit
