import { render, screen } from "@testing-library/react";
import App from "./App";

test("uygulama açılışta giriş ekranını gösterir", () => {
  render(<App />);
  expect(
    screen.getByPlaceholderText(/ogrenci@email\.com/i)
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /giriş yap/i })).toBeInTheDocument();
});
