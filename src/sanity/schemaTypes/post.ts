import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'post',
  title: 'Bài viết',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tiêu đề',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      title: 'Đường dẫn (URL)',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
    }),
    defineField({
      name: 'author',
      title: 'Tác giả',
      type: 'reference',
      to: {type: 'author'},
    }),
    defineField({
      name: 'mainImage',
      title: 'Ảnh đại diện',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'categories',
      title: 'Danh mục',
      type: 'array',
      of: [{type: 'reference', to: {type: 'category'}}],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Ngày đăng',
      type: 'datetime',
    }),
    defineField({
      name: 'excerpt',
      title: 'Tóm tắt',
      type: 'text',
    }),
    defineField({
      name: 'body',
      title: 'Nội dung chi tiết',
      type: 'array',
      of: [{type: 'block'}, {type: 'image'}],
    }),
  ],
})
