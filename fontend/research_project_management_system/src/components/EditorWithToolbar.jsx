import { useState, memo, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';

const EditorToolbar = memo(({ editor }) => {
  const [color, setColor] = useState('#000000');
  const [isSelectedImage, setIsSelectedImage] = useState(false);
  const [currentHeading, setCurrentHeading] = useState('0');



  const handleSetColor = useDebouncedCallback((value) => {
    if (editor) {
      editor.chain().focus().setColor(value).run();
      setColor(value);
    }
  }, 200);

  const handleSetImage = (file) => {
    if (editor && file) {
      const src = URL.createObjectURL(file);
      editor.chain().focus().setImage({ src }).run();
      setIsSelectedImage(false);
    }
  };

  const toggleButtons = [
    {
      name: 'bold',
      icon: 'B',
      label: 'Đậm',
      command: () => editor?.chain().focus().toggleBold().run(),
      isActive: () => editor?.isActive('bold') || false,
    },
    {
      name: 'italic',
      icon: 'I',
      label: 'Nghiêng',
      command: () => editor?.chain().focus().toggleItalic().run(),
      isActive: () => editor?.isActive('italic') || false,
    },
    {
      name: 'bulletList',
      icon: '•',
      label: 'Danh sách dấu đầu dòng',
      command: () => editor?.chain().focus().toggleBulletList().run(),
      isActive: () => editor?.isActive('bulletList') || false,
    },
    {
      name: 'orderedList',
      icon: '1.',
      label: 'Danh sách đánh số',
      command: () => editor?.chain().focus().toggleOrderedList().run(),
      isActive: () => editor?.isActive('orderedList') || false,
    },
    {
      name: 'link',
      icon: '🔗',
      label: 'Liên kết',
      command: () => {
        const url = window.prompt('Nhập URL');
        if (url) editor?.chain().focus().setLink({ href: url }).run();
      },
      isActive: () => editor?.isActive('link') || false,
    },
    {
      name: 'alignLeft',
      icon: '←',
      label: 'Căn trái',
      command: () => editor?.chain().focus().setTextAlign('left').run(),
      isActive: () => editor?.isActive({ textAlign: 'left' }) || false,
    },
    {
      name: 'alignCenter',
      icon: '↔',
      label: 'Căn giữa',
      command: () => editor?.chain().focus().setTextAlign('center').run(),
      isActive: () => editor?.isActive({ textAlign: 'center' }) || false,
    },
    {
      name: 'alignRight',
      icon: '→',
      label: 'Căn phải',
      command: () => editor?.chain().focus().setTextAlign('right').run(),
      isActive: () => editor?.isActive({ textAlign: 'right' }) || false,
    },
    {
      name: 'clearFormat',
      icon: '🗑️',
      label: 'Xóa định dạng',
      command: () => editor?.chain().focus().unsetAllMarks().clearNodes().run(),
      isActive: () => false,
    },
    {
      name: 'undo',
      icon: '↺',
      label: 'Hoàn tác',
      command: () => editor?.chain().focus().undo().run(),
      isActive: () => false,
    },
    {
      name: 'redo',
      icon: '↻',
      label: 'Làm lại',
      command: () => editor?.chain().focus().redo().run(),
      isActive: () => false,
    },
  ];

  const paragraphOptions = [
    { value: '0', label: 'Đoạn văn', className: 'text-base' },
    { value: '1', label: 'Tiêu đề 1', className: 'text-2xl font-bold' },
    { value: '2', label: 'Tiêu đề 2', className: 'text-xl font-semibold' },
    { value: '3', label: 'Tiêu đề 3', className: 'text-lg font-medium' },
  ];

  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4 bg-gray-100 p-3 rounded-md">
      <select
        className="w-[120px] p-2 border-none rounded-md bg-gray-50 text-gray-800 text-sm focus:ring-0 hover:bg-gray-200"
        onChange={(e) => {
          const value = e.target.value;
          console.log('Selected Heading:', value);
          if (value === '0') {
            editor.chain().focus().setParagraph().run();
          } else {
            editor.chain().focus().setHeading({ level: parseInt(value) }).run();
          }
          setCurrentHeading(value);
          console.log('Editor HTML after change:', editor.getHTML());
        }}
        value={currentHeading}
      >
        {paragraphOptions.map((option) => (
          <option key={option.value} value={option.value} className={option.className}>
            {option.label}
          </option>
        ))}
      </select>
      {toggleButtons.map((button) => (
        <button
          key={button.name}
          type="button"
          onClick={button.command}
          title={button.label}
          className={`size-8 flex items-center justify-center text-sm rounded-md ${
            button.isActive() ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-700'
          } hover:bg-teal-400 hover:text-white transition-colors duration-150 disabled:opacity-50`}
          disabled={!editor}
        >
          {button.icon}
        </button>
      ))}
     
      <input
        type="color"
        value={color}
        onChange={(e) => handleSetColor(e.target.value)}
        title="Chọn màu chữ"
        className="size-8 rounded-md border-none p-0 cursor-pointer disabled:opacity-50"
        disabled={!editor}
      />
     
    </div>
  );
});

export default EditorToolbar;