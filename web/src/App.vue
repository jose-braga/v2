<template>
  <v-app>
    <Drawer v-if="standardPath"></Drawer>
    <UpperToolbar v-if="standardPath"></UpperToolbar>

    <v-content>
      <router-view></router-view>
    </v-content>
  </v-app>
</template>

<script>
import Drawer from './components/navigation/Drawer'
import UpperToolbar from './components/navigation/UpperToolbar'

export default {
  name: 'App',
  components: {
    Drawer,
    UpperToolbar,
  },
  data () {
    return {
      standardPath: false,
    }
  },
  watch: {
    $route () {
      if (this.$route.path.includes('/pre-register/')) {
        this.standardPath = false;
      } else { this.standardPath = true; }
    }

  }

}
</script>
