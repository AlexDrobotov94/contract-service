# Quality Assessment Patterns — HTTP / Python (FastAPI)

Паттерны для оценки 6 HTTP-критериев качества в FastAPI-приложениях.

FastAPI использует Python type hints и Pydantic-модели — хорошо интегрированная система типов. Критерии оцениваются по аннотациям параметров и декораторам маршрутов.

---

## 1. `x-quality-params-typed`

**Применяется только если** операция имеет ≥1 параметра (path, query, header).

Считать `true` если все параметры функции-хэндлера имеют явные type hint'ы.

```python
# TRUE — явные типы для path и query параметров
@app.get("/users/{user_id}")
async def get_user(
    user_id: int,                    # path param — typed
    page: int = 1,                   # query param — typed
    q: Optional[str] = None,         # query param — typed (Optional[str])
):
    ...

# TRUE — Path() / Query() с явным типом
from fastapi import Path, Query
async def get_user(
    user_id: int = Path(..., description="User ID"),
    limit: int = Query(10, le=100),
):
    ...

# TRUE — Header() с типом
from fastapi import Header
async def get_user(x_api_key: str = Header(...)):
    ...

# FALSE — нет аннотации типа
@app.get("/users/{user_id}")
async def get_user(user_id, page=1):  # нет типов — FALSE
    ...

# FALSE — Any
from typing import Any
async def get_user(user_id: Any):  # FALSE
    ...
```

---

## 2. `x-quality-body-typed`

**Применяется только если** операция принимает тело (не GET, не DELETE без body).

Считать `true` если аргумент тела — Pydantic BaseModel или его подкласс. Считать `false` если тип `dict`, `Any`, `object` или аннотация отсутствует.

```python
# TRUE — Pydantic BaseModel
from pydantic import BaseModel

class CreateMessageRequest(BaseModel):
    content: str
    author_id: int

@app.post("/messages")
async def create_message(body: CreateMessageRequest):
    ...

# TRUE — подкласс BaseModel
class UpdateUserRequest(UserBase):  # UserBase наследует BaseModel
    ...

# FALSE — dict
async def create_message(body: dict):  # FALSE

# FALSE — Any или без аннотации
from typing import Any
async def create_message(body: Any):   # FALSE
async def create_message(body):        # FALSE — нет аннотации
```

---

## 3. `x-quality-response-typed`

**Применяется всегда.**

Считать `true` если:
- Декоратор маршрута содержит `response_model=<PydanticModel>`, или
- Функция имеет аннотацию возврата с Pydantic-моделью или конкретным типом

```python
# TRUE — response_model
@app.get("/users/{id}", response_model=UserResponse)
async def get_user(id: int):
    ...

# TRUE — аннотация возврата с Pydantic-моделью
@app.get("/users/{id}")
async def get_user(id: int) -> UserResponse:
    ...

# TRUE — List[Pydantic]
@app.get("/users")
async def get_users() -> list[UserResponse]:
    ...

# FALSE — dict (без схемы)
@app.get("/users/{id}")
async def get_user(id: int) -> dict:  # FALSE

# FALSE — нет аннотации возврата и нет response_model
@app.get("/users/{id}")
async def get_user(id: int):  # FALSE — нет типизации ответа
    return {"id": id}
```

---

## 4. `x-quality-body-validated`

**Применяется только если** операция принимает тело.

Если тело принимается как Pydantic BaseModel — считать `true` автоматически: Pydantic валидирует данные при парсинге. Дополнительно засчитывать явные `@validator` или `@field_validator` декораторы.

```python
# TRUE — Pydantic BaseModel автоматически валидирует при создании
class CreateMessageRequest(BaseModel):
    content: str       # Pydantic проверит наличие и тип
    author_id: int     # автовалидация — TRUE

# TRUE — с дополнительными ограничениями через Field
from pydantic import BaseModel, Field

class CreateMessageRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)
    author_id: int = Field(..., gt=0)

# TRUE — validator декоратор
from pydantic import validator

class CreateUserRequest(BaseModel):
    email: str

    @validator('email')
    def email_must_be_valid(cls, v):
        if '@' not in v:
            raise ValueError('invalid email')
        return v

# FALSE — body: dict без валидации
async def create_message(body: dict):
    # нет валидации содержимого dict — FALSE
    content = body.get('content')
    ...
```

**Правило:** если `x-quality-body-typed` = `true` (Pydantic BaseModel) → `x-quality-body-validated` = `true` (Pydantic всегда валидирует при парсинге).

---

## 5. `x-quality-errors-defined`

**Применяется всегда.**

Считать `true` при выполнении любого из условий:

```python
# TRUE — явный raise HTTPException с 4xx/5xx
from fastapi import HTTPException

@app.get("/users/{id}")
async def get_user(id: int):
    user = db.find(id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")  # TRUE
    return user

# TRUE — responses в декораторе маршрута
@app.get(
    "/users/{id}",
    responses={
        404: {"model": ErrorResponse, "description": "User not found"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
    }
)
async def get_user(id: int) -> UserResponse:
    ...

# TRUE — кастомный exception handler через HTTPException
raise HTTPException(status_code=400, detail={"errors": errors})

# FALSE — нет HTTPException и нет responses с 4xx/5xx
@app.get("/users/{id}")
async def get_user(id: int):
    return db.find(id)  # нет обработки ошибок — FALSE
```

---

## 6. `x-quality-contract-implemented`

**Применяется всегда.** Значение из Pre-scan флага `contractImplemented`.

Проверять признаки кодогенерации из контракт-схем:

```
# TRUE — datamodel-codegen в зависимостях
# requirements.txt:
datamodel-code-generator>=0.20.0

# pyproject.toml:
[tool.poetry.dev-dependencies]
datamodel-code-generator = "^0.20"

# TRUE — openapi-python-client
openapi-python-client>=0.12.0

# TRUE — Makefile с командой генерации
# generate:
#     datamodel-codegen --input openapi.yaml --output models/generated.py

# TRUE — файл с явным "# generated by" комментарием в первых строках
# (datamodel-codegen добавляет: "# generated by datamodel-codegen...")
import models.generated  # импорт такого файла

# FALSE — нет признаков кодогенерации
```

Файлы проверять: `requirements.txt`, `requirements-dev.txt`, `pyproject.toml`, `setup.py`, `Makefile`. Искать: `datamodel-code-generator`, `openapi-python-client`, `fastapi-code-generator`.
