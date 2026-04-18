# React Flow: Customization & Advanced Topics

## Custom Nodes

### Создание кастомной ноды

```jsx
import { Handle, Position } from '@xyflow/react'
import { memo } from 'react'

function TextUpdaterNode({ data, id }) {
  return (
    <div className="text-updater-node">
      <Handle type="target" position={Position.Top} />
      <div>
        <label>Text:</label>
        <input
          onChange={(e) => console.log(e.target.value)}
          className="nodrag" // предотвращает перетаскивание ноды
        />
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

export default memo(TextUpdaterNode) // memo для производительности
```

### Регистрация и использование

```jsx
const nodeTypes = {
  textUpdater: TextUpdaterNode, // определять ВНЕ компонента или через useMemo
}

const nodes = [
  { id: '1', type: 'textUpdater', position: { x: 0, y: 0 }, data: { value: 123 } }
]

<ReactFlow nodes={nodes} nodeTypes={nodeTypes} />
```

**Важно:** `nodeTypes` должен быть стабильной ссылкой — определять вне компонента или через `useMemo`, иначе React Flow выведет предупреждение.

### Props кастомной ноды

```ts
interface NodeProps<T extends Node = Node> {
  id: string
  data: T['data']
  type?: string
  selected: boolean
  isConnectable: boolean
  positionAbsoluteX: number  // абсолютная позиция X (v12+)
  positionAbsoluteY: number  // абсолютная позиция Y (v12+)
  zIndex: number
  dragging: boolean
  deletable?: boolean
  selectable?: boolean
  draggable?: boolean
}
```

### Встроенные типы нод

- `'default'` — с source и target handles
- `'input'` — только source handle (снизу)
- `'output'` — только target handle (сверху)
- `'group'` — без handles, для parent нод

---

## Custom Edges

### Создание кастомного ребра

```jsx
import { BaseEdge, getStraightPath, getBezierPath, EdgeLabelRenderer } from '@xyflow/react'

function CustomEdge({ id, sourceX, sourceY, targetX, targetY, data }) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY,
    targetX, targetY,
  })

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          {data?.label}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
```

### Утилиты для путей

| Функция | Описание |
|---------|---------|
| `getBezierPath(params)` | Кривая Безье (default) |
| `getSmoothStepPath(params)` | Плавные углы |
| `getStraightPath(params)` | Прямая линия |
| `getSimpleBezierPath(params)` | Простая Безье |

Все возвращают `[path, labelX, labelY, offsetX, offsetY]`.

### Регистрация и использование

```jsx
const edgeTypes = { 'custom-edge': CustomEdge }

const edges = [
  { id: 'e1', source: 'n1', target: 'n2', type: 'custom-edge' }
]

<ReactFlow edgeTypes={edgeTypes} edges={edges} />
```

### Props кастомного ребра

```ts
interface EdgeProps<T extends Edge = Edge> {
  id: string
  source: string
  target: string
  sourceX: number; sourceY: number
  targetX: number; targetY: number
  sourcePosition: Position
  targetPosition: Position
  data?: T['data']
  type?: string
  selected: boolean
  animated: boolean
  markerStart?: string
  markerEnd?: string
  style?: CSSProperties
  label?: string
  labelStyle?: CSSProperties
  interactionWidth?: number  // ширина невидимой области для клика
}
```

### Встроенные типы рёбер

- `'default'` — Безье кривая
- `'straight'` — прямая
- `'step'` — прямые углы
- `'smoothstep'` — плавные углы

---

## Handles

### Множественные handles

```jsx
<Handle type="target" position={Position.Top} />
<Handle type="source" position={Position.Right} id="a" />
<Handle type="source" position={Position.Bottom} id="b" />
```

Рёбра с конкретным handle:
```js
const edges = [
  { id: 'e1', source: 'n1', sourceHandle: 'a', target: 'n2' },
  { id: 'e2', source: 'n1', sourceHandle: 'b', target: 'n3' },
]
```

### CSS-классы handles

- `connectingfrom` — handle, от которого началось соединение
- `connectingto` — handle, над которым находится курсор
- `valid` — соединение валидно

### Кастомный стиль handle

```jsx
<Handle
  position={Position.Right}
  type="source"
  style={{ background: 'none', border: 'none', width: '1em', height: '1em' }}
>
  <ArrowCircleRightIcon style={{ pointerEvents: 'none', fontSize: '1em' }} />
</Handle>
```

---

## Theming

### Импорт стилей

```js
// Полные стили (рекомендуется):
import '@xyflow/react/dist/style.css'

// Только базовые (обязательные) стили:
import '@xyflow/react/dist/base.css'
```

С Tailwind CSS v4 — импортировать стили React Flow ДО tailwind:
```css
@import '@xyflow/react/dist/style.css';
@import 'tailwindcss';
```

### Цветовой режим

```jsx
<ReactFlow colorMode="dark" />  // 'light' | 'dark' | 'system'
```

### CSS-переменные

```css
.react-flow {
  --xy-node-background-color-default: #ff5050;
  --xy-edge-stroke-default: #b1b1b7;
  --xy-handle-background-color-default: #1a192b;
  --xy-node-border-default: 1px solid #1a192b;
}
```

### CSS-классы для кастомизации

```css
.react-flow__node { /* все ноды */ }
.react-flow__node.selected { /* выбранные */ }
.react-flow__edge { /* все рёбра */ }
.react-flow__handle { /* все handles */ }
.react-flow__background { /* фон */ }
.react-flow__minimap { /* мини-карта */ }
```

### Tailwind + Кастомная нода

```jsx
function CustomNode({ data }) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
      <Handle type="target" position={Position.Top} className="w-16 !bg-teal-500" />
      <div className="text-lg font-bold">{data.name}</div>
      <Handle type="source" position={Position.Bottom} className="w-16 !bg-teal-500" />
    </div>
  )
}
```

---

## Layouting

React Flow не имеет встроенного layout. Рекомендуемые библиотеки:

### Dagre (простой, для деревьев)

```bash
npm install dagre
```

Общий подход:
1. Создать граф Dagre
2. Установить направление (`LR` или `TB`)
3. Добавить ноды с размерами (из `node.measured.width/height`)
4. Добавить рёбра
5. Выполнить `dagre.layout(graph)`
6. Обновить позиции нод из `graph.node(id).x/y`

### D3-Hierarchy (деревья с одним корнем)

```bash
npm install d3-hierarchy
```

Предполагает равномерные размеры нод. Подходит для: tree map, partition layout, enclosure diagram.

### D3-Force (физическая симуляция)

```bash
npm install d3-force
```

Итеративное вычисление — требует кастомный хук с несколькими циклами рендера. Есть rectangular collision detection.

### ELKjs (максимальная конфигурируемость)

```bash
npm install elkjs web-worker
```

Асинхронный. Самый сложный, но наиболее мощный. Огромное количество настроек.

**Сравнение сложности:** Dagre → D3-Hierarchy → D3-Force → ELKjs

---

## Sub-Flows (Вложенные ноды)

### Создание parent-child структуры

```js
const nodes = [
  {
    id: 'group-1',
    type: 'group',  // без handles
    position: { x: 100, y: 100 },
    data: {},
    style: { width: 300, height: 200 },
  },
  {
    id: 'child-1',
    parentId: 'group-1',  // v12+, раньше parentNode
    position: { x: 10, y: 10 },  // относительно родителя
    extent: 'parent',  // не выходить за границы родителя
    data: { label: 'Child' },
  },
]
```

**Важно:** родительские ноды должны идти раньше дочерних в массиве.

### Поведение

- Перемещение родителя → автоматически перемещаются дети
- `extent: 'parent'` — блокирует выход child за пределы parent
- Child ноды позиционируются относительно parent (`{x:0, y:0}` = верхний левый угол)

### Z-index рёбер в sub-flows

```jsx
// Рёбра отображаются выше нод для child-нод
const defaultEdgeOptions = { zIndex: 1 }
<ReactFlow defaultEdgeOptions={defaultEdgeOptions} />
```

---

## State Management с Zustand

Рекомендуется при сложной логике обновления нод из разных компонентов.

```bash
npm install zustand
```

```js
import { create } from 'zustand'
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react'

const useStore = create((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,

  onNodesChange: (changes) =>
    set({ nodes: applyNodeChanges(changes, get().nodes) }),

  onEdgesChange: (changes) =>
    set({ edges: applyEdgeChanges(changes, get().edges) }),

  onConnect: (connection) =>
    set({ edges: addEdge(connection, get().edges) }),

  // Кастомные действия:
  updateNodeColor: (nodeId, color) =>
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, color } }
          : node
      ),
    }),
}))
```

```jsx
function Flow() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useStore()
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
    />
  )
}
```

---

## Performance

### Мемоизация компонентов

```jsx
// Оборачивать кастомные ноды/рёбра в memo:
export default memo(CustomNode)

// Коллбэки:
const onNodeClick = useCallback((event, node) => {}, [])

// Стабильные объекты:
const nodeTypes = useMemo(() => ({ custom: CustomNode }), [])
```

### Точечная подписка на стор

```jsx
// ❌ Медленно — ре-рендер при любом изменении нод:
const nodes = useStore(state => state.nodes)
const selectedIds = nodes.filter(n => n.selected).map(n => n.id)

// ✅ Быстро — ре-рендер только при изменении выборки:
const selectedIds = useStore(state =>
  state.nodes.filter(n => n.selected).map(n => n.id)
)
```

### Скрытие нод (вместо удаления)

```jsx
setNodes(prev =>
  prev.map(node =>
    childIds.includes(node.id)
      ? { ...node, hidden: !node.hidden }
      : node
  )
)
```

### Рендер только видимых

```jsx
<ReactFlow onlyRenderVisibleElements />
```

---

## TypeScript

### Базовые типы

```ts
import type {
  Node, Edge, NodeProps, EdgeProps,
  OnNodesChange, OnEdgesChange, OnConnect,
  ReactFlowInstance, Viewport,
  BuiltInNode, BuiltInEdge,
} from '@xyflow/react'
```

### Кастомные ноды

```ts
type NumberNode = Node<{ number: number }, 'number'>
type TextNode = Node<{ text: string }, 'text'>
type AppNode = NumberNode | TextNode | BuiltInNode

function NumberNode({ data }: NodeProps<NumberNode>) {
  return <div>{data.number}</div>
}
```

### Кастомные рёбра

```ts
type CustomEdge = Edge<{ value: number }, 'custom'>

function CustomEdgeComponent({ id, sourceX, sourceY, targetX, targetY }: EdgeProps<CustomEdge>) {
  const [edgePath] = getStraightPath({ sourceX, sourceY, targetX, targetY })
  return <BaseEdge id={id} path={edgePath} />
}
```

### Хуки с типами

```ts
const { getNodes } = useReactFlow<AppNode, CustomEdge>()
const nodes = useStore((s: ReactFlowState<AppNode>) => s.nodes)
```

### Сужение типов (type guards)

```ts
function isNumberNode(node: AppNode): node is NumberNode {
  return node.type === 'number'
}
const numberNodes = nodes.filter(isNumberNode)
```

---

## Uncontrolled Flow

Состояние управляется внутри React Flow, не в локальном state.

```jsx
function Flow() {
  return (
    <ReactFlowProvider>
      <ReactFlow
        defaultNodes={initialNodes}
        defaultEdges={initialEdges}
        defaultEdgeOptions={{ animated: true }}
        fitView
      />
      <AddNodeButton /> {/* использует useReactFlow() */}
    </ReactFlowProvider>
  )
}

function AddNodeButton() {
  const { addNodes } = useReactFlow()
  return (
    <button onClick={() => addNodes({ id: Date.now().toString(), position: { x: 0, y: 0 }, data: {} })}>
      Add Node
    </button>
  )
}
```

---

## Viewport Management

### Figma-like управление (panOnScroll)

```jsx
<ReactFlow
  panOnScroll
  selectionOnDrag
  panOnDrag={false}
  selectionMode="partial"
/>
```

---

## Common Errors

| Ошибка | Причина | Решение |
|--------|---------|---------|
| "Seems like you have not used zustand provider" | Две версии @xyflow/react или хук вне контекста | Обновить зависимости / обернуть в `<ReactFlowProvider />` |
| "new nodeTypes or edgeTypes object" | Объект пересоздаётся при каждом рендере | Определить вне компонента или `useMemo` |
| "Node type not found. Using fallback type default" | Несовпадение ключа в nodeTypes | Проверить точное совпадение `node.type` с ключом |
| "Parent container needs a width and a height" | Нет CSS-размеров у контейнера | Добавить фиксированную высоту |
| "Only child nodes can use a parent extent" | `extent` без `parentId` | Убрать extent или добавить parentId |
| "Can't create edge. Needs a source and a target" | Нет source/target в edge | Добавить оба поля |
| Handle не работает | Использован вне кастомной ноды | Использовать только внутри nodeTypes |
| Edges не отображаются | Нет CSS импорта | `import '@xyflow/react/dist/style.css'` |
| Mouse coords неверные | Не учтён zoom | Делить на `zoom` при работе с координатами |

---

## Migration v11 → v12

| v11 | v12 |
|-----|-----|
| `import ReactFlow from 'reactflow'` | `import { ReactFlow } from '@xyflow/react'` |
| `node.width` / `node.height` | `node.measured.width` / `node.measured.height` |
| `parentNode` | `parentId` |
| `xPos` / `yPos` в props ноды | `positionAbsoluteX` / `positionAbsoluteY` |
| `onEdgeUpdate` | `onReconnect` |
| `updateEdge` | `reconnectEdge` |
| `edgeUpdaterRadius` | `reconnectRadius` |
| `edge.updatable` | `edge.reconnectable` |
| `getNodesBounds(nodes, nodeOrigin)` | `getNodesBounds(nodes, { nodeOrigin })` |
| `nodeInternals` (store) | `nodeLookup` |
| `react-flow__handle-connecting` | `connectingto` / `connectingfrom` |
| `react-flow__handle-valid` | `valid` |
| Удалены: `getTransformForBounds`, `getRectOfNodes`, `project`, `getMarkerEndId`, `updateEdge` | Используй новые аналоги |
