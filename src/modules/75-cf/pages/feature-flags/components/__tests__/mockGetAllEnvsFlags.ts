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
        }
      },
      identifier: 'Dark_Mode',
      name: 'Dark Mode'
    }
  ]
}
