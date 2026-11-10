import { useEffect, useMemo } from 'react';
import {
  Activity,
  ArrowDownUp,
  BatteryCharging,
  Building2,
  Cable,
  Gauge,
  PlugZap,
  Sun,
  Zap,
  CircleHelp,
  type LucideIcon,
} from 'lucide-react';
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import type { AssetView, EnergyTopologyView } from '../types/ui';

export interface EnergyFlowProps {
  assets: AssetView[];
  topology?: EnergyTopologyView;
  selectedAssetId?: string | null;
  onSelectAsset?: (assetId: string) => void;
}

type AssetNodeKind = 'solar' | 'grid' | 'battery' | 'inverter' | 'meter' | 'charger' | 'load' | 'other';
type AssetNodeData = {
  label: string;
  subtitle: string;
  value: string;
  status: string;
  kind: AssetNodeKind;
  simulated: boolean;
};
type AssetFlowNode = Node<AssetNodeData, 'assetNode'>;

const iconByKind = {
  solar: Sun,
  grid: ArrowDownUp,
  battery: BatteryCharging,
  inverter: Zap,
  meter: Gauge,
  charger: PlugZap,
  load: Building2,
  other: CircleHelp,
} satisfies Record<AssetNodeKind, LucideIcon>;

function toNodeKind(assetType: string): AssetNodeKind {
  switch (assetType) {
    case 'solar_panel': return 'solar';
    case 'grid_connection': return 'grid';
    case 'battery': return 'battery';
    case 'inverter': return 'inverter';
    case 'meter': return 'meter';
    case 'charger':
    case 'ev_charger': return 'charger';
    case 'load': return 'load';
    default: return 'other';
  }
}

function toStatusClass(status: string): string {
  if (status === 'online' || status === 'normal') return 'normal';
  if (status === 'warning') return 'warning';
  if (status === 'error' || status === 'critical') return 'error';
  if (status === 'offline') return 'offline';
  return 'unknown';
}

function AssetNode({ data, selected }: NodeProps<AssetFlowNode>) {
  const Icon = iconByKind[data.kind];
  const status = toStatusClass(data.status);

  return (
    <div className={`equipment-node node-${data.kind} status-${status} ${selected ? 'is-selected' : ''}`}>
      <Handle className="flow-handle" type="target" position={Position.Left} id="left-in" />
      <Handle className="flow-handle" type="source" position={Position.Right} id="right-out" />
      <Handle className="flow-handle" type="target" position={Position.Top} id="top-in" />
      <Handle className="flow-handle" type="source" position={Position.Bottom} id="bottom-out" />
      <div className="equipment-node-top">
        <div className="equipment-node-icon"><Icon size={19} strokeWidth={1.9} /></div>
        <span className={`equipment-status-dot status-dot-${status}`} />
      </div>
      <strong>{data.label}</strong>
      <span className="equipment-node-subtitle">{data.subtitle}</span>
      <span className="equipment-node-value">{data.value}</span>
      {data.simulated && <span className="node-demo-label">ДЕМО</span>}
    </div>
  );
}

const nodeTypes = { assetNode: AssetNode };

function buildNodes(assets: AssetView[], topology?: EnergyTopologyView): AssetFlowNode[] {
  const placements = new Map(topology?.placements.map((placement) => [placement.assetId, placement]) ?? []);
  return assets.map((asset, index) => {
    const placement = placements.get(asset.id);
    const column = index % 3;
    const row = Math.floor(index / 3);
    return {
      id: asset.id,
      type: 'assetNode',
      position: placement ? { x: placement.x, y: placement.y } : { x: 35 + column * 275, y: 35 + row * 185 },
      data: {
        kind: toNodeKind(asset.type),
        label: asset.name,
        subtitle: asset.type,
        value: asset.displayValue ?? 'Нет данных',
        status: asset.status,
        simulated: Boolean(asset.isSimulated),
      },
    };
  });
}

function buildEdges(topology: EnergyTopologyView | undefined, assets: AssetView[]): Edge[] {
  if (!topology) return [];
  return topology.connections.map((connection) => {
    const isData = connection.kind === 'data';
    const isSimulated = connection.isSimulated || topology.isDemo;
    const sourceAsset = assets.find((asset) => asset.id === connection.sourceAssetId);
    const sourceKind = sourceAsset ? toNodeKind(sourceAsset.type) : 'other';
    const sourceColor: Record<AssetNodeKind, string> = {
      solar: '#E9AC47',
      grid: '#65A5EC',
      battery: '#9D86E8',
      inverter: '#24B5A2',
      meter: '#8998A8',
      charger: '#36B7A4',
      load: '#35B6A3',
      other: '#8998A8',
    };
    const stroke = isData ? '#8998A8' : sourceColor[sourceKind];
    const label = connection.label ?? (connection.value === null
      ? 'Нет данных'
      : `${connection.value} ${connection.unit ?? 'кВт'}`);

    return {
      id: connection.id,
      source: connection.direction === 'reverse' ? connection.targetAssetId : connection.sourceAssetId,
      target: connection.direction === 'reverse' ? connection.sourceAssetId : connection.targetAssetId,
      type: 'smoothstep',
      label,
      animated: false,
      markerEnd: connection.direction === 'bidirectional'
        ? undefined
        : { type: MarkerType.ArrowClosed, color: stroke },
      markerStart: connection.direction === 'bidirectional'
        ? { type: MarkerType.ArrowClosed, color: stroke }
        : undefined,
      style: {
        stroke,
        strokeWidth: 2.2,
        strokeDasharray: isData || isSimulated ? '5 4' : undefined,
      },
      labelStyle: { fill: stroke, fontSize: 10 },
      labelBgStyle: { fill: 'var(--surface)', fillOpacity: 0.94 },
    } satisfies Edge;
  });
}

export function EnergyFlow({ assets, topology, selectedAssetId, onSelectAsset }: EnergyFlowProps) {
  const initialNodes = useMemo(() => buildNodes(assets, topology), [assets, topology]);
  const initialEdges = useMemo(() => buildEdges(topology, assets), [topology, assets]);
  const [nodes, setNodes, onNodesChange] = useNodesState<AssetFlowNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => setNodes(initialNodes), [initialNodes, setNodes]);
  useEffect(() => setEdges(initialEdges), [initialEdges, setEdges]);

  const visibleNodes = useMemo(
    () => nodes.map((node) => ({ ...node, selected: node.id === selectedAssetId })),
    [nodes, selectedAssetId],
  );

  return (
    <section className="panel flow-panel" id="energy-hub">
      <div className="panel-heading flow-heading">
        <div className="panel-title-wrap">
          <div className="panel-icon"><Activity size={17} /></div>
          <div><h2>Схема энергообъекта</h2><p>Оборудование и подтверждённые/демонстрационные связи</p></div>
        </div>
        <span className="flow-context-label">{topology?.isDemo ? 'Демо-схема' : 'Оборудование'}</span>
      </div>

      <div className="flow-legend">
        <span><i className="legend-line solar" /> Солнечная генерация</span>
        <span><i className="legend-line grid" /> Сеть</span>
        <span><i className="legend-line battery" /> Накопление</span>
        <span><i className="legend-line demand" /> Потребление</span>
        <span><i className="legend-line data" /> Передача данных</span>
      </div>

      {assets.length === 0 ? (
        <div className="empty-state flow-empty">У выбранного энергообъекта нет оборудования для отображения.</div>
      ) : (
        <div className="flow-canvas">
          <ReactFlow
            nodes={visibleNodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={(_, node) => onSelectAsset?.(node.id)}
            fitView
            fitViewOptions={{ padding: 0.16, minZoom: 0.45, maxZoom: 1 }}
            minZoom={0.35}
            maxZoom={1.25}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={18} size={1} color="var(--flow-dot)" />
            <Controls showInteractive={false} />
            <MiniMap pannable zoomable nodeColor={(node) => {
              const state = toStatusClass((node.data as AssetNodeData).status);
              if (state === 'error') return '#D95355';
              if (state === 'warning') return '#E3A12F';
              if (state === 'offline') return '#8995A2';
              return '#24B5A2';
            }} />
          </ReactFlow>
        </div>
      )}

      <div className="flow-footnote">
        <Cable size={13} />
        {topology
          ? topology.isDemo
            ? 'Связи на схеме демонстрационные и не являются фактической телеметрией.'
            : 'Отображены связи, переданные приложением.'
          : 'Показано оборудование. Связи не рисуются, пока их структура не подтверждена общей моделью.'}
      </div>
    </section>
  );
}
