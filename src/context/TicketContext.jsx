import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import supabase from '../lib/supabase';

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
  const [loading, setLoading] = useState(false);

  // Load tickets from Supabase
  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('support_tickets_hub2024')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading tickets:', error);
        // Fallback to localStorage if Supabase fails
        const savedTickets = localStorage.getItem('support_tickets');
        if (savedTickets) {
          setTickets(JSON.parse(savedTickets));
        }
      } else {
        setTickets(data || []);
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitTicket = async (ticketData) => {
    try {
      const newTicket = {
        id: uuidv4(),
        ticket_number: `SUP-${Date.now().toString().slice(-6)}`,
        name: ticketData.name,
        email: ticketData.email,
        subject: ticketData.subject,
        description: ticketData.description,
        priority: ticketData.priority,
        business: ticketData.business,
        status: 'Open',
        assignee: null,
        notes: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Save to Supabase
      const { data, error } = await supabase
        .from('support_tickets_hub2024')
        .insert([newTicket])
        .select()
        .single();

      if (error) {
        console.error('Error saving ticket:', error);
        throw error;
      }

      // Update local state
      setTickets(prev => [data, ...prev]);
      setCurrentTicket(data);

      // Send email notifications
      await sendEmailNotifications(data);

      return data;
    } catch (error) {
      console.error('Error submitting ticket:', error);
      throw error;
    }
  };

  const updateTicket = async (ticketId, updates) => {
    try {
      const oldTicket = tickets.find(t => t.id === ticketId);
      const { data, error } = await supabase
        .from('support_tickets_hub2024')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId)
        .select()
        .single();

      if (error) {
        console.error('Error updating ticket:', error);
        return;
      }

      setTickets(prev =>
        prev.map(ticket =>
          ticket.id === ticketId ? data : ticket
        )
      );

      // Send customer update email if status changed
      if (oldTicket && oldTicket.status !== data.status) {
        await sendCustomerUpdateEmail(data, oldTicket.status);
      }

      return data;
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  const addNote = async (ticketId, noteText) => {
    try {
      const ticket = tickets.find(t => t.id === ticketId);
      if (!ticket) return;

      const newNote = {
        id: uuidv4(),
        text: noteText,
        author: 'Admin',
        created_at: new Date().toISOString()
      };

      const updatedNotes = [...(ticket.notes || []), newNote];

      const { data, error } = await supabase
        .from('support_tickets_hub2024')
        .update({
          notes: updatedNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId)
        .select()
        .single();

      if (error) {
        console.error('Error adding note:', error);
        return;
      }

      setTickets(prev =>
        prev.map(ticket =>
          ticket.id === ticketId ? data : ticket
        )
      );

      return data;
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const findTicket = (ticketNumber, email) => {
    return tickets.find(ticket =>
      ticket.ticket_number === ticketNumber &&
      ticket.email.toLowerCase() === email.toLowerCase()
    );
  };

  const getTicketStats = () => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'Open').length;
    const inProgress = tickets.filter(t => t.status === 'In Progress').length;
    const resolved = tickets.filter(t => t.status === 'Resolved').length;
    const closed = tickets.filter(t => t.status === 'Closed').length;

    return { total, open, inProgress, resolved, closed };
  };

  const sendEmailNotifications = async (ticket) => {
    try {
      // Send admin notification
      await supabase.functions.invoke('send-notification', {
        body: {
          type: 'new_ticket',
          ticket: ticket
        }
      });

      // Send customer confirmation
      await supabase.functions.invoke('send-notification', {
        body: {
          type: 'ticket_confirmation',
          ticket: ticket,
          recipient: ticket.email
        }
      });
    } catch (error) {
      console.error('Error sending email notifications:', error);
    }
  };

  const sendCustomerUpdateEmail = async (ticket, oldStatus) => {
    try {
      let emailType = 'ticket_update';
      
      // Use specific template for resolved tickets
      if (ticket.status === 'Resolved') {
        emailType = 'ticket_resolved';
      }

      await supabase.functions.invoke('send-notification', {
        body: {
          type: emailType,
          ticket: ticket,
          recipient: ticket.email,
          oldStatus: oldStatus
        }
      });
    } catch (error) {
      console.error('Error sending customer update email:', error);
    }
  };

  const sendCustomerNote = async (ticketId, noteText, isPublic = false) => {
    try {
      if (!isPublic) return;

      const ticket = tickets.find(t => t.id === ticketId);
      if (!ticket) return;

      await supabase.functions.invoke('send-notification', {
        body: {
          type: 'ticket_update',
          ticket: ticket,
          recipient: ticket.email,
          updateMessage: noteText
        }
      });
    } catch (error) {
      console.error('Error sending customer note:', error);
    }
  };

  return (
    <TicketContext.Provider
      value={{
        tickets,
        currentTicket,
        loading,
        setCurrentTicket,
        submitTicket,
        updateTicket,
        addNote,
        findTicket,
        getTicketStats,
        loadTickets,
        sendCustomerNote
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};