import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { Notifications } from "@mantine/notifications";

import "./styles.css";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import { MantineProvider, createTheme } from "@mantine/core";
import AddBook from "./routes/add-book";
import Authors, { loader as authorLoader } from "./routes/authors";
import Books, { loader as bookLoader } from "./routes/books";
import Root from "./routes/root";

import "./i18n";
import EditBook from "./routes/edit-book";

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
				path: "/books/add",
				element: <AddBook />,
			},
			{
				path: "/books/:id/edit",
				element: <EditBook />,
			},
		],
	},
]);

const theme = createTheme({});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<MantineProvider theme={theme}>
			<Notifications />
			<RouterProvider router={router} />
		</MantineProvider>
	</React.StrictMode>,
);
