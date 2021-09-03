import { EditorNodeProperties, Node, NodeDef } from 'node-red'

export interface PondObserveNodeDef extends NodeDef, PondObserveFishOptions {}

export interface PondObserveFishOptions {
  pond: string
}

export interface PondObserveFishNodeDef
  extends NodeDef,
    PondObserveFishOptions {}

// export interface PondObserveFishNode extends Node {}
export type PondObserveFishNode = Node

export interface PondObserveFishEditorNodeProperties
  extends EditorNodeProperties,
    PondObserveFishOptions {}
