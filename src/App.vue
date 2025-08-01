<template>
  <div class="max-w-xl mx-auto p-6 space-y-6">
    <h1 class="text-2xl font-bold">AI Şiir Üretici</h1>

    <div class="grid gap-4 sm:grid-cols-2">
      <div>
        <label class="block mb-1 font-medium">Tema</label>
        <input
          v-model="tema"
          class="w-full border rounded px-2 py-1"
          placeholder="Aşk, doğa, yalnızlık..."
        />
      </div>

      <div>
        <label class="block mb-1 font-medium">Duygu</label>
        <select v-model="duygu" class="w-full border rounded px-2 py-1">
          <option>Neşeli</option>
          <option>Hüzünlü</option>
          <option>Derin</option>
          <option>Gizemli</option>
        </select>
      </div>
    </div>

    <div class="flex gap-2">
      <button
        @click="generate"
        :disabled="loading"
        class="bg-indigo-600 text-white px-4 py-2 rounded shadow"
      >
        {{ loading ? "Oluşturuluyor..." : "Şiir Oluştur" }}
      </button>
      <button @click="reset" class="border px-4 py-2 rounded">Temizle</button>
    </div>

    <div v-if="poem" class="mt-4">
      <h2 class="text-xl font-semibold mb-2">Oluşan Şiir</h2>
      <div class="prose">
        <div
          v-for="(line, idx) in animatedLines"
          :key="idx"
          class="overflow-hidden"
        >
          <p
            :style="{
              opacity: line.visible ? 1 : 0,
              transition: 'opacity 0.5s ease',
              margin: '4px 0',
            }"
          >
            {{ line.text }}
          </p>
        </div>
      </div>

      <div class="mt-4 flex gap-2">
        <button @click="speak" class="px-3 py-1 border rounded">
          Sesli Oku
        </button>
        <button @click="regen" class="px-3 py-1 border rounded">
          Yeniden Oluştur
        </button>
      </div>
    </div>

    <div v-if="error" class="text-red-600 mt-2">
      {{ error }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const tema = ref("Aşk");
const duygu = ref("Hüzünlü");
const poem = ref<string | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

type Line = { text: string; visible: boolean };
const animatedLines = ref<Line[]>([]);

async function generate() {
  loading.value = true;
  error.value = null;
  poem.value = null;
  animatedLines.value = [];

  try {
    const res = await fetch("http://localhost:4000/generate-poem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tema: tema.value,
        duygu: duygu.value,
        uzunluk: "Kısa",
        tur: "siir",
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Üretilemedi");
    }
    poem.value = data.text;

    const lines = data.text
      .split("\n")
      .map((l: string) => l.trim())
      .filter((l: string) => l.length);
    animatedLines.value = lines.map((l: string) => ({
      text: l,
      visible: false,
    }));

    for (let i = 0; i < animatedLines.value.length; i++) {
      await new Promise((r) => setTimeout(r, 400));
      animatedLines.value[i].visible = true;
    }
  } catch (e: any) {
    console.error(e);
    error.value = e.message || "Bir hata oluştu";
  } finally {
    loading.value = false;
  }
}

function regen() {
  generate();
}

function speak() {
  if (!poem.value) return;
  const utter = new SpeechSynthesisUtterance(poem.value);
  utter.lang = "tr-TR";
  speechSynthesis.cancel(); // varsa önceki sesi iptal et
  speechSynthesis.speak(utter);
}

function reset() {
  poem.value = null;
  animatedLines.value = [];
  error.value = null;
}
</script>

<style scoped>
.prose p {
  font-size: 1.1rem;
}
</style>
