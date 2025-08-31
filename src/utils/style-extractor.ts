// File: src/utils/style-extractor.ts

import type { StyleRange } from '../types/transport';

/**
 * Extracts plain text and style ranges from a message with inline style markup.
 * Supports <style>text</> angle bracket syntax.
 * 
 * @param styledMessage - Message with inline style markup
 * @returns Object containing plain text and style ranges
 * 
 * @example
 * ```typescript
 * const result = extractStyles('<red.bold>Error:</> User <cyan>john@example.com</> not found');
 * // Returns:
 * // {
 * //   plainText: "Error: User john@example.com not found",
 * //   styles: [[0, 6, "red.bold"], [12, 29, "cyan"]]
 * // }
 * ```
 */
export function extractStyles(styledMessage: string): {
  plainText: string;
  styles?: StyleRange[];
} {
  // Handle nested angle bracket syntax properly
  let plainText = '';
  const styles: StyleRange[] = [];
  let workingMessage = styledMessage;
  let globalOffset = 0;
  
  // Process styles iteratively to handle nesting
  while (true) {
    // Find the first complete style tag
    const match = /<([^>]+)>((?:(?!<[^>]*?>).)*?)<\/>/s.exec(workingMessage);
    
    if (!match) {
      // No more styled segments, add the rest as plain text
      plainText += workingMessage;
      break;
    }
    
    const [fullMatch, style, text] = match;
    const matchStart = match.index!;
    
    // Add text before the match
    const beforeText = workingMessage.slice(0, matchStart);
    plainText += beforeText;
    
    // Record style range if text is not empty
    if (text.length > 0 && style && style !== '/') {
      const startIndex = plainText.length;
      const endIndex = startIndex + text.length;
      styles.push([startIndex, endIndex, style]);
    }
    
    // Add the matched text content (without style tags)
    plainText += text;
    
    // Move past this match
    workingMessage = workingMessage.slice(matchStart + fullMatch.length);
  }
  
  // If no styles were found, return undefined styles
  if (styles.length === 0) {
    return { plainText, styles: undefined };
  }
  
  return { plainText, styles };
}

/**
 * Applies style ranges back to plain text to reconstruct styled output.
 * 
 * @param plainText - Plain text message
 * @param styles - Array of style ranges
 * @param applyStyleFn - Function to apply a style to text
 * @returns Styled text
 * 
 * @example
 * ```typescript
 * const styled = applyStyles(
 *   "Error: User john@example.com not found",
 *   [[0, 6, "red.bold"], [12, 29, "cyan"]],
 *   (text, style) => `<${style}>${text}</>`
 * );
 * // Returns: "<red.bold>Error:</> User <cyan>john@example.com</> not found"
 * ```
 */
export function applyStyles(
  plainText: string,
  styles?: StyleRange[],
  applyStyleFn: (text: string, style: string) => string = (text, style) => `<${style}>${text}</>`
): string {
  if (!styles || styles.length === 0) {
    return plainText;
  }
  
  // Sort styles by start index to ensure proper ordering
  const sortedStyles = [...styles].sort((a, b) => a[0] - b[0]);
  
  let result = '';
  let lastEnd = 0;
  
  for (const [start, end, style] of sortedStyles) {
    // Add unstyled text before this range
    if (start > lastEnd) {
      result += plainText.slice(lastEnd, start);
    }
    
    // Add styled text
    const styledText = plainText.slice(start, end);
    result += applyStyleFn(styledText, style);
    
    lastEnd = end;
  }
  
  // Add any remaining unstyled text
  if (lastEnd < plainText.length) {
    result += plainText.slice(lastEnd);
  }
  
  return result;
}

/**
 * Merges overlapping or adjacent style ranges with the same style.
 * 
 * @param styles - Array of style ranges
 * @returns Optimized array of style ranges
 */
export function optimizeStyleRanges(styles: StyleRange[]): StyleRange[] {
  if (styles.length <= 1) return styles;
  
  // Sort by start index
  const sorted = [...styles].sort((a, b) => a[0] - b[0]);
  const optimized: StyleRange[] = [];
  
  let current = sorted[0];
  
  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i];
    
    // Check if ranges can be merged (same style and adjacent/overlapping)
    if (current[2] === next[2] && current[1] >= next[0]) {
      // Merge ranges
      current = [current[0], Math.max(current[1], next[1]), current[2]];
    } else {
      optimized.push(current);
      current = next;
    }
  }
  
  optimized.push(current);
  return optimized;
}

/**
 * Validates that style ranges don't exceed message bounds.
 * 
 * @param plainText - Plain text message
 * @param styles - Array of style ranges
 * @returns True if all ranges are valid
 */
export function validateStyleRanges(plainText: string, styles?: StyleRange[]): boolean {
  if (!styles) return true;
  
  const textLength = plainText.length;
  
  for (const [start, end] of styles) {
    if (start < 0 || end > textLength || start >= end) {
      return false;
    }
  }
  
  return true;
}