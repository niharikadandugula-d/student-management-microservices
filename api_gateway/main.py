
import os

import httpx
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response

app = FastAPI(
    title="Student Management API Gateway",
    description="Single entry point for authentication, students, and courses",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://127.0.0.1:8001")
STUDENT_SERVICE_URL = os.getenv("STUDENT_SERVICE_URL", "http://127.0.0.1:8002")
COURSE_SERVICE_URL = os.getenv("COURSE_SERVICE_URL", "http://127.0.0.1:8003")


@app.get("/")
def home():
    return {
        "message": "Student Management API Gateway is running",
        "services": {
            "auth": AUTH_SERVICE_URL,
            "students": STUDENT_SERVICE_URL,
            "courses": COURSE_SERVICE_URL,
        },
    }


@app.get("/health")
async def health():
    results = {}

    async with httpx.AsyncClient(timeout=3.0) as client:
        for name, url in [
            ("auth", AUTH_SERVICE_URL),
            ("students", STUDENT_SERVICE_URL),
            ("courses", COURSE_SERVICE_URL),
        ]:
            try:
                response = await client.get(f"{url}/")
                results[name] = {
                    "status": "healthy" if response.is_success else "unhealthy",
                    "http_status": response.status_code,
                }
            except httpx.RequestError:
                results[name] = {"status": "unavailable"}

    overall = all(item["status"] == "healthy" for item in results.values())
    return JSONResponse(
        status_code=200 if overall else 503,
        content={
            "status": "healthy" if overall else "degraded",
            "services": results,
        },
    )


async def forward_request(request: Request, target_url: str):
    body = await request.body()
    headers = {
        key: value
        for key, value in request.headers.items()
        if key.lower() not in {"host", "content-length", "connection"}
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            upstream = await client.request(
                method=request.method,
                url=target_url,
                params=request.query_params,
                content=body,
                headers=headers,
            )
    except httpx.RequestError:
        return JSONResponse(
            status_code=503,
            content={"detail": "Target microservice is unavailable"},
        )

    excluded_headers = {"content-encoding", "transfer-encoding", "connection"}
    response_headers = {
        key: value
        for key, value in upstream.headers.items()
        if key.lower() not in excluded_headers
    }

    return Response(
        content=upstream.content,
        status_code=upstream.status_code,
        headers=response_headers,
        media_type=upstream.headers.get("content-type"),
    )


@app.api_route(
    "/auth/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
)
async def auth_proxy(path: str, request: Request):
    return await forward_request(request, f"{AUTH_SERVICE_URL}/auth/{path}")


@app.api_route("/students", methods=["GET", "POST", "OPTIONS"])
async def students_root_proxy(request: Request):
    return await forward_request(request, f"{STUDENT_SERVICE_URL}/students")


@app.api_route(
    "/students/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
)
async def students_proxy(path: str, request: Request):
    return await forward_request(
        request, f"{STUDENT_SERVICE_URL}/students/{path}"
    )


@app.api_route("/courses", methods=["GET", "POST", "OPTIONS"])
async def courses_root_proxy(request: Request):
    return await forward_request(request, f"{COURSE_SERVICE_URL}/courses")


@app.api_route(
    "/courses/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
)
async def courses_proxy(path: str, request: Request):
    return await forward_request(
        request, f"{COURSE_SERVICE_URL}/courses/{path}"
    )
