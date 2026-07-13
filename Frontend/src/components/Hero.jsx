import React from "react";

// We pass 'title', 'subtitle', and button links as props to make it dynamic
function Hero({ title, subtitle, primaryBtnText, primaryBtnLink, secondaryBtnText, secondaryBtnLink }) {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>{title}</h1>
        <p>{subtitle}</p>

        <div className="hero-buttons">
          {primaryBtnText && (
            <a href={primaryBtnLink} className="btn btn-primary">
              {primaryBtnText}
            </a>
          )}
          
          {secondaryBtnText && (
            <a href={secondaryBtnLink} className="btn btn-secondary">
              {secondaryBtnText}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

export default Hero;
