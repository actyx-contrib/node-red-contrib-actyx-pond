"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.mkOnEventFn = exports.mkFish = exports.mkFishId = exports.compileTags = void 0
/* eslint-disable @typescript-eslint/no-explicit-any */
const PondV3_1 = require("PondV3")
const compileTags = (where, _node) => {
  const tokensWhere = where.split('').reduce((acc, char) => {
    // ignore space
    if (char === ' ') {
      return acc
    }
    // push next operator
    if (char === '&' || char === '|') {
      if (acc.length == 0) {
        return acc
      }
      const last = acc[acc.length - 1]
      if (last === '|' || last === '&') {
        return acc
      }
      acc.push(char)
      return acc
    }
    // push/append next character
    if (acc.length === 0) {
      acc.push(char)
      return acc
    }
    const last = acc[acc.length - 1]
    if (last === '|' || last === '&') {
      acc.push(char)
      return acc
    }
    acc[acc.length - 1] = acc[acc.length - 1] + char
    return acc
  }, [])
  return (tokensWhere
    .reduce((acc, token) => {
      if (token === '|') {
        return [...acc, []]
      }
      if (token === '&') {
        return acc
      }
      acc[acc.length - 1].push(token)
      return acc
    }, [[]])
    .map((group) => PondV3_1.Tags(...group))
    .reduce((acc, groupedTags) => {
      if (acc === undefined) {
        return groupedTags
      }
      return acc.or(groupedTags)
    }, undefined) || PondV3_1.Tag('undefined'))
}
exports.compileTags = compileTags
const mkFishId = (fishData) => PondV3_1.FishId.of(fishData.fishIdType, fishData.fishIdName, +fishData.fishIdVersion)
exports.mkFishId = mkFishId
const mkFish = (fishData, node) => ({
  fishId: exports.mkFishId(fishData),
  initialState: JSON.parse(fishData.initState),
  where: exports.compileTags(fishData.where, node),
  onEvent: exports.mkOnEventFn(fishData.onEvent, node),
})
exports.mkFish = mkFish
const mkOnEventFn = (onEvent, node) => {
  // console.log("\n on event:\n", onEvent)
  try {
    return new Function('__inState__', '__inEvent__', '__inMetadata__', `try{ return (${onEvent})(__inState__, __inEvent__, __inMetadata__) } catch {return __inState__}`)
  }
  catch (e) {
    node.warn(e)
    return (state) => state
  }
}
exports.mkOnEventFn = mkOnEventFn
