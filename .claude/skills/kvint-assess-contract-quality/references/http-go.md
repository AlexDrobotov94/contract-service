# Quality Assessment Patterns — HTTP / Go

Паттерны для оценки 6 HTTP-критериев качества в Go-сервисах.

Go — статически типизированный язык, поэтому критерии `params-typed`, `body-typed` и `response-typed` оцениваются по типам аргументов и возвращаемых значений функций-хэндлеров.

**Фреймворки:** chi, gin, echo, net/http stdlib. Определяется по `go.mod`.

---

## 1. `x-quality-params-typed`

**Применяется только если** операция имеет ≥1 параметра (path, query, header).

Считать `true` если параметры извлекаются в переменные с явным типом или через bind в именованную struct.

```go
// TRUE — chi: URLParam → string (всегда string, это typed)
func GetUser(w http.ResponseWriter, r *http.Request) {
    id := chi.URLParam(r, "id")  // string — TRUE
}

// TRUE — gin: ShouldBindUri в именованную struct
type UserURI struct {
    ID string `uri:"id"`
}
func GetUser(c *gin.Context) {
    var uri UserURI
    if err := c.ShouldBindUri(&uri); err != nil { ... }
    // uri.ID — типизировано через struct — TRUE
}

// TRUE — gin: Param → string с последующей конвертацией в нужный тип
id := c.Param("id")          // string — TRUE
page, err := strconv.Atoi(c.Query("page"))  // int — TRUE (явная конвертация)

// TRUE — echo: Bind в struct
type QueryParams struct {
    Page  int    `query:"page"`
    Limit int    `query:"limit"`
}
var params QueryParams
c.Bind(&params)  // TRUE

// FALSE — использование без проверки типа
q := r.URL.Query().Get("page")  // string без конвертации к нужному типу
// и использование напрямую как число без strconv — FALSE
```

---

## 2. `x-quality-body-typed`

**Применяется только если** операция принимает тело.

Считать `true` если тело декодируется в именованную struct (не `map[string]interface{}`, не `interface{}`).

```go
// TRUE — decode в именованную struct
type CreateUserRequest struct {
    Name  string `json:"name"`
    Email string `json:"email"`
}
var req CreateUserRequest
json.NewDecoder(r.Body).Decode(&req)  // TRUE

// TRUE — gin ShouldBindJSON в struct
var req CreateUserRequest
c.ShouldBindJSON(&req)  // TRUE

// TRUE — echo Bind в struct
var req CreateUserRequest
c.Bind(&req)  // TRUE

// FALSE — decode в map
var body map[string]interface{}
json.NewDecoder(r.Body).Decode(&body)  // FALSE

// FALSE — decode в interface{}
var body interface{}
json.NewDecoder(r.Body).Decode(&body)  // FALSE

// FALSE — ioutil.ReadAll без дальнейшего unmarshaling в struct
data, _ := ioutil.ReadAll(r.Body)
// дальнейшая работа с []byte без декодирования в struct — FALSE
```

---

## 3. `x-quality-response-typed`

**Применяется всегда.**

Считать `true` если ответ сериализуется из именованной struct (не `gin.H{}`, не `map[string]interface{}`), или есть swagger-аннотация с явным типом.

```go
// TRUE — encode именованной struct
type UserResponse struct {
    ID   string `json:"id"`
    Name string `json:"name"`
}
json.NewEncoder(w).Encode(UserResponse{ID: id, Name: name})  // TRUE

// TRUE — gin с именованной struct
c.JSON(http.StatusOK, UserResponse{...})  // TRUE

// TRUE — swagger аннотация (swaggo)
// @Success 200 {object} UserResponse
// @Router /users/{id} [get]

// FALSE — gin.H (это map[string]any)
c.JSON(http.StatusOK, gin.H{"id": id, "name": name})  // FALSE

// FALSE — анонимная map
json.NewEncoder(w).Encode(map[string]interface{}{"id": id})  // FALSE

// FALSE — только запись статуса без тела
w.WriteHeader(http.StatusOK)  // нет тела с типизированным ответом — FALSE
```

---

## 4. `x-quality-body-validated`

**Применяется только если** операция принимает тело.

Считать `true` при выполнении любого из условий:

```go
// TRUE — go-playground/validator
import "github.com/go-playground/validator/v10"

type CreateUserRequest struct {
    Name  string `json:"name"  validate:"required,min=1"`
    Email string `json:"email" validate:"required,email"`
}
validate := validator.New()
if err := validate.Struct(req); err != nil {
    c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
    return
}

// TRUE — ручная валидация с явным возвратом ошибки
if req.Email == "" || req.Name == "" {
    http.Error(w, "email and name are required", http.StatusBadRequest)
    return
}

// TRUE — gin ShouldBindJSON возвращает ошибку на невалидные данные
// (если struct имеет `binding:"required"` теги)
type CreateUserRequest struct {
    Name string `json:"name" binding:"required"`
}
if err := c.ShouldBindJSON(&req); err != nil {
    c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
    return
}

// FALSE — decode без последующей валидации
json.NewDecoder(r.Body).Decode(&req)
// дальше используется req без проверки — FALSE
```

---

## 5. `x-quality-errors-defined`

**Применяется всегда.**

Считать `true` при выполнении любого из условий:

```go
// TRUE — swagger аннотация (swaggo)
// @Failure 404 {object} ErrorResponse
// @Failure 400 {object} ValidationError

// TRUE — явный ответ с кодом ошибки
http.Error(w, "user not found", http.StatusNotFound)
c.JSON(http.StatusBadRequest, gin.H{"error": "invalid input"})
c.AbortWithStatusJSON(http.StatusUnauthorized, ErrorResponse{...})
w.WriteHeader(http.StatusForbidden)

// TRUE — возврат ошибки через middleware
c.Error(err)  // gin error middleware

// FALSE — только успешные ответы
c.JSON(http.StatusOK, user)  // нет 4xx/5xx — FALSE
json.NewEncoder(w).Encode(result)  // нет ошибочных кодов — FALSE
```

---

## 6. `x-quality-contract-implemented`

**Применяется всегда.** Значение из Pre-scan флага `contractImplemented`.

Проверять признаки кодогенерации из контракт-схем:

```go
// TRUE — //go:generate директива с oapi-codegen
//go:generate oapi-codegen -package api -generate types,client -o api/types.gen.go openapi.yaml

// TRUE — Makefile с командой кодогенерации
// generate:
//     oapi-codegen ...
//     protoc --go_out=. ...

// TRUE — импорт сгенерированного пакета (обычно имеет `// Code generated` заголовок)
// Проверить: первая строка файла содержит "// Code generated"

// FALSE — нет go:generate директив, нет Makefile с codegen, нет сгенерированных файлов
```

Файлы проверять: `Makefile`, `GNUmakefile`, любые `*.go` файлы с `//go:generate` директивами, `go.mod` на наличие пакетов-генераторов (`github.com/deepmap/oapi-codegen`, `google.golang.org/protobuf`).
