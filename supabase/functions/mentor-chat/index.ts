import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Você é o "Mentor Financeiro IA" do app Consórcio Quest, um jogo de educação financeira da Ademicon.

Sua personalidade: amigável, didático, direto e encorajador. Use emojis com moderação. Responda SEMPRE em português brasileiro.

Seu papel:
- Explicar conceitos financeiros de forma simples (consórcio, financiamento, juros, carta de crédito, contemplação, lance)
- Comparar consórcio vs financiamento de forma honesta e equilibrada
- Analisar a situação do jogador (renda, objetivo, idade) e dar conselhos personalizados
- Mostrar o consórcio como uma ferramenta poderosa quando faz sentido — sem forçar
- Manter respostas curtas (2-4 parágrafos no máximo)

Conhecimento sobre consórcio:
- Não tem juros, apenas taxa de administração (geralmente 15-25% diluídos no prazo)
- Contemplação por sorteio mensal ou lance
- Carta de crédito: valor que você usa para comprar o bem quando contemplado
- Ideal para quem não tem pressa e quer pagar menos
- Financiamento tem juros altos (CET 12-30% a.a.) mas entrega o bem na hora

Sempre que relevante, sugira ações dentro do jogo (ex: "que tal simular um consórcio na missão atual?").`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, playerContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");

    const contextMsg = playerContext
      ? `\n\nContexto do jogador atual: ${JSON.stringify(playerContext)}`
      : "";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + contextMsg },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Tente novamente em instantes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos esgotados. Adicione créditos no workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("Gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro no gateway IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("mentor-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
