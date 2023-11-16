/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useRef, forwardRef } from 'react'
import cx from 'classnames'
import ReactMonacoEditor from 'react-monaco-editor'
import type { editor } from 'monaco-editor'
import type { MonacoEditorProps, EditorWillMount, EditorDidMount, ChangeHandler } from 'react-monaco-editor'
import { setForwardedRef, suppressHotJarRecording } from '@common/utils/utils'

import styles from './MonacoEditor.module.scss'

export type MonacoCodeEditorRef = editor.IStandaloneCodeEditor

export interface ExtendedMonacoEditorProps extends MonacoEditorProps {
  name?: string
  setLineCount?: (line: number) => void
  'data-testid'?: string
}

const MonacoEditor = forwardRef<MonacoCodeEditorRef, ExtendedMonacoEditorProps>((props, ref) => {
  const _ref = useRef<MonacoCodeEditorRef | null>(null)

  const editorWillMount: EditorWillMount = monaco => {
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
      model.setEOL(monaco.editor.EndOfLineSequence.LF)
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

  const theme = props.theme || props.options?.theme || 'vs'

  const options: MonacoEditorProps['options'] = {
    ...props.options,
    theme,
    extraEditorClassName: cx(props.className, styles.editor, {
      [styles.disabled]: props.options?.readOnly && theme !== 'vs-dark'
    })
  }

  return (
    <ReactMonacoEditor
      {...props}
      options={options}
      editorWillMount={editorWillMount}
      editorDidMount={editorDidMount}
      onChange={onChange}
    />
  )
})
MonacoEditor.displayName = 'MonacoEditor'

export default MonacoEditor
