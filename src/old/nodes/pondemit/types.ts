import { Node, NodeDef } from 'node-red'

export interface PondEmitOptions {
  tags: string
  pond: string
}

export interface PondEmitNodeDef extends NodeDef, PondEmitOptions {}

export type PondEmitNode = Node

export interface PondConfigNodeDef extends NodeDef, PondConfigOptions {}

export interface PondConfigOptions {
  pondVersion: string
  appid: string
  displayname: string
  version: string
  signature?: string
}

export type PondConfigNode = Node & PondConfigOptions
