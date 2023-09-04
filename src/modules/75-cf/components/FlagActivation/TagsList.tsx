import React, { FC } from 'react'
import { Container, Heading, Layout, Tag, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { Tag as TagInterface } from 'services/cf'
import css from './TagsList.module.scss'

export interface TagsListProps {
  tags?: TagInterface[]
}

const TagsList: FC<TagsListProps> = ({ tags = [] }) => {
  const { getString } = useStrings()
  return (
    <Container padding={{ top: 'medium', bottom: 'medium' }}>
      <Heading level={5} font={{ variation: FontVariation.H5 }}>
        {getString('tagsLabel')}
      </Heading>
      <Layout.Horizontal
        className={css.tagsContainer}
        flex={{ alignItems: 'start', justifyContent: 'flex-start' }}
        spacing="xsmall"
      >
        {tags.length ? (
          tags.map((tag, idx) => {
            return (
              <Tag className={css.displayTags} key={idx}>
                {tag.name}
              </Tag>
            )
          })
        ) : (
          <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.GREY_500}>
            {getString('cf.featureFlags.tagging.emptyState')}
          </Text>
        )}
      </Layout.Horizontal>
    </Container>
  )
}

export default TagsList
