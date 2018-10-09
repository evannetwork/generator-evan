<!-- src/components/Hello.vue -->
<template>
  <div>
    <h2>Hello World</h2>

    <div v-if="loading">creating...</div>

    <button
      v-if="!contract && !loading"
      @click="createContract">
      create new Contract
    </button>
    <table v-if="contract">
      <thead>
        <tr>
          <th>field</th>
          <th>value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>contract-id</td>
          <td>{{ contract.options.address }}</td>
        </tr>
        <tr>
          <td>owner</td>
          <td>{{ owner }}</td>
        </tr>
        <tr>
          <td>dbcp description</td>
          <td>
            <textarea rows="20" v-model="description"></textarea>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import * as bcc from 'bcc';
import {
  System,
  core,
} from 'dapp-browser';
  
export default Vue.extend({
  data: function () {
    return {
      contract: null,
      contractAddress: '',
      description: '',
      enthusiasm: 3,
      loading: false,
      owner: '',
    }
  },
  methods: {
    async createContract() {
      this.loading = true;

      const ProfileRuntime = bcc.ProfileRuntime;
      const CoreRuntime = bcc.CoreRuntime;
      // load dapp description to add contract metadata
      const dappDescription = await System.import('<%= dbcpName %>.van!ens');

      // clear additional properties, so we can use it for the new contract
      delete dappDescription.translated;
      delete dappDescription.ensAddress;
      delete dappDescription.status;

      // create a new contract and bind the contract address
      this.contract = await ProfileRuntime.dataContract.create(
        'tasks',
        core.activeAccount(),
        null,
        { public: dappDescription }
      );
      this.contractAddress = (<any>this.contract).options.address;

      const contractInstance = await CoreRuntime.contractLoader.loadContract(
        'DataContractInterface',
        this.contractAddress
      );

      // load contract internals
      this.owner = await contractInstance.methods.owner().call();
      this.description = JSON.stringify(
        await CoreRuntime.description.getDescription(this.contractAddress),
        null,
        2
      );

      this.loading = false;
    }
  }
});
</script>
