import telebot
from telebot import types
from telebot.types import WebAppInfo, ReplyKeyboardMarkup, KeyboardButton
import random
import json
import os
import mysql.connector
from mysql.connector import pooling, Error

# ==================== НАСТРОЙКИ ====================
TOKEN = '8859524761:AAH9Q82RfQxbQwnYlCYlwvH1gQI8Zvc-f7Y'
telebot.apihelper.API_URL = "https://telegram-proxy.bezukhov-telegram-proxy.workers.dev/bot{0}/{1}"

# ССЫЛКА НА ВАШ WEB APP (GitHub Pages)
WEBAPP_URL = "https://emoserega.github.io/vuzupuzo/"

DB_CONFIG = {
    'host': '127.127.126.26',
    'port': 3306,
    'user': 'root',
    'password': '',
    'database': 'vuzik',
    'charset': 'utf8mb4',
    'use_unicode': True,
}

# Создаем пул соединений
try:
    db_pool = pooling.MySQLConnectionPool(
        pool_name="vuz_pool", pool_size=5, pool_reset_session=True, **DB_CONFIG
    )
    print("✅ Пул соединений с MySQL создан")
except Error as e:
    print(f"❌ Ошибка подключения к MySQL: {e}")
    raise

bot = telebot.TeleBot(TOKEN)
user_state = {}

# ==================== ФУНКЦИИ БАЗЫ ДАННЫХ ====================
def get_directions():
    conn = db_pool.get_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT DISTINCT direction FROM universities")
        return [r[0] for r in cur.fetchall()]
    finally:
        conn.close()

def get_cities():
    conn = db_pool.get_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT id, name FROM cities ORDER BY name")
        return cur.fetchall()
    finally:
        conn.close()

def get_unis_list(direction, city_id=None):
    conn = db_pool.get_connection()
    try:
        cur = conn.cursor()
        if city_id:
            cur.execute("SELECT name FROM universities WHERE direction = %s AND city_id = %s", (direction, city_id))
        else:
            cur.execute("SELECT name FROM universities WHERE direction = %s", (direction,))
        return [r[0] for r in cur.fetchall()]
    finally:
        conn.close()

def get_uni_info(name):
    conn = db_pool.get_connection()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT u.*, c.name as city_name FROM universities u JOIN cities c ON u.city_id = c.id WHERE u.name = %s", (name,))
        return cur.fetchone()
    finally:
        conn.close()

# ==================== КЛАВИАТУРЫ ====================

def main_menu():
    """Главное меню с кнопкой WebApp"""
    markup = ReplyKeyboardMarkup(resize_keyboard=True)
    # КНОПКА WEB APP — открывает HTML-интерфейс
    markup.add(KeyboardButton(
        text="🎓 Открыть интерфейс вузов",
        web_app=WebAppInfo(url=WEBAPP_URL)
    ))
    markup.add(KeyboardButton('🔍 Найти вуз'))
    markup.add(KeyboardButton('🎲 Случайный вуз'))
    return markup

def uni_menu(unis):
    markup = ReplyKeyboardMarkup(resize_keyboard=True)
    for u in unis:
        markup.add(KeyboardButton(f"🏛 {u}"))
    markup.add(KeyboardButton('⬅️ В главное меню'))
    return markup

# ==================== ОТПРАВКА ВУЗА ====================
def send_uni(chat_id, name):
    info = get_uni_info(name)
    if not info:
        bot.send_message(chat_id, "Вуз не найден в базе.")
        return
    
    caption = f"🎓 {info['name']}\n\n🏙 Город: {info['city_name']}\n📚 Направление: {info['direction']}\n📊 Мин. балл: {info['min_score']}\n\n{info['description']}"
    
    # Отправляем локальное фото по направлению
    direction = info['direction']
    photo_path = None
    if "IT" in direction: photo_path = 'photos/it.jpg'
    elif "Юриспруденция" in direction: photo_path = 'photos/ur.jpg'
    elif "Медицина" in direction: photo_path = 'photos/med.jpg'
    elif "Экономика" in direction: photo_path = 'photos/ek.jpg'
    elif "Инженерия" in direction: photo_path = 'photos/inj.jpg'
    elif "Гуманитарные" in direction: photo_path = 'photos/gum.jpg'

    if photo_path and os.path.exists(photo_path):
        with open(photo_path, 'rb') as photo:
            bot.send_photo(chat_id, photo, caption=caption)
        return
    bot.send_message(chat_id, caption)

# ==================== ХЭНДЛЕРЫ ====================

@bot.message_handler(commands=['start'])
def start(message):
    bot.send_message(
        message.chat.id,
        f"Привет, {message.from_user.first_name}! 👋\n"
        "Нажми «🎓 Открыть интерфейс вузов» — откроется приложение внутри Telegram.",
        reply_markup=main_menu()
    )

@bot.message_handler(func=lambda m: m.text and m.text.lower() in ['привет', 'здравствуй'])
def hello(message):
    bot.send_message(message.chat.id, "Привет! 👋", reply_markup=main_menu())

@bot.message_handler(func=lambda m: m.text == '⬅️ В главное меню')
def back_to_main(message):
    user_state.pop(message.chat.id, None)
    bot.send_message(message.chat.id, "Главное меню:", reply_markup=main_menu())

@bot.message_handler(func=lambda m: m.text == '🎲 Случайный вуз')
def random_uni(message):
    conn = db_pool.get_connection()
    cur = conn.cursor()
    cur.execute("SELECT name FROM universities ORDER BY RAND() LIMIT 1")
    row = cur.fetchone()
    conn.close()
    if row:
        send_uni(message.chat.id, row[0])

@bot.message_handler(func=lambda m: m.text and m.text.startswith('🏛 '))
def uni_btn(message):
    name = message.text[2:].strip()
    send_uni(message.chat.id, name)

# ==================== ОБРАБОТКА ДАННЫХ ИЗ WEB APP ====================
@bot.message_handler(content_types=['web_app_data'])
def webapp_handler(message):
    """Ловит данные, отправленные из app.js через tg.sendData()"""
    try:
        # Десериализуем JSON
        data = json.loads(message.web_app_data.data)
        direction = data.get("direction")

        if not direction:
            bot.send_message(message.chat.id, "❌ Направление не выбрано.")
            return

        # Достаем вузы из базы
        unis = get_unis_list(direction)

        if not unis:
            bot.send_message(message.chat.id, f"😔 По направлению «{direction}» пока нет вузов.")
            return

        bot.send_message(
            message.chat.id,
            f"🎓 Вузы по направлению «{direction}»:",
            reply_markup=uni_menu(unis)
        )

    except Exception as e:
        print(f"❌ Ошибка webapp: {e}")
        bot.send_message(message.chat.id, "Ошибка обработки данных с интерфейса.")

# ==================== ЗАПУСК ====================
if __name__ == '__main__':
    print("🚀 Бот запущен!")
    bot.infinity_polling(timeout=20, long_polling_timeout=20)
