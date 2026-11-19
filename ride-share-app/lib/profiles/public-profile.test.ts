import { beforeEach, expect, it, vi } from 'vitest'
const db = vi.hoisted(() => ({
  select: vi.fn(), eq: vi.fn(), neq: vi.fn(), passengerError: null as null | {message:string}, countError: null as null | {message:string},
  profile: {id:'20000000-0000-4000-8000-000000000001',full_name:'Test Driver',photo_url:'https://example.com/photo.jpg',university:'UKIM',bio:null,gender:null,created_at:'2024-05-15T12:00:00Z',driver_details:{music:'shared',prompts:[]}},
}))
vi.mock('server-only', () => ({}))
vi.mock('@/lib/supabase/server', () => ({createClient:async()=>({from:(table:string)=>{
  const query = {
    select: (...args:unknown[]) => { db.select(table,...args);return query },
    eq: (...args:unknown[]) => { db.eq(table,...args);return query },
    neq: (...args:unknown[]) => { db.neq(table,...args);return query },
    maybeSingle: async()=>({data:db.profile,error:null}),
    then: (resolve:(value:unknown)=>unknown) => Promise.resolve({count:table==='bookings'?12:27,error:table==='bookings'?db.passengerError:db.countError}).then(resolve),
  };return query
}})}))
import { getPublicProfile } from './public-profile'
beforeEach(()=>{db.select.mockClear();db.eq.mockClear();db.countError=null;db.passengerError=null;db.neq.mockClear()})
it('loads only public facts and counts completed rides by this driver',async()=>{
  const profile=await getPublicProfile(db.profile.id)
  expect(profile).toMatchObject({completedRides:39,createdAt:db.profile.created_at,personality:{music:'shared',prompts:[]}})
  expect(db.select).toHaveBeenCalledWith('profiles','id, full_name, photo_url, university, bio, gender, created_at, driver_details')
  expect(db.eq).toHaveBeenCalledWith('rides','driver_id',db.profile.id)
  expect(db.eq).toHaveBeenCalledWith('rides','status','completed')
})
it('keeps failed counts unavailable rather than claiming zero rides',async()=>{
  db.countError={message:'unavailable'}
  expect((await getPublicProfile(db.profile.id))?.completedRides).toBeNull()
})
it('rejects invalid profile IDs before querying',async()=>{
  expect(await getPublicProfile('invalid')).toBeNull()
  expect(db.select).not.toHaveBeenCalled()
})

it('counts accepted passenger bookings on completed rides, excluding own drives',async()=>{
  expect((await getPublicProfile(db.profile.id))?.completedRides).toBe(39)
  expect(db.select).toHaveBeenCalledWith('bookings','id, rides!inner(id)',{count:'exact',head:true})
  expect(db.eq).toHaveBeenCalledWith('bookings','passenger_id',db.profile.id)
  expect(db.eq).toHaveBeenCalledWith('bookings','status','accepted')
  expect(db.eq).toHaveBeenCalledWith('bookings','rides.status','completed')
  expect(db.neq).toHaveBeenCalledWith('bookings','rides.driver_id',db.profile.id)
})
it('does not show a partial total when the passenger count fails',async()=>{
  db.passengerError={message:'unavailable'}
  expect(await getPublicProfile(db.profile.id)).toMatchObject({completedRides:null})
})
