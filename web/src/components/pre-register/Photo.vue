<template>
<v-card  class="mb-4">
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Website personal photo</h3>
        </div>
    </v-card-title>
    <v-card-text>
    </v-card-text>
    <v-container class="px-6">
        <v-row>
            <v-col>
                <p>Upload a photo</p>
                <v-file-input
                    v-model="selectedFile"
                    accept="image/png, image/jpeg"
                    label="File"
                    placeholder="Select a file"
                    :show-size="1024"
                    @change="setupCropper"
                >
                </v-file-input>
                <v-row v-if="objectUrl">
                    <v-col class="text-center" cols="12" sm="6">
                        <div class="overline">Original</div>
                        <div class="image-container elevation-4">
                            <img class="image-preview"
                                ref="source"
                                :src="objectUrl" />
                        </div>
                        <div class="d-flex justify-center">
                            <v-btn icon="icon" small="small" @click="resetCropper">
                                <v-icon>mdi-aspect-ratio</v-icon>
                            </v-btn>
                            <div class="mx-2"></div>
                        </div>
                    </v-col>
                    <v-col class="text-center" cols="12" sm="6">
                        <div class="overline">Crop</div>
                        <div class="image-container elevation-4">
                            <img class="crop-preview" :src="previewCropped" />
                        </div>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </v-container>
</v-card>

</template>

<script>
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'
import {debounce} from 'lodash'

export default {

    data() {
        return {
            submitting: false,
            objectUrl: null,
            previewCropped: null,
            selectedFile: null,
            debouncedUpdatePreview: debounce(this.updatePreview, 157),
            imgSrc: '',
            cropStyle: [
                {
                    width: 196,
                    height: 196,
                    imageType: 1 // this should exist always
                },
                {
                    width: 600,
                    height: 600,
                    imageType: 2
                },
            ],
            data: {
                cropper: null,
            }
        }
    },
    methods: {
        addValue () {
            this.$store.commit('addPersonData', this.data);
        },

        resetCropper () {
            this.data.cropper.reset()
        },
        setupCropper (selectedFile) {
            if (this.data.cropper) {
                this.data.cropper.destroy();
            }

            if (this.objectUrl) {
                window.URL.revokeObjectURL(this.objectUrl);
            }

            if (!selectedFile) {
                this.data.cropper = null
                this.objectUrl = null
                this.previewCropped = null
                return
            }

            this.objectUrl = window.URL.createObjectURL(selectedFile)
            this.$nextTick(this.setupCropperInstance)

        },
        setupCropperInstance () {
            this.data.cropper = new Cropper(this.$refs.source, {
                aspectRatio: 1,
                crop: this.debouncedUpdatePreview
            })
            this.addValue();

        },
        updatePreview () {
            if (this.data.cropper !== null) {
                const canvas = this.data.cropper.getCroppedCanvas()
                this.previewCropped = canvas.toDataURL('image/png')
            }
        }
    }

}
</script>

<style scoped>
.image-container {
    display: inline-block;
    line-height: 0;
}
.image-preview {
    display: block;
    max-height: 229px;
    max-width: 100%;
}
.crop-preview {
    width: 196px;
    height: 196px;
    overflow: hidden;
}

</style>