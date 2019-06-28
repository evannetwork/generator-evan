/*
  Copyright (C) 2018-present evan GmbH.

  This program is free software: you can redistribute it and/or modify it
  under the terms of the GNU Affero General Public License, version 3,
  as published by the Free Software Foundation.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
  See the GNU Affero General Public License for more details.

  You should have received a copy of the GNU Affero General Public License
  along with this program. If not, see http://www.gnu.org/licenses/ or
  write to the Free Software Foundation, Inc., 51 Franklin Street,
  Fifth Floor, Boston, MA, 02110-1301 USA, or download the license from
  the following URL: https://evan.network/license/

  You can be released from the requirements of the GNU Affero General Public
  License by purchasing a commercial license.
  Buying such a license is mandatory as soon as you use this software or parts
  of it on other blockchains than evan.network.

  For more information, please contact evan GmbH at this address:
  https://evan.network/license/
*/

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
