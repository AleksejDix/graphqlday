import speakerPictureFields from '@/fragments/speakerPictureFields'

const speakersFields = `
  id
  name
  talks {
    id
    name
  }
  speakerPicture {
    ${speakerPictureFields}
  }
`
export default speakersFields
