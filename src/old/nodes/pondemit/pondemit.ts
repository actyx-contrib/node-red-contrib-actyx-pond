import { Tag, Tags } from 'PondV2'
import { render } from 'mustache'
import { NodeInitializer } from 'node-red'
import { getPond } from '../pondLib/pondLib'
import {
  PondConfigNodeDef,
  PondConfigNode,
  PondEmitNode,
  PondEmitNodeDef,
} from './types'

const nodeInit: NodeInitializer = (RED): void => {
  function pondEmitNodeConstructor(
    this: PondEmitNode,
    config: PondEmitNodeDef,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const node = this
    const { tags } = config

    console.info('pond-config: ', RED.nodes.getNode(config.pond))
    //this.status({ fill: 'yellow', shape: 'ring', text: 'connecting' })

    const pondConfig = RED.nodes.getNode(config.pond) as PondConfigNode
    console.info('pondemit - connecting')
    getPond(pondConfig, node).then((pond) => {
      console.info('pondemit - connected')
      //this.status({ fill: 'green', shape: 'dot', text: 'connected' })

      this.on('input', (msg, send, done) => {
        if (msg.payload) {
          const actyxTags = render(tags, msg)
            .split(/[\ ,;]/g)
            .map((t) => Tag(t))
            .reduce<Tags<unknown> | undefined>(
              (acc, t) => (acc ? acc.and(t) : t),
              undefined,
            )
          if (actyxTags) {
            this.debug(actyxTags)
            this.debug(JSON.stringify(msg.payload))
            ;(pond as any).emit(actyxTags, msg.payload).subscribe(() => {
              send({
                ...msg,
              })
              done()
            })
          }
        }
      })
    })
  }

  RED.nodes.registerType('pondemit', pondEmitNodeConstructor)

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
