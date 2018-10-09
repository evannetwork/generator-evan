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
import Vue from "vue";
import {
  AccountStore,
  config,
  getCoreOptions,
  getDomainName,
  getLatestKeyProvider,
  KeyProvider,
  lightwallet,
  queue,
  updateCoreRuntime,
  web3,
  web3Helper,
  core,
  utils,
} from 'dapp-browser';

import {
  getProfileForAccount
} from "../bcc";

import {
  basePath,
  router,
} from '../routing';

import {
  finishedLogin
} from '../index';

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
      const profile = await getProfileForAccount(accountId);

      profile.ipld.keyProvider.setKeysForAccount(
        accountId,
        lightwallet.getEncryptionKeyFromPassword(this.password)
      );

      let targetPrivateKey;
      try {
        targetPrivateKey = await profile.getContactKey(
          accountId,
          'dataKey'
        );
      } catch (ex) { }

      if (targetPrivateKey) {
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