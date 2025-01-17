import {
	Box,
	Button,
	Group,
	NumberInput,
	TextInput,
	Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import type React from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	type Author,
	type Category,
	type Location,
	fetchAuthors,
	fetchCategories,
	fetchLocations,
	saveBook,
} from "../actions";
import { AutoComplete } from "./AutoComplete";

interface FormValues {
	name: string;
	publish_year: string | null;
	number_of_pages: string | null;
	author: string | null;
	category: string | null;
	location: string | null;
}

const initialFormValues: FormValues = {
	name: "",
	publish_year: "",
	number_of_pages: "",
	author: null,
	category: null,
	location: null,
};

export const BookForm: React.FC = () => {
	const [authors, setAuthors] = useState<Author[]>([]);
	const [categories, setCategories] = useState<Category[]>([]);
	const [locations, setLocations] = useState<Location[]>([]);

	const { t } = useTranslation();

	useEffect(() => {
		const fetchData = async () => {
			// NOTE: this is not great way to fetch data, but it's good enough for this use case
			const { authors } = await fetchAuthors();
			const { categories } = await fetchCategories();
			const { locations } = await fetchLocations();

			setAuthors(authors);
			setCategories(categories);
			setLocations(locations);
		};
		fetchData();
	}, []);

	const form = useForm<FormValues>({
		initialValues: initialFormValues,
		validate: {
			name: (value) => (value.trim().length > 0 ? null : t("nameIsRequired")),
			author: (value) => (value ? null : t("authorIsRequired")),
		},
	});

	const handleSubmit = async (values: FormValues) => {
		const { name, number_of_pages, publish_year } = values;

		const author = authors.find(({ id }) => id.toString() === values.author);
		const location = locations.find(
			({ id }) => id.toString() === values.location,
		);
		const category = categories.find(
			({ id }) => id.toString() === values.category,
		);

		try {
			await saveBook({
				name,
				number_of_pages: number_of_pages
					? Number.parseInt(number_of_pages)
					: null,
				publish_year: publish_year ? Number.parseInt(publish_year) : null,
				author: author ?? { name: values.author ?? "" },
				location: location ?? { name: values.location ?? "" },
				category: category ?? { name: values.category ?? "" },
			});

			notifications.show({
				title: t("bookAdded"),
				message: "",
				color: "green",
			});
		} catch (error) {
			const err = error as Error;
			notifications.show({
				title: t("error"),
				message: err.message,
				color: "red",
			});
			console.error(err);
		}
	};

	return (
		<Box className="max-w-md">
			<Title order={2}>{t("newBook")}</Title>
			<form
				onSubmit={form.onSubmit(handleSubmit)}
				className="flex flex-col gap-4 mt-4"
			>
				<TextInput
					label={t("name")}
					placeholder={t("name")}
					{...form.getInputProps("name")}
				/>

				<AutoComplete
					label={t("author")}
					items={authors.map(({ id, name }) => ({
						id: id.toString(),
						label: name,
					}))}
					{...form.getInputProps("author")}
				/>

				<AutoComplete
					label={t("category")}
					items={categories.map(({ id, name }) => ({
						id: id.toString(),
						label: name,
					}))}
					{...form.getInputProps("category")}
				/>

				<AutoComplete
					label={t("location")}
					items={locations.map(({ id, name }) => ({
						id: id.toString(),
						label: name,
					}))}
					{...form.getInputProps("location")}
				/>

				<NumberInput
					label={t("publishedYear")}
					placeholder={t("publishedYear")}
					{...form.getInputProps("publish_year")}
					min={0}
				/>

				<NumberInput
					label={t("numberOfPages")}
					placeholder={t("numberOfPages")}
					{...form.getInputProps("number_of_pages")}
					min={0}
				/>

				<Group justify="right" mt="md">
					<Button type="submit">{t("submit")}</Button>
				</Group>
			</form>
		</Box>
	);
};
