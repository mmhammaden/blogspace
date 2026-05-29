import { useState, useCallback } from "react";
import ReactQuill from "react-quill";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Eye, Code2, FileText } from "lucide-react";
import "react-quill/dist/quill.snow.css";

interface PostEditorProps {
  content: string;
  markdown: string;
  onContentChange: (html: string) => void;
  onMarkdownChange: (md: string) => void;
}

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    ["blockquote", "code-block"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image"],
    ["clean"],
  ],
};

const QUILL_FORMATS = [
  "header", "bold", "italic", "underline", "strike",
  "blockquote", "code-block", "list", "bullet", "link", "image",
];

type EditorMode = "rich" | "markdown" | "preview";

export function PostEditor({ content, markdown, onContentChange, onMarkdownChange }: PostEditorProps) {
  const [mode, setMode] = useState<EditorMode>("rich");

  const handleMarkdownChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onMarkdownChange(e.target.value);
    },
    [onMarkdownChange]
  );

  const tabs: { id: EditorMode; label: string; icon: JSX.Element }[] = [
    { id: "rich", label: "Rich Text", icon: <FileText className="w-4 h-4" /> },
    { id: "markdown", label: "Markdown", icon: <Code2 className="w-4 h-4" /> },
    { id: "preview", label: "Preview", icon: <Eye className="w-4 h-4" /> },
  ];

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMode(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              mode === tab.id
                ? "text-brand-600 dark:text-brand-400 border-b-2 border-brand-600 dark:border-brand-400 bg-white dark:bg-gray-900"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Editor area */}
      <div className="bg-white dark:bg-gray-900">
        {mode === "rich" && (
          <div className="quill-dark">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={onContentChange}
              modules={QUILL_MODULES}
              formats={QUILL_FORMATS}
              placeholder="Write your post content here..."
              style={{ minHeight: "400px" }}
            />
          </div>
        )}

        {mode === "markdown" && (
          <textarea
            value={markdown}
            onChange={handleMarkdownChange}
            placeholder="Write in Markdown..."
            className="w-full min-h-[400px] p-4 font-mono text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 resize-y focus:outline-none"
          />
        )}

        {mode === "preview" && (
          <div className="p-6 min-h-[400px]">
            {(mode === "preview" && (markdown || content)) ? (
              <div className="prose prose-gray dark:prose-invert max-w-none">
                {markdown ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: content }} />
                )}
              </div>
            ) : (
              <p className="text-gray-400 dark:text-gray-500 italic">Nothing to preview yet...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
