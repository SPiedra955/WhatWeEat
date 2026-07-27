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

api = Blueprint("api", __name__)

# Allow CORS requests to this API
CORS(api)


@api.route("/hello", methods=["POST", "GET"])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200


@api.route("/auth", methods=["POST"])
def auth():
    try:
        body = request.get_json()

        if not body or not body.get("email") or not body.get("password"):
            return jsonify({"success": False, "data": "missing info"}), 400

        user = db.session.execute(
            select(User).where(User.email == body.get("email"))
        ).scalar_one_or_none()

        if body.get("type") == "register":
            if user:
                return jsonify({"success": False, "data": "email taken"}), 403

            hashed = generate_password_hash(body["password"])
            new_user = User(
                email=body["email"],
                password=hashed,
                name=body["name"],
                age=body["age"],
                weight=body["weight"],
                objective=DietGoal(body["objective"]),
            )
            db.session.add(new_user)
            db.session.commit()
            # print("Usuario guardado")

            token = create_access_token(identity=str(new_user.id))
            # print("Token creado")

            return (
                jsonify(
                    {"success": True, "data": new_user.serialize(), "token": token}
                ),
                201,
            )

        if body.get("type") == "login":
            if not user:
                return jsonify({"success": False, "data": "email not found"}), 404

            if not check_password_hash(user.password, body["password"]):
                return (
                    jsonify(
                        {"success": False, "data": "incorrect email or password"}),
                    401,
                )

            token = create_access_token(identity=str(user.id))

            return (
                jsonify(
                    {"success": True, "data": user.serialize(), "token": token}),
                200,
            )

        return jsonify({"success": False, "data": "invalid type"}), 400
    except Exception as e:
        print("ERROR BACKEND:", e)
        return jsonify({"success": False, "data": "internal server error"}), 500
