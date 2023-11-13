import { get } from 'lodash-es'
import { AllActions } from '@modules/70-pipeline/components/PipelineSteps/AdvancedSteps/FailureStrategyPanel/utils'
import { ErrorType, FailureErrorType, StrategyType } from '@modules/70-pipeline/utils/FailureStrategyUtils'
import { ProceedWithDefaultValuesFailureActionConfig, StepGroupFailureActionConfig } from 'services/pipeline-ng'

export type FailureErrorTypeY1 = ValueOf<typeof FailureErrorTypeY1>
export const FailureErrorTypeY1 = {
  all: 'all',
  authentication: 'authentication',
  connectivity: 'connectivity',
  timeout: 'timeout',
  authorization: 'authorization',
  verification: 'verification',
  'delegate-provisioning': 'delegate-provisioning',
  unknown: 'unknown',
  'policy-evaluation': 'policy-evaluation',
  'input-timeout': 'input-timeout',
  'approval-rejection': 'approval-rejection',
  'delegate-restart': 'delegate-restart',
  'user-mark-fail': 'user-mark-fail'
} as const

const FailureErrorTypeVsFailureErrorTypeY1: Record<FailureErrorType, FailureErrorTypeY1> = {
  AllErrors: FailureErrorTypeY1.all,
  Authentication: FailureErrorTypeY1.authentication,
  Connectivity: FailureErrorTypeY1.connectivity,
  Timeout: FailureErrorTypeY1.timeout,
  Authorization: FailureErrorTypeY1.authorization,
  Verification: FailureErrorTypeY1.verification,
  DelegateProvisioning: FailureErrorTypeY1['delegate-provisioning'],
  Unknown: FailureErrorTypeY1.unknown,
  PolicyEvaluationFailure: FailureErrorTypeY1['policy-evaluation'],
  InputTimeoutError: FailureErrorTypeY1['input-timeout'],
  ApprovalRejection: FailureErrorTypeY1['approval-rejection'],
  DelegateRestart: FailureErrorTypeY1['delegate-restart'],
  UserMarkedFailure: FailureErrorTypeY1['user-mark-fail']
}

const FailureErrorTypeY1VsFailureErrorType: Record<FailureErrorTypeY1, FailureErrorType> = {
  all: ErrorType.AllErrors,
  authentication: ErrorType.Authentication,
  connectivity: ErrorType.Connectivity,
  timeout: ErrorType.Timeout,
  authorization: ErrorType.Authorization,
  verification: ErrorType.Verification,
  'delegate-provisioning': ErrorType.DelegateProvisioning,
  unknown: ErrorType.Unknown,
  'policy-evaluation': ErrorType.PolicyEvaluationFailure,
  'input-timeout': ErrorType.InputTimeoutError,
  'approval-rejection': ErrorType.ApprovalRejection,
  'delegate-restart': ErrorType.DelegateRestart,
  'user-mark-fail': ErrorType.UserMarkedFailure
}

export type StrategyTypeY1 = ValueOf<typeof StrategyTypeY1>
export const StrategyTypeY1 = {
  ignore: 'ignore',
  abort: 'abort',
  'stage-rollback': 'stage-rollback',
  retry: 'retry',
  'manual-intervention': 'manual-intervention',
  success: 'success',
  'pipeline-rollback': 'pipeline-rollback',
  fail: 'fail',
  'retry-step-group': 'retry-step-group'
} as const

const StrategyTypeVsStrategyTypeY1: Record<
  Exclude<StrategyType, 'ProceedWithDefaultValues' | 'StepGroupRollback'>,
  StrategyTypeY1
> = {
  Ignore: StrategyTypeY1.ignore,
  Abort: StrategyTypeY1.abort,
  StageRollback: StrategyTypeY1['stage-rollback'],
  Retry: StrategyTypeY1.retry,
  ManualIntervention: StrategyTypeY1['manual-intervention'],
  MarkAsSuccess: StrategyTypeY1.success,
  PipelineRollback: StrategyTypeY1['pipeline-rollback'],
  MarkAsFailure: StrategyTypeY1.fail,
  RetryStepGroup: StrategyTypeY1['retry-step-group']
}

const StrategyTypeY1VsStrategyType: Record<
  StrategyTypeY1,
  Exclude<StrategyType, 'ProceedWithDefaultValues' | 'StepGroupRollback'>
> = {
  ignore: 'Ignore',
  abort: 'Abort',
  'stage-rollback': 'StageRollback',
  retry: 'Retry',
  'manual-intervention': 'ManualIntervention',
  success: 'MarkAsSuccess',
  'pipeline-rollback': 'PipelineRollback',
  fail: 'MarkAsFailure',
  'retry-step-group': 'RetryStepGroup'
}

export type IgnoreActionY1 = {
  type: 'ignore'
}

export type AbortActionY1 = {
  type: 'abort'
}

export type StageRollbackActionY1 = {
  type: 'stage-rollback'
}

export type RetryActionY1 = {
  type: 'retry'
  spec?: {
    attempts?: number
    interval?: string[]
    failure?: {
      action?: AllActionsY1
    }
  }
}

export type ManualInterventionActionY1 = {
  type: 'manual-intervention'
  spec?: {
    timeout?: string
    timeout_action?: AllActionsY1
  }
}

export type SuccessActionY1 = {
  type: 'success'
}

export type PipelineRollbackActionY1 = {
  type: 'pipeline-rollback'
}

export type FailActionY1 = {
  type: 'fail'
}

export type RetryStepGroupActionY1 = {
  type: 'retry-step-group'
  spec?: {
    attempts?: number
    interval?: string[]
  }
}

export type AllActionsY1 =
  | IgnoreActionY1
  | AbortActionY1
  | StageRollbackActionY1
  | RetryActionY1
  | ManualInterventionActionY1
  | SuccessActionY1
  | PipelineRollbackActionY1
  | FailActionY1
  | RetryStepGroupActionY1

export type FailureStrategyConfigY1 = {
  errors?: FailureErrorTypeY1[]
  action?: AllActionsY1
}

const toFailureErrorTypesY1 = (errors: FailureErrorType[] | undefined): FailureErrorTypeY1[] => {
  if (!Array.isArray(errors)) return []
  return errors.map(error => FailureErrorTypeVsFailureErrorTypeY1[error])
}

const toFailureErrorTypes = (errors: FailureErrorTypeY1[] | undefined): FailureErrorType[] => {
  if (!Array.isArray(errors)) return []
  return errors.map(error => FailureErrorTypeY1VsFailureErrorType[error])
}

const toFailureActionY1 = (
  action?: Exclude<AllActions, ProceedWithDefaultValuesFailureActionConfig | StepGroupFailureActionConfig>
): undefined | AllActionsY1 => {
  if (!action) return undefined
  const { type } = action
  const strategyTypeY1 = StrategyTypeVsStrategyTypeY1[type]

  switch (strategyTypeY1) {
    case StrategyTypeY1.ignore:
    case StrategyTypeY1.abort:
    case StrategyTypeY1['stage-rollback']:
    case StrategyTypeY1.success:
    case StrategyTypeY1['pipeline-rollback']:
    case StrategyTypeY1.fail:
      return {
        type: strategyTypeY1
      }
    case StrategyTypeY1['manual-intervention']:
      return {
        type: strategyTypeY1,
        spec: {
          timeout: get(action, 'spec.timeout'),
          timeout_action: toFailureActionY1(get(action, 'spec.onTimeout.action'))
        }
      }
    case StrategyTypeY1.retry:
      return {
        type: strategyTypeY1,
        spec: {
          attempts: get(action, 'spec.retryCount'),
          interval: get(action, 'spec.retryIntervals'),
          failure: { action: toFailureActionY1(get(action, 'spec.onRetryFailure.action')) }
        }
      }
    case StrategyTypeY1['retry-step-group']:
      return {
        type: strategyTypeY1,
        spec: {
          attempts: get(action, 'spec.retryCount'),
          interval: get(action, 'spec.retryIntervals')
        }
      }
  }
}

const toFailureAction = (
  actionY1?: AllActionsY1
): undefined | Exclude<AllActions, ProceedWithDefaultValuesFailureActionConfig | StepGroupFailureActionConfig> => {
  if (!actionY1) return undefined

  const { type } = actionY1
  const strategyType = StrategyTypeY1VsStrategyType[type]

  switch (strategyType) {
    case 'Ignore':
    case 'Abort':
    case 'StageRollback':
    case 'MarkAsSuccess':
    case 'PipelineRollback':
    case 'MarkAsFailure':
      return { type: strategyType }
    case 'ManualIntervention':
      return {
        type: strategyType,
        spec: {
          timeout: get(actionY1, 'spec.timeout'),
          onTimeout: {
            action: toFailureAction(get(actionY1, 'spec.timeout_action'))
          }
        }
      }
    case 'Retry':
      return {
        type: strategyType,
        spec: {
          retryCount: get(actionY1, 'spec.attempts'),
          retryIntervals: get(actionY1, 'spec.interval'),
          onRetryFailure: {
            action: toFailureAction(get(actionY1, 'spec.failure.action'))
          }
        }
      }
    case 'RetryStepGroup':
      return {
        type: strategyType,
        spec: {
          retryCount: get(actionY1, 'spec.attempts'),
          retryIntervals: get(actionY1, 'spec.interval')
        }
      }
  }
}

export type FailureStrategyConfig = {
  onFailure?: {
    action?: Exclude<AllActions, ProceedWithDefaultValuesFailureActionConfig | StepGroupFailureActionConfig>
    errors?: FailureErrorType[]
  }
}

const toFailureStrategyY1 = (failureStrategy: FailureStrategyConfig | undefined): FailureStrategyConfigY1 => {
  const { onFailure: { action, errors } = { action: undefined, errors: [] } } = failureStrategy ?? {}
  const failureStrategyY1: FailureStrategyConfigY1 = {
    errors: toFailureErrorTypesY1(errors),
    action: toFailureActionY1(action)
  }

  return failureStrategyY1
}

const toFailureStrategy = (failureStrategyY1: undefined | FailureStrategyConfigY1): FailureStrategyConfig => {
  const { errors, action } = failureStrategyY1 ?? {}
  const failureStrategy: FailureStrategyConfig = {
    onFailure: {
      errors: toFailureErrorTypes(errors),
      action: toFailureAction(action)
    }
  }

  return failureStrategy
}

export const toFailureStrategiesY1 = (
  failureStrategies: string | undefined | (FailureStrategyConfig | undefined)[]
): string | undefined | FailureStrategyConfigY1[] => {
  if (!Array.isArray(failureStrategies)) return failureStrategies

  return failureStrategies.map(toFailureStrategyY1)
}

export const toFailureStrategies = (
  failureStrategiesY1: string | undefined | (FailureStrategyConfigY1 | undefined)[]
): string | undefined | FailureStrategyConfig[] => {
  if (!Array.isArray(failureStrategiesY1)) return failureStrategiesY1

  return failureStrategiesY1.map(toFailureStrategy)
}
