import type { AllowedTypes } from '@harness/uicore'
import type { InputSetData, StepViewType } from '@pipeline/components/AbstractSteps/Step'

export interface IACMApprovalData {
  name: string
  identifier: string
  timeout: string
}

export interface IACMApprovalStepProps {
  stepViewType: StepViewType
  isNewStep?: boolean
  initialValues: IACMApprovalData
  allowableTypes: AllowedTypes
  readonly?: boolean
  onUpdate?: (value: IACMApprovalData) => void
  onChange?: (value: IACMApprovalData) => void
}

export interface IACMApprovalTemplatizedProps {
  stepViewType: StepViewType
  initialValues: Partial<IACMApprovalData>
  onUpdate?: (value: IACMApprovalData) => void
  allowableTypes: AllowedTypes
  inputSetData?: InputSetData<IACMApprovalData>
  readonly?: boolean
}
