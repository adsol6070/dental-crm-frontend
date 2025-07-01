import { BrowserRouter as Router } from "react-router-dom";
import { MainRoutes } from "./router";
import { AppProviders } from "./context";

const App = () => {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppProviders>
        <MainRoutes />
      </AppProviders>
    </Router>
  );
};

export default App;
