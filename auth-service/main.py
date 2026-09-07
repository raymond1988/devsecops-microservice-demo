from fastapi import FastAPI, Header, HTTPException
import jwt
import datetime

app = FastAPI()

# In production, load this securely from an environment variable / secrets manager
SECRET_KEY = "super-secret-key-change-in-production"
ALGORITHM = "HS256"

@app.post("/login")
def login(user_credentials: dict):
    # Mock user validation
    if user_credentials.get("username") == "admin" and user_credentials.get("password") == "password123":
        payload = {
            "sub": "usr_99823",
            "role": "admin",
            "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1)
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
        return {"access_token": token, "token_type": "bearer"}
    
    raise HTTPException(status_code=401, detail="Invalid credentials")


@app.get("/validate")
def validate_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or malformed token")
    
    token = authorization.split(" ")[1]
    try:
        # Decodes signature and verifies expiration time ('exp')
        decoded = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {"status": "valid", "user_id": decoded["sub"], "role": decoded["role"]}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token signature")