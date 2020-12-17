import { EditorNodeProperties, EditorRED } from 'node-red'
import { PondEmitOptions } from '../types'
declare const RED: EditorRED

interface PondEmitEditorNodeProperties
  extends EditorNodeProperties,
    PondEmitOptions {}

RED.nodes.registerType<PondEmitEditorNodeProperties>('pondemit', {
  category: 'Actyx Pond',
  color: '#F3B567',
  defaults: {
    name: { value: '' },
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
