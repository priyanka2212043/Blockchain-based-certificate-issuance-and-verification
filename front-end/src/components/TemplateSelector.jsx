import React, { useState, useRef } from "react";
import "../styles/TemplateSelector.css";
import template1 from "../assets/certificates/template1.png";
import template2 from "../assets/certificates/template2.png";
import template3 from "../assets/certificates/template3.png";
import template4 from "../assets/certificates/template4.png";
import template5 from "../assets/certificates/template5.png";

const templates = [
  { id: "template1", name: "Royal Brown", preview: template1 },
  { id: "template2", name: "Blue Elegant", preview: template2 },
  { id: "template3", name: "Green Classic", preview: template3 },
  { id: "template4", name: "Purple Modern", preview: template4 },
  { id: "template5", name: "Red Bold", preview: template5 },
  // add more as needed...
];

function TemplateSelector({ selected, setSelected }) {
  const [previewImage, setPreviewImage] = useState(null);
  const containerRef = useRef(null);

  // Translate vertical wheel -> horizontal scroll for easier desktop usage
  const handleWheel = (e) => {
    const el = containerRef.current;
    if (!el) return;
    // If vertical scroll is stronger than horizontal, translate it.
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      el.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  };

  return (
    <>
      {/* wrapper keeps layout predictable so things below stay visible */}
      <div className="template-row-container">
        <div
          className="template-selector"
          ref={containerRef}
          onWheel={handleWheel}
        >
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className={`template-card ${selected === tpl.id ? "selected" : ""}`}
              onClick={() => setSelected(tpl.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter") setSelected(tpl.id); }}
            >
              <img
                src={tpl.preview}
                alt={tpl.name}
                onClick={(e) => {
                  // stop propagation so clicking image opens preview but does not immediately select
                  e.stopPropagation();
                  setPreviewImage(tpl.preview);
                }}
                draggable={false}
              />
              <p className="template-name">{tpl.name}</p>
              {selected === tpl.id && <span className="tick-mark">✔</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Example signature area (if you have an upload element below it) */}
      <div className="signature-section">
        {/* your signature upload element should live here in parent page */}
      </div>

      {/* Modal Preview */}
      {previewImage && (
        <div
          className="preview-modal"
          onClick={() => setPreviewImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <img src={previewImage} alt="Template preview" />
        </div>
      )}
    </>
  );
}

export default TemplateSelector;
