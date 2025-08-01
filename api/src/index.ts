import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" })); // frontend adresine göre ayarla

const OPENAI_KEY = process.env.OPENAI_API_KEY || "";
const useOpenAI = Boolean(OPENAI_KEY);

// Mock data
const siirler = {
  "Aşk": {
    "Neşeli": [
      "Güneş gibi parlak sevginle",
      "Her sabah yeniden doğuyorum",
      "Kalbimde çiçekler açıyor",
      "Seninle her şey güzel"
    ],
    "Hüzünlü": [
      "Uzaklarda kaybolmuş sevgi",
      "Anılar acıtıyor kalbimi",
      "Yalnızlık sardı dört yanımı",
      "Seni özlüyorum her gece"
    ],
    "Derin": [
      "Sevginin derinliklerinde",
      "Ruhumun en gizli köşelerinde",
      "Seninle bir oluyoruz",
      "Zaman duruyor aramızda"
    ],
    "Gizemli": [
      "Gecenin karanlığında",
      "Gizli bir aşk hikayesi",
      "Kimse bilmiyor gerçeği",
      "Sadece sen ve ben"
    ]
  },
  "Doğa": {
    "Neşeli": [
      "Bahar geldi çiçekler açtı",
      "Kuşlar şarkı söylüyor",
      "Güneş ışıldıyor gökyüzünde",
      "Doğa canlandı yeniden"
    ],
    "Hüzünlü": [
      "Sonbahar yaprakları düşüyor",
      "Hüzün sardı doğayı",
      "Güneş gizlendi bulutların arkasına",
      "Yalnızlık sardı ormanı"
    ],
    "Derin": [
      "Dağların sessizliğinde",
      "Okyanusun derinliklerinde",
      "Doğanın gizli gücü",
      "Bizi sarıyor her yerde"
    ],
    "Gizemli": [
      "Ay ışığında gizli orman",
      "Sisler arasında kaybolmuş yol",
      "Doğanın sırları",
      "Kimse çözemiyor"
    ]
  }
};

app.post("/generate-poem", async (req, res) => {
  try {
    const { tema = "Aşk", duygu = "Hüzünlü", uzunluk = "Kısa", tur = "siir" } = req.body;

    // Eğer OpenAI anahtarı varsa AI üzerinden üret, yoksa fallback şiirleri kullan
    if (useOpenAI) {
      // Prompt oluştur
      let prompt = "";
      if (tur === "siir") {
        prompt = `Bir ${duygu.toLowerCase()} şiir yaz. Tema: ${tema}. ${uzunluk} uzunlukta, akıcı ve özgün olsun. Türkçe yaz. Kısa başlık da ekle.`;
      } else if (tur === "hikaye") {
        prompt = `Kısa bir hikâye yaz. Tema: ${tema}. Atmosfer: ${duygu.toLowerCase()}. ${uzunluk} uzunlukta olsun. Giriş, gelişme, sonuç olsun. Türkçe.`;
      } else if (tur === "sarki") {
        prompt = `Bir şarkı sözü yaz. Türü pop olsun, tema: ${tema}, duygu: ${duygu.toLowerCase()}. Nakarat ve verse yapısı olsun, kolay akılda kalsın. Türkçe.`;
      } else {
        prompt = `Yaratıcı bir metin yaz. Tema: ${tema}, duygu: ${duygu.toLowerCase()}, uzunluk: ${uzunluk}. Türkçe.`;
      }

      // OpenAI çağrısı
      const payload = {
        model: "gpt-3.5-turbo", // Daha ucuzsa bunu kullan. İstersen "gpt-4" ile değiştir (daha pahalıdır).
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 600,
      };

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json() as any;

      if (!response.ok) {
        // Kotayı aşma gibi hataları doğrudan ilet
        return res.status(response.status).json({ error: data.error?.message || "OpenAI hata" });
      }

      const text = data.choices?.[0]?.message?.content || "";
      return res.json({ text: text.trim() });
    }

    // --- fallback: sabit şiirlerden rastgele seç ve döndür ---
    const temaSiirleri = (siirler as any)[tema] || siirler["Aşk"];
    const duyguSiirleri = temaSiirleri[duygu] || temaSiirleri["Hüzünlü"];

    const secilenSiirler: string[] = [];
    for (let i = 0; i < 4; i++) {
      const rastgeleIndex = Math.floor(Math.random() * duyguSiirleri.length);
      secilenSiirler.push(duyguSiirleri[rastgeleIndex]);
    }

    const text = secilenSiirler.join("\n");
    res.json({ text });
  } catch (err: any) {
    console.error("Hata:", err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`AI proxy çalışıyor http://localhost:${port}`);
});
