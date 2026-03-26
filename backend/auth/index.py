"""Регистрация и вход пользователей платформы Планета"""
import json
import os
import hashlib
import hmac
import base64
import time
import psycopg2


def make_token(user_id: int, email: str) -> str:
    secret = os.environ.get("JWT_SECRET", "secret")
    payload = base64.b64encode(json.dumps({"user_id": user_id, "email": email, "exp": int(time.time()) + 86400 * 30}).encode()).decode()
    header = base64.b64encode(b'{"alg":"HS256"}').decode()
    sig = hmac.new(secret.encode(), f"{header}.{payload}".encode(), hashlib.sha256).hexdigest()
    return f"{header}.{payload}.{sig}"


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


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    """Регистрация и вход: action=register|login|me в теле запроса"""
    cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors, "body": ""}

    schema = os.environ.get("MAIN_DB_SCHEMA", "public")
    method = event.get("httpMethod", "GET")
    body = json.loads(event.get("body") or "{}")
    action = body.get("action", "")

    # me — проверка токена
    if action == "me":
        token = event.get("headers", {}).get("X-Auth-Token", "")
        data = verify_token(token)
        if not data:
            return {"statusCode": 401, "headers": cors, "body": json.dumps({"error": "Не авторизован"})}
        return {"statusCode": 200, "headers": cors, "body": json.dumps({"user_id": data["user_id"], "email": data["email"]})}

    # register
    if action == "register":
        email = (body.get("email") or "").strip().lower()
        username = (body.get("username") or "").strip()
        password = body.get("password") or ""

        if not email or not username or not password:
            return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "Заполните все поля"})}
        if len(password) < 6:
            return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "Пароль минимум 6 символов"})}

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT id FROM {schema}.users WHERE email = '{email}' OR username = '{username}'")
        if cur.fetchone():
            conn.close()
            return {"statusCode": 409, "headers": cors, "body": json.dumps({"error": "Email или имя уже занято"})}

        pw_hash = hash_password(password)
        cur.execute(f"INSERT INTO {schema}.users (email, username, password_hash) VALUES ('{email}', '{username}', '{pw_hash}') RETURNING id")
        user_id = cur.fetchone()[0]
        conn.commit()
        conn.close()

        token = make_token(user_id, email)
        return {"statusCode": 200, "headers": cors, "body": json.dumps({"token": token, "user_id": user_id, "username": username})}

    # login
    if action == "login":
        email = (body.get("email") or "").strip().lower()
        password = body.get("password") or ""

        if not email or not password:
            return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "Заполните все поля"})}

        pw_hash = hash_password(password)
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT id, username FROM {schema}.users WHERE email = '{email}' AND password_hash = '{pw_hash}'")
        row = cur.fetchone()
        conn.close()

        if not row:
            return {"statusCode": 401, "headers": cors, "body": json.dumps({"error": "Неверный email или пароль"})}

        token = make_token(row[0], email)
        return {"statusCode": 200, "headers": cors, "body": json.dumps({"token": token, "user_id": row[0], "username": row[1]})}

    return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "Неизвестное действие"})}
