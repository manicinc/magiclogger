/**
 * XMLFormatter: Formats log entries as XML.
 *
 * Produces either a single <log> element (via format) or a full XML document
 * with declaration and <logs> root when using formatBatch.
 *
 * Design goals:
 *  - Deterministic element ordering
 *  - Proper XML escaping for attribute / element content
 *  - Graceful handling of nested objects (context, metadata) via recursive
 *    element emission with sanitized tag names
 *  - Safe stack inclusion using CDATA section to preserve formatting
 *
 * This formatter intentionally avoids streaming partial fragments; if you need
 * streaming XML, consider a custom formatter that emits SAX-like events.
 *
 * @module transports/formatters/XMLFormatter
 */

import type { LogEntry } from '../../types/transport';
import { CustomFormatter } from './BaseFormatter';

/**
 * XML formatter for log entries.
 *
 * @example
 * ```ts
 * import { XMLFormatter } from 'magiclogger/transports/formatters/XMLFormatter';
 * const xf = new XMLFormatter();
 * const xml = xf.format(entry);
 * ```
 */
export class XMLFormatter extends CustomFormatter {
  private readonly xmlDeclaration = '<?xml version="1.0" encoding="UTF-8"?>';

  format(entry: LogEntry): string {
    const lines: string[] = [];

    lines.push(`<log level="${this.escapeXml(entry.level)}" timestamp="${this.escapeXml(entry.timestamp)}">`);
    lines.push(`  <id>${this.escapeXml(entry.id)}</id>`);

    if (entry.loggerId) {
      lines.push(`  <loggerId>${this.escapeXml(entry.loggerId)}</loggerId>`);
    }

    lines.push(`  <message>${this.escapeXml(entry.plainMessage || entry.message)}</message>`);

    if (entry.tags && entry.tags.length > 0) {
      lines.push('  <tags>');
      entry.tags.forEach(tag => lines.push(`    <tag>${this.escapeXml(tag)}</tag>`));
      lines.push('  </tags>');
    }

    if (entry.error) {
      lines.push('  <error>');
      lines.push(`    <name>${this.escapeXml(entry.error.name)}</name>`);
      lines.push(`    <message>${this.escapeXml(entry.error.message)}</message>`);
      if (entry.error.stack) {
        lines.push(`    <stack><![CDATA[${entry.error.stack}]]></stack>`);
      }
      if (entry.error.code) {
        lines.push(`    <code>${this.escapeXml(entry.error.code)}</code>`);
      }
      lines.push('  </error>');
    }

    if (entry.context && Object.keys(entry.context).length > 0) {
      lines.push('  <context>');
      this.formatObject(entry.context, lines, '    ');
      lines.push('  </context>');
    }

    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      lines.push('  <metadata>');
      this.formatObject(entry.metadata, lines, '    ');
      lines.push('  </metadata>');
    }

    lines.push('</log>');
    return lines.join('\n');
  }

  formatBatch(entries: LogEntry[]): string {
    const lines: string[] = [this.xmlDeclaration, '<logs>'];
    entries.forEach(entry => {
      this.format(entry).split('\n').forEach(l => lines.push('  ' + l));
    });
    lines.push('</logs>');
    return lines.join('\n');
  }

  private formatObject(obj: Record<string, unknown>, lines: string[], indent: string): void {
    for (const [key, value] of Object.entries(obj)) {
      const safeKey = this.sanitizeXmlTag(key);
      if (value === null || value === undefined) {
        lines.push(`${indent}<${safeKey} />`);
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        lines.push(`${indent}<${safeKey}>`);
        this.formatObject(value as Record<string, unknown>, lines, indent + '  ');
        lines.push(`${indent}</${safeKey}>`);
      } else if (Array.isArray(value)) {
        lines.push(`${indent}<${safeKey}>`);
        (value as unknown[]).forEach(item => lines.push(`${indent}  <item>${this.escapeXml(this.stringify(item))}</item>`));
        lines.push(`${indent}</${safeKey}>`);
      } else {
        lines.push(`${indent}<${safeKey}>${this.escapeXml(this.stringify(value))}</${safeKey}>`);
      }
    }
  }

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private sanitizeXmlTag(str: string): string {
    return str.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/^[0-9-]/, '_');
  }
}

export default XMLFormatter;
