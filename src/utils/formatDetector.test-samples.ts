/**
 * Test samples for format detection
 */

// Token Studio format (current default)
export const tokenStudioSample = {
  "colors": {
    "primary": { "value": "#3B82F6", "type": "color" },
    "secondary": { "value": "#10B981", "type": "color" }
  },
  "spacing": {
    "sm": { "value": "8px", "type": "spacing" },
    "md": { "value": "16px", "type": "spacing" }
  }
};

// W3C format
export const w3cSample = {
  "colors": {
    "primary": { "$value": "#3B82F6", "$type": "color" },
    "secondary": { "$value": "#10B981", "$type": "color" }
  },
  "spacing": {
    "sm": { "$value": "8px", "$type": "dimension" },
    "md": { "$value": "16px", "$type": "dimension" }
  }
};

// Style Dictionary flat format
export const styleDictionarySample = {
  "--color-primary": "#3B82F6",
  "--color-secondary": "#10B981",
  "--spacing-sm": "8px",
  "--spacing-md": "16px",
  "--radius-sm": "4px"
};

// Supernova format
export const supernovaSample = {
  "tokens": [
    { "id": "1", "name": "colors/primary", "value": "#3B82F6", "tokenType": "Color" },
    { "id": "2", "name": "colors/secondary", "value": "#10B981", "tokenType": "Color" },
    { "id": "3", "name": "spacing/sm", "value": "8px", "tokenType": "Size" },
    { "id": "4", "name": "spacing/md", "value": "16px", "tokenType": "Size" }
  ]
};

// Figma REST API format
export const figmaAPISample = {
  "meta": {
    "variables": {
      "var1": {
        "name": "colors/primary",
        "resolvedType": "COLOR",
        "valuesByMode": {
          "mode1": "#3B82F6"
        }
      },
      "var2": {
        "name": "spacing/sm",
        "resolvedType": "FLOAT",
        "valuesByMode": {
          "mode1": 8
        }
      }
    }
  }
};

// Unknown/invalid format
export const unknownSample = {
  "someKey": "someValue",
  "nested": {
    "data": "without token structure"
  }
};
