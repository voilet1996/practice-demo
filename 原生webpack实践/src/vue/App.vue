<template>
    <div class="container">1111{{ welcome }}</div>

    <div>
        <a><p></p></a>
    </div>
</template>

<script setup>
import { ref } from "vue"
const welcome = ref("Hello Vue 3 + Vite")
</script>

<style scoped></style>
