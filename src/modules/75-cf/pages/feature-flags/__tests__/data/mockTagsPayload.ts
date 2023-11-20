import type { Tag } from 'services/cf'

const mockTagsPayload = {
  itemCount: 7,
  pageCount: 1,
  pageIndex: 0,
  pageSize: 100,
  tags: [
    { identifier: 'tag_1', name: 'tag1' },
    { identifier: 'tag_2', name: 'tag2' },
    { identifier: 'tag_3', name: 'tag3' },
    { identifier: 'tag_4', name: 'tag4' },
    { identifier: 'tag_5', name: 'tag5' },
    { identifier: 'tag_6', name: 'tag6' },
    { identifier: 'tag_7', name: 'tag7' }
  ]
}

export function generateTags(numOfTags: number): Tag[] {
  const tags = []
  for (let i = 0; i <= numOfTags; i++) {
    tags.push({ name: `tag${i}`, identifier: `tag_${i}` })
  }
  return tags
}

export default mockTagsPayload
