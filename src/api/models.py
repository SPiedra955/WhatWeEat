from datetime import datetime
from enum import Enum

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import (
    String,
    Boolean,
    ForeignKey,
    DateTime,
    Numeric,
    Text,
    Enum as SQLEnum,
    Integer,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import JSON


db = SQLAlchemy()


# ============================================================
# ENUMS
# ============================================================

class MealType(Enum):
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"
    SNACK = "snack"


# ============================================================
# USER
# ============================================================

class User(db.Model):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    email: Mapped[str] = mapped_column(
        String(120),
        unique=True,
        nullable=False
    )

    password: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    age: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    weight: Mapped[float | None] = mapped_column(
        Numeric(5, 2),
        nullable=True
    )

    photo: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    # Relaciones

    recipes: Mapped[list["Recipe"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan"
    )

    favorites: Mapped[list["Favorite"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan"
    )

    diets: Mapped[list["Diet"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan"
    )

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "age": self.age,
            "weight": float(self.weight) if self.weight is not None else None,
            "photo": self.photo,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat(),
        }


# ============================================================
# RECIPE
# ============================================================

class Recipe(db.Model):
    __tablename__ = "recipes"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )

    title: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    ingredients: Mapped[list[dict]] = mapped_column(
        JSON,
        nullable=False
    )

    instructions: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    servings: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False
    )

    prep_time: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    # Información nutricional
    calories: Mapped[float | None] = mapped_column(
        Numeric(8, 2),
        nullable=True
    )

    protein: Mapped[float | None] = mapped_column(
        Numeric(8, 2),
        nullable=True
    )

    carbs: Mapped[float | None] = mapped_column(
        Numeric(8, 2),
        nullable=True
    )

    fat: Mapped[float | None] = mapped_column(
        Numeric(8, 2),
        nullable=True
    )

    image: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    ai_prompt: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    # Relaciones

    user: Mapped["User"] = relationship(
        back_populates="recipes"
    )

    favorites: Mapped[list["Favorite"]] = relationship(
        back_populates="recipe",
        cascade="all, delete-orphan"
    )

    diet_recipes: Mapped[list["DietRecipe"]] = relationship(
        back_populates="recipe",
        cascade="all, delete-orphan"
    )

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "description": self.description,
            "ingredients": self.ingredients,
            "instructions": self.instructions,
            "servings": self.servings,
            "prep_time": self.prep_time,
            "calories": float(self.calories) if self.calories is not None else None,
            "protein": float(self.protein) if self.protein is not None else None,
            "carbs": float(self.carbs) if self.carbs is not None else None,
            "fat": float(self.fat) if self.fat is not None else None,
            "image": self.image,
            "created_at": self.created_at.isoformat(),
        }


# ============================================================
# FAVORITE
# ============================================================

class Favorite(db.Model):
    __tablename__ = "favorites"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )

    recipe_id: Mapped[int] = mapped_column(
        ForeignKey("recipes.id"),
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    user: Mapped["User"] = relationship(
        back_populates="favorites"
    )

    recipe: Mapped["Recipe"] = relationship(
        back_populates="favorites"
    )

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "recipe_id",
            name="uq_user_recipe_favorite"
        ),
    )

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "recipe_id": self.recipe_id,
            "created_at": self.created_at.isoformat(),
        }


# ============================================================
# DIET
# ============================================================

class Diet(db.Model):
    __tablename__ = "diets"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )

    title: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    user: Mapped["User"] = relationship(
        back_populates="diets"
    )

    diet_recipes: Mapped[list["DietRecipe"]] = relationship(
        back_populates="diet",
        cascade="all, delete-orphan"
    )

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "description": self.description,
            "created_at": self.created_at.isoformat(),
        }


# ============================================================
# DIET RECIPE
# ============================================================

class DietRecipe(db.Model):
    __tablename__ = "diet_recipes"

    id: Mapped[int] = mapped_column(primary_key=True)

    diet_id: Mapped[int] = mapped_column(
        ForeignKey("diets.id"),
        nullable=False
    )

    recipe_id: Mapped[int] = mapped_column(
        ForeignKey("recipes.id"),
        nullable=False
    )

    # Para poder organizar una dieta semanal
    day: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    meal_type: Mapped[MealType | None] = mapped_column(
        SQLEnum(MealType),
        nullable=True
    )


    diet: Mapped["Diet"] = relationship(
        back_populates="diet_recipes"
    )

    recipe: Mapped["Recipe"] = relationship(
        back_populates="diet_recipes"
    )

    def serialize(self):
        return {
            "id": self.id,
            "diet_id": self.diet_id,
            "recipe_id": self.recipe_id,
            "day": self.day,
            "meal_type": self.meal_type.value if self.meal_type else None,
        }
