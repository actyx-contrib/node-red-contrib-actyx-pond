import { Pond } from '@actyx/pond'
import { Node } from 'node-red'

let pond: Pond | undefined = undefined
let mkPond = false

export const getPond = async (node: Node): Promise<Pond> => {
  if (pond === undefined) {
    // if nobody is building the pond right now
    if (mkPond === false) {
      mkPond = true
      pond = await Pond.default()
      node.log('Actyx-Pond: Connected')
      return pond
    }

    // get pond when it is done
    return await new Promise<Pond>((res) => {
      const interval = setInterval(() => {
        if (pond !== undefined) {
          clearInterval(interval)
          node.log('Actyx-Pond: Wait for connected succeeded')
          res(pond)
        }
      }, 25)
    })
  }
  node.log('Actyx-Pond: Use existing pond')

  return pond
}
