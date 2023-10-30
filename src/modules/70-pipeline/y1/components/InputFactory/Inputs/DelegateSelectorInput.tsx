import React from 'react'
import { useParams } from 'react-router-dom'
import MultiTypeDelegateSelector from '@common/components/MultiTypeDelegateSelector/MultiTypeDelegateSelector'
import { ProjectPathProps } from '@modules/10-common/interfaces/RouteInterfaces'
import { DerivedInputType } from '../InputComponentType'
import { InputComponent, InputProps } from '../InputComponent'
import { InputsFormValues } from '../../InputsForm/InputsForm'
import css from './inputs.module.scss'

function DelegateSelectorInputInternal(props: InputProps<InputsFormValues>): JSX.Element {
  const { allowableTypes, readonly, path } = props
  const { projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  return (
    <MultiTypeDelegateSelector
      name={path}
      disabled={readonly}
      inputProps={{ projectIdentifier, orgIdentifier, wrapperClassName: css.delegateSelectorWrapper }}
      expressions={[]}
      allowableTypes={allowableTypes}
    />
  )
}

export class DelegateSelectorInput extends InputComponent<InputsFormValues> {
  public internalType = DerivedInputType.delegate_selector

  constructor() {
    super()
  }

  renderComponent(props: InputProps<InputsFormValues>): JSX.Element {
    return <DelegateSelectorInputInternal {...props} />
  }
}
