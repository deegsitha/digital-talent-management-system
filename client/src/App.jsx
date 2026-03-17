import { useEffect } from "react";
import axios from "axios";

function App() {
  useEffect(() => {
    axios.get("http://localhost:5001/")
      .then(res => console.log(res.data))
      .catch(err => console.log(err));
  }, []);

  return <h1>Frontend Connected</h1>;
}

export default App;