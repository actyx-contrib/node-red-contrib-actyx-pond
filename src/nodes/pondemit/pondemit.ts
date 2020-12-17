import { Tag, Tags } from '@actyx/pond'
import { render } from 'mustache'
import { NodeInitializer } from 'node-red'
import { getPond } from '../pondLib/pondLib'
import { PondEmitNode, PondEmitNodeDef } from './types'

const nodeInit: NodeInitializer = (RED): void => {
  function pondEmitNodeConstructor(
    this: PondEmitNode,
    config: PondEmitNodeDef,
  ) {
    const node = this
    const { tags, name } = config

    RED.nodes.createNode(node, config)
    node.status({ fill: 'yellow', shape: 'ring', text: 'connecting' })

    getPond(node).then((pond) => {
      node.status({ fill: 'green', shape: 'dot', text: 'connected' })

      node.on('input', (msg, send, done) => {
        if (msg.payload) {
          const actyxTags = render(tags, msg)
            .split(/[\ ,;]/g)
            .map((t) => Tag(t))
            .reduce<Tags<unknown> | undefined>(
              (acc, t) => (acc ? acc.and(t) : t),
              undefined,
            )
          if (actyxTags) {
            node.debug(actyxTags)
            node.debug(JSON.stringify(msg.payload))
            pond.emit(actyxTags, msg.payload).subscribe(() => {
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
}

export = nodeInit
