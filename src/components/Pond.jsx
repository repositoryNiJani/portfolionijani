// Background layers of the pond. The koi itself is a <canvas> that
// initKoiPond() inserts right after the .bgf element, so keep this order:
// water first, .bgf second.

export default function Pond() {
  return (
    <>
      <div className="pond-water" aria-hidden="true">
        <i className="caustic c1" />
        <i className="caustic c2" />
        <i className="ripple" style={{ left: "32%", top: "18%" }} />
        <i
          className="ripple"
          style={{ left: "76%", top: "86%", animationDelay: "-3s" }}
        />
        <i
          className="ripple"
          style={{ left: "58%", top: "46%", animationDelay: "-5s" }}
        />
      </div>
      <div className="bgf" aria-hidden="true">
        <img src="/logo.webp" alt="" />
      </div>
    </>
  );
}
