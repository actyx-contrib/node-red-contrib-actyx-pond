import { CancelSubscription, Fish } from '@actyx/pond'
import { NodeInitializer } from 'node-red'
import { FishMessage } from '../actyxfish/types'
import { getPond } from '../pondLib/pondLib'
import { mkFish, mkFishId } from '../pondLib/util'
import { PondObserveFishNode, PondObserveFishNodeDef } from './types'

const nodeInit: NodeInitializer = (RED): void => {
  function PondObserveFishNodeConstructor(
    this: PondObserveFishNode,
    config: PondObserveFishNodeDef,
  ): void {
    RED.nodes.createNode(this, config)

    const node = this
    let fish: Fish<any, any> | undefined = undefined
    let currentObservation: CancelSubscription | undefined = undefined

    getPond(node).then((pond) => {
      node.status({
        fill: 'green',
        shape: 'ring',
        text: 'connected (missing Fish)',
      })

      this.on('input', (msg, _send, done) => {
        const message = msg as typeof msg & { fish?: FishMessage }
        if (!message.fish) {
          node.status({
            fill: 'yellow',
            shape: 'ring',
            text: 'connected (missing Fish)',
          })
          done()
          return
        }

        const incomingFishId = mkFishId(message.fish)
        node.status({
          fill: 'green',
          shape: 'dot',
          text: `connected ${incomingFishId.entityType} ${incomingFishId.name}`,
        })
        if (!fish || fish.fishId !== incomingFishId) {
          fish = mkFish(message.fish, node)

          if (currentObservation) {
            currentObservation()
            currentObservation = undefined
          }

          currentObservation = pond.observe(
            fish,
            (newState) => {
              node.send({
                payload: newState,
              })
            },
            (err) => node.warn(err),
          )
        }

        done()
      })
    })
  }

  RED.nodes.registerType('pondobservefish', PondObserveFishNodeConstructor)
}

export = nodeInit
