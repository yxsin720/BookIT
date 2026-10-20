# BookIT

1. **Título do projeto:** BookIT: sistema distribuído de reservas com recomendação inteligente
2. **Ano letivo:** 2026/2027
3. **Semestre:** 5.º semestre
4. **Curso(s) envolvidos:** Licenciatura em Engenharia Informática (L-EI)
5. **Unidade(s) curricular(es):** Projeto de Desenvolvimento de Software; Engenharia de Software; Segurança Informática; Sistemas Distribuídos; Inteligência Artificial
6. **Docente(s):** Rui Pascoal e Miguel Boavida (Projeto de Desenvolvimento de Software); Rui Ramos (Engenharia de Software); Sérgio Nunes e Pedro Brandão (Segurança Informática); Pedro Rosa (Sistemas Distribuídos); Samuel Gomes (Inteligência Artificial)
7. **Estudantes participantes (Grupo 6):**

| Nome completo | N.º de estudante | Curso | Ano curricular | Contacto institucional |
|---|---|---|---|---|
| Yassin Latif | 20240626 | Licenciatura em Engenharia Informática | 3.º | Não aplicável |
| Yosvany Costa Nunes | 20230853 | Licenciatura em Engenharia Informática | 3.º | Não aplicável |
| Francisco Silva | 20241293 | Licenciatura em Engenharia Informática | 3.º | Não aplicável |
| Lueji Covilhã | 20241725 | Licenciatura em Engenharia Informática | 3.º | Não aplicável |

8. **Palavras-chave:** sistemas distribuídos; reservas; tolerância a faltas; replicação; PostgreSQL; Problemas de Satisfação de Restrições (CSP); inteligência artificial; recomendação; Docker
9. **Tecnologias utilizadas:** React, Python, FastAPI, PostgreSQL, Nginx, Docker, Docker Compose, GitHub (stack proposta, a validar com os docentes)
10. **Resumo curto:** O BookIT é um sistema distribuído de reservas de salas, equipamentos e lugares de estudo, pensado para uma universidade. Um balanceador Nginx reparte os pedidos por várias instâncias da API de reservas, que falam com um serviço de IA e com uma base de dados PostgreSQL com um primário e uma réplica, tudo em contentores Docker. O objetivo é continuar a funcionar quando falha uma instância ou a réplica, sem perder nem duplicar reservas confirmadas. Um motor de IA baseado em Problemas de Satisfação de Restrições (CSP) recomenda as melhores combinações de recurso e horário e reatribui as reservas quando um recurso fica indisponível. O projeto inclui um modelo de faltas com cinco cenários de falha, que serão demonstrados com testes, e a comparação do motor CSP com a escolha do primeiro horário livre.
