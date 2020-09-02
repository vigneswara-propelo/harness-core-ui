import React, { useEffect, useRef, useState } from 'react'
import { Layout, Button, Formik, StepProps, FormInput, FormikForm as Form } from '@wings-software/uikit'
import { useParams } from 'react-router'
import * as Yup from 'yup'
import { StringUtils, useToaster } from 'modules/common/exports'
import { useValidateTheIdentifierIsUnique, ConnectorConfigDTO, ConnectorRequestDTO } from 'services/cd-ng'
import { getHeadingByType, getConnectorTextByType } from '../../../../pages/connectors/utils/ConnectorHelper'
import i18n from './ConnectorDetailsStep.i18n'
import css from './ConnectorDetailsStep.module.scss'

interface ConnectorDetailsStepProps extends StepProps<ConnectorRequestDTO> {
  type: ConnectorConfigDTO['type']
  name: string
  setFormData?: (formData: ConnectorRequestDTO) => void
  formData?: ConnectorRequestDTO
}

const ConnectorDetailsStep: React.FC<StepProps<ConnectorRequestDTO> & ConnectorDetailsStepProps> = props => {
  const { prevStepData, nextStep } = props
  const { showError } = useToaster()
  const { accountId, projectIdentifier, orgIdentifier } = useParams()
  const [stepData, setStepData] = useState<ConnectorRequestDTO>(props.formData || {})
  const { loading, data, refetch: validateUniqueIdentifier } = useValidateTheIdentifierIsUnique({
    accountIdentifier: accountId,
    lazy: true,
    queryParams: { orgIdentifier: orgIdentifier, projectIdentifier: projectIdentifier }
  })
  const mounted = useRef(false)
  useEffect(() => {
    if (mounted.current && !loading) {
      if (data?.data) {
        nextStep?.({ ...prevStepData, ...stepData })
      } else {
        showError(i18n.validateError)
      }
    } else {
      mounted.current = true
    }
  }, [mounted, loading, data])
  return (
    <Layout.Vertical spacing="xxlarge" className={css.firstep}>
      <div className={css.heading}>{getHeadingByType(props.type)}</div>
      <Formik
        initialValues={{
          name: props.formData?.name || '',
          description: props.formData?.description || '',
          identifier: props.formData?.identifier || '',
          tags: props.formData?.tags || []
        }}
        validationSchema={Yup.object().shape({
          name: Yup.string().trim().required(),
          identifier: Yup.string()
            .trim()
            .required()
            .matches(/^(?![0-9])[0-9a-zA-Z_$]*$/, 'Identifier can only contain alphanumerics, _ and $')
            .notOneOf(StringUtils.illegalIdentifiers),
          description: Yup.string()
        })}
        onSubmit={formData => {
          setStepData(formData)
          validateUniqueIdentifier({ queryParams: { connectorIdentifier: formData.identifier } })
          props.setFormData?.(formData)
        }}
      >
        {() => (
          <Form>
            <div className={css.connectorForm}>
              <FormInput.InputWithIdentifier inputLabel={`Give your ${getConnectorTextByType(props.type)} a name `} />
              <FormInput.TextArea label={i18n.description} name="description" />
              <FormInput.TagInput
                label={i18n.tags}
                name="tags"
                labelFor={name => (typeof name === 'string' ? name : '')}
                itemFromNewTag={newTag => newTag}
                items={[]}
                className={css.tags}
                tagInputProps={{
                  noInputBorder: true,
                  openOnKeyDown: false,
                  showAddTagButton: true,
                  showClearAllButton: true,
                  allowNewTag: true
                }}
              />
            </div>
            <Button type="submit" text={i18n.saveAndContinue} className={css.saveBtn} disabled={loading} />
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default ConnectorDetailsStep
