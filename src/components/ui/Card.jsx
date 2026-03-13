export function Card({ children, className = "", hover = true, glow = "", ...props }) {
  return (
    <div
      className={`glass p-6 ${hover ? "card-hover" : ""} ${glow} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
