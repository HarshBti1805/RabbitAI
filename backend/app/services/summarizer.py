"""Generate an executive sales summary using the OpenAI API."""

from openai import AsyncOpenAI
from app.core.config import settings

_client: AsyncOpenAI | None = None


def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    return _client


SYSTEM_PROMPT = """\
You are an elite business analyst at a Fortune 500 company.
Given raw sales data, produce a polished **Executive Sales Brief**:

1. **Overview** – A concise one-paragraph narrative of overall performance.
2. **Key Metrics** – Total revenue, units sold, average unit price, top region, top category.
3. **Trends & Insights** – Month-over-month patterns, standout performers, anomalies.
4. **Risk Flags** – Cancelled orders, declining segments, or any concerns.
5. **Recommendations** – 2-3 actionable next steps for leadership.

Use professional, confident language suitable for a C-suite audience.
Format in clean Markdown.
"""


async def generate_summary(data_text: str) -> str:
    """Call OpenAI to produce a narrative summary of sales data."""
    client = _get_client()
    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": (
                    "Here is the sales data to analyze:\n\n"
                    f"{data_text}\n\n"
                    "Please produce the Executive Sales Brief now."
                ),
            },
        ],
        temperature=0.4,
        max_tokens=2048,
    )
    return response.choices[0].message.content or ""
