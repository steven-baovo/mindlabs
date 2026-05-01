import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'category',
  title: 'Danh mục',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tên danh mục',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Mô tả',
      type: 'text',
    }),
  ],
})
