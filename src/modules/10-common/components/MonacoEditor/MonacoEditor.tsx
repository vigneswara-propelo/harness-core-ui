/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useRef, forwardRef } from 'react'
import ReactMonacoEditor from 'react-monaco-editor'
import type { editor } from 'monaco-editor'
import type { MonacoEditorProps, EditorWillMount, EditorDidMount, ChangeHandler } from 'react-monaco-editor'
import { setForwardedRef, suppressHotJarRecording } from '@common/utils/utils'

export type MonacoCodeEditorRef = editor.IStandaloneCodeEditor

export interface ExtendedMonacoEditorProps extends MonacoEditorProps {
  name?: string
  setLineCount?: (line: number) => void
  'data-testid'?: string
  alwaysShowDarkTheme?: boolean
}

const MonacoEditor = forwardRef<MonacoCodeEditorRef, ExtendedMonacoEditorProps>((props, ref) => {
  const _ref = useRef<MonacoCodeEditorRef | null>(null)

  const editorWillMount: EditorWillMount = monaco => {
    monaco?.editor?.defineTheme('disable-theme', {
      base: 'vs',
      inherit: true,
      rules: [{ background: 'f3f3fa', token: '' }],
      colors: {
        'editor.background': '#f3f3fa'
      }
    })

    // Don't allow HotJar to record content in Yaml/Code editor(s)
    suppressHotJarRecording([...document.querySelectorAll('.react-monaco-editor-container')])

    props.editorWillMount?.(monaco)
  }

  const editorDidMount: EditorDidMount = (editor, monaco) => {
    _ref.current = editor
    setForwardedRef(ref, editor)

    const model = editor.getModel()
    if (model) {
      props.setLineCount?.(model.getLineCount())
    }

    const remeasureFonts = (): void => monaco?.editor?.remeasureFonts()
    const loaded = document.fonts.check('1em Roboto Mono')

    if (loaded) {
      remeasureFonts()
    } else {
      document.fonts.ready.then(remeasureFonts)
    }

    props.editorDidMount?.(editor, monaco)
  }

  const onChange: ChangeHandler = (value, event) => {
    const model = _ref.current?.getModel()
    if (model) {
      props.setLineCount?.(model.getLineCount())
    }

    props.onChange?.(value, event)
  }

  const theme = props.alwaysShowDarkTheme ? 'vs-dark' : props.options?.readOnly ? 'disable-theme' : 'vs'

  return (
    <ReactMonacoEditor
      {...props}
      theme={theme}
      editorWillMount={editorWillMount}
      editorDidMount={editorDidMount}
      onChange={onChange}
    />
  )
})
MonacoEditor.displayName = 'MonacoEditor'

export default MonacoEditor
