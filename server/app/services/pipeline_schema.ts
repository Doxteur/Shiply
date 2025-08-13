export const pipelineJsonSchema = {
  type: 'object',
  required: ['version', 'name', 'stages'],
  additionalProperties: true,
  properties: {
    version: { type: ['string', 'number'] },
    name: { type: 'string', minLength: 1 },
    env: { type: ['string', 'null'] },
    stages: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['name', 'steps'],
        additionalProperties: true,
        properties: {
          name: { type: 'string', minLength: 1 },
          manual: { type: ['boolean', 'null'] },
          steps: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              required: ['run'],
              additionalProperties: true,
              properties: {
                name: { type: ['string', 'null'] },
                run: { type: 'string', minLength: 1 },
                artifacts: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  },
} as const
