import { Node, NodeDef } from 'node-red'
import { EditorNodeProperties } from 'node-red'

export interface ActyxFishNodeDef extends NodeDef, ActyxFishOptions {}

// export interface FishNode extends Node {}
export type ActyxFishNode = Node

export interface FishMessage {
  fishIdType: string
  fishIdName: string
  fishIdVersion: number
  initState: any
  where: string
  onEvent: string
}

export interface ActyxFishOptions extends FishMessage {
  syntax: 'javascript' | 'text'
}

export interface ActyxFishEditorNodeProperties
  extends EditorNodeProperties,
    ActyxFishOptions {}
