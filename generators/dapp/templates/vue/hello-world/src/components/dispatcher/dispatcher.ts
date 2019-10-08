// vue imports
import Vue from 'vue';
import Component, { mixins } from 'vue-class-component';
import { Prop } from 'vue-property-decorator';

// evan.network imports
import { EvanComponent, EvanForm, EvanFormControl } from '@evan.network/ui-vue-core';
import * as bcc from '@evan.network/api-blockchain-core';
import * as dappBrowser from '@evan.network/ui-dapp-browser';

import * as dispatchers from '../../dispatchers/registry';


interface AliasFormInterface extends EvanForm {
  alias: EvanFormControl;
}

@Component({ })
export default class DispatcherSampleComponent extends mixins(EvanComponent) {
  /**
   * show a loading symbol
   */
  loading = true;

  /**
   * my name loaded from my addressbook
   */
  alias = '';

  /**
   * Formular definition to handle form changes easily.
   */
  aliasForm: AliasFormInterface = null;

  /**
   * Watch for dispatcher updates...
   */
  savingWatcher = null;
  saving = false;

  /**
   * Load runtime from current scope and start using it...
   */
  async created() {
    const runtime = (<any>this).getRuntime();
    const dapp = (<any>this).dapp;
    const addressBook = await runtime.profile.getAddressBook();

    // update alias
    this.aliasForm = (<AliasFormInterface>new EvanForm(this, {
      alias: {
        value: addressBook.profile[runtime.activeAccount].alias,
        validate: function(vueInstance: DispatcherSampleComponent, form: AliasFormInterface) {
          return this.value.length !== 0;
        }
      },
    }));

    // watch for updates
    this.savingWatcher = dispatchers.saveDispatcher.watch(() => this.checkSaving());
    this.checkSaving();

    // display content
    this.loading = false;
  }

  /**
   * Remove dispatcher listener
   */
  beforeDestroy() {
    this.savingWatcher && this.savingWatcher();
  }

  /**
   * Save the alias that was specified.
   */
  saveAlias() {
    // start invite dispatcher
    dispatchers.saveDispatcher.start((<any>this).getRuntime(), {
      alias: this.aliasForm.alias.value,
    });
  }

  /**
   * Watch for dispatcher updates.
   */
  async checkSaving() {
    const runtime = (<any>this).getRuntime();
    const dispatcherInstances = await dispatchers.saveDispatcher.getInstances(runtime);

    // if more than one dispatcher is running, block interactions
    if (dispatcherInstances.length > 0) {
      this.saving = true;
    } else {
      // if saving was finished, reload the data
      if (this.saving) {
        delete runtime.profile.trees[runtime.profile.treeLabels.addressBook];
        await runtime.profile.loadForAccount(runtime.profile.treeLabels.addressBook);
        const addressBook = await runtime.profile.getAddressBook();
        this.aliasForm.alias.value = addressBook.profile[runtime.activeAccount].alias;

        (<any>this.$refs.saveFinishedModal).show();
      }

      this.saving = false;
    }
  }
}
