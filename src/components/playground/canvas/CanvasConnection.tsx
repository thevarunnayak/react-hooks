import React, { useState } from 'react';
import { PlaygroundConnection, PlaygroundNode } from '../../../types/playground';
import { ConnectionType } from '../../../constants/enums';
import { t } from '../../../i18n/i18n';

export interface CanvasConnectionProps {
  connection: PlaygroundConnection;
  nodes: PlaygroundNode[];
  nodeDimensions?: Record<string, { width: number; height: number }>;
  isHighlighted?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const CanvasConnection: React.FC<CanvasConnectionProps> = ({
  connection,
  nodes,
  nodeDimensions,
  isHighlighted,
  isSelected,
  onSelect,
  onDelete,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleteHovered, setIsDeleteHovered] = useState(false);

  const sourceNode = nodes.find((n) => n.id === connection.sourceNodeId);
  const targetNode = nodes.find((n) => n.id === connection.targetNodeId);

  if (!sourceNode || !targetNode) return null;

  // Calculate intuitive connection anchor coordinates based on dynamic node dimensions
  const sourceDim = nodeDimensions?.[sourceNode.id] || { width: 240, height: 110 };
  const targetDim = nodeDimensions?.[targetNode.id] || { width: 240, height: 110 };

  const isSourceLeft = sourceNode.position.x <= targetNode.position.x;

  const startX = isSourceLeft ? sourceNode.position.x + sourceDim.width : sourceNode.position.x;
  const startY = sourceNode.position.y + Math.round(sourceDim.height * 0.45);

  const endX = isSourceLeft ? targetNode.position.x : targetNode.position.x + targetDim.width;
  const endY = targetNode.position.y + Math.round(targetDim.height * 0.45);

  // Cubic bezier control points that enter and exit smoothly from sides
  const dx = Math.max(Math.abs(endX - startX) * 0.45, 50);
  const c1x = isSourceLeft ? startX + dx : startX - dx;
  const c1y = startY;
  const c2x = isSourceLeft ? endX - dx : endX + dx;
  const c2y = endY;

  const pathData = `M ${startX} ${startY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${endX} ${endY}`;

  const getColor = () => {
    switch (connection.type) {
      case ConnectionType.EVENT:
        return 'var(--accent-warning)';
      case ConnectionType.DATA:
        return 'var(--accent-primary)';
      case ConnectionType.EFFECT:
      case ConnectionType.DEPENDENCY:
        return 'var(--accent-purple)';
      case ConnectionType.CHILD:
        return '#10b981'; // Vibrant emerald to clearly indicate Form containment
      default:
        return 'var(--text-muted)';
    }
  };

  const getLabel = () => {
    switch (connection.type) {
      case ConnectionType.CHILD:
        return t('playground.connections.formField');
      case ConnectionType.EVENT:
        return t('playground.connections.event');
      case ConnectionType.DATA:
        return t('playground.connections.data');
      case ConnectionType.EFFECT:
        return t('playground.connections.effect');
      case ConnectionType.DEPENDENCY:
        return t('playground.connections.dependency');
      case ConnectionType.STATE:
        return t('playground.connections.state');
      default:
        return String(connection.type).toUpperCase();
    }
  };

  const baseColor = getColor();
  const color = isSelected ? 'var(--accent-primary)' : isHighlighted ? '#f59e0b' : baseColor;
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;

  const badgeWidth = isHovered || isSelected ? (connection.type === 'child' ? 76 : 66) : (connection.type === 'child' ? 62 : 50);

  return (
    <g
      className={`canvas-connection-group ${isHighlighted ? 'active-trace' : ''} ${isSelected ? 'selected-wire' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsDeleteHovered(false);
      }}
    >
      {/* Invisible broad stroke hit target for easy clicking */}
      <path
        d={pathData}
        fill="none"
        stroke="transparent"
        strokeWidth={18}
        style={{ cursor: 'pointer' }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(connection.id);
        }}
      >
        <title>Click to select wire. Press Delete or click [x] to unlink.</title>
      </path>

      {/* Outer Selection or Trace Glow */}
      {(isHighlighted || isSelected || isHovered) && (
        <path
          d={pathData}
          fill="none"
          stroke={isSelected ? 'var(--accent-primary)' : isHighlighted ? '#f59e0b' : baseColor}
          strokeWidth={isSelected ? 7 : isHighlighted ? 6 : 5}
          strokeOpacity={isSelected ? 0.5 : 0.3}
          strokeLinecap="round"
          style={{ pointerEvents: 'none' }}
        />
      )}

      {/* Main Curve */}
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth={isSelected ? 3 : isHighlighted ? 3 : connection.type === 'child' ? 2.4 : isHovered ? 2.5 : 2}
        strokeDasharray={
          connection.type === 'event' || isHighlighted
            ? '6 4'
            : connection.type === 'child'
            ? '6 3'
            : undefined
        }
        style={{
          animation: isHighlighted || connection.type === 'child' ? 'flowLine 1.5s linear infinite' : undefined,
          transition: 'stroke 200ms ease, stroke-width 200ms ease',
          pointerEvents: 'none',
        }}
      />

      {/* Connection Semantic Label & Interactive Unlink Button */}
      <g
        transform={`translate(${midX}, ${midY})`}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(connection.id);
        }}
        style={{ cursor: 'pointer' }}
      >
        {/* Background Pill */}
        <rect
          x={-badgeWidth / 2}
          y={-10}
          width={badgeWidth}
          height={20}
          rx={5}
          fill="var(--bg-surface-elevated)"
          stroke={isSelected ? 'var(--accent-primary)' : isHovered ? 'var(--border-strong)' : 'var(--border-default)'}
          strokeWidth={isSelected ? 1.5 : 1}
          style={{ transition: 'all 150ms ease' }}
        />

        {/* Semantic Label */}
        <text
          x={isHovered || isSelected ? -10 : 0}
          y={3}
          textAnchor="middle"
          fontSize={8.5}
          fontWeight={700}
          fontFamily="var(--font-mono)"
          fill={color}
          style={{ pointerEvents: 'none' }}
        >
          {getLabel()}
        </text>

        {/* Unlink [x] Action Button (Shown on hover or when wire is selected) */}
        {(isHovered || isSelected) && (
          <g
            transform={`translate(${badgeWidth / 2 - 11}, 0)`}
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(connection.id);
            }}
            onMouseEnter={() => setIsDeleteHovered(true)}
            onMouseLeave={() => setIsDeleteHovered(false)}
            style={{ cursor: 'pointer' }}
          >
            <circle
              r={6.5}
              fill={isDeleteHovered ? 'var(--accent-danger)' : 'rgba(239, 68, 68, 0.15)'}
              stroke={isDeleteHovered ? 'var(--accent-danger)' : 'rgba(239, 68, 68, 0.3)'}
              strokeWidth={1}
            />
            {/* Cross Lines */}
            <line
              x1={-3}
              y1={-3}
              x2={3}
              y2={3}
              stroke={isDeleteHovered ? '#ffffff' : 'var(--accent-danger)'}
              strokeWidth={1.4}
              strokeLinecap="round"
            />
            <line
              x1={3}
              y1={-3}
              x2={-3}
              y2={3}
              stroke={isDeleteHovered ? '#ffffff' : 'var(--accent-danger)'}
              strokeWidth={1.4}
              strokeLinecap="round"
            />
            <title>Unlink this connection</title>
          </g>
        )}
      </g>
    </g>
  );
};
