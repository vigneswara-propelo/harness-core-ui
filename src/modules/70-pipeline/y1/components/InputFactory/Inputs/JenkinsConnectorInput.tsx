import React from 'react'
import { useParams } from 'react-router-dom'
import { FormMultiTypeConnectorField } from '@platform/connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { useQueryParams } from '@common/hooks'
import { InputsFormValues } from '../../InputsForm/InputsForm'
import { InputComponent, InputProps } from '../InputComponent'
import { DerivedInputType } from '../InputComponentType'

function JenkinsConnectorInputInternal(props: InputProps<InputsFormValues>): JSX.Element {
  const { allowableTypes, readonly, path, input } = props
  const { label = '' } = input
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  return (
    <FormMultiTypeConnectorField
      name={path}
      label={label}
      placeholder={getString('common.entityPlaceholderText')}
      accountIdentifier={accountId}
      projectIdentifier={projectIdentifier}
      orgIdentifier={orgIdentifier}
      width="100%"
      setRefValue
      disabled={readonly}
      enableConfigureOptions={false}
      multiTypeProps={{
        allowableTypes,
        expressions: []
      }}
      configureOptionsProps={{
        isExecutionTimeFieldDisabled: false // TODO: this boolean should be dynamic
      }}
      type="Jenkins"
      gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
    />
  )
}

export class JenkinsConnectorInput extends InputComponent<InputsFormValues> {
  public internalType = DerivedInputType.jenkins_connector

  constructor() {
    super()
  }

  renderComponent(props: InputProps<InputsFormValues>): JSX.Element {
    return <JenkinsConnectorInputInternal {...props} />
  }
}
