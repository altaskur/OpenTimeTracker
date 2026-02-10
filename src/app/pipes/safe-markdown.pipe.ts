import { Pipe, PipeTransform, SecurityContext, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

/**
 * Pipe that safely converts Markdown content to HTML.
 * Uses DOMPurify with a strict whitelist of allowed tags and attributes
 * to sanitize the HTML before rendering.
 *
 * Usage: {{ markdownContent | safeMarkdown }}
 */
@Pipe({
  name: 'safeMarkdown',
  standalone: true,
})
export class SafeMarkdownPipe implements PipeTransform {
  private readonly allowedTags = [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'p',
    'br',
    'hr',
    'ul',
    'ol',
    'li',
    'a',
    'strong',
    'em',
    'code',
    'pre',
    'blockquote',
  ];

  private readonly allowedAttributes = ['href', 'target', 'rel', 'class'];

  private readonly sanitizer = inject(DomSanitizer);

  constructor() {
    // Configure marked to open links in new tabs using extensions
    marked.use({
      gfm: true, // GitHub Flavored Markdown
      breaks: true, // Convert \n to <br>
      renderer: {
        link({ href, title, text }) {
          const titleAttr = title ? ` title="${title}"` : '';
          return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`;
        },
      },
    });
  }

  transform(content: string | null | undefined): SafeHtml {
    if (!content) {
      return '';
    }

    // Parse markdown to HTML
    const rawHtml = marked.parse(content, { async: false });

    // Sanitize with DOMPurify using strict whitelist
    // ADD_ATTR ensures target and rel attributes are preserved
    const sanitizedHtml = DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS: this.allowedTags,
      ALLOWED_ATTR: this.allowedAttributes,
      ADD_ATTR: ['target', 'rel'],
    });

    // Use Angular's sanitizer to verify the content is safe
    // This returns null if deemed unsafe, otherwise returns the sanitized string
    const angularSanitized = this.sanitizer.sanitize(
      SecurityContext.HTML,
      sanitizedHtml,
    );

    return angularSanitized ?? '';
  }
}
