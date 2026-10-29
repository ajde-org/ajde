import { drivingPrompts, travelDescriptors, type Personality } from '@/lib/profiles/personality'
import { UiIcon } from '@/components/ui-icon'

export function TravelDescriptors({ personality, compact = false }: { personality: Personality; compact?: boolean }) {
  const selected = travelDescriptors.flatMap(descriptor => {
    const option = descriptor.options.find(option => option.value === personality[descriptor.key])
    return option ? [{ ...descriptor, text: option.label }] : []
  })
  if (!selected.length) return null
  return <ul aria-label="Travel preferences" className={compact ? 'mt-4 space-y-3' : 'mt-3 space-y-2'}>
    {(compact ? selected.slice(0, 2) : selected).map(descriptor => <li key={descriptor.key} className="flex items-start gap-3 text-sm leading-6 text-slate-600">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700"><UiIcon name={descriptor.icon} size={18} /></span>
      <span className="pt-1.5">{descriptor.text}</span>
    </li>)}
  </ul>
}

export function ProfilePrompts({ personality }: { personality: Personality }) {
  if (!personality.prompts.length) return null
  return <section aria-labelledby="prompts-heading" className="mt-4 space-y-3">
    <div className="px-1"><p className="text-xs font-bold uppercase tracking-widest text-brand-700">Beyond the driver’s seat</p>
      <h2 id="prompts-heading" className="mt-2 font-display text-2xl font-bold tracking-tight">A little more me</h2></div>
    {personality.prompts.map(prompt => <div key={prompt.id} className="surface-card p-5 sm:p-6">
      <h3 className="text-sm font-semibold text-brand-700">{drivingPrompts[prompt.id]}</h3>
      <p className="mt-2 whitespace-pre-wrap break-words font-display text-2xl font-bold leading-snug tracking-tight text-slate-950 [overflow-wrap:anywhere] sm:text-3xl">{prompt.answer}</p>
    </div>)}
  </section>
}
