import { Pond as PondV2 } from 'PondV2'
import { Pond as PondV3 } from 'PondV3'
import { Node } from 'node-red'
import { PondConfigOptions } from '../pondemit/types'

type Pond = PondV2 | PondV3

let pond: PondV2 | PondV3 | undefined = undefined
let mkPond = false

export const getPond = async (
  config: PondConfigOptions,
  node: Node,
): Promise<Pond> => {
  if (pond === undefined) {
    // if nobody is building the pond right now
    if (mkPond === false) {
      mkPond = true
      if (config) {
        console.log(config)
      }

      pond = await PondV3.default({
        appId: config.appid, // 'com.example.alex-nodered',
        displayName: config.displayname, //'nodeRed Example',
        version: config.version, //'1.0.1',
        signature: config.signature ? config.signature : undefined,
      })
      console.log('Actyx-Pond: Connected')
      return pond
    }

    // get pond when it is done
    return await new Promise<Pond>((res) => {
      const interval = setInterval(() => {
        if (pond !== undefined) {
          clearInterval(interval)
          console.log('Actyx-Pond: Wait for connected succeeded')
          res(pond)
        }
      }, 25)
    })
  }
  console.log('Actyx-Pond: Use existing pond')

  return pond
}
