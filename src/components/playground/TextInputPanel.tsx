interface TextInputPanelProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  id: string;
}

export default function TextInputPanel({ value, onChange, disabled, id }: TextInputPanelProps) {
  return (
    <div className="input-panel">
      <label htmlFor={id}>Text prompt</label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={6}
        placeholder="Describe the task for on-device inference…"
        aria-describedby={`${id}-hint`}
      />
      <p id={`${id}-hint`} className="field-hint">
        Press <kbd>Ctrl</kbd>+<kbd>Enter</kbd> to run inference.
      </p>
    </div>
  );
}
