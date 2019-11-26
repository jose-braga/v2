<template>
    <v-card  class="mb-4">
        <v-card-title primary-title>
            <div>
                <h3 class="headline">Website personal photo</h3>
                <div>  </div>
            </div>
        </v-card-title>
        <v-card-text>
        </v-card-text>
        <v-form ref="form" enctype="multipart/form-data"
                    @submit.prevent="submitForm">
            <input type="hidden"
                    name="person_id"
                    :value="ownerPersonID" />
            <v-container>
                <v-row>
                    <v-col>
                        <p v-if="!hasImage">No image saved.</p>
                        <div v-if="hasImage">
                            <img v-bind:src="imgSrc" />
                        </div>
                        <p v-if="hasImage">To change image click "Browse" below.</p>
                        <input type="file" ref="fileInput"
                            name="image" accept="image/*"
                            style="font-size: 1.2em; padding: 10px 0;"
                            @change="setImage" />
                        <vue-cropper v-if="hasNewImage"
                            ref="cropper"
                            :src="newImgSrc"
                            alt="Source Image"
                            preview=".preview"
                            responsive
                            :view-mode="1"
                            :aspect-ratio="1"
                            drag-mode="crop">
                        </vue-cropper>
                    </v-col>
                    <v-col v-if="hasNewImage"
                            px-4 pb-2 justify-center offset-xs2 offset-md4>
                        <div class="preview" v-bind:style="previewStyle"></div>
                    </v-col>
                </v-row>
            </v-container>
            <v-container fluid fill-height>
                <v-row>
                    <div v-if="formError">
                        <p class="caption red--text">Please add an image.</p>
                    </div>
                    <v-container>
                        <v-row align="center" justify="end">
                            <div>
                                <v-btn type="submit"
                                    outlined color="blue">Update</v-btn>
                            </div>
                            <div class="request-status-container">
                                <v-progress-circular indeterminate
                                        v-show="progress"
                                        :size="20" :width="2"
                                        color="primary"></v-progress-circular>
                                <v-icon v-show="success" color="green">mdi-check</v-icon>
                                <v-icon v-show="error" color="red">mdi-alert-circle-outline</v-icon>
                            </div>
                        </v-row>
                    </v-container>
                </v-row>
            </v-container>
        </v-form>
    </v-card>
</template>

<script>
import VueCropper from 'vue-cropperjs'
import 'cropperjs/dist/cropper.css'
import subUtil from '../../common/submit-utils'

export default {
    components: {
        VueCropper,
    },
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            formError: false,
            hasImage: false,
            hasNewImage: false,
            newImgSrc: '',
            imgSrc: '',
            cropStyle: {
                width: 196,
                height: 196,
            },
            data: {
                id: undefined,
                file: undefined,
            }
        }
    },
    computed: {
        previewStyle () {
            return {
                width: this.cropStyle.width + 'px',
                height: this.cropStyle.height + 'px',
                overflow: 'hidden',
            }
        },
        ownerPersonID () {
            return this.$store.state.session.personID;
        },
    },
    watch: {},
    mounted: function () {
        this.initialize();
    },
    methods: {
        initialize: function () {
            if (this.$store.state.session.loggedIn) {
                let personID = this.$store.state.session.personID;
                let imageType = 1;
                let urlSubmit = 'api/people/' + personID + '/photos/' + imageType;
                subUtil.getInfoPopulate(this, urlSubmit, false)
                .then( (result) => {
                    if (result !== undefined) {
                        this.hasImage = true;
                        this.imgSrc = result.url;
                        this.data.id = result.id;
                    }
                })
            }
        },
        submitForm: function () {
            if (!this.hasNewImage) {
                this.formError = true;
                setTimeout(() => {this.formError = false;}, 3000)
            } else {
                if (this.$store.state.session.loggedIn) {
                    this.progress = true;
                    const personID = this.$store.state.session.personID;
                    let urlSubmit = 'api/people/' + personID + '/photos/' + 1;
                    this.cropImage(urlSubmit, personID);
                }
            }
        },
        setImage(e) {
            this.hasNewImage = true;
            const file = e.target.files[0];
            if (!file.type.includes('image/')) {
                alert('Please select an image file');
                return;
            }
            if (typeof FileReader === 'function') {
                const reader = new FileReader();
                reader.onload = (event) => {
                    this.newImgSrc = event.target.result;
                    this.data.file = file;
                    // rebuild cropperjs with the updated source
                    this.$refs.cropper.replace(event.target.result);
                };
                reader.readAsDataURL(file);
            } else {
                alert('Sorry, FileReader API not supported');
            }
        },
        cropImage(url, personID) {
            // get image data for post processing, e.g. upload or setting image src
            this.$refs.cropper
                .getCroppedCanvas({
                    width: this.cropStyle.width,
                    height: this.cropStyle.height})
                .toBlob((blob) => {
                    const formData = new FormData();
                    formData.append('file_name', this.data.file.name);
                    if (this.data.id !== undefined) {
                        formData.append('id', this.data.id);
                    }
                    formData.append('person_id', personID);
                    formData.append('file', blob);

                    this.$http.put(url,
                        formData,
                        {
                            headers: {'Authorization': 'Bearer ' + localStorage['v2-token'],
                                      'Content-Type': 'multipart/form-data' },
                        })
                        .then(() => {
                            this.progress = false;
                            this.success = true;
                            setTimeout(() => {this.success = false;}, 1500)
                            this.hasNewImage = false;
                            this.$refs.fileInput.value = '';
                            this.initialize();
                        })
                        .catch((error) => {
                            this.progress = false;
                            this.error = true;
                            setTimeout(() => {this.error = false;}, 6000)
                            // eslint-disable-next-line
                            console.log(error)
                        });
                }, this.data.file.type, 1);
        },
    },
}
</script>

<style scoped>


</style>
