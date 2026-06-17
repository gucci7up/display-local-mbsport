import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import TicketPage from './TicketPage';
import './ticket.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TicketPage />
  </StrictMode>,
);
