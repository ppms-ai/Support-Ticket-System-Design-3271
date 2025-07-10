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
      ticket_number: generateTicketNumber(),
      status: 'Open',
      created_at: new Date().toISOString(),
      notes: []
    };

    setTickets(prev => [...prev, newTicket]);
    setCurrentTicket(newTicket);
  };

  const updateTicket = (ticketId, updates) => {
    setTickets(prev =>
      prev.map(ticket =>
        ticket.ticket_number === ticketId
          ? { ...ticket, ...updates }
          : ticket
      )
    );
  };

  const addNote = (ticketId, noteText) => {
    setTickets(prev =>
      prev.map(ticket =>
        ticket.ticket_number === ticketId
          ? {
              ...ticket,
              notes: [
                ...(ticket.notes || []),
                {
                  id: Date.now(),
                  text: noteText,
                  created_at: new Date().toISOString(),
                  author: 'Admin'
                }
              ]
            }
          : ticket
      )
    );
  };

  const sendCustomerNote = async (ticketId, noteText, isPublic = false) => {
    // Placeholder for future email logic
    console.log('Sending email for ticket:', ticketId, noteText, isPublic);
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
        sendCustomerNote,
        getTicketStats
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};
