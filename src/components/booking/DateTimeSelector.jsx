import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
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
              {timeSlots.map(time => (
                <button
                  key={time}
                  onClick={() => onTimeChange(time)}
                  className={`py-2 px-3 text-xs border transition-all ${
                    selectedTime === time
                      ? 'border-gold bg-gold text-white'
                      : 'border-border hover:border-gold/50 text-onyx'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}