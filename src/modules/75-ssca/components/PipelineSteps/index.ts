/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { CdSscaOrchestrationStep } from './CdSscaOrchestrationStep/CdSscaOrchestrationStep'
import { CiSscaOrchestrationStep } from './CiSscaOrchestrationStep/CiSscaOrchestrationStep'
import { CiSscaEnforcementStep } from './CiSscaEnforcementStep/CiSscaEnforcementStep'
import { CdSscaEnforcementStep } from './CdSscaEnforcementStep/CdSscaEnforcementStep'

factory.registerStep(new CiSscaOrchestrationStep())
factory.registerStep(new CdSscaOrchestrationStep())
factory.registerStep(new CiSscaEnforcementStep())
factory.registerStep(new CdSscaEnforcementStep())
