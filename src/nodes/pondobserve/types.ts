import { Node, NodeDef } from 'node-red'

export interface PondObserveNodeDef extends NodeDef, PondObserveOptions {}

export interface PondObserveOptions {
  fishIdType: string
  fishIdName: string
  fishIdVersion: number
  initState: any
  where: string
  onEvent: string
  syntax: 'javascript' | 'text'
}

// export interface PondobserveNode extends Node {}
export type PondObserveNode = Node
