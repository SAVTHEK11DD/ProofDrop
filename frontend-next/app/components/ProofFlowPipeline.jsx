"use client";

import { useEffect, useState } from "react";

const PIPELINE_STEPS = [
  {
    num: "01",
    title: "File",
    desc: "Local file selected",
    icon: (
      <svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7l-5-5z" />
        <path d="M12 2v5h5" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "SHA-256 Hash",
    desc: "Browser-side digest",
    icon: (
      <svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="14" height="14" rx="2" />
        <path d="M7 8h6M7 12h4" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Blockchain",
    desc: "Sepolia contract anchor",
    icon: (
      <svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="5" height="5" rx="1" />
        <rect x="12" y="3" width="5" height="5" rx="1" />
        <rect x="7.5" y="12" width="5" height="5" rx="1" />
        <path d="M5.5 8v2l2 2M14.5 8v2l-2 2" />
      </svg>
    ),
  },
  {
    num: "04",
    title: "Proof",
    desc: "Sealed tamper-proof seal",
    icon: (
      <svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2L3 5v5c0 4.5 3 7.8 7 9 4-1.2 7-4.5 7-9V5l-7-3z" />
        <circle cx="10" cy="9" r="2" />
      </svg>
    ),
  },
  {
    num: "05",
    title: "Verify",
    desc: "Instant cryptographic match",
    icon: (
      <svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2L3 5v5c0 4.5 3 7.8 7 9 4-1.2 7-4.5 7-9V5l-7-3z" />
        <path d="M7.5 10l2 2 3.5-3.5" />
      </svg>
    ),
  },
];

export default function ProofFlowPipeline() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    // Cycle through steps: 2.2s for normal steps, 3s on final "Verify" step
    const delay = activeStep === PIPELINE_STEPS.length - 1 ? 3000 : 2200;

    const timer = setTimeout(() => {
      setActiveStep((prev) => (prev + 1) % PIPELINE_STEPS.length);
    }, delay);

    return () => clearTimeout(timer);
  }, [activeStep, isPaused]);

  return (
    <div
      className="pipelineContainer"
      aria-label="ProofDrop step-by-step verification pipeline"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="pipelineHeader">
        <span className="pipelineEyebrow">HOW PROOFDROP WORKS</span>
        <span className="pipelineStatus">
          <span className="pipelinePulseDot" />
          Step {activeStep + 1} of {PIPELINE_STEPS.length}:{" "}
          <strong>{PIPELINE_STEPS[activeStep].title}</strong>
        </span>
      </div>

      <div className="pipelineFlow">
        {PIPELINE_STEPS.map((step, index) => {
          const isActive = activeStep === index;
          const isPassed = activeStep > index;
          const isFinal = index === PIPELINE_STEPS.length - 1;

          let stepStateClass = "";
          if (isActive) stepStateClass = "active";
          else if (isPassed) stepStateClass = "completed";

          return (
            <div key={step.num} className="pipelineStepWrapper">
              <button
                type="button"
                className={`pipelineStepCard ${stepStateClass}`}
                onClick={() => setActiveStep(index)}
                aria-current={isActive ? "step" : undefined}
              >
                <div className="stepCardTop">
                  <span className="stepNum">{step.num}</span>
                  <span className="stepIcon" aria-hidden="true">
                    {step.icon}
                  </span>
                </div>
                <div className="stepCardBottom">
                  <strong className="stepTitle">{step.title}</strong>
                  <span className="stepDesc">{step.desc}</span>
                </div>
                {isActive && <div className="stepActiveGlow" aria-hidden="true" />}
              </button>

              {!isFinal && (
                <div
                  className={`pipelineConnector ${
                    isActive ? "transmitting" : isPassed ? "completed" : ""
                  }`}
                  aria-hidden="true"
                >
                  <div className="connectorTrack" />
                  <div className="connectorBeam" />
                  <div className="connectorArrow">
                    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path className="arrowHorizontal" d="M5 3l5 5-5 5" />
                      <path className="arrowVertical" d="M3 5l5 5 5-5" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
