import { Box, Button, Group, NumberInput, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { randomId } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
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
	updateBook,
} from "../actions";
import { AutoComplete } from "./AutoComplete";

export interface FormValues {
	id?: number;
	name: string;
	publish_year: number | undefined;
	number_of_pages: number | undefined;
	authors: Partial<Author>[];
	categories: Partial<Category>[];
	location: string | undefined;
}

const initialFormValues: FormValues = {
	name: "",
	publish_year: undefined,
	number_of_pages: undefined,
	authors: [{ name: "" }],
	categories: [{ name: "" }],
	location: undefined,
};

export function BookForm({ editValues }: { editValues?: FormValues }) {
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
		initialValues: editValues ?? initialFormValues,
		validate: {
			name: (value) => (value.trim().length > 0 ? null : t("nameIsRequired")),
			authors: {
				name: (value, _values, path) => {
					if (path === "authors.0.name") {
						return value ? null : t("atLeastOneAuthorIsRequired");
					}
					return null;
				},
			},
		},
	});

	const authorInputs = form.getValues().authors.map((_item, index) => (
		<AutoComplete
			label={t("author")}
			items={authors.map(({ id, name }) => ({
				id: id.toString(),
				label: name,
			}))}
			key={form.key(`authors.${index}.name`)}
			{...form.getInputProps(`authors.${index}.name`)}
		/>
	));

	const categoryInputs = form.getValues().categories.map((_item, index) => (
		<AutoComplete
			label={t("category")}
			items={categories.map(({ id, name }) => ({
				id: id.toString(),
				label: name,
			}))}
			key={form.key(`categories.${index}.name`)}
			{...form.getInputProps(`categories.${index}.name`)}
		/>
	));

	const handleSubmit = async (values: FormValues) => {
		const { name, number_of_pages, publish_year } = values;

		const savedAuthors = [];
		for (const author of values.authors) {
			if (author.name) {
				const savedAuthor = authors.find(
					({ id }) => id.toString() === author.name,
				);
				if (savedAuthor) {
					savedAuthors.push(savedAuthor);
				}
			} else {
				savedAuthors.push({ name: author.name });
			}
		}

		const savedCategories = [];
		for (const category of values.categories) {
			if (category.name) {
				const savedCategory = categories.find(
					({ id }) => id.toString() === category.name,
				);
				if (savedCategory) {
					savedCategories.push(savedCategory);
				}
			} else {
				savedCategories.push({ name: category.name });
			}
		}

		const location = locations.find(
			({ id }) => id.toString() === values.location,
		);

		try {
			const bookData = {
				name,
				number_of_pages: number_of_pages ?? null,
				publish_year: publish_year ?? null,
				authors: savedAuthors,
				location: location ?? { name: values.location ?? "" },
				categories: savedCategories,
			};

			if (editValues) {
				await updateBook({
					...bookData,
					id: editValues.id!,
				});

				notifications.show({
					title: t("bookUpdated"),
					message: "",
					color: "green",
				});
			} else {
				await saveBook(bookData);

				notifications.show({
					title: t("bookAdded"),
					message: "",
					color: "green",
				});
			}
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
			<form
				onSubmit={form.onSubmit(handleSubmit)}
				className="flex flex-col gap-4 mt-4"
			>
				<TextInput
					label={t("name")}
					placeholder={t("name")}
					{...form.getInputProps("name")}
				/>

				{authorInputs}

				<Button
					onClick={() =>
						form.insertListItem("authors", { name: "", key: randomId() })
					}
				>
					{t("addAuthor")}
				</Button>

				{categoryInputs}

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
					stepHoldDelay={100}
					stepHoldInterval={100}
				/>

				<NumberInput
					label={t("numberOfPages")}
					placeholder={t("numberOfPages")}
					{...form.getInputProps("number_of_pages")}
					min={0}
					stepHoldDelay={100}
					stepHoldInterval={100}
				/>

				<Group justify="right" mt="md">
					<Button type="submit">{t("submit")}</Button>
				</Group>
			</form>
		</Box>
	);
}
