from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import numpy as np
from supabase import create_client, Client
import os
import sys
import logging
from .settings import Settings, IS_CI

# =============================================================================
# Initialize settings with validation
# =============================================================================

try:
    settings = Settings()
except Exception as e:
    if IS_CI:
        logging.warning(f"CI environment - using defaults due to: {e}")
        # Create a minimal settings object for CI
        class MinimalSettings:
            SUPABASE_URL = 'https://placeholder.supabase.co'
            SUPABASE_ANON_KEY = 'placeholder-key'
            API_TOKEN = 'ci-test-token'
            LOG_LEVEL = 'INFO'
            ENVIRONMENT = 'ci'
            RETURN_EMBEDDINGS = False
            def get_cors_origins(self):
                return ['*']
        settings = MinimalSettings()
    else:
        logging.error(f"FATAL: Missing required environment variables: {e}")
        logging.error("Required: SUPABASE_URL, SUPABASE_ANON_KEY, API_TOKEN")
        sys.exit(1)

# Initialize logging with configured level
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Initialize app
app = FastAPI(title="Palette Forge Service", version="1.0.0")

# CORS middleware with configurable origins
allowed_origins = settings.get_cors_origins()
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# Log CORS configuration on startup
logger.info(f"CORS allowed origins: {allowed_origins}")
logger.info(f"Environment: {settings.ENVIRONMENT}")

# Initialize Supabase client
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)

# Request/Response models
class ScoreRequest(BaseModel):
    image_url: str
    campaign_id: Optional[str] = None
    
class ScoreResponse(BaseModel):
    asset_id: str
    palette_scores: Dict[str, float]
    dominant_colors: List[str]
    embedding: Optional[List[float]] = None

class SimilarRequest(BaseModel):
    query: str
    limit: int = 10
    threshold: float = 0.7

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    version: str

# Dependency for API key auth
async def verify_api_key(authorization: str = Header(...)):
    """Verify Bearer token matches configured API token"""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header format")
    token = authorization.split(" ")[1]
    if token != settings.API_TOKEN:
        logger.warning("Invalid API token attempt")
        raise HTTPException(status_code=401, detail="Invalid API token")
    return token

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        model_loaded=True,  # TODO: Check actual model status
        version="1.0.0"
    )

@app.post("/score", response_model=ScoreResponse, dependencies=[Depends(verify_api_key)])
async def score_image(request: ScoreRequest):
    """Score an image using the palette forge model"""
    try:
        # TODO: Implement actual model scoring
        # For now, return mock data
        logger.info(f"Scoring image: {request.image_url}")
        
        # Generate mock embedding
        embedding = np.random.rand(1536).tolist()
        
        # Store in Supabase if campaign_id provided
        asset_id = None
        if request.campaign_id:
            result = supabase.table("creative_ops.assets").insert({
                "campaign_id": request.campaign_id,
                "storage_url": request.image_url,
                "embed": embedding
            }).execute()
            asset_id = result.data[0]["id"]
        
        return ScoreResponse(
            asset_id=asset_id or "mock-id",
            palette_scores={
                "warmth": 0.85,
                "energy": 0.72,
                "sophistication": 0.91
            },
            dominant_colors=["#FF6B6B", "#4ECDC4", "#45B7D1"],
            embedding=embedding if settings.RETURN_EMBEDDINGS else None
        )
    except Exception as e:
        logger.error(f"Error scoring image: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/similar", dependencies=[Depends(verify_api_key)])
async def find_similar(request: SimilarRequest):
    """Find similar assets using pgvector"""
    try:
        # TODO: Implement actual similarity search
        logger.info(f"Finding similar assets for query: {request.query}")
        
        # Mock response
        return {
            "query": request.query,
            "results": [
                {
                    "asset_id": "mock-1",
                    "similarity": 0.92,
                    "storage_url": "https://example.com/asset1.jpg"
                },
                {
                    "asset_id": "mock-2", 
                    "similarity": 0.88,
                    "storage_url": "https://example.com/asset2.jpg"
                }
            ]
        }
    except Exception as e:
        logger.error(f"Error finding similar assets: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)