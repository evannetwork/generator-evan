<template>
  <div class="container-wide">
    <evan-loading v-if="loading"></evan-loading>
    <template v-else>
      <div class="d-flex mb-5 align-items-center">
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
            {{ '_sample.breadcrumbs.dispatcher' | translate }}
          </h3>
        </div>

        <evan-modal
          id="save-finished-modal"
          ref="saveFinishedModal">
          <template v-slot:header>
            <h5 class="modal-title">
              {{ `_sample.save-finished` | translate }}
            </h5>
          </template>
          <template v-slot:body>
            <span>
              {{ `_sample.save-finished-desc` | translate }}
            </span>
          </template>
        </evan-modal>
        
        <div class="content">
          <div class="form-group">
            <label for="alias">
              {{ `_sample.alias.title` | translate }} *
            </label>
            <input class="form-control" required
              id="alias" ref="alias"
              :placeholder="`_sample.alias.desc` | translate"
              v-model="aliasForm.alias.value"
              :class="{ 'is-invalid' : aliasForm.alias.error }"
              @blur="aliasForm.alias.setDirty()">
            <div class="invalid-feedback">
              {{ `_sample.alias.error` | translate }}
            </div>
          </div>

          <div class="text-right">
            <button type="submit" class="btn btn-primary btn-rounded"
              :disabled="saving || !aliasForm.isValid"
              @click="saveAlias()">
              {{ `_sample.dispatcher.save` | translate }}
              <div v-if="loading" class="spinner-border spinner-border-sm text-secondary ml-3"></div>
              <i class="mdi mdi-arrow-right label ml-3" v-else></i>
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
  import RootComponent from './dispatcher.ts';
  export default RootComponent;
</script>
