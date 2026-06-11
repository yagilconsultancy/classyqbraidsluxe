import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Clock } from 'lucide-react';
import { toast } from 'sonner';

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AdminAvailability() {
  const qc = useQueryClient();
  const { data: slots = [] } = useQuery({ queryKey: ['availability'], queryFn: () => base44.entities.Availability.list() });

  const createMutation = useMutation({
    mutationFn: (d) => base44.entities.Availability.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['availability'] }); toast.success('Slot added'); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Availability.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['availability'] }); toast.success('Deleted'); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Availability.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['availability'] }),
  });

  const [newSlot, setNewSlot] = useState({ day_of_week: 1, start_time: '09:00', end_time: '18:00', is_available: true });

  // Group by type
  const weeklySlots = slots.filter(s => !s.specific_date);
  const blockedDates = slots.filter(s => s.specific_date);

  return (
    <div className="space-y-6">
      {/* Add Weekly Slot */}
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

      {/* Block Dates */}
      <Card className="shadow-sm border-border">
        <CardHeader><CardTitle className="font-display text-lg">Blocked Dates</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3 mb-4 items-end">
            <div>
              <Label className="text-xs uppercase tracking-wider">Date</Label>
              <Input type="date" id="block-date" className="mt-1 rounded-none h-10 w-48" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider">Reason</Label>
              <Input id="block-reason" placeholder="Holiday, etc." className="mt-1 rounded-none h-10 w-48" />
            </div>
            <Button onClick={() => {
              const date = document.getElementById('block-date').value;
              const reason = document.getElementById('block-reason').value;
              if (date) createMutation.mutate({ specific_date: date, is_blocked: true, block_reason: reason });
            }} className="bg-onyx text-white hover:bg-gold rounded-none text-xs h-10 px-4">
              <Plus className="w-3.5 h-3.5 mr-1" /> Block
            </Button>
          </div>
          <div className="space-y-2">
            {blockedDates.map(s => (
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}