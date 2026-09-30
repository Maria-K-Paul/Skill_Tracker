import { useState, useRef, useEffect } from "react";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card, CardContent } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Download } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const MOCK_STUDENTS_FOR_SLOT = [
  { name: "Alice Johnson", roll: "22CS101", semester: 4, domain: "Full Stack", level: "Entrance Test", keyA: "A1B2C3D4" },
  { name: "Bob Smith", roll: "22CS102", semester: 4, domain: "Cybersecurity", level: "Level 1", keyA: "X9Y8Z7W6" },
  { name: "Charlie Davis", roll: "21CS088", semester: 6, domain: "Cloud & DevOps", level: "Entrance Test", keyA: "M5N4P3Q2" },
  { name: "Diana Prince", roll: "22IT056", semester: 4, domain: "AI / ML", level: "Level 3", keyA: "K8L7J6H5" },
];

export function InvigilatorManagement() {
  const [slots, setSlots] = useState<any[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const [currentSlotForPdf, setCurrentSlotForPdf] = useState<any | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("mockGlobalSlots");
    if (saved) {
      setSlots(JSON.parse(saved));
    } else {
      const defaultSlots = [
        { id: "S1", date: "Oct 15, 2026", time: "10:00 AM", venue: "Lab 4, CS Block", capacity: 50 },
        { id: "S2", date: "Oct 15, 2026", time: "02:00 PM", venue: "Lab 2, IT Block", capacity: 50 },
        { id: "S3", date: "Oct 16, 2026", time: "10:00 AM", venue: "Lab 1, CS Block", capacity: 50 },
      ];
      setSlots(defaultSlots);
      localStorage.setItem("mockGlobalSlots", JSON.stringify(defaultSlots));
    }
  }, []);

  const handleDownloadPdf = (slot: any) => {
    setCurrentSlotForPdf(slot);
    setDownloadingId(slot.id);
    
    // Give React a tick to render the hidden DOM before capturing
    setTimeout(async () => {
      if (!printRef.current) return;
      try {
        const canvas = await html2canvas(printRef.current, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Invigilator_Roster_${slot.id}.pdf`);
      } catch (e) {
        console.error("PDF Error", e);
      } finally {
        setDownloadingId(null);
        setCurrentSlotForPdf(null);
      }
    }, 100);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader 
        title="Invigilator & Slots" 
        description="Admin view of all exam slots and roster generation."
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Seats</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slots.map((slot) => {
                const filled = Math.floor(Math.random() * slot.capacity); // mock fill count
                return (
                  <TableRow key={slot.id}>
                    <TableCell>
                      <div className="font-medium">{slot.date}</div>
                      <div className="text-sm text-muted-foreground">{slot.time}</div>
                    </TableCell>
                    <TableCell>{slot.venue}</TableCell>
                    <TableCell>
                      <Badge variant={filled >= slot.capacity ? "destructive" : "secondary"}>
                        {filled} / {slot.capacity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadPdf(slot)}
                        disabled={downloadingId === slot.id}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        {downloadingId === slot.id ? "Generating..." : "Roster PDF"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {slots.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No slots configured.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {currentSlotForPdf && (
        <div className="absolute left-[-9999px] top-[-9999px]">
          <div ref={printRef} className="w-[800px] bg-white p-12 text-black font-sans">
            <div className="text-center mb-8 border-b-2 border-slate-300 pb-6">
              <h1 className="text-3xl font-bold uppercase tracking-wider text-slate-900">Exam Roster</h1>
              <h2 className="text-xl text-slate-600 mt-2">Invigilator Reference Copy</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-8 text-lg bg-slate-50 p-6 rounded-lg border border-slate-200">
              <div>
                <p className="mb-2"><strong className="text-slate-600">Date:</strong> {currentSlotForPdf.date}</p>
                <p className="mb-2"><strong className="text-slate-600">Time:</strong> {currentSlotForPdf.time}</p>
              </div>
              <div>
                <p className="mb-2"><strong className="text-slate-600">Venue:</strong> {currentSlotForPdf.venue}</p>
                <p><strong className="text-slate-600">Capacity:</strong> {currentSlotForPdf.capacity} Students</p>
              </div>
            </div>

            <table className="w-full text-left border-collapse border border-slate-300 text-sm">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 p-2 font-semibold text-slate-700">Roll No</th>
                  <th className="border border-slate-300 p-2 font-semibold text-slate-700">Name</th>
                  <th className="border border-slate-300 p-2 font-semibold text-slate-700">Domain & Level</th>
                  <th className="border border-slate-300 p-2 font-semibold text-slate-700">Exam Key (A)</th>
                  <th className="border border-slate-300 p-2 font-semibold text-slate-700">Signature</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_STUDENTS_FOR_SLOT.map((stu, i) => (
                  <tr key={i}>
                    <td className="border border-slate-300 p-2">{stu.roll}</td>
                    <td className="border border-slate-300 p-2 font-medium">{stu.name}</td>
                    <td className="border border-slate-300 p-2 text-xs">{stu.domain} - {stu.level}</td>
                    <td className="border border-slate-300 p-2 font-mono font-bold tracking-wider">{stu.keyA}</td>
                    <td className="border border-slate-300 p-2 w-24"></td>
                  </tr>
                ))}
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`empty-${i}`}>
                    <td className="border border-slate-300 p-2 text-transparent">-</td>
                    <td className="border border-slate-300 p-2"></td>
                    <td className="border border-slate-300 p-2"></td>
                    <td className="border border-slate-300 p-2"></td>
                    <td className="border border-slate-300 p-2"></td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="mt-12 text-sm text-slate-500 border-t border-slate-300 pt-6">
              <p>CONFIDENTIAL: This document contains secure access keys. Do not leave unattended.</p>
              <p>Generated at: {new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
