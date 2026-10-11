import math
from abc import ABC, abstractmethod


class Shape(ABC):
    @abstractmethod
    def name(self): ...

    @abstractmethod
    def area(self): ...


class Rectangle(Shape):
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def name(self):
        return "rectangle"

    def area(self):
        return self.width * self.height


class Square(Rectangle):
    # A square is a rectangle with equal sides: reuse its storage and area.
    def __init__(self, side):
        super().__init__(side, side)

    def name(self):
        return "square"


class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius

    def name(self):
        return "circle"

    def area(self):
        return math.pi * self.radius * self.radius
