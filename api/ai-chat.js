// api/ai-chat.js  (Vercel Serverless Function)
const ALLOW_ORIGINS = ["https://damdada.co.kr","https://www.damdada.co.kr"];

module.exports = async (req, res) => {
  const origin = req.headers.origin || "";
  const allow = ALLOW_ORIGINS.includes(origin) ? origin : ALLOW_ORIGINS[0];

  res.setHeader("Access-Control-Allow-Origin", allow);
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST")  return res.status(405).send("Method Not Allowed");

  const userMessage = (req.body?.message || "").toString().slice(0, 2000);

  const systemPrompt = `당신은 DAMDADA 한국어 쇼핑 어시스턴트다.
1줄 요약 → 불릿 2~3개 → 사용팁 순서. 과장/의료표현 금지, 모르면 '확인 필요'라고 말하기.`;

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.6,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ]
      })
    });
    if (!r.ok) return res.status(500).send(await r.text());
    const data = await r.json();
    res.json({ reply: data?.choices?.[0]?.message?.content ?? "" });
  } catch {
    res.status(500).send("Server error");
  }
};
