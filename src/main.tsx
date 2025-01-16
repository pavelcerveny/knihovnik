import * as React from "react";
import * as ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import { Notifications } from '@mantine/notifications';

import "./styles.css";
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import Authors, {loader as authorLoader} from "./routes/authors";
import Root from "./routes/root";
import { createTheme, MantineProvider } from "@mantine/core";
import Books, {loader as bookLoader} from "./routes/books";
import AddBook from "./routes/add-book";

import './i18n';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        index: true, 
        element: <Books />,
        loader: bookLoader,
      },
      {
        path: "/authors",
        element: <Authors />,
        loader: authorLoader,
      },
      {
        path: "/add-book",
        element: <AddBook />,
        loader: authorLoader,
      }
    ]
  },
]);

const theme = createTheme({});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider theme={theme}>
      <Notifications />
      <RouterProvider router={router} />
    </MantineProvider>
  </React.StrictMode>
);