<template>
  <div class="helloworld-vue">
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import * as bcc from 'bcc';
import startBCC from "../bcc";
import {
  loading
} from 'dapp-browser';

export default Vue.extend({
  data () {
    return { }
  },
  async created () {
    loading.finishDAppLoading();
    await startBCC();
  }
});
</script>
