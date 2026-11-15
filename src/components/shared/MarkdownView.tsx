'use client';

import React from 'react';

interface MarkdownViewProps {
  readonly content: string;
}

/** Parses inline markdown (bold, italic, code) into safe React nodes. */
function parseInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Matches `code`, **bold**, *italic*
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={match.index} className="bg-gray-700/70 text-blue-300 px-1.5 py-0.5 rounded text-xs">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-semibold text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={match.index} className="italic text-gray-300">
          {token.slice(1, -1)}
        </em>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length > 0 ? parts : [text];
}

/** Renders a markdown table safely. */
function renderTable(lines: string[], keyPrefix: number): React.ReactElement {
  const rows = lines.map((l) =>
    l.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1).map((c) => c.trim())
  );
  const header = rows[0] || [];
  const bodyRows = rows.slice(2);

  return (
    <div key={keyPrefix} className="overflow-x-auto my-2">
      <table className="w-full text-xs text-left border border-gray-700 rounded-lg">
        <thead className="bg-gray-800 text-gray-200 uppercase text-[10px]">
          <tr>
            {header.map((col, i) => (
              <th key={i} className="px-3 py-1.5 border-b border-gray-700">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((row, rIdx) => (
            <tr key={rIdx} className="border-b border-gray-800/80 last:border-0 hover:bg-gray-800/40">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-3 py-1.5">{parseInline(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Renders markdown content safely without dangerouslySetInnerHTML. */
export default function MarkdownView({ content }: MarkdownViewProps) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let tableBuffer: string[] = [];

  const flushTable = (idx: number) => {
    if (tableBuffer.length > 0) {
      elements.push(renderTable(tableBuffer, idx));
      tableBuffer = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      tableBuffer.push(trimmed);
      return;
    }
    flushTable(idx);

    if (trimmed.startsWith('### ')) {
      elements.push(<h4 key={idx} className="font-bold text-white text-sm mt-2 mb-1">{parseInline(trimmed.slice(4))}</h4>);
    } else if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
      elements.push(<h3 key={idx} className="font-bold text-white text-base mt-2 mb-1">{parseInline(trimmed.replace(/^#+\s*/, ''))}</h3>);
    } else if (/^\d+\.\s/.test(trimmed)) {
      const text = trimmed.replace(/^\d+\.\s*/, '');
      elements.push(
        <div key={idx} className="flex gap-2 text-sm my-1 pl-1">
          <span className="text-accent font-semibold">{trimmed.match(/^\d+\./)?.[0]}</span>
          <div className="flex-1">{parseInline(text)}</div>
        </div>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <div key={idx} className="flex gap-2 text-sm my-1 pl-2">
          <span className="text-accent">•</span>
          <div className="flex-1">{parseInline(trimmed.slice(2))}</div>
        </div>
      );
    } else if (trimmed.length > 0) {
      elements.push(<p key={idx} className="my-1.5 text-sm leading-relaxed">{parseInline(line)}</p>);
    }
  });

  flushTable(lines.length);

  return <div className="space-y-0.5">{elements}</div>;
}
