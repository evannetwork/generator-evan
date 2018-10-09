<template>
  <div class="vue-login">
    <h2>Login</h2>
    <p v-if="$route.query.redirect">
      You need to login first.
    </p>
    <form @submit.prevent="login">
      <label><input v-model="password" placeholder="password" type="password"></label>
      <button type="submit">login</button>
      <p v-if="error" class="error">Bad login information</p>
    </form>
  </div>
</template>

<script lang="ts">
import * as bcc from 'bcc';
import Vue from "vue";
import { bccHelper, core, } from 'dapp-browser';
import { finishedLogin } from '../index';

export default Vue.extend({
  data () {
    return {
      password: '',
      error: false
    }
  },
  methods: {
    async login () {
      const accountId = core.activeAccount();

      if (await bccHelper.isAccountPasswordValid(bcc, accountId, this.password)) {
        finishedLogin(this.password);
      } else {
        this.error = true;
      }
    }
  }
});
</script>

<style>
.error {
  color: red;
}
</style>