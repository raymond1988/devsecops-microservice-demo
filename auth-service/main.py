from fastapi import FastAPI, Header, HTTPException

app = FastAPI()

@app.get("/validate")
def validate_token(authorization: str = Header(None)):
    # Simple token check demonstrating service-to-service auth validation
    if authorization == "Bearer secret-token-123":
        return {"status": "authenticated", "user_id": "usr_99823"}
    raise HTTPException(status_code=401, detail="Invalid or missing token")

@app.get("/fun")
def test_page():
    return {"status" : "fun indeed"}