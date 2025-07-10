import React, { createContext, useContext, useState } from 'react';

const TicketContext = createContext();

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
};

export const TicketProvider = ({ children }) => {
  const [tickets, setTickets] = useState([]);
  const [currentTicket, setCurrentTicket] = useState(null);

  const generateTicketNumber = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const submitTicket = (formData) => {
    const newTicket = {
      ...formData,
      ticketNumber: generateTicketNumber(),
      status: 'Open',
      createdAt: new Date().toISOString()
    };

    setTickets(prev => [...prev, newTicket]);
    setCurrentTicket(newTicket);
  };

  return (
    <TicketContext.Provider value={{ tickets, currentTicket, submitTicket }}>
      {children}
    </TicketContext.Provider>
  );
};
