import os
from openai import OpenAI
from sentence_transformers import SentenceTransformer
from backend.rag.vector_store import search
from dotenv import load_dotenv

load_dotenv()

openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

# --- Retrieval Config ---
TOP_K = 4               # number of chunks to retrieve
GPT_MODEL = "gpt-4o-mini"
TEMPERATURE = 0.2       # low = more factual, high = more creative

SYSTEM_PROMPT = """
You are a knowledgeable assistant that answers questions strictly based 
on the provided document context below.

Rules:
- Only use information present in the context
- If the answer is not in the context, say "I couldn't find that in the documents."
- Always be concise and direct
- When relevant, mention which document or page the information comes from
- Do not make up or infer information not present in the context
""".strip()


def format_context(results: list[dict]) -> str:
    """
    Format retrieved chunks into a readable context block for the LLM.

    Example output:
      [Source: Disaster Response Strategy.pdf | Page 2]
      Tier-2 escalation requires...

      [Source: Environment & Hazard Knowledge.pdf | Page 4]
      Seismic activity above 5.0...
    """
    formatted = []
    for i, r in enumerate(results, 1):
        formatted.append(
            f"[{i}] Source: {r['source']} | Page {r['page']} "
            f"(relevance: {r['score']:.2f})\n{r['chunk']}"
        )
    return "\n\n".join(formatted)


def answer_question(question: str) -> dict:
    """
    Full RAG pipeline:
      1. Embed question using sentence-transformers (free/local)
      2. Retrieve top-k relevant chunks from ChromaDB
      3. Build context from chunks
      4. Send context + question to OpenAI GPT to generate answer

    Returns:
      {
        answer: str,
        sources: [{ source, page, score }],
        context_used: str   <- useful for debugging
      }
    """

    # Step 1: Embed the question locally (sentence-transformers, free)
    print(f"\n🔍 Embedding question: '{question}'")
    query_embedding = embedding_model.encode(question).tolist()

    # Step 2: Search ChromaDB for relevant chunks
    results = search(query_embedding, top_k=TOP_K)

    if not results:
        return {
            "answer": "I couldn't find any relevant information in the documents.",
            "sources": [],
            "context_used": ""
        }

    print(f"📚 Retrieved {len(results)} chunks:")
    for r in results:
        print(f"   - {r['source']} p.{r['page']} (score: {r['score']:.3f})")

    # Step 3: Format retrieved chunks into context
    context = format_context(results)

    # Step 4: Send to OpenAI to generate the answer
    print(f"🤖 Sending to {GPT_MODEL}...")

    response = openai_client.chat.completions.create(
        model=GPT_MODEL,
        temperature=TEMPERATURE,
        messages=[
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            },
            {
                "role": "user",
                "content": (
                    f"Here is the relevant context from the documents:\n\n"
                    f"{context}\n\n"
                    f"Question: {question}"
                )
            }
        ]
    )

    answer = response.choices[0].message.content

    print(f"✅ Answer generated ({len(answer)} chars)")

    return {
        "answer": answer,
        "sources": [
            {
                "source": r["source"],
                "page": r["page"],
                "score": round(r["score"], 3)
            }
            for r in results
        ],
        "context_used": context  # useful for debugging/logging
    }