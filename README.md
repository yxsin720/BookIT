# BookIT

**Sistema distribuído de reservas com recomendação inteligente**

Projeto de Desenvolvimento de Software · Licenciatura em Engenharia Informática · Universidade Europeia · 2026/2027 · Grupo 6

## Sobre o projeto

O BookIT é um sistema de reservas de salas, equipamentos e lugares de estudo para uma universidade. O utilizador diz o que precisa, por exemplo uma sala para 6 pessoas, durante 2 horas, com projetor, e o sistema sugere as melhores opções de recurso e horário.

O sistema é distribuído e continua a funcionar mesmo que um dos seus componentes falhe, sem perder nem duplicar reservas.

## Arquitetura

- **Nginx**: balanceador de carga
- **API de reservas**: 2 instâncias
- **Serviço de IA**: 2 instâncias
- **PostgreSQL**: 1 primário e 2 réplicas

Tudo corre em contentores Docker.

## Inteligência Artificial

A recomendação é feita com um Problema de Satisfação de Restrições (CSP). O motor respeita regras obrigatórias, como capacidade, equipamento e ausência de sobreposições, e procura as opções que melhor encaixam nas preferências do utilizador.

## Tecnologias

React · Python (FastAPI) · PostgreSQL · Nginx · Docker

## Equipa

- Yassin Latif
- Yosvany Costa Nunes
- Francisco Silva
- Lueji Covilhã
