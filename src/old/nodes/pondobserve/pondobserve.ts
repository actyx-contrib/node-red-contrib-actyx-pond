import { NodeInitializer } from 'node-red'
import { PondConfigNode } from '../pondemit/types'
import { getPond } from '../pondLib/pondLib'
import { mkFish } from '../pondLib/util'
import { PondObserveNode, PondObserveNodeDef } from './types'

const nodeInit: NodeInitializer = (RED): void => {
  function pondObserveNodeConstructor(
    this: PondObserveNode,
    config: PondObserveNodeDef,
  ): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const node = this
    RED.nodes.createNode(node, config)
    node.status({ fill: 'yellow', shape: 'ring', text: 'connecting' })

    console.warn('pondobserve - pond-config: ', RED.nodes.getNode(config.pond))
    const pondConfig = RED.nodes.getNode(config.pond) as PondConfigNode

    getPond(pondConfig, node).then((pond) => {
      node.status({ fill: 'green', shape: 'dot', text: 'connected' })

      setTimeout(() => {
        ;(pond as any).observe(
          mkFish(config, node) as any,
          (newState: any) => {
            node.send({
              payload: newState,
            })
          },
          (err: any) => node.warn(err),
        )
      }, 250)
    })
  }

  RED.nodes.registerType('pondobserve', pondObserveNodeConstructor)
}

export = nodeInit
