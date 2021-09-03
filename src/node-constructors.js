const Mustache = require('mustache')
const PondLib = require('../pondLib/pondLib')
const Util = require("../pondLib/util")

const pondEmitNodeConstructor = (RED) => function (config) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const node = this
  const { tags } = config
  console.info('pond-config: ', RED.nodes.getNode(config.pond))
  this.status({ fill: 'yellow', shape: 'ring', text: 'connecting' })
  const pondConfig = RED.nodes.getNode(config.pond)
  console.info('pondemit - connecting')
  PondLib.getPond(pondConfig, node).then((pond) => {
    console.info('pondemit - connected')
    this.status({ fill: 'green', shape: 'dot', text: 'connected' })
    this.on('input', (msg, send, done) => {
      if (msg.payload) {
        const actyxTags = Mustache.render(tags, msg)
          .split(/[\ ,;]/g)
          .map((t) => PondLib.Tag(t))
          .reduce((acc, t) => (acc ? acc.and(t) : t), undefined)
        if (actyxTags) {
          this.debug(actyxTags)
          this.debug(JSON.stringify(msg.payload))
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

const pondConfigNodeConstructor = (RED) => function (config) {
  RED.nodes.createNode(this, config)
  const { pondVersion, appid, displayname, version, signature } = config
  const node = this
  node.pondVersion = pondVersion
  node.appid = appid
  node.displayname = displayname
  node.version = version
  node.signature = signature
}

const pondObserveFishNodeConstructor(config) {
  RED.nodes.createNode(this, config)
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const node = this
  let fish = undefined
  let currentObservation = undefined
  console.warn('pondobservefish - pond-config: ', RED.nodes.getNode(config.pond))
  const pondConfig = RED.nodes.getNode(config.pond)
  pondLib.getPond(pondConfig, node).then((pond) => {
    node.status({
      fill: 'green',
      shape: 'ring',
      text: 'connected (missing Fish)',
    })
    this.on('input', (msg, _send, done) => {
      const message = msg
      if (!message.fish) {
        node.status({
          fill: 'yellow',
          shape: 'ring',
          text: 'connected (missing Fish)',
        })
        done()
        return
      }
      const incomingFishId = Util.mkFishId(message.fish)
      node.status({
        fill: 'green',
        shape: 'dot',
        text: `connected ${incomingFishId.entityType} ${incomingFishId.name}`,
      })
      if (!fish || fish.fishId !== incomingFishId) {
        fish = Util.mkFish(message.fish, node)
        if (currentObservation) {
          currentObservation()
          currentObservation = undefined
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        currentObservation = pond.observe(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          fish, (newState) => {
            node.send({
              payload: newState,
            })
          }, (err) => node.warn(err))
      }
      done()
    })
  })
}

const pondObserveNodeConstructor = (RED) => function (config) {
  console.log(this, config)
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const node = this
  RED.nodes.createNode(node, config)
  node.status({ fill: 'yellow', shape: 'ring', text: 'connecting' })
  console.warn('pondobserve - pond-config: ', RED.nodes.getNode(config.pond))
  const pondConfig = RED.nodes.getNode(config.pond)
  pondLib.getPond(pondConfig, node).then((pond) => {
    node.status({ fill: 'green', shape: 'dot', text: 'connected' })
    setTimeout(() => {
      pond.observe(Util.mkFish(config, node), (newState) => {
        node.send({
          payload: newState,
        })
      }, (err) => node.warn(err))
    }, 250)
  })
}


const actyxFishNodeConstructor = (RED) => function (config) {
  RED.nodes.createNode(this, config)
  const { fishIdName, fishIdType, fishIdVersion, initState, where, onEvent, } = config
  this.on('input', (msg, send, done) => {
    send({
      ...msg,
      fish: {
        fishIdName: Mustache.render(fishIdName, msg),
        fishIdType: Mustache.render(fishIdType, msg),
        fishIdVersion,
        initState: Mustache.render(initState, msg),
        where: Mustache.render(where, msg),
        onEvent: Mustache.render(onEvent, msg),
      },
    })
    done()
  })
}
module.exports = {
  pondEmitNodeConstructor,
  pondConfigNodeConstructor,
  pondObserveFishNodeConstructor,
  pondObserveNodeConstructor,
  actyxFishNodeConstructor,
}
