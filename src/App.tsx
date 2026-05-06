import { useState } from "react";
import {
  ValuationReport, defaultReport, emptyPlot,
} from "./types";
import ClientTab from "./components/ClientTab";
import PlotsTab from "./components/PlotsTab";
import CommentsTab from "./components/CommentsTab";
import GenerateTab from "./components/GenerateTab";
import LandCalculator from "./components/LandCalculator";
import Login, { isAuthed, clearAuth } from "./components/Login";
import ThemeToggle from "./components/ThemeToggle";

type Menu = "report" | "calc";
type Tab = "client" | "plots" | "comments" | "generate";

const HOMEPAGE_URL = "https://www.sandeepkafle.com.np";

export default function App() {
  const [authed, setAuthed] = useState<boolean>(() => isAuthed());
  const [menu, setMenu] = useState<Menu>("report");
  const [tab, setTab] = useState<Tab>("client");
  const [report, setReport] = useState<ValuationReport>(defaultReport());

  const loadSample = () => {
    const p1 = emptyPlot();
    p1.location = "Ramgram Municipality, Ward No.-1 (Old-Parasi VDC : 3), Nilo Gate, Parasi, Nawalparasi.";
    p1.plotNo = "Parasi VDC : 3 / 1798 & 1796";
    p1.areaCertificate = "(B-K-D) : 0-0-2 & 0-0-8 = 0-0-10 = 10.000 Dhur (total)";
    p1.marketRatePerDhur = 250000;
    p1.govtRateTotal = 336200;
    p1.boundary = { east: "Earthen Road", west: "plot No.-1796",
                    north: "plot No.-1765", south: "plot No.-1794" };
    p1.fieldTriangles = [
      { a: 30, b: 60, c: 67.08 },
      { a: 30, b: 60, c: 67.08 },
    ];
    p1.cadastralTriangles = [
      { a: 30, b: 58.16, c: 66.5 },
      { a: 30, b: 58.25, c: 66.5 },
    ];
    p1.lalpurjaArea = { bigha: 0, kattha: 0, dhur: 10 };
    p1.accessibilityText =
      "The property with plot No.-Parasi VDC : 3/1798 & 1796 is accessible " +
      "by 20 feet wide Motorable (Earthen) Road at East side.";

    const p2 = emptyPlot();
    p2.location = "Ramgram Municipality, Ward No.-5 (Old-Manjhariya VDC : 1-Ka), Drivertole, Parasi, Nawalparasi";
    p2.plotNo = "Manjhariya VDC : 1-Ka  / 1878";
    p2.areaCertificate = "(Bigha-Kattha-Dhur) : 0-0-12.50 = 12.500 Dhur";
    p2.marketRatePerDhur = 100000;
    p2.govtRateTotal = 337500;
    p2.boundary = { east: "Sudarshan Gupta", west: "Mewalal Agrahari",
                    north: "Earthen Road", south: "Earthen Road" };
    p2.fieldTriangles = [
      { a: 24.33, b: 92.5, c: 95.16 },
      { a: 23.33, b: 91.58, c: 95.16 },
    ];
    p2.lalpurjaArea = { bigha: 0, kattha: 0, dhur: 12.5 };

    setReport({
      ...defaultReport(),
      jobName: "Jeshika Subedi - Parasi 2-Land",
      reportDate: "15 July, 2025",
      visitDate: "10 July, 2025",
      clientName: "Miss. Jeshika Subedi",
      clientAddress: "Ramgram Municipality, Ward No.-3, Parasi, Nawalparasi",
      clientPhone: "9847126011/9847214180",
      ownerName: "Mrs. Bhagawati Subedi",
      propertyType: "Land Only",
      plots: [p1, p2],
      comments: {
        ...defaultReport().comments,
        otherComments: "They are lies in the Reshdential Area of this Municipality.",
      },
    });
    setMenu("report");
    setTab("client");
  };

  const signOut = () => {
    clearAuth();
    setAuthed(false);
  };

  if (!authed) {
    return <Login onSuccess={() => setAuthed(true)} />;
  }

  return (
    <>
      <header>
        <h1>Valuation Report Generator</h1>
        <span className="subtitle">browser edition · runs entirely client-side</span>
        <div className="header-actions">
          <a
            className="home-link"
            href={HOMEPAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="Open sandeepkafle.com.np in a new tab"
          >
            <span className="arrow">←</span> sandeepkafle.com.np
          </a>
          <ThemeToggle />
          <button className="btn secondary small" onClick={signOut}>Sign out</button>
        </div>
      </header>

      <div className="menubar">
        <button
          className={menu === "report" ? "active" : ""}
          onClick={() => setMenu("report")}
        >
          📄 Report Generator
        </button>
        <button
          className={menu === "calc" ? "active" : ""}
          onClick={() => setMenu("calc")}
        >
          📐 Land Calculator
        </button>
      </div>

      {menu === "report" && (
        <>
          <div className="tabbar">
            <button className={tab === "client" ? "active" : ""} onClick={() => setTab("client")}>1. Client &amp; Setup</button>
            <button className={tab === "plots" ? "active" : ""} onClick={() => setTab("plots")}>2. Plots</button>
            <button className={tab === "comments" ? "active" : ""} onClick={() => setTab("comments")}>3. Comments &amp; Photos</button>
            <button className={tab === "generate" ? "active" : ""} onClick={() => setTab("generate")}>4. Generate</button>
          </div>
          <div className="panel">
            {tab === "client" && <ClientTab report={report} onChange={setReport} />}
            {tab === "plots" && <PlotsTab report={report} onChange={setReport} />}
            {tab === "comments" && <CommentsTab report={report} onChange={setReport} />}
            {tab === "generate" && <GenerateTab report={report} onLoadSample={loadSample} />}
          </div>
        </>
      )}

      {menu === "calc" && (
        <div className="panel" style={{ borderRadius: 8, marginTop: 12 }}>
          <LandCalculator />
        </div>
      )}
    </>
  );
}
