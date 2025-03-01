import { Button, TextInput, Tooltip } from "@mantine/core";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import type { AgGridReact } from "ag-grid-react";
import { PencilIcon, SearchIcon, TrashIcon } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	type LoaderFunctionArgs,
	useLoaderData,
	useNavigate,
	useRevalidator,
	useSearchParams,
} from "react-router-dom";
import { useDebounceCallback } from "usehooks-ts";

import {
	type Author,
	type Book,
	type Category,
	deleteBook,
	fetchBooks,
} from "../actions";
import { BaseTable } from "../components";
import { useDeleteModalConfirmModal } from "../hooks";

interface LoaderData {
	books: Book[];
}

const defaultColDef: ColDef = {
	flex: 1,
	minWidth: 150,
	filter: true,
	floatingFilter: true,
	suppressHeaderMenuButton: true,
};

export default function Books() {
	const { books } = useLoaderData() as LoaderData;
	const gridRef = useRef<AgGridReact>(null);
	const { t } = useTranslation();

	const navigate = useNavigate();
	const [, setSearchParams] = useSearchParams();
	const [searchValue, setSearchValue] = useState("");
	const revalidator = useRevalidator();

	const { confirmDeleteModal, openDeleteConfirmModal } =
		useDeleteModalConfirmModal({
			onConfirm: async (id) => {
				await deleteBook(id);
				revalidator.revalidate();
			},
		});

	const debounced = useDebounceCallback(setSearchParams, 300);

	const columns = useMemo(
		() =>
			[
				{
					field: "name",
					colId: "name",
					cellDataType: "text",
					headerName: t("name"),
				},
				{
					field: "authors",
					colId: "author",
					cellDataType: "text",
					headerName: t("author"),
					valueFormatter: ({ value }) =>
						value.map((author: Author) => author.name).join(", "),
					filterValueGetter: ({ data }) =>
						data?.authors?.map((author: Author) => author.name).join(", "),
				},
				{
					field: "publish_year",
					colId: "publish_year",
					cellDataType: "text",
					headerName: t("publishedYear"),
					maxWidth: 80,
				},
				{
					field: "categories",
					colId: "category",
					headerName: t("category"),
					valueFormatter: ({ value }) =>
						value.map((category: Category) => category.name).join(", "),
					filterValueGetter: ({ data }) =>
						data?.categories
							?.map((category: Category) => category.name)
							.join(", "),
				},
				{
					field: "location",
					colId: "location",
					headerName: t("location"),
					valueFormatter: ({ value }) => value?.name,
					filterValueGetter: ({ data }) => data?.location?.name,
					maxWidth: 80,
				},
				{
					cellClass:
						"!flex !items-center !justify-center text-center place-content-center",
					headerClass: "place-content-center",
					editable: false,
					flex: 1,
					maxWidth: 140,
					headerName: t("actions"),
					suppressFloatingFilterButton: true,
					suppressFiltersToolPanel: true,
					suppressColumnsToolPanel: true,
					floatingFilter: false,
					filter: false,
					sortable: false,
					cellRenderer: ({ data }: ICellRendererParams) => {
						return (
							<div className="flex space-x-2 justify-center items-center w-full h-full">
								<Tooltip label={t("updateBook")}>
									<Button
										type="button"
										size="sm"
										variant="light"
										color="orange"
										onClick={() => navigate(`/books/${data.id}/edit`)}
									>
										<PencilIcon className="h-5 w-5 cursor-pointer" />
									</Button>
								</Tooltip>
								<Tooltip label={t("deleteBook")}>
									<Button
										type="button"
										size="sm"
										variant="light"
										color="red"
										onClick={() => openDeleteConfirmModal(data.id)}
									>
										<TrashIcon className="h-5 w-5 cursor-pointer" />
									</Button>
								</Tooltip>
							</div>
						);
					},
				},
			] satisfies ColDef<Book>[],
		[t, openDeleteConfirmModal, navigate],
	);

	return (
		<>
			{confirmDeleteModal}
			<TextInput
				radius="xl"
				size="md"
				placeholder={t("searchBooks")}
				rightSectionWidth={42}
				leftSection={<SearchIcon size={18} />}
				onChange={(event) => {
					setSearchValue(event.currentTarget.value);
					debounced({ search: event.currentTarget.value });
				}}
				value={searchValue}
			/>
			<BaseTable
				rowData={books}
				defaultColDef={defaultColDef}
				columnDefs={columns}
				getRowId={({ data }) => data.id.toString()}
				ref={gridRef}
				pagination={true}
				paginationPageSize={50}
				wrapperClassName="h-[calc(100vh-138px)]"
			/>
		</>
	);
}

export async function loader({
	request,
}: LoaderFunctionArgs): Promise<LoaderData> {
	const searchValue =
		new URL(request.url).searchParams.get("search") ?? undefined;
	return fetchBooks({ searchValue });
}
