import * as bcc from '@evan.network/api-blockchain-core';
import * as dappBrowser from '@evan.network/ui-dapp-browser';
import { Dispatcher, DispatcherInstance } from '@evan.network/ui';
import { EvanComponent, EvanForm, EvanFormControl } from '@evan.network/ui-vue-core';


const dispatcher = new Dispatcher(
  `<%= dbcpName %>.${ dappBrowser.getDomainName() }`,
  'saveDispatcher',
  40 * 1000,
  '_sample.dispatcher.save'
);

dispatcher
  .step(async (instance: DispatcherInstance, data: any) => {
    const runtime = instance.runtime;

    // ensure latest addressbook is loaded
    await runtime.profile.loadForAccount(runtime.profile.treeLabels.contracts);
    await runtime.profile.addProfileKey(runtime.activeAccount, 'alias', data.alias);
    await runtime.profile.storeForAccount(runtime.profile.treeLabels.addressBook);
  });

export default dispatcher;
