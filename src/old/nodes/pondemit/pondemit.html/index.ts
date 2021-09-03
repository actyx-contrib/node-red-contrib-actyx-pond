import { EditorNodeProperties, EditorRED } from 'node-red'
import { PondEmitOptions } from '../types'
import { PondConfigOptions } from '../types'
// import { valid } from 'semver'
declare const RED: EditorRED

interface PondEmitEditorNodeProperties
  extends EditorNodeProperties,
    PondEmitOptions {
  pond: string
}

RED.nodes.registerType<PondEmitEditorNodeProperties>('pondemit', {
  category: 'Actyx Pond',
  color: '#F3B567',
  defaults: {
    name: { value: '' },
    pond: { type: 'pond-config', value: '' },
    tags: { value: 'something something:{{id}}', required: true },
  },
  inputs: 1,
  outputs: 1,
  align: 'right',
  icon: 'pond.png',
  paletteLabel: 'Pond Emit',
  inputLabels: 'payload to send',
  outputLabels: ['send payload'],

  label: function () {
    return this.name || 'pond emit'
  },
})

interface PondVersionEditorNodeProperties
  extends EditorNodeProperties,
    PondConfigOptions {}

RED.nodes.registerType<PondVersionEditorNodeProperties>('pond-config', {
  category: 'config',
  defaults: {
    name: { value: 'pond config' },
    pondVersion: {
      value: 'v3',
      required: true,
    },
    appid: {
      value: 'com.example.node-red',
      required: true,
    },
    displayname: {
      value: 'Node Red',
      required: true,
    },
    version: {
      value: '0.0.1',
      required: true,
      validate: (value: unknown) =>
        typeof value === 'string' /* && valid(value) !== null */,
    },
    signature: {
      value: '',
    },
  },
  label: function () {
    return this.pondVersion + ' - ' + this.appid
  },
})
