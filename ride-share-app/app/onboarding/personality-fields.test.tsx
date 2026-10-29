// @vitest-environment jsdom
import React from 'react'
import { afterEach, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PersonalityFields } from './personality-fields'

afterEach(cleanup)
it('allows up to three different prompts, edits answers and removes them', async () => {
  const user = userEvent.setup()
  const { container } = render(<PersonalityFields promptsEnabled initial={{ prompts: [] }} />)
  await user.click(screen.getByRole('button', { name: '+ Add a prompt' }))
  await user.type(screen.getByLabelText('Your answer'), 'Finding great coffee')
  await user.click(screen.getByRole('button', { name: '+ Add a prompt' }))
  await user.click(screen.getByRole('button', { name: '+ Add a prompt' }))
  expect(screen.queryByRole('button', { name: '+ Add a prompt' })).toBeNull()
  const prompts = JSON.parse((container.querySelector('[name="prompts"]') as HTMLInputElement).value)
  expect(new Set(prompts.map((p: {id:string}) => p.id)).size).toBe(3)
  expect(prompts[0].answer).toBe('Finding great coffee')
  await user.click(screen.getByRole('button', { name: 'Remove prompt 1' }))
  expect(screen.getAllByLabelText('Your answer')).toHaveLength(2)
  expect(screen.getByRole('button', { name: '+ Add a prompt' })).toBeTruthy()
})
it('loads saved descriptors and lets the user clear them', async () => {
  const user = userEvent.setup()
  render(<PersonalityFields promptsEnabled initial={{ music: 'shared', prompts: [{ id:'snack',answer:'Burek' }] }} />)
  expect((screen.getByLabelText('Music') as HTMLSelectElement).value).toBe('shared')
  expect((screen.getByLabelText('Your answer') as HTMLTextAreaElement).value).toBe('Burek')
  await user.selectOptions(screen.getByLabelText('Music'), '')
  expect((screen.getByLabelText('Music') as HTMLSelectElement).value).toBe('')
})

it('hides prompt settings by default while keeping travel descriptors editable', () => {
  render(<PersonalityFields initial={{prompts:[{id:'snack',answer:'Burek'}]}} />)
  expect(screen.queryByText('A little more you')).toBeNull()
  expect(screen.queryByLabelText('Your answer')).toBeNull()
  expect(screen.queryByRole('button', {name:'+ Add a prompt'})).toBeNull()
  expect(screen.getByLabelText('Music')).toBeTruthy()
})
