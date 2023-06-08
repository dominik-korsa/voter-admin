<template>
  <div class="tokens-image">
    <q-card
      bordered
      class="tokens-image__card-2"
    />
    <q-card
      bordered
      class="tokens-image__card-1"
    />
    <q-card
      bordered
      class="tokens-image__card-0"
    >
      <div class="tokens-image__qr">
        <img src="../assets/qr-code.svg" alt="Przykładowy kod QR">
      </div>
      <div class="tokens-image__right">
        <img src="../assets/token-placeholder.svg" alt="Przykładowy kod do głosowania">
      </div>
    </q-card>
  </div>
</template>

<style lang="scss">
.tokens-image {
  width: 100%;
  height: 100%;
  position: relative;

  $padding: 8px;

  .q-card {
    width: calc(100% - #{2*$padding});
    height: calc(100% - #{2*$padding});
    position: absolute;
    box-shadow: 1px 1px #0001;
  }

  .tokens-image__card-0 {
    display: flex;
    flex-direction: row;
    align-items: center;
    container-type: size;

    .tokens-image__qr {
      height: 100%;
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        height: 70%;
        opacity: 65%;
      }
    }

    .tokens-image__right {
      margin-right: 12px;
      flex-grow: 1;
      height: 100%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        max-width: 100%;
        max-height: 80%;
      }
    }
  }

  @for $i from 0 to 3 {
    .tokens-image__card-#{$i} {
      top: $padding * $i;
      left: $padding * $i;
    }
  }
}
</style>
<script setup lang="ts">
</script>
