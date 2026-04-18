---
name: react-flow-reference
description: >
  Reference documentation for the React Flow library (@xyflow/react). Use this skill whenever
  the user asks about React Flow — creating nodes, edges, handles, custom components, hooks,
  API props, layouting, TypeScript types, theming, state management, or troubleshooting.
  Trigger on any mention of: ReactFlow, @xyflow/react, react-flow, nodes/edges in a diagram
  context, flow graphs, node-based UI, handle connections, useReactFlow, useNodesState,
  useEdgesState, fitView, ReactFlowProvider, custom nodes/edges, dagre layout in React context,
  or any React Flow component/hook by name. Also trigger when user asks how to build
  flow diagrams, node editors, workflow builders, or mind maps in React.
---

# React Flow Reference

React Flow (`@xyflow/react`) — библиотека для построения node-based UI: диаграмм, workflow-редакторов, mind map и т.д.

## Быстрый старт

```bash
npm install @xyflow/react
```

**Обязательно:**
1. Импортировать CSS: `import '@xyflow/react/dist/style.css'`
2. Задать размеры родительскому контейнеру (width + height)

```jsx
import { ReactFlow, useNodesState, useEdgesState, addEdge, Background, Controls } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

const initialNodes = [
  { id: 'n1', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
  { id: 'n2', position: { x: 0, y: 100 }, data: { label: 'Node 2' } },
]
const initialEdges = [{ id: 'e1', source: 'n1', target: 'n2' }]

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  )

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  )
}
```

## Ключевые концепции

| Концепция | Описание |
|-----------|---------|
| **Node** | Объект с `id`, `position: {x, y}`, `data`, опционально `type` |
| **Edge** | Объект с `id`, `source`, `target` (ID нод), опционально `type`, `data` |
| **Handle** | Точка подключения ребра на ноде (`type: 'source' \| 'target'`, `position`) |
| **Viewport** | Область отображения: `{x, y, zoom}` |
| **Connection** | Временное ребро при drag от handle |
| **nodeTypes** | Маппинг `{ typeName: Component }` — регистрация кастомных нод |
| **edgeTypes** | Маппинг `{ typeName: Component }` — регистрация кастомных рёбер |

### Структура объекта Node

```ts
{
  id: string              // уникальный идентификатор
  position: { x, y }     // позиция (или относительно родителя в sub-flow)
  data: Record<string, unknown>  // произвольные данные для компонента
  type?: string           // ключ в nodeTypes (default: 'default')
  parentId?: string       // ID родительской ноды (sub-flow)
  extent?: 'parent'       // ограничить движение границами родителя
  hidden?: boolean        // скрыть ноду
  selected?: boolean
  draggable?: boolean
  selectable?: boolean
  deletable?: boolean
  zIndex?: number
  style?: CSSProperties
  className?: string
  measured?: { width: number; height: number }  // размеры после маунта
  width?: number; height?: number  // задать размер через стиль (v12+)
}
```

### Структура объекта Edge

```ts
{
  id: string
  source: string          // ID исходной ноды
  target: string          // ID целевой ноды
  sourceHandle?: string   // ID handle на source ноде
  targetHandle?: string   // ID handle на target ноде
  type?: string           // ключ в edgeTypes
  data?: Record<string, unknown>
  animated?: boolean      // анимированный пунктир
  hidden?: boolean
  selected?: boolean
  deletable?: boolean
  reconnectable?: boolean
  label?: string | ReactNode
  labelStyle?: CSSProperties
  style?: CSSProperties
  markerStart?: MarkerType | string
  markerEnd?: MarkerType | string
  zIndex?: number
  interactionWidth?: number  // ширина интерактивной зоны
}
```

## Интерактивность

По умолчанию из коробки (после подключения `onNodesChange`, `onEdgesChange`, `onConnect`):
- Перетаскивание нод
- Выбор нод и рёбер кликом
- Мульти-выбор (Shift+клик, Shift+drag)
- Удаление (Backspace)
- Соединение через drag от handle
- Зум (колесо, pinch)
- Панорамирование (drag)

Утилиты для обработки изменений:
```jsx
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react'

// Обработчики для управляемого flow:
const onNodesChange = useCallback(
  (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
  []
)
const onEdgesChange = useCallback(
  (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
  []
)
const onConnect = useCallback(
  (params) => setEdges((eds) => addEdge(params, eds)),
  []
)
```

## Справочные файлы

Читай по необходимости — не загружай все сразу:

- **`references/components-and-hooks.md`** — полный справочник по компонентам (`ReactFlow`, `Background`, `Controls`, `MiniMap`, `Panel`, `Handle`, `NodeToolbar`, `NodeResizer`, `EdgeLabelRenderer`, `ReactFlowProvider`) и всем хукам (`useReactFlow`, `useNodesState`, `useEdgesState`, `useNodes`, `useEdges`, `useViewport`, `useStore`, `useConnection`, `useNodeConnections`, `useNodesData`, `useNodesInitialized`, `useUpdateNodeInternals`, `useOnViewportChange`, `useOnSelectionChange`, `useNodeId`, `useKeyPress`, `useStore`).

- **`references/customization-and-advanced.md`** — кастомизация (custom nodes, custom edges, handles, theming, CSS-переменные), layouting (Dagre, D3, ELKjs), sub-flows, state management с Zustand, performance, TypeScript, uncontrolled flow, viewport management, common errors, migration v11→v12.

## Частые паттерны

### Программное управление viewport

```jsx
const { fitView, zoomIn, setCenter, screenToFlowPosition } = useReactFlow()

// Подогнать под все ноды:
fitView({ padding: 0.2, duration: 800 })

// Преобразовать координаты для drag-n-drop:
const position = screenToFlowPosition({ x: event.clientX, y: event.clientY })
```

### Добавление ноды по клику на фон

```jsx
<ReactFlow
  onPaneClick={(event) => {
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY })
    addNodes({ id: Date.now().toString(), position, data: { label: 'New' } })
  }}
/>
```

### Валидация соединений

```jsx
<ReactFlow
  isValidConnection={(connection) => {
    // connection: { source, target, sourceHandle, targetHandle }
    return connection.source !== connection.target
  }}
/>
```

### Экспорт/импорт

```jsx
const { toObject } = useReactFlow()
// Экспорт:
const flow = toObject() // { nodes, edges, viewport }
// Импорт:
setNodes(flow.nodes)
setEdges(flow.edges)
setViewport(flow.viewport)
```

### Динамические handles (нужен useUpdateNodeInternals)

```jsx
const updateNodeInternals = useUpdateNodeInternals()

// После изменения handles в state:
useEffect(() => {
  updateNodeInternals(nodeId)
}, [handleCount])
```

## Замечания

- `nodeTypes` и `edgeTypes` должны быть **стабильными ссылками** (вне компонента или `useMemo`), иначе React Flow выведет предупреждение и пересоздаст все ноды.
- Используй `memo()` для кастомных нод/рёбер — предотвращает лишние ре-рендеры.
- Классы `nodrag`, `nopan`, `nowheel` на элементах внутри ноды блокируют соответствующие жесты React Flow.
- `useNodes()` и `useEdges()` вызывают ре-рендер при **каждом** изменении — предпочитай `useNodesData()` или `useStore()` с точным selector.
- Для доступа к хукам вне `<ReactFlow />` необходим `<ReactFlowProvider />`.
