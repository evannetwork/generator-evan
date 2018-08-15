/*
  Copyright (c) 2018-present evan GmbH.
 
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
 
      http://www.apache.org/licenses/LICENSE-2.0
 
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

import {
  getDomainName
} from 'dapp-browser';

import {
  NgModule,                    // @angular/core
  CommonModule,                // @angular/common
  RouterModule, Routes,        // @angular/router
  IonicModule, IonicApp,       // ionic-angular
  BrowserAnimationsModule,     // @angular/platform-browser/animations
} from 'angular-libs';

import {
  AngularCore,
  DAppLoaderComponent,
  buildModuleRoutes,
  BootstrapComponent,
  startAngularApplication,
  createIonicAppElement
} from 'angular-core';

// import components
import { RootComponent } from './components/root/root';
import { SampleComponent } from './components/sample/sample';

// import services and dispatchers
import { Translations } from './i18n/registry';
import { <%= cleanName %>Service } from './services/service';
import { <%= cleanName %>Dispatcher } from './dispatcher/dispatcher';

// export service and dispatcher so it can be accessed from outside of the dapp to handle correct
// dispatcher handling
export {
  <%= cleanName %>Service,
  <%= cleanName %>Dispatcher
}

/**************************************************************************************************/

function getRoutes(): Routes {
  return buildModuleRoutes(
    `<%= dbcpName %>.${ getDomainName() }`,
    RootComponent,
    [
      {
        path: '',
        redirectTo: `sample`,
        pathMatch: 'full'
      },
      {
        path: 'sample',
        component: SampleComponent,
        data: {
          state: 'sample',
          navigateBack: true
        }
      },
      {
        path: '**',
        component: DAppLoaderComponent,
        data: {
          state: 'unkown',
          navigateBack: true
        }
      }
    ]
  );
}

/**
 * Returns the module configuration for the normal or dispatcher module.
 * In case of the dispatcher module, Router configurations and BrowserModule imports are excluded
 * to load the module during runtime by the dispatcher service.
 *
 * @param isDispatcher  boolean value if the config is used for the dispatcher module
 */
function getConfig(isDispatcher?: boolean) {
  let config: any = {
    imports: [
      CommonModule,
      AngularCore,
    ],
    providers: [
      Translations,
      <%= cleanName %>Service,
    ],
  };

  if (!isDispatcher) {
    config.imports.unshift(BrowserAnimationsModule);
    config.imports.unshift(RouterModule.forRoot(getRoutes(), { enableTracing: false, }));
    config.imports.push(IonicModule.forRoot(BootstrapComponent, {
      mode: 'md'
    }));

    config.bootstrap = [
      IonicApp
    ];

    config.declarations = [
      BootstrapComponent,
      RootComponent,
      SampleComponent,
    ];
  }

  return config;
}
@NgModule(getConfig(true))
export class DispatcherModule {
  constructor() { }
}

@NgModule(getConfig(false))
class <%= cleanName %>Module {
  constructor(private translations: Translations) { }
}

export async function startDApp(container, dbcpName) {
  const ionicAppEl = createIonicAppElement(container, dbcpName);

  await startAngularApplication(<%= cleanName %>Module, getRoutes());

  container.appendChild(ionicAppEl);
}
