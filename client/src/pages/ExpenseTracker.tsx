// src/pages/TripPlanningTools.jsx
import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const initialActivities = [
  {
    day: 1,
    date: '2025-09-01',
    activities: [
      { 
        id: 1, 
        type: 'sightseeing', 
        time: '09:00 AM', 
        name: 'Visit Taj Mahal', 
        location: 'Agra, Uttar Pradesh',
        duration: '3 hours',
        cost: 1100,
        notes: 'Get there early to avoid crowds. Sunrise views are spectacular.',
        rating: 4.8
      },
      { 
        id: 2, 
        type: 'food', 
        time: '12:30 PM', 
        name: 'Lunch at Peshawri', 
        location: 'ITC Mughal, Agra',
        duration: '1.5 hours',
        cost: 2500,
        notes: 'Famous for North-West Frontier cuisine. Try their dal bukhara.',
        rating: 4.6
      },
      { 
        id: 3, 
        type: 'sightseeing', 
        time: '03:00 PM', 
        name: 'Explore Agra Fort', 
        location: 'Agra, Uttar Pradesh',
        duration: '2 hours',
        cost: 650,
        notes: 'UNESCO World Heritage site with beautiful architecture.',
        rating: 4.5
      },
    ],
    totalCost: 4250
  },
  {
    day: 2,
    date: '2025-09-02',
    activities: [
      { 
        id: 4, 
        type: 'travel', 
        time: '10:00 AM', 
        name: 'Road trip to Jaipur', 
        location: 'Agra to Jaipur',
        duration: '4 hours',
        cost: 3500,
        notes: 'Private car with driver. Stop at Fatehpur Sikri on the way.',
        rating: 4.2
      },
      { 
        id: 5, 
        type: 'sightseeing', 
        time: '03:00 PM', 
        name: 'Visit Hawa Mahal', 
        location: 'Jaipur, Rajasthan',
        duration: '1.5 hours',
        cost: 200,
        notes: 'Best photographed in the afternoon light.',
        rating: 4.3
      },
      { 
        id: 6, 
        type: 'shopping', 
        time: '05:00 PM', 
        name: 'Shopping at Johari Bazaar', 
        location: 'Jaipur, Rajasthan',
        duration: '2 hours',
        cost: 5000,
        notes: 'Famous for jewelry and traditional handicrafts.',
        rating: 4.4
      },
    ],
    totalCost: 8700
  },
];

const tagColors: Record<string, string> = {
  sightseeing: 'bg-blue-100 text-blue-800 border-blue-200',
  food: 'bg-green-100 text-green-800 border-green-200',
  travel: 'bg-amber-100 text-amber-800 border-amber-200',
  shopping: 'bg-purple-100 text-purple-800 border-purple-200',
  accommodation: 'bg-pink-100 text-pink-800 border-pink-200',
};

function TripPlanningTools() {
  const [itinerary, setItinerary] = useState(initialActivities);
  const [selectedDay, setSelectedDay] = useState(1);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [newActivity, setNewActivity] = useState({
    type: 'sightseeing',
    time: '09:00 AM',
    name: '',
    location: '',
    duration: '1 hour',
    cost: 0,
    notes: ''
  });
  const [budget, setBudget] = useState(20000);
  const [currency, setCurrency] = useState('INR');
  const [exchangeRate, setExchangeRate] = useState(1);

  // Calculate total trip cost
  const totalTripCost = itinerary.reduce((sum, day) => sum + day.totalCost, 0);
  const budgetRemaining = budget - totalTripCost;

  // Format currency
    const formatCurrency = (amount: number) => {
      if (currency === 'INR') {
        return `₹${amount.toLocaleString('en-IN')}`;
      } else {
        return `$${(amount / exchangeRate).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
      }
    };

  // Calendar events derived from activities
  const calendarEvents = itinerary.flatMap(day =>
    day.activities.map(a => ({
      title: a.name,
      date: day.date,
      extendedProps: {
        type: a.type,
        cost: a.cost
      }
    }))
  );

  // Handle adding a new activity
  const handleAddActivity = () => {
    if (!newActivity.name) return;
    
    const newId = Math.max(...itinerary.flatMap(d => d.activities.map(a => a.id))) + 1;
    const activityToAdd = {
      id: newId,
      ...newActivity,
      rating: 0
    };
    
    const updatedItinerary = itinerary.map(day => {
      if (day.day === selectedDay) {
        const updatedActivities = [...day.activities, activityToAdd];
        const updatedTotalCost = updatedActivities.reduce((sum, a) => sum + a.cost, 0);
        return {
          ...day,
          activities: updatedActivities,
          totalCost: updatedTotalCost
        };
      }
      return day;
    });
    
    setItinerary(updatedItinerary);
    setNewActivity({
      type: 'sightseeing',
      time: '09:00 AM',
      name: '',
      location: '',
      duration: '1 hour',
      cost: 0,
      notes: ''
    });
    setShowAddActivity(false);
  };

  // Handle deleting an activity
    const handleDeleteActivity = (dayId: number, activityId: number) => {
      const updatedItinerary = itinerary.map(day => {
        if (day.day === dayId) {
          const updatedActivities = day.activities.filter(a => a.id !== activityId);
          const updatedTotalCost = updatedActivities.reduce((sum, a) => sum + a.cost, 0);
          return {
            ...day,
            activities: updatedActivities,
            totalCost: updatedTotalCost
          };
        }
        return day;
      });
      
      setItinerary(updatedItinerary);
    };

  // Handle currency change
    const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newCurrency = e.target.value;
      setCurrency(newCurrency);
      
      if (newCurrency === 'USD') {
        setExchangeRate(83.5); // Example exchange rate
      } else {
        setExchangeRate(1);
      }
    };

  return (
    <div className="p-6 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
      <h2 className="text-3xl font-bold mb-6 text-indigo-700 dark:text-indigo-400">Trip Planning Tools</h2>
      
      {/* Budget Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Budget Summary</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="mr-2">Currency:</span>
              <select 
                value={currency} 
                onChange={handleCurrencyChange}
                className="bg-gray-100 dark:bg-gray-700 border-0 rounded-md p-2"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
            <div className="flex items-center">
              <span className="mr-2">Total Budget:</span>
              <input 
                type="number" 
                value={budget} 
                onChange={(e) => setBudget(Number(e.target.value))}
                className="bg-gray-100 dark:bg-gray-700 border-0 rounded-md p-2 w-32"
              />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">Total Budget</p>
            <p className="text-2xl font-bold">{formatCurrency(budget)}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300">Total Expenses</p>
            <p className="text-2xl font-bold">{formatCurrency(totalTripCost)}</p>
          </div>
          <div className={`p-4 rounded-lg ${budgetRemaining >= 0 ? 'bg-green-50 dark:bg-green-900/30' : 'bg-red-50 dark:bg-red-900/30'}`}>
            <p className="text-sm">Remaining Budget</p>
            <p className={`text-2xl font-bold ${budgetRemaining >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
              {formatCurrency(Math.abs(budgetRemaining))} {budgetRemaining < 0 ? 'Over Budget' : ''}
            </p>
          </div>
        </div>
        
        {/* Budget Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-1">
            <span>0</span>
            <span>{formatCurrency(budget)}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
            <div 
              className={`h-4 rounded-full ${totalTripCost <= budget ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ width: `${Math.min(100, (totalTripCost / budget) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Itinerary Cards */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold">Itinerary</h3>
          <div className="flex space-x-4">
            <button 
              onClick={() => setShowAddActivity(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Activity
            </button>
          </div>
        </div>
        
        <div className="space-y-6">
          {itinerary.map((day) => (
            <div key={day.day} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <div className="bg-indigo-100 dark:bg-indigo-900/40 p-4 flex justify-between items-center">
                <h3 className="font-semibold text-lg">Day {day.day} - {new Date(day.date).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
                <div className="font-medium">{formatCurrency(day.totalCost)}</div>
              </div>
              <div className="p-4 space-y-4">
                {day.activities.map((act) => (
                  <div
                    key={act.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mr-3 border ${tagColors[act.type]}`}
                          >
                            {act.type.charAt(0).toUpperCase() + act.type.slice(1)}
                          </span>
                          <span className="font-medium text-gray-500 dark:text-gray-400">{act.time}</span>
                          {act.rating > 0 && (
                            <div className="flex items-center ml-4">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">{act.rating}</span>
                            </div>
                          )}
                        </div>
                        <h4 className="text-lg font-semibold mb-1">{act.name}</h4>
                        {act.location && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            {act.location}
                          </p>
                        )}
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <span className="mr-4 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            {act.duration}
                          </span>
                          <span className="font-medium text-green-600 dark:text-green-500">{formatCurrency(act.cost)}</span>
                        </div>
                        {act.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-750 p-2 rounded-md">{act.notes}</p>
                        )}
                      </div>
                      <button 
                        onClick={() => handleDeleteActivity(day.day, act.id)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Activity Modal */}
      {showAddActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold">Add New Activity</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Day</label>
                <select 
                  value={selectedDay} 
                  onChange={(e) => setSelectedDay(Number(e.target.value))}
                  className="w-full bg-gray-100 dark:bg-gray-700 border-0 rounded-md p-2"
                >
                  {itinerary.map(day => (
                    <option key={day.day} value={day.day}>Day {day.day}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Activity Type</label>
                <select 
                  value={newActivity.type} 
                  onChange={(e) => setNewActivity({...newActivity, type: e.target.value})}
                  className="w-full bg-gray-100 dark:bg-gray-700 border-0 rounded-md p-2"
                >
                  <option value="sightseeing">Sightseeing</option>
                  <option value="food">Food</option>
                  <option value="travel">Travel</option>
                  <option value="shopping">Shopping</option>
                  <option value="accommodation">Accommodation</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time</label>
                <input 
                  type="text" 
                  value={newActivity.time} 
                  onChange={(e) => setNewActivity({...newActivity, time: e.target.value})}
                  placeholder="09:00 AM"
                  className="w-full bg-gray-100 dark:bg-gray-700 border-0 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Activity Name *</label>
                <input 
                  type="text" 
                  value={newActivity.name} 
                  onChange={(e) => setNewActivity({...newActivity, name: e.target.value})}
                  placeholder="Visit Taj Mahal"
                  className="w-full bg-gray-100 dark:bg-gray-700 border-0 rounded-md p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input 
                  type="text" 
                  value={newActivity.location} 
                  onChange={(e) => setNewActivity({...newActivity, location: e.target.value})}
                  placeholder="Agra, Uttar Pradesh"
                  className="w-full bg-gray-100 dark:bg-gray-700 border-0 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duration</label>
                <input 
                  type="text" 
                  value={newActivity.duration} 
                  onChange={(e) => setNewActivity({...newActivity, duration: e.target.value})}
                  placeholder="2 hours"
                  className="w-full bg-gray-100 dark:bg-gray-700 border-0 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cost (₹)</label>
                <input 
                  type="number" 
                  value={newActivity.cost} 
                  onChange={(e) => setNewActivity({...newActivity, cost: Number(e.target.value)})}
                  className="w-full bg-gray-100 dark:bg-gray-700 border-0 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea 
                  value={newActivity.notes} 
                  onChange={(e) => setNewActivity({...newActivity, notes: e.target.value})}
                  placeholder="Any special notes or reminders"
                  className="w-full bg-gray-100 dark:bg-gray-700 border-0 rounded-md p-2"
                  rows={3}
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button 
                onClick={() => setShowAddActivity(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddActivity}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                disabled={!newActivity.name}
              >
                Add Activity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-8">
        <h3 className="text-xl font-semibold mb-4">Trip Calendar</h3>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={calendarEvents}
          height={500}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          eventContent={(eventInfo) => (
            <div className="flex flex-col p-1">
              <div className="font-medium text-sm truncate">{eventInfo.event.title}</div>
              <div className="text-xs">
                {formatCurrency(eventInfo.event.extendedProps.cost)}
              </div>
            </div>
          )}
        />
      </div>

      {/* Map placeholder */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-semibold mb-4">Map View</h3>
        <div className="w-full h-96 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 opacity-20"></div>
          <div className="z-10 text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <h4 className="font-medium text-lg mb-2">Map Integration</h4>
            <p className="text-gray-600 dark:text-gray-400">Interactive map would show here with markers for each activity location.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TripPlanningTools;