"""
API для работы с чатами и сообщениями
Получение списка чатов, отправка сообщений, создание чатов
"""
import json
import os
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor
import hashlib
import hmac
import base64

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def verify_jwt(token: str):
    try:
        secret = os.environ['JWT_SECRET']
        parts = token.split('.')
        if len(parts) != 3:
            return None
        
        header, payload, signature = parts
        expected_signature = hmac.new(secret.encode(), f"{header}.{payload}".encode(), hashlib.sha256).digest()
        expected_signature_b64 = base64.urlsafe_b64encode(expected_signature).decode().rstrip('=')
        
        if signature != expected_signature_b64:
            return None
        
        payload_data = json.loads(base64.urlsafe_b64decode(payload + '=='))
        if payload_data['exp'] < int(datetime.utcnow().timestamp()):
            return None
        
        return payload_data
    except:
        return None

def get_user_from_token(event):
    auth_header = event.get('headers', {}).get('authorization', '') or event.get('headers', {}).get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header.replace('Bearer ', '')
    return verify_jwt(token)

def handler(event, context):
    method = event.get('httpMethod', 'GET')
    path = event.get('queryStringParameters', {}).get('path', '')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    user_payload = get_user_from_token(event)
    if not user_payload:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unauthorized'}),
            'isBase64Encoded': False
        }
    
    user_id = user_payload['user_id']
    
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET' and path == 'chats':
            cur.execute("""
                SELECT 
                    c.id, c.type, c.name, c.username, c.description, c.avatar_url,
                    cm.is_pinned, cm.is_muted,
                    (SELECT COUNT(*) FROM chat_members WHERE chat_id = c.id) as members_count,
                    (SELECT COUNT(*) FROM messages m 
                     LEFT JOIN read_messages rm ON rm.chat_id = c.id AND rm.user_id = %s
                     WHERE m.chat_id = c.id AND m.sender_id != %s 
                     AND (rm.last_read_message_id IS NULL OR m.id > rm.last_read_message_id)
                    ) as unread_count
                FROM chats c
                JOIN chat_members cm ON cm.chat_id = c.id
                WHERE cm.user_id = %s
                ORDER BY c.updated_at DESC
            """, (user_id, user_id, user_id))
            
            chats = cur.fetchall()
            
            chats_with_messages = []
            for chat in chats:
                cur.execute("""
                    SELECT m.id, m.text, m.created_at, m.sender_id, u.first_name, u.last_name
                    FROM messages m
                    JOIN users u ON u.id = m.sender_id
                    WHERE m.chat_id = %s
                    ORDER BY m.created_at DESC
                    LIMIT 1
                """, (chat['id'],))
                last_message = cur.fetchone()
                
                chat_dict = dict(chat)
                chat_dict['last_message'] = dict(last_message) if last_message else None
                chat_dict['members'] = chat_dict.pop('members_count')
                chats_with_messages.append(chat_dict)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'chats': chats_with_messages}),
                'isBase64Encoded': False
            }
        
        elif method == 'GET' and path.startswith('messages/'):
            chat_id = int(path.split('/')[-1])
            
            cur.execute("SELECT 1 FROM chat_members WHERE chat_id = %s AND user_id = %s", (chat_id, user_id))
            if not cur.fetchone():
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Access denied'}),
                    'isBase64Encoded': False
                }
            
            limit = int(event.get('queryStringParameters', {}).get('limit', '50'))
            offset = int(event.get('queryStringParameters', {}).get('offset', '0'))
            
            cur.execute("""
                SELECT 
                    m.id, m.text, m.message_type, m.media_url, m.media_name, m.media_size,
                    m.is_edited, m.is_forwarded, m.reply_to_id, m.created_at,
                    m.sender_id, u.first_name, u.last_name, u.username, u.avatar_url
                FROM messages m
                JOIN users u ON u.id = m.sender_id
                WHERE m.chat_id = %s
                ORDER BY m.created_at DESC
                LIMIT %s OFFSET %s
            """, (chat_id, limit, offset))
            
            messages = cur.fetchall()
            messages_list = [dict(msg) for msg in reversed(messages)]
            
            for msg in messages_list:
                cur.execute("""
                    SELECT r.emoji, COUNT(*) as count, 
                           BOOL_OR(r.user_id = %s) as selected
                    FROM reactions r
                    WHERE r.message_id = %s
                    GROUP BY r.emoji
                """, (user_id, msg['id']))
                reactions = cur.fetchall()
                msg['reactions'] = [dict(r) for r in reactions]
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'messages': messages_list}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST' and path == 'send':
            body = json.loads(event.get('body', '{}'))
            chat_id = body.get('chat_id')
            text = body.get('text', '').strip()
            message_type = body.get('message_type', 'text')
            
            if not chat_id or not text:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'chat_id and text are required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("SELECT 1 FROM chat_members WHERE chat_id = %s AND user_id = %s", (chat_id, user_id))
            if not cur.fetchone():
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Access denied'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("""
                INSERT INTO messages (chat_id, sender_id, text, message_type)
                VALUES (%s, %s, %s, %s)
                RETURNING id, chat_id, sender_id, text, message_type, created_at
            """, (chat_id, user_id, text, message_type))
            message = cur.fetchone()
            
            cur.execute("UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = %s", (chat_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': dict(message)}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST' and path == 'create-chat':
            body = json.loads(event.get('body', '{}'))
            chat_type = body.get('type', 'private')
            name = body.get('name', '').strip()
            username = body.get('username', '').strip().lower()
            member_ids = body.get('member_ids', [])
            
            if chat_type in ['group', 'channel'] and not name:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Name is required for groups and channels'}),
                    'isBase64Encoded': False
                }
            
            if username:
                cur.execute("SELECT id FROM chats WHERE username = %s", (username,))
                if cur.fetchone():
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Username already exists'}),
                        'isBase64Encoded': False
                    }
            
            cur.execute("""
                INSERT INTO chats (type, name, username, created_by)
                VALUES (%s, %s, %s, %s)
                RETURNING id, type, name, username, created_at
            """, (chat_type, name if name else None, username if username else None, user_id))
            chat = cur.fetchone()
            
            cur.execute("""
                INSERT INTO chat_members (chat_id, user_id, role)
                VALUES (%s, %s, 'owner')
            """, (chat['id'], user_id))
            
            for member_id in member_ids:
                if member_id != user_id:
                    cur.execute("""
                        INSERT INTO chat_members (chat_id, user_id, role)
                        VALUES (%s, %s, 'member')
                    """, (chat['id'], member_id))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'chat': dict(chat)}),
                'isBase64Encoded': False
            }
        
        elif method == 'GET' and path == 'search-users':
            query = event.get('queryStringParameters', {}).get('q', '').strip().lower()
            
            if len(query) < 2:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Query must be at least 2 characters'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("""
                SELECT id, username, first_name, last_name, avatar_url, bio
                FROM users
                WHERE username LIKE %s OR LOWER(first_name) LIKE %s OR LOWER(last_name) LIKE %s
                LIMIT 20
            """, (f'%{query}%', f'%{query}%', f'%{query}%'))
            
            users = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'users': [dict(u) for u in users]}),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Not found'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()
