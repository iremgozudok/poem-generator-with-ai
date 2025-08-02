import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";
import { mockData } from "./mockData";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" })); // frontend adresine göre ayarla

const OPENAI_KEY = process.env.OPENAI_API_KEY || "";
const useOpenAI = Boolean(OPENAI_KEY);

app.post("/generate-poem", async (req, res) => {
  const { tema = "Aşk", duygu = "Hüzünlü", uzunluk = "Kısa", tur = "siir" } = req.body;
  
  try {

        // Eğer OpenAI anahtarı varsa AI üzerinden üretmeyi dene
    if (useOpenAI) {
      console.log("OpenAI anahtarı bulundu, AI üretimi deneniyor...");
      
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
        model: "gpt-3.5-turbo",
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
        // OpenAI hatası durumunda fallback sistemine geç
        console.log("OpenAI hatası, fallback sistemine geçiliyor:", data.error?.message);
        // return ile durdurmuyoruz, fallback sistemine devam ediyoruz
      } else {
        const text = data.choices?.[0]?.message?.content || "";
        return res.json({ text: text.trim(), source: "openai" });
      }
    } else {
      console.log("OpenAI anahtarı bulunamadı, fallback sistemine geçiliyor...");
    }
  } catch (err: any) {
    console.error("OpenAI hatası, fallback sistemine geçiliyor:", err);
    // Hata durumunda da fallback sistemine geç
  }

  // --- fallback: sabit içeriklerden rastgele seç ve döndür ---
  const turData = (mockData as any)[tur] || mockData.siir;
  const temaData = turData[tema] || turData["Aşk"];
  const duyguData = temaData[duygu] || temaData["Hüzünlü"];
  const uzunlukData = duyguData[uzunluk] || duyguData["Kısa"];

  if (uzunlukData && uzunlukData.length > 0) {
    const rastgeleIndex = Math.floor(Math.random() * uzunlukData.length);
    const text = uzunlukData[rastgeleIndex];
    res.json({ text, source: "fallback" });
  } else {
    // Eğer veri bulunamazsa varsayılan bir metin döndür
    const defaultText = tur === "siir" 
      ? uzunluk === "Kısa" 
        ? "Güzel bir gün\nGüneş ışıldıyor\nMutluluk doluyor içim\nHer şey güzel"
        : uzunluk === "Orta"
        ? "Güzel bir gün\nGüneş ışıldıyor\nMutluluk doluyor içim\nHer şey güzel\n\nKuşlar şarkı söylüyor\nÇiçekler açıyor\nDoğa canlanıyor\nBahar geldi"
        : "Güzel bir gün\nGüneş ışıldıyor\nMutluluk doluyor içim\nHer şey güzel\n\nKuşlar şarkı söylüyor\nÇiçekler açıyor\nDoğa canlanıyor\nBahar geldi\n\nRüzgar esiyor\nYapraklar dans ediyor\nHayat güzel\nHer an değerli"
      : tur === "hikaye"
      ? uzunluk === "Kısa"
        ? "Bir zamanlar güzel bir hikaye vardı. Bu hikaye insanların kalbini ısıtıyordu."
        : uzunluk === "Orta"
        ? "Bir zamanlar güzel bir hikaye vardı. Bu hikaye insanların kalbini ısıtıyordu. Her gün yeni maceralar yaşanıyor ve hayat güzel anılarla doluyor."
        : "Bir zamanlar güzel bir hikaye vardı. Bu hikaye insanların kalbini ısıtıyordu. Her gün yeni maceralar yaşanıyor ve hayat güzel anılarla doluyor. Bu hikaye, dostluğun ve sevginin ne kadar önemli olduğunu gösteriyor."
      : uzunluk === "Kısa"
        ? "Güzel bir şarkı\nSöylüyor kalbim\nMutluluk doluyor içim\nHer şey güzel\n\nNakarat:\nGüzel bir şarkı\nGüzel bir şarkı"
        : uzunluk === "Orta"
        ? "Güzel bir şarkı\nSöylüyor kalbim\nMutluluk doluyor içim\nHer şey güzel\n\nKuşlar eşlik ediyor\nRüzgar sallıyor\nHayat güzel\nHer an değerli\n\nNakarat:\nGüzel bir şarkı\nGüzel bir şarkı"
        : "Güzel bir şarkı\nSöylüyor kalbim\nMutluluk doluyor içim\nHer şey güzel\n\nKuşlar eşlik ediyor\nRüzgar sallıyor\nHayat güzel\nHer an değerli\n\nGökyüzü mavi\nGüneş parlak\nDünya güzel\nHepimiz mutluyuz\n\nNakarat:\nGüzel bir şarkı\nGüzel bir şarkı";
    
    res.json({ text: defaultText, source: "fallback" });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`AI proxy çalışıyor http://localhost:${port}`);
});
