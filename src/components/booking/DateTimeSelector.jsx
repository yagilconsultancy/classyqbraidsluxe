import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dataApi } from '@/api/dataClient';
import { Calendar } from '@/components/ui/calendar';
import { format, isBefore, startOfDay } from 'date-fns';
import { Clock } from 'lucide-react';

const timeSlots = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
  '5:00 PM', '5:30 PM', '6:00 PM',
];

export default function DateTimeSelector({ selectedDate, selectedTime, onDateChange, onTimeChange }) {
  const today = startOfDay(new Date());
  const dateVal = selectedDate ? new Date(selectedDate + 'T00:00:00') : undefined;

  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings-for-date', selectedDate],
    queryFn: () => dataApi.bookings.filter({ appointment_date: selectedDate }),
    enabled: !!selectedDate,
  });

  const { data: blocked = [] } = useQuery({
    queryKey: ['availability-blocked'],
    queryFn: () => dataApi.availability.filter({ is_blocked: true }),
  });

  // Full-day blocked dates → disabled in the calendar
  const fullDayBlockedDates = new Set(
    blocked.filter(s => s.specific_date && !s.start_time).map(s => s.specific_date)
  );

  // Blocked time ranges for the selected date
  const dateBlocks = blocked.filter(s => s.specific_date === selectedDate && !!s.start_time);

  const takenTimes = new Set();
  bookings
    .filter(b => ['pending', 'confirmed', 'in_progress'].includes(b.status))
    .forEach(b => takenTimes.add(b.appointment_time));

  const timeToMin = (t) => {
    const m = String(t || '').match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!m) return null;
    let h = parseInt(m[1]); const min = parseInt(m[2]); const ap = m[3].toUpperCase();
    if (ap === 'PM' && h !== 12) h += 12;
    if (ap === 'AM' && h === 12) h = 0;
    return h * 60 + min;
  };

  const isTimeBlocked = (time) => {
    const slot = timeToMin(time);
    if (slot == null) return false;
    return dateBlocks.some(b => {
      const start = timeToMin(b.start_time);
      if (start == null) return false;
      if (!b.end_time) return start === slot;
      let end = timeToMin(b.end_time);
      if (end == null) return start === slot;
      if (end <= start) end = start + 60;
      return slot >= start && slot < end;
    });
  };

  return (
    <div>
      <h3 className="font-display text-xl text-onyx mb-6">Select Date & Time</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={dateVal}
            onSelect={(d) => d && onDateChange(format(d, 'yyyy-MM-dd'))}
            disabled={(date) => isBefore(date, today) || date.getDay() === 0 || fullDayBlockedDates.has(format(date, 'yyyy-MM-dd'))}
            className="border border-border"
          />
        </div>

        {/* Time Slots */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium text-onyx">Available Times</span>
          </div>
          {!selectedDate ? (
            <p className="text-sm text-muted-foreground">Please select a date first</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 max-h-[280px] overflow-y-auto">
              {timeSlots.map(time => {
                const isTaken = takenTimes.has(time) || isTimeBlocked(time);
                return (
                  <button
                    key={time}
                    disabled={isTaken}
                    onClick={() => onTimeChange(time)}
                    className={`py-2 px-3 text-xs border transition-all ${
                      isTaken
                        ? 'border-border bg-muted text-muted-foreground/40 line-through cursor-not-allowed'
                        : selectedTime === time
                          ? 'border-gold bg-gold text-white'
                          : 'border-border hover:border-gold/50 text-onyx'
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          )}
          {selectedDate && takenTimes.size > 0 && (
            <p className="text-xs text-muted-foreground mt-3">Greyed-out times are already booked or blocked.</p>
          )}
        </div>
      </div>
    </div>
  );
}