---
name: elkjs-reference
description: >
  Reference documentation for elkjs — the JavaScript port of Eclipse Layout Kernel (ELK).
  Use this skill whenever you need to work with elkjs: graph layout, layout options, ELK JSON format,
  TypeScript types, API methods, or algorithm configuration. Trigger on: "elkjs", "elk layout",
  "layered algorithm", "elk.algorithm", "layoutOptions", "ElkNode", "ElkEdge", "elk.layout()",
  graph auto-layout with elkjs, configuring elk spacing/direction/routing, reactflow elk, sprotty elk.
---

# elkjs Reference

elkjs — это JavaScript-порт Eclipse Layout Kernel. **Не рендерит** граф — только вычисляет позиции (x, y) узлов и маршруты рёбер.

---

## Установка

```bash
npm install elkjs
# или dev-версия (на основе master ветки ELK)
npm install elkjs@next
```

---

## Файлы библиотеки

| Файл | Назначение |
|------|-----------|
| `elk-api.js` | Только API (без алгоритмов) |
| `elk-worker.js` | Алгоритмы компоновки (GWT-код из Java) |
| `elk.bundled.js` | Оба файла вместе, для `<script>` в браузере |
| `main.js` | Точка входа для Node.js (`require('elkjs')`) |

---

## Быстрый старт

```js
const ELK = require('elkjs')
const elk = new ELK()

const graph = {
  id: "root",
  layoutOptions: { 'elk.algorithm': 'layered' },
  children: [
    { id: "n1", width: 30, height: 30 },
    { id: "n2", width: 30, height: 30 },
    { id: "n3", width: 30, height: 30 }
  ],
  edges: [
    { id: "e1", sources: ["n1"], targets: ["n2"] },
    { id: "e2", sources: ["n1"], targets: ["n3"] }
  ]
}

elk.layout(graph).then(console.log).catch(console.error)
```

---

## TypeScript

```ts
// Бандлированная версия
import ELK from 'elkjs/lib/elk.bundled.js'
const elk = new ELK()

// API + отдельный воркер
import ELK from 'elkjs/lib/elk-api'
const elk = new ELK({ workerUrl: './elk-worker.min.js' })
```

---

## Конструктор `new ELK(options?)`

```ts
interface ELKConstructorArguments {
  defaultLayoutOptions?: LayoutOptions   // применяются к каждому вызову layout()
  algorithms?: string[]                  // суффиксы: ['layered', 'stress', ...]
  workerUrl?: string                     // путь к elk-worker.js (включает Web Worker)
  workerFactory?: (url?: string) => Worker
}
```

**Алгоритмы по умолчанию:** `['layered', 'stress', 'mrtree', 'radial', 'force', 'disco']`  
Алгоритмы `box`, `fixed`, `random` всегда включены.

---

## API методы

### `elk.layout(graph, options?)`

```ts
elk.layout(graph: ElkNode, args?: ElkLayoutArguments): Promise<ElkNode>

interface ElkLayoutArguments {
  layoutOptions?: LayoutOptions   // глобальные опции (применяются ко всем элементам)
  logging?: boolean               // с 0.6.0: вернуть debug-лог в результате
  measureExecutionTime?: boolean  // с 0.6.0: вернуть время выполнения (в секундах)
}
```

### `elk.knownLayoutOptions()`
Возвращает `Promise<ElkLayoutOptionDescription[]>` — список всех известных layout options.

### `elk.knownLayoutAlgorithms()`
Возвращает `Promise<ElkLayoutAlgorithmDescription[]>` — список зарегистрированных алгоритмов.

### `elk.knownLayoutCategories()`
Возвращает `Promise<ElkLayoutCategoryDescription[]>`.

### `elk.terminateWorker()`
Завершает Web Worker (если использовался).

---

## Использование с Web Worker

### Node.js

```js
const ELK = require('elkjs')

// Без воркера
const elk = new ELK()

// С воркером (нужен пакет 'web-worker')
const elk = new ELK({
  workerUrl: './node_modules/elkjs/lib/elk-worker.min.js'
})
```

Node.js 10+ поддерживает worker_threads. Если пакет `web-worker` не установлен — автоматически fallback на синхронный режим.

### Браузер

```html
<!-- Бандл -->
<script src="./elk.bundled.js"></script>

<!-- API + воркер раздельно -->
<script src="./elk-api.js"></script>
<script>
  const elk = new ELK({ workerUrl: './elk-worker.js' })
</script>
```

### Debug (нeminified версия)

```js
const ELK = require('elkjs/lib/elk-api.js')
const elk = new ELK({
  workerFactory: function(url) {
    const { Worker } = require('elkjs/lib/elk-worker.js') // не минифицированный
    return new Worker(url)
  }
})
```

---

## ELK JSON формат (граф)

Все элементы кроме `labels` обязаны иметь `id`.

### ElkNode (узел / граф)

```ts
interface ElkNode extends ElkShape {
  id: string
  children?: ElkNode[]         // дочерние узлы (compound graph)
  ports?: ElkPort[]
  edges?: ElkExtendedEdge[]    // рёбра, принадлежащие этому узлу как контейнеру
  // унаследовано:
  x?: number
  y?: number
  width?: number
  height?: number
  labels?: ElkLabel[]
  layoutOptions?: LayoutOptions
}
```

### ElkPort (порт)

```ts
interface ElkPort extends ElkShape {
  id: string
  // x, y, width, height, labels, layoutOptions
}
```

### ElkLabel (подпись)

```ts
interface ElkLabel extends ElkShape {
  text?: string
  // x, y, width, height, layoutOptions
  // id не обязателен
}
```

> Алгоритм не вычисляет размер текста — передайте `width`/`height` вручную.

### ElkExtendedEdge (рекомендуемый формат рёбер)

```ts
interface ElkExtendedEdge extends ElkEdge {
  sources: string[]        // id исходных портов или узлов
  targets: string[]        // id целевых портов или узлов
  sections?: ElkEdgeSection[]
  // id, junctionPoints?, layoutOptions?
}
```

Рёбра размещаются в `edges` того узла, который является наименьшим общим предком source и target.

### ElkEdgeSection (секция маршрута, выходные данные)

```ts
interface ElkEdgeSection extends ElkGraphElement {
  id: string
  startPoint: ElkPoint     // { x, y }
  endPoint: ElkPoint
  bendPoints?: ElkPoint[]
  incomingShape?: string
  outgoingShape?: string
  incomingSections?: string[]
  outgoingSections?: string[]
}
```

### ElkPrimitiveEdge (устаревший формат)

```ts
// @deprecated — используйте ElkExtendedEdge
interface ElkPrimitiveEdge extends ElkEdge {
  source: string
  sourcePort?: string
  target: string
  targetPort?: string
  sourcePoint?: ElkPoint
  targetPoint?: ElkPoint
  bendPoints?: ElkPoint[]
}
```

---

## Результат layout()

После вызова `elk.layout()` в объекте появляются:
- `x`, `y` у каждого узла и порта
- `sections` у каждого ребра (маршрут)
- `junctionPoints` у рёбер (точки разветвления для гиперрёбер)
- Если `logging: true` — поле `logging` в корне графа
- Если `measureExecutionTime: true` — `executionTime` в `logging`

```js
// Пример с логированием
elk.layout(graph, {
  layoutOptions: { 'algorithm': 'layered' },
  logging: true,
  measureExecutionTime: true
}).then(result => {
  // result.logging.executionTime — время в секундах
  // result.logging.children — дерево этапов алгоритма
})
```

---

## Глобальные layout options vs. на элемент

```js
// Глобальные через constructor
const elk = new ELK({ defaultLayoutOptions: { 'elk.direction': 'RIGHT' } })

// Глобальные через вызов layout()
elk.layout(graph, { layoutOptions: { 'elk.direction': 'DOWN' } })

// На конкретный элемент (приоритетнее глобальных)
{ id: "n1", width: 30, height: 30, layoutOptions: { 'elk.portConstraints': 'FIXED_SIDE' } }
```

---

## Layout Options — краткий суффикс

Можно писать суффикс вместо полного ID (`algorithm` вместо `org.eclipse.elk.algorithm`), но **только если суффикс уникален**. Безопаснее использовать `elk.` префикс.

---

## Алгоритмы

### `layered` (по умолчанию, рекомендуется)

**ID:** `org.eclipse.elk.layered`  
Слоевый алгоритм по методу Сугиямы. Лучше всего для направленных графов (DAG) с явным направлением потока.

**Ключевые опции layered:**

| Опция | ID | Тип | По умолчанию |
|-------|----|-----|-------------|
| Стратегия слоёв | `elk.layered.layering.strategy` | enum | `NETWORK_SIMPLEX` |
| Размещение узлов | `elk.layered.nodePlacement.strategy` | enum | `BRANDES_KOEPF` |
| Разбиение циклов | `elk.layered.cycleBreaking.strategy` | enum | `GREEDY` |
| Минимизация пересечений | `elk.layered.crossingMinimization.strategy` | enum | `LAYER_SWEEP` |
| Spacing между слоями | `elk.layered.spacing.nodeNodeBetweenLayers` | double | `20` |
| Edge-Node между слоями | `elk.layered.spacing.edgeNodeBetweenLayers` | double | `10` |
| Edge-Edge между слоями | `elk.layered.spacing.edgeEdgeBetweenLayers` | double | `10` |
| Порядок модели | `elk.layered.considerModelOrder.strategy` | enum | `NONE` |

**`layering.strategy` значения:**
`NETWORK_SIMPLEX` | `LONGEST_PATH` | `LONGEST_PATH_SOURCE` | `COFFMAN_GRAHAM` | `INTERACTIVE` | `STRETCH_WIDTH` | `MIN_WIDTH` | `BF_MODEL_ORDER` | `DF_MODEL_ORDER`

**`nodePlacement.strategy` значения:**
`SIMPLE` | `INTERACTIVE` | `LINEAR_SEGMENTS` | `BRANDES_KOEPF` | `NETWORK_SIMPLEX`

**`cycleBreaking.strategy` значения:**
`GREEDY` | `DEPTH_FIRST` | `INTERACTIVE` | `MODEL_ORDER` | `GREEDY_MODEL_ORDER` | `SCC_CONNECTIVITY` | `SCC_NODE_TYPE` | `DFS_NODE_ORDER` | `BFS_NODE_ORDER`

**`crossingMinimization.strategy` значения:**
`LAYER_SWEEP` | `MEDIAN_LAYER_SWEEP` | `INTERACTIVE` | `NONE`

**`considerModelOrder.strategy` значения:**
`NONE` | `NODES_AND_EDGES` | `PREFER_EDGES` | `PREFER_NODES`

---

### `force`

**ID:** `org.eclipse.elk.force`  
Силовой алгоритм (Eades 1984 или Fruchterman-Reingold). Для ненаправленных графов без иерархии.

| Опция | ID | По умолчанию |
|-------|----|-------------|
| Модель | `elk.force.model` | `FRUCHTERMAN_REINGOLD` |
| Итерации | `elk.force.iterations` | `300` |
| Node Spacing | `elk.spacing.nodeNode` | `80` |
| Padding | `elk.padding` | `50` |
| Repulsive Power | `elk.force.repulsivePower` | `0` |
| Eades Repulsion | `elk.force.repulsion` | `5.0` |
| FR Temperature | `elk.force.temperature` | `0.001` |

**`elk.force.model` значения:** `EADES` | `FRUCHTERMAN_REINGOLD`

---

### `mrtree`

**ID:** `org.eclipse.elk.mrtree`  
Дерево. Строит остовное дерево и раскладывает иерархически. Подходит для ацикличных графов.

| Опция | ID | По умолчанию |
|-------|----|-------------|
| Direction | `elk.direction` | `UNDEFINED` |
| Node Spacing | `elk.spacing.nodeNode` | `20` |
| Search Order | `elk.mrtree.searchOrder` | `DFS` |
| Порядок узлов | `elk.mrtree.weighting` | `MODEL_ORDER` |

---

### `radial`

**ID:** `org.eclipse.elk.radial`  
Радиальная раскладка (Eades). Корень в центре, дочерние на окружностях.

| Опция | ID | По умолчанию |
|-------|----|-------------|
| Radius | `elk.radial.radius` | `0.0` |
| Compaction | `elk.radial.compactor` | `NONE` |
| Center On Root | `elk.radial.centerOnRoot` | `false` |
| Sorter | `elk.radial.sorter` | `NONE` |
| Wedge Criteria | `elk.radial.wedgeCriteria` | `NODE_SIZE` |

---

### `box`

**ID:** `org.eclipse.elk.box`  
Упаковка прямоугольников без рёбер.

| Опция | ID | По умолчанию |
|-------|----|-------------|
| Packing Mode | `elk.box.packingMode` | `SIMPLE` |
| Aspect Ratio | `elk.aspectRatio` | `1.3` |
| Node Spacing | `elk.spacing.nodeNode` | `15` |
| Padding | `elk.padding` | `15` |
| Expand Nodes | `elk.expandNodes` | `false` |

---

### `stress`

**ID:** `org.eclipse.elk.stress`  
Минимизация стресса (стресс-мажоризация). Сохраняет топологические расстояния.

| Опция | ID | По умолчанию |
|-------|----|-------------|
| Desired Edge Length | `elk.stress.desiredEdgeLength` | `100.0` |
| Iteration Limit | `elk.stress.iterationLimit` | `MAX_INT` |
| Epsilon | `elk.stress.epsilon` | `10e-4` |
| Dimension | `elk.stress.dimension` | `XY` |

---

## Общие layout options

### Базовые (применяются к большинству алгоритмов)

| Опция | ID | Тип | По умолчанию | Применяется к |
|-------|----|-----|-------------|---------------|
| Алгоритм | `elk.algorithm` | string | — | parents |
| Направление | `elk.direction` | enum | `UNDEFINED` | parents |
| Маршрутизация рёбер | `elk.edgeRouting` | enum | `UNDEFINED` | parents |
| Иерархия | `elk.hierarchyHandling` | enum | `INHERIT` | nodes, parents |
| Разделять компоненты | `elk.separateConnectedComponents` | boolean | — | parents |
| Aspect ratio | `elk.aspectRatio` | double | — | parents |

**`elk.direction` значения:** `UNDEFINED` | `RIGHT` | `LEFT` | `DOWN` | `UP`

**`elk.edgeRouting` значения:** `UNDEFINED` | `POLYLINE` | `ORTHOGONAL` | `SPLINES`

**`elk.hierarchyHandling` значения:**
- `INHERIT` — наследует от родителя (корень → `SEPARATE_CHILDREN`)
- `INCLUDE_CHILDREN` — один проход для узла и всех потомков
- `SEPARATE_CHILDREN` — каждый compound-узел раскладывается отдельно

### Spacing

| Опция | ID | По умолчанию |
|-------|----|-------------|
| Node-Node | `elk.spacing.nodeNode` | `20` |
| Edge-Edge | `elk.spacing.edgeEdge` | `10` |
| Edge-Node | `elk.spacing.edgeNode` | `10` |
| Padding | `elk.padding` | `12` |

### Порты

| Опция | ID | Тип | По умолчанию | Применяется к |
|-------|----|-----|-------------|---------------|
| Port Constraints | `elk.portConstraints` | enum | `UNDEFINED` | nodes |
| Port Side | `elk.port.side` | enum | `UNDEFINED` | ports |
| Port Labels Placement | `elk.portLabels.placement` | EnumSet | `OUTSIDE` | nodes |

**`elk.portConstraints` значения:**
`UNDEFINED` | `FREE` | `FIXED_SIDE` | `FIXED_ORDER` | `FIXED_RATIO` | `FIXED_POS`

**`elk.port.side` значения:** `UNDEFINED` | `NORTH` | `EAST` | `SOUTH` | `WEST`

**`elk.portLabels.placement` значения:**
`OUTSIDE` | `INSIDE` | `NEXT_TO_PORT_IF_POSSIBLE` | `ALWAYS_SAME_SIDE` | `ALWAYS_OTHER_SAME_SIDE` | `SPACE_EFFICIENT`

### Node labels

| Опция | ID | Тип | По умолчанию | Применяется к |
|-------|----|-----|-------------|---------------|
| Node Labels Placement | `elk.nodeLabels.placement` | EnumSet | fixed() | nodes, labels |

**`elk.nodeLabels.placement` значения:**
`H_LEFT` | `H_CENTER` | `H_RIGHT` | `V_TOP` | `V_CENTER` | `V_BOTTOM` | `INSIDE` | `OUTSIDE` | `H_PRIORITY`

Пример: `"elk.nodeLabels.placement": "INSIDE V_CENTER H_CENTER"`

### Node size

| Опция | ID | Тип | По умолчанию | Применяется к |
|-------|----|-----|-------------|---------------|
| Node Size Constraints | `elk.nodeSize.constraints` | EnumSet | пусто | nodes |

**`elk.nodeSize.constraints` значения:**
`PORTS` | `PORT_LABELS` | `NODE_LABELS` | `MINIMUM_SIZE`

Пустое значение = размер узла фиксирован.

---

## Compound graphs (вложенные узлы)

Узлы могут содержать `children` — тогда это compound-узел. Рёбра между дочерними узлами размещаются в их родителе (ближайшем общем предке).

```js
{
  id: "root",
  layoutOptions: { 'elk.algorithm': 'layered', 'elk.hierarchyHandling': 'INCLUDE_CHILDREN' },
  children: [
    {
      id: "group1",
      children: [
        { id: "a", width: 30, height: 30 },
        { id: "b", width: 30, height: 30 }
      ]
    }
  ],
  edges: [{ id: "e1", sources: ["a"], targets: ["b"] }]
}
```

---

## Типичные паттерны

### Направленный граф слева направо

```js
layoutOptions: {
  'elk.algorithm': 'layered',
  'elk.direction': 'RIGHT',
  'elk.spacing.nodeNode': '50',
  'elk.layered.spacing.nodeNodeBetweenLayers': '80'
}
```

### Дерево сверху вниз

```js
layoutOptions: {
  'elk.algorithm': 'mrtree',
  'elk.direction': 'DOWN',
  'elk.spacing.nodeNode': '30'
}
```

### Силовая раскладка

```js
layoutOptions: {
  'elk.algorithm': 'force',
  'elk.spacing.nodeNode': '60',
  'elk.force.iterations': '500'
}
```

### Фиксированные порты

```js
// На узле:
{ id: "n1", width: 60, height: 60, layoutOptions: { 'elk.portConstraints': 'FIXED_SIDE' },
  ports: [
    { id: "p1", layoutOptions: { 'elk.port.side': 'WEST' } },
    { id: "p2", layoutOptions: { 'elk.port.side': 'EAST' } }
  ]
}
// В ребре:
{ id: "e1", sources: ["p1"], targets: ["p2"] }
```

---

## Известные проблемы

- **`g is not defined`** — проблема GWT-транспиляции при bundling (webpack/React). Используйте `elk.bundled.js` или настройте воркер.
- **`Can't resolve web-worker`** — установите пакет `web-worker` или не используйте `workerUrl`.
- В браузере без Web Worker — layout блокирует UI-поток.
- Для отладки используйте не-минифицированные версии (`elk-worker.js`, `elk-api.js`).

---

## Ссылки

- GitHub: https://github.com/kieler/elkjs
- ELK документация: https://eclipse.dev/elk/documentation.html
- ELK reference (все опции): https://eclipse.dev/elk/reference.html
- Демо: https://rtsys.informatik.uni-kiel.de/elklive/
