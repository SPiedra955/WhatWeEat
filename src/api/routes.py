"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""

from flask import Flask, request, jsonify, url_for, Blueprint  # type: ignore
from api.models import db, User, DietGoal
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from sqlalchemy import select  # type: ignore
from werkzeug.security import generate_password_hash, check_password_hash  # type: ignore
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required  # type: ignore
import os
from openai import OpenAI
import json


api = Blueprint("api", __name__)

# Allow CORS requests to this API
CORS(api)


@api.route("/hello", methods=["POST", "GET"])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200


@api.route("/register", methods=["POST"])
def register():
    try:
        body = request.get_json()

        if (
            not body
            or not body.get("email")
            or not body.get("password")
            or not body.get("name")
            or not body.get("age")
            or not body.get("weight")
            or not body.get("objective")
        ):
            return jsonify({"success": False, "data": "missing info"}), 400

        user = db.session.execute(
            select(User).where(User.email == body["email"])
        ).scalar_one_or_none()

        if user:
            return jsonify({"success": False, "data": "email taken"}), 409

        hashed_password = generate_password_hash(body["password"])

        new_user = User(
            email=body["email"],
            password=hashed_password,
            name=body["name"],
            age=int(body["age"]),
            weight=float(body["weight"]),
            objective=DietGoal(body["objective"]),
        )

        db.session.add(new_user)
        db.session.commit()

        token = create_access_token(identity=str(new_user.id))

        return (
            jsonify({"success": True, "data": new_user.serialize(), "token": token}),
            201,
        )

    except Exception as e:
        print("REGISTER ERROR:", e)
        return jsonify({"success": False, "data": "internal server error"}), 500


@api.route("/login", methods=["POST"])
def login():
    try:
        body = request.get_json()

        if not body or not body.get("email") or not body.get("password"):
            return jsonify({"success": False, "data": "missing info"}), 400

        user = db.session.execute(
            select(User).where(User.email == body["email"])
        ).scalar_one_or_none()

        if not user:
            return jsonify({"success": False, "data": "email not found"}), 404

        if not check_password_hash(user.password, body["password"]):
            return (
                jsonify({"success": False, "data": "incorrect email or password"}),
                401,
            )

        token = create_access_token(identity=str(user.id))

        return jsonify({"success": True, "data": user.serialize(), "token": token}), 200

    except Exception as e:
        print("LOGIN ERROR:", e)
        return jsonify({"success": False, "data": "internal server error"}), 500


@api.route("/recipes/generate", methods=["POST"])
@jwt_required()
def generate_recipe():
    try:
        
        user_id = get_jwt_identity()

        # print("USER ID:", user_id)

        data = request.get_json()

        print("📦 DATA:", data)

        if not data:
            return jsonify({"error": "Request body is required"}), 400

        ingredients = data.get("ingredients")

        if not ingredients:
            return jsonify({"error": "Ingredients are required"}), 400

        if not isinstance(ingredients, list):
            return jsonify({"error": "Ingredients must be an array"}), 400

        ingredients = [
            str(ingredient).strip()
            for ingredient in ingredients
            if str(ingredient).strip()
        ]

        if not ingredients:
            return jsonify({"error": "At least one ingredient is required"}), 400

        ingredients_text = ", ".join(ingredients)

        prompt = f"""
Eres un chef experto especializado en crear recetas sencillas
con los ingredientes que tiene el usuario en casa.

Ingredientes disponibles:
{ingredients_text}

Crea una receta utilizando principalmente estos ingredientes.

Puedes asumir que el usuario tiene ingredientes básicos como:

- aceite
- sal
- pimienta
- agua
- especias básicas

No inventes ingredientes principales que no estén disponibles.

La receta debe ser sencilla, realista y fácil de preparar.

Devuelve exclusivamente un JSON válido con esta estructura:

{{
    "title": "Nombre de la receta",
    "description": "Breve descripción de la receta",
    "servings": 2,
    "time_minutes": 30,
    "difficulty": "Fácil",
    "ingredients": [
        {{
            "name": "pollo",
            "amount": "300 g"
        }}
    ],
    "steps": [
        "Primer paso",
        "Segundo paso",
        "Tercer paso"
    ],
    "nutrition": {{
        "calories": 500,
        "protein": 30,
        "carbs": 50,
        "fat": 15
    }}
}}

Las cantidades y los valores nutricionales son aproximados.
"""

        client = get_openai_client()

        print("🤖 Llamando a OpenAI...")

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "Eres un chef experto en creación de recetas.",
                },
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
        )

        content = response.choices[0].message.content

        print("🤖 RESPUESTA OPENAI:", content)

        if not content:
            return jsonify({"error": "OpenAI returned an empty response"}), 500

        recipe = json.loads(content)

        return jsonify(recipe), 200

    except Exception as error:
        print("❌ ERROR GENERATING RECIPE:", error)

        return jsonify({"error": str(error)}), 500


def get_openai_client():
    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        raise ValueError("OPENAI_API_KEY is missing")

    return OpenAI(api_key=api_key)


@api.route("/test-openai", methods=["GET"])
def test_openai():
    try:
        api_key = os.getenv("OPENAI_API_KEY")

        if not api_key:
            return (
                jsonify(
                    {"success": False, "error": "OPENAI_API_KEY no está configurada"}
                ),
                500,
            )

        client = OpenAI(api_key=api_key)

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": "Responde únicamente: OpenAI funciona correctamente.",
                }
            ],
            max_tokens=50,
        )

        message = response.choices[0].message.content

        return jsonify({"success": True, "message": message}), 200

    except Exception as error:
        print("❌ OPENAI ERROR:", error)

        return jsonify({"success": False, "error": str(error)}), 500
