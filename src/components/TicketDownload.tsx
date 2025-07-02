
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface TicketDownloadProps {
  booking: {
    id: string;
    event_title: string;
    booking_date: string;
    show_time: string;
    venue?: string;
    location: string;
    screen_hall?: string;
    seats?: string[];
    ticket_quantity: number;
    total_amount: number;
    event_type: string;
  };
}

const TicketDownload = ({ booking }: TicketDownloadProps) => {
  const generateTicketHTML = () => {
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${booking.id}`;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>BookIt Ticket - ${booking.event_title}</title>
          <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }

              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 5vw;
              }

              .ticket {
                background: white;
                border-radius: 20px;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
                overflow: hidden;
                width: 100%;
                max-width: 600px;
                position: relative;
              }

              .ticket::before,
              .ticket::after {
                content: '';
                position: absolute;
                top: 50%;
                width: 20px;
                height: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 50%;
                transform: translateY(-50%);
              }

              .ticket::before {
                left: -10px;
              }

              .ticket::after {
                right: -10px;
              }

              .ticket-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                text-align: center;
              }

              .logo {
                font-size: clamp(24px, 5vw, 32px);
                font-weight: bold;
                margin-bottom: 8px;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
              }

              .ticket-type {
                background: rgba(255, 255, 255, 0.2);
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 600;
                display: inline-block;
              }

              .ticket-body {
                padding: 20px;
                display: flex;
                flex-direction: column;
                gap: 24px;
                border-bottom: 2px dashed #e2e8f0;
              }

              @media (min-width: 600px) {
                .ticket-body {
                  flex-direction: row;
                }
              }

              .event-details h2 {
                font-size: clamp(20px, 5vw, 28px);
                color: #1a202c;
                margin-bottom: 20px;
                font-weight: bold;
              }

              .detail-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0;
                border-bottom: 1px solid #f7fafc;
                font-size: clamp(12px, 3vw, 14px);
              }

              .detail-row:last-child {
                border-bottom: none;
              }

              .detail-label {
                font-weight: 600;
                color: #4a5568;
              }

              .detail-value {
                font-weight: bold;
                color: #1a202c;
              }

              .qr-section {
                text-align: center;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
              }

              .qr-code {
                max-width: 150px;
                width: 100%;
                height: auto;
                border: 3px solid #667eea;
                border-radius: 12px;
                margin-bottom: 10px;
              }

              .booking-id {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                color: #718096;
                word-break: break-word;
                margin-top: 8px;
              }

              .ticket-footer {
                padding: 16px 20px;
                background: #f8fafc;
                text-align: center;
                color: #718096;
                font-size: 12px;
                line-height: 1.5;
              }

              .amount-highlight {
                background: linear-gradient(135deg, #48bb78, #38a169);
                color: white;
                padding: 4px 10px;
                border-radius: 8px;
                font-weight: bold;
              }

              .perforated-line {
                margin: 0 -20px;
                height: 2px;
                background: repeating-linear-gradient(
                  to right,
                  #e2e8f0 0px,
                  #e2e8f0 10px,
                  transparent 10px,
                  transparent 20px
                );
              }

              @media print {
                body {
                  background: white;
                  padding: 0;
                }

                .ticket {
                  box-shadow: none;
                  max-width: none;
                }
              }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="ticket-header">
              <div class="logo">BookIt</div>
              <div class="ticket-type">${booking.event_type.toUpperCase()} TICKET</div>
            </div>
            
            <div class="ticket-body">
              <div class="event-details">
                <h2>${booking.event_title}</h2>
                
                <div class="detail-row">
                  <span class="detail-label">Date & Time</span>
                  <span class="detail-value">${new Date(booking.booking_date).toLocaleDateString()} at ${booking.show_time}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Venue</span>
                  <span class="detail-value">${booking.venue || 'TBA'}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Location</span>
                  <span class="detail-value">${booking.location}</span>
                </div>
                
                ${booking.screen_hall ? `
                <div class="detail-row">
                  <span class="detail-label">Screen/Hall</span>
                  <span class="detail-value">${booking.screen_hall}</span>
                </div>` : ''}
                
                ${booking.seats && booking.seats.length > 0 ? `
                <div class="detail-row">
                  <span class="detail-label">Seats</span>
                  <span class="detail-value">${booking.seats.join(', ')}</span>
                </div>` : ''}
                
                <div class="detail-row">
                  <span class="detail-label">Quantity</span>
                  <span class="detail-value">${booking.ticket_quantity} Ticket${booking.ticket_quantity > 1 ? 's' : ''}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Total Amount</span>
                  <span class="detail-value amount-highlight">₹${booking.total_amount.toFixed(2)}</span>
                </div>
              </div>
              
              <div class="qr-section">
                <img src="${qrCodeUrl}" alt="QR Code" class="qr-code" width="150" height="150">
                <div style="font-weight: bold; color: #4a5568;">Scan to Verify</div>
                <div class="booking-id">ID: ${booking.id.substring(0, 8).toUpperCase()}</div>
              </div>
            </div>
            
            <div class="ticket-footer">
              <strong>Important:</strong> Please carry a valid ID proof along with this ticket.<br>
              This ticket is non-transferable and non-refundable.<br>
              For support, contact BookIt customer service.
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const downloadTicket = () => {
    const ticketHTML = generateTicketHTML();
    const blob = new Blob([ticketHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BookIt_Ticket_${booking.event_title.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Ticket downloaded successfully!");
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={downloadTicket}
      className="border-green-500/30 text-green-500 hover:bg-green-500/20 hover:text-white"
    >
      <Download className="h-4 w-4 mr-2" />
      Download Ticket
    </Button>
  );
};

export default TicketDownload;
