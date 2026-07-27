from datetime import datetime
from decimal import Decimal
from flask_sqlalchemy import SQLAlchemy  # type: ignore
from sqlalchemy import String, Boolean, ForeignKey, DateTime, Numeric, Text, Enum, Float, Integer  # type: ignore
from sqlalchemy.orm import Mapped, mapped_column, relationship  # type: ignore
import enum
from sqlalchemy.types import JSON # type: ignore

db = SQLAlchemy()


class DietGoal(enum.Enum):
    LOSE_WEIGHT = "lose_weight"                  # Perder peso
    MAINTAIN_WEIGHT = "maintain_weight"          # Mantener peso
    GAIN_MUSCLE = "gain_muscle"                  # Ganar masa muscular
    BODY_RECOMPOSITION = "body_recomposition"   # Perder grasa y ganar músculo
    SPORTS_PERFORMANCE = "sports_performance"   # Mejorar rendimiento deportivo
    COMPETITION_PREP = "competition_prep"       # Preparación para competición
    HEALTHY_EATING = "healthy_eating"           # Alimentación saludable


class User(db.Model):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(String(50), nullable=False)

    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)

    password: Mapped[str] = mapped_column(String(255), nullable=False)

    age: Mapped[int] = mapped_column(nullable=True)

    weight: Mapped[float] = mapped_column(nullable=True)

    objective: Mapped[DietGoal] = mapped_column(Enum(DietGoal), nullable=True)

    photo: Mapped[str] = mapped_column(String(255), nullable=True)

    is_active: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    
    recipes: Mapped[list["Recipe"]] = relationship(
    back_populates="user", cascade="all, delete-orphan"
    )

    diets: Mapped[list["Diet"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )

    favorites: Mapped[list["Favorite"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "age": self.age,
            "weight": self.weight,
            "objective": self.objective.value if self.objective else None,
            "photo": self.photo,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat(),
        }


class Recipe(db.Model):
    __tablename__ = "recipes"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False
    )

    title: Mapped[str] = mapped_column(String(150), nullable=False)

    description: Mapped[str] = mapped_column(Text, nullable=True)

    ingredients: Mapped[list[dict]] = mapped_column(JSON, nullable=False)

    instructions: Mapped[str] = mapped_column(Text, nullable=False)

    improved_instructions: Mapped[str] = mapped_column(Text, nullable=True)

    calories: Mapped[float] = mapped_column(Float, nullable=True)

    protein: Mapped[float] = mapped_column(Float, nullable=True)

    carbs: Mapped[float] = mapped_column(Float, nullable=True)

    fat: Mapped[float] = mapped_column(Float, nullable=True)

    servings: Mapped[int] = mapped_column(Integer, default=1)

    prep_time: Mapped[int] = mapped_column(Integer, nullable=True)

    ai_prompt: Mapped[str] = mapped_column(Text, nullable=True)

    image: Mapped[str] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )

    user: Mapped["User"] = relationship(back_populates="recipes")

    favorites: Mapped[list["Favorite"]] = relationship(
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
            "improved_instructions": self.improved_instructions,
            "calories": self.calories,
            "protein": self.protein,
            "carbs": self.carbs,
            "fat": self.fat,
            "servings": self.servings,
            "prep_time": self.prep_time,
            "ai_prompt": self.ai_prompt,
            "image": self.image,
            "created_at": self.created_at.isoformat(),
        }
        

class Diet(db.Model):
    __tablename__ = "diets"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False
    )

    title: Mapped[str] = mapped_column(String(100), nullable=False)

    description: Mapped[str] = mapped_column(Text, nullable=True)

    recipes: Mapped[dict] = mapped_column(JSON, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )

    user: Mapped["User"] = relationship(back_populates="diets")

    def serialize(self):
            return {
                "id": self.id,
                "user_id": self.user_id,
                "title": self.title,
                "description": self.description,
                "recipes": self.recipes,
                "created_at": self.created_at.isoformat(),
            }
        
        
class Favorite(db.Model):
    __tablename__ = "favorites"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False
    )

    recipe_id: Mapped[int] = mapped_column(
        ForeignKey("recipes.id"), nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )

    user: Mapped["User"] = relationship(back_populates="favorites")

    recipe: Mapped["Recipe"] = relationship(
        back_populates="favorites"
    )

    def serialize(self):
            return {
                "id": self.id,
                "user_id": self.user_id,
                "recipe_id": self.recipe_id,
                "created_at": self.created_at.isoformat()
            }