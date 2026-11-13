from pydantic import BaseModel


class Login(BaseModel):
    email: str
    password: str


class Registo(BaseModel):
    nome: str
    email: str
    password: str
