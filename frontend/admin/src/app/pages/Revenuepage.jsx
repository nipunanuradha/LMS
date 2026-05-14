// ─────────────────────────────────────────────────────────────────────────────
// src/pages/RevenuePage.jsx
// Revenue & enrollment analytics: KPI summary, bar chart, line chart, breakdown table.
// ─────────────────────────────────────────────────────────────────────────────

import { REVENUE_DATA } from "../data/mockData";

const MAX_REVENUE = Math.max(...REVENUE_DATA.map(d => d.revenue));
const MAX_ENROLLMENT = Math.max(...REVENUE_DATA.map(d => d.enrollments));

// ── Summary KPI Chip ──────────────────────────────────────────────────────────
function SummaryCard({ label, value, sub }) {
    return (
        <div className="card flex-col gap-8" style={{ flex: 1, padding: "20px 22px" }}>
            <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500 }}>{label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.5px" }}>{value}</div>
            <div style={{ fontSize: 12, color: "#10B981", fontWeight: 500 }}>{sub}</div>
        </div>
    );
}

// ── Bar Chart ─────────────────────────────────────────────────────────────────
function BarChart() {
    return (
        <div className="card" style={{ padding: "22px 24px" }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", marginBottom: 20 }}>Monthly Revenue (LKR)</h3>
            <div className="bar-chart-bars">
                {REVENUE_DATA.map(d => (
                    <div key={d.month} className="bar-chart-col">
                        <div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%" }}>
                            <div
                                className="bar-chart-bar"
                                style={{ height: `${(d.revenue / MAX_REVENUE) * 100}%` }}
                            />
                        </div>
                        <span className="bar-chart-label">{d.month}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Line Chart (pure SVG) ─────────────────────────────────────────────────────
function LineChart() {
    const W = 300, H = 130;
    const points = REVENUE_DATA.map((d, i) => ({
        x: i * (W / (REVENUE_DATA.length - 1)),
        y: H - (d.enrollments / MAX_ENROLLMENT) * (H - 20),
        ...d,
    }));
    const polyPoints = points.map(p => `${p.x},${p.y}`).join(" ");

    return (
        <div className="card" style={{ padding: "22px 24px" }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", marginBottom: 20 }}>Monthly Enrollments</h3>
            <svg viewBox={`0 0 ${W} ${H + 20}`} width="100%" style={{ overflow: "visible" }}>
                {/* Subtle grid */}
                {[0, 1, 2, 3].map(i => (
                    <line key={i} x1="0" y1={i * 35} x2={W} y2={i * 35} stroke="#F1F5F9" strokeWidth="1" />
                ))}
                {/* Line */}
                <polyline points={polyPoints} fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {/* Dots + Labels */}
                {points.map(p => (
                    <g key={p.month}>
                        <circle cx={p.x} cy={p.y} r="5" fill="#fff" stroke="#7C3AED" strokeWidth="2.5" />
                        <text x={p.x} y={H + 18} textAnchor="middle" fontSize="10" fill="#94A3B8" fontFamily="DM Sans, sans-serif">{p.month}</text>
                    </g>
                ))}
            </svg>
        </div>
    );
}

// ── Breakdown Table ───────────────────────────────────────────────────────────
function BreakdownTable() {
    return (
        <div className="card overflow-hidden">
            <div style={{ padding: "18px 22px", borderBottom: "1.5px solid #F8FAFC" }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>Monthly Breakdown</h3>
            </div>
            <table className="data-table">
                <thead>
                    <tr>
                        {["Month", "Revenue (LKR)", "Enrollments", "Avg / Student"].map(h => (
                            <th key={h} style={{ padding: "11px 20px" }}>{h.toUpperCase()}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {REVENUE_DATA.map((d, i) => (
                        <tr key={d.month}>
                            <td style={{ padding: "13px 20px", fontWeight: 500, color: "#0F172A", borderBottom: i < REVENUE_DATA.length - 1 ? "1px solid #F8FAFC" : "none" }}>{d.month} 2024</td>
                            <td style={{ padding: "13px 20px", fontWeight: 600, color: "#2563EB", borderBottom: i < REVENUE_DATA.length - 1 ? "1px solid #F8FAFC" : "none" }}>LKR {d.revenue.toLocaleString()}</td>
                            <td style={{ padding: "13px 20px", color: "#64748B", borderBottom: i < REVENUE_DATA.length - 1 ? "1px solid #F8FAFC" : "none" }}>{d.enrollments}</td>
                            <td style={{ padding: "13px 20px", color: "#64748B", borderBottom: i < REVENUE_DATA.length - 1 ? "1px solid #F8FAFC" : "none" }}>LKR {Math.round(d.revenue / d.enrollments)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function RevenuePage() {
    return (
        <div className="page-enter flex-col gap-20">

            {/* Page Header */}
            <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A" }}>Revenue & Enrollments</h2>
                <p style={{ fontSize: 13, color: "#94A3B8", marginTop: 3 }}>Financial overview — last 6 months</p>
            </div>

            {/* Summary KPIs */}
            <div className="flex gap-16">
                <SummaryCard label="Total Revenue" value="LKR 221,900" sub="+18.4% vs last period" />
                <SummaryCard label="Total Enrollments" value="379 students" sub="+22.1% vs last period" />
                <SummaryCard label="Avg. Revenue/Student" value="LKR 585" sub="Per enrollment" />
            </div>

            {/* Charts */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <BarChart />
                <LineChart />
            </div>

            {/* Table */}
            <BreakdownTable />
        </div>
    );
}