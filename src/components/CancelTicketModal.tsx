
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, AlertTriangle } from "lucide-react";

interface CancelTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  eventTitle: string;
  bookingDate: string;
  showTime: string;
  totalAmount: number;
}

const CancelTicketModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  eventTitle, 
  bookingDate, 
  showTime, 
  totalAmount 
}: CancelTicketModalProps) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    await onConfirm();
    setIsConfirming(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-white/10 backdrop-blur-xl border-red-500/30 max-w-md w-full">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-2 top-2 text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-3">
            <div className="bg-red-500/20 p-2 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <CardTitle className="text-white">Cancel Ticket</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-gray-300">
            <p className="mb-4">Are you sure you want to cancel your ticket for:</p>
            
            <div className="bg-white/5 rounded-lg p-4 space-y-2">
              <h4 className="text-white font-semibold">{eventTitle}</h4>
              <p className="text-sm text-gray-400">
                {new Date(bookingDate).toLocaleDateString()} at {showTime}
              </p>
              <p className="text-sm text-green-400 font-semibold">
                Amount: ₹{totalAmount.toFixed(2)}
              </p>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-300 text-sm">
                <strong>Cancellation Policy:</strong> 
                Cancellation charges may apply. Refund will be processed within 5-7 business days.
              </p>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-500/30 text-black hover:bg-gray-500/20"
              disabled={isConfirming}
            >
              Keep Ticket
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isConfirming}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
            >
              {isConfirming ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Cancelling...
                </div>
              ) : (
                "Cancel Ticket"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CancelTicketModal;
