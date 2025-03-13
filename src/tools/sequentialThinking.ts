/**
 * MCP tool for Sequential Thinking
 */

import { MCPTool, MCPToolDefinition, MCPToolResponse } from '../mcp.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Sequential Thinking tool for MCP
 */
export class SequentialThinkingTool implements MCPTool {
  private thoughts: Map<string, any[]> = new Map();

  /**
   * Get the tool definition
   */
  getDefinition(): MCPToolDefinition {
    return {
      name: 'sequentialthinking',
      description: 'A detailed tool for dynamic and reflective problem-solving through thoughts.\nThis tool helps analyze problems through a flexible thinking process that can adapt and evolve.\nEach thought can build on, question, or revise previous insights as understanding deepens.\n\nWhen to use this tool:\n- Breaking down complex problems into steps\n- Planning and design with room for revision\n- Analysis that might need course correction\n- Problems where the full scope might not be clear initially\n- Problems that require a multi-step solution\n- Tasks that need to maintain context over multiple steps\n- Situations where irrelevant information needs to be filtered out\n\nKey features:\n- You can adjust total_thoughts up or down as you progress\n- You can question or revise previous thoughts\n- You can add more thoughts even after reaching what seemed like the end\n- You can express uncertainty and explore alternative approaches\n- Not every thought needs to build linearly - you can branch or backtrack\n- Generates a solution hypothesis\n- Verifies the hypothesis based on the Chain of Thought steps\n- Repeats the process until satisfied\n- Provides a correct answer\n\nParameters explained:\n- thought: Your current thinking step, which can include:\n* Regular analytical steps\n* Revisions of previous thoughts\n* Questions about previous decisions\n* Realizations about needing more analysis\n* Changes in approach\n* Hypothesis generation\n* Hypothesis verification\n- next_thought_needed: True if you need more thinking, even if at what seemed like the end\n- thought_number: Current number in sequence (can go beyond initial total if needed)\n- total_thoughts: Current estimate of thoughts needed (can be adjusted up/down)\n- is_revision: A boolean indicating if this thought revises previous thinking\n- revises_thought: If is_revision is true, which thought number is being reconsidered\n- branch_from_thought: If branching, which thought number is the branching point\n- branch_id: Identifier for the current branch (if any)\n- needs_more_thoughts: If reaching end but realizing more thoughts needed\n\nYou should:\n1. Start with an initial estimate of needed thoughts, but be ready to adjust\n2. Feel free to question or revise previous thoughts\n3. Don\'t hesitate to add more thoughts if needed, even at the "end"\n4. Express uncertainty when present\n5. Mark thoughts that revise previous thinking or branch into new paths\n6. Ignore information that is irrelevant to the current step\n7. Generate a solution hypothesis when appropriate\n8. Verify the hypothesis based on the Chain of Thought steps\n9. Repeat the process until satisfied with the solution\n10. Provide a single, ideally correct answer as the final output\n11. Only set next_thought_needed to false when truly done and a satisfactory answer is reached',
      parameters: {
        type: 'object',
        properties: {
          thought: {
            type: 'string',
            description: 'Your current thinking step'
          },
          nextThoughtNeeded: {
            type: 'boolean',
            description: 'Whether another thought step is needed'
          },
          thoughtNumber: {
            type: 'integer',
            description: 'Current thought number',
            minimum: 1
          },
          totalThoughts: {
            type: 'integer',
            description: 'Estimated total thoughts needed',
            minimum: 1
          },
          isRevision: {
            type: 'boolean',
            description: 'Whether this revises previous thinking'
          },
          revisesThought: {
            type: 'integer',
            description: 'Which thought is being reconsidered',
            minimum: 1
          },
          branchFromThought: {
            type: 'integer',
            description: 'Branching point thought number',
            minimum: 1
          },
          branchId: {
            type: 'string',
            description: 'Branch identifier'
          },
          needsMoreThoughts: {
            type: 'boolean',
            description: 'If more thoughts are needed'
          }
        },
        required: ['thought', 'nextThoughtNeeded', 'thoughtNumber', 'totalThoughts']
      }
    };
  }

  /**
   * Execute the tool
   * @param params Tool parameters
   * @returns Tool response
   */
  async execute(params: any): Promise<MCPToolResponse> {
    try {
      // Validate parameters
      if (!params.thought) {
        return {
          status: 'error',
          error: 'Thought content is required'
        };
      }

      if (params.thoughtNumber === undefined || params.thoughtNumber < 1) {
        return {
          status: 'error',
          error: 'Valid thought number is required'
        };
      }

      if (params.totalThoughts === undefined || params.totalThoughts < 1) {
        return {
          status: 'error',
          error: 'Valid total thoughts is required'
        };
      }

      // Generate a session ID if this is the first thought
      let sessionId = '';
      if (params.thoughtNumber === 1) {
        sessionId = uuidv4();
        this.thoughts.set(sessionId, []);
      } else {
        // Find the session ID from previous thoughts
        for (const [id, thoughts] of this.thoughts.entries()) {
          if (thoughts.length > 0 && thoughts.some(t => t.thoughtNumber === params.thoughtNumber - 1)) {
            sessionId = id;
            break;
          }
        }

        if (!sessionId) {
          // If we can't find a previous session, create a new one
          sessionId = uuidv4();
          this.thoughts.set(sessionId, []);
        }
      }

      // Store the thought
      const thought = {
        thoughtNumber: params.thoughtNumber,
        totalThoughts: params.totalThoughts,
        content: params.thought,
        nextThoughtNeeded: params.nextThoughtNeeded,
        isRevision: params.isRevision || false,
        revisesThought: params.revisesThought,
        branchFromThought: params.branchFromThought,
        branchId: params.branchId,
        needsMoreThoughts: params.needsMoreThoughts || false,
        timestamp: Date.now()
      };

      const thoughts = this.thoughts.get(sessionId) || [];
      thoughts.push(thought);
      this.thoughts.set(sessionId, thoughts);

      // Format the response
      return {
        status: 'success',
        result: {
          sessionId,
          thoughtNumber: params.thoughtNumber,
          totalThoughts: params.totalThoughts,
          nextThoughtNeeded: params.nextThoughtNeeded,
          previousThoughts: thoughts
            .filter(t => t.thoughtNumber < params.thoughtNumber)
            .map(t => ({
              thoughtNumber: t.thoughtNumber,
              content: t.content,
              isRevision: t.isRevision,
              revisesThought: t.revisesThought
            }))
        }
      };
    } catch (error) {
      console.error('Error in Sequential Thinking tool:', error);
      return {
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
} 