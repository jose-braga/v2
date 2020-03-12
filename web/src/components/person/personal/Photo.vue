<template>
    <v-card  class="mb-4">
        <v-card-title primary-title>
            <div>
                <h3 class="headline">Website personal photo</h3>
            </div>
        </v-card-title>
        <v-card-text>
        </v-card-text>
        <v-form ref="form" @submit.native.prevent :key="objectUrl">
            <v-container class="px-6">
                <v-row>
                    <v-col>
                        <p v-if="!hasImage">No image saved.</p>
                        <div v-if="hasImage">
                            <img :src="imgSrc" />
                        </div>
                        <p v-if="hasImage">To change image click "Browse" below.</p>
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
                <v-row align-content="center" justify="end">
                    <v-col cols="3" v-if="formError">
                        <v-row justify="end">
                            <p class="caption red--text">Please add an image.</p>
                        </v-row>
                    </v-col>
                    <v-col cols="2" align-self="end">
                        <v-row justify="end">
                            <v-btn type="button" @click="submitForm()"
                            outlined color="blue">Update</v-btn>
                        </v-row>
                    </v-col>
                    <v-col cols="1">
                        <v-progress-circular indeterminate
                                v-show="progress"
                                :size="20" :width="2"
                                color="primary"></v-progress-circular>
                        <v-icon v-show="success" color="green">mdi-check</v-icon>
                        <v-icon v-show="error" color="red">mdi-alert-circle-outline</v-icon>
                    </v-col>
                </v-row>
            </v-container>
        </v-form>
    </v-card>
</template>

<script>
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'
import {debounce} from 'lodash'
import subUtil from '../../common/submit-utils'

export default {
    components: {
    },
    data() {
        return {
            submitting: false,
            cropper: null,
            objectUrl: null,
            previewCropped: null,
            selectedFile: null,
            debouncedUpdatePreview: debounce(this.updatePreview, 157),
            progress: false,
            success: false,
            error: false,
            formError: false,
            hasImage: false,
            imgSrc: '',
            cropStyle: {
                width: 196,
                height: 196,
            },
            data: {
                id: undefined,
            }
        }
    },
    computed: {
        ownerPersonID () {
            return this.$store.state.session.personID;
        },
    },
    watch: {},
    created: function () {
        this.initialize();
    },
    methods: {
        initialize: function () {
            if (this.$store.state.session.loggedIn) {
                this.data = {
                    id: undefined,
                };
                let personID = this.$store.state.session.personID;
                let imageType = 1;
                let urlSubmit = 'api/people/' + personID + '/photos/' + imageType;
                subUtil.getInfoPopulate(this, urlSubmit, false)
                .then( (result) => {
                    if (result !== undefined) {
                        this.hasImage = true;
                        this.imgSrc = result.url;
                        this.data.id = result.id;
                        this.submitting = false;
                        this.cropper = null;
                        this.objectUrl= null;
                        this.previewCropped = null;
                        this.selectedFile = null;
                    }
                })
            }
        },
        submitForm: function () {
            this.submitting = true;
            if (!this.selectedFile) {
                this.formError = true;
                setTimeout(() => {this.formError = false;}, 3000)
            } else {
                if (this.$store.state.session.loggedIn) {
                    this.progress = true;
                    let personID = this.$store.state.session.personID;
                    let urlSubmit = 'api/people/' + personID + '/photos/' + 1;
                    const canvas = this.cropper
                        .getCroppedCanvas({
                            width: this.cropStyle.width,
                            height: this.cropStyle.height
                        })
                    canvas.toBlob((blob) => {
                        const formData = new FormData()

                        this.$nextTick(function () {
                            formData.append('file_name', this.selectedFile.name);
                            if (this.data.id !== undefined) {
                                formData.append('id', this.data.id);
                            }
                            formData.append('person_id', personID);
                            formData.append('file', blob);

                            this.$http.put(urlSubmit,
                                formData,
                                {
                                    headers: {
                                        'Authorization': 'Bearer ' + localStorage['v2-token'],
                                        'Content-Type': 'multipart/form-data'
                                    },
                                }
                            )
                            .then(() => {
                                    this.progress = false;
                                    this.success = true;
                                    setTimeout(() => {this.success = false;}, 1500)
                                    this.resetCropper();
                                    this.initialize();
                            })
                            .catch((error) => {
                                this.progress = false;
                                this.error = true;
                                setTimeout(() => {this.error = false;}, 6000)
                                // eslint-disable-next-line
                                console.log(error)
                            });
                        })
                    }, 'image/png', 1);
                }
            }
        },

        resetCropper () {
            this.cropper.reset()
        },
        setupCropper (selectedFile) {
            if (this.cropper) {
                this.cropper.destroy();
            }

            if (this.objectUrl) {
                window.URL.revokeObjectURL(this.objectUrl);
            }

            if (!selectedFile) {
                this.cropper = null
                this.objectUrl = null
                this.previewCropped = null
                return
            }

            this.objectUrl = window.URL.createObjectURL(selectedFile)
            this.$nextTick(this.setupCropperInstance)

        },
        setupCropperInstance () {
            this.cropper = new Cropper(this.$refs.source, {
                aspectRatio: 1,
                crop: this.debouncedUpdatePreview
            })
        },
        updatePreview () {
            if (this.cropper !== null) {
                const canvas = this.cropper.getCroppedCanvas()
                this.previewCropped = canvas.toDataURL('image/png')
            }
        }

    },
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
