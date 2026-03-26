"""Профиль пользователя: просмотр, редактирование, аватар, список пользователей"""
import json
import os
import hashlib
import hmac
import base64
import time
import psycopg2
import boto3


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


def get_s3():
    return boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )


def handler(event: dict, context) -> dict:
    """Профиль: GET /users — список, GET /?user_id=X — профиль, POST / action=update_bio|upload_avatar"""
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
    params = event.get("queryStringParameters") or {}

    if method == "GET":
        conn = get_conn()
        cur = conn.cursor()

        # Список всех пользователей
        if params.get("list") == "1":
            cur.execute(f"SELECT id, username, avatar_url, bio FROM {schema}.users ORDER BY id ASC")
            rows = cur.fetchall()
            conn.close()
            users = [{"id": r[0], "username": r[1], "avatar_url": r[2], "bio": r[3]} for r in rows]
            return {"statusCode": 200, "headers": cors, "body": json.dumps({"users": users})}

        # Профиль конкретного пользователя
        user_id = params.get("user_id", "")
        if user_id:
            cur.execute(f"SELECT id, username, avatar_url, bio, created_at FROM {schema}.users WHERE id = {int(user_id)}")
            row = cur.fetchone()
            conn.close()
            if not row:
                return {"statusCode": 404, "headers": cors, "body": json.dumps({"error": "Пользователь не найден"})}
            return {"statusCode": 200, "headers": cors, "body": json.dumps({
                "id": row[0], "username": row[1], "avatar_url": row[2],
                "bio": row[3], "created_at": row[4].isoformat()
            })}

        conn.close()
        return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "Укажите user_id или list=1"})}

    if method == "POST":
        token = event.get("headers", {}).get("X-Auth-Token", "")
        user_data = verify_token(token)
        if not user_data:
            return {"statusCode": 401, "headers": cors, "body": json.dumps({"error": "Не авторизован"})}

        my_id = user_data["user_id"]
        body = json.loads(event.get("body") or "{}")
        action = body.get("action", "")

        conn = get_conn()
        cur = conn.cursor()

        if action == "update_bio":
            bio = (body.get("bio") or "").strip()[:300]
            username = (body.get("username") or "").strip()[:50]
            safe_bio = bio.replace("'", "''")
            safe_username = username.replace("'", "''")
            if safe_username:
                cur.execute(f"SELECT id FROM {schema}.users WHERE username = '{safe_username}' AND id != {my_id}")
                if cur.fetchone():
                    conn.close()
                    return {"statusCode": 409, "headers": cors, "body": json.dumps({"error": "Имя уже занято"})}
                cur.execute(f"UPDATE {schema}.users SET bio = '{safe_bio}', username = '{safe_username}' WHERE id = {my_id}")
            else:
                cur.execute(f"UPDATE {schema}.users SET bio = '{safe_bio}' WHERE id = {my_id}")
            conn.commit()
            conn.close()
            return {"statusCode": 200, "headers": cors, "body": json.dumps({"ok": True})}

        if action == "upload_avatar":
            image_b64 = body.get("image", "")
            content_type = body.get("content_type", "image/jpeg")
            if not image_b64:
                conn.close()
                return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "Нет изображения"})}
            img_data = base64.b64decode(image_b64)
            key = f"avatars/{my_id}.jpg"
            s3 = get_s3()
            s3.put_object(Bucket="files", Key=key, Body=img_data, ContentType=content_type)
            cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/files/{key}?t={int(time.time())}"
            cur.execute(f"UPDATE {schema}.users SET avatar_url = '{cdn_url}' WHERE id = {my_id}")
            conn.commit()
            conn.close()
            return {"statusCode": 200, "headers": cors, "body": json.dumps({"avatar_url": cdn_url})}

        conn.close()
        return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "Неизвестное действие"})}

    return {"statusCode": 404, "headers": cors, "body": json.dumps({"error": "Не найдено"})}
