export function MiniWorkstation() {
  return (
    <div className="retro-panel overflow-hidden bg-surface-light">
      <div className="window-titlebar flex h-8 items-center justify-between px-2 font-tech text-xs font-bold">
        <span>PREVIEW.LIVE / WORKBENCH</span>
        <span>100%</span>
      </div>
      <div className="grid gap-2 p-2 md:grid-cols-[0.92fr_1.08fr]">
        <div className="retro-panel-inset bg-terminal p-4 text-surface-light">
          <p className="font-tech text-orange">COMPONENT VAULT v2.4.0</p>
          <p className="mt-2 text-sm text-surface-light/75">Your structured library of reusable interface building blocks.</p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {Array.from({ length: 9 }).map((_, index) => (
              <span key={index} className="h-8 border border-orange/70" />
            ))}
          </div>
        </div>
        <div className="dot-grid retro-panel-inset grid min-h-72 place-items-center bg-background p-4">
          <div className="grid w-full max-w-md gap-3">
            <div className="retro-panel bg-surface-light p-4">
              <button className="cv-button">Button</button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <article className="cv-stat">
                <span>Monthly Revenue</span>
                <strong>$24,780</strong>
                <small>+12.5%</small>
              </article>
              <div className="cv-alert">Preview compiled.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
