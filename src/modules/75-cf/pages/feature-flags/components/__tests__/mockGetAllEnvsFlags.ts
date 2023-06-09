/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export default {
  itemCount: 3,
  pageCount: 3,
  pageIndex: 0,
  pageSize: 100,
  environments: {
    Env_Prod1: {
      name: 'Env Prod1'
    },
    Env_Prod3: {
      name: 'Env Prod3'
    },
    QA1: {
      name: 'QA1'
    },
    QA2: {
      name: 'QA2'
    },
    Test_Environment_1: {
      name: 'Test Environment 1'
    },
    Test_Environment_2: {
      name: 'Test Environment 2'
    },
    Test_Environment_3: {
      name: 'Test Environment 3'
    },
    Test_Environment_4: {
      name: 'Test Environment 4'
    },
    Test_Environment_5: {
      name: 'Test Environment 5'
    },
    Test_Environment_6: {
      name: 'Test Environment 6'
    }
  },
  flags: [
    {
      createdAt: 1619223188494,
      description: 'Toggle the new feature on/off',
      environments: {
        Env_Prod1: {
          enabled: false
        },
        Env_Prod3: {
          enabled: true
        },
        QA1: {
          enabled: true
        },
        QA2: {
          enabled: false
        },
        Test_Environment_1: {
          enabled: true
        },
        Test_Environment_2: {
          enabled: true
        },
        Test_Environment_3: {
          enabled: true
        },
        Test_Environment_4: {
          enabled: true
        },
        Test_Environment_5: {
          enabled: true
        },
        Test_Environment_6: {
          enabled: true
        }
      },
      identifier: 'Great_New_Feature',
      name: 'Great New Feature'
    },
    {
      createdAt: 1679350589486,
      description:
        'Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups',
      environments: {
        Env_Prod1: {
          enabled: false
        },
        Env_Prod3: {
          enabled: true
        },
        QA1: {
          enabled: false
        },
        QA2: {
          enabled: false
        },
        Test_Environment_1: {
          enabled: false
        },
        Test_Environment_2: {
          enabled: false
        },
        Test_Environment_3: {
          enabled: false
        },
        Test_Environment_4: {
          enabled: false
        },
        Test_Environment_5: {
          enabled: false
        },
        Test_Environment_6: {
          enabled: false
        }
      },
      identifier: 'Trial_Mode',
      name: 'Trial Mode X'
    },
    {
      createdAt: 1679350545742,
      description: '',
      environments: {
        Env_Prod1: {
          enabled: true
        },
        Env_Prod3: {
          enabled: true
        },
        QA1: {
          enabled: true
        },
        QA2: {
          enabled: false
        },
        Test_Environment_1: {
          enabled: true
        },
        Test_Environment_2: {
          enabled: false
        },
        Test_Environment_3: {
          enabled: true
        },
        Test_Environment_4: {
          enabled: false
        },
        Test_Environment_5: {
          enabled: true
        },
        Test_Environment_6: {
          enabled: true
        }
      },
      identifier: 'Dark_Mode',
      name: 'Dark Mode'
    }
  ]
}
