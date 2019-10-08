// import evan libs
import { RouteRegistrationInterface } from '@evan.network/ui-vue-core';

import HelloWorldComponent from './components/helloworld/helloworld.vue';
import DispatcherComponent from './components/dispatcher/dispatcher.vue';

// map them to element names, so they can be used within templates
const routeRegistration: Array<RouteRegistrationInterface> = [
  { path: '', redirect: { path: 'helloworld' } },
  { path: 'helloworld', component: HelloWorldComponent },
  { path: 'dispatcher', component: DispatcherComponent },
];

export default routeRegistration;
