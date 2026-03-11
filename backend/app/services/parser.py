"""Parse uploaded CSV / XLSX files into text for the LLM."""

import io
import pandas as pd
from fastapi import UploadFile


async def parse_file(file: UploadFile) -> str:
    """Read an uploaded file and return a markdown-table string with stats."""
    contents = await file.read()
    ext = (file.filename or "file.csv").rsplit(".", 1)[-1].lower()

    if ext == "csv":
        df = pd.read_csv(io.BytesIO(contents))
    else:
        df = pd.read_excel(io.BytesIO(contents))

    stats = (
        f"**Dataset Shape:** {len(df)} rows × {len(df.columns)} columns\n"
        f"**Columns:** {', '.join(df.columns.tolist())}\n\n"
        f"### Raw Data (first 50 rows)\n"
        f"{df.head(50).to_markdown(index=False)}\n\n"
        f"### Descriptive Statistics\n"
        f"{df.describe(include='all').to_markdown()}\n"
    )
    return stats
