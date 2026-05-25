export default function Welcome() {
  return (
    <div>
      <h1 className="welcome-title">Welcome to the APTCO AI Starter for React!</h1>
      <atp-card>
        <atp-card-header slot="header">Example card from Lift Design System</atp-card-header>
        <div>This is an example of using a Lift Design System card component. It also includes a Lift button.</div>
        <atp-card-footer slot="footer">
          <atp-button label="Button"></atp-button>
        </atp-card-footer>
      </atp-card>
    </div>
  );
}
