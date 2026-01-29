import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders add task input", () => {
  render(<App />);
  expect(screen.getByLabelText(/add a task/i)).toBeInTheDocument();
});
