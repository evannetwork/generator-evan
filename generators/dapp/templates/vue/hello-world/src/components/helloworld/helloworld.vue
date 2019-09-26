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

