'use client'

import { useState } from 'react'
import { drivingPrompts, travelDescriptors, type Personality, type PromptId } from '@/lib/profiles/personality'

const fieldClass = 'mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100'

export function PersonalityFields({ initial, promptsEnabled = false }: { initial: Personality; promptsEnabled?: boolean }) {
  const [prompts, setPrompts] = useState(initial.prompts)
  return <>
    <fieldset className="border-t border-slate-100 pt-6">
      <legend className="font-display text-xl font-bold">On the road with me</legend>
      <p className="mt-2 text-sm leading-6 text-slate-500">Pick up to four descriptors. All optional, all visible on your profile. Each ride’s rules still apply.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{travelDescriptors.map(descriptor => <label key={descriptor.key} className="block text-sm font-semibold text-slate-800">
        {descriptor.label}
        <select name={descriptor.key} defaultValue={initial[descriptor.key] ?? ''} className={fieldClass}>
          <option value="">Leave off my profile</option>
          {descriptor.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>)}</div>
    </fieldset>
    {promptsEnabled ? <fieldset className="border-t border-slate-100 pt-6">
      <legend className="font-display text-xl font-bold">A little more you</legend>
      <p className="mt-2 text-sm leading-6 text-slate-500">Answer up to three prompts. Give your next passenger something to break the ice.</p>
      <input type="hidden" name="prompts" value={JSON.stringify(prompts)} />
      <div className="mt-4 space-y-4">{prompts.map((prompt, index) => <div key={index} className="rounded-2xl border border-brand-100 bg-brand-50/50 p-4">
        <div className="flex items-center justify-between gap-2"><span className="text-xs font-semibold text-brand-700">Prompt {index + 1}</span>
          <button type="button" onClick={() => setPrompts(prompts.filter((_, i) => i !== index))} aria-label={`Remove prompt ${index + 1}`} className="min-h-11 px-2 text-sm font-semibold text-slate-600 hover:text-slate-950">Remove</button></div>
        <label className="block text-sm font-semibold">Choose a prompt
          <select value={prompt.id} onChange={event => setPrompts(prompts.map((item, i) => i === index ? { ...item, id: event.target.value as PromptId } : item))} className={fieldClass}>
            {Object.entries(drivingPrompts).map(([id, label]) => <option key={id} value={id} disabled={prompts.some((item, i) => i !== index && item.id === id)}>{label}</option>)}
          </select>
        </label>
        <label className="mt-4 block text-sm font-semibold">Your answer
          <textarea value={prompt.answer} onChange={event => setPrompts(prompts.map((item, i) => i === index ? { ...item, answer: event.target.value } : item))} required maxLength={180} rows={3} placeholder="A little personality goes a long way…" className={`${fieldClass} resize-y`} />
        </label>
        <p className="mt-1 text-right text-xs text-slate-500">{prompt.answer.length}/180</p>
      </div>)}</div>
      {prompts.length < 3 ? <button type="button" className="btn-secondary mt-4" onClick={() => {
        const id = (Object.keys(drivingPrompts) as PromptId[]).find(id => !prompts.some(prompt => prompt.id === id))!
        setPrompts([...prompts, { id, answer: '' }])
      }}>+ Add a prompt</button> : null}
    </fieldset> : null}
  </>
}
