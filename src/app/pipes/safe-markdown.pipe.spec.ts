import { SafeMarkdownPipe } from './safe-markdown.pipe';
import { DomSanitizer } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';

describe('SafeMarkdownPipe', () => {
  let pipe: SafeMarkdownPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DomSanitizer,
        {
          provide: DomSanitizer,
          useValue: {
            sanitize: (_context: unknown, value: unknown) => value,
            bypassSecurityTrustHtml: (value: unknown) => value,
          },
        },
      ],
    });
    pipe = TestBed.runInInjectionContext(() => new SafeMarkdownPipe());
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty string for null/undefined content', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });

  it('should sanitize HTML', () => {
    const content = '<script>alert("xss")</script>\n**bold**';
    const result = pipe.transform(content);
    expect(result).not.toContain('<script>');
    expect(result).toContain('<strong>bold</strong>');
  });

  it('should allow headings', () => {
    const content = '# Heading 1';
    const result = pipe.transform(content);
    expect(result).toContain('<h1>Heading 1</h1>');
  });

  it('should allow links with target blank and noopener', () => {
    const content = '[link](https://example.com)';
    const result = pipe.transform(content);
    // Adjust expectation based on how marked renders links with the custom renderer
    expect(result).toContain('<a href="https://example.com"');
    expect(result).toContain('target="_blank"');
    expect(result).toContain('rel="noopener noreferrer"');
  });

  it('should preserve allowed attributes like class', () => {
    const content = '<p class="text-red">hello</p>';
    const result = pipe.transform(content);
    expect(result).toContain('class="text-red"');
  });

  it('should strip disallowed attributes', () => {
    const content = '<p onclick="alert()">hello</p>';
    const result = pipe.transform(content);
    expect(result).not.toContain('onclick');
    expect(result).toContain('<p>hello</p>');
  });
});
