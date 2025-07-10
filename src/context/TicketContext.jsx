import React, { createContext, useContext, useState } from 'react';

const TicketContext = createContext();
export const useTickets = () => {
  const ctx = useContext(TicketContext);
  if (!ctx) throw new Error('useTickets must be used within a TicketProvider');
  return ctx;
};

export const TicketProvider = ({ children }) => {
  const [tickets, setTickets] = useState([]);
  const [currentTicket, setCurrentTicket] = useState(null);

  const generateTicketNumber = () => {
    // e.g. "SUP-123456"
    return 'SUP-' + Math.floor(100000 + Math.random() * 900000);
  };

  const submitTicket = (formData) => {
    const newTicket = {
      ...formData,
      ticketNumber: generateTicketNumber(),
      status: 'Open',
      createdAt: new Date().toISOString(),
      notes: []
    };
    // if you later wire up an API, await it here...
    setTickets(prev => [...prev, newTicket]);
    setCurrentTicket(newTicket);
    return newTicket;
  };

  const updateTicket = (ticketNumber, updates) => {
    setTickets(prev =>
      prev.map(t =>
        t.ticketNumber === ticketNumber ? { ...t, ...updates } : t
      )
    );
  };

  const addNote = (ticketNumber, text) => {
    setTickets(prev =>
      prev.map(t =>
        t.ticketNumber === ticketNumber
          ? {
              ...t,
              notes: [
                ...(t.notes || []),
                { id: Date.now(), text, createdAt: new Date().toISOString(), author: 'Admin' }
              ]
            }
          : t
      )
    );
  };

  const getTicketStats = () => {
  return {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'Open').length,
    inProgress: tickets.filter(t => t.status === 'In Progress').length,
    resolved: tickets.filter(t => t.status === 'Resolved').length,
    closed: tickets.filter(t => t.status === 'Closed').length
  };
};

return (
  <TicketContext.Provider
    value={{
      tickets,
      currentTicket,
      submitTicket,
      updateTicket,
      addNote,
      getTicketStats,
    }}
  >
    {children}
  </TicketContext.Provider>
);
};
