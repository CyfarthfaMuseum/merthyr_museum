import * as React from 'react'

export default function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-[16px] text-neutral-800 outline-none transition focus:border-neutral-500 ${
        props.className ?? ''
      }`}
    />
  )
}