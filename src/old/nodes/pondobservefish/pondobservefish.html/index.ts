import { EditorRED } from 'node-red'
import { PondObserveFishEditorNodeProperties } from '../types'

declare const RED: EditorRED

RED.nodes.registerType<PondObserveFishEditorNodeProperties>('pondobservefish', {
  category: 'Actyx Pond',
  color: '#F3B567',
  defaults: {
    name: { value: '' },
    pond: { type: 'pond-config', value: '' },
  },
  inputs: 1,
  outputs: 1,
  icon: 'pond.png',
  paletteLabel: 'Pond observe fish',
  label: function () {
    return this.name || 'Pond observe fish'
  },
})
