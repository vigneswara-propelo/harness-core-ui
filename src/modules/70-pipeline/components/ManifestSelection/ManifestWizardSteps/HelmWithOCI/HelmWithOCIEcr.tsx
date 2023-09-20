import React from 'react'
import { Formik, FormikProps } from 'formik'
import { noop } from 'lodash-es'
import { GroupedThumbnailSelect, IconName } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { OciHelmTypes } from '../ManifestUtils'

interface OciHelmItem {
  label: string
  icon: IconName
  value: string
  disabled?: boolean
}
export interface OciHelmGroup {
  groupLabel: string
  items: OciHelmItem[]
  disabled?: boolean
}

interface SelectOciHelmConnectorTypeProps {
  selectedConnectorType?: string
  onChange: (deploymentType: string | undefined) => void
  isReadonly: boolean
}

export function SelectOciHelmConnector(props: SelectOciHelmConnectorTypeProps): JSX.Element {
  const { selectedConnectorType, onChange, isReadonly } = props
  const { getString } = useStrings()

  const ociHelmGroups: OciHelmGroup[] = [
    {
      groupLabel: getString('pipelineSteps.deploy.infrastructure.directConnection'),
      items: [
        {
          label: getString('pipeline.manifestType.ociHelmConnectorLabel'),
          icon: 'helm-oci',
          value: OciHelmTypes.Generic
        }
      ]
    },
    {
      groupLabel: getString('pipelineSteps.deploy.infrastructure.viaCloudProvider'),
      items: [
        {
          label: getString('platform.connectors.ECR.name'),
          icon: 'ecr-step',
          value: OciHelmTypes.Ecr
        }
      ]
    }
  ]

  const formikRef = React.useRef<FormikProps<unknown> | null>(null)

  const filteredOciHelmGroups = ociHelmGroups.filter(item => !item.disabled)

  return (
    <Formik<{
      config?: {
        type?: string
      }
    }>
      onSubmit={noop}
      initialValues={{
        config: {
          type: selectedConnectorType
        }
      }}
      enableReinitialize
    >
      {formik => {
        formikRef.current = formik as FormikProps<unknown> | null
        return (
          <GroupedThumbnailSelect
            name={'config.type'}
            onChange={values => {
              onChange(values)
            }}
            groups={filteredOciHelmGroups}
            isReadonly={isReadonly}
          />
        )
      }}
    </Formik>
  )
}
