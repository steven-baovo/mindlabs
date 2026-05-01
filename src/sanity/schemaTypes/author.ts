import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'author',
  title: 'Tác giả',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Tên tác giả',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      title: 'Đường dẫn',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
    }),
    defineField({
      name: 'image',
      title: 'Ảnh đại diện',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'bio',
      title: 'Tiểu sử',
      type: 'array',
      of: [
        {
          title: 'Block',
          type: 'block',
          styles: [{title: 'Normal', value: 'normal'}],
          lists: [],
        },
      ],
    }),
  ],
})
