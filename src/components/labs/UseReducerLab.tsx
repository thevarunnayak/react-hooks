import React, { useReducer, useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, RotateCcw } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

interface CartState {
  items: CartItem[];
  discount: number;
  history: { action: string; timestamp: string }[];
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { id: string; name: string; price: number } }
  | { type: 'INCREMENT_QTY'; payload: { id: string } }
  | { type: 'DECREMENT_QTY'; payload: { id: string } }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'APPLY_DISCOUNT'; payload: { discount: number } }
  | { type: 'CLEAR_CART' };

const initialCartState: CartState = {
  items: [
    { id: '1', name: 'React Hooks Handbook', price: 29, qty: 1 },
    { id: '2', name: 'TypeScript Pro Guide', price: 39, qty: 1 },
  ],
  discount: 0,
  history: [{ action: 'INIT_STATE', timestamp: new Date().toLocaleTimeString() }],
};

function cartReducer(state: CartState, action: CartAction): CartState {
  const timestamp = new Date().toLocaleTimeString();

  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i.id === action.payload.id);
      let updatedItems: CartItem[];
      if (existing) {
        updatedItems = state.items.map((i) =>
          i.id === action.payload.id ? { ...i, qty: i.qty + 1 } : i
        );
      } else {
        updatedItems = [...state.items, { ...action.payload, qty: 1 }];
      }
      return {
        ...state,
        items: updatedItems,
        history: [{ action: `ADD_ITEM (${action.payload.name})`, timestamp }, ...state.history],
      };
    }
    case 'INCREMENT_QTY': {
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload.id ? { ...i, qty: i.qty + 1 } : i
        ),
        history: [{ action: `INCREMENT_QTY (${action.payload.id})`, timestamp }, ...state.history],
      };
    }
    case 'DECREMENT_QTY': {
      return {
        ...state,
        items: state.items
          .map((i) => (i.id === action.payload.id ? { ...i, qty: i.qty - 1 } : i))
          .filter((i) => i.qty > 0),
        history: [{ action: `DECREMENT_QTY (${action.payload.id})`, timestamp }, ...state.history],
      };
    }
    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter((i) => i.id !== action.payload.id),
        history: [{ action: `REMOVE_ITEM (${action.payload.id})`, timestamp }, ...state.history],
      };
    }
    case 'APPLY_DISCOUNT': {
      return {
        ...state,
        discount: action.payload.discount,
        history: [{ action: `APPLY_DISCOUNT (${action.payload.discount}%)`, timestamp }, ...state.history],
      };
    }
    case 'CLEAR_CART': {
      return {
        ...state,
        items: [],
        history: [{ action: 'CLEAR_CART', timestamp }, ...state.history],
      };
    }
    default:
      return state;
  }
}

export const UseReducerLab: React.FC = () => {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);

  const subtotal = state.items.reduce((acc, item) => acc + item.price * item.qty, 0);
  const total = Math.round(subtotal * (1 - state.discount / 100));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <Card variant="glass" padding="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Badge variant="cyan">State Machine Lab</Badge>
            <span style={{ fontWeight: 600, fontSize: 'var(--text-base)' }}>
              useReducer: Deterministic Action Dispatching
            </span>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            Observe how actions pass through a pure reducer function to transition complex interrelated state.
          </p>
        </div>
      </Card>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        {/* Shopping Cart UI */}
        <Card variant="elevated" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingCart size={18} style={{ color: 'var(--accent-primary)' }} />
              <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Shopping Cart</span>
            </div>
            <Button size="xs" variant="ghost" onClick={() => dispatch({ type: 'CLEAR_CART' })}>
              Clear
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {state.items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>{item.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>${item.price} each</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => dispatch({ type: 'DECREMENT_QTY', payload: { id: item.id } })}
                  >
                    -
                  </Button>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, minWidth: '16px', textAlign: 'center' }}>
                    {item.qty}
                  </span>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => dispatch({ type: 'INCREMENT_QTY', payload: { id: item.id } })}
                  >
                    +
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
              <span>Total Amount:</span>
              <strong style={{ fontSize: 'var(--text-md)', color: 'var(--accent-success-text)' }}>
                ${total}
              </strong>
            </div>
          </div>
        </Card>

        {/* Action Dispatch Log */}
        <Card variant="elevated" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--accent-purple-text)' }}>
            Action Dispatch Stream (Pure Transitions)
          </span>

          <div
            style={{
              padding: '8px',
              backgroundColor: 'var(--bg-code)',
              borderRadius: 'var(--radius-sm)',
              maxHeight: '220px',
              overflowY: 'auto',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            {state.history.map((h, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', color: i === 0 ? 'var(--accent-primary-text)' : 'var(--text-muted)' }}>
                <span>dispatch({`{ type: '${h.action}' }`})</span>
                <span style={{ color: 'var(--text-faint)' }}>{h.timestamp}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <Button
              size="xs"
              variant="outline"
              onClick={() =>
                dispatch({
                  type: 'ADD_ITEM',
                  payload: { id: Date.now().toString(), name: 'System Design Course', price: 49 },
                })
              }
            >
              + Dispatch ADD_ITEM
            </Button>
            <Button
              size="xs"
              variant="outline"
              onClick={() => dispatch({ type: 'APPLY_DISCOUNT', payload: { discount: 20 } })}
            >
              % Dispatch APPLY_DISCOUNT(20%)
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
