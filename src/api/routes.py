"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""

from flask import Flask, request, jsonify, url_for, Blueprint  # type: ignore
from api.models import db, User, Recipe, Favorite
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

        data = request.get_json()

        if not data:
            return jsonify({
                "error": "Request body is required"
            }), 400

        ingredients = data.get("ingredients")
        servings = data.get("servings", 1)
        objective = data.get("objective", "healthy_eating")

        # --------------------------------
        # Validar ingredientes
        # --------------------------------

        if not ingredients:
            return jsonify({
                "error": "Ingredients are required"
            }), 400

        if not isinstance(ingredients, list):
            return jsonify({
                "error": "Ingredients must be an array"
            }), 400

        try:
            servings = int(servings)
        except (TypeError, ValueError):
            return jsonify({"error": "Servings must be a valid number"}), 400

        if servings < 1 or servings > 20:
            return jsonify({"error": "Servings must be between 1 and 20"}), 400

        # Limpiar ingredientes
        ingredients = [
            str(ingredient).strip()
            for ingredient in ingredients
            if str(ingredient).strip()
        ]

        if not ingredients:
            return jsonify({
                "error": "At least one ingredient is required"
            }), 400

        ingredients_text = ", ".join(ingredients)

        # --------------------------------
        # Prompt
        # --------------------------------

        prompt = f"""
Eres un chef experto especializado en crear recetas sencillas,
realistas y fáciles de preparar utilizando principalmente los
ingredientes disponibles que proporciona el usuario.

INGREDIENTES DISPONIBLES:
{ingredients_text}

NÚMERO DE PERSONAS:
{servings}

OBJETIVO NUTRICIONAL:
{objective}

Crea una receta para {servings} persona(s) utilizando principalmente
los ingredientes disponibles.

REGLAS SOBRE LOS INGREDIENTES:

- Utiliza principalmente los ingredientes proporcionados por el usuario.
- No inventes ingredientes principales que el usuario no haya proporcionado.
- Puedes asumir que el usuario dispone de ingredientes básicos como:
  aceite, sal, pimienta, agua y especias básicas.
- Puedes utilizar estos ingredientes básicos cuando sean necesarios.
- No añadas ingredientes principales adicionales simplemente para
  completar la receta.
- Las cantidades deben ser realistas y adecuadas para {servings} persona(s).
- Ten en cuenta que los ingredientes indicados son los alimentos que
  el usuario tiene disponibles actualmente.
- Si las cantidades indicadas por el usuario parecen limitadas,
  intenta adaptar la receta a esas cantidades en lugar de asumir
  que dispone de cantidades ilimitadas.

OBJETIVO NUTRICIONAL:

Adapta la receta al siguiente objetivo:

{objective}

El objetivo debe influir en la elección de cantidades, ingredientes
y composición nutricional de la receta cuando sea posible.

Por ejemplo:
- lose_weight: prioriza una receta saciante y moderada en calorías.
- maintain_weight: busca un equilibrio nutricional.
- gain_muscle: prioriza proteínas y una cantidad adecuada de energía.
- body_recomposition: prioriza proteínas y un equilibrio entre calorías,
  carbohidratos y grasas.
- sports_performance: prioriza energía y carbohidratos adecuados,
  manteniendo una cantidad suficiente de proteínas.
- competition_prep: adapta la composición nutricional al rendimiento
  y a una alimentación controlada.
- healthy_eating: busca una composición equilibrada y variada.

INFORMACIÓN NUTRICIONAL:

Los valores nutricionales deben corresponder EXCLUSIVAMENTE a la
receta que acabas de generar.

Calcula una estimación basándote en:
- los ingredientes utilizados,
- las cantidades de cada ingrediente,
- el número de personas,
- y la composición nutricional aproximada de dichos ingredientes.

NO utilices valores nutricionales de ejemplo.
NO repitas valores de recetas anteriores.
NO utilices valores fijos.
Los valores deben cambiar según los ingredientes y las cantidades.

IMPORTANTE:
La información nutricional debe corresponder a UNA PORCIÓN,
no a la receta completa.

Los valores son aproximados y deben considerarse una estimación.

DEVUELVE EXCLUSIVAMENTE UN JSON VÁLIDO con esta estructura:

{{
    "title": "Nombre de la receta",
    "description": "Breve descripción de la receta",
    "servings": {servings},
    "prep_time": 30,
    "ingredients": [
        {{
            "name": "pollo",
            "amount": "300 g"
        }},
        {{
            "name": "arroz",
            "amount": "150 g"
        }}
    ],
    "instructions": [
        "Primer paso de la preparación",
        "Segundo paso de la preparación",
        "Tercer paso de la preparación"
    ],
    "nutrition": {{
        "calories": 500,
        "protein": 30,
        "carbs": 50,
        "fat": 15
    }}
}}

No incluyas dificultad ni ningún otro campo.
"""

        # --------------------------------
        # OpenAI
        # --------------------------------

        client = get_openai_client()

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Eres un chef experto en creación de recetas. "
                        "Debes seguir exactamente la estructura JSON solicitada."
                    ),
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            response_format={"type": "json_object"},
        )

        content = response.choices[0].message.content

        if not content:
            return jsonify({
                "error": "OpenAI returned an empty response"
            }), 500

        # --------------------------------
        # Parsear respuesta de IA
        # --------------------------------

        try:
            ai_recipe = json.loads(content)
        except json.JSONDecodeError:
            return jsonify({
                "error": "OpenAI returned invalid JSON"
            }), 500

        # --------------------------------
        # Validar estructura básica
        # --------------------------------

        title = ai_recipe.get("title")
        description = ai_recipe.get("description")
        recipe_ingredients = ai_recipe.get("ingredients")
        instructions_list = ai_recipe.get("instructions")
        nutrition = ai_recipe.get("nutrition", {})

        if not title:
            return jsonify({
                "error": "Generated recipe has no title"
            }), 500

        if not recipe_ingredients or not isinstance(recipe_ingredients, list):
            return jsonify({
                "error": "Generated recipe has invalid ingredients"
            }), 500

        if not instructions_list or not isinstance(instructions_list, list):
            return jsonify({
                "error": "Generated recipe has invalid instructions"
            }), 500

        # --------------------------------
        # Convertir instrucciones
        # --------------------------------

        instructions = "\n".join(
            f"{index + 1}. {step}"
            for index, step in enumerate(instructions_list)
            if str(step).strip()
        )

        if not instructions:
            return jsonify({
                "error": "Generated recipe has no instructions"
            }), 500

        # --------------------------------
        # Crear Recipe
        # --------------------------------

        new_recipe = Recipe(
            user_id=int(user_id),

            title=str(title).strip(),

            description=(
                str(description).strip()
                if description
                else None
            ),

            ingredients=recipe_ingredients,

            instructions=instructions,

            servings=ai_recipe.get("servings", 1),

            prep_time=ai_recipe.get("prep_time"),

            calories=nutrition.get("calories"),

            protein=nutrition.get("protein"),

            carbs=nutrition.get("carbs"),

            fat=nutrition.get("fat"),
            
            objective=objective,

            ai_prompt=prompt,
        )

        db.session.add(new_recipe)
        db.session.commit()

        # --------------------------------
        # Respuesta
        # --------------------------------

        return jsonify({
            "message": "Recipe generated successfully",
            "recipe": new_recipe.serialize(),
        }), 201

    except Exception as error:
        db.session.rollback()

        import traceback
        traceback.print_exc()

        return jsonify({"error": str(error)}), 500

    # except Exception as error:
    #     db.session.rollback()

    #     print("ERROR GENERATING RECIPE:", error)

    #     return jsonify({
    #         "error": "Error generating recipe"
    #     }), 500


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
        print("OPENAI ERROR:", error)

        return jsonify({"success": False, "error": str(error)}), 500


@api.route("/recipes", methods=["GET"])
@jwt_required()
def get_my_recipes():
    try:
        user_id = get_jwt_identity()

        recipes = Recipe.query.filter_by(
            user_id=int(user_id)
        ).order_by(
            Recipe.created_at.desc()
        ).all()

        return jsonify({
            "recipes": [
                recipe.serialize()
                for recipe in recipes
            ]
        }), 200

    except Exception as error:
        print("ERROR GETTING RECIPES:", error)

        return jsonify({
            "error": "Could not get recipes"
        }), 500


@api.route("/recipes/<int:recipe_id>", methods=["GET"])
@jwt_required()
def get_recipe(recipe_id):
    user_id = int(get_jwt_identity())

    recipe = Recipe.query.filter_by(
        id=recipe_id,
        user_id=user_id
    ).first()

    if not recipe:
        return jsonify({
            "error": "Recipe not found"
        }), 404

    favorite = Favorite.query.filter_by(
        user_id=user_id,
        recipe_id=recipe_id
    ).first()

    recipe_data = recipe.serialize()

    recipe_data["is_favorite"] = favorite is not None

    return jsonify({
        "recipe": recipe_data
    }), 200

# ============================================================
# FAVORITES
# ============================================================


@api.route("/favorites", methods=["GET"])
@jwt_required()
def get_favorites():
    try:
        user_id = int(get_jwt_identity())

        favorites = Favorite.query.filter_by(
            user_id=user_id
        ).all()

        return jsonify({
            "favorites": [
                {
                    **favorite.serialize(),
                    "recipe": favorite.recipe.serialize()
                }
                for favorite in favorites
            ]
        }), 200

    except Exception as error:
        print("ERROR GET FAVORITES:", error)

        return jsonify({
            "error": "No se pudieron obtener los favoritos"
        }), 500


@api.route("/favorites/<int:recipe_id>", methods=["POST"])
@jwt_required()
def add_favorite(recipe_id):
    try:
        user_id = int(get_jwt_identity())

        # Comprobar que la receta existe
        recipe = Recipe.query.filter_by(
            id=recipe_id
        ).first()

        if not recipe:
            return jsonify({
                "error": "La receta no existe"
            }), 404

        # Comprobar que la receta pertenece al usuario
        if recipe.user_id != user_id:
            return jsonify({
                "error": "No puedes añadir esta receta a favoritos"
            }), 403

        # Comprobar si ya existe
        existing_favorite = Favorite.query.filter_by(
            user_id=user_id,
            recipe_id=recipe_id
        ).first()

        if existing_favorite:
            return jsonify({
                "error": "La receta ya está en favoritos"
            }), 409

        favorite = Favorite(
            user_id=user_id,
            recipe_id=recipe_id
        )

        db.session.add(favorite)
        db.session.commit()

        return jsonify({
            "message": "Receta añadida a favoritos",
            "favorite": favorite.serialize()
        }), 201

    except Exception as error:
        db.session.rollback()

        print("ERROR ADD FAVORITE:", error)

        return jsonify({
            "error": "No se pudo añadir la receta a favoritos"
        }), 500


@api.route("/favorites/<int:recipe_id>", methods=["DELETE"])
@jwt_required()
def remove_favorite(recipe_id):
    try:
        user_id = int(get_jwt_identity())

        favorite = Favorite.query.filter_by(
            user_id=user_id,
            recipe_id=recipe_id
        ).first()

        if not favorite:
            return jsonify({
                "error": "La receta no está en favoritos"
            }), 404

        db.session.delete(favorite)
        db.session.commit()

        return jsonify({
            "message": "Receta eliminada de favoritos"
        }), 200

    except Exception as error:
        db.session.rollback()

        print("ERROR DELETE FAVORITE:", error)

        return jsonify({
            "error": "No se pudo eliminar la receta de favoritos"
        }), 500

        # --------------------------------
        # Sugestions
        # --------------------------------

@api.route("/recipes/suggestions", methods=["POST"])
@jwt_required()
def recipe_suggestions():
    try:

        user_id = get_jwt_identity()

        data = request.get_json()

        if not data:
            return jsonify({
                "error": "Request body is required"
            }), 400

        ingredients = data.get("ingredients")
        servings = data.get("servings", 1)
        objective = data.get("objective", "healthy_eating")

        # --------------------------------
        # Validar ingredientes
        # --------------------------------

        if not ingredients:
            return jsonify({
                "error": "Ingredients are required"
            }), 400

        if not isinstance(ingredients, list):
            return jsonify({
                "error": "Ingredients must be an array"
            }), 400

        # Limpiar ingredientes
        ingredients = [
            str(ingredient).strip()
            for ingredient in ingredients
            if str(ingredient).strip()
        ]

        if not ingredients:
            return jsonify({
                "error": "At least one ingredient is required"
            }), 400

        # --------------------------------
        # Validar servings
        # --------------------------------

        try:
            servings = int(servings)
        except (TypeError, ValueError):
            return jsonify({
                "error": "Servings must be a valid number"
            }), 400

        if servings < 1 or servings > 20:
            return jsonify({
                "error": "Servings must be between 1 and 20"
            }), 400

        ingredients_text = ", ".join(ingredients)

        # --------------------------------
        # Prompt
        # --------------------------------

        prompt = f"""
Eres un chef experto y asesor nutricional.

El usuario quiere preparar una receta utilizando los ingredientes
que tiene actualmente disponibles.

INGREDIENTES DISPONIBLES:
{ingredients_text}

NÚMERO DE PERSONAS:
{servings}

OBJETIVO:
{objective}

Tu tarea NO es crear todavía la receta.

Tu tarea es analizar los ingredientes disponibles y proporcionar
sugerencias que puedan mejorar la futura receta.

Puedes sugerir:

1. INGREDIENTES ADICIONALES
Ingredientes que sería útil añadir para mejorar el sabor,
textura, equilibrio nutricional o conseguir una mejor receta.

2. SUSTITUCIONES
Si algún ingrediente puede sustituirse por otro para adaptarse
mejor al objetivo nutricional.

3. ELIMINACIONES
Si algún ingrediente puede ser innecesario o poco adecuado.

4. MEJORAS
Consejos sobre cómo combinar, cocinar o utilizar mejor los
ingredientes disponibles.

REGLAS:

- No sugieras ingredientes absurdos o difíciles de conseguir.
- Prioriza ingredientes comunes.
- No sugieras demasiados ingredientes.
- Máximo 5 sugerencias.
- Las sugerencias deben tener sentido con los ingredientes existentes.
- Ten en cuenta el objetivo nutricional.
- No es obligatorio realizar sugerencias.
- Si los ingredientes ya son adecuados, puedes indicarlo.
- No generes todavía la receta completa.
- No generes instrucciones completas de cocina.
- No inventes ingredientes que el usuario ya tenga como si fueran
  ingredientes adicionales.
- Puedes asumir que el usuario dispone de básicos como aceite,
  sal, pimienta, agua y especias.

OBJETIVO NUTRICIONAL:

Adapta tus sugerencias al objetivo:

- lose_weight: prioriza alimentos saciantes y moderados en calorías.
- maintain_weight: busca equilibrio nutricional.
- gain_muscle: prioriza proteínas y energía suficiente.
- body_recomposition: prioriza proteínas y equilibrio calórico.
- sports_performance: prioriza energía, carbohidratos y proteínas.
- competition_prep: prioriza una alimentación controlada orientada
  al rendimiento.
- healthy_eating: prioriza variedad y equilibrio nutricional.

DEVUELVE EXCLUSIVAMENTE JSON VÁLIDO.

Utiliza exactamente esta estructura:

{{
    "summary": "Breve valoración de los ingredientes disponibles",
    "suggestions": [
        {{
            "type": "add",
            "name": "pimiento",
            "reason": "Aportará más verduras y combinará bien con el pollo y el arroz.",
            "icon": "🫑"
        }},
        {{
            "type": "replace",
            "name": "arroz integral",
            "replace": "arroz blanco",
            "reason": "Puede aportar más fibra y encajar mejor con el objetivo.",
            "icon": "🌾"
        }},
        {{
            "type": "remove",
            "name": "ingrediente",
            "reason": "No es necesario para conseguir una buena receta.",
            "icon": "➖"
        }}
    ]
}}

El campo "type" solamente puede ser:

- "add"
- "replace"
- "remove"

Para "add":

"name" = ingrediente que recomienda añadir.

Para "replace":

"name" = ingrediente recomendado.
"replace" = ingrediente actual que debería sustituirse.

Para "remove":

"name" = ingrediente que recomienda eliminar.

No incluyas ningún otro campo.
"""

        # --------------------------------
        # OpenAI
        # --------------------------------

        client = get_openai_client()

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Eres un chef experto y asesor nutricional. "
                        "Analiza ingredientes y proporciona sugerencias "
                        "útiles. Devuelve exclusivamente JSON válido."
                    ),
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            response_format={"type": "json_object"},
        )

        content = response.choices[0].message.content

        if not content:
            return jsonify({
                "error": "OpenAI returned an empty response"
            }), 500

        # --------------------------------
        # Parsear JSON
        # --------------------------------

        try:
            ai_response = json.loads(content)
        except json.JSONDecodeError:
            return jsonify({
                "error": "OpenAI returned invalid JSON"
            }), 500

        # --------------------------------
        # Validar respuesta
        # --------------------------------

        summary = ai_response.get("summary", "")
        suggestions = ai_response.get("suggestions", [])

        if not isinstance(suggestions, list):
            return jsonify({
                "error": "Suggestions must be an array"
            }), 500

        # --------------------------------
        # Limitar sugerencias
        # --------------------------------

        valid_types = {
            "add",
            "replace",
            "remove",
        }

        clean_suggestions = []

        for suggestion in suggestions:

            if not isinstance(suggestion, dict):
                continue

            suggestion_type = suggestion.get("type")
            name = suggestion.get("name")

            if suggestion_type not in valid_types:
                continue

            if not name:
                continue

            clean_suggestion = {
                "type": suggestion_type,
                "name": str(name).strip(),
                "reason": str(
                    suggestion.get("reason", "")
                ).strip(),
                "icon": str(
                    suggestion.get("icon", "✨")
                ).strip(),
            }

            if suggestion_type == "replace":

                replace = suggestion.get("replace")

                if not replace:
                    continue

                clean_suggestion["replace"] = str(
                    replace
                ).strip()

            clean_suggestions.append(
                clean_suggestion
            )

        # Máximo 5
        clean_suggestions = clean_suggestions[:5]

        # --------------------------------
        # Respuesta
        # --------------------------------

        return jsonify({
            "summary": str(summary).strip(),
            "suggestions": clean_suggestions,
        }), 200

    except Exception as error:

        import traceback
        traceback.print_exc()

        return jsonify({
            "error": str(error)
        }), 500