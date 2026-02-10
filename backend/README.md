# LockFocus Backend

This is the FastAPI backend for LockFocus.

## Prerequisites

- Python 3.8+
- pip

## Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create a virtual environment (optional but recommended):**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

## Running the Server

Start the server using `uvicorn`:

```bash
uvicorn main:app --reload
```

The API will be available at [http://localhost:8000](http://localhost:8000).

## API Documentation

Interactive API documentation (Swagger UI) is available at:
[http://localhost:8000/docs](http://localhost:8000/docs)
