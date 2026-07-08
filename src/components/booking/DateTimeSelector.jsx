import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
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
    queryFn: () => base44.entities.Booking.filter({ appointment_date: selectedDate }),
    enabled: !!selectedDate,
  });

  const { data: blockedSlots = [] } = useQuery({
    queryKey: ['blocked-slots-for-date', selectedDate],
    queryFn: () => base44.entities.Availability.filter({ specific_date: selectedDate, is_blocked: true }),
    enabled: !!selectedDate,
  });

  const takenTimes = new Set();
  bookings
    .filter(b => ['pending', 'confirmed', 'in_progress'].includes(b.status))
    .forEach(b => takenTimes.add(b.appointment_time));
  blockedSlots.forEach(s => {
    if (s.start_time) takenTimes.add(s.start_time);
  });

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
            disabled={(date) => isBefore(date, today) || date.getDay() === 0}
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
                const isTaken = takenTimes.has(time);
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