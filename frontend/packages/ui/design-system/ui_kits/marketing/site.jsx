// Andikisha Marketing — root
function Site() {
  return (
    <div>
      <Nav /><Hero /><Logos /><Features /><Metrics /><Testimonial /><Pricing /><CTA /><Footer />
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Site />);
