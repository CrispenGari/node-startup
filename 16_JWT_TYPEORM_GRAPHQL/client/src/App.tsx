import React from "react";
import "./App.scss";
import Footer from "./components/Footer";
import Header from "./components/Header";

const App: React.FC<{}> = () => {
  return (
    <div className="app">
      <Header />
      <div className="app__main">
        <h1>
          Welcome to the <span>React</span>, <span>TypeScript</span>,{" "}
          <span>Sass</span>
          <span>Scss</span> and <span>Css</span>boiler plate.
        </h1>
        <p>
          Open <span>App.tsx</span> and start writing some code
        </p>
      </div>
      <Footer />
    </div>
  );
};

export default App;
