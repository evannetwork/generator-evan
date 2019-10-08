// import evan libs
import { ComponentRegistrationInterface } from '@evan.network/ui-vue-core';

import HelloWorldComponent from './helloworld/helloworld.vue';
import DispatcherSampleComponent from './dispatcher/dispatcher.vue';

// export them all, so other applications can access them
export {
  DispatcherSampleComponent,
  HelloWorldComponent,
}

// map them to element names, so they can be used within templates
const componentRegistration: Array<ComponentRegistrationInterface> = [
  { name: 'hello-world',       component: HelloWorldComponent },
  { name: 'dispatcher-sample', component: DispatcherSampleComponent },
];

export default componentRegistration;
