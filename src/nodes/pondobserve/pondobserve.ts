import { NodeInitializer } from 'node-red'
import { getPond } from '../pondLib/pondLib'
import { mkFish } from '../pondLib/util'
import { PondObserveNode, PondObserveNodeDef } from './types'

const nodeInit: NodeInitializer = (RED): void => {
  function pondObserveNodeConstructor(
    this: PondObserveNode,
    config: PondObserveNodeDef,
  ): void {
    const node = this
    RED.nodes.createNode(node, config)
    node.status({ fill: 'yellow', shape: 'ring', text: 'connecting' })

    getPond(node).then((pond) => {
      node.status({ fill: 'green', shape: 'dot', text: 'connected' })

      setTimeout(() => {
        pond.observe(
          mkFish(config, node),
          (newState) => {
            node.send({
              payload: newState,
            })
          },
          (err) => node.warn(err),
        )
      }, 250)
    })
  }

  RED.nodes.registerType('pondobserve', pondObserveNodeConstructor)
}

export = nodeInit
