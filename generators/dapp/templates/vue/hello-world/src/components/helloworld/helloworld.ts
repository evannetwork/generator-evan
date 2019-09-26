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
