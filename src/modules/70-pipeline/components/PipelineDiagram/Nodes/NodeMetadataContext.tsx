/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, {
  createContext,
  PropsWithChildren,
  ReactElement,
  useContext,
  useState,
  useCallback,
  ReactNode
} from 'react'
import { uniqBy } from 'lodash-es'
import type { StepType } from '@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraphUtil'

export interface NodeStateMetadata {
  dotNotationPath: string
  relativeBasePath: string
  nodeType?: StepType
}

interface NodeMetadataContextInterface {
  stepsDotNotationPaths: NodeStateMetadata[]
  setStepsDotNotationPaths: (dotNotationPaths: NodeStateMetadata[]) => void
  removeStepByDotNotationPath: (dotNotationPath: string) => void
  baseCreateNodeRelativePath: string
  updateBaseCreateNodeRelativePath: (relativeBasePath: string) => void
  resetStepsDotNotationPath: () => void
}

const NodeMetadataContext = createContext<NodeMetadataContextInterface | undefined>(undefined)

export function NodeMetadataProvider({ children }: PropsWithChildren<ReactNode>): ReactElement {
  const [stepsDotNotationPaths, setStepsDotNotationPaths] = useState<NodeStateMetadata[]>([])
  const [baseCreateNodeRelativePath, setBaseCreateNodeRelativePath] = useState<string>('')

  const updateStepsDotNotationPaths = useCallback((newValues: NodeStateMetadata[]) => {
    setStepsDotNotationPaths(prevValues => uniqBy([...prevValues, ...newValues], 'dotNotationPath'))
  }, [])

  const removeStepByDotNotationPath = useCallback((dotNotationPathToRemove: string) => {
    setStepsDotNotationPaths(prevValues => {
      return prevValues.filter(node => !node.dotNotationPath.includes(dotNotationPathToRemove))
    })
  }, [])

  const resetStepsDotNotationPath = (): void => {
    setStepsDotNotationPaths([])
  }

  const updateBaseCreateNodeRelativePath = useCallback((relativeBasePath: string) => {
    setBaseCreateNodeRelativePath(relativeBasePath)
  }, [])

  const contextValue: NodeMetadataContextInterface = {
    stepsDotNotationPaths,
    setStepsDotNotationPaths: updateStepsDotNotationPaths,
    removeStepByDotNotationPath,
    baseCreateNodeRelativePath,
    updateBaseCreateNodeRelativePath,
    resetStepsDotNotationPath
  }

  return <NodeMetadataContext.Provider value={contextValue}>{children}</NodeMetadataContext.Provider>
}

export function useNodeMetadata(): NodeMetadataContextInterface {
  const context = useContext(NodeMetadataContext)
  if (!context) {
    throw new Error('useNodeMetadata must be used within a NodeMetadataProvider')
  }
  return context
}
