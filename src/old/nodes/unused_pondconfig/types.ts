import { Node, NodeDef } from 'node-red'

export interface PondConfigNodeDef extends NodeDef, PondConfigOptions {}

export interface PondConfigOptions {
  pondVersion: string
  appid: string
  displayname: string
  version: string
  signature?: string
}

// export interface PondVersionNode extends Node {}
export type PondConfigNode = Node & PondConfigOptions
