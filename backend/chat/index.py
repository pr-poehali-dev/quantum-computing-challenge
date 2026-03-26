"""Чат Планеты — отправка и получение сообщений"""
import json
import os
import hashlib
import hmac
import base64
import time
import psycopg2


def verify_token(token: str):
    try:
        secret = os.environ.get("JWT_SECRET", "secret")
        header, payload, sig = token.split(".")
        expected = hmac.new(secret.encode(), f"{header}.{payload}".encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected):
            return None
        data = json.loads(base64.b64decode(payload + "==").decode())
        if data.get("exp", 0) < time.time():
            return None
        return data
    except Exception:
        return None


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    """Чат: GET — последние сообщения, POST — отправить сообщение"""
    cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
        "Content-Type": "application/json",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors, "body": ""}

    schema = os.environ.get("MAIN_DB_SCHEMA", "public")
    method = event.get("httpMethod", "GET")

    if method == "GET":
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT id, user_id, username, text, created_at FROM {schema}.messages ORDER BY created_at DESC LIMIT 100")
        rows = cur.fetchall()
        conn.close()
        messages = [
            {"id": r[0], "user_id": r[1], "username": r[2], "text": r[3], "created_at": r[4].isoformat()}
            for r in reversed(rows)
        ]
        return {"statusCode": 200, "headers": cors, "body": json.dumps({"messages": messages})}

    if method == "POST":
        token = event.get("headers", {}).get("X-Auth-Token", "")
        user_data = verify_token(token)
        if not user_data:
            return {"statusCode": 401, "headers": cors, "body": json.dumps({"error": "Не авторизован"})}

        body = json.loads(event.get("body") or "{}")
        text = (body.get("text") or "").strip()
        if not text or len(text) > 1000:
            return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "Пустое или слишком длинное сообщение"})}

        user_id = user_data["user_id"]
        email = user_data["email"]

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT username FROM {schema}.users WHERE id = {user_id}")
        row = cur.fetchone()
        username = row[0] if row else email.split("@")[0]

        safe_text = text.replace("'", "''")
        safe_username = username.replace("'", "''")
        cur.execute(f"INSERT INTO {schema}.messages (user_id, username, text) VALUES ({user_id}, '{safe_username}', '{safe_text}') RETURNING id, created_at")
        msg_id, created_at = cur.fetchone()
        conn.commit()
        conn.close()

        return {"statusCode": 200, "headers": cors, "body": json.dumps({
            "id": msg_id, "user_id": user_id, "username": username,
            "text": text, "created_at": created_at.isoformat()
        })}

    return {"statusCode": 404, "headers": cors, "body": json.dumps({"error": "Не найдено"})}
