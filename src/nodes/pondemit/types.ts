import { Node, NodeDef } from 'node-red'

export interface PondEmitOptions {
  // node options
  tags: string
}

export interface PondEmitNodeDef extends NodeDef, PondEmitOptions {}

// export interface PondEmitNode extends Node {}
export type PondEmitNode = Node
