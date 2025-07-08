import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Image from '@tiptap/extension-image';
import EditorToolbar from '../../../components/EditorWithToolbar';

const Tiptap = () => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: {},
        orderedList: {},
        blockquote: {},
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Image,
    ],
    content: '<p>Chào mừng bạn đến với Tiptap!</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none', // Tailwind classes
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} className="border rounded-md p-4" />
    </div>
  );
};

export default Tiptap;