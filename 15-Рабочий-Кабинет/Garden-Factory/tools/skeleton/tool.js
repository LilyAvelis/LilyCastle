/**
 * MCP Tool Wrapper for Skeleton
 * Provides the skeleton function to MCP server
 */

import Skeleton from './skeleton.js';

const skeleton = new Skeleton();

export async function skeleton_skeleton(filePath) {
  if (!filePath) {
    throw new Error('filePath is required');
  }

  try {
    const structure = await skeleton.parse(filePath);
    return {
      success: true,
      data: structure,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// Default export for dynamic loading
export default {
  skeleton: skeleton_skeleton,
};
