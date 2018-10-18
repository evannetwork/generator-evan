import Vue from "vue";
import {
  getDomainName,
  lightwallet,
  utils,
} from 'dapp-browser';

import Main from "./components/main.vue";

import {
  basePath,
  initializeRouting,
  router,
} from './routing';

export let finishedLogin;

export function startDApp(container: any, dbcpName: any) {
  if (container === document.body) {
    container = document.createElement('div');
    document.body.appendChild(container);
  }

  lightwallet.setPasswordFunction(async () => {
    // bind login function so we can resolve the initial promise, when login is done
    const loginPromise = new Promise(resolve => finishedLogin = (password: string) => {
      router.push({ path: `${ basePath }` });

      resolve(password);
    });

    // navigate the user to the login page
    router.push({ path: `${ basePath }/login` });

    return loginPromise;
  });

  initializeRouting(dbcpName);

  let v = new Vue({
    el: container,
    router,
    render: h => h(Main),
  });
}