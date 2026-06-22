import * as React from 'react'

export default function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  // Allow callers to override w-full by passing their own width class
  const hasWidth = /\bw-/.test(className ?? '')
  return (
    <select
      {...props}
      className={`h-12 rounded-xl border border-neutral-300 bg-white px-4 text-[16px] text-neutral-800 outline-none transition focus:border-neutral-500 ${hasWidth ? '' : 'w-full'} ${className ?? ''}`}
    />
  )
}