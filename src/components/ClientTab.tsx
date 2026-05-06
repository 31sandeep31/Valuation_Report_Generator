import { ValuationReport } from "../types";

interface Props {
  report: ValuationReport;
  onChange: (next: ValuationReport) => void;
}

export default function ClientTab({ report, onChange }: Props) {
  const set = (patch: Partial<ValuationReport>) => onChange({ ...report, ...patch });
  const setBank = (k: keyof ValuationReport["bank"], v: string) =>
    onChange({ ...report, bank: { ...report.bank, [k]: v } });
  const setEng = (k: keyof ValuationReport["engineer"], v: string) =>
    onChange({ ...report, engineer: { ...report.engineer, [k]: v } });
  const setSub = (k: keyof ValuationReport["submitter"], v: string) =>
    onChange({ ...report, submitter: { ...report.submitter, [k]: v } });

  return (
    <div>
      <div className="section-title">JOB</div>
      <div className="field-grid two">
        <label>Job / output filename prefix</label>
        <input type="text" value={report.jobName}
               onChange={(e) => set({ jobName: e.target.value })} />
      </div>

      <div className="section-title">CLIENT</div>
      <div className="field-grid">
        <label>Client name</label>
        <input type="text" value={report.clientName}
               onChange={(e) => set({ clientName: e.target.value })} />
        <label>Report date</label>
        <input type="text" value={report.reportDate} placeholder="15 July, 2025"
               onChange={(e) => set({ reportDate: e.target.value })} />

        <label>Client address</label>
        <input type="text" value={report.clientAddress}
               onChange={(e) => set({ clientAddress: e.target.value })} />
        <label>Visit date</label>
        <input type="text" value={report.visitDate} placeholder="10 July, 2025"
               onChange={(e) => set({ visitDate: e.target.value })} />

        <label>Phone</label>
        <input type="text" value={report.clientPhone}
               onChange={(e) => set({ clientPhone: e.target.value })} />
        <label>Property type</label>
        <input type="text" value={report.propertyType}
               onChange={(e) => set({ propertyType: e.target.value })} />

        <label>Property owner</label>
        <input type="text" value={report.ownerName}
               onChange={(e) => set({ ownerName: e.target.value })} />
        <label></label><span></span>
      </div>

      <div className="section-title">BANK</div>
      <div className="field-grid two">
        <label>Bank name</label>
        <input type="text" value={report.bank.name}
               onChange={(e) => setBank("name", e.target.value)} />
        <label>Bank branch</label>
        <input type="text" value={report.bank.branch}
               onChange={(e) => setBank("branch", e.target.value)} />
      </div>

      <div className="section-title">ENGINEER (Signatory)</div>
      <div className="field-grid">
        <label>Name</label>
        <input type="text" value={report.engineer.name}
               onChange={(e) => setEng("name", e.target.value)} />
        <label>Title</label>
        <input type="text" value={report.engineer.title}
               onChange={(e) => setEng("title", e.target.value)} />
        <label>NEC Reg. No.</label>
        <input type="text" value={report.engineer.necRegd}
               onChange={(e) => setEng("necRegd", e.target.value)} />
        <label></label><span></span>
      </div>

      <div className="section-title">SUBMITTER (Consultancy)</div>
      <div className="field-grid">
        <label>Name</label>
        <input type="text" value={report.submitter.name}
               onChange={(e) => setSub("name", e.target.value)} />
        <label>Address</label>
        <input type="text" value={report.submitter.address}
               onChange={(e) => setSub("address", e.target.value)} />
        <label>Contact</label>
        <input type="text" value={report.submitter.contact}
               onChange={(e) => setSub("contact", e.target.value)} />
        <label>Email</label>
        <input type="text" value={report.submitter.email}
               onChange={(e) => setSub("email", e.target.value)} />
      </div>
    </div>
  );
}
