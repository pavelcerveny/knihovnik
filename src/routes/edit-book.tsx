import { Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { type LoaderFunctionArgs, useLoaderData } from "react-router-dom";
import { fetchBook } from "../actions";
import { BookForm, type FormValues } from "../components";

interface LoaderData {
	formValues: FormValues;
}

export default function EditBook() {
	const { formValues } = useLoaderData() as LoaderData;
	const { t } = useTranslation();

	return (
		<>
			<Title order={2}>{t("updateBook")}</Title>
			<BookForm editValues={formValues} />
		</>
	);
}

export async function loader({
	params,
}: LoaderFunctionArgs): Promise<LoaderData> {
	const id = Number.parseInt(params.id ?? "");
	const { book } = await fetchBook({ id });

	const { name, publish_year, number_of_pages, authors, categories, location } =
		book;

	const formValues = {
		id,
		name,
		publish_year,
		number_of_pages,
		authors:
			authors.length > 0
				? authors.map((author) => ({ name: author.id.toString() }))
				: [{ name: "" }],
		categories:
			categories.length > 0
				? categories.map((category) => ({ name: category.id.toString() }))
				: [{ name: "" }],
		location: location?.id.toString(),
	};

	console.log(categories);

	return { formValues };
}
