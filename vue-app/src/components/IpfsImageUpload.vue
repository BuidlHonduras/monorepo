<template>
  <form
    method="POST"
    enctype="multipart/form-data"
    @submit="handleUploadToIPFS"
    name="image"
  >
    <p class="input-label">{{ label }}</p>
    <p class="input-description">{{ description }}</p>
    <div class="input-row">
      <input
        type="file"
        class="input"
        @change="handleLoadFile"
        name="image"
        :id="`${formProp}-input`"
      />
      <button
        primary="true"
        type="submit"
        label="Subir"
        class="btn-primary"
        :disabled="loading || error || !loadedImageHeight"
      >
        {{ loading ? 'Uploading...' : 'Upload' }}
      </button>
    </div>
    <loader v-if="loading" />
    <div v-if="hash">
      <div
        :class="{
          'banner-preview': formProp === 'bannerHash',
          'thumbnail-preview': formProp === 'thumbnailHash',
        }"
      >
        <img
          :src="imageUrl"
          alt="Uploaded image preview"
          :class="{
            banner: formProp === 'bannerHash',
            thumbnail: formProp === 'thumbnailHash',
          }"
        />
      </div>
      <div>
        <p class="input-label">IPFS hash</p>
        <p class="input-description">
          Tu imagen ahora está almacenada en una red descentralizada en el
          siguiente hash. No es necesario que hagas nada con él, pero es posible
          que desees conservarlo para usarlo en el futuro.
        </p>
      </div>
      <div class="hash-area">
        <ipfs-copy-widget :hash="hash" />
        <div @click="handleRemoveImage" class="btn-warning">Remover imagen</div>
      </div>
    </div>
    <p v-if="error" class="error">{{ error }}</p>
  </form>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import { ipfsGatewayUrl } from '@/api/core'

import Loader from '@/components/Loader.vue'
import IpfsCopyWidget from '@/components/IpfsCopyWidget.vue'
import { IPFS } from '@/api/ipfs'
// import IPFS from 'ipfs-mini'

@Component({
  components: {
    Loader,
    IpfsCopyWidget,
  },
})
export default class IpfsImageUpload extends Vue {
  @Prop() label!: string
  @Prop() description!: string
  @Prop() formProp!: string
  @Prop() onUpload!: (key: string, value: string) => void

  ipfs: any = null
  hash = ''
  loading = false
  loadedImageFile: File | null = null
  loadedImageHeight: number | null = null
  loadedImageWidth: number | null = null
  error = ''


  created() {
    this.ipfs = new IPFS()
  }

//   created() {
//     this.ipfs = new IPFS({
//       host: 'https://ipfs.infura.org:5001/api/v0/pin/add?arg='+ process.env.VUE_APP_INFURA_IPFS_ID,
//       port: 5001,
//       protocol: 'https',
//       id:
//     })
//   }

  // TODO raise error if not valid image (JPG / PNG / GIF)
  handleLoadFile(event) {
    this.error = ''
    const data = event.target.files[0]

    if (!data) return
    if (!data.type.match('image/*')) {
      this.error = 'Upload a JPG, PNG, or GIF'
      return
    }
    if (data.size > 512000) {
      // Limit 512 kB file size
      this.error = 'Upload an image smaller than 512 kB'
      return
    }

    const reader = new FileReader()
    reader.onload = (() => (e) => {
      this.loadedImageFile = data
      const img = new Image()
      img.src = String(e.target?.result)
      img.onload = () => {
        this.loadedImageHeight = img.height
        this.loadedImageWidth = img.width
      }
    })()
    reader.readAsDataURL(data)
  }

  // TODO display error in UI
  handleUploadToIPFS(event) {
    event.preventDefault()
    // Work-around: Raw image data can be loaded through an SVG
    // https://github.com/SilentCicero/ipfs-mini/issues/4#issuecomment-792351498
    if (
      this.loadedImageFile &&
      this.loadedImageHeight &&
      this.loadedImageWidth
    ) {
      this.loading = true
      this.ipfs
        .add(this.loadedImageFile)
        .then((hash) => {
          this.hash = hash
          /* eslint-disable-next-line no-console */
          console.log(`Uploaded file hash:`, hash)
          this.onUpload(this.formProp, hash)
          this.loading = false
        })
        .catch((error) => {
          this.error = `Error occurred: ${error}`
          this.loading = false
        })
    } else {
      this.error = 'You need an image.'
    }
  }

  handleRemoveImage(): void {
    this.hash = ''
    this.loading = false
    this.error = ''
    this.onUpload(this.formProp, '')

    // Clear file selector input
    const fileSelector = document.getElementById(
      `${this.formProp}-input`
    ) as HTMLInputElement
    if (fileSelector) {
      fileSelector.value = ''
    }
  }

  get imageUrl(): string {
    return `${ipfsGatewayUrl}/ipfs/${this.hash}`
  }
}
</script>

<style scoped lang="scss">
@import '../styles/vars';
@import '../styles/theme';

.banner-preview {
  width: 100%;
  aspect-ratio: 16 / 9;
}

.thumbnail-preview {
  width: 200px;
  aspect-ratio: 1 / 1;
}

.banner-preview,
.thumbnail-preview {
  margin-bottom: 1rem;
  img {
    object-fit: cover;
    width: 100%;
    height: 100%;
  }
}

.btn-warning {
  @media (max-width: $breakpoint-m) {
    width: 100%;
  }
}

.btn-primary {
  @media (max-width: $breakpoint-m) {
    width: 100%;
  }
}

.input-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  @media (max-width: $breakpoint-m) {
    flex-direction: column;
  }
  margin: 1rem 0 2rem;
}

.input {
  flex: 1;
  border-radius: 16px;
  border: 2px solid $button-color;
  background-color: $bg-secondary-color;
  margin: 0.5rem 0;
  padding: 0.5rem 1rem;
  font-size: 16px;
  font-family: Inter;
  font-weight: 400;
  line-height: 24px;
  letter-spacing: 0em;
  width: 100%;
  &:valid {
    border: 2px solid $clr-green;
  }
  &:hover {
    background: $bg-primary-color;
    border: 2px solid $highlight-color;
    box-shadow: 0px 4px 16px 0px 25, 22, 35, 0.4;
  }
  &:optional {
    border: 2px solid $button-color;
    background-color: $bg-secondary-color;
  }
}

.input-label {
  font-family: Inter;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 24px;
  letter-spacing: 0em;
  text-align: left;
  margin: 0;
}

.input-description {
  margin-top: 0.25rem;
  font-size: 14px;
  font-family: Inter;
  margin-bottom: 0.5rem;
  line-height: 150%;
}

.hash-area {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  margin-top: 1rem;
  @media (max-width: $breakpoint-m) {
    flex-direction: column;
    width: 100%;
  }
}
</style>
