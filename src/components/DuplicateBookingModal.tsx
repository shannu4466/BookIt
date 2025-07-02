
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Ticket } from "lucide-react";

interface DuplicateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  eventTitle: string;
  bookingDate: string;
  showTime: string;
}

const location = localStorage.getItem("selectedLocation")

const DuplicateBookingModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  eventTitle, 
  bookingDate, 
  showTime, 
}: DuplicateBookingModalProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-gradient-to-br from-slate-900 to-purple-900 border-purple-500/30 text-white max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold text-center mb-4">
            Duplicate Booking Detected
          </AlertDialogTitle>
          
          <Card className="bg-white/10 backdrop-blur-xl border-purple-500/20 mb-4">
            <CardContent className="p-4">
              <h4 className="font-bold text-lg mb-3 text-purple-300">{eventTitle}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-400" />
                  <span className="text-white">{bookingDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-400" />
                  <span className="text-white">{showTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-purple-400" />
                  <span className="text-white">{location}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <AlertDialogDescription className="text-center text-gray-300">
            You already have a booking for this event at the same date and time. 
            Would you like to proceed with creating another booking for the same event?
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="flex gap-3">
          <AlertDialogCancel 
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white border-gray-500 hover:text-white"
          >
            Cancel Booking
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Ticket className="h-4 w-4 mr-2" />
            Book Again
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DuplicateBookingModal;
