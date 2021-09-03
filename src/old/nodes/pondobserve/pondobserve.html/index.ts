import { EditorNodeProperties, EditorRED } from 'node-red'
import { defaultFish } from '../../pondLib/defaultFish'
import { PondObserveOptions } from '../types'

declare const RED: EditorRED

interface PondObserveEditorNodeProperties
  extends EditorNodeProperties,
    PondObserveOptions {
  onEventEditor?: AceAjax.Editor
}

RED.nodes.registerType<PondObserveEditorNodeProperties>('pondobserve', {
  category: 'Actyx Pond',
  color: '#F3B567',
  defaults: {
    name: { value: '' },
    pond: { type: 'pond-config', value: '' },
    ...defaultFish,
    syntax: { value: 'javascript' },
  },
  inputs: 0,
  outputs: 1,
  icon: 'pond.png',
  paletteLabel: 'Pond Observe',
  label: function () {
    return this.name || 'pond observe'
  },
  oneditprepare: function () {
    if (!this.syntax) {
      this.syntax = 'javascript'
      $('#node-input-syntax').val(this.syntax)
    }
    this.onEventEditor = RED.editor.createEditor({
      id: 'node-input-onEvent-editor',
      mode: 'ace/mode/javascript',
      value: $('#node-input-onEvent').val()?.toString() || '',
    })

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const node = this
    $('#node-input-format').on('change', () => {
      const mod = 'ace/mode/' + $('#node-input-format').val()
      node.onEventEditor
        ?.getSession()
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .setMode({
          path: mod,
          v: Date.now(),
        })
    })

    $('#node-input-initState').typedInput({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      type: 'json',
      types: ['json'],
    })
  },
  oneditsave: function () {
    $('#node-input-onEvent').val(this.onEventEditor?.getValue() || '')
    this.onEventEditor?.destroy()
    delete this.onEventEditor
  },
  oneditcancel: function () {
    this.onEventEditor?.destroy()
    delete this.onEventEditor
  },
  //   oneditresize: function(size) {
  //     var rows = $("#dialog-form>div:not(.node-text-editor-row)");
  //     var height = $("#dialog-form").height();
  //     for (var i=0; i<rows.length; i++) {
  //         height -= $(rows[i]).outerHeight(true);
  //     }
  //     var editorRow = $("#dialog-form>div.node-text-editor-row");
  //     height -= (parseInt(editorRow.css("marginTop"))+parseInt(editorRow.css("marginBottom")));
  //     $(".node-text-editor").css("height",height+"px");
  //     this.editor.resize();
  // }
})
