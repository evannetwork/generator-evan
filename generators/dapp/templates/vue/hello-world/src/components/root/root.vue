<template>
  <div class="evan theme-evan">
    <evan-dapp-wrapper :routes="[ ]">
      <template slot="content">
        <evan-breadcrumbs
          :i18nScope="'_sample.breadcrumbs'"
          :enableReload="true">
        </evan-breadcrumbs>

        <evan-nav-tabs class="flex-shrink-0"
          :tabs="tabs"
          ref="navTabs">
        </evan-nav-tabs>

        <evan-dapp-wrapper-level-2>
          <template v-slot:content>
            <div class="w300 p-3">
              {{ '_sample.sidebarcontent' | translate}}
            </div>
          </template>
        </evan-dapp-wrapper-level-2>

        <transition name="fade" mode="out-in">
          <router-view></router-view>
        </transition>
      </template>
    </evan-dapp-wrapper>
  </div>
</template>

<script lang="ts">
  import RootComponent from './root.ts';
  export default RootComponent;
</script>

<style lang="scss" scoped>
  @import './root';
</style>
