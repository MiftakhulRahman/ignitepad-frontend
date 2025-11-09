import { useState, useRef, forwardRef } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor = forwardRef<HTMLTextAreaElement, RichTextEditorProps>(
  ({ value, onChange, placeholder }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    const handleFormat = (command: string, value: string = '') => {
      document.execCommand(command, false, value);
      // Get updated content
      if (textareaRef.current) {
        onChange(textareaRef.current.innerHTML);
      }
    };

    const handleInput = () => {
      if (textareaRef.current) {
        onChange(textareaRef.current.innerHTML);
      }
    };

    return (
      <div className="border border-input rounded-md overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-1 p-2 border-b border-input bg-muted">
          <button
            type="button"
            className="p-1.5 rounded hover:bg-accent"
            onClick={() => handleFormat('bold')}
            title="Bold"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
              <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
            </svg>
          </button>
          <button
            type="button"
            className="p-1.5 rounded hover:bg-accent"
            onClick={() => handleFormat('italic')}
            title="Italic"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="4" x2="10" y2="4"></line>
              <line x1="14" y1="20" x2="5" y2="20"></line>
              <line x1="15" y1="4" x2="9" y2="20"></line>
            </svg>
          </button>
          <button
            type="button"
            className="p-1.5 rounded hover:bg-accent"
            onClick={() => handleFormat('underline')}
            title="Underline"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path>
              <line x1="4" y1="21" x2="20" y2="21"></line>
            </svg>
          </button>
          <div className="w-px bg-border mx-1 h-6 self-center"></div>
          <button
            type="button"
            className="p-1.5 rounded hover:bg-accent"
            onClick={() => handleFormat('insertUnorderedList')}
            title="Bullet List"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
          </button>
          <button
            type="button"
            className="p-1.5 rounded hover:bg-accent"
            onClick={() => handleFormat('insertOrderedList')}
            title="Numbered List"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="10" y1="6" x2="21" y2="6"></line>
              <line x1="10" y1="12" x2="21" y2="12"></line>
              <line x1="10" y1="18" x2="21" y2="18"></line>
              <path d="M4 6h1v4H4z"></path>
              <circle cx="4.5" cy="14" r="2"></circle>
              <path d="M7 17.5V18H4.5"></path>
            </svg>
          </button>
          <div className="w-px bg-border mx-1 h-6 self-center"></div>
          <button
            type="button"
            className="p-1.5 rounded hover:bg-accent"
            onClick={() => handleFormat('formatBlock', '<h1>')}
            title="Heading 1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12h8"></path>
              <path d="M4 18V6"></path>
              <path d="M12 18V6"></path>
              <path d="M17.5 8.5v7"></path>
              <path d="M14.5 15.5h6"></path>
            </svg>
          </button>
          <button
            type="button"
            className="p-1.5 rounded hover:bg-accent"
            onClick={() => handleFormat('formatBlock', '<h2>')}
            title="Heading 2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12h8"></path>
              <path d="M4 18V6"></path>
              <path d="M12 18V6"></path>
              <path d="M17.5 10.5v2.5"></path>
              <path d="M17.5 15.5v3.5"></path>
              <path d="M14.5 19h6"></path>
              <path d="M14.5 5.5v3.5"></path>
              <path d="M14.5 2.5v1"></path>
            </svg>
          </button>
        </div>
        
        {/* Content editable area */}
        <div className="relative">
          <div
            ref={textareaRef}
            contentEditable
            className="min-h-[200px] p-3 focus:outline-none bg-background"
            onInput={handleInput}
            dangerouslySetInnerHTML={{ __html: value }}
            style={{ whiteSpace: 'pre-wrap' }}
          />
          {value === '' && (
            <div className="absolute top-3 left-3 text-muted-foreground pointer-events-none">
              {placeholder || 'Tulis konten proyek Anda di sini...'}
            </div>
          )}
        </div>
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';

export { RichTextEditor };