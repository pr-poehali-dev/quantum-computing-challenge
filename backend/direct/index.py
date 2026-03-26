"""Личные сообщения между пользователями"""
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
    """Личные чаты: GET ?with=USER_ID — история, POST — отправить сообщение"""
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
    token = event.get("headers", {}).get("X-Auth-Token", "")
    user_data = verify_token(token)
    if not user_data:
        return {"statusCode": 401, "headers": cors, "body": json.dumps({"error": "Не авторизован"})}

    my_id = user_data["user_id"]
    params = event.get("queryStringParameters") or {}

    if method == "GET":
        with_id = params.get("with", "")
        if not with_id:
            return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "Укажите with=USER_ID"})}
        with_id = int(with_id)
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"SELECT dm.id, dm.from_user_id, u.username, dm.text, dm.created_at "
            f"FROM {schema}.direct_messages dm "
            f"JOIN {schema}.users u ON u.id = dm.from_user_id "
            f"WHERE (dm.from_user_id = {my_id} AND dm.to_user_id = {with_id}) "
            f"  OR  (dm.from_user_id = {with_id} AND dm.to_user_id = {my_id}) "
            f"ORDER BY dm.created_at ASC LIMIT 200"
        )
        rows = cur.fetchall()
        conn.close()
        messages = [{"id": r[0], "from_user_id": r[1], "username": r[2], "text": r[3], "created_at": r[4].isoformat()} for r in rows]
        return {"statusCode": 200, "headers": cors, "body": json.dumps({"messages": messages})}

    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        to_id = body.get("to_user_id")
        text = (body.get("text") or "").strip()
        if not to_id or not text or len(text) > 1000:
            return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "Укажите to_user_id и text"})}
        safe_text = text.replace("'", "''")
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO {schema}.direct_messages (from_user_id, to_user_id, text) "
            f"VALUES ({my_id}, {int(to_id)}, '{safe_text}') RETURNING id, created_at"
        )
        row = cur.fetchone()
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": cors, "body": json.dumps({
            "id": row[0], "from_user_id": my_id, "to_user_id": to_id,
            "text": text, "created_at": row[1].isoformat()
        })}

    return {"statusCode": 404, "headers": cors, "body": json.dumps({"error": "Не найдено"})}
