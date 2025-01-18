import { Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { BookForm } from "../components";

export default function AddBook() {
	const { t } = useTranslation();
	return (
		<>
			<Title order={2}>{t("addBook")}</Title>
			<BookForm />
		</>
	);
}
