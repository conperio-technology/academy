import { useState } from "react";

export function PlcSafetyRedundancy() {
  const [powerOn, setPowerOn] = useState(true);
  const [primaryFaulted, setPrimaryFaulted] = useState(false);

  return (
    <div className="tool-widget">
      <div className="darr-actions">
        <button onClick={() => setPowerOn((v) => !v)}>
          {powerOn ? "🟢 system power: ON" : "🔴 system power: OFF (fault simulated)"}
        </button>
      </div>

      <div className="tool-readout">
        <div className="readout-cell">
          <span className="readout-label">conveyor motor (energize-to-run)</span>
          <span className="readout-value">{powerOn ? "RUNNING" : "STOPPED (safe)"}</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">fail-safe brake (energize-to-release)</span>
          <span className="readout-value">{powerOn ? "RELEASED" : "ENGAGED (safe)"}</span>
        </div>
      </div>

      <p className="gate-note">
        Both devices land in a SAFE state on power loss, one being "ON = running" and the other "ON = released" -- both
        are de-energize-to-safe, but the safe mechanical state differs (motor stopped, brake engaged), so fail-safe
        design means choosing, for each device individually, which physical state is safe.
      </p>

      <div className="darr-actions">
        <button onClick={() => setPrimaryFaulted((v) => !v)}>
          {primaryFaulted ? "🔴 primary controller: FAULTED" : "🟢 primary controller: OK"}
        </button>
      </div>

      <div className="tool-readout">
        <div className="readout-cell">
          <span className="readout-label">primary controller</span>
          <span className="readout-value">{primaryFaulted ? "OFFLINE" : "ACTIVE"}</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">standby controller</span>
          <span className="readout-value">{primaryFaulted ? "ACTIVE (failed over)" : "IDLE (mirroring state)"}</span>
        </div>
      </div>
    </div>
  );
}
