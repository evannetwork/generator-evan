import Vue from 'vue';
import { initializeVue } from '@evan.network/ui-vue-core';

import components from './components/registry';
import RootComponent from './components/root/root.vue';
import routes from './routes';
import translations from './i18n/translations';

export * from './components/registry';
export * from './dispatchers/registry';
export { translations }

/**
 * StartDapp function that is called by the ui-dapp-browser, including an container and the current
 * dbcp. So startup, it's evan time!
 *
 * @param      {any}     container    container element
 * @param      {string}  dbcpName     dbcp name of the dapp
 * @param      {any}     dappEnsOrContract  original ens / contract address that were loaded
 * @param      {string}  dappBaseUrl  origin of the dapp
 */
export async function startDApp(container: any, dbcpName: any, dappEnsOrContract: any, dappBaseUrl: any) {
  await initializeVue({
    components,
    container,
    dappBaseUrl,
    dappEnsOrContract,
    dbcpName,
    RootComponent,
    routes,
    state: { },
    translations,
    Vue,
  });
}
