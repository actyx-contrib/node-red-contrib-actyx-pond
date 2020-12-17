import { Fish, FishId, Reduce, Tag, Tags, Where } from '@actyx/pond'
import { Node } from 'node-red'
import { FishMessage } from '../actyxfish/types'

export const compileTags = (where: string, node: Node) => {
  const tokensWhere = where.split('').reduce<string[]>((acc, char) => {
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

  return (
    tokensWhere
      .reduce<string[][]>(
        (acc, token) => {
          if (token === '|') {
            return [...acc, []]
          }
          if (token === '&') {
            return acc
          }
          acc[acc.length - 1].push(token)
          return acc
        },
        [[]],
      )
      .map((group) => Tags(...group))
      .reduce<Where<any> | undefined>((acc, groupedTags) => {
        if (acc === undefined) {
          return groupedTags
        }
        return acc.or(groupedTags)
      }, undefined) || Tag('undefined')
  )
}
export const mkFishId = (fishData: FishMessage): FishId =>
  FishId.of(fishData.fishIdType, fishData.fishIdName, +fishData.fishIdVersion)

export const mkFish = (fishData: FishMessage, node: Node): Fish<any, any> => ({
  fishId: mkFishId(fishData),
  initialState: JSON.parse(fishData.initState),
  where: compileTags(fishData.where, node),
  onEvent: mkOnEventFn(fishData.onEvent, node),
})

export const mkOnEventFn = (onEvent: string, node: Node) => {
  try {
    return new Function(
      '__inState__',
      '__inEvent__',
      '__inMetadata__',
      `try{ return (${onEvent})(__inState__, __inEvent__, __inMetadata__) } catch {return __inState__}`,
    ) as Reduce<any, any>
  } catch (e) {
    node.warn(e)

    return (state: any) => state
  }
}
