/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { DeployStageErrorProvider } from '@pipeline/context/StageErrorContext'
import { PipelineStage } from '@pipeline/components/PipelineStages/PipelineStage'
import BuildStageSetupShell from '@modules/75-ci/components/PipelineStudio/BuildStageSetupShell/BuildStageSetupShell'
import { IDPStageMinimalMode } from './IDPStageMinimalMode'

export class IDPStage extends PipelineStage {
  render(): JSX.Element {
    const { minimal, stageProps } = this.props
    if (minimal) {
      return <IDPStageMinimalMode {...stageProps} />
    }
    return (
      <DeployStageErrorProvider>
        <BuildStageSetupShell moduleIcon="idp" />
      </DeployStageErrorProvider>
    )
  }
}
