<template>
  <v-app>
    <Drawer></Drawer>
    <UpperToolbar></UpperToolbar>

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
    }
  }
}
</script>
