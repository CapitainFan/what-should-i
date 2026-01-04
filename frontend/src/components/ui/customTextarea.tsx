'use client'

import { TextareaHTMLAttributes, forwardRef, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface CustomTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  minHeight?: number
  maxHeight?: number
}

export const CustomTextarea = forwardRef<HTMLTextAreaElement, CustomTextareaProps>(
  ({ 
    className, 
    minHeight = 64, 
    maxHeight = 210,
    value = '',
    onChange,
    ...props 
  }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const setRefs = (element: HTMLTextAreaElement) => {
      if (textareaRef.current !== element) {
        textareaRef.current = element
      }
      
      if (typeof ref === 'function') {
        ref(element)
      } else if (ref) {
        ref.current = element
      }
      
      if (element) {
        element.style.height = `${minHeight}px`
        element.style.display = 'flex'
        element.style.alignItems = 'center'
        element.style.overflowY = 'hidden'
      }
    }

    const updateTextareaHeight = (textarea: HTMLTextAreaElement) => {
      const previousScrollTop = textarea.scrollTop
      const cursorPosition = textarea.selectionStart
      
      textarea.style.maxHeight = 'none'
      textarea.style.height = 'auto'
      
      const scrollHeight = textarea.scrollHeight
      
      textarea.style.maxHeight = `${maxHeight}px`
      
      if (scrollHeight > maxHeight) {
        textarea.style.height = `${maxHeight}px`
        textarea.style.overflowY = 'auto'
        textarea.style.alignItems = 'flex-start'
      } else {
        const newHeight = Math.max(minHeight, scrollHeight)
        textarea.style.height = `${newHeight}px`
        textarea.style.overflowY = 'hidden'
        
        if (scrollHeight > minHeight) {
          textarea.style.alignItems = 'flex-start'
        } else {
          textarea.style.alignItems = 'center'
        }
      }
      
      if (textarea.scrollTop !== previousScrollTop) {
        textarea.scrollTop = previousScrollTop
      }
      
      textarea.setSelectionRange(cursorPosition, cursorPosition)
    }

    const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
      const textarea = e.currentTarget
      updateTextareaHeight(textarea)
      
      if (onChange) {
        onChange(e as React.ChangeEvent<HTMLTextAreaElement>)
      }
    }

    // Обновляем высоту при изменении значения извне
    useEffect(() => {
      if (textareaRef.current) {
        updateTextareaHeight(textareaRef.current)
      }
    }, [value, minHeight, maxHeight])

    return (
      <>
        <textarea
          ref={setRefs}
          className={cn(
            "md:text-xlg px-8 border-none rounded-xl focus-visible:ring-0 focus:outline-none w-full max-w-170 resize-none bg-[hsla(0,0%,50%,0.342)] bg-opacity-30 custom-scrollbar",
            className
          )}
          style={{
            minHeight: `${minHeight}px`,
            maxHeight: `${maxHeight}px`,
            overflowY: 'hidden',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            lineHeight: '24px',
            display: 'flex',
            alignItems: 'center',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            paddingTop: '8px',
            paddingBottom: '8px',
            backgroundColor: 'hsla(0,0%,50%,0.342)',
          }}
          value={value}
          onChange={onChange}
          onInput={handleInput}
          {...props}
        />
        
        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
            margin: 25px 0;
            border-radius: 10px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(120, 120, 120, 0.5);
            border-radius: 10px;
            width: 4px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(120, 120, 120, 0.7);
          }
          
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(120, 120, 120, 0.5) transparent;
          }
        `}</style>
      </>
    )
  }
)

CustomTextarea.displayName = 'CustomTextarea'