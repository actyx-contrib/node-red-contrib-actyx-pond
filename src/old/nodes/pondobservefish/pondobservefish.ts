/* eslint-disable @typescript-eslint/no-explicit-any */
import { CancelSubscription, Fish } from 'PondV3'
import { NodeInitializer } from 'node-red'
import { FishMessage } from '../actyxfish/types'
import { getPond } from '../pondLib/pondLib'
import { mkFishId, mkFish } from '../pondLib/util'
import { PondObserveFishNode, PondObserveFishNodeDef } from './types'
import { PondConfigNode } from '../pondemit/types'

const nodeInit: NodeInitializer = (RED): void => {
  function PondObserveFishNodeConstructor(
    this: PondObserveFishNode,
    config: PondObserveFishNodeDef,
  ): void {
    RED.nodes.createNode(this, config)

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const node = this
    let fish: Fish<any, any> | undefined = undefined
    let currentObservation: CancelSubscription | undefined = undefined

    console.warn(
      'pondobservefish - pond-config: ',
      RED.nodes.getNode(config.pond),
    )
    const pondConfig = RED.nodes.getNode(config.pond) as PondConfigNode

    getPond(pondConfig, node).then((pond) => {
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

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          currentObservation = (pond as any).observe<any, any>(
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            fish,
            (newState: any) => {
              node.send({
                payload: newState,
              })
            },
            (err: any) => node.warn(err),
          )
        }

        done()
      })
    })
  }

  RED.nodes.registerType('pondobservefish', PondObserveFishNodeConstructor)
}

export = nodeInit
