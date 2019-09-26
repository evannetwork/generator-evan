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
import { CreateComponent } from './components/create/create';
import { DetailComponent } from './components/detail/detail';

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
        component: CreateComponent,
        data: {
          state: 'create',
          navigateBack: true
        }
      },
      {
        path: `:address`,
        data: {
          state: 'contract',
          navigateBack: true
        },
        children: [
          {
            path: ``,
            data: {
              state: 'contract',
              navigateBack: true
            },
            component: DetailComponent
          },
          {
            path: '**',
            data: {
              state: 'unknown',
              navigateBack: true
            },
            component: DAppLoaderComponent,
          }
        ]
      },
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
      CreateComponent,
      DetailComponent,
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
  
  // Add project class name to the ion-app / .evan-dapp element for generalized styling
  // ionicAppEl.className += ' <%= dbcpName %>-style';

  await startAngularApplication(<%= cleanName %>Module, getRoutes());

  container.appendChild(ionicAppEl);
}
