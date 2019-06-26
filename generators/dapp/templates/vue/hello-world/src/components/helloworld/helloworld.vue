/*
  Copyright (C) 2018-present evan GmbH.

  This program is free software: you can redistribute it and/or modify it
  under the terms of the GNU Affero General Public License, version 3,
  as published by the Free Software Foundation.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
  See the GNU Affero General Public License for more details.

  You should have received a copy of the GNU Affero General Public License
  along with this program. If not, see http://www.gnu.org/licenses/ or
  write to the Free Software Foundation, Inc., 51 Franklin Street,
  Fifth Floor, Boston, MA, 02110-1301 USA, or download the license from
  the following URL: https://evan.network/license/

  You can be released from the requirements of the GNU Affero General Public
  License by purchasing a commercial license.
  Buying such a license is mandatory as soon as you use this software or parts
  of it on other blockchains than evan.network.

  For more information, please contact evan GmbH at this address:
  https://evan.network/license/
*/

<template>
  <div class="container-wide">
    <evan-loading v-if="loading"></evan-loading>
    <div class="d-flex mb-5 align-items-center" v-else>
      <div>
        <h3 class="font-weight-bold mb-0 force-oneline bg-level-3">
          {{ '_sample.header' | translate }}
        </h3>
      </div>
      <span class="mx-auto"></span>
    </div>
    <div class="white-box border-smooth rounded">
      <div class="header">
        <h3 class="m-0 font-weight-semibold">
          {{ '_sample.header2' | translate }}
        </h3>
      </div>
      
      <div class="content">
        {{ $t('_sample.content', { alias }) }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import RootComponent from './helloworld.ts';
  export default RootComponent;
</script>

