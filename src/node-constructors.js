"use strict"
Object.defineProperty(exports, "__esModule", { value: true })

let { render } = require('mustache')
let { getPond, Tag } = require('./pondLib')
let { switchMap } = require('rxjs/operators')
let { mkFishId, mkFish } = require("./util")
const { combineLatest } = require('rxjs')
const { RxPond } = require('@actyx-contrib/rx-pond')
const { red } = require('colorette')

const pondEmitNodeConstructor = (RED) => function (config) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  RED.nodes.createNode(this, config)
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

  const { pondVersion, appid, displayname, version, signature } = config
  this.pondVersion = pondVersion
  this.appid = appid
  this.displayname = displayname
  this.version = version
  this.signature = signature
}

const pondObserveFishNodeConstructor = (RED) => function (config) {
  RED.nodes.createNode(this, config)
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
      console.log(fish)
      if (!fish || fish.fishId !== incomingFishId) {
        fish = mkFish(message.fish, node)
        if (currentObservation) {
          currentObservation()
          currentObservation = undefined
        }
        currentObservation = pond.observe(
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

const pondObserveRegistryNodeConstructor = (RED) => function (config) {
  RED.nodes.createNode(this, config)

  const node = this
  let currentObservation = undefined
  const pondConfig = RED.nodes.getNode(config.pond)
  const { fishIdType, fishIdVersion, initState, where, onEvent } = config

  getPond(pondConfig, node).then((pond) => {
    const rxPond = RxPond.from(pond)
    node.status({
      fill: 'green',
      shape: 'ring',
      text: 'connected (no ids)',
    })

    this.on('input', (msg, _send, done) => {
      const entities = [...msg.payload].map(id => mkFish({
        fishIdName: id,
        fishIdType: render(fishIdType, { ...msg, id }),
        fishIdVersion: fishIdVersion || '0',
        initState: render(initState, { ...msg, id }),
        where: render(where, { ...msg, id }),
        onEvent: render(onEvent, { ...msg, id }),
      }))

      node.status({
        fill: 'green',
        shape: entities.length > 0 ? 'dot' : 'ring',
        text: `connected to ${entities.length} entities`,
      })

      if (currentObservation) {
        currentObservation.unsubscribe()
        currentObservation = undefined
      }

      currentObservation = combineLatest(entities.map(rxPond.observe)).subscribe(
        (newState) => {
          node.send({
            payload: newState,
          })
          done()
        },
        (err) => node.warn(err),
      )
    })
  })
}

const actyxAqlQueryConstructor = (RED) => function (config) {
  RED.nodes.createNode(this, config)
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
  pondObserveRegistryNodeConstructor,
  actyxFishNodeConstructor,
  actyxAqlQueryConstructor,
}
