/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const mockAuditEventActions = {
  status: 'SUCCESS',
  data: {
    itemCount: 6,
    pageCount: 1,
    pageIndex: 0,
    pageSize: 15,
    auditTrails: [
      {
        action: 'FeatureActivationRestored',
        actor: 'username',
        comment: '',
        environment: 'mock environment',
        executedOn: 1688120357950,
        instructionSet: [],
        objectAfter: '92dd744f-11ae-48a5-8b64-06d47ae2929d',
        objectBefore: '8f2bdd17-0702-401e-b878-185636b4f4f9',
        objectIdentifier: 'f1f2a05f-82e8-4a1e-bff7-c77f3385ac6b',
        objectType: 'FeatureActivation',
        project: 'mock project',
        status: 'Success'
      },
      {
        action: 'FeatureActivationArchived',
        actor: 'username',
        comment: '',
        environment: 'mock environment',
        executedOn: 1688120344487,
        instructionSet: [],
        objectAfter: '8f2bdd17-0702-401e-b878-185636b4f4f9',
        objectBefore: 'e3a7ebdb-6092-4928-b77f-eee95a008b42',
        objectIdentifier: 'f1f2a05f-82e8-4a1e-bff7-c77f3385ac6b',
        objectType: 'FeatureActivation',
        project: 'mock project',
        status: 'Success'
      },
      {
        action: 'FeatureActivationCreated',
        actor: 'SYSTEM',
        comment: '',
        environment: 'mock environment',
        executedOn: 1687521731880,
        instructionSet: [],
        objectAfter: '3b56a6eb-43ac-4300-98c0-2a19d9acf8fa',
        objectBefore: '00000000-0000-0000-0000-000000000000',
        objectIdentifier: 'aedbafe8-af3f-4350-b498-f775458819e6',
        objectType: 'FeatureActivation',
        project: 'mock project',
        status: 'Success'
      },
      {
        action: 'FeatureActivationPatched',
        actor: 'username',
        comment: '',
        environment: 'mock environment',
        executedOn: 1688123644643,
        instructionSet: [
          {
            Kind: 'addTargetsToVariationTargetMap',
            Parameters: {
              accountID: 'zEaak-FLS425IEO7OLzMUg',
              organizationIdentifier: 'default',
              projectIdentifier: 'crystalnew1',
              targets: ['target1'],
              variation: 'true'
            }
          }
        ],
        objectAfter: '9704b03f-fb5d-4aed-bd8d-41ea7cf4482e',
        objectBefore: 'b6439def-a1ae-41ed-9c10-910ccf28b704',
        objectIdentifier: 'f1f2a05f-82e8-4a1e-bff7-c77f3385ac6b',
        objectType: 'FeatureActivation',
        project: 'mock project',
        status: 'Success'
      },
      {
        action: 'SegmentCreated',
        actor: 'username',
        comment: '',
        environment: 'mock environment',
        executedOn: 1662481077742,
        instructionSet: [],
        objectAfter: 'de77dcc7-0c65-4c18-a1ec-84e83e86e03c',
        objectBefore: 'd0456d79-be0c-4686-acda-29a422b57739',
        objectIdentifier: 'b5685687-25ad-4d73-9194-50202285d128',
        objectType: 'FeatureActivation',
        project: 'mock project',
        status: 'Success'
      }
    ]
  }
}
