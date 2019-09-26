// vue imports
import Vue from 'vue';
import Component, { mixins } from 'vue-class-component';
import { Prop } from 'vue-property-decorator';

// evan.network imports
import { EvanComponent } from '@evan.network/ui-vue-core';
import * as bcc from '@evan.network/api-blockchain-core';
import * as dappBrowser from '@evan.network/ui-dapp-browser';

@Component({ })
export default class RootComponent extends mixins(EvanComponent) {
  /**
   * Navigation tab definitions.
   */
  tabs = null;

  created() {
    this.tabs = [ 'helloworld', 'dispatcher', ]
      .map(urlKey => ({
        id: `tab-${ urlKey }`,
        href: `${ (<any>this).dapp.fullUrl }/${ urlKey }`,
        text: `_sample.breadcrumbs.${ urlKey }`
      }));
  }
}
