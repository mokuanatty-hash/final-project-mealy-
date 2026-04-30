from flask import Flask, jsonify, request
from flask_cors import CORS
import time
import os
import json
import base64
import requests
from datetime import datetime

app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:8080",
    "http://localhost:8082",
    "https://mealy-steel.vercel.app"
])

# In-memory data for demo   
users = [
    {"username": "admin", "password": "admin", "type": "admin"},
    {"username": "customer", "password": "customer", "type": "customer"},
]

meals = [
    {
        "id": 1,
        "name": "Grilled Chicken Bowl",
        "description": "Grilled chicken breast with quinoa, roasted vegetables, and herb sauce",
        "price": 15.99,
        "category": "Protein Bowl",
        "rating": 4.8,
        "cookTime": "25 min"
    },
    {
        "id": 2,
        "name": "Mediterranean Salmon",
        "description": "Pan-seared salmon with couscous, cucumber salad, and tzatziki",
        "price": 18.99,
        "category": "Seafood",
        "rating": 4.9,
        "cookTime": "30 min"
    },
    {
        "id": 3,
        "name": "Veggie Power Bowl",
        "description": "Roasted sweet potato, chickpeas, avocado, and tahini dressing",
        "price": 13.99,
        "category": "Vegetarian",
        "rating": 4.7,
        "cookTime": "20 min"
    },
    {
        "id": 4,
        "name": "BBQ Beef Brisket",
        "description": "Slow-cooked beef brisket with mashed potatoes and coleslaw",
        "price": 19.99,
        "category": "BBQ",
        "rating": 4.6,
        "cookTime": "35 min"
    }
]

ORDERS_FILE = os.path.join(os.path.dirname(__file__), 'orders.json')

def load_orders():
    if os.path.exists(ORDERS_FILE):
        with open(ORDERS_FILE, 'r') as f:
            return json.load(f)
    return [
        {"id": 1, "customerName": "John Doe", "meal": "Grilled Chicken Bowl", "price": 15.99, "time": "12:30 PM"},
        {"id": 2, "customerName": "Jane Smith", "meal": "Mediterranean Salmon", "price": 18.99, "time": "12:35 PM"},
        {"id": 3, "customerName": "Mike Johnson", "meal": "Veggie Power Bowl", "price": 13.99, "time": "12:40 PM"},
        {"id": 4, "customerName": "Sarah Wilson", "meal": "Grilled Chicken Bowl", "price": 15.99, "time": "12:45 PM"},
    ]

def save_orders():
    with open(ORDERS_FILE, 'w') as f:
        json.dump(orders, f, indent=2)

orders = load_orders()

# M-Pesa Daraja sandbox credentials (replace with your own for production)
MPESA_CONSUMER_KEY = "deVq6pjSE4loGNAG4Z7f22efr091Cl6nQLK4nOb4QY6KVzzN"
MPESA_CONSUMER_SECRET = "KHpwYJBUdAs1EbNL1EXD2agkdxIWtodBTopGVoFqWVqwheZdTSP0LXQJselsxsZf"
MPESA_SHORTCODE = "174379"  # Test paybill
MPESA_PASSKEY = "bfb279f9aa9bdbcf15e97dd71a467cd2bfb279f9aa9bdbcf15e97dd71a467cd2"
MPESA_BASE_URL = "https://sandbox.safaricom.co.ke"

@app.route("/api/mpesa/stkpush", methods=["POST"])
def mpesa_stkpush():
    data = request.json
    phone = data.get("phone")
    amount = data.get("amount", 1)  # Default to 1 KES for demo
    if not phone:
        return jsonify({"error": "Phone number required"}), 400

    try:
        # 1. Get access token
        auth = (MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET)
        r = requests.get(f"{MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials", auth=auth)
        access_token = r.json().get("access_token")
        if not access_token:
            return jsonify({"error": "Failed to get M-Pesa access token"}), 500

        # 2. Prepare STK Push payload
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        password = base64.b64encode(f"{MPESA_SHORTCODE}{MPESA_PASSKEY}{timestamp}".encode()).decode()
        headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}
        payload = {
            "BusinessShortCode": MPESA_SHORTCODE,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": amount,
            "PartyA": phone,
            "PartyB": MPESA_SHORTCODE,
            "PhoneNumber": phone,
            "CallBackURL": "https://mydomain.com/mpesa/callback",  # Use a real URL in production
            "AccountReference": "MealyOrder",
            "TransactionDesc": "Order Payment"
        }
        stk_url = f"{MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest"
        resp = requests.post(stk_url, json=payload, headers=headers)
        return jsonify(resp.json()), resp.status_code
    except Exception as e:
        return jsonify({"error": f"Payment initiation failed: {str(e)}"}), 500

@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    user_type = data.get("type", "customer")
    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400
    if any(u["username"] == username for u in users):
        return jsonify({"error": "Username already exists"}), 409
    if user_type not in ["admin", "customer"]:
        user_type = "customer"
    users.append({"username": username, "password": password, "type": user_type})
    return jsonify({"message": "Signup successful", "type": user_type}), 201

@app.route("/api/auth", methods=["POST"])
def auth():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    for user in users:
        if user["username"] == username and user["password"] == password:
            return jsonify({"type": user["type"]})
    return jsonify({"error": "Invalid credentials"}), 401

@app.route("/api/meals", methods=["GET"])
def get_meals():
    return jsonify(meals)

@app.route("/api/meals", methods=["POST"])
def add_meal():
    data = request.json
    meal = {
        "id": meals[-1]["id"] + 1 if meals else 1,
        "name": data["name"],
        "description": data.get("description", ""),
        "price": float(data["price"]),
        "category": data.get("category", "General"),
        "rating": float(data.get("rating", 4.5)),
        "cookTime": data.get("cookTime", "20 min")
    }
    meals.append(meal)
    return jsonify(meal), 201

@app.route("/api/meals/<int:meal_id>", methods=["DELETE"])
def delete_meal(meal_id):
    # Only allow deletion of meals with id > 4 (not initial meals)
    if meal_id <= 4:
        return jsonify({"error": "Cannot delete initial menu items."}), 403
    global meals
    before = len(meals)
    meals = [m for m in meals if m["id"] != meal_id]
    if len(meals) == before:
        return jsonify({"error": "Meal not found."}), 404
    return jsonify({"message": "Meal deleted."}), 200

@app.route("/api/orders", methods=["GET"])
def get_orders():
    return jsonify(orders)

@app.route("/api/orders/customer/<username>", methods=["GET"])
def get_customer_orders(username):
    customer_orders = [order for order in orders if order.get("customerName") == username]
    return jsonify(customer_orders)

@app.route("/api/orders", methods=["POST"])
def add_order():
    data = request.json
    order = {
        "id": len(orders) + 1,
        "customerName": data.get("customerName", "Guest"),
        "meal": data["meal"],
        "price": float(data["price"]),
        "time": time.strftime("%I:%M %p"),
        "delivery_time": data.get("delivery_time"),
        "delivery_date": data.get("delivery_date"),
        "delivery_location": data.get("delivery_location", ""),
        "delivery_house_number": data.get("delivery_house_number", ""),
        "delivery_phone": data.get("delivery_phone", ""),
        "delivery_notes": data.get("delivery_notes", ""),
        "status": "pending"  # Add status tracking
    }
    orders.append(order)
    save_orders()
    return jsonify(order), 201

@app.route("/api/orders/<int:order_id>/status", methods=["PUT"])
def update_order_status(order_id):
    data = request.json
    new_status = data.get("status")
    
    if not new_status:
        return jsonify({"error": "Status is required"}), 400
    
    # Find the order and update its status
    for order in orders:
        if order["id"] == order_id:
            order["status"] = new_status
            save_orders()
            return jsonify({"message": f"Order {order_id} status updated to {new_status}", "order": order})
    
    return jsonify({"error": "Order not found"}), 404

@app.route("/api/admin/orders", methods=["GET"])
def admin_get_orders():
    return jsonify(orders)

if __name__ == "__main__":
    app.run(debug=True, port=5000) 
