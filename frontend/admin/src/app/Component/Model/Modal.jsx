// ─────────────────────────────────────────────────────────────────────────────
// src/components/layout/Modal.jsx
// Generic centered modal shell with overlay, header, close button and body slot.
// ─────────────────────────────────────────────────────────────────────────────

import { Ic } from "../../component/ui/icons";

/**
 * @param {{ title: string, subtitle?: string, onClose: () => void,
 *           children: React.ReactNode, width?: number }} props
 */
export default function Modal({ title, subtitle, onClose, children, width = 480 }) {
    return (
        <div
            className="modal-overlay"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div className="modal-box" style={{ maxWidth: width }}>

                {/* ── Header ── */}
                <div className="modal-header">
                    <div>
                        <h2 className="modal-title">{title}</h2>
                        {subtitle && <p className="modal-subtitle">{subtitle}</p>}
                    </div>
                    <button
                        onClick={onClose}
                        style={{ border: "none", background: "none", cursor: "pointer", padding: 6, borderRadius: 8, color: "#94A3B8", display: "flex", alignItems: "center", transition: "all 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#F1F5F9"}
                        onMouseLeave={e => e.currentTarget.style.background = "none"}
                        aria-label="Close modal"
                    >
                        {Ic.close()}
                    </button>
                </div>

                {/* ── Body slot ── */}
                <div className="modal-body">{children}</div>
            </div>
        </div>
    );
}