import { render } from 'mustache'
import { NodeInitializer } from 'node-red'
import { ActyxFishNode, ActyxFishNodeDef } from './types'

const nodeInit: NodeInitializer = (RED): void => {
  RED.nodes.registerType(
    'actyxfish',
    function (this: ActyxFishNode, config: ActyxFishNodeDef): void {
      RED.nodes.createNode(this, config)
      const {
        fishIdName,
        fishIdType,
        fishIdVersion,
        initState,
        where,
        onEvent,
      } = config

      this.on('input', (msg, send, done) => {
        send({
          ...msg,
          //@ts-ignore
          fish: {
            fishIdName: render(fishIdName, msg),
            fishIdType: render(fishIdType, msg),
            fishIdVersion,
            initState: render(initState, msg),
            where: render(where, msg),
            onEvent: render(onEvent, msg),
          },
        })
        done()
      })
    },
  )
}

export = nodeInit
