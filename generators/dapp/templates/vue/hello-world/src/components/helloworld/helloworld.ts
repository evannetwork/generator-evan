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


interface AliasFormInterface extends EvanForm {
  accountId: EvanFormControl;
  alias: EvanFormControl;
  email: EvanFormControl;
  emailInvite: EvanFormControl;
  eve: EvanFormControl;
  tags: EvanFormControl;
}

@Component({ })
export default class HelloWorldComponent extends mixins(EvanComponent) {
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
   * Load runtime from current scope and start using it...
   */
  async created() {
    const runtime = (<any>this).getRuntime();
    const dapp = (<any>this).dapp;
    const addressBook = await runtime.profile.getAddressBook();

    // update alias
    this.alias = addressBook.profile[runtime.activeAccount].alias;

    console.log('runtime:');
    console.dir(runtime);
    console.dir('dapp information:');
    console.dir(dapp);
    console.dir('addressbook:');
    console.dir(addressBook);

    this.loading = false;
  }
}
