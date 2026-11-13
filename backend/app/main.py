from fastapi import FastAPI

app = FastAPI(title="BookIT API")


@app.get("/health")
def health():
    return {"status": "ok"}
