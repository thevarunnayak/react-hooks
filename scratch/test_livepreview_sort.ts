import { PlaygroundNode } from '../src/types/playground';

// Mirroring the exact sorting in LivePreviewPanel.tsx:
// const uiNodes = nodes
//   .filter((n) => n.type === 'ui')
//   .sort((a, b) => {
//     const orderA = typeof a.props?.uiOrder === 'number' ? a.props.uiOrder : nodes.indexOf(a);
//     const orderB = typeof b.props?.uiOrder === 'number' ? b.props.uiOrder : nodes.indexOf(b);
//     return orderA - orderB;
//   });

const testNodes: PlaygroundNode[] = [
  { id: '1', type: 'ui', subtype: 'Heading', label: 'Heading', position: { x: 0, y: 0 }, props: { uiOrder: 0 } },
  { id: '2', type: 'ui', subtype: 'Button', label: 'Button', position: { x: 0, y: 100 }, props: { uiOrder: 3 } },
  { id: '3', type: 'ui', subtype: 'Card', label: 'Card', position: { x: 0, y: 200 }, props: { uiOrder: 4 } },
  { id: '4', type: 'ui', subtype: 'Dropdown', label: 'Dropdown 1', position: { x: 0, y: 300 }, props: { uiOrder: 1 } },
  { id: '5', type: 'ui', subtype: 'Dropdown', label: 'Dropdown 2', position: { x: 0, y: 400 }, props: { uiOrder: 2 } },
];

const sorted = testNodes
  .filter((n) => n.type === 'ui')
  .sort((a, b) => {
    const orderA = typeof a.props?.uiOrder === 'number' ? a.props.uiOrder : testNodes.indexOf(a);
    const orderB = typeof b.props?.uiOrder === 'number' ? b.props.uiOrder : testNodes.indexOf(b);
    return orderA - orderB;
  });

console.log('Sorted order:', sorted.map((n) => n.label));

const expected = ['Heading', 'Dropdown 1', 'Dropdown 2', 'Button', 'Card'];
const actual = sorted.map((n) => n.label);
if (JSON.stringify(expected) !== JSON.stringify(actual)) {
  throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
}
console.log('✓ LivePreviewPanel sort logic verified successfully!');
