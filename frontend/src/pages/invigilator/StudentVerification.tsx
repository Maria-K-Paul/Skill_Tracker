import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

interface StudentVerificationProps {
  student: {
    name: string;
    rollNumber: string;
    photoUrl: string;
    domain: string;
    level: string;
  }
}

export function StudentVerification({ student }: StudentVerificationProps) {
  return (
    <Card>
      <CardContent className="flex items-center space-x-6 p-6">
        <img 
          src={student.photoUrl} 
          alt={student.name} 
          className="h-24 w-24 rounded-lg object-cover bg-muted"
        />
        <div className="flex-1">
          <h3 className="text-2xl font-bold">{student.name}</h3>
          <p className="text-muted-foreground mb-3">{student.rollNumber}</p>
          <div className="flex space-x-2">
            <Badge>{student.domain}</Badge>
            <Badge variant="secondary">{student.level}</Badge>
            <Badge variant="outline" className="border-green-500 text-green-600">Booking Verified</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
