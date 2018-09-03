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

const { bcConfig } = require('../config/deployment');

module.exports = {
  deployRegistrar: async (runtime, runtimeConfig) => {
    console.group('deployRegistrar');
    // create fifs registrar for testing and give it ownership over 'registrar.test.evan'
    const fifsRegistrar = await runtime.executor.createContract(
      'FIFSRegistrar',
      [bcConfig.nameResolver.ensAddress, runtime.nameResolver.namehash(runtimeConfig.registrar.domain)],
      { from: runtime.activeAccount, gas: 1000000, },
    )
    // assign parent domain to ens owner
    await runtime.nameResolver.setAddress(
      runtimeConfig.registrar.domainParent,
      null,
      runtime.activeAccount,
    )
    // assign domain to registrar
    await runtime.nameResolver.setAddress(
      runtimeConfig.registrar.domain,
      null,
      runtime.activeAccount,
      fifsRegistrar.options.address,
    )
    console.groupEnd('deployRegistrar');
  },
};