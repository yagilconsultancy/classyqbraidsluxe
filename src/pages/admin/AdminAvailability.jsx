import React, { useState } from 'react';
import { adminApi } from '@/api/adminClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Clock, Link2 } from 'lucide-react';
import { toast } from 'sonner';

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const timeSlots = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
  '5:00 PM', '5:30 PM', '6:00 PM',
];

function computeEndTime(startTime, durationMin) {
  if (!startTime) return '';
  const match = startTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return '';
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const ampm = match[3].toUpperCase();
  if (ampm === 'PM' && hours !== 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  const total = hours * 60 + minutes + (durationMin || 60);
  let endH = Math.floor(total / 60) % 24;
  const endM = total % 60;
  const endAmpm = endH >= 12 ? 'PM' : 'AM';
  endH = endH % 12;
  if (endH === 0) endH = 12;
  return `${endH}:${endM.toString().padStart(2, '0')} ${endAmpm}`;
}

export default function AdminAvailability() {
  const qc = useQueryClient();
  const { data: slots = [] } = useQuery({ queryKey: ['admin-availability'], queryFn: () => adminApi.availability.list() });

  const createMutation = useMutation({
    mutationFn: (d) => adminApi.availability.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-availability'] }); toast.success('Slot added'); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.availability.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-availability'] }); toast.success('Deleted'); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminApi.availability.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-availability'] }),
    onError: (e) => toast.error(e.message),
  });

  const [newSlot, setNewSlot] = useState({ day_of_week: 1, start_time: '09:00', end_time: '18:00', is_available: true });
  const [fullBlock, setFullBlock] = useState({ date: '', reason: '' });
  const [newTimeBlock, setNewTimeBlock] = useState({ specific_date: '', start_time: '9:00 AM', end_time: '10:00 AM', reason: '' });

  // Group by type
  const weeklySlots = slots.filter(s => !s.specific_date);
  const fullDayBlocks = slots.filter(s => s.specific_date && !s.start_time);
  const timeBlocks = slots.filter(s => s.specific_date && s.start_time).sort((a, b) => (a.specific_date > b.specific_date ? 1 : -1));

  return (
    <div className="space-y-6">
      {/* Weekly Schedule */}
      <Card className="shadow-sm border-border">
        <CardHeader><CardTitle className="font-display text-lg">Weekly Schedule</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 mb-6 items-end">
            <div>
              <Label className="text-xs uppercase tracking-wider">Day</Label>
              <select
                value={newSlot.day_of_week}
                onChange={e => setNewSlot({ ...newSlot, day_of_week: parseInt(e.target.value) })}
                className="mt-1 block h-10 px-3 border border-border text-sm bg-white"
              >
                {dayNames.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider">Start</Label>
              <Input type="time" value={newSlot.start_time} onChange={e => setNewSlot({ ...newSlot, start_time: e.target.value })} className="mt-1 rounded-none h-10 w-32" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider">End</Label>
              <Input type="time" value={newSlot.end_time} onChange={e => setNewSlot({ ...newSlot, end_time: e.target.value })} className="mt-1 rounded-none h-10 w-32" />
            </div>
            <Button onClick={() => createMutation.mutate(newSlot)} className="bg-onyx text-white hover:bg-gold rounded-none text-xs h-10 px-4">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add
            </Button>
          </div>

          <div className="space-y-2">
            {weeklySlots.map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-secondary/30 border border-border rounded-sm">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-gold" />
                  <div>
                    <p className="font-medium text-sm">{dayNames[s.day_of_week]}</p>
                    <p className="text-xs text-muted-foreground">{s.start_time} - {s.end_time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={s.is_available}
                    onCheckedChange={v => updateMutation.mutate({ id: s.id, data: { is_available: v } })}
                  />
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(s.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
            {weeklySlots.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No schedule set yet.</p>}
          </div>
        </CardContent>
      </Card>

      {/* Blocked Time Slots */}
      <Card className="shadow-sm border-border">
        <CardHeader>
          <CardTitle className="font-display text-lg">Blocked Time Slots</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">Block a specific time (lunch, appointments, personal). Customers can't book blocked times.</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 mb-6 items-end">
            <div>
              <Label className="text-xs uppercase tracking-wider">Date</Label>
              <Input type="date" value={newTimeBlock.specific_date} onChange={e => setNewTimeBlock({ ...newTimeBlock, specific_date: e.target.value })} className="mt-1 rounded-none h-10 w-44" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider">Start</Label>
              <Select value={newTimeBlock.start_time} onValueChange={v => setNewTimeBlock({ ...newTimeBlock, start_time: v })}>
                <SelectTrigger className="mt-1 h-10 w-32 rounded-none text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider">End</Label>
              <Select value={newTimeBlock.end_time} onValueChange={v => setNewTimeBlock({ ...newTimeBlock, end_time: v })}>
                <SelectTrigger className="mt-1 h-10 w-32 rounded-none text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider">Reason</Label>
              <Input value={newTimeBlock.reason} onChange={e => setNewTimeBlock({ ...newTimeBlock, reason: e.target.value })} placeholder="Lunch, personal, etc." className="mt-1 rounded-none h-10" />
            </div>
            <Button
              onClick={() => {
                if (!newTimeBlock.specific_date) { toast.error('Select a date first'); return; }
                createMutation.mutate({
                  specific_date: newTimeBlock.specific_date,
                  start_time: newTimeBlock.start_time,
                  end_time: newTimeBlock.end_time,
                  is_blocked: true,
                  block_reason: newTimeBlock.reason || 'Manually blocked',
                });
                setNewTimeBlock({ specific_date: '', start_time: '9:00 AM', end_time: '10:00 AM', reason: '' });
              }}
              className="bg-onyx text-white hover:bg-gold rounded-none text-xs h-10 px-4"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Block
            </Button>
          </div>

          <div className="space-y-2">
            {timeBlocks.map(s => {
              const endTime = s.end_time || computeEndTime(s.start_time, s.slot_duration_minutes);
              return (
                <div key={s.id} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-sm">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Clock className="w-4 h-4 text-gold shrink-0" />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1 min-w-0 text-sm">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Date</p>
                        <p className="font-medium">{s.specific_date}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Start</p>
                        <p className="font-medium">{s.start_time}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">End</p>
                        <p className="font-medium">{endTime || '—'}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Reason</p>
                        <p className="text-xs text-muted-foreground truncate" title={s.block_reason}>{s.block_reason || 'Blocked'}</p>
                      </div>
                    </div>
                    {s.booking_reference && (
                      <span className="hidden md:flex text-xs text-gold items-center gap-1 bg-gold/10 px-2 py-0.5 rounded-full shrink-0">
                        <Link2 className="w-3 h-3" /> {s.booking_reference}
                      </span>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => deleteMutation.mutate(s.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              );
            })}
            {timeBlocks.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No time slots blocked.</p>}
          </div>
        </CardContent>
      </Card>

      {/* Blocked Full Dates */}
      <Card className="shadow-sm border-border">
        <CardHeader><CardTitle className="font-display text-lg">Blocked Full Dates</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3 mb-4 items-end flex-wrap">
            <div>
              <Label className="text-xs uppercase tracking-wider">Date</Label>
              <Input type="date" value={fullBlock.date} onChange={e => setFullBlock({ ...fullBlock, date: e.target.value })} className="mt-1 rounded-none h-10 w-48" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider">Reason</Label>
              <Input value={fullBlock.reason} onChange={e => setFullBlock({ ...fullBlock, reason: e.target.value })} placeholder="Holiday, etc." className="mt-1 rounded-none h-10 w-48" />
            </div>
            <Button onClick={() => {
              if (!fullBlock.date) { toast.error('Select a date first'); return; }
              createMutation.mutate({ specific_date: fullBlock.date, is_blocked: true, block_reason: fullBlock.reason || 'Blocked' });
              setFullBlock({ date: '', reason: '' });
            }} className="bg-onyx text-white hover:bg-gold rounded-none text-xs h-10 px-4">
              <Plus className="w-3.5 h-3.5 mr-1" /> Block Date
            </Button>
          </div>
          <div className="space-y-2">
            {fullDayBlocks.map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-sm">
                <div>
                  <p className="font-medium text-sm">{s.specific_date}</p>
                  <p className="text-xs text-muted-foreground">{s.block_reason || 'Blocked'}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(s.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
            {fullDayBlocks.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No full dates blocked.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}