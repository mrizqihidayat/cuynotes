import React, { useMemo, useEffect } from 'react'
import { useQuill } from "react-quilljs";
import 'quill/dist/quill.snow.css';

export const RichTextEditor = ({ value, onChange, placeholder}) => {
    const modules = useMemo(
        () => ({
            toolbar: [
                [{ header: [1, 2, false]}],
                ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
                [{ list: 'ordered'}],
                [{ align: [] }],
                [{ color:[]}, {background: []}],
                ['link'],
                ['clean']
            ],
        }),
        []
    );

    const formats = useMemo(
        () => [
            'header',
            'bold',
            'italic',
            'underline',
            'strike',
            'blockquote',
            'code-block',
            'list',
            'align',
            'color',
            'background',
            'link'
        ],
        []
    );

    const { quill, quillRef } = useQuill({ theme: 'snow', modules, formats, placeholder})

    useEffect(() => {
        if(!quill) return
        const handler = () => onChange?.(quill.root.innerHTML)
        quill.on('text-change', handler)
        return () => {
            quill.off('text-change', handler)
        }
    }, [quill, onChange])

    useEffect(() => {
        if(!quill) return 
        const current = quill.root.innerHTML
        if((value || '') !== current){
            quill.root.innerHTML = value || ''
        }
    }, [value, quill])

  return (
    <div className='rounded-xl overflow-hidden border border-neutral-200'>
        <div ref={quillRef} style={{ minHeight: 180 }} />
    </div>
  )
}
