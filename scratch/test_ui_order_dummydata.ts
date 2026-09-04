import { getDummyDataPreset, DUMMY_DATA_PRESETS } from '../src/constants/dummyDataPresets';
import { generateReactCode } from '../src/components/playground/engine/codeGenerator';
import { PlaygroundNode, PlaygroundConnection } from '../src/types/playground';

console.log('Testing Dummy Data Presets and UI Order Logic...\n');

// 1. Check all 8 presets
const presetKeys = Object.keys(DUMMY_DATA_PRESETS);
console.log(`Found ${presetKeys.length} presets:`, presetKeys.join(', '));
if (presetKeys.length !== 8) {
  throw new Error(`Expected 8 presets, got ${presetKeys.length}`);
}

for (const key of presetKeys) {
  const preset = getDummyDataPreset(key);
  if (!preset.label || !preset.items?.length || !preset.richItems?.length) {
    throw new Error(`Preset ${key} is missing label, items, or richItems`);
  }
  console.log(`  ✓ ${preset.label} (${preset.richItems.length} rich items, default style: ${preset.defaultStyle})`);
}

// 2. Test UI Order in Code Generation
const mockNodes: PlaygroundNode[] = [
  {
    id: 'node-heading',
    type: 'ui',
    subtype: 'Heading',
    label: 'Store Checkout Cart',
    position: { x: 100, y: 100 },
    props: { content: 'Store Checkout Cart', level: 'h2', uiOrder: 0 },
  },
  {
    id: 'node-dropdown-1',
    type: 'ui',
    subtype: 'Dropdown',
    label: 'Choose Product',
    position: { x: 100, y: 200 },
    props: { label: 'Choose Product', options: ['Pro License ($49)'], uiOrder: 1 },
  },
  {
    id: 'node-btn',
    type: 'ui',
    subtype: 'Button',
    label: 'Add to Cart',
    position: { x: 300, y: 100 },
    props: { content: 'Add to Cart (+1)', uiOrder: 2 },
  },
  {
    id: 'node-card',
    type: 'ui',
    subtype: 'Card',
    label: 'Shopping Cart',
    position: { x: 100, y: 300 },
    props: { title: 'Shopping Cart', variant: 'cart', uiOrder: 3 },
  },
  {
    id: 'node-dropdown-2',
    type: 'ui',
    subtype: 'Dropdown',
    label: 'Choose Product (Second)',
    position: { x: 100, y: 250 },
    // Notice this was placed visually between dropdown 1 and card, with uiOrder: 2 (if reordered)
    props: { label: 'Choose Product (Second)', options: ['Enterprise License ($299)'], uiOrder: 2 },
  },
];

// Let's reorder: Heading (#0), Dropdown 1 (#1), Dropdown 2 (#2), Button (#3), Card (#4)
mockNodes[2].props.uiOrder = 3; // Button
mockNodes[3].props.uiOrder = 4; // Card
mockNodes[4].props.uiOrder = 2; // Dropdown 2

const mockConns: PlaygroundConnection[] = [];
const generatedCode = generateReactCode(mockNodes, mockConns, 'TestApp');

console.log('\nGenerated Code Preview Verification:');
// Verify the sequence in generated code
const headingIdx = generatedCode.indexOf('Store Checkout Cart');
const dd1Idx = generatedCode.indexOf('Choose Product');
const dd2Idx = generatedCode.indexOf('Choose Product (Second)');
const btnIdx = generatedCode.indexOf('Add to Cart (+1)');
const cardIdx = generatedCode.indexOf('Shopping Cart');

console.log(`Indices in code:
  Heading: ${headingIdx}
  Dropdown 1: ${dd1Idx}
  Dropdown 2: ${dd2Idx}
  Button: ${btnIdx}
  Card: ${cardIdx}
`);

if (headingIdx < dd1Idx && dd1Idx < dd2Idx && dd2Idx < btnIdx && btnIdx < cardIdx) {
  console.log('✓ SUCCESS: UI nodes are rendered in exact uiOrder sequence!');
} else {
  throw new Error('UI nodes are NOT rendered in expected uiOrder sequence');
}

console.log('\nAll tests passed successfully!');
