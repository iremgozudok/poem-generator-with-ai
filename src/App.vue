<template>
  <div class="min-h-screen bg-black relative overflow-hidden">
    <!-- Arka plan ışık efektleri -->
    <div class="absolute top-0 right-0 w-96 h-96 bg-pink-500 rounded-full blur-3xl opacity-30"></div>
    <div class="absolute bottom-0 left-0 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-30"></div>
    
    <!-- Ana container -->
    <div class="relative z-10 min-h-screen flex items-center justify-center p-6">
      <div class="max-w-2xl w-full p-8 space-y-6 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl shadow-black/30">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-white mb-2">AI Metin Üretici</h1>
          <p class="text-gray-300">Hayal gücünüzü keşfedin, benzersiz içerikler oluşturun</p>
        </div>

        <div class="grid gap-6 sm:grid-cols-2">
          <div>
            <label class="block mb-2 font-medium text-white">Tema</label>
            <input
              v-model="tema"
              class="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/20 text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300"
              placeholder="Aşk, doğa, yalnızlık..."
            />
          </div>

          <div>
            <label class="block mb-2 font-medium text-white">Duygu</label>
            <select
              v-model="duygu"
              class="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/20 text-white backdrop-blur-sm focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300"
            >
              <option>Neşeli</option>
              <option>Hüzünlü</option>
              <option>Derin</option>
              <option>Gizemli</option>
            </select>
          </div>

          <div>
            <label class="block mb-2 font-medium text-white">Uzunluk</label>
            <select
              v-model="uzunluk"
              class="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/20 text-white backdrop-blur-sm focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300"
            >
              <option>Kısa</option>
              <option>Orta</option>
              <option>Uzun</option>
            </select>
          </div>

          <div>
            <label class="block mb-2 font-medium text-white">Tür</label>
            <select
              v-model="tur"
              class="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/20 text-white backdrop-blur-sm focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300"
            >
              <option value="siir">Şiir</option>
              <option value="hikaye">Hikâye</option>
              <option value="sarki">Şarkı Sözü</option>
            </select>
          </div>
        </div>

        <div class="flex gap-4 justify-center">
          <button
            @click="generate"
            :disabled="loading"
            class="px-8 py-3 rounded-lg font-semibold text-white shadow-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
          >
            {{ loading ? "Oluşturuluyor..." : "Oluştur" }}
          </button>
          <button
            @click="reset"
            class="px-6 py-3 rounded-lg font-medium text-white bg-white/10 border border-white/20 backdrop-blur-sm hover:bg-white/20 transform hover:-translate-y-1 transition-all duration-300"
          >
            Temizle
          </button>
        </div>

        <div v-if="poem" class="mt-8">
          <h2 class="text-2xl font-semibold mb-4 text-white text-center">
            Oluşan
            {{
              tur === "siir"
                ? "Şiir"
                : tur === "hikaye"
                ? "Hikâye"
                : "Şarkı Sözü"
            }}
          </h2>
          <div class="p-6 rounded-lg bg-black/20 border border-white/10 backdrop-blur-sm">
            <div
              v-for="(line, idx) in animatedLines"
              :key="idx"
              class="overflow-hidden"
            >
              <p
                :style="{
                  opacity: line.visible ? 1 : 0,
                  transition: 'opacity 0.5s ease',
                  margin: '8px 0',
                }"
                class="text-white text-lg leading-relaxed"
              >
                {{ line.text }}
              </p>
            </div>
          </div>

          <div class="mt-6 flex gap-3 justify-center">
            <button
              @click="speak"
              class="px-4 py-2 rounded-lg text-white bg-white/10 border border-white/20 backdrop-blur-sm hover:bg-white/20 transform hover:-translate-y-1 transition-all duration-300"
            >
              Sesli Oku
            </button>
            <button
              @click="regen"
              class="px-4 py-2 rounded-lg text-white bg-white/10 border border-white/20 backdrop-blur-sm hover:bg-white/20 transform hover:-translate-y-1 transition-all duration-300"
            >
              Yeniden Oluştur
            </button>
          </div>
        </div>

        <div
          v-if="error"
          class="text-red-400 mt-4 text-center bg-red-900/20 p-4 rounded-lg border border-red-500/20"
        >
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const tema = ref("Aşk");
const duygu = ref("Hüzünlü");
const uzunluk = ref("Kısa");
const tur = ref("siir");
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
        uzunluk: uzunluk.value,
        tur: tur.value,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Üretilemedi");
    }
    poem.value = data.text;

    // Hangi kaynaktan geldiğini konsola yazdır
    if (data.source === "openai") {
      console.log("✅ OpenAI'dan içerik alındı");
    } else {
      console.log("📚 Fallback sisteminden içerik alındı");
    }

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
select option {
  background: #1f2937;
  color: white;
}

.prose p {
  font-size: 1.1rem;
}
</style>
