# React Flow: Components & Hooks Reference

## Built-in Components

### `<ReactFlow />` — Главный компонент

Импорт: `import { ReactFlow } from '@xyflow/react'`

**Обязательно:** импортировать стили `import '@xyflow/react/dist/style.css'` и задать размеры родителю.

#### Common Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `nodes` | `Node[]` | `[]` | Управляемый массив нод |
| `edges` | `Edge[]` | `[]` | Управляемый массив рёбер |
| `defaultNodes` | `Node[]` | — | Начальные ноды (uncontrolled) |
| `defaultEdges` | `Edge[]` | — | Начальные рёбра (uncontrolled) |
| `nodeTypes` | `NodeTypes` | built-in | Маппинг кастомных нод |
| `edgeTypes` | `EdgeTypes` | built-in | Маппинг кастомных рёбер |
| `colorMode` | `'light' \| 'dark' \| 'system'` | `'light'` | Цветовая схема |
| `nodeOrigin` | `NodeOrigin` | `[0, 0]` | Начало координат ноды |
| `nodeDragThreshold` | `number` | `1` | Порог drag в пикселях |
| `debug` | `boolean` | `false` | Логирование в консоль |
| `proOptions` | `ProOptions` | — | Настройки Pro |

#### Viewport Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultViewport` | `Viewport` | `{x:0,y:0,zoom:1}` | Начальный viewport |
| `viewport` | `Viewport` | — | Управляемый viewport |
| `onViewportChange` | `(v: Viewport) => void` | — | Изменение viewport |
| `fitView` | `boolean` | — | Авто-подгонка при маунте |
| `fitViewOptions` | `FitViewOptionsBase` | — | Настройки fitView |
| `minZoom` | `number` | `0.5` | Минимальный зум |
| `maxZoom` | `number` | `2` | Максимальный зум |
| `snapToGrid` | `boolean` | — | Привязка к сетке |
| `snapGrid` | `SnapGrid` | — | Размер ячейки сетки |
| `onlyRenderVisibleElements` | `boolean` | `false` | Рендер только видимых |
| `translateExtent` | `CoordinateExtent` | Infinite | Ограничение панорамирования |
| `nodeExtent` | `CoordinateExtent` | — | Ограничение позиций нод |
| `preventScrolling` | `boolean` | `true` | Блокировка скролла страницы |
| `attributionPosition` | `PanelPosition` | `'bottom-right'` | Позиция attribution |

#### Edge Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `elevateEdgesOnSelect` | `boolean` | `false` | Поднять z-index при выборе |
| `defaultMarkerColor` | `string \| null` | `'#b1b1b7'` | Цвет маркера по умолчанию |
| `defaultEdgeOptions` | `DefaultEdgeOptions` | — | Базовые настройки рёбер |
| `reconnectRadius` | `number` | `10` | Радиус переподключения |
| `edgesReconnectable` | `boolean` | `true` | Разрешить переподключение |

#### Interaction Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `nodesDraggable` | `boolean` | `true` | Перетаскивание нод |
| `nodesConnectable` | `boolean` | `true` | Соединение нод |
| `nodesFocusable` | `boolean` | `true` | Фокус на ноды Tab/Enter |
| `edgesFocusable` | `boolean` | `true` | Фокус на рёбра |
| `elementsSelectable` | `boolean` | `true` | Выбор кликом |
| `panOnDrag` | `boolean \| number[]` | `true` | Панорамирование мышью |
| `selectionOnDrag` | `boolean` | `false` | Рамка выбора без модификатора |
| `selectionMode` | `SelectionMode` | `'full'` | Частичный vs полный выбор |
| `panOnScroll` | `boolean` | `false` | Панорамирование колесом |
| `panOnScrollSpeed` | `number` | `0.5` | Скорость панорамирования |
| `zoomOnScroll` | `boolean` | `true` | Зум колесом |
| `zoomOnPinch` | `boolean` | `true` | Зум щипком |
| `zoomOnDoubleClick` | `boolean` | `true` | Зум двойным кликом |
| `connectOnClick` | `boolean` | `true` | Соединение кликом |
| `connectionMode` | `ConnectionMode` | `'strict'` | Строгое/свободное соединение |
| `autoPanOnConnect` | `boolean` | `true` | Авто-пан при соединении |
| `autoPanOnNodeDrag` | `boolean` | `true` | Авто-пан при перетаскивании |
| `autoPanSpeed` | `number` | `15` | Скорость авто-пана |

#### Connection Line Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `connectionLineStyle` | `CSSProperties` | — | Стиль линии соединения |
| `connectionLineType` | `ConnectionLineType` | `Bezier` | Тип линии соединения |
| `connectionRadius` | `number` | `20` | Радиус захвата handle |
| `connectionLineComponent` | `ConnectionLineComponent` | — | Кастомная линия |

#### Keyboard Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `deleteKeyCode` | `KeyCode \| null` | `'Backspace'` | Клавиша удаления |
| `selectionKeyCode` | `KeyCode \| null` | `'Shift'` | Модификатор рамки |
| `multiSelectionKeyCode` | `KeyCode \| null` | OS-зависимо | Мульти-выбор |
| `zoomActivationKeyCode` | `KeyCode \| null` | OS-зависимо | Активатор зума |
| `panActivationKeyCode` | `KeyCode \| null` | `'Space'` | Активатор панорамирования |
| `disableKeyboardA11y` | `boolean` | `false` | Отключить kbd a11y |

#### Style Class Props
| Prop | Default | Description |
|------|---------|-------------|
| `noPanClassName` | `'nopan'` | Элемент не панорамирует при drag |
| `noDragClassName` | `'nodrag'` | Элемент не перетаскивает ноду |
| `noWheelClassName` | `'nowheel'` | Элемент не зумирует колесом |

#### Event Handlers — Nodes
| Handler | Сигнатура | Описание |
|---------|-----------|---------|
| `onNodesChange` | `OnNodesChange<Node>` | Изменение состояния нод |
| `onNodeClick` | `NodeMouseHandler<Node>` | Клик по ноде |
| `onNodeDoubleClick` | `NodeMouseHandler<Node>` | Двойной клик |
| `onNodeDragStart` | `OnNodeDrag<Node>` | Начало перетаскивания |
| `onNodeDrag` | `OnNodeDrag<Node>` | Перетаскивание |
| `onNodeDragStop` | `OnNodeDrag<Node>` | Конец перетаскивания |
| `onNodeMouseEnter` | `NodeMouseHandler<Node>` | Hover enter |
| `onNodeMouseLeave` | `NodeMouseHandler<Node>` | Hover leave |
| `onNodeContextMenu` | `NodeMouseHandler<Node>` | Правый клик |
| `onNodesDelete` | `OnNodesDelete<Node>` | Удаление нод |

#### Event Handlers — Edges
| Handler | Сигнатура | Описание |
|---------|-----------|---------|
| `onEdgesChange` | `OnEdgesChange<Edge>` | Изменение состояния рёбер |
| `onEdgeClick` | `(event, edge) => void` | Клик по ребру |
| `onEdgeDoubleClick` | `EdgeMouseHandler<Edge>` | Двойной клик |
| `onEdgeContextMenu` | `EdgeMouseHandler<Edge>` | Правый клик |
| `onEdgesDelete` | `OnEdgesDelete<Edge>` | Удаление рёбер |
| `onReconnect` | `OnReconnect<Edge>` | Переподключение ребра |
| `onReconnectStart` | `(event, edge, handleType) => void` | Начало переподключения |
| `onReconnectEnd` | `(event, edge, handleType, state) => void` | Конец переподключения |

#### Event Handlers — Connections
| Handler | Описание |
|---------|---------|
| `onConnect` | Создание соединения |
| `onConnectStart` | Начало drag соединения |
| `onConnectEnd` | Конец drag соединения |
| `isValidConnection` | Валидация нового соединения |

#### Event Handlers — Pane & Selection
| Handler | Описание |
|---------|---------|
| `onPaneClick` | Клик по фону |
| `onPaneContextMenu` | Правый клик по фону |
| `onPaneScroll` | Скролл по фону |
| `onSelectionChange` | Изменение выборки |
| `onSelectionDragStart/Stop` | Drag рамки выбора |
| `onMove` / `onMoveStart` / `onMoveEnd` | Панорамирование/зум |
| `onInit` | `(instance: ReactFlowInstance) => void` |
| `onDelete` | Удаление элементов |
| `onBeforeDelete` | Перехват удаления (возвращает Promise) |
| `onError` | Ошибки |

---

### `<Background />`

```jsx
import { Background, BackgroundVariant } from '@xyflow/react'
<Background variant={BackgroundVariant.Dots} gap={20} size={1} />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `BackgroundVariant` | `Dots` | `Dots \| Lines \| Cross` |
| `gap` | `number \| [number, number]` | `20` | Шаг паттерна |
| `size` | `number` | 1 или 6 | Размер точки/прямоугольника |
| `color` | `string` | — | Цвет паттерна |
| `bgColor` | `string` | — | Цвет фона |
| `lineWidth` | `number` | `1` | Толщина линии |
| `offset` | `number \| [number, number]` | `0` | Смещение паттерна |
| `id` | `string` | — | Нужен при нескольких Background |
| `className` | `string` | — | Класс контейнера |
| `patternClassName` | `string` | — | Класс паттерна |

---

### `<Controls />`

```jsx
import { Controls } from '@xyflow/react'
<Controls position="bottom-left" showZoom showFitView showInteractive />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showZoom` | `boolean` | `true` | Кнопки зума |
| `showFitView` | `boolean` | `true` | Кнопка fit view |
| `showInteractive` | `boolean` | `true` | Кнопка блокировки |
| `position` | `PanelPosition` | `'bottom-left'` | Позиция |
| `orientation` | `'horizontal' \| 'vertical'` | `'vertical'` | Ориентация |
| `fitViewOptions` | `FitViewOptionsBase` | — | Опции fit view |
| `onZoomIn` / `onZoomOut` / `onFitView` | `() => void` | — | Коллбэки |
| `onInteractiveChange` | `(status: boolean) => void` | — | Коллбэк блокировки |
| `children` | `ReactNode` | — | Дополнительные кнопки |

---

### `<MiniMap />`

```jsx
import { MiniMap } from '@xyflow/react'
<MiniMap nodeColor="#e2e2e2" pannable zoomable />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `PanelPosition` | `'bottom-right'` | Позиция |
| `nodeColor` | `string \| fn` | `'#e2e2e2'` | Цвет нод |
| `nodeStrokeColor` | `string \| fn` | `'transparent'` | Обводка нод |
| `nodeClassName` | `string \| fn` | `''` | Класс нод |
| `nodeBorderRadius` | `number` | `5` | Скругление нод |
| `nodeStrokeWidth` | `number` | `2` | Ширина обводки |
| `nodeComponent` | `ComponentType<MiniMapNodeProps>` | — | Кастомные ноды (SVG) |
| `bgColor` | `string` | — | Цвет фона |
| `maskColor` | `string` | `'rgba(240,240,240,0.6)'` | Маска вне viewport |
| `maskStrokeColor` | `string` | `transparent` | Обводка маски |
| `pannable` | `boolean` | `false` | Панорамирование через MiniMap |
| `zoomable` | `boolean` | `false` | Зум через MiniMap |
| `inversePan` | `boolean` | — | Инвертировать направление пана |
| `zoomStep` | `number` | `10` | Шаг зума |
| `onClick` | `(event, position) => void` | — | Клик по MiniMap |
| `onNodeClick` | `(event, node) => void` | — | Клик по ноде в MiniMap |
| `ariaLabel` | `string \| null` | `'Mini Map'` | Доступность |

---

### `<Panel />`

Позиционирует содержимое поверх viewport (фиксированно, не масштабируется).

```jsx
import { Panel } from '@xyflow/react'
<Panel position="top-left">Content</Panel>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `PanelPosition` | `'top-left'` | Позиция: `top-left \| top-center \| top-right \| bottom-* \| center-left \| center-right` |

---

### `<Handle />`

Точка подключения рёбер. Используется только внутри кастомных нод.

```jsx
import { Handle, Position } from '@xyflow/react'
<Handle type="source" position={Position.Right} id="output-a" />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'source' \| 'target'` | `'source'` | Направление соединения |
| `position` | `Position` | `Position.Top` | Сторона ноды |
| `id` | `string \| null` | — | ID (нужен при нескольких однотипных) |
| `isConnectable` | `boolean` | `true` | Разрешить соединения |
| `isConnectableStart` | `boolean` | `true` | Разрешить начинать отсюда |
| `isConnectableEnd` | `boolean` | `true` | Разрешить заканчивать здесь |
| `isValidConnection` | `IsValidConnection` | — | Локальная валидация |
| `onConnect` | `OnConnect` | — | Коллбэк при соединении |

**Важно:** при `display: none` handle не участвует в расчётах. Для скрытия использовать `visibility: hidden`.

CSS-классы handle при соединении: `connectingto`, `connectingfrom`, `valid`.

---

### `<NodeToolbar />`

Тулбар, не масштабируемый вместе с viewport. Видим только при выборе ноды (по умолчанию).

```jsx
import { NodeToolbar } from '@xyflow/react'
// Используется внутри кастомной ноды
<NodeToolbar isVisible={data.toolbarVisible} position={Position.Top}>
  <button>Delete</button>
</NodeToolbar>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `nodeId` | `string \| string[]` | — | ID ноды (ы) |
| `isVisible` | `boolean` | — | Принудительный показ |
| `position` | `Position` | `Position.Top` | Позиция |
| `offset` | `number` | `10` | Отступ от ноды в px |
| `align` | `Align` | `'center'` | Выравнивание |

---

### `<NodeResizer />`

Добавляет ручки изменения размера ноды.

```jsx
import { NodeResizer } from '@xyflow/react'
// Внутри кастомной ноды:
<NodeResizer minWidth={100} minHeight={30} />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `nodeId` | `string` | — | ID ноды (автоматически из контекста) |
| `isVisible` | `boolean` | `true` | Видимость ручек |
| `minWidth` / `minHeight` | `number` | `10` | Минимальный размер |
| `maxWidth` / `maxHeight` | `number` | `MAX_VALUE` | Максимальный размер |
| `keepAspectRatio` | `boolean` | `false` | Сохранять пропорции |
| `autoScale` | `boolean` | `true` | Масштаб с viewport |
| `color` | `string` | — | Цвет ручек |
| `handleClassName` / `handleStyle` | — | — | Стиль ручек |
| `lineClassName` / `lineStyle` | — | — | Стиль линий |
| `shouldResize` | `fn` | — | Разрешение на resize |
| `onResizeStart` / `onResize` / `onResizeEnd` | `fn` | — | Коллбэки |

---

### `<EdgeLabelRenderer />`

Портал для HTML-меток на рёбрах (вместо SVG).

```jsx
import { EdgeLabelRenderer, getBezierPath } from '@xyflow/react'

function CustomEdge({ id, sourceX, sourceY, targetX, targetY }) {
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, targetX, targetY })
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
          Label
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
```

- `pointerEvents: 'all'` + класс `nopan` — для интерактивных меток.

---

### `<BaseEdge />`

SVG-обёртка для кастомных рёбер.

```jsx
import { BaseEdge } from '@xyflow/react'
<BaseEdge id={id} path={edgePath} />
```

---

### `<ReactFlowProvider />`

Контекст-провайдер для доступа к состоянию вне `<ReactFlow />`.

```jsx
import { ReactFlow, ReactFlowProvider } from '@xyflow/react'

function App() {
  return (
    <ReactFlowProvider>
      <ReactFlow nodes={[...]} edges={[...]} />
      <Sidebar /> {/* может использовать useNodes(), useReactFlow() и др. */}
    </ReactFlowProvider>
  )
}
```

**Когда нужен:**
- Использование хуков вне `<ReactFlow />`
- Несколько flow на одной странице
- Клиентский роутинг (обернуть вне роутера)

---

## Hooks Reference

### `useReactFlow()`

Возвращает `ReactFlowInstance` — не вызывает ре-рендер при изменениях.

```jsx
const { getNodes, setNodes, fitView, zoomIn } = useReactFlow()
```

**Методы ReactFlowInstance:**

#### Nodes & Edges
| Метод | Сигнатура | Описание |
|-------|-----------|---------|
| `getNodes` | `() => Node[]` | Все ноды |
| `setNodes` | `(Node[] \| fn) => void` | Установить ноды |
| `addNodes` | `(Node \| Node[]) => void` | Добавить ноды |
| `getNode` | `(id: string) => Node \| undefined` | Нода по ID |
| `getInternalNode` | `(id: string) => InternalNode \| undefined` | Внутренний объект |
| `updateNode` | `(id, update, options?) => void` | Обновить ноду |
| `updateNodeData` | `(id, dataUpdate, options?) => void` | Обновить data ноды |
| `getEdges` | `() => Edge[]` | Все рёбра |
| `setEdges` | `(Edge[] \| fn) => void` | Установить рёбра |
| `addEdges` | `(Edge \| Edge[]) => void` | Добавить рёбра |
| `getEdge` | `(id: string) => Edge \| undefined` | Ребро по ID |
| `updateEdge` | `(id, update, options?) => void` | Обновить ребро |
| `updateEdgeData` | `(id, dataUpdate, options?) => void` | Обновить data ребра |
| `deleteElements` | `(params) => Promise<{...}>` | Удалить элементы |
| `toObject` | `() => ReactFlowJsonObject` | Экспорт в JSON |
| `getNodesBounds` | `(nodes) => Rect` | Границы нод |
| `getHandleConnections` | `({type, id, nodeId}) => HandleConnection[]` | Соединения handle |
| `getNodeConnections` | `({type?, handleId?, nodeId}) => NodeConnection[]` | Соединения ноды |
| `getIntersectingNodes` | `(node \| Rect, partially?, nodes?) => Node[]` | Пересекающиеся ноды |
| `isNodeIntersecting` | `(node \| Rect, area, partially?) => boolean` | Проверка пересечения |

#### Viewport
| Метод | Сигнатура | Описание |
|-------|-----------|---------|
| `fitView` | `(options?) => Promise<boolean>` | Подогнать viewport |
| `zoomIn` | `(options?) => Promise<boolean>` | Зум +1.2x |
| `zoomOut` | `(options?) => Promise<boolean>` | Зум /1.2x |
| `zoomTo` | `(level, options?) => Promise<boolean>` | Зум до уровня |
| `getZoom` | `() => number` | Текущий зум |
| `setViewport` | `(viewport, options?) => Promise<boolean>` | Установить viewport |
| `getViewport` | `() => Viewport` | Текущий viewport |
| `setCenter` | `(x, y, options?) => Promise<boolean>` | Центрировать на точке |
| `fitBounds` | `(bounds, options?) => Promise<boolean>` | Подогнать под Rect |
| `screenToFlowPosition` | `(clientPos, options?) => XYPosition` | Screen → flow coords |
| `flowToScreenPosition` | `(flowPos) => XYPosition` | Flow → screen coords |
| `viewportInitialized` | `boolean` | Viewport готов |

---

### `useNodesState(initialNodes)` / `useEdgesState(initialEdges)`

Упрощённые хуки для управления состоянием (для прототипирования и продакшена).

```jsx
const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

return <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} />
```

---

### `useNodes()` / `useEdges()`

Читают текущие ноды/рёбра — вызывают ре-рендер при **любом** изменении. Использовать с осторожностью (производительность).

```jsx
const nodes = useNodes() // Node[]
const edges = useEdges() // Edge[]
```

---

### `useViewport()`

Текущий viewport — ре-рендер при каждом пане/зуме.

```jsx
const { x, y, zoom } = useViewport()
```

---

### `useOnViewportChange({ onStart, onChange, onEnd })`

Подписка на события изменения viewport.

```jsx
useOnViewportChange({
  onStart: (viewport) => console.log('start', viewport),
  onChange: (viewport) => console.log('change', viewport),
  onEnd: (viewport) => console.log('end', viewport),
})
```

---

### `useNodeConnections(params)`

Соединения на ноде (замена устаревшего `useHandleConnections`).

```jsx
const connections = useNodeConnections({
  handleType: 'target',  // 'source' | 'target'
  handleId: 'my-handle', // опционально
  onConnect: (conns) => {},
  onDisconnect: (conns) => {},
})
// → NodeConnection[]
```

---

### `useNodesData(nodeId | nodeIds)`

Подписка на `data` конкретных нод (эффективнее чем `useNodes()`).

```jsx
const nodeData = useNodesData('node-1')         // { id, type, data } | null
const nodesData = useNodesData(['n1', 'n2'])    // { id, type, data }[]
```

---

### `useNodesInitialized(options?)`

Возвращает `true` когда все ноды получили размеры. Полезно для layout после маунта.

```jsx
const initialized = useNodesInitialized({ includeHiddenNodes: false })
useEffect(() => {
  if (initialized) runLayout()
}, [initialized])
```

---

### `useUpdateNodeInternals()`

Уведомляет React Flow об изменении handles ноды (при динамическом добавлении/удалении).

```jsx
const updateNodeInternals = useUpdateNodeInternals()
// После изменения handles:
updateNodeInternals(nodeId)
// или массив:
updateNodeInternals(['id1', 'id2'])
```

---

### `useConnection(selector?)`

Состояние активного соединения (drag). Все поля `null` когда нет соединения.

```jsx
const connection = useConnection()
// connection.fromNode, connection.toNode, etc. или null
```

---

### `useOnSelectionChange({ onChange })`

Подписка на изменение выборки. `onChange` **обязательно** мемоизировать.

```jsx
const onChange = useCallback(({ nodes, edges }) => {
  console.log(nodes.map(n => n.id))
}, [])
useOnSelectionChange({ onChange })
```

---

### `useNodeId()`

ID ноды из контекста (только внутри кастомной ноды или её дочерних компонентов).

```jsx
const nodeId = useNodeId() // string | null
```

---

### `useKeyPress(keyCode, options?)`

Слушает нажатие клавиш. Не требует ReactFlow контекста.

```jsx
const spacePressed = useKeyPress('Space')
const savePressed = useKeyPress(['Meta+s', 'Strg+s'])
// Комбинации: 'a+d', массив вариантов: ['a', 'd+s']
```

---

### `useStore(selector, equalityFn?)`

Прямой доступ к внутреннему Zustand-стору. Использовать когда другие хуки недостаточны.

```jsx
// Эффективная подписка на количество нод:
const nodeCount = useStore(state => state.nodes.length)

// Выполнение действия:
const setMinZoom = useStore(state => state.setMinZoom)
```
