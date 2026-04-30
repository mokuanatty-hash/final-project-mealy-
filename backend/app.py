from flask import Flask, jsonify, request
from flask_cors import CORS
import time

app = Flask(__name__)
CORS(app)

# In-memory data for demo purposes
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

orders = [
    {"id": 1, "customerName": "John Doe", "meal": "Grilled Chicken Bowl", "price": 15.99, "time": "12:30 PM"},
    {"id": 2, "customerName": "Jane Smith", "meal": "Mediterranean Salmon", "price": 18.99, "time": "12:35 PM"},
    {"id": 3, "customerName": "Mike Johnson", "meal": "Veggie Power Bowl", "price": 13.99, "time": "12:40 PM"},
    {"id": 4, "customerName": "Sarah Wilson", "meal": "Grilled Chicken Bowl", "price": 15.99, "time": "12:45 PM"},
]

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
        "delivery_date": data.get("delivery_date")
    }
    orders.append(order)
    return jsonify(order), 201

@app.route("/api/admin/orders", methods=["GET"])
def admin_get_orders():
    return jsonify(orders)

if __name__ == "__main__":
    app.run(debug=True, port=5000) 