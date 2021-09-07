"use strict"
Object.defineProperty(exports, "__esModule", { value: true })

let { render } = require('mustache')
let { getPond, Tag } = require('./pondLib')
let { mkFishId, mkFish } = require("./util")

const pondEmitNodeConstructor = (RED) => function (config) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  RED.nodes.createNode(this, config)
  RED.log.info("register EmitNode")
  const node = this
  const { tags } = config
  this.status({ fill: 'yellow', shape: 'ring', text: 'connecting' })
  const pondConfig = RED.nodes.getNode(config.pond)
  RED.log.info('pondemit - connecting')
  getPond(pondConfig, node).then((pond) => {
    RED.log.info('pondemit - connected')
    this.status({ fill: 'green', shape: 'dot', text: 'connected' })
    this.on('input', (msg, send, done) => {
      if (msg.payload) {
        const actyxTags = render(tags, msg)
          .split(/[\ ,;]/g)
          .map((t) => Tag(t))
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
  RED.log.info("register ConfigNode")

  const { pondVersion, appid, displayname, version, signature } = config
  this.pondVersion = pondVersion
  this.appid = appid
  this.displayname = displayname
  this.version = version
  this.signature = signature
}

const pondObserveFishNodeConstructor = (RED) => function (config) {
  RED.nodes.createNode(this, config)
  RED.log.info("register ObserveFishNode")
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const node = this
  let fish = undefined
  let currentObservation = undefined
  const pondConfig = RED.nodes.getNode(config.pond)
  getPond(pondConfig, node).then((pond) => {
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
  RED.nodes.createNode(this, config)
  RED.log.info("register ObserveNode")

  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const node = this
  // RED.nodes.createNode(node, config)
  node.status({ fill: 'yellow', shape: 'ring', text: 'connecting' })
  const pondConfig = RED.nodes.getNode(config.pond)
  getPond(pondConfig, node).then((pond) => {
    node.status({ fill: 'green', shape: 'dot', text: 'connected' })
    setTimeout(() => {
      pond.observe(mkFish(config, node), (newState) => {
        node.send({
          payload: newState,
        })
      }, (err) => node.warn(err))
    }, 250)
  })
}

const actyxFishNodeConstructor = (RED) => function (config) {
  RED.nodes.createNode(this, config)
  RED.log.info("register FishNode")
  const { fishIdName, fishIdType, fishIdVersion, initState, where, onEvent, } = config
  this.on('input', (msg, send, done) => {
    send({
      ...msg,
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
}

const actyxAqlQueryConstructor = (RED) => function (config) {
  RED.nodes.createNode(this, config)
  RED.log.info("register AqlQueryNode")
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const node = this

  const pondConfig = RED.nodes.getNode(config.pond)
  if (pondConfig.pondVersion === 'v2') {
    node.status({
      fill: 'red',
      shape: 'dot',
      text: 'Actyx Version >= 2',
    })
    RED.log.error("Requires Actyx Version >= 2")
    return
  }
  getPond(pondConfig, node).then((pond) => {
    node.status({
      fill: 'green',
      shape: 'dot',
      text: 'connected',
    })
    this.on('input', (msg, _send, done) => {
      const query = render(config.aql, msg)
      node.status({
        fill: 'yellow',
        shape: 'dot',
        text: 'active',
      })
      pond.events().queryAql(query).then(res => {
        node.send({
          payload: res,
        })
        node.status({
          fill: 'green',
          shape: 'dot',
          text: 'connected',
        })
        done()
      }).catch((err) => {
        node.warn(err)
        done()
      })
    })
  })
}

module.exports = {
  pondEmitNodeConstructor,
  pondConfigNodeConstructor,
  pondObserveFishNodeConstructor,
  pondObserveNodeConstructor,
  actyxFishNodeConstructor,
  actyxAqlQueryConstructor,
}
