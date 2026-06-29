import { RouterProvider } from "react-router-dom";
import routes from "./routes/routes";
import ReloadPrompt from "./ReloadPrompt";

const App = () => {
  return (
    <>
      <RouterProvider router={routes}></RouterProvider>
      <ReloadPrompt />
    </>
  );
};

export default App;
