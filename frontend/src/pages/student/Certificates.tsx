import { useState, useRef, useEffect } from "react";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Award, Download, CheckCircle, QrCode } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { FlipCard } from "../../components/ui/flip-card";

export function Certificates() {
  const { user } = useAuth();
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [certificates, setCertificates] = useState<any[]>([]);
  const [selectedCert, setSelectedCert] = useState<any>(null);

  useEffect(() => {
    if (user) {
      const existingStr = localStorage.getItem(`mockResults_${user.id}`);
      if (existingStr) {
        try {
        const stored = JSON.parse(existingStr);
        const passedTests = Array.isArray(stored) ? stored.filter((r: any) => r.passed) : [];
        
        const mappedCerts = passedTests.map((t: any) => ({
          id: t.id ? t.id.replace("t", "CERT-9982-") : "CERT-9982-UNKNOWN",
          level: t.name || "Unknown",
          date: t.date ? new Date(t.date).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }) : "Unknown Date",
          domain: t.domain || "Unknown"
        }));
        
        setCertificates(mappedCerts);
      } catch(e) {
        // ignore
      }
    }
    }
  }, [user]);

  const handleDownload = async (cert: typeof certificates[0]) => {
    setSelectedCert(cert);
    // Give state time to update the hidden DOM before generating
    setTimeout(async () => {
      if (!certificateRef.current) return;
      setIsGenerating(true);
      
      try {
        const canvas = await html2canvas(certificateRef.current, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: "a4"
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`SkillTrack_${cert.id}.pdf`);
      } catch (error) {
        console.error("Error generating PDF", error);
      } finally {
        setIsGenerating(false);
      }
    }, 100);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader 
        title="Your Certificates" 
        description="Verified credentials you have earned on SkillTrack."
      />

      <div className="grid gap-6 md:grid-cols-2">
        {certificates.map(cert => (
          <FlipCard
            key={cert.id}
            axis="y"
            trigger="hover"
            className="h-[280px]"
            front={
              <Card className="h-full w-full overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
                <CardContent className="p-0 flex flex-col h-full">
                  <div className="p-6 flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
                        <Award className="h-6 w-6" />
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-mono text-muted-foreground">{cert.id}</div>
                        <div className="flex items-center justify-end text-xs text-success mt-1 font-medium">
                          <CheckCircle className="mr-1 h-3 w-3" /> Verified
                        </div>
                      </div>
                    </div>
                    <div className="mt-6">
                      <h3 className="text-2xl font-bold tracking-tight text-primary">{cert.level}</h3>
                      <p className="text-sm font-medium mt-1">{cert.domain}</p>
                    </div>
                  </div>
                  <div className="bg-primary/5 px-6 py-4 flex items-center justify-between border-t border-primary/10 text-xs text-muted-foreground">
                    <span>Issued: {cert.date}</span>
                    <span className="flex items-center">Hover for details &rarr;</span>
                  </div>
                </CardContent>
              </Card>
            }
            back={
              <Card className="h-full w-full overflow-hidden border-2 border-primary bg-card shadow-lg">
                <CardContent className="p-0 flex flex-col h-full">
                  <div className="p-6 flex-1 flex flex-col items-center justify-center text-center space-y-4">
                    <QrCode className="h-16 w-16 text-primary" />
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Credential ID</div>
                      <div className="text-base font-mono font-bold mt-1">{cert.id}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full">
                      <div>
                        <div className="text-xs text-muted-foreground">Issue Date</div>
                        <div className="text-sm font-semibold">{cert.date}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Score</div>
                        <div className="text-sm font-semibold text-success">Passed</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-primary/10 px-6 py-4 flex justify-end">
                    {/* Use stopPropagation to prevent hover glitches or unexpected flips during click if trigger was click */}
                    <div onClick={e => e.stopPropagation()}>
                      <Button size="sm" onClick={() => handleDownload(cert)} disabled={isGenerating}>
                        <Download className="mr-2 h-4 w-4" /> {isGenerating ? "Generating..." : "Download PDF"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            }
          />
        ))}
        {certificates.length === 0 && (
           <div className="col-span-full py-12 text-center text-muted-foreground">
             You haven't earned any certificates yet. Clear entrance and level tests to earn them!
           </div>
        )}
      </div>

      {/* Hidden Certificate Template for PDF Generation */}
      {selectedCert && (
        <div className="overflow-hidden h-0 w-0 absolute left-[-9999px]">
          <div 
            ref={certificateRef}
            className="bg-white text-slate-900 w-[1123px] h-[794px] p-12 box-border relative flex flex-col justify-center items-center"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {/* Decorative Border */}
            <div className="absolute inset-8 border-4 border-slate-200"></div>
            <div className="absolute inset-10 border border-slate-300"></div>
            
            <div className="text-center z-10 w-full px-20 flex flex-col items-center">
              <div className="text-primary mb-6 flex justify-center">
                <Award className="w-20 h-20 text-primary" />
              </div>
              
              <h1 className="text-5xl font-serif text-slate-800 tracking-wider mb-2 uppercase">
                Certificate of Achievement
              </h1>
              <h2 className="text-xl text-slate-500 uppercase tracking-widest mb-12">
                SkillTrack Institution
              </h2>
              
              <p className="text-lg italic text-slate-600 mb-6">This is to certify that</p>
              <p className="text-4xl font-bold text-slate-900 mb-6 font-serif border-b-2 border-slate-300 pb-2 inline-block px-12">
                {user?.name || "Student Name"}
              </p>
              
              <p className="text-lg italic text-slate-600 mb-4">has successfully completed the assessment for</p>
              <p className="text-3xl font-bold text-primary mb-2">
                {selectedCert.level}
              </p>
              <p className="text-xl font-semibold text-slate-700 mb-12">
                in {selectedCert.domain}
              </p>
              
              <div className="w-full flex justify-between items-end mt-12 px-12">
                <div className="flex flex-col items-center">
                  <div className="w-48 h-0 border-b border-slate-400 mb-2"></div>
                  <p className="text-sm font-semibold uppercase text-slate-500">Authorized Signature</p>
                </div>
                
                <div className="flex flex-col items-center">
                  <QrCode className="w-24 h-24 text-slate-800 mb-2" />
                  <p className="text-xs font-mono text-slate-500">ID: {selectedCert.id}</p>
                  <p className="text-xs font-mono text-slate-500">Date: {selectedCert.date}</p>
                </div>
              </div>
            </div>
            
            {/* Subtle background graphics */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-br-full -z-10"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/10 rounded-tl-full -z-10"></div>
          </div>
        </div>
      )}
    </div>
  );
}
